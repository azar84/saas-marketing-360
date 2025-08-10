#!/usr/bin/env node

/**
 * Comprehensive Geographic Data Import Script
 * 
 * This script imports geographic data from multiple reliable sources:
 * 1. GeoNames - Primary source for comprehensive global data
 * 2. Natural Earth - For continent and country boundaries
 * 3. Additional curated data for North American details
 * 
 * Usage: node scripts/import-geographic-data.js [--continents] [--countries] [--states] [--cities] [--all]
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { createReadStream } = require('fs');

const prisma = new PrismaClient();

// Configuration
const DATA_DIR = path.join(__dirname, '../data/geographic');
const GEONAMES_BASE_URL = 'https://download.geonames.org/export/dump';

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`📁 Data directory ready: ${DATA_DIR}`);
  } catch (error) {
    console.error('Error creating data directory:', error);
    process.exit(1);
  }
}

// Download file if it doesn't exist
async function downloadFile(url, filename) {
  const filepath = path.join(DATA_DIR, filename);
  
  try {
    await fs.access(filepath);
    console.log(`✅ File already exists: ${filename}`);
    return filepath;
  } catch {
    console.log(`⬇️  Downloading ${filename}...`);
    
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });

    const writer = require('fs').createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ Downloaded: ${filename}`);
        resolve(filepath);
      });
      writer.on('error', reject);
    });
  }
}

// Import continents data
async function importContinents() {
  console.log('\n🌍 Importing continents...');
  
  const continents = [
    { name: 'Africa', code: 'AF', slug: 'africa' },
    { name: 'Antarctica', code: 'AN', slug: 'antarctica' },
    { name: 'Asia', code: 'AS', slug: 'asia' },
    { name: 'Europe', code: 'EU', slug: 'europe' },
    { name: 'North America', code: 'NA', slug: 'north-america' },
    { name: 'Oceania', code: 'OC', slug: 'oceania' },
    { name: 'South America', code: 'SA', slug: 'south-america' }
  ];

  for (const continent of continents) {
    try {
      await prisma.continent.upsert({
        where: { code: continent.code },
        update: continent,
        create: continent
      });
      console.log(`✅ Imported continent: ${continent.name}`);
    } catch (error) {
      console.error(`❌ Error importing continent ${continent.name}:`, error.message);
    }
  }
}

// Import countries data from GeoNames
async function importCountries() {
  console.log('\n🏳️ Importing countries...');
  
  // Download country info file
  const countryFilePath = await downloadFile(
    `${GEONAMES_BASE_URL}/countryInfo.txt`,
    'countryInfo.txt'
  );

  // Continent mapping
  const continentMapping = {
    'AF': 1, // Africa
    'AN': 2, // Antarctica
    'AS': 3, // Asia
    'EU': 4, // Europe
    'NA': 5, // North America
    'OC': 6, // Oceania
    'SA': 7  // South America
  };

  return new Promise((resolve, reject) => {
    const countries = [];
    
    createReadStream(countryFilePath, { encoding: 'utf8' })
      .pipe(csv({
        separator: '\t',
        headers: [
          'iso', 'iso3', 'isoNumeric', 'fips', 'country', 'capital',
          'area', 'population', 'continent', 'tld', 'currencyCode',
          'currencyName', 'phone', 'postalCodeFormat', 'postalCodeRegex',
          'languages', 'geonameId', 'neighbours', 'equivalentFipsCode'
        ],
        skipLinesWithError: true
      }))
      .on('data', (data) => {
        // Skip comment lines
        if (data.iso.startsWith('#') || !data.iso || data.iso.length !== 2) {
          return;
        }

        countries.push({
          name: data.country,
          officialName: data.country,
          code2: data.iso.toUpperCase(),
          code3: data.iso3.toUpperCase(),
          numericCode: data.isoNumeric,
          slug: data.country.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          capital: data.capital || null,
          currency: data.currencyCode || null,
          languages: data.languages ? JSON.stringify(data.languages.split(',')) : null,
          phoneCode: data.phone || null,
          continentId: continentMapping[data.continent] || null,
          latitude: null,
          longitude: null,
          isActive: true
        });
      })
      .on('end', async () => {
        console.log(`📊 Processing ${countries.length} countries...`);
        
        for (const country of countries) {
          try {
            await prisma.country.upsert({
              where: { code2: country.code2 },
              update: country,
              create: country
            });
            console.log(`✅ Imported country: ${country.name} (${country.code2})`);
          } catch (error) {
            console.error(`❌ Error importing country ${country.name}:`, error.message);
          }
        }
        
        resolve();
      })
      .on('error', reject);
  });
}

// Import US states and Canadian provinces
async function importStates() {
  console.log('\n🏛️ Importing states and provinces...');
  
  // Download admin1 codes (states/provinces)
  const admin1FilePath = await downloadFile(
    `${GEONAMES_BASE_URL}/admin1CodesASCII.txt`,
    'admin1CodesASCII.txt'
  );

  return new Promise((resolve, reject) => {
    const states = [];
    
    createReadStream(admin1FilePath, { encoding: 'utf8' })
      .pipe(csv({
        separator: '\t',
        headers: ['code', 'name', 'asciiName', 'geonameId'],
        skipLinesWithError: true
      }))
      .on('data', (data) => {
        if (!data.code || !data.code.includes('.')) return;
        
        const [countryCode, stateCode] = data.code.split('.');
        
        // Focus on North America initially (US, CA, MX)
        if (!['US', 'CA', 'MX'].includes(countryCode)) return;
        
        let type = 'state';
        if (countryCode === 'CA') type = 'province';
        if (countryCode === 'MX') type = 'state';

        states.push({
          name: data.name,
          officialName: data.asciiName || data.name,
          code: stateCode,
          type: type,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          countryCode: countryCode,
          geonameId: parseInt(data.geonameId) || null
        });
      })
      .on('end', async () => {
        console.log(`📊 Processing ${states.length} states/provinces...`);
        
        for (const state of states) {
          try {
            // Get country ID
            const country = await prisma.country.findUnique({
              where: { code2: state.countryCode }
            });
            
            if (!country) {
              console.log(`⚠️  Country not found: ${state.countryCode}`);
              continue;
            }

            await prisma.state.upsert({
              where: { 
                countryId_code: { 
                  countryId: country.id, 
                  code: state.code 
                }
              },
              update: {
                name: state.name,
                officialName: state.officialName,
                type: state.type,
                slug: state.slug
              },
              create: {
                name: state.name,
                officialName: state.officialName,
                code: state.code,
                type: state.type,
                slug: state.slug,
                countryId: country.id
              }
            });
            
            console.log(`✅ Imported state: ${state.name} (${state.countryCode})`);
          } catch (error) {
            console.error(`❌ Error importing state ${state.name}:`, error.message);
          }
        }
        
        resolve();
      })
      .on('error', reject);
  });
}

// Import cities from GeoNames
async function importCities() {
  console.log('\n🏙️ Importing cities...');
  
  // Start with cities with population > 1000 for manageable dataset
  const citiesFilePath = await downloadFile(
    `${GEONAMES_BASE_URL}/cities1000.zip`,
    'cities1000.zip'
  );

  // Extract the zip file first
  const extractPath = path.join(DATA_DIR, 'cities1000.txt');
  
  try {
    // Check if already extracted
    await fs.access(extractPath);
    console.log('✅ Cities file already extracted');
  } catch {
    console.log('📦 Extracting cities data...');
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(citiesFilePath);
    zip.extractAllTo(DATA_DIR, true);
    console.log('✅ Cities data extracted');
  }

  return new Promise((resolve, reject) => {
    let processedCount = 0;
    const batchSize = 1000;
    let batch = [];
    
    createReadStream(extractPath, { encoding: 'utf8' })
      .pipe(csv({
        separator: '\t',
        headers: [
          'geonameId', 'name', 'asciiName', 'alternateNames', 'latitude',
          'longitude', 'featureClass', 'featureCode', 'countryCode', 'cc2',
          'admin1Code', 'admin2Code', 'admin3Code', 'admin4Code', 'population',
          'elevation', 'dem', 'timezone', 'modificationDate'
        ],
        skipLinesWithError: true
      }))
      .on('data', async (data) => {
        // Focus on populated places
        if (!['P'].includes(data.featureClass)) return;
        
        // Priority to North America
        const isNorthAmerica = ['US', 'CA', 'MX'].includes(data.countryCode);
        const population = parseInt(data.population) || 0;
        
        // For North America: include all cities with pop > 100
        // For other regions: include cities with pop > 5000
        const minPopulation = isNorthAmerica ? 100 : 5000;
        if (population < minPopulation) return;

        const cityType = getCityType(data.featureCode);
        
        batch.push({
          name: data.name,
          officialName: data.asciiName || data.name,
          type: cityType,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          latitude: parseFloat(data.latitude) || null,
          longitude: parseFloat(data.longitude) || null,
          elevation: parseInt(data.elevation) || null,
          population: population || null,
          populationYear: 2024, // Approximate
          timezone: data.timezone || null,
          geonameId: parseInt(data.geonameId) || null,
          countryCode: data.countryCode,
          admin1Code: data.admin1Code,
          admin2Code: data.admin2Code,
          isActive: true
        });

        if (batch.length >= batchSize) {
          await processCityBatch(batch);
          processedCount += batch.length;
          console.log(`📊 Processed ${processedCount} cities...`);
          batch = [];
        }
      })
      .on('end', async () => {
        // Process remaining batch
        if (batch.length > 0) {
          await processCityBatch(batch);
          processedCount += batch.length;
        }
        
        console.log(`✅ Completed importing ${processedCount} cities`);
        resolve();
      })
      .on('error', reject);
  });
}

// Helper function to determine city type from feature code
function getCityType(featureCode) {
  const typeMap = {
    'PPLC': 'capital', // capital of a political entity
    'PPLA': 'city',    // seat of a first-order administrative division
    'PPLA2': 'city',   // seat of a second-order administrative division
    'PPL': 'city',     // populated place
    'PPLX': 'suburb',  // section of populated place
    'PPLF': 'village', // farm village
    'PPLL': 'hamlet',  // populated locality
    'PPLR': 'village', // religious populated place
    'PPLS': 'village', // populated places
    'STLMT': 'settlement' // settlement
  };
  
  return typeMap[featureCode] || 'city';
}

// Process a batch of cities
async function processCityBatch(cities) {
  for (const city of cities) {
    try {
      // Get country
      const country = await prisma.country.findUnique({
        where: { code2: city.countryCode }
      });
      
      if (!country) continue;

      // Get state if available
      let state = null;
      if (city.admin1Code) {
        state = await prisma.state.findFirst({
          where: {
            countryId: country.id,
            code: city.admin1Code
          }
        });
      }

      // Check if city already exists
      const existingCity = await prisma.city.findFirst({
        where: {
          countryId: country.id,
          stateId: state?.id || null,
          slug: city.slug
        }
      });

      if (existingCity) {
        // Update existing city
        await prisma.city.update({
          where: { id: existingCity.id },
          data: {
            name: city.name,
            officialName: city.officialName,
            type: city.type,
            latitude: city.latitude,
            longitude: city.longitude,
            elevation: city.elevation,
            population: city.population,
            populationYear: city.populationYear,
            timezone: city.timezone,
            geonameId: city.geonameId,
            isActive: city.isActive
          }
        });
      } else {
        // Create new city
        await prisma.city.create({
          data: {
            name: city.name,
            officialName: city.officialName,
            type: city.type,
            slug: city.slug,
            latitude: city.latitude,
            longitude: city.longitude,
            elevation: city.elevation,
            population: city.population,
            populationYear: city.populationYear,
            timezone: city.timezone,
            geonameId: city.geonameId,
            countryId: country.id,
            stateId: state?.id || null,
            isActive: city.isActive
          }
        });
      }
    } catch (error) {
      console.error(`❌ Error processing city ${city.name}:`, error.message);
    }
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const shouldImportAll = args.includes('--all') || args.length === 0;
  
  console.log('🌎 Starting comprehensive geographic data import...\n');
  
  try {
    await ensureDataDirectory();
    
    if (shouldImportAll || args.includes('--continents')) {
      await importContinents();
    }
    
    if (shouldImportAll || args.includes('--countries')) {
      await importCountries();
    }
    
    if (shouldImportAll || args.includes('--states')) {
      await importStates();
    }
    
    if (shouldImportAll || args.includes('--cities')) {
      await importCities();
    }
    
    console.log('\n🎉 Geographic data import completed successfully!');
    
    // Print summary statistics
    const stats = await getImportStats();
    console.log('\n📊 Import Summary:');
    console.log(`   Continents: ${stats.continents}`);
    console.log(`   Countries: ${stats.countries}`);
    console.log(`   States/Provinces: ${stats.states}`);
    console.log(`   Cities: ${stats.cities}`);
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get import statistics
async function getImportStats() {
  const [continents, countries, states, cities] = await Promise.all([
    prisma.continent.count(),
    prisma.country.count(),
    prisma.state.count(),
    prisma.city.count()
  ]);
  
  return { continents, countries, states, cities };
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  importContinents,
  importCountries,
  importStates,
  importCities,
  getImportStats
};

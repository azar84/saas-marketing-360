#!/usr/bin/env node

/**
 * GeoNames.org Data Import Script
 * 
 * This script imports comprehensive geographic data from GeoNames.org
 * - Downloads official GeoNames datasets
 * - Imports countries, states, and cities with full metadata
 * - Focuses on North America but includes global coverage
 * 
 * Usage: node scripts/geonames-import.js [--countries] [--states] [--cities] [--all]
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { createReadStream, createWriteStream } = require('fs');
const AdmZip = require('adm-zip');

const prisma = new PrismaClient();

// Configuration
const DATA_DIR = path.join(__dirname, '../data/geonames');
const GEONAMES_BASE_URL = 'https://download.geonames.org/export/dump';

// GeoNames file URLs
const GEONAMES_FILES = {
  countryInfo: `${GEONAMES_BASE_URL}/countryInfo.txt`,
  admin1Codes: `${GEONAMES_BASE_URL}/admin1CodesASCII.txt`,
  admin2Codes: `${GEONAMES_BASE_URL}/admin2Codes.txt`,
  cities500: `${GEONAMES_BASE_URL}/cities500.zip`,
  cities1000: `${GEONAMES_BASE_URL}/cities1000.zip`,
  cities5000: `${GEONAMES_BASE_URL}/cities5000.zip`,
  cities15000: `${GEONAMES_BASE_URL}/cities15000.zip`,
  // Country-specific files for detailed coverage
  US: `${GEONAMES_BASE_URL}/US.zip`,
  CA: `${GEONAMES_BASE_URL}/CA.zip`,
  MX: `${GEONAMES_BASE_URL}/MX.zip`
};

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

// Download and extract file
async function downloadAndExtract(url, filename) {
  const filepath = path.join(DATA_DIR, filename);
  
  try {
    // Check if file already exists
    await fs.access(filepath);
    console.log(`✅ File already exists: ${filename}`);
    return filepath;
  } catch {
    console.log(`⬇️  Downloading ${filename}...`);
    
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      timeout: 300000 // 5 minutes timeout
    });

    const writer = createWriteStream(filepath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`✅ Downloaded: ${filename}`);

    // Extract if it's a zip file
    if (filename.endsWith('.zip')) {
      console.log(`📦 Extracting ${filename}...`);
      const zip = new AdmZip(filepath);
      const extractPath = path.join(DATA_DIR, path.basename(filename, '.zip'));
      zip.extractAllTo(extractPath, true);
      console.log(`✅ Extracted to: ${extractPath}`);
      return extractPath;
    }

    return filepath;
  }
}

// Import countries from GeoNames countryInfo.txt
async function importCountriesFromGeoNames() {
  console.log('\n🏳️ Importing countries from GeoNames...');
  
  const countryFilePath = await downloadAndExtract(GEONAMES_FILES.countryInfo, 'countryInfo.txt');

  // Continent mapping (GeoNames uses these codes)
  const continentMapping = {
    'AF': 'Africa',
    'AN': 'Antarctica', 
    'AS': 'Asia',
    'EU': 'Europe',
    'NA': 'North America',
    'OC': 'Oceania',
    'SA': 'South America'
  };

  // Get continent IDs
  const continents = await prisma.continent.findMany();
  const continentIdMap = {};
  continents.forEach(continent => {
    continentIdMap[continent.name] = continent.id;
  });

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
        // Skip comment lines and invalid entries
        if (data.iso.startsWith('#') || !data.iso || data.iso.length !== 2) {
          return;
        }

        const continentName = continentMapping[data.continent];
        if (!continentName || !continentIdMap[continentName]) {
          console.log(`⚠️  Unknown continent for ${data.country}: ${data.continent}`);
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
          continentId: continentIdMap[continentName],
          latitude: null, // Will be updated later if needed
          longitude: null,
          isActive: true
        });
      })
      .on('end', async () => {
        console.log(`📊 Processing ${countries.length} countries...`);
        
        let imported = 0;
        for (const country of countries) {
          try {
            await prisma.country.upsert({
              where: { code2: country.code2 },
              update: country,
              create: country
            });
            imported++;
            if (imported % 50 === 0) {
              console.log(`✅ Imported ${imported} countries...`);
            }
          } catch (error) {
            console.error(`❌ Error importing country ${country.name}:`, error.message);
          }
        }
        
        console.log(`✅ Completed importing ${imported} countries`);
        resolve();
      })
      .on('error', reject);
  });
}

// Import states/provinces from GeoNames admin1CodesASCII.txt
async function importStatesFromGeoNames() {
  console.log('\n🏛️ Importing states/provinces from GeoNames...');
  
  const admin1FilePath = await downloadAndExtract(GEONAMES_FILES.admin1Codes, 'admin1CodesASCII.txt');

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
        
        // Determine state type based on country
        let type = 'state';
        if (countryCode === 'CA') type = 'province';
        if (countryCode === 'AU') type = 'state';
        if (countryCode === 'DE') type = 'state';
        if (countryCode === 'IN') type = 'state';

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
        
        let imported = 0;
        for (const state of states) {
          try {
            // Get country ID
            const country = await prisma.country.findUnique({
              where: { code2: state.countryCode }
            });
            
            if (!country) {
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
                slug: state.slug,
                geonameId: state.geonameId
              },
              create: {
                name: state.name,
                officialName: state.officialName,
                code: state.code,
                type: state.type,
                slug: state.slug,
                countryId: country.id,
                geonameId: state.geonameId,
                isActive: true
              }
            });
            
            imported++;
            if (imported % 100 === 0) {
              console.log(`✅ Imported ${imported} states/provinces...`);
            }
          } catch (error) {
            console.error(`❌ Error importing state ${state.name}:`, error.message);
          }
        }
        
        console.log(`✅ Completed importing ${imported} states/provinces`);
        resolve();
      })
      .on('error', reject);
  });
}

// Import cities from GeoNames cities files
async function importCitiesFromGeoNames(minPopulation = 1000) {
  console.log(`\n🏙️ Importing cities from GeoNames (min population: ${minPopulation})...`);
  
  // Choose the appropriate cities file based on population threshold
  let citiesFile;
  if (minPopulation >= 15000) {
    citiesFile = 'cities15000.zip';
  } else if (minPopulation >= 5000) {
    citiesFile = 'cities5000.zip';
  } else if (minPopulation >= 1000) {
    citiesFile = 'cities1000.zip';
  } else {
    citiesFile = 'cities500.zip';
  }

  const citiesUrl = GEONAMES_FILES[citiesFile.replace('.zip', '')];
  const extractPath = await downloadAndExtract(citiesUrl, citiesFile);
  const citiesFilePath = path.join(extractPath, citiesFile.replace('.zip', '.txt'));

  return new Promise((resolve, reject) => {
    let processedCount = 0;
    const batchSize = 1000;
    let batch = [];
    
    createReadStream(citiesFilePath, { encoding: 'utf8' })
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
      .on('data', (data) => {
        // Focus on populated places
        if (!['P'].includes(data.featureClass)) return;
        
        const population = parseInt(data.population) || 0;
        if (population < minPopulation) return;

        // Priority to North America and major countries
        const isNorthAmerica = ['US', 'CA', 'MX'].includes(data.countryCode);
        const isMajorCountry = ['GB', 'DE', 'FR', 'JP', 'CN', 'IN', 'AU', 'BR'].includes(data.countryCode);
        
        // For North America: include all cities above threshold
        // For major countries: include cities with pop > 5000
        // For other countries: include cities with pop > 50000
        let shouldInclude = false;
        if (isNorthAmerica) {
          shouldInclude = population >= minPopulation;
        } else if (isMajorCountry) {
          shouldInclude = population >= 5000;
        } else {
          shouldInclude = population >= 50000;
        }

        if (!shouldInclude) return;

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
          populationYear: 2024, // GeoNames data is regularly updated
          timezone: data.timezone || null,
          geonameId: parseInt(data.geonameId) || null,
          countryCode: data.countryCode,
          admin1Code: data.admin1Code,
          admin2Code: data.admin2Code,
          isCapital: data.featureCode === 'PPLC', // Capital city
          isMetropolitan: population > 1000000, // Metro areas
          isActive: true
        });

        if (batch.length >= batchSize) {
          processCityBatch(batch).then(() => {
            processedCount += batch.length;
            console.log(`📊 Processed ${processedCount} cities...`);
          });
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

// Helper function to determine city type from GeoNames feature code
function getCityType(featureCode) {
  const typeMap = {
    'PPLC': 'capital',     // capital of a political entity
    'PPLA': 'city',        // seat of a first-order administrative division
    'PPLA2': 'city',       // seat of a second-order administrative division
    'PPLA3': 'town',       // seat of a third-order administrative division
    'PPLA4': 'town',       // seat of a fourth-order administrative division
    'PPL': 'city',         // populated place
    'PPLX': 'suburb',      // section of populated place
    'PPLF': 'village',     // farm village
    'PPLL': 'hamlet',      // populated locality
    'PPLR': 'village',     // religious populated place
    'PPLS': 'village',     // populated places
    'STLMT': 'settlement'  // settlement
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
          geonameId: city.geonameId
        }
      });

      const cityData = {
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
        isCapital: city.isCapital,
        isMetropolitan: city.isMetropolitan,
        countryId: country.id,
        stateId: state?.id || null,
        isActive: city.isActive
      };

      if (existingCity) {
        // Update existing city
        await prisma.city.update({
          where: { id: existingCity.id },
          data: cityData
        });
      } else {
        // Create new city
        await prisma.city.create({
          data: cityData
        });
      }
    } catch (error) {
      console.error(`❌ Error processing city ${city.name}:`, error.message);
    }
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

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const shouldImportAll = args.includes('--all') || args.length === 0;
  
  console.log('🌎 Starting GeoNames.org data import...\n');
  
  try {
    await ensureDataDirectory();
    
    if (shouldImportAll || args.includes('--countries')) {
      await importCountriesFromGeoNames();
    }
    
    if (shouldImportAll || args.includes('--states')) {
      await importStatesFromGeoNames();
    }
    
    if (shouldImportAll || args.includes('--cities')) {
      // Import cities with population > 1000 (can be adjusted)
      await importCitiesFromGeoNames(1000);
    }
    
    console.log('\n🎉 GeoNames data import completed successfully!');
    
    // Print summary statistics
    const stats = await getImportStats();
    console.log('\n📊 Final Database Summary:');
    console.log(`   Continents: ${stats.continents}`);
    console.log(`   Countries: ${stats.countries}`);
    console.log(`   States/Provinces: ${stats.states}`);
    console.log(`   Cities: ${stats.cities}`);
    
    console.log('\n📖 Data Source: GeoNames.org (Creative Commons Attribution License)');
    console.log('🔗 More info: https://www.geonames.org/');
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  importCountriesFromGeoNames,
  importStatesFromGeoNames,
  importCitiesFromGeoNames,
  getImportStats
};

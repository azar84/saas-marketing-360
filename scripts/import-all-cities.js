#!/usr/bin/env node

/**
 * Import All Cities Worldwide from GeoNames
 * 
 * This script imports comprehensive city data from GeoNames.org:
 * - Cities with population > 500 worldwide
 * - All populated places for major countries
 * - Complete geographic and demographic data
 */

const { PrismaClient } = require('@prisma/client');
const https = require('https');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const AdmZip = require('adm-zip');

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, '../data/geonames');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Download and extract ZIP file
function downloadAndExtractZip(url, filename) {
  return new Promise((resolve, reject) => {
    const zipPath = path.join(DATA_DIR, filename);
    const extractPath = path.join(DATA_DIR, path.basename(filename, '.zip'));
    
    // Check if already extracted
    if (fs.existsSync(extractPath)) {
      console.log(`✅ Already extracted: ${filename}`);
      resolve(extractPath);
      return;
    }

    // Check if ZIP already downloaded
    if (fs.existsSync(zipPath)) {
      console.log(`📦 Extracting existing ${filename}...`);
      try {
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(DATA_DIR, true);
        console.log(`✅ Extracted: ${filename}`);
        resolve(extractPath);
      } catch (error) {
        reject(error);
      }
      return;
    }

    console.log(`⬇️  Downloading ${filename} (this may take several minutes)...`);
    
    const file = fs.createWriteStream(zipPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
          const percent = Math.round((downloadedSize / totalSize) * 100);
          if (percent % 10 === 0) {
            process.stdout.write(`\r📊 Progress: ${percent}%`);
          }
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`\n✅ Downloaded: ${filename}`);
        
        // Extract the ZIP file
        console.log(`📦 Extracting ${filename}...`);
        try {
          const zip = new AdmZip(zipPath);
          zip.extractAllTo(DATA_DIR, true);
          console.log(`✅ Extracted: ${filename}`);
          resolve(extractPath);
        } catch (error) {
          reject(error);
        }
      });
      
      file.on('error', (err) => {
        fs.unlink(zipPath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
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

// Process cities in batches for better performance
async function processCityBatch(cities) {
  const batchResults = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };

  for (const city of cities) {
    try {
      // Get country
      const country = await prisma.country.findUnique({
        where: { code2: city.countryCode }
      });
      
      if (!country) {
        batchResults.skipped++;
        continue;
      }

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

      // Check if city already exists by geonameId first, then by unique slug
      let existingCity = await prisma.city.findFirst({
        where: {
          geonameId: city.geonameId
        }
      });

      // If not found by geonameId, check by slug to avoid duplicates
      if (!existingCity) {
        existingCity = await prisma.city.findFirst({
          where: {
            countryId: country.id,
            stateId: state?.id || null,
            slug: city.slug
          }
        });
      }

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
        isActive: true
      };

      if (existingCity) {
        // Update existing city
        await prisma.city.update({
          where: { id: existingCity.id },
          data: cityData
        });
        batchResults.updated++;
      } else {
        // Create new city
        await prisma.city.create({
          data: cityData
        });
        batchResults.created++;
      }
    } catch (error) {
      batchResults.errors++;
      if (batchResults.errors <= 5) { // Only log first 5 errors to avoid spam
        console.error(`❌ Error processing city ${city.name}:`, error.message);
      }
    }
  }

  return batchResults;
}

// Import cities from GeoNames cities500.zip (cities with population > 500)
async function importAllCitiesWorldwide() {
  console.log('\n🏙️ Importing all cities worldwide from GeoNames...');
  console.log('📊 This will import cities with population > 500 globally');
  console.log('⏱️  Estimated time: 10-30 minutes depending on connection speed\n');
  
  try {
    // Download and extract cities500.zip
    const extractPath = await downloadAndExtractZip(
      'https://download.geonames.org/export/dump/cities500.zip',
      'cities500.zip'
    );
    
    const citiesFilePath = path.join(DATA_DIR, 'cities500.txt');
    
    if (!fs.existsSync(citiesFilePath)) {
      throw new Error(`Cities file not found: ${citiesFilePath}`);
    }

    console.log('📖 Processing cities data...');

    return new Promise((resolve, reject) => {
      let processedCount = 0;
      let totalResults = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0
      };
      
      const batchSize = 500; // Process in batches of 500
      let batch = [];
      
      fs.createReadStream(citiesFilePath, { encoding: 'utf8' })
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
          if (population < 500) return; // Only cities with population > 500

          const cityType = getCityType(data.featureCode);
          
          // Create unique slug by including country and state codes
          const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const uniqueSlug = data.admin1Code 
            ? `${baseSlug}-${data.admin1Code.toLowerCase()}-${data.countryCode.toLowerCase()}`
            : `${baseSlug}-${data.countryCode.toLowerCase()}`;

          batch.push({
            name: data.name,
            officialName: data.asciiName || data.name,
            type: cityType,
            slug: uniqueSlug,
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
            // Process batch asynchronously
            processCityBatch([...batch]).then((batchResults) => {
              totalResults.created += batchResults.created;
              totalResults.updated += batchResults.updated;
              totalResults.skipped += batchResults.skipped;
              totalResults.errors += batchResults.errors;
              
              processedCount += batch.length;
              console.log(`📊 Processed ${processedCount} cities (Created: ${totalResults.created}, Updated: ${totalResults.updated}, Errors: ${totalResults.errors})`);
            }).catch(console.error);
            
            batch = [];
          }
        })
        .on('end', async () => {
          // Process remaining batch
          if (batch.length > 0) {
            const batchResults = await processCityBatch(batch);
            totalResults.created += batchResults.created;
            totalResults.updated += batchResults.updated;
            totalResults.skipped += batchResults.skipped;
            totalResults.errors += batchResults.errors;
            processedCount += batch.length;
          }
          
          console.log('\n✅ City import completed!');
          console.log(`📊 Final Results:`);
          console.log(`   Cities Created: ${totalResults.created}`);
          console.log(`   Cities Updated: ${totalResults.updated}`);
          console.log(`   Cities Skipped: ${totalResults.skipped}`);
          console.log(`   Errors: ${totalResults.errors}`);
          console.log(`   Total Processed: ${processedCount}`);
          
          resolve(totalResults);
        })
        .on('error', reject);
    });

  } catch (error) {
    console.error('Error importing cities:', error);
    throw error;
  }
}

// Get final statistics
async function getFinalStats() {
  const [continents, countries, states, cities] = await Promise.all([
    prisma.continent.count(),
    prisma.country.count(),
    prisma.state.count(),
    prisma.city.count()
  ]);
  
  // Get some interesting breakdowns
  const [
    capitalCities,
    metropolitanAreas,
    northAmericanCities,
    topCitiesByPopulation
  ] = await Promise.all([
    prisma.city.count({ where: { isCapital: true } }),
    prisma.city.count({ where: { isMetropolitan: true } }),
    prisma.city.count({ 
      where: { 
        country: { 
          continent: { 
            code: 'NA' 
          } 
        } 
      } 
    }),
    prisma.city.findMany({
      select: { name: true, population: true, country: { select: { name: true } } },
      where: { population: { not: null } },
      orderBy: { population: 'desc' },
      take: 10
    })
  ]);
  
  return { 
    continents, 
    countries, 
    states, 
    cities,
    capitalCities,
    metropolitanAreas,
    northAmericanCities,
    topCitiesByPopulation
  };
}

// Main function
async function main() {
  console.log('🌍 Starting worldwide cities import from GeoNames.org...\n');
  
  const startTime = Date.now();
  
  try {
    // Import all cities worldwide
    await importAllCitiesWorldwide();
    
    // Get final statistics
    const stats = await getFinalStats();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🎉 Worldwide cities import completed successfully!');
    console.log(`⏱️  Total time: ${duration} seconds\n`);
    
    console.log('📊 Final Database Statistics:');
    console.log(`   Continents: ${stats.continents}`);
    console.log(`   Countries: ${stats.countries}`);
    console.log(`   States/Provinces: ${stats.states}`);
    console.log(`   Cities: ${stats.cities.toLocaleString()}`);
    console.log(`   Capital Cities: ${stats.capitalCities}`);
    console.log(`   Metropolitan Areas: ${stats.metropolitanAreas}`);
    console.log(`   North American Cities: ${stats.northAmericanCities}`);
    
    console.log('\n🏆 Top 10 Cities by Population:');
    stats.topCitiesByPopulation.forEach((city, index) => {
      console.log(`   ${index + 1}. ${city.name}, ${city.country.name} - ${city.population?.toLocaleString() || 'N/A'}`);
    });
    
    console.log('\n📖 Data Source: GeoNames.org');
    console.log('📄 License: Creative Commons Attribution License');
    console.log('🔗 More info: https://www.geonames.org/');
    console.log('\n✨ Your geographic database now contains comprehensive worldwide city data!');
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  importAllCitiesWorldwide,
  getFinalStats
};

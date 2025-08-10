#!/usr/bin/env node

/**
 * Comprehensive North America Cities Import
 * 
 * This script imports ALL cities, towns, villages, and populated places
 * for US and Canada using GeoNames allCountries.zip dataset.
 * 
 * Unlike cities500.zip which only has ~13,000 US cities, this will import
 * ALL populated places including small towns, villages, neighborhoods, etc.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, '..', 'data', 'geonames-comprehensive');

// All populated place feature codes from GeoNames
const POPULATED_PLACE_CODES = new Set([
  'PPL',    // populated place (city, town, village)
  'PPLA',   // seat of a first-order administrative division (state capital)
  'PPLA2',  // seat of a second-order administrative division (county seat)
  'PPLA3',  // seat of a third-order administrative division
  'PPLA4',  // seat of a fourth-order administrative division
  'PPLA5',  // seat of a fifth-order administrative division
  'PPLC',   // capital of a political entity (national capital)
  'PPLCH',  // historical capital of a political entity
  'PPLF',   // farm village
  'PPLG',   // seat of government of a political entity
  'PPLH',   // historical populated place
  'PPLL',   // populated locality
  'PPLQ',   // abandoned populated place
  'PPLR',   // religious populated place
  'PPLS',   // populated places
  'PPLW',   // destroyed populated place
  'PPLX',   // section of populated place (neighborhood, district)
  'STLMT',  // israeli settlement (we'll include for completeness)
]);

// Focus on US and Canada initially
const TARGET_COUNTRIES = new Set(['US', 'CA']);

async function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

async function downloadFile(url, filename) {
  const filePath = path.join(DATA_DIR, filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ File already exists: ${filename}`);
    return filePath;
  }

  console.log(`📥 Downloading ${filename}... (this may take several minutes)`);
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    timeout: 600000, // 10 minutes for large file
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log(`✅ Downloaded: ${filename}`);
      resolve(filePath);
    });
    writer.on('error', reject);
  });
}

async function extractZipFile(zipPath, extractToDir) {
  console.log(`📦 Extracting ${path.basename(zipPath)}...`);
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractToDir, true);
  console.log(`✅ Extracted to: ${extractToDir}`);
}

function getCityType(featureCode, population) {
  // Classify based on feature code and population
  if (featureCode === 'PPLC') return 'national_capital';
  if (featureCode === 'PPLA') return 'state_capital';
  if (featureCode === 'PPLA2') return 'county_seat';
  if (featureCode === 'PPLX') return 'neighborhood';
  if (featureCode === 'PPLF') return 'village';
  if (featureCode === 'PPLL') return 'locality';
  if (featureCode === 'PPLR') return 'settlement';
  
  // Classify by population
  if (population >= 1000000) return 'metropolis';
  if (population >= 500000) return 'major_city';
  if (population >= 100000) return 'city';
  if (population >= 50000) return 'large_town';
  if (population >= 10000) return 'town';
  if (population >= 1000) return 'small_town';
  if (population >= 100) return 'village';
  
  return 'locality';
}

async function processAllCountriesFile() {
  const allCountriesFile = path.join(DATA_DIR, 'allCountries.txt');
  
  if (!fs.existsSync(allCountriesFile)) {
    throw new Error(`All countries file not found: ${allCountriesFile}`);
  }

  console.log('🔍 Processing allCountries.txt for US and Canada...');
  console.log('   This will find ALL populated places, not just large cities');

  let totalProcessed = 0;
  let usCanadaCities = 0;
  let skippedOtherCountries = 0;
  const batchSize = 500;
  let batch = [];

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(allCountriesFile, { encoding: 'utf8' });
    let buffer = '';

    stream.on('data', async (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim() === '') continue;
        
        const parts = line.split('\t');
        if (parts.length < 19) continue;

        totalProcessed++;

        const [
          geonameId, name, asciiName, alternateNames, latitude, longitude,
          featureClass, featureCode, countryCode, cc2, admin1Code, admin2Code,
          admin3Code, admin4Code, population, elevation, dem, timezone, modificationDate
        ] = parts;

        // Only process US and Canada
        if (!TARGET_COUNTRIES.has(countryCode)) {
          skippedOtherCountries++;
          continue;
        }

        // Only process populated places
        if (!POPULATED_PLACE_CODES.has(featureCode)) {
          continue;
        }

        const populationNum = parseInt(population) || 0;
        const cityType = getCityType(featureCode, populationNum);

        // Create unique slug with state/province and country
        const baseSlug = asciiName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const uniqueSlug = admin1Code 
          ? `${baseSlug}-${admin1Code.toLowerCase()}-${countryCode.toLowerCase()}`
          : `${baseSlug}-${countryCode.toLowerCase()}`;

        batch.push({
          geonameId: parseInt(geonameId),
          name: name.trim(),
          officialName: asciiName.trim(),
          alternateNames: alternateNames.trim(),
          type: cityType,
          slug: uniqueSlug,
          latitude: parseFloat(latitude) || null,
          longitude: parseFloat(longitude) || null,
          elevation: parseInt(elevation) || null,
          population: populationNum || null,
          populationYear: 2024,
          timezone: timezone.trim() || null,
          featureCode: featureCode,
          countryCode: countryCode.trim(),
          admin1Code: admin1Code.trim() || null,
          admin2Code: admin2Code.trim() || null,
          admin3Code: admin3Code.trim() || null,
          admin4Code: admin4Code.trim() || null,
          isCapital: featureCode === 'PPLC',
          isMetropolitan: populationNum > 1000000,
          isActive: true
        });

        usCanadaCities++;

        // Process batch
        if (batch.length >= batchSize) {
          await processCityBatch([...batch]);
          batch = [];
          
          if (usCanadaCities % 1000 === 0 && usCanadaCities > 0) {
            console.log(`📊 Found ${usCanadaCities.toLocaleString()} US/Canada cities (processed ${totalProcessed.toLocaleString()} total entries)`);
          }
          
          // Show we're alive every 100k entries even if no US/Canada cities found
          if (totalProcessed % 100000 === 0) {
            console.log(`🔄 Processing... ${totalProcessed.toLocaleString()} entries scanned, ${usCanadaCities.toLocaleString()} US/CA cities found`);
          }
        }
      }
    });

    stream.on('end', async () => {
      // Process final buffer
      if (buffer.trim()) {
        // Process the last line if it exists
      }

      // Process remaining batch
      if (batch.length > 0) {
        await processCityBatch(batch);
      }

      console.log(`\n✅ Processing completed!`);
      console.log(`   Total entries processed: ${totalProcessed.toLocaleString()}`);
      console.log(`   US/Canada cities found: ${usCanadaCities.toLocaleString()}`);
      console.log(`   Other countries skipped: ${skippedOtherCountries.toLocaleString()}`);

      resolve({
        totalProcessed,
        usCanadaCities,
        skippedOtherCountries
      });
    });

    stream.on('error', reject);
  });
}

async function processCityBatch(cities) {
  const results = { created: 0, updated: 0, errors: 0 };
  
  console.log(`💾 Processing batch of ${cities.length} cities...`);

  for (const city of cities) {
    try {
      // Get country
      const country = await prisma.country.findUnique({
        where: { code2: city.countryCode }
      });

      if (!country) {
        console.log(`⚠️  Country not found: ${city.countryCode} for ${city.name}`);
        results.errors++;
        continue;
      }

      // Get state/province if exists
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
          OR: [
            { geonameId: city.geonameId },
            {
              countryId: country.id,
              stateId: state?.id || null,
              slug: city.slug
            }
          ]
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
        countryId: country.id,
        stateId: state?.id || null,
        population: city.population,
        populationYear: city.populationYear,
        timezone: city.timezone,
        geonameId: city.geonameId,
        isCapital: city.isCapital,
        isMetropolitan: city.isMetropolitan,
        isActive: city.isActive
      };

      if (existingCity) {
        await prisma.city.update({
          where: { id: existingCity.id },
          data: cityData
        });
        results.updated++;
      } else {
        await prisma.city.create({
          data: cityData
        });
        results.created++;
      }

    } catch (error) {
      results.errors++;
      if (results.errors <= 10) { // Only log first 10 errors
        console.error(`❌ Error processing ${city.name}:`, error.message);
      }
    }
  }

  console.log(`✅ Batch completed: ${results.created} created, ${results.updated} updated, ${results.errors} errors`);
  return results;
}

async function downloadAndImportNorthAmerica() {
  console.log('🍁🇺🇸 Starting comprehensive North America cities import...\n');
  
  try {
    await ensureDirectoryExists(DATA_DIR);

    // Download the complete GeoNames dataset
    console.log('📥 Downloading complete GeoNames dataset...');
    console.log('   ⚠️  This is a large file (~400MB) and may take several minutes');
    
    await downloadFile('https://download.geonames.org/export/dump/allCountries.zip', 'allCountries.zip');

    // Extract the ZIP file
    const allCountriesZip = path.join(DATA_DIR, 'allCountries.zip');
    await extractZipFile(allCountriesZip, DATA_DIR);

    // Process the data
    const results = await processAllCountriesFile();
    
    console.log('\n🎉 Import completed successfully!');
    console.log(`📊 Results:`);
    console.log(`   US/Canada cities imported: ${results.usCanadaCities.toLocaleString()}`);
    console.log(`   Total GeoNames entries processed: ${results.totalProcessed.toLocaleString()}`);
    
    // Show current database stats
    const [totalCities, usCities, canadaCities] = await Promise.all([
      prisma.city.count(),
      prisma.city.count({ where: { country: { code2: 'US' } } }),
      prisma.city.count({ where: { country: { code2: 'CA' } } })
    ]);

    console.log(`\n📊 Current Database Statistics:`);
    console.log(`   Total cities: ${totalCities.toLocaleString()}`);
    console.log(`   US cities: ${usCities.toLocaleString()}`);
    console.log(`   Canada cities: ${canadaCities.toLocaleString()}`);
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  console.log('🌎 Comprehensive North America Cities Import');
  console.log('');
  console.log('This will import ALL populated places from GeoNames for US & Canada:');
  console.log('• Cities, towns, villages, hamlets');
  console.log('• Neighborhoods and districts'); 
  console.log('• County seats and state capitals');
  console.log('• Small communities and localities');
  console.log('');
  console.log('Expected results:');
  console.log('• US: ~50,000+ populated places (vs current ~13,000)');
  console.log('• Canada: ~8,000+ populated places (vs current ~900)');
  console.log('');
  
  downloadAndImportNorthAmerica().catch(console.error);
}

module.exports = { downloadAndImportNorthAmerica };

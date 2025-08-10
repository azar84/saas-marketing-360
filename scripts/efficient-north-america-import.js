#!/usr/bin/env node

/**
 * Efficient North America Cities Import
 * 
 * This version fixes the performance issues by:
 * 1. Using bulk insert operations instead of individual database calls
 * 2. Pre-loading country/state lookups to avoid repeated queries
 * 3. Better error handling and timeout management
 * 4. Streaming processing to avoid memory issues
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const DATA_DIR = path.join(__dirname, '..', 'data', 'geonames-comprehensive');

// All populated place feature codes from GeoNames
const POPULATED_PLACE_CODES = new Set([
  'PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLA5', 'PPLC', 'PPLCH', 
  'PPLF', 'PPLG', 'PPLH', 'PPLL', 'PPLQ', 'PPLR', 'PPLS', 'PPLW', 'PPLX', 'STLMT'
]);

const TARGET_COUNTRIES = new Set(['US', 'CA']);

// Cache for country and state lookups
let countryCache = new Map();
let stateCache = new Map();

function getCityType(featureCode, population) {
  if (featureCode === 'PPLC') return 'national_capital';
  if (featureCode === 'PPLA') return 'state_capital';
  if (featureCode === 'PPLA2') return 'county_seat';
  if (featureCode === 'PPLX') return 'neighborhood';
  if (featureCode === 'PPLF') return 'village';
  if (featureCode === 'PPLL') return 'locality';
  if (featureCode === 'PPLR') return 'settlement';
  
  if (population >= 1000000) return 'metropolis';
  if (population >= 500000) return 'major_city';
  if (population >= 100000) return 'city';
  if (population >= 50000) return 'large_town';
  if (population >= 10000) return 'town';
  if (population >= 1000) return 'small_town';
  if (population >= 100) return 'village';
  
  return 'locality';
}

async function loadCaches() {
  console.log('📦 Loading country and state caches...');
  
  // Load countries
  const countries = await prisma.country.findMany({
    select: { id: true, code2: true }
  });
  
  countries.forEach(country => {
    countryCache.set(country.code2, country.id);
  });
  
  // Load states
  const states = await prisma.state.findMany({
    select: { id: true, countryId: true, code: true }
  });
  
  states.forEach(state => {
    const key = `${state.countryId}-${state.code}`;
    stateCache.set(key, state.id);
  });
  
  console.log(`✅ Cached ${countries.length} countries and ${states.length} states`);
}

async function processAllCountriesFileEfficiently() {
  const allCountriesFile = path.join(DATA_DIR, 'allCountries.txt');
  
  if (!fs.existsSync(allCountriesFile)) {
    throw new Error(`All countries file not found: ${allCountriesFile}`);
  }

  console.log('🔍 Processing allCountries.txt efficiently...');
  console.log('   Using bulk operations and caching for better performance');

  let totalProcessed = 0;
  let usCanadaCities = 0;
  let skippedOtherCountries = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  
  const batchSize = 1000;
  let batch = [];

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(allCountriesFile, { encoding: 'utf8' });
    let buffer = '';

    stream.on('data', async (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

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

        // Create unique slug
        const baseSlug = asciiName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const uniqueSlug = admin1Code 
          ? `${baseSlug}-${admin1Code.toLowerCase()}-${countryCode.toLowerCase()}`
          : `${baseSlug}-${countryCode.toLowerCase()}`;

        batch.push({
          geonameId: parseInt(geonameId),
          name: name.trim(),
          officialName: asciiName.trim(),
          type: cityType,
          slug: uniqueSlug,
          latitude: parseFloat(latitude) || null,
          longitude: parseFloat(longitude) || null,
          elevation: parseInt(elevation) || null,
          population: populationNum || null,
          populationYear: 2024,
          timezone: timezone.trim() || null,
          countryCode: countryCode.trim(),
          admin1Code: admin1Code.trim() || null,
          isCapital: featureCode === 'PPLC',
          isMetropolitan: populationNum > 1000000,
          isActive: true
        });

        usCanadaCities++;

        // Process batch efficiently
        if (batch.length >= batchSize) {
          const results = await processCityBatchEfficiently([...batch]);
          batch = [];
          
          totalCreated += results.created;
          totalUpdated += results.updated;
          totalErrors += results.errors;
          
          if (usCanadaCities % 10000 === 0) {
            console.log(`📊 Progress: ${usCanadaCities.toLocaleString()} cities found (${totalCreated.toLocaleString()} created, ${totalUpdated.toLocaleString()} updated, ${totalErrors} errors)`);
          }
        }
      }
    });

    stream.on('end', async () => {
      // Process remaining batch
      if (batch.length > 0) {
        const results = await processCityBatchEfficiently(batch);
        totalCreated += results.created;
        totalUpdated += results.updated;
        totalErrors += results.errors;
      }

      console.log(`\n✅ Processing completed!`);
      console.log(`   Total entries processed: ${totalProcessed.toLocaleString()}`);
      console.log(`   US/Canada cities found: ${usCanadaCities.toLocaleString()}`);
      console.log(`   Cities created: ${totalCreated.toLocaleString()}`);
      console.log(`   Cities updated: ${totalUpdated.toLocaleString()}`);
      console.log(`   Errors: ${totalErrors}`);

      resolve({
        totalProcessed,
        usCanadaCities,
        totalCreated,
        totalUpdated,
        totalErrors
      });
    });

    stream.on('error', reject);
  });
}

async function processCityBatchEfficiently(cities) {
  const results = { created: 0, updated: 0, errors: 0 };
  
  try {
    // Prepare data for bulk operations
    const citiesToCreate = [];
    const citiesToUpdate = [];
    
    for (const city of cities) {
      try {
        // Get country ID from cache
        const countryId = countryCache.get(city.countryCode);
        if (!countryId) {
          results.errors++;
          continue;
        }

        // Get state ID from cache if exists
        let stateId = null;
        if (city.admin1Code) {
          const stateKey = `${countryId}-${city.admin1Code}`;
          stateId = stateCache.get(stateKey) || null;
        }

        // Check if city exists by geonameId (fastest lookup)
        const existingCity = await prisma.city.findFirst({
          where: { geonameId: city.geonameId },
          select: { id: true }
        });

        const cityData = {
          name: city.name,
          officialName: city.officialName,
          type: city.type,
          slug: city.slug,
          latitude: city.latitude,
          longitude: city.longitude,
          elevation: city.elevation,
          countryId: countryId,
          stateId: stateId,
          population: city.population,
          populationYear: city.populationYear,
          timezone: city.timezone,
          geonameId: city.geonameId,
          isCapital: city.isCapital,
          isMetropolitan: city.isMetropolitan,
          isActive: city.isActive
        };

        if (existingCity) {
          citiesToUpdate.push({
            id: existingCity.id,
            data: cityData
          });
        } else {
          citiesToCreate.push(cityData);
        }

      } catch (error) {
        results.errors++;
        if (results.errors <= 5) {
          console.error(`❌ Error preparing ${city.name}:`, error.message);
        }
      }
    }

    // Bulk create new cities
    if (citiesToCreate.length > 0) {
      try {
        await prisma.city.createMany({
          data: citiesToCreate,
          skipDuplicates: true
        });
        results.created += citiesToCreate.length;
      } catch (error) {
        console.error(`❌ Bulk create error:`, error.message);
        results.errors += citiesToCreate.length;
      }
    }

    // Update existing cities (unfortunately Prisma doesn't support bulk update)
    for (const cityUpdate of citiesToUpdate) {
      try {
        await prisma.city.update({
          where: { id: cityUpdate.id },
          data: cityUpdate.data
        });
        results.updated++;
      } catch (error) {
        results.errors++;
      }
    }

  } catch (error) {
    console.error(`❌ Batch processing error:`, error.message);
    results.errors += cities.length;
  }

  return results;
}

async function runEfficientImport() {
  console.log('🚀 Starting efficient North America cities import...\n');
  
  try {
    // Load caches first
    await loadCaches();

    // Process the data efficiently
    const results = await processAllCountriesFileEfficiently();
    
    console.log('\n🎉 Efficient import completed successfully!');
    
    // Show final database stats
    const [totalCities, usCities, canadaCities] = await Promise.all([
      prisma.city.count(),
      prisma.city.count({ where: { country: { code2: 'US' } } }),
      prisma.city.count({ where: { country: { code2: 'CA' } } })
    ]);

    console.log(`\n📊 Final Database Statistics:`);
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
  console.log('⚡ Efficient North America Cities Import');
  console.log('   Fixed performance issues with bulk operations and caching');
  console.log('');
  
  runEfficientImport().catch(console.error);
}

module.exports = { runEfficientImport };

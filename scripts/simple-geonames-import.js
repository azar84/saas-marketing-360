#!/usr/bin/env node

/**
 * Simple GeoNames Import
 * Downloads and imports country data from GeoNames using a more reliable approach
 */

const { PrismaClient } = require('@prisma/client');
const https = require('https');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

// Create data directory
const DATA_DIR = path.join(__dirname, '../data/geonames');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`📁 Created data directory: ${DATA_DIR}`);
}

// Download file function
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(DATA_DIR, filename);
    
    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`✅ File already exists: ${filename}`);
      resolve(filepath);
      return;
    }

    console.log(`⬇️  Downloading ${filename}...`);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve(filepath);
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Import countries from GeoNames
async function importGeoNamesCountries() {
  console.log('\n🏳️ Importing countries from GeoNames...');
  
  try {
    const countryFile = await downloadFile(
      'https://download.geonames.org/export/dump/countryInfo.txt',
      'countryInfo.txt'
    );

    // Get continent IDs
    const continents = await prisma.continent.findMany();
    const continentMap = {
      'AF': continents.find(c => c.code === 'AF')?.id,
      'AN': continents.find(c => c.code === 'AN')?.id,
      'AS': continents.find(c => c.code === 'AS')?.id,
      'EU': continents.find(c => c.code === 'EU')?.id,
      'NA': continents.find(c => c.code === 'NA')?.id,
      'OC': continents.find(c => c.code === 'OC')?.id,
      'SA': continents.find(c => c.code === 'SA')?.id
    };

    return new Promise((resolve, reject) => {
      const countries = [];
      
      fs.createReadStream(countryFile, { encoding: 'utf8' })
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

          const continentId = continentMap[data.continent];
          if (!continentId) {
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
            continentId: continentId,
            latitude: null,
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
              
              if (imported % 50 === 0 || imported === countries.length) {
                console.log(`✅ Imported ${imported}/${countries.length} countries`);
              }
            } catch (error) {
              console.error(`❌ Error importing ${country.name}:`, error.message);
            }
          }
          
          console.log(`✅ Successfully imported ${imported} countries from GeoNames`);
          resolve(imported);
        })
        .on('error', reject);
    });

  } catch (error) {
    console.error('Error importing countries:', error);
    throw error;
  }
}

// Import admin1 codes (states/provinces)
async function importGeoNamesStates() {
  console.log('\n🏛️ Importing states/provinces from GeoNames...');
  
  try {
    const admin1File = await downloadFile(
      'https://download.geonames.org/export/dump/admin1CodesASCII.txt',
      'admin1CodesASCII.txt'
    );

    return new Promise((resolve, reject) => {
      const states = [];
      
      fs.createReadStream(admin1File, { encoding: 'utf8' })
        .pipe(csv({
          separator: '\t',
          headers: ['code', 'name', 'asciiName', 'geonameId'],
          skipLinesWithError: true
        }))
        .on('data', (data) => {
          if (!data.code || !data.code.includes('.')) return;
          
          const [countryCode, stateCode] = data.code.split('.');
          
          // Determine type based on country
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
              
              if (!country) continue;

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
                  countryId: country.id,
                  isActive: true
                }
              });
              
              imported++;
              if (imported % 100 === 0 || imported === states.length) {
                console.log(`✅ Imported ${imported} states/provinces`);
              }
            } catch (error) {
              console.error(`❌ Error importing ${state.name}:`, error.message);
            }
          }
          
          console.log(`✅ Successfully imported ${imported} states/provinces from GeoNames`);
          resolve(imported);
        })
        .on('error', reject);
    });

  } catch (error) {
    console.error('Error importing states:', error);
    throw error;
  }
}

// Get statistics
async function getStats() {
  const [continents, countries, states, cities] = await Promise.all([
    prisma.continent.count(),
    prisma.country.count(),
    prisma.state.count(),
    prisma.city.count()
  ]);
  
  return { continents, countries, states, cities };
}

// Main function
async function main() {
  console.log('🌎 Starting GeoNames.org import...\n');
  
  try {
    // Import countries
    await importGeoNamesCountries();
    
    // Import states/provinces
    await importGeoNamesStates();
    
    // Show final stats
    const stats = await getStats();
    console.log('\n📊 Final Database Statistics:');
    console.log(`   Continents: ${stats.continents}`);
    console.log(`   Countries: ${stats.countries}`);
    console.log(`   States/Provinces: ${stats.states}`);
    console.log(`   Cities: ${stats.cities}`);
    
    console.log('\n🎉 GeoNames import completed successfully!');
    console.log('\n📖 Data Source: GeoNames.org');
    console.log('📄 License: Creative Commons Attribution License');
    console.log('🔗 More info: https://www.geonames.org/');
    
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
  importGeoNamesCountries,
  importGeoNamesStates,
  getStats
};

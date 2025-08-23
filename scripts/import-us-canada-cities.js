const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Helper function to parse cities file
function parseCitiesFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  return lines.map(line => {
    const fields = line.split('\t');
    return {
      geonameId: parseInt(fields[0]) || null,
      name: fields[1] || '',
      asciiName: fields[2] || '',
      alternateNames: fields[3] || '',
      latitude: parseFloat(fields[4]) || null,
      longitude: parseFloat(fields[5]) || null,
      featureClass: fields[6] || null,
      featureCode: fields[7] || null,
      countryCode: fields[8] || null,
      cc2: fields[9] || '',
      admin1Code: fields[10] || null,
      admin2Code: fields[11] || null,
      admin3Code: fields[12] || null,
      admin4Code: fields[13] || null,
      population: parseInt(fields[14]) || null,
      elevation: parseInt(fields[15]) || null,
      dem: parseInt(fields[16]) || null,
      timezone: fields[17] || null,
      modificationDate: fields[18] || null
    };
  });
}

// Helper function to get or create continent
async function getOrCreateContinent() {
  let continent = await prisma.continent.findUnique({
    where: { code: 'NA' }
  });

  if (!continent) {
    console.log('Creating North America continent...');
    continent = await prisma.continent.create({
      data: {
        name: 'North America',
        code: 'NA',
        slug: 'north-america'
      }
    });
  }

  return continent;
}

// Helper function to get or create country
async function getOrCreateCountry(countryCode, countryName, continentId) {
  let country = await prisma.country.findUnique({
    where: { code2: countryCode }
  });

  if (!country) {
    console.log(`Creating country: ${countryCode} - ${countryName}`);
    country = await prisma.country.create({
      data: {
        name: countryName,
        code2: countryCode,
        code3: countryCode === 'CA' ? 'CAN' : 'USA',
        slug: createSlug(countryName),
        continentId: continentId,
        isActive: true
      }
    });
  }

  return country;
}

// Helper function to get or create state
async function getOrCreateState(stateCode, countryId, countryCode) {
  if (!stateCode) return null;

  let state = await prisma.state.findFirst({
    where: {
      code: stateCode,
      countryId: countryId
    }
  });

  if (!state) {
    // Create state name based on common codes
    const stateNames = {
      // Canadian provinces/territories
      '01': 'Alberta', '02': 'British Columbia', '03': 'Manitoba', '04': 'New Brunswick',
      '05': 'Newfoundland and Labrador', '07': 'Nova Scotia', '08': 'Ontario', '09': 'Prince Edward Island',
      '10': 'Quebec', '11': 'Saskatchewan', '12': 'Yukon', '13': 'Northwest Territories', '14': 'Nunavut',
      // US states (common codes)
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
      'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
      'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
      'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
      'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
      'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
      'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
      'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
      'DC': 'District of Columbia', 'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'GU': 'Guam',
      'AS': 'American Samoa', 'MP': 'Northern Mariana Islands'
    };

    const stateName = stateNames[stateCode] || `State ${stateCode}`;
    
    console.log(`Creating state: ${stateCode} - ${stateName} (${countryCode})`);
    state = await prisma.state.create({
      data: {
        name: stateName,
        code: stateCode,
        slug: createSlug(stateName),
        countryId: countryId,
        isActive: true
      }
    });
  }

  return state;
}

async function importCities() {
  try {
    console.log('🚀 Starting US & Canada cities import...');
    
    const filePath = path.join(__dirname, '..', 'data', 'geonames', 'US & Canada cities 500.txt');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log('📖 Parsing cities file...');
    const cities = parseCitiesFile(filePath);
    console.log(`Found ${cities.length} cities to import`);

    // Get or create continent first
    console.log('🌍 Setting up continent...');
    const northAmerica = await getOrCreateContinent();
    
    // Get or create countries
    console.log('🏳️ Setting up countries...');
    const canadaCountry = await getOrCreateCountry('CA', 'Canada', northAmerica.id);
    const usCountry = await getOrCreateCountry('US', 'United States', northAmerica.id);

    console.log('🏛️ Processing cities in batches...');
    const batchSize = 100;
    let processed = 0;
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < cities.length; i += batchSize) {
      const batch = cities.slice(i, i + batchSize);
      
      for (const cityData of batch) {
        try {
          // Determine country
          const country = cityData.countryCode === 'CA' ? canadaCountry : usCountry;
          
          // Get or create state
          const state = await getOrCreateState(cityData.admin1Code, country.id, cityData.countryCode);
          
          // Check if city already exists
          const existingCity = await prisma.city.findFirst({
            where: {
              name: cityData.name,
              countryId: country.id,
              stateId: state?.id || null
            }
          });

          if (existingCity) {
            skipped++;
            continue;
          }

          // Create city
          await prisma.city.create({
            data: {
              name: cityData.name,
              officialName: cityData.asciiName || cityData.name,
              slug: createSlug(cityData.name),
              latitude: cityData.latitude,
              longitude: cityData.longitude,
              elevation: cityData.elevation,
              population: cityData.population,
              timezone: cityData.timezone,
              featureClass: cityData.featureClass,
              featureCode: cityData.featureCode,
              countryCode: cityData.countryCode,
              stateCode: cityData.admin1Code,
              geonameId: cityData.geonameId,
              countryId: country.id,
              stateId: state?.id || null,
              isActive: true
            }
          });

          created++;
        } catch (error) {
          console.error(`Error processing city ${cityData.name}:`, error.message);
          skipped++;
        }

        processed++;
        if (processed % 500 === 0) {
          console.log(`Progress: ${processed}/${cities.length} cities processed (${created} created, ${skipped} skipped)`);
        }
      }
    }

    console.log('\n✅ Import completed!');
    console.log(`📊 Final stats:`);
    console.log(`   Total processed: ${processed}`);
    console.log(`   Cities created: ${created}`);
    console.log(`   Cities skipped: ${skipped}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
if (require.main === module) {
  importCities()
    .then(() => {
      console.log('🎉 Cities import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cities import failed:', error);
      process.exit(1);
    });
}

module.exports = { importCities };

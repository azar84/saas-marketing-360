#!/usr/bin/env node

/**
 * Simplified Geographic Data Import Script
 * This version uses hardcoded data for initial setup and focuses on North America
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Comprehensive continent data
const continentsData = [
  { name: 'Africa', code: 'AF', slug: 'africa' },
  { name: 'Antarctica', code: 'AN', slug: 'antarctica' },
  { name: 'Asia', code: 'AS', slug: 'asia' },
  { name: 'Europe', code: 'EU', slug: 'europe' },
  { name: 'North America', code: 'NA', slug: 'north-america' },
  { name: 'Oceania', code: 'OC', slug: 'oceania' },
  { name: 'South America', code: 'SA', slug: 'south-america' }
];

// Comprehensive country data (focus on major countries)
const countriesData = [
  // North America
  { name: 'United States', officialName: 'United States of America', code2: 'US', code3: 'USA', numericCode: '840', slug: 'united-states', capital: 'Washington', currency: 'USD', languages: '["en"]', phoneCode: '1', continentCode: 'NA', latitude: 39.8283, longitude: -98.5795 },
  { name: 'Canada', officialName: 'Canada', code2: 'CA', code3: 'CAN', numericCode: '124', slug: 'canada', capital: 'Ottawa', currency: 'CAD', languages: '["en","fr"]', phoneCode: '1', continentCode: 'NA', latitude: 56.1304, longitude: -106.3468 },
  { name: 'Mexico', officialName: 'United Mexican States', code2: 'MX', code3: 'MEX', numericCode: '484', slug: 'mexico', capital: 'Mexico City', currency: 'MXN', languages: '["es"]', phoneCode: '52', continentCode: 'NA', latitude: 23.6345, longitude: -102.5528 },
  
  // Major global countries
  { name: 'United Kingdom', officialName: 'United Kingdom of Great Britain and Northern Ireland', code2: 'GB', code3: 'GBR', numericCode: '826', slug: 'united-kingdom', capital: 'London', currency: 'GBP', languages: '["en"]', phoneCode: '44', continentCode: 'EU', latitude: 55.3781, longitude: -3.4360 },
  { name: 'Germany', officialName: 'Federal Republic of Germany', code2: 'DE', code3: 'DEU', numericCode: '276', slug: 'germany', capital: 'Berlin', currency: 'EUR', languages: '["de"]', phoneCode: '49', continentCode: 'EU', latitude: 51.1657, longitude: 10.4515 },
  { name: 'France', officialName: 'French Republic', code2: 'FR', code3: 'FRA', numericCode: '250', slug: 'france', capital: 'Paris', currency: 'EUR', languages: '["fr"]', phoneCode: '33', continentCode: 'EU', latitude: 46.2276, longitude: 2.2137 },
  { name: 'Japan', officialName: 'Japan', code2: 'JP', code3: 'JPN', numericCode: '392', slug: 'japan', capital: 'Tokyo', currency: 'JPY', languages: '["ja"]', phoneCode: '81', continentCode: 'AS', latitude: 36.2048, longitude: 138.2529 },
  { name: 'China', officialName: 'People\'s Republic of China', code2: 'CN', code3: 'CHN', numericCode: '156', slug: 'china', capital: 'Beijing', currency: 'CNY', languages: '["zh"]', phoneCode: '86', continentCode: 'AS', latitude: 35.8617, longitude: 104.1954 },
  { name: 'India', officialName: 'Republic of India', code2: 'IN', code3: 'IND', numericCode: '356', slug: 'india', capital: 'New Delhi', currency: 'INR', languages: '["hi","en"]', phoneCode: '91', continentCode: 'AS', latitude: 20.5937, longitude: 78.9629 },
  { name: 'Australia', officialName: 'Commonwealth of Australia', code2: 'AU', code3: 'AUS', numericCode: '036', slug: 'australia', capital: 'Canberra', currency: 'AUD', languages: '["en"]', phoneCode: '61', continentCode: 'OC', latitude: -25.2744, longitude: 133.7751 },
  { name: 'Brazil', officialName: 'Federative Republic of Brazil', code2: 'BR', code3: 'BRA', numericCode: '076', slug: 'brazil', capital: 'Brasília', currency: 'BRL', languages: '["pt"]', phoneCode: '55', continentCode: 'SA', latitude: -14.2350, longitude: -51.9253 }
];

// US States data
const usStatesData = [
  { name: 'Alabama', code: 'AL', slug: 'alabama', capital: 'Montgomery', type: 'state' },
  { name: 'Alaska', code: 'AK', slug: 'alaska', capital: 'Juneau', type: 'state' },
  { name: 'Arizona', code: 'AZ', slug: 'arizona', capital: 'Phoenix', type: 'state' },
  { name: 'Arkansas', code: 'AR', slug: 'arkansas', capital: 'Little Rock', type: 'state' },
  { name: 'California', code: 'CA', slug: 'california', capital: 'Sacramento', type: 'state' },
  { name: 'Colorado', code: 'CO', slug: 'colorado', capital: 'Denver', type: 'state' },
  { name: 'Connecticut', code: 'CT', slug: 'connecticut', capital: 'Hartford', type: 'state' },
  { name: 'Delaware', code: 'DE', slug: 'delaware', capital: 'Dover', type: 'state' },
  { name: 'Florida', code: 'FL', slug: 'florida', capital: 'Tallahassee', type: 'state' },
  { name: 'Georgia', code: 'GA', slug: 'georgia', capital: 'Atlanta', type: 'state' },
  { name: 'Hawaii', code: 'HI', slug: 'hawaii', capital: 'Honolulu', type: 'state' },
  { name: 'Idaho', code: 'ID', slug: 'idaho', capital: 'Boise', type: 'state' },
  { name: 'Illinois', code: 'IL', slug: 'illinois', capital: 'Springfield', type: 'state' },
  { name: 'Indiana', code: 'IN', slug: 'indiana', capital: 'Indianapolis', type: 'state' },
  { name: 'Iowa', code: 'IA', slug: 'iowa', capital: 'Des Moines', type: 'state' },
  { name: 'Kansas', code: 'KS', slug: 'kansas', capital: 'Topeka', type: 'state' },
  { name: 'Kentucky', code: 'KY', slug: 'kentucky', capital: 'Frankfort', type: 'state' },
  { name: 'Louisiana', code: 'LA', slug: 'louisiana', capital: 'Baton Rouge', type: 'state' },
  { name: 'Maine', code: 'ME', slug: 'maine', capital: 'Augusta', type: 'state' },
  { name: 'Maryland', code: 'MD', slug: 'maryland', capital: 'Annapolis', type: 'state' },
  { name: 'Massachusetts', code: 'MA', slug: 'massachusetts', capital: 'Boston', type: 'state' },
  { name: 'Michigan', code: 'MI', slug: 'michigan', capital: 'Lansing', type: 'state' },
  { name: 'Minnesota', code: 'MN', slug: 'minnesota', capital: 'Saint Paul', type: 'state' },
  { name: 'Mississippi', code: 'MS', slug: 'mississippi', capital: 'Jackson', type: 'state' },
  { name: 'Missouri', code: 'MO', slug: 'missouri', capital: 'Jefferson City', type: 'state' },
  { name: 'Montana', code: 'MT', slug: 'montana', capital: 'Helena', type: 'state' },
  { name: 'Nebraska', code: 'NE', slug: 'nebraska', capital: 'Lincoln', type: 'state' },
  { name: 'Nevada', code: 'NV', slug: 'nevada', capital: 'Carson City', type: 'state' },
  { name: 'New Hampshire', code: 'NH', slug: 'new-hampshire', capital: 'Concord', type: 'state' },
  { name: 'New Jersey', code: 'NJ', slug: 'new-jersey', capital: 'Trenton', type: 'state' },
  { name: 'New Mexico', code: 'NM', slug: 'new-mexico', capital: 'Santa Fe', type: 'state' },
  { name: 'New York', code: 'NY', slug: 'new-york', capital: 'Albany', type: 'state' },
  { name: 'North Carolina', code: 'NC', slug: 'north-carolina', capital: 'Raleigh', type: 'state' },
  { name: 'North Dakota', code: 'ND', slug: 'north-dakota', capital: 'Bismarck', type: 'state' },
  { name: 'Ohio', code: 'OH', slug: 'ohio', capital: 'Columbus', type: 'state' },
  { name: 'Oklahoma', code: 'OK', slug: 'oklahoma', capital: 'Oklahoma City', type: 'state' },
  { name: 'Oregon', code: 'OR', slug: 'oregon', capital: 'Salem', type: 'state' },
  { name: 'Pennsylvania', code: 'PA', slug: 'pennsylvania', capital: 'Harrisburg', type: 'state' },
  { name: 'Rhode Island', code: 'RI', slug: 'rhode-island', capital: 'Providence', type: 'state' },
  { name: 'South Carolina', code: 'SC', slug: 'south-carolina', capital: 'Columbia', type: 'state' },
  { name: 'South Dakota', code: 'SD', slug: 'south-dakota', capital: 'Pierre', type: 'state' },
  { name: 'Tennessee', code: 'TN', slug: 'tennessee', capital: 'Nashville', type: 'state' },
  { name: 'Texas', code: 'TX', slug: 'texas', capital: 'Austin', type: 'state' },
  { name: 'Utah', code: 'UT', slug: 'utah', capital: 'Salt Lake City', type: 'state' },
  { name: 'Vermont', code: 'VT', slug: 'vermont', capital: 'Montpelier', type: 'state' },
  { name: 'Virginia', code: 'VA', slug: 'virginia', capital: 'Richmond', type: 'state' },
  { name: 'Washington', code: 'WA', slug: 'washington', capital: 'Olympia', type: 'state' },
  { name: 'West Virginia', code: 'WV', slug: 'west-virginia', capital: 'Charleston', type: 'state' },
  { name: 'Wisconsin', code: 'WI', slug: 'wisconsin', capital: 'Madison', type: 'state' },
  { name: 'Wyoming', code: 'WY', slug: 'wyoming', capital: 'Cheyenne', type: 'state' },
  { name: 'District of Columbia', code: 'DC', slug: 'district-of-columbia', capital: 'Washington', type: 'federal_district' }
];

// Canadian Provinces and Territories
const canadianProvincesData = [
  { name: 'Alberta', code: 'AB', slug: 'alberta', capital: 'Edmonton', type: 'province' },
  { name: 'British Columbia', code: 'BC', slug: 'british-columbia', capital: 'Victoria', type: 'province' },
  { name: 'Manitoba', code: 'MB', slug: 'manitoba', capital: 'Winnipeg', type: 'province' },
  { name: 'New Brunswick', code: 'NB', slug: 'new-brunswick', capital: 'Fredericton', type: 'province' },
  { name: 'Newfoundland and Labrador', code: 'NL', slug: 'newfoundland-and-labrador', capital: 'St. John\'s', type: 'province' },
  { name: 'Northwest Territories', code: 'NT', slug: 'northwest-territories', capital: 'Yellowknife', type: 'territory' },
  { name: 'Nova Scotia', code: 'NS', slug: 'nova-scotia', capital: 'Halifax', type: 'province' },
  { name: 'Nunavut', code: 'NU', slug: 'nunavut', capital: 'Iqaluit', type: 'territory' },
  { name: 'Ontario', code: 'ON', slug: 'ontario', capital: 'Toronto', type: 'province' },
  { name: 'Prince Edward Island', code: 'PE', slug: 'prince-edward-island', capital: 'Charlottetown', type: 'province' },
  { name: 'Quebec', code: 'QC', slug: 'quebec', capital: 'Quebec City', type: 'province' },
  { name: 'Saskatchewan', code: 'SK', slug: 'saskatchewan', capital: 'Regina', type: 'province' },
  { name: 'Yukon', code: 'YT', slug: 'yukon', capital: 'Whitehorse', type: 'territory' }
];

// Sample major cities for North America
const majorCitiesData = [
  // US Major Cities
  { name: 'New York', type: 'city', countryCode: 'US', stateCode: 'NY', latitude: 40.7128, longitude: -74.0060, population: 8336817, isMetropolitan: true },
  { name: 'Los Angeles', type: 'city', countryCode: 'US', stateCode: 'CA', latitude: 34.0522, longitude: -118.2437, population: 3979576, isMetropolitan: true },
  { name: 'Chicago', type: 'city', countryCode: 'US', stateCode: 'IL', latitude: 41.8781, longitude: -87.6298, population: 2693976, isMetropolitan: true },
  { name: 'Houston', type: 'city', countryCode: 'US', stateCode: 'TX', latitude: 29.7604, longitude: -95.3698, population: 2320268, isMetropolitan: true },
  { name: 'Phoenix', type: 'city', countryCode: 'US', stateCode: 'AZ', latitude: 33.4484, longitude: -112.0740, population: 1608139, isMetropolitan: true },
  { name: 'Philadelphia', type: 'city', countryCode: 'US', stateCode: 'PA', latitude: 39.9526, longitude: -75.1652, population: 1584064, isMetropolitan: true },
  { name: 'San Antonio', type: 'city', countryCode: 'US', stateCode: 'TX', latitude: 29.4241, longitude: -98.4936, population: 1547253, isMetropolitan: true },
  { name: 'San Diego', type: 'city', countryCode: 'US', stateCode: 'CA', latitude: 32.7157, longitude: -117.1611, population: 1423851, isMetropolitan: true },
  { name: 'Dallas', type: 'city', countryCode: 'US', stateCode: 'TX', latitude: 32.7767, longitude: -96.7970, population: 1343573, isMetropolitan: true },
  { name: 'San Jose', type: 'city', countryCode: 'US', stateCode: 'CA', latitude: 37.3382, longitude: -121.8863, population: 1021795, isMetropolitan: true },
  { name: 'Austin', type: 'city', countryCode: 'US', stateCode: 'TX', latitude: 30.2672, longitude: -97.7431, population: 978908, isMetropolitan: true, isCapital: true },
  { name: 'Jacksonville', type: 'city', countryCode: 'US', stateCode: 'FL', latitude: 30.3322, longitude: -81.6557, population: 911507 },
  { name: 'Fort Worth', type: 'city', countryCode: 'US', stateCode: 'TX', latitude: 32.7555, longitude: -97.3308, population: 909585 },
  { name: 'Columbus', type: 'city', countryCode: 'US', stateCode: 'OH', latitude: 39.9612, longitude: -82.9988, population: 898553, isCapital: true },
  { name: 'San Francisco', type: 'city', countryCode: 'US', stateCode: 'CA', latitude: 37.7749, longitude: -122.4194, population: 881549, isMetropolitan: true },
  
  // Canadian Major Cities
  { name: 'Toronto', type: 'city', countryCode: 'CA', stateCode: 'ON', latitude: 43.6532, longitude: -79.3832, population: 2794356, isMetropolitan: true, isCapital: true },
  { name: 'Montreal', type: 'city', countryCode: 'CA', stateCode: 'QC', latitude: 45.5017, longitude: -73.5673, population: 1762949, isMetropolitan: true },
  { name: 'Calgary', type: 'city', countryCode: 'CA', stateCode: 'AB', latitude: 51.0447, longitude: -114.0719, population: 1336000, isMetropolitan: true },
  { name: 'Ottawa', type: 'city', countryCode: 'CA', stateCode: 'ON', latitude: 45.4215, longitude: -75.6972, population: 1017449, isCapital: true },
  { name: 'Edmonton', type: 'city', countryCode: 'CA', stateCode: 'AB', latitude: 53.5461, longitude: -113.4938, population: 981280, isCapital: true },
  { name: 'Mississauga', type: 'city', countryCode: 'CA', stateCode: 'ON', latitude: 43.5890, longitude: -79.6441, population: 717961 },
  { name: 'Winnipeg', type: 'city', countryCode: 'CA', stateCode: 'MB', latitude: 49.8951, longitude: -97.1384, population: 749534, isCapital: true },
  { name: 'Vancouver', type: 'city', countryCode: 'CA', stateCode: 'BC', latitude: 49.2827, longitude: -123.1207, population: 695263, isMetropolitan: true },
  { name: 'Brampton', type: 'city', countryCode: 'CA', stateCode: 'ON', latitude: 43.7315, longitude: -79.7624, population: 656480 },
  { name: 'Hamilton', type: 'city', countryCode: 'CA', stateCode: 'ON', latitude: 43.2557, longitude: -79.8711, population: 569353 },
  
  // Mexican Major Cities
  { name: 'Mexico City', type: 'city', countryCode: 'MX', stateCode: 'DF', latitude: 19.4326, longitude: -99.1332, population: 9209944, isMetropolitan: true, isCapital: true },
  { name: 'Guadalajara', type: 'city', countryCode: 'MX', stateCode: 'JAL', latitude: 20.6597, longitude: -103.3496, population: 1385629, isMetropolitan: true },
  { name: 'Monterrey', type: 'city', countryCode: 'MX', stateCode: 'NL', latitude: 25.6866, longitude: -100.3161, population: 1135512, isMetropolitan: true },
  { name: 'Puebla', type: 'city', countryCode: 'MX', stateCode: 'PUE', latitude: 19.0414, longitude: -98.2063, population: 1692181 },
  { name: 'Tijuana', type: 'city', countryCode: 'MX', stateCode: 'BC', latitude: 32.5149, longitude: -117.0382, population: 1810645 }
];

async function importContinents() {
  console.log('🌍 Importing continents...');
  
  for (const continent of continentsData) {
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

async function importCountries() {
  console.log('\n🏳️ Importing countries...');
  
  for (const country of countriesData) {
    try {
      // Get continent ID
      const continent = await prisma.continent.findUnique({
        where: { code: country.continentCode }
      });
      
      if (!continent) {
        console.log(`⚠️  Continent not found: ${country.continentCode}`);
        continue;
      }

      const countryData = {
        name: country.name,
        officialName: country.officialName,
        code2: country.code2,
        code3: country.code3,
        numericCode: country.numericCode,
        slug: country.slug,
        capital: country.capital,
        currency: country.currency,
        languages: country.languages,
        phoneCode: country.phoneCode,
        latitude: country.latitude,
        longitude: country.longitude,
        continentId: continent.id,
        isActive: true
      };

      await prisma.country.upsert({
        where: { code2: country.code2 },
        update: countryData,
        create: countryData
      });
      
      console.log(`✅ Imported country: ${country.name} (${country.code2})`);
    } catch (error) {
      console.error(`❌ Error importing country ${country.name}:`, error.message);
    }
  }
}

async function importStates() {
  console.log('\n🏛️ Importing states and provinces...');
  
  // Import US States
  const usCountry = await prisma.country.findUnique({ where: { code2: 'US' } });
  if (usCountry) {
    for (const state of usStatesData) {
      try {
        await prisma.state.upsert({
          where: { 
            countryId_code: { 
              countryId: usCountry.id, 
              code: state.code 
            }
          },
          update: {
            name: state.name,
            officialName: state.name,
            type: state.type,
            slug: state.slug,
            capital: state.capital
          },
          create: {
            name: state.name,
            officialName: state.name,
            code: state.code,
            type: state.type,
            slug: state.slug,
            capital: state.capital,
            countryId: usCountry.id
          }
        });
        
        console.log(`✅ Imported US state: ${state.name} (${state.code})`);
      } catch (error) {
        console.error(`❌ Error importing US state ${state.name}:`, error.message);
      }
    }
  }
  
  // Import Canadian Provinces
  const canadaCountry = await prisma.country.findUnique({ where: { code2: 'CA' } });
  if (canadaCountry) {
    for (const province of canadianProvincesData) {
      try {
        await prisma.state.upsert({
          where: { 
            countryId_code: { 
              countryId: canadaCountry.id, 
              code: province.code 
            }
          },
          update: {
            name: province.name,
            officialName: province.name,
            type: province.type,
            slug: province.slug,
            capital: province.capital
          },
          create: {
            name: province.name,
            officialName: province.name,
            code: province.code,
            type: province.type,
            slug: province.slug,
            capital: province.capital,
            countryId: canadaCountry.id
          }
        });
        
        console.log(`✅ Imported Canadian province: ${province.name} (${province.code})`);
      } catch (error) {
        console.error(`❌ Error importing Canadian province ${province.name}:`, error.message);
      }
    }
  }
}

async function importMajorCities() {
  console.log('\n🏙️ Importing major cities...');
  
  for (const city of majorCitiesData) {
    try {
      // Get country
      const country = await prisma.country.findUnique({
        where: { code2: city.countryCode }
      });
      
      if (!country) {
        console.log(`⚠️  Country not found: ${city.countryCode}`);
        continue;
      }

      // Get state if available
      let state = null;
      if (city.stateCode) {
        state = await prisma.state.findFirst({
          where: {
            countryId: country.id,
            code: city.stateCode
          }
        });
      }

      const cityData = {
        name: city.name,
        officialName: city.name,
        type: city.type,
        slug: city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        latitude: city.latitude,
        longitude: city.longitude,
        population: city.population,
        populationYear: 2024,
        isCapital: city.isCapital || false,
        isMetropolitan: city.isMetropolitan || false,
        countryId: country.id,
        stateId: state?.id || null,
        isActive: true
      };

      const existingCity = await prisma.city.findFirst({
        where: {
          countryId: country.id,
          stateId: state?.id || null,
          slug: cityData.slug
        }
      });

      if (existingCity) {
        await prisma.city.update({
          where: { id: existingCity.id },
          data: cityData
        });
      } else {
        await prisma.city.create({
          data: cityData
        });
      }
      
      console.log(`✅ Imported city: ${city.name} (${city.countryCode})`);
    } catch (error) {
      console.error(`❌ Error importing city ${city.name}:`, error.message);
    }
  }
}

async function getStats() {
  const [continents, countries, states, cities] = await Promise.all([
    prisma.continent.count(),
    prisma.country.count(),
    prisma.state.count(),
    prisma.city.count()
  ]);
  
  return { continents, countries, states, cities };
}

async function main() {
  console.log('🌎 Starting geographic data import...\n');
  
  try {
    await importContinents();
    await importCountries();
    await importStates();
    await importMajorCities();
    
    const stats = await getStats();
    console.log('\n📊 Import Summary:');
    console.log(`   Continents: ${stats.continents}`);
    console.log(`   Countries: ${stats.countries}`);
    console.log(`   States/Provinces: ${stats.states}`);
    console.log(`   Cities: ${stats.cities}`);
    
    console.log('\n🎉 Geographic data import completed successfully!');
    console.log('\nNext steps:');
    console.log('1. You can expand the cities database by adding more data');
    console.log('2. Consider using the GeoNames API for additional cities');
    console.log('3. Add counties/administrative level 2 divisions');
    
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
  importContinents,
  importCountries,
  importStates,
  importMajorCities,
  getStats
};

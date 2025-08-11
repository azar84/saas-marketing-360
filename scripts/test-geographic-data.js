#!/usr/bin/env node

/**
 * Test Geographic Data in PostgreSQL Database
 * 
 * This script tests the current state of geographic data to identify
 * any issues with the migration from SQLite.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGeographicData() {
  try {
    console.log('🔍 Testing Geographic Data in PostgreSQL Database...');
    console.log('='.repeat(60));
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test basic counts
    console.log('\n📊 Testing Record Counts:');
    
    try {
      const continentCount = await prisma.continent.count();
      console.log(`   Continents: ${continentCount}`);
      
      const countryCount = await prisma.country.count();
      console.log(`   Countries: ${countryCount}`);
      
      const stateCount = await prisma.state.count();
      console.log(`   States: ${stateCount}`);
      
      const cityCount = await prisma.city.count();
      console.log(`   Cities: ${cityCount}`);
      
    } catch (error) {
      console.error('❌ Error counting records:', error.message);
    }
    
    // Test sample data retrieval
    console.log('\n🔍 Testing Sample Data Retrieval:');
    
    try {
      // Test continents
      const continents = await prisma.continent.findMany({ take: 3 });
      console.log(`   Sample Continents: ${continents.map(c => c.name).join(', ')}`);
      
      // Test countries
      const countries = await prisma.country.findMany({ 
        take: 3,
        include: { continent: true }
      });
      console.log(`   Sample Countries: ${countries.map(c => `${c.name} (${c.continent?.name})`).join(', ')}`);
      
      // Test states
      const states = await prisma.state.findMany({ 
        take: 3,
        include: { country: true }
      });
      console.log(`   Sample States: ${states.map(s => `${s.name} (${s.country?.name})`).join(', ')}`);
      
      // Test cities
      const cities = await prisma.city.findMany({ 
        take: 5,
        include: { 
          country: { select: { name: true } },
          state: { select: { name: true } }
        }
      });
      console.log(`   Sample Cities: ${cities.map(c => `${c.name} (${c.state?.name || 'No State'}, ${c.country?.name})`).join(', ')}`);
      
    } catch (error) {
      console.error('❌ Error retrieving sample data:', error.message);
    }
    
    // Test search functionality
    console.log('\n🔍 Testing Search Functionality:');
    
    try {
      // Test city search
      const searchResults = await prisma.city.findMany({
        where: {
          OR: [
            { name: { contains: 'New York' } },
            { name: { contains: 'Los Angeles' } },
            { name: { contains: 'Chicago' } }
          ]
        },
        take: 5,
        include: {
          country: { select: { name: true } },
          state: { select: { name: true } }
        }
      });
      
      console.log(`   Search Results for Major Cities: ${searchResults.length} found`);
      searchResults.forEach(city => {
        console.log(`     - ${city.name} (${city.state?.name || 'No State'}, ${city.country?.name})`);
      });
      
    } catch (error) {
      console.error('❌ Error testing search:', error.message);
    }
    
    // Test relationships
    console.log('\n🔗 Testing Relationships:');
    
    try {
      // Test city-state relationships
      const citiesWithStates = await prisma.city.findMany({
        where: { stateId: { not: null } },
        take: 3,
        include: {
          state: { select: { name: true, code: true } },
          country: { select: { name: true } }
        }
      });
      
      console.log(`   Cities with States: ${citiesWithStates.length} found`);
      citiesWithStates.forEach(city => {
        console.log(`     - ${city.name} → ${city.state?.name} (${city.state?.code}) in ${city.country?.name}`);
      });
      
      // Test cities without states
      const citiesWithoutStates = await prisma.city.findMany({
        where: { stateId: null },
        take: 3,
        include: {
          country: { select: { name: true } }
        }
      });
      
      console.log(`   Cities without States: ${citiesWithoutStates.length} found`);
      citiesWithoutStates.forEach(city => {
        console.log(`     - ${city.name} in ${city.country?.name}`);
      });
      
    } catch (error) {
      console.error('❌ Error testing relationships:', error.message);
    }
    
    // Test specific cities you mentioned
    console.log('\n🏙️ Testing Specific Cities:');
    
    const testCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    
    for (const cityName of testCities) {
      try {
        const city = await prisma.city.findFirst({
          where: { name: cityName },
          include: {
            country: { select: { name: true } },
            state: { select: { name: true } }
          }
        });
        
        if (city) {
          console.log(`   ✅ ${cityName}: Found in ${city.state?.name || 'No State'}, ${city.country?.name}`);
        } else {
          console.log(`   ❌ ${cityName}: Not found`);
        }
      } catch (error) {
        console.log(`   ⚠️ ${cityName}: Error searching - ${error.message}`);
      }
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('   - Check the counts above to see if data exists');
    console.log('   - Verify search functionality works');
    console.log('   - Ensure relationships are properly maintained');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testGeographicData()
  .then(() => {
    console.log('\n✅ Geographic data test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

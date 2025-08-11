#!/usr/bin/env node

/**
 * Test City Search Functionality
 * 
 * This script tests various city search scenarios to ensure
 * the search is working properly in the PostgreSQL database.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCitySearch() {
  try {
    console.log('🔍 Testing City Search Functionality...');
    console.log('='.repeat(50));
    
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test various search scenarios
    const searchTests = [
      'New York',
      'Los Angeles', 
      'Chicago',
      'Houston',
      'Phoenix',
      'Philadelphia',
      'San Antonio',
      'San Diego',
      'Dallas',
      'San Jose',
      'Miami',
      'Austin',
      'Jacksonville',
      'Fort Worth',
      'Columbus',
      'Charlotte',
      'San Francisco',
      'Indianapolis',
      'Seattle',
      'Denver'
    ];
    
    for (const searchTerm of searchTests) {
      console.log(`\n🔍 Searching for: "${searchTerm}"`);
      
      try {
        const results = await prisma.city.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { name: { startsWith: searchTerm, mode: 'insensitive' } }
            ]
          },
          take: 3,
          include: {
            country: { select: { name: true } },
            state: { select: { name: true } }
          },
          orderBy: [
            { name: { equals: searchTerm, mode: 'insensitive' } },
            { name: { startsWith: searchTerm, mode: 'insensitive' } },
            { population: 'desc' }
          ]
        });
        
        if (results.length > 0) {
          console.log(`   ✅ Found ${results.length} results:`);
          results.forEach((city, index) => {
            const location = city.state ? `${city.state.name}, ${city.country.name}` : city.country.name;
            console.log(`     ${index + 1}. ${city.name} (${location})`);
          });
        } else {
          console.log(`   ❌ No results found`);
        }
        
      } catch (error) {
        console.log(`   ⚠️  Search error: ${error.message}`);
      }
    }
    
    // Test partial searches
    console.log('\n🔍 Testing Partial Searches:');
    const partialTests = ['New', 'San', 'Los', 'Chi', 'Hou'];
    
    for (const partial of partialTests) {
      try {
        const results = await prisma.city.findMany({
          where: {
            name: { startsWith: partial, mode: 'insensitive' }
          },
          take: 5,
          include: {
            country: { select: { name: true } },
            state: { select: { name: true } }
          },
          orderBy: { population: 'desc' }
        });
        
        console.log(`   "${partial}": ${results.length} cities found`);
        results.slice(0, 3).forEach(city => {
          const location = city.state ? `${city.state.name}, ${city.country.name}` : city.country.name;
          console.log(`     - ${city.name} (${location})`);
        });
        
      } catch (error) {
        console.log(`   "${partial}": Error - ${error.message}`);
      }
    }
    
    // Test state-specific searches
    console.log('\n🔍 Testing State-Specific Searches:');
    const stateTests = [
      { state: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego'] },
      { state: 'Texas', cities: ['Houston', 'Dallas', 'San Antonio'] },
      { state: 'New York', cities: ['New York', 'Buffalo', 'Rochester'] }
    ];
    
    for (const test of stateTests) {
      console.log(`\n   State: ${test.state}`);
      
      for (const cityName of test.cities) {
        try {
          const city = await prisma.city.findFirst({
            where: {
              name: cityName,
              state: { name: test.state }
            },
            include: {
              country: { select: { name: true } },
              state: { select: { name: true, code: true } }
            }
          });
          
          if (city) {
            console.log(`     ✅ ${cityName}: Found in ${city.state.code}`);
          } else {
            console.log(`     ❌ ${cityName}: Not found in ${test.state}`);
          }
        } catch (error) {
          console.log(`     ⚠️  ${cityName}: Error - ${error.message}`);
        }
      }
    }
    
    console.log('\n🎯 Search Test Summary:');
    console.log('   - All major cities should be found');
    console.log('   - Partial searches should work');
    console.log('   - State-specific searches should work');
    console.log('   - Case-insensitive search should work');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCitySearch()
  .then(() => {
    console.log('\n✅ City search test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

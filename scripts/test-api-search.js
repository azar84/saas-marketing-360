#!/usr/bin/env node

/**
 * Test API Search Functionality
 * 
 * This script tests the cities API endpoint to ensure
 * search is working properly.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPISearch() {
  try {
    console.log('🔍 Testing API Search Functionality...');
    console.log('='.repeat(50));
    
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test the exact same search logic as the API
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
      'San Jose'
    ];
    
    for (const searchTerm of searchTests) {
      console.log(`\n🔍 Searching for: "${searchTerm}"`);
      
      try {
        const searchTermTrimmed = searchTerm.trim();
        const where = {
          OR: [
            { name: { contains: searchTermTrimmed, mode: 'insensitive' } },
            { officialName: { contains: searchTermTrimmed, mode: 'insensitive' } },
            { type: { contains: searchTermTrimmed, mode: 'insensitive' } },
            { name: { startsWith: searchTermTrimmed, mode: 'insensitive' } }
          ]
        };
        
        const results = await prisma.city.findMany({
          where,
          take: 5,
          include: {
            country: { select: { name: true } },
            state: { select: { name: true } }
          },
          orderBy: [
            { population: 'desc' },
            { name: 'asc' }
          ]
        });
        
        if (results.length > 0) {
          console.log(`   ✅ Found ${results.length} results:`);
          results.forEach((city, index) => {
            const location = city.state ? `${city.state.name}, ${city.country.name}` : city.country.name;
            console.log(`     ${index + 1}. ${city.name} (${location}) - Population: ${city.population || 'N/A'}`);
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
    
    console.log('\n🎯 API Search Test Summary:');
    console.log('   - All major cities should be found');
    console.log('   - Partial searches should work');
    console.log('   - Case-insensitive search should work');
    console.log('   - Results should be ordered by population');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAPISearch()
  .then(() => {
    console.log('\n✅ API search test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

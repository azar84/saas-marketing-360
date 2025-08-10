#!/usr/bin/env node

/**
 * Test script for geographic data import
 * This script tests the import functionality step by step
 */

const { 
  importContinents, 
  importCountries, 
  importStates, 
  getImportStats 
} = require('./import-geographic-data');

async function testImport() {
  console.log('🧪 Testing geographic data import...\n');
  
  try {
    // Step 1: Import continents
    console.log('Step 1: Testing continent import...');
    await importContinents();
    
    // Step 2: Import countries
    console.log('\nStep 2: Testing country import...');
    await importCountries();
    
    // Step 3: Import states (North America focus)
    console.log('\nStep 3: Testing states/provinces import...');
    await importStates();
    
    // Get statistics
    const stats = await getImportStats();
    console.log('\n📊 Current Database Stats:');
    console.log(`   Continents: ${stats.continents}`);
    console.log(`   Countries: ${stats.countries}`);
    console.log(`   States/Provinces: ${stats.states}`);
    console.log(`   Cities: ${stats.cities}`);
    
    console.log('\n✅ Test import completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: node scripts/import-geographic-data.js --cities');
    console.log('2. This will import cities with population > 1000 worldwide');
    console.log('3. North American cities with population > 100 will be included');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testImport().catch(console.error);
}

module.exports = { testImport };

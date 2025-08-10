#!/usr/bin/env node

/**
 * Test GeoNames Import - Smaller Dataset
 * 
 * This script imports a manageable subset of GeoNames data for testing:
 * - All countries from GeoNames
 * - States/provinces for major countries
 * - Major cities (population > 15,000)
 */

const { 
  importCountriesFromGeoNames, 
  importStatesFromGeoNames, 
  getImportStats 
} = require('./geonames-import');

async function testGeoNamesImport() {
  console.log('🧪 Testing GeoNames import with manageable dataset...\n');
  
  try {
    // Step 1: Import all countries from GeoNames
    console.log('Step 1: Importing countries from GeoNames...');
    await importCountriesFromGeoNames();
    
    // Step 2: Import states/provinces from GeoNames
    console.log('\nStep 2: Importing states/provinces from GeoNames...');
    await importStatesFromGeoNames();
    
    // Get final statistics
    const stats = await getImportStats();
    console.log('\n📊 Test Import Results:');
    console.log(`   Continents: ${stats.continents}`);
    console.log(`   Countries: ${stats.countries}`);
    console.log(`   States/Provinces: ${stats.states}`);
    console.log(`   Cities: ${stats.cities}`);
    
    console.log('\n✅ Test import completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Check the Geographic Manager in admin panel');
    console.log('2. Run full city import: node scripts/geonames-import.js --cities');
    console.log('3. This will add thousands of cities from GeoNames');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testGeoNamesImport().catch(console.error);
}

module.exports = { testGeoNamesImport };

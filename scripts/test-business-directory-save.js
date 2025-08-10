#!/usr/bin/env node

/**
 * Test script for business directory saving functionality
 * Tests both dry run and live save modes
 */

const mockSearchResults = [
  {
    title: "ABC Manufacturing Company - Industrial Solutions",
    url: "https://abcmanufacturing.com",
    description: "Leading manufacturer of industrial equipment and solutions. Serving the manufacturing industry with innovative products.",
    displayUrl: "abcmanufacturing.com"
  },
  {
    title: "XYZ Industrial Supplies - Best Industrial Equipment",
    url: "https://xyzsupplies.com",
    description: "Comprehensive industrial supplies and equipment. Find the best tools and materials for your business needs.",
    displayUrl: "xyzsupplies.com"
  },
  {
    title: "Industrial Directory - Top Manufacturing Companies",
    url: "https://industrialdirectory.com",
    description: "Directory of leading manufacturing companies and industrial suppliers. Browse our comprehensive listings.",
    displayUrl: "industrialdirectory.com"
  }
];

async function testBusinessDirectorySave() {
  console.log('🧪 Testing Business Directory Save Functionality\n');

  // Test 1: Dry Run Mode (default)
  console.log('📋 Test 1: Dry Run Mode (No Save)');
  console.log('=' .repeat(50));
  
  try {
    const dryRunResponse = await fetch('http://localhost:3000/api/admin/industry-search/process-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchResults: mockSearchResults,
        industry: 'Manufacturing',
        location: 'New York',
        minConfidence: 0.7,
        dryRun: true
      })
    });

    if (!dryRunResponse.ok) {
      throw new Error(`HTTP error! status: ${dryRunResponse.status}`);
    }

    const dryRunData = await dryRunResponse.json();
    
    if (dryRunData.success) {
      console.log('✅ Dry run successful');
      console.log(`📊 Businesses processed: ${dryRunData.data?.saved || 0}`);
      console.log(`🔍 Chain processing: ${dryRunData.data?.chainProcessing?.totalProcessed || 0} total`);
      console.log(`🏢 Company websites: ${dryRunData.data?.chainProcessing?.companyWebsites || 0}`);
      console.log(`📁 Directories: ${dryRunData.data?.chainProcessing?.directories || 0}`);
      
      if (dryRunData.data?.details?.created) {
        console.log('\n📝 Would create (dry run):');
        dryRunData.data.details.created.forEach((website, index) => {
          console.log(`  ${index + 1}. ${website}`);
        });
      }
    } else {
      console.error('❌ Dry run failed:', dryRunData.error);
    }
  } catch (error) {
    console.error('❌ Dry run test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Live Save Mode
  console.log('💾 Test 2: Live Save Mode (Actual Save)');
  console.log('=' .repeat(50));
  
  try {
    const liveSaveResponse = await fetch('http://localhost:3000/api/admin/industry-search/process-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchResults: mockSearchResults,
        industry: 'Manufacturing',
        location: 'New York',
        minConfidence: 0.7,
        dryRun: false
      })
    });

    if (!liveSaveResponse.ok) {
      throw new Error(`HTTP error! status: ${liveSaveResponse.status}`);
    }

    const liveSaveData = await liveSaveResponse.json();
    
    if (liveSaveData.success) {
      console.log('✅ Live save successful');
      console.log(`📊 Businesses saved: ${liveSaveData.data?.saved || 0}`);
      console.log(`🔍 Chain processing: ${liveSaveData.data?.chainProcessing?.totalProcessed || 0} total`);
      console.log(`🏢 Company websites: ${liveSaveData.data?.chainProcessing?.companyWebsites || 0}`);
      console.log(`📁 Directories: ${liveSaveData.data?.chainProcessing?.directories || 0}`);
      
      if (liveSaveData.data?.details?.created) {
        console.log('\n✅ Actually created:');
        liveSaveData.data.details.created.forEach((website, index) => {
          console.log(`  ${index + 1}. ${website}`);
        });
      }
      
      if (liveSaveData.data?.details?.updated) {
        console.log('\n🔄 Updated:');
        liveSaveData.data.details.updated.forEach((website, index) => {
          console.log(`  ${index + 1}. ${website}`);
        });
      }
    } else {
      console.error('❌ Live save failed:', liveSaveData.error);
    }
  } catch (error) {
    console.error('❌ Live save test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Business Directory Save Test Completed!');
  console.log('\n💡 Key Features Tested:');
  console.log('  • Dry Run Mode: Process without saving');
  console.log('  • Live Save Mode: Process and save to database');
  console.log('  • LLM Chain Integration: Business classification');
  console.log('  • Business Directory: Database storage');
}

// Run the test
testBusinessDirectorySave().catch(console.error);

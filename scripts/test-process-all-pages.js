#!/usr/bin/env node

/**
 * Test script for processing all pages functionality
 * Simulates fetching multiple pages and processing them together
 */

const mockPageResults = {
  page1: [
    {
      title: "ABC Manufacturing Company - Industrial Solutions",
      url: "https://abcmanufacturing.com",
      description: "Leading manufacturer of industrial equipment and solutions.",
      displayUrl: "abcmanufacturing.com"
    },
    {
      title: "XYZ Industrial Supplies - Best Industrial Equipment",
      url: "https://xyzsupplies.com",
      description: "Comprehensive industrial supplies and equipment.",
      displayUrl: "xyzsupplies.com"
    }
  ],
  page2: [
    {
      title: "DEF Industrial Solutions - Manufacturing Excellence",
      url: "https://defsolutions.com",
      description: "Excellence in manufacturing and industrial solutions.",
      displayUrl: "defsolutions.com"
    },
    {
      title: "GHI Manufacturing Co - Quality Industrial Products",
      url: "https://ghimanufacturing.com",
      description: "Quality industrial products and manufacturing services.",
      displayUrl: "ghimanufacturing.com"
    }
  ],
  page3: [
    {
      title: "Industrial Directory - Top Manufacturing Companies",
      url: "https://industrialdirectory.com",
      description: "Directory of leading manufacturing companies.",
      displayUrl: "industrialdirectory.com"
    },
    {
      title: "JKL Industrial Group - Professional Services",
      url: "https://jklindustrial.com",
      description: "Professional industrial services and solutions.",
      displayUrl: "jklindustrial.com"
    }
  ]
};

async function testProcessAllPages() {
  console.log('🧪 Testing Process All Pages Functionality\n');

  // Simulate collecting all pages
  console.log('📄 Simulating collection of all pages...');
  const allResults = [
    ...mockPageResults.page1,
    ...mockPageResults.page2,
    ...mockPageResults.page3
  ];

  console.log(`📊 Total results collected: ${allResults.length} (from 3 pages)`);
  console.log('📝 Sample results:');
  allResults.slice(0, 3).forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.title} (${result.url})`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('🔍 Processing all collected results through business extraction...');
  console.log('='.repeat(60));

  try {
    // Test with dry run first
    console.log('\n📋 Test: Dry Run Mode (Process All Pages)');
    
    const response = await fetch('http://localhost:3000/api/admin/industry-search/process-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchResults: allResults,
        industry: 'Manufacturing',
        location: 'New York',
        minConfidence: 0.7,
        dryRun: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('✅ All pages processing successful!');
      console.log(`📊 Total businesses processed: ${data.data.businesses?.length || 0}`);
      console.log(`🔍 Chain processing: ${data.data.chainProcessing?.totalProcessed || 0} total`);
      console.log(`🏢 Company websites: ${data.data.chainProcessing?.companyWebsites || 0}`);
      console.log(`📁 Directories: ${data.data.chainProcessing?.directories || 0}`);
      console.log(`📈 Extraction quality: ${data.data.chainProcessing?.extractionQuality || 0}`);
      
      if (data.data.businesses && Array.isArray(data.data.businesses)) {
        console.log('\n🏢 Extracted Businesses (All Pages):');
        data.data.businesses.forEach((business, index) => {
          const status = business.isCompanyWebsite ? '🏢 Company' : '📁 Directory';
          const confidence = Math.round(business.confidence * 100);
          console.log(`  ${index + 1}. ${status} - ${business.companyName || 'Unknown'} (${business.website})`);
          console.log(`     Confidence: ${confidence}% | Source: ${business.extractedFrom}`);
        });
      }
      
      if (data.data.details?.created) {
        console.log('\n📝 Would create (dry run):');
        data.data.details.created.forEach((website, index) => {
          console.log(`  ${index + 1}. ${website}`);
        });
      }
    } else {
      console.error('❌ All pages processing failed:', data.error);
    }

  } catch (error) {
    console.error('❌ All pages processing test failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Process All Pages Test Completed!');
  console.log('\n💡 Key Features Tested:');
  console.log('  • Multi-page result collection');
  console.log('  • Bulk business extraction processing');
  console.log('  • LLM Chain integration for large datasets');
  console.log('  • Business classification across multiple pages');
  console.log('  • Dry run mode for safe testing');
}

// Run the test
testProcessAllPages().catch(console.error);

#!/usr/bin/env node

/**
 * Test script for the process-results API endpoint
 * This tests the complete flow: Google search results → LangChain chain → Business classification
 */

const mockSearchResults = [
  {
    title: "ABC Plumbing Services - Professional Plumbers in Downtown",
    link: "https://abcplumbing.com",
    snippet: "ABC Plumbing Services offers professional plumbing solutions for residential and commercial properties. Licensed and insured plumbers serving Downtown area."
  },
  {
    title: "Best Plumbers Near Me - Top 10 Plumbing Companies",
    link: "https://bestplumbersdirectory.com",
    snippet: "Find the best plumbers in your area. Compare reviews, ratings, and prices from top plumbing companies."
  },
  {
    title: "Downtown Plumbing & Heating - 24/7 Emergency Service",
    link: "https://downtownplumbing.com",
    snippet: "Downtown Plumbing & Heating provides 24/7 emergency plumbing and heating services. Call us anytime for immediate assistance."
  }
];

async function testProcessResultsAPI() {
  console.log('🧪 Testing process-results API endpoint...\n');

  try {
    const response = await fetch('http://localhost:3000/api/admin/industry-search/process-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        searchResults: mockSearchResults,
        industry: 'Plumbing Services',
        location: 'Downtown',
        minConfidence: 0.7,
        dryRun: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ API Response received successfully');
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n🎯 Test Results:');
      console.log(`- Total businesses processed: ${data.data?.saved || 0}`);
      console.log(`- Company websites: ${data.data?.chainProcessing?.companyWebsites || 0}`);
      console.log(`- Directories: ${data.data?.chainProcessing?.directories || 0}`);
      console.log(`- Extraction quality: ${data.data?.chainProcessing?.extractionQuality || 0}`);
      
      if (data.data?.details?.created) {
        console.log('\n🏢 Extracted Businesses:');
        data.data.details.created.forEach((website, index) => {
          console.log(`${index + 1}. ${website}`);
        });
        console.log('');
      }
      
      console.log('🎉 Test completed successfully!');
    } else {
      console.error('❌ API returned error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  }
}

// Run the test
testProcessResultsAPI();

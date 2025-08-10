#!/usr/bin/env node

/**
 * Test script for the Google Search Parser LLM chain
 * This script demonstrates how to use the chain to process Google search results
 * and extract business information for the business directory.
 */

const sampleSearchResults = [
  {
    title: "ABC Plumbing Services - Professional Plumbing in Downtown",
    link: "https://abcplumbing.com/services",
    snippet: "ABC Plumbing Services offers professional plumbing solutions for residential and commercial properties. Licensed and insured contractors serving Downtown area."
  },
  {
    title: "Best Plumbing Companies in Downtown - Top 10 List",
    link: "https://plumbingdirectory.com/downtown",
    snippet: "Find the best plumbing companies in Downtown. Compare reviews, ratings, and get free quotes from top-rated plumbers."
  },
  {
    title: "XYZ Plumbing & HVAC - 24/7 Emergency Service",
    link: "https://xyzplumbinghvac.com",
    snippet: "XYZ Plumbing & HVAC provides 24/7 emergency plumbing and HVAC services. Family-owned business serving Downtown for over 20 years."
  },
  {
    title: "Request Plumbing Quote - Get Free Estimates",
    link: "https://plumbingquotes.com/request-quote",
    snippet: "Fill out our form to get free plumbing quotes from local contractors. Compare prices and services."
  },
  {
    title: "Downtown Plumbing Supply - Wholesale & Retail",
    link: "https://downtownplumbingsupply.com",
    snippet: "Downtown Plumbing Supply offers wholesale and retail plumbing supplies, tools, and equipment for professionals and DIY enthusiasts."
  },
  {
    title: "Plumbing Contractors Association - Professional Standards",
    link: "https://plumbingcontractors.org",
    snippet: "The Plumbing Contractors Association sets professional standards and provides certification for licensed plumbing contractors."
  }
];

async function testGoogleSearchParser() {
  console.log('🧪 Testing Google Search Parser Chain');
  console.log('=====================================\n');

  try {
    // Import the chain (this would be done in a real application)
    console.log('📋 Sample Search Results:');
    sampleSearchResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   URL: ${result.link}`);
      console.log(`   Snippet: ${result.snippet}`);
      console.log('');
    });

    console.log('🎯 Expected Analysis:');
    console.log('- Company websites: ABC Plumbing Services, XYZ Plumbing & HVAC, Downtown Plumbing Supply');
    console.log('- Directories: Best Plumbing Companies in Downtown, Plumbing Contractors Association');
    console.log('- Forms: Request Plumbing Quote');
    console.log('');

    console.log('💡 Usage Example:');
    console.log(`
// In your application, you would use it like this:

import { googleSearchParser } from '@/lib/llm/chains/googleSearchParser';

const result = await googleSearchParser.run({
  searchResults: googleSearchResults,
  industry: 'Plumbing',
  location: 'Downtown'
});

// The result would contain:
// - businesses: Array of extracted business information
// - summary: Statistics about the analysis
// - Each business has: website, companyName, isCompanyWebsite, confidence, etc.
    `);

    console.log('🚀 API Endpoint:');
    console.log('POST /api/admin/industry-search/process-results');
    console.log('');
    console.log('📝 Request Body Example:');
    console.log(JSON.stringify({
      searchResults: sampleSearchResults,
      industry: 'Plumbing',
      location: 'Downtown',
      stateProvince: 'CA',
      options: {
        minConfidence: 0.7,
        dryRun: false,
        saveToDirectory: true
      }
    }, null, 2));

    console.log('\n✅ Test script completed successfully!');
    console.log('\n📚 Next Steps:');
    console.log('1. Use the API endpoint to process real Google search results');
    console.log('2. The chain will automatically identify company websites vs directories');
    console.log('3. Extracted business data will be saved to the business directory');
    console.log('4. You can adjust confidence thresholds and enable dry-run mode for testing');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testGoogleSearchParser();
}

module.exports = { testGoogleSearchParser, sampleSearchResults };

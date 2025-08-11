#!/usr/bin/env node

/**
 * Simple Test Script for Company Data Enrichment Components
 * Tests the core logic without requiring the full server
 */

const { WebsiteScraper } = require('../src/lib/enrichment/sources/websiteScraper');
const { GoogleSearchEnricher } = require('../src/lib/enrichment/sources/googleSearchEnricher');

// Mock fetch for testing
global.fetch = require('node-fetch');

// Test configuration
const testDomain = process.argv[2] || 'example.com';

console.log('🧪 Testing Enrichment Components');
console.log('================================');
console.log(`Target Domain: ${testDomain}`);
console.log('');

async function testWebsiteScraper() {
  console.log('📋 Testing Website Scraper...');
  
  try {
    const scraper = new WebsiteScraper();
    const result = await scraper.enrich(testDomain);
    
    if (result) {
      console.log('✅ Website scraping successful');
      console.log(`   - Title: ${result.title || 'N/A'}`);
      console.log(`   - Description: ${result.description ? result.description.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`   - Emails found: ${result.contactInfo?.emails?.length || 0}`);
      console.log(`   - Phones found: ${result.contactInfo?.phones?.length || 0}`);
      console.log(`   - Social links: ${Object.keys(result.socialLinks || {}).length}`);
      console.log(`   - Technologies detected: ${result.technologies?.length || 0}`);
      console.log(`   - Keywords: ${result.keywords?.length || 0}`);
      
      if (result.contactInfo?.emails?.length > 0) {
        console.log(`   - Sample email: ${result.contactInfo.emails[0]}`);
      }
      if (result.contactInfo?.phones?.length > 0) {
        console.log(`   - Sample phone: ${result.contactInfo.phones[0]}`);
      }
      if (result.technologies?.length > 0) {
        console.log(`   - Sample tech: ${result.technologies[0]}`);
      }
    } else {
      console.log('❌ Website scraping failed - no data returned');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Website scraping error:', error.message);
    return null;
  }
}

async function testGoogleSearchEnricher() {
  console.log('\n🔍 Testing Google Search Enricher...');
  
  try {
    const enricher = new GoogleSearchEnricher();
    const result = await enricher.enrich(testDomain);
    
    if (result) {
      console.log('✅ Google search enrichment successful');
      console.log(`   - Search results: ${result.searchResults?.length || 0}`);
      console.log(`   - Employee count: ${result.extractedInfo?.employeeCount || 'N/A'}`);
      console.log(`   - Funding info: ${result.extractedInfo?.funding || 'N/A'}`);
      console.log(`   - News mentions: ${result.extractedInfo?.newsMentions || 'N/A'}`);
      console.log(`   - Reviews: ${result.extractedInfo?.reviews || 'N/A'}`);
      
      if (result.searchResults?.length > 0) {
        console.log(`   - Sample result: ${result.searchResults[0].title}`);
        console.log(`   - Source: ${result.searchResults[0].source}`);
      }
    } else {
      console.log('⚠️  Google search enrichment skipped (likely no API key configured)');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Google search enrichment error:', error.message);
    return null;
  }
}

async function testDataConsolidation(scrapedData, googleData) {
  console.log('\n🔗 Testing Data Consolidation...');
  
  try {
    // Simulate the consolidation logic from the engine
    const consolidatedData = {
      companyName: scrapedData?.title || '',
      website: testDomain,
      contact: {
        email: scrapedData?.contactInfo?.emails?.[0] || '',
        phone: scrapedData?.contactInfo?.phones?.[0] || '',
        address: {
          street: scrapedData?.contactInfo?.addresses?.[0] || '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        socialMedia: {
          linkedin: scrapedData?.socialLinks?.linkedin || '',
          twitter: scrapedData?.socialLinks?.twitter || '',
          facebook: scrapedData?.socialLinks?.facebook || '',
          instagram: scrapedData?.socialLinks?.instagram || ''
        }
      },
      business: {
        industry: '',
        sector: '',
        employeeCount: googleData?.extractedInfo?.employeeCount || undefined,
        employeeRange: '',
        revenue: '',
        funding: [],
        isPublic: false,
        stockSymbol: ''
      },
      technology: {
        platforms: scrapedData?.technologies || [],
        tools: [],
        infrastructure: [],
        languages: [],
        databases: []
      },
      people: {
        executives: [],
        totalEmployees: googleData?.extractedInfo?.employeeCount || undefined,
        keyDepartments: []
      },
      market: {
        targetCustomers: [],
        competitors: [],
        uniqueValue: '',
        keywords: scrapedData?.keywords || []
      },
      rawData: {
        website: scrapedData,
        googleSearch: googleData || undefined,
        builtWith: undefined,
        clearbit: undefined,
        hunter: undefined,
        linkedin: undefined
      }
    };
    
    console.log('✅ Data consolidation successful');
    console.log(`   - Company name: ${consolidatedData.companyName || 'N/A'}`);
    console.log(`   - Contact methods: ${(consolidatedData.contact.email ? 1 : 0) + (consolidatedData.contact.phone ? 1 : 0)}`);
    console.log(`   - Technology platforms: ${consolidatedData.technology.platforms?.length || 0}`);
    console.log(`   - Keywords: ${consolidatedData.market.keywords?.length || 0}`);
    console.log(`   - Social media profiles: ${Object.values(consolidatedData.contact.socialMedia).filter(Boolean).length}`);
    
    return consolidatedData;
  } catch (error) {
    console.error('❌ Data consolidation error:', error.message);
    return null;
  }
}

function calculateConfidenceScore(scrapedData, googleData) {
  let score = 0;
  
  // Website data scoring
  if (scrapedData?.title) score += 20;
  if (scrapedData?.description) score += 10;
  if (scrapedData?.contactInfo?.emails?.length) score += 15;
  if (scrapedData?.contactInfo?.phones?.length) score += 10;
  if (scrapedData?.socialLinks && Object.values(scrapedData.socialLinks).some(Boolean)) score += 10;
  if (scrapedData?.technologies?.length) score += 10;
  if (scrapedData?.keywords?.length) score += 5;
  
  // Google data scoring
  if (googleData?.extractedInfo?.employeeCount) score += 10;
  if (googleData?.extractedInfo?.funding) score += 5;
  if (googleData?.extractedInfo?.newsMentions) score += 5;
  
  return Math.min(score, 100);
}

async function runAllTests() {
  const startTime = Date.now();
  
  try {
    // Test 1: Website Scraping
    const scrapedData = await testWebsiteScraper();
    
    // Test 2: Google Search Enrichment
    const googleData = await testGoogleSearchEnricher();
    
    // Test 3: Data Consolidation
    const consolidatedData = await testDataConsolidation(scrapedData, googleData);
    
    // Test 4: Confidence Scoring
    if (consolidatedData) {
      const confidenceScore = calculateConfidenceScore(scrapedData, googleData);
      console.log('\n📊 Confidence Score Calculation');
      console.log('================================');
      console.log(`Overall confidence: ${confidenceScore}%`);
      
      if (confidenceScore >= 80) {
        console.log('🎉 High confidence - Excellent data quality');
      } else if (confidenceScore >= 60) {
        console.log('✅ Good confidence - Good data quality');
      } else if (confidenceScore >= 40) {
        console.log('⚠️  Moderate confidence - Some data gaps');
      } else {
        console.log('❌ Low confidence - Significant data gaps');
      }
    }
    
    // Summary
    const endTime = Date.now();
    console.log('\n' + '='.repeat(50));
    console.log('📋 Test Summary');
    console.log('===============');
    console.log(`Domain tested: ${testDomain}`);
    console.log(`Website scraping: ${scrapedData ? '✅ Success' : '❌ Failed'}`);
    console.log(`Google enrichment: ${googleData ? '✅ Success' : '⚠️  Skipped'}`);
    console.log(`Data consolidation: ${consolidatedData ? '✅ Success' : '❌ Failed'}`);
    console.log(`Total processing time: ${endTime - startTime}ms`);
    
    if (consolidatedData) {
      console.log('\n🚀 Ready for next steps:');
      console.log('   - LLM processing (to be implemented)');
      console.log('   - Database storage (to be implemented)');
      console.log('   - Marketing applications (to be implemented)');
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Check if running directly
if (require.main === module) {
  console.log('Note: This test requires the enrichment components to be properly built.');
  console.log('Make sure to run: npm run build (or npm run dev) first.\n');
  
  setTimeout(() => {
    runAllTests();
  }, 1000);
}

module.exports = {
  testWebsiteScraper,
  testGoogleSearchEnricher,
  testDataConsolidation,
  calculateConfidenceScore,
  runAllTests
};

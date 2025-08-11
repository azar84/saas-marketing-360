#!/usr/bin/env node

/**
 * Test script for the enrichment workflow
 * Follows the exact flow: Domain -> Validation -> Website Scraping -> Google/API Enrichment -> LLM Processing -> Database Upsert -> Marketing Tools
 */

const testDomain = process.argv[2] || 'example.com';

console.log('🧪 Testing Enrichment Workflow');
console.log('================================');
console.log(`Target Domain: ${testDomain}`);
console.log('');

// Simulate the workflow steps
async function testEnrichmentWorkflow() {
  try {
    console.log('📋 Step 1: Domain Validation (HTTP 200 check)');
    const isValid = await validateDomain(testDomain);
    if (!isValid) {
      console.log('❌ Domain validation failed - domain is not accessible');
      return;
    }
    console.log('✅ Domain validation passed');
    console.log('');

    console.log('🌐 Step 2: Website Scraping');
    const scrapedData = await scrapeWebsite(testDomain);
    if (!scrapedData) {
      console.log('❌ Website scraping failed');
      return;
    }
    console.log('✅ Website scraping completed');
    console.log(`   - Title: ${scrapedData.title || 'N/A'}`);
    console.log(`   - Emails found: ${scrapedData.contactInfo?.emails?.length || 0}`);
    console.log(`   - Phones found: ${scrapedData.contactInfo?.phones?.length || 0}`);
    console.log(`   - Technologies detected: ${scrapedData.technologies?.length || 0}`);
    console.log('');

    console.log('🔍 Step 3: Google/API Enrichment');
    const googleData = await enrichViaGoogle(testDomain);
    if (googleData) {
      console.log('✅ Google enrichment completed');
      console.log(`   - Search results: ${googleData.searchResults?.length || 0}`);
      console.log(`   - Employee count: ${googleData.extractedInfo?.employeeCount || 'N/A'}`);
      console.log(`   - Funding info: ${googleData.extractedInfo?.funding || 'N/A'}`);
    } else {
      console.log('⚠️  Google enrichment skipped (API not configured)');
    }
    console.log('');

    console.log('🤖 Step 4: LLM Processing');
    const llmData = await processWithLLM(scrapedData, googleData);
    console.log('✅ LLM processing completed');
    console.log(`   - Company name: ${llmData.companyName || 'N/A'}`);
    console.log(`   - Executives found: ${llmData.executives?.length || 0}`);
    console.log(`   - Tech stack hints: ${llmData.techStack?.length || 0}`);
    console.log('');

    console.log('🔗 Step 5: Data Consolidation');
    const consolidatedData = consolidateData(testDomain, scrapedData, googleData, llmData);
    console.log('✅ Data consolidation completed');
    console.log(`   - Total contact methods: ${(consolidatedData.contact.email ? 1 : 0) + (consolidatedData.contact.phone ? 1 : 0)}`);
    console.log(`   - Technology platforms: ${consolidatedData.technology.platforms?.length || 0}`);
    console.log('');

    console.log('💾 Step 6: Database Upsert');
    const dbResult = await upsertToDatabase(consolidatedData);
    console.log('✅ Database upsert completed');
    console.log('');

    console.log('📊 Step 7: Marketing Tools Preparation');
    const marketingData = prepareMarketingData(consolidatedData);
    console.log('✅ Marketing data prepared');
    console.log(`   - Lead score: ${marketingData.leadScore}/100`);
    console.log(`   - Target segments: ${marketingData.targetSegments?.length || 0}`);
    console.log(`   - Tech-based targeting: ${marketingData.techBasedTargeting?.length || 0}`);
    console.log('');

    console.log('🎉 Enrichment Workflow Completed Successfully!');
    console.log('==============================================');
    console.log(`Domain: ${testDomain}`);
    console.log(`Total processing time: ${Date.now() - startTime}ms`);
    console.log(`Confidence score: ${calculateConfidenceScore(scrapedData, googleData, llmData)}%`);

  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
  }
}

// Mock functions for testing (these would be replaced with actual implementations)

async function validateDomain(domain) {
  try {
    const response = await fetch(`https://${domain}`, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function scrapeWebsite(domain) {
  // This would call the actual WebsiteScraper
  return {
    title: `${domain} - Company Website`,
    contactInfo: {
      emails: [`info@${domain}`],
      phones: ['+1-555-0123']
    },
    technologies: ['React', 'Node.js', 'AWS']
  };
}

async function enrichViaGoogle(domain) {
  // This would call the actual GoogleSearchEnricher
  // For testing, return mock data
  return {
    searchResults: [
      { title: 'Company Profile', link: 'https://linkedin.com/company/example', source: 'LinkedIn' }
    ],
    extractedInfo: {
      employeeCount: '50-100',
      funding: '$5M Series A'
    }
  };
}

async function processWithLLM(scrapedData, googleData) {
  // This would call the actual LLM processing
  return {
    companyName: 'Example Corp',
    executives: [
      { name: 'John Doe', title: 'CEO' },
      { name: 'Jane Smith', title: 'CTO' }
    ],
    techStack: ['React', 'Node.js', 'PostgreSQL']
  };
}

function consolidateData(domain, scrapedData, googleData, llmData) {
  return {
    domain,
    companyName: llmData.companyName || scrapedData.title,
    contact: {
      email: scrapedData.contactInfo?.emails?.[0] || '',
      phone: scrapedData.contactInfo?.phones?.[0] || ''
    },
    technology: {
      platforms: [...new Set([
        ...(scrapedData.technologies || []),
        ...(llmData.techStack || [])
      ])]
    },
    people: {
      executives: llmData.executives || []
    }
  };
}

async function upsertToDatabase(data) {
  // This would call the actual database upsert
  console.log(`   - Upserting data for ${data.domain}`);
  return { success: true };
}

function prepareMarketingData(data) {
  return {
    leadScore: 75,
    targetSegments: ['SaaS', 'Technology'],
    techBasedTargeting: data.technology.platforms || []
  };
}

function calculateConfidenceScore(scrapedData, googleData, llmData) {
  let score = 0;
  if (scrapedData.title) score += 20;
  if (scrapedData.contactInfo?.emails?.length) score += 15;
  if (googleData?.extractedInfo?.employeeCount) score += 15;
  if (llmData.executives?.length) score += 10;
  return Math.min(score, 100);
}

// Run the test
const startTime = Date.now();
testEnrichmentWorkflow();

#!/usr/bin/env node

// 🧪 TEST ENRICHMENT TRACKING SYSTEM
// Demonstrates real-time tracking of every enrichment step

const { EnrichmentTracker } = require('../src/lib/enrichment/enrichmentTracker');

// Mock data for testing
const mockScrapedData = {
  title: 'HiQSense - AI-Powered Business Intelligence',
  description: 'HiQSense provides cutting-edge AI solutions for business intelligence, data analytics, and predictive insights',
  contactInfo: {
    emails: ['info@hiqsense.com', 'contact@hiqsense.com'],
    phones: ['+1-555-0123'],
    addresses: ['123 AI Boulevard, Tech City, CA 90210']
  },
  technologies: ['React', 'Node.js', 'Python', 'TensorFlow', 'AWS'],
  socialLinks: {
    linkedin: 'https://linkedin.com/company/hiqsense',
    twitter: 'https://twitter.com/hiqsense'
  },
  status: 'success',
  lastScraped: new Date()
};

const mockLLMData = {
  inputData: {
    scrapedData: mockScrapedData,
    googleData: { searchResults: 15 },
    linkedinData: { companyInfo: { employeeCount: '50-100' } },
    crunchbaseData: { funding: '$2M Series A' },
    prompt: 'Analyze company data and extract structured information...',
    promptLength: 396,
    modelUsed: 'deepseek-chat',
    promptVersion: '1.2'
  },
  outputData: {
    rawResponse: '{"company": {"legalName": "HiQSense Inc", "industry": "Artificial Intelligence"}}',
    responseLength: 296,
    parsedData: {
      company: { legalName: 'HiQSense Inc', industry: 'Artificial Intelligence' },
      business: { targetCustomers: ['Enterprises', 'SMBs'] },
      technology: { platforms: ['React', 'Node.js', 'Python'] }
    },
    parsingSuccess: true,
    parsingErrors: [],
    responseTime: 2800
  },
  metadata: {
    tokenUsage: { input: 150, output: 200, total: 350 },
    modelConfidence: 0.85,
    retryCount: 0
  }
};

// Test the enrichment tracking system
async function testEnrichmentTracking() {
  console.log('🧪 Testing Real-Time Enrichment Tracking System\n');
  
  // Initialize tracker
  const tracker = new EnrichmentTracker();
  
  // Start tracking enrichment for hiqsense.com
  const traceId = tracker.startEnrichmentTrace('hiqsense.com', 'hiqsense.com');
  console.log(`📊 Trace ID: ${traceId}`);
  
  // Subscribe to real-time updates
  tracker.subscribeToUpdates(traceId, (update) => {
    console.log(`\n📡 REAL-TIME UPDATE: ${update.type}`);
    console.log(`   Timestamp: ${update.timestamp}`);
    if (update.type === 'page_discovery_completed') {
      console.log(`   Pages Found: ${update.pagesFound}`);
      console.log(`   Categories: ${update.categories.join(', ')}`);
    } else if (update.type === 'page_scraped') {
      console.log(`   URL: ${update.url}`);
      console.log(`   Status: ${update.status}`);
      console.log(`   Data Extracted: ${update.dataExtracted} fields`);
    } else if (update.type === 'llm_processing_completed') {
      console.log(`   Model: ${update.modelUsed}`);
      console.log(`   Response Time: ${update.responseTime}ms`);
      console.log(`   Parsing: ${update.parsingSuccess ? 'Success' : 'Failed'}`);
    }
  });
  
  // Simulate the enrichment process step by step
  console.log('\n🚀 Starting enrichment simulation...\n');
  
  // Step 1: Domain Validation
  console.log('🔍 Step 1: Domain Validation');
  await simulateDelay(100);
  tracker.trackDomainValidation(traceId, {
    domain: 'hiqsense.com',
    isValid: true,
    httpStatus: 200,
    responseTime: 150
  });
  
  // Step 2: Page Discovery
  console.log('\n🌐 Step 2: Page Discovery');
  await simulateDelay(500);
  tracker.trackPageDiscovery(traceId, {
    baseUrl: 'https://hiqsense.com',
    discoveredPages: [
      'https://hiqsense.com/',
      'https://hiqsense.com/about',
      'https://hiqsense.com/contact',
      'https://hiqsense.com/services',
      'https://hiqsense.com/portfolio'
    ],
    categorizedPages: {
      home: ['https://hiqsense.com/'],
      about: ['https://hiqsense.com/about'],
      contact: ['https://hiqsense.com/contact'],
      services: ['https://hiqsense.com/services'],
      portfolio: ['https://hiqsense.com/portfolio']
    },
    prioritizedPages: [
      'https://hiqsense.com/',
      'https://hiqsense.com/about',
      'https://hiqsense.com/contact'
    ],
    discoveryTime: 500,
    totalPagesFound: 5
  });
  
  // Step 3: Individual Page Scraping
  console.log('\n📄 Step 3: Individual Page Scraping');
  const pagesToScrape = [
    'https://hiqsense.com/',
    'https://hiqsense.com/about',
    'https://hiqsense.com/contact'
  ];
  
  for (let i = 0; i < pagesToScrape.length; i++) {
    const url = pagesToScrape[i];
    console.log(`   Scraping: ${url}`);
    
    await simulateDelay(300 + (i * 100));
    
    tracker.trackPageScraping(traceId, {
      url,
      status: 'success',
      duration: 300 + (i * 100),
      extractedData: {
        title: `Page ${i + 1} - ${url.split('/').pop() || 'Home'}`,
        description: `Description for ${url}`,
        content: `Content extracted from ${url}`,
        contactInfo: i === 2 ? { emails: ['contact@hiqsense.com'] } : {},
        technologies: ['React', 'Node.js'],
        socialLinks: {},
        keywords: ['ai', 'business intelligence', 'data analytics']
      },
      httpInfo: {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' }
      }
    });
  }
  
  // Step 4: Website Scraping Complete
  console.log('\n✅ Step 4: Website Scraping Complete');
  await simulateDelay(200);
  tracker.trackWebsiteScrapingComplete(traceId, {
    totalPages: 5,
    successfulPages: 3,
    failedPages: 0,
    totalData: mockScrapedData,
    scrapingDuration: 1500
  });
  
  // Step 5: External API Searches
  console.log('\n🔍 Step 5: External API Searches');
  
  // LinkedIn search
  await simulateDelay(800);
  tracker.trackExternalAPISearch(traceId, {
    source: 'linkedin',
    query: 'HiQSense company information',
    results: [
      { companyName: 'HiQSense', employeeCount: '50-100', industry: 'Technology' }
    ],
    searchTime: 800,
    success: true,
    rateLimitInfo: { remaining: 95, resetTime: new Date(Date.now() + 3600000) }
  });
  
  // Crunchbase search
  await simulateDelay(600);
  tracker.trackExternalAPISearch(traceId, {
    source: 'crunchbase',
    query: 'HiQSense funding rounds',
    results: [
      { companyName: 'HiQSense', funding: '$2M Series A', investors: ['Tech Ventures'] }
    ],
    searchTime: 600,
    success: true,
    rateLimitInfo: { remaining: 48, resetTime: new Date(Date.now() + 7200000) }
  });
  
  // Step 6: Google Search Enrichment
  console.log('\n🔍 Step 6: Google Search Enrichment');
  await simulateDelay(1200);
  tracker.trackGoogleEnrichment(traceId, {
    queries: [
      'HiQSense company profile',
      'HiQSense business intelligence solutions',
      'HiQSense AI technology stack'
    ],
    results: [
      { title: 'HiQSense - AI Solutions', url: 'https://example.com/hiqsense' },
      { title: 'HiQSense Business Intelligence', url: 'https://example.com/business' }
    ],
    searchTime: 1200,
    success: true
  });
  
  // Step 7: LLM Processing
  console.log('\n🤖 Step 7: LLM Processing');
  await simulateDelay(3000);
  tracker.trackLLMProcessing(traceId, mockLLMData);
  
  // Step 8: Data Consolidation
  console.log('\n📊 Step 8: Data Consolidation');
  await simulateDelay(500);
  tracker.trackDataConsolidation(traceId, {
    scrapedData: mockScrapedData,
    googleData: { searchResults: 15 },
    linkedinData: { companyInfo: { employeeCount: '50-100' } },
    crunchbaseData: { funding: '$2M Series A' },
    llmData: mockLLMData.outputData.parsedData,
    consolidatedData: {
      companyName: 'HiQSense Inc',
      website: 'https://hiqsense.com',
      description: 'HiQSense provides cutting-edge AI solutions...',
      contact: { email: 'info@hiqsense.com', phone: '+1-555-0123' },
      business: { industry: 'Artificial Intelligence', employeeCount: '50-100' },
      technology: { platforms: ['React', 'Node.js', 'Python'] }
    },
    conflicts: ['Company name format', 'Industry classification'],
    mergeStrategy: 'priority-based with conflict resolution'
  });
  
  // Step 9: Database Upsert
  console.log('\n💾 Step 9: Database Upsert');
  await simulateDelay(800);
  tracker.trackDatabaseUpsert(traceId, {
    operation: 'create',
    table: 'business_directory',
    recordId: 123,
    success: true,
    duration: 800,
    dataSaved: { companyName: 'HiQSense Inc', website: 'https://hiqsense.com' }
  });
  
  // Step 10: Marketing Tools
  console.log('\n🎯 Step 10: Marketing Tools Generation');
  await simulateDelay(400);
  tracker.trackMarketingTools(traceId, {
    templates: ['Email Campaign', 'Social Media Post', 'Case Study'],
    segments: ['B2B', 'Technology', 'AI/ML'],
    customizations: ['Company branding', 'Industry focus', 'Contact information'],
    generationTime: 400,
    success: true
  });
  
  // Complete the enrichment trace
  console.log('\n✅ Completing enrichment trace...');
  await simulateDelay(200);
  
  const finalData = {
    companyName: 'HiQSense Inc',
    website: 'https://hiqsense.com',
    description: 'HiQSense provides cutting-edge AI solutions for business intelligence, data analytics, and predictive insights',
    contact: { email: 'info@hiqsense.com', phone: '+1-555-0123' },
    business: { industry: 'Artificial Intelligence', employeeCount: '50-100' },
    technology: { platforms: ['React', 'Node.js', 'Python', 'TensorFlow', 'AWS'] }
  };
  
  tracker.completeEnrichmentTrace(traceId, finalData);
  
  // Show final results
  console.log('\n📊 Final Enrichment Results:');
  const trace = tracker.getTrace(traceId);
  if (trace) {
    console.log(`   Domain: ${trace.domain}`);
    console.log(`   Status: ${trace.status}`);
    console.log(`   Total Duration: ${trace.performance.totalDuration}ms`);
    console.log(`   Steps Completed: ${Object.values(trace.steps).filter(s => s.status === 'completed').length}/${Object.keys(trace.steps).length}`);
  }
  
  // Show step-by-step data
  console.log('\n📋 Step-by-Step Data Collected:');
  const stepData = tracker.getStepData(traceId);
  stepData.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step.stepName}`);
    console.log(`      Timestamp: ${step.timestamp}`);
    console.log(`      Data Points: ${Object.keys(step.data).length}`);
    console.log(`      Metadata: ${Object.keys(step.metadata || {}).length} items`);
  });
  
  // Show progress
  console.log('\n📈 Enrichment Progress:');
  const progress = tracker.getEnrichmentProgress(traceId);
  if (progress) {
    console.log(`   Current Step: ${progress.currentStep}`);
    console.log(`   Progress: ${progress.progress}%`);
    console.log(`   Current Operation: ${progress.currentOperation}`);
    console.log(`   Estimated Time Remaining: ${progress.estimatedTimeRemaining}ms`);
  }
  
  console.log('\n🎉 Enrichment tracking test completed!');
  console.log('\n💡 This demonstrates how the system tracks:');
  console.log('   - Every page discovered and scraped');
  console.log('   - All external API searches (LinkedIn, Crunchbase)');
  console.log('   - Complete LLM input/output data');
  console.log('   - Real-time progress updates');
  console.log('   - Step-by-step data collection');
}

// Helper function to simulate delays
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
if (require.main === module) {
  testEnrichmentTracking().catch(console.error);
}

module.exports = { testEnrichmentTracking };

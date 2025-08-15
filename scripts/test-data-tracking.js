const { EnrichmentDataTracker } = require('../src/lib/enrichment/dataTracker');
const { EnrichmentDataValidator } = require('../src/lib/enrichment/dataValidator');

// Test the new data tracking and validation system
async function testDataTracking() {
  console.log('🧪 Testing Comprehensive Data Tracking System\n');
  
  // Initialize tracker and validator
  const tracker = new EnrichmentDataTracker();
  const validator = new EnrichmentDataValidator();
  
  // Simulate an enrichment process
  const domain = 'hiqsense.com';
  const normalizedDomain = 'hiqsense.com';
  
  console.log(`🚀 Starting enrichment trace for: ${domain}`);
  
  // Start tracking
  const traceId = tracker.startTrace(domain, normalizedDomain);
  console.log(`📊 Trace ID: ${traceId}`);
  
  // Simulate step-by-step tracking
  await simulateEnrichmentSteps(tracker, validator, traceId);
  
  // Get final trace
  const finalTrace = tracker.getTrace(traceId);
  if (finalTrace) {
    console.log('\n📊 Final Trace Summary:');
    console.log(`   Domain: ${finalTrace.domain}`);
    console.log(`   Status: ${finalTrace.status}`);
    console.log(`   Total Duration: ${finalTrace.performance.totalDuration}ms`);
    console.log(`   Confidence Score: ${finalTrace.qualityMetrics.confidenceScore}/100`);
    console.log(`   Data Completeness: ${finalTrace.qualityMetrics.dataCompleteness}/100`);
    
    // Show step details
    console.log('\n📋 Step-by-Step Details:');
    Object.entries(finalTrace.steps).forEach(([stepName, step]) => {
      console.log(`   ${stepName}:`);
      console.log(`     Status: ${step.status}`);
      console.log(`     Duration: ${step.duration || 0}ms`);
      if (step.errors && step.errors.length > 0) {
        console.log(`     Errors: ${step.errors.join(', ')}`);
      }
      if (step.warnings && step.warnings.length > 0) {
        console.log(`     Warnings: ${step.warnings.join(', ')}`);
      }
    });
    
    // Export detailed trace
    const exportedTrace = tracker.exportTrace(traceId);
    console.log('\n📊 Exported Trace Metrics:');
    console.log(`   Average Step Duration: ${exportedTrace.computedMetrics.averageStepDuration}ms`);
    console.log(`   Success Rate: ${exportedTrace.computedMetrics.successRate}%`);
    console.log(`   Data Quality Score: ${exportedTrace.computedMetrics.dataQualityScore}/100`);
  }
}

// Simulate enrichment steps
async function simulateEnrichmentSteps(tracker, validator, traceId) {
  console.log('\n🔄 Simulating enrichment steps...');
  
  // Step 1: Domain Validation
  console.log('\n🔍 Step 1: Domain Validation');
  tracker.startStep(traceId, 'domainValidation');
  await simulateDelay(100);
  tracker.completeStep(traceId, 'domainValidation', {
    outputData: { isValid: true, domain: 'example.com' },
    rawData: { httpStatus: 200, responseTime: 150 }
  });
  
  // Step 2: Website Scraping
  console.log('\n🌐 Step 2: Website Scraping');
  tracker.startStep(traceId, 'websiteScraping');
  await simulateDelay(2000);
  
  const mockScrapingData = {
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
    pageResults: [
      { url: 'https://hiqsense.com/', status: 'success', duration: 500 },
      { url: 'https://hiqsense.com/about', status: 'success', duration: 400 },
      { url: 'https://hiqsense.com/contact', status: 'success', duration: 300 }
    ],
    consolidatedData: {
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
    }
  };
  
  tracker.trackWebsiteScraping(traceId, mockScrapingData);
  tracker.completeStep(traceId, 'websiteScraping', {
    outputData: mockScrapingData.consolidatedData,
    rawData: mockScrapingData
  });
  
  // Step 3: Google Enrichment
  console.log('\n🔍 Step 3: Google Enrichment');
  tracker.startStep(traceId, 'googleEnrichment');
  await simulateDelay(1500);
  tracker.completeStep(traceId, 'googleEnrichment', {
    outputData: { searchResults: 15, extractedInfo: { employeeCount: '50-100' } },
    rawData: { apiCalls: 3, responseTime: 1200 }
  });
  
  // Step 4: LLM Processing
  console.log('\n🤖 Step 4: LLM Processing');
  tracker.startStep(traceId, 'llmProcessing');
  await simulateDelay(3000);
  
  const mockLLMData = {
    inputData: {
      scrapedData: mockScrapingData.consolidatedData,
      googleData: { searchResults: 15 },
      prompt: 'Analyze company data and extract structured information...',
      modelUsed: 'deepseek-chat'
    },
    outputData: {
      rawResponse: '{"company": {"legalName": "Example Company Inc", "industry": "Technology"}}',
      parsedData: {
        company: { legalName: 'Example Company Inc', industry: 'Technology' },
        business: { targetCustomers: ['Businesses', 'Enterprises'] },
        technology: { platforms: ['React', 'Node.js'] }
      },
      parsingSuccess: true
    },
    promptEngineering: {
      promptTemplate: 'Please analyze the following company data...',
      variables: { domain: 'example.com', focus: 'business intelligence' },
      promptVersion: '1.2'
    },
    modelPerformance: {
      responseTime: 2800,
      tokenUsage: { input: 150, output: 200, total: 350 },
      modelConfidence: 0.85
    }
  };
  
  tracker.trackLLMProcessing(traceId, mockLLMData);
  tracker.completeStep(traceId, 'llmProcessing', {
    outputData: mockLLMData.outputData.parsedData,
    rawData: mockLLMData
  });
  
  // Step 5: Data Consolidation
  console.log('\n📊 Step 5: Data Consolidation');
  tracker.startStep(traceId, 'dataConsolidation');
  await simulateDelay(500);
  tracker.completeStep(traceId, 'dataConsolidation', {
    outputData: { consolidated: true, dataQuality: 'high' },
    rawData: { mergeStrategy: 'priority-based', conflicts: 0 }
  });
  
  // Step 6: Database Upsert
  console.log('\n💾 Step 6: Database Upsert');
  tracker.startStep(traceId, 'databaseUpsert');
  await simulateDelay(800);
  tracker.completeStep(traceId, 'databaseUpsert', {
    outputData: { success: true, recordId: 123, action: 'created' },
    rawData: { operation: 'INSERT', table: 'business_directory' }
  });
  
  // Step 7: Marketing Tools
  console.log('\n🎯 Step 7: Marketing Tools');
  tracker.startStep(traceId, 'marketingTools');
  await simulateDelay(300);
  tracker.completeStep(traceId, 'marketingTools', {
    outputData: { marketingData: 'Generated', segments: ['B2B', 'Technology'] },
    rawData: { templates: 3, customizations: 2 }
  });
  
  // Validate final data
  console.log('\n✅ Step 8: Data Validation');
  const mockFinalData = {
    companyName: 'HiQSense Inc',
    website: 'https://hiqsense.com',
    description: 'HiQSense provides cutting-edge AI solutions for business intelligence, data analytics, and predictive insights',
    contact: {
      email: 'info@hiqsense.com',
      phone: '+1-555-0123',
      address: '123 AI Boulevard, Tech City, CA 90210'
    },
    business: {
      industry: 'Artificial Intelligence'
    },
    technology: {
      platforms: ['React', 'Node.js', 'Python', 'TensorFlow', 'AWS']
    }
  };
  
  const validationResult = validator.validateEnrichedData(mockFinalData);
  tracker.trackValidation(traceId, validationResult);
  
  // Complete trace
  const qualityReport = {
    overallScore: validationResult.score,
    dataCompleteness: validationResult.score,
    accuracyScore: validationResult.score,
    freshnessScore: 95,
    breakdown: {
      companyInfo: 90,
      contactInfo: 85,
      businessDetails: 80,
      technologyStack: 90,
      marketInfo: 70
    },
    issues: validationResult.issues,
    recommendations: validationResult.suggestions
  };
  
  tracker.completeTrace(traceId, mockFinalData, qualityReport);
  
  console.log('\n✅ Enrichment simulation completed!');
}

// Test data validation
function testDataValidation() {
  console.log('\n🔍 Testing Data Validation System\n');
  
  const validator = new EnrichmentDataValidator();
  
  // Test case 1: Good data
  console.log('📊 Test Case 1: High-quality data');
  const goodData = {
    companyName: 'Excellent Company Ltd',
    website: 'https://excellent-company.com',
    description: 'A comprehensive description of our excellent company with detailed information about our services and mission.',
    contact: {
      email: 'contact@excellent-company.com',
      phone: '+1-555-0123',
      address: '456 Business Ave, Suite 100, Tech City, CA 90210'
    },
    business: {
      industry: 'Software Development'
    },
    technology: {
      platforms: ['React', 'TypeScript', 'AWS']
    },
    market: {
      targetCustomers: ['Startups', 'Enterprises']
    }
  };
  
  const goodValidation = validator.validateEnrichedData(goodData);
  console.log(`   Score: ${goodValidation.score}/100`);
  console.log(`   Confidence: ${goodValidation.confidence}`);
  console.log(`   Issues: ${goodValidation.issues.length}`);
  
  // Test case 2: Poor data
  console.log('\n📊 Test Case 2: Low-quality data');
  const poorData = {
    companyName: 'A',
    website: 'invalid-url',
    description: 'Short',
    contact: {
      email: 'invalid-email',
      phone: 'not-a-phone',
      address: 'Too short'
    }
  };
  
  const poorValidation = validator.validateEnrichedData(poorData);
  console.log(`   Score: ${poorValidation.score}/100`);
  console.log(`   Confidence: ${poorValidation.confidence}`);
  console.log(`   Issues: ${poorValidation.issues.length}`);
  
  // Show specific issues
  if (poorValidation.issues.length > 0) {
    console.log('\n   Issues found:');
    poorValidation.issues.forEach((issue, index) => {
      console.log(`     ${index + 1}. ${issue.field}: ${issue.issue} (${issue.severity})`);
      console.log(`        Suggestion: ${issue.suggestion}`);
    });
  }
  
  // Test case 3: Website scraping data
  console.log('\n📊 Test Case 3: Website scraping validation');
  const mockWebsiteData = {
    status: 'success',
    title: 'Example Company',
    description: 'A technology company',
    contactInfo: {
      emails: ['info@example.com'],
      phones: ['+1-555-0123'],
      addresses: ['123 Main St']
    },
    technologies: ['React', 'Node.js'],
    lastScraped: new Date()
  };
  
  const websiteValidation = validator.validateWebsiteData(mockWebsiteData);
  console.log(`   Score: ${websiteValidation.score}/100`);
  console.log(`   Confidence: ${websiteValidation.confidence}`);
}

// Helper function to simulate delays
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
async function runAllTests() {
  try {
    await testDataTracking();
    testDataValidation();
    console.log('\n✅ All data tracking and validation tests completed!');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { testDataTracking, testDataValidation };

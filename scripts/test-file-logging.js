#!/usr/bin/env node

// 🧪 TEST FILE-BASED ENRICHMENT LOGGING
// Demonstrates how each enrichment step is logged to separate files

console.log('🧪 Testing File-Based Enrichment Logging System\n');

// Mock enrichment tracker class for testing
class FileBasedEnrichmentTracker {
  constructor() {
    this.logsDir = './logs/enrichment';
    this.ensureLogsDirectory();
    console.log('📊 FileBasedEnrichmentTracker initialized');
    console.log(`📁 Logs directory: ${this.logsDir}`);
  }

  ensureLogsDirectory() {
    const fs = require('fs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  getJobDir(domain) {
    const fs = require('fs');
    const path = require('path');
    const safeDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jobDir = path.join(this.logsDir, `${safeDomain}_${timestamp}`);
    
    if (!fs.existsSync(jobDir)) {
      fs.mkdirSync(jobDir, { recursive: true });
    }
    
    return jobDir;
  }

  writeToFile(jobDir, filename, data) {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(jobDir, filename);
      const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`📝 Wrote ${filename} to ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to write ${filename}:`, error);
    }
  }

  startEnrichmentTrace(domain, normalizedDomain) {
    const traceId = `enrichment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const jobDir = this.getJobDir(normalizedDomain);
    
    const jobInfo = {
      traceId,
      domain,
      normalizedDomain,
      startedAt: new Date(),
      jobDir
    };
    
    this.writeToFile(jobDir, '00_job_info.json', jobInfo);
    
    console.log(`🚀 Started enrichment tracking for ${domain} (ID: ${traceId})`);
    console.log(`📁 Job logs stored in: ${jobDir}`);
    
    return { traceId, jobDir };
  }

  trackDomainValidation(jobDir, data) {
    const stepData = {
      stepName: 'Domain Validation',
      timestamp: new Date(),
      data: {
        domain: data.domain,
        validationResult: data.isValid,
        httpStatus: data.httpStatus,
        responseTime: data.responseTime,
        error: data.error
      },
      metadata: {
        stepType: 'validation',
        success: data.isValid
      }
    };

    this.writeToFile(jobDir, '01_domain_validation.json', stepData);
    console.log(`🔍 Domain validation tracked: ${data.domain} - ${data.isValid ? 'Valid' : 'Invalid'}`);
  }

  trackPageDiscovery(jobDir, data) {
    const stepData = {
      stepName: 'Page Discovery',
      timestamp: new Date(),
      data: {
        baseUrl: data.baseUrl,
        discoveredPages: data.discoveredPages,
        categorizedPages: data.categorizedPages,
        prioritizedPages: data.prioritizedPages,
        discoveryTime: data.discoveryTime,
        totalPagesFound: data.totalPagesFound
      },
      metadata: {
        stepType: 'discovery',
        pagesFound: data.totalPagesFound,
        categories: Object.keys(data.categorizedPages)
      }
    };

    this.writeToFile(jobDir, '02_page_discovery.json', stepData);
    console.log(`🌐 Page discovery tracked: ${data.totalPagesFound} pages found across ${Object.keys(data.categorizedPages).length} categories`);
  }

  trackPageScraping(jobDir, data) {
    const stepData = {
      stepName: 'Page Scraping',
      timestamp: new Date(),
      data: {
        url: data.url,
        status: data.status,
        duration: data.duration,
        extractedData: data.extractedData,
        error: data.error,
        httpInfo: data.httpInfo
      },
      metadata: {
        stepType: 'scraping',
        success: data.status === 'success',
        dataExtracted: Object.keys(data.extractedData).length
      }
    };

    const safeUrl = data.url.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/https?:\/\//, '');
    const filename = `03_page_scraping_${safeUrl}.json`;
    this.writeToFile(jobDir, filename, stepData);
    
    console.log(`📄 Page scraping tracked: ${data.url} - ${data.status} (${data.duration}ms)`);
  }

  trackLLMProcessing(jobDir, data) {
    const stepData = {
      stepName: 'LLM Processing',
      timestamp: new Date(),
      data: {
        inputData: data.inputData,
        outputData: data.outputData,
        metadata: data.metadata
      },
      metadata: {
        stepType: 'llm_processing',
        modelUsed: data.inputData.modelUsed,
        promptLength: data.inputData.promptLength,
        responseLength: data.outputData.responseLength,
        parsingSuccess: data.outputData.parsingSuccess,
        responseTime: data.outputData.responseTime
      }
    };

    this.writeToFile(jobDir, '07_llm_processing.json', stepData);
    console.log(`🤖 LLM processing tracked: ${data.inputData.modelUsed} - ${data.outputData.responseTime}ms`);
  }

  trackDataConsolidation(jobDir, data) {
    const stepData = {
      stepName: 'Data Consolidation',
      timestamp: new Date(),
      data: {
        scrapedData: data.scrapedData,
        googleData: data.googleData,
        linkedinData: data.linkedinData,
        crunchbaseData: data.crunchbaseData,
        llmData: data.llmData,
        consolidatedData: data.consolidatedData,
        conflicts: data.conflicts,
        mergeStrategy: data.mergeStrategy
      },
      metadata: {
        stepType: 'consolidation',
        dataSources: ['scraping', 'google', 'linkedin', 'crunchbase', 'llm'].filter(source => 
          data[source]
        ),
        conflictsCount: data.conflicts.length,
        mergeStrategy: data.mergeStrategy
      }
    };

    this.writeToFile(jobDir, '08_data_consolidation.json', stepData);
    console.log(`📊 Data consolidation tracked: ${data.conflicts.length} conflicts resolved`);
  }

  completeEnrichmentTrace(jobDir, finalData) {
    const finalSummary = {
      status: 'completed',
      completedAt: new Date(),
      finalData,
      message: 'Enrichment process completed successfully'
    };
    
    this.writeToFile(jobDir, '11_final_summary.json', finalSummary);
    console.log(`✅ Enrichment trace completed and logged to ${jobDir}`);
  }
}

// Test the file-based logging system
async function testFileLogging() {
  console.log('🧪 Testing File-Based Enrichment Logging System\n');
  
  // Initialize tracker
  const tracker = new FileBasedEnrichmentTracker();
  
  // Start tracking enrichment for hiqsense.com
  const { traceId, jobDir } = tracker.startEnrichmentTrace('hiqsense.com', 'hiqsense.com');
  console.log(`📊 Trace ID: ${traceId}`);
  console.log(`📁 Job Directory: ${jobDir}`);
  
  // Simulate the enrichment process step by step
  console.log('\n🚀 Starting enrichment simulation...\n');
  
  // Step 1: Domain Validation
  console.log('🔍 Step 1: Domain Validation');
  await simulateDelay(100);
  tracker.trackDomainValidation(jobDir, {
    domain: 'hiqsense.com',
    isValid: true,
    httpStatus: 200,
    responseTime: 150
  });
  
  // Step 2: Page Discovery
  console.log('\n🌐 Step 2: Page Discovery');
  await simulateDelay(500);
  tracker.trackPageDiscovery(jobDir, {
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
    
    tracker.trackPageScraping(jobDir, {
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
  
  // Step 4: LLM Processing
  console.log('\n🤖 Step 4: LLM Processing');
  await simulateDelay(3000);
  tracker.trackLLMProcessing(jobDir, {
    inputData: {
      scrapedData: { title: 'HiQSense', description: 'AI solutions' },
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
  });
  
  // Step 5: Data Consolidation
  console.log('\n📊 Step 5: Data Consolidation');
  await simulateDelay(500);
  tracker.trackDataConsolidation(jobDir, {
    scrapedData: { title: 'HiQSense' },
    googleData: { searchResults: 15 },
    linkedinData: { companyInfo: { employeeCount: '50-100' } },
    crunchbaseData: { funding: '$2M Series A' },
    llmData: { company: { legalName: 'HiQSense Inc' } },
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
  
  tracker.completeEnrichmentTrace(jobDir, finalData);
  
  // Show the file structure
  console.log('\n📁 File Structure Created:');
  const fs = require('fs');
  const path = require('path');
  
  if (fs.existsSync(jobDir)) {
    const files = fs.readdirSync(jobDir).sort();
    files.forEach(file => {
      const filePath = path.join(jobDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      console.log(`   📄 ${file} (${size} bytes)`);
    });
  }
  
  console.log('\n🎉 File-based enrichment logging test completed!');
  console.log('\n💡 Each step is now logged to a separate file:');
  console.log('   - 00_job_info.json - Job initialization');
  console.log('   - 01_domain_validation.json - Domain validation results');
  console.log('   - 02_page_discovery.json - Page discovery data');
  console.log('   - 03_page_scraping_*.json - Individual page scraping results');
  console.log('   - 07_llm_processing.json - LLM input/output data');
  console.log('   - 08_data_consolidation.json - Data consolidation results');
  console.log('   - 11_final_summary.json - Final enrichment summary');
  console.log('\n📁 Check the logs/enrichment/ directory to see all the files!');
}

// Helper function to simulate delays
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
if (require.main === module) {
  testFileLogging().catch(console.error);
}

module.exports = { testFileLogging };

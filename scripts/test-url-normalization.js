const { EnrichmentEngine } = require('../src/lib/enrichment/engine');

// Test URL normalization
function testUrlNormalization() {
  console.log('🧪 Testing URL Normalization Logic\n');
  
  const testUrls = [
    'example.com',
    'https://example.com',
    'http://example.com',
    'www.example.com',
    'https://www.example.com',
    'http://www.example.com',
    'https://example.com/path',
    'https://example.com/path?query=value',
    '  example.com  ',
    'EXAMPLE.COM',
    'https://EXAMPLE.COM',
    'https://subdomain.example.com',
    'https://example.com:8080',
    'invalid-url',
    ''
  ];
  
  console.log('Input URL -> Normalized Domain:');
  console.log('================================');
  
  testUrls.forEach(url => {
    try {
      // Create a minimal engine instance to test the private method
      const engine = new EnrichmentEngine();
      
      // Use reflection to access the private method (for testing only)
      const normalizeMethod = engine.constructor.prototype.normalizeDomain || 
                            engine.__proto__.normalizeDomain ||
                            engine.normalizeDomain;
      
      if (typeof normalizeMethod === 'function') {
        const normalized = normalizeMethod.call(engine, url);
        console.log(`"${url}" -> "${normalized}"`);
      } else {
        console.log(`"${url}" -> [Method not accessible]`);
      }
    } catch (error) {
      console.log(`"${url}" -> [Error: ${error.message}]`);
    }
  });
  
  console.log('\n✅ URL normalization test completed');
}

// Test enrichment with various URL formats
async function testEnrichmentWithUrls() {
  console.log('\n🚀 Testing Enrichment with Various URL Formats\n');
  
  const testDomains = [
    'example.com',
    'https://example.com',
    'http://example.com',
    'www.example.com'
  ];
  
  for (const domain of testDomains) {
    console.log(`\n--- Testing: ${domain} ---`);
    try {
      const engine = new EnrichmentEngine();
      const result = await engine.enrichCompany({ domain, priority: 'high' });
      
      console.log(`Status: ${result.status}`);
      console.log(`Normalized Domain: ${result.normalizedDomain}`);
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`Failed: ${error.message}`);
    }
  }
}

async function runTests() {
  try {
    testUrlNormalization();
    await testEnrichmentWithUrls();
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testUrlNormalization, testEnrichmentWithUrls };

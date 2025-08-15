const { WebsiteScraper } = require('../src/lib/enrichment/sources/websiteScraper');

// Test the new smart scraping system
async function testSmartScraping() {
  console.log('🧪 Testing Smart Page Discovery System\n');
  
  const testDomains = [
    'hiqsense.com',
    'example.com',
    'github.com'
  ];
  
  for (const domain of testDomains) {
    console.log(`\n--- Testing Smart Scraping: ${domain} ---`);
    
    try {
      const scraper = new WebsiteScraper({
        maxPages: 8,
        timeout: 15000
      });
      
      console.log(`🚀 Starting smart scraping for ${domain}...`);
      const startTime = Date.now();
      
      const result = await scraper.enrich(domain);
      
      const duration = Date.now() - startTime;
      
      if (result) {
        console.log(`✅ Scraping completed in ${duration}ms`);
        console.log(`📊 Results:`);
        console.log(`   Title: ${result.title}`);
        console.log(`   Description: ${result.description?.substring(0, 100)}...`);
        console.log(`   Technologies: ${result.technologies?.join(', ') || 'None detected'}`);
        console.log(`   Contact Emails: ${result.contactInfo?.emails?.length || 0}`);
        console.log(`   Contact Phones: ${result.contactInfo?.phones?.length || 0}`);
        console.log(`   Social Links: ${Object.keys(result.socialLinks || {}).join(', ') || 'None'}`);
        console.log(`   Keywords: ${result.keywords?.length || 0} found`);
        console.log(`   Status: ${result.status}`);
      } else {
        console.log(`❌ Scraping failed for ${domain}`);
      }
      
    } catch (error) {
      console.log(`❌ Error scraping ${domain}:`, error.message);
    }
  }
}

// Test specific functionality
async function testPageDiscovery() {
  console.log('\n🔍 Testing Page Discovery Logic\n');
  
  const scraper = new WebsiteScraper();
  
  // Test URL categorization
  const testUrls = [
    'https://example.com/',
    'https://example.com/about',
    'https://example.com/contact-us',
    'https://example.com/services/web-development',
    'https://example.com/products/software',
    'https://example.com/team/leadership',
    'https://example.com/blog/news',
    'https://example.com/random-page'
  ];
  
  console.log('URL Categorization Test:');
  testUrls.forEach(url => {
    try {
      const path = new URL(url).pathname.toLowerCase();
      let category = 'other';
      
      if (path === '/' || path === '' || path.includes('home') || path.includes('index')) {
        category = 'home';
      } else if (path.includes('about') || path.includes('company') || path.includes('story')) {
        category = 'about';
      } else if (path.includes('contact') || path.includes('reach') || path.includes('get-in-touch')) {
        category = 'contact';
      } else if (path.includes('service') || path.includes('solution') || path.includes('offer')) {
        category = 'services';
      } else if (path.includes('product') || path.includes('portfolio') || path.includes('work')) {
        category = 'products';
      } else if (path.includes('team') || path.includes('people') || path.includes('staff')) {
        category = 'team';
      } else if (path.includes('blog') || path.includes('news') || path.includes('article')) {
        category = 'blog';
      }
      
      console.log(`  ${url} → ${category}`);
    } catch (error) {
      console.log(`  ${url} → error: ${error.message}`);
    }
  });
}

// Run tests
async function runAllTests() {
  try {
    await testPageDiscovery();
    await testSmartScraping();
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { testSmartScraping, testPageDiscovery };

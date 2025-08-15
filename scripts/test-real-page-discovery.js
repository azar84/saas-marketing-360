#!/usr/bin/env node

// 🧪 TEST REAL PAGE DISCOVERY vs SIMULATED DATA
// Shows the difference between actual page discovery and mock data

console.log('🧪 Testing Real Page Discovery vs Simulated Data\n');

// Mock data (what we showed before - NOT REAL!)
const mockPageDiscovery = {
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
};

console.log('🚨 MOCK DATA (NOT REAL - This was hallucination!):');
console.log('   Base URL:', mockPageDiscovery.baseUrl);
console.log('   Pages Found:', mockPageDiscovery.discoveredPages.length);
console.log('   Categories:', Object.keys(mockPageDiscovery.categorizedPages));
console.log('   Prioritized:', mockPageDiscovery.prioritizedPages.length);
console.log('   Discovery Time:', mockPageDiscovery.discoveryTime + 'ms');
console.log('');

// Now let's test REAL page discovery
async function testRealPageDiscovery() {
  console.log('🔍 REAL PAGE DISCOVERY TEST:');
  console.log('   This will actually crawl a real website to find pages\n');
  
  try {
    // Test with a real website
    const testDomain = 'example.com'; // Using example.com as it's reliable
    
    console.log(`🌐 Testing real page discovery for: ${testDomain}`);
    
    // Simulate the discovery process
    const baseUrl = `https://${testDomain}`;
    console.log(`   Base URL: ${baseUrl}`);
    
    // Step 1: Try to fetch the main page
    console.log('\n📄 Step 1: Fetching main page...');
    const response = await fetch(baseUrl);
    console.log(`   HTTP Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const html = await response.text();
      console.log(`   Content Length: ${html.length} characters`);
      
      // Step 2: Parse HTML to find links
      console.log('\n🔗 Step 2: Parsing HTML for links...');
      
      // Simple link extraction (without cheerio for this demo)
      const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
      const hrefMatches = html.match(/href=["']([^"']+)["']/gi) || [];
      
      console.log(`   Raw link tags found: ${linkMatches.length}`);
      console.log(`   Href attributes found: ${hrefMatches.length}`);
      
      // Extract actual URLs
      const urls = new Set();
      hrefMatches.forEach(match => {
        const url = match.replace(/href=["']/, '').replace(/["']$/, '');
        if (url && !url.startsWith('#') && !url.startsWith('javascript:')) {
          try {
            const absoluteUrl = new URL(url, baseUrl).href;
            if (absoluteUrl.startsWith(baseUrl)) {
              urls.add(absoluteUrl);
            }
          } catch (error) {
            // Skip invalid URLs
          }
        }
      });
      
      const discoveredPages = Array.from(urls);
      console.log(`   Valid internal links found: ${discoveredPages.length}`);
      
      if (discoveredPages.length > 0) {
        console.log('\n📋 Discovered Pages:');
        discoveredPages.forEach((page, index) => {
          console.log(`   ${index + 1}. ${page}`);
        });
        
        // Step 3: Categorize pages
        console.log('\n🏷️ Step 3: Categorizing pages...');
        const categories = {
          home: [],
          about: [],
          contact: [],
          services: [],
          other: []
        };
        
        discoveredPages.forEach(page => {
          const path = new URL(page).pathname.toLowerCase();
          
          if (path === '/' || path === '' || path.includes('home')) {
            categories.home.push(page);
          } else if (path.includes('about')) {
            categories.about.push(page);
          } else if (path.includes('contact')) {
            categories.contact.push(page);
          } else if (path.includes('service')) {
            categories.services.push(page);
          } else {
            categories.other.push(page);
          }
        });
        
        Object.entries(categories).forEach(([category, pages]) => {
          if (pages.length > 0) {
            console.log(`   ${category}: ${pages.length} pages`);
            pages.forEach(page => console.log(`     - ${page}`));
          }
        });
        
        // Step 4: Prioritize pages
        console.log('\n⭐ Step 4: Prioritizing pages...');
        const priorityOrder = ['home', 'about', 'contact', 'services', 'other'];
        const prioritizedPages = [];
        
        priorityOrder.forEach(category => {
          const pages = categories[category];
          if (pages && pages.length > 0) {
            prioritizedPages.push(...pages);
          }
        });
        
        console.log(`   Prioritized order (${prioritizedPages.length} pages):`);
        prioritizedPages.forEach((page, index) => {
          console.log(`   ${index + 1}. ${page}`);
        });
        
      } else {
        console.log('   ⚠️ No internal links found - this might be a single-page site');
      }
      
    } else {
      console.log(`   ❌ Failed to fetch page: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('   ❌ Error during real page discovery:', error.message);
  }
}

// Test with multiple domains to show real discovery
async function testMultipleDomains() {
  console.log('\n🌐 TESTING MULTIPLE REAL DOMAINS:\n');
  
  const testDomains = [
    'example.com',
    'httpbin.org',
    'jsonplaceholder.typicode.com'
  ];
  
  for (const domain of testDomains) {
    console.log(`🔍 Testing: ${domain}`);
    try {
      const response = await fetch(`https://${domain}`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        const html = await response.text();
        const linkCount = (html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || []).length;
        console.log(`   Links found: ${linkCount}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

// Run the tests
async function runTests() {
  console.log('🚨 KEY DIFFERENCE:');
  console.log('   - MOCK DATA: Pre-defined, fake pages that don\'t exist');
  console.log('   - REAL DISCOVERY: Actually crawls websites to find real pages\n');
  
  await testRealPageDiscovery();
  await testMultipleDomains();
  
  console.log('💡 REAL PAGE DISCOVERY PROCESS:');
  console.log('   1. Fetch the main page of the website');
  console.log('   2. Parse HTML to find all <a href=""> links');
  console.log('   3. Convert relative URLs to absolute URLs');
  console.log('   4. Filter to only include same-domain links');
  console.log('   5. Categorize pages based on URL patterns');
  console.log('   6. Prioritize pages for scraping');
  console.log('   7. Actually scrape each discovered page');
  console.log('');
  console.log('🎯 The mock data was just for demonstration - real discovery');
  console.log('   actually finds what pages exist on the website!');
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testRealPageDiscovery, testMultipleDomains };

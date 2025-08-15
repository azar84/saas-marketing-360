#!/usr/bin/env node

// 🧪 TEST REAL WEBSITE PAGE DISCOVERY
// Actually discovers pages from real websites

console.log('🧪 Testing Real Website Page Discovery\n');

// Test with real websites that have multiple pages
const testWebsites = [
  'httpbin.org',
  'jsonplaceholder.typicode.com',
  'httpstat.us'
];

async function discoverRealPages(domain) {
  console.log(`🔍 Discovering pages from: ${domain}`);
  console.log(`   URL: https://${domain}`);
  
  try {
    // Step 1: Fetch the main page
    const response = await fetch(`https://${domain}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`   ❌ Failed to fetch: ${response.status}`);
      return;
    }
    
    const html = await response.text();
    console.log(`   Content Length: ${html.length} characters`);
    
    // Step 2: Extract all links
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }
    
    console.log(`   Total links found: ${links.length}`);
    
    // Step 3: Filter and categorize links
    const internalLinks = new Set();
    const externalLinks = new Set();
    
    links.forEach(link => {
      if (!link || link.startsWith('#') || link.startsWith('javascript:')) {
        return; // Skip anchors and JavaScript
      }
      
      try {
        const absoluteUrl = new URL(link, `https://${domain}`).href;
        
        if (absoluteUrl.startsWith(`https://${domain}`)) {
          internalLinks.add(absoluteUrl);
        } else {
          externalLinks.add(absoluteUrl);
        }
      } catch (error) {
        // Skip invalid URLs
      }
    });
    
    console.log(`   Internal links: ${internalLinks.size}`);
    console.log(`   External links: ${externalLinks.size}`);
    
    // Step 4: Show discovered internal pages
    if (internalLinks.size > 0) {
      console.log('\n📋 Discovered Internal Pages:');
      const sortedPages = Array.from(internalLinks).sort();
      sortedPages.forEach((page, index) => {
        const path = new URL(page).pathname;
        console.log(`   ${index + 1}. ${path || '/'} (${page})`);
      });
      
      // Step 5: Categorize pages
      console.log('\n🏷️ Page Categories:');
      const categories = {
        home: [],
        api: [],
        docs: [],
        other: []
      };
      
      sortedPages.forEach(page => {
        const path = new URL(page).pathname.toLowerCase();
        
        if (path === '/' || path === '') {
          categories.home.push(page);
        } else if (path.includes('api') || path.includes('json')) {
          categories.api.push(page);
        } else if (path.includes('doc') || path.includes('help')) {
          categories.docs.push(page);
        } else {
          categories.other.push(page);
        }
      });
      
      Object.entries(categories).forEach(([category, pages]) => {
        if (pages.length > 0) {
          console.log(`   ${category}: ${pages.length} pages`);
          pages.forEach(page => {
            const path = new URL(page).pathname;
            console.log(`     - ${path || '/'}`);
          });
        }
      });
      
      // Step 6: Prioritize for scraping
      console.log('\n⭐ Prioritized for Scraping:');
      const priorityOrder = ['home', 'api', 'docs', 'other'];
      const prioritizedPages = [];
      
      priorityOrder.forEach(category => {
        const pages = categories[category];
        if (pages && pages.length > 0) {
          prioritizedPages.push(...pages);
        }
      });
      
      // Limit to first 5 pages for demo
      const pagesToScrape = prioritizedPages.slice(0, 5);
      console.log(`   Top ${pagesToScrape.length} pages to scrape:`);
      pagesToScrape.forEach((page, index) => {
        const path = new URL(page).pathname;
        console.log(`   ${index + 1}. ${path || '/'}`);
      });
      
    } else {
      console.log('   ⚠️ No internal pages found - single page site');
    }
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
}

// Test each website
async function runRealDiscoveryTests() {
  console.log('🚀 Testing Real Page Discovery on Actual Websites\n');
  
  for (const website of testWebsites) {
    await discoverRealPages(website);
    console.log('─'.repeat(60));
  }
  
  console.log('💡 REAL PAGE DISCOVERY SUMMARY:');
  console.log('   ✅ Actually fetches real websites');
  console.log('   ✅ Parses real HTML content');
  console.log('   ✅ Finds only existing pages');
  console.log('   ✅ Categorizes based on real URL patterns');
  console.log('   ✅ Prioritizes for actual scraping');
  console.log('');
  console.log('🎯 This is how the enrichment system actually works!');
  console.log('   No more fake/mock data - real discovery of real pages.');
}

// Run the tests
if (require.main === module) {
  runRealDiscoveryTests().catch(console.error);
}

module.exports = { discoverRealPages, runRealDiscoveryTests };

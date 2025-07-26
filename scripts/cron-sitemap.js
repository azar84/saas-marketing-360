#!/usr/bin/env node

/**
 * Universal Cron Job Script for Sitemap Submission
 * Works on any deployment platform (Heroku, Vercel, Railway, etc.)
 */

const https = require('https');
const http = require('http');

// Get the app URL from various possible sources
const getAppUrl = () => {
  // Priority 1: Explicitly set base URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Priority 2: Heroku app name
  if (process.env.HEROKU_APP_NAME) {
    return `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
  }
  
  // Priority 3: Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Priority 4: Railway URL
  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL;
  }
  
  // Priority 5: Render URL
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  
  // Priority 6: Netlify URL
  if (process.env.URL) {
    return process.env.URL;
  }
  
  // Priority 7: Generic PORT and HOST
  if (process.env.PORT && process.env.HOST) {
    const protocol = process.env.HOST.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${process.env.HOST}:${process.env.PORT}`;
  }
  
  // Priority 8: Just PORT (assumes localhost for development)
  if (process.env.PORT) {
    return `http://localhost:${process.env.PORT}`;
  }
  
  // Fallback: Try to construct from common patterns
  const appName = process.env.APP_NAME || process.env.NAME;
  if (appName) {
    // Try common domain patterns
    const domains = [
      `${appName}.herokuapp.com`,
      `${appName}.vercel.app`,
      `${appName}.railway.app`,
      `${appName}.render.com`,
      `${appName}.netlify.app`
    ];
    
    for (const domain of domains) {
      console.log(`🔍 Trying domain: ${domain}`);
      // You could add a simple ping test here if needed
    }
    
    // Return the first one as default
    return `https://${domains[0]}`;
  }
  
  throw new Error(`
    Could not determine app URL. Please set one of these environment variables:
    - NEXT_PUBLIC_BASE_URL (recommended)
    - HEROKU_APP_NAME
    - VERCEL_URL
    - RAILWAY_STATIC_URL
    - RENDER_EXTERNAL_URL
    - URL (Netlify)
    - APP_NAME or NAME (for auto-detection)
  `);
};

// Make HTTP request to the cron endpoint
const callCronEndpoint = (url) => {
  return new Promise((resolve, reject) => {
    const cronUrl = `${url}/api/cron/submit-sitemap`;
    const cronSecret = process.env.CRON_SECRET || '15f6db35a1b6d9ae3c95cb046ff3b2e6';
    
    console.log(`🕐 Calling cron endpoint: ${cronUrl}`);
    console.log(`🔐 Using secret: ${cronSecret.substring(0, 8)}...`);
    
    const client = cronUrl.startsWith('https') ? https : http;
    
    const req = client.request(cronUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'User-Agent': 'Universal-Cron-Scheduler/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`📊 Response status: ${res.statusCode}`);
          
          if (res.statusCode === 200) {
            console.log('✅ Cron job completed successfully:', response.message);
            resolve(response);
          } else {
            console.error('❌ Cron job failed:', response.message);
            reject(new Error(response.message));
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          console.error('📄 Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });
    
    req.setTimeout(60000, () => { // 60 second timeout
      req.destroy();
      reject(new Error('Request timeout after 60 seconds'));
    });
    
    req.end();
  });
};

// Test if the endpoint is accessible
const testEndpoint = async (url) => {
  return new Promise((resolve) => {
    const testUrl = `${url}/api/cron/submit-sitemap`;
    const client = testUrl.startsWith('https') ? https : http;
    
    const req = client.request(testUrl, {
      method: 'HEAD',
      timeout: 10000
    }, (res) => {
      resolve(res.statusCode < 500); // Consider 4xx as accessible (auth issues are expected)
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Starting universal sitemap cron job...');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
    
    // Log all relevant environment variables (without sensitive data)
    const envVars = [
      'NODE_ENV', 'HEROKU_APP_NAME', 'VERCEL_URL', 'RAILWAY_STATIC_URL',
      'RENDER_EXTERNAL_URL', 'URL', 'PORT', 'HOST', 'APP_NAME', 'NAME'
    ];
    
    console.log('🔧 Environment variables:');
    envVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`  ${varName}: ${process.env[varName]}`);
      }
    });
    
    const appUrl = getAppUrl();
    console.log('🌐 App URL:', appUrl);
    
    // Test if endpoint is accessible
    console.log('🔍 Testing endpoint accessibility...');
    const isAccessible = await testEndpoint(appUrl);
    
    if (!isAccessible) {
      console.warn('⚠️  Warning: Endpoint might not be accessible. Continuing anyway...');
    } else {
      console.log('✅ Endpoint is accessible');
    }
    
    const result = await callCronEndpoint(appUrl);
    
    console.log('🎉 Cron job completed successfully!');
    console.log('📊 Summary:', result.data?.summary);
    
    // Exit with success
    process.exit(0);
  } catch (error) {
    console.error('💥 Cron job failed:', error.message);
    
    // Log additional debugging info
    console.error('🔍 Debug info:');
    console.error('  - Node version:', process.version);
    console.error('  - Platform:', process.platform);
    console.error('  - Architecture:', process.arch);
    
    // Exit with error code
    process.exit(1);
  }
};

// Handle process signals gracefully
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Run the script
main(); 
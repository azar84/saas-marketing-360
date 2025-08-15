#!/usr/bin/env node

// 🗄️ COMPREHENSIVE DATABASE VIEWER
// Shows ALL data in the database from A to Z
// Including business directory, LLM processing, search sessions, and enrichment data

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  console.log('\n' + '='.repeat(80));
  log(`📊 ${title}`, 'bright');
  console.log('='.repeat(80));
}

function logSection(title) {
  console.log('\n' + '-'.repeat(60));
  log(`🔍 ${title}`, 'cyan');
  console.log('-'.repeat(60));
}

function logSubSection(title) {
  console.log('\n' + '─'.repeat(40));
  log(`📋 ${title}`, 'yellow');
  console.log('─'.repeat(40));
}

function logData(label, value, color = 'white') {
  if (value === null || value === undefined) {
    log(`   ${label}: ${colors.red}NULL${colors.reset}`, 'reset');
  } else if (typeof value === 'object') {
    log(`   ${label}:`, 'reset');
    console.log(JSON.stringify(value, null, 4));
  } else {
    log(`   ${label}: ${value}`, color);
  }
}

function logTable(headers, rows) {
  // Calculate column widths
  const colWidths = headers.map(header => header.length);
  rows.forEach(row => {
    row.forEach((cell, i) => {
      const cellStr = String(cell || '');
      colWidths[i] = Math.max(colWidths[i], cellStr.length);
    });
  });

  // Print header
  const headerRow = headers.map((header, i) => header.padEnd(colWidths[i])).join(' | ');
  log(`   ${headerRow}`, 'bright');
  
  // Print separator
  const separator = colWidths.map(width => '-'.repeat(width)).join('-+-');
  console.log(`   ${separator}`);
  
  // Print rows
  rows.forEach(row => {
    const rowStr = row.map((cell, i) => String(cell || '').padEnd(colWidths[i])).join(' | ');
    console.log(`   ${rowStr}`);
  });
}

// Main function to view all database data
async function viewAllDatabaseData() {
  try {
    logHeader('COMPREHENSIVE DATABASE VIEWER - ALL DATA FROM A TO Z');
    log('🚀 Connecting to database and retrieving ALL information...', 'green');
    
    // Test database connection
    await prisma.$connect();
    log('✅ Database connection successful!', 'green');
    
    // 1. BUSINESS DIRECTORY DATA
    await viewBusinessDirectoryData();
    
    // 2. CONTACT PERSONS DATA
    await viewContactPersonsData();
    
    // 3. LLM PROCESSING DATA
    await viewLLMProcessingData();
    
    // 4. SEARCH SESSIONS DATA
    await viewSearchSessionsData();
    
    // 5. SEARCH RESULTS DATA
    await viewSearchResultsData();
    
    // 6. INDUSTRIES DATA
    await viewIndustriesData();
    
    // 7. SITE SETTINGS DATA
    await viewSiteSettingsData();
    
    // 8. DATABASE STATISTICS
    await viewDatabaseStatistics();
    
    logHeader('DATABASE VIEWING COMPLETED');
    log('🎉 All database data has been displayed!', 'green');
    
  } catch (error) {
    log(`❌ Error viewing database data: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// 1. BUSINESS DIRECTORY DATA
async function viewBusinessDirectoryData() {
  logSection('BUSINESS DIRECTORY - ALL COMPANIES');
  
  try {
    const businesses = await prisma.businessDirectory.findMany({
      include: {
        contact_persons: true,
        industries: {
          include: {
            industry: true
          }
        },
        llmProcessingResults: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    log(`📊 Found ${businesses.length} businesses in database`, 'green');
    
    if (businesses.length === 0) {
      log('   No businesses found in database', 'yellow');
      return;
    }
    
    businesses.forEach((business, index) => {
      logSubSection(`Business #${index + 1}: ${business.companyName || business.website}`);
      
      // Basic company info
      logData('ID', business.id, 'green');
      logData('Company Name', business.companyName);
      logData('Website', business.website, 'blue');
      logData('Description', business.description);
      logData('Industry', business.industry);
      logData('Phone', business.phone || business.phoneNumber);
      logData('Email', business.email);
      logData('Address', business.address);
      logData('City', business.city);
      logData('State/Province', business.stateProvince || business.state);
      logData('Country', business.country);
      logData('Employee Count', business.employeesCount);
      logData('Categories', business.categories);
      logData('Confidence Score', business.confidence);
      logData('Source', business.source);
      logData('Extracted At', business.extractedAt);
      logData('Is Active', business.isActive);
      logData('Created At', business.createdAt);
      logData('Updated At', business.updatedAt);
      
      // Contact persons
      if (business.contact_persons && business.contact_persons.length > 0) {
        logSubSection('Contact Persons');
        business.contact_persons.forEach((contact, cIndex) => {
          log(`     Contact ${cIndex + 1}:`, 'yellow');
          logData('     Name', `${contact.firstName} ${contact.lastName}`);
          logData('     Title', contact.title);
          logData('     Email', contact.email);
          logData('     Phone', contact.phone);
          logData('     Department', contact.department);
          logData('     Is Primary', contact.isPrimary);
        });
      }
      
      // Industries
      if (business.industries && business.industries.length > 0) {
        logSubSection('Industries');
        business.industries.forEach((businessIndustry, iIndex) => {
          log(`     Industry ${iIndex + 1}:`, 'yellow');
          logData('     Industry Name', businessIndustry.industry.name);
          logData('     Is Primary', businessIndustry.isPrimary);
        });
      }
      
      // LLM Processing Results
      if (business.llmProcessingResults && business.llmProcessingResults.length > 0) {
        logSubSection('LLM Processing Results');
        business.llmProcessingResults.forEach((llmResult, lIndex) => {
          log(`     LLM Result ${lIndex + 1}:`, 'yellow');
          logData('     Status', llmResult.status);
          logData('     Confidence', llmResult.confidence);
          logData('     Company Name', llmResult.companyName);
          logData('     Website', llmResult.website);
          logData('     City', llmResult.city);
          logData('     State/Province', llmResult.stateProvince);
          logData('     Country', llmResult.country);
          logData('     Categories', llmResult.categories);
          logData('     LLM Prompt', llmResult.llmPrompt);
          logData('     LLM Response', llmResult.llmResponse);
          logData('     Processing Time', llmResult.processingTime);
          logData('     Created At', llmResult.createdAt);
        });
      }
    });
    
  } catch (error) {
    log(`❌ Error viewing business directory: ${error.message}`, 'red');
  }
}

// 2. CONTACT PERSONS DATA
async function viewContactPersonsData() {
  logSection('CONTACT PERSONS - ALL CONTACTS');
  
  try {
    const contacts = await prisma.contactPerson.findMany({
      include: {
        business: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    log(`📊 Found ${contacts.length} contact persons in database`, 'green');
    
    if (contacts.length === 0) {
      log('   No contact persons found in database', 'yellow');
      return;
    }
    
    contacts.forEach((contact, index) => {
      logSubSection(`Contact #${index + 1}: ${contact.firstName} ${contact.lastName}`);
      
      logData('ID', contact.id, 'green');
      logData('First Name', contact.firstName);
      logData('Last Name', contact.lastName);
      logData('Title', contact.title);
      logData('Email', contact.email);
      logData('Phone', contact.phone);
      logData('Department', contact.department);
      logData('Is Primary', contact.isPrimary);
      logData('Is Active', contact.isActive);
      logData('Business ID', contact.businessId);
      logData('Created At', contact.createdAt);
      logData('Updated At', contact.updatedAt);
      
      if (contact.business) {
        logSubSection('Associated Business');
        logData('Business Name', contact.business.companyName);
        logData('Business Website', contact.business.website);
      }
    });
    
  } catch (error) {
    log(`❌ Error viewing contact persons: ${error.message}`, 'red');
  }
}

// 3. LLM PROCESSING DATA
async function viewLLMProcessingData() {
  logSection('LLM PROCESSING - ALL AI PROCESSING RESULTS');
  
  try {
    const llmSessions = await prisma.lLMProcessingSession.findMany({
      include: {
        llmResults: {
          include: {
            searchResult: true,
            savedBusiness: true
          }
        },
        searchSession: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    log(`📊 Found ${llmSessions.length} LLM processing sessions in database`, 'green');
    
    if (llmSessions.length === 0) {
      log('   No LLM processing sessions found in database', 'yellow');
      return;
    }
    
    llmSessions.forEach((session, index) => {
      logSubSection(`LLM Session #${index + 1}: ${session.id}`);
      
      logData('Session ID', session.id, 'green');
      logData('Search Session ID', session.searchSessionId);
      logData('Status', session.status);
      logData('Total Results', session.totalResults);
      logData('Processed Results', session.processedResults);
      logData('Accepted Count', session.acceptedCount);
      logData('Rejected Count', session.rejectedCount);
      logData('Error Count', session.errorCount);
      logData('Start Time', session.startTime);
      logData('End Time', session.endTime);
      logData('Error Message', session.errorMessage);
      logData('Extraction Quality', session.extractionQuality);
      logData('Created At', session.createdAt);
      logData('Updated At', session.updatedAt);
      
      // LLM Results
      if (session.llmResults && session.llmResults.length > 0) {
        logSubSection('LLM Processing Results');
        session.llmResults.forEach((result, rIndex) => {
          log(`     Result ${rIndex + 1}:`, 'yellow');
          logData('     ID', result.id);
          logData('     Status', result.status);
          logData('     Confidence', result.confidence);
          logData('     Is Company Website', result.isCompanyWebsite);
          logData('     Company Name', result.companyName);
          logData('     Website', result.website);
          logData('     Extracted From', result.extractedFrom);
          logData('     City', result.city);
          logData('     State/Province', result.stateProvince);
          logData('     Country', result.country);
          logData('     Categories', result.categories);
          logData('     Rejection Reason', result.rejectionReason);
          logData('     Error Message', result.errorMessage);
          logData('     LLM Prompt', result.llmPrompt);
          logData('     LLM Response', result.llmResponse);
          logData('     Processing Time', result.processingTime);
          logData('     Saved Business ID', result.savedBusinessId);
          logData('     Created At', result.createdAt);
          
          if (result.searchResult) {
            logSubSection('     Search Result Source');
            logData('     Search Title', result.searchResult.title);
            logData('     Search URL', result.searchResult.url);
            logData('     Search Description', result.searchResult.description);
          }
          
          if (result.savedBusiness) {
            logSubSection('     Saved Business');
            logData('     Business Name', result.savedBusiness.companyName);
            logData('     Business Website', result.savedBusiness.website);
          }
        });
      }
    });
    
  } catch (error) {
    log(`❌ Error viewing LLM processing data: ${error.message}`, 'red');
  }
}

// 4. SEARCH SESSIONS DATA
async function viewSearchSessionsData() {
  logSection('SEARCH SESSIONS - ALL SEARCH OPERATIONS');
  
  try {
    const searchSessions = await prisma.searchSession.findMany({
      include: {
        llmProcessing: true,
        searchResults: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    log(`📊 Found ${searchSessions.length} search sessions in database`, 'green');
    
    if (searchSessions.length === 0) {
      log('   No search sessions found in database', 'yellow');
      return;
    }
    
    searchSessions.forEach((session, index) => {
      logSubSection(`Search Session #${index + 1}: ${session.id}`);
      
      logData('Session ID', session.id, 'green');
      logData('Primary Query', session.query);
      logData('All Search Queries', session.searchQueries);
      logData('Industry', session.industry);
      logData('Location', session.location);
      logData('City', session.city);
      logData('State/Province', session.stateProvince);
      logData('Country', session.country);
      logData('API Key', session.apiKey);
      logData('Search Engine ID', session.searchEngineId);
      logData('Results Limit', session.resultsLimit);
      logData('Filters', session.filters);
      logData('Total Results', session.totalResults);
      logData('Successful Queries', session.successfulQueries);
      logData('Search Time', session.searchTime);
      logData('Status', session.status);
      logData('Error Message', session.errorMessage);
      logData('Created At', session.createdAt);
      logData('Updated At', session.updatedAt);
      
      // Search Results
      if (session.searchResults && session.searchResults.length > 0) {
        logSubSection('Search Results');
        logTable(
          ['Position', 'Title', 'URL', 'Status', 'Is Processed'],
          session.searchResults.map(result => [
            result.position,
            result.title.substring(0, 50) + (result.title.length > 50 ? '...' : ''),
            result.url.substring(0, 50) + (result.url.length > 50 ? '...' : ''),
            result.isProcessed ? '✅' : '⏳',
            result.isProcessed
          ])
        );
      }
    });
    
  } catch (error) {
    log(`❌ Error viewing search sessions: ${error.message}`, 'red');
  }
}

// 5. SEARCH RESULTS DATA
async function viewSearchResultsData() {
  logSection('SEARCH RESULTS - ALL SEARCH RESULTS');
  
  try {
    const searchResults = await prisma.searchResult.findMany({
      include: {
        searchSession: true,
        llmProcessing: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    log(`📊 Found ${searchResults.length} search results in database`, 'green');
    
    if (searchResults.length === 0) {
      log('   No search results found in database', 'yellow');
      return;
    }
    
    // Show summary table
    logSubSection('Search Results Summary');
    logTable(
      ['Position', 'Title', 'URL', 'Session', 'Processed', 'LLM Results'],
      searchResults.map(result => [
        result.position,
        result.title.substring(0, 40) + (result.title.length > 40 ? '...' : ''),
        result.url.substring(0, 40) + (result.url.length > 40 ? '...' : ''),
        result.searchSessionId.substring(0, 8) + '...',
        result.isProcessed ? '✅' : '⏳',
        result.llmProcessing.length
      ])
    );
    
    // Show detailed results for first few
    const detailedResults = searchResults.slice(0, 5);
    detailedResults.forEach((result, index) => {
      logSubSection(`Detailed Result #${index + 1}: ${result.title.substring(0, 50)}`);
      
      logData('ID', result.id, 'green');
      logData('Position', result.position);
      logData('Title', result.title);
      logData('URL', result.url);
      logData('Display URL', result.displayUrl);
      logData('Description', result.description);
      logData('Snippet', result.snippet);
      logData('Cache ID', result.cacheId);
      logData('Query', result.query);
      logData('Date', result.date);
      logData('Is Processed', result.isProcessed);
      logData('Created At', result.createdAt);
      
      if (result.searchSession) {
        logSubSection('Search Session Info');
        logData('Session ID', result.searchSession.id);
        logData('Primary Query', result.searchSession.query);
        logData('Industry', result.searchSession.industry);
        logData('Location', result.searchSession.location);
      }
    });
    
  } catch (error) {
    log(`❌ Error viewing search results: ${error.message}`, 'red');
  }
}

// 6. INDUSTRIES DATA
async function viewIndustriesData() {
  logSection('INDUSTRIES - ALL BUSINESS INDUSTRIES');
  
  try {
    const industries = await prisma.industry.findMany({
      include: {
        businesses: {
          include: {
            business: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    log(`📊 Found ${industries.length} industries in database`, 'green');
    
    if (industries.length === 0) {
      log('   No industries found in database', 'yellow');
      return;
    }
    
    industries.forEach((industry, index) => {
      logSubSection(`Industry #${index + 1}: ${industry.name}`);
      
      logData('ID', industry.id, 'green');
      logData('Name', industry.name);
      logData('Description', industry.description);
      logData('Created At', industry.createdAt);
      logData('Updated At', industry.updatedAt);
      
      if (industry.businesses && industry.businesses.length > 0) {
        logSubSection('Businesses in This Industry');
        industry.businesses.forEach((businessIndustry, bIndex) => {
          log(`     Business ${bIndex + 1}:`, 'yellow');
          logData('     Business Name', businessIndustry.business.companyName);
          logData('     Business Website', businessIndustry.business.website);
          logData('     Is Primary', businessIndustry.isPrimary);
        });
      }
    });
    
  } catch (error) {
    log(`❌ Error viewing industries: ${error.message}`, 'red');
  }
}

// 7. SITE SETTINGS DATA
async function viewSiteSettingsData() {
  logSection('SITE SETTINGS - CONFIGURATION DATA');
  
  try {
    const siteSettings = await prisma.siteSettings.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    log(`📊 Found ${siteSettings.length} site settings records in database`, 'green');
    
    if (siteSettings.length === 0) {
      log('   No site settings found in database', 'yellow');
      return;
    }
    
    siteSettings.forEach((settings, index) => {
      logSubSection(`Site Settings #${index + 1}`);
      
      logData('ID', settings.id, 'green');
      logData('Logo URL', settings.logoUrl);
      logData('Logo Light URL', settings.logoLightUrl);
      logData('Logo Dark URL', settings.logoDarkUrl);
      logData('Favicon URL', settings.faviconUrl);
      logData('Company Phone', settings.companyPhone);
      logData('Company Email', settings.companyEmail);
      logData('Company Address', settings.companyAddress);
      logData('SMTP Enabled', settings.smtpEnabled);
      logData('SMTP Host', settings.smtpHost);
      logData('SMTP Port', settings.smtpPort);
      logData('Cloudinary Enabled', settings.cloudinaryEnabled);
      logData('Created At', settings.createdAt);
      logData('Updated At', settings.updatedAt);
    });
    
  } catch (error) {
    log(`❌ Error viewing site settings: ${error.message}`, 'red');
  }
}

// 8. DATABASE STATISTICS
async function viewDatabaseStatistics() {
  logSection('DATABASE STATISTICS - OVERALL SUMMARY');
  
  try {
    const stats = {
      businesses: await prisma.businessDirectory.count(),
      contacts: await prisma.contactPerson.count(),
      industries: await prisma.industry.count(),
      searchSessions: await prisma.searchSession.count(),
      searchResults: await prisma.searchResult.count(),
      llmSessions: await prisma.lLMProcessingSession.count(),
      llmResults: await prisma.lLMProcessingResult.count(),
      siteSettings: await prisma.siteSettings.count()
    };
    
    log('📊 Database Statistics:', 'green');
    logData('Total Businesses', stats.businesses, 'green');
    logData('Total Contact Persons', stats.contacts, 'green');
    logData('Total Industries', stats.industries, 'green');
    logData('Total Search Sessions', stats.searchSessions, 'green');
    logData('Total Search Results', stats.searchResults, 'green');
    logData('Total LLM Sessions', stats.llmSessions, 'green');
    logData('Total LLM Results', stats.llmResults, 'green');
    logData('Total Site Settings', stats.siteSettings, 'green');
    
    // Recent activity
    const recentBusinesses = await prisma.businessDirectory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { companyName: true, website: true, createdAt: true }
    });
    
    if (recentBusinesses.length > 0) {
      logSubSection('Recent Business Additions');
      recentBusinesses.forEach((business, index) => {
        log(`   ${index + 1}. ${business.companyName || business.website}`, 'yellow');
        log(`      Added: ${business.createdAt.toLocaleDateString()}`, 'white');
      });
    }
    
    // Data quality metrics
    const activeBusinesses = await prisma.businessDirectory.count({
      where: { isActive: true }
    });
    
    const businessesWithContacts = await prisma.businessDirectory.count({
      where: {
        contact_persons: {
          some: {}
        }
      }
    });
    
    const businessesWithIndustries = await prisma.businessDirectory.count({
      where: {
        industries: {
          some: {}
        }
      }
    });
    
    logSubSection('Data Quality Metrics');
    logData('Active Businesses', activeBusinesses, 'green');
    logData('Businesses with Contacts', businessesWithContacts, 'green');
    logData('Businesses with Industries', businessesWithIndustries, 'green');
    logData('Data Completeness', `${Math.round((businessesWithContacts / stats.businesses) * 100)}%`, 'green');
    
  } catch (error) {
    log(`❌ Error viewing database statistics: ${error.message}`, 'red');
  }
}

// Run the comprehensive database viewer
if (require.main === module) {
  viewAllDatabaseData().catch(console.error);
}

module.exports = { viewAllDatabaseData };

#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Normalizes a URL to prevent duplicates with slight variations
 * @param url The URL to normalize
 * @returns Normalized URL string
 */
function normalizeWebsiteUrl(url) {
  if (!url) return '';
  
  return url
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '') // Remove http:// or https://
    .replace(/^www\./, '') // Remove www.
    .replace(/\/$/, '') // Remove trailing slash
    .split('?')[0] // Remove query parameters
    .split('#')[0]; // Remove hash fragments
}

/**
 * Finds and handles duplicate companies
 */
async function cleanupDuplicateCompanies() {
  try {
    console.log('🧹 Starting duplicate company cleanup...\n');
    
    // Get all companies
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`📊 Total companies found: ${companies.length}\n`);
    
    // Group companies by normalized website
    const normalizedGroups = {};
    companies.forEach(company => {
      const normalized = normalizeWebsiteUrl(company.website);
      if (!normalizedGroups[normalized]) {
        normalizedGroups[normalized] = [];
      }
      normalizedGroups[normalized].push(company);
    });
    
    // Find groups with multiple companies
    const duplicateGroups = Object.entries(normalizedGroups)
      .filter(([normalized, companies]) => companies.length > 1)
      .map(([normalized, companies]) => ({ normalized, companies }));
    
    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicate companies found!');
      return;
    }
    
    console.log(`⚠️  Found ${duplicateGroups.length} groups of potential duplicates:\n`);
    
    let totalMerged = 0;
    
    for (const { normalized, companies } of duplicateGroups) {
      console.log(`🔍 Processing group: ${normalized}`);
      console.log(`   Companies: ${companies.map(c => `${c.name} (ID: ${c.id})`).join(', ')}`);
      
      // Sort by creation date - keep the oldest one
      const sortedCompanies = companies.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      const keepCompany = sortedCompanies[0]; // Oldest company
      const mergeCompanies = sortedCompanies.slice(1); // Newer companies to merge
      
      console.log(`   Keeping: ${keepCompany.name} (ID: ${keepCompany.id}) - oldest`);
      console.log(`   Merging: ${mergeCompanies.map(c => c.name).join(', ')}`);
      
      // Merge data from newer companies into the oldest one
      for (const mergeCompany of mergeCompanies) {
        try {
          // Update the company to be merged with the normalized URL
          await prisma.company.update({
            where: { id: mergeCompany.id },
            data: {
              website: keepCompany.website, // Use the same website
              baseUrl: keepCompany.baseUrl || keepCompany.website,
              isActive: false, // Mark as inactive
              updatedAt: new Date()
            }
          });
          
          console.log(`   ✅ Merged ${mergeCompany.name} into ${keepCompany.name}`);
          totalMerged++;
          
        } catch (error) {
          console.log(`   ❌ Failed to merge ${mergeCompany.name}: ${error.message}`);
        }
      }
      
      console.log('');
    }
    
    console.log(`🎯 Cleanup completed! Merged ${totalMerged} companies.`);
    
    // Show final count
    const finalCount = await prisma.company.count();
    console.log(`📊 Final company count: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Normalizes all existing website URLs to prevent future duplicates
 */
async function normalizeExistingUrls() {
  try {
    console.log('\n🔧 Normalizing existing website URLs...\n');
    
    const companies = await prisma.company.findMany({
      select: { id: true, website: true, baseUrl: true }
    });
    
    let updated = 0;
    
    for (const company of companies) {
      const normalizedWebsite = normalizeWebsiteUrl(company.website);
      const normalizedBaseUrl = company.baseUrl ? normalizeWebsiteUrl(company.baseUrl) : null;
      
      // Check if normalization would change anything
      if (normalizedWebsite !== company.website || 
          (normalizedBaseUrl && normalizedBaseUrl !== company.baseUrl)) {
        
        try {
          await prisma.company.update({
            where: { id: company.id },
            data: {
              website: `https://${normalizedWebsite}`,
              baseUrl: normalizedBaseUrl ? `https://${normalizedBaseUrl}` : `https://${normalizedWebsite}`,
              updatedAt: new Date()
            }
          });
          
          console.log(`✅ Normalized ${company.website} → https://${normalizedWebsite}`);
          updated++;
          
        } catch (error) {
          console.log(`❌ Failed to normalize ${company.website}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n🎯 URL normalization completed! Updated ${updated} companies.`);
    
  } catch (error) {
    console.error('❌ Error during URL normalization:', error);
  }
}

if (require.main === module) {
  (async () => {
    await cleanupDuplicateCompanies();
    await normalizeExistingUrls();
    console.log('\n✅ All cleanup operations completed successfully!');
    process.exit(0);
  })().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { cleanupDuplicateCompanies, normalizeExistingUrls };

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupNonBusinessCompanies() {
  try {
    console.log('🔍 Starting cleanup of non-business companies...');
    
    // Get all companies
    const companies = await prisma.company.findMany({
      include: {
        enrichments: true
      }
    });
    
    console.log(`📊 Found ${companies.length} total companies`);
    
    // Identify potential non-business companies based on common patterns
    const nonBusinessPatterns = [
      // Educational institutions
      /university|college|school|academy|institute|polytechnic|academic/i,
      // Government entities
      /government|gov\.|municipal|city of|county of|state of/i,
      // Non-profits and organizations
      /foundation|charity|non-profit|nonprofit|ngo|organization/i,
      // Personal websites
      /blog|portfolio|personal|resume|cv/i
    ];
    
    const potentialNonBusinesses = companies.filter(company => {
      const name = company.name || '';
      const description = company.description || '';
      const website = company.website || '';
      
      return nonBusinessPatterns.some(pattern => 
        pattern.test(name) || pattern.test(description) || pattern.test(website)
      );
    });
    
    console.log(`🚫 Found ${potentialNonBusinesses.length} potential non-business companies:`);
    
    potentialNonBusinesses.forEach(company => {
      console.log(`  - ${company.name} (${company.website})`);
      if (company.description) {
        console.log(`    Description: ${company.description.substring(0, 100)}...`);
      }
    });
    
    // Check if any have enrichment data that shows isBusiness: false
    const companiesWithEnrichment = companies.filter(company => 
      company.enrichments && company.enrichments.length > 0
    );
    
    console.log(`\n📋 Companies with enrichment data: ${companiesWithEnrichment.length}`);
    
    // Look for companies that might have been incorrectly saved
    const suspiciousCompanies = [];
    
    for (const company of companiesWithEnrichment) {
      for (const enrichment of company.enrichments) {
        try {
          const enrichmentData = enrichment.data;
          if (enrichmentData && 
              enrichmentData.finalResult && 
              enrichmentData.finalResult.analysis && 
              enrichmentData.finalResult.analysis.isBusiness === false) {
            
            suspiciousCompanies.push({
              company,
              enrichment,
              reasoning: enrichmentData.finalResult.analysis.reasoning,
              confidence: enrichmentData.finalResult.analysis.confidence
            });
          }
        } catch (error) {
          // Skip enrichments with invalid data
        }
      }
    }
    
    if (suspiciousCompanies.length > 0) {
      console.log(`\n⚠️ Found ${suspiciousCompanies.length} companies that were saved despite isBusiness: false:`);
      
      suspiciousCompanies.forEach(({ company, enrichment, reasoning, confidence }) => {
        console.log(`  - ${company.name} (${company.website})`);
        console.log(`    Reasoning: ${reasoning}`);
        console.log(`    Confidence: ${confidence}`);
        console.log(`    Enrichment ID: ${enrichment.id}`);
      });
      
      // Ask user if they want to remove these companies
      console.log('\n❓ These companies should not have been saved. Would you like to:');
      console.log('  1. Remove them completely');
      console.log('  2. Mark them as inactive');
      console.log('  3. Just list them (no action)');
      
      // For now, just list them - user can decide what to do
      console.log('\n💡 To remove them, you can run:');
      console.log('   npm run cleanup-non-business-companies -- --remove');
      console.log('   npm run cleanup-non-business-companies -- --deactivate');
      
    } else {
      console.log('\n✅ No companies found that were incorrectly saved despite isBusiness: false');
    }
    
    // Summary
    console.log('\n📊 Cleanup Summary:');
    console.log(`  - Total companies: ${companies.length}`);
    console.log(`  - Potential non-businesses: ${potentialNonBusinesses.length}`);
    console.log(`  - Companies with enrichment data: ${companiesWithEnrichment.length}`);
    console.log(`  - Suspicious companies (isBusiness: false): ${suspiciousCompanies.length}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const shouldRemove = args.includes('--remove');
const shouldDeactivate = args.includes('--deactivate');

if (shouldRemove || shouldDeactivate) {
  console.log('⚠️ This will modify the database. Make sure you have a backup!');
  // TODO: Implement actual removal/deactivation logic
  console.log('Feature not yet implemented. Please implement the logic in this script.');
} else {
  cleanupNonBusinessCompanies();
}

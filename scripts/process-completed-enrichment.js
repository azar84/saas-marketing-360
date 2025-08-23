#!/usr/bin/env node

/**
 * Process all completed enrichment jobs that haven't been saved to the database
 * This script will find completed basic-enrichment jobs and process their results
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function processCompletedEnrichmentJobs() {
  try {
    console.log('🔍 Finding completed enrichment jobs...');
    
    // Find all completed basic-enrichment jobs
    const completedJobs = await prisma.job.findMany({
      where: {
        type: 'basic-enrichment',
        status: 'completed',
        result: {
          not: null
        }
      }
    });
    
    console.log(`📊 Found ${completedJobs.length} completed enrichment jobs`);
    
    if (completedJobs.length === 0) {
      console.log('✅ No completed enrichment jobs to process');
      return;
    }
    
    // Process each completed job
    for (const job of completedJobs) {
      try {
        console.log(`\n🔄 Processing job ${job.id} for ${job.metadata?.websiteUrl || 'unknown website'}`);
        
        // Check if this company already exists in the database
        const websiteUrl = job.metadata?.websiteUrl;
        if (websiteUrl) {
          const existingCompany = await prisma.company.findFirst({
            where: {
              website: websiteUrl
            }
          });
          
          if (existingCompany) {
            console.log(`⚠️ Company already exists in database: ${existingCompany.name} (${existingCompany.website})`);
            continue;
          }
        }
        
        // Process the enrichment result
        const response = await fetch('http://localhost:3000/api/admin/enrichment/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrichmentResult: job.result,
            jobId: job.id
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Successfully processed job ${job.id}:`, {
            businessId: data.businessId,
            created: data.created,
            updated: data.updated
          });
        } else {
          const errorText = await response.text();
          console.error(`❌ Failed to process job ${job.id}:`, errorText);
        }
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing job ${job.id}:`, error.message);
      }
    }
    
    console.log('\n✅ Finished processing completed enrichment jobs');
    
  } catch (error) {
    console.error('❌ Error in processCompletedEnrichmentJobs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  processCompletedEnrichmentJobs()
    .then(() => {
      console.log('🎉 Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { processCompletedEnrichmentJobs };

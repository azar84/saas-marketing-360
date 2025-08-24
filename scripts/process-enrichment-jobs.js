#!/usr/bin/env node

/**
 * Standalone script to process completed enrichment jobs
 * This can be run manually or via cron job
 * Usage: node scripts/process-enrichment-jobs.js
 */

const { PrismaClient } = require('@prisma/client');

async function processCompletedEnrichmentJobs() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Starting enrichment job processing...');
    
    // Get all completed enrichment jobs that haven't been processed yet
    const completedEnrichmentJobs = await prisma.job.findMany({
      where: {
        type: 'basic-enrichment',
        status: 'completed'
      }
    });

    const unprocessedJobs = completedEnrichmentJobs.filter(job => {
      if (!job.result || typeof job.result !== 'object') return false;
      const result = job.result;
      return !result.processed;
    });

    if (unprocessedJobs.length === 0) {
      console.log('ℹ️ No unprocessed completed enrichment jobs found');
      return;
    }

    console.log(`🔄 Processing ${unprocessedJobs.length} completed enrichment jobs`);

    for (const job of unprocessedJobs) {
      try {
        if (!job.result || typeof job.result !== 'object') {
          console.log(`⚠️ Job ${job.id} has invalid result format, skipping`);
          continue;
        }

        const jobResult = job.result;
        
        // Call the enrichment process API to save data
        const processResponse = await fetch('http://localhost:3000/api/admin/enrichment/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enrichmentResult: {
              data: jobResult.data,
              metadata: {
                websiteUrl: job.metadata?.websiteUrl || jobResult.data?.metadata?.baseUrl || 'unknown'
              }
            },
            jobId: job.id
          })
        });

        if (processResponse.ok) {
          const result = await processResponse.json();
          console.log(`✅ Successfully processed enrichment job ${job.id}:`, result.message);
          
          // Mark job as processed to avoid reprocessing
          await updateJobAsProcessed(job.id);
        } else {
          const errorText = await processResponse.text();
          console.error(`❌ Failed to process enrichment job ${job.id}:`, errorText);
        }
      } catch (error) {
        console.error(`❌ Error processing enrichment job ${job.id}:`, error);
      }
    }
    
    console.log('✅ Enrichment job processing completed');
  } catch (error) {
    console.error('❌ Error processing completed enrichment jobs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function updateJobAsProcessed(jobId) {
  const prisma = new PrismaClient();
  
  try {
    const existingJob = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existingJob || !existingJob.result || typeof existingJob.result !== 'object') {
      console.log(`⚠️ Job ${jobId} has no valid result to update`);
      return;
    }

    const existingResult = existingJob.result;
    
    await prisma.job.update({
      where: { id: jobId },
      data: {
        result: {
          ...existingResult,
          processed: true
        }
      }
    });

    console.log(`✅ Job ${jobId} marked as processed`);
  } catch (error) {
    console.error(`❌ Error marking job ${jobId} as processed:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  processCompletedEnrichmentJobs()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { processCompletedEnrichmentJobs, updateJobAsProcessed };

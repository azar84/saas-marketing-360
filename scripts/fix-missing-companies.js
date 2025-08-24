#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function fixMissingCompanies() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Starting to fix missing companies...');
    
    // Get all completed enrichment jobs
    const completedJobs = await prisma.job.findMany({
      where: {
        type: 'basic-enrichment',
        status: 'completed'
      }
    });
    
    console.log(`📊 Found ${completedJobs.length} completed enrichment jobs`);
    
    // Filter jobs that have data but haven't been saved
    const jobsWithData = completedJobs.filter(job => {
      if (!job.result || typeof job.result !== 'object') return false;
      const result = job.result;
      return result.data && result.data.company && result.data.contact;
    });
    
    console.log(`✅ Found ${jobsWithData.length} jobs with valid data`);
    
    // Check which companies are already in the database
    const existingCompanies = await prisma.company.findMany({
      select: { website: true }
    });
    
    const existingWebsites = new Set(existingCompanies.map(c => c.website));
    
    // Filter jobs for companies that don't exist in the database
    const jobsToProcess = jobsWithData.filter(job => {
      const website = job.result.data.company.website;
      return !existingWebsites.has(website);
    });
    
    console.log(`🆕 Found ${jobsToProcess.length} companies that need to be saved`);
    
    if (jobsToProcess.length === 0) {
      console.log('🎉 All companies are already saved!');
      return;
    }
    
    // Process each missing company
    for (const job of jobsToProcess) {
      try {
        console.log(`\n🔄 Processing ${job.result.data.company.name} (${job.result.data.company.website})...`);
        
        // Call the enrichment processing API
        const response = await fetch('http://localhost:3000/api/admin/enrichment/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enrichmentResult: {
              data: job.result.data,
              metadata: {
                websiteUrl: job.metadata?.websiteUrl || job.result.data.metadata?.baseUrl
              }
            }
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Failed to process ${job.result.data.company.name}: ${response.status} - ${errorText}`);
          continue;
        }
        
        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ Successfully saved ${job.result.data.company.name} (ID: ${result.businessId})`);
          
          // Mark the job as processed in the database
          await prisma.job.update({
            where: { id: job.id },
            data: {
              result: {
                ...job.result,
                processed: true
              }
            }
          });
          
          console.log(`📝 Marked job ${job.id} as processed`);
        } else {
          console.error(`❌ Failed to save ${job.result.data.company.name}: ${result.error}`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${job.result.data.company.name}:`, error.message);
      }
    }
    
    // Final count
    const finalCount = await prisma.company.count();
    console.log(`\n🎯 Final company count: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixMissingCompanies()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixMissingCompanies };

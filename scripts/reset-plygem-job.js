#!/usr/bin/env node

/**
 * Reset the processed flag for the Ply Gem job so it can be processed again
 * Usage: node scripts/reset-plygem-job.js
 */

const { PrismaClient } = require('@prisma/client');

async function resetPlyGemJob() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Resetting Ply Gem job processed flag...');
    
    // Find the Ply Gem job
    const plyGemJob = await prisma.job.findFirst({
      where: {
        id: 'basic_enrichment:1756183710180:ibncz4vf'
      }
    });
    
    if (!plyGemJob) {
      console.log('❌ Ply Gem job not found');
      return;
    }
    
    console.log('📋 Ply Gem job found:', {
      id: plyGemJob.id,
      status: plyGemJob.status,
      processed: plyGemJob.result?.processed
    });
    
    // Reset the processed flag
    const updatedJob = await prisma.job.update({
      where: { id: 'basic_enrichment:1756183710180:ibncz4vf' },
      data: {
        result: {
          ...plyGemJob.result,
          processed: false
        }
      }
    });
    
    console.log('✅ Ply Gem job processed flag reset successfully');
    console.log('   New processed status:', updatedJob.result?.processed);
    
    // Now trigger the enrichment processing task
    console.log('🚀 Triggering enrichment processing task...');
    const response = await fetch('http://localhost:3000/api/admin/scheduler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'trigger',
        taskId: 'process-completed-enrichment'
      })
    });
    
    if (response.ok) {
      console.log('✅ Enrichment processing task triggered successfully');
    } else {
      console.log('❌ Failed to trigger enrichment processing task');
    }
    
  } catch (error) {
    console.error('❌ Error resetting Ply Gem job:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  resetPlyGemJob();
}

module.exports = { resetPlyGemJob };

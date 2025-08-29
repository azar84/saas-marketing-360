#!/usr/bin/env node

/**
 * Test script to manually process the Ply Gem job that should have been saved
 * Usage: node scripts/test-plygem-processing.js
 */

async function testPlyGemProcessing() {
  try {
    console.log('🧪 Testing Ply Gem job processing...');
    
    // Get the job details first
    const jobsResponse = await fetch('http://localhost:3000/api/admin/jobs');
    const jobsData = await jobsResponse.json();
    
    const plyGemJob = jobsData.jobs.find(job => 
      job.id === 'basic_enrichment:1756183710180:ibncz4vf'
    );
    
    if (!plyGemJob) {
      console.log('❌ Ply Gem job not found');
      return;
    }
    
    console.log('📋 Ply Gem job found:', {
      id: plyGemJob.id,
      websiteUrl: plyGemJob.metadata.websiteUrl,
      status: plyGemJob.status,
      isBusiness: plyGemJob.result.data.analysis.isBusiness,
      companyName: plyGemJob.result.data.analysis.companyName
    });
    
    // Test the enrichment processing API directly
    const processResponse = await fetch('http://localhost:3000/api/admin/enrichment/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enrichmentResult: plyGemJob.result,
        jobId: plyGemJob.id
      })
    });

    if (processResponse.ok) {
      const result = await processResponse.json();
      console.log('✅ Ply Gem processing result:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('🎉 Ply Gem should be saved to company model!');
        console.log(`   Business ID: ${result.businessId}`);
        console.log(`   Created: ${result.created}`);
        console.log(`   Updated: ${result.updated}`);
        console.log(`   Message: ${result.message}`);
      } else {
        console.log('❌ Ply Gem processing failed:');
        console.log(`   Error: ${result.error}`);
      }
    } else {
      const errorText = await processResponse.text();
      console.error('❌ API call failed:', processResponse.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testPlyGemProcessing();
}

module.exports = { testPlyGemProcessing };

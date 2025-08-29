#!/usr/bin/env node

/**
 * Test script to test Ply Gem processing with the fixed data structure
 * Usage: node scripts/test-plygem-fixed.js
 */

async function testPlyGemFixed() {
  try {
    console.log('🧪 Testing Ply Gem processing with fixed data structure...');
    
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
    
    // Fix the data structure by adding the missing input field (same as scheduler)
    const fixedJobResult = {
      ...plyGemJob.result,
      data: {
        ...plyGemJob.result.data,
        input: {
          websiteUrl: plyGemJob.metadata.websiteUrl || 'unknown'
        }
      }
    };
    
    console.log('🔧 Fixed data structure:', {
      hasInput: !!fixedJobResult.data.input,
      hasWebsiteUrl: !!fixedJobResult.data.input.websiteUrl,
      websiteUrl: fixedJobResult.data.input.websiteUrl
    });
    
    // Test the enrichment processing API with fixed data
    const processResponse = await fetch('http://localhost:3000/api/admin/enrichment/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enrichmentResult: fixedJobResult,
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
  testPlyGemFixed();
}

module.exports = { testPlyGemFixed };

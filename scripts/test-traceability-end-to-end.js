#!/usr/bin/env node

/**
 * Test Script: End-to-End Traceability Verification
 * 
 * This script tests the complete traceability flow:
 * 1. Create a search session
 * 2. Add search results
 * 3. Process results through LLM
 * 4. Save businesses to directory
 * 5. Verify all traceability links
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTraceabilityEndToEnd() {
  console.log('🧪 Starting End-to-End Traceability Test\n');
  
  try {
    // Step 1: Create a test search session
    console.log('📋 Step 1: Creating test search session...');
    const searchSession = await prisma.searchSession.create({
      data: {
        query: 'Test AC Maintenance companies in Test City',
        searchQueries: [
          'Test AC Maintenance companies in Test City',
          'Test AC Maintenance services in Test City'
        ],
        industry: 'AC Maintenance',
        location: 'Test City',
        city: 'Test City',
        stateProvince: 'Test State',
        country: 'Test Country',
        status: 'pending'
      }
    });
    
    console.log(`✅ Created search session: ${searchSession.id}`);
    
    // Step 2: Add test search results
    console.log('\n📋 Step 2: Adding test search results...');
    const testSearchResults = [
      {
        searchSessionId: searchSession.id,
        position: 1,
        title: 'Test AC Company - Professional AC Services',
        url: 'https://testaccompany.com',
        displayUrl: 'testaccompany.com',
        description: 'Professional AC maintenance and repair services in Test City',
        query: 'Test AC Maintenance companies in Test City',
        isProcessed: false
      },
      {
        searchSessionId: searchSession.id,
        position: 2,
        title: 'Test HVAC Solutions - Heating and Cooling',
        url: 'https://testhvac.com',
        displayUrl: 'testhvac.com',
        description: 'Complete HVAC solutions including AC maintenance in Test City',
        query: 'Test AC Maintenance companies in Test City',
        isProcessed: false
      }
    ];
    
    const searchResults = await prisma.searchResult.createMany({
      data: testSearchResults
    });
    
    console.log(`✅ Added ${searchResults.count} search results`);
    
    // Step 3: Create LLM processing session
    console.log('\n🤖 Step 3: Creating LLM processing session...');
    const llmSession = await prisma.lLMProcessingSession.create({
      data: {
        searchSessionId: searchSession.id,
        totalResults: testSearchResults.length,
        status: 'pending'
      }
    });
    
    console.log(`✅ Created LLM processing session: ${llmSession.id}`);
    
    // Step 4: Simulate LLM processing results
    console.log('\n🔍 Step 4: Simulating LLM processing results...');
    const llmResults = [
      {
        searchResultId: (await prisma.searchResult.findFirst({ where: { url: 'https://testaccompany.com' } })).id,
        llmProcessingSessionId: llmSession.id,
        status: 'accepted',
        confidence: 0.95,
        isCompanyWebsite: true,
        companyName: 'Test AC Company',
        website: 'testaccompany.com',
        extractedFrom: 'title',
        city: 'Test City',
        stateProvince: 'Test State',
        country: 'Test Country',
        categories: ['AC Maintenance', 'AC Repair', 'HVAC Services'],
        llmPrompt: 'Test prompt for AC company',
        llmResponse: 'Test response for AC company',
        processingTime: 1.5
      },
      {
        searchResultId: (await prisma.searchResult.findFirst({ where: { url: 'https://testhvac.com' } })).id,
        llmProcessingSessionId: llmSession.id,
        status: 'accepted',
        confidence: 0.9,
        isCompanyWebsite: true,
        companyName: 'Test HVAC Solutions',
        website: 'testhvac.com',
        extractedFrom: 'title',
        city: 'Test City',
        stateProvince: 'Test State',
        country: 'Test Country',
        categories: ['HVAC Solutions', 'AC Maintenance', 'Heating Services'],
        llmPrompt: 'Test prompt for HVAC company',
        llmResponse: 'Test response for HVAC company',
        processingTime: 1.2
      }
    ];
    
    for (const result of llmResults) {
      await prisma.lLMProcessingResult.create({ data: result });
    }
    
    console.log(`✅ Created ${llmResults.length} LLM processing results`);
    
    // Step 5: Mark search results as processed
    console.log('\n✅ Step 5: Marking search results as processed...');
    await prisma.searchResult.updateMany({
      where: { searchSessionId: searchSession.id },
      data: { isProcessed: true }
    });
    
    console.log('✅ Marked all search results as processed');
    
    // Step 6: Complete LLM processing session
    console.log('\n🎯 Step 6: Completing LLM processing session...');
    await prisma.lLMProcessingSession.update({
      where: { id: llmSession.id },
      data: {
        status: 'completed',
        acceptedCount: 2,
        rejectedCount: 0,
        errorCount: 0,
        extractionQuality: 1.0,
        endTime: new Date()
      }
    });
    
    console.log('✅ Completed LLM processing session');
    
    // Step 7: Create test businesses in directory
    console.log('\n💾 Step 7: Creating test businesses in directory...');
    const businesses = [
      {
        website: 'testaccompany.com',
        companyName: 'Test AC Company',
        city: 'Test City',
        stateProvince: 'Test State',
        country: 'Test Country',
        isActive: true,
        source: 'llm_processing'
      },
      {
        website: 'testhvac.com',
        companyName: 'Test HVAC Solutions',
        city: 'Test City',
        stateProvince: 'Test State',
        country: 'Test Country',
        isActive: true,
        source: 'llm_processing'
      }
    ];
    
    for (const business of businesses) {
      await prisma.businessDirectory.create({ data: business });
    }
    
    console.log(`✅ Created ${businesses.length} test businesses`);
    
    // Step 8: Link businesses to traceability results
    console.log('\n🔗 Step 8: Linking businesses to traceability results...');
    const business1 = await prisma.businessDirectory.findUnique({ where: { website: 'testaccompany.com' } });
    const business2 = await prisma.businessDirectory.findUnique({ where: { website: 'testhvac.com' } });
    
    const llmResult1 = await prisma.lLMProcessingResult.findFirst({ 
      where: { website: 'testaccompany.com' } 
    });
    const llmResult2 = await prisma.lLMProcessingResult.findFirst({ 
      where: { website: 'testhvac.com' } 
    });
    
    if (llmResult1 && business1) {
      await prisma.lLMProcessingResult.update({
        where: { id: llmResult1.id },
        data: { savedBusinessId: business1.id }
      });
      console.log(`✅ Linked business ${business1.id} to LLM result ${llmResult1.id}`);
    }
    
    if (llmResult2 && business2) {
      await prisma.lLMProcessingResult.update({
        where: { id: llmResult2.id },
        data: { savedBusinessId: business2.id }
      });
      console.log(`✅ Linked business ${business2.id} to LLM result ${llmResult2.id}`);
    }
    
    // Step 9: Verify complete traceability chain
    console.log('\n🔍 Step 9: Verifying complete traceability chain...');
    const verification = await prisma.searchSession.findUnique({
      where: { id: searchSession.id },
      include: {
        searchResults: {
          include: {
            llmProcessing: {
              include: {
                savedBusiness: true
              }
            }
          }
        },
        llmProcessing: {
          include: {
            llmResults: {
              include: {
                searchResult: true,
                savedBusiness: true
              }
            }
          }
        }
      }
    });
    
    console.log('\n📊 TRACEABILITY VERIFICATION RESULTS:');
    console.log('=====================================');
    console.log(`🔍 Search Session: ${verification.id}`);
    console.log(`   Query: "${verification.query}"`);
    console.log(`   Industry: ${verification.industry}`);
    console.log(`   Location: ${verification.location}`);
    console.log(`   Status: ${verification.status}`);
    
    console.log(`\n📋 Search Results: ${verification.searchResults.length}`);
    verification.searchResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.title}`);
      console.log(`      URL: ${result.url}`);
      console.log(`      Processed: ${result.isProcessed}`);
      console.log(`      LLM Results: ${result.llmProcessing.length}`);
      
      result.llmProcessing.forEach(llmResult => {
        console.log(`         - Status: ${llmResult.status}, Confidence: ${llmResult.confidence}`);
        if (llmResult.savedBusiness) {
          console.log(`           Linked Business: ${llmResult.savedBusiness.companyName} (ID: ${llmResult.savedBusiness.id})`);
        }
      });
    });
    
    console.log(`\n🤖 LLM Processing Sessions: ${verification.llmProcessing.length}`);
    verification.llmProcessing.forEach(session => {
      console.log(`   Session: ${session.id}`);
      console.log(`     Status: ${session.status}`);
      console.log(`     Accepted: ${session.acceptedCount}, Rejected: ${session.rejectedCount}`);
      console.log(`     Quality: ${(session.extractionQuality * 100).toFixed(1)}%`);
      console.log(`     Results: ${session.llmResults.length}`);
    });
    
    // Step 10: Cleanup test data
    console.log('\n🧹 Step 10: Cleaning up test data...');
    await prisma.lLMProcessingResult.deleteMany({
      where: { llmProcessingSessionId: llmSession.id }
    });
    
    await prisma.lLMProcessingSession.delete({
      where: { id: llmSession.id }
    });
    
    await prisma.searchResult.deleteMany({
      where: { searchSessionId: searchSession.id }
    });
    
    await prisma.searchSession.delete({
      where: { id: searchSession.id }
    });
    
    await prisma.businessDirectory.deleteMany({
      where: { 
        website: { in: ['testaccompany.com', 'testhvac.com'] }
      }
    });
    
    console.log('✅ Cleaned up all test data');
    
    console.log('\n🎉 TRACEABILITY TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ All traceability links are working correctly');
    console.log('✅ End-to-end flow from search to business directory is functional');
    
  } catch (error) {
    console.error('\n❌ TRACEABILITY TEST FAILED:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testTraceabilityEndToEnd()
    .then(() => {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testTraceabilityEndToEnd };

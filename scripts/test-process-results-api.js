#!/usr/bin/env node

/**
 * Test script for the process-results API endpoint
 * This tests the complete flow: Google search results → LangChain chain → Business classification
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProcessResultsAPI() {
  try {
    console.log('🧪 Testing Process Results API...\n');

    // Get the latest search session
    const latestSession = await prisma.searchSession.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!latestSession) {
      console.log('⚠️  No search sessions found. Please run a search first.');
      return;
    }

    console.log(`🔍 Using Search Session: ${latestSession.id}`);
    console.log(`   Query: ${latestSession.query}`);
    console.log(`   Total Results: ${latestSession.totalResults}`);

    // Get search results for this session
    const searchResults = await prisma.searchResult.findMany({
      where: { searchSessionId: latestSession.id },
      orderBy: { position: 'asc' },
      take: 5 // Just test with first 5 results
    });

    console.log(`\n📝 Found ${searchResults.length} search results to test with`);

    // Prepare test data
    const testData = {
      searchResults: searchResults.map(result => ({
        title: result.title,
        link: result.url,
        snippet: result.snippet || result.description || '',
        displayLink: result.url
      })),
      industry: 'AC Maintenance',
      location: 'Hampton, Canada',
      city: 'Hampton',
      stateProvince: 'Canada',
      country: 'Canada',
      minConfidence: 0.7,
      dryRun: true, // Don't actually save businesses
      enableTraceability: true,
      searchSessionId: latestSession.id,
      searchResultIds: searchResults.map(r => r.id)
    };

    console.log(`\n📤 Test Data Prepared:`);
    console.log(`   Search Results: ${testData.searchResults.length}`);
    console.log(`   Industry: ${testData.industry}`);
    console.log(`   Location: ${testData.location}`);
    console.log(`   Traceability: ${testData.enableTraceability}`);
    console.log(`   Search Session ID: ${testData.searchSessionId}`);
    console.log(`   Search Result IDs: ${testData.searchResultIds.length}`);

    // Test the API endpoint
    console.log(`\n🚀 Testing API endpoint: /api/admin/industry-search/process-results`);
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/industry-search/process-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`\n✅ API Response:`);
        console.log(`   Success: ${result.success}`);
        console.log(`   Message: ${result.message}`);
        console.log(`   Saved: ${result.data?.saved || 0}`);
        console.log(`   Skipped: ${result.data?.skipped || 0}`);
        console.log(`   Traceability: ${result.data?.traceability?.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   LLM Session ID: ${result.data?.traceability?.llmProcessingSessionId || 'None'}`);
        
        if (result.data?.traceability?.enabled && result.data?.traceability?.llmProcessingSessionId) {
          console.log(`\n🎯 LLM Processing Session Created Successfully!`);
          console.log(`   Session ID: ${result.data.traceability.llmProcessingSessionId}`);
        } else {
          console.log(`\n⚠️  No LLM Processing Session Created`);
        }
      } else {
        const errorText = await response.text();
        console.log(`\n❌ API Error (${response.status}):`);
        console.log(errorText);
      }
    } catch (apiError) {
      console.log(`\n❌ API Call Failed:`);
      console.log(apiError.message);
      
      if (apiError.code === 'ECONNREFUSED') {
        console.log('   Make sure the development server is running on port 3000');
      }
    }

    // Check if any LLM processing sessions were created
    console.log(`\n🔍 Checking for newly created LLM Processing Sessions...`);
    
    const newLLMSessions = await prisma.lLMProcessingSession.findMany({
      where: { searchSessionId: latestSession.id },
      orderBy: { createdAt: 'desc' }
    });

    if (newLLMSessions.length > 0) {
      console.log(`✅ Found ${newLLMSessions.length} LLM Processing Sessions:`);
      newLLMSessions.forEach((session, index) => {
        console.log(`   ${index + 1}. ID: ${session.id}`);
        console.log(`      Status: ${session.status}`);
        console.log(`      Total Results: ${session.totalResults}`);
        console.log(`      Created: ${session.createdAt}`);
      });
    } else {
      console.log(`⚠️  No LLM Processing Sessions found for search session ${latestSession.id}`);
    }

  } catch (error) {
    console.error('❌ Error testing process results API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProcessResultsAPI();

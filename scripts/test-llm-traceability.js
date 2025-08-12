const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLLMTraceability() {
  try {
    console.log('🧪 Testing LLM Traceability System...\n');

    // Check if we have any search sessions
    const searchSessions = await prisma.searchSession.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Found ${searchSessions.length} search sessions`);

    if (searchSessions.length === 0) {
      console.log('⚠️  No search sessions found. Please run a search first.');
      return;
    }

    // Check the most recent search session
    const latestSession = searchSessions[0];
    console.log(`\n🔍 Latest Search Session:`);
    console.log(`   ID: ${latestSession.id}`);
    console.log(`   Query: ${latestSession.query}`);
    console.log(`   All Queries: [${latestSession.searchQueries.join(', ')}]`);
    console.log(`   Total Results: ${latestSession.totalResults}`);
    console.log(`   Status: ${latestSession.status}`);

    // Check search results for this session
    const searchResults = await prisma.searchResult.findMany({
      where: { searchSessionId: latestSession.id },
      orderBy: { position: 'asc' }
    });

    console.log(`\n📝 Search Results: ${searchResults.length} found`);
    searchResults.slice(0, 3).forEach((result, index) => {
      console.log(`   ${index + 1}. "${result.title}" (Query: "${result.query}")`);
    });

    // Check LLM processing sessions
    const llmSessions = await prisma.lLMProcessingSession.findMany({
      where: { searchSessionId: latestSession.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n🤖 LLM Processing Sessions: ${llmSessions.length} found`);

    if (llmSessions.length === 0) {
      console.log('⚠️  No LLM processing sessions found. This suggests traceability is not working.');
      
      // Let's check if there are any LLM processing sessions at all
      const allLLMSessions = await prisma.lLMProcessingSession.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`\n🔍 Checking all LLM Processing Sessions in database: ${allLLMSessions.length} found`);
      
      if (allLLMSessions.length > 0) {
        console.log('   Latest LLM Session:');
        const latestLLM = allLLMSessions[0];
        console.log(`     ID: ${latestLLM.id}`);
        console.log(`     Search Session ID: ${latestLLM.searchSessionId}`);
        console.log(`     Status: ${latestLLM.status}`);
        console.log(`     Created: ${latestLLM.createdAt}`);
        
        // Check if this session belongs to a different search session
        const relatedSearchSession = await prisma.searchSession.findUnique({
          where: { id: latestLLM.searchSessionId }
        });
        
        if (relatedSearchSession) {
          console.log(`     Related Search: "${relatedSearchSession.query}" (${relatedSearchSession.createdAt})`);
        } else {
          console.log(`     ⚠️  Related search session not found!`);
        }
      }
      
      return;
    }

    // Check the most recent LLM session
    const latestLLMSession = llmSessions[0];
    console.log(`\n🤖 Latest LLM Session:`);
    console.log(`   ID: ${latestLLMSession.id}`);
    console.log(`   Status: ${latestLLMSession.status}`);
    console.log(`   Total Results: ${latestLLMSession.totalResults}`);
    console.log(`   Processed Results: ${latestLLMSession.processedResults}`);
    console.log(`   Accepted: ${latestLLMSession.acceptedCount}`);
    console.log(`   Rejected: ${latestLLMSession.rejectedCount}`);

    // Check LLM processing results
    const llmResults = await prisma.lLMProcessingResult.findMany({
      where: { llmProcessingSessionId: latestLLMSession.id },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`\n📊 LLM Processing Results: ${llmResults.length} found`);

    if (llmResults.length === 0) {
      console.log('⚠️  No LLM processing results found. This suggests individual result processing is not working.');
      return;
    }

    // Show sample results
    llmResults.slice(0, 3).forEach((result, index) => {
      console.log(`\n   ${index + 1}. Result Processing:`);
      console.log(`      Status: ${result.status}`);
      console.log(`      Company: ${result.companyName || 'N/A'}`);
      console.log(`      Confidence: ${result.confidence || 'N/A'}`);
      console.log(`      Processing Time: ${result.processingTime || 'N/A'}ms`);
    });

    // Check for any duplicate processing
    const resultIds = llmResults.map(r => r.searchResultId);
    const uniqueResultIds = new Set(resultIds);
    
    if (resultIds.length !== uniqueResultIds.size) {
      console.log(`\n⚠️  DUPLICATION DETECTED!`);
      console.log(`   Total results: ${resultIds.length}`);
      console.log(`   Unique results: ${uniqueResultIds.size}`);
      console.log(`   Duplicates: ${resultIds.length - uniqueResultIds.size}`);
    } else {
      console.log(`\n✅ No duplication detected. Each result processed exactly once.`);
    }

    console.log('\n🎯 Traceability Test Summary:');
    console.log(`   ✅ Search Session: ${latestSession.id}`);
    console.log(`   ✅ Search Results: ${searchResults.length}`);
    console.log(`   ✅ LLM Session: ${latestLLMSession.id}`);
    console.log(`   ✅ LLM Results: ${llmResults.length}`);
    console.log(`   ✅ No Duplication: ${resultIds.length === uniqueResultIds.size ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Error testing LLM traceability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLLMTraceability();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTraceability() {
  try {
    console.log('🔍 Testing Traceability System...\n');

    // Test 1: Check if traceability tables exist
    console.log('1. Checking traceability tables...');
    
    const tableCounts = await Promise.all([
      prisma.searchSession.count(),
      prisma.searchResult.count(),
      prisma.lLMProcessingSession.count(),
      prisma.lLMProcessingResult.count()
    ]);

    console.log(`   ✅ Search Sessions: ${tableCounts[0]}`);
    console.log(`   ✅ Search Results: ${tableCounts[1]}`);
    console.log(`   ✅ LLM Processing Sessions: ${tableCounts[2]}`);
    console.log(`   ✅ LLM Processing Results: ${tableCounts[3]}`);

    // Test 2: Create a test search session
    console.log('\n2. Creating test search session...');
    
    const testSession = await prisma.searchSession.create({
      data: {
        searchQueries: ['test query 1', 'test query 2'],
        industry: 'Test Industry',
        location: 'Test Location',
        city: 'Test City',
        stateProvince: 'TS',
        country: 'Test Country',
        totalResults: 10,
        successfulQueries: 2,
        searchTime: 1.5,
        status: 'completed'
      }
    });

    console.log(`   ✅ Created session: ${testSession.id}`);

    // Test 3: Create test search results
    console.log('\n3. Creating test search results...');
    
    const testResults = await Promise.all([
      prisma.searchResult.create({
        data: {
          searchSessionId: testSession.id,
          position: 1,
          title: 'Test Company 1',
          url: 'https://test1.com',
          displayUrl: 'test1.com',
          description: 'Test description 1',
          query: 'test query 1',
          isProcessed: false
        }
      }),
      prisma.searchResult.create({
        data: {
          searchSessionId: testSession.id,
          position: 2,
          title: 'Test Company 2',
          url: 'https://test2.com',
          displayUrl: 'test2.com',
          description: 'Test description 2',
          query: 'test query 1',
          isProcessed: false
        }
      })
    ]);

    console.log(`   ✅ Created ${testResults.length} search results`);

    // Test 4: Create test LLM processing session
    console.log('\n4. Creating test LLM processing session...');
    
    const testLLMSession = await prisma.lLMProcessingSession.create({
      data: {
        searchSessionId: testSession.id,
        status: 'completed',
        totalResults: 2,
        processedResults: 2,
        acceptedCount: 1,
        rejectedCount: 1,
        errorCount: 0,
        extractionQuality: 0.75
      }
    });

    console.log(`   ✅ Created LLM session: ${testLLMSession.id}`);

    // Test 5: Create test LLM processing results
    console.log('\n5. Creating test LLM processing results...');
    
    const testLLMResults = await Promise.all([
      prisma.lLMProcessingResult.create({
        data: {
          searchResultId: testResults[0].id,
          llmProcessingSessionId: testLLMSession.id,
          status: 'accepted',
          confidence: 0.85,
          isCompanyWebsite: true,
          companyName: 'Test Company 1',
          extractedFrom: 'website',
          city: 'Test City',
          stateProvince: 'TS',
          country: 'Test Country',
          categories: ['Technology', 'Software']
        }
      }),
      prisma.lLMProcessingResult.create({
        data: {
          searchResultId: testResults[1].id,
          llmProcessingSessionId: testLLMSession.id,
          status: 'rejected',
          confidence: 0.45,
          rejectionReason: 'Not a company website',
          extractedFrom: 'website'
        }
      })
    ]);

    console.log(`   ✅ Created ${testLLMResults.length} LLM results`);

    // Test 6: Query the traceability data
    console.log('\n6. Querying traceability data...');
    
    const sessionWithData = await prisma.searchSession.findUnique({
      where: { id: testSession.id },
      include: {
        searchResults: {
          include: {
            llmProcessing: true
          }
        },
        llmProcessing: {
          include: {
            llmResults: true
          }
        }
      }
    });

    console.log(`   ✅ Retrieved session with ${sessionWithData.searchResults.length} results`);
    console.log(`   ✅ Retrieved session with ${sessionWithData.llmProcessing.length} LLM sessions`);

    // Test 7: Clean up test data
    console.log('\n7. Cleaning up test data...');
    
    await Promise.all([
      prisma.lLMProcessingResult.deleteMany({
        where: { llmProcessingSessionId: testLLMSession.id }
      }),
      prisma.lLMProcessingSession.delete({
        where: { id: testLLMSession.id }
      }),
      prisma.searchResult.deleteMany({
        where: { searchSessionId: testSession.id }
      }),
      prisma.searchSession.delete({
        where: { id: testSession.id }
      })
    ]);

    console.log('   ✅ Cleaned up all test data');

    console.log('\n🎉 All traceability tests passed successfully!');
    console.log('   The system is ready to use.');

  } catch (error) {
    console.error('❌ Traceability test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTraceability();

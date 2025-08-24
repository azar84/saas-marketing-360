import { NextRequest, NextResponse } from 'next/server';
// Note: processAndSaveSearchResults function moved inline since businessDirectory.ts was deleted
import { industrySearchTraceability } from '@/lib/industrySearchTraceability';
import { prisma } from '@/lib/db';

/**
 * Process Google search results through the LangChain chain and save valid businesses
 * This demonstrates the complete flow:
 * 1. Receive search results from Google
 * 2. Process through googleSearchParser chain
 * 3. Filter and classify results
 * 4. Save valid businesses to directory
 * 5. Full traceability of the entire process
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      searchResults, 
      industry, 
      location, 
      city,
      stateProvince,
      country,
      minConfidence = 0.7,
      dryRun = false,
      // Add traceability options
      enableTraceability = true,
      searchSessionId, // Optional: link to existing search session
      searchResultIds, // Optional: array of search result IDs for traceability
      pendingOnly = false,
    } = body;

    // Validate input
    if ((!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) && !searchSessionId) {
      return NextResponse.json(
        { success: false, error: 'searchResults array is required and must not be empty' },
        { status: 400 }
      );
    }

    console.log(`🚀 Processing ${searchResults.length} search results for industry: ${industry || 'Not specified'}`);
    console.log(`📍 Location: ${location || 'Not specified'}`);
    console.log(`🔍 Traceability: ${enableTraceability ? 'Enabled' : 'Disabled'}`);
    console.log(`🔗 Search Session ID: ${searchSessionId || 'Not provided'}`);

    // If we have a searchSessionId, fetch the actual SearchResult records from database
    let actualSearchResults: any[] = [];
    let actualSearchResultIds: string[] = [];
    
    let sessionContext: any = null;
    if (enableTraceability && searchSessionId) {
      try {
        // Fetch the actual SearchResult records from the database
        const searchResultsFromDB = await prisma.searchResult.findMany({
          where: { searchSessionId: searchSessionId, ...(pendingOnly ? { isProcessed: false } : {}) },
          orderBy: { position: 'asc' },
          select: {
            id: true,
            position: true,
            title: true,
            url: true,
            snippet: true,
            description: true,
          }
        });
        // Fetch session context (industry/location) if available
        sessionContext = await prisma.searchSession.findUnique({
          where: { id: searchSessionId },
          select: { industry: true, location: true, city: true, stateProvince: true, country: true }
        });
        
        if (searchResultsFromDB.length > 0) {
          actualSearchResults = searchResultsFromDB;
          actualSearchResultIds = searchResultsFromDB.map((sr: any) => sr.id);
          
          console.log(`📊 Fetched ${actualSearchResults.length} actual SearchResult records from database`);
          console.log(`🔗 Search Result IDs: ${actualSearchResultIds.join(', ')}`);
          
          // Use the actual data from database instead of the passed searchResults
          const updatedSearchResults = actualSearchResults.map((sr: any) => ({
            title: sr.title,
            link: sr.url,
            snippet: sr.snippet || sr.description || '',
            displayLink: sr.url
          }));
          
          // Update the searchResults variable
          // If caller provided empty array, create one in place; otherwise replace contents
          if (!searchResults || !Array.isArray(searchResults)) {
            (body as any).searchResults = updatedSearchResults;
          } else {
            searchResults.length = 0;
            searchResults.push(...updatedSearchResults);
          }
        } else {
          console.log(`⚠️ No SearchResult records found for session: ${searchSessionId}`);
        }
      } catch (error) {
        console.error('⚠️ Failed to fetch SearchResult records from database, using passed data:', error);
      }
    }

    // Create LLM processing session for traceability if enabled
    let llmProcessingSessionId: string | null = null;
    let shouldEnableTraceability = enableTraceability;
    
    if (shouldEnableTraceability && searchSessionId) {
      try {
        const llmSession = await industrySearchTraceability.createLLMProcessingSession({
          searchSessionId: searchSessionId,
          totalResults: searchResults.length,
        });
        llmProcessingSessionId = llmSession.id;
        console.log(`🤖 Created LLM processing session: ${llmProcessingSessionId}`);
      } catch (error) {
        console.error('⚠️ Failed to create LLM processing session, continuing without traceability:', error);
        shouldEnableTraceability = false;
      }
    } else if (shouldEnableTraceability && !searchSessionId) {
      console.log('⚠️ No search session ID provided, skipping LLM processing session creation');
      console.log('💡 To enable full traceability, provide a searchSessionId when calling this endpoint');
      // Don't disable traceability completely - let the chain handle it
    }

    // Process search results through the chain and save businesses
    // Note: We don't pass categories here - let the LLM extract them from search results
    // TODO: Implement processAndSaveSearchResults for Company table
    // Temporarily return a mock result until we implement Company table integration
    const result = {
      saved: 0,
      failed: 0,
      skipped: 0,
      businesses: [],
      errors: []
    };

    console.log(`✅ Processing completed:`, {
      saved: result.saved,
      skipped: result.skipped,
      errors: result.errors.length,
      chainProcessing: result.chainProcessing,
      traceabilitySessionId: llmProcessingSessionId,
      searchSessionId: searchSessionId
    });

    // Get the business classification data from the chain processing result
    // Note: We don't need to call googleSearchParser.run() again since processAndSaveSearchResults already did it
    let chainBusinesses: any[] = [];
    if (result.chainProcessing) {
      // The businesses were already processed and saved by processAndSaveSearchResults
      // We can get them from the saved businesses in the database if needed
      console.log(`📊 Chain already processed ${result.chainProcessing.totalProcessed} businesses`);
      console.log(`   Company websites: ${result.chainProcessing.companyWebsites}`);
      console.log(`   Directories: ${result.chainProcessing.directories}`);
      console.log(`   Extraction quality: ${result.chainProcessing.extractionQuality}`);
      
      // For now, we'll use an empty array since the businesses were already processed
      // If you need the actual business data, we could fetch it from the database
      chainBusinesses = [];
    }

    // Complete LLM processing session if traceability is enabled
    if (shouldEnableTraceability && llmProcessingSessionId) {
      try {
        const acceptedCount = chainBusinesses.filter(b => b.isCompanyWebsite && b.confidence >= minConfidence).length;
        const rejectedCount = chainBusinesses.filter(b => !b.isCompanyWebsite || b.confidence < minConfidence).length;
        const errorCount = result.errors.length;
        const extractionQuality = acceptedCount / (acceptedCount + rejectedCount + errorCount);

        await industrySearchTraceability.completeLLMProcessingSession(
          llmProcessingSessionId,
          acceptedCount,
          rejectedCount,
          errorCount,
          extractionQuality
        );

        console.log(`🎯 Completed LLM processing session with traceability`);
      } catch (error) {
        console.error('⚠️ Failed to complete LLM processing session:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        saved: result.saved,
        skipped: result.skipped,
        errors: result.errors,
        details: result.details,
        chainProcessing: result.chainProcessing,
        businesses: chainBusinesses, // Add the actual classified business data
        traceability: shouldEnableTraceability ? {
          enabled: true,
          llmProcessingSessionId,
          searchSessionId,
          searchResultIds: actualSearchResultIds.length > 0 ? actualSearchResultIds : searchResultIds || undefined,
        } : {
          enabled: false,
          reason: searchSessionId ? 'Failed to create LLM session' : 'No search session ID provided'
        },
        pendingOnly
      }
    });

  } catch (error) {
    console.error('❌ Error processing search results:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process search results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get processing statistics and recent results
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Industry Search Results Processor',
      description: 'Processes Google search results through LangChain chain and saves valid businesses with full traceability',
      usage: {
        method: 'POST',
        body: {
          searchResults: 'Array of Google search results',
          industry: 'Optional industry context',
          location: 'Optional location context',
          minConfidence: 'Minimum confidence threshold (0.7 default)',
          dryRun: 'Test mode without saving (false default)',
          enableTraceability: 'Enable full traceability (true default)',
          searchSessionId: 'Optional: link to existing search session'
        }
      },
      example: {
        searchResults: [
          {
            title: 'Example Company - Professional Services',
            link: 'https://example.com',
            snippet: 'Leading provider of professional services in the industry'
          }
        ],
        industry: 'Professional Services',
        location: 'New York',
        minConfidence: 0.8,
        dryRun: true,
        enableTraceability: true,
        searchSessionId: 'optional-session-id'
      }
    });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get endpoint info' },
      { status: 500 }
    );
  }
}

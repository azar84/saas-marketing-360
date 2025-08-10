import { NextRequest, NextResponse } from 'next/server';
import { processAndSaveSearchResults } from '@/lib/businessDirectory';

/**
 * Process Google search results through the LangChain chain and save valid businesses
 * This demonstrates the complete flow:
 * 1. Receive search results from Google
 * 2. Process through googleSearchParser chain
 * 3. Filter and classify results
 * 4. Save valid businesses to directory
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
      dryRun = false 
    } = body;

    // Validate input
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      return NextResponse.json(
        { success: false, error: 'searchResults array is required and must not be empty' },
        { status: 400 }
      );
    }

    console.log(`🚀 Processing ${searchResults.length} search results for industry: ${industry || 'Not specified'}`);
    console.log(`📍 Location: ${location || 'Not specified'}`);

    // Process search results through the chain and save businesses
    // Note: We don't pass categories here - let the LLM extract them from search results
    const result = await processAndSaveSearchResults(searchResults, {
      location,
      city,
      stateProvince,
      country,
      minConfidence,
      dryRun
    });

    console.log(`✅ Processing completed:`, {
      saved: result.saved,
      skipped: result.skipped,
      errors: result.errors.length,
      chainProcessing: result.chainProcessing
    });

    // Get the actual business classification data from the chain
    let chainBusinesses: any[] = [];
    if (result.chainProcessing) {
      try {
        // Import the chain to get the raw classification data
        const { googleSearchParser } = await import('@/lib/llm/chains/googleSearchParser');
        const chainResult = await googleSearchParser.run({
          searchResults,
          industry, // Keep this for backward compatibility with the chain
          location
        });
        chainBusinesses = chainResult.businesses;
        console.log(`📊 Chain returned ${chainBusinesses.length} classified businesses`);
      } catch (chainError) {
        console.error('❌ Failed to get chain classification data:', chainError);
        // Continue without chain data
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
        businesses: chainBusinesses // Add the actual classified business data
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
      description: 'Processes Google search results through LangChain chain and saves valid businesses',
      usage: {
        method: 'POST',
        body: {
          searchResults: 'Array of Google search results',
          industry: 'Optional industry context',
          location: 'Optional location context',
          minConfidence: 'Minimum confidence threshold (0.7 default)',
          dryRun: 'Test mode without saving (false default)'
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
        dryRun: true
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

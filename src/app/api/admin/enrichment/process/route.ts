import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { BusinessDirectoryUpdater, type EnrichmentResult } from '@/lib/enrichment/businessDirectoryUpdater';

async function handler(request: NextRequest) {
  try {
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    const body = await request.json();
    const { enrichmentResult, jobId } = body;

    if (!enrichmentResult) {
      return NextResponse.json(
        { error: 'Enrichment result is required' },
        { status: 400 }
      );
    }

    // Validate enrichment result structure
    // Handle both formats: direct data or nested data structure
    let processData;
    if (enrichmentResult.data && enrichmentResult.data.input && enrichmentResult.data.finalResult) {
      // Format 1: { data: { input: {...}, finalResult: {...} } }
      processData = enrichmentResult;
    } else if (enrichmentResult.data && enrichmentResult.data.staff && enrichmentResult.data.company) {
      // Format 2: { data: { staff: {...}, company: {...}, contact: {...} } } - direct job result
      processData = {
        data: {
          input: { websiteUrl: enrichmentResult.metadata?.websiteUrl || 'unknown' },
          finalResult: enrichmentResult.data
        }
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid enrichment result structure' },
        { status: 400 }
      );
    }

    // Process the enrichment result
    const result = await BusinessDirectoryUpdater.processEnrichmentResult(processData as EnrichmentResult);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to process enrichment result',
          details: result.error
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: result.created 
        ? 'New business created in directory' 
        : 'Existing business updated in directory',
      businessId: result.businessId,
      created: result.created,
      updated: result.updated,
      jobId
    });

  } catch (error) {
    console.error('Error in enrichment processing endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const POST = handler;

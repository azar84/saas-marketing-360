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
    // The API response has data directly under 'data' with company, contact, analysis, etc.
    let processData;
    if (enrichmentResult.data && enrichmentResult.data.company && enrichmentResult.data.contact) {
      // This is the standard enrichment result format from the Marketing MCP API
      processData = {
        data: {
          input: { 
            websiteUrl: enrichmentResult.metadata?.websiteUrl || enrichmentResult.data.metadata?.baseUrl || 'unknown',
            options: {
              basicMode: true,
              maxHtmlLength: 50000,
              includeIntelligence: false,
              includeStaffEnrichment: false,
              includeExternalEnrichment: false,
              includeTechnologyExtraction: true
            }
          },
          // Direct fields matching the actual API response structure
          ...enrichmentResult.data,
          // Add missing fields that our interface expects
          scrapedPages: [],
          staffEnrichment: null,
          websiteAnalysis: null,
          scrapingStrategy: null,
          aggregatedContent: '',
          contactInformation: null
        },
        worker: 'api-processor',
        success: true,
        metadata: {
          mode: 'basic',
          type: 'basic_enrichment',
          timestamp: new Date().toISOString()
        },
        processingTime: 0
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid enrichment result structure - missing company or contact data' },
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

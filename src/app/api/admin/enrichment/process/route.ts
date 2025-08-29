import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { EnrichmentProcessor } from '@/lib/enrichment/enrichmentProcessor';

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

    // Normalize and process via centralized processor to handle varying result shapes
    const result = await EnrichmentProcessor.processEnrichmentResult({
      jobId: jobId || 'unknown',
      websiteUrl: EnrichmentProcessor.extractWebsiteUrl(enrichmentResult),
      result: enrichmentResult,
      metadata: enrichmentResult?.metadata || enrichmentResult?.data?.metadata
    });

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
      message: result.message,
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

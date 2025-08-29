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

    console.log('🔍 [DEBUG] Enrichment result structure:', {
      hasData: !!enrichmentResult.data,
      hasCompany: !!enrichmentResult.data?.company,
      hasContact: !!enrichmentResult.data?.contact,
      hasAnalysis: !!enrichmentResult.data?.analysis,
      companyName: enrichmentResult.data?.company?.name,
      website: enrichmentResult.data?.company?.website,
      isBusiness: enrichmentResult.data?.analysis?.isBusiness,
      analysisReasoning: enrichmentResult.data?.analysis?.reasoning
    });

    // Check if result is valid
    const isValid = EnrichmentProcessor.isValidEnrichmentResult(enrichmentResult.data || enrichmentResult);
    console.log('🔍 [DEBUG] Is valid enrichment result:', isValid);

    // Try to process and see what happens
    const result = await EnrichmentProcessor.processEnrichmentResult({
      jobId: jobId || 'debug-job',
      websiteUrl: enrichmentResult.metadata?.websiteUrl,
      result: enrichmentResult.data, // Pass the data directly, not enrichmentResult.data || enrichmentResult
      metadata: enrichmentResult.metadata
    });

    console.log('🔍 [DEBUG] Processing result:', result);

    return NextResponse.json({
      success: true,
      debug: {
        inputStructure: {
          hasData: !!enrichmentResult.data,
          hasCompany: !!enrichmentResult.data?.company,
          hasContact: !!enrichmentResult.data?.contact,
          hasAnalysis: !!enrichmentResult.data?.analysis
        },
        extractedData: {
          companyName: enrichmentResult.data?.company?.name || enrichmentResult.company?.name,
          website: enrichmentResult.data?.company?.website || enrichmentResult.company?.website,
          isBusiness: enrichmentResult.data?.analysis?.isBusiness || enrichmentResult.analysis?.isBusiness
        },
        isValid: isValid,
        processingResult: result
      }
    });

  } catch (error) {
    console.error('Error in enrichment debug endpoint:', error);
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

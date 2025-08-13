import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      status: 'testing',
      tests: {}
    };

    // Test 1: Basic imports
    try {
      const { EnrichmentEngine } = await import('@/lib/enrichment/engine');
      debugInfo.tests.import = { status: 'success', message: 'EnrichmentEngine imported successfully' };
    } catch (error) {
      debugInfo.tests.import = { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown import error',
        stack: error instanceof Error ? error.stack : undefined
      };
    }

    // Test 2: Website Scraper
    try {
      const { WebsiteScraper } = await import('@/lib/enrichment/sources/websiteScraper');
      debugInfo.tests.websiteScraper = { status: 'success', message: 'WebsiteScraper imported successfully' };
    } catch (error) {
      debugInfo.tests.websiteScraper = { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown import error'
      };
    }

    // Test 3: Google Search Enricher
    try {
      const { GoogleSearchEnricher } = await import('@/lib/enrichment/sources/googleSearchEnricher');
      debugInfo.tests.googleSearchEnricher = { status: 'success', message: 'GoogleSearchEnricher imported successfully' };
    } catch (error) {
      debugInfo.tests.googleSearchEnricher = { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown import error'
      };
    }

    // Test 4: Enrichment Processor
    try {
      const { EnrichmentProcessor } = await import('@/lib/llm/chains/enrichmentProcessor');
      debugInfo.tests.enrichmentProcessor = { status: 'success', message: 'EnrichmentProcessor imported successfully' };
    } catch (error) {
      debugInfo.tests.enrichmentProcessor = { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown import error'
      };
    }

    // Test 5: Database connection
    try {
      const { prisma } = await import('@/lib/db');
      await prisma.$connect();
      debugInfo.tests.database = { status: 'success', message: 'Database connection successful' };
      await prisma.$disconnect();
    } catch (error) {
      debugInfo.tests.database = { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }

    // Test 6: LLM Model
    try {
      const { llmModel } = await import('@/lib/llm/model');
      debugInfo.tests.llmModel = { status: 'success', message: 'LLM Model imported successfully' };
    } catch (error) {
      debugInfo.tests.llmModel = { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown LLM error'
      };
    }

    // Overall status
    const failedTests = Object.values(debugInfo.tests).filter((test: any) => test.status === 'failed');
    debugInfo.overallStatus = failedTests.length === 0 ? 'all_passed' : 'some_failed';
    debugInfo.failedCount = failedTests.length;
    debugInfo.totalTests = Object.keys(debugInfo.tests).length;

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

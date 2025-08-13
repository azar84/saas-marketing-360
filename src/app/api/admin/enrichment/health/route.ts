import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const healthCheck: { status: string; timestamp: string; checks: any; message?: string } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as any
  };

  try {
    // Check 1: Basic server functionality
    healthCheck.checks.server = { status: 'healthy', message: 'API endpoint responding' };

    // Check 2: Environment variables
    const requiredEnvVars = ['DATABASE_URL'];
    const optionalEnvVars = ['GOOGLE_CUSTOM_SEARCH_API_KEY', 'GOOGLE_CUSTOM_SEARCH_ENGINE_ID'];
    
    const missingRequired = requiredEnvVars.filter(envVar => !process.env[envVar]);
    const presentOptional = optionalEnvVars.filter(envVar => process.env[envVar]);
    
    if (missingRequired.length > 0) {
      healthCheck.checks.environment = { 
        status: 'unhealthy', 
        message: `Missing required environment variables: ${missingRequired.join(', ')}` 
      };
    } else {
      healthCheck.checks.environment = { 
        status: 'healthy', 
        message: `All required environment variables present. Optional: ${presentOptional.length}/${optionalEnvVars.length}` 
      };
    }

    // Check 3: Database connection (if DATABASE_URL is present)
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import('@/lib/db');
        await prisma.$connect();
        healthCheck.checks.database = { status: 'healthy', message: 'Database connection successful' };
        await prisma.$disconnect();
      } catch (error) {
        healthCheck.checks.database = { 
          status: 'unhealthy', 
          message: 'Database connection failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      healthCheck.checks.database = { status: 'skipped', message: 'DATABASE_URL not configured' };
    }

    // Check 4: Basic module imports
    try {
      const { EnrichmentEngine } = await import('@/lib/enrichment/engine');
      healthCheck.checks.enrichmentEngine = { status: 'healthy', message: 'EnrichmentEngine import successful' };
    } catch (error) {
      healthCheck.checks.enrichmentEngine = { 
        status: 'unhealthy', 
        message: 'EnrichmentEngine import failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check 5: Website scraper
    try {
      const { WebsiteScraper } = await import('@/lib/enrichment/sources/websiteScraper');
      healthCheck.checks.websiteScraper = { status: 'healthy', message: 'WebsiteScraper import successful' };
    } catch (error) {
      healthCheck.checks.websiteScraper = { 
        status: 'unhealthy', 
        message: 'WebsiteScraper import failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check 6: Google search enricher
    try {
      const { GoogleSearchEnricher } = await import('@/lib/enrichment/sources/googleSearchEnricher');
      healthCheck.checks.googleSearchEnricher = { status: 'healthy', message: 'GoogleSearchEnricher import successful' };
    } catch (error) {
      healthCheck.checks.googleSearchEnricher = { 
        status: 'unhealthy', 
        message: 'GoogleSearchEnricher import failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check 7: LLM model
    try {
      const { llmModel } = await import('@/lib/llm/model');
      healthCheck.checks.llmModel = { status: 'healthy', message: 'LLM model import successful' };
    } catch (error) {
      healthCheck.checks.llmModel = { 
        status: 'unhealthy', 
        message: 'LLM model import failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Overall status
    const unhealthyChecks = Object.values(healthCheck.checks).filter((check: any) => check.status === 'unhealthy');
    if (unhealthyChecks.length > 0) {
      healthCheck.status = 'unhealthy';
      healthCheck.message = `${unhealthyChecks.length} checks failed`;
    } else {
      healthCheck.status = 'healthy';
      healthCheck.message = 'All checks passed';
    }

    return NextResponse.json(healthCheck);

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

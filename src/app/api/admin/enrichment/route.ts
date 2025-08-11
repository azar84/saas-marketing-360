import { NextRequest, NextResponse } from 'next/server';
import { EnrichmentEngine } from '@/lib/enrichment/engine';
import { EnrichmentRequest } from '@/lib/enrichment/types';

// Initialize enrichment engine as a singleton to persist data between API calls
let enrichmentEngine: EnrichmentEngine | null = null;

function getEnrichmentEngine(): EnrichmentEngine {
  if (!enrichmentEngine) {
    enrichmentEngine = new EnrichmentEngine();
  }
  return enrichmentEngine;
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrichmentRequest = await request.json();
    
    // Validate request
    if (!body.domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting enrichment for domain: ${body.domain}`);

    const engine = getEnrichmentEngine();

    // Execute enrichment workflow following the diagram:
    // Domain -> Validation -> Website Scraping -> Google/API Enrichment -> LLM Processing -> Database Upsert -> Marketing Tools
    const result = await engine.enrichCompany(body);

    if (result.status === 'failed') {
      return NextResponse.json(
        { 
          error: result.error || 'Enrichment failed',
          domain: result.domain,
          progress: result.progress
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Enrichment completed successfully',
      data: result
    });

  } catch (error) {
    console.error('Enrichment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const domain = searchParams.get('domain');
    const includeResults = searchParams.get('includeResults') === 'true';

    const engine = getEnrichmentEngine();

    if (jobId) {
      // Get specific job status and result
      const jobStatus = engine.getJobStatus(jobId);
      if (!jobStatus) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      
      const response: any = { job: jobStatus };
      if (includeResults) {
        const result = engine.getJobResult(jobId);
        if (result) {
          response.result = result;
        }
      }
      
      return NextResponse.json(response);
    }

    if (domain) {
      // Get enrichment status and result for a specific domain
      const jobs = engine.getAllJobs();
      const domainJobs = jobs.filter(job => job.domain === domain);
      
      const response: any = { jobs: domainJobs };
      if (includeResults) {
        const result = engine.getDomainResult(domain);
        if (result) {
          response.result = result;
        }
      }
      
      return NextResponse.json(response);
    }

    // Get all jobs and optionally results
    const allJobs = engine.getAllJobs();
    const response: any = { jobs: allJobs };
    
    if (includeResults) {
      const allResults = engine.getAllResults();
      response.results = allResults;
    }
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Enrichment status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const engine = getEnrichmentEngine();
    
    // Clear completed jobs
    engine.clearCompletedJobs();
    engine.clearCompletedResults();
    
    return NextResponse.json({
      success: true,
      message: 'Completed jobs cleared'
    });

  } catch (error) {
    console.error('Enrichment cleanup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

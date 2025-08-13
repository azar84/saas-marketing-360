import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting enrichment for domain: ${body.domain}`);

    try {
      // Step 1: Test basic imports
      let EnrichmentEngine: any;
      try {
        console.log('📦 Attempting to import EnrichmentEngine...');
        const engineModule = await import('@/lib/enrichment/engine');
        EnrichmentEngine = engineModule.EnrichmentEngine;
        console.log('✅ EnrichmentEngine imported successfully');
      } catch (importError) {
        console.error('❌ Failed to import EnrichmentEngine:', importError);
        console.error('❌ Import error details:', {
          message: importError instanceof Error ? importError.message : 'Unknown error',
          stack: importError instanceof Error ? importError.stack : 'No stack trace',
          name: importError instanceof Error ? importError.name : 'Unknown error type'
        });
        return NextResponse.json(
          { 
            error: 'Failed to import enrichment engine',
            details: importError instanceof Error ? importError.message : 'Unknown import error',
            suggestion: 'Check if the enrichment components are properly built. Try running: npm run build',
            debug: {
              errorType: importError instanceof Error ? importError.constructor.name : 'Unknown',
              hasMessage: importError instanceof Error ? !!importError.message : false,
              hasStack: importError instanceof Error ? !!importError.stack : false
            }
          },
          { status: 500 }
        );
      }

      // Step 2: Test database connection (if DATABASE_URL is present)
      let prisma: any;
      if (process.env.DATABASE_URL) {
        try {
          console.log('🗄️ Testing database connection...');
          const dbModule = await import('@/lib/db');
          prisma = dbModule.prisma;
          await prisma.$connect();
          console.log('✅ Database connection successful');
        } catch (dbError) {
          console.error('❌ Database connection failed:', dbError);
          return NextResponse.json(
            { 
              error: 'Database connection failed',
              details: dbError instanceof Error ? dbError.message : 'Unknown database error',
              suggestion: 'Check DATABASE_URL environment variable and database status',
              debug: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0
              }
            },
            { status: 500 }
          );
        }
      } else {
        console.log('⚠️ DATABASE_URL not configured, skipping database test');
      }

      // Step 3: Initialize enrichment engine
      let engine: any;
      try {
        console.log('🔧 Initializing EnrichmentEngine...');
        engine = new EnrichmentEngine();
        console.log('✅ EnrichmentEngine initialized successfully');
      } catch (initError) {
        console.error('❌ Failed to initialize EnrichmentEngine:', initError);
        console.error('❌ Initialization error details:', {
          message: initError instanceof Error ? initError.message : 'Unknown error',
          stack: initError instanceof Error ? initError.stack : 'No stack trace',
          name: initError instanceof Error ? initError.name : 'Unknown error type'
        });
        return NextResponse.json(
          { 
            error: 'Failed to initialize enrichment engine',
            details: initError instanceof Error ? initError.message : 'Unknown initialization error',
            suggestion: 'Check enrichment engine dependencies and configuration',
            debug: {
              errorType: initError instanceof Error ? initError.constructor.name : 'Unknown',
              hasMessage: initError instanceof Error ? !!initError.message : false,
              hasStack: initError instanceof Error ? !!initError.stack : false
            }
          },
          { status: 500 }
        );
      }

      // Step 4: Execute enrichment
      let result: any;
      try {
        console.log('🚀 Executing enrichment workflow...');
        result = await engine.enrichCompany(body);
        console.log('✅ Enrichment completed successfully');
      } catch (enrichmentError) {
        console.error('❌ Enrichment execution failed:', enrichmentError);
        console.error('❌ Enrichment error details:', {
          message: enrichmentError instanceof Error ? enrichmentError.message : 'Unknown error',
          stack: enrichmentError instanceof Error ? enrichmentError.stack : 'No stack trace',
          name: enrichmentError instanceof Error ? enrichmentError.name : 'Unknown error type'
        });
        return NextResponse.json(
          { 
            error: 'Enrichment execution failed',
            details: enrichmentError instanceof Error ? enrichmentError.message : 'Unknown enrichment error',
            suggestion: 'Check enrichment workflow configuration and external services',
            debug: {
              errorType: enrichmentError instanceof Error ? enrichmentError.constructor.name : 'Unknown',
              hasMessage: enrichmentError instanceof Error ? !!enrichmentError.message : false,
              hasStack: enrichmentError instanceof Error ? !!enrichmentError.stack : false
            }
          },
          { status: 500 }
        );
      }

      // Step 5: Cleanup database connection
      if (prisma) {
        try {
          await prisma.$disconnect();
          console.log('✅ Database connection closed');
        } catch (cleanupError) {
          console.warn('⚠️ Failed to close database connection:', cleanupError);
        }
      }

      // Step 6: Return result
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

    } catch (engineError) {
      console.error('❌ Enrichment engine error:', engineError);
      console.error('❌ Engine error details:', {
        message: engineError instanceof Error ? engineError.message : 'Unknown error',
        stack: engineError instanceof Error ? engineError.stack : 'No stack trace',
        name: engineError instanceof Error ? engineError.name : 'Unknown error type'
      });
      return NextResponse.json(
        { 
          error: 'Enrichment engine error',
          details: engineError instanceof Error ? engineError.message : 'Unknown engine error',
          domain: body.domain,
          suggestion: 'Check server logs for detailed error information',
          debug: {
            errorType: engineError instanceof Error ? engineError.constructor.name : 'Unknown',
            hasMessage: engineError instanceof Error ? !!engineError.message : false,
            hasStack: engineError instanceof Error ? !!engineError.stack : false
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Enrichment API error:', error);
    console.error('❌ API error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Check request format and server configuration',
        debug: {
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          hasMessage: error instanceof Error ? !!error.message : false,
          hasStack: error instanceof Error ? !!error.stack : false
        }
      },
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

    try {
      const { EnrichmentEngine } = await import('@/lib/enrichment/engine');
      const engine = new EnrichmentEngine();

      if (jobId) {
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
        const jobs = engine.getAllJobs();
        const domainJobs = jobs.filter((job: any) => job.domain === domain);
        
        const response: any = { jobs: domainJobs };
        if (includeResults) {
          const result = engine.getDomainResult(domain);
          if (result) {
            response.result = result;
          }
        }
        
        return NextResponse.json(response);
      }

      const allJobs = engine.getAllJobs();
      const response: any = { jobs: allJobs };
      
      if (includeResults) {
        const allResults = engine.getAllResults();
        response.results = allResults;
      }
      
      return NextResponse.json(response);

    } catch (engineError) {
      console.error('❌ Enrichment engine error in GET:', engineError);
      return NextResponse.json(
        { 
          error: 'Enrichment engine error',
          details: engineError instanceof Error ? engineError.message : 'Unknown engine error',
          suggestion: 'Check if enrichment engine is properly initialized'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Enrichment status API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    try {
      const { EnrichmentEngine } = await import('@/lib/enrichment/engine');
      const engine = new EnrichmentEngine();
      
      engine.clearCompletedJobs();
      engine.clearCompletedResults();
      
      return NextResponse.json({
        success: true,
        message: 'Completed jobs cleared'
      });

    } catch (engineError) {
      console.error('❌ Enrichment engine error in DELETE:', engineError);
      return NextResponse.json(
        { 
          error: 'Enrichment engine error',
          details: engineError instanceof Error ? engineError.message : 'Unknown engine error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Enrichment cleanup API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

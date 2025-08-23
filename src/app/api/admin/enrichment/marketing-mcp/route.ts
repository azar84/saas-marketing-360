import { NextRequest, NextResponse } from 'next/server';
import { submitBasicEnrichmentJob } from '@/lib/jobs/basicEnrichment/submitter';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websites } = body;

    if (!websites || !Array.isArray(websites) || websites.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Websites array is required' },
        { status: 400 }
      );
    }

    // Limit the number of websites to enrich to prevent abuse
    const maxWebsites = 50;
    const websitesToEnrich = websites.slice(0, maxWebsites);

    if (websites.length > maxWebsites) {
      console.warn(`Enrichment request limited to ${maxWebsites} websites out of ${websites.length} requested`);
    }

    // Check which websites already exist in database
    const existingCompanies = await prisma.company.findMany({
      where: {
        website: {
          in: websitesToEnrich
        }
      },
      select: {
        id: true,
        website: true,
        name: true
      }
    });

    const existingDomains = new Set(existingCompanies.map(c => c.website));
    const newWebsites = websitesToEnrich.filter(website => !existingDomains.has(website));

    console.log(`📊 Enrichment Summary:\n- Total requested: ${websitesToEnrich.length}\n- Already in DB: ${existingCompanies.length}\n- New to process: ${newWebsites.length}`);

    // Submit enrichment jobs for new websites
    const submittedJobs = [];
    const failedSubmissions = [];

    for (const website of newWebsites) {
      try {
        const result = await submitBasicEnrichmentJob({
          websiteUrl: website,
          options: {
            basicMode: true,
            maxHtmlLength: 10000,
            includeIntelligence: false,
            includeStaffEnrichment: false,
            includeExternalEnrichment: true,
            includeTechnologyExtraction: true
          }
        });

        if (result.success) {
          submittedJobs.push({
            website,
            jobId: result.jobId,
            pollUrl: result.pollUrl,
            position: result.position,
            estimatedWaitTime: result.estimatedWaitTime,
            status: 'submitted'
          });

          console.log(`✅ Submitted enrichment job for ${website}: ${result.jobId}`);
        } else {
          failedSubmissions.push({
            website,
            error: result.error || 'Unknown error',
            status: 'failed'
          });

          console.error(`❌ Failed to submit enrichment job for ${website}:`, result.error);
        }
      } catch (error) {
        console.error(`❌ Exception submitting enrichment job for ${website}:`, error);
        failedSubmissions.push({
          website,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'failed'
        });
      }
    }

    // Return results
    return NextResponse.json({
      success: true,
      summary: {
        total: websitesToEnrich.length,
        existing: existingCompanies.length,
        new: newWebsites.length,
        submitted: submittedJobs.length,
        failed: failedSubmissions.length
      },
      submittedJobs,
      failedSubmissions,
      existingCompanies: existingCompanies.map(c => ({
        website: c.website,
        databaseId: c.id,
        name: c.name,
        status: 'already_exists'
      })),
      message: `Enrichment jobs submitted: ${submittedJobs.length} new websites queued for enrichment, ${existingCompanies.length} already exist in database`
    });

  } catch (error) {
    console.error('Marketing MCP enrichment error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to submit enrichment jobs' },
      { status: 500 }
    );
  }
}

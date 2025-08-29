import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { BusinessDirectoryUpdater } from '@/lib/enrichment/businessDirectoryUpdater';

async function handler(request: NextRequest) {
  try {
    if (request.method === 'GET') {
      // Get database counts and sample data
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connection successful');

        // Get counts
        const companyCount = await prisma.company.count();
        const industryCount = await prisma.industry.count();
        const subIndustryCount = await prisma.subIndustry.count();
        const companyIndustryRelations = await prisma.companyIndustryRelation.count();
        const companySubIndustryRelations = await prisma.companySubIndustry.count();

        // Get sample company with relations
        const sampleCompany = await prisma.company.findFirst({
          include: {
            industries: {
              include: {
                industry: true
              }
            },
            subIndustries: {
              include: {
                subIndustry: true
              }
            }
          }
        });

        // Get sample industries with sub-industries
        const sampleIndustries = await prisma.industry.findMany({
          take: 3,
          include: {
            subIndustries: true
          }
        });

        await prisma.$disconnect();

        return NextResponse.json({
          success: true,
          counts: {
            companies: companyCount,
            industries: industryCount,
            subIndustries: subIndustryCount,
            companyIndustryRelations,
            companySubIndustryRelations
          },
          sampleCompany,
          sampleIndustries
        });
      } catch (error) {
        console.error('❌ Database error:', error);
        await prisma.$disconnect();
        return NextResponse.json({
          success: false,
          error: 'Database error',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    } else if (request.method === 'POST') {
      const body = await request.json();
      const { testMode } = body;

      if (testMode === 'industry-processing') {
        // Test the industry processing with your actual API response structure
        const testData = {
          data: {
            company: {
              name: "Revive Painting & Wall Coverings",
              website: "https://www.revivepwc.com",
              industryCategories: [
                {
                  code: "CONST",
                  title: "Construction & Building",
                  description: "Construction trades, contractors, builders, renovation, construction services",
                  subIndustries: ["Renovation & Contracting", "Architecture & Design"]
                }
              ]
            },
            analysis: {
              businessType: "company"
            },
            contact: {
              addresses: [
                {
                  city: "Saskatoon",
                  type: "headquarters",
                  country: "Canada",
                  fullAddress: "Saskatoon, SK, Canada",
                  stateProvince: "SK"
                }
              ],
              primary: {
                emails: ["test@example.com"],
                phones: [
                  {
                    type: "telephone",
                    label: "Main Office",
                    number: "+1234567890"
                  }
                ]
              }
            }
          }
        };

        try {
          const result = await BusinessDirectoryUpdater.processEnrichmentResult(testData, {
            websiteUrl: "https://www.revivepwc.com"
          });

          return NextResponse.json({
            success: true,
            message: 'Industry processing test completed',
            result
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Industry processing test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }
      } else if (testMode === 'reset-processed-jobs') {
        // Reset the processed flag on completed enrichment jobs so they can be reprocessed
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        try {
          await prisma.$connect();
          
          // Find completed enrichment jobs that are marked as processed
          const processedJobs = await prisma.job.findMany({
            where: {
              type: 'basic-enrichment',
              status: 'completed'
            }
          });

          let resetCount = 0;
          for (const job of processedJobs) {
            if (job.result && typeof job.result === 'object' && (job.result as any).processed) {
              // Reset the processed flag
              await prisma.job.update({
                where: { id: job.id },
                data: {
                  result: {
                    ...(job.result as any),
                    processed: false
                  }
                }
              });
              resetCount++;
            }
          }

          await prisma.$disconnect();

          return NextResponse.json({
            success: true,
            message: `Reset processed flag on ${resetCount} completed enrichment jobs`,
            resetCount
          });
        } catch (error) {
          console.error('❌ Error resetting processed jobs:', error);
          await prisma.$disconnect();
          return NextResponse.json({
            success: false,
            error: 'Failed to reset processed jobs',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }
      }

      return NextResponse.json({
        success: false,
        error: 'Invalid test mode'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Method not allowed'
    }, { status: 405 });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;

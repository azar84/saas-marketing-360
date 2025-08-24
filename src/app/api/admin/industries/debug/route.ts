import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Debug endpoint called - checking database...');
    
    // First, let's check if we can connect to the database
    const dbCheck = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection test:', dbCheck);
    
    // Get all industries with their keywords count
    console.log('📊 Fetching industries with keyword counts...');
    const industries = await prisma.industry.findMany({
      select: {
        id: true,
        label: true,
        isActive: true,
        _count: {
          select: {
            keywords: true
          }
        }
      },
      where: {
        isActive: true
      },
      orderBy: {
        label: 'asc'
      }
    });
    console.log('📋 Industries found:', industries.length);
    console.log('📋 Sample industries:', industries.slice(0, 3));

    // Get total keywords count
    console.log('🔑 Counting total keywords...');
    const totalKeywords = await prisma.keyword.count({
      where: {
        isActive: true
      }
    });
    console.log('🔑 Total keywords:', totalKeywords);

    // Get sample keywords
    console.log('🔑 Fetching sample keywords...');
    const sampleKeywords = await prisma.keyword.findMany({
      select: {
        id: true,
        searchTerm: true,
        industryId: true,
        industry: {
          select: {
            label: true
          }
        }
      },
      where: {
        isActive: true
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('🔑 Sample keywords found:', sampleKeywords.length);

    // Let's also check if there are any keywords at all (including inactive)
    const allKeywords = await prisma.keyword.count();
    console.log('🔑 All keywords (including inactive):', allKeywords);

    // Check sub-industries
    console.log('🏭 Checking sub-industries...');
    const totalSubIndustries = await prisma.subIndustry.count();
    console.log('🏭 Total sub-industries:', totalSubIndustries);
    
    if (totalSubIndustries > 0) {
      const sampleSubIndustries = await prisma.subIndustry.findMany({
        select: {
          id: true,
          name: true,
          industryId: true,
          industry: {
            select: {
              label: true
            }
          }
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      });
      console.log('🏭 Sample sub-industries:', sampleSubIndustries);
    }

    // Check if the sub_industries table exists by trying to query it
    try {
      const tableCheck = await prisma.$queryRaw`SELECT COUNT(*) as count FROM sub_industries`;
      console.log('🏭 Sub-industries table check:', tableCheck);
    } catch (tableError) {
      console.log('🏭 Sub-industries table check failed:', tableError);
    }

    // Let's also check the industries table to see what's there
    console.log('🏢 Checking industries table...');
    const totalIndustries = await prisma.industry.count();
    console.log('🏢 Total industries:', totalIndustries);
    
    if (totalIndustries > 0) {
      const sampleIndustries = await prisma.industry.findMany({
        select: {
          id: true,
          label: true,
          code: true,
          description: true
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      });
      console.log('🏢 Sample industries:', sampleIndustries);
    }

    // Note: business_industries table has been removed in favor of company_industry_relations

    // Check company-industry relationships (System A)
    console.log('🏢 Checking company-industry relationships...');
    try {
      const totalCompanyIndustries = await prisma.companyIndustryRelation.count();
      console.log('🏢 Total company-industry relationships:', totalCompanyIndustries);
      
      if (totalCompanyIndustries > 0) {
        const sampleCompanyIndustries = await prisma.companyIndustryRelation.findMany({
          select: {
            id: true,
            industryId: true,
            companyId: true,
            isPrimary: true,
            company: {
              select: {
                name: true,
                website: true
              }
            },
            industry: {
              select: {
                label: true
              }
            }
          },
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        });
        console.log('🏢 Sample company-industry relationships:', sampleCompanyIndustries);
      }
    } catch (companyError) {
      console.log('🏢 Company-industry check failed:', companyError);
    }

    return NextResponse.json({
      success: true,
      data: {
        industries,
        totalKeywords,
        sampleKeywords,
        allKeywords,
        message: 'Debug information retrieved successfully'
      }
    });
  } catch (error: any) {
    console.error('❌ Error in debug endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get debug info', 
        details: error?.message ?? 'Unknown error',
        stack: error?.stack
      },
      { status: 500 }
    );
  }
}

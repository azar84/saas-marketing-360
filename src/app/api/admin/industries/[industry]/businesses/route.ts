import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ industry: string }> }
) {
  const params = await context.params;
  try {
    const { industry } = params;
    
    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry parameter is required' },
        { status: 400 }
      );
    }

    console.log('🏢 Businesses API called for industry:', industry);

    // Find the industry first
    let industryRecord = await prisma.industry.findUnique({
      where: { label: industry }
    });

    // If not found, try case-insensitive search
    if (!industryRecord) {
      industryRecord = await prisma.industry.findFirst({
        where: { 
          label: { 
            contains: industry
          } 
        }
      });
    }

    if (!industryRecord) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    // Get businesses associated with this industry
    const companyIndustries = await prisma.companyIndustryRelation.findMany({
      where: {
        industryId: industryRecord.id
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            website: true,
            description: true
          }
        }
      },
      orderBy: {
        company: {
          name: 'asc'
        }
      }
    });

    // Transform the data to a simpler format
    const businesses = companyIndustries.map(ci => ({
      id: ci.company.id,
      companyName: ci.company.name,
      website: ci.company.website,
      description: ci.company.description,
      isPrimary: ci.isPrimary
    }));

    console.log(`🏢 Found ${businesses.length} companies for industry: ${industry}`);

    return NextResponse.json({
      success: true,
      data: businesses,
      total: businesses.length
    });
  } catch (error: any) {
    console.error('❌ Error in businesses API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch businesses', details: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

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

    console.log('🏭 Sub-industries API called for industry:', industry);

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

    // Get sub-industries for this industry
    const subIndustries = await prisma.subIndustry.findMany({
      where: {
        industryId: industryRecord.id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`🏭 Found ${subIndustries.length} sub-industries for industry: ${industry}`);

    return NextResponse.json({
      success: true,
      data: subIndustries,
      total: subIndustries.length
    });
  } catch (error: any) {
    console.error('❌ Error in sub-industries API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sub-industries', details: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

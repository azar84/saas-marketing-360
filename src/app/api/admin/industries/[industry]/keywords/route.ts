import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    console.log('Retrieving keywords for industry:', industry);
    console.log('Industry parameter received:', { industry, type: typeof industry });

    // Find the industry - try both exact match and case-insensitive
    let industryRecord = await prisma.industry.findUnique({
      where: { label: industry },
      include: {
        keywords: {
          where: { isActive: true },
          orderBy: { searchTerm: 'asc' }
        }
      }
    });

    // If not found, try case-insensitive search
    if (!industryRecord) {
      console.log('Exact match not found, trying case-insensitive search for:', industry);
      industryRecord = await prisma.industry.findFirst({
        where: { 
          label: { 
            contains: industry
          } 
        },
        include: {
          keywords: {
            where: { isActive: true },
            orderBy: { searchTerm: 'asc' }
          }
        }
      });
    }

    // Debug: List all industries if still not found
    if (!industryRecord) {
      console.log('Industry still not found, listing all available industries:');
      const allIndustries = await prisma.industry.findMany({
        select: { id: true, label: true }
      });
      console.log('Available industries:', allIndustries);
    }

    if (!industryRecord) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Industry not found',
          industry: industry.toLowerCase()
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      industry: {
        id: industryRecord.id,
        label: industryRecord.label,
        isActive: industryRecord.isActive,
        createdAt: industryRecord.createdAt,
        updatedAt: industryRecord.updatedAt
      },
      keywords: industryRecord.keywords.map(k => ({
        id: k.id,
        searchTerm: k.searchTerm,
        isActive: k.isActive,
        createdAt: k.createdAt,
        updatedAt: k.updatedAt
      })),
      totalKeywords: industryRecord.keywords.length,
      _source: 'database',
      _message: 'Keywords retrieved from database'
    });

  } catch (error) {
    console.error('Error retrieving industry keywords:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

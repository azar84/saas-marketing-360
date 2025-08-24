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

    console.log('🔍 Keywords API called for industry:', industry);
    console.log('🔍 Industry parameter received:', { industry, type: typeof industry });

    // Find the industry - try both exact match and case-insensitive
    console.log('🔍 Looking for industry with exact label match...');
    let industryRecord = await prisma.industry.findUnique({
      where: { label: industry },
      include: {
        keywords: {
          where: { isActive: true },
          orderBy: { searchTerm: 'asc' }
        }
      }
    });

    console.log('🔍 Exact match result:', industryRecord ? `Found ID ${industryRecord.id}` : 'Not found');

    // If not found, try case-insensitive search
    if (!industryRecord) {
      console.log('🔍 Exact match not found, trying case-insensitive search for:', industry);
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
      console.log('🔍 Case-insensitive search result:', industryRecord ? `Found ID ${industryRecord.id}` : 'Not found');
    }

    // Debug: List all industries if still not found
    if (!industryRecord) {
      console.log('🔍 Industry still not found, listing all available industries:');
      const allIndustries = await prisma.industry.findMany({
        select: { id: true, label: true }
      });
      console.log('🔍 Available industries:', allIndustries);
      
      // Let's also check if there are any keywords at all
      const totalKeywords = await prisma.keyword.count();
      console.log('🔍 Total keywords in database:', totalKeywords);
      
      if (totalKeywords > 0) {
        const sampleKeywords = await prisma.keyword.findMany({
          select: { id: true, searchTerm: true, industryId: true },
          take: 5
        });
        console.log('🔍 Sample keywords:', sampleKeywords);
      }
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

// PUT - Update a keyword
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ industry: string }> }
) {
  const params = await context.params;
  try {
    const { industry } = params;
    const body = await request.json();
    const { keywordId, searchTerm, isActive } = body;

    if (!keywordId || typeof keywordId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Keyword ID is required and must be a number' },
        { status: 400 }
      );
    }

    if (searchTerm !== undefined && (typeof searchTerm !== 'string' || searchTerm.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Search term must be a non-empty string if provided' },
        { status: 400 }
      );
    }

    // Check if keyword exists and belongs to the specified industry
    const existingKeyword = await prisma.keyword.findFirst({
      where: { 
        id: keywordId,
        industry: {
          label: { contains: industry, mode: 'insensitive' }
        }
      },
      include: {
        industry: true
      }
    });

    if (!existingKeyword) {
      return NextResponse.json(
        { success: false, error: 'Keyword not found or does not belong to the specified industry' },
        { status: 404 }
      );
    }

    // If updating search term, check for duplicates within the same industry
    if (searchTerm && searchTerm.trim() !== existingKeyword.searchTerm) {
      const duplicateKeyword = await prisma.keyword.findFirst({
        where: {
          searchTerm: searchTerm.trim(),
          industryId: existingKeyword.industryId,
          id: { not: keywordId }
        }
      });

      if (duplicateKeyword) {
        return NextResponse.json(
          { success: false, error: 'A keyword with this search term already exists in this industry' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (searchTerm !== undefined) updateData.searchTerm = searchTerm.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedKeyword = await prisma.keyword.update({
      where: { id: keywordId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Keyword updated successfully',
      data: updatedKeyword
    });

  } catch (error: any) {
    console.error('Error updating keyword:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update keyword', details: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a keyword
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ industry: string }> }
) {
  const params = await context.params;
  try {
    const { industry } = params;
    const { searchParams } = new URL(request.url);
    const keywordId = searchParams.get('keywordId');

    if (!keywordId || isNaN(parseInt(keywordId))) {
      return NextResponse.json(
        { success: false, error: 'Valid keyword ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(keywordId);

    // Check if keyword exists and belongs to the specified industry
    const existingKeyword = await prisma.keyword.findFirst({
      where: { 
        id,
        industry: {
          label: { contains: industry, mode: 'insensitive' }
        }
      },
      include: {
        industry: true
      }
    });

    if (!existingKeyword) {
      return NextResponse.json(
        { success: false, error: 'Keyword not found or does not belong to the specified industry' },
        { status: 404 }
      );
    }

    // Delete the keyword
    await prisma.keyword.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Keyword deleted successfully',
      deletedKeyword: {
        id: existingKeyword.id,
        searchTerm: existingKeyword.searchTerm,
        industry: existingKeyword.industry.label
      }
    });

  } catch (error: any) {
    console.error('Error deleting keyword:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete keyword', details: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

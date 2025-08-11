import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get a specific keyword
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ industry: string; keywordId: string }> }
) {
  const params = await context.params;
  try {
    const { industry, keywordId } = params;
    
    if (!keywordId || isNaN(parseInt(keywordId))) {
      return NextResponse.json(
        { success: false, error: 'Valid keyword ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(keywordId);

    // Find the keyword and verify it belongs to the specified industry
    const keyword = await prisma.keyword.findFirst({
      where: { 
        id,
        industry: {
          label: { contains: industry }
        }
      },
      include: {
        industry: true
      }
    });

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: 'Keyword not found or does not belong to the specified industry' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: keyword
    });

  } catch (error) {
    console.error('Error retrieving keyword:', error);
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

// PUT - Update a specific keyword
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ industry: string; keywordId: string }> }
) {
  const params = await context.params;
  try {
    const { industry, keywordId } = params;
    const body = await request.json();
    const { searchTerm, isActive } = body;

    if (!keywordId || isNaN(parseInt(keywordId))) {
      return NextResponse.json(
        { success: false, error: 'Valid keyword ID is required' },
        { status: 400 }
      );
    }

    if (searchTerm !== undefined && (typeof searchTerm !== 'string' || searchTerm.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Search term must be a non-empty string if provided' },
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

    // If updating search term, check for duplicates within the same industry
    if (searchTerm && searchTerm.trim() !== existingKeyword.searchTerm) {
      const duplicateKeyword = await prisma.keyword.findFirst({
        where: {
          searchTerm: searchTerm.trim(),
          industryId: existingKeyword.industryId,
          id: { not: id }
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
      where: { id },
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

// DELETE - Delete a specific keyword
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ industry: string; keywordId: string }> }
) {
  const params = await context.params;
  try {
    const { industry, keywordId } = params;

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

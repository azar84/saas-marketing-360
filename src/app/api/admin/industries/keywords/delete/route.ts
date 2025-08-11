import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { searchTerms, industryId } = await request.json();

    if (!searchTerms || !Array.isArray(searchTerms) || searchTerms.length === 0) {
      return NextResponse.json(
        { success: false, error: 'searchTerms array is required and must contain at least one search term' },
        { status: 400 }
      );
    }

    if (!industryId || typeof industryId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'industryId is required and must be a valid number' },
        { status: 400 }
      );
    }

    // Delete the keywords by search term and industry ID
    const deleteResult = await prisma.keyword.deleteMany({
      where: {
        searchTerm: {
          in: searchTerms
        },
        industryId: industryId
      }
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { success: false, error: 'No keywords found with the provided search terms for this industry' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} keyword(s)`,
      deletedCount: deleteResult.count
    });

  } catch (error) {
    console.error('Error deleting keywords:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete keywords',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

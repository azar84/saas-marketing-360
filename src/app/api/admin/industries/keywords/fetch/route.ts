import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const industryId = searchParams.get('industryId');

    if (!industry && !industryId) {
      return NextResponse.json(
        { success: false, error: 'Either industry or industryId parameter is required' },
        { status: 400 }
      );
    }

    let industryRecord;

    if (industryId) {
      // Fetch by ID
      const id = parseInt(industryId);
      if (isNaN(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid industryId parameter' },
          { status: 400 }
        );
      }

      industryRecord = await prisma.industry.findUnique({
        where: { id },
        include: {
          keywords: {
            where: { isActive: true },
            select: { 
              id: true, 
              searchTerm: true, 
              createdAt: true, 
              updatedAt: true 
            },
            orderBy: { searchTerm: 'asc' }
          }
        }
      });
    } else {
      // Fetch by name (case-insensitive search for SQLite)
      if (!industry) {
        return NextResponse.json(
          { success: false, error: 'Industry parameter is required when not using industryId' },
          { status: 400 }
        );
      }
      
      // SQLite doesn't support case-insensitive search with mode, so we'll use multiple OR conditions
      industryRecord = await prisma.industry.findFirst({
        where: { 
          OR: [
            { label: industry },
            { label: industry.toLowerCase() },
            { label: industry.toUpperCase() },
            { label: industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase() }
          ]
        },
        include: {
          keywords: {
            where: { isActive: true },
            select: { 
              id: true, 
              searchTerm: true, 
              createdAt: true, 
              updatedAt: true 
            },
            orderBy: { searchTerm: 'asc' }
          }
        }
      });
    }

    if (!industryRecord) {
      return NextResponse.json({
        success: false,
        error: 'Industry not found',
        industry: industry || industryId
      }, { status: 404 });
    }

    // Extract just the search terms for the component
    const searchTerms = industryRecord.keywords.map(k => k.searchTerm);

    // Return the format that the component expects
    return NextResponse.json({
      success: true,
      industry: industryRecord.label,
      industryId: industryRecord.id,
      keywords: {
        search_terms: searchTerms
      },
      keywordsCount: industryRecord.keywords.length,
      _source: 'database',
      _message: 'Keywords fetched from database'
    });

  } catch (error) {
    console.error('Error fetching industry keywords:', error);
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');

    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry parameter is required' },
        { status: 400 }
      );
    }

    console.log('Fetching existing keywords for industry:', industry);

    // Find the industry (case-insensitive search for SQLite)
    const industryRecord = await prisma.industry.findFirst({
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
          select: { id: true, searchTerm: true }
        }
      }
    });

    if (!industryRecord) {
      return NextResponse.json({
        success: false,
        error: 'Industry not found',
        industry
      }, { status: 404 });
    }

    console.log(`Found ${industryRecord.keywords.length} existing keywords for industry "${industry}"`);

    return NextResponse.json({
      success: true,
      industry: industryRecord.label,
      keywords: {
        search_terms: industryRecord.keywords.map(k => k.searchTerm)
      },
      _source: 'database',
      _message: 'Existing keywords fetched from database'
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

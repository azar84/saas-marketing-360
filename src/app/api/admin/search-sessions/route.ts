import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch search sessions with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const industry = searchParams.get('industry');
    const location = searchParams.get('location');
    const city = searchParams.get('city');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    // Get search sessions with result counts
    const [sessions, totalCount] = await Promise.all([
      prisma.searchSession.findMany({
        where,
        include: {
          _count: {
            select: {
              searchResults: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.searchSession.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: sessions.map(session => ({
        id: session.id,
        query: session.query,
        searchQueries: session.searchQueries,
        industry: session.industry,
        location: session.location,
        city: session.city,
        stateProvince: session.stateProvince,
        country: session.country,
        totalResults: session.totalResults,
        successfulQueries: session.successfulQueries,
        searchTime: session.searchTime,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        resultsCount: session._count.searchResults
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        resultsPerPage: limit
      }
    });
  } catch (error: any) {
    console.error('Error fetching search sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search sessions', message: error.message },
      { status: 500 }
    );
  }
}

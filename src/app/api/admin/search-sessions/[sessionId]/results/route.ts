import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch search results for a specific session with pagination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('query'); // Filter by specific query within session

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      searchSessionId: sessionId
    };
    
    if (query) {
      where.query = { contains: query, mode: 'insensitive' };
    }

    // Get search results with pagination
    const [results, totalCount, session] = await Promise.all([
      prisma.searchResult.findMany({
        where,
        orderBy: {
          position: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.searchResult.count({ where }),
      prisma.searchSession.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          query: true,
          searchQueries: true,
          industry: true,
          location: true,
          city: true,
          stateProvince: true,
          country: true,
          totalResults: true,
          successfulQueries: true,
          searchTime: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ]);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Search session not found' },
        { status: 404 }
      );
    }

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        session,
        results: results.map(result => ({
          id: result.id,
          position: result.position,
          title: result.title,
          url: result.url,
          displayUrl: result.displayUrl,
          description: result.description,
          snippet: result.snippet,
          cacheId: result.cacheId,
          query: result.query,
          date: result.date,
          isProcessed: result.isProcessed,
          createdAt: result.createdAt
        }))
      },
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
    console.error('Error fetching search results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search results', message: error.message },
      { status: 500 }
    );
  }
}

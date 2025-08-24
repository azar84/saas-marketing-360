import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      queries, // Array of search queries
      location, // Location context
      city, // City context
      industry, // Industry context
      page = 1,
      resultsLimit = 10
    } = body;

    if (!queries || queries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No search queries provided' },
        { status: 400 }
      );
    }

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(resultsLimit) || 10, 1), 1000);
    
    // Check if this is a request for all results (select all pages)
    const isSelectAllPages = resultsLimit >= 1000;

    console.log('🔍 Searching database for existing results:', {
      queries,
      location,
      city,
      industry,
      page: pageNumber,
      limit
    });

    // Look for existing search session with matching parameters
    // We'll match on the combination of queries, location, and industry
    const searchSession = await prisma.searchSession.findFirst({
      where: {
        AND: [
          {
            OR: [
              { searchQueries: { hasEvery: queries } }, // All queries match
              { query: { in: queries } } // Single query matches
            ]
          },
          location ? { location: { contains: location, mode: 'insensitive' } } : {},
          city ? { city: { contains: city, mode: 'insensitive' } } : {},
          industry ? { industry: { contains: industry, mode: 'insensitive' } } : {},
          { status: 'completed' } // Only completed sessions
        ]
      },
      include: {
        _count: {
          select: {
            searchResults: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Get the most recent matching session
      }
    });

    if (!searchSession) {
      return NextResponse.json({
        success: false,
        error: 'No existing search results found',
        message: 'No matching search session found in database. Please perform a new search.'
      }, { status: 404 });
    }

    console.log(`✅ Found existing search session: ${searchSession.id} with ${searchSession._count.searchResults} results`);

    // Get results from the found session
    let results, totalCount;
    
    if (isSelectAllPages) {
      // For "select all pages", get all results without pagination
      [results, totalCount] = await Promise.all([
        prisma.searchResult.findMany({
          where: {
            searchSessionId: searchSession.id
          },
          orderBy: {
            position: 'asc'
          }
        }),
        searchSession._count.searchResults
      ]);
    } else {
      // Normal pagination
      const skip = (pageNumber - 1) * limit;
      [results, totalCount] = await Promise.all([
        prisma.searchResult.findMany({
          where: {
            searchSessionId: searchSession.id
          },
          orderBy: {
            position: 'asc'
          },
          skip,
          take: limit
        }),
        searchSession._count.searchResults
      ]);
    }

    const totalPages = isSelectAllPages ? 1 : Math.ceil(totalCount / limit);

    // Transform results to match the expected format
    const transformedResults = results.map(result => ({
      position: result.position,
      title: result.title,
      url: result.url,
      displayUrl: result.displayUrl,
      fullUrl: result.url,
      description: result.description || '',
      snippet: result.snippet,
      cacheId: result.cacheId,
      query: result.query,
      date: result.date
    }));

    console.log(`📊 Returning ${transformedResults.length} results from database ${isSelectAllPages ? '(all results)' : `(page ${pageNumber}/${totalPages})`}`);

    return NextResponse.json({
      success: true,
      results: transformedResults,
      totalResults: totalCount,
      searchTime: searchSession.searchTime || 0,
      filtersApplied: {},
      pagination: isSelectAllPages ? {
        currentPage: 1,
        resultsPerPage: totalCount,
        totalPages: 1,
        totalResults: totalCount,
        hasNextPage: false,
        hasPreviousPage: false
      } : {
        currentPage: pageNumber,
        resultsPerPage: limit,
        totalPages,
        totalResults: totalCount,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1
      },
      queriesProcessed: searchSession.searchQueries.length,
      successfulQueries: searchSession.successfulQueries,
      fromDatabase: true, // Flag to indicate this came from database
      sessionId: searchSession.id,
      sessionCreatedAt: searchSession.createdAt,
      // Add traceability information
      traceability: {
        enabled: true,
        searchSessionId: searchSession.id,
        resultsStored: totalCount,
        queriesStored: searchSession.searchQueries.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching search results from database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search results from database', message: error.message },
      { status: 500 }
    );
  }
}

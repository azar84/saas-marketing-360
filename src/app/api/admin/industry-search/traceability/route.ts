import { NextRequest, NextResponse } from 'next/server';
import { industrySearchTraceability } from '@/lib/industrySearchTraceability';

/**
 * Get full traceability data for industry search sessions
 * This provides complete visibility from search query to saved business
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const action = searchParams.get('action');

    if (action === 'sessions') {
      // Get all search sessions with summary statistics
      const sessions = await industrySearchTraceability.getAllSearchSessions();
      
      return NextResponse.json({
        success: true,
        message: 'Search sessions retrieved successfully',
        data: {
          sessions,
          totalSessions: sessions.length,
          summary: {
            totalSearches: sessions.reduce((sum, s) => sum + s.totalResults, 0),
            totalProcessed: sessions.reduce((sum, s) => sum + (s._count?.searchResults || 0), 0),
            totalLLMSessions: sessions.reduce((sum, s) => sum + (s._count?.llmProcessing || 0), 0),
          }
        }
      });
    }

    if (action === 'traceability' && sessionId) {
      // Get full traceability for a specific session
      const traceability = await industrySearchTraceability.getSessionTraceability(sessionId);
      
      if (!traceability) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Session traceability retrieved successfully',
        data: {
          session: traceability,
          summary: {
            message: 'Traceability data retrieved successfully'
          }
        }
      });
    }

    // Default: return endpoint information
    return NextResponse.json({
      success: true,
      message: 'Industry Search Traceability API',
      description: 'Provides full traceability from search query to saved business',
      endpoints: {
        'GET ?action=sessions': 'Get all search sessions with summary statistics',
        'GET ?action=traceability&sessionId=<id>': 'Get full traceability for a specific session',
      },
      features: [
        'Search session tracking',
        'Individual search result storage',
        'LLM processing session management',
        'Result-by-result LLM interaction recording',
        'Business extraction decision tracking',
        'Final business directory linking'
      ],
      example: {
        getAllSessions: '/api/admin/industry-search/traceability?action=sessions',
        getSessionTraceability: '/api/admin/industry-search/traceability?action=traceability&sessionId=clx123abc'
      }
    });

  } catch (error) {
    console.error('❌ Error in traceability API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve traceability data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a test traceability session for demonstration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'test-session') {
      // Create a test search session
      const testSession = await industrySearchTraceability.createSearchSession({
        searchQueries: ['test web design companies saskatoon'],
        industry: 'Web Design',
        location: 'Saskatoon',
        city: 'Saskatoon',
        stateProvince: 'SK',
        country: 'Canada',
        resultsLimit: 5,
      });

      // Add some test search results
      const testResults = [
        {
          searchSessionId: testSession.id,
          position: 1,
          title: 'Test Company 1 - Web Design Services',
          url: 'https://testcompany1.com',
          displayUrl: 'testcompany1.com',
          description: 'Professional web design services in Saskatoon',
          snippet: 'Leading web design company in Saskatoon',
          query: 'test web design companies saskatoon',
        },
        {
          searchSessionId: testSession.id,
          position: 2,
          title: 'Test Company 2 - Digital Agency',
          url: 'https://testcompany2.com',
          displayUrl: 'testcompany2.com',
          description: 'Full-service digital agency',
          snippet: 'Complete digital solutions for businesses',
          query: 'test web design companies saskatoon',
        }
      ];

      await industrySearchTraceability.addSearchResults(testSession.id, testResults);

      // Complete the search session
      await industrySearchTraceability.completeSearchSession(
        testSession.id,
        2,
        1,
        1.5
      );

      return NextResponse.json({
        success: true,
        message: 'Test traceability session created successfully',
        data: {
          sessionId: testSession.id,
          searchResults: 2,
          status: 'completed'
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error creating test session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

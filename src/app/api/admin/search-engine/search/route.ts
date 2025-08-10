import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { query, apiKey, searchEngineId, resultsLimit, filters, page = 1 } = await request.json();
    
    // Clean and validate the query - trim whitespace
    const cleanQuery = query?.trim();
    
    // Default filters (we'll apply these after getting results from Google)
    const defaultFilters = {
      excludeDirectories: true,
      excludeForums: true,
      excludeSocialMedia: true,
      excludeNewsSites: false,
      excludeBlogs: false,
      ...filters
    };

    console.log('Search request received:', {
      query: cleanQuery,
      originalQuery: query,
      queryLength: cleanQuery?.length || 0,
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'missing',
      searchEngineId: searchEngineId ? `${searchEngineId.substring(0, 10)}...` : 'missing',
      resultsLimit,
      filters: defaultFilters
    });

    // Validate required parameters
    if (!cleanQuery || !apiKey || !searchEngineId) {
      console.log('Missing parameters:', { hasQuery: !!cleanQuery, hasApiKey: !!apiKey, hasSearchEngineId: !!searchEngineId });
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: query, apiKey, or searchEngineId' },
        { status: 400 }
      );
    }

    // Validate results limit - Google CSE only supports up to 10 results per request
    const limit = Math.min(Math.max(parseInt(resultsLimit) || 10, 1), 10);

    // Build Google Custom Search API URL
    const apiEndpoint = 'https://www.googleapis.com/customsearch/v1';
    const requestUrl = new URL(apiEndpoint);
    
    // Only send the parameters that Google's API supports
    requestUrl.searchParams.append('q', cleanQuery);
    requestUrl.searchParams.append('key', apiKey);
    requestUrl.searchParams.append('cx', searchEngineId);
    requestUrl.searchParams.append('num', limit.toString());
    
    // Add pagination support - Google CSE supports up to 10 pages with max 10 results each
    const pageNumber = Math.max(1, Math.min(parseInt(page) || 1, 10));
    if (pageNumber > 1) {
      const startIndex = ((pageNumber - 1) * limit) + 1;
      requestUrl.searchParams.append('start', startIndex.toString());
    }

    console.log('Making request to Google API:', requestUrl.toString().replace(apiKey, '***API_KEY***'));
    console.log('Note: Filters will be applied after receiving results from Google');

    // Make request to Google Custom Search API
    const response = await fetch(requestUrl.toString());
    
    console.log('Google API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Custom Search API Error:', JSON.stringify(errorData, null, 2));
      
      // Handle specific Google API errors
      if (errorData.error?.code === 403) {
        return NextResponse.json(
          { success: false, error: 'API key is invalid or quota exceeded' },
          { status: 400 }
        );
      } else if (errorData.error?.code === 400) {
        // Log the specific error details for debugging
        console.error('Google API 400 Error Details:', {
          message: errorData.error?.message,
          errors: errorData.error?.errors,
          status: errorData.error?.status
        });
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid search engine ID or parameters',
            details: errorData.error?.message || 'Unknown 400 error'
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: `Google API error: ${errorData.error?.message || 'Unknown error'}` },
          { status: 400 }
        );
      }
    }

    const data = await response.json();
    console.log('Google API response data keys:', Object.keys(data));
    console.log('Search results count:', data.items?.length || 0);
    
    // Check if we have search results
    if (!data.items || data.items.length === 0) {
      console.log('No search results found in Google API response');
      return NextResponse.json({
        success: true,
        results: [],
        message: 'No search results found'
      });
    }

    // Filter and transform results
    const filteredResults = data.items
      .filter((result: any) => {
        if (!result.link) return false;
        
        try {
          const url = new URL(result.link);
          const hostname = url.hostname.toLowerCase();
          const pathname = url.pathname.toLowerCase();
          
          // Exclude directories
          if (defaultFilters.excludeDirectories) {
            if (pathname.includes('/directory/') || 
                pathname.includes('/listings/') || 
                pathname.includes('/businesses/') ||
                pathname.includes('/companies/') ||
                pathname.includes('/contractors/') ||
                pathname.includes('/services/') ||
                pathname.includes('/business/') ||
                pathname.includes('/local/') ||
                pathname.includes('/find/') ||
                pathname.includes('/search/') ||
                pathname.includes('/results/') ||
                hostname.includes('directory') ||
                hostname.includes('listings') ||
                hostname.includes('yellowpages') ||
                hostname.includes('whitepages') ||
                hostname.includes('superpages') ||
                hostname.includes('manta') ||
                hostname.includes('brownbook') ||
                hostname.includes('bbb.org') ||
                hostname.includes('bbb.com') ||
                hostname.includes('angieslist') ||
                hostname.includes('homeadvisor') ||
                hostname.includes('thumbtack') ||
                hostname.includes('porch') ||
                hostname.includes('houzz') ||
                hostname.includes('yelp') ||
                hostname.includes('foursquare') ||
                hostname.includes('citysearch') ||
                hostname.includes('local.com') ||
                hostname.includes('hotfrog') ||
                hostname.includes('indeed') ||
                hostname.includes('glassdoor') ||
                hostname.includes('zoominfo') ||
                hostname.includes('crunchbase') ||
                hostname.includes('linkedin.com') ||
                hostname.includes('facebook.com') ||
                hostname.includes('twitter.com') ||
                hostname.includes('instagram.com') ||
                hostname.includes('pinterest.com') ||
                hostname.includes('tiktok.com') ||
                hostname.includes('youtube.com') ||
                hostname.includes('google.com') ||
                hostname.includes('bing.com') ||
                hostname.includes('yahoo.com')) {
              return false;
            }
          }
          
          // Exclude forums
          if (defaultFilters.excludeForums) {
            if (hostname.includes('reddit.com') ||
                hostname.includes('forum.') ||
                hostname.includes('forums.') ||
                hostname.includes('community.') ||
                hostname.includes('discussion.') ||
                pathname.includes('/forum/') ||
                pathname.includes('/forums/') ||
                pathname.includes('/community/') ||
                pathname.includes('/discussion/')) {
              return false;
            }
          }
          
          // Exclude social media (additional platforms not covered by directory filter)
          if (defaultFilters.excludeSocialMedia) {
            if (hostname.includes('snapchat.com') ||
                hostname.includes('whatsapp.com') ||
                hostname.includes('telegram.org') ||
                hostname.includes('discord.com') ||
                hostname.includes('reddit.com') ||
                hostname.includes('tumblr.com') ||
                hostname.includes('vine.co') ||
                hostname.includes('vimeo.com') ||
                hostname.includes('dailymotion.com') ||
                hostname.includes('twitch.tv')) {
              return false;
            }
          }
          
          // Exclude news sites
          if (defaultFilters.excludeNewsSites) {
            if (hostname.includes('news.') ||
                hostname.includes('reuters.com') ||
                hostname.includes('bloomberg.com') ||
                hostname.includes('cnn.com') ||
                hostname.includes('bbc.com') ||
                hostname.includes('nytimes.com')) {
              return false;
            }
          }
          
          // Exclude blogs
          if (defaultFilters.excludeBlogs) {
            if (hostname.includes('blog.') ||
                hostname.includes('medium.com') ||
                hostname.includes('wordpress.com') ||
                hostname.includes('blogspot.com') ||
                pathname.includes('/blog/')) {
              return false;
            }
          }
          
          return true;
        } catch (e) {
          return true; // If we can't parse the URL, include it
        }
      })
      .map((result: any, index: number) => {
        // Extract base URL from full URL
        let baseUrl = '';
        try {
          const url = new URL(result.link || '');
          baseUrl = url.hostname.replace('www.', '');
        } catch (e) {
          baseUrl = result.displayLink || 'Unknown domain';
        }

        return {
          position: index + 1,
          title: result.title || 'No title',
          url: result.link || '',
          displayUrl: baseUrl,
          fullUrl: result.link || '',
          description: result.snippet || 'No description available',
          cacheId: result.cacheId || undefined
        };
      });

    return NextResponse.json({
      success: true,
      results: filteredResults,
      totalResults: data.searchInformation?.totalResults || filteredResults.length,
      searchTime: data.searchInformation?.searchTime || 0,
      filtersApplied: defaultFilters,
      originalCount: data.items?.length || 0,
      filteredCount: filteredResults.length,
      pagination: {
        currentPage: pageNumber,
        resultsPerPage: limit,
        totalPages: Math.ceil((data.searchInformation?.totalResults || 0) / limit),
        hasNextPage: pageNumber < 10 && (pageNumber * limit) < (data.searchInformation?.totalResults || 0),
        hasPreviousPage: pageNumber > 1
      }
    });

  } catch (error: any) {
    console.error('Search Engine API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform search',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { industrySearchTraceability } from '@/lib/industrySearchTraceability';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      queries, // Array of search queries
      query, // Single query (for backward compatibility)
      apiKey, 
      searchEngineId, 
      resultsLimit = '10',
      filters = {},
      page = '1',
      // Add date filtering options
      maxAgeDays = 365, // Maximum age in days (default: 1 year)
      requireDateFiltering = true, // Whether to enforce date filtering
      // Add traceability options
      enableTraceability = true, // Enable full traceability
      industry, // Industry context for traceability
      location, // Location context for traceability
      city, // City context for traceability
      stateProvince, // State/Province context for traceability
      country, // Country context for traceability
    } = body;

    // Support both single query and multiple queries
    const searchQueries = queries || [query];
    
    if (!searchQueries || searchQueries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No search queries provided' },
        { status: 400 }
      );
    }

    if (!apiKey || !searchEngineId) {
      return NextResponse.json(
        { success: false, error: 'Missing API key or search engine ID' },
        { status: 400 }
      );
    }

    // Validate results limit - Google CSE only supports up to 10 results per request
    const limit = Math.min(Math.max(parseInt(resultsLimit) || 10, 1), 10);
    const pageNumber = Math.max(parseInt(page) || 1, 1);

    console.log('Search request received:', {
      queries: searchQueries,
      singleQuery: query,
      apiKey: apiKey ? '***' : 'missing',
      searchEngineId,
      resultsLimit: limit,
      page: pageNumber,
      maxAgeDays,
      requireDateFiltering,
      enableTraceability,
      industry,
      location,
      city,
      stateProvince,
      country
    });

    // Create traceability session if enabled
    let searchSessionId: string | null = null;
    if (enableTraceability) {
      try {
        console.log(`🔍 Creating search session for queries:`, searchQueries);
        console.log(`🔍 Traceability enabled: ${enableTraceability}`);
        console.log(`🔍 Page number: ${pageNumber}`);
        
        const session = await industrySearchTraceability.createSearchSession({
          searchQueries,
          industry,
          location,
          city,
          stateProvince,
          country,
          apiKey,
          searchEngineId,
          resultsLimit: limit,
          filters,
        });
        searchSessionId = session.id;
        console.log(`🔍 Created traceability session: ${searchSessionId} for page ${pageNumber}`);
      } catch (error) {
        console.error('⚠️ Failed to create traceability session, continuing without it:', error);
      }
    } else {
      console.log(`🔍 Traceability disabled for this request`);
    }

    // Process multiple queries in parallel for better performance
    const allResults: Array<{
      position: number;
      title: string;
      url: string;
      displayUrl: string;
      fullUrl: string;
      description: string;
      cacheId?: string;
      query: string;
    }> = [];
    const queryResults: Record<string, {
      success: boolean;
      results: any[];
      totalResults: number;
      searchTime?: number;
      error?: string;
    }> = {};

    const startTime = Date.now();

    // Helper function to process a single query
    const processQuery = async (query: string, queryIndex: number) => {
      const currentQuery = query.trim();
      
      if (!currentQuery) {
        console.log(`Skipping empty query at index ${queryIndex}`);
        return {
          success: false,
          error: 'Empty query',
          results: [],
          totalResults: 0
        };
      }

      try {
        console.log(`Processing query ${queryIndex + 1}/${searchQueries.length}: "${currentQuery}"`);
        
        // Build Google API request URL
        const requestUrl = new URL('https://www.googleapis.com/customsearch/v1');
        requestUrl.searchParams.append('q', currentQuery);
        requestUrl.searchParams.append('key', apiKey);
        requestUrl.searchParams.append('cx', searchEngineId);
        requestUrl.searchParams.append('num', limit.toString());
        
        // Add date filtering if enabled
        if (requireDateFiltering && maxAgeDays > 0) {
          // Google CSE dateRestrict parameter supports various formats
          // For maxAgeDays, we use the "d" suffix for days
          const dateRestrict = `${maxAgeDays}d`;
          requestUrl.searchParams.append('dateRestrict', dateRestrict);
          console.log(`📅 Adding date restriction: ${dateRestrict} (max ${maxAgeDays} days old)`);
        }
        
        if (pageNumber > 1) {
          const startIndex = ((pageNumber - 1) * limit) + 1;
          requestUrl.searchParams.append('start', startIndex.toString());
        }

        console.log(`Making request to Google API for query: "${currentQuery}"`);
        const response = await fetch(requestUrl.toString());
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Google API error for query "${currentQuery}":`, {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          return {
            success: false,
            error: `Google API error: ${response.status} ${response.statusText}`,
            results: [],
            totalResults: 0
          };
        }

        const data = await response.json();
        console.log(`Google API response for query "${currentQuery}":`, {
          totalResults: data.searchInformation?.totalResults,
          itemsCount: data.items?.length || 0
        });

        // Apply filters to results
        const defaultFilters = {
          excludeDirectories: filters.excludeDirectories || false,
          excludeForums: filters.excludeForums || false,
          excludeSocialMedia: filters.excludeSocialMedia || false,
          excludeNewsSites: filters.excludeNewsSites || false,
          excludeBlogs: filters.excludeBlogs || false
        };
        
        // Debug: Track filtering stats
        let filteredOutCount = 0;
        const rejectionReasons: Record<string, number> = {};
        const originalCount = (data.items || []).length;

        const filteredResults = (data.items || [])
          .filter((result: any) => {
            try {
              const url = new URL(result.link || '');
              const hostname = url.hostname.toLowerCase();
              const pathname = url.pathname.toLowerCase();

              // Exclude directories
              if (defaultFilters.excludeDirectories) {
                if (hostname.includes('directory.') ||
                    hostname.includes('listings.') ||
                    hostname.includes('yellowpages') ||
                    hostname.includes('whitepages') ||
                    hostname.includes('superpages') ||
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
                  filteredOutCount++;
                  rejectionReasons['Directory/Social Media'] = (rejectionReasons['Directory/Social Media'] || 0) + 1;
                  console.log(`   ❌ FILTERED OUT: ${hostname} - Directory/Social Media`);
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
                  filteredOutCount++;
                  rejectionReasons['Forum/Community'] = (rejectionReasons['Forum/Community'] || 0) + 1;
                  console.log(`   ❌ FILTERED OUT: ${hostname} - Forum/Community`);
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
              cacheId: result.cacheId || undefined,
              query: currentQuery, // Add the query that generated this result
              // Add date information if available from Google CSE
              date: result.pagemap?.metatags?.[0]?.['article:published_time'] || 
                    result.pagemap?.metatags?.[0]?.['date'] ||
                    result.pagemap?.metatags?.[0]?.['og:updated_time'] ||
                    undefined
            };
          });

        // Debug: Log filtering results
        console.log(`\n🔍 FILTERING RESULTS for query "${currentQuery}":`);
        console.log(`   Original results: ${originalCount}`);
        console.log(`   After filtering: ${filteredResults.length}`);
        console.log(`   Filtered out: ${filteredOutCount}`);
        console.log(`   Filtering rate: ${((filteredOutCount / originalCount) * 100).toFixed(1)}%`);
        console.log(`   Rejection reasons:`);
        Object.entries(rejectionReasons).forEach(([reason, count]) => {
          console.log(`     ${reason}: ${count}`);
        });
        
        return {
          success: true,
          results: filteredResults,
          totalResults: parseInt(data.searchInformation?.totalResults) || filteredResults.length,
          searchTime: data.searchInformation?.searchTime || 0
        };

      } catch (error: any) {
        console.error(`Error processing query "${currentQuery}":`, error);
        
        return {
          success: false,
          error: error.message || 'Unknown error',
          results: [],
          totalResults: 0
        };
      }
    };

    // Process all queries in parallel
    console.log(`Processing ${searchQueries.length} queries in parallel...`);
    const queryPromises = searchQueries.map((query: string, index: number) => processQuery(query, index));
    const queryResultsArray = await Promise.all(queryPromises);

    // Process results and build combined data
    let totalResults = 0;
    const urlSet = new Set<string>(); // For efficient deduplication

    for (let i = 0; i < queryResultsArray.length; i++) {
      const query = searchQueries[i];
      const result = queryResultsArray[i];
      
      queryResults[query] = result;

      if (result.success && result.results.length > 0) {
        // Add to combined results (avoid duplicates)
        for (const searchResult of result.results) {
          if (!urlSet.has(searchResult.url)) {
            urlSet.add(searchResult.url);
            // IMPORTANT: Add query attribution to each result
            allResults.push({
              ...searchResult,
              query: query // Track which query this result came from
            });
          }
        }
      }
    }

    totalResults = allResults.length;

    // Apply pagination to deduplicated results
    const startIndex = (pageNumber - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = allResults.slice(startIndex, endIndex);
    
    // Calculate combined pagination
    const combinedPagination = {
      currentPage: pageNumber,
      resultsPerPage: limit,
      totalPages: Math.ceil(totalResults / limit),
      hasNextPage: endIndex < totalResults,
      hasPreviousPage: pageNumber > 1
    };

    // Store search results in traceability system if enabled
    if (enableTraceability && searchSessionId) {
      try {
        // Prepare search results for storage
        const searchResultsForStorage = allResults.map((result, index) => ({
          searchSessionId: searchSessionId!,
          position: result.position,
          title: result.title,
          url: result.url,
          displayUrl: result.displayUrl,
          description: result.description,
          snippet: result.description, // Use description as snippet
          cacheId: result.cacheId,
          query: result.query, // This now properly tracks which query the result came from
        }));

        console.log(`📊 Storing ${searchResultsForStorage.length} search results with query attribution:`);
        // Log query distribution
        const queryDistribution = searchResultsForStorage.reduce((acc, result) => {
          acc[result.query] = (acc[result.query] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        Object.entries(queryDistribution).forEach(([query, count]) => {
          console.log(`   Query "${query}": ${count} results`);
        });

        // Add search results to the session
        await industrySearchTraceability.addSearchResults(searchSessionId, searchResultsForStorage);

        // Complete the search session
        const searchTime = (Date.now() - startTime) / 1000;
        const successfulQueries = Object.values(queryResults).filter((q: any) => q.success).length;
        
        await industrySearchTraceability.completeSearchSession(
          searchSessionId,
          totalResults,
          successfulQueries,
          searchTime
        );

        console.log(`📊 Traceability: Stored ${totalResults} search results in session ${searchSessionId}`);
      } catch (error) {
        console.error('⚠️ Failed to store search results in traceability system:', error);
      }
    }

    console.log('Search completed successfully:', {
      totalQueries: searchQueries.length,
      successfulQueries: Object.values(queryResults).filter((q: any) => q.success).length,
      totalResults,
      combinedResults: allResults.length,
      traceabilitySessionId: searchSessionId
    });
    
    // Final debug summary
    console.log(`\n🔍 FINAL SEARCH DEBUG SUMMARY:`);
    console.log(`   Total queries processed: ${searchQueries.length}`);
    console.log(`   Successful queries: ${Object.values(queryResults).filter((q: any) => q.success).length}`);
    console.log(`   Total results before deduplication: ${totalResults}`);
    console.log(`   Final unique results: ${allResults.length}`);
    console.log(`   Deduplication rate: ${((totalResults - allResults.length) / totalResults * 100).toFixed(1)}%`);
    
    // Show query distribution
    const queryDistribution = allResults.reduce((acc, result) => {
      acc[result.query] = (acc[result.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`   Query distribution:`);
    Object.entries(queryDistribution).forEach(([query, count]) => {
      console.log(`     "${query}": ${count} results`);
    });
    
    if (searchSessionId) {
      console.log(`   🔍 Traceability Session ID: ${searchSessionId}`);
    }

    return NextResponse.json({
      success: true,
      results: paginatedResults,
      queryResults, // Individual results for each query
      totalResults,
      searchTime: Object.values(queryResults).reduce((total: number, q: any) => total + (q.searchTime || 0), 0),
      filtersApplied: filters,
      pagination: combinedPagination,
      queriesProcessed: searchQueries.length,
      successfulQueries: Object.values(queryResults).filter((q: any) => q.success).length,
      // Add date filtering information
      dateFiltering: {
        enabled: requireDateFiltering,
        maxAgeDays: maxAgeDays,
        dateRestrict: requireDateFiltering && maxAgeDays > 0 ? `${maxAgeDays}d` : undefined,
        description: requireDateFiltering && maxAgeDays > 0 
          ? `Results limited to content published within the last ${maxAgeDays} days`
          : 'No date filtering applied'
      },
      // Add traceability information
      traceability: enableTraceability ? {
        enabled: true,
        sessionId: searchSessionId,
        resultsStored: totalResults,
        queriesStored: searchQueries.length
      } : {
        enabled: false
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

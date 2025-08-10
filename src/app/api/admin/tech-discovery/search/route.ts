import { NextRequest, NextResponse } from 'next/server';

// Helper function to map BuiltWith result to our company format
function mapBuiltWithResult(result: any) {
  return {
    // Basic info
    domain: result.D,
    organization: result.META?.CompanyName || '',
    email: result.META?.Emails?.[0] || '',
    phone: result.META?.Telephones?.[0] || '',
    country: result.META?.Country || result.Country || '',
    enriched: false,
    
    // Timestamps
    firstIndexed: new Date(result.FI * 1000).toISOString().split('T')[0],
    lastIndexed: new Date(result.LI * 1000).toISOString().split('T')[0],
    firstDetected: new Date(result.FD * 1000).toISOString().split('T')[0],
    lastDetected: new Date(result.LD * 1000).toISOString().split('T')[0],
    
    // Location details
    city: result.META?.City || '',
    state: result.META?.State || '',
    postcode: result.META?.Postcode || '',
    
    // Contact arrays
    emails: result.META?.Emails || [],
    telephones: result.META?.Telephones || [],
    socialLinks: result.META?.Social || [],
    
    // Business info
    vertical: result.META?.Vertical || '',
    titles: result.META?.Titles || [],
    
    // Traffic & Analytics
    employeeCount: result.E || 0,
    trafficRank: result.A || 0,
    qualityRank: result.Q || 0,
    uniqueVisitors: result.U || 0,
    monthlyVisits: result.M || 0,
    
    // Raw data for debugging
    rawData: result
  };
}

// Helper function to convert country codes to names
function getCountryName(countryCode: string): string {
  const countryMap: Record<string, string> = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'AU': 'Australia',
    'JP': 'Japan',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'BE': 'Belgium',
    'IT': 'Italy',
    'ES': 'Spain',
    'PT': 'Portugal',
    'IE': 'Ireland',
    'NZ': 'New Zealand',
    'SG': 'Singapore',
    'KR': 'South Korea',
    'TW': 'Taiwan',
    'HK': 'Hong Kong',
    'IL': 'Israel',
    'ZA': 'South Africa'
  };
  return countryMap[countryCode] || countryCode;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Tech Discovery Search API called');
    console.log('📋 Request method:', request.method);
    console.log('📋 Request headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.json();
    const { technology, country, since } = body;
    
    console.log('📋 Request body:', { technology, country, since });

    if (!technology) {
      console.log('❌ No technology provided');
      return NextResponse.json(
        { success: false, message: 'Technology is required' },
        { status: 400 }
      );
    }

    console.log('✅ Technology provided:', technology);
    // Skip validation for now - let BuiltWith API handle invalid technologies

    console.log('🔍 Searching for companies with technology:', technology);
    
    // Temporary: Use a simple fetch to test BuiltWith API directly
    const apiKey = process.env.BUILTWITH_API_KEY;
    const url = `https://api.builtwith.com/lists11/api.json?KEY=${apiKey}&TECH=${encodeURIComponent(technology)}&META=yes&COUNTRY=${country || 'US'}&SINCE=${encodeURIComponent(since || '30 Days Ago')}`;
    
    console.log('📡 Making direct BuiltWith API request to:', url);
    
    // Try the request with different approaches if it fails
    let fetchResponse;
    
    try {
      // First attempt: Try with the specified country
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      fetchResponse = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.log('🔄 First attempt failed, trying without SINCE parameter...');
      
      // Second attempt: Remove SINCE parameter (sometimes this helps)
      const urlWithoutSince = `https://api.builtwith.com/lists11/api.json?KEY=${apiKey}&TECH=${encodeURIComponent(technology)}&META=yes&COUNTRY=${country || 'US'}`;
      
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 8000);
        
        fetchResponse = await fetch(urlWithoutSince, {
          signal: controller2.signal
        });
        
        clearTimeout(timeoutId2);
        console.log('✅ Second attempt succeeded without SINCE parameter');
      } catch (error2) {
        console.log('🔄 Second attempt failed, trying with global search...');
        
        // Third attempt: Try without country restriction
        const globalUrl = `https://api.builtwith.com/lists11/api.json?KEY=${apiKey}&TECH=${encodeURIComponent(technology)}&META=yes`;
        
        const controller3 = new AbortController();
        const timeoutId3 = setTimeout(() => controller3.abort(), 8000);
        
        fetchResponse = await fetch(globalUrl, {
          signal: controller3.signal
        });
        
        clearTimeout(timeoutId3);
        console.log('✅ Third attempt succeeded with global search');
      }
    }
    console.log('📥 BuiltWith API response status:', fetchResponse.status);
    
    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.error('❌ BuiltWith API error:', errorText);
      throw new Error(`BuiltWith API error: ${fetchResponse.status} ${fetchResponse.statusText}`);
    }
    
    const data = await fetchResponse.json();
    console.log('✅ BuiltWith API response received');
    
    // Transform the data to match our expected format
    let companies = data.Results?.map(mapBuiltWithResult) || [];

    // If we did a global search but user specified a country, filter results
    if (country && companies.length > 0) {
      const filteredCompanies = companies.filter((company: any) => 
        company.country.toLowerCase() === country.toLowerCase() ||
        company.country.toLowerCase() === getCountryName(country).toLowerCase()
      );
      
      // If we have filtered results, use them. Otherwise, keep all results but note it's global
      if (filteredCompanies.length > 0) {
        companies = filteredCompanies;
        console.log(`🌍 Filtered ${companies.length} companies for country: ${country}`);
      } else {
        console.log(`🌍 No companies found for ${country}, showing global results`);
      }
    }

    // Get multiple pages of results to return more companies
    let allCompanies = companies;
    let nextOffset = data.NextOffset;
    let pageCount = 1;
    const maxPages = 5; // Get up to 5 pages (typically 50-100 results)
    
    console.log(`📄 Page 1: Found ${companies.length} companies, NextOffset: ${nextOffset}`);
    
    // Get additional pages if available
    while (nextOffset && nextOffset !== "END" && pageCount < maxPages) {
      try {
        pageCount++;
        console.log(`📄 Fetching page ${pageCount} with offset: ${nextOffset}`);
        
        // Build URL for next page
        const nextUrl = `https://api.builtwith.com/lists11/api.json?KEY=${apiKey}&TECH=${encodeURIComponent(technology)}&META=yes&COUNTRY=${country || 'US'}&OFFSET=${nextOffset}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Shorter timeout for additional pages
        
        const nextResponse = await fetch(nextUrl, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (nextResponse.ok) {
          const nextData = await nextResponse.json();
          
          if (nextData.Results && nextData.Results.length > 0) {
            const nextCompanies = nextData.Results.map(mapBuiltWithResult);
            
            // Filter for country if needed
            if (country) {
              const filteredNext = nextCompanies.filter((company: any) => 
                company.country.toLowerCase() === country.toLowerCase() ||
                company.country.toLowerCase() === getCountryName(country).toLowerCase()
              );
              allCompanies = allCompanies.concat(filteredNext.length > 0 ? filteredNext : nextCompanies);
            } else {
              allCompanies = allCompanies.concat(nextCompanies);
            }
            
            nextOffset = nextData.NextOffset;
            console.log(`📄 Page ${pageCount}: Added ${nextCompanies.length} companies, total: ${allCompanies.length}, NextOffset: ${nextOffset}`);
          } else {
            console.log(`📄 Page ${pageCount}: No results, stopping pagination`);
            break;
          }
        } else {
          console.log(`📄 Page ${pageCount}: Request failed, stopping pagination`);
          break;
        }
      } catch (error: any) {
        console.log(`📄 Page ${pageCount}: Error fetching additional results:`, error?.message || String(error));
        break; // Stop pagination on error but return what we have
      }
    }

    console.log(`✅ Total found: ${allCompanies.length} companies across ${pageCount} pages`);
    console.log('📤 Sending response back to client');
    const response = NextResponse.json({
      success: true,
      data: allCompanies,
      message: `Found ${allCompanies.length} companies using ${technology}${pageCount > 1 ? ` (${pageCount} pages)` : ''}`,
      pagination: {
        pages: pageCount,
        hasMore: nextOffset && nextOffset !== "END",
        nextOffset: nextOffset
      }
    });
    console.log('📤 Response sent successfully');
    return response;

      } catch (error) {
      console.error('Tech discovery search error:', error);
      
      // Handle abort error specifically
      if ((error as any)?.name === 'AbortError') {
        console.error('🔴 BuiltWith API request timed out');
        return NextResponse.json(
          { success: false, message: 'BuiltWith API request timed out. Please try again.' },
          { status: 500 }
        );
      }
      
      // Return the actual error message
      let errorMessage = 'Failed to search companies';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('🔴 Detailed error:', error);
      }
      
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 500 }
      );
    }
}

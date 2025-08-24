import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { submitJobAndWaitForCompletion } from '@/lib/jobPoller';

export async function POST(request: NextRequest) {
  try {
    const { industry, productOrMarket } = await request.json();

    const resolvedIndustry = (productOrMarket || industry)?.toString();

    if (!resolvedIndustry || typeof resolvedIndustry !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Industry (or productOrMarket) parameter is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('Industry keyword generation requested for:', resolvedIndustry);

    // 1) Try external keywords API with Redis/Bull queue
    try {
      const baseUrl = process.env.MARKETING_MCP_API_URL || 'https://marketing-mcp-beta.vercel.app';
      const bypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

      if (!bypassToken) {
        throw new Error('VERCEL_AUTOMATION_BYPASS_SECRET is not set');
      }

      console.log('Calling external keywords API with queue system:', baseUrl);
      
      // Submit job and wait for completion
      const pollResult = await submitJobAndWaitForCompletion(
        baseUrl,
        '/api/keywords',
        { productOrMarket: resolvedIndustry },
        bypassToken,
        {
          maxPollingTime: 5 * 60 * 1000, // 5 minutes
          pollInterval: 2000, // 2 seconds
          onProgress: (status, progress) => {
            console.log(`Job progress: ${status} - ${progress}%`);
          },
          onError: (error) => {
            console.warn(`Job polling error: ${error}`);
          }
        }
      );

      if (!pollResult.success || !pollResult.result) {
        console.error('External API job failed:', pollResult);
        throw new Error(pollResult.error || 'External API job failed');
      }

      console.log('External API job completed successfully:', {
        success: pollResult.success,
        hasResult: !!pollResult.result,
        resultType: typeof pollResult.result
      });

      // Extract search terms from various possible shapes
      const extractTerms = (obj: any): string[] => {
        if (!obj) return [];
        if (Array.isArray(obj)) return obj;
        if (Array.isArray(obj.search_terms)) return obj.search_terms;
        if (Array.isArray(obj.keywords)) return obj.keywords;
        if (obj.data) return extractTerms(obj.data);
        if (obj.result) return extractTerms(obj.result);
        if (obj.payload) return extractTerms(obj.payload);
        return [];
      };

      let terms = extractTerms(pollResult.result)
        .filter((t: any) => typeof t === 'string')
        .map((t: string) => t.trim())
        .filter(Boolean);
        
      // Deduplicate and basic length filter (2–8 words)
      terms = Array.from(new Set(terms)).filter((t: string) => {
        const w = t.split(/\s+/).filter(Boolean).length;
        return w >= 2 && w <= 8;
      });

      if (terms.length === 0) {
        throw new Error('External API returned no keywords');
      }

      const keywords = { search_terms: terms } as { search_terms: string[] };

      // Save keywords to database
      if (keywords.search_terms && keywords.search_terms.length > 0) {
        console.log(`Attempting to save ${keywords.search_terms.length} keywords to database...`);
        try {
          // Get or create industry (case-insensitive search for SQLite)
          let industryRecord = await prisma.industry.findFirst({
            where: { 
              OR: [
                { label: resolvedIndustry },
                { label: resolvedIndustry.toLowerCase() },
                { label: resolvedIndustry.toUpperCase() },
                { label: resolvedIndustry.charAt(0).toUpperCase() + resolvedIndustry.slice(1).toLowerCase() }
              ]
            }
          });
          
          if (!industryRecord) {
            // Only create if we really can't find it
            console.log(`Industry "${resolvedIndustry}" not found, creating new record...`);
            industryRecord = await prisma.industry.create({
              data: { 
                label: resolvedIndustry,
                code: resolvedIndustry.substring(0, 4).toUpperCase()
              }
            });
            console.log('Created new industry record:', industryRecord.id);
          } else {
            console.log('Found existing industry record:', industryRecord.id);
          }
          
          // Save all search terms to database
          const savedKeywords: any[] = [];
          console.log(`Starting to save ${keywords.search_terms.length} keywords...`);
          
          for (const searchTerm of keywords.search_terms) {
            try {
              console.log(`Saving keyword: "${searchTerm}"`);
              const keywordRecord = await prisma.keyword.upsert({
                where: {
                  searchTerm_industryId: {
                    searchTerm,
                    industryId: industryRecord.id
                  }
                },
                update: {
                  updatedAt: new Date()
                },
                create: {
                  searchTerm,
                  industryId: industryRecord.id
                }
              });
              savedKeywords.push(keywordRecord);
              console.log(`Successfully saved keyword: "${searchTerm}"`);
            } catch (keywordError) {
              console.error(`Failed to save keyword "${searchTerm}":`, keywordError);
            }
          }
          
          console.log(`Saved ${savedKeywords.length} keywords to database for industry "${resolvedIndustry}"`);
          
          // Add database info to response
          (keywords as any)._database = {
            industryId: industryRecord.id,
            keywordsSaved: savedKeywords.length,
            totalKeywords: keywords.search_terms.length
          };
          
        } catch (dbError) {
          console.error('Database operation failed:', dbError);
          // Continue with response even if database save fails
          (keywords as any)._database = {
            error: 'Database save failed',
            details: dbError instanceof Error ? dbError.message : 'Unknown database error'
          };
        }
      }

      console.log('External API call completed, returning normalized response');
      return NextResponse.json({
        success: true,
        industry: resolvedIndustry,
        keywords,
        _source: 'external_api',
        _message: 'Keywords generated via external API and normalized to search_terms'
      });
    } catch (externalError) {
      console.error('External keywords API failed:', externalError);
    }

    // If we reach here, external API failed – return a clear error (no LLM fallback)
    const basicKeywords = { search_terms: [] };
    return NextResponse.json({
      success: false,
      industry: resolvedIndustry,
      keywords: basicKeywords,
      _source: 'external_api_failed',
      _message: 'External keywords API failed; no fallback available'
    }, { status: 502 });

  } catch (error) {
    console.error('Error in industry keywords API:', error);
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



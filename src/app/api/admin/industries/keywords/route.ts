import { NextRequest, NextResponse } from 'next/server';
import { KeywordsChain } from '@/lib/llm/chains/keywords';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { industry } = await request.json();

    if (!industry || typeof industry !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Industry parameter is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('Industry keyword generation requested for:', industry);

    // Check if we have DeepSeek API key
    const hasDeepSeekApiKey = process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== '' && process.env.DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here';

    console.log('LLM Configuration check:', { 
      hasDeepSeekApiKey, 
      deepseekApiKey: process.env.DEEPSEEK_API_KEY ? 'present' : 'missing' 
    });

    if (hasDeepSeekApiKey) {
      console.log('Attempting to use DeepSeek LLM for keyword generation...');
      
      try {
        const keywords = await KeywordsChain.run({ industry });
        
        // Save keywords to database
        if (keywords.search_terms && keywords.search_terms.length > 0) {
          console.log(`Attempting to save ${keywords.search_terms.length} keywords to database...`);
          try {
            // Get or create industry (case-insensitive search for SQLite)
            let industryRecord = await prisma.industry.findFirst({
              where: { 
                OR: [
                  { label: industry },
                  { label: industry.toLowerCase() },
                  { label: industry.toUpperCase() },
                  { label: industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase() }
                ]
              }
            });
            
            if (!industryRecord) {
              // Only create if we really can't find it
              console.log(`Industry "${industry}" not found, creating new record...`);
              industryRecord = await prisma.industry.create({
                data: { label: industry }
              });
              console.log('Created new industry record:', industryRecord.id);
            } else {
              console.log('Found existing industry record:', industryRecord.id);
            }
            
            // Save all search terms to database
            const savedKeywords = [];
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
            
            console.log(`Saved ${savedKeywords.length} keywords to database for industry "${industry}"`);
            
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
        } else {
          console.log('No search_terms found in keywords response');
        }
        
        console.log('LLM call completed, returning raw LLM response');
        return NextResponse.json({
          success: true,
          industry,
          keywords,
          _source: 'llm',
          _llmResponse: true,
          _message: 'Raw LLM response - this is exactly what the model returned',
          _debug: {
            hasDeepSeekApiKey,
            model: process.env.KEYWORDS_LLM_MODEL || 'deepseek-chat',
            deepseekApiKey: process.env.DEEPSEEK_API_KEY ? 'present' : 'missing'
          }
        });
        
      } catch (llmError) {
        console.error('LLM call completely failed:', llmError);
        
        // Check if this is a DeepSeek configuration or balance issue
        const isDeepSeekConfigIssue = llmError instanceof Error && 
          (llmError.message.includes('DEEPSEEK_API_KEY not configured') || 
           llmError.message.includes('DeepSeek model error'));
        
        const isDeepSeekBalanceIssue = llmError instanceof Error && 
          llmError.message.includes('402 Insufficient Balance');
        
        return NextResponse.json({
          success: false,
          industry,
          error: 'LLM call failed completely',
          _source: 'llm_error',
          _llmError: llmError instanceof Error ? llmError.message : 'Unknown LLM error',
          _message: isDeepSeekBalanceIssue ? 
            'DeepSeek account has insufficient balance - add credits or use fallback' : 
            isDeepSeekConfigIssue ? 
              'DeepSeek configuration issue - check API key and configuration' : 
              'LLM failed to respond - check server logs for details',
          _debug: {
            hasDeepSeekApiKey,
            model: process.env.KEYWORDS_LLM_MODEL || 'deepseek-chat',
            deepseekApiKey: process.env.DEEPSEEK_API_KEY ? 'present' : 'missing',
            isDeepSeekConfigIssue,
            isDeepSeekBalanceIssue,
            recommendation: isDeepSeekBalanceIssue ? 
              'Add credits to DeepSeek account or use fallback keywords' : 
              isDeepSeekConfigIssue ? 
                'Check DeepSeek API key and configuration' : 
                'Check server logs for technical details'
          }
        }, { status: 500 });
      }
    }

    // Only use mock data if no DeepSeek configuration at all
    console.log('No DeepSeek configuration found, using basic mock data');
    const basicKeywords = {
      search_terms: [
        `${industry.toLowerCase()} company`,
        `${industry.toLowerCase()} services`,
        `${industry.toLowerCase()} contractor`,
        `${industry.toLowerCase()} provider`,
      ],
      _database: {
        note: 'Mock data - not saved to database'
      }
    };

    return NextResponse.json({
      success: true,
      industry,
      keywords: basicKeywords,
      _source: 'basic_mock',
      _message: 'Basic mock data - no DeepSeek configuration available'
    });

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



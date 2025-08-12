import { NextRequest, NextResponse } from 'next/server';
import { googleSearchParser } from '@/lib/llm/chains/googleSearchParser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchResults, industry, location } = body;

    if (!searchResults || !industry) {
      return NextResponse.json(
        { success: false, error: 'searchResults and industry are required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing Google Search Parser Chain with:', { industry, location });

    // Test the chain directly
    const result = await googleSearchParser.run({
      searchResults,
      industry,
      location: location || 'United States',
      enableTraceability: false
    });

    console.log('✅ Google Search Parser Chain result:', result);

    return NextResponse.json({
      success: true,
      input: { searchResults, industry, location },
      result,
      _source: 'google-search-parser-chain',
      _message: 'Direct chain test using unified LLM model'
    });

  } catch (error) {
    console.error('❌ Google Search Parser Chain test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Chain test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      _source: 'google-search-parser-chain-error'
    }, { status: 500 });
  }
}

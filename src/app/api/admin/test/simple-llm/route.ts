import { NextRequest, NextResponse } from 'next/server';
import { llmModel } from '@/lib/llm/model';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'prompt is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing Unified LLM Model with prompt:', prompt.substring(0, 100) + '...');

    // Test the unified model directly
    const response = await llmModel.call(prompt);

    console.log('✅ Unified LLM Model response received, length:', response.content?.length || 0);

    return NextResponse.json({
      success: true,
      input: { prompt: prompt.substring(0, 100) + '...' },
      response: {
        content: response.content,
        contentLength: response.content?.length || 0
      },
      _source: 'unified-llm-model',
      _message: 'Direct model test'
    });

  } catch (error) {
    console.error('❌ Unified LLM Model test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Model test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      _source: 'unified-llm-model-error'
    }, { status: 500 });
  }
}

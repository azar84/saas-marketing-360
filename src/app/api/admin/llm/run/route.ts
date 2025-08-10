import { NextResponse } from 'next/server';
import { runChain } from '@/lib/llm/core/registry';
import '@/lib/llm/register';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain');
    if (!chain) return NextResponse.json({ success: false, error: 'chain is required' }, { status: 400 });

    // Debug: Log environment variables
    console.log('LLM API Debug - Environment check:', {
      hasDeepSeekApiKey: !!process.env.DEEPSEEK_API_KEY,
      deepSeekApiKeyLength: process.env.DEEPSEEK_API_KEY?.length || 0,
      chain,
      nodeEnv: process.env.NODE_ENV,
      allEnvVars: Object.keys(process.env).filter(key => key.includes('DEEPSEEK') || key.includes('KEYWORDS')),
      envFile: process.env.NODE_ENV === 'development' ? '.env.local' : '.env'
    });

    const body = await request.json().catch(() => ({}));
    const input = body?.input ?? {};
    const options = body?.options ?? {};

    console.log('LLM API Debug - Request data:', { chain, input, options });

    // Check if chain exists
    const { getChain } = await import("@/lib/llm/core/registry");
    const chainDef = getChain(chain);
    console.log('LLM API Debug - Chain found:', !!chainDef, 'Chain ID:', chainDef?.id);

    if (!chainDef) {
      throw new Error(`Chain '${chain}' not found`);
    }

    const result = await runChain(chain, input, options);
    return NextResponse.json({ success: true, data: result });
  } catch (e: any) {
    console.error('LLM API Error:', e);
    console.error('LLM API Error Stack:', e?.stack);
    return NextResponse.json({ success: false, error: e?.message || 'Failed to run chain' }, { status: 500 });
  }
}



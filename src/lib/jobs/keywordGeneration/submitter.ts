/**
 * Keyword Generation Job Submitter
 * Handles submitting keyword generation jobs to external API
 */

import { KeywordGenerationJob } from './types';
import { KeywordGenerationRequest, KeywordGenerationResponse } from './types';

export async function submitKeywordGenerationJob(
  request: KeywordGenerationRequest
): Promise<KeywordGenerationResponse> {
  try {
    console.log('🌐 Submitting keyword generation job to external API:', request);
    
    const baseUrl = process.env.MARKETING_MCP_API_URL || 'https://marketing-mcp-beta.vercel.app';
    const bypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

    console.log('🔧 Environment variables:', {
      baseUrl,
      hasBypassToken: !!bypassToken
    });

    if (!bypassToken) {
      console.error('❌ VERCEL_AUTOMATION_BYPASS_SECRET is not set');
      return {
        success: false,
        jobId: '',
        error: 'VERCEL_AUTOMATION_BYPASS_SECRET is not set'
      };
    }

    // Submit job to external API
    const url = new URL('/api/keywords', baseUrl).toString();
    console.log('📡 Making request to:', url);
    console.log('📤 Request payload:', { productOrMarket: request.industry });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'x-vercel-protection-bypass': bypassToken 
      },
      body: JSON.stringify({ productOrMarket: request.industry })
    });

    console.log('📥 External API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('❌ External API error response:', errorText);
      throw new Error(`API error: ${response.status} ${response.statusText} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ External API successful response:', result);
    return result;
  } catch (error) {
    console.error('💥 Keyword generation job submission failed:', error);
    return {
      success: false,
      jobId: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function createKeywordGenerationJob(
  jobId: string,
  industry: string,
  pollUrl?: string,
  position?: number,
  estimatedWaitTime?: number
): KeywordGenerationJob {
  return {
    id: jobId,
    type: 'keyword-generation',
    status: 'queued',
    submittedAt: new Date(),
    progress: 0,
    metadata: {
      industry,
      pollUrl,
      position,
      estimatedWaitTime
    }
  };
}

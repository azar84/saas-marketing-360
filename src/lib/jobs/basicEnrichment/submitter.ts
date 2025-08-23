/**
 * Basic Company Enrichment Submitter
 */

import { BasicEnrichmentJob, BasicEnrichmentRequest, BasicEnrichmentResponse } from './types';

export async function submitBasicEnrichmentJob(
  request: BasicEnrichmentRequest
): Promise<BasicEnrichmentResponse> {
  try {
    const baseUrl = process.env.MARKETING_MCP_API_URL || 'https://marketing-mcp-queue-d133cd30bf62.herokuapp.com';

    const url = new URL('/api/enrich', baseUrl).toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteUrl: request.websiteUrl,
        options: {
          includeStaffEnrichment: false,
          includeExternalEnrichment: false,
          includeIntelligence: false,
          includeTechnologyExtraction: true,
          basicMode: true,
          maxHtmlLength: 50000,
          ...(request.options || {})
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API error: ${response.status} ${response.statusText} ${errorText}`);
    }

    const result = (await response.json()) as BasicEnrichmentResponse;
    return result;
  } catch (error) {
    return {
      success: false,
      jobId: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function createBasicEnrichmentJob(
  jobId: string,
  websiteUrl: string,
  pollUrl?: string,
  position?: number,
  estimatedWaitTime?: number,
  options?: BasicEnrichmentJob['metadata']['options']
): BasicEnrichmentJob {
  return {
    id: jobId,
    type: 'basic-enrichment',
    status: 'queued',
    submittedAt: new Date(),
    progress: 0,
    metadata: {
      websiteUrl,
      options,
      pollUrl,
      position,
      estimatedWaitTime
    }
  };
}



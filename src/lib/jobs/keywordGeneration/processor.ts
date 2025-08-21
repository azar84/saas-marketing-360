/**
 * Keyword Generation Job Processor
 * Handles polling and processing for keyword generation jobs
 */

import { BaseJobProcessor } from '../jobProcessor';
import { BaseJob } from '../types';
import { KeywordGenerationJob } from './types';

export class KeywordGenerationProcessor extends BaseJobProcessor {
  public async processJob(job: BaseJob): Promise<void> {
    // Only process keyword generation jobs
    if (job.type !== 'keyword-generation') {
      return;
    }

    const keywordJob = job as KeywordGenerationJob;
    
    try {
      console.log(`🔍 Polling keyword generation job: ${job.id}`);
      
      if (!keywordJob.metadata.pollUrl) {
        console.warn(`No pollUrl for job ${job.id}`);
        return;
      }

      // Poll the external API
      const baseUrl = process.env.MARKETING_MCP_API_URL || 'https://marketing-mcp-beta.vercel.app';
      const bypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
      
      if (!bypassToken) {
        console.error('VERCEL_AUTOMATION_BYPASS_SECRET not set');
        return;
      }

      const fullPollUrl = new URL(keywordJob.metadata.pollUrl, baseUrl).toString();
      const response = await fetch(fullPollUrl, {
        headers: {
          'x-vercel-protection-bypass': bypassToken
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Job ${job.id} poll response:`, data);
        
        if (data.success) {
          const updates: Partial<KeywordGenerationJob> = {
            status: data.status,
            progress: data.progress || job.progress
          };

          if (data.result) {
            updates.metadata = {
              ...keywordJob.metadata,
              result: data.result
            };
            updates.status = 'completed';
            updates.progress = 100;
          }

          if (data.error) {
            updates.error = data.error;
            updates.status = 'failed';
          }

          this.updateJobStatus(job.id, updates);
        }
      } else if (response.status === 404) {
        // Job still queued/processing - simulate progress
        const currentProgress = job.progress || 0;
        const newProgress = Math.min(currentProgress + 15, 90);
        
        this.updateJobStatus(job.id, {
          progress: newProgress,
          status: newProgress >= 90 ? 'processing' : 'queued'
        });
      }
    } catch (error) {
      console.error(`Error processing keyword generation job ${job.id}:`, error);
      
      // Mark as failed after max retries
      this.updateJobStatus(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

/**
 * Keyword Generation Job Types
 * Extends the base job system for keyword generation
 */

import { BaseJob, JobType } from '../types';

export interface KeywordGenerationJob extends BaseJob {
  type: 'keyword-generation';
  metadata: {
    industry: string;
    pollUrl?: string;
    position?: number;
    estimatedWaitTime?: number;
    result?: {
      keywords: string[];
      search_terms?: string[];
      subindustries?: string[];
      service_queries?: string[];
      transactional_modifiers?: string[];
      negative_keywords?: string[];
    };
  };
}

export interface KeywordGenerationRequest {
  industry: string;
}

export interface KeywordGenerationResponse {
  success: boolean;
  jobId: string;
  message?: string;
  error?: string;
  pollUrl?: string;
  position?: number;
  estimatedWaitTime?: number;
}

/**
 * Basic Company Enrichment Job Types
 */

import { BaseJob } from '../types';

export interface BasicEnrichmentOptions {
  includeStaffEnrichment?: boolean;
  includeExternalEnrichment?: boolean;
  includeIntelligence?: boolean;
  includeTechnologyExtraction?: boolean;
  basicMode?: boolean;
  maxHtmlLength?: number;
}

export interface BasicEnrichmentRequest {
  websiteUrl: string;
  options?: BasicEnrichmentOptions;
}

export interface BasicEnrichmentResponse {
  success: boolean;
  jobId: string;
  message?: string;
  error?: string;
  pollUrl?: string;
  position?: number;
  estimatedWaitTime?: number;
}

export interface BasicEnrichmentJob extends BaseJob {
  type: 'basic-enrichment';
  metadata: {
    websiteUrl: string;
    options?: BasicEnrichmentOptions;
    pollUrl?: string;
    position?: number;
    estimatedWaitTime?: number;
    result?: any;
  };
}



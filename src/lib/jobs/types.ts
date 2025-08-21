/**
 * Generic Job System Types
 * Base interfaces that can be extended for any job type
 */

export type JobStatus = 'queued' | 'processing' | 'active' | 'completed' | 'failed';

export type JobType = 'keyword-generation' | 'basic-enrichment' | 'enhanced-enrichment';

export interface BaseJob {
  id: string;
  type: JobType;
  status: JobStatus;
  submittedAt: Date;
  completedAt?: Date;
  progress: number;
  error?: string;
  position?: number;
  estimatedWaitTime?: number;
  result?: any;
  metadata: Record<string, any>; // Job-specific data
}

export interface JobSubmissionRequest {
  type: JobType;
  data: Record<string, any>; // Job-specific payload
}

export interface JobSubmissionResponse {
  success: boolean;
  jobId: string;
  message?: string;
  error?: string;
  pollUrl?: string;
  position?: number;
  estimatedWaitTime?: number;
}

export interface JobPollResponse {
  success: boolean;
  job: BaseJob;
  error?: string;
}

export interface JobUpdateRequest {
  jobId: string;
  status?: JobStatus;
  progress?: number;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

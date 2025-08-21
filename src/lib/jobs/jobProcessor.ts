/**
 * Generic Job Processor
 * Handles polling and processing for all job types
 */

import jobStore from './jobStore';
import { BaseJob, JobStatus } from './types';

export interface JobProcessorConfig {
  pollInterval: number; // How often to poll (in milliseconds)
  maxRetries: number;   // Maximum retry attempts
}

export abstract class BaseJobProcessor {
  protected config: JobProcessorConfig;
  protected isRunning: boolean = false;
  protected intervalId?: NodeJS.Timeout;

  constructor(config: JobProcessorConfig = { pollInterval: 2000, maxRetries: 3 }) {
    this.config = config;
  }

  // Start the processor
  start(): void {
    if (this.isRunning) {
      console.log('Job processor already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Generic job processor started');
    
    this.intervalId = setInterval(() => {
      this.processJobs();
    }, this.config.pollInterval);
  }

  // Stop the processor
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    console.log('🛑 Generic job processor stopped');
  }

  // Main processing loop
  protected async processJobs(): Promise<void> {
    try {
      const jobsToProcess = jobStore.getJobsNeedingProcessing();
      
      if (jobsToProcess.length === 0) {
        return;
      }

      console.log(`🔍 Processing ${jobsToProcess.length} jobs...`);

      for (const job of jobsToProcess) {
        await this.processJob(job);
      }
    } catch (error) {
      console.error('Error in job processing loop:', error);
    }
  }

  // Process a single job - to be implemented by specific processors
  public abstract processJob(job: BaseJob): Promise<void>;

  // Helper method to update job status
  protected updateJobStatus(jobId: string, updates: Partial<BaseJob>): boolean {
    return jobStore.updateJob(jobId, updates);
  }

  // Helper method to get job from store
  protected getJob(jobId: string): BaseJob | undefined {
    return jobStore.getJob(jobId);
  }
}

// Default processor that can be extended
export class GenericJobProcessor extends BaseJobProcessor {
  public async processJob(job: BaseJob): Promise<void> {
    // Default implementation - can be overridden
    console.log(`Processing job ${job.id} of type ${job.type}`);
  }
}

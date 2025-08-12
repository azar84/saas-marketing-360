import { EventEmitter } from 'events';

export interface JobProgress {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalResults: number;
  processedResults: number;
  acceptedCount: number;
  rejectedCount: number;
  errorCount: number;
  currentStep: string;
  startTime: Date;
  estimatedTimeRemaining?: number;
  progress: number; // 0-100
}

export interface BackgroundJob {
  id: string;
  type: 'industry_search_extraction';
  data: {
    searchResults: any[];
    industry?: string;
    location?: string;
    city?: string;
    stateProvince?: string;
    country?: string;
    minConfidence: number;
    dryRun: boolean;
    enableTraceability: boolean;
    searchSessionId?: string;
    searchResultIds?: string[];
  };
  progress: JobProgress;
  createdAt: Date;
  updatedAt: Date;
}

class BackgroundJobManager extends EventEmitter {
  private jobs: Map<string, BackgroundJob> = new Map();
  private isProcessing = false;
  private processingQueue: string[] = [];

  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.on('jobProgress', (jobId: string, progress: JobProgress) => {
      this.updateJobProgress(jobId, progress);
      this.emit('progressUpdate', jobId, progress);
    });

    this.on('jobCompleted', (jobId: string, result: any) => {
      this.completeJob(jobId, result);
    });

    this.on('jobFailed', (jobId: string, error: Error) => {
      this.failJob(jobId, error);
    });
  }

  /**
   * Create a new background job
   */
  async createJob(type: 'industry_search_extraction', data: BackgroundJob['data']): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: BackgroundJob = {
      id: jobId,
      type,
      data,
      progress: {
        jobId,
        status: 'pending',
        totalResults: data.searchResults.length,
        processedResults: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        errorCount: 0,
        currentStep: 'Initializing...',
        startTime: new Date(),
        progress: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(jobId, job);
    this.processingQueue.push(jobId);
    
    console.log(`🔧 Created background job: ${jobId}`);
    this.emit('jobCreated', jobId, job);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processNextJob();
    }

    return jobId;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): BackgroundJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): BackgroundJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get active jobs (pending or processing)
   */
  getActiveJobs(): BackgroundJob[] {
    return Array.from(this.jobs.values()).filter(job => 
      job.progress.status === 'pending' || job.progress.status === 'processing'
    );
  }

  /**
   * Update job progress
   */
  private updateJobProgress(jobId: string, progress: Partial<JobProgress>) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Update progress
    Object.assign(job.progress, progress);
    job.updatedAt = new Date();

    // Calculate progress percentage
    if (job.progress.totalResults > 0) {
      job.progress.progress = Math.round((job.progress.processedResults / job.progress.totalResults) * 100);
    }

    // Calculate estimated time remaining
    if (job.progress.processedResults > 0) {
      const elapsed = Date.now() - job.progress.startTime.getTime();
      const rate = job.progress.processedResults / elapsed;
      const remaining = (job.progress.totalResults - job.progress.processedResults) / rate;
      job.progress.estimatedTimeRemaining = Math.max(0, remaining);
    }

    console.log(`📊 Job ${jobId} progress: ${job.progress.processedResults}/${job.progress.totalResults} (${job.progress.progress}%)`);
    
    this.emit('progressUpdate', jobId, job.progress);
  }

  /**
   * Complete a job
   */
  private completeJob(jobId: string, result: any) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.progress.status = 'completed';
    job.progress.processedResults = job.progress.totalResults;
    job.progress.progress = 100;
    job.progress.currentStep = 'Completed';
    job.updatedAt = new Date();

    console.log(`✅ Job ${jobId} completed successfully`);
    this.emit('jobCompleted', jobId, result);
    
    // Remove from processing queue
    this.processingQueue = this.processingQueue.filter(id => id !== jobId);
    
    // Process next job
    this.processNextJob();
  }

  /**
   * Fail a job
   */
  private failJob(jobId: string, error: Error) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.progress.status = 'failed';
    job.progress.currentStep = `Failed: ${error.message}`;
    job.updatedAt = new Date();

    console.error(`❌ Job ${jobId} failed:`, error);
    this.emit('jobFailed', jobId, error);
    
    // Remove from processing queue
    this.processingQueue = this.processingQueue.filter(id => id !== jobId);
    
    // Process next job
    this.processNextJob();
  }

  /**
   * Process the next job in the queue
   */
  private async processNextJob() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const jobId = this.processingQueue.shift()!;
    const job = this.jobs.get(jobId);
    
    if (!job) {
      this.isProcessing = false;
      this.processNextJob();
      return;
    }

    try {
      console.log(`🚀 Starting background job: ${jobId}`);
      
      // Update status to processing
      this.updateJobProgress(jobId, {
        status: 'processing',
        currentStep: 'Starting extraction...',
      });

      // Use the existing API endpoint for processing
      const response = await fetch('/api/admin/industry-search/process-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchResults: job.data.searchResults,
          industry: job.data.industry,
          location: job.data.location,
          city: job.data.city,
          stateProvince: job.data.stateProvince,
          country: job.data.country,
          minConfidence: job.data.minConfidence,
          dryRun: job.data.dryRun,
          enableTraceability: job.data.enableTraceability,
          searchSessionId: job.data.searchSessionId,
          searchResultIds: job.data.searchResultIds,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process search results');
      }

      // Update progress with results
      const acceptedCount = result.businesses.filter((b: any) => b.isCompanyWebsite && b.confidence >= job.data.minConfidence).length;
      const rejectedCount = result.businesses.filter((b: any) => !b.isCompanyWebsite || b.confidence < job.data.minConfidence).length;

      this.updateJobProgress(jobId, {
        processedResults: job.data.searchResults.length,
        acceptedCount,
        rejectedCount,
        currentStep: 'Extraction completed',
      });

      // Complete the job
      this.completeJob(jobId, result);

    } catch (error) {
      console.error(`❌ Background job ${jobId} failed:`, error);
      this.failJob(jobId, error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.progress.status !== 'pending') {
      return false;
    }

    // Remove from queue
    this.processingQueue = this.processingQueue.filter(id => id !== jobId);
    
    // Mark as cancelled
    job.progress.status = 'failed';
    job.progress.currentStep = 'Cancelled by user';
    job.updatedAt = new Date();

    console.log(`🚫 Job ${jobId} cancelled`);
    this.emit('jobCancelled', jobId);
    
    return true;
  }

  /**
   * Clear completed jobs older than specified hours
   */
  clearOldJobs(hours: number = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    let clearedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.progress.status === 'completed' && job.updatedAt < cutoff) {
        this.jobs.delete(jobId);
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} old completed jobs`);
    }
  }

  /**
   * Get progress for notification center
   */
  getJobProgressForNotifications(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    return {
      current: job.progress.processedResults,
      total: job.progress.totalResults,
      percentage: job.progress.progress,
      status: job.progress.currentStep,
      acceptedCount: job.progress.acceptedCount,
      rejectedCount: job.progress.rejectedCount,
      estimatedTimeRemaining: job.progress.estimatedTimeRemaining,
    };
  }
}

// Export singleton instance
export const backgroundJobManager = new BackgroundJobManager();

// Clean up old jobs every hour
setInterval(() => {
  backgroundJobManager.clearOldJobs(24);
}, 60 * 60 * 1000);

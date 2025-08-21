/**
 * Shared Job Store
 * Centralized storage for keyword generation jobs
 */

export interface JobSubmission {
  id: string;
  industry: string;
  status: 'queued' | 'processing' | 'active' | 'completed' | 'failed';
  submittedAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  progress: number;
  position?: number;
  estimatedWaitTime?: number;
  pollUrl?: string; // Add pollUrl for frontend polling
}

class JobStore {
  private jobs = new Map<string, JobSubmission>();

  // Add a new job
  addJob(job: JobSubmission): void {
    this.jobs.set(job.id, job);
    console.log(`Job added to store: ${job.id} (${job.industry})`);
  }

  // Get a job by ID
  getJob(jobId: string): JobSubmission | undefined {
    return this.jobs.get(jobId);
  }

  // Get all jobs
  getAllJobs(): JobSubmission[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // Get jobs by industry
  getJobsByIndustry(industry: string): JobSubmission[] {
    return Array.from(this.jobs.values())
      .filter(job => job.industry === industry)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // Update a job
  updateJob(jobId: string, updates: Partial<JobSubmission>): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    // Update job with new data
    Object.assign(job, updates);
    
    // Set completedAt if status changed to completed or failed
    if (updates.status === 'completed' || updates.status === 'failed') {
      job.completedAt = new Date();
    }

    this.jobs.set(jobId, job);
    console.log(`Job updated: ${jobId} - ${updates.status || 'unknown'}`);
    return true;
  }

  // Delete a job
  deleteJob(jobId: string): boolean {
    const deleted = this.jobs.delete(jobId);
    if (deleted) {
      console.log(`Job deleted from store: ${jobId}`);
    }
    return deleted;
  }

  // Get job count by status
  getJobCountByStatus(status: JobSubmission['status']): number {
    return Array.from(this.jobs.values())
      .filter(job => job.status === status).length;
  }

  // Get total job count
  getTotalJobCount(): number {
    return this.jobs.size;
  }

  // Clear all jobs (useful for testing)
  clearAllJobs(): void {
    this.jobs.clear();
    console.log('All jobs cleared from store');
  }

  // Get jobs that need processing (queued or processing)
  getJobsNeedingProcessing(): JobSubmission[] {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'queued' || job.status === 'processing');
  }

  // Get completed jobs
  getCompletedJobs(): JobSubmission[] {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'completed')
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  }

  // Get failed jobs
  getFailedJobs(): JobSubmission[] {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'failed')
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  }
}

// Create singleton instance
const jobStore = new JobStore();

export default jobStore;

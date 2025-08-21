/**
 * Generic Job Store
 * Centralized storage for all types of jobs
 */

import { BaseJob, JobType, JobStatus } from './types';

class GenericJobStore {
  private jobs = new Map<string, BaseJob>();

  // Add a new job
  addJob(job: BaseJob): void {
    this.jobs.set(job.id, job);
    console.log(`Job added to store: ${job.id} (${job.type})`);
  }

  // Get a job by ID
  getJob(jobId: string): BaseJob | undefined {
    return this.jobs.get(jobId);
  }

  // Get all jobs
  getAllJobs(): BaseJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // Get jobs by type
  getJobsByType(type: JobType): BaseJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.type === type)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // Get jobs by industry (for keyword generation jobs)
  getJobsByIndustry(industry: string): BaseJob[] {
    return Array.from(this.jobs.values())
      .filter(job => {
        if (job.type === 'keyword-generation') {
          return (job as any).metadata?.industry === industry;
        }
        return false;
      })
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // Get jobs by status
  getJobsByStatus(status: JobStatus): BaseJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.status === status);
  }

  // Update a job
  updateJob(jobId: string, updates: Partial<BaseJob>): boolean {
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

  // Get job count by type
  getJobCountByType(type: JobType): number {
    return Array.from(this.jobs.values())
      .filter(job => job.type === type).length;
  }

  // Get job count by status
  getJobCountByStatus(status: JobStatus): number {
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
  getJobsNeedingProcessing(): BaseJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'queued' || job.status === 'processing');
  }

  // Get completed jobs
  getCompletedJobs(): BaseJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'completed');
  }

  // Get failed jobs
  getFailedJobs(): BaseJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'failed');
  }
}

// Export singleton instance
const jobStore = new GenericJobStore();
export default jobStore;

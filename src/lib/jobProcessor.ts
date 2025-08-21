/**
 * Background Job Processor
 * Monitors job completion and updates job status in the store
 */

interface JobUpdate {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  position?: number;
  estimatedWaitTime?: number;
}

export class JobProcessor {
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;
  private processingJobs = new Set<string>();

  constructor() {
    // Only start processing on the server side
    if (typeof window === 'undefined') {
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    
    // Only run on server side
    if (typeof window !== 'undefined') {
      console.log('⚠️ Job processor cannot run on client side');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 Job processor started');
    
    // Process jobs every 2 seconds for real-time updates
    this.interval = setInterval(() => {
      this.processJobs();
    }, 2000);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    console.log('🛑 Job processor stopped');
  }

  private async processJobs() {
    // Only run on server side
    if (typeof window !== 'undefined') {
      return;
    }
    
    try {
      // Get all queued and processing jobs
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const url = `${baseUrl}/api/admin/jobs`;
      
      console.log(`🔍 Fetching jobs from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch jobs for processing: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (!data.success || !data.jobs) return;

      const jobs = data.jobs.filter((job: any) => 
        job.status === 'queued' || job.status === 'processing' // Process both queued and processing jobs
      );

      for (const job of jobs) {
        if (this.processingJobs.has(job.id)) continue;
        
        this.processingJobs.add(job.id);
        this.processJob(job).finally(() => {
          this.processingJobs.delete(job.id);
        });
      }
    } catch (error) {
      console.error('Error in job processing loop:', error);
    }
  }

  private async processJob(job: any) {
    try {
      const baseUrl = process.env.MARKETING_MCP_API_URL || 'https://marketing-mcp-beta.vercel.app';
      const bypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

      if (!bypassToken) {
        console.error('VERCEL_AUTOMATION_BYPASS_SECRET not set');
        return;
      }

      // If job is queued, start processing it automatically
      if (job.status === 'queued') {
        console.log(`Job ${job.id} is queued - starting automatic processing`);
        
        // Mark job as processing first
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/jobs`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            jobId: job.id, 
            status: 'processing', 
            progress: 10 
          })
        });

        if (!updateResponse.ok) {
          console.warn(`Failed to mark job ${job.id} as processing`);
          return;
        }

        // Update local job status for this processing cycle
        job.status = 'processing';
        
        // Continue with processing the job immediately
        console.log(`Job ${job.id} marked as processing, continuing with external API call...`);
      }

      // ALWAYS poll job status from external API for ALL jobs (queued, processing, active)
      console.log(`Polling external API for job ${job.id} with status: ${job.status}`);
      
      const pollUrl = new URL(`/api/jobs/${job.id}`, baseUrl).toString();
      const pollRes = await fetch(pollUrl, {
        method: 'GET',
        headers: { 'x-vercel-protection-bypass': bypassToken }
      });

      if (!pollRes.ok) {
        if (pollRes.status === 404) {
          // Job not found in external API usually means it's completed
          console.log(`Job ${job.id} not found in external API - likely completed`);
          
          // Try to get the job result from our internal store
          const internalJob = await this.getJobFromStore(job.id);
          if (internalJob && internalJob.result) {
            console.log(`Job ${job.id} has result in internal store, marking as completed`);
            await this.updateJob({
              jobId: job.id,
              status: 'completed',
              progress: 100,
              result: internalJob.result
            });
          }
          return;
        }
        
        console.warn(`Failed to poll job ${job.id}:`, pollRes.status);
        return;
      }

      const pollData = await pollRes.json();
      console.log(`External API response for job ${job.id}:`, pollData);
      
      if (pollData.success) {
        // Update job status with real external data
        const update: JobUpdate = {
          jobId: job.id,
          status: pollData.status,
          progress: pollData.progress || 0,
          position: pollData.position,
          estimatedWaitTime: pollData.estimatedWaitTime
        };

        if (pollData.result) {
          update.result = pollData.result;
        }

        if (pollData.error) {
          update.error = pollData.error;
        }

        // Update job in store
        await this.updateJob(update);

        console.log(`Job ${job.id} status updated from external API:`, {
          status: update.status,
          progress: update.progress,
          hasResult: !!update.result
        });
      }
      
      // ALWAYS simulate progress for active/processing jobs to show movement
      // This ensures users see real-time updates even if external API doesn't provide progress
      if (job.status === 'processing' || job.status === 'active') {
        const currentProgress = job.progress || 10;
        const newProgress = Math.min(currentProgress + 10, 90); // Increment progress up to 90%
        
        console.log(`🔄 Simulating progress for job ${job.id}: ${currentProgress}% → ${newProgress}%`);
        
        await this.updateJob({
          jobId: job.id,
          status: 'processing',
          progress: newProgress
        });
        
        // Update local job progress for next iteration
        job.progress = newProgress;
      }
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
    }
  }

  private async getJobFromStore(jobId: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/admin/jobs?jobId=${jobId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.job) {
          return data.job;
        }
      }
    } catch (error) {
      console.error(`Error getting job ${jobId} from store:`, error);
    }
    return null;
  }

  private async updateJob(update: JobUpdate) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const url = `${baseUrl}/api/admin/jobs`;
      
      console.log(`🔄 Updating job ${update.jobId} at: ${url}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });

      if (!response.ok) {
        console.warn(`Failed to update job ${update.jobId}: ${response.status} ${response.statusText}`);
      } else {
        console.log(`✅ Job ${update.jobId} updated successfully`);
      }
    } catch (error) {
      console.error(`Error updating job ${update.jobId}:`, error);
    }
  }

  // Public method to manually process a specific job
  async processSpecificJob(jobId: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const url = `${baseUrl}/api/admin/jobs?jobId=${jobId}`;
      
      console.log(`🔍 Processing specific job ${jobId} from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch job ${jobId}: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (data.success && data.job) {
        console.log(`📋 Processing job: ${jobId} (${data.job.industry})`);
        await this.processJob(data.job);
      } else {
        console.warn(`Job ${jobId} not found or invalid response`);
      }
    } catch (error) {
      console.error(`Error processing specific job ${jobId}:`, error);
    }
  }
}

// Create singleton instance
const jobProcessor = new JobProcessor();

export default jobProcessor;

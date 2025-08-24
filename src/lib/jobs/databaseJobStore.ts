/**
 * Database-Backed Job Store
 * Persists jobs to the database so they survive refreshes and server restarts
 */

import { BaseJob, JobType, JobStatus } from './types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DatabaseJobStore {
  // Add a new job
  async addJob(job: BaseJob): Promise<void> {
    try {
      await prisma.job.create({
        data: {
          id: job.id,
          type: job.type,
          status: job.status,
          progress: job.progress,
          error: job.error,
          submittedAt: job.submittedAt,
          completedAt: job.completedAt,
          pollUrl: job.metadata?.pollUrl,
          result: job.result,
          metadata: job.metadata
        }
      });
      console.log(`Job added to database: ${job.id} (${job.type})`);
    } catch (error) {
      console.error(`Failed to add job to database: ${job.id}`, error);
      throw error;
    }
  }

  // Get a job by ID
  async getJob(jobId: string): Promise<BaseJob | undefined> {
    try {
      const dbJob = await prisma.job.findUnique({
        where: { id: jobId }
      });

      if (!dbJob) return undefined;

      return this.mapDbJobToBaseJob(dbJob);
    } catch (error) {
      console.error(`Failed to get job from database: ${jobId}`, error);
      return undefined;
    }
  }

  // Get all jobs
  async getAllJobs(): Promise<BaseJob[]> {
    try {
      const dbJobs = await prisma.job.findMany({
        orderBy: { submittedAt: 'desc' }
      });

      console.log(`🗄️ Database query returned ${dbJobs.length} jobs`);
      
      // Log job types breakdown
      const typeBreakdown = dbJobs.reduce((acc: any, job) => {
        acc[job.type] = (acc[job.type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Database jobs breakdown by type:', typeBreakdown);

      return dbJobs.map(this.mapDbJobToBaseJob);
    } catch (error) {
      console.error('Failed to get all jobs from database', error);
      return [];
    }
  }

  // Get jobs by type
  async getJobsByType(type: JobType): Promise<BaseJob[]> {
    try {
      const dbJobs = await prisma.job.findMany({
        where: { type },
        orderBy: { submittedAt: 'desc' }
      });

      return dbJobs.map(this.mapDbJobToBaseJob);
    } catch (error) {
      console.error(`Failed to get jobs by type from database: ${type}`, error);
      return [];
    }
  }

  // Get jobs by industry (for keyword generation jobs)
  async getJobsByIndustry(industry: string): Promise<BaseJob[]> {
    try {
      const dbJobs = await prisma.job.findMany({
        where: {
          type: 'keyword-generation',
          metadata: {
            path: ['industry'],
            equals: industry
          }
        },
        orderBy: { submittedAt: 'desc' }
      });

      return dbJobs.map(this.mapDbJobToBaseJob);
    } catch (error) {
      console.error(`Failed to get jobs by industry from database: ${industry}`, error);
      return [];
    }
  }

  // Get jobs by status
  async getJobsByStatus(status: JobStatus): Promise<BaseJob[]> {
    try {
      const dbJobs = await prisma.job.findMany({
        where: { status },
        orderBy: { submittedAt: 'desc' }
      });

      return dbJobs.map(this.mapDbJobToBaseJob);
    } catch (error) {
      console.error(`Failed to get jobs by status from database: ${status}`, error);
      return [];
    }
  }

  // Update a job
  async updateJob(jobId: string, updates: Partial<BaseJob>): Promise<boolean> {
    try {
      const updateData: any = {};

      if (updates.status) updateData.status = updates.status;
      if (updates.progress !== undefined) updateData.progress = updates.progress;
      if (updates.error !== undefined) updateData.error = updates.error;
      if (updates.result !== undefined) updateData.result = updates.result;
      if (updates.metadata) updateData.metadata = updates.metadata;

      // Set completedAt if status changed to completed or failed
      if (updates.status === 'completed' || updates.status === 'failed') {
        updateData.completedAt = new Date();
      }

      await prisma.job.update({
        where: { id: jobId },
        data: updateData
      });

      console.log(`Job updated in database: ${jobId} - ${updates.status || 'unknown'}`);
      return true;
    } catch (error) {
      console.error(`Failed to update job in database: ${jobId}`, error);
      return false;
    }
  }

  // Delete a job
  async deleteJob(jobId: string): Promise<boolean> {
    try {
      await prisma.job.delete({
        where: { id: jobId }
      });

      console.log(`Job deleted from database: ${jobId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete job from database: ${jobId}`, error);
      return false;
    }
  }

  // Get job count by type
  async getJobCountByType(type: JobType): Promise<number> {
    try {
      return await prisma.job.count({
        where: { type }
      });
    } catch (error) {
      console.error(`Failed to get job count by type from database: ${type}`, error);
      return 0;
    }
  }

  // Get job count by status
  async getJobCountByStatus(status: JobStatus): Promise<number> {
    try {
      return await prisma.job.count({
        where: { status }
      });
    } catch (error) {
      console.error(`Failed to get job count by status from database: ${status}`, error);
      return 0;
    }
  }

  // Get total job count
  async getTotalJobCount(): Promise<number> {
    try {
      return await prisma.job.count();
    } catch (error) {
      console.error('Failed to get total job count from database', error);
      return 0;
    }
  }

  // Clear all jobs (useful for testing)
  async clearAllJobs(): Promise<void> {
    try {
      await prisma.job.deleteMany({});
      console.log('All jobs cleared from database');
    } catch (error) {
      console.error('Failed to clear all jobs from database', error);
      throw error;
    }
  }

  // Get jobs that need processing (queued or processing)
  async getJobsNeedingProcessing(): Promise<BaseJob[]> {
    try {
      const dbJobs = await prisma.job.findMany({
        where: {
          status: {
            in: ['queued', 'processing']
          }
        },
        orderBy: { submittedAt: 'asc' }
      });

      return dbJobs.map(this.mapDbJobToBaseJob);
    } catch (error) {
      console.error('Failed to get jobs needing processing from database', error);
      return [];
    }
  }

  // Get completed jobs
  async getCompletedJobs(): Promise<BaseJob[]> {
    try {
      const dbJobs = await prisma.job.findMany({
        where: { status: 'completed' },
        orderBy: { submittedAt: 'desc' }
      });

      return dbJobs.map(this.mapDbJobToBaseJob);
    } catch (error) {
      console.error('Failed to get completed jobs from database', error);
      return [];
    }
  }

  // Get failed jobs
  async getFailedJobs(): Promise<BaseJob[]> {
    try {
      const dbJobs = await prisma.job.findMany({
        where: { status: 'failed' },
        orderBy: { submittedAt: 'desc' }
      });

      return dbJobs.map(this.mapDbJobToBaseJob);
    } catch (error) {
      console.error('Failed to get failed jobs from database', error);
      return [];
    }
  }

  // Helper method to map database job to BaseJob
  private mapDbJobToBaseJob(dbJob: any): BaseJob {
    // Extract metadata and ensure pollUrl is included
    const metadata = {
      ...dbJob.metadata,
      pollUrl: dbJob.pollUrl // Always include pollUrl in metadata
    };
    
    // If this is a keyword generation job, ensure industry is in metadata
    if (dbJob.type === 'keyword-generation' && !metadata.industry) {
      // Try to extract industry from the job ID or other fields
      const industryMatch = dbJob.id.match(/keywords:(\d+):/);
      if (industryMatch) {
        metadata.industry = industryMatch[1];
      }
    }
    
    return {
      id: dbJob.id,
      type: dbJob.type as JobType,
      status: dbJob.status as JobStatus,
      progress: dbJob.progress,
      error: dbJob.error,
      submittedAt: dbJob.submittedAt,
      completedAt: dbJob.completedAt,
      result: dbJob.result,
      metadata
    };
  }
}

// Export singleton instance
const databaseJobStore = new DatabaseJobStore();
export default databaseJobStore;

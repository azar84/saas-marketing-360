import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  submitKeywordGenerationJob, 
  createKeywordGenerationJob,
  JobSubmissionRequest 
} from '@/lib/jobs';
import databaseJobStore from '@/lib/jobs/databaseJobStore';
// Ensure scheduler auto-starts when jobs API is hit
import '@/lib/scheduler';


interface JobSubmission {
  id: string;
  industry: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  submittedAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  progress: number;
  position?: number;
  estimatedWaitTime?: number;
  pollUrl?: string; // Add pollUrl to save the URL for polling
}

// Using shared job store from @/lib/jobStore

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json() as JobSubmissionRequest;

    if (!type || type !== 'keyword-generation') {
      return NextResponse.json(
        { success: false, error: 'Only keyword-generation jobs are supported currently' },
        { status: 400 }
      );
    }

    if (!data.industry || typeof data.industry !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Industry parameter is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('Submitting keyword generation job for industry:', data.industry);

    // Submit job to external API
    const submitResult = await submitKeywordGenerationJob({ industry: data.industry });

    if (!submitResult.success || !submitResult.jobId) {
      return NextResponse.json(
        { success: false, error: submitResult.error || 'Failed to submit job' },
        { status: 500 }
      );
    }

    // Create job record using the new generic system
    const job = createKeywordGenerationJob(
      submitResult.jobId,
      data.industry,
      submitResult.pollUrl,
      submitResult.position,
      submitResult.estimatedWaitTime
    );

    // Store job in database
    await databaseJobStore.addJob(job);

    console.log('Job submitted successfully:', {
      jobId: job.id,
      type: job.type,
      industry: job.metadata.industry,
      status: job.status
    });

    return NextResponse.json({
      success: true,
      message: 'Job submitted successfully',
      job: {
        id: job.id,
        type: job.type,
        industry: job.metadata.industry,
        status: job.status,
        submittedAt: job.submittedAt,
        position: job.metadata.position,
        estimatedWaitTime: job.metadata.estimatedWaitTime,
        pollUrl: job.metadata.pollUrl
      }
    });

  } catch (error) {
    console.error('Job submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit job' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const industry = searchParams.get('industry');

    if (jobId) {
      // Get specific job status
      const job = await databaseJobStore.getJob(jobId);
      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        job
      });
    }

    if (industry) {
      // Get all jobs for a specific industry
      const industryJobs = await databaseJobStore.getJobsByIndustry(industry);

      return NextResponse.json({
        success: true,
        jobs: industryJobs
      });
    }

    // Get all jobs
    const allJobs = await databaseJobStore.getAllJobs();

    return NextResponse.json({
      success: true,
      jobs: allJobs
    });

  } catch (error) {
    console.error('Job retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve jobs' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { jobId, status, progress, result, error, position, estimatedWaitTime } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get the current job to preserve existing metadata
    const currentJob = await databaseJobStore.getJob(jobId);
    if (!currentJob) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Merge existing metadata with updates
    const updatedMetadata = {
      ...currentJob.metadata,
      ...(position !== undefined && { position }),
      ...(estimatedWaitTime !== undefined && { estimatedWaitTime })
    };

    const updated = await databaseJobStore.updateJob(jobId, {
      status: status || undefined,
      progress: progress !== undefined ? progress : undefined,
      metadata: updatedMetadata,
      result: result || undefined,
      error: error || undefined
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get the updated job to return in response
    const updatedJob = await databaseJobStore.getJob(jobId);

    console.log('Job status updated:', {
      jobId,
      status: status,
      progress: progress,
      hasResult: !!result,
      hasError: !!error
    });

    return NextResponse.json({
      success: true,
      message: 'Job status updated successfully',
      job: updatedJob
    });

  } catch (error) {
    console.error('Job update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const deleted = await databaseJobStore.deleteJob(jobId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    console.log('Job deleted:', jobId);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Job deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}

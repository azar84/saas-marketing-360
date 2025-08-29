import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  submitKeywordGenerationJob, 
  createKeywordGenerationJob,
  JobSubmissionRequest,
  submitBasicEnrichmentJob,
  createBasicEnrichmentJob
} from '@/lib/jobs';
import databaseJobStore from '@/lib/jobs/databaseJobStore';
// Import scheduler for internal job management (will only start once)
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

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Job type is required' },
        { status: 400 }
      );
    }

    if (type === 'keyword-generation') {
      console.log('🔑 Keyword generation job request received:', { type, data });
      
      if (!data.industry || typeof data.industry !== 'string') {
        console.error('❌ Invalid industry parameter:', data.industry);
        return NextResponse.json(
          { success: false, error: 'Industry parameter is required and must be a string' },
          { status: 400 }
        );
      }

      console.log('🔍 Checking if industry already has keywords:', data.industry);

      // Check if industry already has keywords
      try {
        const industryRecord = await prisma.industry.findFirst({
          where: { 
            OR: [
              { label: data.industry },
              { label: data.industry.toLowerCase() },
              { label: data.industry.toUpperCase() },
              { label: data.industry.charAt(0).toUpperCase() + data.industry.slice(1).toLowerCase() }
            ]
          },
          include: {
            keywords: {
              where: { isActive: true }
            }
          }
        });

        console.log('🏢 Industry record found:', industryRecord ? {
          id: industryRecord.id,
          label: industryRecord.label,
          keywordsCount: industryRecord.keywords.length
        } : null);

        if (industryRecord && industryRecord.keywords.length > 0) {
          console.log(`⏭️ Industry "${data.industry}" already has ${industryRecord.keywords.length} keywords, skipping job submission`);
          return NextResponse.json({
            success: false,
            error: 'Industry already has keywords',
            message: `Industry "${data.industry}" already has ${industryRecord.keywords.length} keywords. Keyword generation skipped.`,
            keywordsCount: industryRecord.keywords.length,
            skipped: true
          }, { status: 409 }); // 409 Conflict status code
        }

        console.log(`✅ Industry "${data.industry}" has no keywords, proceeding with job submission`);
      } catch (dbError) {
        console.error('❌ Error checking existing keywords:', dbError);
        // Continue with job submission if database check fails
        console.log('⚠️ Database check failed, proceeding with job submission anyway');
      }

      console.log('🚀 Submitting keyword generation job for industry:', data.industry);

      // Submit job to external API
      const submitResult = await submitKeywordGenerationJob({ industry: data.industry });
      console.log('📡 External API submit result:', submitResult);

      if (!submitResult.success || !submitResult.jobId) {
        console.error('❌ External API submission failed:', submitResult);
        return NextResponse.json(
          { success: false, error: submitResult.error || 'Failed to submit job' },
          { status: 500 }
        );
      }

      console.log('✅ External API submission successful, creating job record');

      // Create job record
      const job = createKeywordGenerationJob(
        submitResult.jobId,
        data.industry,
        submitResult.pollUrl,
        submitResult.position,
        submitResult.estimatedWaitTime
      );

      await databaseJobStore.addJob(job);

      console.log('💾 Job stored in database successfully:', {
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
    }

    if (type === 'basic-enrichment') {
      if (!data.websiteUrl || typeof data.websiteUrl !== 'string') {
        return NextResponse.json(
          { success: false, error: 'websiteUrl is required and must be a string' },
          { status: 400 }
        );
      }

      console.log('Submitting basic enrichment job for website:', data.websiteUrl);

      const submitResult = await submitBasicEnrichmentJob({
        websiteUrl: data.websiteUrl,
        options: data.options
      });

      if (!submitResult.success || !submitResult.jobId) {
        return NextResponse.json(
          { success: false, error: submitResult.error || 'Failed to submit job' },
          { status: 500 }
        );
      }

      const job = createBasicEnrichmentJob(
        submitResult.jobId,
        data.websiteUrl,
        submitResult.pollUrl,
        submitResult.position,
        submitResult.estimatedWaitTime,
        data.options
      );

      await databaseJobStore.addJob(job);

      console.log('Job submitted successfully:', {
        jobId: job.id,
        type: job.type,
        websiteUrl: job.metadata.websiteUrl,
        status: job.status
      });

      return NextResponse.json({
        success: true,
        message: 'Job submitted successfully',
        job: {
          id: job.id,
          type: job.type,
          websiteUrl: job.metadata.websiteUrl,
          status: job.status,
          submittedAt: job.submittedAt,
          position: job.metadata.position,
          estimatedWaitTime: job.metadata.estimatedWaitTime,
          pollUrl: job.metadata.pollUrl
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported job type' },
      { status: 400 }
    );

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
    const deleteAll = searchParams.get('deleteAll');

    // Handle delete all jobs
    if (deleteAll === 'true') {
      await databaseJobStore.clearAllJobs();
      console.log('All jobs deleted');

      return NextResponse.json({
        success: true,
        message: 'All jobs deleted successfully'
      });
    }

    // Handle single job deletion
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

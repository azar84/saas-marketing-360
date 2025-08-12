import { NextRequest, NextResponse } from 'next/server';
import { backgroundJobManager } from '@/lib/backgroundJobManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'jobs':
        const allJobs = backgroundJobManager.getAllJobs();
        return NextResponse.json({
          success: true,
          data: allJobs,
        });

      case 'active':
        const activeJobs = backgroundJobManager.getActiveJobs();
        return NextResponse.json({
          success: true,
          data: activeJobs,
        });

      case 'job':
        const jobId = searchParams.get('jobId');
        if (!jobId) {
          return NextResponse.json({
            success: false,
            error: 'jobId is required',
          }, { status: 400 });
        }

        const job = backgroundJobManager.getJob(jobId);
        if (!job) {
          return NextResponse.json({
            success: false,
            error: 'Job not found',
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: job,
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Background jobs API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create':
        const { type, jobData } = data;
        if (type !== 'industry_search_extraction') {
          return NextResponse.json({
            success: false,
            error: 'Invalid job type',
          }, { status: 400 });
        }

        const jobId = await backgroundJobManager.createJob(type, jobData);
        return NextResponse.json({
          success: true,
          data: { jobId },
        });

      case 'cancel':
        const { jobId: cancelJobId } = data;
        if (!cancelJobId) {
          return NextResponse.json({
            success: false,
            error: 'jobId is required',
          }, { status: 400 });
        }

        const cancelled = backgroundJobManager.cancelJob(cancelJobId);
        return NextResponse.json({
          success: true,
          data: { cancelled },
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Background jobs API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

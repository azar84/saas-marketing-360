/**
 * Job Processing Endpoint
 * Uses the generic job processor to poll and update job statuses
 */

import { NextRequest, NextResponse } from 'next/server';
import { KeywordGenerationProcessor } from '@/lib/jobs/keywordGeneration/processor';

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    console.log(`Processing job: ${jobId}`);

    // Create and start the keyword generation processor
    const processor = new KeywordGenerationProcessor();
    
    // Process the specific job
    await processor.processJob({ id: jobId } as any);

    return NextResponse.json({
      success: true,
      message: 'Job processed successfully'
    });

  } catch (error) {
    console.error('Job processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process job' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'process-all') {
      console.log('Processing all queued jobs...');

      // Create and start the keyword generation processor
      const processor = new KeywordGenerationProcessor();
      processor.start();

      // Stop after processing
      setTimeout(() => {
        processor.stop();
      }, 5000);

      return NextResponse.json({
        success: true,
        message: 'Started processing all jobs'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Job processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process jobs' },
      { status: 500 }
    );
  }
}

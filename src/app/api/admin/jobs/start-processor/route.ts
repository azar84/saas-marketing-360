import { NextRequest, NextResponse } from 'next/server';
import { JobProcessor } from '@/lib/jobProcessor';

export async function POST(request: NextRequest) {
  try {
    // Start the job processor
    const processor = new JobProcessor();
    
    return NextResponse.json({
      success: true,
      message: 'Job processor started successfully'
    });
  } catch (error) {
    console.error('Error starting job processor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start job processor' },
      { status: 500 }
    );
  }
}

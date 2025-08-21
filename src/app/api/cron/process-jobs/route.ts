import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // Verify cron secret
    const expectedSecret = process.env.CRON_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕐 Cron job triggered - processing all jobs...');

    // Process all jobs
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/jobs/process?action=process-all`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to process jobs:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to process jobs' },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('✅ Jobs processed successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Jobs processed successfully',
      timestamp: new Date().toISOString(),
      results: data.results
    });

  } catch (error) {
    console.error('💥 Cron job error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

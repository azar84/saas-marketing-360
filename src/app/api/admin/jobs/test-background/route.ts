import { NextRequest, NextResponse } from 'next/server';
import { backgroundJobService } from '@/lib/jobs/backgroundJobService';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test endpoint: Manually triggering background service...');
    
    // Manually trigger the background service
    backgroundJobService.start();
    
    return NextResponse.json({
      success: true,
      message: 'Background service manually started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test endpoint: Checking background service status...');
    
    // Check if service is running
    const isRunning = (backgroundJobService as any).isRunning;
    
    return NextResponse.json({
      success: true,
      isRunning,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

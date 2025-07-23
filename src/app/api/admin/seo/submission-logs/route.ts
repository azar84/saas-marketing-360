import { NextRequest, NextResponse } from 'next/server';
import { googleSearchConsole } from '@/lib/googleSearchConsole';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const submissionId = searchParams.get('id');

    if (submissionId) {
      // Get specific submission log
      const log = await googleSearchConsole.getSubmissionLog(submissionId);
      
      if (!log) {
        return NextResponse.json({
          success: false,
          message: 'Submission log not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: log
      });
    }

    // Get submission logs and stats
    const logs = await googleSearchConsole.getSubmissionLogs(limit);
    const stats = await googleSearchConsole.getSubmissionStats();

    return NextResponse.json({
      success: true,
      data: {
        logs,
        stats,
        total: logs.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to get submission logs:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import scheduler from '@/lib/scheduler';

// GET - Retrieve task logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      // Get logs for a specific task
      const logs = scheduler.getTaskLogs(taskId);
      return NextResponse.json({ logs });
    } else {
      // Get all task logs
      const allLogs = scheduler.getAllTaskLogs();
      return NextResponse.json({ logs: allLogs });
    }
  } catch (error) {
    console.error('Failed to retrieve task logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve task logs' },
      { status: 500 }
    );
  }
}

// DELETE - Clear logs for a specific task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    scheduler.clearTaskLogs(taskId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear task logs:', error);
    return NextResponse.json(
      { error: 'Failed to clear task logs' },
      { status: 500 }
    );
  }
}

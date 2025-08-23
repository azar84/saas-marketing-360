import { NextRequest, NextResponse } from 'next/server';
import scheduler from '@/lib/scheduler';

// GET - Get scheduler status and tasks
export async function GET(request: NextRequest) {
  try {
    // Get current status
    const status = scheduler.getStatus();
    
    // Only start if not already running (prevents duplicates)
    if (!scheduler.isRunning()) {
      console.log('🚀 [Scheduler API] Starting scheduler...');
      scheduler.start();
    } else {
      console.log('ℹ️ [Scheduler API] Scheduler already running');
    }
    
    const tasks = scheduler.getTasks();

    return NextResponse.json({
      status,
      tasks: tasks.map(task => ({
        id: task.id,
        name: task.name,
        cronExpression: task.cronExpression,
        enabled: task.enabled,
        isRunning: task.isRunning,
        lastRun: task.lastRun,
        nextRun: task.nextRun,
        // Include logs to avoid client-side undefined access (SchedulerManager uses task.logs.length)
        logs: task.logs
      }))
    });
  } catch (error) {
    console.error('Failed to get scheduler status:', error);
    return NextResponse.json(
      { error: 'Failed to get scheduler status' },
      { status: 500 }
    );
  }
}

// POST - Start scheduler or trigger task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, taskId } = body;

    switch (action) {
      case 'start':
        scheduler.start();
        return NextResponse.json({ success: true });

      case 'stop':
        scheduler.stop();
        return NextResponse.json({ success: true });

      case 'trigger':
        if (!taskId) {
          return NextResponse.json(
            { error: 'Task ID is required' },
            { status: 400 }
          );
        }
        
        const triggered = await scheduler.triggerTask(taskId);
        if (triggered) {
          return NextResponse.json({ success: true });
        } else {
          return NextResponse.json(
            { error: `Task ${taskId} not found or disabled` },
            { status: 404 }
          );
        }

      case 'refresh':
        scheduler.forceRefreshSchedules();
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to execute scheduler action:', error);
    return NextResponse.json(
      { error: 'Failed to execute scheduler action' },
      { status: 500 }
    );
  }
}

// PUT - Update task settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, updates } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const task = scheduler.getTask(taskId);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update enabled status
    if (updates.enabled !== undefined) {
      scheduler.setTaskEnabled(taskId, updates.enabled);
    }

    // Update cron expression
    if (updates.cronExpression) {
      scheduler.updateTaskCron(taskId, updates.cronExpression);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a task
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

    const removed = scheduler.removeTask(taskId);
    if (removed) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 
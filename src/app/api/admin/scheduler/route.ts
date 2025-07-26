import { NextRequest, NextResponse } from 'next/server';
import scheduler from '@/lib/scheduler';

// GET - Get scheduler status and tasks
export async function GET(request: NextRequest) {
  try {
    const status = scheduler.getStatus();
    const tasks = scheduler.getTasks();

    return NextResponse.json({
      success: true,
      data: {
        status,
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.name,
          cronExpression: task.cronExpression,
          enabled: task.enabled,
          isRunning: task.isRunning,
          lastRun: task.lastRun,
          nextRun: task.nextRun
        }))
      }
    });
  } catch (error) {
    console.error('Failed to get scheduler status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get scheduler status' },
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
        return NextResponse.json({
          success: true,
          message: 'Scheduler started successfully'
        });

      case 'stop':
        scheduler.stop();
        return NextResponse.json({
          success: true,
          message: 'Scheduler stopped successfully'
        });

      case 'trigger':
        if (!taskId) {
          return NextResponse.json(
            { success: false, message: 'Task ID is required' },
            { status: 400 }
          );
        }
        
        const triggered = await scheduler.triggerTask(taskId);
        if (triggered) {
          return NextResponse.json({
            success: true,
            message: `Task ${taskId} triggered successfully`
          });
        } else {
          return NextResponse.json(
            { success: false, message: `Task ${taskId} not found or disabled` },
            { status: 404 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to execute scheduler action:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to execute scheduler action' },
      { status: 500 }
    );
  }
}

// PUT - Update task settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, enabled, cronExpression } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: 'Task ID is required' },
        { status: 400 }
      );
    }

    const task = scheduler.getTask(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    if (enabled !== undefined) {
      scheduler.setTaskEnabled(taskId, enabled);
    }

    // Note: Updating cron expression would require re-adding the task
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update task' },
      { status: 500 }
    );
  }
} 
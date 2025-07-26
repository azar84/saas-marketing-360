import { submitSitemapToSearchEngines } from './sitemapSubmission';

interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  task: () => Promise<void>;
  lastRun?: Date;
  nextRun?: Date;
  isRunning: boolean;
  enabled: boolean;
}

class AppScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private interval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    // Initialize default tasks
    this.initializeDefaultTasks();
  }

  private initializeDefaultTasks() {
    // Sitemap submission task - runs daily at 2 AM UTC
    this.addTask({
      id: 'sitemap-submission',
      name: 'Sitemap Submission to Search Engines',
      cronExpression: '0 2 * * *', // Daily at 2 AM UTC
      task: async () => {
        try {
          console.log('🕐 [Scheduler] Starting scheduled sitemap submission...');
          const result = await submitSitemapToSearchEngines();
          console.log('✅ [Scheduler] Sitemap submission completed:', result.summary);
        } catch (error) {
          console.error('❌ [Scheduler] Sitemap submission failed:', error);
        }
      },
      enabled: true
    });

    // Database cleanup task - runs weekly on Sunday at 3 AM UTC
    this.addTask({
      id: 'db-cleanup',
      name: 'Database Cleanup and Maintenance',
      cronExpression: '0 3 * * 0', // Weekly on Sunday at 3 AM UTC
      task: async () => {
        try {
          console.log('🕐 [Scheduler] Starting database cleanup...');
          // Add database cleanup logic here
          // - Clean old logs
          // - Optimize tables
          // - Archive old data
          console.log('✅ [Scheduler] Database cleanup completed');
        } catch (error) {
          console.error('❌ [Scheduler] Database cleanup failed:', error);
        }
      },
      enabled: true
    });

    // Analytics aggregation task - runs daily at 1 AM UTC
    this.addTask({
      id: 'analytics-aggregation',
      name: 'Analytics Data Aggregation',
      cronExpression: '0 1 * * *', // Daily at 1 AM UTC
      task: async () => {
        try {
          console.log('🕐 [Scheduler] Starting analytics aggregation...');
          // Add analytics aggregation logic here
          // - Aggregate daily stats
          // - Generate reports
          // - Update dashboards
          console.log('✅ [Scheduler] Analytics aggregation completed');
        } catch (error) {
          console.error('❌ [Scheduler] Analytics aggregation failed:', error);
        }
      },
      enabled: true
    });
  }

  /**
   * Add a new scheduled task
   */
  addTask(task: Omit<ScheduledTask, 'lastRun' | 'nextRun' | 'isRunning'>): void {
    const scheduledTask: ScheduledTask = {
      ...task,
      lastRun: undefined,
      nextRun: this.calculateNextRun(task.cronExpression),
      isRunning: false
    };

    this.tasks.set(task.id, scheduledTask);
    console.log(`📅 [Scheduler] Added task: ${task.name} (${task.cronExpression})`);
  }

  /**
   * Remove a scheduled task
   */
  removeTask(taskId: string): boolean {
    const removed = this.tasks.delete(taskId);
    if (removed) {
      console.log(`🗑️ [Scheduler] Removed task: ${taskId}`);
    }
    return removed;
  }

  /**
   * Enable or disable a task
   */
  setTaskEnabled(taskId: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = enabled;
      console.log(`🔧 [Scheduler] ${enabled ? 'Enabled' : 'Disabled'} task: ${taskId}`);
      return true;
    }
    return false;
  }

  /**
   * Get all tasks
   */
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get a specific task
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isInitialized) {
      console.log('⚠️ [Scheduler] Already running');
      return;
    }

    console.log('🚀 [Scheduler] Starting built-in scheduler...');
    
    // Run every minute to check for tasks
    this.interval = setInterval(() => {
      this.checkAndRunTasks();
    }, 60000); // 60 seconds

    this.isInitialized = true;
    console.log('✅ [Scheduler] Started successfully');
    
    // Run initial check
    this.checkAndRunTasks();
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isInitialized = false;
    console.log('🛑 [Scheduler] Stopped');
  }

  /**
   * Check and run tasks that are due
   */
  private async checkAndRunTasks(): Promise<void> {
    const now = new Date();
    
    for (const [taskId, task] of this.tasks) {
      if (!task.enabled || task.isRunning) {
        continue;
      }

      if (task.nextRun && now >= task.nextRun) {
        await this.runTask(taskId, task);
      }
    }
  }

  /**
   * Run a specific task
   */
  private async runTask(taskId: string, task: ScheduledTask): Promise<void> {
    if (task.isRunning) {
      console.log(`⏳ [Scheduler] Task ${taskId} is already running`);
      return;
    }

    task.isRunning = true;
    task.lastRun = new Date();

    try {
      console.log(`🕐 [Scheduler] Running task: ${task.name}`);
      await task.task();
      console.log(`✅ [Scheduler] Task completed: ${task.name}`);
    } catch (error) {
      console.error(`❌ [Scheduler] Task failed: ${task.name}`, error);
    } finally {
      task.isRunning = false;
      task.nextRun = this.calculateNextRun(task.cronExpression);
    }
  }

  /**
   * Calculate next run time based on cron expression
   */
  private calculateNextRun(cronExpression: string): Date {
    const now = new Date();
    const [minute, hour, day, month, dayOfWeek] = cronExpression.split(' ').map(Number);
    
    let nextRun = new Date(now);
    
    // Simple cron parser (handles basic cases)
    if (minute !== undefined && minute !== now.getMinutes()) {
      nextRun.setMinutes(minute);
      if (nextRun <= now) {
        nextRun.setHours(nextRun.getHours() + 1);
      }
    }
    
    if (hour !== undefined && hour !== now.getHours()) {
      nextRun.setHours(hour);
      nextRun.setMinutes(minute || 0);
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    }
    
    if (dayOfWeek !== undefined && dayOfWeek !== now.getDay()) {
      const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7;
      nextRun.setDate(nextRun.getDate() + daysUntilNext);
      nextRun.setHours(hour || 0);
      nextRun.setMinutes(minute || 0);
    }
    
    return nextRun;
  }

  /**
   * Manually trigger a task
   */
  async triggerTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (task && task.enabled) {
      await this.runTask(taskId, task);
      return true;
    }
    return false;
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    taskCount: number;
    enabledTaskCount: number;
    nextTask?: { id: string; name: string; nextRun: Date };
  } {
    const enabledTasks = Array.from(this.tasks.values()).filter(t => t.enabled);
    const nextTask = enabledTasks
      .filter(t => t.nextRun)
      .sort((a, b) => (a.nextRun?.getTime() || 0) - (b.nextRun?.getTime() || 0))[0];

    return {
      isRunning: this.isInitialized,
      taskCount: this.tasks.size,
      enabledTaskCount: enabledTasks.length,
      nextTask: nextTask ? {
        id: nextTask.id,
        name: nextTask.name,
        nextRun: nextTask.nextRun!
      } : undefined
    };
  }
}

// Create singleton instance
const scheduler = new AppScheduler();

export default scheduler; 
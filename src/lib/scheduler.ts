

interface TaskLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: any;
}

interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  task: () => Promise<void>;
  lastRun?: Date;
  nextRun?: Date;
  isRunning: boolean;
  enabled: boolean;
  logs: TaskLog[];
  maxLogs: number;
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
    // Test task - runs every minute to verify execution
    this.addTask({
      id: 'test-task',
      name: 'Test Console Output Task',
      cronExpression: '* * * * *', // Every minute
      task: async () => {
        console.log('🧪 [TEST TASK] === TASK FUNCTION STARTED ===');
        console.log('🧪 [TEST TASK] this context:', this);
        console.log('🧪 [TEST TASK] this.logTask exists:', typeof this.logTask);
        
        try {
          console.log('🧪 [TEST TASK] Step 1: About to call logTask...');
          if (typeof this.logTask === 'function') {
            this.logTask('test-task', 'info', 'Test task started');
            console.log('🧪 [TEST TASK] Step 2: logTask called successfully');
          } else {
            console.log('🧪 [TEST TASK] ERROR: this.logTask is not a function!');
          }
          
          console.log('🧪 [TEST TASK] Step 3: About to simulate work...');
          // Simulate some work
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('🧪 [TEST TASK] Step 4: Work simulation completed');
          
          console.log('🧪 [TEST TASK] Step 5: About to log success...');
          if (typeof this.logTask === 'function') {
            this.logTask('test-task', 'success', 'Test task completed successfully');
            console.log('🧪 [TEST TASK] Step 6: Success logged');
          } else {
            console.log('🧪 [TEST TASK] ERROR: this.logTask is not a function!');
          }
          
          console.log('🧪 [TEST TASK] === TASK FUNCTION COMPLETED SUCCESSFULLY ===');
        } catch (error) {
          console.error('🧪 [TEST TASK] ERROR CAUGHT:', error);
          console.error('🧪 [TEST TASK] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          if (typeof this.logTask === 'function') {
            this.logTask('test-task', 'error', 'Test task failed', error);
            console.log('🧪 [TEST TASK] Error logged');
          } else {
            console.log('🧪 [TEST TASK] ERROR: this.logTask is not a function!');
          }
        }
      },
      enabled: true,
      maxLogs: 50
    });

    // Industries keywords generation task - runs every 2 minutes
    this.addTask({
      id: 'industries-keywords',
      name: 'Generate Keywords for Industries',
      cronExpression: '*/2 * * * *', // Every 2 minutes
      task: async () => {
        try {
          this.logTask('industries-keywords', 'info', 'Starting industries keywords generation...');
          const result = await this.generateKeywordsForOneIndustry();
          this.logTask('industries-keywords', 'success', 'Keywords generation completed', result);
        } catch (error) {
          this.logTask('industries-keywords', 'error', 'Keywords generation failed', error);
        }
      },
      enabled: true,
      maxLogs: 100
    });
  }

  /**
   * Add a new scheduled task
   */
  addTask(task: Omit<ScheduledTask, 'lastRun' | 'nextRun' | 'isRunning' | 'logs'>): void {
    const scheduledTask: ScheduledTask = {
      ...task,
      lastRun: undefined,
      nextRun: this.calculateNextRun(task.cronExpression),
      isRunning: false,
      logs: [],
      maxLogs: task.maxLogs || 100
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
   * Set task enabled/disabled status
   */
  setTaskEnabled(taskId: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = enabled;
      if (enabled) {
        task.nextRun = this.calculateNextRun(task.cronExpression);
      }
      console.log(`📅 [Scheduler] Task ${taskId} ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    }
    return false;
  }

  /**
   * Update task cron expression
   */
  updateTaskCron(taskId: string, cronExpression: string): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.cronExpression = cronExpression;
      task.nextRun = this.calculateNextRun(cronExpression);
      console.log(`📅 [Scheduler] Updated task ${taskId} cron to: ${cronExpression}`);
      return true;
    }
    return false;
  }

  /**
   * Get all scheduled tasks
   */
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get a specific task by ID
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isInitialized) {
      console.log('📅 [Scheduler] Already running');
      return;
    }

    this.isInitialized = true;
    this.interval = setInterval(() => {
      this.checkAndRunTasks();
    }, 1000); // Check every second

    console.log('📅 [Scheduler] Started');
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
    console.log('📅 [Scheduler] Stopped');
  }

  /**
   * Check and run due tasks
   */
  private async checkAndRunTasks(): Promise<void> {
    const now = new Date();
    
    for (const [taskId, task] of this.tasks) {
      if (task.enabled && !task.isRunning && task.nextRun && task.nextRun <= now) {
        console.log(`📅 [Scheduler] Running due task: ${task.name}`);
        await this.runTask(taskId, task);
      }
    }
  }

  /**
   * Manually run all due tasks now
   */
  async runDueTasksNow(): Promise<void> {
    console.log('📅 [Scheduler] Manually running all due tasks...');
    await this.checkAndRunTasks();
  }

  /**
   * Run a specific task
   */
  private async runTask(taskId: string, task: ScheduledTask): Promise<void> {
    if (task.isRunning) {
      console.log(`📅 [Scheduler] Task ${taskId} is already running`);
      return;
    }

    task.isRunning = true;
    task.lastRun = new Date();
    
    try {
      console.log(`📅 [Scheduler] Starting task: ${task.name}`);
      await task.task();
      
      // Update next run time
      task.nextRun = this.calculateNextRun(task.cronExpression);
      
      // Log success
      this.logTask(taskId, 'success', 'Task completed successfully');
      console.log(`📅 [Scheduler] Task ${taskId} completed successfully`);
      
    } catch (error) {
      console.error(`📅 [Scheduler] Task ${taskId} failed:`, error);
      this.logTask(taskId, 'error', 'Task failed', error);
      
      // Update next run time even on failure
      task.nextRun = this.calculateNextRun(task.cronExpression);
    } finally {
      task.isRunning = false;
    }
  }

  /**
   * Calculate next run time based on cron expression
   */
  private calculateNextRun(cronExpression: string): Date {
    try {
      // Simple cron parsing for common patterns
      const parts = cronExpression.split(' ');
      if (parts.length !== 5) {
        console.warn(`📅 [Scheduler] Invalid cron expression: ${cronExpression}, using default`);
        return this.getDefaultNextRun();
      }

      const [minute, hour, day, month, dayOfWeek] = parts;
      const now = new Date();
      let nextRun = new Date(now);

      // Reset seconds and milliseconds
      nextRun.setSeconds(0, 0);

      // Handle minute
      if (minute !== '*') {
        const minuteValue = parseInt(minute);
        if (!isNaN(minuteValue)) {
          nextRun.setMinutes(minuteValue);
          if (nextRun <= now) {
            nextRun.setHours(nextRun.getHours() + 1);
          }
        }
      } else {
        nextRun.setMinutes(now.getMinutes() + 1);
      }

      // Handle hour
      if (hour !== '*') {
        const hourValue = parseInt(hour);
        if (!isNaN(hourValue)) {
          nextRun.setHours(hourValue);
          if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
          }
        }
      }

      // Handle day of month
      if (day !== '*') {
        const dayValue = parseInt(day);
        if (!isNaN(dayValue)) {
          nextRun.setDate(dayValue);
          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
        }
      }

      // Handle month
      if (month !== '*') {
        const monthValue = parseInt(month);
        if (!isNaN(monthValue)) {
          nextRun.setMonth(monthValue - 1); // Month is 0-indexed
          if (nextRun <= now) {
            nextRun.setFullYear(nextRun.getFullYear() + 1);
          }
        }
      }

      // Handle day of week
      if (dayOfWeek !== '*') {
        const dayOfWeekValue = parseInt(dayOfWeek);
        if (!isNaN(dayOfWeekValue)) {
          const currentDayOfWeek = nextRun.getDay();
          const daysToAdd = (dayOfWeekValue - currentDayOfWeek + 7) % 7;
          if (daysToAdd > 0) {
            nextRun.setDate(nextRun.getDate() + daysToAdd);
          }
        }
      }

      return nextRun;
    } catch (error) {
      console.error(`📅 [Scheduler] Error calculating next run for ${cronExpression}:`, error);
      return this.getDefaultNextRun();
    }
  }

  /**
   * Get default next run time (1 minute from now)
   */
  private getDefaultNextRun(): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    now.setSeconds(0, 0);
    return now;
  }

  /**
   * Manually trigger a task to run now
   */
  async triggerTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (task && task.enabled) {
      console.log(`📅 [Scheduler] Manually triggering task: ${task.name}`);
      await this.runTask(taskId, task);
      return true;
    }
    return false;
  }

  /**
   * Log task execution
   */
  private logTask(taskId: string, level: TaskLog['level'], message: string, details?: any): void {
    const task = this.tasks.get(taskId);
    if (task) {
      const log: TaskLog = {
        timestamp: new Date(),
        level,
        message,
        details
      };

      task.logs.push(log);

      // Keep only the last maxLogs entries
      if (task.logs.length > task.maxLogs) {
        task.logs = task.logs.slice(-task.maxLogs);
      }

      // Also log to console for debugging
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        success: '✅'
      }[level];

      console.log(`${emoji} [${taskId}] ${message}`);
      if (details) {
        console.log(`   Details:`, details);
      }
    }
  }

  /**
   * Get logs for a specific task
   */
  getTaskLogs(taskId: string): TaskLog[] {
    const task = this.tasks.get(taskId);
    return task ? task.logs : [];
  }

  /**
   * Clear logs for a specific task
   */
  clearTaskLogs(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.logs = [];
      console.log(`📅 [Scheduler] Cleared logs for task: ${taskId}`);
      return true;
    }
    return false;
  }

  /**
   * Get all task logs
   */
  getAllTaskLogs(): TaskLog[] {
    const allLogs: TaskLog[] = [];
    for (const task of this.tasks.values()) {
      allLogs.push(...task.logs);
    }
    return allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Generate keywords for one industry
   */
  private async generateKeywordsForOneIndustry(): Promise<any> {
    try {
      console.log('🔑 [Keywords] Starting keyword generation for one industry...');
      
      // Import Prisma client dynamically to avoid circular dependencies
      console.log(`📦 [Scheduler] Importing PrismaClient...`);
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      console.log(`✅ [Scheduler] PrismaClient imported successfully`);

      // Get industries that need keywords
      const industries = await prisma.industry.findMany({
        where: {
          keywords: {
            none: {} // Industries with no keywords
          }
        },
        take: 1
      });

      if (industries.length === 0) {
        console.log('🔑 [Keywords] No industries need keywords');
        return { message: 'No industries need keywords' };
      }

      const industry = industries[0];
      console.log(`🔑 [Keywords] Processing industry: ${industry.label}`);

      // Generate keywords using LLM
      const keywords = await this.generateKeywordsForIndustry(industry.label);
      
      if (keywords && keywords.length > 0) {
        // Save keywords to database
        const keywordData = keywords.map(keyword => ({
          searchTerm: keyword,
          industryId: industry.id
        }));

        await prisma.keyword.createMany({
          data: keywordData
        });

        console.log(`🔑 [Keywords] Generated and saved ${keywords.length} keywords for ${industry.label}`);
        return {
          industry: industry.label,
          keywordsGenerated: keywords.length,
          keywords: keywords
        };
      } else {
        console.log(`🔑 [Keywords] No keywords generated for ${industry.label}`);
        return {
          industry: industry.label,
          keywordsGenerated: 0,
          message: 'No keywords generated'
        };
      }

    } catch (keywordError: any) {
      console.error('🔑 [Keywords] Error generating keywords:', keywordError);
      throw keywordError;
    }
  }

  /**
   * Generate keywords for a specific industry using LLM
   */
  private async generateKeywordsForIndustry(industryName: string): Promise<string[]> {
    try {
      // This would integrate with your LLM system
      // For now, return some basic keywords
      const basicKeywords = [
        `${industryName} services`,
        `${industryName} companies`,
        `${industryName} providers`,
        `${industryName} solutions`,
        `${industryName} experts`
      ];

      return basicKeywords;
    } catch (error) {
      console.error('🔑 [Keywords] Error in LLM keyword generation:', error);
      return [];
    }
  }

  /**
   * Refresh all task schedules
   */
  refreshTaskSchedules(): void {
    console.log('📅 [Scheduler] Refreshing all task schedules...');
    for (const [taskId, task] of this.tasks) {
      if (task.enabled) {
        task.nextRun = this.calculateNextRun(task.cronExpression);
        console.log(`📅 [Scheduler] Updated ${taskId}: next run at ${task.nextRun}`);
      }
    }
  }

  /**
   * Force refresh all schedules (even disabled tasks)
   */
  forceRefreshSchedules(): void {
    console.log('📅 [Scheduler] Force refreshing all task schedules...');
    for (const [taskId, task] of this.tasks) {
      task.nextRun = this.calculateNextRun(task.cronExpression);
      console.log(`📅 [Scheduler] Updated ${taskId}: next run at ${task.nextRun}`);
    }
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
    const enabledTasks = Array.from(this.tasks.values()).filter(task => task.enabled);
    const nextTask = enabledTasks
      .filter(task => task.nextRun)
      .sort((a, b) => a.nextRun!.getTime() - b.nextRun!.getTime())[0];

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

// Create a true singleton instance across Next.js module reloads
const globalForScheduler = globalThis as unknown as { _appScheduler?: AppScheduler };
const scheduler = globalForScheduler._appScheduler ?? (globalForScheduler._appScheduler = new AppScheduler());

export default scheduler;
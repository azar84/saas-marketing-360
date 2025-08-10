

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
      task: async function() {
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
          console.error('🧪 [TEST TASK] Error stack:', error.stack);
          if (typeof this.logTask === 'function') {
            this.logTask('test-task', 'error', 'Test task failed', error);
            console.log('🧪 [TEST TASK] Error logged');
          } else {
            console.log('🧪 [TEST TASK] ERROR: this.logTask is not a function!');
          }
        }
      }.bind(this), // Bind the scheduler context
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
      return true;
    }
    return false;
  }

  /**
   * Get all tasks
   */
  getTasks(): ScheduledTask[] {
    // Refresh schedules before returning tasks
    this.refreshTaskSchedules();
    
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
    
    // Run every 10 seconds to check for tasks (more frequent for precise timing)
    this.interval = setInterval(() => {
      this.checkAndRunTasks();
    }, 10000); // 10 seconds

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
    
    // Refresh schedules periodically
    this.refreshTaskSchedules();
    
    console.log(`🔍 [Scheduler] Checking tasks at ${now.toISOString()}`);
    
    for (const [taskId, task] of this.tasks) {
      if (!task.enabled || task.isRunning) {
        console.log(`⏭️ [Scheduler] Skipping task ${taskId}: enabled=${task.enabled}, isRunning=${task.isRunning}`);
        continue;
      }

      console.log(`📅 [Scheduler] Task ${taskId}: nextRun=${task.nextRun?.toISOString()}, now=${now.toISOString()}, shouldRun=${task.nextRun && now >= task.nextRun}`);
      
      if (task.nextRun && now >= task.nextRun) {
        console.log(`🚀 [Scheduler] Executing task ${taskId}`);
        await this.runTask(taskId, task);
      }
    }
  }

  /**
   * Public: run due tasks immediately (used by API polling to ensure progress in dev)
   */
  async runDueTasksNow(): Promise<void> {
    await this.checkAndRunTasks();
  }

  /**
   * Run a specific task
   */
  private async runTask(taskId: string, task: ScheduledTask): Promise<void> {
    console.log(`🎯 [Scheduler] runTask called for ${taskId}`);
    
    if (task.isRunning) {
      console.log(`⚠️ [Scheduler] Task ${taskId} is already running, skipping`);
      this.logTask(taskId, 'warn', `Task ${taskId} is already running`);
      return;
    }

    console.log(`✅ [Scheduler] Starting execution of task ${taskId}`);
    task.isRunning = true;
    task.lastRun = new Date();
    console.log(`📝 [Scheduler] Set lastRun for ${taskId}: ${task.lastRun.toISOString()}`);
    
    try {
      this.logTask(taskId, 'info', `Task started`);
      console.log(`📝 [Scheduler] Logged 'Task started' for ${taskId}`);
      
      this.logTask(taskId, 'info', `Running task: ${task.name}`);
      console.log(`📝 [Scheduler] Logged 'Running task' for ${taskId}`);
      
      console.log(`🔄 [Scheduler] About to execute task function for ${taskId}`);
      console.log(`🔄 [Scheduler] Task function type: ${typeof task.task}`);
      console.log(`🔄 [Scheduler] Task function:`, task.task);
      
      await task.task();
      
      console.log(`✅ [Scheduler] Task ${taskId} completed successfully`);
      this.logTask(taskId, 'success', `Task completed successfully`);
      console.log(`📝 [Scheduler] Logged 'Task completed' for ${taskId}`);
    } catch (error) {
      console.log(`❌ [Scheduler] Task ${taskId} failed:`, error);
      console.log(`❌ [Scheduler] Error stack:`, error.stack);
      this.logTask(taskId, 'error', `Task failed`, error);
      console.log(`📝 [Scheduler] Logged 'Task failed' for ${taskId}`);
    } finally {
      console.log(`🔄 [Scheduler] Finalizing task ${taskId}`);
      task.isRunning = false;
      task.nextRun = this.calculateNextRun(task.cronExpression);
      console.log(`📅 [Scheduler] Next run for ${taskId}: ${task.nextRun.toISOString()}`);
    }
  }

  /**
   * Calculate next run time based on cron expression
   */
  private calculateNextRun(cronExpression: string): Date {
    try {
      const now = new Date();
      const parts = cronExpression.split(' ');
      
      console.log(`🔍 [Scheduler] calculateNextRun: cron="${cronExpression}", parts=`, parts);
      
      if (parts.length !== 5) {
        console.warn(`Invalid cron expression: ${cronExpression}, using default`);
        return this.getDefaultNextRun();
      }
      
      const [minute, hour, day, month, dayOfWeek] = parts;
      console.log(`🔍 [Scheduler] Parsed parts: minute="${minute}", hour="${hour}", day="${day}", month="${month}", dayOfWeek="${dayOfWeek}"`);
      
      let nextRun = new Date(now);
      
      // Reset seconds and milliseconds
      nextRun.setSeconds(0, 0);
      
      // Handle every minute: * * * * *
      if (minute === '*' && hour === '*' && day === '*' && month === '*' && dayOfWeek === '*') {
        // Set to the next minute mark (e.g., if current is 19:01:21, set to 19:02:00)
        nextRun.setMinutes(nextRun.getMinutes() + 1, 0, 0);
        console.log(`🔍 [Scheduler] Every minute pattern: current=${now.toISOString()}, nextRun=${nextRun.toISOString()}`);
        return nextRun;
      }
      
      // Handle every X minutes: */X * * * *
      if (minute && minute.startsWith('*/') && hour === '*' && day === '*' && month === '*' && dayOfWeek === '*') {
        console.log(`🔍 [Scheduler] Matched */X * * * * pattern for minute="${minute}"`);
        const interval = parseInt(minute.substring(2));
        console.log(`🔍 [Scheduler] Parsed interval: ${interval}`);
        if (!isNaN(interval)) {
          // Calculate next run time that's always in the future
          const currentMinute = now.getMinutes();
          let nextMinute = Math.ceil((currentMinute + 1) / interval) * interval;
          
          // If the calculated time is in the past, add another interval
          if (nextMinute <= currentMinute) {
            nextMinute += interval;
          }
          
          console.log(`🔍 [Scheduler] Current minute: ${currentMinute}, calculated next minute: ${nextMinute}`);
          
          if (nextMinute >= 60) {
            nextRun.setHours(nextRun.getHours() + 1);
            nextRun.setMinutes(nextMinute - 60);
            console.log(`🔍 [Scheduler] Next minute >= 60, adjusted: hour=${nextRun.getHours()}, minute=${nextRun.getMinutes()}`);
          } else {
            nextRun.setMinutes(nextMinute);
            console.log(`🔍 [Scheduler] Set next run to minute: ${nextRun.getMinutes()}`);
          }
          
          // Ensure the result is always in the future
          if (nextRun <= now) {
            nextRun.setMinutes(nextRun.getMinutes() + interval);
            console.log(`🔍 [Scheduler] Adjusted to future: ${nextRun.toISOString()}`);
          }
          
          console.log(`🔍 [Scheduler] Returning nextRun: ${nextRun.toISOString()}`);
          return nextRun;
        } else {
          console.log(`❌ [Scheduler] Failed to parse interval from "${minute}"`);
        }
      }
      
      // Handle every X hours: 0 */X * * *
      if (minute === '0' && hour && hour.startsWith('*/') && day === '*' && month === '*' && dayOfWeek === '*') {
        const interval = parseInt(hour.substring(2));
        if (!isNaN(interval)) {
          const currentHour = now.getHours();
          const nextHour = Math.ceil((currentHour + 1) / interval) * interval;
          if (nextHour >= 24) {
            nextRun.setDate(nextRun.getDate() + 1);
            nextRun.setHours(nextHour - 24);
          } else {
            nextRun.setHours(nextHour);
          }
          nextRun.setMinutes(0);
          return nextRun;
        }
      }
      
      // Handle specific minute and hour (daily)
      if (minute !== undefined && hour !== undefined && day === '*' && month === '*' && dayOfWeek === '*') {
        nextRun.setHours(parseInt(hour), parseInt(minute), 0, 0);
        
        // If the time has passed today, move to tomorrow
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        return nextRun;
      }
      
      // Handle day of week (weekly)
      if (dayOfWeek !== undefined && day === '*') {
        const targetDay = parseInt(dayOfWeek);
        const currentDay = now.getDay();
        let daysToAdd = (targetDay - currentDay + 7) % 7;
        
        // If it's today and the time has passed, move to next week
        if (daysToAdd === 0) {
          const tempTime = new Date(now);
          tempTime.setHours(parseInt(hour || '0'), parseInt(minute || '0'), 0, 0);
          if (tempTime <= now) {
            daysToAdd = 7;
          }
        }
        
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        nextRun.setHours(parseInt(hour || '0'), parseInt(minute || '0'), 0, 0);
        return nextRun;
      }
      
      // Handle day of month (monthly)
      if (day !== undefined && dayOfWeek === '*') {
        const targetDay = parseInt(day);
        nextRun.setDate(targetDay);
        nextRun.setHours(parseInt(hour || '0'), parseInt(minute || '0'), 0, 0);
        
        // If the date has passed this month, move to next month
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
          nextRun.setDate(targetDay);
        }
        return nextRun;
      }
      
      // Fallback: try to parse as specific values (only if no pattern matched)
      if (minute !== undefined && !minute.startsWith('*/')) {
        nextRun.setMinutes(parseInt(minute));
        if (nextRun <= now) {
          nextRun.setHours(nextRun.getHours() + 1);
        }
      }
      
      if (hour !== undefined && !hour.startsWith('*/')) {
        nextRun.setHours(parseInt(hour));
        nextRun.setMinutes(minute !== undefined && !minute.startsWith('*/') ? parseInt(minute) : 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
      }
      
      // Validate the result
      if (isNaN(nextRun.getTime()) || nextRun.getTime() <= 0) {
        console.warn(`Invalid calculated date for cron: ${cronExpression}, using default`);
        return this.getDefaultNextRun();
      }
      
      return nextRun;
    } catch (error) {
      console.error(`Error calculating next run for cron: ${cronExpression}`, error);
      return this.getDefaultNextRun();
    }
  }

  /**
   * Get default next run time (1 hour from now)
   */
  private getDefaultNextRun(): Date {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0);
    return now;
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
   * Log a message for a specific task
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
      
      // Keep only the most recent logs
      if (task.logs.length > task.maxLogs) {
        task.logs = task.logs.slice(-task.maxLogs);
      }
      
      // Also log to console for immediate visibility
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        success: '✅'
      }[level];
      
      console.log(`${emoji} [Scheduler:${task.name}] ${message}`, details || '');
    }
  }

  /**
   * Get logs for a specific task
   */
  getTaskLogs(taskId: string): TaskLog[] {
    const task = this.tasks.get(taskId);
    return task ? [...task.logs] : [];
  }

  /**
   * Clear logs for a specific task
   */
  clearTaskLogs(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.logs = [];
      return true;
    }
    return false;
  }

  /**
   * Get all task logs from all tasks
   */
  getAllTaskLogs(): TaskLog[] {
    const allLogs: TaskLog[] = [];
    for (const task of this.tasks.values()) {
      allLogs.push(...task.logs);
    }
    // Sort by timestamp, newest first
    return allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Generate keywords for one industry that has zero keywords
   */
  private async generateKeywordsForOneIndustry(): Promise<any> {
    console.log(`🚀 [Scheduler] generateKeywordsForOneIndustry started`);
    try {
      // Import Prisma client dynamically to avoid circular dependencies
      console.log(`📦 [Scheduler] Importing PrismaClient...`);
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      console.log(`✅ [Scheduler] PrismaClient imported successfully`);

      // Find industries with zero keywords
      const industriesWithNoKeywords = await prisma.industry.findMany({
        where: {
          isActive: true,
          keywords: {
            none: {}
          }
        },
        orderBy: { id: 'asc' },
        take: 1
      });

      if (industriesWithNoKeywords.length === 0) {
        await prisma.$disconnect();
        return { message: 'No industries found without keywords', processed: 0 };
      }

      const industry = industriesWithNoKeywords[0];
      this.logTask('industries-keywords', 'info', `Processing industry: ${industry.label} (ID: ${industry.id})`);

      // Import and use the KeywordsChain
      console.log(`🔗 [Scheduler] Importing KeywordsChain...`);
      const { KeywordsChain } = await import('./llm/chains/keywords');
      console.log(`✅ [Scheduler] KeywordsChain imported successfully`);

      // Generate keywords using LLM
      console.log(`🤖 [Scheduler] Calling KeywordsChain.run with industry: ${industry.label}`);
      const result = await KeywordsChain.run({ industry: industry.label });
      console.log(`✅ [Scheduler] KeywordsChain.run completed, result:`, result);
      
      if (!result.search_terms || result.search_terms.length === 0) {
        await prisma.$disconnect();
        return { 
          message: 'No keywords generated by LLM', 
          industry: industry.label,
          processed: 0 
        };
      }

      // Save keywords to database
      const savedKeywords = [];
      for (const searchTerm of result.search_terms) {
        try {
          const keywordRecord = await prisma.keyword.create({
            data: {
              searchTerm,
              industryId: industry.id,
              isActive: true
            }
          });
          savedKeywords.push(keywordRecord);
        } catch (keywordError: any) {
          if (keywordError.code === 'P2002') {
            // Duplicate key error - skip
            this.logTask('industries-keywords', 'warn', `Skipping duplicate keyword: "${searchTerm}"`);
          } else {
            this.logTask('industries-keywords', 'error', `Failed to save keyword "${searchTerm}"`, keywordError.message);
          }
        }
      }

      await prisma.$disconnect();

      const summary = {
        industry: industry.label,
        industryId: industry.id,
        keywordsGenerated: result.search_terms.length,
        keywordsSaved: savedKeywords.length,
        message: `Successfully processed industry "${industry.label}"`
      };

      this.logTask('industries-keywords', 'success', `Keywords generation completed for ${industry.label}`, summary);
      return summary;

    } catch (error) {
      this.logTask('industries-keywords', 'error', 'Keywords generation failed', error);
      throw error;
    }
  }

  /**
   * Refresh next run times for all tasks
   */
  refreshTaskSchedules(): void {
    // Only initialize missing/invalid nextRun values. Do NOT advance due tasks here.
    for (const [taskId, task] of this.tasks) {
      if (!task.enabled) continue;
      if (!task.nextRun || isNaN(task.nextRun.getTime())) {
        task.nextRun = this.calculateNextRun(task.cronExpression);
      }
    }
  }

  /**
   * Force refresh all task schedules (public method)
   */
  forceRefreshSchedules(): void {
    for (const [taskId, task] of this.tasks) {
      if (task.enabled) {
        task.nextRun = this.calculateNextRun(task.cronExpression);
      }
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
    // Refresh schedules before getting status
    this.refreshTaskSchedules();
    
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

// Create a true singleton instance across Next.js module reloads
const globalForScheduler = globalThis as unknown as { _appScheduler?: AppScheduler };
const scheduler = globalForScheduler._appScheduler ?? (globalForScheduler._appScheduler = new AppScheduler());

export default scheduler;
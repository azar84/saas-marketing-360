

import { submitJobAndWaitForCompletion } from './jobPoller';

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
    // Industries keywords generation task - runs every 2 minutes
    this.addTask({
      id: 'industries-keywords',
      name: 'Generate Keywords for Industries',
      cronExpression: '0 * * * *', // Hourly (re-enable when ready)
      task: async () => {
        try {
          this.logTask('industries-keywords', 'info', 'Starting industries keywords generation...');
          const result = await this.generateKeywordsForOneIndustry();
          this.logTask('industries-keywords', 'success', 'Keywords generation completed', result);
        } catch (error) {
          this.logTask('industries-keywords', 'error', 'Keywords generation failed', error);
        }
      },
      enabled: false, // Disabled by default to prevent duplicate jobs
      maxLogs: 100
    });

    // Job polling task - runs every 5 seconds
    this.addTask({
      id: 'poll-incomplete-jobs',
      name: 'Poll Incomplete Jobs',
      cronExpression: '*/5 * * * * *', // Every 5 seconds
      task: async () => {
        try {
          const count = await this.pollIncompleteJobs();
          this.logTask('poll-incomplete-jobs', 'info', `Start polling - ${count} incomplete jobs`);
        } catch (error) {
          this.logTask('poll-incomplete-jobs', 'error', 'Job polling failed', error);
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
  }

  /**
   * Remove a scheduled task
   */
  removeTask(taskId: string): boolean {
    const removed = this.tasks.delete(taskId);
    if (removed) {
      // Task removed
    }
    return removed;
  }

  /**
   * Set task enabled/disabled status
   */
  setTaskEnabled(taskId: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      const wasEnabled = task.enabled;
      task.enabled = enabled;
      if (enabled) {
        task.nextRun = this.calculateNextRun(task.cronExpression);
        console.log(`✅ [Scheduler] Task "${taskId}" enabled, next run: ${task.nextRun.toISOString()}`);
      } else {
        console.log(`❌ [Scheduler] Task "${taskId}" disabled`);
      }

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
      const oldExpression = task.cronExpression;
      task.cronExpression = cronExpression;
      task.nextRun = this.calculateNextRun(cronExpression);
      
      console.log(`📅 [Scheduler] Task "${taskId}" cron updated: ${oldExpression} → ${cronExpression}, next run: ${task.nextRun.toISOString()}`);

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
      console.log('⚠️ [Scheduler] Scheduler already running, ignoring start request');
      return;
    }

    console.log('🚀 [Scheduler] Starting scheduler...');
    this.isInitialized = true;
    this.interval = setInterval(() => {
      this.checkAndRunTasks();
    }, 1000); // Check every second
    
    console.log('✅ [Scheduler] Scheduler started successfully');
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

  }

  /**
   * Check and run due tasks
   */
  private async checkAndRunTasks(): Promise<void> {
    const now = new Date();
    
    for (const [taskId, task] of this.tasks) {
      if (task.enabled && !task.isRunning && task.nextRun && task.nextRun <= now) {
        console.log(`⏰ [Scheduler] Task "${taskId}" is due to run at ${task.nextRun.toISOString()}, current time: ${now.toISOString()}`);
        await this.runTask(taskId, task);
      }
    }
  }

  /**
   * Manually run all due tasks now
   */
  async runDueTasksNow(): Promise<void> {

    await this.checkAndRunTasks();
  }

  /**
   * Run a specific task
   */
  private async runTask(taskId: string, task: ScheduledTask): Promise<void> {
    if (task.isRunning) {
      return;
    }

    task.isRunning = true;
    task.lastRun = new Date();
    
    try {

      await task.task();
      
      // Update next run time
      task.nextRun = this.calculateNextRun(task.cronExpression);
      
      // Log success (suppress for poll-incomplete-jobs to reduce noise)
      if (taskId !== 'poll-incomplete-jobs') {
        this.logTask(taskId, 'success', 'Task completed successfully');
      }

      
    } catch (error) {

      this.logTask(taskId, 'error', 'Task failed', error);
      
      // Update next run time even on failure
      task.nextRun = this.calculateNextRun(task.cronExpression);
    } finally {
      task.isRunning = false;
    }
  }

  /**
   * Calculate next run time based on cron expression (supports 5 or 6 fields).
   * 6 fields: seconds minutes hours day month dayOfWeek (e.g., every 5 seconds)
   * 5 fields: minutes hours day month dayOfWeek (e.g., every 2 minutes)
   */
  private calculateNextRun(cronExpression: string): Date {
    try {
      const parts = cronExpression.trim().split(/\s+/);
      if (parts.length !== 5 && parts.length !== 6) {
        console.warn(`📅 [Scheduler] Invalid cron expression: ${cronExpression} (expected 5 or 6 fields, got ${parts.length})`);
        return this.getDefaultNextRun();
      }

      const hasSeconds = parts.length === 6;
      const [secOrMin, minuteRaw, hourRaw, dayRaw, monthRaw, dowRaw] = hasSeconds
        ? parts
        : ['0', parts[0], parts[1], parts[2], parts[3], parts[4]];

      const now = new Date();
      const nextRun = new Date(now);

      // For 5-field cron expressions, always set seconds to 0
      if (!hasSeconds) {
        nextRun.setSeconds(0, 0);
      }

      // Helper to handle */N pattern
      const parseStep = (token: string): number | null => {
        const m = token.match(/^\*\/(\d+)$/);
        return m ? parseInt(m[1], 10) : null;
      };

      // Seconds (only for 6-field cron)
      if (hasSeconds) {
        const secStep = parseStep(secOrMin);
        if (secStep && secStep > 0) {
          const nextSec = (Math.floor(now.getSeconds() / secStep) + 1) * secStep;
          const deltaSec = nextSec - now.getSeconds();
          nextRun.setSeconds(now.getSeconds() + deltaSec, 0);
        } else if (secOrMin !== '*') {
          const secVal = parseInt(secOrMin, 10);
          if (!isNaN(secVal)) {
            nextRun.setSeconds(secVal, 0);
            if (nextRun <= now) nextRun.setMinutes(nextRun.getMinutes() + 1);
          } else {
            nextRun.setSeconds(0, 0);
          }
        } else {
          // default: next second
          nextRun.setSeconds(now.getSeconds() + 1, 0);
        }
      }

      // Minutes
      const minuteStep = parseStep(minuteRaw);
      if (minuteStep && minuteStep > 0) {
        // For 5-field cron, calculate next minute interval
        if (!hasSeconds) {
          const currentMinute = now.getMinutes();
          const nextMin = Math.ceil((currentMinute + 1) / minuteStep) * minuteStep;
          if (nextMin >= 60) {
            nextRun.setHours(now.getHours() + 1);
            nextRun.setMinutes(nextMin % 60);
          } else {
            nextRun.setMinutes(nextMin);
          }
        } else {
          // For 6-field cron, use existing logic
          const nextMin = (Math.floor(nextRun.getMinutes() / minuteStep) + (nextRun <= now ? 1 : 0)) * minuteStep;
          if (nextMin >= 60) {
            nextRun.setHours(nextRun.getHours() + 1);
            nextRun.setMinutes(nextMin % 60);
          } else {
            nextRun.setMinutes(nextMin);
          }
        }
      } else if (minuteRaw !== '*') {
        const minuteVal = parseInt(minuteRaw, 10);
        if (!isNaN(minuteVal)) {
          nextRun.setMinutes(minuteVal);
          if (nextRun <= now) nextRun.setHours(nextRun.getHours() + 1);
        }
      } else {
        // When using 5-field cron (no seconds), default to next minute
        if (!hasSeconds) {
          nextRun.setMinutes(now.getMinutes() + 1);
          nextRun.setSeconds(0, 0);
        }
      }

      // Hours
      if (hourRaw !== '*') {
        const hourVal = parseInt(hourRaw, 10);
        if (!isNaN(hourVal)) {
          nextRun.setHours(hourVal);
          if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);
        }
      }

      // Day of month
      if (dayRaw !== '*') {
        const dayVal = parseInt(dayRaw, 10);
        if (!isNaN(dayVal)) {
          nextRun.setDate(dayVal);
          if (nextRun <= now) nextRun.setMonth(nextRun.getMonth() + 1);
        }
      }

      // Month
      if (monthRaw !== '*') {
        const monthVal = parseInt(monthRaw, 10);
        if (!isNaN(monthVal)) {
          nextRun.setMonth(monthVal - 1);
          if (nextRun <= now) nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
      }

      // Day of week (0-6, Sun-Sat)
      if (dowRaw !== '*') {
        const dowVal = parseInt(dowRaw, 10);
        if (!isNaN(dowVal)) {
          const currentDow = nextRun.getDay();
          let daysToAdd = (dowVal - currentDow + 7) % 7;
          if (daysToAdd === 0 && nextRun <= now) daysToAdd = 7;
          if (daysToAdd > 0) nextRun.setDate(nextRun.getDate() + daysToAdd);
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

      // Suppress chatty logs for industries-keywords (only show errors)
      if (taskId === 'industries-keywords' && level !== 'error') {
        return;
      }

      // Also print to server console so it's visible immediately
      const ts = log.timestamp.toISOString();
      const prefix = `⏱️ [Scheduler] [${taskId}]`;
      if (details !== undefined) {
        try {
          console.log(`${prefix} ${level.toUpperCase()} ${ts} - ${message}`, details);
        } catch {
          console.log(`${prefix} ${level.toUpperCase()} ${ts} - ${message}`);
        }
      } else {
        console.log(`${prefix} ${level.toUpperCase()} ${ts} - ${message}`);
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
      // Import Prisma client dynamically to avoid circular dependencies
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Pick one industry with no keywords yet
      const industries = await prisma.industry.findMany({
        where: {
          keywords: {
            none: {}
          }
        },
        take: 1
      });

      if (industries.length === 0) {
        this.logTask('industries-keywords', 'info', 'All industries already have keywords - skipping generation');
        return { message: 'All industries already have keywords' };
      }

      const industry = industries[0];
      this.logTask('industries-keywords', 'info', `Found industry without keywords: "${industry.label}" - submitting job`);

      // Submit a job through our internal jobs API so it persists with pollUrl
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${baseUrl}/api/admin/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'keyword-generation',
          data: { industry: industry.label }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Jobs API error: ${res.status} ${res.statusText} ${txt}`);
      }

      const payload: any = await res.json().catch(() => ({}));
      if (!payload.success || !payload.job) {
        throw new Error('Jobs API returned invalid response');
      }

      // Return summary; polling task will pick it up
      return {
        message: 'Job submitted',
        industry: industry.label,
        jobId: payload.job.id
      };

    } catch (keywordError: any) {
      this.logTask('industries-keywords', 'error', 'Failed to submit keywords job', String(keywordError));
      throw keywordError;
    }
  }

  /**
   * Generate keywords for a specific industry using LLM
   */
  private async generateKeywordsForIndustry(industryName: string): Promise<string[]> {
    // First: try external API with Redis/Bull queue
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const baseUrl = process.env.MARKETING_MCP_API_URL || 'https://marketing-mcp-beta.vercel.app';
      const externalUrl = new URL('/api/keywords', baseUrl).toString();
      const bypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
      if (!bypassToken) throw new Error('VERCEL_AUTOMATION_BYPASS_SECRET is not set');
      
      this.logTask('industries-keywords', 'info', 'Calling external keywords API with queue', { externalUrl, productOrMarket: industryName });

      // Submit job to queue
      const res = await fetch(externalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-vercel-protection-bypass': bypassToken },
        body: JSON.stringify({ productOrMarket: industryName }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`External API error: ${res.status} ${res.statusText} ${text}`);
      }

      const queueResponse: any = await res.json().catch(() => ({}));
      
      if (!queueResponse.success || !queueResponse.jobId) {
        throw new Error('Invalid queue response from external API');
      }

      this.logTask('industries-keywords', 'info', 'Job queued successfully', { 
        jobId: queueResponse.jobId, 
        position: queueResponse.position,
        estimatedWaitTime: queueResponse.estimatedWaitTime 
      });

      // Poll for job completion using the utility
      const pollResult = await submitJobAndWaitForCompletion(
        baseUrl,
        `/api/jobs/${queueResponse.jobId}`,
        {},
        bypassToken,
        {
          maxPollingTime: 5 * 60 * 1000, // 5 minutes
          pollInterval: 2000, // 2 seconds
          onProgress: (status, progress, position, estimatedWaitTime) => {
            this.logTask('industries-keywords', 'info', 'Job progress update', { 
              jobId: queueResponse.jobId,
              status, 
              progress, 
              position, 
              estimatedWaitTime 
            });
          },
          onError: (error) => {
            this.logTask('industries-keywords', 'warn', 'Job polling error', { 
              jobId: queueResponse.jobId,
              error 
            });
          }
        }
      );

      if (pollResult.success && pollResult.result) {
        const keywords = this.extractKeywordsFromResult(pollResult.result);
        
        if (keywords && keywords.length > 0) {
          this.logTask('industries-keywords', 'success', 'External keywords API returned terms', { 
            industryName, 
            count: keywords.length 
          });
          return keywords as string[];
        }
      } else {
        this.logTask('industries-keywords', 'warn', 'Job polling failed', { 
          jobId: queueResponse.jobId,
          error: pollResult.error 
        });
      }

      this.logTask('industries-keywords', 'warn', 'External API returned no terms; will try fallback', { industryName });
    } catch (externalError) {
      this.logTask('industries-keywords', 'warn', 'External keywords API failed; will try fallback', { industryName, error: String(externalError) });
    }

    // Fallback: try LLM chain if available
    try {
      const { KeywordsChain } = await import('@/lib/llm/chains');
      const maxAttempts = 2;
      let lastError: any = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const out = await KeywordsChain.run({ industry: industryName });
          const terms = Array.isArray((out as any).search_terms) ? (out as any).search_terms : [];
          if (terms.length > 0) return terms as string[];
        } catch (err) {
          lastError = err;
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
      this.logTask('industries-keywords', 'warn', 'LLM keyword generation returned empty', { industryName, error: String(lastError) });
      return [];
    } catch (error) {
      this.logTask('industries-keywords', 'error', 'Failed to import or run KeywordsChain', { industryName, error: String(error) });
      return [];
    }
  }



  /**
   * Extract keywords from job result
   */
  private extractKeywordsFromResult(result: any): string[] {
    if (!result) return [];
    
    // Navigate through the result structure to find keywords
    const extractTerms = (obj: any): string[] => {
      if (!obj) return [];
      if (Array.isArray(obj)) return obj;
      if (Array.isArray(obj.search_terms)) return obj.search_terms;
      if (Array.isArray(obj.keywords)) return obj.keywords;
      if (obj.data) return extractTerms(obj.data);
      if (obj.result) extractTerms(obj.result);
      if (obj.payload) return extractTerms(obj.payload);
      return [];
    };

    let terms = extractTerms(result)
      .filter((t: any) => typeof t === 'string')
      .map((t: string) => t.trim())
      .filter(Boolean);

    // Dedupe and enforce basic length (2–8 words)
    terms = Array.from(new Set(terms)).filter((t: string) => {
      const w = t.split(/\s+/).filter(Boolean).length;
      return w >= 2 && w <= 8;
    });

    return terms;
  }

  /**
   * Poll all incomplete jobs and update their status
   */
  private async pollIncompleteJobs(): Promise<number> {
    try {
      // Import Prisma client dynamically to avoid circular dependencies
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Get all jobs from the database
      const allJobs = await prisma.job.findMany({
        where: {
          status: {
            notIn: ['completed', 'failed']
          }
        }
      });

      const count = allJobs.length;
      if (count === 0) {
        return 0;
      }
      
      // Poll each incomplete job
      for (const job of allJobs) {
        await this.pollJob(job);
      }
      return count;
    } catch (error) {
      console.error('❌ Error polling incomplete jobs:', error);
      return 0;
    }
  }

  /**
   * Poll a specific job and update its status
   */
  private async pollJob(job: any): Promise<void> {
    try {
      if (!job.metadata?.pollUrl) {
        console.log(`⚠️ Job ${job.id} has no pollUrl`);
        return;
      }

      console.log(`🔄 Polling job ${job.id} (${job.metadata?.industry})`);

      // Build absolute poll URL if relative
      const rawPollUrl = String(job.metadata.pollUrl);
      const baseUrl = process.env.MARKETING_MCP_API_URL || 'https://marketing-mcp-beta.vercel.app';
      const fullPollUrl = rawPollUrl.startsWith('http') ? rawPollUrl : `${baseUrl}${rawPollUrl}`;

      // Make the external API call
      const response = await fetch(fullPollUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const externalData = await response.json();
        
        if (externalData.success && (externalData.status === 'completed' || externalData.result)) {
          console.log(`✅ Job ${job.id} completed!`);
          
          // Update job status in database
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient();
          await prisma.job.update({
            where: { id: job.id },
            data: {
              status: 'completed',
              progress: 100,
              result: externalData.result,
              completedAt: new Date()
            }
          });
          
          // Sync keywords to industry if this is a keyword generation job
          if (job.type === 'keyword-generation' && externalData.result) {
            await this.syncKeywordsToIndustry(job.metadata?.industry, externalData.result);
          }
          
          // Process enrichment result and save to business directory if this is a basic enrichment job
          if (job.type === 'basic-enrichment' && externalData.result) {
            await this.processEnrichmentResult(externalData.result, job.id);
          }
        } else if (externalData.status && externalData.status !== job.status) {
          console.log(`🔄 Job ${job.id} status changed from ${job.status} to ${externalData.status}`);
          
          // Update status and progress
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient();
          await prisma.job.update({
            where: { id: job.id },
            data: {
              status: externalData.status,
              progress: externalData.progress || job.progress
            }
          });
        } else {
          console.log(`📊 Job ${job.id} still ${job.status}, no change`);
        }
      } else {
        console.error(`❌ Failed to poll job ${job.id}: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error polling job ${job.id}:`, error);
    }
  }

  /**
   * Sync keywords to industry
   */
  private async syncKeywordsToIndustry(industryName: string, result: any): Promise<void> {
    try {
      const keywords = this.extractKeywordsFromResult(result);
      if (keywords.length === 0) {
        console.log('⚠️ No keywords found in result to sync');
        return;
      }

      console.log(`🔄 Syncing ${keywords.length} keywords to industry: ${industryName}`);
      
      // Make the sync API call
      const response = await fetch(`http://localhost:3000/api/admin/industries/keywords/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryName,
          keywords
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Keywords synced successfully:', data.message);
      } else {
        console.error('❌ Failed to sync keywords:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error syncing keywords:', error);
    }
  }

  /**
   * Refresh all task schedules
   */
  refreshTaskSchedules(): void {
    for (const [taskId, task] of this.tasks) {
      if (task.enabled) {
        task.nextRun = this.calculateNextRun(task.cronExpression);
      }
    }
  }

  /**
   * Force refresh all schedules (even disabled tasks)
   */
  forceRefreshSchedules(): void {
    for (const [taskId, task] of this.tasks) {
      task.nextRun = this.calculateNextRun(task.cronExpression);
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

  /**
   * Check if scheduler is already running
   */
  isRunning(): boolean {
    return this.isInitialized;
  }
}

// Create a true singleton instance across Next.js module reloads
const globalForScheduler = globalThis as unknown as { _appScheduler?: AppScheduler };
const scheduler = globalForScheduler._appScheduler ?? (globalForScheduler._appScheduler = new AppScheduler());

// Auto-start the scheduler when this module is imported
if (typeof window === 'undefined') {
  console.log('🚀 SERVER: Scheduler module loaded (manual start required)');
  // Scheduler will only start when manually triggered from admin panel
  // This prevents duplicate instances while keeping internal control
}

export default scheduler;
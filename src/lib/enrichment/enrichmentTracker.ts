import { 
  EnrichmentTrace, 
  StepTrace, 
  LLMProcessingTrace, 
  WebsiteScrapingTrace,
  PageScrapingResult,
  EnrichedCompanyData,
  WebsiteScrapeData,
  GoogleSearchData,
  LLMProcessedData
} from './types';
import * as fs from 'fs';
import * as path from 'path';

export interface EnrichmentStepData {
  stepName: string;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

export interface PageDiscoveryData {
  baseUrl: string;
  discoveredPages: string[];
  categorizedPages: Record<string, string[]>;
  prioritizedPages: string[];
  discoveryTime: number;
  totalPagesFound: number;
}

export interface ScrapingPageData {
  url: string;
  status: 'success' | 'failed';
  duration: number;
  extractedData: {
    title: string;
    description: string;
    content: string;
    contactInfo: any;
    technologies: string[];
    socialLinks: Record<string, string>;
    keywords: string[];
  };
  rawHtml?: string;
  error?: string;
  httpInfo?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
  };
}

export interface LLMInteractionData {
  inputData: {
    scrapedData: WebsiteScrapeData;
    googleData?: GoogleSearchData;
    linkedinData?: any;
    crunchbaseData?: any;
    prompt: string;
    promptLength: number;
    modelUsed: string;
    promptVersion: string;
  };
  outputData: {
    rawResponse: string;
    responseLength: number;
    parsedData?: LLMProcessedData;
    parsingSuccess: boolean;
    parsingErrors?: string[];
    responseTime: number;
  };
  metadata: {
    tokenUsage?: any;
    modelConfidence?: number;
    retryCount: number;
  };
}

export interface ExternalAPISearchData {
  source: 'linkedin' | 'crunchbase' | 'google' | 'other';
  query: string;
  results: any[];
  searchTime: number;
  success: boolean;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime?: Date;
  };
}

export interface EnrichmentProgress {
  currentStep: string;
  progress: number; // 0-100
  estimatedTimeRemaining: number;
  currentOperation: string;
  stepDetails: Record<string, any>;
}

export class EnrichmentTracker {
  private traces: Map<string, EnrichmentTrace> = new Map();
  private activeTraces: Set<string> = new Set();
  private stepData: Map<string, EnrichmentStepData[]> = new Map();
  private realTimeCallbacks: Map<string, (data: any) => void> = new Map();
  private logsDir: string;
  private jobDirs: Map<string, string> = new Map();
  
  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs', 'enrichment');
    this.ensureLogsDirectory();
    console.log('📊 EnrichmentTracker initialized - writing to files in logs/enrichment/');
  }

  /**
   * Ensure the logs directory exists
   */
  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Get the job directory path for a specific domain
   */
  private getJobDir(domain: string): string {
    const safeDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jobDir = path.join(this.logsDir, `${safeDomain}_${timestamp}`);
    
    if (!fs.existsSync(jobDir)) {
      fs.mkdirSync(jobDir, { recursive: true });
    }
    
    return jobDir;
  }

  /**
   * Write data to a file in the job directory
   */
  private writeToFile(jobDir: string, filename: string, data: any): void {
    try {
      const filePath = path.join(jobDir, filename);
      const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`📝 Wrote ${filename} to ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to write ${filename}:`, error);
    }
  }

  /**
   * Start tracking a new enrichment process
   */
  startEnrichmentTrace(domain: string, normalizedDomain: string): string {
    const traceId = `enrichment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const jobDir = this.getJobDir(normalizedDomain);
    
    const trace: EnrichmentTrace = {
      id: traceId,
      domain,
      normalizedDomain,
      startedAt: new Date(),
      status: 'in_progress',
      steps: {
        domainValidation: this.createStepTrace('domainValidation'),
        websiteScraping: this.createStepTrace('websiteScraping'),
        googleEnrichment: this.createStepTrace('googleEnrichment'),
        llmProcessing: this.createStepTrace('llmProcessing'),
        dataConsolidation: this.createStepTrace('dataConsolidation'),
        databaseUpsert: this.createStepTrace('databaseUpsert'),
        marketingTools: this.createStepTrace('marketingTools')
      },
      qualityMetrics: {
        confidenceScore: 0,
        dataCompleteness: 0,
        validationErrors: [],
        accuracyIssues: []
      },
      performance: {
        totalDuration: 0,
        stepDurations: {}
      }
    };
    
    this.traces.set(traceId, trace);
    this.activeTraces.add(traceId);
    this.stepData.set(traceId, []);
    this.jobDirs.set(traceId, jobDir);
    
    // Write job info to file
    const jobInfo = {
      traceId,
      domain,
      normalizedDomain,
      startedAt: trace.startedAt,
      jobDir
    };
    this.writeToFile(jobDir, '00_job_info.json', jobInfo);
    
    console.log(`🚀 Started enrichment tracking for ${domain} (ID: ${traceId})`);
    console.log(`📁 Job logs stored in: ${jobDir}`);
    
    return traceId;
  }

  /**
   * Track domain validation step
   */
  trackDomainValidation(traceId: string, data: {
    domain: string;
    isValid: boolean;
    httpStatus: number;
    responseTime: number;
    error?: string;
  }): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const stepData = {
      stepName: 'Domain Validation',
      timestamp: new Date(),
      data: {
        domain: data.domain,
        validationResult: data.isValid,
        httpStatus: data.httpStatus,
        responseTime: data.responseTime,
        error: data.error
      },
      metadata: {
        stepType: 'validation',
        success: data.isValid
      }
    };

    this.trackStep(traceId, 'domainValidation', stepData);
    this.updateStepStatus(traceId, 'domainValidation', 'completed');
    
    // Write to file
    this.writeToFile(jobDir, '01_domain_validation.json', stepData);
    
    console.log(`🔍 Domain validation tracked: ${data.domain} - ${data.isValid ? 'Valid' : 'Invalid'}`);
  }

  /**
   * Track page discovery process
   */
  trackPageDiscovery(traceId: string, data: PageDiscoveryData): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const stepData = {
      stepName: 'Page Discovery',
      timestamp: new Date(),
      data: {
        baseUrl: data.baseUrl,
        discoveredPages: data.discoveredPages,
        categorizedPages: data.categorizedPages,
        prioritizedPages: data.prioritizedPages,
        discoveryTime: data.discoveryTime,
        totalPagesFound: data.totalPagesFound
      },
      metadata: {
        stepType: 'discovery',
        pagesFound: data.totalPagesFound,
        categories: Object.keys(data.categorizedPages)
      }
    };

    this.trackStep(traceId, 'websiteScraping', stepData);
    
    // Write to file
    this.writeToFile(jobDir, '02_page_discovery.json', stepData);
    
    console.log(`🌐 Page discovery tracked: ${data.totalPagesFound} pages found across ${Object.keys(data.categorizedPages).length} categories`);
  }

  /**
   * Track individual page scraping
   */
  trackPageScraping(traceId: string, data: ScrapingPageData): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const stepData = {
      stepName: 'Page Scraping',
      timestamp: new Date(),
      data: {
        url: data.url,
        status: data.status,
        duration: data.duration,
        extractedData: data.extractedData,
        error: data.error,
        httpInfo: data.httpInfo
      },
      metadata: {
        stepType: 'scraping',
        success: data.status === 'success',
        dataExtracted: Object.keys(data.extractedData).length
      }
    };

    this.trackStep(traceId, 'websiteScraping', stepData);
    
    // Write to file with URL-safe filename
    const safeUrl = data.url.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/https?:\/\//, '');
    const filename = `03_page_scraping_${safeUrl}.json`;
    this.writeToFile(jobDir, filename, stepData);
    
    console.log(`📄 Page scraping tracked: ${data.url} - ${data.status} (${data.duration}ms)`);
  }

  /**
   * Track website scraping completion
   */
  trackWebsiteScrapingComplete(traceId: string, data: {
    totalPages: number;
    successfulPages: number;
    failedPages: number;
    totalData: WebsiteScrapeData;
    scrapingDuration: number;
  }): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const stepData = {
      stepName: 'Website Scraping Complete',
      timestamp: new Date(),
      data: {
        totalPages: data.totalPages,
        successfulPages: data.successfulPages,
        failedPages: data.failedPages,
        totalData: data.totalData,
        scrapingDuration: data.scrapingDuration
      },
      metadata: {
        stepType: 'completion',
        successRate: `${data.successfulPages}/${data.totalPages}`,
        duration: data.scrapingDuration
      }
    };

    this.trackStep(traceId, 'websiteScraping', stepData);
    this.updateStepStatus(traceId, 'websiteScraping', 'completed');
    
    // Write to file
    this.writeToFile(jobDir, '04_website_scraping_complete.json', stepData);
    
    console.log(`✅ Website scraping completed: ${data.successfulPages}/${data.totalPages} pages successful`);
  }

  /**
   * Track external API searches (LinkedIn, Crunchbase, etc.)
   */
  trackExternalAPISearch(traceId: string, data: ExternalAPISearchData): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const stepData = {
      stepName: `External API Search - ${data.source}`,
      timestamp: new Date(),
      data: {
        source: data.source,
        query: data.query,
        results: data.results,
        searchTime: data.searchTime,
        success: data.success,
        error: data.error,
        rateLimitInfo: data.rateLimitInfo
      },
      metadata: {
        stepType: 'external_api',
        source: data.source,
        resultsCount: data.results.length,
        success: data.success
      }
    };

    this.trackStep(traceId, 'googleEnrichment', stepData);
    
    // Write to file
    const filename = `05_external_api_${data.source}.json`;
    this.writeToFile(jobDir, filename, stepData);
    
    console.log(`🔍 External API search tracked: ${data.source} - "${data.query}" - ${data.results.length} results`);
  }

  /**
   * Track Google search enrichment
   */
  trackGoogleEnrichment(traceId: string, data: {
    queries: string[];
    results: any[];
    searchTime: number;
    success: boolean;
    error?: string;
  }): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const stepData = {
      stepName: 'Google Search Enrichment',
      timestamp: new Date(),
      data: {
        queries: data.queries,
        results: data.results,
        searchTime: data.searchTime,
        success: data.success,
        error: data.error
      },
      metadata: {
        stepType: 'google_search',
        queriesCount: data.queries.length,
        resultsCount: data.results.length,
        success: data.success
      }
    };

    this.trackStep(traceId, 'googleEnrichment', stepData);
    this.updateStepStatus(traceId, 'googleEnrichment', 'completed');
    
    // Write to file
    this.writeToFile(jobDir, '06_google_enrichment.json', stepData);
    
    console.log(`🔍 Google enrichment tracked: ${data.queries.length} queries, ${data.results.length} results`);
  }

  /**
   * Track LLM processing with detailed input/output data
   */
  trackLLMProcessing(traceId: string, data: LLMInteractionData): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const stepData = {
      stepName: 'LLM Processing',
      timestamp: new Date(),
      data: {
        inputData: data.inputData,
        outputData: data.outputData,
        metadata: data.metadata
      },
      metadata: {
        stepType: 'llm_processing',
        modelUsed: data.inputData.modelUsed,
        promptLength: data.inputData.promptLength,
        responseLength: data.outputData.responseLength,
        parsingSuccess: data.outputData.parsingSuccess,
        responseTime: data.outputData.responseTime
      }
    };

    this.trackStep(traceId, 'llmProcessing', stepData);
    
    // Write to file
    this.writeToFile(jobDir, '07_llm_processing.json', stepData);
    
    console.log(`🤖 LLM processing tracked: ${data.inputData.modelUsed} - ${data.outputData.responseTime}ms - Parsing: ${data.outputData.parsingSuccess ? 'Success' : 'Failed'}`);
  }

  /**
   * Track data consolidation
   */
  trackDataConsolidation(traceId: string, data: {
    scrapedData: WebsiteScrapeData;
    googleData?: GoogleSearchData;
    linkedinData?: any;
    crunchbaseData?: any;
    llmData: LLMProcessedData;
    consolidatedData: EnrichedCompanyData;
    conflicts: string[];
    mergeStrategy: string;
  }): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const stepData = {
      stepName: 'Data Consolidation',
      timestamp: new Date(),
      data: {
        scrapedData: data.scrapedData,
        googleData: data.googleData,
        linkedinData: data.linkedinData,
        crunchbaseData: data.crunchbaseData,
        llmData: data.llmData,
        consolidatedData: data.consolidatedData,
        conflicts: data.conflicts,
        mergeStrategy: data.mergeStrategy
      },
      metadata: {
        stepType: 'consolidation',
        dataSources: ['scraping', 'google', 'linkedin', 'crunchbase', 'llm'].filter(source => 
          data[source as keyof typeof data]
        ),
        conflictsCount: data.conflicts.length,
        mergeStrategy: data.mergeStrategy
      }
    };

    this.trackStep(traceId, 'dataConsolidation', stepData);
    this.updateStepStatus(traceId, 'dataConsolidation', 'completed');
    
    // Write to file
    this.writeToFile(jobDir, '08_data_consolidation.json', stepData);
    
    console.log(`📊 Data consolidation tracked: ${data.conflicts.length} conflicts resolved using ${data.mergeStrategy}`);
  }

  /**
   * Track database upsert
   */
  trackDatabaseUpsert(traceId: string, data: {
    operation: 'create' | 'update';
    table: string;
    recordId: number;
    success: boolean;
    error?: string;
    duration: number;
    dataSaved: any;
  }): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const stepData = {
      stepName: 'Database Upsert',
      timestamp: new Date(),
      data: {
        operation: data.operation,
        table: data.table,
        recordId: data.recordId,
        success: data.success,
        error: data.error,
        duration: data.duration,
        dataSaved: data.dataSaved
      },
      metadata: {
        stepType: 'database',
        operation: data.operation,
        success: data.success,
        duration: data.duration
      }
    };

    this.trackStep(traceId, 'databaseUpsert', stepData);
    this.updateStepStatus(traceId, 'databaseUpsert', 'completed');
    
    // Write to file
    this.writeToFile(jobDir, '09_database_upsert.json', stepData);
    
    console.log(`💾 Database upsert tracked: ${data.operation} ${data.table} - ${data.success ? 'Success' : 'Failed'} (${data.duration}ms)`);
  }

  /**
   * Track marketing tools generation
   */
  trackMarketingTools(traceId: string, data: {
    templates: string[];
    segments: string[];
    customizations: any[];
    generationTime: number;
    success: boolean;
    error?: string;
  }): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const stepData = {
      stepName: 'Marketing Tools Generation',
      timestamp: new Date(),
      data: {
        templates: data.templates,
        segments: data.segments,
        customizations: data.customizations,
        generationTime: data.generationTime,
        success: data.success,
        error: data.error
      },
      metadata: {
        stepType: 'marketing',
        templatesCount: data.templates.length,
        segmentsCount: data.segments.length,
        success: data.success
      }
    };

    this.trackStep(traceId, 'marketingTools', stepData);
    this.updateStepStatus(traceId, 'marketingTools', 'completed');
    
    // Write to file
    this.writeToFile(jobDir, '10_marketing_tools.json', stepData);
    
    console.log(`🎯 Marketing tools tracked: ${data.templates.length} templates, ${data.segments.length} segments`);
  }

  /**
   * Complete enrichment trace
   */
  completeEnrichmentTrace(traceId: string, finalData: EnrichedCompanyData): EnrichmentTrace | null {
    const trace = this.traces.get(traceId);
    if (!trace) return null;
    
    trace.status = 'completed';
    trace.completedAt = new Date();
    trace.finalData = finalData;
    trace.performance.totalDuration = trace.completedAt.getTime() - trace.startedAt.getTime();
    
    this.activeTraces.delete(traceId);
    
    // Write final summary
    const jobDir = this.jobDirs.get(traceId) || this.getJobDir(trace.normalizedDomain);
    const finalSummary = {
      traceId,
      domain: trace.domain,
      normalizedDomain: trace.normalizedDomain,
      status: trace.status,
      startedAt: trace.startedAt,
      completedAt: trace.completedAt,
      totalDuration: trace.performance.totalDuration,
      finalData,
      stepSummary: trace.steps
    };
    
    this.writeToFile(jobDir, '11_final_summary.json', finalSummary);
    
    console.log(`✅ Enrichment trace completed: ${traceId} in ${trace.performance.totalDuration}ms`);
    
    return trace;
  }

  /**
   * Get real-time enrichment progress
   */
  getEnrichmentProgress(traceId: string): EnrichmentProgress | null {
    const trace = this.traces.get(traceId);
    if (!trace) return null;
    
    const completedSteps = Object.values(trace.steps).filter(step => step.status === 'completed').length;
    const totalSteps = Object.keys(trace.steps).length;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    
    const currentStep = Object.entries(trace.steps).find(([_, step]) => step.status === 'in_progress')?.[0] || 'completed';
    
    return {
      currentStep,
      progress,
      estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(trace),
      currentOperation: this.getCurrentOperation(trace),
      stepDetails: this.getStepDetails(trace)
    };
  }

  /**
   * Get all step data for a trace
   */
  getStepData(traceId: string): EnrichmentStepData[] {
    return this.stepData.get(traceId) || [];
  }

  /**
   * Get trace by ID
   */
  getTrace(traceId: string): EnrichmentTrace | null {
    return this.traces.get(traceId) || null;
  }

  /**
   * Get all active traces
   */
  getActiveTraces(): EnrichmentTrace[] {
    return Array.from(this.activeTraces).map(id => this.traces.get(id)!);
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToUpdates(traceId: string, callback: (data: any) => void): void {
    this.realTimeCallbacks.set(traceId, callback);
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribeFromUpdates(traceId: string): void {
    this.realTimeCallbacks.delete(traceId);
  }

  // Private helper methods
  private createStepTrace(stepName: string): StepTrace {
    return {
      stepName,
      startedAt: new Date(),
      status: 'pending'
    };
  }

  private trackStep(traceId: string, stepName: keyof EnrichmentTrace['steps'], stepData: EnrichmentStepData): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    // Add to step data
    const traceStepData = this.stepData.get(traceId) || [];
    traceStepData.push(stepData);
    this.stepData.set(traceId, traceStepData);
    
    // Update step status
    const step = trace.steps[stepName];
    if (step && step.status === 'pending') {
      step.status = 'in_progress';
      step.startedAt = new Date();
    }
  }

  private updateStepStatus(traceId: string, stepName: keyof EnrichmentTrace['steps'], status: 'completed' | 'failed'): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const step = trace.steps[stepName];
    if (step) {
      step.status = status;
      step.completedAt = new Date();
      step.duration = step.completedAt.getTime() - step.startedAt.getTime();
      
      // Update performance metrics
      trace.performance.stepDurations[stepName] = step.duration;
    }
  }

  private emitRealTimeUpdate(traceId: string, data: any): void {
    const callback = this.realTimeCallbacks.get(traceId);
    if (callback) {
      callback(data);
    }
  }

  private calculateEstimatedTimeRemaining(trace: EnrichmentTrace): number {
    const completedSteps = Object.values(trace.steps).filter(step => step.status === 'completed');
    if (completedSteps.length === 0) return 0;
    
    const avgStepTime = completedSteps.reduce((sum, step) => sum + (step.duration || 0), 0) / completedSteps.length;
    const remainingSteps = Object.values(trace.steps).filter(step => step.status !== 'completed').length;
    
    return Math.round(avgStepTime * remainingSteps);
  }

  private getCurrentOperation(trace: EnrichmentTrace): string {
    const currentStep = Object.entries(trace.steps).find(([_, step]) => step.status === 'in_progress');
    if (!currentStep) return 'Completed';
    
    return `Processing ${currentStep[0]}`;
  }

  private getStepDetails(trace: EnrichmentTrace): Record<string, any> {
    const details: Record<string, any> = {};
    
    Object.entries(trace.steps).forEach(([stepName, step]) => {
      details[stepName] = {
        status: step.status,
        duration: step.duration,
        startedAt: step.startedAt,
        completedAt: step.completedAt
      };
    });
    
    return details;
  }
}

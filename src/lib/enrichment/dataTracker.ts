import { 
  EnrichmentTrace, 
  StepTrace, 
  LLMProcessingTrace, 
  WebsiteScrapingTrace,
  DataValidationResult,
  ValidationIssue,
  QualityReport,
  EnrichedCompanyData,
  WebsiteScrapeData,
  GoogleSearchData,
  LLMProcessedData
} from './types';

export class EnrichmentDataTracker {
  private traces: Map<string, EnrichmentTrace> = new Map();
  private storage: 'memory' | 'database' = 'memory';
  
  constructor(storage: 'memory' | 'database' = 'memory') {
    this.storage = storage;
  }

  /**
   * Start tracking a new enrichment process
   */
  startTrace(domain: string, normalizedDomain: string): string {
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
    console.log(`📊 Started data tracking for ${domain} (ID: ${traceId})`);
    
    return traceId;
  }

  /**
   * Create a new step trace
   */
  private createStepTrace(stepName: string): StepTrace {
    return {
      stepName,
      startedAt: new Date(),
      status: 'pending'
    };
  }

  /**
   * Start tracking a specific step
   */
  startStep(traceId: string, stepName: keyof EnrichmentTrace['steps']): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const step = trace.steps[stepName];
    if (step) {
      step.status = 'in_progress';
      step.startedAt = new Date();
      console.log(`📊 Started tracking step: ${stepName}`);
    }
  }

  /**
   * Complete a step with data
   */
  completeStep(
    traceId: string, 
    stepName: keyof EnrichmentTrace['steps'], 
    data: {
      outputData?: any;
      rawData?: any;
      errors?: string[];
      warnings?: string[];
      metadata?: Record<string, any>;
    }
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const step = trace.steps[stepName];
    if (step) {
      step.status = 'completed';
      step.completedAt = new Date();
      step.duration = step.completedAt.getTime() - step.startedAt.getTime();
      step.outputData = data.outputData;
      step.rawData = data.rawData;
      step.errors = data.errors;
      step.warnings = data.warnings;
      step.metadata = data.metadata;
      
      // Update performance metrics
      trace.performance.stepDurations[stepName] = step.duration;
      
      console.log(`📊 Completed step: ${stepName} (${step.duration}ms)`);
    }
  }

  /**
   * Track website scraping with detailed data
   */
  trackWebsiteScraping(
    traceId: string,
    data: {
      baseUrl: string;
      discoveredPages: string[];
      categorizedPages: any;
      prioritizedPages: string[];
      pageResults: any[];
      consolidatedData: WebsiteScrapeData;
    }
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const step = trace.steps.websiteScraping as WebsiteScrapingTrace;
    if (step) {
      step.discovery = {
        baseUrl: data.baseUrl,
        discoveredPages: data.discoveredPages,
        categorizedPages: data.categorizedPages,
        prioritizedPages: data.prioritizedPages,
        totalPagesFound: data.discoveredPages.length,
        pagesScraped: data.pageResults.filter(r => r.status === 'success').length,
        pagesFailed: data.pageResults.filter(r => r.status === 'failed').length
      };
      
      step.pageResults = data.pageResults;
      step.consolidatedData = data.consolidatedData;
      
      // Assess quality
      step.qualityAssessment = {
        contactInfoFound: {
          emails: data.consolidatedData.contactInfo?.emails?.length || 0,
          phones: data.consolidatedData.contactInfo?.phones?.length || 0,
          addresses: data.consolidatedData.contactInfo?.addresses?.length || 0
        },
        technologiesDetected: data.consolidatedData.technologies?.length || 0,
        socialLinksFound: Object.keys(data.consolidatedData.socialLinks || {}).length,
        contentQuality: this.assessContentQuality(data.consolidatedData)
      };
      
      console.log(`📊 Website scraping tracked: ${step.discovery.pagesScraped}/${step.discovery.totalPagesFound} pages successful`);
    }
  }

  /**
   * Track LLM processing with detailed input/output data
   */
  trackLLMProcessing(
    traceId: string,
    data: {
      inputData: {
        scrapedData: WebsiteScrapeData;
        googleData?: GoogleSearchData;
        prompt: string;
        modelUsed: string;
      };
      outputData: {
        rawResponse: string;
        parsedData?: LLMProcessedData;
        parsingSuccess: boolean;
        parsingErrors?: string[];
      };
      promptEngineering: {
        promptTemplate: string;
        variables: Record<string, any>;
        promptVersion: string;
      };
      modelPerformance: {
        responseTime: number;
        tokenUsage?: any;
        modelConfidence?: number;
      };
    }
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const step = trace.steps.llmProcessing as LLMProcessingTrace;
    if (step) {
      step.inputData = {
        ...data.inputData,
        promptLength: data.inputData.prompt.length
      };
      
      step.outputData = {
        ...data.outputData,
        responseLength: data.outputData.rawResponse.length
      };
      
      step.promptEngineering = data.promptEngineering;
      step.modelPerformance = data.modelPerformance;
      
      console.log(`📊 LLM processing tracked: ${data.outputData.parsingSuccess ? 'Success' : 'Failed'}, ${data.modelPerformance.responseTime}ms`);
    }
  }

  /**
   * Track data validation results
   */
  trackValidation(
    traceId: string,
    validationResult: DataValidationResult
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    trace.qualityMetrics.validationErrors = validationResult.issues
      .filter(issue => issue.severity === 'error')
      .map(issue => `${issue.field}: ${issue.issue}`);
    
    trace.qualityMetrics.accuracyIssues = validationResult.issues
      .filter(issue => issue.severity === 'warning')
      .map(issue => `${issue.field}: ${issue.issue}`);
    
    trace.qualityMetrics.dataCompleteness = validationResult.score;
    
    console.log(`📊 Validation tracked: Score ${validationResult.score}/100, ${validationResult.issues.length} issues found`);
  }

  /**
   * Complete the entire trace
   */
  completeTrace(
    traceId: string, 
    finalData: EnrichedCompanyData,
    qualityReport: QualityReport
  ): EnrichmentTrace | null {
    const trace = this.traces.get(traceId);
    if (!trace) return null;
    
    trace.status = 'completed';
    trace.completedAt = new Date();
    trace.finalData = finalData;
    trace.performance.totalDuration = trace.completedAt.getTime() - trace.startedAt.getTime();
    
    // Calculate overall confidence score
    trace.qualityMetrics.confidenceScore = this.calculateOverallConfidence(trace, qualityReport);
    
    console.log(`📊 Completed trace: ${traceId} in ${trace.performance.totalDuration}ms`);
    console.log(`📊 Final quality: ${trace.qualityMetrics.confidenceScore}/100`);
    
    return trace;
  }

  /**
   * Get a trace by ID
   */
  getTrace(traceId: string): EnrichmentTrace | null {
    return this.traces.get(traceId) || null;
  }

  /**
   * Get all traces
   */
  getAllTraces(): EnrichmentTrace[] {
    return Array.from(this.traces.values());
  }

  /**
   * Get traces for a specific domain
   */
  getTracesForDomain(domain: string): EnrichmentTrace[] {
    return Array.from(this.traces.values()).filter(trace => trace.domain === domain);
  }

  /**
   * Export trace data for analysis
   */
  exportTrace(traceId: string): any {
    const trace = this.getTrace(traceId);
    if (!trace) return null;
    
    return {
      ...trace,
      // Add computed metrics
      computedMetrics: {
        averageStepDuration: this.calculateAverageStepDuration(trace),
        successRate: this.calculateSuccessRate(trace),
        dataQualityScore: this.calculateDataQualityScore(trace)
      }
    };
  }

  /**
   * Assess content quality based on extracted data
   */
  private assessContentQuality(data: WebsiteScrapeData): 'low' | 'medium' | 'high' {
    let score = 0;
    
    if (data.title && data.title.length > 10) score += 20;
    if (data.description && data.description.length > 50) score += 20;
    if ((data.contactInfo?.emails?.length ?? 0) > 0) score += 20;
    if ((data.contactInfo?.phones?.length ?? 0) > 0) score += 20;
    if ((data.technologies?.length ?? 0) > 0) score += 20;
    
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(trace: EnrichmentTrace, qualityReport: QualityReport): number {
    const stepSuccessRate = this.calculateSuccessRate(trace);
    const dataQuality = qualityReport.overallScore;
    const completeness = trace.qualityMetrics.dataCompleteness;
    
    return Math.round((stepSuccessRate + dataQuality + completeness) / 3);
  }

  /**
   * Calculate success rate of steps
   */
  private calculateSuccessRate(trace: EnrichmentTrace): number {
    const steps = Object.values(trace.steps);
    const completedSteps = steps.filter(step => step.status === 'completed');
    const successfulSteps = completedSteps.filter(step => !step.errors || step.errors.length === 0);
    
    return completedSteps.length > 0 ? (successfulSteps.length / completedSteps.length) * 100 : 0;
  }

  /**
   * Calculate average step duration
   */
  private calculateAverageStepDuration(trace: EnrichmentTrace): number {
    const durations = Object.values(trace.performance.stepDurations);
    if (durations.length === 0) return 0;
    
    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQualityScore(trace: EnrichmentTrace): number {
    if (!trace.finalData) return 0;
    
    let score = 0;
    const data = trace.finalData;
    
    // Company info
    if (data.companyName) score += 10;
    if (data.description) score += 10;
    if (data.website) score += 10;
    
    // Contact info
    if (data.contact?.email) score += 10;
    if (data.contact?.phone) score += 10;
    if (data.contact?.address) score += 10;
    
    // Business details
    if (data.business?.industry) score += 10;
    if ((data.technology?.platforms?.length ?? 0) > 0) score += 10;
    if ((data.market?.targetCustomers?.length ?? 0) > 0) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Clear old traces (memory management)
   */
  clearOldTraces(maxAge: number = 24 * 60 * 60 * 1000): void { // Default: 24 hours
    const now = Date.now();
    const tracesToDelete: string[] = [];
    
    this.traces.forEach((trace, id) => {
      if (trace.completedAt && (now - trace.completedAt.getTime()) > maxAge) {
        tracesToDelete.push(id);
      }
    });
    
    tracesToDelete.forEach(id => {
      this.traces.delete(id);
    });
    
    if (tracesToDelete.length > 0) {
      console.log(`📊 Cleared ${tracesToDelete.length} old traces`);
    }
  }
}

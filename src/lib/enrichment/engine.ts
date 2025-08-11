import { 
  EnrichmentRequest, 
  EnrichmentResult, 
  EnrichmentJob, 
  EnrichmentConfig,
  EnrichedCompanyData,
  WebsiteScrapeData,
  GoogleSearchData
} from './types';
import { WebsiteScraper } from './sources/websiteScraper';
import { GoogleSearchEnricher } from './sources/googleSearchEnricher';
import { EnrichmentProcessor } from '../llm/chains/enrichmentProcessor';

export class EnrichmentEngine {
  private config: EnrichmentConfig;
  private websiteScraper: WebsiteScraper;
  private googleSearchEnricher: GoogleSearchEnricher;
  private llmProcessor: EnrichmentProcessor;
  private jobs: Map<string, EnrichmentJob> = new Map();
  private results: Map<string, EnrichmentResult> = new Map(); // Store enrichment results

  constructor(config: Partial<EnrichmentConfig> = {}) {
    this.config = {
      sources: {
        website: true,
        googleSearch: true,
        builtWith: false,
        clearbit: false,
        hunter: false,
        linkedin: false
      },
      rateLimiting: {
        enabled: true,
        globalDelay: 1000, // 1 second between requests
        sourceDelays: {
          website: 500,
          googleSearch: 2000
        }
      },
      caching: {
        enabled: true,
        ttl: 3600, // 1 hour
        maxSize: 1000
      },
      retry: {
        enabled: true,
        maxRetries: 3,
        backoffMultiplier: 2
      },
      quality: {
        minConfidence: 0.7,
        requireMultipleSources: true,
        sourceWeights: {
          website: 0.4,
          googleSearch: 0.6
        }
      },
      ...config
    };

              this.websiteScraper = new WebsiteScraper();
          this.googleSearchEnricher = new GoogleSearchEnricher();
          this.llmProcessor = new EnrichmentProcessor();
  }

  /**
   * Main enrichment workflow following the exact diagram:
   * Domain -> Validation -> Website Scraping -> Google/API Enrichment -> LLM Processing -> Database Upsert -> Marketing Tools
   */
  async enrichCompany(request: EnrichmentRequest): Promise<EnrichmentResult> {
    const jobId = this.generateJobId();
    const job: EnrichmentJob = {
      id: jobId,
      domain: request.domain,
      status: 'pending',
      priority: 5,
      createdAt: new Date(),
      progress: 0,
      retryCount: 0,
      maxRetries: this.config.retry.maxRetries
    };

    this.jobs.set(jobId, job);
    this.updateJobProgress(jobId, 0, 'Starting enrichment process...');

    try {
      // Step 1: Domain Validation (HTTP 200 check)
      this.updateJobProgress(jobId, 10, 'Validating domain...');
      const isValid = await this.validateDomain(request.domain);
      if (!isValid) {
        this.updateJobProgress(jobId, 100, 'Domain validation failed');
        job.status = 'failed';
        job.error = 'Domain is not accessible (HTTP 200)';
        const failedResult = this.createFailedResult(job);
        this.results.set(jobId, failedResult);
        return failedResult;
      }

      // Step 2: Website Scraping
      this.updateJobProgress(jobId, 20, 'Scraping website...');
      const scrapedData = await this.websiteScraper.enrich(request.domain);
      if (!scrapedData || scrapedData.status === 'failed') {
        this.updateJobProgress(jobId, 100, 'Website scraping failed');
        job.status = 'failed';
        job.error = scrapedData?.error || 'Failed to scrape website';
        const failedResult = this.createFailedResult(job);
        this.results.set(jobId, failedResult);
        return failedResult;
      }

      // Step 3: Google/API Enrichment
      this.updateJobProgress(jobId, 40, 'Enriching via Google Search...');
      const googleData = await this.googleSearchEnricher.enrich(request.domain);
      
      // Step 4: LLM Processing
      this.updateJobProgress(jobId, 60, 'Processing with LLM...');
      const llmData = await this.llmProcessor.processData({
        scrapedData,
        googleData
      });

      // Step 5: Data Consolidation
      this.updateJobProgress(jobId, 80, 'Consolidating data...');
      const consolidatedData = this.consolidateData(request.domain, scrapedData, googleData, llmData);

      // Step 6: Database Upsert
      this.updateJobProgress(jobId, 90, 'Upserting to database...');
      const dbResult = await this.upsertToDatabase(consolidatedData);

      // Step 7: Marketing Tools Preparation
      this.updateJobProgress(jobId, 95, 'Preparing marketing data...');
      const marketingData = this.prepareMarketingData(consolidatedData);

      this.updateJobProgress(jobId, 100, 'Enrichment completed successfully');
      job.status = 'completed';
      job.completedAt = new Date();

      const result: EnrichmentResult = {
        domain: request.domain,
        status: 'completed',
        progress: 100,
        startedAt: job.createdAt,
        completedAt: job.completedAt,
        sources: {
          website: true,
          googleSearch: !!googleData,
          builtWith: false,
          clearbit: false,
          hunter: false,
          linkedin: false
        },
        data: consolidatedData,
        metadata: {
          totalSources: 2,
          successfulSources: googleData ? 2 : 1,
          confidence: this.calculateConfidenceScore(scrapedData, googleData, llmData) / 100,
          lastUpdated: new Date(),
          version: '1.0.0'
        }
      };

      // Store the result
      this.results.set(jobId, result);
      return result;

    } catch (error) {
      console.error(`Enrichment failed for ${request.domain}:`, error);
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      
      const failedResult = this.createFailedResult(job);
      this.results.set(jobId, failedResult);
      return failedResult;
    }
  }

  /**
   * Step 1: Validate domain is accessible (HTTP 200)
   */
  private async validateDomain(domain: string): Promise<boolean> {
    try {
      const url = `https://${domain}`;
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EnrichmentBot/1.0)'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      return response.ok;
    } catch (error) {
      console.error(`Domain validation failed for ${domain}:`, error);
      return false;
    }
  }

  // LLM processing is now handled by the LLMProcessor class

  /**
   * Step 5: Consolidate data from all sources
   */
  private consolidateData(
    domain: string,
    scrapedData: WebsiteScrapeData, 
    googleData: GoogleSearchData | null, 
    llmData: any
  ): EnrichedCompanyData {
    // Provide fallback values when LLM data is not available
    const fallbackIndustry = llmData?.company?.industry || 'Technology'; // Default fallback
    const fallbackExecutives = llmData?.people?.executives || []; // Empty array if no LLM data
    const fallbackEmployeeCount = llmData?.people?.employeeCount || 'Unknown';
    const fallbackRevenue = llmData?.business?.revenue || 'Unknown';
    const fallbackFunding = llmData?.business?.funding || [];
    const fallbackTargetCustomers = llmData?.market?.targetCustomers || ['Businesses'];
    const fallbackCompetitors = llmData?.market?.competitors || [];
    const fallbackPlatforms = llmData?.technology?.platforms || [];
    const fallbackTools = llmData?.technology?.tools || [];
    const fallbackInfrastructure = llmData?.technology?.infrastructure || [];

    return {
      companyName: llmData?.company?.legalName || scrapedData.title || '',
      legalName: llmData?.company?.legalName || scrapedData.title || '',
      dba: llmData?.company?.dba || '',
      description: llmData?.company?.description || scrapedData.description || '',
      founded: llmData?.business?.founded ? parseInt(llmData.business.founded) : undefined,
      website: `https://${domain}`,
      contact: {
        email: scrapedData.contactInfo?.emails?.[0] || '',
        phone: scrapedData.contactInfo?.phones?.[0] || '',
        address: {
          street: scrapedData.contactInfo?.addresses?.[0] || '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        socialMedia: {
          linkedin: scrapedData.socialLinks?.linkedin || '',
          twitter: scrapedData.socialLinks?.twitter || '',
          facebook: scrapedData.socialLinks?.facebook || '',
          instagram: scrapedData.socialLinks?.instagram || ''
        }
      },
      business: {
        industry: fallbackIndustry,
        sector: '',
        employeeCount: undefined,
        employeeRange: fallbackEmployeeCount,
        revenue: fallbackRevenue,
        funding: fallbackFunding,
        isPublic: false,
        stockSymbol: ''
      },
      technology: {
        platforms: [...fallbackPlatforms, ...(scrapedData.technologies || [])],
        tools: fallbackTools,
        infrastructure: fallbackInfrastructure,
        languages: [],
        databases: []
      },
      people: {
        executives: fallbackExecutives,
        totalEmployees: undefined,
        keyDepartments: []
      },
      market: {
        targetCustomers: fallbackTargetCustomers,
        competitors: fallbackCompetitors,
        uniqueValue: '',
        keywords: scrapedData.keywords || []
      },
      rawData: {
        website: scrapedData,
        googleSearch: googleData || undefined,
        builtWith: undefined,
        clearbit: undefined,
        hunter: undefined,
        linkedin: undefined,
        llm: llmData || undefined
      }
    };
  }

  /**
   * Step 6: Database Upsert
   */
  private async upsertToDatabase(data: EnrichedCompanyData): Promise<any> {
    // TODO: Implement database upsert using Prisma
    // This should update existing BusinessDirectory records or create new ones
    console.log('Database upsert step - to be implemented');
    return { success: true };
  }

  /**
   * Step 7: Marketing Tools Preparation
   */
  private prepareMarketingData(data: EnrichedCompanyData): any {
    return {
      leadScore: this.calculateLeadScore(data),
      targetSegments: data.market.targetCustomers,
      techBasedTargeting: data.technology.platforms,
      competitorAnalysis: data.market.competitors,
      contactPriorities: this.prioritizeContacts(data.people.executives || [])
    };
  }

  /**
   * Calculate confidence score for the enriched data
   */
  private calculateConfidenceScore(
    scrapedData: WebsiteScrapeData, 
    googleData: GoogleSearchData | null, 
    llmData: any
  ): number {
    let score = 0;
    
    // Website scraping confidence
    if (scrapedData.title) score += 20;
    if (scrapedData.description) score += 15;
    if (scrapedData.contactInfo?.emails?.length) score += 15;
    if (scrapedData.contactInfo?.phones?.length) score += 10;
    
    // Google search confidence
    if (googleData?.extractedInfo?.employeeCount) score += 15;
    if (googleData?.extractedInfo?.funding) score += 10;
    if (googleData?.extractedInfo?.news?.length) score += 10;
    
    // LLM confidence
    if (llmData?.people?.executives?.length) score += 5;
    if (llmData?.technology?.platforms?.length) score += 5;
    if (llmData?.market?.targetCustomers?.length) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate lead score for marketing purposes
   */
  private calculateLeadScore(data: EnrichedCompanyData): number {
    let score = 0;
    
    // Company size
    if (data.business.employeeCount) {
      if (data.business.employeeCount > 1000) score += 30;
      else if (data.business.employeeCount > 100) score += 20;
      else if (data.business.employeeCount > 10) score += 10;
    }
    
    // Funding
    if (data.business.funding && data.business.funding.length > 0) score += 20;
    
    // Tech stack (indicates modernization)
    if (data.technology.platforms && data.technology.platforms.length > 5) score += 15;
    
    // Executive contacts
    if (data.people.executives && data.people.executives.length > 0) score += 15;
    
    // Contact information
    if (data.contact.email) score += 10;
    if (data.contact.phone) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Prioritize contacts for outreach
   */
  private prioritizeContacts(executives: any[]): any[] {
    return executives
      .sort((a, b) => {
        // CEO/Founder first
        if (a.title?.toLowerCase().includes('ceo') || a.title?.toLowerCase().includes('founder')) return -1;
        if (b.title?.toLowerCase().includes('ceo') || b.title?.toLowerCase().includes('founder')) return 1;
        
        // C-level executives
        if (a.title?.toLowerCase().startsWith('c') && a.title?.toLowerCase().includes('o')) return -1;
        if (b.title?.toLowerCase().startsWith('c') && b.title?.toLowerCase().includes('o')) return 1;
        
        // VP/Director level
        if (a.title?.toLowerCase().includes('vp') || a.title?.toLowerCase().includes('director')) return -1;
        if (b.title?.toLowerCase().includes('vp') || b.title?.toLowerCase().includes('director')) return 1;
        
        return 0;
      });
  }

  /**
   * Update job progress
   */
  private updateJobProgress(jobId: string, progress: number, step: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.progress = progress;
      job.currentStep = step;
    }
  }

  /**
   * Create failed result
   */
  private createFailedResult(job: EnrichmentJob): EnrichmentResult {
    return {
      domain: job.domain,
      status: 'failed',
      progress: job.progress,
      startedAt: job.createdAt,
      completedAt: job.completedAt,
      error: job.error || 'Unknown error',
      sources: {
        website: false,
        googleSearch: false,
        builtWith: false,
        clearbit: false,
        hunter: false,
        linkedin: false
      },
      data: {} as EnrichedCompanyData,
      metadata: {
        totalSources: 0,
        successfulSources: 0,
        confidence: 0,
        lastUpdated: new Date(),
        version: '1.0.0'
      }
    };
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `enrich_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): EnrichmentJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all jobs
   */
  getAllJobs(): EnrichmentJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Clear completed jobs
   */
  clearCompletedJobs(): void {
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        this.jobs.delete(jobId);
      }
    }
  }

  /**
   * Get enrichment result by job ID
   */
  getJobResult(jobId: string): EnrichmentResult | null {
    return this.results.get(jobId) || null;
  }

  /**
   * Get enrichment result by domain
   */
  getDomainResult(domain: string): EnrichmentResult | null {
    const domainJobs = Array.from(this.jobs.values()).filter(job => job.domain === domain);
    if (domainJobs.length === 0) return null;
    
    // Return the most recent completed job result
    const completedJobs = domainJobs.filter(job => job.status === 'completed');
    if (completedJobs.length === 0) return null;
    
    const mostRecent = completedJobs.sort((a, b) => 
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    )[0];
    
    return this.results.get(mostRecent.id) || null;
  }

  /**
   * Get all enrichment results
   */
  getAllResults(): EnrichmentResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Clear completed results
   */
  clearCompletedResults(): void {
    const completedJobIds = Array.from(this.jobs.values())
      .filter(job => job.status === 'completed')
      .map(job => job.id);
    
    completedJobIds.forEach(id => this.results.delete(id));
  }
}

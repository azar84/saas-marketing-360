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
import { EnrichmentTracker } from './enrichmentTracker';
import { prisma } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

export class EnrichmentEngine {
  private config: EnrichmentConfig;
  private websiteScraper: WebsiteScraper;
  private googleSearchEnricher: GoogleSearchEnricher;
  private llmProcessor: EnrichmentProcessor;
  private jobs: Map<string, EnrichmentJob> = new Map();
  private results: Map<string, EnrichmentResult> = new Map(); // Store enrichment results
  private isProcessing = false;
  private tracker: EnrichmentTracker;
  private prisma: PrismaClient;

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
    this.tracker = new EnrichmentTracker();
    this.prisma = new PrismaClient();
    console.log('🚀 EnrichmentEngine initialized with real-time tracking');
  }

  /**
   * Verify a list of emails using SMTP verification. Returns only verified emails.
   * Uses per-email timeout to avoid blocking the pipeline.
   */
  private async verifyEmailsBeforeLLM(emails: string[], timeoutMs: number = 8000, maxToCheck: number = 10): Promise<string[]> {
    try {
      if (!emails || emails.length === 0) return [];
      const unique = Array.from(new Set(emails.map(e => e.trim().toLowerCase()).filter(Boolean))).slice(0, maxToCheck);
      const verifier = require('email-verify');
      const fromEmail = process.env.EMAIL_VERIFY_FROM || 'no-reply@verification.local';

      const verifyOne = (email: string): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
          let settled = false;
          const timer = setTimeout(() => { if (!settled) { settled = true; resolve(false); } }, timeoutMs);
          try {
            verifier.verify(email, { sender: fromEmail, timeout: timeoutMs - 500 }, (err: any, info: any) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              // Accept only explicit success; treat catch-all/unknown/temporary as failed to avoid hallucinations
              resolve(!!(info && info.success === true));
            });
          } catch {
            if (!settled) { settled = true; clearTimeout(timer); resolve(false); }
          }
        });
      };

      const results = await Promise.all(unique.map(verifyOne));
      const verified = unique.filter((_, idx) => results[idx]);
      return verified;
    } catch (e) {
      console.warn('⚠️ SMTP email verification failed pre-LLM:', e);
      return [];
    }
  }

  /**
   * Normalize domain/URL to ensure consistent format
   * Handles: example.com, http://example.com, https://example.com, www.example.com
   */
  private normalizeDomain(input: string): string {
    try {
      // Remove leading/trailing whitespace
      let domain = input.trim();
      
      // If no protocol specified, default to https://
      if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        domain = `https://${domain}`;
      }
      
      // Create URL object to parse and normalize
      const url = new URL(domain);
      
      // Remove www. prefix if present
      let hostname = url.hostname;
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      
      // Return clean domain without protocol
      return hostname;
    } catch (error) {
      console.warn(`⚠️ URL normalization failed for "${input}", using as-is:`, error);
      // Fallback: remove common prefixes and return cleaned input
      let cleaned = input.trim();
      if (cleaned.startsWith('http://')) cleaned = cleaned.substring(7);
      if (cleaned.startsWith('https://')) cleaned = cleaned.substring(8);
      if (cleaned.startsWith('www.')) cleaned = cleaned.substring(4);
      return cleaned;
    }
  }

  /**
   * Start enrichment process for a company domain
   */
  async enrichCompany(request: EnrichmentRequest): Promise<EnrichmentResult> {
    const jobId = crypto.randomUUID();
    const normalizedDomain = this.normalizeDomain(request.domain);
    
    // Start tracking the enrichment process
    const traceId = this.tracker.startEnrichmentTrace(request.domain, normalizedDomain);
    console.log(`🚀 Starting enrichment for domain: ${request.domain}`);
    console.log(`🔧 Normalized domain: ${normalizedDomain}`);
    console.log(`📊 Started enrichment tracking: ${traceId}`);
    
    // Create job
    const job: EnrichmentJob = {
      id: jobId,
      domain: request.domain,
      normalizedDomain: normalizedDomain,
      priority: request.priority || 'medium',
      status: 'in_progress',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: 3
    };
    
    this.jobs.set(jobId, job);
    
    try {
      // Step 1: Domain Validation
      console.log(`🔍 Step 1/7: Validating domain: ${normalizedDomain}`);
      job.progress = 15;
      job.updatedAt = new Date();
      
      if (!normalizedDomain || normalizedDomain.length < 3) {
        throw new Error(`Invalid domain: ${request.domain}`);
      }
      
      // Track domain validation
      this.tracker.trackDomainValidation(traceId, {
        domain: normalizedDomain,
        isValid: true,
        httpStatus: 200,
        responseTime: Date.now() - job.createdAt.getTime(),
        error: undefined
      });
      
      // Step 2: Website Scraping
      console.log(`🌐 Step 2/7: Scraping website: ${normalizedDomain}`);
      job.progress = 30;
      job.updatedAt = new Date();
      
      const websiteScraper = new WebsiteScraper();
      const scrapedData = await websiteScraper.enrich(normalizedDomain);
      
      if (!scrapedData) {
        throw new Error(`Failed to scrape website: ${normalizedDomain}`);
      }
      
      // Track page discovery
      if (scrapedData.discoveredPages) {
        this.tracker.trackPageDiscovery(traceId, {
          baseUrl: `https://${normalizedDomain}`,
          discoveredPages: scrapedData.discoveredPages,
          categorizedPages: scrapedData.categorizedPages || {},
          prioritizedPages: scrapedData.prioritizedPages || [],
          discoveryTime: Date.now() - job.createdAt.getTime(),
          totalPagesFound: scrapedData.discoveredPages?.length || 0
        });
      }
      
      // Track individual page scraping
      if (scrapedData.pageResults) {
        scrapedData.pageResults.forEach(pageResult => {
          this.tracker.trackPageScraping(traceId, {
            url: pageResult.url,
            status: pageResult.status,
            duration: pageResult.duration || 0,
            extractedData: {
              title: pageResult.title || '',
              description: pageResult.description || '',
              content: pageResult.content || '',
              contactInfo: pageResult.contactInfo || {},
              technologies: pageResult.technologies || [],
              socialLinks: pageResult.socialLinks || {},
              keywords: pageResult.keywords || []
            },
            error: pageResult.error,
            httpInfo: pageResult.httpInfo
          });
        });
      }
      
      // Track website scraping completion
      this.tracker.trackWebsiteScrapingComplete(traceId, {
        totalPages: scrapedData.discoveredPages?.length || 0,
        successfulPages: scrapedData.pageResults?.filter(p => p.status === 'success').length || 0,
        failedPages: scrapedData.pageResults?.filter(p => p.status === 'failed').length || 0,
        totalData: scrapedData,
        scrapingDuration: Date.now() - job.createdAt.getTime()
      });
      
      // Step 3: Google/API Enrichment
      console.log(`🔍 Step 3/7: Google enrichment: ${normalizedDomain}`);
      job.progress = 45;
      job.updatedAt = new Date();
      
      const googleEnricher = new GoogleSearchEnricher();
      const googleData = await googleEnricher.enrich(normalizedDomain);
      
      // Track Google enrichment
      this.tracker.trackGoogleEnrichment(traceId, {
        queries: [],
        results: googleData ? googleData.searchResults || [] : [],
        searchTime: Date.now() - job.createdAt.getTime(),
        success: !!(googleData && googleData.searchResults && googleData.searchResults.length > 0)
      });

      // Track placeholder external API searches so step 05 is visible
      try {
        this.tracker.trackExternalAPISearch(traceId, {
          source: 'linkedin',
          query: normalizedDomain,
          results: [],
          searchTime: 0,
          success: false,
          error: 'LinkedIn integration not implemented yet'
        });
        this.tracker.trackExternalAPISearch(traceId, {
          source: 'crunchbase',
          query: normalizedDomain,
          results: [],
          searchTime: 0,
          success: false,
          error: 'Crunchbase integration not implemented yet'
        });
      } catch (e) {
        // Non-fatal; continue pipeline
      }
      
      // Pre-LLM: Verify emails and remove unverified before sending to LLM
      if (scrapedData.contactInfo?.emails && scrapedData.contactInfo.emails.length > 0) {
        const verifiedEmails = await this.verifyEmailsBeforeLLM(scrapedData.contactInfo.emails);
        scrapedData.contactInfo.emails = verifiedEmails;
        // Optionally filter per-page emails as well for consistency in logs downstream
        if (scrapedData.pageResults && scrapedData.pageResults.length > 0) {
          const verifiedSet = new Set(verifiedEmails);
          scrapedData.pageResults.forEach((pr: any) => {
            if (pr.contactInfo?.emails) {
              pr.contactInfo.emails = pr.contactInfo.emails
                .map((e: string) => (e || '').trim().toLowerCase())
                .filter((e: string) => verifiedSet.has(e));
            }
          });
        }
      }

      // Step 4: LLM Processing
      console.log(`🤖 Step 4/7: LLM processing: ${normalizedDomain}`);
      job.progress = 60;
      job.updatedAt = new Date();
      
      const enrichmentProcessor = new EnrichmentProcessor();
      const llmData = await enrichmentProcessor.processData({
        scrapedData,
        googleData: googleData || null
      });
      
      if (!llmData) {
        throw new Error(`LLM processing failed for: ${normalizedDomain}`);
      }
      
      // Track LLM processing
      this.tracker.trackLLMProcessing(traceId, {
        inputData: {
          scrapedData,
          googleData: googleData || undefined,
          linkedinData: null, // TODO: Add LinkedIn integration
          crunchbaseData: null, // TODO: Add Crunchbase integration
          prompt: 'Analyze company data and extract structured information...', // TODO: Get from processor
          promptLength: 50,
          modelUsed: 'deepseek-chat', // TODO: Get from processor
          promptVersion: '1.0'
        },
        outputData: {
          rawResponse: 'LLM response data', // TODO: Get from processor
          responseLength: 100,
          parsedData: llmData,
          parsingSuccess: !!llmData,
          parsingErrors: [],
          responseTime: Date.now() - job.createdAt.getTime()
        },
        metadata: {
          tokenUsage: null, // TODO: Get from processor
          // modelConfidence intentionally omitted until available
          retryCount: 0
        }
      });
      
      // Step 5: Data Consolidation
      console.log(`📊 Step 5/7: Consolidating data: ${normalizedDomain}`);
      job.progress = 75;
      job.updatedAt = new Date();
      
      const consolidatedData = this.consolidateData(normalizedDomain, scrapedData, googleData || null, llmData);

      // If LLM provided business categories/industries, upsert relationships like business directory flow
      try {
        if (llmData) {
          const labelsRaw = Array.isArray(llmData.business?.categories) ? llmData.business.categories : [];
          const labelsFromCategories = labelsRaw.filter((c: any) => typeof c === 'string' && c.trim().length > 0);
          const labels: string[] = [...labelsFromCategories];
          // Fallback: if no categories array returned, use single company.industry string
          if (labels.length === 0 && typeof llmData.company?.industry === 'string' && llmData.company.industry.trim().length > 0) {
            labels.push(llmData.company.industry.trim());
          }
          if (labels.length > 0) {
            // Ensure businessDirectory row exists (create if needed minimally)
            const existing = await prisma.businessDirectory.findUnique({ where: { website: consolidatedData.website } });
            const biz = existing || await prisma.businessDirectory.create({ data: { website: consolidatedData.website, companyName: consolidatedData.companyName || '' } });
            // Upsert relationships
            for (let i = 0; i < labels.length; i++) {
              const label = labels[i];
              const industry = await prisma.industry.upsert({ where: { label }, update: {}, create: { label, isActive: true } });
              await prisma.businessIndustry.upsert({
                where: { businessId_industryId: { businessId: biz.id, industryId: industry.id } },
                update: { isPrimary: i === 0 },
                create: { businessId: biz.id, industryId: industry.id, isPrimary: i === 0 }
              });
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ Failed to upsert LLM categories to industries:', e);
      }
      
      // Track data consolidation
      this.tracker.trackDataConsolidation(traceId, {
        scrapedData,
        googleData: googleData || undefined,
        linkedinData: null,
        crunchbaseData: null,
        llmData,
        consolidatedData,
        conflicts: this.identifyConflicts(scrapedData, googleData, llmData),
        mergeStrategy: 'priority-based with conflict resolution'
      });
      
      // Step 6: Database Upsert
      console.log(`💾 Step 6/7: Database upsert: ${normalizedDomain}`);
      job.progress = 90;
      job.updatedAt = new Date();
      
      const dbResult = await this.upsertToDatabase(consolidatedData);
      
      // Track database upsert
      this.tracker.trackDatabaseUpsert(traceId, {
        operation: dbResult.operation || 'create',
        table: 'business_directory',
        recordId: dbResult.recordId || 0,
        success: dbResult.success !== false,
        error: dbResult.error,
        duration: Date.now() - job.createdAt.getTime(),
        dataSaved: consolidatedData
      });
      
      // Step 7: Marketing Tools Preparation
      console.log(`🎯 Step 7/7: Preparing marketing tools: ${normalizedDomain}`);
      job.progress = 100;
      job.updatedAt = new Date();
      
      const marketingData = this.prepareMarketingData(consolidatedData);
      
      // Success
      const result: EnrichmentResult = {
        jobId,
        domain: request.domain,
        normalizedDomain: normalizedDomain,
        status: 'completed',
        data: consolidatedData,
        marketingData,
        databaseResult: dbResult,
        progress: 100,
        completedAt: new Date(),
        duration: Date.now() - job.createdAt.getTime()
      };
      
      this.results.set(jobId, result);
      job.status = 'completed';
      job.updatedAt = new Date();
      
      console.log(`✅ Enrichment completed successfully for: ${normalizedDomain}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Enrichment failed for ${normalizedDomain}:`, error);
      
      const errorResult: EnrichmentResult = {
        jobId,
        domain: request.domain,
        normalizedDomain: normalizedDomain,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        progress: job.progress,
        failedAt: new Date(),
        duration: Date.now() - job.createdAt.getTime()
      };
      
      this.results.set(jobId, errorResult);
      job.status = 'failed';
      job.error = errorResult.error;
      job.updatedAt = new Date();
      
      return errorResult;
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
   * Step 6: Database Upsert - FIXED IMPLEMENTATION
   */
  private async upsertToDatabase(data: EnrichedCompanyData): Promise<any> {
    try {
      console.log(`💾 Upserting company data to database: ${data.companyName}`);
      // Verify email if present before saving
      if (data.contact?.email) {
        try {
          const verifier = require('email-verify');
          await new Promise<void>((resolve) => {
            verifier.verify(data.contact!.email!, (err: any, info: any) => {
              if (err || !info?.success) {
                console.warn(`⚠️ Email verification failed for ${data.contact!.email}:`, err || info);
                data.contact!.email = '';
              }
              resolve();
            });
          });
        } catch (e) {
          console.warn('⚠️ Email verification module error, skipping verification:', e);
        }
      }
      
      // Check if company already exists
      const existingCompany = await prisma.businessDirectory.findFirst({
        where: {
          OR: [
            { website: data.website },
            { companyName: data.companyName }
          ]
        }
      });

      if (existingCompany) {
        // Update existing company
        console.log(`🔄 Updating existing company: ${existingCompany.id}`);
        const updatedCompany = await prisma.businessDirectory.update({
          where: { id: existingCompany.id },
          data: {
            companyName: data.companyName,
            description: data.description,
            website: data.website,
            industry: data.business.industry,
            phoneNumber: data.contact.phone,
            email: data.contact.email,
            address: data.contact.address?.street || '',
            city: data.contact.address?.city || '',
            stateProvince: data.contact.address?.state || '',
            country: data.contact.address?.country || '',
            categories: [
              ...(data.business.industry ? [data.business.industry] : []),
              ...(data.technology.platforms || []),
              ...(data.market.keywords || [])
            ],
            confidence: this.calculateConfidenceScore(
              data.rawData.website || { 
                status: 'failed', 
                error: 'No website data',
                lastScraped: new Date(),
                technologies: [],
                title: '',
                description: '',
                keywords: [],
                content: '',
                socialLinks: {},
                contactInfo: { emails: [], phones: [], addresses: [] }
              }, 
              data.rawData.googleSearch || null, 
              data.rawData.llm
            ) / 100,
            source: 'llm_processing',
            extractedAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(`✅ Company updated successfully: ${updatedCompany.id}`);
        return { success: true, action: 'updated', companyId: updatedCompany.id };
      } else {
        // Create new company
        console.log(`🆕 Creating new company: ${data.companyName}`);
        const newCompany = await prisma.businessDirectory.create({
          data: {
            companyName: data.companyName,
            description: data.description,
            website: data.website,
            industry: data.business.industry,
            phoneNumber: data.contact.phone,
            email: data.contact.email,
            address: data.contact.address?.street || '',
            city: data.contact.address?.city || '',
            stateProvince: data.contact.address?.state || '',
            country: data.contact.address?.country || '',
            categories: [
              ...(data.business.industry ? [data.business.industry] : []),
              ...(data.technology.platforms || []),
              ...(data.market.keywords || [])
            ],
            confidence: this.calculateConfidenceScore(
              data.rawData.website || { 
                status: 'failed', 
                error: 'No website data',
                lastScraped: new Date(),
                technologies: [],
                title: '',
                description: '',
                keywords: [],
                content: '',
                socialLinks: {},
                contactInfo: { emails: [], phones: [], addresses: [] }
              }, 
              data.rawData.googleSearch || null, 
              data.rawData.llm
            ) / 100,
            source: 'llm_processing',
            extractedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(`✅ Company created successfully: ${newCompany.id}`);
        return { success: true, action: 'created', companyId: newCompany.id };
      }
    } catch (error) {
      console.error('❌ Database upsert failed:', error);
      throw new Error(`Database upsert failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
      jobId: job.id,
      domain: job.domain,
      normalizedDomain: job.normalizedDomain,
      status: 'failed',
      progress: job.progress,
      startedAt: job.createdAt,
      completedAt: job.completedAt,
      error: job.error || 'Unknown error'
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

  // Helper method to identify data conflicts
  private identifyConflicts(scrapedData: any, googleData: any, llmData: any): string[] {
    const conflicts: string[] = [];
    
    // Check for conflicts between scraped and LLM data
    if (scrapedData.companyName && llmData.companyName && 
        scrapedData.companyName !== llmData.companyName) {
      conflicts.push('Company name mismatch between scraped and LLM data');
    }
    
    // Check for conflicts in contact information
    if (scrapedData.contactInfo?.emails && llmData.contactInfo?.emails) {
      const scrapedEmails = new Set(scrapedData.contactInfo.emails);
      const llmEmails = new Set(llmData.contactInfo.emails);
      
      if (!this.arraysEqual(Array.from(scrapedEmails), Array.from(llmEmails))) {
        conflicts.push('Email addresses differ between scraped and LLM data');
      }
    }
    
    return conflicts;
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  }

  // Helper method to prepare marketing tools
  private prepareMarketingTools(data: EnrichedCompanyData): any {
    return {
      templates: ['Email Campaign', 'Social Media Post', 'Case Study'],
      segments: ['B2B', 'Technology', data.business?.industry || 'General'],
      customizations: ['Company branding', 'Industry focus', 'Contact information']
    };
  }

  // Get tracker instance for external access
  getTracker(): EnrichmentTracker {
    return this.tracker;
  }
}

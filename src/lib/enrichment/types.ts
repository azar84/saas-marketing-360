export interface EnrichmentRequest {
  domain: string;
  companyName?: string;
  priority?: 'low' | 'medium' | 'high';
  forceRefresh?: boolean;
}

export interface EnrichmentResult {
  jobId: string;
  domain: string;
  normalizedDomain: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  duration?: number; // milliseconds
  
  // Enriched data
  data?: EnrichedCompanyData;
  
  // Marketing data
  marketingData?: any;
  
  // Database result
  databaseResult?: any;
}

export interface LLMProcessedData {
  company: {
    legalName: string;
    dba: string;
    industry: string;
    description: string;
  };
  business: {
    targetCustomers: string[];
    funding: string[];
    revenue: string;
    founded: string;
    categories?: string[]; // Additional industry/category labels for upserting relationships
  };
  people: {
    executives: Array<{
      name: string;
      title: string;
      linkedin: string;
    }>;
    employeeCount: string;
  };
  technology: {
    platforms: string[];
    tools: string[];
    infrastructure: string[];
  };
  market: {
    targetCustomers: string[];
    competitors: string[];
    geographic: string[];
  };
  processedAt: Date;
  confidence: number;
}

export interface EnrichedCompanyData {
  // Basic company info
  companyName: string;
  legalName?: string;
  dba?: string;
  description?: string;
  founded?: number;
  website: string;
  
  // Contact information
  contact: {
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    socialMedia?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  };
  
  // Business details
  business: {
    industry?: string;
    sector?: string;
    employeeCount?: number;
    employeeRange?: string; // e.g., "51-200"
    revenue?: string; // e.g., "$10M-$50M"
    funding?: FundingRound[];
    isPublic?: boolean;
    stockSymbol?: string;
  };
  
  // Technology stack
  technology: {
    platforms?: string[]; // e.g., ["Shopify", "WordPress"]
    tools?: string[]; // e.g., ["Google Analytics", "Stripe"]
    infrastructure?: string[]; // e.g., ["AWS", "Cloudflare"]
    languages?: string[]; // e.g., ["JavaScript", "Python"]
    databases?: string[]; // e.g., ["PostgreSQL", "MongoDB"]
  };
  
  // People and team
  people: {
    executives?: Executive[];
    totalEmployees?: number;
    keyDepartments?: string[];
  };
  
  // Market and positioning
  market: {
    targetCustomers?: string[];
    competitors?: string[];
    uniqueValue?: string;
    keywords?: string[];
  };
  
  // Raw data from sources
  rawData: {
    website?: WebsiteScrapeData;
    googleSearch?: GoogleSearchData;
    builtWith?: BuiltWithData;
    clearbit?: ClearbitData;
    hunter?: HunterData;
    linkedin?: LinkedInData;
    llm?: LLMProcessedData;
  };
}

export interface FundingRound {
  round: string; // e.g., "Series A", "Seed"
  amount?: string; // e.g., "$5M"
  date?: string;
  investors?: string[];
  valuation?: string;
}

export interface Executive {
  name: string;
  title: string;
  linkedin?: string;
  email?: string;
  phone?: string;
}

export interface WebsiteScrapeData {
  title?: string;
  description?: string;
  keywords?: string[];
  content?: string;
  socialLinks?: Record<string, string>;
  contactInfo?: {
    emails?: string[];
    phones?: string[];
    addresses?: string[];
  };
  technologies?: string[];
  lastScraped: Date;
  status: 'success' | 'failed';
  error?: string;
  // New tracking properties for page discovery and scraping
  discoveredPages?: string[];
  categorizedPages?: Record<string, string[]>;
  prioritizedPages?: string[];
  pageResults?: Array<{
    url: string;
    status: 'success' | 'failed';
    duration: number;
    title?: string;
    description?: string;
    content?: string;
    contactInfo?: any;
    technologies?: string[];
    socialLinks?: Record<string, string>;
    keywords?: string[];
    error?: string;
    httpInfo?: {
      status: number;
      statusText: string;
      headers: Record<string, string>;
    };
  }>;
}

// Common subtypes used in scraping traces
export interface ContactInfo {
  emails?: string[];
  phones?: string[];
  addresses?: string[];
}

export type CategorizedPages = Record<string, string[]>;

export interface GoogleSearchData {
  searchResults: Array<{
    title: string;
    link: string;
    snippet?: string;
    source: string; // e.g., "LinkedIn", "Crunchbase", "News"
  }>;
  extractedInfo?: {
    employeeCount?: string;
    funding?: string;
    news?: string[];
    reviews?: string[];
  };
  lastSearched: Date;
}

export interface BuiltWithData {
  technologies: Array<{
    name: string;
    category: string;
    firstDetected?: string;
    lastDetected?: string;
  }>;
  meta: {
    companyName?: string;
    emails?: string[];
    phones?: string[];
    country?: string;
    city?: string;
    state?: string;
    vertical?: string;
    employeeCount?: number;
    trafficRank?: number;
  };
  lastEnriched: Date;
}

export interface ClearbitData {
  company: {
    name?: string;
    legalName?: string;
    domain?: string;
    category?: {
      industry?: string;
      sector?: string;
      subIndustry?: string;
    };
    metrics?: {
      employees?: number;
      employeesRange?: string;
      revenue?: string;
      marketCap?: number;
    };
    geo?: {
      country?: string;
      state?: string;
      city?: string;
      timezone?: string;
    };
    tags?: string[];
    description?: string;
    founded?: number;
    site?: {
      title?: string;
      description?: string;
    };
  };
  people?: Array<{
    name: string;
    title: string;
    email?: string;
    linkedin?: string;
  }>;
  lastEnriched: Date;
}

export interface HunterData {
  domain: string;
  organization?: string;
  emails: Array<{
    value: string;
    type: string;
    confidence: number;
    sources: string[];
    firstName?: string;
    lastName?: string;
    position?: string;
    seniority?: string;
  }>;
  pattern?: string;
  lastEnriched: Date;
}

export interface LinkedInData {
  company: {
    name?: string;
    description?: string;
    industry?: string;
    companySize?: string;
    specialties?: string[];
    founded?: number;
    website?: string;
  };
  employees?: Array<{
    name: string;
    title: string;
    location?: string;
    linkedinUrl?: string;
  }>;
  lastEnriched: Date;
}

export interface EnrichmentSource {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number; // 1-10, higher = more important
  rateLimit: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  cost: {
    perRequest: number;
    currency: string;
  };
  lastUsed?: Date;
  errorCount: number;
  successCount: number;
}

export interface EnrichmentJob {
  id: string;
  domain: string;
  normalizedDomain: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  currentStep?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
  result?: EnrichmentResult;
}

export interface EnrichmentConfig {
  sources: {
    website: boolean;
    googleSearch: boolean;
    builtWith: boolean;
    clearbit: boolean;
    hunter: boolean;
    linkedin: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    globalDelay: number; // ms between requests
    sourceDelays: Record<string, number>; // per-source delays
  };
  caching: {
    enabled: boolean;
    ttl: number; // seconds
    maxSize: number; // number of cached results
  };
  retry: {
    enabled: boolean;
    maxRetries: number;
    backoffMultiplier: number;
  };
  quality: {
    minConfidence: number; // 0-1
    requireMultipleSources: boolean;
    sourceWeights: Record<string, number>; // confidence weighting
  };
}

export interface EnrichmentTrace {
  id: string;
  domain: string;
  normalizedDomain: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'in_progress' | 'completed' | 'failed';
  
  // Step-by-step data tracking
  steps: {
    domainValidation: StepTrace;
    websiteScraping: StepTrace;
    googleEnrichment: StepTrace;
    llmProcessing: StepTrace;
    dataConsolidation: StepTrace;
    databaseUpsert: StepTrace;
    marketingTools: StepTrace;
  };
  
  // Final consolidated data
  finalData?: EnrichedCompanyData;
  
  // Quality metrics
  qualityMetrics: {
    confidenceScore: number;
    dataCompleteness: number;
    validationErrors: string[];
    accuracyIssues: string[];
  };
  
  // Performance metrics
  performance: {
    totalDuration: number;
    stepDurations: Record<string, number>;
    memoryUsage?: number;
  };
}

export interface StepTrace {
  stepName: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  
  // Input data for this step
  inputData?: any;
  
  // Output data from this step
  outputData?: any;
  
  // Raw data captured
  rawData?: any;
  
  // Errors or warnings
  errors?: string[];
  warnings?: string[];
  
  // Validation results
  validation?: {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  };
  
  // Metadata
  metadata?: Record<string, any>;
}

// Enhanced LLM processing tracking
export interface LLMProcessingTrace extends StepTrace {
  stepName: 'llmProcessing';
  
  // Input data sent to LLM
  inputData: {
    scrapedData: WebsiteScrapeData;
    googleData?: GoogleSearchData;
    prompt: string;
    promptLength: number;
    modelUsed: string;
  };
  
  // LLM response
  outputData: {
    rawResponse: string;
    responseLength: number;
    parsedData?: LLMProcessedData;
    parsingSuccess: boolean;
    parsingErrors?: string[];
  };
  
  // Prompt engineering data
  promptEngineering: {
    promptTemplate: string;
    variables: Record<string, any>;
    promptVersion: string;
  };
  
  // Model performance
  modelPerformance: {
    responseTime: number;
    tokenUsage?: {
      input: number;
      output: number;
      total: number;
    };
    modelConfidence?: number;
  };
}

// Enhanced website scraping tracking
export interface WebsiteScrapingTrace extends StepTrace {
  stepName: 'websiteScraping';
  
  // Discovery results
  discovery: {
    baseUrl: string;
    discoveredPages: string[];
    categorizedPages: CategorizedPages;
    prioritizedPages: string[];
    totalPagesFound: number;
    pagesScraped: number;
    pagesFailed: number;
  };
  
  // Individual page results
  pageResults: PageScrapingResult[];
  
  // Consolidated data
  consolidatedData: WebsiteScrapeData;
  
  // Quality assessment
  qualityAssessment: {
    contactInfoFound: {
      emails: number;
      phones: number;
      addresses: number;
    };
    technologiesDetected: number;
    socialLinksFound: number;
    contentQuality: 'low' | 'medium' | 'high';
  };
}

export interface PageScrapingResult {
  url: string;
  status: 'success' | 'failed';
  duration: number;
  
  // Extracted data
  data?: {
    title: string;
    description: string;
    content: string;
    contactInfo: ContactInfo;
    technologies: string[];
    socialLinks: Record<string, string>;
    keywords: string[];
  };
  
  // Raw HTML (for debugging)
  rawHtml?: string;
  
  // Errors if failed
  error?: string;
  
  // HTTP response info
  httpInfo?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
  };
}

// Data validation interfaces
export interface DataValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  suggestions: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface ValidationIssue {
  field: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  suggestion: string;
  data?: any;
}

// Enhanced enrichment result with full trace
export interface EnrichmentResultWithTrace extends EnrichmentResult {
  trace: EnrichmentTrace;
  validationResults: DataValidationResult;
  qualityReport: QualityReport;
}

export interface QualityReport {
  overallScore: number;
  dataCompleteness: number;
  accuracyScore: number;
  freshnessScore: number;
  
  // Detailed breakdown
  breakdown: {
    companyInfo: number;
    contactInfo: number;
    businessDetails: number;
    technologyStack: number;
    marketInfo: number;
  };
  
  // Issues found
  issues: ValidationIssue[];
  
  // Recommendations
  recommendations: string[];
}

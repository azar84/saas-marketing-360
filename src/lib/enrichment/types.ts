export interface EnrichmentRequest {
  domain: string;
  companyName?: string;
  priority?: 'low' | 'medium' | 'high';
  forceRefresh?: boolean;
}

export interface EnrichmentResult {
  domain: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  
  // Data sources
  sources: {
    website: boolean;
    googleSearch: boolean;
    builtWith: boolean;
    clearbit: boolean;
    hunter: boolean;
    linkedin: boolean;
  };
  
  // Enriched data
  data: EnrichedCompanyData;
  
  // Metadata
  metadata: {
    totalSources: number;
    successfulSources: number;
    confidence: number; // 0-1
    lastUpdated: Date;
    version: string;
  };
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
}

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
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: number;
  createdAt: Date;
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

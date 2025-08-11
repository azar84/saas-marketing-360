import { GoogleSearchData } from '../types';

export class GoogleSearchEnricher {
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor() {
    this.apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';
    
    if (!this.apiKey || !this.searchEngineId) {
      console.warn('⚠️ Google Custom Search API not configured. Set GOOGLE_CUSTOM_SEARCH_API_KEY and GOOGLE_CUSTOM_SEARCH_ENGINE_ID environment variables.');
    }
  }

  /**
   * Enrich company data using Google search
   */
  async enrich(domain: string): Promise<GoogleSearchData | null> {
    try {
      if (!this.apiKey || !this.searchEngineId) {
        throw new Error('Google Custom Search API not configured');
      }

      console.log(`🔍 Starting Google search enrichment for ${domain}`);
      
      // Extract company name from domain for better search
      const companyName = this.extractCompanyNameFromDomain(domain);
      
      // Perform multiple targeted searches
      const searchQueries = this.generateSearchQueries(domain, companyName);
      const searchResults: any[] = [];
      
      for (const query of searchQueries) {
        try {
          console.log(`🔍 Searching: "${query}"`);
          const results = await this.performSearch(query);
          searchResults.push(...results);
          
          // Rate limiting - Google allows 100 queries per day for free
          await this.delay(1000); // 1 second delay between searches
          
        } catch (error) {
          console.error(`❌ Search failed for query "${query}":`, error);
          // Continue with other queries
        }
      }

      if (searchResults.length === 0) {
        throw new Error('No search results found');
      }

      // Process and categorize search results
      const processedResults = this.processSearchResults(searchResults);
      const extractedInfo = this.extractCompanyInfo(processedResults, domain, companyName);

      const googleSearchData: GoogleSearchData = {
        searchResults: processedResults,
        extractedInfo,
        lastSearched: new Date()
      };

      console.log(`✅ Google search enrichment completed for ${domain}`);
      return googleSearchData;
      
    } catch (error) {
      console.error(`❌ Google search enrichment failed for ${domain}:`, error);
      return null;
    }
  }

  /**
   * Generate targeted search queries for company enrichment
   */
  private generateSearchQueries(domain: string, companyName: string): string[] {
    const queries: string[] = [];
    
    // Search for company on LinkedIn
    if (companyName) {
      queries.push(`"${companyName}" site:linkedin.com/company`);
      queries.push(`"${companyName}" site:linkedin.com`);
    }
    
    // Search for company on Crunchbase
    if (companyName) {
      queries.push(`"${companyName}" site:crunchbase.com`);
    }
    
    // Search for company news and press releases
    if (companyName) {
      queries.push(`"${companyName}" news press release`);
      queries.push(`"${companyName}" funding investment`);
    }
    
    // Search for company reviews and ratings
    if (companyName) {
      queries.push(`"${companyName}" reviews ratings`);
      queries.push(`"${companyName}" glassdoor`);
    }
    
    // Search for company technology stack mentions
    if (companyName) {
      queries.push(`"${companyName}" tech stack technology`);
      queries.push(`"${companyName}" built with`);
    }
    
    // Search for company job postings (indicates growth)
    if (companyName) {
      queries.push(`"${companyName}" careers jobs hiring`);
    }

    return queries;
  }

  /**
   * Perform a single Google search
   */
  private async performSearch(query: string): Promise<any[]> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('cx', this.searchEngineId);
    url.searchParams.set('q', query);
    url.searchParams.set('num', '10'); // Max results per query
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Google Search API error: ${data.error.message}`);
    }

    return data.items || [];
  }

  /**
   * Process and categorize search results
   */
  private processSearchResults(results: any[]): Array<{
    title: string;
    link: string;
    snippet?: string;
    source: string;
    relevance: number;
  }> {
    const processed = results.map(result => {
      const source = this.categorizeSource(result.link);
      const relevance = this.calculateRelevance(result, source);
      
      return {
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        source,
        relevance
      };
    });

    // Remove duplicates and sort by relevance
    const unique = this.removeDuplicateResults(processed);
    return unique.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Categorize the source of a search result
   */
  private categorizeSource(url: string): string {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('linkedin.com')) {
      return 'LinkedIn';
    } else if (urlLower.includes('crunchbase.com')) {
      return 'Crunchbase';
    } else if (urlLower.includes('glassdoor.com')) {
      return 'Glassdoor';
    } else if (urlLower.includes('news') || urlLower.includes('press')) {
      return 'News';
    } else if (urlLower.includes('careers') || urlLower.includes('jobs')) {
      return 'Careers';
    } else if (urlLower.includes('blog') || urlLower.includes('medium.com')) {
      return 'Blog';
    } else if (urlLower.includes('github.com')) {
      return 'GitHub';
    } else if (urlLower.includes('stackoverflow.com')) {
      return 'StackOverflow';
    } else {
      return 'Other';
    }
  }

  /**
   * Calculate relevance score for a search result
   */
  private calculateRelevance(result: any, source: string): number {
    let score = 0;
    
    // Base score from source type
    const sourceScores: Record<string, number> = {
      'LinkedIn': 0.9,
      'Crunchbase': 0.8,
      'Glassdoor': 0.7,
      'News': 0.6,
      'Careers': 0.5,
      'Blog': 0.4,
      'GitHub': 0.3,
      'StackOverflow': 0.2,
      'Other': 0.1
    };
    
    score += sourceScores[source] || 0.1;
    
    // Boost score for recent results (if date is available)
    if (result.pagemap?.metatags?.[0]?.['article:published_time']) {
      const publishedDate = new Date(result.pagemap.metatags[0]['article:published_time']);
      const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSincePublished < 30) score += 0.2;
      else if (daysSincePublished < 90) score += 0.1;
    }
    
    // Boost score for longer, more detailed snippets
    if (result.snippet && result.snippet.length > 100) {
      score += 0.1;
    }
    
    return Math.min(1.0, score);
  }

  /**
   * Remove duplicate search results
   */
  private removeDuplicateResults(results: any[]): any[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = result.link.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Extract company information from search results
   */
  private extractCompanyInfo(results: any[], domain: string, companyName: string): {
    employeeCount?: string;
    funding?: string;
    news?: string[];
    reviews?: string[];
  } {
    const extracted: any = {
      news: [],
      reviews: []
    };

    results.forEach(result => {
      const { title, snippet, source } = result;
      const text = `${title} ${snippet}`.toLowerCase();

      // Extract employee count
      if (!extracted.employeeCount) {
        const employeeMatch = text.match(/(\d+(?:,\d+)?)\s*(?:employees?|people|staff)/i);
        if (employeeMatch) {
          extracted.employeeCount = employeeMatch[1];
        }
      }

      // Extract funding information
      if (!extracted.funding) {
        const fundingMatch = text.match(/(?:raised|funding|investment|series)\s*\$?(\d+(?:\.\d+)?[kmb]?)/i);
        if (fundingMatch) {
          extracted.funding = fundingMatch[1];
        }
      }

      // Extract news mentions
      if (source === 'News' && title && !extracted.news.includes(title)) {
        extracted.news.push(title);
      }

      // Extract review mentions
      if (source === 'Glassdoor' && title && !extracted.reviews.includes(title)) {
        extracted.reviews.push(title);
      }
    });

    return extracted;
  }

  /**
   * Extract company name from domain
   */
  private extractCompanyNameFromDomain(domain: string): string {
    // Remove common TLDs and www
    let name = domain
      .replace(/^www\./, '')
      .replace(/\.(com|org|net|co|io|ai|app|dev)$/, '');
    
    // Convert to title case
    name = name
      .split(/[-._]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return name;
  }

  /**
   * Delay function for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

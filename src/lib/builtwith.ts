interface BuiltWithCompany {
  // Basic info
  domain: string;
  organization?: string;
  email?: string;
  phone?: string;
  country?: string;
  enriched?: boolean;
  techStack?: string[];
  
  // Timestamps
  firstIndexed?: string;
  lastIndexed?: string;
  firstDetected?: string;
  lastDetected?: string;
  
  // Location details
  city?: string;
  state?: string;
  postcode?: string;
  
  // Contact arrays
  emails?: string[];
  telephones?: string[];
  socialLinks?: string[];
  
  // Business info
  vertical?: string;
  titles?: string[];
  
  // Traffic & Analytics
  employeeCount?: number;
  trafficRank?: number;
  qualityRank?: number;
  uniqueVisitors?: number;
  monthlyVisits?: number;
  
  // Raw BuiltWith data for debugging
  rawData?: any;
}

interface BuiltWithListsResponse {
  Results: Array<{
    D: string; // Domain
    LOS: string[]; // List of Sites
    Q: number; // Query
    A: number; // Alexa
    U: number; // Unique Visitors
    M: number; // Monthly Visitors
    SKU: number; // SKU Count
    F: number; // Facebook
    E: number; // Email
    Country: string | null;
    FD: number; // First Date
    LD: number; // Last Date
    FI: number; // First Indexed
    LI: number; // Last Indexed
    S: number; // Social
    R: number; // Revenue
    META: {
      Social: string[];
      CompanyName: string;
      Telephones: string[];
      Emails: string[];
      City: string;
      State: string;
      Postcode: string;
      Country: string;
      Vertical: string;
      Titles: string[];
    };
  }>;
  NextOffset: string;
  // Some responses may include totals; mark as optional and loose-typed
  TotalResults?: number;
}

interface BuiltWithDomainResponse {
  Results: Array<{
    Domain: string;
    Technologies: Array<{
      Name: string;
      Category: string;
      Description?: string;
    }>;
  }>;
}

class BuiltWithAPI {
  private apiKey: string;
  private baseUrl = 'https://api.builtwith.com';
  private rateLimitDelay = 1000; // 1 second between calls

  constructor() {
    this.apiKey = process.env.BUILTWITH_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('BUILTWITH_API_KEY environment variable is required');
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }



  private async makeRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    // Build URL manually to match the working test
    const baseUrl = 'https://api.builtwith.com';
    const url = new URL(endpoint, baseUrl);
    
    // Add API key and other parameters
    url.searchParams.set('KEY', this.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    try {
      console.log('Making BuiltWith API request to:', url.toString());
      
      const response = await fetch(url.toString());
      
      console.log('BuiltWith API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('BuiltWith API error response:', errorText);
        throw new Error(`BuiltWith API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ BuiltWith API response parsed successfully');
      
      return data;
    } catch (error) {
      console.error('BuiltWith API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for companies using a specific technology
   */
  async searchCompaniesByTech(
    technology: string,
    options: {
      country?: string;
      since?: string;
      limit?: number;
    } = {}
  ): Promise<BuiltWithCompany[]> {
    console.log('🔍 BuiltWithAPI.searchCompaniesByTech called with:', { technology, options });
    
    const params: Record<string, string> = {
      TECH: technology,
      META: 'yes'
    };

    if (options.country) {
      params.COUNTRY = options.country;
    }

    if (options.since) {
      params.SINCE = options.since;
    }

    console.log('📋 BuiltWith API params:', params);

    try {
      console.log('📡 Making BuiltWith API request...');
      const response: BuiltWithListsResponse = await this.makeRequest('/lists11/api.json', params);
      console.log('📥 BuiltWith API response:', response);
      
      if (!response.Results) {
        console.log('⚠️ No results in response');
        return [];
      }

      const companies = response.Results.map(result => ({
        domain: result.D,
        organization: result.META?.CompanyName || '',
        email: result.META?.Emails?.[0] || '',
        phone: result.META?.Telephones?.[0] || '',
        firstIndexed: new Date(result.FI * 1000).toISOString().split('T')[0],
        lastIndexed: new Date(result.LI * 1000).toISOString().split('T')[0],
        country: result.META?.Country || result.Country || '',
        enriched: false
      }));

      console.log('✅ Mapped companies:', companies);
      return companies;
    } catch (error) {
      console.error('💥 Error searching companies by technology:', error);
      throw error;
    }
  }

  /**
   * Enrich a single company with detailed tech stack information
   */
  async enrichCompany(domain: string): Promise<BuiltWithCompany | null> {
    try {
      // Add delay to respect rate limits
      await this.delay(this.rateLimitDelay);

      const response: BuiltWithDomainResponse = await this.makeRequest('/v21/api.json', {
        LOOKUP: domain
      });

      if (!response.Results || response.Results.length === 0) {
        return null;
      }

      const result = response.Results[0];
      const techStack = result.Technologies?.map(tech => tech.Name) || [];

      return {
        domain: result.Domain,
        techStack,
        enriched: true
      };
    } catch (error) {
      console.error(`Error enriching company ${domain}:`, error);
      return null;
    }
  }

  /**
   * Enrich multiple companies with tech stack information
   */
  async enrichCompanies(companies: BuiltWithCompany[]): Promise<BuiltWithCompany[]> {
    const enrichedCompanies: BuiltWithCompany[] = [];
    
    for (const company of companies) {
      try {
        const enriched = await this.enrichCompany(company.domain);
        if (enriched) {
          enrichedCompanies.push({
            ...company,
            techStack: enriched.techStack,
            enriched: true
          });
        } else {
          enrichedCompanies.push(company);
        }
      } catch (error) {
        console.error(`Failed to enrich ${company.domain}:`, error);
        enrichedCompanies.push(company);
      }
    }

    return enrichedCompanies;
  }

  /**
   * Get paginated results from Lists API
   */
  async getPaginatedResults(
    technology: string,
    offset?: string,
    options: {
      country?: string;
      since?: string;
    } = {}
  ): Promise<{
    companies: BuiltWithCompany[];
    nextOffset?: string;
    totalResults?: number;
  }> {
    const params: Record<string, string> = {
      TECH: technology,
      META: 'yes'
    };

    if (offset) {
      params.OFFSET = offset;
    }

    if (options.country) {
      params.COUNTRY = options.country;
    }

    if (options.since) {
      params.SINCE = options.since;
    }

    try {
      const response: BuiltWithListsResponse = await this.makeRequest('/lists11/api.json', params);
      
      const companies = response.Results?.map((result: any) => ({
        domain: result.D || result.Domain,
        organization: result.META?.CompanyName || result.Organization || '',
        email: (result.META?.Emails && result.META.Emails[0]) || result.Email || '',
        phone: (result.META?.Telephones && result.META.Telephones[0]) || result.Phone || '',
        firstIndexed: result.FI ? new Date(result.FI * 1000).toISOString().split('T')[0] : result.FirstIndexed,
        lastIndexed: result.LI ? new Date(result.LI * 1000).toISOString().split('T')[0] : result.LastIndexed,
        country: result.META?.Country || result.Country || '',
        enriched: false
      })) || [];

      return {
        companies,
        nextOffset: response.NextOffset,
        totalResults: (response as any).TotalResults,
      };
    } catch (error) {
      console.error('Error getting paginated results:', error);
      throw error;
    }
  }

  /**
   * Validate if a technology exists in our list
   */
  async validateTechnology(technology: string): Promise<boolean> {
    try {
      // Load technologies from the JSON file using absolute URL
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : 'http://localhost:3000';
      
      const technologiesResponse = await fetch(`${baseUrl}/technologies.json`);
      const technologies: string[] = await technologiesResponse.json();
      
      return technologies.some(tech => 
        tech.toLowerCase() === technology.toLowerCase()
      );
    } catch (error) {
      console.error('Error validating technology:', error);
      // Always return true to allow API calls to proceed
      return true;
    }
  }

  /**
   * Get all available technologies
   */
  async getAvailableTechnologies(): Promise<string[]> {
    try {
      // Load technologies from the JSON file using absolute URL
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : 'http://localhost:3000';
      
      const technologiesResponse = await fetch(`${baseUrl}/technologies.json`);
      const technologies: string[] = await technologiesResponse.json();
      return technologies.sort();
    } catch (error) {
      console.error('Error loading technologies:', error);
      // Fallback: return common technologies
      return ['WooCommerce', 'Shopify', 'WordPress', 'React', 'Angular', 'Vue.js'].sort();
    }
  }
}

// Export a singleton instance
export const builtWithAPI = new BuiltWithAPI();

// Export types for use in other files
export type { BuiltWithCompany, BuiltWithListsResponse, BuiltWithDomainResponse };

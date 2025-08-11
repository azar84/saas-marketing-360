import { WebsiteScrapeData, GoogleSearchData, LLMProcessedData } from '../../enrichment/types';
import { llmModel } from '@/lib/llm/model';

export interface EnrichmentProcessorData {
  scrapedData: WebsiteScrapeData;
  googleData: GoogleSearchData | null;
}

export type EnrichmentProcessorResult = LLMProcessedData;

export class EnrichmentProcessor {
  constructor() {
    // No need to store chatModel - using unified service
  }

  async processData(data: EnrichmentProcessorData): Promise<EnrichmentProcessorResult | null> {
    try {
      const prompt = this.constructPrompt(data);
      console.log('🤖 LLM: Processing data with prompt:', prompt.substring(0, 200) + '...');

      // Use the unified LLM model
      const response = await llmModel.call(prompt);
      
      if (!response.content) {
        throw new Error('No content received from LLM service');
      }

      console.log('🤖 LLM: Raw response received, length:', response.content.length);
      return this.parseResponse(response.content);
    } catch (error) {
      console.error('🤖 LLM: Error processing data:', error);
      return null;
    }
  }

  private constructPrompt(data: EnrichmentProcessorData): string {
    const { scrapedData, googleData } = data;
    
    const techHints = scrapedData.technologies?.join(', ') || 'None detected';
    const socialInfo = scrapedData.socialLinks ? Object.entries(scrapedData.socialLinks)
      .filter(([_, url]) => url)
      .map(([platform, url]) => `${platform}: ${url}`)
      .join('\n') : 'None found';
    
    const contactInfo = [
      ...(scrapedData.contactInfo?.emails?.map(email => `Email: ${email}`) || []),
      ...(scrapedData.contactInfo?.phones?.map(phone => `Phone: ${phone}`) || []),
      ...(scrapedData.contactInfo?.addresses?.map(addr => `Address: ${addr}`) || [])
    ].join('\n') || 'None found';

    const googleInfo = googleData?.extractedInfo ? Object.entries(googleData.extractedInfo)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n') : 'None available';

    const searchResults = googleData?.searchResults?.map(result => `- ${result.title}: ${result.snippet || 'No snippet'}`).join('\n') || 'No search results available';

    return `Please analyze the following company data and extract structured information. Return your response as a valid JSON object with the exact structure specified below.

Company Website Data:
- Title: ${scrapedData.title || 'Not available'}
- Description: ${scrapedData.description || 'Not available'}
- Technology Hints: ${techHints}
- Social Links: ${socialInfo}
- Contact Information: ${contactInfo}

Google Search Results:
${searchResults}

Additional Google Info:
${googleInfo}

Please extract and structure the following information into a JSON response that matches this exact format:

{
  "company": {
    "legalName": "Legal business name",
    "dba": "Doing business as name if applicable",
    "industry": "Primary industry or sector",
    "description": "Clear company description"
  },
  "business": {
    "targetCustomers": ["Target customer segments"],
    "funding": ["Funding information if mentioned"],
    "revenue": "Revenue range or financial info",
    "founded": "Year founded if mentioned"
  },
  "people": {
    "executives": [
      {
        "name": "Executive name",
        "title": "Job title",
        "linkedin": "LinkedIn URL if available"
      }
    ],
    "employeeCount": "Employee count range (e.g., '10-50', '1000+')"
  },
  "technology": {
    "platforms": ["Technology platforms used"],
    "tools": ["Software tools and applications"],
    "infrastructure": ["Infrastructure and hosting solutions"]
  },
  "market": {
    "targetCustomers": ["Target customer segments"],
    "competitors": ["Main competitors"],
    "geographic": ["Geographic markets served"]
  }
}

Focus on extracting factual information that would be useful for business intelligence and marketing purposes. If information is not available, use null or empty arrays as appropriate.`;
  }



  private parseResponse(response: string): EnrichmentProcessorResult {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and provide defaults for required fields
      return {
        company: {
          legalName: parsed.company?.legalName || 'Unknown Company',
          dba: parsed.company?.dba || '',
          industry: parsed.company?.industry || 'Unknown',
          description: parsed.company?.description || 'No description available'
        },
        business: {
          targetCustomers: parsed.business?.targetCustomers || [],
          funding: parsed.business?.funding || [],
          revenue: parsed.business?.revenue || 'Unknown',
          founded: parsed.business?.founded || 'Unknown'
        },
        people: {
          executives: parsed.people?.executives || [],
          employeeCount: parsed.people?.employeeCount || 'Unknown'
        },
        technology: {
          platforms: parsed.technology?.platforms || [],
          tools: parsed.technology?.tools || [],
          infrastructure: parsed.technology?.infrastructure || []
        },
        market: {
          targetCustomers: parsed.market?.targetCustomers || [],
          competitors: parsed.market?.competitors || [],
          geographic: parsed.market?.geographic || []
        },
        processedAt: new Date(),
        confidence: 0.8
      };
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      throw new Error(`Failed to parse LLM response: ${error}`);
    }
  }
}

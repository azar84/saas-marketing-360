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
      console.log('🤖 LLM: Starting enrichment data processing...');
      console.log(`🤖 LLM: Website data status: ${data.scrapedData.status}`);
      console.log(`🤖 LLM: Google data available: ${data.googleData ? 'Yes' : 'No'}`);
      
      const prompt = this.constructPrompt(data);
      console.log('🤖 LLM: Processing data with prompt:', prompt.substring(0, 200) + '...');

      // Use the unified LLM model
      const response = await llmModel.call(prompt);
      
      if (!response.content) {
        console.error('🤖 LLM: No content received from LLM service');
        return this.createFallbackResult(data);
      }

      console.log('🤖 LLM: Raw response received, length:', response.content.length);
      const parsedResult = this.parseResponse(response.content);
      
      if (parsedResult) {
        console.log('🤖 LLM: Successfully parsed LLM response');
        return parsedResult;
      } else {
        console.warn('🤖 LLM: Failed to parse LLM response, using fallback');
        return this.createFallbackResult(data);
      }
      
    } catch (error) {
      console.error('🤖 LLM: Error processing data:', error);
      console.log('🤖 LLM: Using fallback result due to error');
      return this.createFallbackResult(data);
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

    // Include consolidated website content (truncated) and per-page snippets to aid categorization
    const contentSnippet = (scrapedData.content || '').replace(/\s+/g, ' ').slice(0, 2000) || 'Not available';
    const pageResults: Array<any> = (scrapedData as any).pageResults || [];
    const pageSnippets = pageResults.slice(0, 5).map((p: any, idx: number) => {
      const title = p.title || 'Untitled';
      const url = p.url || 'Unknown URL';
      const desc = (p.description || p.content || '').toString().replace(/\s+/g, ' ').slice(0, 200);
      return `${idx + 1}. ${title}\n   URL: ${url}\n   Snippet: ${desc}`;
    }).join('\n');

    // Compute occurrence counts for phones and emails across pages
    // Canonicalize phones for occurrence counting: digits-only (treat "+1306..." and "1306..." as same)
    const normalizePhoneForCount = (s: string) => (s || '').replace(/\D/g, '');
    const normalizeEmailForCount = (s: string) => (s || '').toLowerCase();
    const phoneCounts: Record<string, number> = {};
    const emailCounts: Record<string, number> = {};
    pageResults.forEach((p: any) => {
      const phones: string[] = (p.contactInfo?.phones || []).map(normalizePhoneForCount).filter(Boolean);
      const emails: string[] = (p.contactInfo?.emails || []).map(normalizeEmailForCount).filter(Boolean);
      new Set(phones).forEach(ph => { phoneCounts[ph] = (phoneCounts[ph] || 0) + 1; });
      new Set(emails).forEach(em => { emailCounts[em] = (emailCounts[em] || 0) + 1; });
    });
    const topPhones = Object.entries(phoneCounts).sort((a,b) => b[1]-a[1]).slice(0, 10)
      .map(([num, cnt]) => `Phone ${num}: ${cnt} occurrence(s)`).join('\n') || 'No phones found across pages';
    const topEmails = Object.entries(emailCounts).sort((a,b) => b[1]-a[1]).slice(0, 10)
      .map(([em, cnt]) => `Email ${em}: ${cnt} occurrence(s)`).join('\n') || 'No emails found across pages';

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
- Consolidated Content (truncated): ${contentSnippet}
- Key Page Snippets:\n${pageSnippets || 'None'}

Contact Details Occurrence Summary (use to prioritize the most likely official contacts):
Phones (highest frequency first):\n${topPhones}
Emails (highest frequency first):\n${topEmails}

Google Search Results:
${searchResults}

Additional Google Info:
${googleInfo}

 Phone Number Formatting Guidelines (MANDATORY):
- When you output or reference any phone number (e.g., in descriptions or fields), ensure it is formatted in E.164 with the correct country code. Example: +1XXXXXXXXXX for US/Canada, +44XXXXXXXXXX for UK.
- Infer country code from any available hints: postal address text, country mentions, currency/locale, or top‑level domain (.ca -> +1, .us -> +1, .uk -> +44, .au -> +61, .de -> +49, .fr -> +33, .in -> +91).
- If multiple countries are hinted, prefer the country in the company address. If none is available, prefer the country most strongly suggested by the website content/TLD. If still unknown, leave the number as null rather than guessing.
- Remove extensions from the main number. If an extension is clearly present, omit it and only return the core E.164 phone number.

 Contact Prioritization Rule (MANDATORY):
- Prefer phone numbers and emails with higher occurrence counts across pages. If two have equal counts, prefer those appearing on contact/about pages and those surfaced via tel: links.
 - Prefer geographic/local phone numbers over toll-free unless the toll-free is explicitly indicated as the main contact. Treat the following as toll-free prefixes to deprioritize: 800, 833, 844, 855, 866, 877, 888 (with or without +1).

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
    "founded": "Year founded if mentioned",
    "categories": ["One or more industry/category labels (e.g., 'Digital Marketing', 'Plumbing Services')"]
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

  private parseResponse(response: string): EnrichmentProcessorResult | null {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('🤖 LLM: No JSON found in response');
        return null;
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
          founded: parsed.business?.founded || 'Unknown',
          categories: parsed.business?.categories || []
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
      console.error('🤖 LLM: Error parsing LLM response:', error);
      return null;
    }
  }

  private createFallbackResult(data: EnrichmentProcessorData): EnrichmentProcessorResult {
    console.log('🤖 LLM: Creating fallback result from scraped data');
    
    // Extract company name from website data
    const companyName = data.scrapedData.title || 'Unknown Company';
    
    // Try to extract industry from description or keywords
    let industry = 'Technology';
    if (data.scrapedData.description) {
      const desc = data.scrapedData.description.toLowerCase();
      if (desc.includes('healthcare') || desc.includes('medical')) industry = 'Healthcare';
      else if (desc.includes('finance') || desc.includes('banking')) industry = 'Finance';
      else if (desc.includes('retail') || desc.includes('ecommerce')) industry = 'Retail';
      else if (desc.includes('manufacturing') || desc.includes('industrial')) industry = 'Manufacturing';
      else if (desc.includes('education') || desc.includes('learning')) industry = 'Education';
    }

    // Extract technology platforms from scraped data
    const platforms = data.scrapedData.technologies || [];
    
    return {
      company: {
        legalName: companyName,
        dba: '',
        industry: industry,
        description: data.scrapedData.description || 'No description available'
      },
      business: {
        targetCustomers: ['Businesses', 'Consumers'],
        funding: [],
        revenue: 'Unknown',
        founded: 'Unknown'
      },
      people: {
        executives: [],
        employeeCount: 'Unknown'
      },
      technology: {
        platforms: platforms,
        tools: [],
        infrastructure: []
      },
      market: {
        targetCustomers: ['Businesses', 'Consumers'],
        competitors: [],
        geographic: []
      },
      processedAt: new Date(),
      confidence: 0.6 // Lower confidence for fallback
    };
  }
}

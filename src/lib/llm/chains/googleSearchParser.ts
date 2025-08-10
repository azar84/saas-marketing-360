import { z } from 'zod';
import { createChatModel } from '@/lib/llm/core/modelFactory';
import type { ChainDefinition, RunOptions } from '@/lib/llm/core/types';
import { extractJson, normalizeList } from '@/lib/llm/json';

// Input schema for Google search results
export const GoogleSearchInputSchema = z.object({
  searchResults: z.array(z.object({
    title: z.string(),
    link: z.string(),
    snippet: z.string().optional(),
    displayLink: z.string().optional()
  })).min(1),
  industry: z.string().optional(),
  location: z.string().optional()
});

// Output schema for extracted business information
export const GoogleSearchOutputSchema = z.object({
  businesses: z.array(z.object({
    website: z.string(), // Base URL (e.g., "example.com")
    companyName: z.string().optional(),
    isCompanyWebsite: z.boolean(), // True if it's a company website, false if directory/forum
    confidence: z.number().min(0).max(1), // Confidence score 0-1
    extractedFrom: z.string(), // Which field the company name was extracted from
    // Geographic information
    city: z.string().optional(),
    stateProvince: z.string().optional(),
    country: z.string().optional(),
    // Business categories - array of descriptive categories
    categories: z.array(z.string()).optional(), // e.g., ["Fiberglass Installation", "Spray Foam Insulation", "Drywall Services"]
    rawData: z.object({
      title: z.string(),
      link: z.string(),
      snippet: z.string().optional()
    })
  })),
  summary: z.object({
    totalResults: z.number(),
    companyWebsites: z.number(),
    directories: z.number(),
    forms: z.number(),
    extractionQuality: z.number().min(0).max(1)
  }),
  _debug: z.any().optional()
});

function buildPrompt(searchResults: any[], industry?: string, location?: string) {
  const resultsText = searchResults.map((result, index) => 
    `${index + 1}. Title: "${result.title}"
       URL: ${result.link}
       ${result.snippet ? `Snippet: "${result.snippet}"` : ''}`
  ).join('\n\n');

  return `You are a business intelligence analyst specializing in analyzing Google search results to identify company websites and extract business information.

Your task is to analyze the provided Google search results and determine:
1. Which URLs are actual company websites (vs directories, forums, or aggregators)
2. Extract the business name from each company website
3. Extract geographic information (city, state/province, country) when available
4. Identify and categorize the business services/industries in detail
5. Return the base URL (domain) for each company website

Industry Context: ${industry || 'Not specified'}
Location Context: ${location || 'Not specified'}

Google Search Results:
${resultsText}

Analysis Rules:
- Company websites typically have business names in titles, clear service descriptions, and professional domains
- Directories/aggregators often have multiple company listings, generic titles like "Best [Service] in [Location]"
- Forms/lead generation pages usually have URLs with "contact", "quote", "request" or similar patterns
- Extract company names from titles, avoiding generic words like "Best", "Top", "Leading"
- Extract geographic information from titles, snippets, or URLs when available
- For business categories, be specific and descriptive:
  * Instead of "Fiberglass", use "Fiberglass Installation" or "Fiberglass Supply"
  * Instead of "Drywall", use "Drywall Installation" or "Drywall Contracting"
  * Instead of "Spray Foam", use "Spray Foam Insulation" or "Spray Foam Application"
  * Include service type (Installation, Supply, Contracting, Repair, etc.)
  * Separate multiple categories as individual items in the array
- Return base URLs without protocols (e.g., "example.com" not "https://example.com")
- Assign confidence scores based on clarity of business identification

Return ONLY valid JSON with this exact structure:
{
  "businesses": [
    {
      "website": "example.com",
      "companyName": "Example Company Name",
      "isCompanyWebsite": true,
      "confidence": 0.9,
      "extractedFrom": "title",
      "city": "City Name",
      "stateProvince": "State/Province Name",
      "country": "Country Name",
      "categories": ["Specific Service Type 1", "Specific Service Type 2"],
      "rawData": {
        "title": "Original Title",
        "link": "Original URL",
        "snippet": "Original snippet if available"
      }
    }
  ],
  "summary": {
    "totalResults": 10,
    "companyWebsites": 7,
    "directories": 2,
    "forms": 1,
    "extractionQuality": 0.85
  }
}

Focus on accuracy and only include results where you're confident about the classification.`;
}

function validateOutput(output: any): boolean {
  if (!output || typeof output !== 'object') return false;
  if (!Array.isArray(output.businesses)) return false;
  if (!output.summary || typeof output.summary !== 'object') return false;
  
  // Validate each business entry
  for (const business of output.businesses) {
    if (!business.website || typeof business.website !== 'string') return false;
    if (typeof business.isCompanyWebsite !== 'boolean') return false;
    if (typeof business.confidence !== 'number' || business.confidence < 0 || business.confidence > 1) return false;
    if (!business.rawData || typeof business.rawData !== 'object') return false;
  }
  
  return true;
}

function normalizeWebsite(url: string): string {
  try {
    // Remove protocol and www
    let normalized = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    // Remove path and query parameters
    normalized = normalized.split('/')[0];
    // Remove port numbers
    normalized = normalized.split(':')[0];
    return normalized.toLowerCase();
  } catch {
    return url;
  }
}

export const googleSearchParser: ChainDefinition<
  z.infer<typeof GoogleSearchInputSchema>,
  z.infer<typeof GoogleSearchOutputSchema>
> = {
  id: 'google-search-parser',
  description: 'Analyzes Google search results to identify company websites and extract business information',
  inputSchema: GoogleSearchInputSchema,
  outputSchema: GoogleSearchOutputSchema,

  async run(input, options?: RunOptions) {
    const { searchResults, industry, location } = input;
    
    console.log(`🔍 Google Search Parser: Processing ${searchResults.length} search results`);
    console.log(`🏭 Industry: ${industry || 'Not specified'}`);
    console.log(`📍 Location: ${location || 'Not specified'}`);

    const model = createChatModel(options);
    let prompt = buildPrompt(searchResults, industry, location);

    // Ensure the model has the call method
    if (typeof model.call !== 'function') {
      console.error('Model does not have call method:', model);
      throw new Error('Model does not support call method');
    }

    const call = async (content: string) => {
      try {
        const response = await model.call(content);
        return response.content;
      } catch (error) {
        console.error('Model call failed:', error);
        throw new Error(`Model call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    let attempts = 0;
    const maxAttempts = 3;
    let lastError: string = '';

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Attempt ${attempts}/${maxAttempts} to parse Google search results`);

      try {
        const response = await call(prompt);
        console.log('📥 Raw model response received');

        // Try to extract JSON from the response
        const extracted = extractJson(response);
        if (!extracted) {
          throw new Error('No valid JSON found in response');
        }

        console.log('✅ JSON extracted successfully');

        // Validate the extracted data
        if (!validateOutput(extracted)) {
          throw new Error('Extracted data does not match expected schema');
        }

        // Normalize website URLs
        const normalizedBusinesses = extracted.businesses.map((business: any) => ({
          ...business,
          website: normalizeWebsite(business.website)
        }));

        // Remove duplicates based on normalized website
        const uniqueBusinesses = normalizedBusinesses.filter((business: any, index: number, self: any[]) => 
          index === self.findIndex((b: any) => b.website === business.website)
        );

        const finalOutput = {
          ...extracted,
          businesses: uniqueBusinesses,
          summary: {
            ...extracted.summary,
            totalResults: searchResults.length,
            companyWebsites: uniqueBusinesses.filter((b: any) => b.isCompanyWebsite).length,
            directories: uniqueBusinesses.filter((b: any) => !b.isCompanyWebsite).length,
            forms: 0 // We'll count forms separately if needed
          }
        };

        console.log(`✅ Successfully processed ${finalOutput.businesses.length} unique businesses`);
        console.log(`📊 Summary: ${finalOutput.summary.companyWebsites} company websites, ${finalOutput.summary.directories} directories`);

        return finalOutput;

      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.error(`❌ Attempt ${attempts} failed:`, lastError);
        
        if (attempts < maxAttempts) {
          console.log('🔄 Retrying with refined prompt...');
          // Add more specific instructions for the retry
          const retryPrompt = `${prompt}\n\nIMPORTANT: Your previous response was invalid. Please ensure you return ONLY valid JSON with the exact structure specified above. Do not include any explanatory text, markdown formatting, or code fences.`;
          prompt = retryPrompt;
        }
      }
    }

    // If all attempts failed, return a fallback response
    console.error('❌ All attempts failed, returning fallback response');
    
    const fallbackBusinesses = searchResults.map(result => ({
      website: normalizeWebsite(result.link),
      companyName: undefined,
      isCompanyWebsite: false,
      confidence: 0.1,
      extractedFrom: 'fallback',
      rawData: {
        title: result.title,
        link: result.link,
        snippet: result.snippet
      }
    }));

    return {
      businesses: fallbackBusinesses,
      summary: {
        totalResults: searchResults.length,
        companyWebsites: 0,
        directories: searchResults.length,
        forms: 0,
        extractionQuality: 0.1
      },
      _debug: {
        error: lastError,
        attempts: maxAttempts,
        fallback: true
      }
    };
  }
};

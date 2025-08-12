import { prisma } from '@/lib/db';
import { z } from 'zod';

// Input schemas for type safety
export const SearchSessionInputSchema = z.object({
  searchQueries: z.array(z.string()),
  industry: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  country: z.string().optional(),
  apiKey: z.string().optional(),
  searchEngineId: z.string().optional(),
  resultsLimit: z.number().default(10),
  filters: z.any().optional(),
});

export const SearchResultInputSchema = z.object({
  searchSessionId: z.string(),
  position: z.number(),
  title: z.string(),
  url: z.string(),
  displayUrl: z.string(),
  description: z.string().optional(),
  snippet: z.string().optional(),
  cacheId: z.string().optional(),
  query: z.string(),
  date: z.string().optional(),
});

export const LLMProcessingSessionInputSchema = z.object({
  searchSessionId: z.string(),
  totalResults: z.number(),
});

export const LLMProcessingResultInputSchema = z.object({
  searchResultId: z.string(),
  llmProcessingSessionId: z.string(),
  status: z.enum(['pending', 'processing', 'accepted', 'rejected', 'error']),
  confidence: z.number().optional(),
  isCompanyWebsite: z.boolean().optional(),
  companyName: z.string().optional(),
  extractedFrom: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  country: z.string().optional(),
  categories: z.array(z.string()).optional(),
  rejectionReason: z.string().optional(),
  errorMessage: z.string().optional(),
  llmPrompt: z.string().optional(),
  llmResponse: z.string().optional(),
  processingTime: z.number().optional(),
});

export class IndustrySearchTraceability {
  /**
   * Create a new search session and return the session ID
   */
  async createSearchSession(input: z.infer<typeof SearchSessionInputSchema>) {
    try {
      // Mask the API key for security
      const maskedApiKey = input.apiKey ? 
        `${input.apiKey.substring(0, 8)}...${input.apiKey.substring(input.apiKey.length - 4)}` : 
        null;

      // Get the primary query (first non-empty query)
      const primaryQuery = input.searchQueries.find(q => q.trim()) || null;
      
      // Log all queries being processed
      console.log(`🔍 Creating search session with ${input.searchQueries.length} queries:`);
      input.searchQueries.forEach((q, index) => {
        console.log(`   Query ${index + 1}: "${q}"`);
      });

      // Idempotency guard: reuse a very recent session with the same context
      const reuseWindowMs = 60000; // 60s window to coalesce duplicate triggers
      const recentCutoff = new Date(Date.now() - reuseWindowMs);
      const existing = await prisma.searchSession.findFirst({
        where: {
          createdAt: { gte: recentCutoff },
          query: primaryQuery,
          // Match full queries array to avoid near-duplicates creating a new session
          searchQueries: { equals: input.searchQueries },
          city: input.city,
          stateProvince: input.stateProvince,
          country: input.country,
          industry: input.industry,
          resultsLimit: input.resultsLimit ?? 10,
          searchEngineId: input.searchEngineId || undefined,
        },
        orderBy: { createdAt: 'desc' }
      });

      if (existing) {
        console.log(`♻️ Reusing recent search session: ${existing.id} (created ${existing.createdAt.toISOString()})`);
        return existing;
      }

      const session = await prisma.searchSession.create({
        data: {
          query: primaryQuery,
          searchQueries: input.searchQueries,
          industry: input.industry,
          location: input.location,
          city: input.city,
          stateProvince: input.stateProvince,
          country: input.country,
          apiKey: maskedApiKey,
          searchEngineId: input.searchEngineId,
          resultsLimit: input.resultsLimit,
          filters: input.filters,
          status: 'pending',
        },
      });

      console.log(`🔍 Created search session: ${session.id}`);
      console.log(`   Primary query: "${primaryQuery}"`);
      console.log(`   All queries: [${input.searchQueries.map(q => `"${q}"`).join(', ')}]`);
      return session;
    } catch (error) {
      console.error('❌ Failed to create search session:', error);
      throw error;
    }
  }

  /**
   * Update search session with results and mark as completed
   */
  async completeSearchSession(
    sessionId: string, 
    totalResults: number, 
    successfulQueries: number, 
    searchTime: number
  ) {
    try {
      const session = await prisma.searchSession.update({
        where: { id: sessionId },
        data: {
          totalResults,
          successfulQueries,
          searchTime,
          status: 'completed',
          updatedAt: new Date(),
        },
      });

      console.log(`✅ Completed search session: ${sessionId} with ${totalResults} results`);
      return session;
    } catch (error) {
      console.error('❌ Failed to complete search session:', error);
      throw error;
    }
  }

  /**
   * Add search results to a session
   */
  async addSearchResults(
    sessionId: string, 
    results: Array<z.infer<typeof SearchResultInputSchema>>
  ) {
    try {
      const searchResults = await prisma.searchResult.createMany({
        data: results.map(result => ({
          ...result,
          searchSessionId: sessionId,
        })),
      });

      console.log(`📝 Added ${searchResults.count} search results to session: ${sessionId}`);
      return searchResults;
    } catch (error) {
      console.error('❌ Failed to add search results:', error);
      throw error;
    }
  }

  /**
   * Create a new LLM processing session
   */
  async createLLMProcessingSession(input: z.infer<typeof LLMProcessingSessionInputSchema>) {
    try {
      const session = await prisma.lLMProcessingSession.create({
        data: {
          searchSessionId: input.searchSessionId,
          totalResults: input.totalResults,
          status: 'pending',
        },
      });

      console.log(`🤖 Created LLM processing session: ${session.id}`);
      return session;
    } catch (error) {
      console.error('❌ Failed to create LLM processing session:', error);
      throw error;
    }
  }

  /**
   * Process a single search result through LLM and record the result
   */
  async processSearchResult(
    searchResultId: string,
    llmProcessingSessionId: string,
    llmPrompt: string,
    llmResponse: string,
    processingTime: number
  ) {
    try {
      // Parse the LLM response to extract business information
      const parsedResponse = this.parseLLMResponse(llmResponse);
      
      // Create the processing result record
      const result = await prisma.lLMProcessingResult.create({
        data: {
          searchResultId,
          llmProcessingSessionId,
          status: parsedResponse.status,
          confidence: parsedResponse.confidence,
          isCompanyWebsite: parsedResponse.isCompanyWebsite,
          companyName: parsedResponse.companyName,
          website: parsedResponse.website, // Add the website field
          extractedFrom: parsedResponse.extractedFrom,
          city: parsedResponse.city,
          stateProvince: parsedResponse.stateProvince,
          country: parsedResponse.country,
          categories: parsedResponse.categories,
          rejectionReason: parsedResponse.rejectionReason,
          errorMessage: parsedResponse.errorMessage,
          llmPrompt: this.truncateString(llmPrompt, 1000), // Truncate long prompts
          llmResponse: this.truncateString(llmResponse, 2000), // Truncate long responses
          processingTime,
        },
      });

      // Mark the search result as processed
      await prisma.searchResult.update({
        where: { id: searchResultId },
        data: { isProcessed: true },
      });

      console.log(`✅ Processed search result: ${searchResultId} - Status: ${parsedResponse.status}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to process search result:', error);
      
      // Create error record
      await prisma.lLMProcessingResult.create({
        data: {
          searchResultId,
          llmProcessingSessionId,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          llmPrompt: this.truncateString(llmPrompt, 1000),
          llmResponse: this.truncateString(llmResponse, 2000),
          processingTime,
        },
      });

      throw error;
    }
  }

  /**
   * Complete LLM processing session with final statistics
   */
  async completeLLMProcessingSession(
    sessionId: string,
    acceptedCount: number,
    rejectedCount: number,
    errorCount: number,
    extractionQuality: number
  ) {
    try {
      const session = await prisma.lLMProcessingSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          acceptedCount,
          rejectedCount,
          errorCount,
          extractionQuality,
          endTime: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log(`🎯 Completed LLM processing session: ${sessionId}`);
      console.log(`   ✅ Accepted: ${acceptedCount}, ❌ Rejected: ${rejectedCount}, ⚠️ Errors: ${errorCount}`);
      console.log(`   📊 Extraction Quality: ${(extractionQuality * 100).toFixed(1)}%`);
      
      return session;
    } catch (error) {
      console.error('❌ Failed to complete LLM processing session:', error);
      throw error;
    }
  }

  /**
   * Link a processed result to a saved business
   */
  async linkToSavedBusiness(llmResultId: string, businessId: number) {
    try {
      await prisma.lLMProcessingResult.update({
        where: { id: llmResultId },
        data: { savedBusinessId: businessId },
      });

      console.log(`🔗 Linked LLM result ${llmResultId} to business ${businessId}`);
    } catch (error) {
      console.error('❌ Failed to link LLM result to business:', error);
      throw error;
    }
  }

  /**
   * Get full traceability for a search session
   */
  async getSessionTraceability(sessionId: string) {
    try {
      const session = await prisma.searchSession.findUnique({
        where: { id: sessionId },
        include: {
          searchResults: {
            include: {
              llmProcessing: {
                include: {
                  savedBusiness: true,
                },
              },
            },
            orderBy: { position: 'asc' },
          },
          llmProcessing: {
            include: {
              llmResults: {
                include: {
                  searchResult: true,
                  savedBusiness: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return session;
    } catch (error) {
      console.error('❌ Failed to get session traceability:', error);
      throw error;
    }
  }

  /**
   * Get all search sessions with summary statistics
   */
  async getAllSearchSessions() {
    try {
      const sessions = await prisma.searchSession.findMany({
        include: {
          _count: {
            select: {
              searchResults: true,
              llmProcessing: true,
            },
          },
          llmProcessing: {
            select: {
              acceptedCount: true,
              rejectedCount: true,
              errorCount: true,
              extractionQuality: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sessions;
    } catch (error) {
      console.error('❌ Failed to get search sessions:', error);
      throw error;
    }
  }

  /**
   * Parse LLM response to extract business information
   * Can handle both full LLM responses and individual business results
   */
  private parseLLMResponse(response: string): {
    status: 'accepted' | 'rejected' | 'error';
    confidence?: number;
    isCompanyWebsite?: boolean;
    companyName?: string;
    website?: string; // Add the missing website field
    extractedFrom?: string;
    city?: string;
    stateProvince?: string;
    country?: string;
    categories?: string[];
    rejectionReason?: string;
    errorMessage?: string;
  } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                       response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        return {
          status: 'error',
          errorMessage: 'No valid JSON found in LLM response',
        };
      }

      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      
      // Check if this is a full response with businesses array
      if (parsed.businesses && Array.isArray(parsed.businesses) && parsed.businesses.length > 0) {
        // Process the first business in the response
        const business = parsed.businesses[0];
        
        if (!business.isCompanyWebsite) {
          return {
            status: 'rejected',
            rejectionReason: 'LLM determined this is not a company website',
          };
        }

        return {
          status: 'accepted',
          confidence: business.confidence,
          isCompanyWebsite: business.isCompanyWebsite,
          companyName: business.companyName,
          website: business.website, // Add the website field
          extractedFrom: business.extractedFrom,
          city: business.city,
          stateProvince: business.stateProvince,
          country: business.country,
          categories: business.categories,
        };
      }
      
      // Check if this is an individual business result
      if (parsed.isCompanyWebsite !== undefined) {
        if (!parsed.isCompanyWebsite) {
          return {
            status: 'rejected',
            rejectionReason: 'LLM determined this is not a company website',
          };
        }

        return {
          status: 'accepted',
          confidence: parsed.confidence,
          isCompanyWebsite: parsed.isCompanyWebsite,
          companyName: parsed.companyName,
          website: parsed.website, // Add the website field
          extractedFrom: parsed.extractedFrom,
          city: parsed.city,
          stateProvince: parsed.stateProvince,
          country: parsed.country,
          categories: parsed.categories,
        };
      }
      
      // If we can't parse the response structure
      return {
        status: 'error',
        errorMessage: 'Unexpected response structure from LLM',
      };
    } catch (error) {
      return {
        status: 'error',
        errorMessage: `Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Truncate long strings to prevent database overflow
   */
  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }
}

// Export singleton instance
export const industrySearchTraceability = new IndustrySearchTraceability();

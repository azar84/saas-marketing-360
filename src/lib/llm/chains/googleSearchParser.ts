import { z } from 'zod';
import { llmModel } from '@/lib/llm/model';
import type { ChainDefinition, RunOptions } from '@/lib/llm/core/types';
import { extractJson, normalizeList } from '@/lib/llm/json';
import * as fs from 'fs';
import * as path from 'path';
import { industrySearchTraceability } from '@/lib/industrySearchTraceability';
import { prisma } from '@/lib/db';

// Function to log detailed processing to file
function logToFile(logData: any, filename: string = 'google-search-parser-debug.log') {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logPath = path.join(logDir, filename);
    const timestamp = new Date().toISOString();
    const logEntry = `\n\n=== ${timestamp} ===\n${JSON.stringify(logData, null, 2)}\n`;
    
    fs.appendFileSync(logPath, logEntry);
    console.log(`📝 Logged to file: ${logPath}`);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

// Input schema for Google search results
export const GoogleSearchInputSchema = z.object({
  searchResults: z.array(z.object({
    title: z.string(),
    link: z.string(),
    snippet: z.string().optional(),
    displayLink: z.string().optional()
  })).min(1),
  industry: z.string().optional(),
  location: z.string().optional(),
  // Add traceability options
  enableTraceability: z.boolean().optional().default(true),
  llmProcessingSessionId: z.string().optional(),
  // Add search session ID to link results
  searchSessionId: z.string().optional(),
  // Add search result IDs for proper traceability
  searchResultIds: z.array(z.string()).optional(),
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

  async run(input: z.infer<typeof GoogleSearchInputSchema>): Promise<z.infer<typeof GoogleSearchOutputSchema>> {
    const { searchResults, industry, location, enableTraceability = true, llmProcessingSessionId, searchSessionId, searchResultIds } = input;
    
    console.log(`🔍 Google Search Parser: Processing ${searchResults.length} search results`);
    console.log(`🏭 Industry: ${industry || 'Not specified'}`);
    console.log(`📍 Location: ${location || 'Not specified'}`);
    console.log(`🔍 Traceability: ${enableTraceability ? 'Enabled' : 'Disabled'}`);
    
    // Debug tracking
    const debugStats = {
      totalProcessed: 0,
      accepted: 0,
      rejected: 0,
      confidenceLevels: [] as number[],
      rejectionReasons: {} as Record<string, number>,
      processingDetails: [] as Array<{
        url: string;
        title: string;
        status: 'accepted' | 'rejected' | 'error';
        confidence?: number;
        reason?: string;
        extractedData?: any;
      }>
    };
    
    // Log all URLs being processed
    console.log(`\n📋 INPUT SEARCH RESULTS (${searchResults.length} total):`);
    console.log(`   ==========================================`);
    
    const inputLog = {
      timestamp: new Date().toISOString(),
      totalSearchResults: searchResults.length,
      industry: industry,
      location: location,
      searchResults: searchResults.map((result, index) => ({
        index: index + 1,
        url: result.link,
        title: result.title || 'N/A',
        snippet: result.snippet || 'N/A',
        displayLink: result.displayLink || 'N/A'
      }))
    };
    
    searchResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.link}`);
      console.log(`      Title: ${result.title || 'N/A'}`);
      if (result.snippet) {
        console.log(`      Snippet: ${result.snippet.substring(0, 100)}${result.snippet.length > 100 ? '...' : ''}`);
      }
    });
    
    // Log input to file
    logToFile(inputLog, 'google-search-parser-input.log');

    let prompt = buildPrompt(searchResults, industry, location);

    const call = async (content: string) => {
      try {
        const response = await llmModel.call(content);
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
        
        // Log the prompt and response for debugging
        const llmDebugLog = {
          timestamp: new Date().toISOString(),
          prompt: prompt,
          rawResponse: response,
          searchResultsCount: searchResults.length,
          industry: industry,
          location: location
        };
        
        console.log(`\n🤖 LLM DEBUG INFO:`);
        console.log(`   📤 Prompt Length: ${prompt.length} characters`);
        console.log(`   📥 Response Length: ${response.length} characters`);
        console.log(`   🔍 Search Results Sent: ${searchResults.length}`);
        console.log(`   🏭 Industry Context: ${industry || 'None'}`);
        console.log(`   📍 Location Context: ${location || 'None'}`);
        
        // Log to file
        logToFile(llmDebugLog, 'google-search-parser-llm-debug.log');

        // Try to extract JSON from the response
        const extracted = extractJson(response);
        if (!extracted) {
          console.log('⚠️ Failed to extract JSON from batch response, continuing with individual processing only');
          // Continue with individual processing even if batch fails
        } else {
          // extracted is already a parsed object, no need to parse again
          const parsed = extracted;
          
          // Only validate if we have a valid batch response
          if (validateOutput(parsed)) {
            console.log('✅ Batch processing successful, but using individual processing for traceability');
          } else {
            console.log('⚠️ Batch response structure invalid, continuing with individual processing only');
          }
        }

        // Create LLM processing session if traceability is enabled and no session ID provided
        let finalLLMProcessingSessionId = llmProcessingSessionId;
        if (enableTraceability && !finalLLMProcessingSessionId) {
          try {
            const llmSession = await industrySearchTraceability.createLLMProcessingSession({
              searchSessionId: searchSessionId || 'standalone',
              totalResults: searchResults.length,
            });
            finalLLMProcessingSessionId = llmSession.id;
            console.log(`🤖 Created LLM processing session: ${finalLLMProcessingSessionId}`);
          } catch (error) {
            console.error('⚠️ Failed to create LLM processing session, continuing without traceability:', error);
            // Don't disable traceability completely - continue with individual processing
          }
        }

        // Process each search result individually for better traceability
        const processedBusinesses = [];
        const processingDetails = [];
        const traceabilityResults = []; // Store traceability results for later linking
        
        for (let i = 0; i < searchResults.length; i++) {
          try {
            const searchResult = searchResults[i];
            const startTime = Date.now();
            console.log(`   🔍 Processing result ${i + 1}/${searchResults.length}: ${searchResult.link}`);
            
            // Create individual prompt for this search result
            const individualPrompt = `You are a business intelligence analyst specializing in analyzing Google search results to identify company websites and extract business information.

Your task is to analyze the provided Google search result and determine:
1. Is this URL an actual company website (vs directory, forum, or aggregator)?
2. Extract the business name from the company website
3. Extract geographic information (city, state/province, country) when available
4. Identify and categorize the business services/industries in detail
5. Return the base URL (domain) for the company website

Industry Context: ${industry || 'Not specified'}
Location Context: ${location || 'Not specified'}

Google Search Result:
Title: "${searchResult.title}"
URL: ${searchResult.link}
Snippet: "${searchResult.snippet || ''}"

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

Focus on accuracy and only include results where you're confident about the classification.`;

            // Call LLM for individual result
            const individualResponse = await call(individualPrompt);
            
            // Store the raw response for traceability BEFORE processing
            const rawIndividualResponse = individualResponse;
            
            // Extract JSON from response
            const individualExtracted = extractJson(individualResponse);
            if (!individualExtracted) {
              console.log(`   ❌ Failed to extract JSON from individual response ${i + 1}`);
              debugStats.totalProcessed++;
              continue;
            }

            // Validate individual business structure
            if (!individualExtracted.website || typeof individualExtracted.isCompanyWebsite !== 'boolean') {
              console.log(`   ❌ Invalid business structure for result ${i + 1}`);
              debugStats.totalProcessed++;
              continue;
            }

            // Process the extracted business data
            const business = {
              website: individualExtracted.website,
              companyName: individualExtracted.companyName || 'Unknown',
              isCompanyWebsite: individualExtracted.isCompanyWebsite,
              confidence: individualExtracted.confidence || 0.5,
              extractedFrom: individualExtracted.extractedFrom || 'title',
              city: individualExtracted.city || null,
              stateProvince: individualExtracted.stateProvince || null,
              country: individualExtracted.country || null,
              categories: individualExtracted.categories || [],
              rawData: individualExtracted.rawData || {
                title: searchResult.title,
                link: searchResult.link,
                snippet: searchResult.snippet || ''
              },
            };

            processedBusinesses.push(business);
            const processingTime = (Date.now() - startTime) / 1000;
            
            // Record processing details
            processingDetails.push({
              url: searchResult.link,
              processingTime,
              status: business.isCompanyWebsite ? 'accepted' : 'rejected',
              confidence: business.confidence,
            });

            // Update debug statistics
            debugStats.totalProcessed++;
            if (business.isCompanyWebsite) {
              debugStats.accepted++;
            } else {
              debugStats.rejected++;
            }

            // Record in traceability system if enabled
            if (enableTraceability && finalLLMProcessingSessionId) {
              try {
                // Use searchResultIds if provided, otherwise create a placeholder
                const searchResultId = searchResultIds && searchResultIds.length > i ? searchResultIds[i] : `placeholder_${i}_${Date.now()}`;
                
                const traceabilityResult = await industrySearchTraceability.processSearchResult(
                  searchResultId,
                  finalLLMProcessingSessionId,
                  individualPrompt,
                  rawIndividualResponse, // Pass the raw LLM response
                  processingTime
                );
                
                // Store traceability result for later business linking
                traceabilityResults.push({
                  traceabilityId: traceabilityResult.id,
                  website: business.website,
                  isCompanyWebsite: business.isCompanyWebsite,
                  confidence: business.confidence
                });
                
                console.log(`   📝 Recorded in traceability system with ID: ${searchResultId}`);
              } catch (traceabilityError) {
                console.error(`   ⚠️ Failed to record in traceability system:`, traceabilityError);
              }
            }
            
            console.log(`   ✅ Processed: ${business.companyName || 'Unknown'} (${business.isCompanyWebsite ? 'Company' : 'Not Company'}) - Confidence: ${business.confidence}`);
          } catch (error) {
            console.error(`   ❌ Error processing result ${i + 1}:`, error);
            debugStats.totalProcessed++;
            // Continue with next result
          }
        }

        // Remove duplicates based on website
        const uniqueBusinesses = processedBusinesses.filter((business: any, index: number, self: any[]) => 
          index === self.findIndex((b: any) => b.website === business.website)
        );

        // Calculate summary statistics
        const companyWebsites = uniqueBusinesses.filter((b: any) => b.isCompanyWebsite).length;
        const directories = uniqueBusinesses.filter((b: any) => !b.isCompanyWebsite).length;
        const extractionQuality = debugStats.totalProcessed > 0 ? 
          debugStats.accepted / debugStats.totalProcessed : 0;

        // Log final summary
        console.log(`\n🎯 FINAL BUSINESS EXTRACTION SUMMARY:`);
        console.log(`   ==========================================`);
        console.log(`   📥 INPUT: ${searchResults.length} Google search results`);
        console.log(`   🔍 PROCESSED: ${debugStats.totalProcessed} businesses by LLM`);
        console.log(`   ✅ ACCEPTED: ${debugStats.accepted} businesses (${((debugStats.accepted / debugStats.totalProcessed) * 100).toFixed(1)}%)`);
        console.log(`   ❌ REJECTED: ${debugStats.rejected} businesses (${((debugStats.rejected / debugStats.totalProcessed) * 100).toFixed(1)}%)`);
        console.log(`   🔄 AFTER DEDUPLICATION: ${uniqueBusinesses.length} unique businesses`);
        console.log(`   🏢 FINAL COMPANY WEBSITES: ${companyWebsites}`);
        console.log(`   📁 FINAL DIRECTORIES: ${directories}`);
        console.log(`   ==========================================`);

        // Log detailed processing to file
        const detailedLog = {
          timestamp: new Date().toISOString(),
          totalSearchResults: searchResults.length,
          industry: industry,
          location: location,
          processingDetails: processingDetails,
          finalSummary: {
            totalProcessed: debugStats.totalProcessed,
            accepted: debugStats.accepted,
            rejected: debugStats.rejected,
            uniqueBusinesses: uniqueBusinesses.length,
            companyWebsites,
            directories,
            extractionQuality
          }
        };
        
        logToFile(detailedLog, 'google-search-parser-detailed.log');

        // Complete LLM processing session if we created one
        if (enableTraceability && finalLLMProcessingSessionId && !llmProcessingSessionId) {
          try {
            const acceptedCount = debugStats.accepted;
            const rejectedCount = debugStats.rejected;
            const errorCount = 0; // We're not tracking errors in this context
            const extractionQuality = debugStats.totalProcessed > 0 ? 
              debugStats.accepted / debugStats.totalProcessed : 0;

            await industrySearchTraceability.completeLLMProcessingSession(
              finalLLMProcessingSessionId,
              acceptedCount,
              rejectedCount,
              errorCount,
              extractionQuality
            );

            console.log(`🎯 Completed LLM processing session: ${finalLLMProcessingSessionId}`);
          } catch (error) {
            console.error('⚠️ Failed to complete LLM processing session:', error);
          }
        }

        // Return the processed results
        const finalOutput = {
          businesses: uniqueBusinesses,
          summary: {
            totalResults: searchResults.length,
            companyWebsites,
            directories,
            forms: 0, // Not implemented yet
            extractionQuality
          },
          _debug: {
            processingStats: debugStats,
            processingDetails: processingDetails
          }
        };

        return finalOutput;

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Attempt ${attempts} failed:`, lastError);
        
        if (attempts === maxAttempts) {
          throw new Error(`Failed to parse Google search results after ${maxAttempts} attempts. Last error: ${lastError}`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    throw new Error(`Failed to parse Google search results after ${maxAttempts} attempts`);
  }
};

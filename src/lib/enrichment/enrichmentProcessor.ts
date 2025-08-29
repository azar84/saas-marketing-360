/**
 * Centralized Enrichment Processing Service
 * 
 * This service consolidates all enrichment result processing logic that was previously
 * duplicated across multiple components and services. It provides a single, consistent
 * interface for processing enrichment results from various sources.
 */

import { BusinessDirectoryUpdater, type EnrichmentResult } from './businessDirectoryUpdater';

export interface EnrichmentProcessingResult {
  success: boolean;
  businessId?: number;
  created?: boolean;
  updated?: boolean;
  error?: string;
  message?: string;
}

export interface EnrichmentJobData {
  jobId: string;
  websiteUrl?: string;
  result: any;
  metadata?: any;
}

export class EnrichmentProcessor {
  /**
   * Process an enrichment result and save it to the business directory
   * This is the main entry point that all other components should use
   */
  static async processEnrichmentResult(
    jobData: EnrichmentJobData
  ): Promise<EnrichmentProcessingResult> {
    try {
      console.log(`🔄 [EnrichmentProcessor] Processing enrichment result for job ${jobData.jobId}`);
      console.log(`🔍 [EnrichmentProcessor] Input jobData:`, {
        jobId: jobData.jobId,
        websiteUrl: jobData.websiteUrl,
        hasResult: !!jobData.result,
        resultKeys: jobData.result ? Object.keys(jobData.result) : [],
        hasMetadata: !!jobData.metadata
      });
      
      // Normalize the enrichment result structure
      const normalizedResult = this.normalizeEnrichmentResult(jobData);
      
      if (!normalizedResult) {
        console.log(`❌ [EnrichmentProcessor] Failed to normalize enrichment result for job ${jobData.jobId}`);
        return {
          success: false,
          error: 'Failed to normalize enrichment result structure'
        };
      }

      // Process the normalized result using the BusinessDirectoryUpdater
      const result = await BusinessDirectoryUpdater.processEnrichmentResult(normalizedResult);

      if (result.success) {
        console.log(`✅ [EnrichmentProcessor] Successfully processed enrichment result for job ${jobData.jobId}:`, {
          businessId: result.businessId,
          created: result.created,
          updated: result.updated
        });

        return {
          success: true,
          businessId: result.businessId,
          created: result.created,
          updated: result.updated,
          message: result.created 
            ? 'New business created in directory' 
            : 'Existing business updated in directory'
        };
      } else {
        console.error(`❌ [EnrichmentProcessor] Failed to process enrichment result for job ${jobData.jobId}:`, result.error);
        return {
          success: false,
          error: result.error || 'Unknown processing error'
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ [EnrichmentProcessor] Error processing enrichment result for job ${jobData.jobId}:`, error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Normalize enrichment result structure from various sources
   * Handles different API response formats and data structures
   */
  private static normalizeEnrichmentResult(jobData: EnrichmentJobData): EnrichmentResult | null {
    try {
      const { result, websiteUrl, metadata } = jobData;
      
      console.log(`🔍 [EnrichmentProcessor] Normalizing result structure:`, {
        hasResult: !!result,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : [],
        websiteUrl,
        hasMetadata: !!metadata
      });
      
      // Debug the exact structure
      if (result) {
        console.log(`🔍 [EnrichmentProcessor] Result structure details:`, {
          hasData: !!result.data,
          dataKeys: result.data ? Object.keys(result.data) : [],
          hasDataData: !!result.data?.data,
          dataDataKeys: result.data?.data ? Object.keys(result.data.data) : [],
          hasCompany: !!result.data?.data?.company,
          hasContact: !!result.data?.data?.contact
        });
      }
      
      // Handle different result structures
      let normalizedData: any;
      let baseUrl: string;

      // Case 1: Direct result with data.company and data.contact
      if (result?.data?.company && result?.data?.contact) {
        console.log(`✅ [EnrichmentProcessor] Using Case 1: data.company + data.contact`);
        normalizedData = result.data;
        baseUrl = result.metadata?.baseUrl || websiteUrl || 'unknown';
      }
      // Case 2: Result is the data directly (company and contact at root level)
      else if (result?.company && result?.contact) {
        console.log(`✅ [EnrichmentProcessor] Using Case 2: company + contact at root`);
        normalizedData = result;
        baseUrl = result.metadata?.baseUrl || websiteUrl || 'unknown';
      }
      // Case 3: Nested structure (result.data.data.company) - This is your case!
      else if (result?.data?.data?.company && result?.data?.data?.contact) {
        console.log(`✅ [EnrichmentProcessor] Using Case 3: data.data.company + data.data.contact`);
        normalizedData = result.data.data;
        baseUrl = result.data.metadata?.baseUrl || websiteUrl || 'unknown';
      }
      // Case 3.5: Scheduler-wrapped structure (result.data.data.company with input field)
      else if (result?.data?.data?.company && result?.data?.data?.contact && result?.data?.input) {
        console.log(`✅ [EnrichmentProcessor] Using Case 3.5: scheduler-wrapped data.data.company + data.data.contact`);
        normalizedData = result.data.data;
        baseUrl = result.data.input?.websiteUrl || result.data.metadata?.baseUrl || websiteUrl || 'unknown';
      }
      // Case 4: Legacy format with finalResult
      else if (result?.data?.finalResult?.company && result?.data?.finalResult?.contact) {
        console.log(`✅ [EnrichmentProcessor] Using Case 4: data.finalResult.company + data.finalResult.contact`);
        normalizedData = result.data.finalResult;
        baseUrl = result.data.metadata?.baseUrl || websiteUrl || 'unknown';
      }
      else {
        console.warn(`⚠️ [EnrichmentProcessor] Unrecognized result structure for job ${jobData.jobId}:`, {
          hasDataCompany: !!result?.data?.company,
          hasDataContact: !!result?.data?.contact,
          hasCompany: !!result?.company,
          hasContact: !!result?.contact,
          hasNestedData: !!result?.data?.data?.company,
          hasFinalResult: !!result?.data?.finalResult?.company
        });
        return null;
      }

      // No validation here - let BusinessDirectoryUpdater handle the business logic
      // It will check isBusiness and skip non-business websites appropriately

      // Create normalized enrichment result structure
      const normalizedResult: EnrichmentResult = {
        data: {
          input: { 
            websiteUrl: baseUrl,
            options: {
              basicMode: true,
              maxHtmlLength: 50000,
              includeIntelligence: false,
              includeStaffEnrichment: false,
              includeExternalEnrichment: false,
              includeTechnologyExtraction: true
            }
          },
          // Copy all the normalized data
          ...normalizedData,
          // Add missing fields that our interface expects
          scrapedPages: normalizedData.scrapedPages || [],
          staffEnrichment: normalizedData.staffEnrichment || null,
          websiteAnalysis: normalizedData.websiteAnalysis || null,
          scrapingStrategy: normalizedData.scrapingStrategy || null,
          aggregatedContent: normalizedData.aggregatedContent || '',
          contactInformation: normalizedData.contactInformation || null
        },
        worker: 'enrichment-processor',
        success: true,
        metadata: {
          mode: 'basic',
          type: 'basic_enrichment',
          timestamp: new Date().toISOString()
        },
        processingTime: 0
      };

      console.log(`✅ [EnrichmentProcessor] Successfully normalized enrichment result for job ${jobData.jobId}`);
      return normalizedResult;

    } catch (error) {
      console.error(`❌ [EnrichmentProcessor] Error normalizing enrichment result for job ${jobData.jobId}:`, error);
      return null;
    }
  }

  /**
   * Check if an enrichment result is valid and can be processed
   */
  static isValidEnrichmentResult(result: any): boolean {
    if (!result) return false;
    
    // Check various possible structures
    return !!(
      (result?.data?.company && result?.data?.contact) ||
      (result?.company && result?.contact) ||
      (result?.data?.data?.company && result?.data?.data?.contact) ||
      (result?.data?.data?.company && result?.data?.data?.contact && result?.data?.input) ||
      (result?.data?.finalResult?.company && result?.data?.finalResult?.contact)
    );
  }

  /**
   * Extract website URL from enrichment result
   */
  static extractWebsiteUrl(result: any, fallback?: string): string {
    if (result?.data?.metadata?.baseUrl) return result.data.metadata.baseUrl;
    if (result?.data?.baseUrl) return result.data.baseUrl;
    if (result?.metadata?.baseUrl) return result.metadata.baseUrl;
    if (result?.website) return result.website;
    if (result?.data?.website) return result.data.website;
    return fallback || 'unknown';
  }
}

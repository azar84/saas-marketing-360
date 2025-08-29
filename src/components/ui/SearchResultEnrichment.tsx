'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Check, Zap, CheckCircle, X } from 'lucide-react';
import { useNotificationContext } from '@/components/providers/NotificationProvider';

interface SearchResult {
  id?: string;
  url: string;
  title: string;
  displayUrl?: string;
  description?: string;
  snippet?: string;
  position?: number;
  query?: string;
  isProcessed?: boolean;
  createdAt?: string;
  date?: string;
}

interface SearchResultEnrichmentProps {
  searchResults: SearchResult[];
  selectedResults?: Set<string>;
  onSelectionChange?: (selectedResults: Set<string>) => void;
  onEnrichmentSubmitted?: (submittedCount: number) => void;
  className?: string;
  showSelectAll?: boolean;
  showEnrichmentButton?: boolean;
  showSelectionCount?: boolean;
}

const SearchResultEnrichment: React.FC<SearchResultEnrichmentProps> = ({
  searchResults,
  selectedResults: externalSelectedResults,
  onSelectionChange,
  onEnrichmentSubmitted,
  className = '',
  showSelectAll = true,
  showEnrichmentButton = true,
  showSelectionCount = true
}) => {
  const [internalSelectedResults, setInternalSelectedResults] = useState<Set<string>>(new Set());
  const [isSubmittingEnrichment, setIsSubmittingEnrichment] = useState(false);
  const [recentlySubmittedCount, setRecentlySubmittedCount] = useState(0);
  const { addNotification } = useNotificationContext();

  // Use external selection state if provided, otherwise use internal
  const selectedResults = externalSelectedResults || internalSelectedResults;
  const setSelectedResults = onSelectionChange || setInternalSelectedResults;

  // Helper function to normalize website URLs
  const normalizeWebsite = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return url;
    }
  };

  // Get selected URLs for enrichment
  const getSelectedResultsForEnrichment = useCallback((): string[] => {
    return Array.from(selectedResults)
      .map(url => normalizeWebsite(url));
  }, [selectedResults]);

  // Submit enrichment jobs for selected URLs
  const submitEnrichmentJobsForUrls = async (websiteUrls: string[]) => {
    if (!websiteUrls || websiteUrls.length === 0) {
      console.log('🔍 No URLs to submit for enrichment');
      return;
    }
    
    console.log('🚀 Starting enrichment job submission for URLs:', websiteUrls);
    
    try {
      const unique = Array.from(new Set(websiteUrls.filter(Boolean)));
      console.log('🔗 Unique URLs for enrichment:', unique);
      
      const results = await Promise.all(
        unique.map(async (websiteUrl) => {
          console.log(`📤 Submitting enrichment job for: ${websiteUrl}`);
          
          try {
            const response = await fetch('/api/admin/jobs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'basic-enrichment',
                data: {
                  websiteUrl,
                  options: {
                    includeStaffEnrichment: false,
                    includeExternalEnrichment: false,
                    includeIntelligence: false,
                    includeTechnologyExtraction: true,
                    basicMode: true,
                    maxHtmlLength: 50000
                  }
                }
              })
            });
            
            const result = await response.json();
            console.log(`📥 Response for ${websiteUrl}:`, result);
            
            if (!response.ok) {
              console.error(`❌ Failed to submit job for ${websiteUrl}:`, result);
              return { error: result, websiteUrl };
            } else {
              console.log(`✅ Successfully submitted job for ${websiteUrl}:`, result.job?.id);
              return { success: result, websiteUrl };
            }
          } catch (error) {
            console.error(`❌ Network error for ${websiteUrl}:`, error);
            return { error, websiteUrl };
          }
        })
      );

      // Count successful vs failed submissions
      const successfulJobs = results.filter(r => r.success);
      const failedJobs = results.filter(r => r.error);
      
      console.log(`📊 Job submission summary:`, {
        total: unique.length,
        successful: successfulJobs.length,
        failed: failedJobs.length,
        successRate: `${((successfulJobs.length / unique.length) * 100).toFixed(1)}%`
      });

      // Update recently submitted count
      setRecentlySubmittedCount(successfulJobs.length);

      // Clear selection after successful submission
      if (successfulJobs.length > 0) {
        setSelectedResults(new Set());
      }

      // Call callback if provided
      if (onEnrichmentSubmitted) {
        onEnrichmentSubmitted(successfulJobs.length);
      }

      addNotification({
        type: 'success',
        title: 'Enrichment Jobs Submitted',
        message: `Submitted ${successfulJobs.length} website${successfulJobs.length === 1 ? '' : 's'} for enrichment. ${failedJobs.length > 0 ? `(${failedJobs.length} failed)` : ''}`,
      });

      // Reset count after 5 seconds
      setTimeout(() => setRecentlySubmittedCount(0), 5000);

    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Enrichment Submission Failed',
        message: err instanceof Error ? err.message : 'Unknown error submitting enrichment jobs.'
      });
    }
  };

  // Handle enrichment submission
  const handleEnrichmentSubmission = async () => {
    if (selectedResults.size === 0) {
      addNotification({
        type: 'warning',
        title: 'No Results Selected',
        message: 'Please select some search results to submit for enrichment.',
      });
      return;
    }

    setIsSubmittingEnrichment(true);
    
    try {
      const websitesToEnrich = getSelectedResultsForEnrichment();
      console.log(`🚀 Submitting ${websitesToEnrich.length} selected URLs for enrichment`);
      await submitEnrichmentJobsForUrls(websitesToEnrich);
    } catch (error) {
      console.error('❌ Error preparing enrichment jobs:', error);
      addNotification({
        type: 'error',
        title: 'Enrichment Error',
        message: 'Failed to submit enrichment jobs. Please try again.',
      });
    } finally {
      setIsSubmittingEnrichment(false);
    }
  };

  // Selection handlers
  const toggleResultSelection = (url: string) => {
    const newSelection = new Set(selectedResults);
    if (newSelection.has(url)) {
      newSelection.delete(url);
    } else {
      newSelection.add(url);
    }
    setSelectedResults(newSelection);
  };

  const selectAllResults = () => {
    const allUrls = searchResults.map(result => result.url);
    setSelectedResults(new Set(allUrls));
  };

  const deselectAllResults = () => {
    setSelectedResults(new Set());
  };

  // Check if all results are selected
  const allSelected = searchResults.length > 0 && selectedResults.size === searchResults.length;
  const someSelected = selectedResults.size > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selection Controls */}
      {showSelectAll && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllResults}
              disabled={allSelected}
            >
              Select All ({searchResults.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deselectAllResults}
              disabled={!someSelected}
            >
              Deselect All
            </Button>
          </div>
          
          {showSelectionCount && (
            <div className="text-sm text-gray-600">
              {selectedResults.size} of {searchResults.length} selected
            </div>
          )}
        </div>
      )}

      {/* Enrichment Button */}
      {showEnrichmentButton && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleEnrichmentSubmission}
            disabled={searchResults.length === 0 || selectedResults.size === 0 || isSubmittingEnrichment}
            className="flex items-center gap-2"
          >
            {isSubmittingEnrichment ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Submitting Jobs...
              </>
            ) : recentlySubmittedCount > 0 ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Submitted {recentlySubmittedCount} Job{recentlySubmittedCount === 1 ? '' : 's'}
              </>
            ) : selectedResults.size > 0 ? (
              <>
                <Zap className="h-4 w-4" />
                Submit for Enrichment ({selectedResults.size})
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Submit for Enrichment
                <span className="text-xs ml-1">(Select results first)</span>
              </>
            )}
          </Button>

          {someSelected && (
            <Button
              variant="outline"
              size="sm"
              onClick={deselectAllResults}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Selection
            </Button>
          )}
        </div>
      )}

      {/* Selection Instructions */}
      {searchResults.length > 0 && !someSelected && (
        <div className="text-sm text-gray-600 text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          💡 Select search results above to submit them for enrichment
        </div>
      )}
    </div>
  );
};

export default SearchResultEnrichment;

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGlobalJobStore } from '@/lib/jobs/globalJobState';

export function useJobPolling() {
  const { jobs, updateJob, getJobsByStatus } = useGlobalJobStore();
  
  // Use ref to access current jobs state in polling
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const syncKeywordsToIndustry = async (industryName: string, result: any) => {
    try {
      const keywords = extractKeywordsFromResult(result);
      if (keywords.length === 0) {
        console.log('No keywords found in result to sync');
        return;
      }

      console.log(`🔄 Syncing ${keywords.length} keywords to industry: ${industryName}`);
      
      const response = await fetch('/api/admin/industries/keywords/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryName,
          keywords
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Keywords synced successfully:', data.message);
      } else {
        console.error('❌ Failed to sync keywords:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error syncing keywords:', error);
    }
  };

  const processEnrichmentResult = async (enrichmentResult: any, jobId: string) => {
    try {
      console.log(`🔄 Processing enrichment result for job ${jobId}`);
      
      const response = await fetch('/api/admin/enrichment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrichmentResult,
          jobId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Enrichment result processed successfully for job ${jobId}:`, {
          businessId: data.businessId,
          created: data.created,
          updated: data.updated
        });
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to process enrichment result for job ${jobId}:`, errorText);
      }
    } catch (error) {
      console.error(`❌ Error processing enrichment result for job ${jobId}:`, error);
    }
  };

  const extractKeywordsFromResult = (result: any): string[] => {
    if (!result) return [];
    
    const extractTerms = (obj: any): string[] => {
      if (Array.isArray(obj)) return obj;
      if (typeof obj === 'string') return [obj];
      if (typeof obj === 'object' && obj !== null) {
        if (obj.keywords) return extractTerms(obj.keywords);
        if (obj.search_terms) return extractTerms(obj.search_terms);
        if (obj.data) return extractTerms(obj.data);
        if (obj.result) return extractTerms(obj.result);
        if (obj.payload) return extractTerms(obj.payload);
        return [];
      }
      return [];
    };

    return extractTerms(result);
  };

  const pollIncompleteJobs = useCallback(async () => {
    // Get fresh jobs from global state using the hook's jobs parameter
    const currentJobs = jobs;
    console.log(`📊 Current jobs in global state: ${currentJobs.length} total`);
    
    // Only poll jobs that are not completed
    const incompleteJobs = currentJobs.filter(job => 
      job.status !== 'completed' && job.status !== 'failed'
    );
    
    if (incompleteJobs.length === 0) {
      console.log(`✅ No incomplete jobs to poll`);
      return;
    }
    
    console.log(`🔄 Polling ${incompleteJobs.length} incomplete jobs:`, incompleteJobs.map(j => ({ id: j.id, status: j.status, industry: j.metadata?.industry })));
    
    for (const job of incompleteJobs) {
      try {
        if (job.metadata?.pollUrl) {
          try {
            const response = await fetch('/api/admin/jobs/poll-external', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                jobId: job.id, 
                pollUrl: job.metadata.pollUrl 
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // Generic status update logic for ANY job type
              const externalData = data.data; // Extract the actual external API response
              
              if (externalData.success && (externalData.status === 'completed' || externalData.result)) {
                console.log(`✅ Job ${job.id} completed!`);
                console.log(`📊 Updating global state for job ${job.id} to completed`);
                
                // Update global state immediately
                updateJob(job.id, {
                  status: 'completed',
                  progress: 100,
                  result: externalData.result,
                  completedAt: new Date().toISOString()
                });
                
                console.log(`✅ Global state updated for job ${job.id}`);
                
                // Sync keywords to industry if this is a keyword generation job
                if (job.type === 'keyword-generation' && externalData.result) {
                  await syncKeywordsToIndustry(job.metadata?.industry, externalData.result);
                }
                
                // Process enrichment result and save to business directory if this is a basic enrichment job
                if (job.type === 'basic-enrichment' && externalData.result) {
                  await processEnrichmentResult(externalData.result, job.id);
                }
              } else if (externalData.status && externalData.status !== job.status) {
                console.log(`🔄 Job ${job.id} status changed from ${job.status} to ${externalData.status}`);
                
                // Update status and progress
                updateJob(job.id, {
                  status: externalData.status,
                  progress: externalData.progress || job.progress
                });
              }
            }
          } catch (error) {
            console.error(`Polling failed for job ${job.id}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
      }
    }
  }, [updateJob]);

  // Start polling when hook is used
  useEffect(() => {
    console.log('🚀 Starting background job polling...');
    
    const interval = setInterval(() => {
      pollIncompleteJobs();
    }, 5000); // Poll every 5 seconds

    return () => {
      console.log('🛑 Stopping background job polling...');
      clearInterval(interval);
    };
  }, [pollIncompleteJobs]);

  return {
    incompleteJobs: getJobsByStatus('queued').length + getJobsByStatus('processing').length + getJobsByStatus('active').length,
    pollIncompleteJobs
  };
}

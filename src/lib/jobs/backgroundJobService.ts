// Simple background job service that runs independently
class BackgroundJobService {
  private static instance: BackgroundJobService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  static getInstance(): BackgroundJobService {
    if (!BackgroundJobService.instance) {
      BackgroundJobService.instance = new BackgroundJobService();
    }
    return BackgroundJobService.instance;
  }

  start() {
    if (this.isRunning) {
      console.log('🔄 Background job service already running');
      return;
    }

    console.log('🚀 Starting background job service...');
    this.isRunning = true;

    // Start polling immediately
    this.pollAllIncompleteJobs();

    // Set up interval for continuous polling
    this.intervalId = setInterval(() => {
      this.pollAllIncompleteJobs();
    }, 5000); // Poll every 5 seconds
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Background job service stopped');
  }

  private async pollAllIncompleteJobs() {
    try {
      console.log('🔄 Background service: Polling all incomplete jobs...');
      
      // Get all jobs from the database
      const response = await fetch('/api/admin/jobs');
      if (!response.ok) {
        console.error('❌ Failed to fetch jobs:', response.status);
        return;
      }
      
      const data = await response.json();
      const allJobs = data.jobs || [];
      
      // Find incomplete jobs
      const incompleteJobs = allJobs.filter((job: any) => 
        job.status !== 'completed' && job.status !== 'failed'
      );
      
      if (incompleteJobs.length === 0) {
        console.log('✅ Background service: No incomplete jobs to poll');
        return;
      }
      
      console.log(`🔄 Background service: Found ${incompleteJobs.length} incomplete jobs to poll`);
      console.log(`📊 Jobs to poll:`, incompleteJobs.map((j: any) => ({
        id: j.id,
        industry: j.metadata?.industry,
        status: j.status,
        type: j.type
      })));
      
      // Poll each incomplete job
      for (const job of incompleteJobs) {
        await this.pollJob(job);
      }
    } catch (error) {
      console.error('❌ Background service polling error:', error);
    }
  }

  private async pollJob(job: any) {
    try {
      if (!job.metadata?.pollUrl) {
        console.log(`⚠️ Background service: Job ${job.id} has no pollUrl`);
        return;
      }

      console.log(`🔄 Background service: Polling job ${job.id} (${job.metadata.industry})`);
      
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
        const externalData = data.data;
        
        if (externalData.success && (externalData.status === 'completed' || externalData.result)) {
          console.log(`✅ Background service: Job ${job.id} completed!`);
          
          // Update job status in database
          await this.updateJobStatus(job.id, {
            status: 'completed',
            progress: 100,
            result: externalData.result
          });
          
          // Sync keywords to industry if this is a keyword generation job
          if (job.type === 'keyword-generation' && externalData.result) {
            await this.syncKeywordsToIndustry(job.metadata?.industry, externalData.result);
          }
          
          // Process enrichment result and save to business directory if this is a basic enrichment job
          if (job.type === 'basic-enrichment' && externalData.result) {
            await this.processEnrichmentResult(externalData.result, job.id);
          }
        } else if (externalData.status && externalData.status !== job.status) {
          console.log(`🔄 Background service: Job ${job.id} status changed from ${job.status} to ${externalData.status}`);
          
          // Update status and progress
          await this.updateJobStatus(job.id, {
            status: externalData.status,
            progress: externalData.progress || job.progress
          });
        } else {
          console.log(`📊 Background service: Job ${job.id} still ${job.status}, no change`);
        }
      } else {
        console.error(`❌ Background service: Failed to poll job ${job.id}: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Background service: Error polling job ${job.id}:`, error);
    }
  }

  private async updateJobStatus(jobId: string, updates: any) {
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, ...updates })
      });
      
      if (response.ok) {
        console.log(`✅ Background service: Updated job ${jobId} status`);
      } else {
        console.error(`❌ Background service: Failed to update job ${jobId}:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Background service: Error updating job ${jobId}:`, error);
    }
  }

  private async syncKeywordsToIndustry(industryName: string, result: any) {
    try {
      const keywords = this.extractKeywordsFromResult(result);
      if (keywords.length === 0) {
        console.log('⚠️ Background service: No keywords found in result to sync');
        return;
      }

      console.log(`🔄 Background service: Syncing ${keywords.length} keywords to industry: ${industryName}`);
      
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
        console.log('✅ Background service: Keywords synced successfully:', data.message);
      } else {
        console.error('❌ Background service: Failed to sync keywords:', await response.text());
      }
    } catch (error) {
      console.error('❌ Background service: Error syncing keywords:', error);
    }
  }

  private async processEnrichmentResult(enrichmentResult: any, jobId: string) {
    try {
      console.log(`🔄 Background service: Processing enrichment result for job ${jobId}`);
      
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
        console.log(`✅ Background service: Enrichment result processed successfully for job ${jobId}:`, {
          businessId: data.businessId,
          created: data.created,
          updated: data.updated
        });
      } else {
        const errorText = await response.text();
        console.error(`❌ Background service: Failed to process enrichment result for job ${jobId}:`, errorText);
      }
    } catch (error) {
      console.error(`❌ Background service: Error processing enrichment result for job ${jobId}:`, error);
    }
  }

  private extractKeywordsFromResult(result: any): string[] {
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
  }
}

// Export singleton instance
export const backgroundJobService = BackgroundJobService.getInstance();

// Auto-start the service when this module is imported in browser
if (typeof window !== 'undefined') {
  // Start after a short delay to ensure everything is loaded
  setTimeout(() => {
    console.log('🌐 Browser environment detected, starting background service...');
    backgroundJobService.start();
  }, 1000);
} else {
  console.log('🖥️ Server environment detected, background service ready');
}

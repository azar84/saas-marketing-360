/**
 * Job Poller Utility
 * Handles polling for job completion from external Redis/Bull queue APIs
 */

export interface JobPollingOptions {
  maxPollingTime?: number; // Maximum time to poll in milliseconds
  pollInterval?: number; // Interval between polls in milliseconds
  onProgress?: (status: string, progress: number, position?: number, estimatedWaitTime?: number) => void;
  onError?: (error: string) => void;
}

export interface JobResult {
  success: boolean;
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  position?: number;
  estimatedWaitTime?: number;
}

/**
 * Poll for job completion from external API
 */
export async function pollForJobCompletion(
  baseUrl: string,
  jobId: string,
  bypassToken: string,
  options: JobPollingOptions = {}
): Promise<JobResult | null> {
  const {
    maxPollingTime = 5 * 60 * 1000, // 5 minutes default
    pollInterval = 2000, // 2 seconds default
    onProgress,
    onError
  } = options;

  const startTime = Date.now();
  
  console.log(`🔍 Starting job polling for ${jobId}`, { 
    baseUrl, 
    pollInterval, 
    maxPollingTime: maxPollingTime / 1000 
  });

  while (Date.now() - startTime < maxPollingTime) {
    try {
      // Wait before polling (except first time)
      if (Date.now() - startTime > 0) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }

      const pollUrl = new URL(`/api/jobs/${jobId}`, baseUrl).toString();
      const pollRes = await fetch(pollUrl, {
        method: 'GET',
        headers: { 'x-vercel-protection-bypass': bypassToken }
      });

      if (!pollRes.ok) {
        const errorMsg = `Poll request failed: ${pollRes.status} ${pollRes.statusText}`;
        console.warn(`⚠️ ${errorMsg}`, { jobId, status: pollRes.status });
        onError?.(errorMsg);
        continue;
      }

      const pollData: JobResult = await pollRes.json().catch(() => ({}));
      
      if (pollData.success && pollData.status === 'completed') {
        console.log(`✅ Job completed successfully`, { 
          jobId, 
          progress: pollData.progress,
          processingTime: pollData.result?.processingTime 
        });
        return pollData;
      } else if (pollData.status === 'failed') {
        const errorMsg = `Job failed: ${pollData.error || 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`, { jobId, error: pollData.error });
        onError?.(errorMsg);
        return pollData;
      } else {
        // Job still in progress
        const progress = pollData.progress || 0;
        const status = pollData.status || 'unknown';
        const position = pollData.position;
        const estimatedWaitTime = pollData.estimatedWaitTime;
        
        console.log(`🔄 Job in progress`, { 
          jobId, 
          status, 
          progress,
          position,
          estimatedWaitTime
        });
        
        onProgress?.(status, progress, position, estimatedWaitTime);
      }
    } catch (pollError) {
      const errorMsg = `Poll request error: ${pollError instanceof Error ? pollError.message : String(pollError)}`;
      console.warn(`⚠️ ${errorMsg}`, { jobId, error: pollError });
      onError?.(errorMsg);
      // Continue polling despite errors
    }
  }

  const timeoutMsg = `Job polling timeout after ${maxPollingTime / 1000} seconds`;
  console.warn(`⏰ ${timeoutMsg}`, { jobId, maxPollingTime: maxPollingTime / 1000 });
  onError?.(timeoutMsg);
  return null;
}

/**
 * Submit a job to the external API and return the job details
 */
export async function submitJob(
  baseUrl: string,
  endpoint: string,
  payload: any,
  bypassToken: string
): Promise<{ success: boolean; jobId?: string; message?: string; error?: string }> {
  try {
    const url = new URL(endpoint, baseUrl).toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'x-vercel-protection-bypass': bypassToken 
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API error: ${response.status} ${response.statusText} ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Complete workflow: Submit job and poll for completion
 */
export async function submitJobAndWaitForCompletion(
  baseUrl: string,
  endpoint: string,
  payload: any,
  bypassToken: string,
  pollingOptions: JobPollingOptions = {}
): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    // Submit the job
    const submitResult = await submitJob(baseUrl, endpoint, payload, bypassToken);
    
    if (!submitResult.success || !submitResult.jobId) {
      return {
        success: false,
        error: submitResult.error || submitResult.message || 'Failed to submit job'
      };
    }

    console.log(`📤 Job submitted successfully`, { 
      jobId: submitResult.jobId, 
      message: submitResult.message 
    });

    // Poll for completion
    const pollResult = await pollForJobCompletion(
      baseUrl, 
      submitResult.jobId, 
      bypassToken, 
      pollingOptions
    );

    if (!pollResult) {
      return {
        success: false,
        error: 'Job polling timeout'
      };
    }

    if (pollResult.status === 'failed') {
      return {
        success: false,
        error: pollResult.error || 'Job failed'
      };
    }

    return {
      success: true,
      result: pollResult.result
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

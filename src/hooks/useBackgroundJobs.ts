import { useState, useEffect, useCallback } from 'react';
import { useNotificationContext } from '@/components/providers/NotificationProvider';
import { backgroundJobManager, type BackgroundJob, type JobProgress } from '@/lib/backgroundJobManager';

export function useBackgroundJobs() {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [activeJobs, setActiveJobs] = useState<BackgroundJob[]>([]);
  const { addNotification, updateNotification } = useNotificationContext();

  // Fetch jobs from the manager
  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/background-jobs?action=jobs');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJobs(data.data);
          setActiveJobs(data.data.filter((job: BackgroundJob) => 
            job.progress.status === 'pending' || job.progress.status === 'processing'
          ));
        }
      }
    } catch (error) {
      console.error('Failed to fetch background jobs:', error);
    }
  }, []);

  // Create a new background job
  const createJob = useCallback(async (type: 'industry_search_extraction', jobData: any) => {
    try {
      const response = await fetch('/api/admin/background-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          type,
          jobData
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const jobId = data.data.jobId;
          
          // Add progress notification
          const notificationId = addNotification({
            type: 'progress',
            title: 'Industry Search Extraction Started',
            message: `Processing ${jobData.searchResults.length} search results...`,
            progress: {
              current: 0,
              total: jobData.searchResults.length,
              percentage: 0,
              status: 'Initializing...'
            },
            actions: [
              {
                label: 'View Details',
                onClick: () => {
                  // Navigate to traceability view or show job details
                  console.log('Navigate to job details:', jobId);
                },
                variant: 'secondary'
              }
            ]
          });

          // Store notification ID for updates
          localStorage.setItem(`job_notification_${jobId}`, notificationId);
          
          // Refresh jobs list
          await fetchJobs();
          
          return jobId;
        }
      }
      
      throw new Error('Failed to create background job');
    } catch (error) {
      console.error('Error creating background job:', error);
      throw error;
    }
  }, [addNotification, fetchJobs]);

  // Cancel a job
  const cancelJob = useCallback(async (jobId: string) => {
    try {
      const response = await fetch('/api/admin/background-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          jobId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove notification
          const notificationId = localStorage.getItem(`job_notification_${jobId}`);
          if (notificationId) {
            // Update notification to show cancelled
            updateNotification(notificationId, {
              type: 'warning',
              title: 'Job Cancelled',
              message: 'Industry search extraction has been cancelled.',
              progress: undefined
            });
            localStorage.removeItem(`job_notification_${jobId}`);
          }
          
          // Refresh jobs list
          await fetchJobs();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error cancelling job:', error);
      return false;
    }
  }, [updateNotification, fetchJobs]);

  // Update job progress in notifications
  const updateJobProgress = useCallback((jobId: string, progress: JobProgress) => {
    const notificationId = localStorage.getItem(`job_notification_${jobId}`);
    if (!notificationId) return;

    const progressData = backgroundJobManager.getJobProgressForNotifications(jobId);
    if (!progressData) return;

    // Update notification with progress
    updateNotification(notificationId, {
      progress: progressData,
      message: `${progressData.status} - ${progressData.current}/${progressData.total} results processed`,
      actions: [
        {
          label: progress.status === 'completed' ? 'View Results' : 'View Details',
          onClick: () => {
            if (progress.status === 'completed') {
              // Navigate to results or show success message
              console.log('Job completed, show results');
            } else {
              // Show job details
              console.log('Show job details:', jobId);
            }
          },
          variant: progress.status === 'completed' ? 'success' : 'secondary'
        }
      ]
    });

    // If job is completed or failed, update notification type
    if (progress.status === 'completed') {
      updateNotification(notificationId, {
        type: 'success',
        title: 'Extraction Completed Successfully',
        message: `✅ ${progress.acceptedCount} businesses extracted, ${progress.rejectedCount} rejected`,
        progress: progressData
      });
      
      // Auto-remove notification after 10 seconds
      setTimeout(() => {
        localStorage.removeItem(`job_notification_${jobId}`);
      }, 10000);
      
    } else if (progress.status === 'failed') {
      updateNotification(notificationId, {
        type: 'error',
        title: 'Extraction Failed',
        message: `❌ ${progress.currentStep}`,
        progress: progressData
      });
      
      // Auto-remove notification after 15 seconds
      setTimeout(() => {
        localStorage.removeItem(`job_notification_${jobId}`);
      }, 15000);
    }
  }, [updateNotification]);

  // Set up event listeners for job updates
  useEffect(() => {
    const handleJobProgress = (jobId: string, progress: JobProgress) => {
      updateJobProgress(jobId, progress);
    };

    const handleJobCompleted = (jobId: string, result: any) => {
      updateJobProgress(jobId, { ...result, status: 'completed' });
    };

    const handleJobFailed = (jobId: string, error: Error) => {
      updateJobProgress(jobId, { 
        status: 'failed', 
        currentStep: `Failed: ${error.message}` 
      } as JobProgress);
    };

    // Listen to background job manager events
    backgroundJobManager.on('progressUpdate', handleJobProgress);
    backgroundJobManager.on('jobCompleted', handleJobCompleted);
    backgroundJobManager.on('jobFailed', handleJobFailed);

    // Initial fetch
    fetchJobs();

    // Set up polling for job updates (every 2 seconds)
    const interval = setInterval(fetchJobs, 2000);

    return () => {
      backgroundJobManager.off('progressUpdate', handleJobProgress);
      backgroundJobManager.off('jobCompleted', handleJobCompleted);
      backgroundJobManager.off('jobFailed', handleJobFailed);
      clearInterval(interval);
    };
  }, [fetchJobs, updateJobProgress]);

  return {
    jobs,
    activeJobs,
    createJob,
    cancelJob,
    fetchJobs,
    updateJobProgress
  };
}

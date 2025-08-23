'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Trash2,
  Eye,
  Zap,
  Search,
  AlertTriangle
} from 'lucide-react';
import { useGlobalJobStore } from '@/lib/jobs/globalJobState';
import { useDesignSystem } from '@/hooks/useDesignSystem';

interface Job {
  id: string;
  type: 'keyword-generation' | 'basic-enrichment' | 'enhanced-enrichment';
  status: 'queued' | 'processing' | 'active' | 'completed' | 'failed';
  submittedAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
  progress: number;
  position?: number;
  estimatedWaitTime?: number;
  pollUrl?: string;
  metadata?: any;
}

export default function JobsManager() {
  const { jobs, setJobs, updateJob, loadJobsFromDatabase } = useGlobalJobStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { designSystem } = useDesignSystem();
  
  // Use ref to access current jobs state in polling
  const jobsRef = useRef<Job[]>([]);
  jobsRef.current = jobs;

  // Load jobs on component mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Poll incomplete jobs every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      pollIncompleteJobs();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []); // Keep empty dependency to avoid recreation of interval



  const loadJobs = async () => {
    try {
      await loadJobsFromDatabase();
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const pollIncompleteJobs = async () => {
    // Only poll jobs that are not completed
    const incompleteJobs = jobsRef.current.filter(job => 
      job.status !== 'completed' && job.status !== 'failed'
    );
    
    if (incompleteJobs.length === 0) {
      return;
    }
    
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
                await updateJobStatus(job.id, {
                  status: 'completed',
                  progress: 100,
                  result: externalData.result,
                  completedAt: new Date().toISOString()
                });
                
                // Sync keywords to industry if this is a keyword generation job
                if (job.type === 'keyword-generation' && externalData.result) {
                  await syncKeywordsToIndustry(job.metadata?.industry, externalData.result);
                }
              } else if (externalData.status && externalData.status !== job.status) {
                await updateJobStatus(job.id, {
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
  };

  const syncKeywordsToIndustry = async (industryName: string, result: any) => {
    try {
      // Extract keywords from the result structure
      const keywords = extractKeywordsFromResult(result);
      
      if (keywords.length > 0) {
        const response = await fetch('/api/admin/industries/keywords/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            industryName, 
            keywords 
          })
        });
        
        if (response.ok) {
          console.log(`Synced ${keywords.length} keywords to industry: ${industryName}`);
        } else {
          console.error(`Failed to sync keywords to industry: ${industryName}`);
        }
      }
    } catch (error) {
      console.error(`Error syncing keywords to industry: ${industryName}`, error);
    }
  };

  const extractKeywordsFromResult = (result: any): string[] => {
    if (!result) return [];
    
    // Navigate through the result structure to find keywords
    const extractTerms = (obj: any): string[] => {
      if (!obj) return [];
      if (Array.isArray(obj)) return obj;
      if (Array.isArray(obj.search_terms)) return obj.search_terms;
      if (Array.isArray(obj.keywords)) return obj.keywords;
      if (obj.data) return extractTerms(obj.data);
      if (obj.result) return extractTerms(obj.result);
      if (obj.payload) return extractTerms(obj.payload);
      return [];
    };

    let terms = extractTerms(result)
      .filter((t: any) => typeof t === 'string')
      .map((t: string) => t.trim())
      .filter(Boolean);

    // Dedupe and enforce basic length (2–8 words)
    terms = Array.from(new Set(terms)).filter((t: string) => {
      const w = t.split(/\s+/).filter(Boolean).length;
      return w >= 2 && w <= 8;
    });

    return terms;
  };

  const updateJobStatus = async (jobId: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, ...updates })
      });
      
      if (response.ok) {
        // Update global state immediately
        updateJob(jobId, updates);
      } else {
        const errorText = await response.text();
        console.error(`Failed to update job ${jobId}:`, errorText);
      }
    } catch (error) {
      console.error(`Error updating job ${jobId}:`, error);
    }
  };

  const refreshJobs = async () => {
    setIsRefreshing(true);
    await loadJobsFromDatabase();
    setIsRefreshing(false);
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await fetch(`/api/admin/jobs?jobId=${jobId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadJobsFromDatabase();
        console.log('Job deleted successfully');
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job');
    }
  };

  const deleteAllJobs = async () => {
    if (!confirm('Are you sure you want to delete ALL jobs? This action cannot be undone.')) return;

    try {
      const response = await fetch('/api/admin/jobs?deleteAll=true', {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadJobsFromDatabase();
        console.log('All jobs deleted successfully');
      } else {
        alert('Failed to delete all jobs');
      }
    } catch (error) {
      console.error('Error deleting all jobs:', error);
      alert('Error deleting all jobs');
    }
  };

  const viewJobDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'keyword-generation': return <Search className="w-4 h-4" />;
      case 'basic-enrichment': return <Zap className="w-4 h-4" />;
      case 'enhanced-enrichment': return <Zap className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getJobTypeName = (type: string) => {
    switch (type) {
      case 'keyword-generation': return 'Keyword Generation';
      case 'basic-enrichment': return 'Basic Enrichment';
      case 'enhanced-enrichment': return 'Enhanced Enrichment';
      default: return type;
    }
  };

  const getJobData = (job: Job) => {
    if (job.type === 'keyword-generation') {
      return job.metadata?.industry || 'Unknown Industry';
    }
    if (job.type === 'basic-enrichment' || job.type === 'enhanced-enrichment') {
      return job.metadata?.websiteUrl || 'Unknown Website';
    }
    // Add other job type data extraction here
    return 'Job Data';
  };

  // Check if a completed job has errors in its result
  const hasResultError = (job: Job): boolean => {
    if (job.status !== 'completed' || !job.result) return false;
    
    // Check for errors in the result structure
    const result = job.result;
    
    // Debug logging to see the structure
    console.log('🔍 Checking job for errors:', job.id, result);
    
    // Direct error field
    if (result.error) return true;
    
    // Check nested result data for errors (your actual structure)
    if (result.result && result.result.data && result.result.data.error) return true;
    
    // Check direct data.error (your current example)
    if (result.data && result.data.error) return true;
    
    // Check for success: false at various levels
    if (result.success === false) return true;
    if (result.result && result.result.success === false) return true;
    if (result.result && result.result.data && result.result.data.success === false) return true;
    
    // Check if the error message contains failure indicators
    const errorMessage = getResultErrorMessage(job);
    if (errorMessage && (
      errorMessage.includes('failed') || 
      errorMessage.includes('Failed') ||
      errorMessage.includes('error') ||
      errorMessage.includes('Error')
    )) return true;
    
    return false;
  };

  // Get error message from result
  const getResultErrorMessage = (job: Job): string => {
    if (job.status !== 'completed' || !job.result) return '';
    
    const result = job.result;
    
    // Direct error field
    if (result.error) return result.error;
    
    // Check nested result data for errors
    if (result.result && result.result.data && result.result.data.error) {
      return result.result.data.error;
    }
    
    // Check direct data.error (your current example)
    if (result.data && result.data.error) {
      return result.data.error;
    }
    
    return '';
  };

  const extractKeywords = (result: any): string[] => {
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


  
  return (
    <div className="space-y-6">
      {/* Jobs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Jobs</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={refreshJobs}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {jobs.length > 0 && (
                <Button
                  onClick={deleteAllJobs}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Jobs
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
                <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No jobs found. Jobs will appear here when submitted.
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getJobTypeIcon(job.type)}
                        <span className="text-sm font-medium text-gray-700">
                          {getJobTypeName(job.type)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{getJobData(job)}</h3>
                        <p className="text-sm text-gray-500">
                          Submitted: {formatDate(job.submittedAt)}
                        </p>
                        {job.completedAt && (
                          <p className="text-sm text-gray-500">
                            Completed: {formatDate(job.completedAt)}
                          </p>
                        )}
                        {job.metadata?.pollUrl && (
                          <p className="text-xs text-blue-600 font-mono">
                            Poll URL: {job.metadata.pollUrl}
                          </p>
                        )}
                      </div>
                    </div>
                  
                    <div className="flex items-center gap-2">
                      {job.status === 'queued' && (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                          <span className="text-sm text-yellow-600 font-medium">Queued</span>
                        </div>
                      )}
                      
                      {(job.status === 'processing' || job.status === 'active') && (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-blue-600 font-medium">Processing...</span>
                          <span className="text-sm text-gray-600">
                            {job.progress}%
                          </span>
                        </div>
                      )}
                      
                      {job.status === 'completed' && !hasResultError(job) && (
                        <Button
                          onClick={() => viewJobDetails(job)}
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Success
                        </Button>
                      )}

                      {job.status === 'completed' && hasResultError(job) && (
                        <Button
                          onClick={() => viewJobDetails(job)}
                          size="sm"
                          variant="outline"
                          className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Completed with Errors
                        </Button>
                      )}
                      
                      {job.status === 'failed' && (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-600 font-medium">Failed</span>
                        </div>
                      )}
                      
                      <Button
                        onClick={() => deleteJob(job.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {(job.status === 'processing' || job.status === 'active') && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {job.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Job Error:</strong> {job.error}
                    </div>
                  )}

                  {hasResultError(job) && (
                    <div 
                      className="mt-2 p-2 border rounded text-sm"
                      style={{ 
                        backgroundColor: `${designSystem?.warningColor || '#F59E0B'}1A`,
                        borderColor: `${designSystem?.warningColor || '#F59E0B'}40`,
                        color: designSystem?.warningColor || '#F59E0B'
                      }}
                    >
                      <strong>Completed with Errors:</strong> {getResultErrorMessage(job)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>



      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Job Results: {getJobData(selectedJob)}</h2>
                <Button onClick={closeJobDetails} variant="outline">
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span> {selectedJob.status}
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span> {formatDate(selectedJob.submittedAt)}
                  </div>
                  {selectedJob.completedAt && (
                    <div>
                      <span className="font-medium">Completed:</span> {formatDate(selectedJob.completedAt)}
                    </div>
                  )}
                  {selectedJob.progress > 0 && (
                    <div>
                      <span className="font-medium">Progress:</span> {selectedJob.progress}%
                    </div>
                  )}
                </div>
                
                {selectedJob.type === 'keyword-generation' && selectedJob.result && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Generated Keywords</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {extractKeywords(selectedJob.result).map((keyword, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 bg-gray-100 rounded-md text-sm"
                        >
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedJob.type === 'basic-enrichment' || selectedJob.type === 'enhanced-enrichment') && selectedJob.result && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Enrichment Result</h3>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <pre className="text-sm overflow-auto max-h-96">
                        {JSON.stringify(selectedJob.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {selectedJob.error && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-600">Job Error</h3>
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                      {selectedJob.error}
                    </div>
                  </div>
                )}

                {hasResultError(selectedJob) && (
                  <div>
                    <h3 
                      className="text-lg font-semibold mb-3"
                      style={{ color: designSystem?.warningColor || '#F59E0B' }}
                    >
                      Completed with Errors
                    </h3>
                    <div 
                      className="p-3 border rounded"
                      style={{ 
                        backgroundColor: `${designSystem?.warningColor || '#F59E0B'}1A`,
                        borderColor: `${designSystem?.warningColor || '#F59E0B'}40`,
                        color: designSystem?.warningColor || '#F59E0B'
                      }}
                    >
                      {getResultErrorMessage(selectedJob)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

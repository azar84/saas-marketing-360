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
  Search
} from 'lucide-react';

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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
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
      const response = await fetch('/api/admin/jobs');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJobs(data.jobs || []);
        }
      }
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
        // Refresh jobs list to show updates
        await loadJobs();
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
    await loadJobs();
    setIsRefreshing(false);
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await fetch(`/api/admin/jobs?jobId=${jobId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadJobs();
        console.log('Job deleted successfully');
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job');
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
    // Add other job type data extraction here
    return 'Job Data';
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
                      
                      {job.status === 'completed' && (
                        <Button
                          onClick={() => viewJobDetails(job)}
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Results
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
                      Error: {job.error}
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
                
                {selectedJob.result && (
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
                
                {selectedJob.error && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-600">Error</h3>
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                      {selectedJob.error}
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

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAdminApi } from '@/hooks/useApi';
import { EnrichedDataDisplay } from './EnrichedDataDisplay';

interface EnrichmentJob {
  id: string;
  domain: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
  data?: any;
}

interface EnrichmentResponse {
  success: boolean;
  data?: {
    jobs?: EnrichmentJob[];
  };
  error?: string;
}

interface EnrichmentManagerProps {
  className?: string;
}

export function EnrichmentManager({ className }: EnrichmentManagerProps) {
  const [domain, setDomain] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const [jobs, setJobs] = useState<EnrichmentJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<EnrichmentJob | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  
  const { get, post, delete: del } = useAdminApi();

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Set up auto-refresh for active jobs
  useEffect(() => {
    if (jobs.some(job => job.status === 'pending' || job.status === 'in_progress')) {
      const interval = setInterval(fetchJobs, 2000); // Refresh every 2 seconds
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [jobs]);

  const fetchJobs = async () => {
    try {
      const response = await get<EnrichmentResponse>('/admin/enrichment');
      if (response.success) {
        setJobs(response.data?.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const startEnrichment = async () => {
    if (!domain.trim()) return;

    setIsEnriching(true);
    try {
      const response = await post<EnrichmentResponse>('/admin/enrichment', { domain: domain.trim() });
      
      if (response.success) {
        setDomain('');
        await fetchJobs(); // Refresh jobs list
      } else {
        alert(`Enrichment failed: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      alert('Failed to start enrichment. Check console for details.');
    } finally {
      setIsEnriching(false);
    }
  };

  const clearCompletedJobs = async () => {
    try {
      await del('/admin/enrichment');
      await fetchJobs(); // Refresh jobs list
    } catch (error) {
      console.error('Failed to clear jobs:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'destructive';
      case 'in_progress': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'in_progress': return '🔄';
      default: return '⏳';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const duration = endTime - startTime;
    
    if (duration < 1000) return '< 1s';
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    return `${Math.round(duration / 60000)}m ${Math.round((duration % 60000) / 1000)}s`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Data Enrichment</h2>
          <p className="text-gray-600 mt-1">
            Enrich company data from domain names using web scraping and AI processing
          </p>
        </div>
        <Button
          onClick={clearCompletedJobs}
          variant="outline"
          disabled={!jobs.some(job => job.status === 'completed')}
        >
          Clear Completed Jobs
        </Button>
      </div>

      {/* Enrichment Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Start New Enrichment</h3>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Enter company domain (e.g., example.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && startEnrichment()}
            className="flex-1"
          />
          <Button
            onClick={startEnrichment}
            disabled={!domain.trim() || isEnriching}
            isLoading={isEnriching}
          >
            {isEnriching ? 'Enriching...' : 'Start Enrichment'}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          The system will scrape the website, enrich with Google search data, and process with AI
        </p>
      </Card>

      {/* Jobs List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Enrichment Jobs</h3>
        
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No enrichment jobs found</p>
            <p className="text-sm">Start an enrichment to see jobs here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedJob?.id === job.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getStatusIcon(job.status)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{job.domain}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Started {formatDate(job.createdAt)}
                        </span>
                        {job.completedAt && (
                          <span className="text-sm text-gray-500">
                            • Duration: {calculateDuration(job.createdAt, job.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {job.status === 'in_progress' && (
                      <div className="text-sm text-gray-600">
                        Progress: {job.progress || 0}%
                      </div>
                    )}
                    {job.error && (
                      <div className="text-sm text-red-600 max-w-xs truncate">
                        {job.error}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Job Details */}
                {selectedJob?.id === job.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Job ID:</span>
                        <span className="ml-2 font-mono text-gray-600">{job.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <span className="ml-2 text-gray-600">{formatDate(job.createdAt)}</span>
                      </div>
                      {job.completedAt && (
                        <div>
                          <span className="font-medium text-gray-700">Completed:</span>
                          <span className="ml-2 text-gray-600">{formatDate(job.completedAt)}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2 text-gray-600">{job.status}</span>
                      </div>
                    </div>

                    {/* Enriched Data Display */}
                    {job.data && job.status === 'completed' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-700">Enriched Data:</h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRawData(!showRawData)}
                          >
                            {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
                          </Button>
                        </div>
                        
                        {!showRawData ? (
                          <EnrichedDataDisplay data={job.data} />
                        ) : (
                          <div className="bg-gray-50 rounded p-3 text-sm">
                            <pre className="whitespace-pre-wrap text-gray-700 overflow-auto max-h-96">
                              {JSON.stringify(job.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error Details */}
                    {job.error && (
                      <div className="mt-4">
                        <h5 className="font-medium text-red-700 mb-2">Error Details:</h5>
                        <div className="bg-red-50 rounded p-3 text-sm text-red-700">
                          {job.error}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Workflow Diagram */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Enrichment Workflow</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span className="mt-1 text-gray-600">Domain</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span className="mt-1 text-gray-600">Validate</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span className="mt-1 text-gray-600">Scrape</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <span className="mt-1 text-gray-600">Enrich</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
              <span className="mt-1 text-gray-600">LLM</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">6</div>
              <span className="mt-1 text-gray-600">Database</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">7</div>
              <span className="mt-1 text-gray-600">Marketing</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

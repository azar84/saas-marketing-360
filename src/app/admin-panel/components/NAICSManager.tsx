'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Eye, EyeOff, Trash2, Edit2, Save, X, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGlobalJobStore } from '@/lib/jobs/globalJobState';

interface FlatItem {
  id: number;
  title: string;
  keywordsCount?: number;
}

interface ListResponse {
  success: boolean;
  data: Array<{
    id: number;
    title: string;
    keywordsCount?: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Keyword {
  id: number;
  searchTerm: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IndustryKeywords {
  id: number;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  keywords: Keyword[];
  totalKeywords: number;
}

type KeywordsPayload = {
  industry: string;
  message?: string;
  keywords?: {
    search_terms: string[];
    subindustries: string[];
    service_queries: string[];
    transactional_modifiers: string[];
    negative_keywords: string[];
  };
  error?: string;
};

export default function NAICSManager({ onResult }: { onResult?: (payload: KeywordsPayload) => void }) {
  const { jobs, getJobsByType, loadJobsFromDatabase, addJob, removeJob } = useGlobalJobStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [items, setItems] = useState<FlatItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Computed values - derive UI state from global state
  const isGeneratingForIndustry = (industryTitle: string) => {
    const keywordJobs = getJobsByType('keyword-generation');
    return keywordJobs.some(job => 
      job.metadata?.industry === industryTitle && 
      job.status !== 'completed' && 
      job.status !== 'failed'
    );
  };
  
  const getGeneratingStatus = (industryTitle: string) => {
    const keywordJobs = getJobsByType('keyword-generation');
    const job = keywordJobs.find(job => job.metadata?.industry === industryTitle);
    
    if (!job) return null;
    
    switch (job.status) {
      case 'queued': return 'Queued...';
      case 'processing': return `Processing... ${job.progress || 0}%`;
      case 'active': return `Active... ${job.progress || 0}%`;
      default: return null;
    }
  };
  const [keywords, setKeywords] = useState<null | {
    search_terms: string[];
    subindustries: string[];
    service_queries: string[];
    transactional_modifiers: string[];
    negative_keywords: string[];
  }>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'keywords'>('list');
  const [selectedIndustry, setSelectedIndustry] = useState<FlatItem | null>(null);
  const [industryKeywords, setIndustryKeywords] = useState<IndustryKeywords | null>(null);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [sortBy, setSortBy] = useState<'id' | 'label' | 'keywordsCount'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  
  // Keyword editing state
  const [editingKeywordId, setEditingKeywordId] = useState<number | null>(null);
  const [editingKeywordText, setEditingKeywordText] = useState('');
  const [addingNewKeyword, setAddingNewKeyword] = useState(false);
  const [newKeywordText, setNewKeywordText] = useState('');
  


  // Load jobs from database when component mounts
  useEffect(() => {
    console.log('🚀 NAICSManager mounting, loading jobs from database...');
    loadJobsFromDatabase();
  }, [loadJobsFromDatabase]);

  // Simple approach: refresh list whenever jobs change
  useEffect(() => {
    if (jobs.length > 0) {
      // Refresh the list to show updated keyword counts
      fetchList(searchTerm, page, true);
    }
  }, [jobs, searchTerm, page]);

  const fetchList = async (q: string, p: number, isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      params.set('page', String(p));
      params.set('limit', '50');
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      
      // Add timestamp to prevent caching
      if (isRefresh) {
        params.set('_t', Date.now().toString());
      }
      
      const res = await fetch(`/api/admin/industries/search?${params}`);
      const data: ListResponse = await res.json();
      if (data.success) {
        const mappedItems = data.data.map(d => ({ 
          id: d.id, 
          title: d.title, 
          keywordsCount: d.keywordsCount || 0 
        }));
        
        setItems(mappedItems);
        setTotal(data.pagination.total);
        setPages(data.pagination.pages);
        

      }
    } catch (error) {
      console.error('Failed to fetch industries:', error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const deleteIndustry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this industry? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/industries?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state
        setItems(prev => prev.filter(item => item.id !== id));
        setTotal(prev => prev - 1);
        // Refresh the current page if it's now empty
        if (items.length === 1 && page > 1) {
          setPage(prev => prev - 1);
        }
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Cannot delete industry with related data') {
          const details = errorData.details;
          const message = `Cannot delete industry "${items.find(item => item.id === id)?.title}" because it has:\n` +
            `• ${details.keywordsCount} keywords\n` +
            `• ${details.businessesCount} business associations\n\n` +
            `Please delete the keywords and business associations first, or contact an administrator for assistance.`;
          alert(message);
        } else {
          alert(`Failed to delete industry: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Failed to delete industry:', error);
      alert('Failed to delete industry. Please try again.');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const generateFor = async (id: number, title: string) => {
    setGenError(null);
    setKeywords(null);
    setSuccessMessage(''); // Clear any previous success message
    
    try {
      // Optimistically show spinner immediately
      const tempJobId = `temp:${Date.now()}:${title}`;
      addJob({
        id: tempJobId,
        type: 'keyword-generation' as any,
        status: 'queued' as any,
        progress: 0,
        metadata: { industry: title },
        submittedAt: new Date().toISOString()
      } as any);

      // Submit job to the new job management system
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'keyword-generation',
          data: { industry: title }
        })
      });
      
      // Handle skip case (409 status)
      if (res.status === 409) {
        const skipData = await res.json();
        if (skipData.skipped) {
          // Clean up optimistic job
          try { removeJob(tempJobId); } catch {}
          setSuccessMessage(`✅ "${title}" already has ${skipData.keywordsCount} keywords. Generation skipped.`);
          setTimeout(() => setSuccessMessage(''), 5000);
          return; // Exit early, don't treat as error
        }
      }
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      if (data.success && data.job) {
        console.log(`✅ Job submitted successfully for "${title}"`, data.job);
        
        // Replace optimistic job with normalized real job
        removeJob(tempJobId);
        const j = data.job;
        const normalizedJob = {
          id: j.id,
          type: j.type,
          status: j.status,
          progress: j.progress ?? 0,
          metadata: {
            industry: j.industry,
            pollUrl: j.pollUrl,
            position: j.position,
            estimatedWaitTime: j.estimatedWaitTime
          },
          result: j.result,
          error: j.error,
          submittedAt: j.submittedAt,
          completedAt: j.completedAt
        } as any;
        addJob(normalizedJob);
        console.log('➕ Added job to global state');
        
        // Show success message
        setSuccessMessage(`🚀 Job submitted for "${title}". Monitoring progress...`);
        setTimeout(() => setSuccessMessage(''), 3000);
        
      } else {
        throw new Error(data.error || 'Failed to submit job');
      }
    } catch (error) {
      console.error('Job submission failed:', error);
      // Clean up optimistic job if present
      try { removeJob(tempJobId); } catch {}
      setGenError(error instanceof Error ? error.message : 'Unknown error occurred');
      if (onResult) onResult({ industry: title, error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  };

  // No more manual polling needed - global state handles everything

  // Background: while there are incomplete keyword-generation jobs in global state,
  // refresh jobs from database every 3 seconds so UI reflects server-side progress
  useEffect(() => {
    const hasIncomplete = getJobsByType('keyword-generation').some(j => j.status !== 'completed' && j.status !== 'failed');
    if (!hasIncomplete) return;
    const interval = setInterval(() => {
      loadJobsFromDatabase();
    }, 3000);
    return () => clearInterval(interval);
  }, [getJobsByType, loadJobsFromDatabase, jobs]);

  const viewKeywords = async (industry: FlatItem) => {
    setLoadingKeywords(true);
    console.log('Fetching keywords for industry:', industry);
    try {
      const url = `/api/admin/industries/${encodeURIComponent(industry.title)}/keywords`;
      console.log('API URL:', url);
      const res = await fetch(url);
      console.log('API response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('API response data:', data);
        if (data.success) {
          // Map the API response to match the expected structure
          const mappedData: IndustryKeywords = {
            id: data.industry.id,
            label: data.industry.label,
            isActive: data.industry.isActive,
            createdAt: data.industry.createdAt,
            updatedAt: data.industry.updatedAt,
            keywords: data.keywords,
            totalKeywords: data.totalKeywords
          };
          console.log('Mapped data:', mappedData);
          setIndustryKeywords(mappedData);
          setSelectedIndustry(industry);
          setCurrentView('keywords');
        } else {
          console.error('API returned success: false:', data);
        }
      } else {
        console.error('Failed to fetch keywords:', res.status, res.statusText);
        const errorData = await res.json().catch(() => ({}));
        console.error('Error details:', errorData);
        
        // Show error to user
        alert(`Failed to fetch keywords: ${errorData.error || res.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch keywords:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingKeywords(false);
    }
  };



  // Keyword editing functions
  const startEditingKeyword = (keyword: Keyword) => {
    setEditingKeywordId(keyword.id);
    setEditingKeywordText(keyword.searchTerm);
  };

  const cancelEditingKeyword = () => {
    setEditingKeywordId(null);
    setEditingKeywordText('');
  };

  const saveEditedKeyword = async (keywordId: number) => {
    try {
      const response = await fetch(`/api/admin/industries/${encodeURIComponent(selectedIndustry?.title || '')}/keywords/${keywordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          searchTerm: editingKeywordText 
        })
      });

      if (response.ok) {
        // Update local state
        setIndustryKeywords(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            keywords: prev.keywords.map(k => 
              k.id === keywordId 
                ? { ...k, searchTerm: editingKeywordText, updatedAt: new Date().toISOString() }
                : k
            )
          };
        });
        setEditingKeywordId(null);
        setEditingKeywordText('');
      } else {
        const errorData = await response.json();
        alert(`Failed to update keyword: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to update keyword:', error);
      alert('Failed to update keyword. Please try again.');
    }
  };

  const deleteKeyword = async (keywordId: number) => {
    if (!confirm('Are you sure you want to delete this keyword?')) {
      return;
    }

    try {
      const url = `/api/admin/industries/${encodeURIComponent(selectedIndustry?.title || '')}/keywords/${keywordId}`;
      console.log('Deleting keyword with URL:', url);
      console.log('Keyword ID:', keywordId);
      console.log('Industry title:', selectedIndustry?.title);
      
      const response = await fetch(url, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (response.ok) {
        // Remove from local state
        setIndustryKeywords(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            keywords: prev.keywords.filter(k => k.id !== keywordId),
            totalKeywords: prev.totalKeywords - 1
          };
        });
        console.log('Keyword deleted successfully from local state');
      } else {
        const errorData = await response.json();
        console.error('Delete failed with error:', errorData);
        alert(`Failed to delete keyword: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete keyword:', error);
      alert('Failed to delete keyword. Please try again.');
    }
  };

  const addNewKeyword = async () => {
    if (!newKeywordText.trim() || !selectedIndustry) return;

    try {
      const response = await fetch('/api/admin/industries/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          industry: selectedIndustry.title,
          searchTerm: newKeywordText.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.keyword) {
          // Add to local state
          setIndustryKeywords(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              keywords: [...prev.keywords, data.keyword],
              totalKeywords: prev.totalKeywords + 1
            };
          });
          setNewKeywordText('');
          setAddingNewKeyword(false);
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to add keyword: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to add keyword:', error);
      alert('Failed to add keyword. Please try again.');
    }
  };

  const deleteAllKeywords = async () => {
    if (!selectedIndustry || !industryKeywords) return;

    try {
      const response = await fetch(`/api/admin/industries/keywords/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          industryId: industryKeywords.id,
          searchTerms: industryKeywords.keywords.map(k => k.searchTerm)
        })
      });

      if (response.ok) {
        // Clear local state
        setIndustryKeywords(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            keywords: [],
            totalKeywords: 0
          };
        });
        alert(`Successfully deleted all ${industryKeywords.totalKeywords} keywords for "${industryKeywords.label}"`);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete keywords: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete keywords:', error);
      alert('Failed to delete keywords. Please try again.');
    }
  };

  const deleteIndustryFromKeywordsView = async () => {
    if (!selectedIndustry) return;

    try {
      // First delete all keywords if they exist
      if (industryKeywords && industryKeywords.totalKeywords > 0) {
        await deleteAllKeywords();
      }

      // Now delete the industry
      const response = await fetch(`/api/admin/industries?id=${selectedIndustry.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state and go back to list
        setItems(prev => prev.filter(item => item.id !== selectedIndustry.id));
        setTotal(prev => prev - 1);
        setSelectedIndustry(null);
        setIndustryKeywords(null);
        setCurrentView('list');
        alert(`Successfully deleted industry "${selectedIndustry.title}"`);
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Cannot delete industry with related data') {
          const details = errorData.details;
          const message = `Cannot delete industry "${selectedIndustry.title}" because it has:\n` +
            `• ${details.keywordsCount} keywords\n` +
            `• ${details.businessesCount} business associations\n\n` +
            `Please delete the keywords and business associations first, or contact an administrator for assistance.`;
          alert(message);
        } else {
          alert(`Failed to delete industry: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Failed to delete industry:', error);
      alert('Failed to delete industry. Please try again.');
    }
  };



  // Navigation breadcrumb
  const renderBreadcrumb = () => (
    <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
      <button
        onClick={() => setCurrentView('list')}
        className="hover:underline cursor-pointer"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Industries
      </button>
      {currentView !== 'list' && selectedIndustry && (
        <>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{selectedIndustry.title}</span>
          
          {currentView === 'keywords' && <span>/ View Keywords</span>}
        </>
      )}
    </div>
  );

  // Main list view
  const renderListView = () => (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Industries</h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Search and generate keyword sets for your target industries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchList(searchTerm, page, true)}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          {isLoading && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)' 
            }}>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="font-medium">Loading industries...</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 rounded-lg border" style={{
          backgroundColor: 'var(--color-success-light)',
          borderColor: 'var(--color-success)',
          color: 'var(--color-success-dark)'
        }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="space-y-3">
          <label htmlFor="industry-search" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Search Industries
          </label>
          <div className="relative">
            <input
              id="industry-search"
              type="text"
              placeholder="Type to search industries (e.g., 'landscaping', 'plumbing')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)', 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                '--tw-ring-color': 'var(--color-primary)'
              } as any}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm px-2 py-1 rounded hover:bg-opacity-10"
                style={{ 
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-bg-secondary)'
                }}
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Search will update automatically as you type
          </p>
          {/* Sorting Status */}
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Sorted by:</span>
            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {sortBy === 'id' ? 'ID' : sortBy === 'label' ? 'Industry Name' : 'Keywords Count'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ 
              backgroundColor: 'var(--color-primary-light)', 
              color: 'var(--color-primary)' 
            }}>
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {items.length > 0 && (
        <Card padding="none">
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {total} {total === 1 ? 'industry' : 'industries'} found
              </span>
              {searchTerm && (
                <span className="text-xs px-2 py-1 rounded-full" style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  color: 'var(--color-text-secondary)' 
                }}>
                  "{searchTerm}"
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Sorting Controls */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'id' | 'label' | 'keywordsCount');
                    setPage(1); // Reset to first page when sorting changes
                  }}
                  className="text-xs px-2 py-1 rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)', 
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as any}
                >
                  <option value="id">ID</option>
                  <option value="label">Industry Name</option>
                  <option value="keywordsCount">Keywords Count</option>
                </select>
                <button
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    setPage(1); // Reset to first page when sort order changes
                  }}
                  className="p-1 rounded hover:bg-opacity-10 transition-colors"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-secondary)'
                  }}
                  title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  disabled={page <= 1 || isLoading}
                  onClick={() => { const p = page - 1; setPage(p); fetchList(searchTerm, p); }}
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm font-medium px-3 py-1 rounded-md" style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  color: 'var(--color-text-primary)' 
                }}>
                  {page} of {Math.max(1, pages)}
                </span>
                <Button
                  variant="ghost"
                  disabled={page >= pages || isLoading}
                  onClick={() => { const p = page + 1; setPage(p); fetchList(searchTerm, p); }}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  <th 
                    className="text-left px-6 py-4 text-xs font-semibold tracking-wider uppercase cursor-pointer hover:bg-opacity-80 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onClick={() => {
                      if (sortBy === 'id') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('id');
                        setSortOrder('asc');
                      }
                      setPage(1);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      {sortBy === 'id' && (
                        <span className="text-xs" style={{ color: 'var(--color-primary)' }}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left px-6 py-4 text-xs font-semibold tracking-wider uppercase cursor-pointer hover:bg-opacity-80 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onClick={() => {
                      if (sortBy === 'label') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('label');
                        setSortOrder('asc');
                      }
                      setPage(1);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Industry
                      {sortBy === 'label' && (
                        <span className="text-xs" style={{ color: 'var(--color-primary)' }}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left px-6 py-4 text-xs font-semibold tracking-wider uppercase cursor-pointer hover:bg-opacity-80 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onClick={() => {
                      if (sortBy === 'keywordsCount') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('keywordsCount');
                        setSortOrder('desc'); // Default to descending for keywords count
                      }
                      setPage(1);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Keywords
                      {sortBy === 'keywordsCount' && (
                        <span className="text-xs" style={{ color: 'var(--color-primary)' }}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-gray-light)' }}>
                {items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? '' : 'bg-opacity-50'} style={{ 
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-bg-secondary)' 
                  }}>
                    <td className="px-6 py-4 align-top font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.id}</td>
                    <td className="px-6 py-4 align-top">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.title}</span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {isGeneratingForIndustry(item.title) ? (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Generating...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {item.keywordsCount || 0}
                            {isRefreshing && (
                              <RefreshCw className="h-3 w-3 animate-spin opacity-50" />
                            )}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          disabled={isGeneratingForIndustry(item.title)}
                          onClick={() => generateFor(item.id, item.title)}
                          size="sm"
                        >
                          {isGeneratingForIndustry(item.title) ? (
                            <div className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Generating
                            </div>
                          ) : (
                            'Generate Keywords'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => viewKeywords(item)}
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Keywords
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(item.id)}
                          disabled={deletingId === item.id}
                          size="sm"
                          style={{ color: 'var(--color-error)' }}
                        >
                          {deletingId === item.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Delete Confirmation */}
                      {showDeleteConfirm === item.id && (
                        <div className="mt-2 p-2 rounded-lg border" style={{
                          backgroundColor: 'var(--color-error-light)',
                          borderColor: 'var(--color-error)'
                        }}>
                          <p className="text-sm mb-2" style={{ color: 'var(--color-error-dark)' }}>
                            Are you sure you want to delete "{item.title}"?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => deleteIndustry(item.id)}
                              disabled={deletingId === item.id}
                              style={{
                                backgroundColor: 'var(--color-error)',
                                color: 'white'
                              }}
                            >
                              {deletingId === item.id ? 'Deleting...' : 'Delete'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {items.length === 0 && !isLoading && (
        <Card padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
              backgroundColor: 'var(--color-bg-secondary)' 
            }}>
              <span className="text-2xl" style={{ color: 'var(--color-text-secondary)' }}>🔍</span>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {searchTerm ? 'No industries found' : 'No industries available'}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {searchTerm ? `No industries match "${searchTerm}". Try a different search term.` : 'There are no industries in the database yet.'}
            </p>
          </div>
        </Card>
      )}
    </>
  );



  // Keywords view
  const renderKeywordsView = () => (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Industry Keywords</h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            View existing keywords for {selectedIndustry?.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentView('list')}>
            Back to Industries
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm(`Are you sure you want to delete the industry "${selectedIndustry?.title}"? This will also delete all its keywords. This action cannot be undone.`)) {
                deleteIndustryFromKeywordsView();
              }
            }}
            style={{ color: 'var(--color-error)' }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Industry
          </Button>
        </div>
      </div>

      {loadingKeywords ? (
        <Card padding="lg">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" style={{ color: 'var(--color-text-secondary)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading keywords...</p>
          </div>
        </Card>
      ) : industryKeywords ? (
        <Card>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Keywords for {industryKeywords.label}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm px-2 py-1 rounded-full" style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  color: 'var(--color-text-secondary)' 
                }}>
                  {industryKeywords.totalKeywords} keywords
                </span>
                {industryKeywords.totalKeywords > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ALL ${industryKeywords.totalKeywords} keywords for "${industryKeywords.label}"? This action cannot be undone.`)) {
                        deleteAllKeywords();
                      }
                    }}
                    style={{ color: 'var(--color-error)' }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete All Keywords
                  </Button>
                )}
              </div>
            </div>

            {/* Add New Keyword */}
            <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-gray-light)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Plus className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Add New Keyword</h4>
              </div>
              
              {addingNewKeyword ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeywordText}
                    onChange={(e) => setNewKeywordText(e.target.value)}
                    placeholder="Enter new keyword..."
                    className="flex-1 px-3 py-2 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      backgroundColor: 'var(--color-bg-primary)', 
                      borderColor: 'var(--color-gray-light)',
                      color: 'var(--color-text-primary)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                    onKeyPress={(e) => e.key === 'Enter' && addNewKeyword()}
                  />
                  <Button
                    size="sm"
                    onClick={addNewKeyword}
                    disabled={!newKeywordText.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAddingNewKeyword(false);
                      setNewKeywordText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingNewKeyword(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Keyword
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {industryKeywords.keywords.map((keyword) => (
                <div key={keyword.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-gray-light)'
                }}>
                  {editingKeywordId === keyword.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingKeywordText}
                        onChange={(e) => setEditingKeywordText(e.target.value)}
                        className="flex-1 px-3 py-2 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{ 
                          backgroundColor: 'var(--color-bg-primary)', 
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--color-text-primary)',
                          '--tw-ring-color': 'var(--color-primary)'
                        } as any}
                        onKeyPress={(e) => e.key === 'Enter' && saveEditedKeyword(keyword.id)}
                      />
                      <Button
                        size="sm"
                        onClick={() => saveEditedKeyword(keyword.id)}
                        disabled={!editingKeywordText.trim()}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditingKeyword}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span style={{ color: 'var(--color-text-primary)' }}>{keyword.searchTerm}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${keyword.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {keyword.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {new Date(keyword.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingKeyword(keyword)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteKeyword(keyword.id)}
                          style={{ color: 'var(--color-error)' }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="text-center">
            <p style={{ color: 'var(--color-text-secondary)' }}>No keywords found for this industry.</p>
          </div>
        </Card>
      )}
    </>
  );

  // Main render
  useEffect(() => {
    fetchList(searchTerm, page);
  }, [searchTerm, page, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {renderBreadcrumb()}
      
      {currentView === 'list' && renderListView()}

      {currentView === 'keywords' && renderKeywordsView()}


    </div>
  );
}
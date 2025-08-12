'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface SearchSession {
  id: string;
  query: string | null;
  searchQueries: string[]; // Add this field to show all queries
  totalResults: number;
  status: string;
  createdAt: string;
}

interface SearchResult {
  id: string;
  position: number;
  title: string;
  url: string;
  displayUrl: string;
  description?: string;
  snippet?: string;
  query: string;
  date?: string;
  isProcessed: boolean;
  createdAt: string;
  llmProcessing: LLMProcessingResult[];
}

interface LLMProcessingSession {
  id: string;
  searchSessionId: string;
  totalResults: number;
  acceptedCount: number;
  rejectedCount: number;
  errorCount: number;
  extractionQuality: number;
  status: string;
  startTime: string;
  endTime?: string;
  createdAt: string;
}

interface LLMProcessingResult {
  id: string;
  searchResultId: string;
  llmProcessingSessionId: string;
  status: 'accepted' | 'rejected' | 'error';
  confidence?: number;
  isCompanyWebsite?: boolean;
  companyName?: string;
  website?: string;
  extractedFrom?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  categories?: string[];
  rejectionReason?: string;
  errorMessage?: string;
  llmPrompt: string;
  llmResponse: string;
  processingTime: number;
  createdAt: string;
  savedBusinessId?: number;
}

interface TraceabilityData {
  session: SearchSession;
  summary: {
    searchResults: number;
    processedResults: number;
    llmSessions: number;
    totalAccepted: number;
    totalRejected: number;
    totalErrors: number;
  };
  searchResults: SearchResult[];
  llmSessions: LLMProcessingSession[];
  llmResults: LLMProcessingResult[];
}

const TraceabilityViewer: React.FC = () => {
  const [sessions, setSessions] = useState<SearchSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TraceabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'details'>('sessions');
  const [showAllQueries, setShowAllQueries] = useState(false);
  const [sortField, setSortField] = useState<'createdAt' | 'query' | 'status' | 'totalResults'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state for detailed view tables
  const [srPage, setSrPage] = useState(1);
  const [srPerPage, setSrPerPage] = useState(25);
  const [llmPage, setLlmPage] = useState(1);
  const [llmPerPage, setLlmPerPage] = useState(25);

  useEffect(() => {
    fetchSessions();
  }, []);

  // Auto-open a session when linked via hash: #traceability?sessionId=<id>
  useEffect(() => {
    const tryOpenLinkedSession = async () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash || '';
      if (!hash.startsWith('#traceability')) return;
      const qsIndex = hash.indexOf('?');
      if (qsIndex === -1) return;
      const params = new URLSearchParams(hash.substring(qsIndex + 1));
      const sessionId = params.get('sessionId');
      if (sessionId) {
        await fetchSessionDetails(sessionId);
      }
    };
    tryOpenLinkedSession();
  }, [activeTab]);

  // Clear hash when switching back to sessions tab
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeTab === 'sessions' && window.location.hash.startsWith('#traceability')) {
      try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch {}
    }
  }, [activeTab]);

  // Clear hash when any link inside this view is clicked
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const anyEvt = e as any;
      const path = (anyEvt.composedPath && anyEvt.composedPath()) || [];
      let anchor: HTMLAnchorElement | null = null;
      for (const el of path as any[]) {
        if (el && (el as HTMLElement).tagName === 'A') { anchor = el as HTMLAnchorElement; break; }
      }
      if (!anchor) return;
      if (window.location.hash.startsWith('#traceability')) {
        try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch {}
      }
    };
    const root = document.getElementById('traceability-view-root') || document;
    root.addEventListener('click', handler, true);
    return () => root.removeEventListener('click', handler, true);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/industry-search/traceability?action=sessions');
      const data = await response.json();
      if (data.success) {
        setSessions(data.data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchSessionDetails = async (sessionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/industry-search/traceability?action=traceability&sessionId=${sessionId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedSession(data.data);
        setActiveTab('details');
        setShowAllQueries(false);
        // Reset pagination when opening a new session
        setSrPage(1);
        setLlmPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch session details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'createdAt' | 'query' | 'status' | 'totalResults') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedSessions = () => {
    return [...sessions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'query':
          aValue = (a.query || '').toLowerCase();
          bValue = (b.query || '').toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'totalResults':
          aValue = a.totalResults;
          bValue = b.totalResults;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getSortIcon = (field: 'createdAt' | 'query' | 'status' | 'totalResults') => {
    if (sortField !== field) {
      return '↕️';
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'secondary';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatProcessingTime = (time: number) => {
    return `${time.toFixed(2)}s`;
  };

  const renderLLMRow = (result: LLMProcessingResult) => {
    if (!selectedSession) return null;
    const searchResult = selectedSession.searchResults.find(sr => sr.id === result.searchResultId);
    return (
      <tr key={result.id} className="hover:bg-gray-50">
        {/* Status Column */}
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex flex-col items-start space-y-2">
            <Badge variant={result.status === 'accepted' ? 'success' : result.status === 'rejected' ? 'destructive' : 'warning'}>
              {result.status}
            </Badge>
            {result.confidence && (
              <Badge variant="outline" className="text-xs">
                {(result.confidence * 100).toFixed(0)}% confidence
              </Badge>
            )}
          </div>
        </td>

        {/* Input Data Column */}
        <td className="px-4 py-4">
          {searchResult ? (
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500">Title:</span>
                <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={searchResult.title}>
                  {searchResult.title}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">URL:</span>
                <div className="text-sm text-blue-600 max-w-xs truncate" title={searchResult.url}>
                  {searchResult.url}
                </div>
              </div>
              {searchResult.snippet && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Snippet:</span>
                  <div className="text-sm text-gray-600 max-w-xs truncate" title={searchResult.snippet}>
                    {searchResult.snippet}
                  </div>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-gray-500">Query:</span>
                <div className="text-sm text-gray-600">
                  {searchResult.query}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Search result not found</div>
          )}
        </td>

        {/* Extracted Data Column */}
        <td className="px-4 py-4">
          {result.status === 'accepted' ? (
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500">Company:</span>
                <div className="text-sm font-medium text-green-700">
                  {result.companyName || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Website:</span>
                <div className="text-sm font-medium text-blue-600">
                  {result.website || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Categories:</span>
                <div className="text-sm text-gray-600">
                  {result.categories?.join(', ') || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Location:</span>
                <div className="text-sm text-gray-600">
                  {[result.city, result.stateProvince, result.country].filter(Boolean).join(', ') || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Extracted From:</span>
                <div className="text-sm text-gray-600">
                  {result.extractedFrom || 'N/A'}
                </div>
              </div>
            </div>
          ) : result.status === 'rejected' ? (
            <div className="text-sm text-red-600">
              <strong>Rejected:</strong> {result.rejectionReason || 'No reason provided'}
            </div>
          ) : (
            <div className="text-sm text-red-600">
              <strong>Error:</strong> {result.errorMessage || 'Unknown error'}
            </div>
          )}
        </td>

        {/* Processing Details Column */}
        <td className="px-4 py-4">
          <div className="space-y-1 text-sm">
            <div><strong>Time:</strong> {formatProcessingTime(result.processingTime)}</div>
            <div><strong>Created:</strong> {formatDate(result.createdAt)}</div>
            <div><strong>ID:</strong> <span className="font-mono text-xs">{result.id.slice(-8)}</span></div>
          </div>
        </td>
      </tr>
    );
  };

  const sortedSessions = getSortedSessions();

  return (
    <div id="traceability-view-root" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Industry Search Traceability</h1>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'sessions' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('sessions')}
          >
            Search Sessions
          </Button>
          <Button
            variant={activeTab === 'details' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('details')}
            disabled={!selectedSession}
          >
            LLM Details
          </Button>
        </div>
      </div>

      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Sessions Overview</h2>
          
          {/* Tabular Format for Search Sessions */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Session ID
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('query')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Primary Query</span>
                      <span className="text-xs">{getSortIcon('query')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <span className="text-xs">{getSortIcon('status')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('totalResults')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Results</span>
                      <span className="text-xs">{getSortIcon('totalResults')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      <span className="text-xs">{getSortIcon('createdAt')}</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm">{session.id.slice(-8)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs truncate" title={session.query || 'N/A'}>
                        {session.query || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.totalResults}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSessionDetails(session.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'details' && selectedSession && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              LLM Traceability Details - Session {selectedSession.session.id.slice(-8)}
            </h2>
            <Button variant="outline" onClick={() => {
              setActiveTab('sessions');
              if (typeof window !== 'undefined' && window.location.hash.startsWith('#traceability')) {
                try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch {}
              }
            }}>
              ← Back to Sessions
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedSession.summary.searchResults}</div>
              <div className="text-sm text-gray-600">Search Results</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{selectedSession.summary.totalAccepted}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{selectedSession.summary.totalRejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{selectedSession.summary.llmSessions}</div>
              <div className="text-sm text-gray-600">LLM Sessions</div>
            </Card>
          </div>

          {/* Search Session Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Search Session Details</h3>
            <Card className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Session ID:</span>
                    <div className="font-mono text-sm">{selectedSession.session.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Status:</span>
                    <div className="font-medium">
                      <Badge variant={getStatusColor(selectedSession.session.status)}>
                        {selectedSession.session.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Primary Query:</span>
                    <div className="font-medium">{selectedSession.session.query || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Total Results:</span>
                    <div className="font-medium">{selectedSession.session.totalResults}</div>
                  </div>
                </div>
                
                {selectedSession.session.searchQueries && selectedSession.session.searchQueries.length > 0 && (
                  <div>
                    <span className="text-gray-600 text-sm">Search Queries:</span>
                    <div className="mt-2 space-y-1">
                      {/* Show first 3 queries */}
                      {selectedSession.session.searchQueries.slice(0, 3).map((query, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Query {index + 1}
                          </span>
                          <span className="font-medium">{query}</span>
                        </div>
                      ))}
                      
                      {/* Show "View More" if there are more than 3 queries */}
                      {selectedSession.session.searchQueries.length > 3 && !showAllQueries && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllQueries(true)}
                          className="mt-2"
                        >
                          View {selectedSession.session.searchQueries.length - 3} More Queries
                        </Button>
                      )}
                      
                      {/* Show all remaining queries when expanded */}
                      {showAllQueries && selectedSession.session.searchQueries.length > 3 && (
                        <>
                          {selectedSession.session.searchQueries.slice(3).map((query, index) => (
                            <div key={index + 3} className="flex items-center space-x-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Query {index + 4}
                              </span>
                              <span className="font-medium">{query}</span>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAllQueries(false)}
                            className="mt-2"
                          >
                            Show Less
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Created: {formatDate(selectedSession.session.createdAt)}
                </div>
              </div>
            </Card>
          </div>

          {/* Search Results - All URLs Found */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Search Results - All URLs Found</h3>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-sm">
                  Total Results: {selectedSession.searchResults.length}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Processed: {selectedSession.searchResults.filter(r => r.isProcessed).length}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Pending: {selectedSession.searchResults.filter(r => !r.isProcessed).length}
                </Badge>
              </div>
            </div>

            {/* Search Results Pagination Controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-600">
                {(() => {
                  const total = selectedSession.searchResults.length;
                  const start = total === 0 ? 0 : (srPage - 1) * srPerPage + 1;
                  const end = Math.min(srPage * srPerPage, total);
                  return `Showing ${start}-${end} of ${total}`;
                })()}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600">Per page:</label>
                <select
                  value={srPerPage}
                  onChange={(e) => { setSrPerPage(parseInt(e.target.value) || 25); setSrPage(1); }}
                  className="px-2 py-1 border rounded text-sm"
                  style={{ borderColor: 'var(--color-gray-light)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => setSrPage(1)} disabled={srPage === 1}>First</Button>
                  <Button variant="outline" size="sm" onClick={() => setSrPage(p => Math.max(1, p - 1))} disabled={srPage === 1}>Prev</Button>
                  <span className="text-xs text-gray-600">
                    {(() => {
                      const totalPages = Math.max(1, Math.ceil(selectedSession.searchResults.length / srPerPage));
                      return `Page ${srPage} of ${totalPages}`;
                    })()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSrPage(p => {
                      const totalPages = Math.max(1, Math.ceil(selectedSession.searchResults.length / srPerPage));
                      return Math.min(totalPages, p + 1);
                    })}
                    disabled={srPage >= Math.max(1, Math.ceil(selectedSession.searchResults.length / srPerPage))}
                  >Next</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSrPage(Math.max(1, Math.ceil(selectedSession.searchResults.length / srPerPage)))}
                    disabled={srPage >= Math.max(1, Math.ceil(selectedSession.searchResults.length / srPerPage))}
                  >Last</Button>
                </div>
              </div>
            </div>
            
            {selectedSession.searchResults.length === 0 ? (
              <Card className="p-4 text-center text-gray-500">
                <div className="text-lg font-medium">No Search Results Found</div>
                <div className="text-sm">This search session did not return any results.</div>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Row
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Title & URL
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Snippet
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Query Used
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Processing Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Date Found
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedSession.searchResults
                      .slice((srPage - 1) * srPerPage, (srPage - 1) * srPerPage + srPerPage)
                      .map((result, idx) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        {/* Position Column */}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                              {(srPage - 1) * srPerPage + idx + 1}
                            </span>
                          </div>
                        </td>

                        {/* Title & URL Column */}
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2" title={result.title}>
                                {result.title}
                              </h4>
                            </div>
                            <div>
                              <a 
                                href={result.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 break-all"
                              >
                                {result.url}
                              </a>
                            </div>
                            {result.displayUrl && result.displayUrl !== result.url && (
                              <div>
                                <span className="text-xs text-gray-500">Display URL:</span>
                                <div className="text-xs text-gray-600 font-mono">
                                  {result.displayUrl}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Snippet Column */}
                        <td className="px-4 py-4">
                          <div className="max-w-xs">
                            {result.snippet ? (
                              <p className="text-sm text-gray-700 line-clamp-4" title={result.snippet}>
                                {result.snippet}
                              </p>
                            ) : result.description ? (
                              <p className="text-sm text-gray-700 line-clamp-4" title={result.description}>
                                {result.description}
                              </p>
                            ) : (
                              <span className="text-sm text-gray-400 italic">No snippet available</span>
                            )}
                          </div>
                        </td>

                        {/* Query Used Column */}
                        <td className="px-4 py-4">
                          <div className="max-w-xs">
                            <span className="text-xs text-gray-500">Search Query:</span>
                            <div className="text-sm text-gray-900 font-medium">
                              {result.query}
                            </div>
                            <div className="text-xs text-gray-500">Google position: {result.position}</div>
                          </div>
                        </td>

                        {/* Processing Status Column */}
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <div>
                              <Badge variant={result.isProcessed ? 'success' : 'warning'}>
                                {result.isProcessed ? 'Processed' : 'Pending'}
                              </Badge>
                            </div>
                            {result.llmProcessing && result.llmProcessing.length > 0 && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">LLM Results:</span>
                                <div className="mt-1 space-y-1">
                                  {result.llmProcessing.map((llmResult, index) => (
                                    <div key={llmResult.id} className="flex items-center space-x-2">
                                      <Badge 
                                        variant={llmResult.status === 'accepted' ? 'success' : llmResult.status === 'rejected' ? 'destructive' : 'warning'}
                                        className="text-xs"
                                      >
                                        {llmResult.status}
                                      </Badge>
                                      {llmResult.confidence && (
                                        <span className="text-xs text-gray-500">
                                          {(llmResult.confidence * 100).toFixed(0)}%
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Date Found Column */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              {formatDate(result.createdAt)}
                            </div>
                            {result.date && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Google Date:</span>
                                <div>{result.date}</div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* LLM Processing Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">LLM Processing Sessions</h3>
            {selectedSession.llmSessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Session {session.id.slice(-8)}</h4>
                    <Badge variant={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Results:</span>
                      <div className="font-medium">{session.totalResults}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Accepted:</span>
                      <div className="font-medium text-green-600">{session.acceptedCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Rejected:</span>
                      <div className="font-medium text-red-600">{session.rejectedCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Quality:</span>
                      <div className="font-medium">{(session.extractionQuality * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(session.createdAt)}
                    {session.endTime && ` | Completed: ${formatDate(session.endTime)}`}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Individual LLM Processing Results - Tabular Format */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">LLM Processing Results - Data Flow Analysis</h3>
            {/* LLM Results Pagination Controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-600">
                {(() => {
                  const total = selectedSession.llmResults.length;
                  const start = total === 0 ? 0 : (llmPage - 1) * llmPerPage + 1;
                  const end = Math.min(llmPage * llmPerPage, total);
                  return `Showing ${start}-${end} of ${total}`;
                })()}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600">Per page:</label>
                <select
                  value={llmPerPage}
                  onChange={(e) => { setLlmPerPage(parseInt(e.target.value) || 25); setLlmPage(1); }}
                  className="px-2 py-1 border rounded text-sm"
                  style={{ borderColor: 'var(--color-gray-light)', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => setLlmPage(1)} disabled={llmPage === 1}>First</Button>
                  <Button variant="outline" size="sm" onClick={() => setLlmPage(p => Math.max(1, p - 1))} disabled={llmPage === 1}>Prev</Button>
                  <span className="text-xs text-gray-600">
                    {(() => {
                      const totalPages = Math.max(1, Math.ceil(selectedSession.llmResults.length / llmPerPage));
                      return `Page ${llmPage} of ${totalPages}`;
                    })()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLlmPage(p => {
                      const totalPages = Math.max(1, Math.ceil(selectedSession.llmResults.length / llmPerPage));
                      return Math.min(totalPages, p + 1);
                    })}
                    disabled={llmPage >= Math.max(1, Math.ceil(selectedSession.llmResults.length / llmPerPage))}
                  >Next</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLlmPage(Math.max(1, Math.ceil(selectedSession.llmResults.length / llmPerPage)))}
                    disabled={llmPage >= Math.max(1, Math.ceil(selectedSession.llmResults.length / llmPerPage))}
                  >Last</Button>
                </div>
              </div>
            </div>

            {selectedSession.llmResults.length === 0 ? (
              <Card className="p-4 text-center text-gray-500">
                <div className="space-y-2">
                  <div className="text-lg font-medium">No Individual LLM Results Found</div>
                  <div className="text-sm">
                    This indicates that the system is not recording individual results during processing.
                  </div>
                  <div className="text-xs text-gray-400">
                    The LLM sessions are being created, but individual processing results are not being saved.
                    This suggests there may be an issue with the traceability recording system.
                  </div>
                </div>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Input Data (Passed to LLM)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Extracted Data (LLM Response)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Processing Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedSession.llmResults
                      .slice((llmPage - 1) * llmPerPage, (llmPage - 1) * llmPerPage + llmPerPage)
                      .map(renderLLMRow)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TraceabilityViewer;

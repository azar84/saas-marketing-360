'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import SearchResultEnrichment from '@/components/ui/SearchResultEnrichment';
import SearchResultCheckbox from '@/components/ui/SearchResultCheckbox';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';

interface SearchSession {
  id: string;
  query: string | null;
  searchQueries: string[];
  totalResults: number;
  status: string;
  createdAt: string;
  industry?: string | null;
  location?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  country?: string | null;
  searchResults?: SearchResult[];
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
}

interface SessionTraceabilityResponse {
  session: SearchSession;
  summary: {
    message: string;
  };
}

const SearchData: React.FC = () => {
  const [sessions, setSessions] = useState<SearchSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SearchSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'details'>('sessions');
  const [sortField, setSortField] = useState<'createdAt' | 'query' | 'status' | 'totalResults'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterIndustry, setFilterIndustry] = useState<string>('');
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);

  useEffect(() => {
    fetchSessions();
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
        setSelectedSession(data.data.session);
        setActiveTab('details');
        setCurrentPage(1);
        setSelectedResults(new Set());
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
    let filteredSessions = [...sessions];

    // Apply location filter
    if (filterLocation) {
      filteredSessions = filteredSessions.filter(session => 
        session.city?.toLowerCase().includes(filterLocation.toLowerCase()) ||
        session.stateProvince?.toLowerCase().includes(filterLocation.toLowerCase()) ||
        session.country?.toLowerCase().includes(filterLocation.toLowerCase()) ||
        session.location?.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    // Apply industry filter
    if (filterIndustry) {
      filteredSessions = filteredSessions.filter(session => 
        session.industry?.toLowerCase().includes(filterIndustry.toLowerCase())
      );
    }

    // Apply sorting
    return filteredSessions.sort((a, b) => {
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

  const getLocationDisplay = (session: SearchSession) => {
    const parts = [
      session.city,
      session.stateProvince,
      session.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'No location specified';
  };

  const sortedSessions = getSortedSessions();

  // Pagination helpers for search results in the selected session
  const totalResultsCount = selectedSession?.searchResults?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalResultsCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResultsCount);
  const pageResults = selectedSession?.searchResults?.slice(startIndex, endIndex) || [];

  const handleSelectCurrentPage = () => {
    if (!pageResults.length) return;
    const next = new Set(selectedResults);
    pageResults.forEach(r => next.add(r.url));
    setSelectedResults(next);
  };

  const handleClearCurrentPage = () => {
    if (!pageResults.length) return;
    const next = new Set(selectedResults);
    pageResults.forEach(r => next.delete(r.url));
    setSelectedResults(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Search Data</h1>
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
            Session Details
          </Button>
        </div>
      </div>

      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Sessions Overview</h2>
          
          {/* Filters */}
          <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Filter by Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/4 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="City, State, or Country..."
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-bg-primary)',
                      borderColor: 'var(--color-gray-light)',
                      color: 'var(--color-text-primary)',
                      boxShadow: '0 0 0 0 rgba(0,0,0,0)'
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Filter by Industry</label>
                <input
                  type="text"
                  placeholder="Industry name..."
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterLocation('');
                    setFilterIndustry('');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Sessions Table */}
          <Card className="overflow-x-auto" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)' }}>
            <table className="min-w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-gray-light)' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Session ID
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                    style={{ color: 'var(--color-text-primary)' }}
                    onClick={() => handleSort('query')}
                  >
                    <div className="flex items-center space-x-1">
                      <Search className="w-4 h-4" />
                      <span>Primary Query</span>
                      <span className="text-xs">{getSortIcon('query')}</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Industry
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                    style={{ color: 'var(--color-text-primary)' }}
                    onClick={() => handleSort('totalResults')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Results</span>
                      <span className="text-xs">{getSortIcon('totalResults')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
                    style={{ color: 'var(--color-text-primary)' }}
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created</span>
                      <span className="text-xs">{getSortIcon('createdAt')}</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSessions.map((session, index) => (
                  <tr 
                    key={session.id || `session-${session.createdAt}`}
                    className="transition-colors"
                    style={{ 
                      backgroundColor: 'var(--color-bg-primary)',
                      borderTop: index > 0 ? '1px solid var(--color-gray-light)' : 'none'
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--color-bg-secondary)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--color-bg-primary)'; }}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm">{session.id ? session.id.slice(-8) : 'N/A'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs truncate" title={session.query || 'N/A'}>
                        {session.query || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-sm">{getLocationDisplay(session)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {session.industry ? (
                          <Badge variant="outline">{session.industry}</Badge>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>Not specified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {session.totalResults}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-secondary)' }}>
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
          </Card>

          {sortedSessions.length === 0 && (
            <Card className="p-8 text-center text-gray-500">
              <div className="text-lg font-medium">No search sessions found</div>
              <div className="text-sm">
                {filterLocation || filterIndustry ? 'Try adjusting your filters.' : 'No search sessions have been created yet.'}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'details' && selectedSession && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Search Session Details - {selectedSession.id ? selectedSession.id.slice(-8) : 'N/A'}
            </h2>
            <div className="flex items-center gap-3">
              {selectedResults.size > 0 && (
                <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {selectedResults.size} result{selectedResults.size === 1 ? '' : 's'} selected for enrichment
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setActiveTab('sessions')}
              >
                ← Back to Sessions
              </Button>
            </div>
          </div>

          {/* Session Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4 text-center" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
              <div className="text-2xl font-bold" style={{ color: colors.info }}>{selectedSession.totalResults}</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Total Results</div>
            </Card>
            <Card className="p-4 text-center" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
              <div className="text-2xl font-bold" style={{ color: colors.success }}>{selectedSession.searchQueries?.length || 0}</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Search Queries</div>
            </Card>
            <Card className="p-4 text-center" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
              <div className="text-2xl font-bold" style={{ color: colors.accent }}>
                {selectedSession.industry ? 'Yes' : 'No'}
              </div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Industry Specified</div>
            </Card>
            <Card className="p-4 text-center" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
              <div className="text-2xl font-bold" style={{ color: colors.warning }}>
                {getLocationDisplay(selectedSession) ? 'Yes' : 'No'}
              </div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Location Specified</div>
            </Card>
          </div>

          {/* Session Details (Container Card: Secondary background per nested pattern) */}
          <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border }}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Session Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Session ID:</span>
                  <div className="font-mono text-sm">{selectedSession.id || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Status:</span>
                  <div className="font-medium">
                    <Badge variant={getStatusColor(selectedSession.status)}>
                      {selectedSession.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Primary Query:</span>
                  <div className="font-medium">{selectedSession.query || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Industry:</span>
                  <div className="font-medium">
                    {selectedSession.industry ? (
                      <Badge variant="outline">{selectedSession.industry}</Badge>
                    ) : (
                      'Not specified'
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Location:</span>
                  <div className="font-medium">{getLocationDisplay(selectedSession)}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Created:</span>
                  <div className="font-medium">{formatDate(selectedSession.createdAt)}</div>
                </div>
              </div>
              
              {/* Search Queries */}
              {selectedSession.searchQueries && selectedSession.searchQueries.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">All Search Queries:</span>
                  <div className="mt-2 space-y-2">
                    {selectedSession.searchQueries.map((query, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Query {index + 1}
                        </span>
                        <span className="font-medium">{query}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {selectedSession.searchResults && selectedSession.searchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Search Results ({selectedSession.searchResults.length})</h3>
                  
                  {/* Enrichment Controls */}
                  <SearchResultEnrichment
                    searchResults={pageResults}
                    selectedResults={selectedResults}
                    onSelectionChange={setSelectedResults}
                    onEnrichmentSubmitted={(count) => {
                      console.log(`Enrichment jobs submitted: ${count}`);
                    }}
                    className="mb-6"
                  />
                  
                  {/* Results Summary */}
                  <Card className="p-4 mb-4" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: colors.info }}>{selectedSession.searchResults.length}</div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>Total Results</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: colors.success }}>
                          {selectedSession.searchResults.filter(r => r.isProcessed).length}
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>Processed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: colors.warning }}>
                          {selectedSession.searchResults.filter(r => !r.isProcessed).length}
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: colors.accent }}>
                          {Math.round(selectedSession.searchResults.reduce((sum, r) => sum + r.position, 0) / selectedSession.searchResults.length)}
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>Avg Position</div>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="space-y-4">
                    {pageResults.map((result, index) => (
                      <Card key={result.id || index} className="p-4" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
                        <div className="space-y-3">
                          {/* Result Header with Selection */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: colors.backgroundSecondary, color: colors.textPrimary }}>
                                  Position #{result.position}
                                </span>
                                <Badge variant={result.isProcessed ? 'success' : 'warning'}>
                                  {result.isProcessed ? 'Processed' : 'Pending'}
                                </Badge>
                              </div>
                              <h4 className="text-lg font-semibold mb-1" style={{ color: colors.textPrimary }}>
                                <a 
                                  href={result.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="transition-colors"
                                  style={{ color: colors.textPrimary }}
                                >
                                  {result.title}
                                </a>
                              </h4>
                              <div className="text-sm font-mono mb-2" style={{ color: colors.success }}>
                                {result.displayUrl}
                              </div>
                            </div>
                            <div className="text-right text-xs ml-4" style={{ color: colors.textMuted }}>
                              <div className="mb-1">
                                <span className="font-medium">Created:</span>
                                <div>{formatDate(result.createdAt)}</div>
                              </div>
                              {result.date && (
                                <div>
                                  <span className="font-medium">Google Date:</span>
                                  <div>{result.date}</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Selection Checkbox */}
                          <div className="border-t pt-3">
                            <SearchResultCheckbox
                              url={result.url}
                              isSelected={selectedResults.has(result.url)}
                              onToggle={(url) => {
                                const newSelection = new Set(selectedResults);
                                if (newSelection.has(url)) {
                                  newSelection.delete(url);
                                } else {
                                  newSelection.add(url);
                                }
                                setSelectedResults(newSelection);
                              }}
                            />
                          </div>

                          {/* Result Content */}
                          <div className="space-y-2">
                            {/* Snippet/Description */}
                            {result.snippet && (
                              <div>
                                <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Snippet:</span>
                                <p className="text-sm mt-1" style={{ color: colors.textPrimary }}>{result.snippet}</p>
                              </div>
                            )}
                            {result.description && !result.snippet && (
                              <div>
                                <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Description:</span>
                                <p className="text-sm mt-1" style={{ color: colors.textPrimary }}>{result.description}</p>
                              </div>
                            )}

                            {/* Search Query Used */}
                            <div>
                              <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Search Query Used:</span>
                              <div className="text-sm font-medium mt-1 px-2 py-1 rounded" style={{ color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }}>
                                "{result.query}"
                              </div>
                            </div>

                            {/* Result Metadata */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t" style={{ borderColor: colors.border }}>
                              <div>
                                <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Result ID:</span>
                                <div className="text-xs font-mono mt-1" style={{ color: colors.textPrimary }}>
                                  {result.id ? result.id.slice(-8) : 'N/A'}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Position:</span>
                                <div className="text-sm font-medium mt-1" style={{ color: colors.textPrimary }}>
                                  #{result.position}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Status:</span>
                                <div className="mt-1">
                                  <Badge variant={result.isProcessed ? 'success' : 'warning'} size="sm">
                                    {result.isProcessed ? 'Processed' : 'Pending'}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Processing:</span>
                                <div className="text-sm mt-1" style={{ color: colors.textPrimary }}>
                                  {result.isProcessed ? 'Completed' : 'Not Started'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalResultsCount > 0 && (
                    <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: colors.textSecondary }}>Rows per page</span>
                        <select
                          className="border rounded-md px-2 py-1"
                          style={{ borderColor: colors.border, backgroundColor: colors.backgroundPrimary, color: colors.textPrimary }}
                          value={pageSize}
                          onChange={(e) => {
                            const newSize = parseInt(e.target.value, 10);
                            setPageSize(newSize);
                            setCurrentPage(1);
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        {startIndex + 1}-{endIndex} of {totalResultsCount}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={safeCurrentPage <= 1}
                        >
                          Prev
                        </Button>
                        <span className="text-sm" style={{ color: colors.textSecondary }}>Page {safeCurrentPage} of {totalPages}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={safeCurrentPage >= totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Page-level selection controls */}
                  {pageResults.length > 0 && (
                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleSelectCurrentPage}>
                        Select all in this page ({pageResults.length})
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleClearCurrentPage}>
                        Clear this page
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Debug Information (Inner Content Card: Primary background per nested pattern) */}
              <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium" style={{ color: colors.textPrimary }}>
                    🔍 Debug: Raw API Response Data
                  </summary>
                  <div className="mt-3 p-3 rounded border text-xs font-mono overflow-auto max-h-96" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }}>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedSession, null, 2)}
                    </pre>
                  </div>
                </details>
              </Card>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchData;

'use client';

import React, { useState, useEffect } from 'react';
import { Search, Globe, ExternalLink, Copy, RefreshCw, Settings, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SearchResult {
  position: number;
  title: string;
  url: string;
  displayUrl: string;
  fullUrl: string;
  description: string;
  cacheId?: string;
  query?: string; // Added for multiple query results
}

interface SearchEngineConfig {
  apiKey: string;
  searchEngineId: string;
  resultsLimit: number;
}

interface PaginationInfo {
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface SearchFilters {
  excludeDirectories: boolean;
  excludeForums: boolean;
  excludeSocialMedia: boolean;
  excludeNewsSites: boolean;
  excludeBlogs: boolean;
}

export default function SearchEngineManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [isMultipleSearch, setIsMultipleSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQueryIndex, setCurrentQueryIndex] = useState<number>(0);
  const [totalQueries, setTotalQueries] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<SearchEngineConfig>({
    apiKey: '',
    searchEngineId: '',
    resultsLimit: 10  // Changed from 25 to 10 to comply with Google API limits
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0); // Add separate state for totalResults

  const [filters, setFilters] = useState<SearchFilters>({
    excludeDirectories: true,
    excludeForums: true,
    excludeSocialMedia: true,
    excludeNewsSites: false,
    excludeBlogs: false
  });

  // Auto-hide config if credentials are already set
  const [showConfig, setShowConfig] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Initialize config from environment variables on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      console.log('=== CONFIG DEBUG START ===');
      try {
        setIsLoadingConfig(true);
        console.log('Fetching config from API...');
        
        const response = await fetch('/api/admin/search-engine/config');
        console.log('Config API response status:', response.status);
        
        const data = await response.json();
        console.log('Config API response data:', data);
        
        if (data.success && data.config.hasCredentials) {
          console.log('Config loaded successfully, setting credentials');
          setConfig(prev => ({
            ...prev,
            apiKey: data.config.apiKey,
            searchEngineId: data.config.searchEngineId
          }));
          setShowConfig(false);
          setConfigLoaded(true);
          // Clear any existing errors when config loads successfully
          setError(null);
          console.log('Config state updated, credentials set');
        } else {
          console.log('No credentials found, keeping config panel visible');
          // If no credentials, keep config panel visible
          setShowConfig(true);
          setConfigLoaded(true);
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
        // Keep config panel visible if we can't fetch config
        setShowConfig(true);
        setConfigLoaded(true);
        // Clear any existing errors when config loading completes
        setError(null);
      } finally {
        setIsLoadingConfig(false);
        console.log('=== CONFIG DEBUG END ===');
      }
    };

    fetchConfig();
  }, []);

  const performSearch = async (page: number = 1) => {
    console.log('=== SEARCH DEBUG START ===');
    console.log('Current config state:', {
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'missing',
      searchEngineId: config.searchEngineId ? `${config.searchEngineId.substring(0, 10)}...` : 'missing',
      resultsLimit: config.resultsLimit,
      configLoaded,
      page
    });
    
    if (!configLoaded) {
      console.log('Search blocked: Config not loaded');
      setError('Configuration is still loading. Please wait...');
      return;
    }

    if (!config.apiKey || !config.searchEngineId) {
      console.log('Search blocked: Missing credentials');
      setError('Please configure your Google Custom Search API credentials');
      return;
    }

    if (!isMultipleSearch && !searchQuery.trim()) {
      console.log('Search blocked: No query');
      setError('Please enter a search query');
      return;
    }

    if (isMultipleSearch && searchQueries.length === 0) {
      console.log('Search blocked: No multiple queries');
      setError('Please enter multiple search queries');
      return;
    }

    console.log('Starting search with config:', {
      query: searchQuery,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'missing',
      searchEngineId: config.searchEngineId ? `${config.searchEngineId.substring(0, 10)}...` : 'missing',
      resultsLimit: config.resultsLimit,
      page
    });

    setIsLoading(true);
    setError(null);
    
    // Set progress indicators for multiple queries
    if (isMultipleSearch) {
      setTotalQueries(searchQueries.length);
      setCurrentQueryIndex(0);
    }

    setSearchResults([]);
    setCurrentPage(page);
    
    // Reset pagination if this is a new search (page 1)
    if (page === 1) {
      setPagination(null);
    }

    try {
      // Prepare request body based on search type
      const requestBody = isMultipleSearch 
        ? {
            queries: searchQueries,
            resultsLimit: config.resultsLimit,
            filters: filters,
            page: page
          }
        : {
            query: searchQuery,
            resultsLimit: config.resultsLimit,
            filters: filters,
            page: page
          };

      console.log('Sending request to API:', {
        ...requestBody,
        apiKey: requestBody.apiKey ? '***' : 'missing',
        searchEngineId: requestBody.searchEngineId ? '***' : 'missing'
      });

      // For multiple queries, simulate progress updates
      if (isMultipleSearch) {
        const progressInterval = setInterval(() => {
          setCurrentQueryIndex(prev => {
            if (prev < searchQueries.length - 1) {
              return prev + 1;
            }
            return prev;
          });
        }, 1000); // Update every second to match backend rate limiting

        // Clear interval after a reasonable time
        setTimeout(() => clearInterval(progressInterval), (searchQueries.length + 5) * 1000);
      }
      
      const response = await fetch('/api/admin/search-engine/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Search API response status:', response.status);
      console.log('Search API response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Search API response data:', data);

      if (!response.ok) {
        console.log('Response not OK, throwing error:', data.error);
        throw new Error(data.error || 'Search failed');
      }

      if (data.success) {
        setSearchResults(data.results);
        setPagination(data.pagination);
        // Ensure totalResults is always a valid number
        const results = parseInt(data.totalResults) || data.results.length || 0;
        setTotalResults(results);
        console.log('Search results set:', data.results.length, 'results, totalResults:', results);
        
        // Reset progress indicators
        if (isMultipleSearch) {
          setCurrentQueryIndex(0);
          setTotalQueries(0);
        }
      } else {
        console.log('Search not successful, throwing error:', data.message);
        throw new Error(data.message || 'Search failed');
        setPagination(null);
      }
    } catch (err: any) {
      console.error('Search error caught:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message || 'An error occurred during search');
      setPagination(null);
      
      // Reset progress indicators on error
      if (isMultipleSearch) {
        setCurrentQueryIndex(0);
        setTotalQueries(0);
      }
    } finally {
      setIsLoading(false);
      console.log('=== SEARCH DEBUG END ===');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && configLoaded && searchQuery.trim()) {
      performSearch();
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      performSearch(newPage);
    }
  };

  const handleResultsPerPageChange = (newLimit: number) => {
    setConfig(prev => ({ ...prev, resultsLimit: newLimit }));
    setCurrentPage(1);
    if (searchQuery.trim()) {
      performSearch(1);
    }
  };

  const updateConfig = (field: keyof SearchEngineConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Search Engine Manager
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Perform Google Custom Search queries and view results
          </p>
          {isLoadingConfig ? (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-info)' }}></div>
              <span className="text-sm" style={{ color: 'var(--color-info)' }}>
                Loading configuration...
              </span>
            </div>
          ) : config.apiKey && config.searchEngineId ? (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
              <span className="text-sm" style={{ color: 'var(--color-success)' }}>
                API credentials configured and ready
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }}></div>
              <span className="text-sm" style={{ color: 'var(--color-warning)' }}>
                Please configure your API credentials
              </span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2"
        >
          {showConfig ? <EyeOff className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
          {showConfig ? 'Hide Config' : 'Show Config'}
        </Button>
      </div>

      {/* Filters Panel */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          {showFilters ? <EyeOff className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Search Filters
            </CardTitle>
            <CardDescription>
              Configure what types of sites to exclude from search results. Directory filter removes business directories, review sites, and social platforms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="excludeDirectories"
                  checked={filters.excludeDirectories}
                  onChange={(e) => setFilters(prev => ({ ...prev, excludeDirectories: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="excludeDirectories" className="text-sm font-medium">
                  Exclude Directories (BBB, Yellow Pages, Yelp, LinkedIn, etc.)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="excludeForums"
                  checked={filters.excludeForums}
                  onChange={(e) => setFilters(prev => ({ ...prev, excludeForums: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="excludeForums" className="text-sm font-medium">
                  Exclude Forums (Reddit, Community sites)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="excludeSocialMedia"
                  checked={filters.excludeSocialMedia}
                  onChange={(e) => setFilters(prev => ({ ...prev, excludeSocialMedia: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="excludeSocialMedia" className="text-sm font-medium">
                  Exclude Social Media
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="excludeNewsSites"
                  checked={filters.excludeNewsSites}
                  onChange={(e) => setFilters(prev => ({ ...prev, excludeNewsSites: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="excludeNewsSites" className="text-sm font-medium">
                  Exclude News Sites
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="excludeBlogs"
                  checked={filters.excludeBlogs}
                  onChange={(e) => setFilters(prev => ({ ...prev, excludeBlogs: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="excludeBlogs" className="text-sm font-medium">
                  Exclude Blogs
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Panel */}
      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Google Custom Search Configuration
            </CardTitle>
            <CardDescription>
              Configure your Google Custom Search API credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  API Key
                </label>
                <Input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => updateConfig('apiKey', e.target.value)}
                  placeholder="Enter your Google API key"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Search Engine ID
                </label>
                <Input
                  value={config.searchEngineId}
                  onChange={(e) => updateConfig('searchEngineId', e.target.value)}
                  placeholder="Enter your Custom Search Engine ID"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Results Limit
              </label>
              <Input
                type="number"
                value={config.resultsLimit}
                onChange={(e) => updateConfig('resultsLimit', parseInt(e.target.value) || 10)}
                min="1"
                max="100"
                className="w-32"
              />
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <p>💡 Get your API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Google Cloud Console</a></p>
              <p>💡 Get your Search Engine ID from <a href="https://cse.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Google Custom Search</a></p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Interface */}
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Search Type Toggle */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isMultipleSearch}
                  onChange={(e) => setIsMultipleSearch(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Multiple Queries</span>
              </label>
            </div>

            {/* Single Query Input */}
            {!isMultipleSearch && (
              <div>
                <label htmlFor="searchQuery" className="block text-sm font-medium mb-2">
                  Search Query
                </label>
                <input
                  id="searchQuery"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your search query..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!configLoaded}
                />
              </div>
            )}

            {/* Multiple Queries Input */}
            {isMultipleSearch && (
              <div>
                <label htmlFor="searchQueries" className="block text-sm font-medium mb-2">
                  Search Queries (one per line)
                </label>
                <textarea
                  id="searchQueries"
                  value={searchQueries.join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim());
                    setSearchQueries(lines);
                  }}
                  placeholder="Enter multiple search queries, one per line...&#10;Example:&#10;nodejs tutorials&#10;express framework&#10;mongodb best practices"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  disabled={!configLoaded}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Each query will be processed separately with 1-second delays between requests to respect Google's rate limits.
                </p>
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={() => performSearch()}
              disabled={isLoading || !configLoaded || (!isMultipleSearch && !searchQuery.trim()) || (isMultipleSearch && searchQueries.length === 0)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : !configLoaded ? 'Loading...' : 'Search'}
            </button>

            {/* Progress Indicator for Multiple Queries */}
            {isLoading && isMultipleSearch && totalQueries > 0 && (
              <div className="mt-4 p-3 border rounded-lg" style={{ borderColor: 'var(--color-gray-light)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processing Queries</span>
                  <span className="text-sm text-gray-600">
                    {currentQueryIndex + 1} of {totalQueries}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQueryIndex + 1) / totalQueries) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Current: "{searchQueries[currentQueryIndex] || 'Unknown'}"</span>
                  <span>Est. time: ~{totalQueries} seconds</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Per Page Selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="resultsPerPage" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Results per page:
            </label>
            <select
              id="resultsPerPage"
              value={config.resultsLimit}
              onChange={(e) => handleResultsPerPageChange(parseInt(e.target.value))}
              className="px-3 py-2 rounded-md border text-sm"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)', 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Max 1000 results per request • Google CSE supports up to 10 pages
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-lg border" style={{ 
              backgroundColor: 'var(--color-error-light)', 
              borderColor: 'var(--color-error)',
              color: 'var(--color-error-dark)' 
            }}>
              <p className="font-medium">Search Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Search Results ({searchResults.length})
            </CardTitle>
            <CardDescription>
              Found {searchResults.length} results for "{searchQuery}"
              {pagination && (
                <span className="block text-xs mt-1 opacity-75">
                  Page {pagination.currentPage} of {pagination.totalPages} • Total: {totalResults > 1000 ? `${(totalResults || 0).toLocaleString()}+ (showing first 1000)` : (totalResults || 0).toLocaleString()} results
                </span>
              )}
              {searchResults.length > 0 && (
                <span className="block text-xs mt-1 opacity-75">
                  Filters applied: {Object.entries(filters).filter(([_, value]) => value).map(([key, _]) => key.replace('exclude', '').toLowerCase()).join(', ')}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Individual Query Results (for multiple queries) */}
            {isMultipleSearch && searchResults.length > 0 && (
              <div className="mb-6 p-4 border rounded-lg" style={{ borderColor: 'var(--color-gray-light)' }}>
                <h3 className="text-lg font-semibold mb-3">Query Breakdown</h3>
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-blue-600">Query:</span> "{result.query || 'Unknown'}"
                      <span className="mx-2">•</span>
                      <span className="text-gray-600">Position {result.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="space-y-4">
                {searchResults.map((result) => (
                  <div
                    key={result.cacheId || result.url}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    style={{ borderColor: 'var(--color-gray-light)' }}
                  >
                    {/* Query Label (for multiple queries) */}
                    {isMultipleSearch && result.query && (
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full" style={{
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary-dark)'
                        }}>
                          Query: {result.query}
                        </span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {result.title}
                          </a>
                        </h3>
                        <span className="text-sm text-gray-500">#{result.position}</span>
                      </div>
                      
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {result.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {result.displayUrl}
                        </a>
                        
                        {result.cacheId && (
                          <a
                            href={`https://webcache.googleusercontent.com/search?q=cache:${result.cacheId}:${result.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:underline"
                          >
                            Cached
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6">
                <div className="mb-4 p-3 rounded-lg text-sm" style={{ 
                  backgroundColor: 'var(--color-warning-light)', 
                  color: 'var(--color-warning-dark)',
                  border: '1px solid var(--color-warning)'
                }}>
                  ⚠️ <strong>Note:</strong> Google Custom Search Engine supports a maximum of 10 pages. 
                  {totalResults > 1000 && ` You've reached this limit with ${(totalResults || 0).toLocaleString()} total results.`}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Showing {((pagination.currentPage - 1) * pagination.resultsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.resultsPerPage, totalResults || 0)} of {totalResults > 1000 ? '1000+' : (totalResults || 0)} results
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={!pagination.hasPreviousPage}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!pagination.hasNextPage}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && searchResults.length === 0 && searchQuery && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
              backgroundColor: 'var(--color-bg-secondary)' 
            }}>
              <Search className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              No results found
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Try adjusting your search query or check your API configuration
            </p>
            <div className="text-xs p-3 rounded-lg" style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-muted)'
            }}>
              <p>💡 <strong>Search Tips:</strong></p>
              <p>• Use specific keywords for better results</p>
              <p>• Try different search terms if no results appear</p>
              <p>• Check that your Google Custom Search API is properly configured</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Search Query State */}
      {!isLoading && !error && searchResults.length === 0 && !searchQuery && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
              backgroundColor: 'var(--color-bg-secondary)' 
            }}>
              <Search className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Ready to Search
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Enter a search query above to get started with Google Custom Search
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

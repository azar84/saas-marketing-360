'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Building2, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  FileText, 
  Filter, 
  Globe, 
  Info,
  MapPinIcon, 
  Save, 
  Search, 
  Settings, 
  Trash2, 
  Users,
  X,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Industry {
  id: number;
  title: string;
  keywordsCount: number;
}

interface City {
  id: number;
  name: string;
  type: string;
  country: {
    name: string;
    code2: string;
  };
  state?: {
    name: string;
    code: string;
  };
}

interface Keyword {
  id: number;
  searchTerm: string;
}

interface SearchResult {
  position: number;
  title: string;
  url: string;
  displayUrl: string;
  fullUrl: string;
  description: string;
  cacheId?: string;
  query?: string;
}

interface BusinessExtractionResult {
  isCompany: boolean;
  businessName?: string;
  baseUrl?: string;
  confidence: number;
  reasoning?: string;
  extractedData?: {
    companyName?: string;
    website?: string;
    description?: string;
    industry?: string;
    location?: string;
  };
}

// Enhanced interface to include full Google Search API response data
interface EnhancedSearchResult extends SearchResult {
  businessExtraction?: BusinessExtractionResult;
  isExpanded?: boolean;
  isProcessing?: boolean;
  extractionError?: string;
  // Additional Google Search API fields
  searchInformation?: {
    totalResults: string;
    searchTime: number;
    formattedSearchTime: string;
    formattedTotalResults: string;
  };
  // Query-specific metadata
  queryMetadata?: {
    query: string;
    searchTime: number;
    totalResults: number;
    success: boolean;
    error?: string;
  };
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

// Enhanced search response interface
interface EnhancedSearchResponse {
  success: boolean;
  results: EnhancedSearchResult[];
  queryResults: Record<string, {
    success: boolean;
    results: any[];
    totalResults: number;
    searchTime?: number;
    error?: string;
  }>;
  totalResults: number;
  searchTime: number;
  filtersApplied: any;
  pagination: PaginationInfo;
  queriesProcessed: number;
  successfulQueries: number;
  message?: string;
  error?: string;
}

interface SearchFilters {
  excludeDirectories: boolean;
  excludeForums: boolean;
  excludeSocialMedia: boolean;
  excludeNewsSites: boolean;
  excludeBlogs: boolean;
}

export default function IndustrySearchManager() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [industryKeywords, setIndustryKeywords] = useState<Keyword[]>([]);
  const [generatedQueries, setGeneratedQueries] = useState<string[]>([]);
  
  // Search state
  const [searchResults, setSearchResults] = useState<EnhancedSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Business extraction state
  const [extractionInProgress, setExtractionInProgress] = useState(false);
  const [extractionResults, setExtractionResults] = useState<Record<string, BusinessExtractionResult>>({});
  const [savedBusinesses, setSavedBusinesses] = useState<Set<string>>(new Set());
  
  // Configuration state
  const [config, setConfig] = useState<SearchEngineConfig>({
    apiKey: '',
    searchEngineId: '',
    resultsLimit: 10
  });
  const [showConfig, setShowConfig] = useState(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  
  // Filters state
  const [filters, setFilters] = useState<SearchFilters>({
    excludeDirectories: true,
    excludeForums: true,
    excludeSocialMedia: true,
    excludeNewsSites: false,
    excludeBlogs: false
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Dropdown states
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [industrySearch, setIndustrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Initialize config from environment variables on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoadingConfig(true);
        console.log('Fetching config from /api/admin/search-engine/config');
        const response = await fetch('/api/admin/search-engine/config');
        const data = await response.json();
        console.log('Config response:', data);
        
        if (data.success && data.config.hasCredentials) {
          console.log('Config loaded successfully, has credentials');
          setConfig(prev => ({
            ...prev,
            apiKey: data.config.apiKey,
            searchEngineId: data.config.searchEngineId
          }));
          setShowConfig(false);
          setConfigLoaded(true);
          setError(null);
        } else {
          console.log('Config loaded but no credentials');
          setShowConfig(true);
          setConfigLoaded(true);
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
        setShowConfig(true);
        setConfigLoaded(true);
        setError(null);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  // Fetch industries when search changes
  useEffect(() => {
    const fetchIndustries = async () => {
      if (industrySearch.trim().length < 2) {
        setIndustries([]);
        return;
      }

      setIsLoadingIndustries(true);
      try {
        const response = await fetch(`/api/admin/industries/search?search=${encodeURIComponent(industrySearch)}&limit=20`);
        const data = await response.json();
        
        if (data.success) {
          setIndustries(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch industries:', error);
      } finally {
        setIsLoadingIndustries(false);
      }
    };

    const timeoutId = setTimeout(fetchIndustries, 300);
    return () => clearTimeout(timeoutId);
  }, [industrySearch]);

  // Fetch cities when search changes
  useEffect(() => {
    const fetchCities = async () => {
      if (citySearch.trim().length < 2) {
        setCities([]);
        return;
      }

      setIsLoadingCities(true);
      try {
        const response = await fetch(`/api/admin/geographic/cities?search=${encodeURIComponent(citySearch)}&limit=20`);
        const data = await response.json();
        
        if (data.success) {
          setCities(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      } finally {
        setIsLoadingCities(false);
      }
    };

    const timeoutId = setTimeout(fetchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [citySearch]);

  // Fetch keywords when industry changes
  useEffect(() => {
    console.log('useEffect for keywords triggered, selectedIndustry:', selectedIndustry);
    
    const fetchKeywords = async () => {
      if (!selectedIndustry) {
        console.log('No selected industry, clearing keywords and queries');
        setIndustryKeywords([]);
        setGeneratedQueries([]);
        return;
      }

      try {
        console.log('Fetching keywords for industry:', selectedIndustry.title);
        
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(`/api/admin/industries/keywords/fetch?industry=${encodeURIComponent(selectedIndustry.title)}`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Keywords API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Keywords response:', data);
        
        if (data.success && data.keywords?.search_terms) {
          const keywords = data.keywords.search_terms.map((term: string, index: number) => ({
            id: index + 1,
            searchTerm: term
          }));
          console.log('Processed keywords:', keywords);
          setIndustryKeywords(keywords);
        } else {
          console.log('Keywords response not successful or missing search_terms');
          console.log('Full response data:', data);
          console.log('Response structure:', {
            success: data.success,
            hasKeywords: !!data.keywords,
            hasSearchTerms: !!data.keywords?.search_terms,
            searchTermsLength: data.keywords?.search_terms?.length,
            source: data._source,
            message: data._message
          });
        }
      } catch (error) {
        console.error('Failed to fetch keywords:', error);
        setIndustryKeywords([]);
      }
    };

    fetchKeywords();
  }, [selectedIndustry?.id]);

  // Generate queries when industry keywords or city changes
  useEffect(() => {
    if (selectedIndustry && selectedCity && industryKeywords.length > 0) {
      console.log('Generating queries due to change in industry, city, or keywords');
      generateQueries(industryKeywords, selectedCity);
    }
  }, [selectedIndustry?.id, selectedCity?.id, industryKeywords.length]);

  const generateQueries = (keywords: Keyword[], city: City) => {
    console.log('Generating queries for:', { keywords, city });
    const cityName = city.name;
    const stateName = city.state?.name;
    const countryName = city.country.name;
    
    const queries = keywords.map(keyword => {
      if (stateName && countryName === 'United States') {
        return `${keyword.searchTerm} in ${cityName}, ${stateName}`;
      } else if (countryName === 'United States') {
        return `${keyword.searchTerm} in ${cityName}`;
      } else {
        return `${keyword.searchTerm} in ${cityName}, ${countryName}`;
      }
    });
    
    console.log('Generated queries:', queries);
    setGeneratedQueries(queries);
  };

  const performSearch = async (page: number = 1) => {
    console.log('performSearch called with:', { page, configLoaded, config, generatedQueries });
    
    if (!configLoaded || !config.apiKey || !config.searchEngineId) {
      console.log('Config check failed:', { configLoaded, hasApiKey: !!config.apiKey, hasSearchEngineId: !!config.searchEngineId });
      setError('Please configure your Google Custom Search API credentials');
      return;
    }

    if (generatedQueries.length === 0) {
      console.log('No generated queries');
      setError('Please select an industry and city to generate search queries');
      return;
    }

    // Cancel any ongoing search
    if (abortController) {
      abortController.abort();
    }

    // Create new AbortController for this search
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setCurrentPage(page);
    
    if (page === 1) {
      setPagination(null);
    }

    try {
      const requestBody = {
        queries: generatedQueries,
        apiKey: config.apiKey,
        searchEngineId: config.searchEngineId,
        resultsLimit: config.resultsLimit,
        filters: filters,
        page: page
      };

      console.log('Sending search request:', { ...requestBody, apiKey: '***' });

      const response = await fetch('/api/admin/search-engine/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: newAbortController.signal
      });

      const data: EnhancedSearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Search failed');
      }

      if (data.success) {
        console.log('Search successful:', {
          resultsCount: data.results.length,
          totalResults: data.totalResults,
          pagination: data.pagination,
          currentPage: page,
          queryResults: data.queryResults,
          searchTime: data.searchTime
        });
        
        // Convert to enhanced search results with full API response data
        const enhancedResults: EnhancedSearchResult[] = data.results.map((result: any) => ({
          ...result,
          businessExtraction: undefined,
          isExpanded: false,
          isProcessing: false,
          extractionError: undefined,
          // Add query metadata from the response
          queryMetadata: data.queryResults[result.query] || {
            query: result.query,
            searchTime: 0,
            totalResults: 0,
            success: true
          }
        }));
        
        setSearchResults(enhancedResults);
        setPagination(data.pagination);
        const results = parseInt(data.totalResults.toString()) || data.results.length || 0;
        setTotalResults(results);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Search was cancelled');
        setError('Search was cancelled');
      } else {
        console.error('Search error:', err);
        setError(err.message || 'An error occurred during search');
      }
      setPagination(null);
    } finally {
      setIsLoading(false);
      setAbortController(null);
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
    if (generatedQueries.length > 0) {
      performSearch(1);
    }
  };

  const toggleResultExpansion = (result: EnhancedSearchResult) => {
    setSearchResults(prev => prev.map(r => 
      r === result ? { ...r, isExpanded: !r.isExpanded } : r
    ));
  };

  const extractBusinessInfo = async (result: EnhancedSearchResult) => {
    if (!result.url) return;

    // Mark this result as processing
    setSearchResults(prev => prev.map(r => 
      r === result ? { ...r, isProcessing: true, extractionError: undefined } : r
    ));

    try {
      const response = await fetch('/api/admin/llm/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze this website: ${result.url}. Determine if it's a business/company website and extract relevant business information.`,
          model: 'gpt-4o-mini',
          temperature: 0.1
        })
      });

      const data = await response.json();

      if (data.success && data.result) {
        // Parse the LLM response to extract business information
        const businessInfo = parseBusinessExtraction(data.result);
        
        setSearchResults(prev => prev.map(r => 
          r === result ? { 
            ...r, 
            businessExtraction: businessInfo,
            isProcessing: false 
          } : r
        ));
      } else {
        throw new Error(data.error || 'Failed to extract business information');
      }
    } catch (error: any) {
      setSearchResults(prev => prev.map(r => 
        r === result ? { 
          ...r, 
          isProcessing: false,
          extractionError: error.message 
        } : r
      ));
    }
  };

  const parseBusinessExtraction = (llmResponse: string): BusinessExtractionResult => {
    // Simple parsing logic - you can enhance this based on your LLM response format
    const isCompany = llmResponse.toLowerCase().includes('company') || 
                     llmResponse.toLowerCase().includes('business') ||
                     llmResponse.toLowerCase().includes('yes');
    
    return {
      isCompany,
      confidence: isCompany ? 0.8 : 0.6,
      reasoning: llmResponse,
      extractedData: isCompany ? {
        companyName: 'Extracted from analysis',
        website: 'From URL',
        industry: 'To be determined',
        location: 'To be determined'
      } : undefined
    };
  };

  const saveBusinessToDirectory = async (result: EnhancedSearchResult) => {
    if (!result.businessExtraction?.isCompany || !result.businessExtraction.extractedData) {
      return;
    }

    try {
      // Transform the result to match our API format
      const transformedResult = {
        title: result.title,
        link: result.url, // Map url to link
        snippet: result.description, // Map description to snippet
        displayLink: result.displayUrl
      };

      const response = await fetch('/api/admin/industry-search/process-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchResults: [transformedResult],
          industry: selectedIndustry?.title,
          location: selectedCity?.name,
          minConfidence: 0.7,
          dryRun: false
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSavedBusinesses(prev => new Set([...prev, result.url]));
        console.log('✅ Business saved to directory successfully');
        // Show success message or update UI
      } else {
        console.error('❌ Failed to save business:', data.error);
      }
    } catch (error) {
      console.error('❌ Failed to save business:', error);
    }
  };

  const extractAllBusinesses = async () => {
    console.log('🔍 extractAllBusinesses called with:', {
      extractionInProgress,
      searchResultsLength: searchResults.length,
      searchResults: searchResults
    });

    if (extractionInProgress) {
      console.log('⚠️ Extraction already in progress, skipping');
      return;
    }

    if (searchResults.length === 0) {
      console.log('⚠️ No search results available, skipping');
      setError('No search results available. Please perform a search first.');
      return;
    }

    setExtractionInProgress(true);
    setError(null); // Clear any previous errors
    
    try {
      // Transform search results to match our API format
      const transformedResults = searchResults.map(result => ({
        title: result.title,
        link: result.url, // Map url to link
        snippet: result.description, // Map description to snippet
        displayLink: result.displayUrl
      }));

      console.log('🔍 Processing search results:', transformedResults.length);
      console.log('🔍 First result sample:', transformedResults[0]);

      const response = await fetch('/api/admin/industry-search/process-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchResults: transformedResults,
          industry: selectedIndustry?.title,
          location: selectedCity?.name,
          minConfidence: 0.7,
          dryRun: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 API response received:', data);
      
      if (data.success && data.data) {
        console.log('✅ Extraction completed:', data.data);
        
        // Check if we have business data from the chain
        if (!data.data.businesses || !Array.isArray(data.data.businesses)) {
          console.warn('⚠️ No business data returned from chain');
          setError('No business classification data available');
          return;
        }
        
        // Transform the chain results to match our BusinessExtractionResult format
        const transformedExtractions = data.data.businesses.map((business: any) => ({
          isCompany: business.isCompanyWebsite,
          businessName: business.companyName,
          baseUrl: business.website,
          confidence: business.confidence,
          reasoning: `Extracted from ${business.extractedFrom}`,
          extractedData: {
            companyName: business.companyName,
            website: business.website,
            description: business.rawData?.snippet,
            industry: selectedIndustry?.title,
            location: selectedCity?.name
          }
        }));

        console.log(`🔄 Transformed ${transformedExtractions.length} extractions`);

        // Update all results with extraction data
        setSearchResults(prev => prev.map(result => {
          const extraction = transformedExtractions.find((e: any) => e.baseUrl === result.url);
          return {
            ...result,
            businessExtraction: extraction || { 
              isCompany: false, 
              confidence: 0,
              baseUrl: result.url,
              businessName: undefined,
              reasoning: 'No extraction data available',
              extractedData: undefined
            },
            isExpanded: false
          };
        }));
        
        // Set extraction results for display - with safety check
        if (transformedExtractions.length > 0) {
          const extractionResultsMap = transformedExtractions.reduce((acc: any, extraction: any) => {
            if (extraction.baseUrl) {
              acc[extraction.baseUrl] = extraction;
            }
            return acc;
          }, {});

          setExtractionResults(extractionResultsMap);
          console.log('📊 Extraction results updated:', Object.keys(extractionResultsMap).length);
        } else {
          console.log('📊 No extraction results to display');
          setExtractionResults({});
        }
      } else {
        console.error('❌ Extraction failed:', data);
        setError(data.error || 'Failed to extract business information');
      }
    } catch (error) {
      console.error('❌ Failed to extract all businesses:', error);
      setError(`Failed to extract business information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExtractionInProgress(false);
    }
  };

  const updateConfig = (field: keyof SearchEngineConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const selectIndustry = (industry: Industry) => {
    setSelectedIndustry(industry);
    setShowIndustryDropdown(false);
    setIndustrySearch(industry.title);
  };

  const selectCity = (city: City) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
    setCitySearch(city.name);
  };

  const clearIndustry = () => {
    setSelectedIndustry(null);
    setIndustrySearch('');
    setIndustryKeywords([]);
    setGeneratedQueries([]);
  };

  const clearCity = () => {
    setSelectedCity(null);
    setCitySearch('');
    setGeneratedQueries([]);
  };

  return (
    <div className="space-y-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Industry Search Manager
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Search by industry and location using automated keyword generation
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
          {showConfig ? 'Hide Config' : 'Show Config'}
        </Button>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="rounded-xl p-6 shadow-sm" style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-gray-light)'
        }}>
          <div className="mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Globe className="h-5 w-5" />
              Google Custom Search Configuration
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Configure your Google Custom Search API credentials
            </p>
          </div>
          <div className="space-y-4">
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
          </div>
        </div>
      )}

      {/* Industry and City Selection */}
      <div className="rounded-xl p-6 shadow-sm" style={{
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-gray-light)'
      }}>
        <div className="mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Building className="h-5 w-5" />
            Industry & Location Selection
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Select an industry and city to automatically generate search queries
          </p>
        </div>
        <div className="space-y-6">
          {/* Industry Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Industry
            </label>
            <div className="relative">
              <Input
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                placeholder="Search for an industry..."
                className="pr-10"
                onFocus={() => setShowIndustryDropdown(true)}
              />
              {selectedIndustry && (
                <button
                  onClick={clearIndustry}
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                  style={{
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
              
              {showIndustryDropdown && (
                <div className="absolute z-10 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-auto" style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-gray-light)'
                }}>
                  {isLoadingIndustries ? (
                    <div className="p-3 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
                  ) : industries.length > 0 ? (
                    industries.map((industry) => (
                      <button
                        key={industry.id}
                        onClick={() => selectIndustry(industry)}
                        className="w-full text-left px-3 py-2 focus:outline-none transition-colors hover:bg-opacity-10 focus:bg-opacity-10"
                        style={{
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onFocus={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                        onBlur={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="font-medium">{industry.title}</div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{industry.keywordsCount} keywords</div>
                      </button>
                    ))
                  ) : industrySearch.trim().length >= 2 ? (
                    <div className="p-3 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No industries found</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              City
            </label>
            <div className="relative">
              <Input
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="Search for a city..."
                className="pr-10"
                onFocus={() => setShowCityDropdown(true)}
              />
              {selectedCity && (
                <button
                  onClick={clearCity}
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                  style={{
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
              
              {showCityDropdown && (
                <div className="absolute z-10 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-auto" style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-gray-light)'
                }}>
                  {isLoadingCities ? (
                    <div className="p-3 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
                  ) : cities.length > 0 ? (
                    cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => selectCity(city)}
                        className="w-full text-left px-3 py-2 focus:outline-none transition-colors hover:bg-opacity-10 focus:bg-opacity-10"
                        style={{
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onFocus={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                        onBlur={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {city.state?.name && `${city.state.name}, `}{city.country.name}
                        </div>
                      </button>
                    ))
                  ) : citySearch.trim().length >= 2 ? (
                    <div className="p-3 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No cities found</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Generated Queries Preview */}
          {generatedQueries.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Generated Search Queries ({generatedQueries.length})
              </label>
              <div className="p-3 rounded-md space-y-1" style={{
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-gray-light)'
              }}>
                {generatedQueries.map((query, index) => (
                  <div key={index} className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {index + 1}. "{query}"
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* Search and Cancel Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                console.log('Search button clicked!');
                console.log('Button state:', { isLoading, configLoaded, generatedQueriesLength: generatedQueries.length });
                performSearch();
              }}
              disabled={isLoading || !configLoaded || generatedQueries.length === 0}
              className="flex-1"
            >
              {isLoading ? 'Searching...' : 'Search with Generated Queries'}
            </Button>
            
            {isLoading && (
              <Button
                variant="outline"
                onClick={() => {
                  console.log('Cancel button clicked!');
                  if (abortController) {
                    abortController.abort();
                  }
                }}
                className="px-4"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-xl p-6 shadow-sm" style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-gray-light)'
        }}>
          <div className="mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Search className="h-5 w-5" />
              Search Filters
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Configure what types of sites to exclude from search results
            </p>
          </div>
          <div className="space-y-4">
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
                  Exclude Directories
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
                  Exclude Forums
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
          </div>
        </div>
      )}

      {/* Results Per Page Selector */}
      <div className="rounded-xl p-6 shadow-sm" style={{
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-gray-light)'
      }}>
        <div className="pt-6">
          <div className="flex items-center justify-between">
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
            </div>
            
            {/* Pagination Info */}
            {pagination && (
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Page {pagination.currentPage} of {pagination.totalPages} • Total: {totalResults} results
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: 'var(--color-error-light)', 
          borderColor: 'var(--color-error)',
          color: 'var(--color-error-dark)' 
        }}>
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="rounded-xl p-6 shadow-sm" style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-gray-light)'
        }}>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Globe className="h-5 w-5" />
                  Search Results ({searchResults.length})
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Found {searchResults.length} results for industry "{selectedIndustry?.title}" in {selectedCity?.name}
                  {pagination && (
                    <span className="block text-xs mt-1 opacity-75">
                      Page {pagination.currentPage} of {pagination.totalPages} • Total: {totalResults} results
                    </span>
                  )}
                </p>
                
                {/* Enhanced Search Information */}
                <div className="mt-3 p-3 rounded-lg" style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-gray-light)'
                }}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Queries Processed</p>
                      <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{generatedQueries.length}</p>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Successful Queries</p>
                      <p className="text-lg font-semibold" style={{ color: 'var(--color-success)' }}>
                        {searchResults.length > 0 ? 
                          Object.keys(searchResults.reduce((acc, result) => {
                            if (result.query) acc[result.query] = true;
                            return acc;
                          }, {} as Record<string, boolean>)).length : 0
                        }
                      </p>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Results</p>
                      <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totalResults}</p>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Search Time</p>
                      <p className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {searchResults.length > 0 ? 
                          `${Math.round(
                            Object.values(searchResults.reduce((acc, result) => {
                              if (result.queryMetadata?.searchTime) {
                                acc[result.query || 'default'] = (acc[result.query || 'default'] || 0) + result.queryMetadata.searchTime;
                              }
                              return acc;
                            }, {} as Record<string, number>)).reduce((a, b) => a + b, 0) / 1000
                          )}s` : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={extractAllBusinesses}
                  disabled={extractionInProgress || searchResults.length === 0}
                  className="flex items-center gap-2"
                >
                  {extractionInProgress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Info className="h-4 w-4" />
                      Extract All Businesses
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results List */}
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div
                key={`${result.query || 'default'}-${result.url}-${index}`}
                className="rounded-lg border-2 transition-all duration-200"
                style={{
                  backgroundColor: result.isExpanded ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                  borderColor: result.isExpanded ? 'var(--color-gray-light)' : 'var(--color-text-muted)',
                  opacity: result.isExpanded ? 1 : 0.8
                }}
              >
                  {/* Basic Result Info */}
                  <div className="p-4">
                                        {/* Query Label with Enhanced Metadata */}
                    {result.query && (
                      <div className="mb-3 p-2 rounded-md" style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-gray-light)'
                      }}>
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full" style={{
                            backgroundColor: 'var(--color-primary-light)',
                            color: 'var(--color-primary-dark)'
                          }}>
                            Query: {result.query}
                          </span>

                          {/* Query Performance Metrics */}
                          {result.queryMetadata && (
                            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                              <span>Results: {result.queryMetadata.totalResults}</span>
                              <span>Time: {Math.round((result.queryMetadata.searchTime || 0) / 1000)}s</span>
                              <span className="px-2 py-1 rounded" style={{
                                backgroundColor: result.queryMetadata.success 
                                  ? 'var(--color-success-light)' 
                                  : 'var(--color-error-light)',
                                color: result.queryMetadata.success 
                                  ? 'var(--color-success-dark)' 
                                  : 'var(--color-error-dark)'
                              }}>
                                {result.queryMetadata.success ? 'Success' : 'Failed'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Query Error Display */}
                        {result.queryMetadata?.error && (
                          <div className="mt-2 p-2 rounded text-xs" style={{
                            backgroundColor: 'var(--color-error-light)',
                            color: 'var(--color-error-dark)'
                          }}>
                            <strong>Query Error:</strong> {result.queryMetadata.error}
                          </div>
                        )}
                      </div>
                    )}

                    {/* URL Analysis and Cached Link */}
                    <div className="mb-3 p-2 rounded-md" style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-gray-light)'
                    }}>
                      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        <span>URL: {result.displayUrl}</span>
                        {result.cacheId && (
                          <a 
                            href={`https://webcache.googleusercontent.com/search?q=cache:${result.cacheId}:${encodeURIComponent(result.url)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Cached
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {result.title}
                      </a>
                    </h4>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {result.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleResultExpansion(result)}
                        className="flex items-center gap-2"
                      >
                        {result.isExpanded ? (
                          <>
                            <EyeOff className="h-3 w-3" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" />
                            Show Details
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => extractBusinessInfo(result)}
                        disabled={result.isProcessing}
                        className="flex items-center gap-2"
                      >
                        {result.isProcessing ? (
                          <>
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Building2 className="h-3 w-3" />
                            Analyze Business
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(result.url, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit Website
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {result.isExpanded && (
                    <div className="border-t p-4" style={{ borderColor: 'var(--color-gray-light)' }}>
                      {/* Enhanced Result Metadata */}
                      <div className="mb-4 p-3 rounded-md" style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-gray-light)'
                      }}>
                        <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                          <Info className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                          Google Search API Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Result Position</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{result.position}</p>
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Full URL</p>
                            <p className="text-sm break-all" style={{ color: 'var(--color-text-primary)' }}>{result.fullUrl}</p>
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Display URL</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{result.displayUrl}</p>
                          </div>
                          {result.cacheId && (
                            <div>
                              <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Cache ID</p>
                              <p className="text-sm font-mono text-xs" style={{ color: 'var(--color-text-primary)' }}>{result.cacheId}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Business Extraction Results */}
                      {result.businessExtraction && (
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                            <Building2 className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                            Business Analysis Results
                          </h4>
                          
                          {/* Company Status */}
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{
                              backgroundColor: result.businessExtraction.isCompany 
                                ? 'var(--color-success)' 
                                : 'var(--color-text-muted)'
                            }}></div>
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {result.businessExtraction.isCompany ? 'Company Website' : 'Not a Company'}
                            </span>
                            {result.businessExtraction.confidence > 0 && (
                              <span className="text-xs px-2 py-1 rounded-full" style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-secondary)'
                              }}>
                                {Math.round(result.businessExtraction.confidence * 100)}% confidence
                              </span>
                            )}
                          </div>

                          {/* Extracted Data */}
                          {result.businessExtraction.isCompany && result.businessExtraction.extractedData && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-md" style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              border: '1px solid var(--color-gray-light)'
                            }}>
                              {result.businessExtraction.extractedData.companyName && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                  <div>
                                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Company Name</p>
                                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{result.businessExtraction.extractedData.companyName}</p>
                                  </div>
                                </div>
                              )}
                              
                              {result.businessExtraction.extractedData.website && (
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                  <div>
                                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Website</p>
                                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{result.businessExtraction.extractedData.website}</p>
                                  </div>
                                </div>
                              )}
                              
                              {result.businessExtraction.extractedData.industry && (
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                  <div>
                                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Industry</p>
                                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{result.businessExtraction.extractedData.industry}</p>
                                  </div>
                                </div>
                              )}
                              
                              {result.businessExtraction.extractedData.location && (
                                <div className="flex items-center gap-2">
                                  <MapPinIcon className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                  <div>
                                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Location</p>
                                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{result.businessExtraction.extractedData.location}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reasoning */}
                          {result.businessExtraction.reasoning && (
                            <div className="p-3 rounded-md" style={{
                              backgroundColor: 'var(--color-primary-light)',
                              border: '1px solid var(--color-primary)'
                            }}>
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-primary-dark)' }}>Analysis Reasoning:</p>
                              <p className="text-sm" style={{ color: 'var(--color-primary-dark)' }}>{result.businessExtraction.reasoning}</p>
                            </div>
                          )}

                          {/* Save to Directory Button */}
                          {result.businessExtraction.isCompany && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => saveBusinessToDirectory(result)}
                                disabled={savedBusinesses.has(result.url)}
                                className="flex items-center gap-2"
                              >
                                {savedBusinesses.has(result.url) ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Saved
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-3 w-3" />
                                    Save to Directory
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Error Display */}
                      {result.extractionError && (
                        <div className="p-3 rounded-md" style={{
                          backgroundColor: 'var(--color-error-light)',
                          color: 'var(--color-error-dark)'
                        }}>
                          <p className="text-sm font-medium">Extraction Error:</p>
                          <p className="text-sm">{result.extractionError}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Extraction Summary */}
            {Object.keys(extractionResults).length > 0 && (
              <div className="mt-6 p-4 rounded-lg" style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-gray-light)'
              }}>
                <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Info className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                  Business Extraction Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Analyzed</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{Object.keys(extractionResults).length}</p>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Companies Found</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--color-success)' }}>
                      {Object.values(extractionResults).filter(r => r.isCompany).length}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Non-Companies</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                      {Object.values(extractionResults).filter(r => !r.isCompany).length}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Saved to Directory</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {savedBusinesses.size}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Showing {((pagination.currentPage - 1) * pagination.resultsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.resultsPerPage, totalResults)} of {totalResults} results
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
          </div>
      )}

{/* Empty State */}
      {!isLoading && !error && searchResults.length === 0 && (
        <div className="rounded-xl p-6 shadow-sm text-center py-12" style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-gray-light)'
        }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
            backgroundColor: 'var(--color-bg-primary)' 
          }}>
            <Search className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Ready to Search
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Select an industry and city above to generate search queries and get started
          </p>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showIndustryDropdown || showCityDropdown) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowIndustryDropdown(false);
            setShowCityDropdown(false);
          }}
        />
      )}

      {/* Click outside to close expanded results */}
      {searchResults.some(r => r.isExpanded) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setSearchResults(prev => prev.map(r => ({ ...r, isExpanded: false })));
          }}
        />
      )}
    </div>
  );
}

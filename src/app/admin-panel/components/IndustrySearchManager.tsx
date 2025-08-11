'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Check,
  Play,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import { useNotificationContext } from '@/components/providers/NotificationProvider';
import { EnhancedSearch, type SearchFilter, type SortOption } from '@/components/ui/EnhancedSearch';

interface Industry {
  id: number;
  title: string;
  keywordsCount: number;
  businessesCount?: number;
  createdAt?: string;
  updatedAt?: string;
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
  // Add date filtering information
  dateFiltering?: {
    enabled: boolean;
    maxAgeDays: number;
    dateRestrict?: string;
    description: string;
  };
}

interface SearchFilters {
  excludeDirectories: boolean;
  excludeForums: boolean;
  excludeSocialMedia: boolean;
  excludeNewsSites: boolean;
  excludeBlogs: boolean;
}

interface DateFilteringOptions {
  enabled: boolean;
  maxAgeDays: number;
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
  const [saveToDirectory, setSaveToDirectory] = useState(true); // Default to saving to directory
  const [processingAllPages, setProcessingAllPages] = useState(false); // Track if processing all pages
  const [allPagesProgress, setAllPagesProgress] = useState({ current: 0, total: 0, processed: 0 }); // Progress tracking
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Success message display
  
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
  
  const [dateFiltering, setDateFiltering] = useState<DateFilteringOptions>({
    enabled: true,
    maxAgeDays: 365 // Default to 1 year
  });

  // Store date filtering info from search response
  const [appliedDateFiltering, setAppliedDateFiltering] = useState<{
    enabled: boolean;
    maxAgeDays: number;
    dateRestrict?: string;
    description: string;
  } | null>(null);
  
  // Background extraction state
  const [backgroundExtractionJob, setBackgroundExtractionJob] = useState<{
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    totalResults: number;
    processedResults: number;
    successCount: number;
    errorCount: number;
    startTime: Date;
    endTime?: Date;
    error?: string;
  } | null>(null);
  const [backgroundExtractionInProgress, setBackgroundExtractionInProgress] = useState(false);
  
  // Notification system
  const { notifications, addNotification, dismissNotification, clearAllNotifications, updateNotification } = useNotificationContext();
  
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
        const response = await fetch('/api/admin/search-engine/config');
        const data = await response.json();
        
        if (data.success && data.config.hasCredentials) {
          setConfig(prev => ({
            ...prev,
            apiKey: data.config.apiKey,
            searchEngineId: data.config.searchEngineId
          }));
          setShowConfig(false);
          setConfigLoaded(true);
          setError(null);
        } else {
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

  // Fetch notifications for active background jobs when component mounts or when backgroundExtractionJob changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!backgroundExtractionJob?.jobId) return;
      
      try {
        const response = await fetch(`/api/admin/industry-search/background-extraction?action=notifications&jobId=${backgroundExtractionJob.jobId}`);
        const data = await response.json();
        
        if (data.success && data.notifications) {
          // Add server notifications to the local notification system
          data.notifications.forEach((serverNotification: any) => {
            // Check if notification already exists locally
            const exists = notifications.some(n => n.id === serverNotification.id);
            if (!exists) {
              addNotification({
                title: 'Background Extraction',
                type: serverNotification.type,
                message: serverNotification.message,
                progress: serverNotification.progress,
                actions: serverNotification.actions
              });
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, [backgroundExtractionJob?.jobId, notifications, addNotification]);

  // Periodic notification check for active background jobs
  useEffect(() => {
    if (!backgroundExtractionJob?.jobId || backgroundExtractionJob.status === 'completed' || backgroundExtractionJob.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/industry-search/background-extraction?action=notifications&jobId=${backgroundExtractionJob.jobId}`);
        const data = await response.json();
        
        if (data.success && data.notifications) {
          // Add server notifications to the local notification system
          data.notifications.forEach((serverNotification: any) => {
            // Check if notification already exists locally
            const exists = notifications.some(n => n.id === serverNotification.id);
            if (!exists) {
              addNotification({
                title: 'Background Extraction',
                type: serverNotification.type,
                message: serverNotification.message,
                progress: serverNotification.progress,
                actions: serverNotification.actions
              });
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundExtractionJob?.jobId, backgroundExtractionJob?.status, notifications, addNotification]);

  // Enhanced industry search with filters
  const [industryFilters, setIndustryFilters] = useState({
    isActive: undefined,
    minKeywords: undefined,
    maxKeywords: undefined,
    minBusinesses: undefined,
    maxBusinesses: undefined,
    createdAfter: undefined,
    createdBefore: undefined
  });

  const [industrySort, setIndustrySort] = useState({
    id: 'label',
    label: 'Industry Name',
    field: 'label',
    direction: 'asc' as 'asc' | 'desc'
  });

  // Enhanced search configuration for industries
  const industrySearchFilters: SearchFilter[] = [
    {
      id: 'isActive',
      label: 'Status',
      value: '',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    },
    {
      id: 'minKeywords',
      label: 'Min Keywords',
      value: '',
      type: 'number'
    },
    {
      id: 'maxKeywords',
      label: 'Max Keywords',
      value: '',
      type: 'number'
    },
    {
      id: 'minBusinesses',
      label: 'Min Businesses',
      value: '',
      type: 'number'
    },
    {
      id: 'maxBusinesses',
      label: 'Max Businesses',
      value: '',
      type: 'number'
    },
    {
      id: 'createdAfter',
      label: 'Created After',
      value: '',
      type: 'date'
    },
    {
      id: 'createdBefore',
      label: 'Created Before',
      value: '',
      type: 'date'
    }
  ];

  const industrySortOptions: SortOption[] = [
    { id: 'label', label: 'Industry Name', field: 'label', direction: 'asc' },
    { id: 'keywordsCount', label: 'Keywords Count', field: 'keywordsCount', direction: 'desc' },
    { id: 'businessesCount', label: 'Businesses Count', field: 'businessesCount', direction: 'desc' },
    { id: 'createdAt', label: 'Date Created', field: 'createdAt', direction: 'desc' },
    { id: 'updatedAt', label: 'Last Updated', field: 'updatedAt', direction: 'desc' }
  ];

  // Handle industry filter changes
  const handleIndustryFilterChange = useCallback((filterId: string, value: any) => {
    setIndustryFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  }, []);

  // Handle industry sort changes
  const handleIndustrySortChange = useCallback((sort: SortOption) => {
    setIndustrySort(sort);
  }, []);

  const fetchIndustries = useCallback(async (search: string, filters: any, sort: any) => {
    if (search.trim().length < 2) {
      setIndustries([]);
      return;
    }

    setIsLoadingIndustries(true);
    try {
      const params = new URLSearchParams({
        search: search.trim(),
        limit: '20',
        sortBy: sort.field,
        sortOrder: sort.direction
      });

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/admin/industries/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setIndustries(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch industries:', error);
    } finally {
      setIsLoadingIndustries(false);
    }
  }, []);

  // Fetch industries when search, filters, or sort changes
  useEffect(() => {
    fetchIndustries(industrySearch, industryFilters, industrySort);
  }, [industrySearch, industryFilters, industrySort, fetchIndustries]);

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
    
    const fetchKeywords = async () => {
      if (!selectedIndustry) {
        setIndustryKeywords([]);
        setGeneratedQueries([]);
        return;
      }

      try {
        
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(`/api/admin/industries/keywords/fetch?industry=${encodeURIComponent(selectedIndustry.title)}`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.keywords?.search_terms) {
          const keywords = data.keywords.search_terms.map((term: string, index: number) => ({
            id: index + 1,
            searchTerm: term
          }));
          setIndustryKeywords(keywords);
        } else {
          // Keywords response not successful or missing search_terms
          setIndustryKeywords([]);
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
      generateQueries(industryKeywords, selectedCity);
    }
  }, [selectedIndustry?.id, selectedCity?.id, industryKeywords.length]);

  const generateQueries = (keywords: Keyword[], city: City) => {
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
    
    setGeneratedQueries(queries);
  };

  const performSearch = async (page: number = 1) => {
    if (!configLoaded || !config.apiKey || !config.searchEngineId) {
      setError('Search engine not configured. Please configure your Google Custom Search Engine first.');
      return null;
    }

    if (!selectedIndustry || !selectedCity) {
      setError('Please select both an industry and a city before searching.');
      return null;
    }

    if (generatedQueries.length === 0) {
      setError('No search queries generated. Please generate queries first.');
      return null;
    }

    setIsLoading(true);
    setError('');
    setCurrentPage(page);
    
    // Clear previous date filtering info for new search
    setAppliedDateFiltering(null);

    // Cancel any ongoing search
    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    try {
      const requestBody = {
        queries: generatedQueries,
        apiKey: config.apiKey,
        searchEngineId: config.searchEngineId,
        resultsLimit: config.resultsLimit,
        filters: filters,
        page: page,
        // Add date filtering parameters
        maxAgeDays: dateFiltering.enabled ? dateFiltering.maxAgeDays : undefined,
        requireDateFiltering: dateFiltering.enabled
      };


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
        // Search successful
        
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
        
        // Store date filtering information
        if (data.dateFiltering) {
          setAppliedDateFiltering(data.dateFiltering);
        }
        
        return data; // Return the full response for processing
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Search was cancelled');
      } else {
        console.error('Search error:', err);
        setError(err.message || 'An error occurred during search');
      }
      setPagination(null);
      return null; // Return null on error
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
    setError(null);
    setSuccessMessage(null); // Clear any previous success messages

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
          city: selectedCity?.name,
          stateProvince: selectedCity?.state?.name,
          country: selectedCity?.country?.name,
          minConfidence: 0.7,
          dryRun: !saveToDirectory // Use the saveToDirectory state
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSavedBusinesses(prev => new Set([...prev, result.url]));
        
        // Show success message
        if (saveToDirectory) {
          setSuccessMessage(`Business "${result.businessExtraction?.businessName || result.title}" saved to business directory successfully!`);
        } else {
          setSuccessMessage(`Business "${result.businessExtraction?.businessName || result.title}" processed (dry run mode - no data saved)`);
        }
      } else {
        console.error('❌ Failed to save business:', data.error);
        setError(`Failed to save business: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Failed to save business:', error);
    }
  };

  const extractAllBusinesses = async () => {
    // Check if extraction is already in progress

    if (extractionInProgress) {
      return;
    }

    if (searchResults.length === 0) {
      setError('No search results available. Please perform a search first.');
      return;
    }

    // Check if we have pagination info and multiple pages
    if (pagination && pagination.totalPages > 1 && totalResults > searchResults.length) {
      
      // Ask user if they want to process all pages
      if (window.confirm(`This search has ${pagination.totalPages} pages with ${totalResults} total results.\n\nDo you want to process ALL pages (up to 1000 results) instead of just the current page?\n\nThis will take longer but will extract business information from all available results.`)) {
        await processAllPages();
        return;
      } else {
      }
    }

    // For large datasets (more than 50 results on current page), use background extraction
    if (searchResults.length > 50) {
      await startBackgroundExtraction();
      return;
    }

    setExtractionInProgress(true);
    setError(null); // Clear any previous errors
    setSuccessMessage(null); // Clear any previous success messages
    
    try {
      // Transform search results to match our API format
      const transformedResults = searchResults.map(result => ({
        title: result.title,
        link: result.url, // Map url to link
        snippet: result.description, // Map description to snippet
        displayLink: result.displayUrl
      }));


      const response = await fetch('/api/admin/industry-search/process-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchResults: transformedResults,
          industry: selectedIndustry?.title,
          location: selectedCity?.name,
          city: selectedCity?.name,
          stateProvince: selectedCity?.state?.name,
          country: selectedCity?.country?.name,
          minConfidence: 0.7,
          dryRun: !saveToDirectory // Use the saveToDirectory state
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        
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
        } else {
          setExtractionResults({});
        }

        // Show success message based on mode
        if (saveToDirectory) {
          setError(null);
          setSuccessMessage(`Successfully processed and saved ${data.data.businesses.length} businesses to the business directory!`);
        } else {
          setSuccessMessage(`Successfully processed ${data.data.businesses.length} businesses (dry run mode - no data saved)`);
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

  const startBackgroundExtraction = async () => {
    if (backgroundExtractionInProgress) {
      const notificationId = addNotification({
        type: 'warning',
        title: 'Extraction Already Running',
        message: 'A background extraction job is already in progress.'
      });
      return;
    }

    if (searchResults.length === 0) {
      const notificationId = addNotification({
        type: 'error',
        title: 'No Search Results',
        message: 'Please perform a search first to extract business information.'
      });
      return;
    }

    setBackgroundExtractionInProgress(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Generate unique job ID
      const jobId = `extraction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Transform search results
      const transformedResults = searchResults.map(result => ({
        title: result.title,
        link: result.url,
        snippet: result.description,
        displayLink: result.displayUrl
      }));

      // Start background job
      const response = await fetch('/api/admin/industry-search/background-extraction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchResults: transformedResults,
          industry: selectedIndustry?.title,
          location: selectedCity?.name,
          city: selectedCity?.name,
          stateProvince: selectedCity?.state?.name,
          country: selectedCity?.country?.name,
          minConfidence: 0.7,
          saveToDirectory: saveToDirectory,
          jobId: jobId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Create initial job record
        const job = {
          jobId: jobId,
          status: 'pending' as const,
          totalResults: searchResults.length,
          processedResults: 0,
          successCount: 0,
          errorCount: 0,
          startTime: new Date()
        };

        setBackgroundExtractionJob(job);

        // Add notification
        const notificationId = addNotification({
          type: 'progress',
          title: 'Background Extraction Started',
          message: `Processing ${searchResults.length} search results in the background. You can navigate away while this runs.`,
          progress: {
            current: 0,
            total: searchResults.length,
            percentage: 0,
            status: 'Starting...'
          },
          actions: [
            {
              label: 'View Progress',
              onClick: () => {
                // Scroll to progress section
                document.getElementById('extraction-progress')?.scrollIntoView({ behavior: 'smooth' });
              }
            }
          ]
        });

        // Start monitoring the job
        monitorBackgroundJob(jobId, notificationId);

        setSuccessMessage(`Background extraction started for ${searchResults.length} results. You'll be notified when it's complete.`);
      } else {
        throw new Error(data.error || 'Failed to start background extraction');
      }
    } catch (error) {
      console.error('❌ Background extraction error:', error);
      setError(`Failed to start background extraction: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      const notificationId = addNotification({
        type: 'error',
        title: 'Background Extraction Failed',
        message: `Failed to start background extraction: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setBackgroundExtractionInProgress(false);
    }
  };

  const monitorBackgroundJob = async (jobId: string, notificationId: string) => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/industry-search/background-extraction?jobId=${jobId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.job) {
          const job = data.job;
          
          // Update job state
          setBackgroundExtractionJob({
            jobId: job.id,
            status: job.status,
            totalResults: job.totalResults,
            processedResults: job.processedResults,
            successCount: job.successCount,
            errorCount: job.errorCount,
            startTime: new Date(job.startTime),
            endTime: job.endTime ? new Date(job.endTime) : undefined,
            error: job.error
          });

          // Update notification progress
          if (job.status === 'processing') {
            const percentage = Math.round((job.processedResults / job.totalResults) * 100);
            updateNotification(notificationId, {
              progress: {
                current: job.processedResults,
                total: job.totalResults,
                percentage: percentage,
                status: `Processing... ${job.processedResults}/${job.totalResults}`
              }
            });
          }

          // Job completed
          if (job.status === 'completed') {
            clearInterval(checkInterval);
            
            updateNotification(notificationId, {
              type: 'success',
              title: 'Extraction Completed',
              message: `Successfully extracted ${job.successCount} businesses from ${job.totalResults} search results.`,
              progress: {
                current: job.totalResults,
                total: job.totalResults,
                percentage: 100,
                status: 'Completed'
              },
              actions: [
                {
                  label: 'View Results',
                  onClick: () => {
                    // Scroll to results section
                    document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              ]
            });

            setSuccessMessage(`Background extraction completed! ${job.successCount} businesses extracted and ${saveToDirectory ? 'saved to directory' : 'processed'}.`);
          }

          // Job failed
          if (job.status === 'failed') {
            clearInterval(checkInterval);
            
            updateNotification(notificationId, {
              type: 'error',
              title: 'Extraction Failed',
              message: `Background extraction failed: ${job.error || 'Unknown error'}`,
              actions: [
                {
                  label: 'Retry',
                  onClick: () => startBackgroundExtraction()
                }
              ]
            });

            setError(`Background extraction failed: ${job.error || 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.error('Error monitoring background job:', error);
      }
    }, 2000); // Check every 2 seconds

    // Cleanup interval after 1 hour (in case job gets stuck)
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 60 * 60 * 1000);
  };

  /**
   * Process all pages of search results and extract businesses
   * This will fetch all available pages and process them sequentially
   */
  const processAllPages = async () => {
    if (processingAllPages || !pagination) {
      return;
    }

    if (pagination.totalPages <= 1) {
      await extractAllBusinesses();
      return;
    }

    // Check if we have a very large number of results (more than 1000)
    if (pagination.totalResults > 1000) {
      if (window.confirm(`This search has ${pagination.totalResults} total results, but we can only process up to 1000 results.\n\nDo you want to process the first 1000 results?`)) {
        // Limit to 1000 results
        const maxPages = Math.ceil(1000 / pagination.resultsPerPage);
      } else {
        return;
      }
    }

        // Calculate how many pages to process (respect 1000 result limit)
    const maxResults = 1000;
    const maxPages = Math.min(pagination.totalPages, Math.ceil(maxResults / pagination.resultsPerPage));
    
    setProcessingAllPages(true);
    setAllPagesProgress({ current: 1, total: maxPages, processed: 0 });
    setError(null);
    setSuccessMessage(null); // Clear any previous success messages

    try {
      
      const allResults: EnhancedSearchResult[] = [];
      let totalProcessed = 0;
      let totalBusinesses = 0;

      
      // Process each page (up to the limit)
      for (let page = 1; page <= maxPages; page++) {
        setAllPagesProgress(prev => ({ ...prev, current: page }));
        
        
        // Fetch the page
        const pageResults = await performSearch(page);
        if (pageResults && pageResults.success) {
          allResults.push(...pageResults.results);
          totalProcessed += pageResults.results.length;
          
          
          // Check if we've reached the 1000 result limit
          if (totalProcessed >= maxResults) {
            break;
          }
        } else {
          console.warn(`⚠️ Page ${page} failed or returned no results`);
        }
      }


      // Now process all collected results through the business extraction
      if (allResults.length > 0) {
        setSearchResults(allResults);
        
        // Transform all results for API processing
        const transformedResults = allResults.map(result => ({
          title: result.title,
          link: result.url,
          snippet: result.description,
          displayLink: result.displayUrl
        }));


        const response = await fetch('/api/admin/industry-search/process-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchResults: transformedResults,
            industry: selectedIndustry?.title,
            location: selectedCity?.name,
            city: selectedCity?.name,
            stateProvince: selectedCity?.state?.name,
            country: selectedCity?.country?.name,
            minConfidence: 0.7,
            dryRun: !saveToDirectory
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform and display results similar to extractAllBusinesses
          if (data.data.businesses && Array.isArray(data.data.businesses)) {
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

            // Update results with extraction data
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

            // Set extraction results
            const extractionResultsMap = transformedExtractions.reduce((acc: any, extraction: any) => {
              if (extraction.baseUrl) {
                acc[extraction.baseUrl] = extraction;
              }
              return acc;
            }, {});

            setExtractionResults(extractionResultsMap);
            totalBusinesses = transformedExtractions.length;
            
            
            // Show success message
            if (saveToDirectory) {
              setSuccessMessage(`Successfully processed all ${pagination.totalPages} pages and saved ${totalBusinesses} businesses to the business directory!`);
            } else {
              setSuccessMessage(`Successfully processed all ${pagination.totalPages} pages and extracted ${totalBusinesses} businesses (dry run mode - no data saved)`);
            }
          }
        } else {
          throw new Error(data.error || 'Business extraction failed');
        }
      }

      setAllPagesProgress({ current: pagination.totalPages, total: pagination.totalPages, processed: totalProcessed });

    } catch (error) {
      console.error('❌ Failed to process all pages:', error);
      setError(`Failed to process all pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessingAllPages(false);
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

  // Debug logging for notifications
  useEffect(() => {
  }, []);

  useEffect(() => {
  }, [notifications]);

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
            
            {/* Enhanced Industry Search */}
            <EnhancedSearch
              searchValue={industrySearch}
              onSearchChange={setIndustrySearch}
              searchPlaceholder="Search for an industry..."
              searchDebounce={300}
              filters={industrySearchFilters}
              activeFilters={industryFilters}
              onFilterChange={handleIndustryFilterChange}
              sortOptions={industrySortOptions}
              currentSort={industrySort}
              onSortChange={handleIndustrySortChange}
              totalResults={industries.length}
              isLoading={isLoadingIndustries}
              enableAdvancedSearch={true}
              onAdvancedSearch={(query) => setIndustrySearch(query)}
              onFocus={() => setShowIndustryDropdown(true)}
              className="mb-4"
            />
            
            {/* Industry Results Dropdown */}
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
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {industry.keywordsCount} keywords • {industry.businessesCount || 0} businesses
                      </div>
                    </button>
                  ))
                ) : industrySearch.trim().length >= 2 ? (
                  <div className="p-3 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No industries found</div>
                ) : null}
              </div>
            )}
            
            {/* Selected Industry Display */}
            {selectedIndustry && (
              <div className="mt-2 p-3 rounded-lg border" style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-gray-light)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {selectedIndustry.title}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {selectedIndustry.keywordsCount} keywords • {selectedIndustry.businessesCount || 0} businesses
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearIndustry}
                    className="text-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
          
          {/* Date Filtering Section */}
          <div className="border-t pt-4 mt-4" style={{ borderColor: 'var(--color-gray-light)' }}>
            <div className="mb-3">
              <h4 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Date Filtering
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Limit search results to content published within a specific time period
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableDateFiltering"
                  checked={dateFiltering.enabled}
                  onChange={(e) => setDateFiltering(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="enableDateFiltering" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Enable Date Filtering
                </label>
              </div>
              
              {dateFiltering.enabled && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <label htmlFor="maxAgeDays" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Maximum Age:
                    </label>
                    <select
                      id="maxAgeDays"
                      value={dateFiltering.maxAgeDays}
                      onChange={(e) => setDateFiltering(prev => ({ ...prev, maxAgeDays: parseInt(e.target.value) }))}
                      className="px-3 py-2 rounded-md border text-sm"
                      style={{ 
                        backgroundColor: 'var(--color-bg-primary)', 
                        borderColor: 'var(--color-gray-light)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <option value={30}>30 days</option>
                      <option value={90}>3 months</option>
                      <option value={180}>6 months</option>
                      <option value={365}>1 year</option>
                      <option value={730}>2 years</option>
                      <option value={1095}>3 years</option>
                    </select>
                  </div>
                  
                  <div className="text-xs p-2 rounded" style={{ 
                    backgroundColor: 'var(--color-info-light)', 
                    color: 'var(--color-info)',
                    border: '1px solid var(--color-info)'
                  }}>
                    <strong>Note:</strong> Date filtering uses Google's dateRestrict parameter to limit results to content published within the specified time period. This helps ensure search results are recent and relevant.
                  </div>
                </div>
              )}
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

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 rounded-lg border-2" style={{
          backgroundColor: 'var(--color-success-light)',
          borderColor: 'var(--color-success)',
          color: 'var(--color-success-dark)'
        }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-success)' }}>
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <span className="font-medium">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-sm opacity-75 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
                  onClick={processAllPages}
                  disabled={processingAllPages || searchResults.length === 0 || !pagination}
                  className="flex items-center gap-2"
                >
                  {processingAllPages ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Processing All Pages...
                    </>
                  ) : (
                    <>
                      <Info className="h-4 w-4" />
                      Process All Pages
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={extractAllBusinesses}
                  disabled={extractionInProgress || backgroundExtractionInProgress || searchResults.length === 0}
                  className="flex items-center gap-2"
                >
                  {extractionInProgress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Extracting...
                    </>
                  ) : backgroundExtractionInProgress ? (
                    <>
                      <Clock className="h-4 w-4" />
                      Background Extraction Running
                    </>
                  ) : (
                                      <>
                    <Info className="h-4 w-4" />
                    Extract All Businesses
                    {pagination && pagination.totalPages > 1 && (
                      <span className="text-xs ml-1">({pagination.totalPages} pages)</span>
                    )}
                  </>
                  )}
                </Button>

                {/* Notification Center */}
                <NotificationCenter
                  notifications={notifications}
                  onDismiss={dismissNotification}
                  onClearAll={clearAllNotifications}
                />
              </div>
              

              
              {/* All Pages Progress Indicator */}
              {processingAllPages && (
                <div className="mt-3 p-3 rounded-lg" style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-primary)'
                }}>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--color-primary)' }}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Processing All Pages
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {allPagesProgress.current} / {allPagesProgress.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2" style={{ backgroundColor: 'var(--color-gray-light)' }}>
                        <div 
                          className="h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            backgroundColor: 'var(--color-primary)',
                            width: `${(allPagesProgress.current / allPagesProgress.total) * 100}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Page {allPagesProgress.current} of {allPagesProgress.total} • {allPagesProgress.processed} results collected
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Background Extraction Progress */}
              {backgroundExtractionJob && (
                <div id="extraction-progress" className="mt-3 p-3 rounded-lg" style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-primary)'
                }}>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {backgroundExtractionJob.status === 'processing' ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--color-primary)' }}></div>
                      ) : backgroundExtractionJob.status === 'completed' ? (
                        <Check className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                      ) : backgroundExtractionJob.status === 'failed' ? (
                        <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-error)' }} />
                      ) : (
                        <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Background Business Extraction
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {backgroundExtractionJob.processedResults} / {backgroundExtractionJob.totalResults}
                        </span>
                      </div>
                      
                      {backgroundExtractionJob.status === 'processing' && (
                        <div className="w-full bg-gray-200 rounded-full h-2" style={{ backgroundColor: 'var(--color-gray-light)' }}>
                          <div 
                            className="h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              backgroundColor: 'var(--color-primary)',
                              width: `${(backgroundExtractionJob.processedResults / backgroundExtractionJob.totalResults) * 100}%`
                            }}
                          ></div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        <span>
                          Status: {backgroundExtractionJob.status.charAt(0).toUpperCase() + backgroundExtractionJob.status.slice(1)}
                        </span>
                        <span>
                          Success: {backgroundExtractionJob.successCount} • Errors: {backgroundExtractionJob.errorCount}
                        </span>
                      </div>
                      
                      {backgroundExtractionJob.status === 'completed' && (
                        <p className="text-xs mt-1" style={{ color: 'var(--color-success)' }}>
                          ✅ Extraction completed successfully! {backgroundExtractionJob.successCount} businesses extracted.
                        </p>
                      )}
                      
                      {backgroundExtractionJob.status === 'failed' && (
                        <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
                          ❌ Extraction failed: {backgroundExtractionJob.error}
                        </p>
                      )}
                      
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Started: {backgroundExtractionJob.startTime.toLocaleTimeString()}
                        {backgroundExtractionJob.endTime && ` • Completed: ${backgroundExtractionJob.endTime.toLocaleTimeString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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

      {/* Date Filtering Information */}
      {appliedDateFiltering && (
        <div className="mt-3 p-3 rounded-lg" style={{ 
          backgroundColor: 'var(--color-info-light)',
          border: '1px solid var(--color-info)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-info)' }}></div>
            <span className="text-sm font-medium" style={{ color: 'var(--color-info-dark)' }}>
              Date Filtering Applied
            </span>
          </div>
          <div className="text-sm" style={{ color: 'var(--color-info-dark)' }}>
            {appliedDateFiltering.description}
            {appliedDateFiltering.dateRestrict && (
              <span className="ml-2 px-2 py-1 rounded text-xs" style={{ 
                backgroundColor: 'var(--color-info)', 
                color: 'white' 
              }}>
                {appliedDateFiltering.dateRestrict}
              </span>
            )}
          </div>
        </div>
      )}


    </div>
  );
}

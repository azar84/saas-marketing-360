import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, SortAsc, SortDesc, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';

export interface SearchFilter {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'select' | 'boolean' | 'date' | 'number' | 'autocomplete';
  options?: { value: string; label: string }[];
}

export interface SortOption {
  id: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

export interface EnhancedSearchProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchDebounce?: number;
  onFocus?: () => void;
  
  // Filters
  filters?: SearchFilter[];
  activeFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  onClearFilters?: () => void;
  
  // Sorting
  sortOptions?: SortOption[];
  currentSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  
  // Results
  totalResults?: number;
  isLoading?: boolean;
  
  // Advanced search
  enableAdvancedSearch?: boolean;
  onAdvancedSearch?: (query: string) => void;
  
  // Custom actions
  customActions?: React.ReactNode;
  
  // Styling
  className?: string;
  variant?: 'default' | 'compact' | 'expanded';
}

export function EnhancedSearch({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchDebounce = 300,
  onFocus,
  filters = [],
  activeFilters,
  onFilterChange,
  onClearFilters,
  sortOptions = [],
  currentSort,
  onSortChange,
  totalResults,
  isLoading = false,
  enableAdvancedSearch = false,
  onAdvancedSearch,
  customActions,
  className = "",
  variant = "default"
}: EnhancedSearchProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedQuery, setAdvancedQuery] = useState("");
  const [visibleAutocomplete, setVisibleAutocomplete] = useState<string | null>(null);
  
  const filtersRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const advancedRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
      if (advancedRef.current && !advancedRef.current.contains(event.target as Node)) {
        setShowAdvancedSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, searchDebounce);

    return () => clearTimeout(timer);
  }, [searchValue, searchDebounce]);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== searchValue) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange]);

  // Handle advanced search
  const handleAdvancedSearch = useCallback(() => {
    if (onAdvancedSearch && advancedQuery.trim()) {
      onAdvancedSearch(advancedQuery.trim());
      setAdvancedQuery("");
    }
  }, [onAdvancedSearch, advancedQuery]);

  // Get active filters count
  const activeFiltersCount = Object.values(activeFilters).filter(v => 
    v !== undefined && v !== null && v !== "" && v !== false
  ).length;

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      // Clear individual filters
      Object.keys(activeFilters).forEach(filterId => {
        onFilterChange(filterId, undefined);
      });
    }
  }, [activeFilters, onFilterChange, onClearFilters]);

  // Render filter input based on type
  const renderFilterInput = (filter: SearchFilter) => {
    const value = activeFilters[filter.id];
    
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onFilterChange(filter.id, e.target.value || undefined)}
            className="w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ 
              backgroundColor: 'var(--color-bg-primary)', 
              borderColor: 'var(--color-gray-light)',
              color: 'var(--color-text-primary)',
              '--tw-ring-color': 'var(--color-primary)'
            } as any}
          >
            <option value="">All</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`filter-${filter.id}`}
              checked={value || false}
              onChange={(e) => onFilterChange(filter.id, e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor={`filter-${filter.id}`} className="text-sm">
              {filter.label}
            </label>
          </div>
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onFilterChange(filter.id, e.target.value || undefined)}
            placeholder={filter.label}
            className="w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ 
              backgroundColor: 'var(--color-bg-primary)', 
              borderColor: 'var(--color-gray-light)',
              color: 'var(--color-text-primary)',
              '--tw-ring-color': 'var(--color-primary)'
            } as any}
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onFilterChange(filter.id, e.target.value || undefined)}
            className="w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ 
              backgroundColor: 'var(--color-bg-primary)', 
              borderColor: 'var(--color-gray-light)',
              color: 'var(--color-text-primary)',
              '--tw-ring-color': 'var(--color-primary)'
            } as any}
          />
        );
        
      case 'autocomplete':
        return (
          <div className="relative">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => {
                onFilterChange(filter.id, e.target.value || undefined);
                // Show dropdown when typing if there are options
                if (filter.options && filter.options.length > 0) {
                  setVisibleAutocomplete(filter.id);
                }
              }}
              onFocus={() => {
                // Show dropdown when input is focused if there are options
                if (filter.options && filter.options.length > 0) {
                  setVisibleAutocomplete(filter.id);
                }
              }}
              onBlur={() => {
                // Hide dropdown when input loses focus (with a small delay to allow clicking)
                setTimeout(() => setVisibleAutocomplete(null), 150);
              }}
              placeholder={filter.label}
              className="w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)', 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                '--tw-ring-color': 'var(--color-primary)'
              } as any}
            />
            {filter.options && filter.options.length > 0 && visibleAutocomplete === filter.id && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filter.options.map((option, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      onFilterChange(filter.id, option.value);
                      // Hide dropdown after selection
                      setVisibleAutocomplete(null);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      default: // text
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onFilterChange(filter.id, e.target.value || undefined)}
            placeholder={filter.label}
            className="w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ 
              backgroundColor: 'var(--color-bg-primary)', 
              borderColor: 'var(--color-gray-light)',
              color: 'var(--color-text-primary)',
              '--tw-ring-color': 'var(--color-primary)'
            } as any}
          />
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" 
              style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onFocus}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)', 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                '--tw-ring-color': 'var(--color-primary)'
              } as any}
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-opacity-10 transition-colors"
                style={{ 
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'var(--color-bg-secondary)'
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Filter Toggle */}
          {filters.length > 0 && (
            <div ref={filtersRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          )}
          
          {/* Sort Dropdown */}
          {sortOptions.length > 0 && onSortChange && (
            <div className="relative" ref={sortRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2"
              >
                {currentSort ? (
                  <>
                    {currentSort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    {currentSort.label}
                  </>
                ) : (
                  <>
                    <SortAsc className="h-4 w-4" />
                    Sort
                  </>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        onSortChange(option);
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span>{option.label}</span>
                      {currentSort?.id === option.id && (
                        <span className="text-blue-600">
                          {currentSort.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Advanced Search Toggle */}
          {enableAdvancedSearch && (
            <div ref={advancedRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="flex items-center gap-2"
              >
                Advanced
                {showAdvancedSearch ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          )}
          
          {/* Custom Actions */}
          {customActions}
        </div>
        
        {/* Results Count */}
        {totalResults !== undefined && (
          <div className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {isLoading ? 'Searching...' : `${totalResults} results found`}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && filters.length > 0 && (
        <div ref={filtersRef} className="p-4 rounded-lg border" style={{ 
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-gray-light)'
        }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Filters
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-sm"
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(filter => (
              <div key={filter.id} className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Search Panel */}
      {showAdvancedSearch && enableAdvancedSearch && (
        <div ref={advancedRef} className="p-4 rounded-lg border" style={{ 
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-gray-light)'
        }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Advanced Search
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSearch(false)}
              className="text-sm"
            >
              Close
            </Button>
          </div>
          
          <div className="space-y-3">
            <textarea
              value={advancedQuery}
              onChange={(e) => setAdvancedQuery(e.target.value)}
              placeholder="Enter advanced search query (e.g., 'industry:software AND location:california')"
              rows={3}
              className="w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)', 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                '--tw-ring-color': 'var(--color-primary)'
              } as any}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAdvancedSearch}
                disabled={!advancedQuery.trim()}
                size="sm"
              >
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setAdvancedQuery("")}
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

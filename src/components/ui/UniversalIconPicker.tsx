'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid, List, X, Check, Filter } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io';
import * as BiIcons from 'react-icons/bi';

// Error boundary component to catch Lucide React errors
class IconErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Silently catch the error - don't log it to avoid console spam
    // The error is likely the Lucide "string.replace is not a function" issue
  }

  render() {
    if (this.state.hasError) {
      // Return fallback or null
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

interface IconLibrary {
  name: string;
  icons: { [key: string]: React.ComponentType<any> };
  prefix: string;
  description: string;
}

interface IconResult {
  name: string;
  component: React.ComponentType<any>;
  library: string;
  libraryName: string;
  fullName: string;
}

interface UniversalIconPickerProps {
  value?: string;
  onChange: (iconName: string, iconComponent: React.ComponentType<any>, library: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  maxHeight?: string;
  // Design system colors
  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;
  backgroundPrimary?: string;
  backgroundSecondary?: string;
}

const UniversalIconPickerInner: React.FC<UniversalIconPickerProps> = ({
  value,
  onChange,
  placeholder = "Search icons...",
  className = "",
  disabled = false,
  showPreview = true,
  maxHeight = "400px",
  textPrimary = "#000000",
  textSecondary = "#666666",
  textMuted = "#999999",
  backgroundPrimary = "#ffffff",
  backgroundSecondary = "#f9fafb"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm]);



  // Safe Lucide icons loader
  const safeLucideIcons = useMemo(() => {
    const safeIcons: { [key: string]: React.ComponentType<any> } = {};
    
    Object.entries(LucideIcons).forEach(([iconName, IconComponent]) => {
      // Only include icons that are actually functions and have safe names
      if (
        typeof iconName === 'string' && 
        typeof IconComponent === 'function' &&
        iconName.length > 0 &&
        !['default', 'createLucideIcon', 'Icon'].includes(iconName)
      ) {
        // Just store the original component - we'll handle errors in the ErrorBoundary
        safeIcons[iconName] = IconComponent as React.ComponentType<any>;
      }
    });
    
    return safeIcons;
  }, []);

  // Define available icon libraries
  const iconLibraries: IconLibrary[] = useMemo(() => [
    {
      name: 'lucide',
      icons: safeLucideIcons,
      prefix: 'lucide',
      description: 'Beautiful & consistent icons'
    },
    {
      name: 'react-icons-fa',
      icons: FaIcons as any,
      prefix: 'fa',
      description: 'Font Awesome icons'
    },
    {
      name: 'react-icons-md',
      icons: MdIcons as any,
      prefix: 'md',
      description: 'Material Design icons'
    },
    {
      name: 'react-icons-io',
      icons: IoIcons as any,
      prefix: 'io',
      description: 'Ionicons'
    },
    {
      name: 'react-icons-bi',
      icons: BiIcons as any,
      prefix: 'bi',
      description: 'Bootstrap icons'
    }
  ], []);

  // Enhanced search function with fuzzy matching
  const matchesSearchTerm = (iconName: string, searchTerm: string): boolean => {
    const name = iconName.toLowerCase();
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) return false;
    
    // Exact match
    if (name === term) return true;
    
    // Contains match
    if (name.includes(term)) return true;
    
    // Starts with match
    if (name.startsWith(term)) return true;
    
    // Word boundary match (for camelCase or PascalCase icons)
    const words = name.split(/(?=[A-Z])|[-_\s]+/).filter(Boolean);
    if (words.some(word => word.toLowerCase().startsWith(term))) return true;
    
    // Fuzzy match - check if all characters of search term exist in order
    let termIndex = 0;
    for (let i = 0; i < name.length && termIndex < term.length; i++) {
      if (name[i] === term[termIndex]) {
        termIndex++;
      }
    }
    
    return termIndex === term.length;
  };

  // Calculate relevance score for better sorting
  const getRelevanceScore = (iconName: string, searchTerm: string): number => {
    const name = iconName.toLowerCase();
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) return 0;
    
    let score = 0;
    
    // Exact match gets highest score
    if (name === term) score += 100;
    
    // Starts with search term gets high score
    if (name.startsWith(term)) score += 80;
    
    // Contains search term gets medium score
    if (name.includes(term)) score += 60;
    
    // Word boundary match (for camelCase)
    const words = name.split(/(?=[A-Z])|[-_\s]+/).filter(Boolean);
    if (words.some(word => word.toLowerCase().startsWith(term))) score += 40;
    
    // Shorter names get slight bonus (more likely to be what user wants)
    score += Math.max(0, 20 - name.length);
    
    // Fuzzy match gets lower score
    let termIndex = 0;
    for (let i = 0; i < name.length && termIndex < term.length; i++) {
      if (name[i] === term[termIndex]) {
        termIndex++;
      }
    }
    if (termIndex === term.length) score += 20;
    
    return score;
  };

  // Search across all libraries
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm) {
      // If no search term, show popular icons from all libraries
      const popularIcons: IconResult[] = [];
      
      iconLibraries.forEach(library => {
        const iconNames = Object.keys(library.icons);
        // Take first 20 icons from each library as "popular"
        const popularFromLibrary = iconNames
          .filter(iconName => {
            // Basic validation for icon names
            if (typeof iconName !== 'string' || iconName.length === 0) {
              return false;
            }
            
            // Skip common non-component properties
            const invalidNames = ['default', 'prototype', 'constructor', 'length', 'name', 'toString', 'valueOf', 'hasOwnProperty'];
            if (invalidNames.includes(iconName)) {
              return false;
            }
            
            // Safety check: ensure the component exists and is valid
            const component = library.icons[iconName];
            if (!component || (typeof component !== 'function' && !(typeof component === 'object' && component !== null))) {
              return false;
            }
            

            
            return true;
          })
          .slice(0, 20)
          .map(iconName => ({
            name: iconName,
            component: library.icons[iconName],
            library: library.name,
            libraryName: library.description,
            fullName: `${library.name}:${iconName}`
          }));
        popularIcons.push(...popularFromLibrary);
      });
      
      return popularIcons.slice(0, 100); // Limit to 100 total
    }

    // Search across all libraries
    const results: IconResult[] = [];
    
    iconLibraries.forEach(library => {
      const iconNames = Object.keys(library.icons);
      
      const matchingIcons = iconNames
        .filter(iconName => {
          // Basic validation for icon names
          if (typeof iconName !== 'string' || iconName.length === 0) {
            return false;
          }
          
          // Skip common non-component properties
          const invalidNames = ['default', 'prototype', 'constructor', 'length', 'name', 'toString', 'valueOf', 'hasOwnProperty'];
          if (invalidNames.includes(iconName)) {
            return false;
          }
          
          // Safety check: ensure the component exists and is valid
          const component = library.icons[iconName];
          if (!component || (typeof component !== 'function' && !(typeof component === 'object' && component !== null))) {
            return false;
          }
          

          
          // Check if it matches the search term
          return matchesSearchTerm(iconName, debouncedSearchTerm);
        })
        .map(iconName => ({
          name: iconName,
          component: library.icons[iconName],
          library: library.name,
          libraryName: library.description,
          fullName: `${library.name}:${iconName}`
        }));
      
      results.push(...matchingIcons);
    });

    // Sort by relevance with improved scoring
    return results
      .map(result => ({
        ...result,
        score: getRelevanceScore(result.name, debouncedSearchTerm)
      }))
      .sort((a, b) => {
        // Sort by score first (higher score = more relevant)
        if (a.score !== b.score) return b.score - a.score;
        
        // Then by alphabetical order
        return a.name.localeCompare(b.name);
      })
      .slice(0, 300); // Increased limit for better search results
  }, [debouncedSearchTerm, iconLibraries]);

  // Filter by selected library if not "all"
  const filteredResults = useMemo(() => {
    if (selectedLibrary === 'all') {
      return searchResults;
    }
    return searchResults.filter(result => result.library === selectedLibrary);
  }, [searchResults, selectedLibrary]);

  // Get current selected icon component
  const getCurrentIconComponent = () => {
    if (!value || typeof value !== 'string') return null;
    
    try {
      const [library, iconName] = value.split(':');
      if (!library || !iconName || typeof iconName !== 'string') return null;
      
      const libraryData = iconLibraries.find(lib => lib.name === library);
      const component = libraryData?.icons[iconName];
      
      // Safety check to ensure the component is valid
      if (component && (typeof component === 'function' || (typeof component === 'object' && (component as any).$$typeof))) {
        return component;
      }
      
      return null;
    } catch (error) {
      console.warn('Error getting current icon component:', error);
      return null;
    }
  };

  const handleIconSelect = (result: IconResult) => {
    onChange(result.fullName, result.component, result.library);
    setIsOpen(false);
    setSearchTerm('');
  };

  const CurrentIcon = getCurrentIconComponent();

  // Get library options for filter
  const libraryOptions = useMemo(() => [
    { value: 'all', label: 'All Libraries' },
    ...iconLibraries.map(lib => ({
      value: lib.name,
      label: lib.description
    }))
  ], [iconLibraries]);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 border rounded-lg
          text-left transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 focus:border-blue-500'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'}
        `}
        style={{ 
          backgroundColor: backgroundPrimary,
          color: textPrimary
        }}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
                               {CurrentIcon && showPreview && (
            <IconErrorBoundary fallback={<div className="w-5 h-5 flex-shrink-0 bg-gray-300 rounded" />}>
              {(() => {
                if (CurrentIcon) {
                  // Extra validation before rendering
                  if (typeof CurrentIcon === 'function') {
                    return <CurrentIcon className="w-5 h-5 flex-shrink-0" style={{ color: textSecondary }} />;
                  } else if (typeof CurrentIcon === 'object' && CurrentIcon !== null && (CurrentIcon as any).$$typeof) {
                    const IconComponent = CurrentIcon as React.ComponentType<any>;
                    return <IconComponent className="w-5 h-5 flex-shrink-0" style={{ color: textSecondary }} />;
                  }
                }
                return <div className="w-5 h-5 flex-shrink-0 bg-gray-300 rounded" />;
              })()}
            </IconErrorBoundary>
          )}
          <span className="truncate text-sm" style={{ color: textPrimary }}>
            {value ? value.split(':')[1] : placeholder}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {CurrentIcon && (
            <span className="text-xs px-2 py-1 rounded" style={{ color: textMuted, backgroundColor: backgroundSecondary }}>
              {value?.split(':')[0]}
            </span>
          )}
          <Search className="w-4 h-4" style={{ color: textMuted }} />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[600px] w-max max-w-[800px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100" style={{ backgroundColor: backgroundPrimary }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/4 w-4 h-4" style={{ color: textMuted }} />
                  <input
                    type="text"
                    placeholder="Search all icon libraries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      color: textPrimary,
                      backgroundColor: backgroundPrimary
                    }}
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  style={{ color: textPrimary }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                {/* Library Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" style={{ color: textMuted }} />
                  <select
                    value={selectedLibrary}
                    onChange={(e) => setSelectedLibrary(e.target.value)}
                    className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ 
                      color: textPrimary,
                      backgroundColor: backgroundPrimary
                    }}
                  >
                    {libraryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-200 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 text-sm ${viewMode === 'grid' ? 'bg-blue-500 text-white' : ''}`}
                    style={{ 
                      backgroundColor: viewMode === 'grid' ? '#3b82f6' : backgroundPrimary,
                      color: viewMode === 'grid' ? '#ffffff' : textSecondary
                    }}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 text-sm ${viewMode === 'list' ? 'bg-blue-500 text-white' : ''}`}
                    style={{ 
                      backgroundColor: viewMode === 'list' ? '#3b82f6' : backgroundPrimary,
                      color: viewMode === 'list' ? '#ffffff' : textSecondary
                    }}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Stats */}
              {searchTerm && (
                <div className="mt-3 text-sm" style={{ color: textMuted }}>
                  Found {filteredResults.length} icons across all libraries
                </div>
              )}
            </div>

            {/* Icons Grid/List */}
            <div 
              className="overflow-y-auto"
              style={{ maxHeight, backgroundColor: backgroundPrimary }}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-12 gap-2 p-4">
                  {filteredResults.map(result => {
                    const isSelected = value === result.fullName;
                    
                    return (
                      <motion.button
                        key={result.fullName}
                        type="button"
                        onClick={() => handleIconSelect(result)}
                        className={`
                          p-3 rounded-lg transition-all duration-200 relative
                          ${isSelected ? 'border-2 border-blue-500' : 'border border-transparent'}
                        `}
                        style={{
                          backgroundColor: isSelected ? '#dbeafe' : backgroundPrimary,
                          color: textPrimary
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={`${result.name} (${result.libraryName})`}
                      >
                        <div className="relative">
                                                                             <IconErrorBoundary fallback={<div className="w-6 h-6 bg-gray-300 rounded" />}>
                          {(() => {
                            if (result.component) {
                              // Extra validation before rendering
                              if (typeof result.component === 'function') {
                                const IconComponent = result.component;
                                return <IconComponent className="w-6 h-6" style={{ color: textSecondary }} />;
                              } else if (typeof result.component === 'object' && result.component !== null && (result.component as any).$$typeof) {
                                const IconComponent = result.component as React.ComponentType<any>;
                                return <IconComponent className="w-6 h-6" style={{ color: textSecondary }} />;
                              }
                            }
                            return <div className="w-6 h-6 bg-gray-300 rounded" />;
                          })()}
                        </IconErrorBoundary>
                          {isSelected && (
                            <Check className="absolute -top-1 -right-1 w-3 h-3 text-blue-500 bg-white rounded-full" />
                          )}
                        </div>
                        {/* Library indicator */}
                        <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full text-[8px] flex items-center justify-center font-medium" style={{ backgroundColor: backgroundSecondary, color: textMuted }}>
                          {result.library.charAt(0).toUpperCase()}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1 p-4">
                  {filteredResults.map(result => {
                    const isSelected = value === result.fullName;
                    
                    return (
                      <motion.button
                        key={result.fullName}
                        type="button"
                        onClick={() => handleIconSelect(result)}
                        className={`
                          w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-all duration-200
                          ${isSelected ? 'border border-blue-500' : 'border border-transparent'}
                        `}
                        style={{
                          backgroundColor: isSelected ? '#dbeafe' : backgroundPrimary,
                          color: textPrimary
                        }}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                                                                         <IconErrorBoundary fallback={<div className="w-6 h-6 flex-shrink-0 bg-gray-300 rounded" />}>
                          {(() => {
                            if (result.component) {
                              // Extra validation before rendering
                              if (typeof result.component === 'function') {
                                const IconComponent = result.component;
                                return <IconComponent className="w-6 h-6 flex-shrink-0" style={{ color: textSecondary }} />;
                              } else if (typeof result.component === 'object' && result.component !== null && (result.component as any).$$typeof) {
                                const IconComponent = result.component as React.ComponentType<any>;
                                return <IconComponent className="w-6 h-6 flex-shrink-0" style={{ color: textSecondary }} />;
                              }
                            }
                            return <div className="w-6 h-6 flex-shrink-0 bg-gray-300 rounded" />;
                          })()}
                        </IconErrorBoundary>
                        <div className="flex-1 text-left">
                          <span className="text-sm font-medium block" style={{ color: textPrimary }}>{result.name}</span>
                          <span className="text-xs" style={{ color: textMuted }}>{result.libraryName}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-500 ml-auto" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {filteredResults.length === 0 && (
                <div className="p-12 text-center" style={{ color: textMuted }}>
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No icons found</p>
                  <p className="text-sm mt-2">
                    {searchTerm ? 'Try a different search term' : 'Start typing to search icons'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Wrap the entire component with an error boundary
const UniversalIconPicker: React.FC<UniversalIconPickerProps> = (props) => {
  return (
    <IconErrorBoundary fallback={
      <div className="w-full p-4 text-center text-gray-500">
        <div className="text-sm">Icon picker temporarily unavailable</div>
      </div>
    }>
      <UniversalIconPickerInner {...props} />
    </IconErrorBoundary>
  );
};

export default UniversalIconPicker; 
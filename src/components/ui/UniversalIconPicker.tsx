'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid, List, X, Check, Filter } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io';
import * as BiIcons from 'react-icons/bi';

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

const UniversalIconPicker: React.FC<UniversalIconPickerProps> = ({
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
  const [selectedLibrary, setSelectedLibrary] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Define available icon libraries
  const iconLibraries: IconLibrary[] = useMemo(() => [
    {
      name: 'lucide',
      icons: LucideIcons as any,
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

  // Search across all libraries
  const searchResults = useMemo(() => {
    if (!searchTerm) {
      // If no search term, show popular icons from all libraries
      const popularIcons: IconResult[] = [];
      
      iconLibraries.forEach(library => {
        const iconNames = Object.keys(library.icons);
        // Take first 20 icons from each library as "popular"
        const popularFromLibrary = iconNames
          .filter(iconName => {
            // Safety check: ensure iconName is a string
            if (typeof iconName !== 'string') return false;
            
            // Skip common non-component properties
            if (iconName.startsWith('__') || iconName === 'default' || iconName === 'prototype' || iconName === 'constructor') {
              return false;
            }
            
            // Safety check: ensure the component exists and is valid
            const component = library.icons[iconName];
            
            // More robust React component validation
            if (!component) return false;
            
            // Check if it's a function (functional component)
            if (typeof component === 'function') {
              return true;
            }
            
            // Check if it's a React element/component object
            if (typeof component === 'object' && component !== null && (component as any).$$typeof) {
              return true;
            }
            
            // Log problematic components for debugging
            console.warn(`Skipping invalid icon component: ${iconName} in ${library.name}`, typeof component);
            return false;
            
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
          // Safety check: ensure iconName is a string
          if (typeof iconName !== 'string') return false;
          
          // Skip common non-component properties
          if (iconName.startsWith('__') || iconName === 'default' || iconName === 'prototype' || iconName === 'constructor') {
            return false;
          }
          
          // Safety check: ensure the component exists and is valid
          const component = library.icons[iconName];
          
          // More robust React component validation
          if (!component) return false;
          
          // Check if it's a function (functional component)
          if (typeof component === 'function') {
            return true;
          }
          
          // Check if it's a React element/component object
          if (typeof component === 'object' && component !== null && (component as any).$$typeof) {
            return true;
          }
          
          // Log problematic components for debugging
          console.warn(`Skipping invalid icon component: ${iconName} in ${library.name}`, typeof component);
          return false;
          
          return iconName.toLowerCase().includes(searchTerm.toLowerCase());
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

    // Sort by relevance (exact matches first, then alphabetical)
    return results
      .sort((a, b) => {
        const aExact = a.name.toLowerCase() === searchTerm.toLowerCase();
        const bExact = b.name.toLowerCase() === searchTerm.toLowerCase();
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return a.name.localeCompare(b.name);
      })
      .slice(0, 200); // Limit search results
  }, [searchTerm, iconLibraries]);

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
                     {CurrentIcon && showPreview && (() => {
             try {
               if (CurrentIcon) {
                 // Extra validation before rendering
                 if (typeof CurrentIcon === 'function') {
                   return <CurrentIcon className="w-5 h-5 flex-shrink-0" style={{ color: textSecondary }} />;
                 } else if (typeof CurrentIcon === 'object' && CurrentIcon !== null && (CurrentIcon as any).$$typeof) {
                   const IconComponent = CurrentIcon as React.ComponentType<any>;
                   return <IconComponent className="w-5 h-5 flex-shrink-0" style={{ color: textSecondary }} />;
                 }
               }
             } catch (error) {
               console.warn('Failed to render current icon:', error, 'Component type:', typeof CurrentIcon);
             }
             return <div className="w-5 h-5 flex-shrink-0 bg-gray-300 rounded" />;
           })()}
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
                                                     {(() => {
                             try {
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
                             } catch (error) {
                               console.warn(`Failed to render icon ${result.name} from ${result.library}:`, error, 'Component type:', typeof result.component);
                             }
                             return <div className="w-6 h-6 bg-gray-300 rounded" />;
                           })()}
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
                                                 {(() => {
                           try {
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
                           } catch (error) {
                             console.warn(`Failed to render icon ${result.name} from ${result.library}:`, error, 'Component type:', typeof result.component);
                           }
                           return <div className="w-6 h-6 flex-shrink-0 bg-gray-300 rounded" />;
                         })()}
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

export default UniversalIconPicker; 
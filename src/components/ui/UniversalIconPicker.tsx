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
}

const UniversalIconPicker: React.FC<UniversalIconPickerProps> = ({
  value,
  onChange,
  placeholder = "Search icons...",
  className = "",
  disabled = false,
  showPreview = true,
  maxHeight = "400px"
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
        const popularFromLibrary = iconNames.slice(0, 20).map(iconName => ({
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
        .filter(iconName => 
          iconName.toLowerCase().includes(searchTerm.toLowerCase())
        )
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
    if (!value) return null;
    
    const [library, iconName] = value.split(':');
    const libraryData = iconLibraries.find(lib => lib.name === library);
    return libraryData?.icons[iconName] || null;
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
          bg-white text-left transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 focus:border-blue-500'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'}
        `}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {CurrentIcon && showPreview && (
            <CurrentIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
          )}
          <span className="truncate text-sm">
            {value ? value.split(':')[1] : placeholder}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {CurrentIcon && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {value?.split(':')[0]}
            </span>
          )}
          <Search className="w-4 h-4 text-gray-400" />
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
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/4 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search all icon libraries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                {/* Library Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedLibrary}
                    onChange={(e) => setSelectedLibrary(e.target.value)}
                    className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className={`p-2 text-sm ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 text-sm ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Stats */}
              {searchTerm && (
                <div className="mt-3 text-sm text-gray-500">
                  Found {filteredResults.length} icons across all libraries
                </div>
              )}
            </div>

            {/* Icons Grid/List */}
            <div 
              className="overflow-y-auto"
              style={{ maxHeight }}
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
                          p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 relative
                          ${isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'border border-transparent'}
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={`${result.name} (${result.libraryName})`}
                      >
                        <div className="relative">
                          <result.component className="w-6 h-6 text-gray-700" />
                          {isSelected && (
                            <Check className="absolute -top-1 -right-1 w-3 h-3 text-blue-500 bg-white rounded-full" />
                          )}
                        </div>
                        {/* Library indicator */}
                        <div className="absolute bottom-1 right-1 w-3 h-3 bg-gray-300 rounded-full text-[8px] flex items-center justify-center text-gray-600 font-medium">
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
                          w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-100
                          ${isSelected ? 'bg-blue-100 border border-blue-500' : 'border border-transparent'}
                        `}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <result.component className="w-6 h-6 text-gray-700 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <span className="text-sm font-medium text-gray-700 block">{result.name}</span>
                          <span className="text-xs text-gray-500">{result.libraryName}</span>
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
                <div className="p-12 text-center text-gray-500">
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
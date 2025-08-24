'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  field: string;
  className?: string;
  disabled?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder,
  field,
  className = '',
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions when input changes or when certain fields are focused
  useEffect(() => {
    const fetchSuggestions = async () => {
      // For industry, city, country fields, show all options if input is empty
      if (['industry', 'city', 'country'].includes(field) && (!inputValue.trim() || inputValue.length < 2)) {
        setLoading(true);
        try {
          const response = await fetch(`/api/admin/companies/filter-options?field=${field}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.data || []);
          }
        } catch (error) {
          console.error(`Error fetching all ${field}s:`, error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      // For other fields or when searching, require at least 2 characters
      if (!inputValue.trim() || inputValue.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/admin/companies/filter-options?field=${field}&q=${encodeURIComponent(inputValue)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, field]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
    
    // For industry, city, country fields, fetch all options if input is cleared
    if (['industry', 'city', 'country'].includes(field) && !newValue.trim()) {
      fetchAllOptions();
    }
  };

  // Fetch all options for industry, city, country fields
  const fetchAllOptions = async () => {
    if (!['industry', 'city', 'country'].includes(field)) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/companies/filter-options?field=${field}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data || []);
      }
    } catch (error) {
      console.error(`Error fetching all ${field}s:`, error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    
    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== suggestion);
      return [suggestion, ...filtered].slice(0, 5);
    });
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-20"
          onFocus={() => {
            setIsOpen(true);
            // For industry, city, country fields, show all options when focused
            if (['industry', 'city', 'country'].includes(field) && !inputValue.trim()) {
              fetchAllOptions();
            }
          }}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading suggestions...
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              {['industry', 'city', 'country'].includes(field) && !inputValue.trim() && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b">
                  All Available {field === 'industry' ? 'Industries' : field === 'city' ? 'Cities' : 'Countries'}
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : inputValue.length >= 2 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No suggestions found
            </div>
          ) : recentSearches.length > 0 && !inputValue && !['industry', 'city', 'country'].includes(field) ? (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b">
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  {search}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

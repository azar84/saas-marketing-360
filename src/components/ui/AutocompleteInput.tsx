'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from './Input';
import { ChevronDown, X } from 'lucide-react';
import { useAdminApi } from '@/hooks/useApi';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  field: 'city' | 'stateProvince' | 'country' | 'industry';
  className?: string;
}

export function AutocompleteInput({ 
  value, 
  onChange, 
  placeholder, 
  field, 
  className = '' 
}: AutocompleteInputProps) {
  const { get } = useAdminApi();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await get(`/api/admin/business-directory/filter-options?field=${field}&q=${encodeURIComponent(inputValue.trim())}`);
        if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response && Array.isArray(response.data)) {
          setSuggestions(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [inputValue, field, get]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(true);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
  };

  // Handle clear input
  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
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
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          className="pr-20"
        />
        
        {/* Clear button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown className={`h-4 w-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              Loading...
            </div>
          ) : (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {suggestion}
                </button>
              ))}
              {suggestions.length === 0 && inputValue.trim().length >= 2 && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No suggestions found
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

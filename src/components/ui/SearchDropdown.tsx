'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Button } from './Button';

interface SearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  technologies: string[];
}

export default function SearchDropdown({
  value,
  onChange,
  placeholder = 'Search for a technology...',
  className = '',
  disabled = false,
  technologies
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTechnologies, setFilteredTechnologies] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter technologies based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTechnologies(technologies.slice(0, 50)); // Show first 50 by default
    } else {
      const filtered = technologies
        .filter(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 20); // Limit results for performance
      setFilteredTechnologies(filtered);
    }
  }, [searchTerm, technologies]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (technology: string) => {
    onChange(technology);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 transition-colors text-sm placeholder-text-muted"
          onFocus={(e) => {
            setIsOpen(true);
            e.target.style.borderColor = 'var(--color-primary)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-gray-light)';
          }}
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-gray-light)',
            color: 'var(--color-text-primary)'
          }}
        />
        <style jsx>{`
          input::placeholder {
            color: var(--color-text-muted) !important;
            opacity: 1;
          }
          input::-webkit-input-placeholder {
            color: var(--color-text-muted) !important;
            opacity: 1;
          }
          input::-moz-placeholder {
            color: var(--color-text-muted) !important;
            opacity: 1;
          }
          input:-ms-input-placeholder {
            color: var(--color-text-muted) !important;
            opacity: 1;
          }
          input:-moz-placeholder {
            color: var(--color-text-muted) !important;
            opacity: 1;
          }
        `}</style>
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full transition-colors"
              style={{
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              disabled={disabled}
            >
              <X 
                className="h-4 w-4" 
                style={{ color: 'var(--color-text-muted)' }}
              />
            </button>
          )}
          <button
            type="button"
            onClick={handleToggle}
            className="p-1 rounded-full transition-colors"
            style={{
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            disabled={disabled}
          >
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              style={{ color: 'var(--color-text-muted)' }}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-gray-light)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          <div 
            className="p-3 border-b"
            style={{ borderColor: 'var(--color-gray-light)' }}
          >
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search technologies..."
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors"
                style={{
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-bg-primary)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-gray-light)';
                }}
                autoFocus
              />
            </div>
          </div>

          <div className="py-1">
            {filteredTechnologies.length > 0 ? (
              filteredTechnologies.map((technology) => (
                <button
                  key={technology}
                  type="button"
                  onClick={() => handleSelect(technology)}
                  className="w-full px-4 py-2 text-left focus:outline-none transition-colors text-sm"
                  style={{
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {technology}
                </button>
              ))
            ) : (
              <div 
                className="px-4 py-3 text-sm text-center"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {searchTerm ? 'No technologies found' : 'Type to search technologies'}
              </div>
            )}
          </div>

          {filteredTechnologies.length > 0 && (
            <div 
              className="px-4 py-2 text-xs border-t"
              style={{ 
                color: 'var(--color-text-muted)',
                borderColor: 'var(--color-gray-light)',
                backgroundColor: 'var(--color-bg-secondary)'
              }}
            >
              Showing {filteredTechnologies.length} of {technologies.length} technologies
            </div>
          )}
        </div>
      )}
    </div>
  );
}

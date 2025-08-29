'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface SearchResultCheckboxProps {
  url: string;
  isSelected: boolean;
  onToggle: (url: string) => void;
  label?: string;
  className?: string;
}

const SearchResultCheckbox: React.FC<SearchResultCheckboxProps> = ({
  url,
  isSelected,
  onToggle,
  label = 'Select for enrichment',
  className = ''
}) => {
  return (
    <label className={`flex items-center space-x-2 cursor-pointer ${className}`}>
      <div
        onClick={() => onToggle(url)}
        className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
          isSelected
            ? 'border-blue-500 bg-blue-500'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        {isSelected && (
          <Check className="w-3 h-3 text-white" />
        )}
      </div>
      <span className="text-sm font-medium text-gray-700">
        {isSelected ? 'Selected for enrichment' : label}
      </span>
    </label>
  );
};

export default SearchResultCheckbox;

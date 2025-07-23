'use client';

import React from 'react';
import { Input } from './Input';
import UniversalIconPicker from './UniversalIconPicker';
import { renderIcon } from '@/lib/iconUtils';

interface FormFieldProps {
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'url' | 'textarea' | 'select' | 'icon' | 'checkbox';
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  helpText,
  error,
  options = [],
  rows = 3,
  min,
  max,
  step
}) => {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
              error ? 'border-red-500' : ''
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
        );

      case 'select':
        return (
          <select
            id={fieldId}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            className={`w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : ''
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'icon':
        return (
          <UniversalIconPicker
            value={value as string}
            onChange={(iconName: string) => onChange(iconName)}
            placeholder={placeholder || 'Select an icon'}
            className="w-full"
            disabled={disabled}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-3">
            <input
              id={fieldId}
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
              {label}
            </label>
          </div>
        );

      case 'number':
        return (
          <Input
            id={fieldId}
            type="number"
            value={value as number}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={error ? 'border-red-500' : ''}
          />
        );

      default:
        return (
          <Input
            id={fieldId}
            type={type}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  // For checkbox type, render differently since the label is part of the field
  if (type === 'checkbox') {
    return (
      <div className={`space-y-2 ${className}`}>
        {renderField()}
        {helpText && (
          <p className="text-xs text-gray-500">{helpText}</p>
        )}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderField()}
      
      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField; 
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { Mail, Phone, Calendar, FileText, Check, AlertCircle } from 'lucide-react';

interface ContactField {
  id: number;
  fieldType: string;
  fieldName: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  fieldWidth: string;
  fieldOptions?: string[];
  sortOrder: number;
}

interface ContactSectionProps {
  sectionId: number;
  heading: string;
  subheading?: string;
  successMessage: string;
  errorMessage: string;
  fields: ContactField[];
  className?: string;
}

const FIELD_ICONS: Record<string, React.ComponentType<any>> = {
  email: Mail,
  tel: Phone,
  date: Calendar,
  textarea: FileText,
};

export default function ContactSection({
  sectionId,
  heading,
  subheading,
  successMessage,
  errorMessage,
  fields,
  className = ""
}: ContactSectionProps) {
  const { designSystem } = useDesignSystem();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Sort fields by sortOrder
  const sortedFields = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    sortedFields.forEach(field => {
      if (field.isRequired && !formData[field.fieldName]) {
        newErrors[field.fieldName] = `${field.label} is required`;
      }

      // Email validation
      if (field.fieldType === 'email' && formData[field.fieldName]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.fieldName])) {
          newErrors[field.fieldName] = 'Please enter a valid email address';
        }
      }

      // Phone validation
      if (field.fieldType === 'tel' && formData[field.fieldName]) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(formData[field.fieldName].replace(/[\s\-\(\)]/g, ''))) {
          newErrors[field.fieldName] = 'Please enter a valid phone number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactSectionId: sectionId,
          formData,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
          }
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({});
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldWidth = (width: string) => {
    switch (width) {
      case 'half': return 'md:w-1/2';
      case 'third': return 'md:w-1/3';
      case 'quarter': return 'md:w-1/4';
      default: return 'w-full';
    }
  };

  const renderField = (field: ContactField) => {
    const FieldIcon = FIELD_ICONS[field.fieldType];
    const fieldError = errors[field.fieldName];

    const commonProps = {
      id: field.fieldName,
      name: field.fieldName,
      value: formData[field.fieldName] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleInputChange(field.fieldName, e.target.value),
      placeholder: field.placeholder,
      required: field.isRequired,
      className: fieldError ? 'border-red-500' : ''
    };

    switch (field.fieldType) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`w-full p-3 border rounded-md resize-vertical ${commonProps.className}`}
            style={{ 
              borderColor: fieldError ? '#ef4444' : designSystem?.grayLight || '#d1d5db',
              backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
            }}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            className={`w-full p-3 border rounded-md appearance-none ${commonProps.className}`}
            style={{ 
              borderColor: fieldError ? '#ef4444' : designSystem?.grayLight || '#d1d5db',
              backgroundColor: designSystem?.backgroundPrimary || '#ffffff',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            }}
          >
            <option value="">Select {field.label}</option>
            {field.fieldOptions?.map((option, index) => (
              <option key={`${field.fieldName}-option-${index}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.fieldOptions?.map((option, index) => (
              <label key={`${field.fieldName}-radio-${index}`} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.fieldName}
                  value={option}
                  checked={formData[field.fieldName] === option}
                  onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                  required={field.isRequired}
                  className="text-blue-600"
                  style={{ 
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                />
                <span style={{ color: designSystem?.textPrimary || '#1f2937' }}>
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={field.fieldName}
              checked={formData[field.fieldName] || false}
              onChange={(e) => handleInputChange(field.fieldName, e.target.checked)}
              required={field.isRequired}
              className="text-blue-600"
              style={{ 
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
            />
            <span style={{ color: designSystem?.textPrimary || '#1f2937' }}>
              {field.label}
            </span>
          </label>
        );

      default:
        return (
          <div className="relative">
            {FieldIcon && (
              <FieldIcon 
                className="absolute left-3 top-1/2 transform -translate-y-1/4 w-5 h-5"
                style={{ color: designSystem?.textSecondary || '#6b7280' }}
              />
            )}
            <Input
              {...commonProps}
              type={field.fieldType}
              className={`${FieldIcon ? 'pl-10' : ''} ${commonProps.className}`}
              style={{ 
                borderColor: fieldError ? '#ef4444' : designSystem?.grayLight || '#d1d5db'
              }}
            />
          </div>
        );
    }
  };

  if (submitStatus === 'success') {
    return (
      <section className={`pb-16 ${className}`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div 
            className="bg-green-50 border border-green-200 rounded-lg p-8"
            style={{ backgroundColor: designSystem?.backgroundSecondary || '#f0fdf4' }}
          >
            <Check 
              className="w-16 h-16 mx-auto mb-4 text-green-600"
            />
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: designSystem?.textPrimary || '#1f2937' }}
            >
              Thank You!
            </h3>
            <p 
              className="text-base"
              style={{ color: designSystem?.textSecondary || '#6b7280' }}
            >
              {successMessage}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`pb-16 ${className}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 
            className="text-3xl font-bold mb-4"
            style={{ color: designSystem?.textPrimary || '#1f2937' }}
          >
            {heading}
          </h2>
          {subheading && (
            <p 
              className="text-lg"
              style={{ color: designSystem?.textSecondary || '#6b7280' }}
            >
              {subheading}
            </p>
          )}
        </div>

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div 
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedFields.map((field) => (
              <div 
                key={field.id} 
                className={`${getFieldWidth(field.fieldWidth)} ${
                  field.fieldType === 'checkbox' ? '' : 'space-y-2'
                }`}
              >
                {field.fieldType !== 'checkbox' && (
                  <label 
                    htmlFor={field.fieldName}
                    className="block text-sm font-medium"
                    style={{ color: designSystem?.textPrimary || '#1f2937' }}
                  >
                    {field.label}
                    {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                
                {renderField(field)}
                
                {field.helpText && (
                  <p 
                    className="text-sm"
                    style={{ color: designSystem?.textSecondary || '#6b7280' }}
                  >
                    {field.helpText}
                  </p>
                )}
                
                {errors[field.fieldName] && (
                  <p className="text-sm text-red-600">
                    {errors[field.fieldName]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3"
              style={{ 
                backgroundColor: designSystem?.primaryColor || '#3b82f6',
                borderColor: designSystem?.primaryColor || '#3b82f6',
                boxShadow: 'none !important',
                filter: 'none !important'
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
} 
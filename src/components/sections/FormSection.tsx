'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Building2, 
  Phone, 
  Calendar, 
  Globe, 
  MapPin, 
  MessageSquare, 
  Check, 
  Send, 
  Loader2, 
  Eye, 
  EyeOff,
  ChevronDown,
  X,
  Lock,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import CreativeCaptcha from '@/components/ui/CreativeCaptcha';

interface FormField {
  id: number;
  formId: number;
  fieldType: string;
  fieldName: string;
  label: string;
  placeholder: string;
  helpText: string | null;
  isRequired: boolean;
  isVisible: boolean;
  sortOrder: number;
  fieldOptions: any;
  fieldWidth: string;
}

interface Form {
  id: number;
  name: string;
  title: string;
  subheading: string;
  successMessage: string;
  errorMessage: string;
  isActive: boolean;
  fields: FormField[];
  
  // CTA Customization
  ctaText: string;
  ctaIcon?: string;
  ctaStyle: string;
  ctaSize: string;
  ctaWidth: string;
  ctaLoadingText: string;
  ctaPosition?: string;
  
  // Enhanced CTA Colors
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  ctaBorderColor?: string;
  ctaHoverBackgroundColor?: string;
  ctaHoverTextColor?: string;
  
  // Submission Actions
  redirectUrl?: string;
  emailNotification?: boolean;
  emailRecipients?: string;
  webhookUrl?: string;
  
  // Captcha Settings
  enableCaptcha: boolean;
  captchaType: string;
  captchaDifficulty: string;
  
  // Contact Information Settings
  showContactInfo?: boolean;
  contactPosition?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  
  // Contact Text Customization
  contactHeading?: string;
  contactSubheading?: string;
  contactPhoneLabel?: string;
  contactEmailLabel?: string;
  contactAddressLabel?: string;
  contactSocialLabel?: string;
  
  // Form Styling & Colors
  formBackgroundColor?: string;
  formBorderColor?: string;
  formTextColor?: string;
  fieldBackgroundColor?: string;
  fieldBorderColor?: string;
  fieldTextColor?: string;
  sectionBackgroundColor?: string;
}

interface CompanyContact {
  phone?: string;
  email?: string;
  address?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
}

interface FormSectionProps {
  formId: number;
  title?: string;
  subtitle?: string;
  className?: string;
  companyContact?: CompanyContact;
  layout?: 'default' | 'side-by-side' | 'contact-first';
  backgroundColor?: string;
  formData?: Form | null; // Add server-side form data prop
}

export default function FormSection({ 
  formId, 
  title, 
  subtitle, 
  className = '',
  companyContact,
  layout = 'default',
  backgroundColor,
  formData: serverFormData
}: FormSectionProps) {
  const { designSystem, loading: dsLoading } = useDesignSystem();
  const [form, setForm] = useState<Form | null>(serverFormData || null);
  const [loading, setLoading] = useState(!serverFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [currentTermsContent, setCurrentTermsContent] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if server data not provided
    if (!serverFormData) {
      if (formId && !isNaN(formId)) {
        fetchForm();
      } else {
        console.error('Invalid formId provided:', formId);
        setLoading(false);
      }
    }
  }, [formId, serverFormData]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/admin/forms?id=${formId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Parse fieldOptions from JSON strings
        if (data.fields) {
          data.fields = data.fields.map((field: any) => ({
            ...field,
            fieldOptions: field.fieldOptions ? 
              (typeof field.fieldOptions === 'string' ? 
                (() => {
                  try {
                    // Try to parse the JSON, handling multiple levels of escaping
                    let parsed = field.fieldOptions;
                    
                    // Keep parsing until we get an actual array or object
                    while (typeof parsed === 'string') {
                      try {
                        parsed = JSON.parse(parsed);
                      } catch {
                        // If parsing fails, break to avoid infinite loop
                        break;
                      }
                    }
                    
                    // Ensure we return an array for select/radio fields
                    if (field.fieldType === 'select' || field.fieldType === 'radio') {
                      return Array.isArray(parsed) ? parsed : [];
                    }
                    
                    return parsed;
                  } catch (error) {
                    console.error('Error parsing fieldOptions for field:', field.fieldName, error);
                    return field.fieldType === 'select' || field.fieldType === 'radio' ? [] : null;
                  }
                })() : 
                field.fieldOptions
              ) : null
          }));
        }
        
        setForm(data);
      }
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!form || !form.fields) return false;

    const newErrors: Record<string, string> = {};

    form.fields.forEach(field => {
      if (field.isRequired && !formData[field.fieldName]?.trim()) {
          newErrors[field.fieldName] = `${field.label} is required`;
      } else if (formData[field.fieldName]) {
      // Email validation
        if (field.fieldType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.fieldName])) {
          newErrors[field.fieldName] = 'Please enter a valid email address';
        }
      }

      // Phone validation
        if (field.fieldType === 'tel') {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          const cleanPhone = formData[field.fieldName].replace(/[\s\-\(\)]/g, '');
          if (!phoneRegex.test(cleanPhone)) {
          newErrors[field.fieldName] = 'Please enter a valid phone number';
        }
      }

      // URL validation
        if (field.fieldType === 'url') {
        try {
          new URL(formData[field.fieldName]);
        } catch {
          newErrors[field.fieldName] = 'Please enter a valid URL';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check captcha verification if enabled
    if (form?.enableCaptcha && !captchaVerified) {
      console.error('Captcha verification required');
      return;
    }

    setSubmitting(true);
    setSubmitError(null); // Clear any previous errors

    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          formData,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitted(true);
        setFormData({});
        
        // Handle redirect if configured
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || form?.errorMessage || 'Failed to submit form. Please try again.';
        setSubmitError(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(form?.errorMessage || 'Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const renderCTAButton = () => {
    if (!form) return null;
    
    if (!form.enableCaptcha || captchaVerified) {
      return (
        <button
          type="submit"
          disabled={submitting}
          className={`
            font-semibold rounded-xl 
            transition-colors duration-300
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${form.ctaSize === 'small' ? 'px-6 py-2.5 text-sm' : 
              form.ctaSize === 'medium' ? 'px-8 py-3 text-base' : 
              'px-10 py-3.5 text-lg'}
            ${form.ctaWidth === 'full' ? 'w-full' : 
              form.ctaWidth === 'fixed' ? 'w-64' : 
              'min-w-[180px]'}
            ${form.ctaStyle === 'outline' ? 'border-2' : ''}
          `}
          style={{ 
            backgroundColor: form.ctaBackgroundColor || (
              form.ctaStyle === 'primary' ? primaryColor :
              form.ctaStyle === 'secondary' ? secondaryColor :
              form.ctaStyle === 'outline' ? 'transparent' :
              'transparent'
            ),
            background: form.ctaBackgroundColor || (
              form.ctaStyle === 'primary' ? primaryColor : 
              form.ctaStyle === 'secondary' ? secondaryColor :
              'transparent'
            ),
            borderColor: form.ctaBorderColor || (
              form.ctaStyle === 'outline' ? primaryColor : 'transparent'
            ),
            color: form.ctaTextColor || (
              form.ctaStyle === 'outline' ? primaryColor : 
              form.ctaStyle === 'ghost' ? primaryColor : 'white'
            ),
            boxShadow: 'none !important',
            filter: 'none !important',
            WebkitBoxShadow: 'none !important',
            MozBoxShadow: 'none !important',
            fontFamily: designSystem?.fontFamily || 'Manrope, system-ui, sans-serif',
            fontWeight: designSystem?.fontWeightBold || '700'
          }}
          onMouseEnter={(e) => {
            if (form.ctaHoverBackgroundColor) {
              e.currentTarget.style.backgroundColor = form.ctaHoverBackgroundColor;
            }
            if (form.ctaHoverTextColor) {
              e.currentTarget.style.color = form.ctaHoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = form.ctaBackgroundColor || (
              form.ctaStyle === 'primary' ? primaryColor :
              form.ctaStyle === 'secondary' ? secondaryColor :
              form.ctaStyle === 'outline' ? 'transparent' :
              'transparent'
            );
            e.currentTarget.style.color = form.ctaTextColor || (
              form.ctaStyle === 'outline' ? primaryColor : 
              form.ctaStyle === 'ghost' ? primaryColor : 'white'
            );
            if (!form.ctaBackgroundColor && form.ctaStyle === 'primary') {
              e.currentTarget.style.background = primaryColor;
            }
          }}
        >
          {/* Button content */}
          <div className="flex items-center justify-center gap-2.5">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{form.ctaLoadingText || 'Sending...'}</span>
              </>
            ) : (
              <>
                {form.ctaIcon && (() => {
                  try {
                    const iconComponents = require('lucide-react');
                    const IconComponent = iconComponents[form.ctaIcon];
                    return IconComponent ? (
                      <IconComponent className="w-4 h-4" />
                    ) : null;
                  } catch {
                    return null;
                  }
                })()}
                <span>{form.ctaText || 'Send Message'}</span>
              </>
            )}
          </div>
        </button>
      );
    }
    return null;
  };

  const renderCompanyContact = () => {
    if (!activeContactInfo) return null;

    const primaryColor = designSystem?.primaryColor || '#3B82F6';
    const backgroundPrimary = designSystem?.backgroundPrimary || '#FFFFFF';
    
    // Get the section background color for contrast calculation
    const sectionBg = backgroundColor || form?.sectionBackgroundColor || backgroundPrimary;
    
    // Determine if text should be light or dark based on section background - same logic as hero section
    const getTextColor = () => {
      if (!sectionBg) return 'text-gray-900'; // Default to dark text
      
      // Handle hex colors
      const hex = sectionBg.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? 'text-gray-900' : 'text-white';
      }
      
      // For other color formats, assume dark text
      return 'text-gray-900';
    };

    // Get smart colors based on section background
    const getSmartColors = () => {
      const textColor = getTextColor();
      const isDarkBackground = textColor === 'text-white';
      
      return {
        textPrimary: isDarkBackground ? '#FFFFFF' : '#1F2937',
        textSecondary: isDarkBackground ? '#E5E7EB' : '#6B7280',
        textMuted: isDarkBackground ? '#9CA3AF' : '#9CA3AF',
        iconBg: isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : `${primaryColor}15`,
        iconColor: isDarkBackground ? '#FFFFFF' : primaryColor
      };
    };

    const smartColors = getSmartColors();

    const socialIcons = {
      facebook: Facebook,
      twitter: Twitter,
      linkedin: Linkedin,
      instagram: Instagram,
      youtube: Youtube
    };

    return (
      <div className="space-y-8">
        {/* Contact Header */}
        <div className="text-center">
          <h3 
            className="text-2xl font-bold mb-2" 
            style={{ 
              color: smartColors.textPrimary,
              fontWeight: designSystem?.fontWeightBold || '700'
            }}
          >
            {form?.contactHeading || 'Get in Touch'}
          </h3>
          <p 
            className="text-base" 
            style={{ 
              color: smartColors.textSecondary,
              fontSize: designSystem?.fontSizeBase || '16px',
              lineHeight: designSystem?.lineHeightBase || '1.5'
            }}
          >
            {form?.contactSubheading || "We'd love to hear from you. Here's how you can reach us."}
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Phone */}
          {activeContactInfo.phone && (
            <div className="flex items-center space-x-4 group">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: smartColors.iconBg }}
              >
                <Phone className="w-5 h-5" style={{ color: smartColors.iconColor }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: smartColors.textSecondary }}>
                  {form?.contactPhoneLabel || 'Phone'}
                </p>
                <a 
                  href={`tel:${activeContactInfo.phone}`}
                  className="text-lg font-semibold hover:underline transition-colors duration-200"
                  style={{ color: smartColors.textPrimary }}
                >
                  {activeContactInfo.phone}
                </a>
              </div>
            </div>
          )}

          {/* Email */}
          {activeContactInfo.email && (
            <div className="flex items-center space-x-4 group">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: smartColors.iconBg }}
              >
                <Mail className="w-5 h-5" style={{ color: smartColors.iconColor }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: smartColors.textSecondary }}>
                  {form?.contactEmailLabel || 'Email'}
                </p>
                <a 
                  href={`mailto:${activeContactInfo.email}`}
                  className="text-lg font-semibold hover:underline transition-colors duration-200"
                  style={{ color: smartColors.textPrimary }}
                >
                  {activeContactInfo.email}
                </a>
              </div>
            </div>
          )}

          {/* Address */}
          {activeContactInfo.address && (
            <div className="flex items-start space-x-4 group">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: smartColors.iconBg }}
              >
                <MapPin className="w-5 h-5" style={{ color: smartColors.iconColor }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: smartColors.textSecondary }}>
                  {form?.contactAddressLabel || 'Address'}
                </p>
                <p className="text-lg font-semibold leading-relaxed" style={{ color: smartColors.textPrimary }}>
                  {activeContactInfo.address}
                </p>
              </div>
            </div>
          )}

          {/* Social Media */}
          {activeContactInfo.socialMedia && Object.keys(activeContactInfo.socialMedia).length > 0 && (
            <div className="pt-4">
              <p className="text-sm font-medium mb-4" style={{ color: smartColors.textSecondary }}>
                {form?.contactSocialLabel || 'Follow Us'}
              </p>
              <div className="flex space-x-4">
                {Object.entries(activeContactInfo.socialMedia).map(([platform, url]) => {
                  if (!url) return null;
                  const IconComponent = socialIcons[platform as keyof typeof socialIcons];
                  if (!IconComponent) return null;

                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: smartColors.iconBg }}
                    >
                      <IconComponent 
                        className="w-5 h-5 transition-colors duration-300 group-hover:scale-110" 
                        style={{ color: smartColors.iconColor }} 
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getFieldIcon = (fieldType: string, fieldName: string) => {
    const iconClass = "w-5 h-5 transition-colors duration-200";
    
    // Check field name patterns first for more specific matching
    if (fieldName.toLowerCase().includes('first') || fieldName.toLowerCase().includes('last') || 
        (fieldName.toLowerCase().includes('name') && !fieldName.toLowerCase().includes('company'))) {
      return <User className={iconClass} />;
    }
    if (fieldName.toLowerCase().includes('email')) {
      return <Mail className={iconClass} />;
    }
    if (fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('tel')) {
      return <Phone className={iconClass} />;
    }
    if (fieldName.toLowerCase().includes('company') || fieldName.toLowerCase().includes('organization')) {
      return <Building2 className={iconClass} />;
    }
    if (fieldName.toLowerCase().includes('website') || fieldName.toLowerCase().includes('url')) {
      return <Globe className={iconClass} />;
    }
    if (fieldName.toLowerCase().includes('address') || fieldName.toLowerCase().includes('location') || 
        fieldName.toLowerCase().includes('street') || fieldName.toLowerCase().includes('city') ||
        fieldName.toLowerCase().includes('province') || fieldName.toLowerCase().includes('state') ||
        fieldName.toLowerCase().includes('postal') || fieldName.toLowerCase().includes('zip')) {
      return <MapPin className={iconClass} />;
    }
    if (fieldName.toLowerCase().includes('message') || fieldName.toLowerCase().includes('comment') ||
        fieldName.toLowerCase().includes('description') || fieldName.toLowerCase().includes('notes')) {
      return null; // No icon for message/comment fields
    }
    if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('birth')) {
      return <Calendar className={iconClass} />;
    }
    if (fieldName.toLowerCase().includes('password')) {
      return <Lock className={iconClass} />;
    }
    
    // Fall back to field type
    switch (fieldType) {
      case 'email':
        return <Mail className={iconClass} />;
      case 'tel':
        return <Phone className={iconClass} />;
      case 'date':
        return <Calendar className={iconClass} />;
      case 'url':
        return <Globe className={iconClass} />;
      case 'password':
        return <Lock className={iconClass} />;
      case 'textarea':
        return null; // No icon for textarea fields
      case 'checkbox':
      case 'radio':
        return null; // No icon for checkbox/radio fields
      case 'select':
        return null; // No icon for select fields (has chevron already)
      case 'street_address':
      case 'address_line_2':
        return <MapPin className={iconClass} />;
      case 'city':
        return <Building2 className={iconClass} />;
      case 'province_state':
        return <MapPin className={iconClass} />;
      case 'postal_code':
        return <MapPin className={iconClass} />;
      case 'country':
        return <Globe className={iconClass} />;
      case 'text':
        // For generic text fields, only show icon if field name suggests it
        if (fieldName.toLowerCase().includes('name')) {
          return <User className={iconClass} />;
        }
        return null; // No icon for generic text fields
      default:
        return null; // No icon by default
    }
  };

  const renderField = (field: FormField) => {
    const isError = !!errors[field.fieldName];
    const isFocused = focusedField === field.fieldName;
    const hasValue = !!formData[field.fieldName];
    const fieldIcon = getFieldIcon(field.fieldType, field.fieldName);

    // Get colors from design system with fallbacks
    const primaryColor = designSystem?.primaryColor || '#5243E9';
    const secondaryColor = designSystem?.secondaryColor || '#7C3AED';
    const accentColor = designSystem?.accentColor || '#10B981';
    const errorColor = designSystem?.errorColor || '#EF4444';
    const textPrimary = designSystem?.textPrimary || '#1F2937';
    const textSecondary = designSystem?.textSecondary || '#6B7280';
    const backgroundPrimary = designSystem?.backgroundPrimary || '#FFFFFF';
    const backgroundSecondary = designSystem?.backgroundSecondary || '#F6F8FC';
    
    // Base styles for all input fields using design system colors
    const baseFieldClasses = `
      w-full h-11 pl-10 pr-4 rounded-lg border transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-opacity-20
      ${isError 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
        : isFocused
          ? ''
          : hasValue
            ? 'border-gray-300'
            : 'border-gray-200'
      }
    `;

    // Icon container styles using design system colors
    const iconContainerClasses = `
      absolute left-3 top-1/2 transform -translate-y-1/4 transition-colors duration-200 z-10
    `;

    // Label styles using design system colors and typography
    const labelClasses = `
      block text-sm font-medium mb-1.5 transition-colors duration-200
    `;

    // Determine field width - textarea, checkbox, street_address, and address_line_2 are full width
    const isFullWidth = field.fieldType === 'textarea' || 
                       field.fieldType === 'checkbox' || 
                       field.fieldType === 'street_address' || 
                       field.fieldType === 'address_line_2';
    const fieldWidthClass = isFullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1';

    if (field.fieldType === 'textarea') {
        return (
        <div key={field.id} className={fieldWidthClass}>
          <label 
            className={labelClasses}
            style={{ 
              color: isError ? errorColor : isFocused ? primaryColor : textPrimary 
            }}
          >
            {field.label} {field.isRequired && <span style={{ color: errorColor }}>*</span>}
          </label>
          <div className="relative">
            {fieldIcon && (
              <div 
                className={iconContainerClasses}
                style={{ 
                  color: isFocused ? primaryColor : isError ? errorColor : hasValue ? textPrimary : textSecondary 
                }}
              >
                {fieldIcon}
              </div>
            )}
          <textarea
            name={field.fieldName}
              value={formData[field.fieldName] || ''}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
              onFocus={() => setFocusedField(field.fieldName)}
              onBlur={() => setFocusedField(null)}
            placeholder={field.placeholder}
              rows={3}
              className={`w-full h-24 ${fieldIcon ? 'pl-10' : 'pl-4'} pr-4 pt-3 rounded-lg border transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-opacity-20 resize-none ${isError 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : isFocused
                  ? ''
                  : hasValue
                    ? 'border-gray-300'
                    : 'border-gray-200'
              }`}
              style={{ 
                backgroundColor: form?.fieldBackgroundColor || 'white',
                color: form?.fieldTextColor || textPrimary,
                borderColor: form?.fieldBorderColor || (isError ? errorColor : isFocused ? primaryColor : hasValue ? '#D1D5DB' : '#E5E7EB'),
                boxShadow: 'none !important',
                fontSize: designSystem?.fontSizeBase || '16px',
                fontFamily: designSystem?.fontFamily || 'Manrope, system-ui, sans-serif',
                lineHeight: designSystem?.lineHeightBase || '1.5'
              }}
            />
          </div>
          {field.helpText && !isError && (
            <p className="mt-1 text-xs" style={{ color: textSecondary }}>
              {field.helpText}
            </p>
          )}
          {isError && (
            <p className="mt-1 text-xs" style={{ color: errorColor }}>
              {errors[field.fieldName]}
            </p>
          )}
        </div>
        );
    }

    if (field.fieldType === 'select' || field.fieldType === 'country') {
      let options = Array.isArray(field.fieldOptions) ? field.fieldOptions : [];
      
      // Add default country options if it's a country field and no options are set
      if (field.fieldType === 'country' && options.length === 0) {
        options = [
          { label: 'United States', value: 'US' },
          { label: 'Canada', value: 'CA' },
          { label: 'United Kingdom', value: 'GB' },
          { label: 'Australia', value: 'AU' },
          { label: 'Germany', value: 'DE' },
          { label: 'France', value: 'FR' },
          { label: 'Japan', value: 'JP' },
          { label: 'Other', value: 'OTHER' }
        ];
      }
      
        return (
        <div key={field.id} className={fieldWidthClass}>
          <label 
            className={labelClasses}
            style={{ 
              color: isError ? errorColor : isFocused ? primaryColor : textPrimary 
            }}
          >
            {field.label} {field.isRequired && <span style={{ color: errorColor }}>*</span>}
          </label>
          <div className="relative">
            <div 
              className={iconContainerClasses}
              style={{ 
                color: isFocused ? primaryColor : isError ? errorColor : hasValue ? textPrimary : textSecondary 
              }}
            >
              {fieldIcon}
            </div>
          <select
            name={field.fieldName}
              value={formData[field.fieldName] || ''}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
              onFocus={() => setFocusedField(field.fieldName)}
              onBlur={() => setFocusedField(null)}
              className={`${baseFieldClasses} appearance-none cursor-pointer`}
              style={{ 
                backgroundColor: form?.fieldBackgroundColor || 'white',
                color: form?.fieldTextColor || textPrimary,
                borderColor: form?.fieldBorderColor || (isError ? errorColor : isFocused ? primaryColor : hasValue ? '#D1D5DB' : '#E5E7EB'),
                boxShadow: 'none !important',
                fontSize: designSystem?.fontSizeBase || '16px',
                fontFamily: designSystem?.fontFamily || 'Manrope, system-ui, sans-serif'
              }}
            >
              <option value="">{field.placeholder}</option>
              {options.map((option: any, index: number) => (
                <option key={`${field.fieldName}-option-${index}`} value={option.value || option}>
                  {option.label || option}
                </option>
            ))}
          </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/4 w-5 h-5 pointer-events-none" style={{ color: textSecondary }} />
          </div>
          {field.helpText && !isError && (
            <p className="mt-1 text-xs" style={{ color: textSecondary }}>
              {field.helpText}
            </p>
          )}
          {isError && (
            <p className="mt-1 text-xs" style={{ color: errorColor }}>
              {errors[field.fieldName]}
            </p>
          )}
        </div>
      );
    }

    if (field.fieldType === 'checkbox') {
        return (
        <div key={field.id} className={fieldWidthClass}>
          <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl hover:bg-gray-50/80 transition-colors">
            <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              name={field.fieldName}
                checked={formData[field.fieldName] === 'true'}
                onChange={(e) => handleInputChange(field.fieldName, e.target.checked.toString())}
                className="sr-only"
                style={{ 
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  position: 'absolute',
                  opacity: 0,
                  width: 0,
                  height: 0,
                  margin: 0,
                  padding: 0,
                  border: 'none',
                  outline: 'none'
                }}
              />
              <div 
                className="w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center"
                style={{
                  backgroundColor: formData[field.fieldName] === 'true' ? primaryColor : backgroundPrimary,
                  borderColor: formData[field.fieldName] === 'true' ? primaryColor : '#D1D5DB'
                }}
              >
                {formData[field.fieldName] === 'true' && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <span className="font-medium group-hover:text-gray-700 transition-colors" style={{ color: textPrimary }}>
                {field.label} {field.isRequired && <span style={{ color: errorColor }}>*</span>}
              </span>
              {field.helpText && (
                <p className="mt-0.5 text-xs" style={{ color: textSecondary }}>{field.helpText}</p>
              )}
            </div>
            </label>
          {isError && (
            <p className="mt-1 ml-10 text-xs" style={{ color: errorColor }}>
              {errors[field.fieldName]}
            </p>
          )}
          </div>
        );
    }

    if (field.fieldType === 'radio') {
      const options = Array.isArray(field.fieldOptions) ? field.fieldOptions : [];
      
        return (
        <div key={field.id} className={fieldWidthClass}>
          <div className="block text-sm font-semibold mb-4" style={{ color: textPrimary }}>
            {field.label} {field.isRequired && <span style={{ color: errorColor }}>*</span>}
          </div>
          
          {options.length === 0 ? (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center">
              <p className="text-sm text-gray-500">No options configured for this radio field</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option: any, index: number) => {
                const optionValue = typeof option === 'string' ? option : (option.value || option.label || option);
                const optionLabel = typeof option === 'string' ? option : (option.label || option.value || option);
                
                return (
                  <label key={`${field.fieldName}-${optionValue}-${index}`} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50/80 transition-colors border border-gray-200 hover:border-gray-300">
                    <div className="relative flex-shrink-0">
                <input
                  type="radio"
                  name={field.fieldName}
                        value={optionValue}
                        checked={formData[field.fieldName] === optionValue}
                  onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                        className="sr-only"
                        style={{ 
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          position: 'absolute',
                          opacity: 0,
                          width: 0,
                          height: 0,
                          margin: 0,
                          padding: 0,
                          border: 'none',
                          outline: 'none'
                        }}
                      />
                      <div 
                        className="w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center"
                        style={{
                          borderColor: formData[field.fieldName] === optionValue ? primaryColor : '#D1D5DB',
                          backgroundColor: formData[field.fieldName] === optionValue ? `${primaryColor}10` : backgroundPrimary
                        }}
                      >
                        {formData[field.fieldName] === optionValue && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        )}
                      </div>
                    </div>
                    <span className="group-hover:text-gray-700 transition-colors font-medium" style={{ color: textPrimary }}>
                      {optionLabel}
                    </span>
                </label>
                );
              })}
              </div>
          )}
          
          {field.helpText && !isError && (
            <p className="mt-2 text-sm flex items-center gap-2" style={{ color: textSecondary }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: accentColor }}></span>
              {field.helpText}
            </p>
          )}
          {isError && (
            <p className="mt-2 text-sm flex items-center gap-2" style={{ color: errorColor }}>
              <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center inline-flex">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: errorColor }}></span>
              </span>
              {errors[field.fieldName]}
            </p>
          )}
          </div>
        );
    }

    // Handle terms and conditions field
    if (field.fieldType === 'terms') {
        return (
        <div key={field.id} className={fieldWidthClass}>
          <div className="flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-300" style={{ borderColor: isError ? errorColor : '#E5E7EB', backgroundColor: backgroundPrimary }}>
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
            name={field.fieldName}
                checked={!!formData[field.fieldName]}
                onChange={(e) => handleInputChange(field.fieldName, e.target.checked ? 'agreed' : '')}
                className="sr-only"
                style={{ 
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  position: 'absolute',
                  opacity: 0,
                  width: 0,
                  height: 0,
                  margin: 0,
                  padding: 0,
                  border: 'none',
                  outline: 'none'
                }}
              />
              <div 
                className="w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center cursor-pointer"
                style={{
                  borderColor: formData[field.fieldName] ? primaryColor : '#D1D5DB',
                  backgroundColor: formData[field.fieldName] ? `${primaryColor}10` : backgroundPrimary
                }}
                onClick={() => handleInputChange(field.fieldName, formData[field.fieldName] ? '' : 'agreed')}
              >
                {formData[field.fieldName] && (
                  <svg className="w-3 h-3" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm" style={{ color: textPrimary }}>
                {field.label} {field.isRequired && <span style={{ color: errorColor }}>*</span>}
                {field.fieldOptions && (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentTermsContent(field.fieldOptions);
                        setShowTermsModal(true);
                      }}
                      className="underline hover:no-underline transition-all duration-200 font-medium"
                      style={{ color: primaryColor }}
                    >
                      Read Terms
                    </button>
                  </>
                )}
              </p>
              {field.helpText && (
                <p className="mt-1 text-xs" style={{ color: textSecondary }}>
                  {field.helpText}
                </p>
              )}
            </div>
          </div>
          {isError && (
            <p className="mt-2 text-sm flex items-center gap-2" style={{ color: errorColor }}>
              <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center inline-flex">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: errorColor }}></span>
              </span>
              {errors[field.fieldName]}
            </p>
          )}
        </div>
      );
    }

    // Handle password fields with show/hide toggle
    if (field.fieldName.toLowerCase().includes('password')) {
      const showPasswordForField = showPassword[field.fieldName] || false;
      
      return (
        <div key={field.id} className={fieldWidthClass}>
          <label 
            className={labelClasses}
            style={{ 
              color: isError ? errorColor : isFocused ? primaryColor : textPrimary 
            }}
          >
            {field.label} {field.isRequired && <span style={{ color: errorColor }}>*</span>}
          </label>
          <div className="relative">
            <div 
              className={iconContainerClasses}
              style={{ 
                color: isFocused ? primaryColor : isError ? errorColor : hasValue ? textPrimary : textSecondary 
              }}
            >
              {fieldIcon}
            </div>
            <input
              type={showPasswordForField ? 'text' : 'password'}
              name={field.fieldName}
              value={formData[field.fieldName] || ''}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
              onFocus={() => setFocusedField(field.fieldName)}
              onBlur={() => setFocusedField(null)}
            placeholder={field.placeholder}
              className={`${baseFieldClasses} pr-12`}
              style={{ 
                backgroundColor: form?.fieldBackgroundColor || 'white',
                color: form?.fieldTextColor || textPrimary,
                borderColor: form?.fieldBorderColor || (isError ? errorColor : isFocused ? primaryColor : hasValue ? '#D1D5DB' : '#E5E7EB'),
                fontSize: designSystem?.fontSizeBase || '16px',
                fontFamily: designSystem?.fontFamily || 'Manrope, system-ui, sans-serif'
              }}
          />
            <button
              type="button"
              onClick={() => setShowPassword(prev => ({ ...prev, [field.fieldName]: !showPasswordForField }))}
              className="absolute right-4 top-1/2 transform -translate-y-1/4 transition-colors hover:text-gray-600"
              style={{ color: textSecondary }}
            >
              {showPasswordForField ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {field.helpText && !isError && (
            <p className="mt-2 text-sm flex items-center gap-2" style={{ color: textSecondary }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: accentColor }}></span>
              {field.helpText}
            </p>
          )}
          {isError && (
            <p className="mt-2 text-sm flex items-center gap-2" style={{ color: errorColor }}>
              <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center inline-flex">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: errorColor }}></span>
              </span>
              {errors[field.fieldName]}
            </p>
          )}
        </div>
      );
    }

    // Default input field
    let inputType = 'text';
    if (field.fieldType === 'email') inputType = 'email';
    else if (field.fieldType === 'tel') inputType = 'tel';
    else if (field.fieldType === 'url') inputType = 'url';
    else if (field.fieldType === 'date') inputType = 'date';
    else if (field.fieldType === 'number') inputType = 'number';

    return (
      <div key={field.id} className={fieldWidthClass}>
        <label 
          className={labelClasses}
          style={{ 
            color: isError ? errorColor : isFocused ? primaryColor : textPrimary 
          }}
        >
          {field.label} {field.isRequired && <span style={{ color: errorColor }}>*</span>}
        </label>
        <div className="relative">
          <div 
            className={iconContainerClasses}
            style={{ 
              color: isFocused ? primaryColor : isError ? errorColor : hasValue ? textPrimary : textSecondary 
            }}
          >
            {fieldIcon}
          </div>
          <input
            type={inputType}
            name={field.fieldName}
            value={formData[field.fieldName] || ''}
            onChange={(e) => {
              let value = e.target.value;
              if (field.fieldType === 'tel') {
                value = formatPhoneNumber(value);
              }
              handleInputChange(field.fieldName, value);
            }}
            onFocus={() => setFocusedField(field.fieldName)}
            onBlur={() => setFocusedField(null)}
            placeholder={field.placeholder}
            className={baseFieldClasses}
            style={{ 
              backgroundColor: form?.fieldBackgroundColor || 'white',
              color: form?.fieldTextColor || textPrimary,
              borderColor: form?.fieldBorderColor || (isError ? errorColor : isFocused ? primaryColor : hasValue ? '#D1D5DB' : '#E5E7EB'),
              boxShadow: 'none !important',
              fontSize: designSystem?.fontSizeBase || '16px',
              fontFamily: designSystem?.fontFamily || 'Manrope, system-ui, sans-serif'
            }}
          />
        </div>
        {field.helpText && !isError && (
          <p className="mt-1 text-xs" style={{ color: textSecondary }}>
            {field.helpText}
          </p>
        )}
        {isError && (
          <p className="mt-1 text-xs" style={{ color: errorColor }}>
            {errors[field.fieldName]}
          </p>
        )}
      </div>
    );
  };

  // Get colors from design system with fallbacks
  const primaryColor = designSystem?.primaryColor || '#5243E9';
  const secondaryColor = designSystem?.secondaryColor || '#7C3AED';
  const accentColor = designSystem?.accentColor || '#10B981';
  const successColor = designSystem?.successColor || '#10B981';
  const errorColor = designSystem?.errorColor || '#EF4444';
  const backgroundPrimary = designSystem?.backgroundPrimary || '#FFFFFF';
  const backgroundSecondary = designSystem?.backgroundSecondary || '#F6F8FC';

  // Get the section background color for contrast calculation
  const sectionBg = backgroundColor || form?.sectionBackgroundColor || backgroundSecondary;
  
  // Determine if text should be light or dark based on section background - same logic as hero section
  const getSectionTextColor = () => {
    if (!sectionBg) return 'text-gray-900'; // Default to dark text
    
    // Handle hex colors
    const hex = sectionBg.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? 'text-gray-900' : 'text-white';
    }
    
    // For other color formats, assume dark text
    return 'text-gray-900';
  };

  // Get smart colors based on section background
  const getSectionSmartColors = () => {
    const textColor = getSectionTextColor();
    const isDarkBackground = textColor === 'text-white';
    
    return {
      textPrimary: isDarkBackground ? '#FFFFFF' : '#1F2937',
      textSecondary: isDarkBackground ? '#E5E7EB' : '#6B7280'
    };
  };

  const sectionSmartColors = getSectionSmartColors();
  const textPrimary = sectionSmartColors.textPrimary;
  const textSecondary = sectionSmartColors.textSecondary;

  // Create company contact from form data if enabled
  const formContactInfo: CompanyContact | undefined = form?.showContactInfo ? {
    phone: form.contactPhone || undefined,
    email: form.contactEmail || undefined,
    address: form.contactAddress || undefined,
    socialMedia: {
      facebook: form.socialFacebook || undefined,
      twitter: form.socialTwitter || undefined,
      linkedin: form.socialLinkedin || undefined,
      instagram: form.socialInstagram || undefined,
      youtube: form.socialYoutube || undefined,
    }
  } : undefined;

  // Use form contact info if available, otherwise use provided companyContact
  const activeContactInfo = formContactInfo || companyContact;

  if (loading || dsLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`} style={{ backgroundColor: backgroundSecondary }}>
        <div className="flex flex-col items-center gap-6 p-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 rounded-full animate-pulse" style={{ borderColor: `${primaryColor}30` }}></div>
            <Loader2 className="w-8 h-8 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ color: primaryColor }} />
          </div>
          <p className="font-medium text-lg" style={{ color: textSecondary }}>Loading your form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`} style={{ backgroundColor: backgroundSecondary }}>
        <div className="text-center py-16 px-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${textSecondary}20` }}>
            <MessageSquare className="w-10 h-10" style={{ color: textSecondary }} />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: textPrimary }}>Form Not Found</h3>
          <p style={{ color: textSecondary }}>The requested form could not be loaded.</p>
        </div>
      </div>
    );
  }

  if (!form.fields || form.fields.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`} style={{ backgroundColor: backgroundSecondary }}>
        <div className="text-center py-16 px-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${accentColor}20` }}>
            <MessageSquare className="w-10 h-10" style={{ color: accentColor }} />
        </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: textPrimary }}>No Fields Available</h3>
          <p style={{ color: textSecondary }}>This form has no fields configured yet.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
  return (
      <div className={`min-h-screen flex items-center justify-center ${className}`} style={{ backgroundColor: backgroundColor || form?.sectionBackgroundColor || backgroundSecondary }}>
        <div className="max-w-lg mx-auto text-center py-16 px-8">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: successColor }}>
              <Check className="w-12 h-12 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-4" style={{ color: textPrimary }}>Message Sent Successfully!</h3>
          <p className="text-lg leading-relaxed" style={{ color: textSecondary }}>
            {form.successMessage}
          </p>
        </div>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`} style={{ backgroundColor: backgroundColor || form?.sectionBackgroundColor || backgroundSecondary }}>
        <div className="max-w-lg mx-auto text-center py-16 px-8">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: errorColor }}>
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-4" style={{ color: textPrimary }}>Submission Failed</h3>
          <p className="text-lg leading-relaxed mb-6" style={{ color: textSecondary }}>
            {submitError}
          </p>
          <button
            onClick={() => setSubmitError(null)}
            className="px-6 py-3 rounded-xl font-semibold transition-colors duration-300"
            style={{
              backgroundColor: primaryColor,
              color: 'white',
              border: 'none'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`form-section min-h-screen ${className}`} 
      style={{ 
        backgroundColor: backgroundColor || form?.sectionBackgroundColor || backgroundSecondary,
        fontFamily: designSystem?.fontFamily || 'Manrope, system-ui, sans-serif'
      }}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header - Only show if title or subtitle are provided */}
          {((title || form.title) || (subtitle || form.subheading)) && (
            <div className="text-center mb-12">
              {(title || form.title) && (
                <h1 
                  className="text-4xl md:text-5xl font-bold mb-4 leading-tight" 
                  style={{ 
                    color: textPrimary,
                    fontWeight: designSystem?.fontWeightBold || '700'
                  }}
                >
            {title || form.title}
                </h1>
              )}
          {(subtitle || form.subheading) && (
                <p 
                  className="text-lg max-w-2xl mx-auto leading-relaxed" 
                  style={{ 
                    color: textSecondary,
                    fontSize: designSystem?.fontSizeBase || '16px',
                    lineHeight: designSystem?.lineHeightBase || '1.5'
                  }}
                >
              {subtitle || form.subheading}
            </p>
          )}
        </div>
          )}

          {/* Main Content Container */}
          <div className={`
            ${(form.contactPosition === 'left' || form.contactPosition === 'right') && activeContactInfo ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pt-[1vh] lg:pt-[10vh]' : 
              'max-w-4xl mx-auto'}
          `}>
            {/* Contact Information - Top Position */}
            {form.contactPosition === 'top' && activeContactInfo && (
              <div className="mb-12">
                <div className="rounded-2xl p-8">
                  {renderCompanyContact()}
                </div>
              </div>
            )}

            {/* Contact Information - Left Position */}
            {form.contactPosition === 'left' && activeContactInfo && (
              <div className="lg:order-1">
                <div className="rounded-2xl p-8 h-full">
                  {renderCompanyContact()}
                </div>
              </div>
            )}

            {/* Form Container */}
            <div className={`${form.contactPosition === 'left' ? 'lg:order-2' : ''}`}>
              <div className="relative">
                {/* Main form */}
                <div 
                  className={`rounded-2xl p-6 md:p-8 ${form.formBorderColor === 'transparent' ? '' : 'border'}`}
                  style={{ 
                    backgroundColor: form.formBackgroundColor || backgroundPrimary,
                    borderColor: form.formBorderColor === 'transparent' ? 'transparent' : (form.formBorderColor || `${primaryColor}20`),
                    color: form.formTextColor || textPrimary
                  }}
                >
                  <form onSubmit={handleSubmit} className={`
                    ${form.ctaPosition === 'left' || form.ctaPosition === 'right' ? 'flex gap-6' : 'space-y-6'}
                  `}>
                    {/* CTA Button - Top Position */}
                    {form.ctaPosition === 'top' && (!form.enableCaptcha || captchaVerified) && (
                      <div className="flex justify-center mb-6">
                        {renderCTAButton()}
                      </div>
                    )}

                    {/* CTA Button - Left Position */}
                    {form.ctaPosition === 'left' && (!form.enableCaptcha || captchaVerified) && (
                      <div className="flex flex-col justify-center">
                        {renderCTAButton()}
                      </div>
                    )}

                    {/* Main Form Content */}
                    <div className={`${form.ctaPosition === 'left' || form.ctaPosition === 'right' ? 'flex-1' : ''}`}>
                      {/* Form Fields Grid - Compact 2-column layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {form.fields?.map((field) => renderField(field))}
                      </div>

                      {/* Captcha Section */}
                      {form.enableCaptcha && (
                        <div className="pt-2">
                          <CreativeCaptcha
                            type={form.captchaType as 'math' | 'puzzle' | 'drag' | 'image'}
                            difficulty={form.captchaDifficulty as 'easy' | 'medium' | 'hard'}
                            onVerify={setCaptchaVerified}
                            primaryColor={primaryColor}
                            accentColor={accentColor}
                            errorColor={designSystem?.errorColor || '#EF4444'}
                            backgroundColor={form.formBackgroundColor || backgroundPrimary}
                          />
                        </div>
                )}
                
                      {/* Submit Button - Bottom Position (default) */}
                      {(!form.ctaPosition || form.ctaPosition === 'bottom') && (!form.enableCaptcha || captchaVerified) && (
                        <div className={`${form.enableCaptcha ? 'pt-1' : 'pt-4'} flex justify-center`}>
                          {renderCTAButton()}
              </div>
                )}
              </div>

                    {/* CTA Button - Right Position */}
                    {form.ctaPosition === 'right' && (!form.enableCaptcha || captchaVerified) && (
                      <div className="flex flex-col justify-center">
                        {renderCTAButton()}
                      </div>
                    )}
                  </form>
                </div>
              </div>
          </div>

            {/* Contact Information - Right Position */}
            {form.contactPosition === 'right' && activeContactInfo && (
              <div className="lg:order-2">
                <div className="rounded-2xl p-8 h-full">
                  {renderCompanyContact()}
                </div>
              </div>
            )}

            {/* Contact Information - Bottom Position */}
            {form.contactPosition === 'bottom' && activeContactInfo && (
              <div className="mt-12">
                <div className="rounded-2xl p-8">
                  {renderCompanyContact()}
                </div>
              </div>
              )}
          </div>
        </div>
          </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold" style={{ color: textPrimary }}>
                  Terms & Conditions
                </h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: textSecondary }} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div 
                className="prose prose-sm max-w-none"
                style={{ color: textPrimary }}
                dangerouslySetInnerHTML={{ 
                  __html: currentTermsContent.replace(/\n/g, '<br />') 
                }}
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: primaryColor, 
                  color: 'white' 
                }}
              >
                Close
              </button>
            </div>
          </div>
            </div>
          )}
    </div>
  );
} 
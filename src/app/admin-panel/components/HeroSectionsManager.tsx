'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Save, X, 
  Image, Video, Palette, Settings, Zap, 
  ChevronDown, ChevronUp, ExternalLink, Loader2, Upload,
  Copy,
  Check
} from 'lucide-react';
import MediaSelector from '@/components/ui/MediaSelector';
import { useDesignSystem, getThemeDefaults } from '@/hooks/useDesignSystem';

// Types
interface MediaItem {
  id: number;
  filename: string;
  title?: string;
  description?: string;
  alt?: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  fileSize: number;
  publicUrl: string;
  thumbnailUrl?: string;
}

interface CTA {
  id: number;
  text: string;
  url: string;
  icon?: string;
  style: string;
  target: string;
  isActive: boolean;
}

interface Page {
  id: number;
  slug: string;
  title: string;
}

interface HeroSection {
  id?: number;
  name?: string;
  layoutType: 'split' | 'centered' | 'overlay';
  sectionHeight?: string; // New field for section height (e.g., "100vh", "80vh", "600px")
  tagline?: string;
  headline: string;
  subheading?: string;
  textAlignment: 'left' | 'center' | 'right';
  ctaPrimaryId?: number;
  ctaSecondaryId?: number;
  mediaUrl?: string;
  mediaItem?: MediaItem;
  mediaType: 'image' | 'video' | 'animation' | '3d';
  mediaAlt?: string;
  mediaHeight: string; // Media height (e.g., "80vh", "500px", "auto")
  mediaPosition: 'left' | 'right';
  backgroundType: 'color' | 'gradient' | 'image' | 'video';
  backgroundValue: string;
  backgroundMediaItem?: MediaItem;
  // Text Colors
  taglineColor: string;
  headlineColor: string;
  subheadingColor: string;
  // CTA Styling
  ctaPrimaryBgColor: string;
  ctaPrimaryTextColor: string;
  ctaSecondaryBgColor: string;
  ctaSecondaryTextColor: string;
  showTypingEffect: boolean;
  enableBackgroundAnimation: boolean;
  customClasses?: string;
  paddingTop: number;
  paddingBottom: number;
  containerMaxWidth: 'xl' | '2xl' | 'full';
  visible: boolean;
  ctaPrimary?: CTA;
  ctaSecondary?: CTA;
  createdAt?: string;
  updatedAt?: string;
}

// Design System Colors
const DESIGN_SYSTEM_COLORS = {
  primary: '#5243E9',
  secondary: '#7C3AED',
  accent: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent'
};

// Color Picker Component
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  allowTransparent?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, allowTransparent = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(value.startsWith('#') ? value : '#000000');

  const presetColors = [
    { name: 'Primary', value: DESIGN_SYSTEM_COLORS.primary },
    { name: 'Secondary', value: DESIGN_SYSTEM_COLORS.secondary },
    { name: 'Accent', value: DESIGN_SYSTEM_COLORS.accent },
    { name: 'Success', value: DESIGN_SYSTEM_COLORS.success },
    { name: 'Warning', value: DESIGN_SYSTEM_COLORS.warning },
    { name: 'Error', value: DESIGN_SYSTEM_COLORS.error },
    { name: 'White', value: DESIGN_SYSTEM_COLORS.white },
    { name: 'Black', value: DESIGN_SYSTEM_COLORS.black },
    { name: 'Gray 100', value: DESIGN_SYSTEM_COLORS.gray[100] },
    { name: 'Gray 300', value: DESIGN_SYSTEM_COLORS.gray[300] },
    { name: 'Gray 500', value: DESIGN_SYSTEM_COLORS.gray[500] },
    { name: 'Gray 700', value: DESIGN_SYSTEM_COLORS.gray[700] },
    { name: 'Gray 900', value: DESIGN_SYSTEM_COLORS.gray[900] },
  ];

  if (allowTransparent) {
    presetColors.push({ name: 'Transparent', value: 'transparent' });
  }

  const handlePresetClick = (color: string) => {
    onChange(color);
    setShowPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-10 h-10 border-2 border-gray-300 rounded-lg shadow-sm hover:border-gray-400 transition-colors"
          style={{ backgroundColor: value === 'transparent' ? '#f3f4f6' : value }}
        >
          {value === 'transparent' && (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
              T
            </div>
          )}
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="#000000 or transparent"
        />
      </div>

      {showPicker && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-80">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Design System Colors</h4>
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handlePresetClick(color.value)}
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-8 h-8 border border-gray-300 rounded mb-1"
                    style={{ 
                      backgroundColor: color.value === 'transparent' ? '#f3f4f6' : color.value,
                      backgroundImage: color.value === 'transparent' ? 
                        'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 
                        'none',
                      backgroundSize: color.value === 'transparent' ? '8px 8px' : 'auto',
                      backgroundPosition: color.value === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'auto'
                    }}
                  />
                  <span className="text-xs text-gray-600 text-center leading-tight">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Color</h4>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const HeroSectionsManager: React.FC = () => {
  const { designSystem } = useDesignSystem();
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [availablePages, setAvailablePages] = useState<Page[]>([]);
  const [availableCTAs, setAvailableCTAs] = useState<CTA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get theme defaults with fallbacks to ensure values are always defined
  const themeDefaults = getThemeDefaults(designSystem);

  // Form state with guaranteed defined values
  const [formData, setFormData] = useState<HeroSection>(() => ({
    name: 'Untitled Hero Section',
    layoutType: 'split',
    sectionHeight: '100vh',
    tagline: '',
    headline: '',
    subheading: '',
    textAlignment: 'left',
    ctaPrimaryId: undefined,
    ctaSecondaryId: undefined,
    mediaUrl: '',
    mediaItem: undefined,
    mediaType: 'image',
    mediaAlt: '',
    mediaHeight: '80vh',
    mediaPosition: 'right',
    backgroundType: 'color',
    backgroundValue: themeDefaults.backgroundPrimary,
    backgroundMediaItem: undefined,
    taglineColor: themeDefaults.primaryColor,
    headlineColor: themeDefaults.textPrimary,
    subheadingColor: themeDefaults.textSecondary,
    ctaPrimaryBgColor: themeDefaults.primaryColor,
    ctaPrimaryTextColor: '#FFFFFF',
    ctaSecondaryBgColor: 'transparent',
    ctaSecondaryTextColor: themeDefaults.primaryColor,
    showTypingEffect: false,
    enableBackgroundAnimation: false,
    customClasses: '',
    paddingTop: 80,
    paddingBottom: 80,
    containerMaxWidth: '2xl',
    visible: true
  }));

  // Update form defaults when design system loads
  useEffect(() => {
    if (designSystem && !editingHero) {
      const newThemeDefaults = getThemeDefaults(designSystem);
      setFormData(prev => ({
        ...prev,
        backgroundValue: newThemeDefaults.backgroundPrimary,
        taglineColor: newThemeDefaults.primaryColor,
        headlineColor: newThemeDefaults.textPrimary,
        subheadingColor: newThemeDefaults.textSecondary,
        ctaPrimaryBgColor: newThemeDefaults.primaryColor,
        ctaSecondaryTextColor: newThemeDefaults.primaryColor,
      }));
    }
  }, [designSystem, editingHero]);

  // Fetch data
  const fetchHeroSections = async () => {
    try {
      const response = await fetch('/api/admin/hero-sections');
      const result = await response.json();
      
      if (result.success) {
        setHeroSections(result.data);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to fetch hero sections' });
      }
    } catch (error) {
      console.error('Failed to fetch hero sections:', error);
      setMessage({ type: 'error', text: 'Failed to fetch hero sections' });
    }
  };

  const fetchAvailablePages = async () => {
    try {
      const response = await fetch('/api/admin/pages');
      const result = await response.json();
      
      if (result.success) {
        setAvailablePages(result.data);
      } else {
        console.error('Failed to fetch pages:', result.message);
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    }
  };

  const fetchAvailableCTAs = async () => {
    try {
      const response = await fetch('/api/admin/cta-buttons');
      const result = await response.json();
      
      if (result.success) {
        const activeCTAs = result.data.filter((cta: CTA) => cta.isActive);
        setAvailableCTAs(activeCTAs);
      } else {
        console.error('Failed to fetch CTAs:', result.message);
      }
    } catch (error) {
      console.error('Failed to fetch CTAs:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchHeroSections(), fetchAvailablePages(), fetchAvailableCTAs()]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingHero ? '/api/admin/hero-sections' : '/api/admin/hero-sections';
      const method = editingHero ? 'PUT' : 'POST';
      const data = editingHero ? { ...formData, id: editingHero.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: editingHero ? 'Hero section updated successfully!' : 'Hero section created successfully!' 
        });
        await fetchHeroSections();
        resetForm();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save hero section' });
      }
    } catch (error) {
      console.error('Failed to save hero section:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hero section?')) return;

    try {
      const response = await fetch(`/api/admin/hero-sections?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Hero section deleted successfully!' });
        await fetchHeroSections();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete hero section' });
      }
    } catch (error) {
      console.error('Failed to delete hero section:', error);
      setMessage({ type: 'error', text: 'An error occurred while deleting' });
    }
  };

  // Form helpers
  const resetForm = () => {
    const currentThemeDefaults = getThemeDefaults(designSystem);
    setFormData({
      name: 'Untitled Hero Section',
      layoutType: 'split',
      sectionHeight: '100vh',
      tagline: '',
      headline: '',
      subheading: '',
      textAlignment: 'left',
      ctaPrimaryId: undefined,
      ctaSecondaryId: undefined,
      mediaUrl: '',
      mediaItem: undefined,
      mediaType: 'image',
      mediaAlt: '',
      mediaHeight: '80vh',
      mediaPosition: 'right',
      backgroundType: 'color',
      backgroundValue: currentThemeDefaults.backgroundPrimary,
      backgroundMediaItem: undefined,
      taglineColor: currentThemeDefaults.primaryColor,
      headlineColor: currentThemeDefaults.textPrimary,
      subheadingColor: currentThemeDefaults.textSecondary,
      ctaPrimaryBgColor: currentThemeDefaults.primaryColor,
      ctaPrimaryTextColor: '#FFFFFF',
      ctaSecondaryBgColor: 'transparent',
      ctaSecondaryTextColor: currentThemeDefaults.primaryColor,
      showTypingEffect: false,
      enableBackgroundAnimation: false,
      customClasses: '',
      paddingTop: 80,
      paddingBottom: 80,
      containerMaxWidth: '2xl',
      visible: true
    });
    setEditingHero(null);
    setShowForm(false);
  };

  const startEdit = (hero: HeroSection) => {
    setFormData({
      name: hero.name || 'Untitled Hero Section',
      layoutType: hero.layoutType,
      sectionHeight: hero.sectionHeight || '100vh',
      tagline: hero.tagline || '',
      headline: hero.headline,
      subheading: hero.subheading || '',
      textAlignment: hero.textAlignment,
      ctaPrimaryId: hero.ctaPrimaryId,
      ctaSecondaryId: hero.ctaSecondaryId,
      mediaUrl: hero.mediaUrl || '',
      mediaItem: hero.mediaItem,
      mediaType: hero.mediaType,
      mediaAlt: hero.mediaAlt || '',
      mediaHeight: hero.mediaHeight || '80vh',
      mediaPosition: hero.mediaPosition,
      backgroundType: hero.backgroundType,
      backgroundValue: hero.backgroundValue,
      backgroundMediaItem: hero.backgroundMediaItem,
      taglineColor: hero.taglineColor,
      headlineColor: hero.headlineColor,
      subheadingColor: hero.subheadingColor,
      ctaPrimaryBgColor: hero.ctaPrimaryBgColor,
      ctaPrimaryTextColor: hero.ctaPrimaryTextColor,
      ctaSecondaryBgColor: hero.ctaSecondaryBgColor,
      ctaSecondaryTextColor: hero.ctaSecondaryTextColor,
      showTypingEffect: hero.showTypingEffect,
      enableBackgroundAnimation: hero.enableBackgroundAnimation,
      customClasses: hero.customClasses || '',
      paddingTop: hero.paddingTop,
      paddingBottom: hero.paddingBottom,
      containerMaxWidth: hero.containerMaxWidth,
      visible: hero.visible
    });
    setEditingHero(hero);
    setShowForm(true);
  };

  const toggleExpanded = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getLayoutTypeDisplay = (layoutType: string) => {
    const types = {
      split: 'Split Layout',
      centered: 'Centered Layout',
      overlay: 'Overlay Layout'
    };
    return types[layoutType as keyof typeof types] || layoutType;
  };

  const getBackgroundTypeDisplay = (backgroundType: string) => {
    const types = {
      color: 'Solid Color',
      gradient: 'Gradient',
      image: 'Background Image',
      video: 'Background Video'
    };
    return types[backgroundType as keyof typeof types] || backgroundType;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading hero sections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hero Sections</h2>
          <p className="text-gray-600">Manage hero sections with advanced layouts and features</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Hero Section
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Hero Sections List */}
      <div className="space-y-4">
        {heroSections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hero sections found. Create your first hero section to get started.
          </div>
        ) : (
          heroSections.map((hero) => (
            <div key={hero.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => hero.id && toggleExpanded(hero.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {hero.id && expandedSections.has(hero.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-900">{hero.name || hero.headline}</h3>
                      <p className="text-sm text-gray-600 mt-1">{hero.headline}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>Height: {hero.sectionHeight || '100vh'}</span>
                        <span>Layout: {getLayoutTypeDisplay(hero.layoutType)}</span>
                        {hero.visible ? (
                          <span className="flex items-center text-green-600">
                            <Eye size={16} className="mr-1" />
                            Visible
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <EyeOff size={16} className="mr-1" />
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(hero)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => hero.id && handleDelete(hero.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {hero.id && expandedSections.has(hero.id) && (
                <div className="p-4 bg-gray-50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                      <div className="space-y-1 text-sm">
                        {hero.tagline && <p><span className="font-medium">Tagline:</span> {hero.tagline}</p>}
                        {hero.subheading && <p><span className="font-medium">Subheading:</span> {hero.subheading}</p>}
                        <p><span className="font-medium">Text Alignment:</span> {hero.textAlignment}</p>
                      </div>
                    </div>

                    {/* CTA Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">CTA Buttons</h4>
                      <div className="space-y-1 text-sm">
                        {hero.ctaPrimary ? (
                          <p><span className="font-medium">Primary:</span> {hero.ctaPrimary.text}</p>
                        ) : (
                          <p className="text-gray-500">No primary CTA</p>
                        )}
                        {hero.ctaSecondary ? (
                          <p><span className="font-medium">Secondary:</span> {hero.ctaSecondary.text}</p>
                        ) : (
                          <p className="text-gray-500">No secondary CTA</p>
                        )}
                      </div>
                    </div>

                    {/* Media & Background */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Media & Background</h4>
                      <div className="space-y-2">
                        {hero.mediaUrl ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">Media:</span>
                              {hero.mediaType === 'image' && (
                                <img 
                                  src={hero.mediaUrl} 
                                  alt={hero.mediaAlt || 'Hero media'} 
                                  className="w-16 h-12 object-cover rounded border"
                                />
                              )}
                              {hero.mediaType === 'video' && (
                                <div className="w-16 h-12 bg-gray-200 rounded border flex items-center justify-center">
                                  <Video size={16} className="text-gray-500" />
                                </div>
                              )}
                              <span className="text-sm text-gray-600 capitalize">{hero.mediaType}</span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Height:</span> {hero.mediaHeight || '80vh'}</p>
                              <p><span className="font-medium">Position:</span> {hero.mediaPosition}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No media selected</p>
                        )}
                        <div className="text-sm">
                        <p><span className="font-medium">Background:</span> {getBackgroundTypeDisplay(hero.backgroundType)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Features */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Advanced Features</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Typing Effect:</span> {hero.showTypingEffect ? 'Yes' : 'No'}</p>
                        <p><span className="font-medium">Background Animation:</span> {hero.enableBackgroundAnimation ? 'Yes' : 'No'}</p>
                        <p><span className="font-medium">Container Width:</span> {hero.containerMaxWidth}</p>
                      </div>
                    </div>

                    {/* Spacing */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Spacing</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Padding Top:</span> {hero.paddingTop}px</p>
                        <p><span className="font-medium">Padding Bottom:</span> {hero.paddingBottom}px</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingHero ? 'Edit Hero Section' : 'Add New Hero Section'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Settings size={20} className="mr-2" />
                    Basic Information
                  </h4>
                  
                  {/* Name and Section Height */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter a name to identify this hero section"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Height
                      </label>
                      <input
                        type="text"
                        value={formData.sectionHeight || ''}
                        onChange={(e) => setFormData({ ...formData, sectionHeight: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 100vh, 80vh, 600px"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use CSS units: vh (viewport height), px (pixels), % (percentage)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Layout Type
                      </label>
                      <select
                        value={formData.layoutType}
                        onChange={(e) => setFormData({ ...formData, layoutType: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="split">Split Layout</option>
                        <option value="centered">Centered Layout</option>
                        <option value="overlay">Overlay Layout</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text Alignment
                      </label>
                      <select
                        value={formData.textAlignment}
                        onChange={(e) => setFormData({ ...formData, textAlignment: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={formData.tagline || ''}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional badge or label"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Headline *
                    </label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Main title"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subheading
                    </label>
                    <textarea
                      value={formData.subheading || ''}
                      onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Supporting text"
                    />
                  </div>
                </div>

                {/* CTA References */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <ExternalLink size={20} className="mr-2" />
                    CTA Buttons
                    <span className="ml-2 text-xs text-gray-500">({availableCTAs.length} available)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary CTA
                      </label>
                      <select
                        value={formData.ctaPrimaryId || ''}
                        onChange={(e) => setFormData({ ...formData, ctaPrimaryId: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">No primary CTA</option>
                        {availableCTAs.map(cta => (
                          <option key={cta.id} value={cta.id}>{cta.text}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary CTA
                      </label>
                      <select
                        value={formData.ctaSecondaryId || ''}
                        onChange={(e) => setFormData({ ...formData, ctaSecondaryId: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">No secondary CTA</option>
                        {availableCTAs.map(cta => (
                          <option key={cta.id} value={cta.id}>{cta.text}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Media + Background */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Image size={20} className="mr-2" />
                    Media & Background
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      {/* Current Media Preview */}
                      {(formData.mediaUrl || formData.mediaItem) && (
                        <div className="border border-gray-200 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Current Media</span>
                            <button
                              type="button"
                              onClick={() => setFormData({ 
                                ...formData, 
                                mediaItem: undefined,
                                mediaUrl: ''
                              })}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              title="Remove media"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {formData.mediaType === 'image' && formData.mediaUrl && (
                            <img 
                              src={formData.mediaUrl} 
                              alt={formData.mediaAlt || 'Hero media'} 
                              className="w-full h-32 object-cover rounded border"
                            />
                          )}
                          {formData.mediaType === 'video' && formData.mediaUrl && (
                            <div className="w-full h-32 bg-gray-200 rounded border flex items-center justify-center">
                              <div className="text-center">
                                <Video size={24} className="text-gray-500 mx-auto mb-1" />
                                <span className="text-sm text-gray-600">Video File</span>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2 truncate">
                            {formData.mediaItem?.filename || 'Media file'}
                          </p>
                        </div>
                      )}

                      <MediaSelector
                        label="Select New Media"
                        value={null}
                        onChange={(media) => {
                          const mediaItem = Array.isArray(media) ? media[0] : media;
                          setFormData({ 
                            ...formData, 
                            mediaItem: mediaItem || undefined,
                            mediaUrl: mediaItem?.publicUrl || ''
                          });
                        }}
                        allowMultiple={false}
                        acceptedTypes={['image', 'video']}
                        placeholder="Select media from library or upload new"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Media Type
                      </label>
                      <select
                        value={formData.mediaType}
                        onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="animation">Animation</option>
                        <option value="3d">3D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Media Alt Text
                      </label>
                      <input
                        type="text"
                        value={formData.mediaAlt || ''}
                        onChange={(e) => setFormData({ ...formData, mediaAlt: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Alt text for accessibility"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Media Height
                      </label>
                      <input
                        type="text"
                        value={formData.mediaHeight}
                        onChange={(e) => setFormData({ ...formData, mediaHeight: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 80vh, 500px, auto"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use CSS units: vh (viewport height), px (pixels), % (percentage), or auto
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Media Position
                      </label>
                      <select
                        value={formData.mediaPosition}
                        onChange={(e) => setFormData({ ...formData, mediaPosition: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Type
                      </label>
                      <select
                        value={formData.backgroundType}
                        onChange={(e) => setFormData({ ...formData, backgroundType: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="color">Solid Color</option>
                        <option value="gradient">Gradient</option>
                        <option value="image">Background Image</option>
                        <option value="video">Background Video</option>
                      </select>
                    </div>

                    <div>
                      {formData.backgroundType === 'color' ? (
                        <ColorPicker
                          label="Background Color"
                          value={formData.backgroundValue}
                          onChange={(color) => setFormData({ ...formData, backgroundValue: color })}
                        />
                      ) : formData.backgroundType === 'gradient' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gradient CSS
                          </label>
                          <input
                            type="text"
                            value={formData.backgroundValue}
                            onChange={(e) => setFormData({ ...formData, backgroundValue: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use CSS gradient syntax (e.g., linear-gradient, radial-gradient)
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Current Background Media Preview */}
                          {(formData.backgroundValue || formData.backgroundMediaItem) && (
                            <div className="border border-gray-200 rounded-lg p-3 bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Current {formData.backgroundType === 'image' ? 'Background Image' : 'Background Video'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setFormData({ 
                                    ...formData, 
                                    backgroundMediaItem: undefined,
                                    backgroundValue: ''
                                  })}
                                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                  title="Remove background media"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              {formData.backgroundType === 'image' && formData.backgroundValue && (
                                <img 
                                  src={formData.backgroundValue} 
                                  alt="Background" 
                                  className="w-full h-32 object-cover rounded border"
                                />
                              )}
                              {formData.backgroundType === 'video' && formData.backgroundValue && (
                                <div className="w-full h-32 bg-gray-200 rounded border flex items-center justify-center">
                                  <div className="text-center">
                                    <Video size={24} className="text-gray-500 mx-auto mb-1" />
                                    <span className="text-sm text-gray-600">Background Video</span>
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-2 truncate">
                                {formData.backgroundMediaItem?.filename || 'Background media file'}
                              </p>
                            </div>
                          )}

                        <MediaSelector
                            label={`Select New ${formData.backgroundType === 'image' ? 'Background Image' : 'Background Video'}`}
                            value={null}
                          onChange={(media) => {
                            const mediaItem = Array.isArray(media) ? media[0] : media;
                            setFormData({ 
                              ...formData, 
                              backgroundMediaItem: mediaItem || undefined,
                              backgroundValue: mediaItem?.publicUrl || ''
                            });
                          }}
                          allowMultiple={false}
                          acceptedTypes={formData.backgroundType === 'image' ? ['image'] : ['video']}
                          placeholder={`Select ${formData.backgroundType} from library or upload new`}
                        />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Text Colors */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Palette size={20} className="mr-2" />
                    Text Colors
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ColorPicker
                      label="Tagline Color"
                      value={formData.taglineColor}
                      onChange={(color) => setFormData({ ...formData, taglineColor: color })}
                    />
                    
                    <ColorPicker
                      label="Headline Color"
                      value={formData.headlineColor}
                      onChange={(color) => setFormData({ ...formData, headlineColor: color })}
                    />
                    
                    <ColorPicker
                      label="Subheading Color"
                      value={formData.subheadingColor}
                      onChange={(color) => setFormData({ ...formData, subheadingColor: color })}
                    />
                  </div>
                </div>

                {/* CTA Styling */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Zap size={20} className="mr-2" />
                    CTA Button Styling
                  </h4>
                  <div className="space-y-4">
                    {/* Primary CTA Colors */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Primary CTA Button</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ColorPicker
                          label="Background Color"
                          value={formData.ctaPrimaryBgColor}
                          onChange={(color) => setFormData({ ...formData, ctaPrimaryBgColor: color })}
                          allowTransparent
                        />
                        
                        <ColorPicker
                          label="Text Color"
                          value={formData.ctaPrimaryTextColor}
                          onChange={(color) => setFormData({ ...formData, ctaPrimaryTextColor: color })}
                        />
                      </div>
                    </div>

                    {/* Secondary CTA Colors */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Secondary CTA Button</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ColorPicker
                          label="Background Color"
                          value={formData.ctaSecondaryBgColor}
                          onChange={(color) => setFormData({ ...formData, ctaSecondaryBgColor: color })}
                          allowTransparent
                        />
                        
                        <ColorPicker
                          label="Text Color"
                          value={formData.ctaSecondaryTextColor}
                          onChange={(color) => setFormData({ ...formData, ctaSecondaryTextColor: color })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Zap size={20} className="mr-2" />
                    Advanced Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showTypingEffect"
                        checked={formData.showTypingEffect}
                        onChange={(e) => setFormData({ ...formData, showTypingEffect: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor="showTypingEffect" className="text-sm font-medium text-gray-700">
                        Show Typing Effect
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableBackgroundAnimation"
                        checked={formData.enableBackgroundAnimation}
                        onChange={(e) => setFormData({ ...formData, enableBackgroundAnimation: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor="enableBackgroundAnimation" className="text-sm font-medium text-gray-700">
                        Enable Background Animation
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Container Max Width
                      </label>
                      <select
                        value={formData.containerMaxWidth}
                        onChange={(e) => setFormData({ ...formData, containerMaxWidth: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="xl">XL</option>
                        <option value="2xl">2XL</option>
                        <option value="full">Full</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="visible"
                        checked={formData.visible}
                        onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor="visible" className="text-sm font-medium text-gray-700">
                        Visible
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Padding Top (px)
                      </label>
                      <input
                        type="number"
                        value={formData.paddingTop}
                        onChange={(e) => setFormData({ ...formData, paddingTop: parseInt(e.target.value) })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Padding Bottom (px)
                      </label>
                      <input
                        type="number"
                        value={formData.paddingBottom}
                        onChange={(e) => setFormData({ ...formData, paddingBottom: parseInt(e.target.value) })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="300"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Classes
                    </label>
                    <input
                      type="text"
                      value={formData.customClasses || ''}
                      onChange={(e) => setFormData({ ...formData, customClasses: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tailwind or utility class overrides"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isSubmitting ? 'Saving...' : 'Save Hero Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSectionsManager; 

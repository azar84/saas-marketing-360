'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Palette } from 'lucide-react';
import { useDesignSystem } from '@/hooks/useDesignSystem';

interface FAQSection {
  id: number;
  name: string;
  heading: string;
  subheading?: string;
  heroTitle: string;
  heroSubtitle?: string;
  searchPlaceholder: string;
  showHero: boolean;
  showCategories: boolean;
  backgroundColor: string;
  heroBackgroundColor: string;
  heroHeight: string;
  heroTitleColor?: string;
  heroSubtitleColor?: string;
  headingColor?: string;
  subheadingColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FAQCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  _count: {
    faqs: number;
  };
}

interface FAQSectionCategory {
  id: number;
  faqSectionId: number;
  categoryId: number;
  sortOrder: number;
  category: FAQCategory;
}

// Theme color options for hero background
const THEME_COLORS = [
  // Brand Colors
  { name: 'Primary', value: 'var(--color-primary)', key: 'primaryColor' },
  { name: 'Primary Light', value: 'var(--color-primary-light)', key: 'primaryColorLight' },
  { name: 'Primary Dark', value: 'var(--color-primary-dark)', key: 'primaryColorDark' },
  { name: 'Secondary', value: 'var(--color-secondary)', key: 'secondaryColor' },
  { name: 'Accent', value: 'var(--color-accent)', key: 'accentColor' },
  
  // Semantic Colors
  { name: 'Success', value: 'var(--color-success)', key: 'successColor' },
  { name: 'Warning', value: 'var(--color-warning)', key: 'warningColor' },
  { name: 'Error', value: 'var(--color-error)', key: 'errorColor' },
  { name: 'Info', value: 'var(--color-info)', key: 'infoColor' },
  
  // Neutral Colors
  { name: 'Gray Light', value: 'var(--color-gray-light)', key: 'grayLight' },
  { name: 'Gray Medium', value: 'var(--color-gray-medium)', key: 'grayMedium' },
  { name: 'Gray Dark', value: 'var(--color-gray-dark)', key: 'grayDark' },
  
  // Background Colors
  { name: 'Background Primary', value: 'var(--color-bg-primary)', key: 'backgroundPrimary' },
  { name: 'Background Secondary', value: 'var(--color-bg-secondary)', key: 'backgroundSecondary' },
  { name: 'Background Dark', value: 'var(--color-bg-dark)', key: 'backgroundDark' },
  
  // Text Colors
  { name: 'Text Primary', value: 'var(--color-text-primary)', key: 'textPrimary' },
  { name: 'Text Secondary', value: 'var(--color-text-secondary)', key: 'textSecondary' },
  { name: 'Text Muted', value: 'var(--color-text-muted)', key: 'textMuted' },
] as const;

type ThemeColor = {
  name: string;
  value: string;
  key: string;
  actualValue?: string;
};

// Hero height options
const HERO_HEIGHT_OPTIONS = [
  { label: '60vh (Small)', value: '60vh' },
  { label: '70vh (Medium)', value: '70vh' },
  { label: '80vh (Default)', value: '80vh' },
  { label: '90vh (Large)', value: '90vh' },
  { label: '100vh (Full Screen)', value: '100vh' },
  { label: '50vh (Compact)', value: '50vh' },
];

// Color Picker Component
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, description }) => {
  const { designSystem } = useDesignSystem();
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(value.startsWith('#') ? value : '#6366f1');

  // Get actual color values from design system for theme colors
  const getThemeColors = (): ThemeColor[] => {
    if (!designSystem) return THEME_COLORS.map(color => ({ ...color }));
    
    return THEME_COLORS.map(color => ({
      ...color,
      actualValue: designSystem[color.key as keyof typeof designSystem] as string || color.value
    }));
  };

  const themeColors = getThemeColors();

  const handleThemeColorClick = (color: ThemeColor) => {
    onChange(color.actualValue || color.value);
    setShowPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  const isThemeColor = themeColors.some(color => 
    (color.actualValue || color.value) === value
  );

  return (
    <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
        {label}
      </label>
      {description && (
        <p className="text-xs" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>{description}</p>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-3 w-full p-3 border rounded-lg transition-colors"
        style={{ 
          borderColor: 'var(--color-gray-light, #E5E7EB)', 
          backgroundColor: 'var(--color-bg-primary, #FFFFFF)' 
        }}
        >
          <div 
            className="w-8 h-8 rounded-md border"
            style={{ 
              borderColor: 'var(--color-gray-light)',
              backgroundColor: value 
            }}
          />
          <div className="flex-1 text-left">
            <div className="font-medium" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
              {isThemeColor 
                ? themeColors.find(c => (c.actualValue || c.value) === value)?.name || 'Theme Color'
                : 'Custom Color'
              }
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>{value}</div>
          </div>
                      <Palette className="w-4 h-4" style={{ color: 'var(--color-text-muted, #9CA3AF)' }} />
        </button>

        {showPicker && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 border rounded-lg shadow-lg z-10" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)' }}>
            <div className="space-y-4">
              {/* Theme Colors */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary, #1F2937)' }}>Theme Colors</h4>
                <div className="grid grid-cols-3 gap-2">
                  {themeColors.map((color) => (
                    <button
                      key={color.key}
                      type="button"
                      onClick={() => handleThemeColorClick(color)}
                      className={`flex items-center gap-2 p-2 rounded-md border transition-colors`}
                      style={{
                        borderColor: (color.actualValue || color.value) === value ? 'var(--color-primary, #5243E9)' : 'var(--color-gray-light, #E5E7EB)',
                        backgroundColor: (color.actualValue || color.value) === value ? 'var(--color-bg-secondary, #F9FAFB)' : 'var(--color-bg-primary, #FFFFFF)'
                      }}
                    >
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ 
                          borderColor: 'var(--color-gray-light)',
                          backgroundColor: color.actualValue || color.value 
                        }}
                      />
                      <span className="text-xs" style={{ color: 'var(--color-text-primary, #1F2937)' }}>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary, #1F2937)' }}>Custom Color</h4>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="w-12 h-10 rounded border"
            style={{ borderColor: 'var(--color-gray-light)' }}
                  />
                  <Input
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      onChange(e.target.value);
                    }}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPicker(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function FAQSectionsManager() {
  const { designSystem } = useDesignSystem();
  const [sections, setSections] = useState<FAQSection[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [sectionCategories, setSectionCategories] = useState<FAQSectionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    heading: '',
    subheading: '',
    heroTitle: '',
    heroSubtitle: '',
    searchPlaceholder: 'Enter your keyword here',
    showHero: true,
    showCategories: true,
    backgroundColor: '#f8fafc',
    heroBackgroundColor: '#6366f1',
    heroHeight: '80vh',
    heroTitleColor: '#FFFFFF',
    heroSubtitleColor: '#FFFFFF',
    headingColor: '#1F2937',
    subheadingColor: '#6B7280',
    isActive: true
  });

  useEffect(() => {
    fetchSections();
    fetchCategories();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/faq-sections');
      if (!response.ok) throw new Error('Failed to fetch FAQ sections');
      const data = await response.json();
      setSections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQ sections');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/faq-categories');
      if (!response.ok) throw new Error('Failed to fetch FAQ categories');
      const data = await response.json();
      setCategories(data.filter((cat: FAQCategory) => cat.isActive));
    } catch (err) {
      console.error('Failed to load FAQ categories:', err);
    }
  };

  const fetchSectionCategories = async (sectionId: number) => {
    try {
      const response = await fetch(`/api/admin/faq-section-categories?faqSectionId=${sectionId}`);
      if (!response.ok) throw new Error('Failed to fetch section categories');
      const data = await response.json();
      setSectionCategories(data);
      setSelectedCategories(data.map((sc: FAQSectionCategory) => sc.categoryId));
    } catch (err) {
      console.error('Failed to load section categories:', err);
      setSectionCategories([]);
      setSelectedCategories([]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      heading: '',
      subheading: '',
      heroTitle: '',
      heroSubtitle: '',
      searchPlaceholder: 'Enter your keyword here',
      showHero: true,
      showCategories: true,
      backgroundColor: '#f8fafc',
      heroBackgroundColor: '#6366f1',
      heroHeight: '80vh',
      heroTitleColor: '#FFFFFF',
      heroSubtitleColor: '#FFFFFF',
      headingColor: '#1F2937',
      subheadingColor: '#6B7280',
      isActive: true
    });
    setSelectedCategories([]);
    setSectionCategories([]);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (section: FAQSection) => {
    setEditingId(section.id);
    setIsCreating(false);
    setFormData({
      name: section.name,
      heading: section.heading,
      subheading: section.subheading || '',
      heroTitle: section.heroTitle,
      heroSubtitle: section.heroSubtitle || '',
      searchPlaceholder: section.searchPlaceholder,
      showHero: section.showHero,
      showCategories: section.showCategories,
      backgroundColor: section.backgroundColor,
      heroBackgroundColor: section.heroBackgroundColor,
      heroHeight: section.heroHeight || '80vh',
      heroTitleColor: section.heroTitleColor || '#FFFFFF',
      heroSubtitleColor: section.heroSubtitleColor || '#FFFFFF',
      headingColor: section.headingColor || '#1F2937',
      subheadingColor: section.subheadingColor || '#6B7280',
      isActive: section.isActive
    });
    fetchSectionCategories(section.id);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = isCreating ? '/api/admin/faq-sections' : `/api/admin/faq-sections/${editingId}`;
      const method = isCreating ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save FAQ section');
      
      const savedSection = await response.json();
      const sectionId = isCreating ? savedSection.id : editingId;

      // Update section categories if any are selected
      if (selectedCategories.length > 0) {
        await fetch('/api/admin/faq-section-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            faqSectionId: sectionId,
            categoryIds: selectedCategories
          })
        });
      }
      
      await fetchSections();
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save FAQ section');
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/faq-sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (!response.ok) throw new Error('Failed to update FAQ section');
      await fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update FAQ section');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ section?')) return;
    
    try {
      const response = await fetch(`/api/admin/faq-sections/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete FAQ section');
      await fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete FAQ section');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary, #1F2937)' }}>FAQ Sections</h2>
        <p className="mt-1" style={{ color: 'var(--color-text-secondary, #6B7280)' }}>
            Manage FAQ section configurations and display settings
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create FAQ Section
        </Button>
      </div>

      {error && (
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-error-light, #FEE2E2)', borderColor: 'var(--color-error, #EF4444)' }}>
          <p style={{ color: 'var(--color-error-dark, #991B1B)' }}>{error}</p>
        </div>
      )}

      {(isCreating || editingId) && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {isCreating ? 'Create FAQ Section' : 'Edit FAQ Section'}
            </h3>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Section Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main FAQ Section"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Main Heading *
                </label>
                <Input
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  placeholder="e.g., Frequently Asked Questions"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Subheading
                </label>
                <Input
                  value={formData.subheading}
                  onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                  placeholder="Optional description below the main heading"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Hero Title *
                </label>
                <Input
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  placeholder="e.g., Frequently asked questions"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Hero Subtitle
                </label>
                <Input
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  placeholder="Hero section description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Search Placeholder
                </label>
                <Input
                  value={formData.searchPlaceholder}
                  onChange={(e) => setFormData({ ...formData, searchPlaceholder: e.target.value })}
                  placeholder="Search input placeholder text"
                />
              </div>

              <div>
                <ColorPicker
                  label="Background Color"
                  value={formData.backgroundColor}
                  onChange={(color) => setFormData({ ...formData, backgroundColor: color })}
                  description="Main section background color"
                />
              </div>

              <div>
                <ColorPicker
                  label="Hero Background Color"
                  value={formData.heroBackgroundColor}
                  onChange={(color) => setFormData({ ...formData, heroBackgroundColor: color })}
                  description="Hero section background color (supports theme colors)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Hero Height
                </label>
                <select
                  value={formData.heroHeight}
                  onChange={(e) => setFormData({ ...formData, heroHeight: e.target.value })}
                  className="w-full rounded border border-gray-300"
                >
                  {HERO_HEIGHT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <ColorPicker
                  label="Hero Title Color"
                  value={formData.heroTitleColor}
                  onChange={(color) => setFormData({ ...formData, heroTitleColor: color })}
                  description="Color for the hero section title"
                />
              </div>

              <div>
                <ColorPicker
                  label="Hero Subtitle Color"
                  value={formData.heroSubtitleColor}
                  onChange={(color) => setFormData({ ...formData, heroSubtitleColor: color })}
                  description="Color for the hero section subtitle"
                />
              </div>

              <div>
                <ColorPicker
                  label="Heading Color"
                  value={formData.headingColor}
                  onChange={(color) => setFormData({ ...formData, headingColor: color })}
                  description="Color for the main section heading"
                />
              </div>

              <div>
                <ColorPicker
                  label="Subheading Color"
                  value={formData.subheadingColor}
                  onChange={(color) => setFormData({ ...formData, subheadingColor: color })}
                  description="Color for the main section subheading"
                />
              </div>
            </div>

            <div className="space-y-4">
                              <h4 className="text-md font-medium" style={{ color: 'var(--color-text-primary)' }}>Display Options</h4>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showHero}
                    onChange={(e) => setFormData({ ...formData, showHero: e.target.checked })}
                    className="rounded"
                    style={{ borderColor: 'var(--color-gray-light)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Show Hero Section</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showCategories}
                    onChange={(e) => setFormData({ ...formData, showCategories: e.target.checked })}
                    className="rounded"
                    style={{ borderColor: 'var(--color-gray-light)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Show Categories Sidebar</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                    style={{ borderColor: 'var(--color-gray-light)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Active</span>
                </label>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium" style={{ color: 'var(--color-text-primary)' }}>FAQ Categories</h4>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {selectedCategories.length} of {categories.length} selected
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Select which FAQ categories to include in this section. If none are selected, all active categories will be displayed.
              </p>
              
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4" style={{ borderColor: 'var(--color-gray-light)' }}>
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCategories.includes(category.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{
                        borderColor: selectedCategories.includes(category.id) 
                          ? 'var(--color-primary)' 
                          : 'var(--color-gray-light)',
                        backgroundColor: selectedCategories.includes(category.id) 
                          ? 'var(--color-primary-light)' 
                          : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="rounded"
                        style={{ borderColor: 'var(--color-gray-light)' }}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: category.color, borderColor: 'var(--color-gray-light)' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {category.name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {category._count.faqs} FAQ{category._count.faqs !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                  <p>No FAQ categories available.</p>
                  <p className="text-sm mt-1">Create some FAQ categories first to select them for this section.</p>
                </div>
              )}

              {selectedCategories.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategories([])}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategories(categories.map(c => c.id))}
                  >
                    Select All
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isCreating ? 'Create Section' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {section.name}
            </h3>
                  <div className="flex items-center gap-2">
                    {section.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success-dark)' }}>
                        <Eye className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-gray-light)', color: 'var(--color-text-secondary)' }}>
                        <EyeOff className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Heading:</span>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>{section.heading}</p>
                  </div>
                  
                  {section.subheading && (
                    <div>
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Subheading:</span>
                      <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>{section.subheading}</p>
                    </div>
                  )}

                  <div>
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Hero Title:</span>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>{section.heroTitle}</p>
                  </div>

                  {section.heroSubtitle && (
                    <div>
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Hero Subtitle:</span>
                      <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>{section.heroSubtitle}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Show Hero: {section.showHero ? 'Yes' : 'No'}</span>
                  <span>Show Categories: {section.showCategories ? 'Yes' : 'No'}</span>
                  <span>Created: {new Date(section.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(section.id, section.isActive)}
                  className="flex items-center gap-1"
                >
                  {section.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {section.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(section)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(section.id)}
                  style={{ color: 'var(--color-error)' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {sections.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <div className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No FAQ Sections</h3>
            <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Create your first FAQ section configuration to get started.
            </p>
            <Button onClick={handleCreate}>Create FAQ Section</Button>
          </Card>
        )}
      </div>
    </div>
  );
} 
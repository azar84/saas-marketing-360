'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  GripVertical, 
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
  Code,
  Globe,
  Zap,
  Star,
  Award,
  Users,
  TrendingUp,
  Heart,
  Sparkles,
  Play,
  ArrowRight,
  Download,
  ExternalLink,
  Mail,
  Phone,
  MessageSquare,
  Video,
  Calendar,
  BookOpen,
  Gift,
  Rocket,
  Trophy,
  Lock,
  Check,
  MessageCircle,
  Smartphone,
  MapPin,
  Settings,
  Target,
  Palette
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useDesignSystem } from '@/hooks/useDesignSystem';

// Available icons for trust indicators and CTA buttons
const availableIcons = [
  { name: 'Shield', icon: Shield, label: 'Shield' },
  { name: 'Clock', icon: Clock, label: 'Clock' },
  { name: 'Code', icon: Code, label: 'Code' },
  { name: 'Globe', icon: Globe, label: 'Globe' },
  { name: 'Zap', icon: Zap, label: 'Lightning' },
  { name: 'Star', icon: Star, label: 'Star' },
  { name: 'Award', icon: Award, label: 'Award' },
  { name: 'Users', icon: Users, label: 'Users' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Trending Up' },
  { name: 'Heart', icon: Heart, label: 'Heart' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { name: 'Play', icon: Play, label: 'Play' },
  { name: 'ArrowRight', icon: ArrowRight, label: 'Arrow Right' },
  { name: 'Download', icon: Download, label: 'Download' },
  { name: 'ExternalLink', icon: ExternalLink, label: 'External Link' },
  { name: 'Mail', icon: Mail, label: 'Mail' },
  { name: 'Phone', icon: Phone, label: 'Phone' },
  { name: 'MessageSquare', icon: MessageSquare, label: 'Message' },
  { name: 'Video', icon: Video, label: 'Video' },
  { name: 'Calendar', icon: Calendar, label: 'Calendar' },
  { name: 'BookOpen', icon: BookOpen, label: 'Book' },
  { name: 'Gift', icon: Gift, label: 'Gift' },
  { name: 'Rocket', icon: Rocket, label: 'Rocket' },
  { name: 'Trophy', icon: Trophy, label: 'Trophy' },
  { name: 'Lock', icon: Lock, label: 'Lock' },
  { name: 'Check', icon: Check, label: 'Check' },
  { name: 'MessageCircle', icon: MessageCircle, label: 'Message Circle' },
  { name: 'Smartphone', icon: Smartphone, label: 'Smartphone' },
  { name: 'MapPin', icon: MapPin, label: 'Map Pin' },
  { name: 'Settings', icon: Settings, label: 'Settings' },
  { name: 'Target', icon: Target, label: 'Target' },
  { name: 'Palette', icon: Palette, label: 'Palette' }
];

interface TrustIndicator {
  id?: number;
  iconName: string;
  text: string;
  sortOrder: number;
  isVisible: boolean;
}

interface CTAButton {
  id: number;
  text: string;
  url: string;
  icon?: string;
  style: string;
  target: string;
  isActive: boolean;
}

interface HomeHeroData {
  id?: number;
  heading: string;
  subheading: string;
  backgroundColor: string;
  primaryCtaId: number | null;
  secondaryCtaId: number | null;
  isActive: boolean;
  primaryCta?: CTAButton | null;
  secondaryCta?: CTAButton | null;
  trustIndicators: TrustIndicator[];
}

const HomeHeroManager: React.FC = () => {
  const { designSystem } = useDesignSystem();
  
  const [heroData, setHeroData] = useState<HomeHeroData>({
    heading: 'Automate Conversations, Capture Leads, Serve Customers — All Without Code',
    subheading: 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.',
    backgroundColor: '#FFFFFF',
    primaryCtaId: null,
    secondaryCtaId: null,
    isActive: true,
    trustIndicators: [
      { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
      { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
      { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
    ]
  });

  const [availableCTAs, setAvailableCTAs] = useState<CTAButton[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Get design system colors for color picker
  const getDesignSystemColors = () => {
    if (!designSystem) return [];
    
    return [
      { name: 'Primary', value: designSystem.primaryColor, description: 'Main brand color' },
      { name: 'Primary Light', value: designSystem.primaryColorLight, description: 'Light primary variant' },
      { name: 'Primary Dark', value: designSystem.primaryColorDark, description: 'Dark primary variant' },
      { name: 'Secondary', value: designSystem.secondaryColor, description: 'Secondary brand color' },
      { name: 'Accent', value: designSystem.accentColor, description: 'Accent color' },
      { name: 'Success', value: designSystem.successColor, description: 'Success state color' },
      { name: 'Warning', value: designSystem.warningColor, description: 'Warning state color' },
      { name: 'Error', value: designSystem.errorColor, description: 'Error state color' },
      { name: 'Info', value: designSystem.infoColor, description: 'Info state color' },
      { name: 'Background Primary', value: designSystem.backgroundPrimary, description: 'Primary background' },
      { name: 'Background Secondary', value: designSystem.backgroundSecondary, description: 'Secondary background' },
      { name: 'Background Dark', value: designSystem.backgroundDark, description: 'Dark background' },
      { name: 'Gray Light', value: designSystem.grayLight, description: 'Light gray' },
      { name: 'Gray Medium', value: designSystem.grayMedium, description: 'Medium gray' },
      { name: 'Gray Dark', value: designSystem.grayDark, description: 'Dark gray' }
    ];
  };

  // Fetch hero data and available CTAs on component mount
  useEffect(() => {
    fetchHeroData();
    fetchAvailableCTAs();
  }, []);

  const fetchAvailableCTAs = async () => {
    try {
      const response = await fetch('/api/admin/cta-buttons');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAvailableCTAs(result.data.filter((cta: CTAButton) => cta.isActive));
        }
      }
    } catch (error) {
      console.error('Error fetching CTAs:', error);
    }
  };

  const fetchHeroData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/home-hero');
      if (response.ok) {
        const result = await response.json();
        // Handle the new API response format
        if (result.success && result.data) {
          // Ensure trustIndicators is always an array and backgroundColor has a default
          const heroData = {
            ...result.data,
            backgroundColor: result.data.backgroundColor || '#FFFFFF',
            trustIndicators: result.data.trustIndicators || []
          };
          setHeroData(heroData);
        } else {
          throw new Error(result.message || 'Failed to fetch hero data');
        }
      } else {
        throw new Error('Failed to fetch hero data');
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
      setMessage({ type: 'error', text: 'Failed to load hero data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/home-hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData)
      });

      if (response.ok) {
        const result = await response.json();
        // Handle the new API response format
        if (result.success && result.data) {
          // Ensure trustIndicators is always an array
          const heroData = {
            ...result.data,
            trustIndicators: result.data.trustIndicators || []
          };
          setHeroData(heroData);
          setMessage({ type: 'success', text: result.message || 'Hero section updated successfully!' });
        } else {
          throw new Error(result.message || 'Failed to save');
        }
      } else {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving hero data:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save hero section' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchHeroData();
    setMessage(null);
  };

  const addTrustIndicator = () => {
    const newIndicator: TrustIndicator = {
      iconName: 'Star',
      text: 'New Feature',
      sortOrder: (heroData.trustIndicators || []).length,
      isVisible: true
    };
    setHeroData(prev => ({
      ...prev,
      trustIndicators: [...(prev.trustIndicators || []), newIndicator]
    }));
  };

  const removeTrustIndicator = (index: number) => {
    setHeroData(prev => ({
      ...prev,
      trustIndicators: (prev.trustIndicators || []).filter((_, i) => i !== index)
    }));
  };

  const updateTrustIndicator = (index: number, field: keyof TrustIndicator, value: any) => {
    setHeroData(prev => ({
      ...prev,
      trustIndicators: (prev.trustIndicators || []).map((indicator, i) => 
        i === index ? { ...indicator, [field]: value } : indicator
      )
    }));
  };

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.icon : Shield;
  };

  const getSelectedCTA = (ctaId: number | null) => {
    if (!ctaId) return null;
    return availableCTAs.find(cta => cta.id === ctaId) || null;
  };

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5243E9]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Home Page Hero</h2>
          <p className="text-gray-600 mt-1">Manage your homepage hero section content and CTAs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#5243E9] hover:bg-[#4338CA]"
          >
            {saving ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {previewMode ? (
        /* Preview Mode */
        <div 
          className="rounded-xl p-8"
          style={{ backgroundColor: heroData.backgroundColor }}
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {heroData.heading}
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {heroData.subheading}
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              {heroData.primaryCtaId && heroData.primaryCta && (
                <Button className="bg-[#5243E9] hover:bg-[#4338CA] flex items-center gap-2">
                  {heroData.primaryCta.icon && (() => {
                    const IconComponent = getIconComponent(heroData.primaryCta.icon);
                    return <IconComponent className="w-4 h-4" />;
                  })()}
                  {heroData.primaryCta.text}
                </Button>
              )}
              {heroData.secondaryCtaId && heroData.secondaryCta && (
                <Button variant="outline" className="flex items-center gap-2">
                  {heroData.secondaryCta.icon && (() => {
                    const IconComponent = getIconComponent(heroData.secondaryCta.icon);
                    return <IconComponent className="w-4 h-4" />;
                  })()}
                  {heroData.secondaryCta.text}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-6">
              {(heroData.trustIndicators || []).filter(indicator => indicator.isVisible).map((indicator, index) => {
                const IconComponent = getIconComponent(indicator.iconName);
                return (
                  <div key={index} className="flex items-center gap-2 text-gray-600">
                    <IconComponent className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{indicator.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Main Content</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading
                  </label>
                  <textarea
                    value={heroData.heading}
                    onChange={(e) => setHeroData(prev => ({ ...prev, heading: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter main heading..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subheading
                  </label>
                  <textarea
                    value={heroData.subheading}
                    onChange={(e) => setHeroData(prev => ({ ...prev, subheading: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter subheading..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="heroActive"
                    checked={heroData.isActive}
                    onChange={(e) => setHeroData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-[#5243E9] border-gray-300 rounded focus:ring-[#5243E9]"
                  />
                  <label htmlFor="heroActive" className="text-sm font-medium text-gray-700">
                    Hero section is active
                  </label>
                </div>
              </div>
            </div>

            {/* Styling */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Palette className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Styling</h3>
                  <p className="text-gray-600 text-sm">Customize the hero section appearance</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Background Color
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Select a background color for the hero section.
                  </p>
                  
                  {/* Design System Color Palette */}
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-4">
                    {getDesignSystemColors().map((colorOption) => (
                      <div
                        key={colorOption.name}
                        className={`cursor-pointer text-center ${
                          heroData.backgroundColor === colorOption.value
                            ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg'
                            : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 rounded-lg'
                        }`}
                        onClick={() => setHeroData(prev => ({ ...prev, backgroundColor: colorOption.value }))}
                      >
                        <div
                          className="w-12 h-12 rounded-lg shadow-sm border border-gray-200 mb-1 relative"
                          style={{ backgroundColor: colorOption.value }}
                        >
                          {heroData.backgroundColor === colorOption.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full border-2 border-blue-500" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 block truncate">
                          {colorOption.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Custom Color Input */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer relative overflow-hidden"
                      style={{ backgroundColor: heroData.backgroundColor }}
                    >
                      <input
                        type="color"
                        value={heroData.backgroundColor}
                        onChange={(e) => setHeroData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={heroData.backgroundColor}
                        onChange={(e) => setHeroData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent font-mono text-sm"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Call-to-Action Buttons</h3>
              
              <div className="space-y-6">
                {/* Primary CTA */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Primary CTA Button</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select CTA Button
                      </label>
                      <select
                        value={heroData.primaryCtaId || ''}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          primaryCtaId: e.target.value ? Number(e.target.value) : null 
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent"
                      >
                        <option value="">No CTA Button</option>
                        {availableCTAs.map(cta => (
                          <option key={cta.id} value={cta.id}>
                            {cta.text} ({cta.url})
                          </option>
                        ))}
                      </select>
                    </div>
                    {heroData.primaryCtaId && (
                      <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
                        <p><strong>Selected:</strong> {getSelectedCTA(heroData.primaryCtaId)?.text}</p>
                        <p><strong>URL:</strong> {getSelectedCTA(heroData.primaryCtaId)?.url}</p>
                        <p><strong>Style:</strong> {getSelectedCTA(heroData.primaryCtaId)?.style}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Secondary CTA */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Secondary CTA Button</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select CTA Button
                      </label>
                      <select
                        value={heroData.secondaryCtaId || ''}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          secondaryCtaId: e.target.value ? Number(e.target.value) : null 
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent"
                      >
                        <option value="">No CTA Button</option>
                        {availableCTAs.map(cta => (
                          <option key={cta.id} value={cta.id}>
                            {cta.text} ({cta.url})
                          </option>
                        ))}
                      </select>
                    </div>
                    {heroData.secondaryCtaId && (
                      <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
                        <p><strong>Selected:</strong> {getSelectedCTA(heroData.secondaryCtaId)?.text}</p>
                        <p><strong>URL:</strong> {getSelectedCTA(heroData.secondaryCtaId)?.url}</p>
                        <p><strong>Style:</strong> {getSelectedCTA(heroData.secondaryCtaId)?.style}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trust Indicators</h3>
                <Button
                  onClick={addTrustIndicator}
                  size="sm"
                  className="flex items-center gap-2 bg-[#5243E9] hover:bg-[#4338CA]"
                >
                  <Plus className="w-4 h-4" />
                  Add Indicator
                </Button>
              </div>

              <div className="space-y-4">
                {(heroData.trustIndicators || []).map((indicator, index) => {
                  const IconComponent = getIconComponent(indicator.iconName);
                  return (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <input
                          type="checkbox"
                          checked={indicator.isVisible}
                          onChange={(e) => updateTrustIndicator(index, 'isVisible', e.target.checked)}
                          className="w-4 h-4 text-[#5243E9] border-gray-300 rounded focus:ring-[#5243E9]"
                        />
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <IconComponent className="w-4 h-4" />
                          <span>Indicator {index + 1}</span>
                        </div>
                        <Button
                          onClick={() => removeTrustIndicator(index)}
                          size="sm"
                          variant="outline"
                          className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Icon
                          </label>
                          <select
                            value={indicator.iconName}
                            onChange={(e) => updateTrustIndicator(index, 'iconName', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent"
                          >
                            {availableIcons.map(icon => (
                              <option key={icon.name} value={icon.name}>
                                {icon.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Text
                          </label>
                          <input
                            type="text"
                            value={indicator.text}
                            onChange={(e) => updateTrustIndicator(index, 'text', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent"
                            placeholder="99.9% Uptime"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(heroData.trustIndicators || []).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No trust indicators added yet.</p>
                    <p className="text-sm">Click "Add Indicator" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeHeroManager; 

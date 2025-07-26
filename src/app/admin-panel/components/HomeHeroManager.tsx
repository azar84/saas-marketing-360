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
import MediaSelector from '@/components/ui/MediaSelector';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import UniversalIconPicker from '@/components/ui/UniversalIconPicker';

interface TrustIndicator {
  id?: number;
  iconName: string; // This will now store the full format: "library:iconName"
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
  // Creatives configuration
  animationType?: string; // video, html, script, image
  animationData?: any; // JSON object for creatives configuration
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
    trustIndicators: [],
    animationType: 'conversation',
    animationData: {
      conversationFlow: [
        {
          type: 'user',
          message: "Hi! Can I return a product if I'm outside Canada?",
          delay: 1000
        },
        {
          type: 'typing',
          delay: 2000
        },
        {
          type: 'ai',
          message: "Yes! Returns are accepted within 30 days globally. Need help creating a return label?",
          delay: 3500
        },
        {
          type: 'user',
          message: "That would be great! My order number is #SK-2024-001",
          delay: 6000
        },
        {
          type: 'typing',
          delay: 7000
        },
        {
          type: 'ai',
          message: "Perfect! I've generated your return label and sent it to your email. You'll also receive tracking updates. Anything else I can help with?",
          delay: 8500
        }
      ]
    }
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
      iconName: 'lucide:Star',
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
    if (!iconName) return Shield;
    
    // Handle new format: "library:iconName"
    if (iconName.includes(':')) {
      const [library, name] = iconName.split(':');
      
      // Import the appropriate icon library
      let iconLibrary;
      switch (library) {
        case 'lucide':
          iconLibrary = require('lucide-react');
          break;
        case 'react-icons-fa':
          iconLibrary = require('react-icons/fa');
          break;
        case 'react-icons-md':
          iconLibrary = require('react-icons/md');
          break;
        case 'react-icons-io':
          iconLibrary = require('react-icons/io');
          break;
        case 'react-icons-bi':
          iconLibrary = require('react-icons/bi');
          break;
        default:
          return Shield;
      }
      
      return iconLibrary[name] || Shield;
    }
    
    // Fallback to old format for backward compatibility
    // This part of the code is no longer needed as UniversalIconPicker handles all icons
    return Shield; 
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: designSystem?.textPrimary || '#000000' }}>Home Page Hero</h2>
            <p className="mt-1" style={{ color: designSystem?.textSecondary || '#666666' }}>Manage your homepage hero section content and CTAs</p>
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
              <h1 className="text-4xl font-bold mb-4 leading-tight" style={{ color: designSystem?.textPrimary || '#000000' }}>
                {heroData.heading || 'Your Hero Heading'}
              </h1>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: designSystem?.textSecondary || '#666666' }}>
                {heroData.subheading || 'Your compelling subheading that explains your value proposition and encourages visitors to take action.'}
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
                    <div key={index} className="flex items-center gap-2" style={{ color: designSystem?.textSecondary || '#666666' }}>
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
                <h3 className="text-lg font-semibold mb-4" style={{ color: designSystem?.textPrimary || '#000000' }}>Main Content</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: designSystem?.textPrimary || '#000000' }}>
                      Hero Heading
                    </label>
                    <Input
                      type="text"
                      value={heroData.heading}
                      onChange={(e) => setHeroData({ ...heroData, heading: e.target.value })}
                      placeholder="Enter your hero heading"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: designSystem?.textPrimary || '#000000' }}>
                      Hero Subheading
                    </label>
                    <textarea
                      value={heroData.subheading}
                      onChange={(e) => setHeroData({ ...heroData, subheading: e.target.value })}
                      placeholder="Enter your hero subheading"
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      style={{ 
                        color: designSystem?.textPrimary || '#000000',
                        backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="heroActive"
                      checked={heroData.isActive}
                      onChange={(e) => setHeroData({ ...heroData, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#5243E9] border-gray-300 rounded focus:ring-[#5243E9]"
                    />
                    <label htmlFor="heroActive" className="text-sm font-medium ml-2" style={{ color: designSystem?.textPrimary || '#000000' }}>
                      Enable Hero Section
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
                    <h3 className="text-lg font-semibold" style={{ color: designSystem?.textPrimary || '#000000' }}>Styling</h3>
                    <p className="text-sm" style={{ color: designSystem?.textSecondary || '#666666' }}>Customize the hero section appearance</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: designSystem?.textPrimary || '#000000' }}>
                      Background Color
                    </label>
                    <p className="text-xs mb-4" style={{ color: designSystem?.textMuted || '#999999' }}>
                      Choose a background color for your hero section. Use hex codes (e.g., #ffffff) or CSS color names.
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
                          <span className="text-xs block truncate" style={{ color: designSystem?.textSecondary || '#666666' }}>
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
                          style={{ 
                            color: designSystem?.textPrimary || '#000000',
                            backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creatives Configuration */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4" style={{ color: designSystem?.textPrimary || '#000000' }}>Creatives Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: designSystem?.textPrimary || '#000000' }}>
                      Creatives Type
                    </label>
                    <select
                      value={heroData.animationType || ''}
                      onChange={(e) => setHeroData({ ...heroData, animationType: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        color: designSystem?.textPrimary || '#000000',
                        backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                      }}
                    >
                      <option value="">No Animation</option>
                      <option value="video">Video</option>
                      <option value="html">HTML Content</option>
                      <option value="script">Custom Script</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  
                  {heroData.animationType === 'video' && (
                    <div className="space-y-4">
                      <h4 className="font-medium mb-3" style={{ color: designSystem?.textPrimary || '#000000' }}>Video Configuration</h4>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: designSystem?.textPrimary || '#000000' }}>
                          Video URL
                        </label>
                        <input
                          type="url"
                          value={heroData.animationData?.videoUrl || ''}
                          onChange={(e) => setHeroData({
                            ...heroData,
                            animationData: { ...heroData.animationData, videoUrl: e.target.value }
                          })}
                          placeholder="https://example.com/video.mp4"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ 
                            color: designSystem?.textPrimary || '#000000',
                            backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                          }}
                        />
                        <p className="text-xs mt-1" style={{ color: designSystem?.textMuted || '#999999' }}>
                          Enter the URL of your video file (MP4, WebM, etc.)
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="autoplay"
                            checked={heroData.animationData?.autoplay || false}
                            onChange={(e) => setHeroData({
                              ...heroData,
                              animationData: { ...heroData.animationData, autoplay: e.target.checked }
                            })}
                            className="w-4 h-4 text-[#5243E9] border-gray-300 rounded focus:ring-[#5243E9]"
                          />
                          <label htmlFor="autoplay" className="text-sm ml-2" style={{ color: designSystem?.textPrimary || '#000000' }}>
                            Autoplay video
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="loop"
                            checked={heroData.animationData?.loop || false}
                            onChange={(e) => setHeroData({
                              ...heroData,
                              animationData: { ...heroData.animationData, loop: e.target.checked }
                            })}
                            className="w-4 h-4 text-[#5243E9] border-gray-300 rounded focus:ring-[#5243E9]"
                          />
                          <label htmlFor="loop" className="text-sm ml-2" style={{ color: designSystem?.textPrimary || '#000000' }}>
                            Loop video
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {heroData.animationType === 'html' && (
                    <div className="space-y-4">
                      <h4 className="font-medium mb-3" style={{ color: designSystem?.textPrimary || '#000000' }}>HTML Content</h4>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: designSystem?.textPrimary || '#000000' }}>
                          HTML Content
                        </label>
                        <textarea
                          value={heroData.animationData?.htmlContent || ''}
                          onChange={(e) => setHeroData({
                            ...heroData,
                            animationData: { ...heroData.animationData, htmlContent: e.target.value }
                          })}
                          placeholder="<div>Your HTML content here...</div>"
                          rows={6}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                          style={{ 
                            color: designSystem?.textPrimary || '#000000',
                            backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {heroData.animationType === 'script' && (
                    <div className="space-y-4">
                      <h4 className="font-medium mb-3" style={{ color: designSystem?.textPrimary || '#000000' }}>Custom Script</h4>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: designSystem?.textPrimary || '#000000' }}>
                          JavaScript Code
                        </label>
                        <textarea
                          value={heroData.animationData?.scriptContent || ''}
                          onChange={(e) => setHeroData({
                            ...heroData,
                            animationData: { ...heroData.animationData, scriptContent: e.target.value }
                          })}
                          placeholder="// Your JavaScript code here..."
                          rows={6}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                          style={{ 
                            color: designSystem?.textPrimary || '#000000',
                            backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {heroData.animationType === 'image' && (
                    <div className="space-y-4">
                      <h4 className="font-medium mb-3" style={{ color: designSystem?.textPrimary || '#000000' }}>Image Configuration</h4>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: designSystem?.textPrimary || '#000000' }}>
                          Select Image
                        </label>
                        <MediaSelector
                          onChange={(media) => {
                            const mediaItem = Array.isArray(media) ? media[0] : media;
                            setHeroData({
                              ...heroData,
                              animationData: { 
                                ...heroData.animationData, 
                                imageUrl: mediaItem?.publicUrl || '',
                                imageItem: mediaItem
                              }
                            });
                          }}
                          value={heroData.animationData?.imageItem || null}
                          allowMultiple={false}
                          acceptedTypes={['image']}
                        />
                        <p className="text-xs mt-1" style={{ color: designSystem?.textMuted || '#999999' }}>
                          Choose an image to display in your hero section
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4" style={{ color: designSystem?.textPrimary || '#000000' }}>Call-to-Action Buttons</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3" style={{ color: designSystem?.textPrimary || '#000000' }}>Primary CTA Button</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: designSystem?.textPrimary || '#000000' }}>
                          Select Primary CTA
                        </label>
                        <select
                          value={heroData.primaryCtaId || ''}
                          onChange={(e) => setHeroData({ ...heroData, primaryCtaId: e.target.value ? parseInt(e.target.value) : null })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ 
                            color: designSystem?.textPrimary || '#000000',
                            backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                          }}
                        >
                          <option value="">No Primary CTA</option>
                          {availableCTAs.map(cta => (
                            <option key={cta.id} value={cta.id}>{cta.text}</option>
                          ))}
                        </select>
                      </div>
                      
                      {heroData.primaryCtaId && (
                        <div className="text-sm bg-gray-100 p-3 rounded" style={{ color: designSystem?.textSecondary || '#666666', backgroundColor: designSystem?.backgroundSecondary || '#f9fafb' }}>
                          <strong>Selected:</strong> {getSelectedCTA(heroData.primaryCtaId)?.text}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3" style={{ color: designSystem?.textPrimary || '#000000' }}>Secondary CTA Button</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: designSystem?.textPrimary || '#000000' }}>
                          Select Secondary CTA
                        </label>
                        <select
                          value={heroData.secondaryCtaId || ''}
                          onChange={(e) => setHeroData({ ...heroData, secondaryCtaId: e.target.value ? parseInt(e.target.value) : null })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ 
                            color: designSystem?.textPrimary || '#000000',
                            backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                          }}
                        >
                          <option value="">No Secondary CTA</option>
                          {availableCTAs.map(cta => (
                            <option key={cta.id} value={cta.id}>{cta.text}</option>
                          ))}
                        </select>
                      </div>
                      
                      {heroData.secondaryCtaId && (
                        <div className="text-sm bg-gray-100 p-3 rounded" style={{ color: designSystem?.textSecondary || '#666666', backgroundColor: designSystem?.backgroundSecondary || '#f9fafb' }}>
                          <strong>Selected:</strong> {getSelectedCTA(heroData.secondaryCtaId)?.text}
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
                  <h3 className="text-lg font-semibold" style={{ color: designSystem?.textPrimary || '#000000' }}>Trust Indicators</h3>
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
                  {(heroData.trustIndicators || []).map((indicator, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <GripVertical className="w-4 h-4" style={{ color: designSystem?.textMuted || '#999999' }} />
                        <input
                          type="checkbox"
                          checked={indicator.isVisible}
                          onChange={(e) => updateTrustIndicator(index, 'isVisible', e.target.checked)}
                          className="w-4 h-4 text-[#5243E9] border-gray-300 rounded focus:ring-[#5243E9]"
                        />
                        <div className="flex items-center gap-2" style={{ color: designSystem?.textSecondary || '#666666' }}>
                          {React.createElement(getIconComponent(indicator.iconName), { className: "w-4 h-4" })}
                          <span className="text-sm font-medium">{indicator.text}</span>
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
                          <label className="block text-sm font-medium mb-1" style={{ color: designSystem?.textPrimary || '#000000' }}>
                            Icon
                          </label>
                          <UniversalIconPicker
                            value={indicator.iconName}
                            onChange={(iconName) => updateTrustIndicator(index, 'iconName', iconName)}
                            placeholder="Select an icon..."
                            className="w-full"
                            textPrimary={designSystem?.textPrimary || '#000000'}
                            textSecondary={designSystem?.textSecondary || '#666666'}
                            textMuted={designSystem?.textMuted || '#999999'}
                            backgroundPrimary={designSystem?.backgroundPrimary || '#ffffff'}
                            backgroundSecondary={designSystem?.backgroundSecondary || '#f9fafb'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: designSystem?.textPrimary || '#000000' }}>
                            Text
                          </label>
                          <input
                            type="text"
                            value={indicator.text}
                            onChange={(e) => updateTrustIndicator(index, 'text', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent"
                            placeholder="99.9% Uptime"
                            style={{ 
                              color: designSystem?.textPrimary || '#000000',
                              backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(heroData.trustIndicators || []).length === 0 && (
                    <div className="text-center py-8" style={{ color: designSystem?.textMuted || '#999999' }}>
                      No trust indicators added yet. Click "Add Trust Indicator" to get started.
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

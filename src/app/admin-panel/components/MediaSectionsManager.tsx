'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Image,
  Video,
  Palette,
  Settings,
  Check,
  AlertCircle,
  MessageSquare,
  Users,
  Shield,
  Clock,
  Zap,
  Star,
  Target,
  Layers,
  Globe,
  Heart,
  Sparkles,
  Rocket,
  Award,
  Briefcase,
  Code,
  Database,
  Monitor,
  Smartphone,
  Wifi,
  Lock
} from 'lucide-react';
import dynamic from 'next/dynamic';
import MediaSelector from '@/components/ui/MediaSelector';
import { IconPicker } from '@/components/ui';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { renderIcon } from '@/lib/iconUtils';

// Dynamically import TinyMCE to avoid SSR issues
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => ({ default: mod.Editor })), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
});

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

interface MediaSectionFeature {
  id?: number;
  mediaSectionId?: number;
  icon: string;
  label: string;
  color: string;
  sortOrder: number;
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

interface MediaSection {
  id?: number;
  position: number;
  layoutType: 'media_left' | 'media_right' | 'stacked';
  badgeText?: string;
  badgeColor: string;
  headline: string;
  subheading?: string;
  alignment: 'left' | 'center' | 'right';
  mediaType: 'image' | 'video' | 'animation' | '3d';
  mediaUrl: string;
  mediaItem?: MediaItem;
  mediaAlt?: string;
  mediaSize: 'sm' | 'md' | 'lg' | 'full';
  mediaPosition: 'left' | 'right';
  showBadge: boolean;
  showCtaButton: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaStyle: 'primary' | 'secondary' | 'link';
  enableScrollAnimations: boolean;
  animationType: 'fade' | 'slide' | 'zoom' | 'none' | 'pulse' | 'rotate';
  backgroundStyle: 'solid' | 'gradient' | 'radial' | 'none';
  backgroundColor: string;
  textColor: string;
  paddingTop: number;
  paddingBottom: number;
  containerMaxWidth: 'xl' | '2xl' | 'full';
  isActive: boolean;
  features?: MediaSectionFeature[];
  createdAt?: string;
  updatedAt?: string;
}

const MediaSectionsManager: React.FC = () => {
  const [mediaSections, setMediaSections] = useState<MediaSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<MediaSection | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [availableCTAs, setAvailableCTAs] = useState<CTA[]>([]);
  const { designSystem } = useDesignSystem();

  // Form state
  const [formData, setFormData] = useState<MediaSection>({
    position: 0,
    layoutType: 'media_right',
    badgeText: '',
    badgeColor: '#5243E9',
    headline: '',
    subheading: '',
    alignment: 'left',
    mediaType: 'image',
    mediaUrl: '',
    mediaItem: undefined,
    mediaAlt: '',
    mediaSize: 'md',
    mediaPosition: 'right',
    showBadge: true,
    showCtaButton: false,
    ctaText: '',
    ctaUrl: '',
    ctaStyle: 'primary',
    enableScrollAnimations: false,
    animationType: 'none',
    backgroundStyle: 'solid',
    backgroundColor: '#F6F8FC',
    textColor: '#0F1A2A',
    paddingTop: 80,
    paddingBottom: 80,
    containerMaxWidth: '2xl',
    isActive: true,
    features: []
  });



  // TinyMCE editor configuration for subheading
  const tinymceConfig = {
    height: 200,
    width: '100%',
    menubar: false,
    statusbar: false,
    placeholder: 'Enter your subheading content here...',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'table', 'code', 'help'
    ],
    toolbar: 'undo redo | styles | bold italic underline strikethrough | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | ' +
      'link | ' +
      'spacing-controls | ' +
      'removeformat | help',
    block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Blockquote=blockquote; Preformatted=pre; Code=code',
    style_formats: [
      {title: 'Paragraph', block: 'p'},
      {title: 'Heading 1', block: 'h1'},
      {title: 'Heading 2', block: 'h2'},
      {title: 'Heading 3', block: 'h3'},
      {title: 'Heading 4', block: 'h4'},
      {title: 'Heading 5', block: 'h5'},
      {title: 'Heading 6', block: 'h6'},
      {title: 'Blockquote', block: 'blockquote'},
      {title: 'Preformatted', block: 'pre'},
      {title: 'Code', block: 'code'}
    ],
    link_list: [
      {title: 'Home', value: '/'},
      {title: 'About', value: '/about'},
      {title: 'Contact', value: '/contact'},
      {title: 'Pricing', value: '/pricing'},
      {title: 'FAQ', value: '/faq'}
    ],
    content_style: `
      body { font-family: 'Manrope', system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #374151; }
      h1, h2, h3, h4, h5, h6 { font-weight: 600; margin-bottom: 0.5rem; color: #1f2937; }
      h1 { font-size: 1.875rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      h4 { font-size: 1.125rem; }
      h5 { font-size: 1rem; }
      h6 { font-size: 0.875rem; }
      ul, ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
      li { margin-bottom: 0.25rem; }
      blockquote { border-left: 4px solid #5243E9; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #6b7280; }
      a { color: #5243E9; text-decoration: underline; }
      a:hover { color: #4338CA; }

      
      /* Spacing Classes */
      .margin-xs { margin: 0.25rem !important; }
      .margin-sm { margin: 0.5rem !important; }
      .margin-md { margin: 1rem !important; }
      .margin-lg { margin: 1.5rem !important; }
      .margin-xl { margin: 2rem !important; }
      .margin-2xl { margin: 3rem !important; }
      
      .margin-top-xs { margin-top: 0.25rem !important; }
      .margin-top-sm { margin-top: 0.5rem !important; }
      .margin-top-md { margin-top: 1rem !important; }
      .margin-top-lg { margin-top: 1.5rem !important; }
      .margin-top-xl { margin-top: 2rem !important; }
      .margin-top-2xl { margin-top: 3rem !important; }
      
      .margin-bottom-xs { margin-bottom: 0.25rem !important; }
      .margin-bottom-sm { margin-bottom: 0.5rem !important; }
      .margin-bottom-md { margin-bottom: 1rem !important; }
      .margin-bottom-lg { margin-bottom: 1.5rem !important; }
      .margin-bottom-xl { margin-bottom: 2rem !important; }
      .margin-bottom-2xl { margin-bottom: 3rem !important; }
      
      .margin-left-xs { margin-left: 0.25rem !important; }
      .margin-left-sm { margin-left: 0.5rem !important; }
      .margin-left-md { margin-left: 1rem !important; }
      .margin-left-lg { margin-left: 1.5rem !important; }
      .margin-left-xl { margin-left: 2rem !important; }
      .margin-left-2xl { margin-left: 3rem !important; }
      
      .margin-right-xs { margin-right: 0.25rem !important; }
      .margin-right-sm { margin-right: 0.5rem !important; }
      .margin-right-md { margin-right: 1rem !important; }
      .margin-right-lg { margin-right: 1.5rem !important; }
      .margin-right-xl { margin-right: 2rem !important; }
      .margin-right-2xl { margin-right: 3rem !important; }
      
      .padding-xs { padding: 0.25rem !important; }
      .padding-sm { padding: 0.5rem !important; }
      .padding-md { padding: 1rem !important; }
      .padding-lg { padding: 1.5rem !important; }
      .padding-xl { padding: 2rem !important; }
      .padding-2xl { padding: 3rem !important; }
      
      .padding-top-xs { padding-top: 0.25rem !important; }
      .padding-top-sm { padding-top: 0.5rem !important; }
      .padding-top-md { padding-top: 1rem !important; }
      .padding-top-lg { padding-top: 1.5rem !important; }
      .padding-top-xl { padding-top: 2rem !important; }
      .padding-top-2xl { padding-top: 3rem !important; }
      
      .padding-bottom-xs { padding-bottom: 0.25rem !important; }
      .padding-bottom-sm { padding-bottom: 0.5rem !important; }
      .padding-bottom-md { padding-bottom: 1rem !important; }
      .padding-bottom-lg { padding-bottom: 1.5rem !important; }
      .padding-bottom-xl { padding-bottom: 2rem !important; }
      .padding-bottom-2xl { padding-bottom: 3rem !important; }
      
      .padding-left-xs { padding-left: 0.25rem !important; }
      .padding-left-sm { padding-left: 0.5rem !important; }
      .padding-left-md { padding-left: 1rem !important; }
      .padding-left-lg { padding-left: 1.5rem !important; }
      .padding-left-xl { padding-left: 2rem !important; }
      .padding-left-2xl { padding-left: 3rem !important; }
      
      .padding-right-xs { padding-right: 0.25rem !important; }
      .padding-right-sm { padding-right: 0.5rem !important; }
      .padding-right-md { padding-right: 1rem !important; }
      .padding-right-lg { padding-right: 1.5rem !important; }
      .padding-right-xl { padding-right: 2rem !important; }
      .padding-right-2xl { padding-right: 3rem !important; }
      
      .no-margin { margin: 0 !important; }
      .no-padding { padding: 0 !important; }
    `
  };

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

  // Color Picker Component
  const ColorPicker: React.FC<{
    label: string;
    value: string;
    onChange: (color: string) => void;
    allowTransparent?: boolean;
  }> = ({ label, value, onChange, allowTransparent = false }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [customColor, setCustomColor] = useState(value.startsWith('#') ? value : '#000000');
    const designSystemColors = getDesignSystemColors();

    const presetColors = [
      ...designSystemColors,
      { name: 'White', value: '#FFFFFF', description: 'White' },
      { name: 'Black', value: '#000000', description: 'Black' },
    ];

    if (allowTransparent) {
      presetColors.push({ name: 'Transparent', value: 'transparent', description: 'Transparent' });
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
            style={{ backgroundColor: value }}
          >
            {value === 'transparent' && (
              <div className="w-full h-full bg-checkerboard rounded-lg" />
            )}
          </button>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            placeholder="#000000"
          />
        </div>

        {showPicker && (
          <div className="absolute top-full left-0 z-50 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg min-w-64">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Design System Colors</label>
                <div className="grid grid-cols-4 gap-2">
                  {designSystemColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => handlePresetClick(color.value)}
                      className="w-8 h-8 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Custom Color</label>
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Fetch media sections
  const fetchMediaSections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/media-sections');
      const result = await response.json();
      
      if (result.success) {
        setMediaSections(result.data || []);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch media sections');
      }
    } catch (err) {
      console.error('Failed to fetch media sections:', err);
      setError('Failed to fetch media sections');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available CTAs
  const fetchAvailableCTAs = async () => {
    try {
      const response = await fetch('/api/admin/cta-buttons');
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAvailableCTAs(result.data.filter((cta: CTA) => cta.isActive));
        } else {
          setAvailableCTAs([]);
        }
      } else {
        setAvailableCTAs([]);
      }
    } catch (error) {
      console.error('Error fetching CTAs:', error);
      setAvailableCTAs([]);
    }
  };

  // Get icon component for display
  const getIconComponent = (iconName: string | undefined | null) => {
    // Safety check for non-string values
    if (!iconName || typeof iconName !== 'string') {
      return MessageSquare;
    }
    
    // Handle new universal icon format (library:iconName)
    if (iconName.includes(':')) {
      const [library, icon] = iconName.split(':');
      
      // Return a component that renders the universal icon
      const IconComponent = (props: any) => {
        try {
        return renderIcon(iconName, props);
        } catch (error) {
          console.warn(`Failed to render icon ${iconName}:`, error);
          return null;
        }
      };
      return IconComponent;
    }
    
    // Fallback to old format for backward compatibility
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      MessageSquare,
      Users,
      Shield,
      Clock,
      Zap,
      Star,
      Target,
      Layers,
      Globe,
      Heart,
      Sparkles,
      Rocket,
      Award,
      Briefcase,
      Code,
      Database,
      Monitor,
      Smartphone,
      Wifi,
      Lock
    };
    return iconMap[iconName] || MessageSquare;
  };

  // Get icon category color
  const getIconCategoryColor = (iconName: string | undefined | null) => {
    // Safety check for non-string values
    if (!iconName || typeof iconName !== 'string') {
      return 'text-gray-600';
    }
    
    // Map icons to their categories
    const iconCategories: { [key: string]: string } = {
      MessageSquare: 'communication',
      Users: 'social',
      Shield: 'security',
      Clock: 'time',
      Zap: 'special',
      Star: 'social',
      Target: 'business',
      Layers: 'design',
      Globe: 'navigation',
      Heart: 'social',
      Sparkles: 'special',
      Rocket: 'special',
      Award: 'business',
      Briefcase: 'business',
      Code: 'technology',
      Database: 'technology',
      Monitor: 'technology',
      Smartphone: 'technology',
      Wifi: 'technology',
      Lock: 'security'
    };

    const category = iconCategories[iconName] || 'actions';
    
    switch (category) {
      case 'actions': return 'text-blue-600';
      case 'arrows': return 'text-gray-600';
      case 'media': return 'text-purple-600';
      case 'communication': return 'text-green-600';
      case 'navigation': return 'text-indigo-600';
      case 'business': return 'text-emerald-600';
      case 'technology': return 'text-cyan-600';
      case 'social': return 'text-pink-600';
      case 'status': return 'text-orange-600';
      case 'time': return 'text-yellow-600';
      case 'files': return 'text-slate-600';
      case 'security': return 'text-red-600';
      case 'tools': return 'text-amber-600';
      case 'special': return 'text-violet-600';
      case 'weather': return 'text-sky-600';
      case 'design': return 'text-rose-600';
      case 'productivity': return 'text-lime-600';
      case 'gaming': return 'text-fuchsia-600';
      case 'health': return 'text-teal-600';
      case 'transport': return 'text-blue-500';
      case 'food': return 'text-orange-500';
      case 'development': return 'text-gray-700';
      default: return 'text-gray-600';
    }
  };

  useEffect(() => {
    fetchMediaSections();
    fetchAvailableCTAs();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingSection ? 'PUT' : 'POST';
      const url = '/api/admin/media-sections';
      const payload = editingSection ? { id: editingSection.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchMediaSections();
        resetForm();
        alert(`Media section ${editingSection ? 'updated' : 'created'} successfully!`);
      } else {
        alert(result.message || `Failed to ${editingSection ? 'update' : 'create'} media section`);
      }
    } catch (error) {
      console.error('Failed to save media section:', error);
      alert('An error occurred while saving the media section');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this media section?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/media-sections?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchMediaSections();
        alert('Media section deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete media section');
      }
    } catch (error) {
      console.error('Failed to delete media section:', error);
      alert('An error occurred while deleting the media section');
    }
  };

  // Add feature to section
  const addFeature = () => {
    const newFeature: MediaSectionFeature = {
      icon: 'MessageSquare',
      label: '',
      color: '#5243E9',
      sortOrder: formData.features?.length || 0
    };
    
    setFormData({
      ...formData,
      features: [...(formData.features || []), newFeature]
    });
  };

  // Remove feature from section
  const removeFeature = (index: number) => {
    const updatedFeatures = formData.features?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };

  // Update feature
  const updateFeature = (index: number, field: keyof MediaSectionFeature, value: any) => {
    const updatedFeatures = [...(formData.features || [])];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      position: 0,
      layoutType: 'media_right',
      badgeText: '',
      badgeColor: '#5243E9',
      headline: '',
      subheading: '',
      alignment: 'left',
      mediaType: 'image',
      mediaUrl: '',
      mediaItem: undefined,
      mediaAlt: '',
      mediaSize: 'md',
      mediaPosition: 'right',
      showBadge: true,
      showCtaButton: false,
      ctaText: '',
      ctaUrl: '',
      ctaStyle: 'primary',
      enableScrollAnimations: false,
      animationType: 'none',
      backgroundStyle: 'solid',
      backgroundColor: '#F6F8FC',
      textColor: '#0F1A2A',
      paddingTop: 80,
      paddingBottom: 80,
      containerMaxWidth: '2xl',
      isActive: true,
      features: []
    });
    setEditingSection(null);
    setIsFormOpen(false);
  };

  // Start editing
  const startEdit = (section: MediaSection) => {
    setFormData({ ...section });
    setEditingSection(section);
    setIsFormOpen(true);
  };

  // Toggle section expansion
  const toggleExpanded = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // YouTube URL Input for Video Type
  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading media sections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Media Sections</h2>
          <p className="text-gray-600 mt-1">Manage video, support, and conversation sections</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Media Section
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Media Sections List */}
      <div className="space-y-4">
        {mediaSections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No media sections yet</h3>
            <p className="text-gray-500 mb-4">Create your first media section to get started</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Media Section
            </button>
          </div>
        ) : (
          mediaSections.map((section) => (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: section.badgeColor }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{section.headline}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="capitalize">{section.mediaType}</span>
                      <span className="capitalize">{section.layoutType.replace('_', ' ')}</span>
                      {section.mediaType === 'video' && (section.mediaUrl.includes('youtube.com') || section.mediaUrl.includes('youtu.be')) && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          <Video className="w-3 h-3" />
                          YouTube
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        section.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpanded(section.id!)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {expandedSections.has(section.id!) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(section)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id!)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedSections.has(section.id!) && (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Media URL:</span>
                      {section.mediaType === 'video' && (section.mediaUrl.includes('youtube.com') || section.mediaUrl.includes('youtu.be')) ? (
                        <div className="space-y-1">
                          <p className="text-gray-600 truncate">{section.mediaUrl}</p>
                          <p className="text-xs text-blue-600">
                            Video ID: {getVideoId(section.mediaUrl)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600 truncate">{section.mediaUrl}</p>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Background:</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: section.backgroundColor }}
                        />
                        <span className="text-gray-600">{section.backgroundColor}</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Padding:</span>
                      <p className="text-gray-600">{section.paddingTop}px / {section.paddingBottom}px</p>
                    </div>
                  </div>

                  {/* Features */}
                  {section.features && section.features.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Features ({section.features.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {section.features.map((feature, index) => {
                          const IconComponent = getIconComponent(feature.icon);
                          return (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              {IconComponent ? (
                              <IconComponent 
                                className={`w-4 h-4 ${getIconCategoryColor(feature.icon)}`}
                              />
                              ) : (
                                <div className="w-4 h-4 bg-gray-300 rounded" />
                              )}
                              <span className="text-sm text-gray-700">{feature.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingSection ? 'Edit Media Section' : 'Create Media Section'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Headline *
                    </label>
                    <div className="relative">
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                      required
                        maxLength={200}
                    />
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs text-gray-500">
                        {(formData.headline?.length || 0)}/200
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="number"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subheading (Rich Text Editor)
                  </label>
                  <div className="border border-gray-300 rounded-lg w-full">
                    <Editor
                      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || process.env.TINYMCE_API_KEY}
                    value={formData.subheading}
                      onEditorChange={(content) => setFormData({...formData, subheading: content})}
                      init={{
                        ...tinymceConfig,
                        setup: (editor: any) => {
                          
                          // Character count validation
                          editor.on('keydown', (e: any) => {
                            const content = editor.getContent();
                            const charCount = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length;
                            
                            // Allow backspace, delete, arrow keys, etc.
                            if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
                              return;
                            }
                            
                            // Prevent typing if character limit is reached
                            if (charCount >= 1200) {
                              e.preventDefault();
                              return false;
                            }
                          });
                          
                          // Helper function to apply spacing classes
                          const applySpacingClass = (className: string, type: 'margin' | 'padding') => {
                            const selectedNode = editor.selection.getNode();
                            if (selectedNode.nodeType === 1) {
                              // Remove all existing spacing classes of the same type
                              const allClasses = type === 'margin' 
                                ? ['no-margin', 'margin-xs', 'margin-sm', 'margin-md', 'margin-lg', 'margin-xl', 'margin-2xl', 'margin-top-xs', 'margin-top-sm', 'margin-top-md', 'margin-top-lg', 'margin-top-xl', 'margin-top-2xl', 'margin-bottom-xs', 'margin-bottom-sm', 'margin-bottom-md', 'margin-bottom-lg', 'margin-bottom-xl', 'margin-bottom-2xl', 'margin-left-xs', 'margin-left-sm', 'margin-left-md', 'margin-left-lg', 'margin-left-xl', 'margin-left-2xl', 'margin-right-xs', 'margin-right-sm', 'margin-right-md', 'margin-right-lg', 'margin-right-xl', 'margin-right-2xl']
                                : ['no-padding', 'padding-xs', 'padding-sm', 'padding-md', 'padding-lg', 'padding-xl', 'padding-2xl', 'padding-top-xs', 'padding-top-sm', 'padding-top-md', 'padding-top-lg', 'padding-top-xl', 'padding-top-2xl', 'padding-bottom-xs', 'padding-bottom-sm', 'padding-bottom-md', 'padding-bottom-lg', 'padding-bottom-xl', 'padding-bottom-2xl', 'padding-left-xs', 'padding-left-sm', 'padding-left-md', 'padding-left-lg', 'padding-left-xl', 'padding-left-2xl', 'padding-right-xs', 'padding-right-sm', 'padding-right-md', 'padding-right-lg', 'padding-right-xl', 'padding-right-2xl'];
                              
                              allClasses.forEach(cls => selectedNode.classList.remove(cls));
                              selectedNode.classList.add(className);
                              
                              editor.fire('change'); // Trigger change event
                            }
                          };

                          // Helper function to remove all spacing classes
                          const removeAllSpacing = () => {
                            const selectedNode = editor.selection.getNode();
                            if (selectedNode.nodeType === 1) {
                              const allSpacingClasses = [
                                'no-margin', 'margin-xs', 'margin-sm', 'margin-md', 'margin-lg', 'margin-xl', 'margin-2xl', 
                                'margin-top-xs', 'margin-top-sm', 'margin-top-md', 'margin-top-lg', 'margin-top-xl', 'margin-top-2xl', 
                                'margin-bottom-xs', 'margin-bottom-sm', 'margin-bottom-md', 'margin-bottom-lg', 'margin-bottom-xl', 'margin-bottom-2xl', 
                                'margin-left-xs', 'margin-left-sm', 'margin-left-md', 'margin-left-lg', 'margin-left-xl', 'margin-left-2xl', 
                                'margin-right-xs', 'margin-right-sm', 'margin-right-md', 'margin-right-lg', 'margin-right-xl', 'margin-right-2xl',
                                'no-padding', 'padding-xs', 'padding-sm', 'padding-md', 'padding-lg', 'padding-xl', 'padding-2xl', 
                                'padding-top-xs', 'padding-top-sm', 'padding-top-md', 'padding-top-lg', 'padding-top-xl', 'padding-top-2xl', 
                                'padding-bottom-xs', 'padding-bottom-sm', 'padding-bottom-md', 'padding-bottom-lg', 'padding-bottom-xl', 'padding-bottom-2xl', 
                                'padding-left-xs', 'padding-left-sm', 'padding-left-md', 'padding-left-lg', 'padding-left-xl', 'padding-left-2xl', 
                                'padding-right-xs', 'padding-right-sm', 'padding-right-md', 'padding-right-lg', 'padding-right-xl', 'padding-right-2xl'
                              ];
                              
                              allSpacingClasses.forEach(cls => selectedNode.classList.remove(cls));
                              
                              editor.fire('change'); // Trigger change event
                            }
                          };
                          
                          // Add spacing controls to toolbar
                          editor.ui.registry.addMenuButton('spacing-controls', {
                            text: 'Spacing',
                            fetch: function (callback: any) {
                              const items = [
                                { type: 'menuitem', text: 'Remove All Spacing', onAction: removeAllSpacing },
                                { type: 'separator' },
                                {
                                  type: 'menuitem',
                                  text: 'Margins',
                                  getSubmenuItems: function () {
                                    return [
                                      { type: 'menuitem', text: 'No Margin', onAction: () => applySpacingClass('no-margin', 'margin') },
                                      { type: 'separator' },
                                      { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('margin-xs', 'margin') },
                                      { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('margin-sm', 'margin') },
                                      { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('margin-md', 'margin') },
                                      { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('margin-lg', 'margin') },
                                      { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('margin-xl', 'margin') },
                                      { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('margin-2xl', 'margin') }
                                    ];
                                  }
                                },
                                {
                                  type: 'menuitem',
                                  text: 'Padding',
                                  getSubmenuItems: function () {
                                    return [
                                      { type: 'menuitem', text: 'No Padding', onAction: () => applySpacingClass('no-padding', 'padding') },
                                      { type: 'separator' },
                                      { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('padding-xs', 'padding') },
                                      { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('padding-sm', 'padding') },
                                      { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('padding-md', 'padding') },
                                      { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('padding-lg', 'padding') },
                                      { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('padding-xl', 'padding') },
                                      { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('padding-2xl', 'padding') }
                                    ];
                                  }
                                },
                                { type: 'separator' },
                                {
                                  type: 'menuitem',
                                  text: 'Top Margin',
                                  getSubmenuItems: function () {
                                    return [
                                      { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('margin-top-xs', 'margin') },
                                      { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('margin-top-sm', 'margin') },
                                      { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('margin-top-md', 'margin') },
                                      { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('margin-top-lg', 'margin') },
                                      { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('margin-top-xl', 'margin') },
                                      { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('margin-top-2xl', 'margin') }
                                    ];
                                  }
                                },
                                {
                                  type: 'menuitem',
                                  text: 'Bottom Margin',
                                  getSubmenuItems: function () {
                                    return [
                                      { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('margin-bottom-xs', 'margin') },
                                      { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('margin-bottom-sm', 'margin') },
                                      { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('margin-bottom-md', 'margin') },
                                      { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('margin-bottom-lg', 'margin') },
                                      { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('margin-bottom-xl', 'margin') },
                                      { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('margin-bottom-2xl', 'margin') }
                                    ];
                                  }
                                },
                                {
                                  type: 'menuitem',
                                  text: 'Left Margin',
                                  getSubmenuItems: function () {
                                    return [
                                      { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('margin-left-xs', 'margin') },
                                      { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('margin-left-sm', 'margin') },
                                      { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('margin-left-md', 'margin') },
                                      { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('margin-left-lg', 'margin') },
                                      { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('margin-left-xl', 'margin') },
                                      { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('margin-left-2xl', 'margin') }
                                    ];
                                  }
                                },
                                {
                                  type: 'menuitem',
                                  text: 'Right Margin',
                                  getSubmenuItems: function () {
                                    return [
                                      { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('margin-right-xs', 'margin') },
                                      { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('margin-right-sm', 'margin') },
                                      { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('margin-right-md', 'margin') },
                                      { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('margin-right-lg', 'margin') },
                                      { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('margin-right-xl', 'margin') },
                                      { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('margin-right-2xl', 'margin') }
                                    ];
                                  }
                                },
                                { type: 'separator' },
                                {
                                  type: 'menuitem',
                                  text: 'Top Padding',
                                  getSubmenuItems: function () {
                                    return [
                                      { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('padding-top-xs', 'padding') },
                                      { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('padding-top-sm', 'padding') },
                                      { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('padding-top-md', 'padding') },
                                      { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('padding-top-lg', 'padding') },
                                      { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('padding-top-xl', 'padding') },
                                      { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('padding-top-2xl', 'padding') }
                                    ];
                                  }
                                },
                                {
                                  type: 'menuitem',
                                  text: 'Bottom Padding',
                                  getSubmenuItems: function () {
                                    return [
                                      { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('padding-bottom-xs', 'padding') },
                                      { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('padding-bottom-sm', 'padding') },
                                      { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('padding-bottom-md', 'padding') },
                                      { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('padding-bottom-lg', 'padding') },
                                      { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('padding-bottom-xl', 'padding') },
                                      { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('padding-bottom-2xl', 'padding') }
                                    ];
                                  }
                                },
                                {
                                  type: 'menuitem',
                                  text: 'Left Padding',
                                  getSubmenuItems: function () {
                                    return [
                                      { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('padding-left-xs', 'padding') },
                                      { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('padding-left-sm', 'padding') },
                                      { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('padding-left-md', 'padding') },
                                      { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('padding-left-lg', 'padding') },
                                      { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('padding-left-xl', 'padding') },
                                      { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('padding-left-2xl', 'padding') }
                                    ];
                                  }
                                },
                                {
                                  type: 'menuitem',
                                  text: 'Right Padding',
                                  getSubmenuItems: function () {
                                    return [
                                      { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('padding-right-xs', 'padding') },
                                      { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('padding-right-sm', 'padding') },
                                      { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('padding-right-md', 'padding') },
                                      { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('padding-right-lg', 'padding') },
                                      { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('padding-right-xl', 'padding') },
                                      { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('padding-right-2xl', 'padding') }
                                    ];
                                  }
                                }
                              ];
                              callback(items);
                            }
                          });
                        }
                      }}
                    />
                  </div>
                  <div className={`mt-2 text-xs ${
                    (formData.subheading?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length || 0) > 1200 
                      ? 'text-red-500' 
                      : (formData.subheading?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length || 0) > 1000 
                        ? 'text-orange-500' 
                        : 'text-gray-500'
                  }`}>
                    Character count: {(formData.subheading?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length || 0)}/1200
                    {(formData.subheading?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length || 0) > 1200 && (
                      <span className="ml-2 font-medium">(Limit exceeded!)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Badge Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Badge Configuration
                </h4>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.showBadge}
                      onChange={(e) => setFormData({ ...formData, showBadge: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Badge</span>
                  </label>
                </div>

                {formData.showBadge && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={formData.badgeText}
                        onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <ColorPicker
                        label="Badge Color"
                        value={formData.badgeColor}
                        onChange={(color) => setFormData({ ...formData, badgeColor: color })}
                        allowTransparent={false}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Media Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Media Configuration
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Media Type
                    </label>
                    <select
                      value={formData.mediaType}
                      onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="animation">Animation</option>
                      <option value="3d">3D</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Media Size
                    </label>
                    <select
                      value={formData.mediaSize}
                      onChange={(e) => setFormData({ ...formData, mediaSize: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Layout Type
                    </label>
                    <select
                      value={formData.layoutType}
                      onChange={(e) => setFormData({ ...formData, layoutType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="media_left">Media Left</option>
                      <option value="media_right">Media Right</option>
                      <option value="stacked">Stacked</option>
                    </select>
                  </div>
                </div>

                <div>
                  <MediaSelector
                    label="Media"
                    value={formData.mediaItem || null}
                    onChange={(media) => {
                      const mediaItem = Array.isArray(media) ? media[0] : media;
                      setFormData({ 
                        ...formData, 
                        mediaItem: mediaItem || undefined,
                        mediaUrl: mediaItem?.publicUrl || ''
                      });
                    }}
                    allowMultiple={false}
                    acceptedTypes={formData.mediaType === 'image' ? ['image'] : formData.mediaType === 'video' ? ['video'] : ['image', 'video']}
                    placeholder="Select media from library or upload new"
                    required
                  />
                </div>

                {/* YouTube URL Input for Video Type */}
                {formData.mediaType === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube URL (Alternative)
                    </label>
                    <input
                      type="url"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a YouTube URL directly (supports watch URLs, short URLs, and embed URLs)
                    </p>
                    
                    {/* YouTube Preview */}
                    {formData.mediaUrl && (formData.mediaUrl.includes('youtube.com') || formData.mediaUrl.includes('youtu.be')) && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preview
                        </label>
                        <div className="relative w-full max-w-md pb-[56.25%] h-0 overflow-hidden rounded-lg border border-gray-200">
                          <iframe
                            src={`https://www.youtube.com/embed/${getVideoId(formData.mediaUrl)}`}
                            title="YouTube Preview"
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.mediaAlt}
                    onChange={(e) => setFormData({ ...formData, mediaAlt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Features ({formData.features?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Feature
                  </button>
                </div>

                {formData.features && formData.features.length > 0 && (
                  <div className="space-y-4">
                    {formData.features.map((feature, index) => {
                      const IconComponent = getIconComponent(feature.icon);
                      return (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div className="md:col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Icon
                              </label>
                              <div onClick={(e) => e.stopPropagation()}>
                                <IconPicker
                                  value={feature.icon}
                                  onChange={(iconName) => updateFeature(index, 'icon', iconName)}
                                  placeholder="Select icon"
                                  className="w-full"
                                />
                              </div>
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Feature Label
                              </label>
                              <input
                                type="text"
                                value={feature.label}
                                onChange={(e) => updateFeature(index, 'label', e.target.value)}
                                placeholder="Enter feature description"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div className="md:col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color
                              </label>
                              <ColorPicker
                                label=""
                                value={feature.color}
                                onChange={(color) => updateFeature(index, 'color', color)}
                                allowTransparent={false}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              {IconComponent ? (
                              <IconComponent className={`w-4 h-4 ${getIconCategoryColor(feature.icon)}`} />
                              ) : (
                                <div className="w-4 h-4 bg-gray-300 rounded" />
                              )}
                              <span className="text-sm text-gray-600">{feature.label || 'Preview'}</span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove feature"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CTA Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Call-to-Action
                </h4>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.showCtaButton}
                      onChange={(e) => setFormData({ ...formData, showCtaButton: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Show CTA Button</span>
                  </label>
                </div>

                {formData.showCtaButton && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select CTA from Library
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          const selectedCTA = availableCTAs.find(cta => cta.id === parseInt(e.target.value));
                          if (selectedCTA) {
                            setFormData({
                              ...formData,
                              ctaText: selectedCTA.text,
                              ctaUrl: selectedCTA.url,
                              ctaStyle: selectedCTA.style as 'primary' | 'secondary' | 'link'
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a CTA from library...</option>
                        {availableCTAs.map(cta => (
                          <option key={cta.id} value={cta.id}>
                            {cta.text} ({cta.url})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose from existing CTAs or customize below
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CTA Text
                        </label>
                        <input
                          type="text"
                          value={formData.ctaText}
                          onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CTA URL
                        </label>
                        <input
                          type="text"
                          value={formData.ctaUrl}
                          onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com, /page, or #section"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter a full URL, relative path, or anchor link (e.g., #pricing, #contact)
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CTA Style
                        </label>
                        <select
                          value={formData.ctaStyle}
                          onChange={(e) => setFormData({ ...formData, ctaStyle: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                          <option value="link">Link</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Styling Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Styling & Layout
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alignment
                    </label>
                    <select
                      value={formData.alignment}
                      onChange={(e) => setFormData({ ...formData, alignment: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Style
                    </label>
                    <select
                      value={formData.backgroundStyle}
                      onChange={(e) => setFormData({ ...formData, backgroundStyle: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="solid">Solid</option>
                      <option value="gradient">Gradient</option>
                      <option value="radial">Radial</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Animation Type
                    </label>
                    <select
                      value={formData.animationType}
                      onChange={(e) => setFormData({ ...formData, animationType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="zoom">Zoom</option>
                      <option value="pulse">Pulse</option>
                      <option value="rotate">Rotate</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Container Width
                    </label>
                    <select
                      value={formData.containerMaxWidth}
                      onChange={(e) => setFormData({ ...formData, containerMaxWidth: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="xl">XL</option>
                      <option value="2xl">2XL</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <ColorPicker
                      label="Background Color"
                      value={formData.backgroundColor}
                      onChange={(color) => setFormData({ ...formData, backgroundColor: color })}
                      allowTransparent={true}
                    />
                  </div>
                  
                  <div>
                    <ColorPicker
                      label="Text Color"
                      value={formData.textColor}
                      onChange={(color) => setFormData({ ...formData, textColor: color })}
                      allowTransparent={false}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Padding Top (px)
                    </label>
                    <input
                      type="number"
                      value={formData.paddingTop}
                      onChange={(e) => setFormData({ ...formData, paddingTop: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="200"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="200"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.enableScrollAnimations}
                      onChange={(e) => setFormData({ ...formData, enableScrollAnimations: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Scroll Animations</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingSection ? 'Update' : 'Create'} Media Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSectionsManager; 

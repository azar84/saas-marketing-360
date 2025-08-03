'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { useAdminApi as useApi } from '@/hooks/useApi';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import MediaSelector from '@/components/ui/MediaSelector';
import UniversalIconPicker from '@/components/ui/UniversalIconPicker';

// Color Picker Component
interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (color: string) => void;
  allowTransparent?: boolean;
  designSystem?: any;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, allowTransparent = false, designSystem }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState((value || '#000000').startsWith('#') ? value || '#000000' : '#000000');

  const presetColors = [
    { name: 'Primary', value: designSystem?.primaryColor || '#5243E9' },
    { name: 'Primary Light', value: designSystem?.primaryColorLight || '#7C3AED' },
    { name: 'Primary Dark', value: designSystem?.primaryColorDark || '#3730A3' },
    { name: 'Secondary', value: designSystem?.secondaryColor || '#7C3AED' },
    { name: 'Accent', value: designSystem?.accentColor || '#06B6D4' },
    { name: 'Success', value: designSystem?.successColor || '#10B981' },
    { name: 'Warning', value: designSystem?.warningColor || '#F59E0B' },
    { name: 'Error', value: designSystem?.errorColor || '#EF4444' },
    { name: 'Info', value: designSystem?.infoColor || '#3B82F6' },
    { name: 'Text Primary', value: designSystem?.textPrimary || '#1F2937' },
    { name: 'Text Secondary', value: designSystem?.textSecondary || '#6B7280' },
    { name: 'Text Muted', value: designSystem?.textMuted || '#9CA3AF' },
    { name: 'Background Primary', value: designSystem?.backgroundPrimary || '#FFFFFF' },
    { name: 'Background Secondary', value: designSystem?.backgroundSecondary || '#F9FAFB' },
    { name: 'Gray Light', value: designSystem?.grayLight || '#F3F4F6' },
    { name: 'Gray Medium', value: designSystem?.grayMedium || '#9CA3AF' },
    { name: 'Gray Dark', value: designSystem?.grayDark || '#374151' },
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

  const currentValue = value || '#1F2937';

  return (
    <div className="relative">
      <label 
        className="block text-sm font-medium mb-2"
        style={{ color: designSystem?.textPrimary || '#000000' }}
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-10 h-10 border-2 border-gray-300 rounded-lg shadow-sm hover:border-gray-400 transition-colors"
          style={{ backgroundColor: currentValue === 'transparent' ? (designSystem?.grayLight || '#f3f4f6') : currentValue }}
        >
          {currentValue === 'transparent' && (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
              T
            </div>
          )}
        </button>
        <input
          type="text"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="#1F2937 or transparent"
                      style={{ 
              color: designSystem?.textPrimary || '#1F2937',
              backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
            }}
        />
      </div>

      {showPicker && (
        <div 
          className="absolute top-full left-0 mt-2 p-4 border border-gray-200 rounded-lg shadow-lg z-50 min-w-80"
          style={{ backgroundColor: designSystem?.backgroundPrimary || '#ffffff' }}
        >
          <div className="mb-4">
            <h4 
              className="text-sm font-medium mb-2"
              style={{ color: designSystem?.textPrimary || '#000000' }}
            >
              Design System Colors
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handlePresetClick(color.value)}
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ 
                    backgroundColor: designSystem?.backgroundSecondary || '#f9fafb',
                    color: designSystem?.textPrimary || '#000000'
                  }}
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
                  <span 
                    className="text-xs text-center leading-tight"
                    style={{ color: designSystem?.textSecondary || '#6B7280' }}
                  >
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t pt-4" style={{ borderColor: designSystem?.grayLight || '#f3f4f6' }}>
            <h4 
              className="text-sm font-medium mb-2"
              style={{ color: designSystem?.textPrimary || '#000000' }}
            >
              Custom Color
            </h4>
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#000000"
                style={{ 
                  color: designSystem?.textPrimary || '#000000',
                  backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TeamMember {
  id?: number;
  teamSectionId: number;
  name: string;
  position: string;
  bio?: string;
  photoUrl?: string;
  photoAlt?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

interface TeamSection {
  id?: number;
  name: string;
  heading: string;
  subheading?: string;
  layoutType: 'grid' | 'staggered' | 'list';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundOverlay?: string;
  headingColor?: string;
  subheadingColor?: string;
  cardBackgroundColor?: string;
  photoBackgroundColor?: string;
  nameColor?: string;
  positionColor?: string;
  bioColor?: string;
  socialTextColor?: string;
  socialBackgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
  containerMaxWidth: 'xl' | '2xl' | 'full';
  isActive: boolean;
  teamMembers?: TeamMember[];
  _count?: {
    teamMembers: number;
    pageSections: number;
  };
}

interface TeamMemberFormData {
  name: string;
  position: string;
  bio: string;
  photoUrl: string;
  photoAlt: string;
  email: string;
  phone?: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  websiteUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const TeamSectionsManager: React.FC = () => {
  const api = useApi();
  const { designSystem } = useDesignSystem();
  const [teamSections, setTeamSections] = useState<TeamSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form data
  const [formData, setFormData] = useState<TeamSection>({
    name: '',
    heading: '',
    subheading: '',
    layoutType: 'grid',
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundSize: 'cover',
    backgroundOverlay: '',
    headingColor: '#000000',
    subheadingColor: '#666666',
    cardBackgroundColor: '#ffffff',
    photoBackgroundColor: '#f3f4f6',
    nameColor: '#000000',
    positionColor: '#666666',
    bioColor: '#333333',
    socialTextColor: '#000000',
    socialBackgroundColor: '#f3f4f6',
    paddingTop: 96,
    paddingBottom: 96,
    containerMaxWidth: 'xl',
    isActive: true
  });

  const [memberFormData, setMemberFormData] = useState<TeamMemberFormData>({
    name: '',
    position: '',
    bio: '',
    photoUrl: '',
    photoAlt: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    twitterUrl: '',
    githubUrl: '',
    websiteUrl: '',
    sortOrder: 0,
    isActive: true
  });

  const fetchTeamSections = async () => {
    try {
      const result = await api.get('/api/admin/team-sections') as any;
      if (result.success) {
        setTeamSections(result.data);
      }
    } catch (error) {
      console.error('Error fetching team sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamSections();
  }, []);

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);



  const handleInputChange = (field: keyof TeamSection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberInputChange = (field: keyof TeamMemberFormData, value: any) => {
    setMemberFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      heading: '',
      subheading: '',
      layoutType: 'grid',
      backgroundColor: '#ffffff',
      backgroundImage: '',
      backgroundSize: 'cover',
      backgroundOverlay: '',
      headingColor: '#000000',
      subheadingColor: '#666666',
      cardBackgroundColor: '#ffffff',
      photoBackgroundColor: '#f3f4f6',
      nameColor: '#000000',
      positionColor: '#666666',
      bioColor: '#333333',
      socialTextColor: '#000000',
      socialBackgroundColor: '#f3f4f6',
      paddingTop: 96,
      paddingBottom: 96,
      containerMaxWidth: 'xl',
      isActive: true
    });
    setIsCreating(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const resetMemberForm = () => {
    setMemberFormData({
      name: '',
      position: '',
      bio: '',
      photoUrl: '',
      photoAlt: '',
      email: '',
      phone: '',
      linkedinUrl: '',
      twitterUrl: '',
      githubUrl: '',
      websiteUrl: '',
      sortOrder: 0,
      isActive: true
    });
    setShowMemberForm(false);
    setEditingMemberId(null);
  };

  const resetMemberFormData = () => {
    setMemberFormData({
      name: '',
      position: '',
      bio: '',
      photoUrl: '',
      photoAlt: '',
      email: '',
      phone: '',
      linkedinUrl: '',
      twitterUrl: '',
      githubUrl: '',
      websiteUrl: '',
      sortOrder: 0,
      isActive: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage(null);

    try {
      let response;
      if (isEditing && editingId) {
        // Update existing team section
        response = await api.put('/api/admin/team-sections', {
          id: editingId,
          ...formData
        }) as any;
      } else {
        // Create new team section
        response = await api.post('/api/admin/team-sections', formData) as any;
      }
      
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: isEditing ? 'Team section updated successfully!' : 'Team section created successfully!' 
        });
        resetForm();
        fetchTeamSections();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to save team section' });
      }
    } catch (error) {
      console.error('Error saving team section:', error);
      setMessage({ type: 'error', text: 'Failed to save team section' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    // Prevent form submission if the target is within a MediaSelector
    const target = e.target as HTMLElement;
    if (target.closest('[data-media-selector]')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    handleSubmit(e);
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSectionId) return;

    try {
      if (editingMemberId) {
        const result = await api.put('/api/admin/team-members', {
          id: editingMemberId,
          teamSectionId: selectedSectionId,
          ...memberFormData
        }) as any;
        if (result.success) {
          await fetchTeamSections();
          resetMemberForm();
          setShowMemberForm(false);
          setMessage({ type: 'success', text: 'Team member updated successfully!' });
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update team member' });
        }
      } else {
        const result = await api.post('/api/admin/team-members', {
          teamSectionId: selectedSectionId,
          ...memberFormData
        }) as any;
        if (result.success) {
          await fetchTeamSections();
          resetMemberForm();
          setShowMemberForm(false);
          setMessage({ type: 'success', text: 'Team member created successfully!' });
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to create team member' });
        }
      }
    } catch (error) {
      console.error('Error saving team member:', error);
      setMessage({ type: 'error', text: 'Error saving team member' });
    }
  };

  const handleEdit = (section: TeamSection) => {
    setFormData({
      name: section.name || '',
      heading: section.heading || '',
      subheading: section.subheading || '',
      layoutType: section.layoutType || 'grid',
      backgroundColor: section.backgroundColor || '#ffffff',
      backgroundImage: section.backgroundImage || '',
      backgroundSize: section.backgroundSize || 'cover',
      backgroundOverlay: section.backgroundOverlay || '',
      headingColor: section.headingColor || '#000000',
      subheadingColor: section.subheadingColor || '#666666',
      cardBackgroundColor: section.cardBackgroundColor || '#ffffff',
      photoBackgroundColor: section.photoBackgroundColor || '#f3f4f6',
      nameColor: section.nameColor || '#000000',
      positionColor: section.positionColor || '#666666',
      bioColor: section.bioColor || '#333333',
      socialTextColor: section.socialTextColor || '#000000',
      socialBackgroundColor: section.socialBackgroundColor || '#f3f4f6',
      paddingTop: section.paddingTop || 96,
      paddingBottom: section.paddingBottom || 96,
      containerMaxWidth: section.containerMaxWidth || 'xl',
      isActive: section.isActive !== undefined ? section.isActive : true
    });
    setIsEditing(true);
    setEditingId(section.id || null);
  };

  const handleEditMember = (member: TeamMember) => {
    setMemberFormData({
      name: member.name,
      position: member.position,
      bio: member.bio || '',
      photoUrl: member.photoUrl || '',
      photoAlt: member.photoAlt || '',
      email: member.email || '',
      phone: member.phone || '',
      linkedinUrl: member.linkedinUrl || '',
      twitterUrl: member.twitterUrl || '',
      githubUrl: member.githubUrl || '',
      websiteUrl: member.websiteUrl || '',
      sortOrder: member.sortOrder,
      isActive: member.isActive
    });
    setSelectedSectionId(member.teamSectionId);
    setEditingMemberId(member.id || null);
    setShowMemberForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team section?')) return;

    try {
      const result = await api.delete(`/api/admin/team-sections?id=${id}`) as any;
      if (result.success) {
        await fetchTeamSections();
        setMessage({ type: 'success', text: 'Team section deleted successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete team section' });
      }
    } catch (error) {
      console.error('Error deleting team section:', error);
      setMessage({ type: 'error', text: 'Error deleting team section' });
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      const result = await api.delete(`/api/admin/team-members?id=${id}`) as any;
      if (result.success) {
        await fetchTeamSections();
        setMessage({ type: 'success', text: 'Team member deleted successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete team member' });
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      setMessage({ type: 'error', text: 'Error deleting team member' });
    }
  };

  const handleAddMember = useCallback((sectionId: number) => {
    setSelectedSectionId(sectionId);
    setShowMemberForm(true);
    setEditingMemberId(null);
    resetMemberFormData();
  }, []);

  const getLayoutTypeDisplay = (layoutType: string) => {
    const types = {
      grid: 'Grid Layout',
      staggered: 'Staggered Layout',
      list: 'List Layout'
    };
    return types[layoutType as keyof typeof types] || layoutType;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'secondary';
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading team sections...</div>;
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h2 
          className="text-2xl font-bold"
          style={{ color: designSystem?.textPrimary || '#000000' }}
        >
          Team Sections Manager
        </h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create Team Section
        </Button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <Card className="p-6">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: designSystem?.textPrimary || '#000000' }}
          >
            {isEditing ? 'Edit Team Section' : 'Create New Team Section'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Section Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Heading
                </label>
                <input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => handleInputChange('heading', e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Subheading
                </label>
                <input
                  type="text"
                  value={formData.subheading}
                  onChange={(e) => handleInputChange('subheading', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Layout Type
                </label>
                <select
                  value={formData.layoutType || 'grid'}
                  onChange={(e) => handleInputChange('layoutType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  style={{
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                >
                  <option value="grid">Grid Layout</option>
                  <option value="staggered">Staggered Layout</option>
                  <option value="list">List Layout</option>
                </select>
              </div>
                              <div>
                  <ColorPicker
                    label="Background Color"
                    value={formData.backgroundColor || '#ffffff'}
                    onChange={(color) => handleInputChange('backgroundColor', color)}
                    designSystem={designSystem}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: designSystem?.textPrimary || '#000000' }}
                  >
                    Background Image
                  </label>
                  <MediaSelector
                    onChange={(media: any) => {
                      if (media && !Array.isArray(media)) {
                        handleInputChange('backgroundImage', media.publicUrl);
                        handleInputChange('backgroundSize', media.width && media.height ? `${media.width}px ${media.height}px` : 'auto');
                      }
                    }}
                    acceptedTypes={['image']}
                    designSystem={designSystem || undefined}
                  />
                  {formData.backgroundImage && (
                    <div className="mt-2">
                      <img
                        src={formData.backgroundImage}
                        alt="Background preview"
                        className="w-32 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleInputChange('backgroundImage', '')}
                        className="mt-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: designSystem?.textPrimary || '#000000' }}
                  >
                    Image Size
                  </label>
                  <select
                    value={formData.backgroundSize || 'cover'}
                    onChange={(e) => handleInputChange('backgroundSize', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    style={{
                      color: designSystem?.textPrimary || '#000000',
                      backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                    }}
                  >
                    <option value="cover">Cover (Fill entire section)</option>
                    <option value="contain">Contain (Fit within section)</option>
                    <option value="auto">Auto (Original size)</option>
                  </select>
                </div>
                <div>
                  <ColorPicker
                    label="Background Overlay Color"
                    value={formData.backgroundOverlay || ''}
                    onChange={(color) => handleInputChange('backgroundOverlay', color)}
                    allowTransparent={true}
                    designSystem={designSystem}
                  />
                </div>
              <div>
                <ColorPicker
                  label="Heading Color"
                  value={formData.headingColor || '#000000'}
                  onChange={(color) => handleInputChange('headingColor', color)}
                  designSystem={designSystem}
                />
              </div>
              <div>
                <ColorPicker
                  label="Subheading Color"
                  value={formData.subheadingColor || '#666666'}
                  onChange={(color) => handleInputChange('subheadingColor', color)}
                  designSystem={designSystem}
                />
              </div>
              <div>
                <ColorPicker
                  label="Bio Background Color"
                  value={formData.cardBackgroundColor || '#ffffff'}
                  onChange={(color) => handleInputChange('cardBackgroundColor', color)}
                  designSystem={designSystem}
                />
              </div>
              <div>
                <ColorPicker
                  label="Card Background Color"
                  value={formData.photoBackgroundColor || '#f3f4f6'}
                  onChange={(color) => handleInputChange('photoBackgroundColor', color)}
                  designSystem={designSystem}
                />
              </div>
              <div>
                <ColorPicker
                  label="Name Color"
                  value={formData.nameColor || '#000000'}
                  onChange={(color) => handleInputChange('nameColor', color)}
                  designSystem={designSystem}
                />
              </div>
              <div>
                <ColorPicker
                  label="Position Color"
                  value={formData.positionColor || '#666666'}
                  onChange={(color) => handleInputChange('positionColor', color)}
                  designSystem={designSystem}
                />
              </div>
              <div>
                <ColorPicker
                  label="Bio Color"
                  value={formData.bioColor || '#333333'}
                  onChange={(color) => handleInputChange('bioColor', color)}
                  designSystem={designSystem}
                />
              </div>
              <div>
                <ColorPicker
                  label="Social Text Color"
                  value={formData.socialTextColor || '#000000'}
                  onChange={(color) => handleInputChange('socialTextColor', color)}
                  designSystem={designSystem}
                />
              </div>
              <div>
                <ColorPicker
                  label="Social Background Color"
                  value={formData.socialBackgroundColor || '#f3f4f6'}
                  onChange={(color) => handleInputChange('socialBackgroundColor', color)}
                  designSystem={designSystem}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Padding Top (px)
                </label>
                <input
                  type="number"
                  value={formData.paddingTop}
                  onChange={(e) => handleInputChange('paddingTop', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Padding Bottom (px)
                </label>
                <input
                  type="number"
                  value={formData.paddingBottom}
                  onChange={(e) => handleInputChange('paddingBottom', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Container Max Width
                </label>
                <select
                  value={formData.containerMaxWidth}
                  onChange={(e) => handleInputChange('containerMaxWidth', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                >
                  <option value="xl">XL</option>
                  <option value="2xl">2XL</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <label 
                htmlFor="isActive" 
                className="text-sm font-medium"
                style={{ color: designSystem?.textPrimary || '#000000' }}
              >
                Active
              </label>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                {isEditing ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Team Member Form */}
      {showMemberForm && (
        <Card className="p-6">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: designSystem?.textPrimary || '#000000' }}
          >
            {editingMemberId ? 'Edit Team Member' : 'Add Team Member'}
          </h3>
          <form onSubmit={handleMemberSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={memberFormData.name}
                  onChange={(e) => handleMemberInputChange('name', e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Position
                </label>
                <input
                  type="text"
                  value={memberFormData.position}
                  onChange={(e) => handleMemberInputChange('position', e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={memberFormData.email}
                  onChange={(e) => handleMemberInputChange('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  value={memberFormData.phone || ''}
                  onChange={(e) => handleMemberInputChange('phone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Sort Order
                </label>
                <input
                  type="number"
                  value={memberFormData.sortOrder}
                  onChange={(e) => handleMemberInputChange('sortOrder', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Bio
                </label>
                <textarea
                  value={memberFormData.bio}
                  onChange={(e) => handleMemberInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bio..."
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff',
                    borderColor: 'var(--color-gray-light, #E5E7EB)'
                  }}
                />
                <style jsx>{`
                  textarea::placeholder {
                    color: var(--color-text-muted, #9CA3AF) !important;
                    opacity: 1;
                  }
                  textarea::-webkit-input-placeholder {
                    color: var(--color-text-muted, #9CA3AF) !important;
                    opacity: 1;
                  }
                  textarea::-moz-placeholder {
                    color: var(--color-text-muted, #9CA3AF) !important;
                    opacity: 1;
                  }
                  textarea:-ms-input-placeholder {
                    color: var(--color-text-muted, #9CA3AF) !important;
                    opacity: 1;
                  }
                  textarea:-moz-placeholder {
                    color: var(--color-text-muted, #9CA3AF) !important;
                    opacity: 1;
                  }
                `}</style>
              </div>
              <div className="md:col-span-2">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Profile Photo
                </label>
                <MediaSelector
                  onChange={(media: any) => {
                    if (media && !Array.isArray(media)) {
                      handleMemberInputChange('photoUrl', media.publicUrl);
                      handleMemberInputChange('photoAlt', media.alt || media.title || '');
                    }
                  }}
                  acceptedTypes={['image']}
                />
                {memberFormData.photoUrl && (
                  <div className="mt-2">
                    <img
                      src={memberFormData.photoUrl}
                      alt={memberFormData.photoAlt}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={memberFormData.linkedinUrl}
                  onChange={(e) => handleMemberInputChange('linkedinUrl', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={memberFormData.twitterUrl}
                  onChange={(e) => handleMemberInputChange('twitterUrl', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={memberFormData.githubUrl}
                  onChange={(e) => handleMemberInputChange('githubUrl', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  Website URL
                </label>
                <input
                  type="url"
                  value={memberFormData.websiteUrl}
                  onChange={(e) => handleMemberInputChange('websiteUrl', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    color: designSystem?.textPrimary || '#000000',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="memberIsActive"
                checked={memberFormData.isActive}
                onChange={(e) => handleMemberInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <label 
                htmlFor="memberIsActive" 
                className="text-sm font-medium"
                style={{ color: designSystem?.textPrimary || '#000000' }}
              >
                Active
              </label>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                {editingMemberId ? 'Update' : 'Add'} Member
              </Button>
              <Button
                type="button"
                onClick={() => {
                  resetMemberForm();
                  setShowMemberForm(false);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Team Sections List */}
      <div className="space-y-4">
        {teamSections.map((section) => (
          <Card key={section.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: designSystem?.textPrimary || '#000000' }}
                >
                  {section.name}
                </h3>
                <p 
                  className="text-gray-600"
                  style={{ color: designSystem?.textSecondary || '#666666' }}
                >
                  {section.heading}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={getStatusColor(section.isActive)}>
                    {section.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {getLayoutTypeDisplay(section.layoutType)}
                  </Badge>
                  <Badge variant="outline">
                    {section._count?.teamMembers || 0} members
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setExpandedSection(
                    expandedSection === section.id ? null : section.id || null
                  )}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  {expandedSection === section.id ? 'Hide' : 'Show'} Members
                </Button>
                <Button
                  onClick={() => handleEdit(section)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(section.id!)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Team Members */}
            {expandedSection === section.id && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 
                    className="text-md font-semibold"
                    style={{ color: designSystem?.textPrimary || '#000000' }}
                  >
                    Team Members
                  </h4>
                  <Button
                    onClick={() => handleAddMember(section.id!)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add Member
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.teamMembers?.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {member.photoUrl && (
                          <img
                            src={member.photoUrl}
                            alt={member.photoAlt || member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h5 
                            className="font-semibold"
                            style={{ color: designSystem?.textPrimary || '#000000' }}
                          >
                            {member.name}
                          </h5>
                          <p 
                            className="text-sm text-gray-600"
                            style={{ color: designSystem?.textSecondary || '#666666' }}
                          >
                            {member.position}
                          </p>
                        </div>
                      </div>
                      {member.bio && (
                        <p 
                          className="text-sm text-gray-700 mb-3"
                          style={{ color: designSystem?.textSecondary || '#666666' }}
                        >
                          {member.bio}
                        </p>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditMember(member)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteMember(member.id!)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamSectionsManager; 
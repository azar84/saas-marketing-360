'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Layers,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Users,
  Settings,
  Languages,
  BookOpen,
  Zap,
  Shield,
  Clock,
  Globe,
  Code,
  Award,
  TrendingUp,
  Heart,
  Sparkles,
  Play,
  ArrowRight,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Video,
  Calendar,
  Gift,
  Rocket,
  GripVertical,
  Eye,
  EyeOff,
  FileText,
  Link,
  Palette
} from 'lucide-react';
import { Button, Input, IconPicker, ColorPicker } from '@/components/ui';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { renderIcon } from '@/lib/iconUtils';

// Available icons mapping
const availableIcons = [
  { name: 'MessageSquare', icon: MessageSquare, label: 'Message Square' },
  { name: 'Users', icon: Users, label: 'Users' },
  { name: 'Settings', icon: Settings, label: 'Settings' },
  { name: 'Languages', icon: Languages, label: 'Languages' },
  { name: 'BookOpen', icon: BookOpen, label: 'Book Open' },
  { name: 'Zap', icon: Zap, label: 'Lightning' },
  { name: 'Shield', icon: Shield, label: 'Shield' },
  { name: 'Clock', icon: Clock, label: 'Clock' },
  { name: 'Globe', icon: Globe, label: 'Globe' },
  { name: 'Code', icon: Code, label: 'Code' },
  { name: 'Award', icon: Award, label: 'Award' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Trending Up' },
  { name: 'Heart', icon: Heart, label: 'Heart' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { name: 'Play', icon: Play, label: 'Play' },
  { name: 'ArrowRight', icon: ArrowRight, label: 'Arrow Right' },
  { name: 'Download', icon: Download, label: 'Download' },
  { name: 'ExternalLink', icon: ExternalLink, label: 'External Link' },
  { name: 'Mail', icon: Mail, label: 'Mail' },
  { name: 'Phone', icon: Phone, label: 'Phone' },
  { name: 'Video', icon: Video, label: 'Video' },
  { name: 'Calendar', icon: Calendar, label: 'Calendar' },
  { name: 'Gift', icon: Gift, label: 'Gift' },
  { name: 'Rocket', icon: Rocket, label: 'Rocket' }
];

interface GlobalFeature {
  id: number;
  title: string;
  description: string;
  iconName: string;
  category: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeatureGroupItem {
  id: number;
  featureGroupId: number;
  featureId: number;
  sortOrder: number;
  isVisible: boolean;
  feature: GlobalFeature;
  createdAt: string;
  updatedAt: string;
}

interface Page {
  id: number;
  slug: string;
  title: string;
  showInHeader: boolean;
}

interface PageFeatureGroup {
  id: number;
  pageId: number;
  featureGroupId: number;
  sortOrder: number;
  isVisible: boolean;
  page: Page;
}

interface FeatureGroup {
  id: number;
  name: string;
  heading: string;
  subheading?: string;
  layoutType?: string;
  backgroundColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  groupItems?: FeatureGroupItem[];
  pageAssignments?: PageFeatureGroup[];
  _count?: {
    groupItems: number;
    pageAssignments: number;
  };
}

const FeatureGroupsManager: React.FC = () => {
  const [featureGroups, setFeatureGroups] = useState<FeatureGroup[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<GlobalFeature[]>([]);
  const [availablePages, setAvailablePages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FeatureGroup | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'features' | 'pages'>('features');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    heading: string;
    subheading: string;
    layoutType: 'grid' | 'list';
    backgroundColor: string;
    isActive: boolean;
  }>({
    name: '',
    heading: '',
    subheading: '',
    layoutType: 'grid',
    backgroundColor: '#ffffff',
    isActive: true
  });

  const { designSystem } = useDesignSystem();

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



  const getIconComponent = (iconName: string) => {
    // Use the universal renderIcon utility
    // If iconName doesn't include a library prefix, assume it's a Lucide icon
    const iconString = iconName.includes(':') ? iconName : `lucide:${iconName}`;
    return renderIcon(iconString, { className: 'w-4 h-4', style: { color: 'var(--color-primary, #5243E9)' } }) || renderIcon('lucide:MessageSquare', { className: 'w-4 h-4', style: { color: 'var(--color-primary, #5243E9)' } });
  };

  const fetchFeatureGroups = async () => {
    try {
      const response = await fetch('/api/admin/feature-groups');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFeatureGroups(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching feature groups:', error);
      setMessage({ type: 'error', text: 'Failed to load feature groups' });
    }
  };

  const fetchAvailableFeatures = async () => {
    try {
      const response = await fetch('/api/admin/features');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAvailableFeatures(result.data.filter((f: GlobalFeature) => f.isVisible));
        }
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };

  const fetchAvailablePages = async () => {
    try {
      const response = await fetch('/api/admin/pages');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAvailablePages(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchFeatureGroups(), fetchAvailableFeatures(), fetchAvailablePages()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/admin/feature-groups';
      const method = editingGroup ? 'PUT' : 'POST';
      const body = editingGroup 
        ? { ...formData, id: editingGroup.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ 
          type: 'success', 
          text: editingGroup ? 'Feature group updated successfully!' : 'Feature group created successfully!' 
        });
        await fetchFeatureGroups();
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to save feature group');
      }
    } catch (error) {
      console.error('Error saving feature group:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save feature group' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feature group? This will also remove it from all pages.')) return;

    try {
      const response = await fetch('/api/admin/feature-groups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Feature group deleted successfully!' });
        await fetchFeatureGroups();
      } else {
        throw new Error(result.message || 'Failed to delete feature group');
      }
    } catch (error) {
      console.error('Error deleting feature group:', error);
      setMessage({ type: 'error', text: 'Failed to delete feature group' });
    }
  };

  const addFeatureToGroup = async (groupId: number, featureId: number) => {
    try {
      const response = await fetch('/api/admin/feature-group-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureGroupId: groupId,
          featureId: featureId,
          isVisible: true
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Feature added to group successfully!' });
        await fetchFeatureGroups();
      } else {
        throw new Error(result.message || 'Failed to add feature to group');
      }
    } catch (error) {
      console.error('Error adding feature to group:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to add feature to group' });
    }
  };

  const removeFeatureFromGroup = async (groupItemId: number) => {
    try {
      const response = await fetch('/api/admin/feature-group-items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: groupItemId })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Feature removed from group successfully!' });
        await fetchFeatureGroups();
      } else {
        throw new Error(result.message || 'Failed to remove feature from group');
      }
    } catch (error) {
      console.error('Error removing feature from group:', error);
      setMessage({ type: 'error', text: 'Failed to remove feature from group' });
    }
  };

  const assignGroupToPage = async (groupId: number, pageId: number) => {
    try {
      const response = await fetch('/api/admin/page-feature-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureGroupId: groupId,
          pageId: pageId,
          isVisible: true
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Feature group assigned to page successfully!' });
        await fetchFeatureGroups();
      } else {
        throw new Error(result.message || 'Failed to assign feature group to page');
      }
    } catch (error) {
      console.error('Error assigning feature group to page:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to assign feature group to page' });
    }
  };

  const removeGroupFromPage = async (assignmentId: number) => {
    try {
      const response = await fetch('/api/admin/page-feature-groups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assignmentId })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Feature group removed from page successfully!' });
        await fetchFeatureGroups();
      } else {
        throw new Error(result.message || 'Failed to remove feature group from page');
      }
    } catch (error) {
      console.error('Error removing feature group from page:', error);
      setMessage({ type: 'error', text: 'Failed to remove feature group from page' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      heading: '',
      subheading: '',
      layoutType: 'grid',
      backgroundColor: '#ffffff',
      isActive: true
    });
    setEditingGroup(null);
    setShowCreateForm(false);
  };

  const startEdit = (group: FeatureGroup) => {
    setFormData({
      name: group.name,
      heading: group.heading,
      subheading: group.subheading || '',
      layoutType: (group as any).layoutType || 'grid',
      backgroundColor: group.backgroundColor || '#ffffff',
      isActive: group.isActive
    });
    setEditingGroup(group);
    setShowCreateForm(true);
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
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary, #1F2937)' }}>Feature Groups Manager</h2>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary, #6B7280)' }}>Create reusable feature collections and assign them to pages</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          style={{
            backgroundColor: 'var(--color-success, #10B981)',
            color: 'var(--color-bg-primary, #FFFFFF)'
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-4 rounded-lg border"
            style={{
              backgroundColor: message.type === 'success' 
                ? 'var(--color-success-light, #D1FAE5)' 
                : 'var(--color-error-light, #FEE2E2)',
              color: message.type === 'success' 
                ? 'var(--color-success-dark, #065F46)' 
                : 'var(--color-error-dark, #991B1B)',
              borderColor: message.type === 'success' 
                ? 'var(--color-success, #10B981)' 
                : 'var(--color-error, #EF4444)'
            }}
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

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)', borderColor: 'var(--color-gray-light, #E5E7EB)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
              {editingGroup ? 'Edit Feature Group' : 'Create New Feature Group'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                  Group Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Home Page Features"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                  Display Heading *
                </label>
                <Input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  placeholder="e.g., Why Choose Us?"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                  Layout Type *
                </label>
                <select
                  value={formData.layoutType}
                  onChange={(e) => setFormData({ ...formData, layoutType: e.target.value as 'grid' | 'list' })}
                  className="w-full h-12 px-3 border rounded-lg"
                  style={{
                    borderColor: 'var(--color-gray-light, #E5E7EB)',
                    backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
                    color: 'var(--color-text-primary, #1F2937)'
                  }}
                >
                  <option value="grid">Grid Layout (Classic Cards)</option>
                  <option value="list">List Layout (Horizontal Features)</option>
                </select>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>
                  Grid: Traditional card-based layout. List: Modern horizontal layout with icons and descriptions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                  Display Subheading
                </label>
                <Input
                  type="text"
                  value={formData.subheading}
                  onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                  placeholder="e.g., Simple. Smart. Built for growing businesses"
                  className="h-12"
                />
              </div>

              <div>
                <ColorPicker
                  label="Background Color"
                  value={formData.backgroundColor || '#ffffff'}
                  onChange={(color) => setFormData({ ...formData, backgroundColor: color })}
                  designSystemColors={getDesignSystemColors()}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 border rounded"
                style={{
                  color: 'var(--color-primary, #5243E9)',
                  borderColor: 'var(--color-gray-light, #E5E7EB)'
                }}
              />
              <label htmlFor="isActive" className="text-sm font-medium" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                Active (Available for use)
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={saving}
                style={{
                  backgroundColor: 'var(--color-success, #10B981)',
                  color: 'var(--color-bg-primary, #FFFFFF)'
                }}
              >
                {saving ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : (editingGroup ? 'Update Group' : 'Create Group')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Feature Groups List */}
      <div className="space-y-6">
        {featureGroups.map((group) => (
          <div
            key={group.id}
            className="border-2 rounded-xl transition-all duration-200"
            style={{
              borderColor: group.isActive
                ? 'var(--color-gray-light, #E5E7EB)'
                : 'var(--color-gray-lighter, #F3F4F6)',
              backgroundColor: group.isActive
                ? 'var(--color-bg-primary, #FFFFFF)'
                : 'var(--color-bg-secondary, #F9FAFB)',
              opacity: group.isActive ? 1 : 0.6
            }}
          >
            {/* Group Header */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-gray-lighter, #F3F4F6)' }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Layers className="w-5 h-5" style={{ color: 'var(--color-purple, #A855F7)' }} />
                    <h4 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary, #1F2937)' }}>{group.name}</h4>
                    <span className="px-2 py-1 text-xs rounded-full" style={{
                      backgroundColor: group.isActive ? 'var(--color-success-light, #D1FAE5)' : 'var(--color-bg-secondary, #F9FAFB)',
                      color: group.isActive ? 'var(--color-success-dark, #065F46)' : 'var(--color-text-muted, #9CA3AF)'
                    }}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full" style={{
                      backgroundColor: (group.layoutType || 'grid') === 'grid' 
                        ? 'var(--color-info-light, #DBEAFE)' 
                        : 'var(--color-purple-light, #F3E8FF)',
                      color: (group.layoutType || 'grid') === 'grid' 
                        ? 'var(--color-info-dark, #1E40AF)' 
                        : 'var(--color-purple-dark, #581C87)'
                    }}>
                      {(group.layoutType || 'grid') === 'grid' ? 'Grid Layout' : 'List Layout'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-secondary, #6B7280)' }}>{group.heading}</p>
                  {group.subheading && (
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>{group.subheading}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>
                    <span>{group._count?.groupItems || 0} features</span>
                    <span>{group._count?.pageAssignments || 0} pages</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                    style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                  >
                    {expandedGroup === group.id ? 'Collapse' : 'Manage'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(group)}
                    style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(group.id)}
                    style={{ color: 'var(--color-error, #EF4444)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Management Section */}
            {expandedGroup === group.id && (
              <div className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary, #F9FAFB)' }}>
                {/* Tab Navigation */}
                <div className="flex space-x-1 p-1 rounded-lg mb-6" style={{ backgroundColor: 'var(--color-bg-secondary, #F9FAFB)' }}>
                  <button
                    onClick={() => setActiveTab('features')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: activeTab === 'features' ? 'var(--color-bg-primary, #FFFFFF)' : 'transparent',
                      color: activeTab === 'features' ? 'var(--color-text-primary, #1F2937)' : 'var(--color-text-secondary, #6B7280)'
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    Manage Features
                  </button>
                  <button
                    onClick={() => setActiveTab('pages')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: activeTab === 'pages' ? 'var(--color-bg-primary, #FFFFFF)' : 'transparent',
                      color: activeTab === 'pages' ? 'var(--color-text-primary, #1F2937)' : 'var(--color-text-secondary, #6B7280)'
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    Assign to Pages
                  </button>
                </div>

                {/* Features Tab */}
                {activeTab === 'features' && (
                  <div className="space-y-6">
                    {/* Current Features in Group */}
                    <div>
                      <h5 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary, #1F2937)' }}>Features in this Group</h5>
                      {group.groupItems && group.groupItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.groupItems.map((item) => {
                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                              >
                                <div className="flex items-center gap-3">
                                                                      <GripVertical className="w-4 h-4" style={{ color: 'var(--color-text-muted, #9CA3AF)' }} />
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light, #E0E7FF)' }}>
                                    {getIconComponent(item.feature.iconName)}
                                  </div>
                                  <div>
                                    <h6 className="font-medium" style={{ color: 'var(--color-text-primary, #1F2937)' }}>{item.feature.title}</h6>
                                    <p className="text-sm" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>Order: {item.sortOrder}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                                  >
                                    {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFeatureFromGroup(item.id)}
                                    style={{ color: 'var(--color-error, #EF4444)' }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center py-8" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>No features in this group yet.</p>
                      )}
                    </div>

                    {/* Add Features */}
                    <div>
                      <h5 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary, #1F2937)' }}>Add Features</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableFeatures
                          .filter(feature => !group.groupItems?.some(item => item.featureId === feature.id))
                          .map((feature) => {
                            return (
                              <div
                                key={feature.id}
                                className="flex items-center justify-between p-4 rounded-lg border transition-colors"
                                style={{ 
                                  backgroundColor: 'var(--color-bg-primary, #FFFFFF)', 
                                  borderColor: 'var(--color-gray-light, #E5E7EB)'
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary, #F9FAFB)' }}>
                                    {getIconComponent(feature.iconName)}
                                  </div>
                                  <div>
                                    <h6 className="font-medium" style={{ color: 'var(--color-text-primary, #1F2937)' }}>{feature.title}</h6>
                                    <p className="text-sm" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>{feature.category}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => addFeatureToGroup(group.id, feature.id)}
                                  style={{
                                    backgroundColor: 'var(--color-info, #3B82F6)',
                                    color: 'var(--color-bg-primary, #FFFFFF)'
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pages Tab */}
                {activeTab === 'pages' && (
                  <div className="space-y-6">
                    {/* Current Page Assignments */}
                    <div>
                      <h5 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary, #1F2937)' }}>Pages Using This Group</h5>
                      {group.pageAssignments && group.pageAssignments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.pageAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-4 rounded-lg border"
                              style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)', borderColor: 'var(--color-gray-light, #E5E7EB)' }}
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5" style={{ color: 'var(--color-info, #3B82F6)' }} />
                                <div>
                                  <h6 className="font-medium" style={{ color: 'var(--color-text-primary, #1F2937)' }}>{assignment.page.title}</h6>
                                  <p className="text-sm" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>/{assignment.page.slug}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                                >
                                  {assignment.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeGroupFromPage(assignment.id)}
                                  style={{ color: 'var(--color-error, #EF4444)' }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-8" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>This group is not assigned to any pages yet.</p>
                      )}
                    </div>

                    {/* Assign to Pages */}
                    <div>
                      <h5 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary, #1F2937)' }}>Assign to Pages</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availablePages
                          .filter(page => !group.pageAssignments?.some(assignment => assignment.pageId === page.id))
                          .map((page) => (
                            <div
                              key={page.id}
                              className="flex items-center justify-between p-4 rounded-lg border transition-colors"
                              style={{ 
                                backgroundColor: 'var(--color-bg-primary, #FFFFFF)', 
                                borderColor: 'var(--color-gray-light, #E5E7EB)'
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5" style={{ color: 'var(--color-text-muted, #9CA3AF)' }} />
                                <div>
                                  <h6 className="font-medium" style={{ color: 'var(--color-text-primary, #1F2937)' }}>{page.title}</h6>
                                  <p className="text-sm" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>/{page.slug}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => assignGroupToPage(group.id, page.id)}
                                style={{
                                  backgroundColor: 'var(--color-success, #10B981)',
                                  color: 'var(--color-bg-primary, #FFFFFF)'
                                }}
                              >
                                <Link className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {featureGroups.length === 0 && (
        <div className="text-center py-12">
          <Layers className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted, #9CA3AF)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>No feature groups yet</h3>
          <p style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>Create your first feature group to get started.</p>
        </div>
      )}
    </div>
  );
};

export default FeatureGroupsManager;

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
import { Button, Input, IconPicker } from '@/components/ui';
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

  // Color Picker Component
  const ColorPicker: React.FC<{
    label: string;
    value: string;
    onChange: (color: string) => void;
  }> = ({ label, value, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [customColor, setCustomColor] = useState(value.startsWith('#') ? value : '#000000');
    const designSystemColors = getDesignSystemColors();

    const presetColors = [
      ...designSystemColors,
      { name: 'White', value: '#FFFFFF', description: 'White' },
      { name: 'Black', value: '#000000', description: 'Black' },
    ];

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
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center">
            <div
              style={{ backgroundColor: value }}
              className="w-8 h-8 rounded-lg"
            ></div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPicker(!showPicker)}
            className="text-gray-500 hover:text-gray-700 ml-2"
          >
            <Palette className="w-4 h-4" />
          </Button>
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

  const getIconComponent = (iconName: string) => {
    // Use the universal renderIcon utility
    // If iconName doesn't include a library prefix, assume it's a Lucide icon
    const iconString = iconName.includes(':') ? iconName : `lucide:${iconName}`;
    return renderIcon(iconString, { className: 'w-4 h-4 text-blue-600' }) || renderIcon('lucide:MessageSquare', { className: 'w-4 h-4 text-blue-600' });
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
          <h2 className="text-3xl font-bold text-gray-900">Feature Groups Manager</h2>
          <p className="text-gray-600 mt-1">Create reusable feature collections and assign them to pages</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
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

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingGroup ? 'Edit Feature Group' : 'Create New Feature Group'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Heading *
                </label>
                <Input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  placeholder="e.g., Why Saski AI?"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout Type *
                </label>
                <select
                  value={formData.layoutType}
                  onChange={(e) => setFormData({ ...formData, layoutType: e.target.value as 'grid' | 'list' })}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="grid">Grid Layout (Classic Cards)</option>
                  <option value="list">List Layout (Horizontal Features)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Grid: Traditional card-based layout. List: Modern horizontal layout with icons and descriptions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <ColorPicker
                  label="Background Color"
                  value={formData.backgroundColor}
                  onChange={(color) => setFormData({ ...formData, backgroundColor: color })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (Available for use)
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
            className={`border-2 rounded-xl transition-all duration-200 ${
              group.isActive
                ? 'border-gray-200 bg-white'
                : 'border-gray-100 bg-gray-50 opacity-60'
            }`}
          >
            {/* Group Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <h4 className="text-xl font-semibold text-gray-900">{group.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (group.layoutType || 'grid') === 'grid' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {(group.layoutType || 'grid') === 'grid' ? 'Grid Layout' : 'List Layout'}
                    </span>
                  </div>
                  <p className="text-gray-600">{group.heading}</p>
                  {group.subheading && (
                    <p className="text-sm text-gray-500 mt-1">{group.subheading}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{group._count?.groupItems || 0} features</span>
                    <span>{group._count?.pageAssignments || 0} pages</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                    className="text-gray-600"
                  >
                    {expandedGroup === group.id ? 'Collapse' : 'Manage'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(group)}
                    className="p-2 text-gray-600 hover:text-gray-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(group.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Management Section */}
            {expandedGroup === group.id && (
              <div className="p-6 bg-gray-50">
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                  <button
                    onClick={() => setActiveTab('features')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'features'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Manage Features
                  </button>
                  <button
                    onClick={() => setActiveTab('pages')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'pages'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
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
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Features in this Group</h5>
                      {group.groupItems && group.groupItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.groupItems.map((item) => {
                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                              >
                                <div className="flex items-center gap-3">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    {getIconComponent(item.feature.iconName)}
                                  </div>
                                  <div>
                                    <h6 className="font-medium text-gray-900">{item.feature.title}</h6>
                                    <p className="text-sm text-gray-500">Order: {item.sortOrder}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 text-gray-500"
                                  >
                                    {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFeatureFromGroup(item.id)}
                                    className="p-1 text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No features in this group yet.</p>
                      )}
                    </div>

                    {/* Add Features */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Add Features</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableFeatures
                          .filter(feature => !group.groupItems?.some(item => item.featureId === feature.id))
                          .map((feature) => {
                            return (
                              <div
                                key={feature.id}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    {getIconComponent(feature.iconName)}
                                  </div>
                                  <div>
                                    <h6 className="font-medium text-gray-900">{feature.title}</h6>
                                    <p className="text-sm text-gray-500">{feature.category}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => addFeatureToGroup(group.id, feature.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Pages Using This Group</h5>
                      {group.pageAssignments && group.pageAssignments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.pageAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                  <h6 className="font-medium text-gray-900">{assignment.page.title}</h6>
                                  <p className="text-sm text-gray-500">/{assignment.page.slug}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="p-1 text-gray-500"
                                >
                                  {assignment.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeGroupFromPage(assignment.id)}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">This group is not assigned to any pages yet.</p>
                      )}
                    </div>

                    {/* Assign to Pages */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Assign to Pages</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availablePages
                          .filter(page => !group.pageAssignments?.some(assignment => assignment.pageId === page.id))
                          .map((page) => (
                            <div
                              key={page.id}
                              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-600" />
                                <div>
                                  <h6 className="font-medium text-gray-900">{page.title}</h6>
                                  <p className="text-sm text-gray-500">/{page.slug}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => assignGroupToPage(group.id, page.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
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
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No feature groups yet</h3>
          <p className="text-gray-500">Create your first feature group to get started.</p>
        </div>
      )}
    </div>
  );
};

export default FeatureGroupsManager;

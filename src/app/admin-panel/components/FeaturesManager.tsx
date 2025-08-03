'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Star,
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
  Rocket
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import UniversalIconPicker from '@/components/ui/UniversalIconPicker';
import { renderIcon } from '@/lib/iconUtils';

// Available icons for features
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
  category: 'integration' | 'ai' | 'automation' | 'analytics' | 'security' | 'support';
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryColors = {
  integration: 'px-3 py-1 text-xs border rounded-full font-medium',
  ai: 'px-3 py-1 text-xs border rounded-full font-medium',
  automation: 'px-3 py-1 text-xs border rounded-full font-medium',
  analytics: 'px-3 py-1 text-xs border rounded-full font-medium',
  security: 'px-3 py-1 text-xs border rounded-full font-medium',
  support: 'px-3 py-1 text-xs border rounded-full font-medium',
};

const categoryStyles = {
  integration: { backgroundColor: 'var(--color-info-light, #DBEAFE)', color: 'var(--color-info-dark, #1E40AF)', borderColor: 'var(--color-info, #3B82F6)' },
  ai: { backgroundColor: 'var(--color-purple-light, #F3E8FF)', color: 'var(--color-purple-dark, #581C87)', borderColor: 'var(--color-purple, #A855F7)' },
  automation: { backgroundColor: 'var(--color-success-light, #D1FAE5)', color: 'var(--color-success-dark, #065F46)', borderColor: 'var(--color-success, #10B981)' },
  analytics: { backgroundColor: 'var(--color-warning-light, #FEF3C7)', color: 'var(--color-warning-dark, #92400E)', borderColor: 'var(--color-warning, #F59E0B)' },
  security: { backgroundColor: 'var(--color-error-light, #FEE2E2)', color: 'var(--color-error-dark, #991B1B)', borderColor: 'var(--color-error, #EF4444)' },
  support: { backgroundColor: 'var(--color-primary-light, #E0E7FF)', color: 'var(--color-primary-dark, #3730A3)', borderColor: 'var(--color-primary, #5243E9)' },
};

const FeaturesManager: React.FC = () => {
  const [features, setFeatures] = useState<GlobalFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFeature, setEditingFeature] = useState<GlobalFeature | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    iconName: string;
    category: 'integration' | 'ai' | 'automation' | 'analytics' | 'security' | 'support';
    sortOrder: number;
    isVisible: boolean;
  }>({
    title: '',
    description: '',
    iconName: 'lucide:MessageSquare',
    category: 'integration',
    sortOrder: 0,
    isVisible: true
  });

  const getIconComponent = (iconName: string) => {
    // Use the universal renderIcon utility
    // If iconName doesn't include a library prefix, assume it's a Lucide icon
    const iconString = iconName.includes(':') ? iconName : `lucide:${iconName}`;
    return renderIcon(iconString, { className: 'w-5 h-5', style: { color: 'var(--color-primary, #5243E9)' } }) || renderIcon('lucide:Star', { className: 'w-5 h-5', style: { color: 'var(--color-primary, #5243E9)' } });
  };

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/admin/features');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFeatures(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch features');
        }
      } else {
        throw new Error('Failed to fetch features');
      }
    } catch (error) {
      console.error('Error fetching features:', error);
      setMessage({ type: 'error', text: 'Failed to load features' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/admin/features';
      const method = editingFeature ? 'PUT' : 'POST';
      const body = editingFeature 
        ? { ...formData, id: editingFeature.id }
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
          text: editingFeature ? 'Feature updated successfully!' : 'Feature created successfully!' 
        });
        await fetchFeatures();
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to save feature');
      }
    } catch (error) {
      console.error('Error saving feature:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save feature' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;

    try {
      const response = await fetch('/api/admin/features', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Feature deleted successfully!' });
        await fetchFeatures();
      } else {
        throw new Error(result.message || 'Failed to delete feature');
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      setMessage({ type: 'error', text: 'Failed to delete feature' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      iconName: 'lucide:MessageSquare',
      category: 'integration',
      sortOrder: 0,
      isVisible: true
    });
    setEditingFeature(null);
    setShowCreateForm(false);
  };

  const startEdit = (feature: GlobalFeature) => {
    setFormData({
      title: feature.title,
      description: feature.description,
      iconName: feature.iconName,
      category: feature.category,
      sortOrder: feature.sortOrder,
      isVisible: feature.isVisible
    });
    setEditingFeature(feature);
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
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary, #1F2937)' }}>Features Manager</h2>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary, #6B7280)' }}>Manage website features and capabilities</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          style={{
            backgroundColor: 'var(--color-success, #10B981)',
            color: 'var(--color-bg-primary, #FFFFFF)'
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
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
              {editingFeature ? 'Edit Feature' : 'Create New Feature'}
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
                  Feature Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Multi-Channel Support"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const value = e.target.value as 'integration' | 'ai' | 'automation' | 'analytics' | 'security' | 'support';
                    setFormData({ ...formData, category: value });
                  }}
                  className="w-full h-12 px-4 border rounded-lg"
                  style={{
                    borderColor: 'var(--color-gray-light, #E5E7EB)',
                    backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
                    color: 'var(--color-text-primary, #1F2937)'
                  }}
                >
                  <option value="integration" style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)', color: 'var(--color-text-primary, #1F2937)' }}>Integration</option>
                  <option value="ai" style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)', color: 'var(--color-text-primary, #1F2937)' }}>AI</option>
                  <option value="automation" style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)', color: 'var(--color-text-primary, #1F2937)' }}>Automation</option>
                  <option value="analytics" style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)', color: 'var(--color-text-primary, #1F2937)' }}>Analytics</option>
                  <option value="security" style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)', color: 'var(--color-text-primary, #1F2937)' }}>Security</option>
                  <option value="support" style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)', color: 'var(--color-text-primary, #1F2937)' }}>Support</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the feature and its benefits..."
                  required
                  className="w-full p-3 border rounded-lg resize-none"
                  style={{
                    borderColor: 'var(--color-gray-light, #E5E7EB)',
                    backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
                    color: 'var(--color-text-primary, #1F2937)'
                  }}
                  rows={3}
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

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                  Icon
                </label>
                <UniversalIconPicker
                  value={formData.iconName}
                  onChange={(iconName) => setFormData({ ...formData, iconName })}
                  placeholder="Select an icon..."
                  className="w-full"
                  textPrimary="var(--color-text-primary, #1F2937)"
                  textSecondary="var(--color-text-secondary, #6B7280)"
                  textMuted="var(--color-text-muted, #9CA3AF)"
                  backgroundPrimary="var(--color-bg-primary, #FFFFFF)"
                  backgroundSecondary="var(--color-bg-secondary, #F9FAFB)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="h-12"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isVisible"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="w-4 h-4 border rounded"
                style={{
                  color: 'var(--color-primary, #5243E9)',
                  borderColor: 'var(--color-gray-light, #E5E7EB)'
                }}
              />
              <label htmlFor="isVisible" className="text-sm font-medium" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                Visible (Show on website)
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
                {saving ? 'Saving...' : (editingFeature ? 'Update Feature' : 'Create Feature')}
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

      {/* Features List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          return (
            <div
              key={feature.id}
              className="border-2 rounded-xl p-6 transition-all duration-200"
              style={{
                borderColor: feature.isVisible
                  ? 'var(--color-gray-light, #E5E7EB)'
                  : 'var(--color-gray-lighter, #F3F4F6)',
                backgroundColor: feature.isVisible
                  ? 'var(--color-bg-primary, #FFFFFF)'
                  : 'var(--color-bg-secondary, #F9FAFB)',
                opacity: feature.isVisible ? 1 : 0.6
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex px-3 py-1 text-xs border rounded-full font-medium" style={categoryStyles[feature.category]}>
                  <span>
                    {feature.category}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(feature)}
                    style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(feature.id)}
                    style={{ color: 'var(--color-error, #EF4444)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light, #E0E7FF)' }}>
                  {getIconComponent(feature.iconName)}
                </div>
                <h4 className="font-semibold" style={{ color: 'var(--color-text-primary, #1F2937)' }}>{feature.title}</h4>
              </div>
              
              <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--color-text-secondary, #6B7280)' }}>{feature.description}</p>
              
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>
                <span>Order: {feature.sortOrder}</span>
                <span style={{ color: feature.isVisible ? 'var(--color-success, #10B981)' : 'var(--color-error, #EF4444)' }}>
                  {feature.isVisible ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {features.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted, #9CA3AF)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>No features yet</h3>
          <p style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>Create your first feature to get started.</p>
        </div>
      )}
    </div>
  );
};

export default FeaturesManager;

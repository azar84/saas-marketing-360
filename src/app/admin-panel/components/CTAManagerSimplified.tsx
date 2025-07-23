'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  FormField, 
  ManagerCard, 
  IconPicker,
  Card,
  Badge 
} from '@/components/ui';
import { renderIcon } from '@/lib/iconUtils';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface CTA {
  id: number;
  text: string;
  url: string;
  icon?: string;
  style: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  target: '_self' | '_blank';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CTAFormData {
  text: string;
  url: string;
  icon: string;
  style: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  target: '_self' | '_blank';
  isActive: boolean;
}

const styleOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'accent', label: 'Accent' },
  { value: 'ghost', label: 'Ghost' },
  { value: 'destructive', label: 'Destructive' },
  { value: 'success', label: 'Success' },
  { value: 'info', label: 'Info' },
  { value: 'outline', label: 'Outline' },
  { value: 'muted', label: 'Muted' }
];

const targetOptions = [
  { value: '_self', label: 'Same Tab' },
  { value: '_blank', label: 'New Tab' }
];

export default function CTAManagerSimplified() {
  const [ctas, setCtas] = useState<CTA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CTAFormData>({
    text: '',
    url: '',
    icon: '',
    style: 'primary',
    target: '_self',
    isActive: true
  });

  const fetchCtas = async () => {
    try {
      const response = await fetch('/api/admin/cta-buttons');
      if (response.ok) {
        const result = await response.json();
        setCtas(result.success ? result.data : []);
      }
    } catch (error) {
      console.error('Error fetching CTAs:', error);
      setCtas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCtas();
  }, []);

  const handleSubmit = async () => {
    try {
      const url = '/api/admin/cta-buttons';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchCtas();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving CTA:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this CTA button?')) return;

    try {
      const response = await fetch('/api/admin/cta-buttons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        await fetchCtas();
      }
    } catch (error) {
      console.error('Error deleting CTA:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      url: '',
      icon: '',
      style: 'primary',
      target: '_self',
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (cta: CTA) => {
    setFormData({
      text: cta.text,
      url: cta.url,
      icon: cta.icon || '',
      style: cta.style,
      target: cta.target,
      isActive: cta.isActive
    });
    setEditingId(cta.id);
    setShowForm(true);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">CTA Button Manager</h2>
          <p className="text-gray-600 mt-2">Manage call-to-action buttons for your website header</p>
        </div>
        <Button onClick={startCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Create CTA Button
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <ManagerCard
          title={editingId ? 'Edit CTA Button' : 'Create New CTA Button'}
          onSave={handleSubmit}
          onCancel={resetForm}
          isLoading={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Button Text"
              type="text"
              value={formData.text}
              onChange={(value) => setFormData({ ...formData, text: value as string })}
              placeholder="e.g., Get Started, Sign Up, Learn More"
              required
            />

            <FormField
              label="URL"
              type="url"
              value={formData.url}
              onChange={(value) => setFormData({ ...formData, url: value as string })}
              placeholder="https://example.com, /page, or #section"
              required
              helpText="Enter a full URL, relative path, or anchor link (e.g., #pricing, #contact)"
            />

            <FormField
              label="Button Style"
              type="select"
              value={formData.style}
              onChange={(value) => setFormData({ ...formData, style: value as any })}
              options={styleOptions}
            />

            <FormField
              label="Link Target"
              type="select"
              value={formData.target}
              onChange={(value) => setFormData({ ...formData, target: value as any })}
              options={targetOptions}
            />

            <FormField
              label="Icon"
              type="icon"
              value={formData.icon}
              onChange={(value) => setFormData({ ...formData, icon: value as string })}
              placeholder="Select an icon"
            />

            <FormField
              label="Active"
              type="checkbox"
              value={formData.isActive}
              onChange={(value) => setFormData({ ...formData, isActive: value as boolean })}
            />
          </div>

          {/* Live Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Live Preview</h4>
            <div className="flex justify-center">
              <Button
                variant={formData.style}
                leftIcon={formData.icon ? renderIcon(formData.icon, { className: 'w-4 h-4' }) : undefined}
                disabled={formData.style === 'muted'}
              >
                {formData.text || 'Button Text'}
              </Button>
            </div>
          </div>
        </ManagerCard>
      )}

      {/* CTA List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ctas.map((cta) => (
          <Card key={cta.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {cta.icon && renderIcon(cta.icon, { className: 'w-5 h-5' })}
                <h3 className="font-semibold text-gray-900">{cta.text}</h3>
              </div>
              <Badge variant={cta.isActive ? 'success' : 'secondary'}>
                {cta.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 break-all">{cta.url}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(cta)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(cta.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant={cta.style}
                size="sm"
                leftIcon={cta.icon ? renderIcon(cta.icon, { className: 'w-4 h-4' }) : undefined}
                disabled={cta.style === 'muted'}
              >
                {cta.text}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {ctas.length === 0 && !showForm && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No CTA buttons created yet.</p>
          <Button onClick={startCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First CTA Button
          </Button>
        </Card>
      )}
    </div>
  );
} 
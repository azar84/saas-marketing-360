'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Plus, Edit2, Trash2, Save, X, Settings, Type, Mail, Phone, Calendar, FileText, ToggleLeft, ToggleRight, ArrowUp, ArrowDown } from 'lucide-react';

interface ContactField {
  id: number;
  contactSectionId: number;
  fieldType: string;
  fieldName: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  fieldWidth: string;
  fieldOptions?: any;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ContactSection {
  id: number;
  name: string;
  heading: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'tel', label: 'Phone', icon: Phone },
  { value: 'textarea', label: 'Text Area', icon: FileText },
  { value: 'select', label: 'Select Dropdown', icon: ToggleRight },
  { value: 'checkbox', label: 'Checkbox', icon: ToggleLeft },
  { value: 'radio', label: 'Radio Buttons', icon: ToggleLeft },
  { value: 'date', label: 'Date', icon: Calendar },
];

const FIELD_WIDTHS = [
  { value: 'full', label: 'Full Width' },
  { value: 'half', label: 'Half Width' },
  { value: 'third', label: 'One Third' },
  { value: 'quarter', label: 'One Quarter' },
];

export default function ContactFieldsManager() {
  const [fields, setFields] = useState<ContactField[]>([]);
  const [sections, setSections] = useState<ContactSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    contactSectionId: '',
    fieldType: 'text',
    fieldName: '',
    label: '',
    placeholder: '',
    helpText: '',
    isRequired: false,
    fieldWidth: 'full',
    fieldOptions: '',
    sortOrder: 0
  });

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSectionId) {
      fetchFields();
    }
  }, [selectedSectionId]);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/contact-sections');
      if (response.ok) {
        const data = await response.json();
        setSections(data);
        if (data.length > 0 && !selectedSectionId) {
          setSelectedSectionId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFields = async () => {
    if (!selectedSectionId) return;
    
    try {
      const response = await fetch(`/api/admin/contact-sections?id=${selectedSectionId}&includeFields=true`);
      if (response.ok) {
        const section = await response.json();
        setFields(section.fields || []);
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSectionId) {
      alert('Please select a contact section first');
      return;
    }

    try {
      // Parse field options if it's a select/radio field
      let fieldOptions = null;
      if ((formData.fieldType === 'select' || formData.fieldType === 'radio') && formData.fieldOptions) {
        try {
          fieldOptions = formData.fieldOptions.split('\n').map(option => option.trim()).filter(option => option);
        } catch (err) {
          alert('Invalid field options format');
          return;
        }
      }

      const body = {
        ...formData,
        contactSectionId: selectedSectionId,
        fieldOptions,
        id: editingId || undefined
      };

      const url = editingId ? '/api/admin/contact-fields' : '/api/admin/contact-fields';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchFields();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save field');
      }
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Failed to save field');
    }
  };

  const handleEdit = (field: ContactField) => {
    setFormData({
      contactSectionId: field.contactSectionId.toString(),
      fieldType: field.fieldType,
      fieldName: field.fieldName,
      label: field.label,
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      isRequired: field.isRequired,
      fieldWidth: field.fieldWidth,
      fieldOptions: Array.isArray(field.fieldOptions) ? field.fieldOptions.join('\n') : '',
      sortOrder: field.sortOrder
    });
    setEditingId(field.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this field?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contact-fields?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFields();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete field');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Failed to delete field');
    }
  };

  const moveField = async (fieldId: number, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    try {
      // Update sort orders
      const updates = [
        { id: fields[currentIndex].id, sortOrder: fields[newIndex].sortOrder },
        { id: fields[newIndex].id, sortOrder: fields[currentIndex].sortOrder }
      ];

      for (const update of updates) {
        await fetch('/api/admin/contact-fields', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });
      }

      await fetchFields();
    } catch (error) {
      console.error('Error moving field:', error);
      alert('Failed to move field');
    }
  };

  const resetForm = () => {
    setFormData({
      contactSectionId: selectedSectionId?.toString() || '',
      fieldType: 'text',
      fieldName: '',
      label: '',
      placeholder: '',
      helpText: '',
      isRequired: false,
      fieldWidth: 'full',
      fieldOptions: '',
      sortOrder: fields.length
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateFieldName = (label: string) => {
    return label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading contact fields...</div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-12">
        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Contact Sections</h3>
        <p className="text-gray-600 mb-4">
          Create a contact section first before adding fields.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Form Fields</h2>
          <p className="text-gray-600">Manage form fields for your contact sections</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
          disabled={!selectedSectionId}
        >
          <Plus className="w-4 h-4" />
          <span>Add Field</span>
        </Button>
      </div>

      {/* Section Selector */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Contact Section:</label>
          <select
            value={selectedSectionId || ''}
            onChange={(e) => setSelectedSectionId(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md"
          >
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Field' : 'Create New Field'}
            </h3>
            <Button variant="outline" size="sm" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type *
                </label>
                <select
                  value={formData.fieldType}
                  onChange={(e) => handleInputChange('fieldType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Width
                </label>
                <select
                  value={formData.fieldWidth}
                  onChange={(e) => handleInputChange('fieldWidth', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {FIELD_WIDTHS.map(width => (
                    <option key={width.value} value={width.value}>
                      {width.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label *
                </label>
                <Input
                  type="text"
                  value={formData.label}
                  onChange={(e) => {
                    handleInputChange('label', e.target.value);
                    if (!formData.fieldName) {
                      handleInputChange('fieldName', generateFieldName(e.target.value));
                    }
                  }}
                  placeholder="e.g., Full Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name *
                </label>
                <Input
                  type="text"
                  value={formData.fieldName}
                  onChange={(e) => handleInputChange('fieldName', e.target.value)}
                  placeholder="e.g., full_name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <Input
                type="text"
                value={formData.placeholder}
                onChange={(e) => handleInputChange('placeholder', e.target.value)}
                placeholder="e.g., Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Help Text
              </label>
              <Input
                type="text"
                value={formData.helpText}
                onChange={(e) => handleInputChange('helpText', e.target.value)}
                placeholder="Additional help text for this field"
              />
            </div>

            {(formData.fieldType === 'select' || formData.fieldType === 'radio') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options (one per line) *
                </label>
                <textarea
                  value={formData.fieldOptions}
                  onChange={(e) => handleInputChange('fieldOptions', e.target.value)}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  required
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md resize-vertical"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                  Required Field
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>{editingId ? 'Update' : 'Create'} Field</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Fields List */}
      <div className="space-y-4">
        {fields.map((field, index) => {
          const FieldIcon = FIELD_TYPES.find(t => t.value === field.fieldType)?.icon || Type;
          
          return (
            <Card key={field.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FieldIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{field.label}</h4>
                    <p className="text-sm text-gray-500">
                      {field.fieldType} • {field.fieldWidth} width • {field.fieldName}
                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveField(field.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveField(field.id, 'down')}
                    disabled={index === fields.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(field)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(field.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedSectionId && fields.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Fields Yet</h3>
          <p className="text-gray-600 mb-4">
            Add fields to create your contact form.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>
      )}
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Plus, Edit2, Trash2, Save, X, Mail, Settings, MessageSquare, Database, Eye, EyeOff } from 'lucide-react';

interface ContactField {
  id: number;
  fieldType: string;
  fieldName: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  fieldWidth: string;
  fieldOptions?: any;
  sortOrder: number;
}

interface ContactSection {
  id: number;
  name: string;
  heading: string;
  subheading?: string;
  successMessage: string;
  errorMessage: string;
  isActive: boolean;
  fields: ContactField[];
  _count?: {
    submissions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ContactSectionsManager() {
  const [contactSections, setContactSections] = useState<ContactSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'sections' | 'fields' | 'submissions'>('sections');
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    heading: '',
    subheading: '',
    successMessage: 'Thank you for your message! We\'ll get back to you soon.',
    errorMessage: 'Sorry, there was an error sending your message. Please try again.',
    isActive: true
  });

  useEffect(() => {
    fetchContactSections();
  }, []);

  const fetchContactSections = async () => {
    try {
      const response = await fetch('/api/admin/contact-sections');
      if (response.ok) {
        const data = await response.json();
        setContactSections(data);
      } else {
        console.error('Failed to fetch contact sections');
      }
    } catch (error) {
      console.error('Error fetching contact sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/contact-sections';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchContactSections();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save contact section');
      }
    } catch (error) {
      console.error('Error saving contact section:', error);
      alert('Failed to save contact section');
    }
  };

  const handleEdit = (section: ContactSection) => {
    setFormData({
      name: section.name,
      heading: section.heading,
      subheading: section.subheading || '',
      successMessage: section.successMessage,
      errorMessage: section.errorMessage,
      isActive: section.isActive
    });
    setEditingId(section.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    const section = contactSections.find(s => s.id === id);
    if (section?._count?.submissions && section._count.submissions > 0) {
      alert('Cannot delete contact section with existing submissions. Please delete submissions first.');
      return;
    }

    if (!confirm('Are you sure you want to delete this contact section? This will also delete all its fields.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contact-sections?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchContactSections();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete contact section');
      }
    } catch (error) {
      console.error('Error deleting contact section:', error);
      alert('Failed to delete contact section');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      heading: '',
      subheading: '',
      successMessage: 'Thank you for your message! We\'ll get back to you soon.',
      errorMessage: 'Sorry, there was an error sending your message. Please try again.',
      isActive: true
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSectionStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/contact-sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isActive: !isActive }),
      });

      if (response.ok) {
        await fetchContactSections();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update contact section');
      }
    } catch (error) {
      console.error('Error updating contact section:', error);
      alert('Failed to update contact section');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading contact sections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Sections</h2>
          <p className="text-gray-600">Manage contact forms and their configurations</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact Section</span>
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Contact Section' : 'Create New Contact Section'}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., General Contact Form"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heading *
                </label>
                <Input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => handleInputChange('heading', e.target.value)}
                  placeholder="e.g., Get in Touch"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subheading
              </label>
              <Input
                type="text"
                value={formData.subheading}
                onChange={(e) => handleInputChange('subheading', e.target.value)}
                placeholder="e.g., We'd love to hear from you"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Success Message *
              </label>
              <textarea
                value={formData.successMessage}
                onChange={(e) => handleInputChange('successMessage', e.target.value)}
                placeholder="Message shown when form is submitted successfully"
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Error Message *
              </label>
              <textarea
                value={formData.errorMessage}
                onChange={(e) => handleInputChange('errorMessage', e.target.value)}
                placeholder="Message shown when form submission fails"
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md resize-vertical"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>{editingId ? 'Update' : 'Create'} Contact Section</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Contact Sections List */}
      <div className="space-y-4">
        {contactSections.map((section) => (
          <Card key={section.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.name}
                  </h3>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    section.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {section.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-2">{section.heading}</p>
                {section.subheading && (
                  <p className="text-sm text-gray-500 mb-3">{section.subheading}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Settings className="w-4 h-4" />
                    <span>{section.fields?.length || 0} fields</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Database className="w-4 h-4" />
                    <span>{section._count?.submissions || 0} submissions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>Updated {new Date(section.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSectionStatus(section.id, section.isActive)}
                  title={section.isActive ? 'Deactivate' : 'Activate'}
                >
                  {section.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(section)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(section.id)}
                  className="text-red-600 hover:text-red-700"
                  disabled={Boolean(section._count?.submissions && section._count.submissions > 0)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {contactSections.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Contact Sections Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first contact section to start collecting user inquiries.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact Section
          </Button>
        </div>
      )}
    </div>
  );
} 
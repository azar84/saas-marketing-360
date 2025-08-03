'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Plus, Edit2, Trash2, Save, X, MessageSquare, FolderOpen, Search } from 'lucide-react';

interface FAQCategory {
  id: number;
  name: string;
  color: string;
}

interface FAQ {
  id: number;
  categoryId?: number;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  category?: FAQCategory;
  createdAt: string;
  updatedAt: string;
}

export default function FAQsManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    categoryId: '',
    question: '',
    answer: '',
    sortOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetchFaqs();
    fetchCategories();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/admin/faqs');
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      } else {
        console.error('Failed to fetch FAQs');
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/faq-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/faqs';
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
        await fetchFaqs();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ');
    }
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      categoryId: faq.categoryId?.toString() || '',
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive
    });
    setEditingId(faq.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/faqs?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFaqs();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ');
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      question: '',
      answer: '',
      sortOrder: 0,
      isActive: true
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || 
                           faq.categoryId?.toString() === selectedCategory ||
                           (selectedCategory === 'uncategorized' && !faq.categoryId);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div style={{ color: 'var(--color-text-secondary, #6B7280)' }}>Loading FAQs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary, #1F2937)' }}>Frequently Asked Questions</h2>
          <p style={{ color: 'var(--color-text-secondary, #6B7280)' }}>Manage your FAQ content and organize by categories</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add FAQ</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/4" style={{ color: 'var(--color-text-muted, #9CA3AF)' }} />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md"
              style={{ borderColor: 'var(--color-gray-light, #E5E7EB)' }}
            >
              <option value="">All Categories</option>
              <option value="uncategorized">Uncategorized</option>
              {categories.map(category => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit FAQ' : 'Create New FAQ'}
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
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  style={{ borderColor: 'var(--color-gray-light, #E5E7EB)' }}
                >
                  <option value="">No Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
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

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                Question *
              </label>
              <Input
                type="text"
                value={formData.question}
                onChange={(e) => handleInputChange('question', e.target.value)}
                placeholder="Enter the frequently asked question"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                Answer *
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                placeholder="Enter the answer to this question"
                required
                rows={6}
                className="w-full p-3 border rounded-md resize-vertical"
                style={{ borderColor: 'var(--color-gray-light, #E5E7EB)' }}
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
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
                <span>{editingId ? 'Update' : 'Create'} FAQ</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* FAQs List */}
      <div className="space-y-4">
        {filteredFaqs.map((faq) => (
          <Card key={faq.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {faq.category && (
                    <div
                      className="px-2 py-1 rounded-full text-xs text-white font-medium"
                      style={{ backgroundColor: faq.category.color }}
                    >
                      {faq.category.name}
                    </div>
                  )}
                  <span className="text-xs" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>Order: {faq.sortOrder}</span>
                  <div className="px-2 py-1 rounded-full text-xs" style={{
                    backgroundColor: faq.isActive 
                      ? 'var(--color-success-light, #D1FAE5)' 
                      : 'var(--color-gray-light, #E5E7EB)',
                    color: faq.isActive 
                      ? 'var(--color-success-dark, #065F46)' 
                      : 'var(--color-text-secondary, #6B7280)'
                  }}>
                    {faq.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
                  {faq.question}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary, #6B7280)' }}>
                  {faq.answer}
                </p>
              </div>
              <div className="flex items-center space-x-1 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(faq)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(faq.id)}
                  style={{ color: 'var(--color-error, #EF4444)' }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredFaqs.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted, #9CA3AF)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>
            {searchTerm || selectedCategory ? 'No FAQs Found' : 'No FAQs Yet'}
          </h3>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary, #6B7280)' }}>
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first FAQ to get started.'
            }
          </p>
          {!searchTerm && !selectedCategory && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 
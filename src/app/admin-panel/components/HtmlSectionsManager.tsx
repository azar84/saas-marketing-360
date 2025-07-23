'use client';

import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  FileText,
  Palette,
  Settings
} from 'lucide-react';

interface HtmlSection {
  id: number;
  name: string;
  description?: string;
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  pageHtmlSections: Array<{
    page: {
      id: number;
      title: string;
      slug: string;
    };
  }>;
  pageSections: Array<{
    page: {
      id: number;
      title: string;
      slug: string;
    };
  }>;
  _count: {
    pageHtmlSections: number;
    pageSections: number;
  };
}

interface FormData {
  name: string;
  description: string;
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  isActive: boolean;
  sortOrder: number;
}

const HtmlSectionsManager: React.FC = () => {
  const [htmlSections, setHtmlSections] = useState<HtmlSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<HtmlSection | null>(null);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    htmlContent: '',
    cssContent: '',
    jsContent: '',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchHtmlSections();
  }, []);

  const fetchHtmlSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/html-sections');
      if (!response.ok) throw new Error('Failed to fetch HTML sections');
      const data = await response.json();
      setHtmlSections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch HTML sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSection 
        ? `/api/admin/html-sections` 
        : '/api/admin/html-sections';
      
      const method = editingSection ? 'PUT' : 'POST';
      const payload = editingSection 
        ? { ...formData, id: editingSection.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save HTML section');
      
      await fetchHtmlSections();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save HTML section');
    }
  };

  const handleEdit = (section: HtmlSection) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      description: section.description || '',
      htmlContent: section.htmlContent,
      cssContent: section.cssContent || '',
      jsContent: section.jsContent || '',
      isActive: section.isActive,
      sortOrder: section.sortOrder
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this HTML section?')) return;
    
    try {
      const response = await fetch(`/api/admin/html-sections?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete HTML section');
      }
      
      await fetchHtmlSections();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete HTML section');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      htmlContent: '',
      cssContent: '',
      jsContent: '',
      isActive: true,
      sortOrder: 0
    });
    setEditingSection(null);
    setShowForm(false);
    setActiveTab('html');
    setPreviewMode(false);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const getUsageCount = (section: HtmlSection) => {
    return section._count.pageHtmlSections + section._count.pageSections;
  };

  const getUsagePages = (section: HtmlSection) => {
    const pages = [
      ...section.pageHtmlSections.map(p => p.page),
      ...section.pageSections.map(p => p.page)
    ];
    // Remove duplicates
    return pages.filter((page, index, self) => 
      index === self.findIndex(p => p.id === page.id)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">HTML Sections</h2>
          <p className="text-gray-600">Manage custom HTML code blocks for your pages</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add HTML Section
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* HTML Sections List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">HTML Sections ({htmlSections.length})</h3>
          
          {htmlSections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Code className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No HTML sections created yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Create your first HTML section
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {htmlSections.map((section) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{section.name}</h4>
                        {section.description && (
                          <p className="text-sm text-gray-600">{section.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        section.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleEdit(section)}
                        className="p-2 text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        disabled={getUsageCount(section) > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-4">
                      <span>Usage: {getUsageCount(section)} pages</span>
                      <span>Sort Order: {section.sortOrder}</span>
                    </div>
                    
                    {getUsageCount(section) > 0 && (
                      <div className="flex items-center gap-2">
                        <span>Used in:</span>
                        {getUsagePages(section).map((page, index) => (
                          <span key={page.id} className="inline-flex items-center gap-1">
                            <a 
                              href={`/${page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {page.title}
                            </a>
                            {index < getUsagePages(section).length - 1 && <span>,</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(section.htmlContent)}
                      className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy HTML
                    </button>
                    {section.cssContent && (
                      <button
                        onClick={() => copyToClipboard(section.cssContent || '')}
                        className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy CSS
                      </button>
                    )}
                    {section.jsContent && (
                      <button
                        onClick={() => copyToClipboard(section.jsContent || '')}
                        className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy JS
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">
                {editingSection ? 'Edit HTML Section' : 'Create HTML Section'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Custom Banner, Newsletter Signup"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of this HTML section"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>

                  {/* Code Editor Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex border-b">
                        <button
                          type="button"
                          onClick={() => setActiveTab('html')}
                          className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'html'
                              ? 'border-b-2 border-blue-600 text-blue-600'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          <FileText className="w-4 h-4 inline mr-2" />
                          HTML
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('css')}
                          className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'css'
                              ? 'border-b-2 border-blue-600 text-blue-600'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          <Palette className="w-4 h-4 inline mr-2" />
                          CSS
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('js')}
                          className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'js'
                              ? 'border-b-2 border-blue-600 text-blue-600'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          <Settings className="w-4 h-4 inline mr-2" />
                          JavaScript
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {previewMode ? 'Hide Preview' : 'Show Preview'}
                      </button>
                    </div>

                    {/* Code Editor */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        {activeTab === 'html' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              HTML Content *
                            </label>
                            <textarea
                              value={formData.htmlContent}
                              onChange={(e) => setFormData({...formData, htmlContent: e.target.value})}
                              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              placeholder="<div>Your HTML content here...</div>"
                              required
                            />
                          </div>
                        )}

                        {activeTab === 'css' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CSS Styles (Optional)
                            </label>
                            <textarea
                              value={formData.cssContent}
                              onChange={(e) => setFormData({...formData, cssContent: e.target.value})}
                              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              placeholder=".my-class { color: blue; }"
                            />
                          </div>
                        )}

                        {activeTab === 'js' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              JavaScript Code (Optional)
                            </label>
                            <textarea
                              value={formData.jsContent}
                              onChange={(e) => setFormData({...formData, jsContent: e.target.value})}
                              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              placeholder="console.log('Hello World!');"
                            />
                          </div>
                        )}
                      </div>

                      {/* Preview */}
                      {previewMode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preview
                          </label>
                          <div className="border border-gray-300 rounded-lg p-4 h-64 overflow-auto bg-gray-50">
                            <div 
                              dangerouslySetInnerHTML={{ __html: formData.htmlContent }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingSection ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlSectionsManager; 
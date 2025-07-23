'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Globe, 
  Eye, 
  EyeOff, 
  Save,
  X,
  Search,
  Calendar,
  Hash,
  ArrowUpDown
} from 'lucide-react';

interface Page {
  id: number;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDesc?: string;
  sortOrder: number;
  showInHeader: boolean;
  showInFooter: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    features?: number;
    featureGroups?: number;
  };
}

interface PageFormData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  sortOrder: number;
  showInHeader: boolean;
  showInFooter: boolean;
}

export default function PagesManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<PageFormData>({
    slug: '',
    title: '',
    metaTitle: '',
    metaDesc: '',
    sortOrder: 0,
    showInHeader: true,
    showInFooter: false
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages');
      const result = await response.json();
      
      if (result.success) {
        setPages(result.data);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to load pages' });
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      setMessage({ type: 'error', text: 'Failed to load pages' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PageFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title' && !editingPage) {
      const slug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const url = '/api/admin/pages';
      const method = editingPage ? 'PUT' : 'POST';
      const body = editingPage 
        ? { id: editingPage.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Page ${editingPage ? 'updated' : 'created'} successfully!` 
        });
        await fetchPages();
        handleCloseForm();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save page' });
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      setMessage({ type: 'error', text: 'Failed to save page' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      metaTitle: page.metaTitle || '',
      metaDesc: page.metaDesc || '',
      sortOrder: page.sortOrder,
      showInHeader: page.showInHeader,
      showInFooter: page.showInFooter
    });
    setShowForm(true);
  };

  const handleDelete = async (page: Page) => {
    // Prevent deletion of home page
    if (page.slug === 'home') {
      setMessage({ 
        type: 'error', 
        text: 'The home page cannot be deleted as it is required for the website to function properly.' 
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${page.title}"? This will also delete all associated content.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pages?id=${page.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Page deleted successfully!' });
        await fetchPages();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete page' });
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
      setMessage({ type: 'error', text: 'Failed to delete page' });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPage(null);
    setFormData({
      slug: '',
      title: '',
      metaTitle: '',
      metaDesc: '',
      sortOrder: 0,
      showInHeader: true,
      showInFooter: false
    });
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages Manager</h1>
          <p className="text-gray-600 mt-2">Manage your website pages and content structure</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Page
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/4 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pages Grid */}
      <div className="grid gap-6">
        {filteredPages.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No pages match your search criteria.' : 'Get started by creating your first page.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Page
              </Button>
            )}
          </Card>
        ) : (
          filteredPages.map((page) => (
            <Card key={page.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{page.title}</h3>
                    {page.slug === 'home' && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Default Home Page
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ArrowUpDown className="w-4 h-4" />
                      <span>Order: {page.sortOrder}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">/{page.slug}</span>
                  </div>

                  {page.metaDesc && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{page.metaDesc}</p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      <span>{page._count?.features || 0} Features</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      <span>{page._count?.featureGroups || 0} Feature Groups</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(page.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => handleEdit(page)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(page)}
                    variant="outline"
                    size="sm"
                    disabled={page.slug === 'home'}
                    className={page.slug === 'home' 
                      ? "text-gray-400 border-gray-200 cursor-not-allowed" 
                      : "text-red-600 border-red-200 hover:bg-red-50"
                    }
                    title={page.slug === 'home' ? 'Home page cannot be deleted' : 'Delete page'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPage ? 'Edit Page' : 'Create New Page'}
                </h2>
                <Button
                  onClick={handleCloseForm}
                  variant="outline"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter page title"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Navigation Order
                  </label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                    placeholder="0 = hidden, 1 = first, 2 = second..."
                    min="0"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    0 = Hidden from navigation, 1 = First position, 2 = Second position, etc.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="page-url-slug"
                  required
                  disabled={editingPage?.slug === 'home'}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingPage?.slug === 'home' 
                    ? 'The home page slug cannot be changed as it maps to the base URL (/)' 
                    : `This will be the URL path: /${formData.slug}`
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <Input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="SEO title for search engines"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDesc}
                  onChange={(e) => handleInputChange('metaDesc', e.target.value)}
                  placeholder="Brief description for search engines (150-160 characters)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Navigation Visibility */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Navigation Visibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="showInHeader"
                        checked={formData.showInHeader}
                        onChange={(e) => handleInputChange('showInHeader', e.target.checked)}
                        className="w-4 h-4 appearance-none bg-white border border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 checked:bg-blue-600 checked:border-blue-600"
                        style={{ appearance: 'none' }}
                      />
                      {formData.showInHeader && (
                        <svg
                          className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <label htmlFor="showInHeader" className="text-sm text-gray-700 cursor-pointer">
                      Show in Header Navigation
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="showInFooter"
                        checked={formData.showInFooter}
                        onChange={(e) => handleInputChange('showInFooter', e.target.checked)}
                        className="w-4 h-4 appearance-none bg-white border border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 checked:bg-blue-600 checked:border-blue-600"
                        style={{ appearance: 'none' }}
                      />
                      {formData.showInFooter && (
                        <svg
                          className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <label htmlFor="showInFooter" className="text-sm text-gray-700 cursor-pointer">
                      Show in Footer Navigation
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Control where this page appears in your site navigation. Pages can appear in both, one, or neither location.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {editingPage ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingPage ? 'Update Page' : 'Create Page'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleCloseForm}
                  variant="outline"
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 

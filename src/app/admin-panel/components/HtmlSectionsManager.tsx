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
  Settings,
  Type,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import MediaLibraryManager from './MediaLibraryManager';

// Dynamically import TinyMCE to avoid SSR issues
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => ({ default: mod.Editor })), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}></div>
});

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
  const [activeTab, setActiveTab] = useState<'rich-text' | 'html' | 'css' | 'js'>('rich-text');
  const [previewMode, setPreviewMode] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaCallback, setMediaCallback] = useState<((url: string, meta: any) => void) | null>(null);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    htmlContent: '',
    cssContent: '',
    jsContent: '',
    isActive: true,
    sortOrder: 0
  });

  // TinyMCE editor configuration
  const tinymceConfig = {
    height: 300,
    width: '100%',
    menubar: false,
    placeholder: 'Start typing your content here...',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
    ],

    toolbar: 'undo redo | styles | bold italic underline strikethrough | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | ' +
      'link image media | ' +
      'spacing-controls | ' +
      'removeformat | help',
    block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Blockquote=blockquote; Preformatted=pre; Code=code',
    style_formats: [
      {title: 'Paragraph', block: 'p'},
      {title: 'Heading 1', block: 'h1'},
      {title: 'Heading 2', block: 'h2'},
      {title: 'Heading 3', block: 'h3'},
      {title: 'Heading 4', block: 'h4'},
      {title: 'Heading 5', block: 'h5'},
      {title: 'Heading 6', block: 'h6'},
      {title: 'Blockquote', block: 'blockquote'},
      {title: 'Preformatted', block: 'pre'},
      {title: 'Code', block: 'code'}
    ],
    link_list: [
      {title: 'Home', value: '/'},
      {title: 'About', value: '/about'},
      {title: 'Contact', value: '/contact'},
      {title: 'Pricing', value: '/pricing'},
      {title: 'FAQ', value: '/faq'}
    ],
    image_title: true,
    automatic_uploads: true,
    file_picker_types: 'image',
    file_picker_callback: function (callback: (value: string, meta?: any) => void, value: string, meta: any) {
      // Store callback and open media library
      setMediaCallback(() => callback);
      setShowMediaLibrary(true);
    },
    media_live_embeds: true,
    media_alt_source: false,
    media_poster: false,
    media_dimensions: false,
    content_style: `
      body { font-family: 'Manrope', system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: var(--color-text-primary); }
      h1, h2, h3, h4, h5, h6 { font-weight: 600; margin-bottom: 0.5rem; color: var(--color-text-primary); }
      h1 { font-size: 1.875rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      h4 { font-size: 1.125rem; }
      h5 { font-size: 1rem; }
      h6 { font-size: 0.875rem; }
      ul, ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
      li { margin-bottom: 0.25rem; }
      blockquote { border-left: 4px solid var(--color-primary); padding-left: 1rem; margin: 1rem 0; font-style: italic; color: var(--color-text-secondary); }
      a { color: var(--color-primary); text-decoration: underline; }
      a:hover { color: var(--color-primary); }
      img { max-width: 100%; height: auto; border-radius: 0.375rem; margin: 0.5rem 0; }
      video { max-width: 100%; border-radius: 0.375rem; margin: 0.5rem 0; }
      iframe { max-width: 100%; border-radius: 0.375rem; margin: 0.5rem 0; }
      
      /* Placeholder styling */
      .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
        color: var(--color-text-muted) !important;
        opacity: 1;
      }
      
      /* Spacing Classes */
      .margin-xs { margin: 0.25rem !important; }
      .margin-sm { margin: 0.5rem !important; }
      .margin-md { margin: 1rem !important; }
      .margin-lg { margin: 1.5rem !important; }
      .margin-xl { margin: 2rem !important; }
      .margin-2xl { margin: 3rem !important; }
      
      .margin-top-xs { margin-top: 0.25rem !important; }
      .margin-top-sm { margin-top: 0.5rem !important; }
      .margin-top-md { margin-top: 1rem !important; }
      .margin-top-lg { margin-top: 1.5rem !important; }
      .margin-top-xl { margin-top: 2rem !important; }
      .margin-top-2xl { margin-top: 3rem !important; }
      
      .margin-bottom-xs { margin-bottom: 0.25rem !important; }
      .margin-bottom-sm { margin-bottom: 0.5rem !important; }
      .margin-bottom-md { margin-bottom: 1rem !important; }
      .margin-bottom-lg { margin-bottom: 1.5rem !important; }
      .margin-bottom-xl { margin-bottom: 2rem !important; }
      .margin-bottom-2xl { margin-bottom: 3rem !important; }
      
      .margin-left-xs { margin-left: 0.25rem !important; }
      .margin-left-sm { margin-left: 0.5rem !important; }
      .margin-left-md { margin-left: 1rem !important; }
      .margin-left-lg { margin-left: 1.5rem !important; }
      .margin-left-xl { margin-left: 2rem !important; }
      .margin-left-2xl { margin-left: 3rem !important; }
      
      .margin-right-xs { margin-right: 0.25rem !important; }
      .margin-right-sm { margin-right: 0.5rem !important; }
      .margin-right-md { margin-right: 1rem !important; }
      .margin-right-lg { margin-right: 1.5rem !important; }
      .margin-right-xl { margin-right: 2rem !important; }
      .margin-right-2xl { margin-right: 3rem !important; }
      
      .padding-xs { padding: 0.25rem !important; }
      .padding-sm { padding: 0.5rem !important; }
      .padding-md { padding: 1rem !important; }
      .padding-lg { padding: 1.5rem !important; }
      .padding-xl { padding: 2rem !important; }
      .padding-2xl { padding: 3rem !important; }
      
      .padding-top-xs { padding-top: 0.25rem !important; }
      .padding-top-sm { padding-top: 0.5rem !important; }
      .padding-top-md { padding-top: 1rem !important; }
      .padding-top-lg { padding-top: 1.5rem !important; }
      .padding-top-xl { padding-top: 2rem !important; }
      .padding-top-2xl { padding-top: 3rem !important; }
      
      .padding-bottom-xs { padding-bottom: 0.25rem !important; }
      .padding-bottom-sm { padding-bottom: 0.5rem !important; }
      .padding-bottom-md { padding-bottom: 1rem !important; }
      .padding-bottom-lg { padding-bottom: 1.5rem !important; }
      .padding-bottom-xl { padding-bottom: 2rem !important; }
      .padding-bottom-2xl { padding-bottom: 3rem !important; }
      
      .padding-left-xs { padding-left: 0.25rem !important; }
      .padding-left-sm { padding-left: 0.5rem !important; }
      .padding-left-md { padding-left: 1rem !important; }
      .padding-left-lg { padding-left: 1.5rem !important; }
      .padding-left-xl { padding-left: 2rem !important; }
      .padding-left-2xl { padding-left: 3rem !important; }
      
      .padding-right-xs { padding-right: 0.25rem !important; }
      .padding-right-sm { padding-right: 0.5rem !important; }
      .padding-right-md { padding-right: 1rem !important; }
      .padding-right-lg { padding-right: 1.5rem !important; }
      .padding-right-xl { padding-right: 2rem !important; }
      .padding-right-2xl { padding-right: 3rem !important; }
      
      .no-margin { margin: 0 !important; }
      .no-padding { padding: 0 !important; }
    `
  };

  useEffect(() => {
    fetchHtmlSections();
  }, []);

  const fetchHtmlSections = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('🔍 Fetching HTML sections...');
      const response = await fetch('/api/admin/html-sections');
      console.log('📡 Response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch HTML sections');
      const data = await response.json();
      console.log('📊 HTML sections data:', data);
      setHtmlSections(data);
    } catch (err) {
      console.error('❌ Error fetching HTML sections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch HTML sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/html-sections';
      const method = editingSection ? 'PUT' : 'POST';
      
                  const requestData = editingSection 
      ? { ...formData, id: editingSection.id }
      : formData;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to save HTML section: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      await fetchHtmlSections();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Submit error:', err);
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
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes('being used in pages')) {
          throw new Error('Cannot delete: This HTML section is being used in one or more pages. Please remove it from the Page Builder first, then try deleting again.');
        }
        throw new Error(errorData.error || 'Failed to delete HTML section');
      }

      await fetchHtmlSections();
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
    setActiveTab('rich-text');
    setPreviewMode(false);
    setShowForm(false);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const getUsageCount = (section: HtmlSection) => {
    return section._count.pageHtmlSections + section._count.pageSections;
  };

  const getUsagePages = (section: HtmlSection) => {
    const pages = new Map();
    
    section.pageHtmlSections.forEach(item => {
      pages.set(item.page.id, item.page);
    });
    
    section.pageSections.forEach(item => {
      pages.set(item.page.id, item.page);
    });
    
    return Array.from(pages.values());
  };

  const fetchMediaItems = async () => {
    try {
      setMediaLoading(true);
      
      // Use the correct API endpoint
      const endpoint = '/api/admin/media-library?page=1&limit=50&fileType=image';
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      // Extract media items from the correct response structure
      const media = data.data?.items || [];
      
      setMediaItems(media);
      
    } catch (error) {
      console.error('Failed to fetch media:', error);
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaSelect = (selectedMedia: any) => {
    if (mediaCallback && selectedMedia) {
      // Handle both single and multiple selections
      const mediaItem = Array.isArray(selectedMedia) ? selectedMedia[0] : selectedMedia;
      
      if (mediaItem && mediaItem.publicUrl) {
        mediaCallback(mediaItem.publicUrl, { 
          title: mediaItem.title || mediaItem.filename,
          alt: mediaItem.alt || mediaItem.title || mediaItem.filename
        });
      } else {
        console.error('Invalid media item:', mediaItem);
      }
    } else {
      console.error('No media callback or selected media');
    }
    
    setShowMediaLibrary(false);
    setMediaCallback(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>HTML Sections</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Manage custom HTML code blocks for your pages</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:opacity-90 transition-opacity"
          style={{ 
            backgroundColor: 'var(--color-primary)', 
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-primary)'
          }}
        >
          <Plus className="w-4 h-4" />
          Add HTML Section
        </button>
      </div>

      {error && (
        <div className="border rounded-lg p-4 flex items-center gap-2" style={{ backgroundColor: 'var(--color-error-light)', borderColor: 'var(--color-error)' }}>
          <AlertCircle className="w-5 h-5" style={{ color: 'var(--color-error)' }} />
          <span style={{ color: 'var(--color-error-dark)' }}>{error}</span>
        </div>
      )}

      {/* HTML Sections List */}
      <div className="rounded-xl p-6 shadow-sm border" style={{ 
        backgroundColor: 'var(--color-bg-secondary)', 
        borderColor: 'var(--color-gray-light)' 
      }}>
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>HTML Sections ({htmlSections.length})</h3>
          
          {htmlSections.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
              <Code className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-primary)' }}>No HTML sections created yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Create your first HTML section
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {htmlSections.map((section) => (
                <div key={section.id} className="border-2 rounded-lg p-4 transition-all duration-200" style={{ 
                  borderColor: section.isActive ? 'var(--color-gray-light)' : 'var(--color-text-muted)',
                  backgroundColor: section.isActive ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)',
                  opacity: section.isActive ? 1 : 0.6
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-info-light)' }}>
                        <Code className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{section.name}</h4>
                        {section.description && (
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{section.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                        backgroundColor: section.isActive 
                          ? 'var(--color-success-light)' 
                          : 'var(--color-gray-light)',
                        color: section.isActive 
                          ? 'var(--color-success-dark)' 
                          : 'var(--color-text-muted)'
                      }}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleEdit(section)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="p-1 rounded hover:bg-red-50 transition-colors"
                        style={{ color: 'var(--color-error)' }}
                        title="Delete HTML section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
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
                              style={{ color: 'var(--color-primary)' }}
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
                      className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 transition-colors" style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Copy className="w-3 h-3" />
                      Copy HTML
                    </button>
                    {section.cssContent && (
                      <button
                        onClick={() => copyToClipboard(section.cssContent || '')}
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 transition-colors" style={{ color: 'var(--color-text-muted)' }}
                      >
                        <Copy className="w-3 h-3" />
                        Copy CSS
                      </button>
                    )}
                    {section.jsContent && (
                      <button
                        onClick={() => copyToClipboard(section.jsContent || '')}
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 transition-colors" style={{ color: 'var(--color-text-muted)' }}
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {editingSection ? 'Edit HTML Section' : 'Create HTML Section'}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={resetForm}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Section Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-bg-primary)'
                        }}
                        placeholder="e.g., Custom Banner, Newsletter Signup"
                        required
                      />
                      <style jsx>{`
                        input::placeholder {
                          color: var(--color-text-muted) !important;
                          opacity: 1;
                        }
                        input::-webkit-input-placeholder {
                          color: var(--color-text-muted) !important;
                          opacity: 1;
                        }
                        input::-moz-placeholder {
                          color: var(--color-text-muted) !important;
                          opacity: 1;
                        }
                        input:-ms-input-placeholder {
                          color: var(--color-text-muted) !important;
                          opacity: 1;
                        }
                        input:-moz-placeholder {
                          color: var(--color-text-muted) !important;
                          opacity: 1;
                        }
                      `}</style>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-bg-primary)'
                        }}
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        borderColor: 'var(--color-gray-light)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-bg-primary)'
                      }}
                      placeholder="Brief description of this HTML section"
                    />
                    <style jsx>{`
                      input::placeholder {
                        color: var(--color-text-muted) !important;
                        opacity: 1;
                      }
                      input::-webkit-input-placeholder {
                        color: var(--color-text-muted) !important;
                        opacity: 1;
                      }
                      input::-moz-placeholder {
                        color: var(--color-text-muted) !important;
                        opacity: 1;
                      }
                      input:-ms-input-placeholder {
                        color: var(--color-text-muted) !important;
                        opacity: 1;
                      }
                      input:-moz-placeholder {
                        color: var(--color-text-muted) !important;
                        opacity: 1;
                      }
                    `}</style>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                      style={{ 
                        borderColor: 'var(--color-gray-light)',
                        backgroundColor: formData.isActive ? 'var(--color-primary)' : 'var(--color-bg-primary)'
                      }}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Active
                    </label>
                  </div>

                  {/* Code Editor Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
                        <button
                          type="button"
                          onClick={() => setActiveTab('rich-text')}
                          className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                          style={{
                            borderColor: activeTab === 'rich-text' ? 'var(--color-primary)' : 'transparent',
                            color: activeTab === 'rich-text' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                          }}
                        >
                          <Type className="mr-2 h-5 w-5 transition-colors" />
                          Rich Text Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('html')}
                          className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                          style={{
                            borderColor: activeTab === 'html' ? 'var(--color-primary)' : 'transparent',
                            color: activeTab === 'html' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                          }}
                        >
                          <FileText className="mr-2 h-5 w-5 transition-colors" />
                          HTML
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('css')}
                          className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                          style={{
                            borderColor: activeTab === 'css' ? 'var(--color-primary)' : 'transparent',
                            color: activeTab === 'css' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                          }}
                        >
                          <Palette className="mr-2 h-5 w-5 transition-colors" />
                          CSS
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('js')}
                          className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                          style={{
                            borderColor: activeTab === 'js' ? 'var(--color-primary)' : 'transparent',
                            color: activeTab === 'js' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                          }}
                        >
                          <Settings className="mr-2 h-5 w-5 transition-colors" />
                          JavaScript
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:opacity-80 transition-opacity"
                        style={{ 
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-bg-primary)'
                        }}
                      >
                        {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {previewMode ? 'Hide Preview' : 'Show Preview'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          alert('Check browser console for HTML content');
                        }}
                        className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:opacity-80 transition-opacity"
                        style={{ 
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-bg-primary)'
                        }}
                      >
                        <Code className="w-4 h-4" />
                        Debug HTML
                      </button>
                    </div>

                    {/* Code Editor */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="w-full">
                        {activeTab === 'rich-text' && (
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              Rich Text Content *
                            </label>
                            <div className="border-2 rounded-lg w-full" style={{ 
                              borderColor: 'var(--color-gray-light)',
                              backgroundColor: 'var(--color-bg-primary)'
                            }}>
                              <Editor
                                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || process.env.TINYMCE_API_KEY}
                                value={formData.htmlContent}
                                onEditorChange={(content) => setFormData({...formData, htmlContent: content})}
                                init={{
                                  ...tinymceConfig,
                                  setup: (editor: any) => {
                                    
                                    // Helper function to apply spacing classes
                                    const applySpacingClass = (className: string, type: 'margin' | 'padding') => {
                                      const selectedNode = editor.selection.getNode();
                                      if (selectedNode.nodeType === 1) {
                                        // Remove all existing spacing classes of the same type
                                        const allClasses = type === 'margin' 
                                          ? ['no-margin', 'margin-xs', 'margin-sm', 'margin-md', 'margin-lg', 'margin-xl', 'margin-2xl', 'margin-top-xs', 'margin-top-sm', 'margin-top-md', 'margin-top-lg', 'margin-top-xl', 'margin-top-2xl', 'margin-bottom-xs', 'margin-bottom-sm', 'margin-bottom-md', 'margin-bottom-lg', 'margin-bottom-xl', 'margin-bottom-2xl', 'margin-left-xs', 'margin-left-sm', 'margin-left-md', 'margin-left-lg', 'margin-left-xl', 'margin-left-2xl', 'margin-right-xs', 'margin-right-sm', 'margin-right-md', 'margin-right-lg', 'margin-right-xl', 'margin-right-2xl']
                                          : ['no-padding', 'padding-xs', 'padding-sm', 'padding-md', 'padding-lg', 'padding-xl', 'padding-2xl', 'padding-top-xs', 'padding-top-sm', 'padding-top-md', 'padding-top-lg', 'padding-top-xl', 'padding-top-2xl', 'padding-bottom-xs', 'padding-bottom-sm', 'padding-bottom-md', 'padding-bottom-lg', 'padding-bottom-xl', 'padding-bottom-2xl', 'padding-left-xs', 'padding-left-sm', 'padding-left-md', 'padding-left-lg', 'padding-left-xl', 'padding-left-2xl', 'padding-right-xs', 'padding-right-sm', 'padding-right-md', 'padding-right-lg', 'padding-right-xl', 'padding-right-2xl'];
                                        
                                        allClasses.forEach(cls => selectedNode.classList.remove(cls));
                                        selectedNode.classList.add(className);
                                        
                                        editor.fire('change'); // Trigger change event
                                      }
                                    };

                                    // Helper function to remove all spacing classes
                                    const removeAllSpacing = () => {
                                      const selectedNode = editor.selection.getNode();
                                      if (selectedNode.nodeType === 1) {
                                        const allSpacingClasses = [
                                          'no-margin', 'margin-xs', 'margin-sm', 'margin-md', 'margin-lg', 'margin-xl', 'margin-2xl', 
                                          'margin-top-xs', 'margin-top-sm', 'margin-top-md', 'margin-top-lg', 'margin-top-xl', 'margin-top-2xl', 
                                          'margin-bottom-xs', 'margin-bottom-sm', 'margin-bottom-md', 'margin-bottom-lg', 'margin-bottom-xl', 'margin-bottom-2xl', 
                                          'margin-left-xs', 'margin-left-sm', 'margin-left-md', 'margin-left-lg', 'margin-left-xl', 'margin-left-2xl', 
                                          'margin-right-xs', 'margin-right-sm', 'margin-right-md', 'margin-right-lg', 'margin-right-xl', 'margin-right-2xl',
                                          'no-padding', 'padding-xs', 'padding-sm', 'padding-md', 'padding-lg', 'padding-xl', 'padding-2xl', 
                                          'padding-top-xs', 'padding-top-sm', 'padding-top-md', 'padding-top-lg', 'padding-top-xl', 'padding-top-2xl', 
                                          'padding-bottom-xs', 'padding-bottom-sm', 'padding-bottom-md', 'padding-bottom-lg', 'padding-bottom-xl', 'padding-bottom-2xl', 
                                          'padding-left-xs', 'padding-left-sm', 'padding-left-md', 'padding-left-lg', 'padding-left-xl', 'padding-left-2xl', 
                                          'padding-right-xs', 'padding-right-sm', 'padding-right-md', 'padding-right-lg', 'padding-right-xl', 'padding-right-2xl'
                                        ];
                                        
                                        allSpacingClasses.forEach(cls => selectedNode.classList.remove(cls));
                                        
                                        editor.fire('change'); // Trigger change event
                                      }
                                    };
                                    
                                    // Add spacing controls to toolbar
                                    editor.ui.registry.addMenuButton('spacing-controls', {
                                      text: 'Spacing',
                                      fetch: function (callback: any) {
                                        const items = [
                                          { type: 'menuitem', text: 'Remove All Spacing', onAction: removeAllSpacing },
                                          { type: 'separator' },
                                          {
                                            type: 'menuitem',
                                            text: 'Margins',
                                            getSubmenuItems: function () {
                                              return [
                                                { type: 'menuitem', text: 'No Margin', onAction: () => applySpacingClass('no-margin', 'margin') },
                                                { type: 'separator' },
                                                { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('margin-xs', 'margin') },
                                                { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('margin-sm', 'margin') },
                                                { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('margin-md', 'margin') },
                                                { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('margin-lg', 'margin') },
                                                { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('margin-xl', 'margin') },
                                                { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('margin-2xl', 'margin') }
                                              ];
                                            }
                                          },
                                          {
                                            type: 'menuitem',
                                            text: 'Padding',
                                            getSubmenuItems: function () {
                                              return [
                                                { type: 'menuitem', text: 'No Padding', onAction: () => applySpacingClass('no-padding', 'padding') },
                                                { type: 'separator' },
                                                { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('padding-xs', 'padding') },
                                                { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('padding-sm', 'padding') },
                                                { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('padding-md', 'padding') },
                                                { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('padding-lg', 'padding') },
                                                { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('padding-xl', 'padding') },
                                                { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('padding-2xl', 'padding') }
                                              ];
                                            }
                                          },
                                          { type: 'separator' },
                                          {
                                            type: 'menuitem',
                                            text: 'Top Margin',
                                            getSubmenuItems: function () {
                                              return [
                                                { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('margin-top-xs', 'margin') },
                                                { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('margin-top-sm', 'margin') },
                                                { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('margin-top-md', 'margin') },
                                                { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('margin-top-lg', 'margin') },
                                                { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('margin-top-xl', 'margin') },
                                                { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('margin-top-2xl', 'margin') }
                                              ];
                                            }
                                          },
                                          {
                                            type: 'menuitem',
                                            text: 'Bottom Margin',
                                            getSubmenuItems: function () {
                                              return [
                                                { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('margin-bottom-xs', 'margin') },
                                                { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('margin-bottom-sm', 'margin') },
                                                { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('margin-bottom-md', 'margin') },
                                                { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('margin-bottom-lg', 'margin') },
                                                { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('margin-bottom-xl', 'margin') },
                                                { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('margin-bottom-2xl', 'margin') }
                                              ];
                                            }
                                          },
                                          {
                                            type: 'menuitem',
                                            text: 'Left Margin',
                                            getSubmenuItems: function () {
                                              return [
                                                { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('margin-left-xs', 'margin') },
                                                { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('margin-left-sm', 'margin') },
                                                { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('margin-left-md', 'margin') },
                                                { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('margin-left-lg', 'margin') },
                                                { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('margin-left-xl', 'margin') },
                                                { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('margin-left-2xl', 'margin') }
                                              ];
                                            }
                                          },
                                          {
                                            type: 'menuitem',
                                            text: 'Right Margin',
                                            getSubmenuItems: function () {
                                              return [
                                                { type: 'menuitem', text: 'Extra Small (0.25rem)', onAction: () => applySpacingClass('margin-right-xs', 'margin') },
                                                { type: 'menuitem', text: 'Small (0.5rem)', onAction: () => applySpacingClass('margin-right-sm', 'margin') },
                                                { type: 'menuitem', text: 'Medium (1rem)', onAction: () => applySpacingClass('margin-right-md', 'margin') },
                                                { type: 'menuitem', text: 'Large (1.5rem)', onAction: () => applySpacingClass('margin-right-lg', 'margin') },
                                                { type: 'menuitem', text: 'Extra Large (2rem)', onAction: () => applySpacingClass('margin-right-xl', 'margin') },
                                                { type: 'menuitem', text: '2XL (3rem)', onAction: () => applySpacingClass('margin-right-2xl', 'margin') }
                                              ];
                                            }
                                          }
                                        ];
                                        callback(items);
                                      }
                                    });
                                  }
                                }}
                              />
                            </div>
                            <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                              <p className="mb-2">Use the rich text editor to create formatted content. The content will be automatically converted to HTML.</p>
                              <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></span>
                                  <span>Click the <strong>link</strong> button to add URLs</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></span>
                                  <span>Click the <strong>image</strong> button to add media from your library</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                  <span>Click the <strong>media</strong> button to embed videos/iframes</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                  <span>Click the <strong>spacing</strong> button to add margins and padding</span>
                                </div>
                              </div>
                              <div className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                <strong>Tip:</strong> Select text or elements first, then apply spacing. Use "Remove All Spacing" to clear all spacing classes. Use the "Debug HTML" button to see the generated code. Spacing classes are now available on the frontend where your HTML sections are displayed.
                              </div>
                              {showMediaLibrary && (
                                <div className="mt-2 p-2 border rounded" style={{ backgroundColor: 'var(--color-info-light)', borderColor: 'var(--color-info-light)', color: 'var(--color-info-dark)' }}>
                                  Media library is open - select an image and click "Confirm Selection"
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {activeTab === 'html' && (
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              HTML Content *
                            </label>
                            <textarea
                              value={formData.htmlContent}
                              onChange={(e) => setFormData({...formData, htmlContent: e.target.value})}
                              className="w-full h-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              placeholder="<div>Your HTML content here...</div>"
                              required
                              style={{ 
                                borderColor: 'var(--color-gray-light)',
                                color: 'var(--color-text-primary)',
                                backgroundColor: 'var(--color-bg-primary)'
                              }}
                            />
                            <style jsx>{`
                              textarea::placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea::-webkit-input-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea::-moz-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea:-ms-input-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea:-moz-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                            `}</style>
                          </div>
                        )}

                        {activeTab === 'css' && (
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              CSS Styles (Optional)
                            </label>
                            <textarea
                              value={formData.cssContent}
                              onChange={(e) => setFormData({...formData, cssContent: e.target.value})}
                              className="w-full h-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              placeholder=".my-class { color: blue; }"
                              style={{ 
                                borderColor: 'var(--color-gray-light)',
                                color: 'var(--color-text-primary)',
                                backgroundColor: 'var(--color-bg-primary)'
                              }}
                            />
                            <style jsx>{`
                              textarea::placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea::-webkit-input-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea::-moz-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea:-ms-input-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea:-moz-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                            `}</style>
                          </div>
                        )}

                        {activeTab === 'js' && (
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              JavaScript Code (Optional)
                            </label>
                            <textarea
                              value={formData.jsContent}
                              onChange={(e) => setFormData({...formData, jsContent: e.target.value})}
                              className="w-full h-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              placeholder="console.log('Hello World!');"
                              style={{ 
                                borderColor: 'var(--color-gray-light)',
                                color: 'var(--color-text-primary)',
                                backgroundColor: 'var(--color-bg-primary)'
                              }}
                            />
                            <style jsx>{`
                              textarea::placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea::-webkit-input-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea::-moz-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea:-ms-input-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                              textarea:-moz-placeholder {
                                color: var(--color-text-muted) !important;
                                opacity: 1;
                              }
                            `}</style>
                          </div>
                        )}
                      </div>

                      {/* Preview */}
                      {previewMode && (
                        <div className="w-full">
                          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                            Preview
                          </label>
                          <div className="border rounded-lg p-4 h-64 overflow-y-auto" style={{ 
                            borderColor: 'var(--color-gray-light)', 
                            backgroundColor: 'var(--color-bg-secondary)',
                            color: 'var(--color-text-primary)'
                          }}>
                            <style dangerouslySetInnerHTML={{ __html: formData.cssContent }} />
                            <div dangerouslySetInnerHTML={{ __html: formData.htmlContent }} />
                            {formData.jsContent && (
                              <script dangerouslySetInnerHTML={{ __html: formData.jsContent }} />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 p-6 border-t flex-shrink-0" style={{ 
                borderColor: 'var(--color-gray-light)', 
                backgroundColor: 'var(--color-bg-primary)' 
              }}>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg font-medium hover:opacity-80 transition-opacity"
                  style={{ 
                    color: 'var(--color-text-primary)', 
                    borderColor: 'var(--color-gray-light)',
                    backgroundColor: 'var(--color-bg-primary)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: 'var(--color-primary)', 
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-primary)'
                  }}
                >
                  <Save className="w-4 h-4" />
                  {editingSection ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999]">
          <MediaLibraryManager
            isSelectionMode={true}
            onSelect={handleMediaSelect}
            onClose={() => setShowMediaLibrary(false)}
            allowMultiple={false}
            acceptedTypes={['image']}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default HtmlSectionsManager; 
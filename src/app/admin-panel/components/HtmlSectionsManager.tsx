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
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
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
    height: 400,
    width: '100%',
    menubar: false,
    placeholder: 'Start typing your content here...',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatselect | bold italic underline strikethrough | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | ' +
      'link image media | ' +
      'forecolor backcolor | ' +
      'removeformat | help',
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
    file_picker_callback: function (callback, value, meta) {
      console.log('File picker callback triggered', { value, meta });
      
      // Store callback and open media library
      setMediaCallback(() => callback);
      setShowMediaLibrary(true);
      console.log('Media library should be opening...');
    },
    media_live_embeds: true,
    media_alt_source: false,
    media_poster: false,
    media_dimensions: false,
    content_style: `
      body { font-family: 'Manrope', system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #374151; }
      h1, h2, h3, h4, h5, h6 { font-weight: 600; margin-bottom: 0.5rem; color: #1f2937; }
      h1 { font-size: 1.875rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      h4 { font-size: 1.125rem; }
      h5 { font-size: 1rem; }
      h6 { font-size: 0.875rem; }
      ul, ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
      li { margin-bottom: 0.25rem; }
      blockquote { border-left: 4px solid #5243E9; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #6b7280; }
      a { color: #5243E9; text-decoration: underline; }
      a:hover { color: #4338CA; }
      img { max-width: 100%; height: auto; border-radius: 0.375rem; margin: 0.5rem 0; }
      video { max-width: 100%; border-radius: 0.375rem; margin: 0.5rem 0; }
      iframe { max-width: 100%; border-radius: 0.375rem; margin: 0.5rem 0; }
    `
  };

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
      const url = '/api/admin/html-sections';
      const method = editingSection ? 'PUT' : 'POST';
      
      const requestData = editingSection 
        ? { ...formData, id: editingSection.id }
        : formData;
      
      console.log('Submitting form data:', requestData);
      console.log('URL:', url);
      console.log('Method:', method);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to save HTML section: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Success response:', result);

      await fetchHtmlSections();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save HTML section');
    }
  };

  const handleEdit = (section: HtmlSection) => {
    console.log('Editing section:', section);
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
    console.log('Form should be visible now');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this HTML section?')) return;
    
    try {
      const response = await fetch(`/api/admin/html-sections?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete HTML section');

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
      console.log('Fetching media items...');
      
      // Use the correct API endpoint
      const endpoint = '/api/admin/media-library?page=1&limit=50&fileType=image';
      console.log('Using endpoint:', endpoint);
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      // Extract media items from the correct response structure
      const media = data.data?.items || [];
      console.log('Extracted media items:', media);
      
      console.log('Setting media items:', media);
      setMediaItems(media);
      
    } catch (error) {
      console.error('Failed to fetch media:', error);
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaSelect = (selectedMedia: any) => {
    console.log('Media selected:', selectedMedia);
    console.log('Media callback exists:', !!mediaCallback);
    
    if (mediaCallback && selectedMedia) {
      // Handle both single and multiple selections
      const mediaItem = Array.isArray(selectedMedia) ? selectedMedia[0] : selectedMedia;
      
      if (mediaItem && mediaItem.publicUrl) {
        console.log('Calling media callback with:', mediaItem.publicUrl);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">
                {editingSection ? 'Edit HTML Section' : 'Create HTML Section'}
              </h3>
              <div className="flex items-center gap-4">
                {/* Debug info */}
                <div className="text-xs text-gray-500">
                  Modal: {showForm ? 'Visible' : 'Hidden'}
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
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
                          onClick={() => setActiveTab('rich-text')}
                          className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'rich-text'
                              ? 'border-b-2 border-blue-600 text-blue-600'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          <Type className="w-4 h-4 inline mr-2" />
                          Rich Text Editor
                        </button>
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
                    <div className="grid grid-cols-1 gap-4">
                      <div className="w-full">
                        {activeTab === 'rich-text' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rich Text Content *
                            </label>
                            <div className="border border-gray-300 rounded-lg w-full">
                              <Editor
                                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || process.env.TINYMCE_API_KEY}
                                value={formData.htmlContent}
                                onEditorChange={(content) => setFormData({...formData, htmlContent: content})}
                                init={{
                                  ...tinymceConfig,
                                  setup: (editor) => {
                                    console.log('TinyMCE API Key:', process.env.NEXT_PUBLIC_TINYMCE_API_KEY || process.env.TINYMCE_API_KEY);
                                    console.log('TinyMCE Editor Setup Complete');
                                  }
                                }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                              <p>Use the rich text editor to create formatted content. The content will be automatically converted to HTML.</p>
                              <div className="flex flex-wrap gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  <span>Click the <strong>link</strong> button to add URLs</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  <span>Click the <strong>image</strong> button to add media from your library</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                  <span>Click the <strong>media</strong> button to embed videos/iframes</span>
                                </div>
                              </div>
                              {showMediaLibrary && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
                                  Media library is open - select an image and click "Confirm Selection"
                                </div>
                              )}
                            </div>
                          </div>
                        )}

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
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preview
                          </label>
                          <div className="border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
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
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 flex-shrink-0">
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
                {/* Debug info */}
                <div className="text-xs text-gray-500">
                  Editing: {editingSection ? 'Yes' : 'No'} | Media Modal: {showMediaLibrary ? 'Open' : 'Closed'}
                </div>
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
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
  Zap,
  Activity
} from 'lucide-react';

interface ScriptSection {
  id: number;
  name: string;
  description?: string;
  scriptType: string;
  scriptContent: string;
  placement: string;
  isActive: boolean;
  loadAsync: boolean;
  loadDefer: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  scriptContent: string;
  isActive: boolean;
}

const ScriptSectionManager: React.FC = () => {
  const [scriptSections, setScriptSections] = useState<ScriptSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptSection | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    scriptContent: '',
    isActive: true
  });

  useEffect(() => {
    fetchScriptSections();
  }, []);

  const fetchScriptSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/script-sections');
      if (!response.ok) throw new Error('Failed to fetch script sections');
      const data = await response.json();
      setScriptSections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch script sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/script-sections';
      const method = editingScript ? 'PUT' : 'POST';
      
      const payload = editingScript 
        ? { 
            id: editingScript.id,
            name: formData.name,
            description: formData.description,
            scriptContent: formData.scriptContent,
            isActive: formData.isActive
          }
        : {
            name: formData.name,
            description: formData.description,
            scriptContent: formData.scriptContent,
            isActive: formData.isActive
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save script section');
      
      await fetchScriptSections();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save script section');
    }
  };

  const handleEdit = (script: ScriptSection) => {
    setEditingScript(script);
    setFormData({
      name: script.name,
      description: script.description || '',
      scriptContent: script.scriptContent,
      isActive: script.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this script section?')) return;
    
    try {
      const response = await fetch(`/api/admin/script-sections/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete script section');
      
      await fetchScriptSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete script section');
    }
  };

  const toggleActive = async (script: ScriptSection) => {
    try {
      const response = await fetch(`/api/admin/script-sections/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...script, isActive: !script.isActive })
      });
      
      if (!response.ok) throw new Error('Failed to update script section');
      
      await fetchScriptSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update script section');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      scriptContent: '',
      isActive: true
    });
    setEditingScript(null);
    setShowForm(false);
    setError(null);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const getScriptPreview = (content: string) => {
    const preview = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').trim();
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Script Installation</h2>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Manage JavaScript scripts that are automatically injected into the footer
          </p>
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
          Add Script
        </button>
      </div>

      {error && (
        <div className="border rounded-lg p-4 flex items-center gap-2" style={{ backgroundColor: 'var(--color-error-light)', borderColor: 'var(--color-error)' }}>
          <AlertCircle className="w-5 h-5" style={{ color: 'var(--color-error)' }} />
          <span style={{ color: 'var(--color-error-dark)' }}>{error}</span>
        </div>
      )}

      <div className="rounded-xl p-6 shadow-sm border" style={{ 
        backgroundColor: 'var(--color-bg-secondary)', 
        borderColor: 'var(--color-gray-light)' 
      }}>
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Scripts ({scriptSections.length})</h3>
          
          {scriptSections.length === 0 ? (
            <div className="text-center py-12">
              <Code className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No scripts installed</h3>
              <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>Add your first script to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: 'var(--color-primary)', 
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-primary)'
                }}
              >
                Add Script
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {scriptSections.map((script) => (
                <div key={script.id} className="border-2 rounded-lg p-4 transition-all duration-200" style={{ 
                  borderColor: script.isActive ? 'var(--color-gray-light)' : 'var(--color-text-muted)',
                  backgroundColor: script.isActive ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)',
                  opacity: script.isActive ? 1 : 0.6
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                        backgroundColor: script.isActive ? 'var(--color-success-light)' : 'var(--color-gray-light)'
                      }}>
                        {script.isActive ? (
                          <Activity className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                        ) : (
                          <Code className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{script.name}</h4>
                        {script.description && (
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{script.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs" style={{
                        backgroundColor: script.isActive 
                          ? 'var(--color-success-light)' 
                          : 'var(--color-gray-light)',
                        color: script.isActive 
                          ? 'var(--color-success-dark)' 
                          : 'var(--color-text-secondary)'
                      }}>
                        {script.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => toggleActive(script)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                        title={script.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {script.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(script)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(script.id)}
                        className="p-1 rounded hover:bg-red-50 transition-colors"
                        style={{ color: 'var(--color-error)' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Script Content</span>
                      <button
                        onClick={() => copyToClipboard(script.scriptContent)}
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 transition-colors" style={{ color: 'var(--color-text-muted)' }}
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <pre className="text-xs whitespace-pre-wrap break-all" style={{ color: 'var(--color-text-secondary)' }}>
                      {getScriptPreview(script.scriptContent)}
                    </pre>
                  </div>

                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>Auto-injected in Footer</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                      <span>JavaScript Only</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {editingScript ? 'Edit Script' : 'Add New Script'}
              </h3>
              <button
                onClick={resetForm}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Script Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        borderColor: 'var(--color-gray-light)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-bg-primary)'
                      }}
                      placeholder="e.g., Google Analytics, Facebook Pixel"
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
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        borderColor: 'var(--color-gray-light)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-bg-primary)'
                      }}
                      placeholder="Brief description of what this script does"
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
                      Script Content *
                    </label>
                    <textarea
                      value={formData.scriptContent}
                      onChange={(e) => setFormData({ ...formData, scriptContent: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      style={{ 
                        borderColor: 'var(--color-gray-light)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-bg-primary)'
                      }}
                      placeholder="Paste your JavaScript code here..."
                      required
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
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Scripts are automatically injected into the footer of all pages
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="mr-3 w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                          style={{ 
                            borderColor: 'var(--color-gray-light)',
                            backgroundColor: formData.isActive ? 'var(--color-primary)' : 'var(--color-bg-primary)'
                          }}
                        />
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Enable Script</span>
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>When enabled, this script will be automatically loaded on all pages</p>
                        </div>
                      </label>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium" style={{
                      backgroundColor: formData.isActive 
                        ? 'var(--color-success-light)' 
                        : 'var(--color-gray-light)',
                      color: formData.isActive 
                        ? 'var(--color-success-dark)' 
                        : 'var(--color-text-secondary)'
                    }}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>

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
                  {editingScript ? 'Update Script' : 'Add Script'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptSectionManager; 
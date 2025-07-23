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
      
      // Prepare simplified payload
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

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save script section');
      
      await fetchScriptSections();
      resetForm();
      setError(null);
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
      const response = await fetch(`/api/admin/script-sections?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete script section');
      
      await fetchScriptSections();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete script section');
    }
  };

  const toggleActive = async (script: ScriptSection) => {
    try {
      const response = await fetch('/api/admin/script-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: script.id,
          isActive: !script.isActive
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update script section');
      
      await fetchScriptSections();
      setError(null);
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
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const getScriptPreview = (content: string) => {
    const preview = content.replace(/\s+/g, ' ').trim();
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Script Installation</h2>
          <p className="text-gray-600 mt-1">
            Manage JavaScript scripts that are automatically injected into the footer
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Script
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Scripts List */}
      <div className="space-y-4">
        {scriptSections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scripts installed</h3>
            <p className="text-gray-500 mb-4">Add your first script to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Script
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {scriptSections.map((script) => (
              <div key={script.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      script.isActive ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {script.isActive ? (
                        <Activity className="w-5 h-5 text-green-600" />
                      ) : (
                        <Code className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{script.name}</h4>
                      {script.description && (
                        <p className="text-sm text-gray-600">{script.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      script.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {script.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => toggleActive(script)}
                      className="p-2 text-gray-600 hover:text-blue-600"
                      title={script.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {script.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(script)}
                      className="p-2 text-gray-600 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(script.id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Script Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Script Content</span>
                    <button
                      onClick={() => copyToClipboard(script.scriptContent)}
                      className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
                    {getScriptPreview(script.scriptContent)}
                  </pre>
                </div>

                {/* Script Options */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>Auto-injected in Footer</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>JavaScript Only</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">
                {editingScript ? 'Edit Script' : 'Add New Script'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Script Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Google Analytics, Facebook Pixel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of what this script does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JavaScript Code *
                </label>
                <textarea
                  value={formData.scriptContent}
                  onChange={(e) => setFormData({ ...formData, scriptContent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm"
                  placeholder="Enter your JavaScript code here...

Examples:
// Google Analytics
gtag('config', 'GA_MEASUREMENT_ID');

// Facebook Pixel
fbq('track', 'PageView');

// Custom tracking
console.log('Page loaded');"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Scripts are automatically injected into the footer of all pages
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Enable Script</span>
                      <p className="text-xs text-gray-500">When enabled, this script will be automatically loaded on all pages</p>
                    </div>
                  </label>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  formData.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Upload, 
  Search, 
  Grid, 
  List, 
  Eye, 
  Trash2, 
  X, 
  Link, 
  Image, 
  Video, 
  FileText, 
  Music, 
  File,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  CloudUpload
} from 'lucide-react';

interface MediaItem {
  id: number;
  filename: string;
  title?: string;
  description?: string;
  alt?: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  fileSize: number;
  publicUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaLibraryManagerProps {
  isSelectionMode?: boolean;
  allowMultiple?: boolean;
  acceptedTypes?: string[];
  onSelect?: (media: MediaItem | MediaItem[]) => void;
  onClose?: () => void;
  selectedMedia?: MediaItem | MediaItem[];
  designSystem?: {
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
    backgroundPrimary?: string;
    backgroundSecondary?: string;
    primary?: string;
    primaryLight?: string;
  };
}

interface UploadProgress {
  [key: string]: {
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  };
}

const MediaLibraryManager: React.FC<MediaLibraryManagerProps> = ({
  isSelectionMode = false,
  allowMultiple = false,
  acceptedTypes = [],
  onSelect,
  onClose,
  selectedMedia = allowMultiple ? [] : null,
  designSystem
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>(
    Array.isArray(selectedMedia) ? selectedMedia : selectedMedia ? [selectedMedia] : []
  );
  const [dragActive, setDragActive] = useState(false);
  const [showUrlImport, setShowUrlImport] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMedia();
  }, [searchTerm, fileTypeFilter]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(fileTypeFilter !== 'all' && { fileType: fileTypeFilter })
      });

      const response = await fetch(`/api/admin/media-library?${params}`);
      const result = await response.json();

      if (result.success) {
        setMedia(result.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;

    setUploading(true);
    const newUploadProgress: UploadProgress = {};

    // Initialize progress tracking
    files.forEach((file, index) => {
      const fileId = `${file.name}-${Date.now()}-${index}`;
      newUploadProgress[fileId] = {
        file,
        progress: 0,
        status: 'uploading'
      };
    });

    setUploadProgress(newUploadProgress);

    try {
      // Upload files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${file.name}-${Date.now()}-${i}`;
        
        const formData = new FormData();
        formData.append('file', file);

        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], progress: 25 }
        }));

        const response = await fetch('/api/admin/media-library', {
          method: 'POST',
          body: formData
        });

        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], progress: 75 }
        }));

        const result = await response.json();

        if (result.success) {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: { ...prev[fileId], progress: 100, status: 'success' }
          }));
        } else {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: { 
              ...prev[fileId], 
              status: 'error', 
              error: result.message || 'Upload failed' 
            }
          }));
        }
      }

      // Refresh media list and clear progress after a delay
      await fetchMedia();
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      Object.keys(newUploadProgress).forEach(fileId => {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { 
            ...prev[fileId], 
            status: 'error', 
            error: 'Upload failed' 
          }
        }));
      });
    } finally {
      setUploading(false);
    }
  };

  const handleItemSelect = (item: MediaItem) => {
    if (!isSelectionMode) return;

    if (allowMultiple) {
      const isSelected = selectedItems.some(selected => selected.id === item.id);
      if (isSelected) {
        setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    } else {
      // For single selection, just mark as selected but don't auto-select
      setSelectedItems([item]);
    }
  };

  const handleConfirmSelection = () => {
    if (onSelect) {
      onSelect(allowMultiple ? selectedItems : selectedItems[0]);
    }
  };

  const handleDelete = async (mediaId: number) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;

    try {
      const response = await fetch(`/api/admin/media-library?id=${mediaId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setMedia(media.filter(item => item.id !== mediaId));
      } else {
        alert(result.message || 'Failed to delete media');
      }
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert('Failed to delete media');
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="w-8 h-8" />;
      case 'video': return <Video className="w-8 h-8" />;
      case 'audio': return <Music className="w-8 h-8" />;
      case 'document': return <FileText className="w-8 h-8" />;
      default: return <File className="w-8 h-8" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden"
        style={{ backgroundColor: designSystem?.backgroundPrimary || '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-6"
          style={{ 
            background: `linear-gradient(135deg, ${designSystem?.primaryLight || '#60a5fa'} 0%, ${designSystem?.primary || '#3b82f6'} 100%)`,
            color: '#ffffff'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {isSelectionMode ? 'Select Media' : 'Media Library'}
              </h2>
              <p 
                className="text-sm"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                {media.length} {media.length === 1 ? 'item' : 'items'} available
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isSelectionMode && selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  className="px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
                  style={{
                    backgroundColor: '#ffffff',
                    color: designSystem?.primary || '#3b82f6'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  Select {allowMultiple && selectedItems.length > 1 
                    ? `${selectedItems.length} items` 
                    : selectedItems[0]?.title || selectedItems[0]?.filename || 'item'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose || (() => {
                  // If no onClose provided, try to go back or show a message
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    // Fallback: show an alert or console message
                    console.log('Media Library close requested');
                  }
                })}
                className="p-2.5 rounded-lg transition-colors border border-white/20"
                style={{ 
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                title="Close Media Library"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div 
            className="w-80 border-r p-4"
            style={{ 
              borderColor: designSystem?.textMuted || '#e5e7eb',
              backgroundColor: designSystem?.backgroundSecondary || '#f9fafb'
            }}
          >
            {/* Upload Section */}
            <div className="mb-6">
              <h3 
                className="font-semibold mb-3"
                style={{ color: designSystem?.textPrimary || '#111827' }}
              >
                Upload Files
              </h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                  style={{
                    backgroundColor: uploading ? '#9ca3af' : '#3b82f6',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    if (!uploading) {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!uploading) {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Choose Files
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlImport(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors font-medium"
                  style={{
                    borderColor: designSystem?.textMuted || '#d1d5db',
                    color: designSystem?.textSecondary || '#6b7280',
                    backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = designSystem?.backgroundSecondary || '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = designSystem?.backgroundPrimary || '#ffffff';
                  }}
                >
                  <Link className="w-4 h-4" />
                  Import from URL
                </button>
              </div>
            </div>

            {/* Filters */}
            <div>
              <h3 
                className="font-semibold mb-3"
                style={{ color: designSystem?.textPrimary || '#111827' }}
              >
                Filters
              </h3>
              <div className="space-y-3">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: designSystem?.textPrimary || '#111827' }}
                  >
                    File Type
                  </label>
                  <select
                    value={fileTypeFilter}
                    onChange={(e) => setFileTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    style={{
                      borderColor: designSystem?.textMuted || '#d1d5db',
                      color: designSystem?.textPrimary || '#111827',
                      backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="audio">Audio</option>
                    <option value="document">Documents</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div 
              className="p-4 border-b"
              style={{ 
                borderColor: designSystem?.textMuted || '#e5e7eb',
                backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search 
                    className="absolute left-3 top-1/2 transform -translate-y-1/4 w-4 h-4" 
                    style={{ color: designSystem?.textMuted || '#9ca3af' }}
                  />
                  <input
                    type="text"
                    placeholder="Search media files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: designSystem?.textMuted || '#d1d5db',
                      color: designSystem?.textPrimary || '#111827',
                      backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    style={{
                      backgroundColor: viewMode === 'grid' ? (designSystem?.backgroundSecondary || '#f3f4f6') : 'transparent',
                      color: viewMode === 'grid' ? '#3b82f6' : (designSystem?.textMuted || '#9ca3af')
                    }}
                    onMouseEnter={(e) => {
                      if (viewMode !== 'grid') {
                        e.currentTarget.style.color = designSystem?.textSecondary || '#6b7280';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== 'grid') {
                        e.currentTarget.style.color = designSystem?.textMuted || '#9ca3af';
                      }
                    }}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    style={{
                      backgroundColor: viewMode === 'list' ? (designSystem?.backgroundSecondary || '#f3f4f6') : 'transparent',
                      color: viewMode === 'list' ? '#3b82f6' : (designSystem?.textMuted || '#9ca3af')
                    }}
                    onMouseEnter={(e) => {
                      if (viewMode !== 'list') {
                        e.currentTarget.style.color = designSystem?.textSecondary || '#6b7280';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== 'list') {
                        e.currentTarget.style.color = designSystem?.textMuted || '#9ca3af';
                      }
                    }}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div 
                className="p-4 border-b"
                style={{ 
                  backgroundColor: designSystem?.backgroundSecondary || '#eff6ff',
                  borderColor: designSystem?.textMuted || '#bfdbfe'
                }}
              >
                <h4 
                  className="text-sm font-medium mb-3"
                  style={{ color: designSystem?.textPrimary || '#1e40af' }}
                >
                  Uploading Files
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(uploadProgress).filter(([key, upload]) => upload && upload.file && upload.file.name).map(([key, upload]) => (
                    <div 
                      key={key} 
                      className="p-3 rounded-lg border"
                      style={{
                        backgroundColor: designSystem?.backgroundPrimary || '#ffffff',
                        borderColor: designSystem?.textMuted || '#bfdbfe'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span 
                          className="text-sm font-medium"
                          style={{ color: designSystem?.textPrimary || '#111827' }}
                        >
                          {upload.file?.name || 'Unknown file'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-xs"
                            style={{ color: designSystem?.textSecondary || '#6b7280' }}
                          >
                            {upload.status === 'success' ? 'Complete' : 
                             upload.status === 'error' ? 'Failed' : 
                             `${Math.round(upload.progress)}%`}
                          </span>
                          {upload.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {upload.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      </div>
                      <div 
                        className="w-full rounded-full h-2"
                        style={{ backgroundColor: designSystem?.textMuted || '#e5e7eb' }}
                      >
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            upload.status === 'success' ? 'bg-green-500' :
                            upload.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                      {upload.error && (
                        <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Grid/List */}
            <div 
              ref={dropZoneRef}
              className="flex-1 overflow-y-auto p-4 relative"
              style={{ backgroundColor: designSystem?.backgroundPrimary || '#ffffff' }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {/* Drag Overlay */}
              {dragActive && (
                <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                  <div 
                    className="rounded-xl p-8 shadow-xl border-2 border-dashed"
                    style={{
                      backgroundColor: designSystem?.backgroundPrimary || '#ffffff',
                      borderColor: '#3b82f6'
                    }}
                  >
                    <CloudUpload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <p 
                      className="text-lg font-semibold text-center"
                      style={{ color: designSystem?.textPrimary || '#111827' }}
                    >
                      Drop files here to upload
                    </p>
                    <p 
                      className="text-center mt-1"
                      style={{ color: designSystem?.textSecondary || '#6b7280' }}
                    >
                      Release to start uploading
                    </p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <RefreshCw 
                      className="w-8 h-8 animate-spin mx-auto mb-3" 
                      style={{ color: designSystem?.textMuted || '#9ca3af' }}
                    />
                    <div style={{ color: designSystem?.textSecondary || '#6b7280' }}>
                      Loading media...
                    </div>
                  </div>
                </div>
              ) : media.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: designSystem?.backgroundSecondary || '#f3f4f6' }}
                    >
                      <Image 
                        className="w-12 h-12" 
                        style={{ color: designSystem?.textMuted || '#9ca3af' }}
                      />
                    </div>
                    <h3 
                      className="text-lg font-semibold mb-2"
                      style={{ color: designSystem?.textPrimary || '#111827' }}
                    >
                      No media files yet
                    </h3>
                    <p 
                      className="mb-6"
                      style={{ color: designSystem?.textSecondary || '#6b7280' }}
                    >
                      Upload your first files to get started. You can drag and drop files here or click the upload button.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 text-white rounded-lg transition-colors font-medium"
                      style={{ backgroundColor: '#3b82f6' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                      }}
                    >
                      Upload Files
                    </button>
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-5 gap-4' : 'space-y-2'}>
                  {media.filter(item => item && item.id && item.filename).map(item => {
                    const isSelected = selectedItems.some(selected => selected && selected.id === item.id);
                    
                    return (
                      <div
                        key={item.id}
                        className={`relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group ${
                          isSelected 
                            ? 'ring-2 ring-blue-500' 
                            : ''
                        }`}
                        style={{
                          borderColor: isSelected ? '#3b82f6' : (designSystem?.textMuted || '#e5e7eb'),
                          backgroundColor: isSelected ? (designSystem?.backgroundSecondary || '#eff6ff') : (designSystem?.backgroundPrimary || '#ffffff')
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = designSystem?.textSecondary || '#d1d5db';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = designSystem?.textMuted || '#e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                        onClick={() => isSelectionMode && handleItemSelect(item)}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            <div 
                              className="aspect-square flex items-center justify-center relative overflow-hidden"
                              style={{ backgroundColor: designSystem?.backgroundSecondary || '#f3f4f6' }}
                            >
                              {item.fileType === 'image' ? (
                                <img
                                  src={item.publicUrl}
                                  alt={item.alt || item.filename || 'Media file'}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent && !parent.querySelector('.fallback-icon')) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'fallback-icon flex items-center justify-center w-full h-full';
                                      fallback.style.color = designSystem?.textMuted || '#9ca3af';
                                      fallback.innerHTML = `
                                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                      `;
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              ) : (
                                <div style={{ color: designSystem?.textMuted || '#9ca3af' }}>
                                  {getFileTypeIcon(item.fileType)}
                                </div>
                              )}
                              
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(item.publicUrl, '_blank');
                                    }}
                                    className="p-2 rounded-full shadow-lg transition-colors"
                                    style={{
                                      backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = designSystem?.backgroundSecondary || '#f9fafb';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = designSystem?.backgroundPrimary || '#ffffff';
                                    }}
                                    title="View"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {!isSelectionMode && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item.id);
                                      }}
                                      className="p-2 rounded-full shadow-lg transition-colors"
                                      style={{
                                        backgroundColor: designSystem?.backgroundPrimary || '#ffffff',
                                        color: '#ef4444'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fef2f2';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = designSystem?.backgroundPrimary || '#ffffff';
                                      }}
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3">
                              <div 
                                className="text-sm font-medium truncate mb-1"
                                style={{ color: designSystem?.textPrimary || '#111827' }}
                              >
                                {item.title || item.filename}
                              </div>
                              <div 
                                className="text-xs flex items-center justify-between"
                                style={{ color: designSystem?.textSecondary || '#6b7280' }}
                              >
                                <span>{item.fileType.toUpperCase()}</span>
                                <span>{formatFileSize(item.fileSize)}</span>
                              </div>
                            </div>
                            
                            {isSelectionMode && isSelected && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1.5">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </>
                        ) : (
                          // List View
                          <div className="flex items-center gap-4 p-4">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: designSystem?.backgroundSecondary || '#f3f4f6' }}
                            >
                              {item.fileType === 'image' ? (
                                <img
                                  src={item.publicUrl}
                                  alt={item.alt || item.filename || 'Media file'}
                                  className="w-full h-full object-cover rounded-lg"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent && !parent.querySelector('.fallback-icon')) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'fallback-icon flex items-center justify-center w-full h-full';
                                      fallback.style.color = designSystem?.textMuted || '#9ca3af';
                                      fallback.innerHTML = `
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                      `;
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              ) : (
                                <div style={{ color: designSystem?.textMuted || '#9ca3af' }}>
                                  {getFileTypeIcon(item.fileType)}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div 
                                className="font-medium truncate"
                                style={{ color: designSystem?.textPrimary || '#111827' }}
                              >
                                {item.title || item.filename}
                              </div>
                              <div 
                                className="text-sm flex items-center gap-4"
                                style={{ color: designSystem?.textSecondary || '#6b7280' }}
                              >
                                <span>{item.fileType.toUpperCase()}</span>
                                <span>{formatFileSize(item.fileSize)}</span>
                                <span>{formatDate(item.createdAt)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(item.publicUrl, '_blank');
                                }}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: designSystem?.textMuted || '#9ca3af',
                                  backgroundColor: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = designSystem?.backgroundSecondary || '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!isSelectionMode && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                  }}
                                  className="p-2 rounded-lg transition-colors"
                                  style={{
                                    color: '#ef4444',
                                    backgroundColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fef2f2';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />

        {/* URL Import Modal */}
        {showUrlImport && (
          <UrlImportModal
            onImport={async (data) => {
              try {
                setUploading(true);
                const response = await fetch('/api/admin/media-library', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                  await fetchMedia();
                  setShowUrlImport(false);
                } else {
                  alert(result.message || 'Import failed');
                }
              } catch (error) {
                console.error('Import failed:', error);
                alert('Import failed');
              } finally {
                setUploading(false);
              }
            }}
            onClose={() => setShowUrlImport(false)}
            uploading={uploading}
            designSystem={designSystem}
          />
        )}
      </div>
    </div>
  );
};

// URL Import Modal Component
const UrlImportModal: React.FC<{
  onImport: (data: any) => void;
  onClose: () => void;
  uploading: boolean;
  designSystem?: {
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
    backgroundPrimary?: string;
    backgroundSecondary?: string;
  };
}> = ({ onImport, onClose, uploading, designSystem }) => {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    alt: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim()) {
      alert('Please enter a URL');
      return;
    }
    onImport(formData);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="rounded-xl shadow-2xl w-full max-w-md"
        style={{ backgroundColor: designSystem?.backgroundPrimary || '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="p-6 border-b"
          style={{ borderColor: designSystem?.textMuted || '#e5e7eb' }}
        >
          <div className="flex items-center justify-between">
            <h3 
              className="text-lg font-semibold"
              style={{ color: designSystem?.textPrimary || '#111827' }}
            >
              Import from URL
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg transition-colors"
              style={{ 
                color: designSystem?.textMuted || '#9ca3af',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designSystem?.backgroundSecondary || '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: designSystem?.textPrimary || '#111827' }}
            >
              File URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: designSystem?.textMuted || '#d1d5db',
                color: designSystem?.textPrimary || '#111827',
                backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
              }}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: designSystem?.textPrimary || '#111827' }}
            >
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: designSystem?.textMuted || '#d1d5db',
                color: designSystem?.textPrimary || '#111827',
                backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
              }}
              placeholder="Optional title"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: designSystem?.textPrimary || '#111827' }}
            >
              Alt Text
            </label>
            <input
              type="text"
              value={formData.alt}
              onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: designSystem?.textMuted || '#d1d5db',
                color: designSystem?.textPrimary || '#111827',
                backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
              }}
              placeholder="Alternative text for accessibility"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: designSystem?.textPrimary || '#111827' }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: designSystem?.textMuted || '#d1d5db',
                color: designSystem?.textPrimary || '#111827',
                backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
              }}
              rows={3}
              placeholder="Optional description"
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg transition-colors"
              style={{
                borderColor: designSystem?.textMuted || '#d1d5db',
                color: designSystem?.textSecondary || '#6b7280',
                backgroundColor: designSystem?.backgroundPrimary || '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designSystem?.backgroundSecondary || '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designSystem?.backgroundPrimary || '#ffffff';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: uploading ? '#9ca3af' : '#3b82f6'
              }}
              onMouseEnter={(e) => {
                if (!uploading) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!uploading) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              {uploading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaLibraryManager;


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
  selectedMedia = allowMultiple ? [] : null
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {isSelectionMode ? 'Select Media' : 'Media Library'}
              </h2>
              <p className="text-blue-100 text-sm">
                {media.length} {media.length === 1 ? 'item' : 'items'} available
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isSelectionMode && selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  className="px-6 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-sm"
                >
                  Select {allowMultiple && selectedItems.length > 1 
                    ? `${selectedItems.length} items` 
                    : selectedItems[0]?.title || selectedItems[0]?.filename || 'item'}
                </button>
              )}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 hover:bg-blue-600 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-4">
            {/* Upload Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Upload Files</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  Choose Files
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlImport(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Link className="w-4 h-4" />
                  Import from URL
                </button>
              </div>
            </div>

            {/* Filters */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
                  <select
                    value={fileTypeFilter}
                    onChange={(e) => setFileTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/4 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search media files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-3">Uploading Files</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(uploadProgress).filter(([key, upload]) => upload && upload.file && upload.file.name).map(([key, upload]) => (
                    <div key={key} className="bg-white p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{upload.file?.name || 'Unknown file'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            {upload.status === 'success' ? 'Complete' : 
                             upload.status === 'error' ? 'Failed' : 
                             `${Math.round(upload.progress)}%`}
                          </span>
                          {upload.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {upload.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
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
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {/* Drag Overlay */}
              {dragActive && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-10">
                  <div className="bg-white rounded-xl p-8 shadow-xl border-2 border-dashed border-blue-500">
                    <CloudUpload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-900 text-center">Drop files here to upload</p>
                    <p className="text-gray-600 text-center mt-1">Release to start uploading</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                    <div className="text-gray-500">Loading media...</div>
                  </div>
                </div>
              ) : media.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No media files yet</h3>
                    <p className="text-gray-600 mb-6">
                      Upload your first files to get started. You can drag and drop files here or click the upload button.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                            ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        }`}
                        onClick={() => isSelectionMode && handleItemSelect(item)}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
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
                                      fallback.className = 'fallback-icon text-gray-400 flex items-center justify-center w-full h-full';
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
                                <div className="text-gray-400">
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
                                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
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
                                      className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 text-red-600 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3">
                              <div className="text-sm font-medium text-gray-900 truncate mb-1">
                                {item.title || item.filename || 'Untitled'}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center justify-between">
                                <span>{formatFileSize(item.fileSize || 0)}</span>
                                <span>{formatDate(item.createdAt || new Date().toISOString())}</span>
                              </div>
                            </div>
                            
                            {isSelectionMode && isSelected && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1.5">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-4 p-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                                      fallback.className = 'fallback-icon text-gray-400 flex items-center justify-center w-full h-full';
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
                                <div className="text-gray-400">
                                  {getFileTypeIcon(item.fileType)}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {item.title || item.filename || 'Untitled'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-4">
                                <span>{formatFileSize(item.fileSize || 0)}</span>
                                <span>{item.mimeType || 'Unknown type'}</span>
                                <span>{formatDate(item.createdAt || new Date().toISOString())}</span>
                              </div>
                            </div>
                            
                            {isSelectionMode && isSelected && (
                              <div className="bg-blue-500 text-white rounded-full p-1.5">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                            
                            {!isSelectionMode && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(item.publicUrl, '_blank');
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                  }}
                                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
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
}> = ({ onImport, onClose, uploading }) => {
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Import from URL</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={formData.alt}
              onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Alternative text for accessibility"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Optional description"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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

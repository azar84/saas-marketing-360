'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Search, Check, X, AlertTriangle } from 'lucide-react';
import { useNotificationContext } from '@/components/providers/NotificationProvider';

interface Industry {
  id: number;
  title: string;
  keywordsCount: number;
}

interface Keyword {
  id: number;
  searchTerm: string;
  industryId: number;
  createdAt: string;
  updatedAt: string;
}

export default function KeywordsManager() {
  console.log('KeywordsManager component rendered');
  
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<Set<number>>(new Set());
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'selected' | 'all' | null>(null);
  
  const { addNotification } = useNotificationContext();

  // Fetch industries on component mount
  useEffect(() => {
    fetchIndustries();
  }, []);

  // Fetch keywords when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      fetchKeywords(selectedIndustry.id);
    } else {
      setKeywords([]);
      setSelectedKeywords(new Set());
    }
  }, [selectedIndustry]);

  const fetchIndustries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/industries/search');
      const data = await response.json();
      
      if (data.success) {
        setIndustries(data.industries || []);
      } else {
        addNotification({
          type: 'error',
          title: 'Failed to fetch industries',
          message: data.message || 'Could not load industries'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch industries'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchKeywords = async (industryId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/industries/keywords/fetch?industryId=${industryId}`);
      const data = await response.json();
      
      if (data.success && data.keywords && data.keywords.search_terms) {
        // Transform the search terms to match our interface
        const transformedKeywords = data.keywords.search_terms.map((searchTerm: string, index: number) => ({
          id: index, // Use index as temporary ID since we don't have real IDs
          searchTerm: searchTerm,
          industryId: industryId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        setKeywords(transformedKeywords);
        setSelectedKeywords(new Set()); // Reset selection
      } else {
        setKeywords([]);
        if (data.message) {
          addNotification({
            type: 'info',
            title: 'No keywords found',
            message: data.message
          });
        }
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch keywords'
      });
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteKeywords = async (keywordIds: number[]) => {
    console.log('deleteKeywords called with:', keywordIds);
    try {
      setDeleteLoading(true);
      
      // Get the actual search terms to delete
      const searchTermsToDelete = keywordIds.map(id => {
        const keyword = keywords.find(k => k.id === id);
        return keyword?.searchTerm;
      }).filter(Boolean);
      
      if (searchTermsToDelete.length === 0) {
        throw new Error('No valid search terms to delete');
      }
      
      const deleteUrl = `/api/admin/industries/keywords/delete?t=${Date.now()}`;
      const deletePayload = { 
        searchTerms: searchTermsToDelete,
        industryId: selectedIndustry?.id 
      };
      
      console.log('Delete request:', { url: deleteUrl, payload: deletePayload });
      
      const response = await fetch(deleteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deletePayload)
      });
      
      console.log('Delete response status:', response.status);
      console.log('Delete response URL:', response.url);
      
      const data = await response.json();
      console.log('Delete response data:', data);
      
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Keywords deleted',
          message: `Successfully deleted ${searchTermsToDelete.length} keyword(s)`
        });
        
        // Refresh keywords and update industry count
        if (selectedIndustry) {
          fetchKeywords(selectedIndustry.id);
          fetchIndustries(); // Refresh industry counts
        }
        
        setSelectedKeywords(new Set());
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      } else {
        throw new Error(data.message || 'Failed to delete keywords');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete failed',
        message: error instanceof Error ? error.message : 'Failed to delete keywords'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedKeywords.size === 0) return;
    setDeleteTarget('selected');
    setShowDeleteConfirm(true);
  };

  const handleDeleteAll = () => {
    if (keywords.length === 0) return;
    setDeleteTarget('all');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    let keywordIds: number[];
    if (deleteTarget === 'selected') {
      keywordIds = Array.from(selectedKeywords);
    } else {
      keywordIds = keywords.map(k => k.id);
    }
    
    deleteKeywords(keywordIds);
  };

  const toggleKeywordSelection = (keywordId: number) => {
    const newSelection = new Set(selectedKeywords);
    if (newSelection.has(keywordId)) {
      newSelection.delete(keywordId);
    } else {
      newSelection.add(keywordId);
    }
    setSelectedKeywords(newSelection);
  };

  const selectAllKeywords = () => {
    if (selectedKeywords.size === keywords.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(keywords.map(k => k.id)));
    }
  };

  const filteredKeywords = keywords.filter(keyword =>
    keyword.searchTerm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasSelection = selectedKeywords.size > 0;
  const allSelected = keywords.length > 0 && selectedKeywords.size === keywords.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Keywords Management
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage keywords for each industry
          </p>
        </div>
      </div>

      {/* Industry Selection */}
      <Card style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--color-text-primary)' }}>Select Industry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((industry) => (
              <div
                key={industry.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedIndustry?.id === industry.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedIndustry(industry)}
              >
                <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {industry.title}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {industry.keywordsCount} keywords
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keywords Management */}
      {selectedIndustry && (
        <Card style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle style={{ color: 'var(--color-text-primary)' }}>
                Keywords for {selectedIndustry.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllKeywords}
                  disabled={keywords.length === 0}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={!hasSelection}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedKeywords.size})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAll}
                  disabled={keywords.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All ({keywords.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <Input
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Keywords List */}
            {loading ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                Loading keywords...
              </div>
            ) : filteredKeywords.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                {searchTerm ? 'No keywords match your search' : 'No keywords found for this industry'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredKeywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      selectedKeywords.has(keyword.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedKeywords.has(keyword.id)}
                        onChange={() => toggleKeywordSelection(keyword.id)}
                        className="rounded"
                      />
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        {keyword.searchTerm}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKeywords([keyword.id])}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {keywords.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>
                    Showing {filteredKeywords.length} of {keywords.length} keywords
                  </span>
                  {hasSelection && (
                    <span>
                      {selectedKeywords.size} selected
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Confirm Deletion
              </h3>
            </div>
            
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {deleteTarget === 'selected'
                ? `Are you sure you want to delete ${selectedKeywords.size} selected keyword(s)? This action cannot be undone.`
                : `Are you sure you want to delete all ${keywords.length} keywords for "${selectedIndustry?.title}"? This action cannot be undone.`
              }
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

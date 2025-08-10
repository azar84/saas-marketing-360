'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface FlatItem {
  id: number;
  title: string;
  keywordsCount?: number;
}

interface ListResponse {
  success: boolean;
  data: Array<{
    id: number;
    title: string;
    keywordsCount?: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Keyword {
  id: number;
  searchTerm: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IndustryKeywords {
  id: number;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  keywords: Keyword[];
  totalKeywords: number;
}

type KeywordsPayload = {
  industry: string;
  keywords?: {
    search_terms: string[];
    subindustries: string[];
    service_queries: string[];
    transactional_modifiers: string[];
    negative_keywords: string[];
  };
  error?: string;
};

export default function NAICSManager({ onResult }: { onResult?: (payload: KeywordsPayload) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<FlatItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [generatedFor, setGeneratedFor] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<null | {
    search_terms: string[];
    subindustries: string[];
    service_queries: string[];
    transactional_modifiers: string[];
    negative_keywords: string[];
  }>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'generate' | 'keywords'>('list');
  const [selectedIndustry, setSelectedIndustry] = useState<FlatItem | null>(null);
  const [industryKeywords, setIndustryKeywords] = useState<IndustryKeywords | null>(null);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [sortBy, setSortBy] = useState<'label' | 'keywordsCount'>('label');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const resultRef = useRef<HTMLDivElement | null>(null);

  const fetchList = async (q: string, p: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      params.set('page', String(p));
      params.set('limit', '50');
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      const res = await fetch(`/api/admin/industries/search?${params}`);
      const data: ListResponse = await res.json();
      if (data.success) {
        setItems(data.data.map(d => ({ 
          id: d.id, 
          title: d.title, 
          keywordsCount: d.keywordsCount || 0 
        })));
        setTotal(data.pagination.total);
        setPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch industries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFor = async (id: number, title: string) => {
    setGeneratingId(id);
    setGenError(null);
    setKeywords(null);
    setGeneratedFor(title);
    
    try {
      // Use the keywords API endpoint which handles saving to database with duplicate prevention
      const res = await fetch('/api/admin/industries/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: title })
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      if (data.success && data.keywords) {
        setKeywords(data.keywords);
        if (onResult) onResult({ industry: title, keywords: data.keywords });
        
        // Show success message about keywords saved
        if (data._database && data._database.keywordsSaved) {
          console.log(`✅ Generated and saved ${data._database.keywordsSaved} unique keywords for "${title}"`);
        } else if (data.keywords && data.keywords.search_terms) {
          console.log(`✅ Generated ${data.keywords.search_terms.length} keywords for "${title}"`);
        }
      } else {
        throw new Error(data.error || 'Failed to generate keywords');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setGenError(error instanceof Error ? error.message : 'Unknown error occurred');
      if (onResult) onResult({ industry: title, error: error instanceof Error ? error.message : 'Unknown error occurred' });
    } finally {
      setGeneratingId(null);
    }
  };

  const viewKeywords = async (industry: FlatItem) => {
    setLoadingKeywords(true);
    console.log('Fetching keywords for industry:', industry);
    try {
      const url = `/api/admin/industries/${encodeURIComponent(industry.title)}/keywords`;
      console.log('API URL:', url);
      const res = await fetch(url);
      console.log('API response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('API response data:', data);
        if (data.success) {
          // Map the API response to match the expected structure
          const mappedData: IndustryKeywords = {
            id: data.industry.id,
            label: data.industry.label,
            isActive: data.industry.isActive,
            createdAt: data.industry.createdAt,
            updatedAt: data.industry.updatedAt,
            keywords: data.keywords,
            totalKeywords: data.totalKeywords
          };
          console.log('Mapped data:', mappedData);
          setIndustryKeywords(mappedData);
          setSelectedIndustry(industry);
          setCurrentView('keywords');
        } else {
          console.error('API returned success: false:', data);
        }
      } else {
        console.error('Failed to fetch keywords:', res.status, res.statusText);
        const errorData = await res.json().catch(() => ({}));
        console.error('Error details:', errorData);
        
        // Show error to user
        alert(`Failed to fetch keywords: ${errorData.error || res.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch keywords:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingKeywords(false);
    }
  };

  const openGenerateView = (industry: FlatItem) => {
    setSelectedIndustry(industry);
    setCurrentView('generate');
  };

  // Auto scroll to the results card when we have output or an error
  useEffect(() => {
    if ((keywords || genError) && resultRef.current) {
      // Give the card a tick to mount then scroll smoothly into view
      const el = resultRef.current;
      setTimeout(() => {
        try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
      }, 50);
    }
  }, [keywords, genError]);

  // Navigation breadcrumb
  const renderBreadcrumb = () => (
    <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
      <button
        onClick={() => setCurrentView('list')}
        className="hover:underline cursor-pointer"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Industries
      </button>
      {currentView !== 'list' && selectedIndustry && (
        <>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{selectedIndustry.title}</span>
          {currentView === 'generate' && <span>/ Generate Keywords</span>}
          {currentView === 'keywords' && <span>/ View Keywords</span>}
        </>
      )}
    </div>
  );

  // Main list view
  const renderListView = () => (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Industries</h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Search and generate keyword sets for your target industries
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ 
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-secondary)' 
          }}>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="font-medium">Loading industries...</span>
          </div>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="space-y-3">
          <label htmlFor="industry-search" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Search Industries
          </label>
          <div className="relative">
            <input
              id="industry-search"
              type="text"
              placeholder="Type to search industries (e.g., 'landscaping', 'plumbing')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)', 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                '--tw-ring-color': 'var(--color-primary)'
              } as any}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm px-2 py-1 rounded hover:bg-opacity-10"
                style={{ 
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-bg-secondary)'
                }}
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Search will update automatically as you type
          </p>
          {/* Sorting Status */}
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Sorted by:</span>
            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {sortBy === 'label' ? 'Industry Name' : 'Keywords Count'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ 
              backgroundColor: 'var(--color-primary-light)', 
              color: 'var(--color-primary)' 
            }}>
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {items.length > 0 && (
        <Card padding="none">
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {total} {total === 1 ? 'industry' : 'industries'} found
              </span>
              {searchTerm && (
                <span className="text-xs px-2 py-1 rounded-full" style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  color: 'var(--color-text-secondary)' 
                }}>
                  "{searchTerm}"
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Sorting Controls */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'label' | 'keywordsCount');
                    setPage(1); // Reset to first page when sorting changes
                  }}
                  className="text-xs px-2 py-1 rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)', 
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as any}
                >
                  <option value="label">Industry Name</option>
                  <option value="keywordsCount">Keywords Count</option>
                </select>
                <button
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    setPage(1); // Reset to first page when sort order changes
                  }}
                  className="p-1 rounded hover:bg-opacity-10 transition-colors"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-secondary)'
                  }}
                  title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  disabled={page <= 1 || isLoading}
                  onClick={() => { const p = page - 1; setPage(p); fetchList(searchTerm, p); }}
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm font-medium px-3 py-1 rounded-md" style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  color: 'var(--color-text-primary)' 
                }}>
                  {page} of {Math.max(1, pages)}
                </span>
                <Button
                  variant="ghost"
                  disabled={page >= pages || isLoading}
                  onClick={() => { const p = page + 1; setPage(p); fetchList(searchTerm, p); }}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  <th className="text-left px-6 py-4 text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-secondary)' }}>ID</th>
                  <th 
                    className="text-left px-6 py-4 text-xs font-semibold tracking-wider uppercase cursor-pointer hover:bg-opacity-80 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onClick={() => {
                      if (sortBy === 'label') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('label');
                        setSortOrder('asc');
                      }
                      setPage(1);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Industry
                      {sortBy === 'label' && (
                        <span className="text-xs" style={{ color: 'var(--color-primary)' }}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left px-6 py-4 text-xs font-semibold tracking-wider uppercase cursor-pointer hover:bg-opacity-80 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onClick={() => {
                      if (sortBy === 'keywordsCount') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('keywordsCount');
                        setSortOrder('desc'); // Default to descending for keywords count
                      }
                      setPage(1);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Keywords
                      {sortBy === 'keywordsCount' && (
                        <span className="text-xs" style={{ color: 'var(--color-primary)' }}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-gray-light)' }}>
                {items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? '' : 'bg-opacity-50'} style={{ 
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-bg-secondary)' 
                  }}>
                    <td className="px-6 py-4 align-top font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.id}</td>
                    <td className="px-6 py-4 align-top">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.title}</span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {generatingId === item.id ? (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Generating...
                          </span>
                        ) : (
                          item.keywordsCount || 0
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          disabled={!!generatingId}
                          onClick={() => openGenerateView(item)}
                          size="sm"
                        >
                          {generatingId === item.id ? 'Generating…' : 'Generate Keywords'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => viewKeywords(item)}
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Keywords
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {items.length === 0 && !isLoading && (
        <Card padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
              backgroundColor: 'var(--color-bg-secondary)' 
            }}>
              <span className="text-2xl" style={{ color: 'var(--color-text-secondary)' }}>🔍</span>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {searchTerm ? 'No industries found' : 'No industries available'}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {searchTerm ? `No industries match "${searchTerm}". Try a different search term.` : 'There are no industries in the database yet.'}
            </p>
          </div>
        </Card>
      )}
    </>
  );

  // Generate view
  const renderGenerateView = () => (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Generate Keywords</h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Generate keyword sets for {selectedIndustry?.title}
          </p>
        </div>
        <Button variant="outline" onClick={() => setCurrentView('list')}>
          Back to Industries
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Industry: {selectedIndustry?.title}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This will generate a comprehensive set of keywords for your target industry.
            </p>
          </div>
          
          <Button
            onClick={() => selectedIndustry && generateFor(selectedIndustry.id, selectedIndustry.title)}
            disabled={!!generatingId}
            fullWidth
          >
            {generatingId === selectedIndustry?.id ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Keywords...
              </>
            ) : (
              'Generate Keywords'
            )}
          </Button>
        </CardContent>
      </Card>
    </>
  );

  // Keywords view
  const renderKeywordsView = () => (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Industry Keywords</h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            View existing keywords for {selectedIndustry?.title}
          </p>
        </div>
        <Button variant="outline" onClick={() => setCurrentView('list')}>
          Back to Industries
        </Button>
      </div>

      {loadingKeywords ? (
        <Card padding="lg">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" style={{ color: 'var(--color-text-secondary)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading keywords...</p>
          </div>
        </Card>
      ) : industryKeywords ? (
        <Card>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Keywords for {industryKeywords.label}
              </h3>
              <span className="text-sm px-2 py-1 rounded-full" style={{ 
                backgroundColor: 'var(--color-bg-secondary)', 
                color: 'var(--color-text-secondary)' 
              }}>
                {industryKeywords.totalKeywords} keywords
              </span>
            </div>
            
            <div className="space-y-4">
              {industryKeywords.keywords.map((keyword) => (
                <div key={keyword.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-gray-light)'
                }}>
                  <span style={{ color: 'var(--color-text-primary)' }}>{keyword.searchTerm}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${keyword.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {keyword.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(keyword.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="text-center">
            <p style={{ color: 'var(--color-text-secondary)' }}>No keywords found for this industry.</p>
          </div>
        </Card>
      )}
    </>
  );

  // Main render
  useEffect(() => {
    fetchList(searchTerm, page);
  }, [searchTerm, page, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {renderBreadcrumb()}
      
      {currentView === 'list' && renderListView()}
      {currentView === 'generate' && renderGenerateView()}
      {currentView === 'keywords' && renderKeywordsView()}

      {(keywords || genError) && (
        <Card ref={resultRef as any}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {genError ? 'Error' : `Keywords for: ${generatedFor}`}
              </CardTitle>
              <Button variant="ghost" onClick={() => { setKeywords(null); setGenError(null); setGeneratedFor(null); }}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {genError && (
              <div className="text-sm" style={{ color: 'var(--color-error-dark)' }}>
                {genError}
                <div className="mt-3">
                  <a
                    href="#keywords-result"
                    className="text-xs underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Open detailed result view
                  </a>
                </div>
              </div>
            )}
            {keywords && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {([
                  ['Search terms', keywords.search_terms],
                  ['Subindustries', keywords.subindustries],
                  ['Service queries', keywords.service_queries],
                  ['Transactional modifiers', keywords.transactional_modifiers],
                  ['Negative keywords', keywords.negative_keywords],
                ] as const).map(([label, list]) => (
                  <div key={label}>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>{label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {list.length ? (
                        list.map((k) => (
                          <span key={k} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                            {k}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import { useDesignSystem } from '@/hooks/useDesignSystem';

interface FAQCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

interface FAQ {
  id: number;
  categoryId?: number;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  category?: FAQCategory;
}

interface FAQSectionProps {
  faqs?: FAQ[];
  categories?: FAQCategory[];
  sectionCategories?: number[]; // Array of category IDs selected for this section
  heading?: string;
  subheading?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  searchPlaceholder?: string;
  showCategories?: boolean;
  defaultCategory?: number;
  className?: string;
  backgroundColor?: string;
  heroBackgroundColor?: string;
  heroHeight?: string;
  // Page builder specific props
  faqCategoryId?: number; // If specified, only show FAQs from this category
  showHero?: boolean;
}

export default function FAQSection({
  faqs: propFaqs,
  categories: propCategories = [],
  sectionCategories = [],
  heading = "Frequently Asked Questions",
  subheading,
  heroTitle = "Frequently asked questions",
  heroSubtitle = "Got a question? Use the search bar or browse the categories below to find your answer",
  searchPlaceholder = "Enter your keyword here",
  showCategories = true,
  defaultCategory,
  className = "",
  backgroundColor = "#f8fafc",
  heroBackgroundColor = "#6366f1",
  heroHeight = "80vh",
  faqCategoryId,
  showHero = true
}: FAQSectionProps) {
  const { designSystem } = useDesignSystem();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(defaultCategory || faqCategoryId || null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>(propFaqs || []);
  const [categories, setCategories] = useState<FAQCategory[]>(propCategories);
  const [loading, setLoading] = useState(!propFaqs);
  const [error, setError] = useState<string | null>(null);

  // Fetch FAQ data if not provided as props
  useEffect(() => {
    const fetchFAQData = async () => {
      if (propFaqs) {
        return; // Use provided data
      }

      try {
        setLoading(true);
        setError(null);

        const [categoriesRes, faqsRes] = await Promise.all([
          fetch('/api/admin/faq-categories'),
          fetch('/api/admin/faqs')
        ]);

        if (!categoriesRes.ok || !faqsRes.ok) {
          throw new Error('Failed to fetch FAQ data');
        }

        const categoriesData = await categoriesRes.json();
        const faqsData = await faqsRes.json();

        setCategories(categoriesData);
        setFaqs(faqsData);
      } catch (err) {
        console.error('Error fetching FAQ data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load FAQ data');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQData();
  }, [propFaqs]);

  const filteredAndSearchedFAQs = useMemo(() => {
    let filtered = (faqs || []).filter(faq => faq.isActive);
    
    // If faqCategoryId is specified (page builder mode), filter to that category only
    if (faqCategoryId) {
      filtered = filtered.filter(faq => faq.categoryId === faqCategoryId);
    } else if (sectionCategories.length > 0) {
      // If section has specific categories selected, filter to those categories
      filtered = filtered.filter(faq => 
        faq.categoryId && sectionCategories.includes(faq.categoryId)
      );
    } else if (selectedCategory) {
      // Otherwise use the selected category filter
      filtered = filtered.filter(faq => faq.categoryId === selectedCategory);
    }
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [faqs, selectedCategory, searchTerm, faqCategoryId, sectionCategories]);

  const sortedCategories = useMemo(() => {
    let availableCategories = (categories || []).filter(cat => cat.isActive);
    
    // If section has specific categories selected, only show those categories
    if (sectionCategories.length > 0) {
      availableCategories = availableCategories.filter(cat => 
        sectionCategories.includes(cat.id)
      );
    }
    
    return availableCategories.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, sectionCategories]);

  const toggleFAQ = (faqId: number) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setOpenFAQ(null);
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (!faqCategoryId) {
      setSelectedCategory(null);
    }
    setOpenFAQ(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className={className} style={{ backgroundColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading FAQ data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className} style={{ backgroundColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading FAQ data: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!faqs || faqs.length === 0) {
    return (
      <div className={className} style={{ backgroundColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{heading}</h2>
            <p className="text-gray-600">No FAQ data available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the current category name for display
  const currentCategoryName = faqCategoryId 
    ? sortedCategories.find(cat => cat.id === faqCategoryId)?.name
    : selectedCategory 
      ? sortedCategories.find(cat => cat.id === selectedCategory)?.name
      : null;

  return (
    <div className={className} style={{ backgroundColor }}>
      {showHero && (
        <div 
          className="relative pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
          style={{ 
            backgroundColor: heroBackgroundColor,
            minHeight: heroHeight
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {heroTitle}
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {heroSubtitle}
            </p>
            
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/4 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-lg shadow-lg focus:ring-2 focus:ring-white/20 focus:outline-none"
                  style={{ backgroundColor: 'white' }}
                />
              </div>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/4 text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {showCategories && !faqCategoryId && sortedCategories.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Navigation
                </h3>
                
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ' + 
                      (selectedCategory === null
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')
                    }
                  >
                    All Questions
                  </button>
                  
                  {sortedCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ' +
                        (selectedCategory === category.id
                          ? 'text-white border-l-4'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')
                      }
                      style={{
                        backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                        borderLeftColor: selectedCategory === category.id ? category.color : 'transparent'
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={(showCategories && !faqCategoryId && sortedCategories.length > 0) ? 'lg:col-span-3' : 'lg:col-span-4'}>
            
            {!searchTerm && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentCategoryName || heading}
                </h2>
                {subheading && !currentCategoryName && (
                  <p className="text-gray-600">
                    {subheading}
                  </p>
                )}
                {currentCategoryName && (
                  <p className="text-gray-600">
                    {sortedCategories.find(cat => cat.id === (faqCategoryId || selectedCategory))?.description || 
                     'Questions related to ' + currentCategoryName}
                  </p>
                )}
              </div>
            )}

            {searchTerm && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Search Results for "{searchTerm}"
                </h2>
                <p className="text-gray-600">
                  {filteredAndSearchedFAQs.length} result{filteredAndSearchedFAQs.length !== 1 ? 's' : ''} found
                </p>
              </div>
            )}

            <div className="space-y-4">
              {filteredAndSearchedFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-5 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {openFAQ === faq.id ? (
                        <Minus className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {openFAQ === faq.id && (
                    <div className="px-6 pb-5 border-t border-gray-100">
                      <div className="pt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredAndSearchedFAQs.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No results found' : 'No questions available'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? 'We could not find any questions matching "' + searchTerm + '". Try different keywords or browse categories.'
                      : (faqCategoryId || selectedCategory)
                        ? 'No questions found in this category.'
                        : 'No questions available at the moment.'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import FeaturesSection from './FeaturesSection';
import MediaSection from './MediaSection';
import FAQSection from './FAQSection';
import DynamicHeroSection from './DynamicHeroSection';
import HeroSection from './HeroSection';
import PricingSection from './PricingSection';
import ConfigurablePricingSection from './ConfigurablePricingSection';
import FormSection from './FormSection';
import HtmlSection from './HtmlSection';
import { useLayoutHeights } from '@/hooks/useLayoutHeights';

interface PageSection {
  id: number;
  pageId: number;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  sortOrder: number;
  isVisible: boolean;
  heroSection?: {
    id: number;
    name?: string;
    layoutType: string;
    sectionHeight?: string;
    tagline?: string;
    headline: string;
    subheading?: string;
    textAlignment: string;
    ctaPrimaryId?: number;
    ctaSecondaryId?: number;
    mediaUrl?: string;
    mediaType: string;
    mediaAlt?: string;
    mediaHeight: string;
    mediaPosition: string;
    backgroundType: string;
    backgroundValue: string;
    showTypingEffect: boolean;
    enableBackgroundAnimation: boolean;
    customClasses?: string;
    paddingTop: number;
    paddingBottom: number;
    containerMaxWidth: string;
    visible: boolean;
    ctaPrimary?: {
      id: number;
      text: string;
      url: string;
      icon?: string;
      style: string;
      target: string;
      isActive: boolean;
    };
    ctaSecondary?: {
      id: number;
      text: string;
      url: string;
      icon?: string;
      style: string;
      target: string;
      isActive: boolean;
    };
  };
  featureGroup?: {
    id: number;
    name: string;
    description?: string;
    layoutType?: 'grid' | 'list';
    backgroundColor?: string;
    isActive: boolean;
    items: Array<{
      id: number;
      sortOrder: number;
      isVisible: boolean;
      feature: {
        id: number;
        name: string;
        description: string;
        iconUrl: string;
        category: string;
        sortOrder: number;
        isActive: boolean;
      };
    }>;
  };
  mediaSection?: {
    id: number;
    headline: string;
    subheading?: string;
    mediaUrl: string;
    mediaType: string;
    layoutType: string;
    badgeText?: string;
    isActive: boolean;
    position: number;
    alignment: string;
    mediaSize: string;
    mediaPosition: string;
    showBadge: boolean;
    showCtaButton: boolean;
    ctaText?: string;
    ctaUrl?: string;
    ctaStyle: string;
    enableScrollAnimations: boolean;
    animationType: string;
    backgroundStyle: string;
    backgroundColor: string;
    textColor: string;
    paddingTop: number;
    paddingBottom: number;
    containerMaxWidth: string;
    features: Array<{
      id: number;
      icon: string;
      label: string;
      color: string;
      sortOrder: number;
    }>;
  };
  pricingSection?: {
    id: number;
    name: string;
    heading: string;
    subheading?: string;
    layoutType: string;
    isActive: boolean;
  };
  faqSection?: {
    id: number;
    name: string;
    heading: string;
    subheading?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    searchPlaceholder?: string;
    showHero: boolean;
    showCategories: boolean;
    backgroundColor?: string;
    heroBackgroundColor?: string;
    heroHeight?: string;
    isActive: boolean;
    sectionCategories?: Array<{
      id: number;
      categoryId: number;
      sortOrder: number;
      category: {
        id: number;
        name: string;
        description?: string;
        icon?: string;
        color: string;
        sortOrder: number;
        isActive: boolean;
        _count: {
          faqs: number;
        };
      };
    }>;
  };
  faqCategoryId?: number;
  form?: {
    id: number;
    name: string;
    title: string;
    subheading?: string;
    isActive: boolean;
    _count: {
      fields: number;
      submissions: number;
    };
  };
  formId?: number;
  htmlSection?: {
    id: number;
    name: string;
    description?: string;
    htmlContent: string;
    cssContent?: string;
    jsContent?: string;
    isActive: boolean;
  };
}

interface DynamicPageRendererProps {
  pageSlug: string;
  className?: string;
}

const DynamicPageRenderer: React.FC<DynamicPageRendererProps> = ({ 
  pageSlug, 
  className = '' 
}) => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageExists, setPageExists] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState<string>('Your Company');
  const { headerHeight, footerHeight } = useLayoutHeights();

  // Fetch company name from site settings
  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.footerCompanyName) {
            setCompanyName(data.footerCompanyName);
          }
        }
      } catch (error) {
        console.error('Failed to fetch company name:', error);
      }
    };

    fetchCompanyName();
  }, []);

  useEffect(() => {
    const fetchPageSections = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/page-sections?pageSlug=${pageSlug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setPageExists(false);
            setError('Page not found');
          } else {
            const errorText = await response.text();
            throw new Error(`Failed to fetch page sections: ${response.status} ${errorText}`);
          }
          return;
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          // Page exists, check if it has content
          setPageExists(true);
          
          // Filter visible sections and sort by sortOrder
          const visibleSections = result.data
            .filter((section: PageSection) => section.isVisible)
            .sort((a: PageSection, b: PageSection) => a.sortOrder - b.sortOrder);
          
          setSections(visibleSections);
        } else {
          // Page exists but no data structure
          setPageExists(true);
          setSections([]);
        }
      } catch (err) {
        console.error('Error fetching page sections:', err);
        setError(err instanceof Error ? err.message : 'Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    if (pageSlug) {
      fetchPageSections();
    }
  }, [pageSlug]);

  // Helper function to generate 3-digit section ID
  const generateSectionId = (section: PageSection, index: number) => {
    try {
      // Use section.id padded to 3 digits, or fallback to index-based ID
      const baseId = section.id || (index + 1);
      return String(baseId).padStart(3, '0');
    } catch (error) {
      console.error('Error generating section ID:', error);
      // Fallback to index-based ID
      return String(index + 1).padStart(3, '0');
    }
  };

  const renderSection = (section: PageSection, index: number) => {
    const sectionKey = `${section.sectionType}-${section.id}`;
    const sectionId = generateSectionId(section, index);
    
    const wrapWithSectionDiv = (content: React.ReactNode) => {
      try {
        return (
          <div id={`section-${sectionId}`} key={sectionKey}>
            {content}
          </div>
        );
      } catch (error) {
        console.error('❌ Error wrapping section with div:', error, { sectionId, sectionKey, sectionType: section.sectionType });
        // Fallback: return content without wrapper
        return content;
      }
    };
    
    switch (section.sectionType) {
      case 'hero':
        if (section.heroSection) {
          return wrapWithSectionDiv(
            <DynamicHeroSection
              heroSection={section.heroSection}
              overrideTitle={section.title}
              overrideSubtitle={section.subtitle}
              className={className}
            />
          );
        }
        break;

      case 'home_hero':
        return wrapWithSectionDiv(
          <HeroSection />
        );

      case 'features':
        if (section.featureGroup) {
          // Transform API data structure to match layout component expectations
          const features = section.featureGroup.items
            .filter(item => item.isVisible)
            .map(item => ({
              id: item.feature.id,
              title: item.feature.name, // API returns 'name', layout expects 'title'
              description: item.feature.description,
              iconName: item.feature.iconUrl, // API returns 'iconUrl', layout expects 'iconName'
              category: item.feature.category,
              sortOrder: item.feature.sortOrder,
              isVisible: item.feature.isActive, // API returns 'isActive', layout expects 'isVisible'
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder);

          const propsToPass = {
            features,
            heading: section.title || section.featureGroup.name, // API returns 'name', not 'heading'
            subheading: section.subtitle || section.featureGroup.description, // API returns 'description', not 'subheading'
            layoutType: section.featureGroup.layoutType || 'grid',
            backgroundColor: section.featureGroup.backgroundColor
          };

          return wrapWithSectionDiv(
            <FeaturesSection
              {...propsToPass}
            />
          );
        }
        break;

      case 'media':
        if (section.mediaSection) {
          const media = section.mediaSection;
          
          // Use universal MediaSection component that can render any media section type
          return wrapWithSectionDiv(
            <MediaSection
              {...media}
              className={className}
            />
          );
        }
        break;

      case 'faq':
        const sectionCategories = section.faqSection?.sectionCategories?.map(sc => sc.categoryId) || [];
        return wrapWithSectionDiv(
          <FAQSection
            heading={section.title || section.faqSection?.heading || 'Frequently Asked Questions'}
            subheading={section.subtitle || section.faqSection?.subheading}
            heroTitle={section.faqSection?.heroTitle}
            heroSubtitle={section.faqSection?.heroSubtitle}
            searchPlaceholder={section.faqSection?.searchPlaceholder}
            showHero={section.faqSection?.showHero ?? false}
            showCategories={section.faqSection?.showCategories ?? true}
            backgroundColor={section.faqSection?.backgroundColor}
            heroBackgroundColor={section.faqSection?.heroBackgroundColor}
            heroHeight={section.faqSection?.heroHeight}
            faqCategoryId={section.faqCategoryId}
            sectionCategories={sectionCategories}
            className={className}
          />
        );

      case 'form':
        if (section.form || section.formId) {
          return wrapWithSectionDiv(
            <FormSection
              formId={section.form?.id || section.formId!}
              title={section.title || section.form?.title}
              subtitle={section.subtitle || section.form?.subheading}
              className={className}
            />
          );
        }
        break;

      case 'html':
        if (section.htmlSection) {
          return wrapWithSectionDiv(
            <HtmlSection
              htmlSection={section.htmlSection}
              className={className}
            />
          );
        }
        break;

      case 'testimonials':
        return wrapWithSectionDiv(
          <section className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {section.title || 'What Our Customers Say'}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {section.subtitle || 'Testimonials section coming soon...'}
                </p>
              </div>
            </div>
          </section>
        );

      case 'pricing':
        if (section.pricingSection) {
          return wrapWithSectionDiv(
            <ConfigurablePricingSection
              heading={section.title || section.pricingSection.heading}
              subheading={section.subtitle || section.pricingSection.subheading}
              pricingSectionId={section.pricingSection.id}
              layoutType={section.pricingSection.layoutType}
            />
          );
        }
        return wrapWithSectionDiv(
          <section className="bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {section.title || 'Pricing Plans'}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {section.subtitle || 'Pricing section coming soon...'}
                </p>
              </div>
            </div>
          </section>
        );

      case 'cta':
        return wrapWithSectionDiv(
          <section className="bg-[#5243E9]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {section.title || 'Ready to Get Started?'}
                </h2>
                <p className="text-white/90 max-w-2xl mx-auto mb-8">
                  {section.subtitle || 'Join thousands of businesses already using our platform.'}
                </p>
                <button className="bg-white text-[#5243E9] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Get Started Today
                </button>
              </div>
            </div>
          </section>
        );

      case 'custom':
        return wrapWithSectionDiv(
          <section className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {section.title || 'Custom Section'}
                </h2>
                {section.subtitle && (
                  <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                    {section.subtitle}
                  </p>
                )}
                {section.content && (
                  <div className="prose prose-lg max-w-none mx-auto">
                    <pre className="bg-gray-100 p-4 rounded-lg text-left">
                      {section.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      default:
        return wrapWithSectionDiv(
          <section className="bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {section.title || `${section.sectionType} Section`}
                </h2>
                <p className="text-gray-600">
                  {section.subtitle || `${section.sectionType} section coming soon...`}
                </p>
              </div>
            </div>
          </section>
        );
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-24">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-48 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-24 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Content Loading Error
            </h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#5243E9] text-white px-6 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sections.length === 0 && pageExists === true) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ 
          minHeight: `calc(100vh - ${headerHeight}px - ${footerHeight}px)` 
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-blue-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              We're Still Working on This Page
            </h2>
            <p className="text-gray-600 mb-4">
              Thank you for being interested in {companyName}! We're currently building this page to make it prettier and more informative.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Check back soon for updates, or explore our other pages in the meantime.
            </p>
            <Link 
              href="/"
              className="bg-[#5243E9] text-white px-6 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (pageExists === false) {
    return (
      <div className={`py-24 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link 
              href="/"
              className="bg-[#5243E9] text-white px-6 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default DynamicPageRenderer; 

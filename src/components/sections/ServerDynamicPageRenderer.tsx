import React from 'react';
import { prisma } from '@/lib/db';
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
      customId?: string;
      icon?: string;
      style: string;
      target: string;
      isActive: boolean;
      // JavaScript Events
      onClickEvent?: string;
      onHoverEvent?: string;
      onMouseOutEvent?: string;
      onFocusEvent?: string;
      onBlurEvent?: string;
      onKeyDownEvent?: string;
      onKeyUpEvent?: string;
      onTouchStartEvent?: string;
      onTouchEndEvent?: string;
    };
    ctaSecondary?: {
      id: number;
      text: string;
      url: string;
      customId?: string;
      icon?: string;
      style: string;
      target: string;
      isActive: boolean;
      // JavaScript Events
      onClickEvent?: string;
      onHoverEvent?: string;
      onMouseOutEvent?: string;
      onFocusEvent?: string;
      onBlurEvent?: string;
      onKeyDownEvent?: string;
      onKeyUpEvent?: string;
      onTouchStartEvent?: string;
      onTouchEndEvent?: string;
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

interface ServerDynamicPageRendererProps {
  pageSlug: string;
  className?: string;
}

// Server-side data fetching
async function fetchPageSections(pageSlug: string): Promise<PageSection[]> {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: pageSlug },
      select: { id: true }
    });

    if (!page) {
      return [];
    }

    const sections = await prisma.pageSection.findMany({
      where: { 
        pageId: page.id,
        isVisible: true
      },
      include: {
        heroSection: {
          include: {
            ctaPrimary: true,
            ctaSecondary: true
          }
        },
        featureGroup: {
          include: {
            items: {
              include: {
                feature: true
              },
              where: {
                isVisible: true
              },
              orderBy: {
                sortOrder: 'asc'
              }
            }
          }
        },
        mediaSection: {
          include: {
            features: {
              orderBy: {
                sortOrder: 'asc'
              }
            }
          }
        },
        pricingSection: true,
        faqSection: {
          include: {
            sectionCategories: {
              include: {
                category: {
                  include: {
                    _count: {
                      select: {
                        faqs: true
                      }
                    }
                  }
                }
              },
              orderBy: {
                sortOrder: 'asc'
              }
            }
          }
        },
        form: {
          include: {
            _count: {
              select: {
                fields: true,
                submissions: true
              }
            }
          }
        },
        htmlSection: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    return sections as PageSection[];
  } catch (error) {
    console.error('Error fetching page sections:', error);
    return [];
  }
}

// Server-side company name fetching
async function fetchCompanyName(): Promise<string> {
  try {
    const siteSettings = await prisma.siteSettings.findFirst();
    return siteSettings?.footerCompanyName || 'Our Company';
  } catch (error) {
    console.error('Error fetching company name:', error);
    return 'Our Company';
  }
}

// Add server-side home hero data fetching
async function fetchHomeHeroData() {
  try {
    const homeHero = await prisma.homePageHero.findFirst({
      where: {
        isActive: true
      },
      include: {
        ctaPrimary: true,
        ctaSecondary: true
      }
    });

    if (!homeHero) {
      // Return default data if no hero exists
      return {
        id: null,
        heading: 'Automate Conversations, Capture Leads, Serve Customers — All Without Code',
        subheading: 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.',
        backgroundColor: '#FFFFFF',
        primaryCtaId: null,
        secondaryCtaId: null,
        primaryCta: null,
        secondaryCta: null,
        isActive: true,
        trustIndicators: [
          { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
          { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
          { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
        ]
      };
    }

    // Transform database data to component format
    return {
      id: homeHero.id,
      heading: homeHero.headline,
      subheading: homeHero.subheading,
      backgroundColor: homeHero.backgroundColor || '#FFFFFF',
      primaryCtaId: homeHero.ctaPrimaryId || null,
      secondaryCtaId: homeHero.ctaSecondaryId || null,
      primaryCta: homeHero.ctaPrimary || null,
      secondaryCta: homeHero.ctaSecondary || null,
      isActive: homeHero.isActive,
      trustIndicators: [
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ]
    };
  } catch (error) {
    console.error('Error fetching home hero data:', error);
    // Return default data on error
    return {
      id: null,
      heading: 'Automate Conversations, Capture Leads, Serve Customers — All Without Code',
      subheading: 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.',
      backgroundColor: '#FFFFFF',
      primaryCtaId: null,
      secondaryCtaId: null,
      primaryCta: null,
      secondaryCta: null,
      isActive: true,
      trustIndicators: [
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ]
    };
  }
}

// Add server-side form data fetching
async function fetchFormData(formId: number) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: {
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { submissions: true }
        }
      }
    });

    if (!form) {
      return null;
    }

    // Parse fieldOptions from JSON strings (same logic as API)
    const processedForm = {
      ...form,
      fields: form.fields.map((field) => ({
        ...field,
        fieldOptions: field.fieldOptions ? 
          (() => {
            try {
              // Try to parse the JSON, handling multiple levels of escaping
              let parsed = field.fieldOptions;
              
              // Keep parsing until we get an actual array or object
              while (typeof parsed === 'string') {
                try {
                  parsed = JSON.parse(parsed);
                } catch {
                  // If parsing fails, break to avoid infinite loop
                  break;
                }
              }
              
              // Ensure we return an array for select/radio fields
              if (field.fieldType === 'select' || field.fieldType === 'radio') {
                return Array.isArray(parsed) ? parsed : [];
              }
              
              return parsed;
            } catch (error) {
              console.error('Error parsing fieldOptions for field:', field.fieldName, error);
              return field.fieldType === 'select' || field.fieldType === 'radio' ? [] : null;
            }
          })() : null
      }))
    };

    return processedForm;
  } catch (error) {
    console.error('Error fetching form data:', error);
    return null;
  }
}

// Add server-side pricing data fetching
async function fetchPricingData(pricingSectionId: number) {
  try {
    // Fetch all required data in parallel
    const [
      billingCycles,
      pricingSections,
      featureTypes,
      planLimits,
      basicFeatures,
      planBasicFeatures
    ] = await Promise.all([
      prisma.billingCycle.findMany({
        orderBy: { multiplier: 'asc' }
      }),
      prisma.pricingSection.findMany({
        include: {
          sectionPlans: {
            include: {
              plan: {
                include: {
                  pricing: {
                    include: {
                      billingCycle: true
                    }
                  },
                  features: {
                    include: {
                      feature: true
                    }
                  },
                  featureLimits: {
                    include: {
                      featureType: true
                    }
                  },
                  basicFeatures: {
                    include: {
                      basicFeature: true
                    }
                  }
                }
              }
            },
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      }),
      prisma.planFeatureType.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }),
      prisma.planFeatureLimit.findMany({
        include: {
          plan: true,
          featureType: true
        }
      }),
      prisma.basicFeature.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }),
      prisma.planBasicFeature.findMany({
        include: {
          plan: true,
          basicFeature: true
        }
      })
    ]);

    // Find the specific pricing section
    const pricingSection = pricingSections.find(s => s.id === pricingSectionId);
    if (!pricingSection) {
      return null;
    }

    // Extract plans from section
    const plans = pricingSection.sectionPlans
      ?.filter(sp => sp.isVisible && sp.plan.isActive)
      ?.sort((a, b) => a.plan.position - b.plan.position)
      ?.map(sp => sp.plan) || [];

    return {
      pricingSection,
      billingCycles,
      plans,
      planFeatureTypes: featureTypes,
      planLimits,
      basicFeatures,
      planBasicFeatures
    };
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    return null;
  }
}

// Add server-side FAQ data fetching
async function fetchFAQData(sectionCategories: number[] = []) {
  try {
    // Fetch categories and FAQs in parallel
    const [categories, faqs] = await Promise.all([
      prisma.fAQCategory.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { faqs: true }
          }
        },
        orderBy: { sortOrder: 'asc' }
      }),
      prisma.fAQ.findMany({
        where: { isActive: true },
        include: {
          category: true
        },
        orderBy: { sortOrder: 'asc' }
      })
    ]);

    // Filter categories if section has specific categories selected
    const filteredCategories = sectionCategories.length > 0 
      ? categories.filter(cat => sectionCategories.includes(cat.id))
      : categories;

    // Filter FAQs if section has specific categories selected
    const filteredFAQs = sectionCategories.length > 0
      ? faqs.filter(faq => faq.categoryId && sectionCategories.includes(faq.categoryId))
      : faqs;

    return {
      categories: filteredCategories,
      faqs: filteredFAQs
    };
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    return {
      categories: [],
      faqs: []
    };
  }
}

const ServerDynamicPageRenderer: React.FC<ServerDynamicPageRendererProps> = async ({ 
  pageSlug, 
  className = '' 
}) => {
  const sections = await fetchPageSections(pageSlug);
  const companyName = await fetchCompanyName();
  const homeHeroData = await fetchHomeHeroData(); // Fetch home hero data server-side

  const generateSectionId = (section: PageSection, index: number) => {
    const sectionType = section.sectionType.toLowerCase();
    const sectionName = section.title || section.heroSection?.name || section.featureGroup?.name || section.mediaSection?.headline || section.pricingSection?.name || section.faqSection?.name || section.form?.name || section.htmlSection?.name || 'section';
    const cleanName = sectionName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return `${sectionType}-${cleanName}-${index}`;
  };

  const renderSection = (section: PageSection, index: number) => {
    const sectionId = generateSectionId(section, index);
    
    const wrapWithSectionDiv = (content: React.ReactNode) => (
      <div id={sectionId} className="scroll-mt-20 relative">
        {content}
      </div>
    );

    switch (section.sectionType) {
      case 'hero':
        if (section.heroSection) {
          return wrapWithSectionDiv(
            <DynamicHeroSection 
              key={section.id} 
              heroSection={section.heroSection}
            />
          );
        }
        break;

      case 'features':
        if (section.featureGroup) {
          // Convert feature group data to match FeaturesSection props
          const features = section.featureGroup.items
            .filter(item => item.isVisible)
            .map(item => ({
              id: item.feature.id,
              title: item.feature.name,
              description: item.feature.description,
              iconName: item.feature.iconUrl,
              category: item.feature.category,
              sortOrder: item.feature.sortOrder,
              isVisible: item.feature.isActive,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder);

          return wrapWithSectionDiv(
            <FeaturesSection 
              key={section.id} 
              features={features}
              heading={section.featureGroup.name}
              subheading={section.featureGroup.description}
              layoutType={section.featureGroup.layoutType}
              backgroundColor={section.featureGroup.backgroundColor}
            />
          );
        }
        break;

      case 'media':
        if (section.mediaSection) {
          return wrapWithSectionDiv(
            <MediaSection 
              key={section.id} 
              id={section.mediaSection.id}
              headline={section.mediaSection.headline}
              subheading={section.mediaSection.subheading}
              mediaUrl={section.mediaSection.mediaUrl}
              mediaType={section.mediaSection.mediaType}
              layoutType={section.mediaSection.layoutType}
              badgeText={section.mediaSection.badgeText}
              isActive={section.mediaSection.isActive}
              position={section.mediaSection.position}
              alignment={section.mediaSection.alignment}
              mediaSize={section.mediaSection.mediaSize}
              mediaPosition={section.mediaSection.mediaPosition}
              showBadge={section.mediaSection.showBadge}
              showCtaButton={section.mediaSection.showCtaButton}
              ctaText={section.mediaSection.ctaText}
              ctaUrl={section.mediaSection.ctaUrl}
              ctaStyle={section.mediaSection.ctaStyle}
              enableScrollAnimations={section.mediaSection.enableScrollAnimations}
              animationType={section.mediaSection.animationType}
              backgroundStyle={section.mediaSection.backgroundStyle}
              backgroundColor={section.mediaSection.backgroundColor}
              textColor={section.mediaSection.textColor}
              paddingTop={section.mediaSection.paddingTop}
              paddingBottom={section.mediaSection.paddingBottom}
              containerMaxWidth={section.mediaSection.containerMaxWidth}
              features={section.mediaSection.features}
            />
          );
        }
        break;

      case 'pricing':
        if (section.pricingSection) {
          // Fetch pricing data server-side
          const pricingDataPromise = fetchPricingData(section.pricingSection.id);
          return wrapWithSectionDiv(
            <PricingSectionWrapper 
              key={section.id} 
              heading={section.pricingSection.heading}
              subheading={section.pricingSection.subheading}
              pricingSectionId={section.pricingSection.id}
              layoutType={section.pricingSection.layoutType}
              pricingDataPromise={pricingDataPromise}
            />
          );
        }
        break;

      case 'faq':
        if (section.faqSection) {
          // Fetch FAQ data server-side
          const sectionCategories = section.faqSection.sectionCategories?.map(sc => sc.categoryId) || [];
          const faqDataPromise = fetchFAQData(sectionCategories);
          return wrapWithSectionDiv(
            <FAQSectionWrapper 
              key={section.id} 
              heading={section.faqSection.heading}
              subheading={section.faqSection.subheading}
              heroTitle={section.faqSection.heroTitle}
              heroSubtitle={section.faqSection.heroSubtitle}
              searchPlaceholder={section.faqSection.searchPlaceholder}
              showHero={section.faqSection.showHero}
              showCategories={section.faqSection.showCategories}
              backgroundColor={section.faqSection.backgroundColor}
              heroBackgroundColor={section.faqSection.heroBackgroundColor}
              heroHeight={section.faqSection.heroHeight}
              sectionCategories={sectionCategories}
              faqCategoryId={section.faqCategoryId}
              faqDataPromise={faqDataPromise}
            />
          );
        }
        break;

      case 'form':
        if (section.form) {
          // Fetch form data server-side
          const formDataPromise = fetchFormData(section.form.id);
          return wrapWithSectionDiv(
            <FormSectionWrapper 
              key={section.id} 
              formId={section.form.id}
              title={section.form.title}
              subtitle={section.form.subheading}
              formDataPromise={formDataPromise}
            />
          );
        }
        break;

      case 'home_hero':
        return wrapWithSectionDiv(
          <HeroSection 
            key={section.id} 
            heroData={homeHeroData}
          />
        );
        break;

      case 'html':
        if (section.htmlSection) {
          return wrapWithSectionDiv(
            <HtmlSection 
              key={section.id} 
              htmlSection={section.htmlSection}
            />
          );
        }
        break;

      default:
        return wrapWithSectionDiv(
          <div key={section.id} className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Unknown Section Type: {section.sectionType}
              </h2>
              <p className="text-gray-600">
                This section type is not yet supported in the page builder.
              </p>
            </div>
          </div>
        );
    }
  };

  if (sections.length === 0) {
    return (
      <div className={`py-16 ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The page you're looking for doesn't exist or has no content sections.
            </p>
            <Link 
              href="/home" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {sections.map((section, index) => (
        <div key={section.id}>
          {renderSection(section, index)}
        </div>
      ))}
    </div>
  );
};

// Wrapper component to handle async form data
async function FormSectionWrapper({ 
  formId, 
  title, 
  subtitle, 
  formDataPromise 
}: { 
  formId: number; 
  title: string; 
  subtitle?: string; 
  formDataPromise: Promise<any>; 
}) {
  const formData = await formDataPromise;
  
  return (
    <FormSection 
      formId={formId}
      title={title}
      subtitle={subtitle}
      formData={formData}
    />
  );
}

// Wrapper component to handle async pricing data
async function PricingSectionWrapper({ 
  heading, 
  subheading, 
  pricingSectionId, 
  layoutType, 
  pricingDataPromise 
}: { 
  heading: string; 
  subheading?: string; 
  pricingSectionId: number; 
  layoutType: string; 
  pricingDataPromise: Promise<any>; 
}) {
  const pricingData = await pricingDataPromise;
  
  return (
    <ConfigurablePricingSection 
      heading={heading}
      subheading={subheading}
      pricingSectionId={pricingSectionId}
      layoutType={layoutType}
      pricingData={pricingData}
    />
  );
}

// Wrapper component to handle async FAQ data
async function FAQSectionWrapper({ 
  heading,
  subheading,
  heroTitle,
  heroSubtitle,
  searchPlaceholder,
  showHero,
  showCategories,
  backgroundColor,
  heroBackgroundColor,
  heroHeight,
  sectionCategories,
  faqCategoryId,
  faqDataPromise 
}: { 
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
  sectionCategories: number[];
  faqCategoryId?: number;
  faqDataPromise: Promise<any>; 
}) {
  const faqData = await faqDataPromise;
  
  return (
    <FAQSection 
      heading={heading}
      subheading={subheading}
      heroTitle={heroTitle}
      heroSubtitle={heroSubtitle}
      searchPlaceholder={searchPlaceholder}
      showHero={showHero}
      showCategories={showCategories}
      backgroundColor={backgroundColor}
      heroBackgroundColor={heroBackgroundColor}
      heroHeight={heroHeight}
      sectionCategories={sectionCategories}
      faqCategoryId={faqCategoryId}
      faqs={faqData.faqs}
      categories={faqData.categories}
    />
  );
}

export default ServerDynamicPageRenderer; 
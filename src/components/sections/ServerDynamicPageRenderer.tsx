import React from 'react';
import { prisma } from '@/lib/db';
import Link from 'next/link';

import FeaturesSection from './FeaturesSection';
import MediaSection from './MediaSection';
import FAQSection from './FAQSection';
import DynamicHeroSection from './DynamicHeroSection';
import HeroSection from './HeroSection';
import ConfigurablePricingSection from './ConfigurablePricingSection';
import FormSection from './FormSection';
import HtmlSection from './HtmlSection';
import TeamSection from './TeamSection';

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
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundOverlay?: string;
    // Color configurations
    taglineColor?: string;
    headlineColor?: string;
    subheadingColor?: string;
    ctaPrimaryBgColor?: string;
    ctaPrimaryTextColor?: string;
    ctaSecondaryBgColor?: string;
    ctaSecondaryTextColor?: string;
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
      events?: Array<{
        id: string;
        eventType: 'onClick' | 'onHover' | 'onMouseOut' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'onKeyUp' | 'onTouchStart' | 'onTouchEnd';
        functionName: string;
        description: string;
      }>;
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
      events?: Array<{
        id: string;
        eventType: 'onClick' | 'onHover' | 'onMouseOut' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'onKeyUp' | 'onTouchStart' | 'onTouchEnd';
        functionName: string;
        description: string;
      }>;
    };
  };
  featureGroup?: {
    id: number;
    name: string;
    description?: string;
    layoutType?: 'grid' | 'list';
    backgroundColor?: string;
    headingColor?: string;
    subheadingColor?: string;
    cardBackgroundColor?: string;
    titleColor?: string;
    subtitleColor?: string;
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
    badgeColor?: string;
    isActive: boolean;
    position: number;
    alignment: string;
    mediaSize: string;
    mediaPosition: string;
    showBadge: boolean;
    showCtaButton: boolean;
    ctaId?: number;
    cta?: {
      id: number;
      text: string;
      url: string;
      icon?: string;
      style: string;
      target: string;
      isActive: boolean;
    };
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
  teamSection?: {
    id: number;
    name: string;
    heading: string;
    subheading?: string;
    layoutType: 'grid' | 'staggered' | 'list';
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundOverlay?: string;
    headingColor?: string;
    subheadingColor?: string;
    cardBackgroundColor?: string;
    photoBackgroundColor?: string;
    nameColor?: string;
    positionColor?: string;
    bioColor?: string;
    socialTextColor?: string;
    socialBackgroundColor?: string;
    paddingTop: number;
    paddingBottom: number;
    containerMaxWidth: 'xl' | '2xl' | 'full';
    isActive: boolean;
    teamMembers: Array<{
      id: number;
      name: string;
      position: string;
      bio?: string;
      photoUrl?: string;
      photoAlt?: string;
      email?: string;
      phone?: string;
      linkedinUrl?: string;
      twitterUrl?: string;
      githubUrl?: string;
      websiteUrl?: string;
      sortOrder: number;
      isActive: boolean;
    }>;
  };
  teamSectionId?: number;
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
            ctaPrimary: {
              select: {
                id: true,
                text: true,
                url: true,
                customId: true,
                icon: true,
                style: true,
                target: true,
                isActive: true,
                events: true
              }
            },
            ctaSecondary: {
              select: {
                id: true,
                text: true,
                url: true,
                customId: true,
                icon: true,
                style: true,
                target: true,
                isActive: true,
                events: true
              }
            }
          }
        },
        featureGroup: {
          include: {
            items: {
              include: {
                feature: true
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
            },
            cta: true
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
        htmlSection: true,
        teamSection: {
          include: {
            teamMembers: {
              where: {
                isActive: true
              },
              orderBy: {
                sortOrder: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    // Patch events field for CTAs to always be an array of the correct type
    for (const section of sections) {
      if (section.heroSection) {
        if (section.heroSection.ctaPrimary) {
          const events = section.heroSection.ctaPrimary.events;
          if (!Array.isArray(events)) {
            section.heroSection.ctaPrimary.events = [];
          } else {
            section.heroSection.ctaPrimary.events = events as Array<{
              id: string;
              eventType: 'onClick' | 'onHover' | 'onMouseOut' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'onKeyUp' | 'onTouchStart' | 'onTouchEnd';
              functionName: string;
              description: string;
            }>;
          }
        }
        if (section.heroSection.ctaSecondary) {
          const events = section.heroSection.ctaSecondary.events;
          if (!Array.isArray(events)) {
            section.heroSection.ctaSecondary.events = [];
          } else {
            section.heroSection.ctaSecondary.events = events as Array<{
              id: string;
              eventType: 'onClick' | 'onHover' | 'onMouseOut' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'onKeyUp' | 'onTouchStart' | 'onTouchEnd';
              functionName: string;
              description: string;
            }>;
          }
        }
      }
    }

    // Debug: Log feature group data from database
    sections.forEach(section => {
      if (section.featureGroup) {
        console.log('🎯 Database - Feature Group:', section.featureGroup.name, 'layoutType:', section.featureGroup.layoutType);
      }
    });

    return sections as unknown as PageSection[];
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
        ctaPrimary: {
          select: {
            id: true,
            text: true,
            url: true,
            customId: true,
            icon: true,
            style: true,
            target: true,
            isActive: true,
            events: true
          }
        },
        ctaSecondary: {
          select: {
            id: true,
            text: true,
            url: true,
            customId: true,
            icon: true,
            style: true,
            target: true,
            isActive: true,
            events: true
          }
        }
      }
    });

    console.log('fetchHomeHeroData - Raw homeHero from database:', homeHero);
    
    if (!homeHero) {
      // Return default data if no hero exists
      return {
        id: null,
        heading: 'Automate Conversations, Capture Leads, Serve Customers — All Without Code',
        subheading: 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.',
        backgroundColor: '#FFFFFF',
        backgroundImage: '',
        backgroundSize: 'cover',
        backgroundOverlay: '',
        primaryCtaId: null,
        secondaryCtaId: null,
        primaryCta: null,
        secondaryCta: null,
        isActive: true,
        animationType: 'conversation',
        animationData: {
          conversationFlow: [
            {
              type: 'user',
              message: "Hi! Can I return a product if I'm outside Canada?",
              delay: 1000
            },
            {
              type: 'typing',
              delay: 2000
            },
            {
              type: 'ai',
              message: "Yes! Returns are accepted within 30 days globally. Need help creating a return label?",
              delay: 3500
            },
            {
              type: 'user',
              message: "That would be great! My order number is #SK-2024-001",
              delay: 6000
            },
            {
              type: 'typing',
              delay: 7000
            },
            {
              type: 'ai',
              message: "Perfect! I've generated your return label and sent it to your email. You'll also receive tracking updates. Anything else I can help with?",
              delay: 8500
            }
          ]
        },
              trustIndicators: [
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ],
      // Color controls with defaults
      headingColor: '#1F2937',
      subheadingColor: '#6B7280',
      trustIndicatorTextColor: '#6B7280',
      trustIndicatorBackgroundColor: '#F9FAFB'
      };
    }

    // Transform database data to component format
    const transformedData = {
      id: homeHero.id,
      heading: homeHero.headline,
      subheading: homeHero.subheading,
      backgroundColor: homeHero.backgroundColor || '#FFFFFF',
      backgroundSize: homeHero.backgroundSize || 'cover',
      backgroundOverlay: homeHero.backgroundOverlay || '',
      layoutType: homeHero.layoutType || 'split',
      mediaPosition: homeHero.mediaPosition || 'right',
      mediaSize: homeHero.mediaSize || 'full',
      heroHeight: homeHero.heroHeight || 'auto',
      lineSpacing: homeHero.lineSpacing || '4',

      primaryCtaId: homeHero.ctaPrimaryId || null,
      secondaryCtaId: homeHero.ctaSecondaryId || null,
      primaryCta: homeHero.ctaPrimary || null,
      secondaryCta: homeHero.ctaSecondary || null,

      isActive: homeHero.isActive,
      animationType: homeHero.animationType || 'conversation',
      animationData: homeHero.animationData ? JSON.parse(homeHero.animationData) : {
        conversationFlow: [
          {
            type: 'user',
            message: "Hi! Can I return a product if I'm outside Canada?",
            delay: 1000
          },
          {
            type: 'typing',
            delay: 2000
          },
          {
            type: 'ai',
            message: "Yes! Returns are accepted within 30 days globally. Need help creating a return label?",
            delay: 3500
          },
          {
            type: 'user',
            message: "That would be great! My order number is #SK-2024-001",
            delay: 6000
          },
          {
            type: 'typing',
            delay: 7000
          },
          {
            type: 'ai',
            message: "Perfect! I've generated your return label and sent it to your email. You'll also receive tracking updates. Anything else I can help with?",
            delay: 8500
          }
        ]
      },
      trustIndicators: homeHero.trustIndicators ? JSON.parse(homeHero.trustIndicators) : [
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ],
      // Color controls with defaults
      headingColor: homeHero.headingColor || '#1F2937',
      subheadingColor: homeHero.subheadingColor || '#6B7280',
      trustIndicatorTextColor: homeHero.trustIndicatorTextColor || '#6B7280',
      trustIndicatorBackgroundColor: homeHero.trustIndicatorBackgroundColor || '#F9FAFB'
    };
    
    console.log('fetchHomeHeroData - Transformed data:', transformedData);
    return transformedData;
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
      animationType: 'conversation',
      animationData: {
        conversationFlow: [
          {
            type: 'user',
            message: "Hi! Can I return a product if I'm outside Canada?",
            delay: 1000
          },
          {
            type: 'typing',
            delay: 2000
          },
          {
            type: 'ai',
            message: "Yes! Returns are accepted within 30 days globally. Need help creating a return label?",
            delay: 3500
          },
          {
            type: 'user',
            message: "That would be great! My order number is #SK-2024-001",
            delay: 6000
          },
          {
            type: 'typing',
            delay: 7000
          },
          {
            type: 'ai',
            message: "Perfect! I've generated your return label and sent it to your email. You'll also receive tracking updates. Anything else I can help with?",
            delay: 8500
          }
        ]
      },
      trustIndicators: [
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ],
      // Color controls with defaults (same as API defaults)
      headingColor: '#1F2937',
      subheadingColor: '#6B7280',
      trustIndicatorTextColor: '#6B7280',
      trustIndicatorBackgroundColor: '#F9FAFB'
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
  console.log('Found sections for page:', pageSlug, sections);
  const companyName = await fetchCompanyName();
  const homeHeroData = await fetchHomeHeroData(); // Fetch home hero data server-side
  console.log('Home hero data:', homeHeroData);

  const generateSectionId = (section: PageSection, index: number) => {
    const sectionType = section.sectionType.toLowerCase();
    const sectionName = section.title || section.heroSection?.name || section.featureGroup?.name || section.mediaSection?.headline || section.pricingSection?.name || section.faqSection?.name || section.form?.name || section.htmlSection?.name || section.teamSection?.name || 'section';
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

      case 'home_hero':
        // Use the home hero data as fallback for home_hero sections
        return wrapWithSectionDiv(
          <HeroSection 
            key={section.id} 
            heroData={homeHeroData}
          />
        );

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

          console.log('🎯 ServerDynamicPageRenderer - Features count:', features.length);
          console.log('🎯 ServerDynamicPageRenderer - All items count:', section.featureGroup.items.length);
          console.log('🎯 ServerDynamicPageRenderer - Visible items count:', section.featureGroup.items.filter(item => item.isVisible).length);
          console.log('🎯 ServerDynamicPageRenderer - All items:', section.featureGroup.items.map(item => ({
            id: item.id,
            isVisible: item.isVisible,
            featureName: item.feature.name
          })));

          console.log('🎯 ServerDynamicPageRenderer - Feature Group layoutType from database:', section.featureGroup.layoutType);
          
          return wrapWithSectionDiv(
            <FeaturesSection 
              key={section.id} 
              features={features}
              heading={section.featureGroup.name}
              subheading={section.featureGroup.description}
              layoutType={section.featureGroup.layoutType}
              backgroundColor={section.featureGroup.backgroundColor}
              headingColor={section.featureGroup.headingColor}
              subheadingColor={section.featureGroup.subheadingColor}
              cardBackgroundColor={section.featureGroup.cardBackgroundColor}
              titleColor={section.featureGroup.titleColor}
              subtitleColor={section.featureGroup.subtitleColor}
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
              badgeColor={section.mediaSection.badgeColor}
              isActive={section.mediaSection.isActive}
              position={section.mediaSection.position}
              alignment={section.mediaSection.alignment}
              mediaSize={section.mediaSection.mediaSize}
              mediaPosition={section.mediaSection.mediaPosition}
              showBadge={section.mediaSection.showBadge}
              showCtaButton={section.mediaSection.showCtaButton}
              ctaId={section.mediaSection.ctaId}
              cta={section.mediaSection.cta}
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

      case 'team':
        if (section.teamSection) {
          return wrapWithSectionDiv(
            <TeamSection 
              key={section.id} 
              heading={section.teamSection.heading}
              subheading={section.teamSection.subheading}
              layoutType={section.teamSection.layoutType}
              backgroundColor={section.teamSection.backgroundColor}
              backgroundImage={section.teamSection.backgroundImage}
              backgroundSize={section.teamSection.backgroundSize}
              backgroundOverlay={section.teamSection.backgroundOverlay}
              headingColor={section.teamSection.headingColor}
              subheadingColor={section.teamSection.subheadingColor}
              cardBackgroundColor={section.teamSection.cardBackgroundColor}
              photoBackgroundColor={section.teamSection.photoBackgroundColor}
              nameColor={section.teamSection.nameColor}
              positionColor={section.teamSection.positionColor}
              bioColor={section.teamSection.bioColor}
              socialTextColor={section.teamSection.socialTextColor}
              socialBackgroundColor={section.teamSection.socialBackgroundColor}
              paddingTop={section.teamSection.paddingTop}
              paddingBottom={section.teamSection.paddingBottom}
              containerMaxWidth={section.teamSection.containerMaxWidth}
              teamMembers={section.teamSection.teamMembers}
            />
          );
        }
        break;

      default:
        return wrapWithSectionDiv(
          <div key={section.id} className="py-16 bg-[var(--color-bg-secondary,#F9FAFB)]">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary,#1F2937)] mb-4">
                Unknown Section Type: {section.sectionType}
              </h2>
              <p className="text-[var(--color-text-secondary,#6B7280)]">
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
            <h1 className="text-4xl font-bold text-[var(--color-text-primary,#1F2937)] mb-6">
              Page Not Found
            </h1>
            <p className="text-xl text-[var(--color-text-secondary,#6B7280)] mb-8">
              The page you're looking for doesn't exist or has no content sections.
            </p>
            <Link 
              href="/home" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[var(--color-primary,#5243E9)] hover:bg-[var(--color-primary-dark,#4338CA)] transition-colors"
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
import type { Metadata } from "next";
import { prisma } from './db';
import { getPageJsonLd, type SiteSettings as JsonLdSiteSettings } from './jsonld';
import { getOptimalOgImage } from './imageSeo';

interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  robots?: string;
  lastModified?: string;
}

interface MetadataWithJsonLd {
  metadata: Metadata;
  jsonLd: string;
}

interface PageData {
  slug: string;
  title: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
  updatedAt?: Date;
}

interface FAQCategoryData {
  name: string;
  description?: string | null;
  faqCount: number;
  updatedAt: Date;
}

interface FAQQuestionData {
  question: string;
  answer: string;
  categoryName: string;
  updatedAt: Date;
}

// Get site settings for consistent metadata
async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return {
      baseUrl: settings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      siteName: settings?.footerCompanyName || 'Saski AI',
      siteDescription: settings?.footerCompanyDescription || 'Transform Your Customer Communication with AI',
      ogImage: settings?.logoUrl || settings?.logoLightUrl || '/favicon.svg'
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      siteName: 'Saski AI',
      siteDescription: 'Transform Your Customer Communication with AI',
      ogImage: '/favicon.svg'
    };
  }
}

// Get enhanced site settings for JSON-LD
async function getJsonLdSiteSettings(): Promise<JsonLdSiteSettings> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return {
      baseUrl: settings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      siteName: settings?.footerCompanyName || 'Saski AI',
      siteDescription: settings?.footerCompanyDescription || 'Transform Your Customer Communication with AI',
      logoUrl: settings?.logoUrl || settings?.logoLightUrl || undefined,
      logoLightUrl: settings?.logoLightUrl || undefined,
      logoDarkUrl: settings?.logoDarkUrl || undefined,
      companyPhone: settings?.companyPhone || undefined,
      companyEmail: settings?.companyEmail || undefined,
      companyAddress: settings?.companyAddress || undefined,
      socialFacebook: settings?.socialFacebook || undefined,
      socialTwitter: settings?.socialTwitter || undefined,
      socialLinkedin: settings?.socialLinkedin || undefined,
      socialInstagram: settings?.socialInstagram || undefined,
      socialYoutube: settings?.socialYoutube || undefined
    };
  } catch (error) {
    console.error('Error fetching JSON-LD site settings:', error);
    return {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      siteName: 'Saski AI',
      siteDescription: 'Transform Your Customer Communication with AI'
    };
  }
}

// Generate metadata for dynamic pages (from database)
export async function generatePageMetadata(slug: string): Promise<Metadata> {
  try {
    const siteSettings = await getSiteSettings();
    
    const [page, optimalImage] = await Promise.all([
      prisma.page.findFirst({
        where: { slug },
        select: {
          slug: true,
          title: true,
          metaTitle: true,
          metaDesc: true,
          updatedAt: true
        }
      }),
      getOptimalOgImage(slug, siteSettings.ogImage)
    ]);

    if (!page) {
      return generateNotFoundMetadata();
    }

    const title = page.metaTitle || page.title || 'Page';
    const description = page.metaDesc || siteSettings.siteDescription;
    const canonicalUrl = `${siteSettings.baseUrl}/${slug}`;
    const ogImage = optimalImage?.url || siteSettings.ogImage;

    return generateMetadata({
      title: `${title} | ${siteSettings.siteName}`,
      description,
      canonicalUrl,
      ogImage,
      ogType: 'website',
      lastModified: page.updatedAt?.toISOString()
    });

  } catch (error) {
    console.error(`Error generating metadata for page ${slug}:`, error);
    return generateErrorMetadata();
  }
}

// Generate metadata for FAQ category pages
export async function generateFAQCategoryMetadata(categorySlug: string): Promise<Metadata> {
  try {
    const siteSettings = await getSiteSettings();
    
    // Find category by slug
    const categories = await prisma.fAQCategory.findMany({
      select: {
        name: true,
        description: true,
        updatedAt: true,
        _count: {
          select: {
            faqs: { where: { isActive: true } }
          }
        }
      },
      where: { isActive: true }
    });

    let category = null;
    for (const cat of categories) {
      const catSlug = createSlug(cat.name);
      if (catSlug === categorySlug) {
        category = cat;
        break;
      }
    }

    if (!category) {
      return generateNotFoundMetadata();
    }

    const title = `${category.name} FAQ | ${siteSettings.siteName}`;
    const description = category.description || 
      `Find answers to frequently asked questions about ${category.name}. ${category._count.faqs} questions available.`;
    const canonicalUrl = `${siteSettings.baseUrl}/faq/${categorySlug}`;
    
    // Try to get optimal image for FAQ category page
    const optimalImage = await getOptimalOgImage(`faq-${categorySlug}`, siteSettings.ogImage);

    return generateMetadata({
      title,
      description,
      canonicalUrl,
      ogImage: optimalImage?.url || siteSettings.ogImage,
      ogType: 'website',
      lastModified: category.updatedAt.toISOString()
    });

  } catch (error) {
    console.error(`Error generating metadata for FAQ category ${categorySlug}:`, error);
    return generateErrorMetadata();
  }
}

// Generate metadata for individual FAQ question pages
export async function generateFAQQuestionMetadata(categorySlug: string, questionSlug: string): Promise<Metadata> {
  try {
    const siteSettings = await getSiteSettings();
    
    // Find FAQ by slugs
    const faqs = await prisma.fAQ.findMany({
      select: {
        question: true,
        answer: true,
        updatedAt: true,
        category: {
          select: {
            name: true
          }
        }
      },
      where: { 
        isActive: true,
        category: {
          isActive: true
        }
      }
    });

    let faq = null;
    for (const f of faqs) {
      if (!f.category) continue;
      const faqCategorySlug = createSlug(f.category.name);
      const faqQuestionSlug = createSlug(f.question);
      
      if (faqCategorySlug === categorySlug && faqQuestionSlug === questionSlug) {
        faq = f;
        break;
      }
    }

    if (!faq || !faq.category) {
      return generateNotFoundMetadata();
    }

    const title = `${faq.question} | ${faq.category.name} FAQ | ${siteSettings.siteName}`;
    const description = faq.answer.length > 160 
      ? `${faq.answer.substring(0, 157)}...`
      : faq.answer;
    const canonicalUrl = `${siteSettings.baseUrl}/faq/${categorySlug}/${questionSlug}`;
    
    // Try to get optimal image for FAQ question page
    const optimalImage = await getOptimalOgImage(`faq-${categorySlug}-${questionSlug}`, siteSettings.ogImage);

    return generateMetadata({
      title,
      description,
      canonicalUrl,
      ogImage: optimalImage?.url || siteSettings.ogImage,
      ogType: 'article',
      lastModified: faq.updatedAt.toISOString()
    });

  } catch (error) {
    console.error(`Error generating metadata for FAQ ${categorySlug}/${questionSlug}:`, error);
    return generateErrorMetadata();
  }
}

// Enhanced metadata generation with JSON-LD
export async function generatePageMetadataWithJsonLd(slug: string): Promise<MetadataWithJsonLd> {
  try {
    const [page, siteSettings, jsonLdSettings] = await Promise.all([
      prisma.page.findFirst({
        where: { slug },
        select: {
          slug: true,
          title: true,
          metaTitle: true,
          metaDesc: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      getSiteSettings(),
      getJsonLdSiteSettings()
    ]);

    if (!page) {
      return {
        metadata: generateNotFoundMetadata(),
        jsonLd: ''
      };
    }

    const title = page.metaTitle || page.title || 'Page';
    const description = page.metaDesc || siteSettings.siteDescription;
    const canonicalUrl = `${siteSettings.baseUrl}/${slug}`;

    const metadata = await generateMetadata({
      title: `${title} | ${siteSettings.siteName}`,
      description,
      canonicalUrl,
      ogType: 'website',
      lastModified: page.updatedAt?.toISOString()
    });

    const pageType = slug === 'home' ? 'home' : 'page';
    const jsonLd = getPageJsonLd(pageType, {
      title,
      description,
      url: canonicalUrl,
      createdAt: page.createdAt?.toISOString(),
      updatedAt: page.updatedAt?.toISOString()
    }, jsonLdSettings);

    return { metadata, jsonLd };

  } catch (error) {
    console.error(`Error generating metadata with JSON-LD for page ${slug}:`, error);
    return {
      metadata: generateErrorMetadata(),
      jsonLd: ''
    };
  }
}

export async function generateFAQCategoryMetadataWithJsonLd(categorySlug: string): Promise<MetadataWithJsonLd> {
  try {
    const [siteSettings, jsonLdSettings] = await Promise.all([
      getSiteSettings(),
      getJsonLdSiteSettings()
    ]);
    
    // Find category by slug
    const categories = await prisma.fAQCategory.findMany({
      select: {
        name: true,
        description: true,
        updatedAt: true,
        faqs: {
          select: {
            question: true,
            answer: true
          },
          where: { isActive: true }
        },
        _count: {
          select: {
            faqs: { where: { isActive: true } }
          }
        }
      },
      where: { isActive: true }
    });

    let category = null;
    for (const cat of categories) {
      const catSlug = createSlug(cat.name);
      if (catSlug === categorySlug) {
        category = cat;
        break;
      }
    }

    if (!category) {
      return {
        metadata: generateNotFoundMetadata(),
        jsonLd: ''
      };
    }

    const title = `${category.name} FAQ | ${siteSettings.siteName}`;
    const description = category.description || 
      `Find answers to frequently asked questions about ${category.name}. ${category._count.faqs} questions available.`;
    const canonicalUrl = `${siteSettings.baseUrl}/faq/${categorySlug}`;

    const metadata = await generateMetadata({
      title,
      description,
      canonicalUrl,
      ogType: 'website',
      lastModified: category.updatedAt.toISOString()
    });

    const jsonLd = getPageJsonLd('faq-category', {
      title,
      description,
      url: canonicalUrl,
      updatedAt: category.updatedAt.toISOString()
    }, jsonLdSettings, {
      faqs: category.faqs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      })),
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'FAQ', url: '/faq' },
        { name: category.name, url: `/faq/${categorySlug}` }
      ]
    });

    return { metadata, jsonLd };

  } catch (error) {
    console.error(`Error generating metadata with JSON-LD for FAQ category ${categorySlug}:`, error);
    return {
      metadata: generateErrorMetadata(),
      jsonLd: ''
    };
  }
}

export async function generateFAQQuestionMetadataWithJsonLd(categorySlug: string, questionSlug: string): Promise<MetadataWithJsonLd> {
  try {
    const [siteSettings, jsonLdSettings] = await Promise.all([
      getSiteSettings(),
      getJsonLdSiteSettings()
    ]);
    
    // Find FAQ by slugs
    const faqs = await prisma.fAQ.findMany({
      select: {
        question: true,
        answer: true,
        updatedAt: true,
        category: {
          select: {
            name: true
          }
        }
      },
      where: { 
        isActive: true,
        category: {
          isActive: true
        }
      }
    });

    let faq = null;
    for (const f of faqs) {
      if (!f.category) continue;
      const faqCategorySlug = createSlug(f.category.name);
      const faqQuestionSlug = createSlug(f.question);
      
      if (faqCategorySlug === categorySlug && faqQuestionSlug === questionSlug) {
        faq = f;
        break;
      }
    }

    if (!faq || !faq.category) {
      return {
        metadata: generateNotFoundMetadata(),
        jsonLd: ''
      };
    }

    const title = `${faq.question} | ${faq.category.name} FAQ | ${siteSettings.siteName}`;
    const description = faq.answer.length > 160 
      ? `${faq.answer.substring(0, 157)}...`
      : faq.answer;
    const canonicalUrl = `${siteSettings.baseUrl}/faq/${categorySlug}/${questionSlug}`;

    const metadata = await generateMetadata({
      title,
      description,
      canonicalUrl,
      ogType: 'article',
      lastModified: faq.updatedAt.toISOString()
    });

    const jsonLd = getPageJsonLd('faq-question', {
      title: faq.question,
      description,
      url: canonicalUrl,
      updatedAt: faq.updatedAt.toISOString()
    }, jsonLdSettings, {
      question: faq.question,
      answer: faq.answer,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'FAQ', url: '/faq' },
        { name: faq.category.name, url: `/faq/${categorySlug}` },
        { name: faq.question, url: `/faq/${categorySlug}/${questionSlug}` }
      ]
    });

    return { metadata, jsonLd };

  } catch (error) {
    console.error(`Error generating metadata with JSON-LD for FAQ question ${categorySlug}/${questionSlug}:`, error);
    return {
      metadata: generateErrorMetadata(),
      jsonLd: ''
    };
  }
}

// Core metadata generation function
async function generateMetadata(seoData: SEOMetadata): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  
  // Determine image dimensions based on image type
  const isSvg = (seoData.ogImage || siteSettings.ogImage)?.includes('.svg');
  const imageConfig = {
    url: seoData.ogImage || siteSettings.ogImage,
    width: isSvg ? 1200 : 1200,
    height: isSvg ? 630 : 630,
    alt: seoData.title,
  };
  
  const metadata: Metadata = {
    title: seoData.title,
    description: seoData.description,
    metadataBase: new URL(siteSettings.baseUrl),
    alternates: {
      canonical: seoData.canonicalUrl,
    },
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: seoData.canonicalUrl,
      siteName: siteSettings.siteName,
      images: [imageConfig],
      locale: "en_US",
      type: seoData.ogType || "website",
    },
    twitter: {
      card: seoData.twitterCard || "summary_large_image",
      title: seoData.title,
      description: seoData.description,
      images: [seoData.ogImage || siteSettings.ogImage],
      creator: "@saskiai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  // Add keywords if provided
  if (seoData.keywords) {
    metadata.keywords = seoData.keywords;
  }

  // Add last modified if provided
  if (seoData.lastModified) {
    metadata.other = {
      'last-modified': seoData.lastModified,
    };
  }

  return metadata;
}

// Helper function to create URL-friendly slugs
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .trim()
    .substring(0, 100);       // Limit length
}

// Generate 404 metadata
function generateNotFoundMetadata(): Metadata {
  return {
    title: "Page Not Found | Saski AI",
    description: "The page you're looking for doesn't exist.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

// Generate error metadata
function generateErrorMetadata(): Metadata {
  return {
    title: "Error | Saski AI",
    description: "An error occurred while loading this page.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

// Validate required SEO tags for a given page
export async function validatePageSEO(url: string): Promise<{
  isValid: boolean;
  missing: string[];
  issues: string[];
  warnings: string[];
}> {
  const missing: string[] = [];
  const issues: string[] = [];
  const warnings: string[] = [];

  try {
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SEO-Audit-Bot/1.0'
      }
    });

    if (!response.ok) {
      return {
        isValid: false,
        missing: ['Page not accessible'],
        issues: [`HTTP ${response.status}: ${response.statusText}`],
        warnings: []
      };
    }

    const html = await response.text();

    // Check for required meta tags
    const requiredTags = [
      { tag: '<title>', name: 'Title tag', required: true },
      { tag: 'name="description"', name: 'Meta description', required: true },
      { tag: 'rel="canonical"', name: 'Canonical URL', required: true },
      { tag: 'name="robots"', name: 'Robots directive', required: true },
      { tag: 'property="og:title"', name: 'OpenGraph title', required: true },
      { tag: 'name="twitter:card"', name: 'Twitter card', required: false },
      { tag: 'application/ld+json', name: 'JSON-LD structured data', required: true }
    ];

    requiredTags.forEach(({ tag, name, required }) => {
      if (!html.includes(tag)) {
        if (required) {
          missing.push(name);
        } else {
          warnings.push(`${name} is missing (optional but recommended)`);
        }
      }
    });

    // Additional checks
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1];
      if (title.length > 60) {
        warnings.push('Title is too long (over 60 characters)');
      }
      if (title.length < 30) {
        warnings.push('Title might be too short (under 30 characters)');
      }
    }

    const descMatch = html.match(/name="description"[^>]*content="([^"]*)">/i);
    if (descMatch) {
      const desc = descMatch[1];
      if (desc.length > 160) {
        warnings.push('Meta description is too long (over 160 characters)');
      }
      if (desc.length < 120) {
        warnings.push('Meta description might be too short (under 120 characters)');
      }
    }

    return {
      isValid: missing.length === 0,
      missing,
      issues,
      warnings
    };

  } catch (error) {
    return {
      isValid: false,
      missing: ['Unable to fetch page'],
      issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
} 
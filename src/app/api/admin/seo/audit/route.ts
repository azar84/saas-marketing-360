import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validatePageSEO } from '@/lib/metadata';

interface Page {
  id: number;
  slug: string;
  title: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FAQPageInfo {
  type: 'faq-category' | 'faq-question';
  url: string;
  title: string;
  updatedAt: Date;
}

interface SEOAuditResult {
  page?: Page;
  faqPage?: FAQPageInfo;
  url: string;
  issues: string[];
  warnings: string[];
  suggestions: string[];
  score: number;
  metaTagsStatus: {
    title: boolean;
    description: boolean;
    canonical: boolean;
    robots: boolean;
    ogTitle: boolean;
    twitterCard: boolean;
    jsonLd: boolean;
  };
  liveSEOCheck?: {
    isValid: boolean;
    missing: string[];
    issues: string[];
    warnings: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { checkLivePages = false } = await request.json();

    // Get site settings for base URL
    const siteSettings = await prisma.siteSettings.findFirst();
    const baseUrl = siteSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Fetch all pages from database
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        metaTitle: true,
        metaDesc: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    // Get FAQ pages for comprehensive audit
    const faqPages = await getFAQPages(baseUrl);

    // Combine all pages for audit
    const allPageResults: SEOAuditResult[] = [];

    // Audit regular pages
    for (const page of pages) {
      const pageUrl = `${baseUrl}/${page.slug}`;
      const result = await auditPage(page, siteSettings, pageUrl, checkLivePages);
      allPageResults.push(result);
    }

    // Audit FAQ pages
    for (const faqPage of faqPages) {
      const result = await auditFAQPage(faqPage, checkLivePages);
      allPageResults.push(result);
    }

    // Calculate overall statistics
    const totalPages = allPageResults.length;
    const averageScore = allPageResults.reduce((sum, result) => sum + result.score, 0) / totalPages;
    const pagesWithIssues = allPageResults.filter(result => result.issues.length > 0).length;
    const pagesWithWarnings = allPageResults.filter(result => result.warnings.length > 0).length;
    const pagesWithMissingMetaTags = allPageResults.filter(result => 
      !result.metaTagsStatus.title || 
      !result.metaTagsStatus.description || 
      !result.metaTagsStatus.canonical || 
      !result.metaTagsStatus.robots || 
      !result.metaTagsStatus.ogTitle
    ).length;

    return NextResponse.json({
      success: true,
      message: `SEO audit completed successfully${checkLivePages ? ' with live page analysis' : ''}`,
      results: allPageResults,
      summary: {
        totalPages,
        regularPages: pages.length,
        faqPages: faqPages.length,
        averageScore: Math.round(averageScore),
        pagesWithIssues,
        pagesWithWarnings,
        pagesWithMissingMetaTags,
        livePageCheckEnabled: checkLivePages,
        auditedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error running SEO audit:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to run SEO audit',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getFAQPages(baseUrl: string): Promise<FAQPageInfo[]> {
  const faqPages: FAQPageInfo[] = [];

  try {
    // Get FAQ categories
    const categories = await prisma.fAQCategory.findMany({
      select: {
        name: true,
        updatedAt: true,
        faqs: {
          select: {
            question: true,
            updatedAt: true
          },
          where: { isActive: true }
        }
      },
      where: { isActive: true }
    });

    for (const category of categories) {
      const categorySlug = createSlug(category.name);
      
      // Add category page
      faqPages.push({
        type: 'faq-category',
        url: `${baseUrl}/faq/${categorySlug}`,
        title: `${category.name} FAQ Category`,
        updatedAt: category.updatedAt
      });

      // Add individual FAQ question pages
      for (const faq of category.faqs) {
        const questionSlug = createSlug(faq.question);
        faqPages.push({
          type: 'faq-question',
          url: `${baseUrl}/faq/${categorySlug}/${questionSlug}`,
          title: faq.question,
          updatedAt: faq.updatedAt
        });
      }
    }
  } catch (error) {
    console.error('Error fetching FAQ pages:', error);
  }

  return faqPages;
}

async function checkPageVisibilityInMenus(pageId: number): Promise<boolean> {
  try {
    // Find all menu items that reference this page
    const menuItems = await prisma.menuItem.findMany({
      where: {
        pageId: pageId,
        isActive: true
      },
      include: {
        menu: {
          include: {
            headerConfigs: {
              where: {
                isVisible: true,
                headerConfig: {
                  isActive: true
                }
              }
            }
          }
        }
      }
    });

    if (menuItems.length === 0) {
      return false; // Page is not in any menu items
    }

    // Check if any of the menus are visible in header
    const isInHeader = menuItems.some(item => 
      item.menu.headerConfigs.length > 0
    );

    if (isInHeader) {
      return true;
    }

    // Check if any of the menus are in footer
    const siteSettings = await prisma.siteSettings.findFirst();
    if (siteSettings?.footerMenuIds) {
      const footerMenuIds = siteSettings.footerMenuIds.split(',').map(id => parseInt(id.trim()));
      const isInFooter = menuItems.some(item => 
        footerMenuIds.includes(item.menu.id)
      );
      
      if (isInFooter) {
        return true;
      }
    }

    return false; // Page is in menus but those menus are not visible in header or footer
  } catch (error) {
    console.error('Error checking page visibility in menus:', error);
    return false; // Default to not visible if there's an error
  }
}

async function auditPage(page: Page, siteSettings: any, pageUrl: string, checkLive: boolean): Promise<SEOAuditResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check database fields first
  const metaTagsStatus = {
    title: false,
    description: false,
    canonical: false,
    robots: false,
    ogTitle: false,
    twitterCard: false,
    jsonLd: false
  };

  // Check page title
  if (!page.title || page.title.trim().length === 0) {
    issues.push('Page title is missing');
    score -= 20;
  } else {
    metaTagsStatus.title = true;
    if (page.title.length > 60) {
      warnings.push('Page title is too long (over 60 characters)');
      score -= 5;
    }
    if (page.title.length < 30) {
      suggestions.push('Consider making the page title more descriptive (30-60 characters)');
    }
  }

  // Check meta title
  if (!page.metaTitle) {
    warnings.push('Meta title is missing - using page title instead');
    score -= 10;
  } else {
    if (page.metaTitle.length > 60) {
      warnings.push('Meta title is too long (over 60 characters)');
      score -= 5;
    }
    if (page.metaTitle.length < 30) {
      suggestions.push('Consider making the meta title more descriptive (30-60 characters)');
    }
  }

  // Check meta description
  if (!page.metaDesc) {
    issues.push('Meta description is missing');
    score -= 15;
  } else {
    metaTagsStatus.description = true;
    if (page.metaDesc.length > 160) {
      warnings.push('Meta description is too long (over 160 characters)');
      score -= 5;
    }
    if (page.metaDesc.length < 120) {
      suggestions.push('Consider expanding the meta description (120-160 characters)');
    }
  }

  // Assume these are implemented by our metadata system
  metaTagsStatus.canonical = true;
  metaTagsStatus.robots = true;
  metaTagsStatus.ogTitle = true;
  metaTagsStatus.twitterCard = true;
  metaTagsStatus.jsonLd = true; // JSON-LD should be added by our enhanced metadata system

  // Check URL structure
  if (page.slug.includes('_')) {
    suggestions.push('Consider using hyphens instead of underscores in URL slug');
  }
  
  if (page.slug.length > 50) {
    warnings.push('URL slug is quite long - consider shortening it');
    score -= 3;
  }

  // Check navigation visibility through menu system
  const isVisibleInNavigation = await checkPageVisibilityInMenus(page.id);
  if (!isVisibleInNavigation && page.slug !== 'home') {
    warnings.push('Page is not visible in navigation - may have limited discoverability');
    score -= 5;
  }

  // Home page specific checks
  if (page.slug === 'home') {
    if (!page.metaTitle && !page.title.toLowerCase().includes('home')) {
      suggestions.push('Consider including your brand name in the home page title');
    }
  }

  // Check for duplicate content indicators
  if (page.title === page.metaTitle) {
    suggestions.push('Meta title is identical to page title - consider making them unique');
  }

  // Site-wide checks
  if (!siteSettings?.baseUrl) {
    warnings.push('Base URL is not configured in site settings');
    score -= 5;
  }

  // Live page check
  let liveSEOCheck;
  if (checkLive) {
    try {
      liveSEOCheck = await validatePageSEO(pageUrl);
      
      // Adjust score based on live check results
      if (!liveSEOCheck.isValid) {
        score -= liveSEOCheck.missing.length * 10;
        issues.push(...liveSEOCheck.missing.map(m => `Live check: Missing ${m}`));
      }
      
      if (liveSEOCheck.issues.length > 0) {
        score -= liveSEOCheck.issues.length * 5;
        issues.push(...liveSEOCheck.issues.map(i => `Live check: ${i}`));
      }

      warnings.push(...liveSEOCheck.warnings.map(w => `Live check: ${w}`));

    } catch (error) {
      warnings.push('Could not perform live page check');
    }
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Add positive suggestions based on good practices
  if (score >= 80) {
    suggestions.push('Great job! This page follows SEO best practices');
  } else if (score >= 60) {
    suggestions.push('Good foundation - address the warnings to improve SEO score');
  } else {
    suggestions.push('This page needs attention - resolve critical issues first');
  }

  return {
    page,
    url: pageUrl,
    issues,
    warnings,
    suggestions,
    score,
    metaTagsStatus,
    liveSEOCheck
  };
}

async function auditFAQPage(faqPage: FAQPageInfo, checkLive: boolean): Promise<SEOAuditResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 90; // Start higher for FAQ pages as they're generated

  // FAQ pages should have proper metadata from our system
  const metaTagsStatus = {
    title: true,        // Generated by our metadata system
    description: true,   // Generated by our metadata system
    canonical: true,     // Generated by our metadata system
    robots: true,        // Generated by our metadata system
    ogTitle: true,       // Generated by our metadata system
    twitterCard: true,   // Generated by our metadata system
    jsonLd: true         // Generated by our metadata system
  };

  // Live page check
  let liveSEOCheck;
  if (checkLive) {
    try {
      liveSEOCheck = await validatePageSEO(faqPage.url);
      
      // Adjust score based on live check results
      if (!liveSEOCheck.isValid) {
        score -= liveSEOCheck.missing.length * 15;
        issues.push(...liveSEOCheck.missing.map(m => `Live check: Missing ${m}`));
        
        // Update metaTagsStatus based on actual findings
        liveSEOCheck.missing.forEach(missing => {
          if (missing.includes('Title')) metaTagsStatus.title = false;
          if (missing.includes('description')) metaTagsStatus.description = false;
          if (missing.includes('canonical')) metaTagsStatus.canonical = false;
          if (missing.includes('robots')) metaTagsStatus.robots = false;
          if (missing.includes('OpenGraph')) metaTagsStatus.ogTitle = false;
          if (missing.includes('Twitter')) metaTagsStatus.twitterCard = false;
        });
      }
      
      if (liveSEOCheck.issues.length > 0) {
        score -= liveSEOCheck.issues.length * 10;
        issues.push(...liveSEOCheck.issues.map(i => `Live check: ${i}`));
      }

      warnings.push(...liveSEOCheck.warnings.map(w => `Live check: ${w}`));

    } catch (error) {
      warnings.push('Could not perform live page check');
      score -= 5;
    }
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  if (score >= 80) {
    suggestions.push('FAQ page appears to be well-optimized');
  } else {
    suggestions.push('FAQ page may need metadata improvements');
  }

  return {
    faqPage,
    url: faqPage.url,
    issues,
    warnings,
    suggestions,
    score,
    metaTagsStatus,
    liveSEOCheck
  };
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
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export async function POST(request: NextRequest) {
  try {
    // Fetch all pages from database
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        metaTitle: true,
        metaDesc: true,
        sortOrder: true,
        showInHeader: true,
        showInFooter: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    // Fetch FAQ categories and FAQs
    const faqCategories = await prisma.fAQCategory.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true,
        isActive: true,
        faqs: {
          select: {
            id: true,
            question: true,
            updatedAt: true,
            isActive: true,
          },
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    // Get site settings for base URL
    const siteSettings = await prisma.siteSettings.findFirst();
    const baseUrl = siteSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Helper function to create URL-friendly slugs
    const createSlug = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single
        .trim()
        .substring(0, 100);       // Limit length
    };

    // Generate sitemap entries for all content
    const sitemapEntries: SitemapEntry[] = [];

    // Add page entries
    pages.forEach(page => {
      // All pages including home are accessible via their slug
      const url = `${baseUrl}/${page.slug}`;
      
      // Set priority based on page importance
      let priority = 0.5; // default
      if (page.slug === 'home') {
        priority = 1.0; // highest priority for home page
      } else if (page.showInHeader) {
        priority = 0.8; // high priority for navigation pages
      } else if (page.showInFooter) {
        priority = 0.6; // medium priority for footer pages
      }

      // Set change frequency based on page type
      let changeFreq: SitemapEntry['changeFrequency'] = 'weekly';
      if (page.slug === 'home') {
        changeFreq = 'daily'; // home page changes more frequently
      } else if (page.showInHeader) {
        changeFreq = 'weekly'; // main pages change weekly
      } else {
        changeFreq = 'monthly'; // other pages change monthly
      }

      sitemapEntries.push({
        url,
        lastModified: new Date(page.updatedAt).toISOString(),
        changeFrequency: changeFreq,
        priority
      });
    });

    // Add FAQ URLs (FAQ routes exist and work)
    // Add main FAQ page if there are any categories
    if (faqCategories.length > 0) {
      const latestFaqUpdate = Math.max(
        ...faqCategories.map(cat => new Date(cat.updatedAt).getTime()),
        ...faqCategories.flatMap(cat => cat.faqs.map(faq => new Date(faq.updatedAt).getTime()))
      );

      sitemapEntries.push({
        url: `${baseUrl}/faq`,
        lastModified: new Date(latestFaqUpdate).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8
      });

      // Add FAQ category pages and individual FAQ pages
      faqCategories.forEach(category => {
        const categorySlug = createSlug(category.name);
        
        // Add category page
        sitemapEntries.push({
          url: `${baseUrl}/faq/${categorySlug}`,
          lastModified: new Date(category.updatedAt).toISOString(),
          changeFrequency: 'weekly',
          priority: 0.7
        });

        // Add individual FAQ pages
        category.faqs.forEach(faq => {
          const faqSlug = createSlug(faq.question);
          sitemapEntries.push({
            url: `${baseUrl}/faq/${categorySlug}/${faqSlug}`,
            lastModified: new Date(faq.updatedAt).toISOString(),
            changeFrequency: 'monthly',
            priority: 0.5
          });
        });
      });
    }

    // Add images from media library
    const images = await prisma.mediaLibrary.findMany({
      select: {
        id: true,
        filename: true,
        publicUrl: true,
        updatedAt: true,
        isActive: true,
        isPublic: true,
        fileType: true,
      },
      where: {
        isActive: true,
        isPublic: true,
        fileType: 'image'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Add image URLs to sitemap
    images.forEach(image => {
      sitemapEntries.push({
        url: image.publicUrl,
        lastModified: new Date(image.updatedAt).toISOString(),
        changeFrequency: 'monthly',
        priority: 0.3
      });
    });

    // Generate XML sitemap content
    const xmlContent = generateSitemapXML(sitemapEntries);

    // Note: We don't write sitemap to public directory anymore
    // This is because we use dynamic generation via /sitemap.xml route
    // Writing a static file would conflict with the dynamic route

    return NextResponse.json({
      success: true,
      message: `Sitemap generated successfully with ${sitemapEntries.length} URLs`,
      sitemap: xmlContent,
      entries: sitemapEntries,
      totalPages: pages.length,
      totalFaqCategories: faqCategories.length,
      totalFaqs: faqCategories.reduce((sum, cat) => sum + cat.faqs.length, 0),
      totalImages: images.length,
      totalEntries: sitemapEntries.length,
      breakdown: {
        pages: pages.length,
        faqCategories: faqCategories.length,
        faqQuestions: faqCategories.reduce((sum, cat) => sum + cat.faqs.length, 0),
        images: images.length
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate sitemap',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateSitemapXML(entries: SitemapEntry[]): string {
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const totalEntries = entries.length;
  
  // Generate properly formatted URL entries with beautiful indentation
  const urls = entries.map((entry, index) => {
    const priorityFormatted = entry.priority.toFixed(1);
    const urlParts = entry.url.split('/');
    let entryTitle = 'Entry';
    
    // Determine entry type and title
    if (entry.url.includes('/faq/') && urlParts.length > 5) {
      entryTitle = `FAQ: ${decodeURIComponent(urlParts[urlParts.length - 1]).replace(/-/g, ' ')}`;
    } else if (entry.url.includes('/faq/') && urlParts.length === 5) {
      entryTitle = `FAQ Category: ${decodeURIComponent(urlParts[urlParts.length - 1]).replace(/-/g, ' ')}`;
    } else if (entry.url.endsWith('/faq')) {
      entryTitle = 'FAQ Main Page';
    } else if (entry.url.endsWith('/home')) {
      entryTitle = 'Homepage';
    } else {
      entryTitle = `Page: ${urlParts[urlParts.length - 1].replace(/-/g, ' ')}`;
    }
    
    return `  <!-- ${entryTitle} -->
  <url>
    <loc>${escapeXML(entry.url)}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${priorityFormatted}</priority>
  </url>`;
  }).join('\n\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<!--
  XML Sitemap generated by Saski AI Website CMS
  Generated on: ${new Date().toISOString()}
  Total URLs: ${totalEntries}
  
  This sitemap contains:
  - Website pages
  - FAQ categories and questions
  - Public images from media library
  
  For more information about XML sitemaps, visit:
  https://www.sitemaps.org/protocol.html
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                           http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urls}

</urlset>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
} 
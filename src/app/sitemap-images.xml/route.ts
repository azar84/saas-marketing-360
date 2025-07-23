import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get site settings for base URL
    const siteSettings = await prisma.siteSettings.findFirst();
    const baseUrl = siteSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Get all active public images from MediaLibrary
    const images = await prisma.mediaLibrary.findMany({
      where: {
        isActive: true,
        isPublic: true,
        fileType: 'image'
      },
      select: {
        id: true,
        filename: true,
        title: true,
        description: true,
        alt: true,
        publicUrl: true,
        width: true,
        height: true,
        createdAt: true,
        updatedAt: true,
        usages: {
          select: {
            entityType: true,
            entityId: true,
            fieldName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get logos and other site images
    const logoImages = [];
    if (siteSettings?.logoUrl) {
      logoImages.push({
        loc: siteSettings.logoUrl,
        title: `${siteSettings.footerCompanyName || 'Company'} Logo`,
        caption: siteSettings.footerCompanyDescription || '',
        geo_location: siteSettings.companyAddress || undefined,
        license: undefined,
        image_url_page: baseUrl
      });
    }
    
    if (siteSettings?.logoLightUrl && siteSettings.logoLightUrl !== siteSettings.logoUrl) {
      logoImages.push({
        loc: siteSettings.logoLightUrl,
        title: `${siteSettings.footerCompanyName || 'Company'} Light Logo`,
        caption: siteSettings.footerCompanyDescription || '',
        geo_location: siteSettings.companyAddress || undefined,
        license: undefined,
        image_url_page: baseUrl
      });
    }

    if (siteSettings?.logoDarkUrl && siteSettings.logoDarkUrl !== siteSettings.logoUrl) {
      logoImages.push({
        loc: siteSettings.logoDarkUrl,
        title: `${siteSettings.footerCompanyName || 'Company'} Dark Logo`,
        caption: siteSettings.footerCompanyDescription || '',
        geo_location: siteSettings.companyAddress || undefined,
        license: undefined,
        image_url_page: baseUrl
      });
    }

    // Transform media library images
    const mediaImages = images.map(image => {
      // Determine which pages use this image
      const pageUsage = image.usages
        .filter(usage => usage.entityType === 'page' || usage.entityType === 'section')
        .map(usage => `${baseUrl}/${usage.entityType}/${usage.entityId}`)
        .join(', ');

      return {
        loc: image.publicUrl,
        title: image.title || image.filename,
        caption: image.description || image.alt || '',
        geo_location: siteSettings?.companyAddress || undefined,
        license: undefined, // Add license info if available
        image_url_page: pageUsage || baseUrl // Pages where image appears
      };
    });

    // Combine all images
    const allImages = [...logoImages, ...mediaImages];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allImages.map(image => `  <url>
    <loc>${baseUrl}</loc>
    <image:image>
      <image:loc>${image.loc}</image:loc>
      <image:title><![CDATA[${image.title}]]></image:title>${image.caption ? `
      <image:caption><![CDATA[${image.caption}]]></image:caption>` : ''}${image.geo_location ? `
      <image:geo_location><![CDATA[${image.geo_location}]]></image:geo_location>` : ''}${image.license ? `
      <image:license>${image.license}</image:license>` : ''}
    </image:image>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });

  } catch (error) {
    console.error('Error generating image sitemap:', error);
    
    // Return empty sitemap on error
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`;

    return new NextResponse(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });
  }
} 
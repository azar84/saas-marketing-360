import { prisma } from './db';

export interface ImageMetadata {
  url: string;
  width?: number;
  height?: number;
  alt: string;
  title?: string;
  description?: string;
  format?: string;
  fileSize?: number;
}

export interface ImageSeoOptions {
  includeInSitemap?: boolean;
  generateAltFromTitle?: boolean;
  optimizeForSocial?: boolean;
  addStructuredData?: boolean;
}

// Get featured images for a specific page or section
export async function getPageImages(pageSlug: string): Promise<ImageMetadata[]> {
  try {
    // Get images used in page sections
    const pageData = await prisma.page.findFirst({
      where: { slug: pageSlug },
      include: {
        pageSections: {
          include: {
            heroSection: true,
            mediaSection: true
          }
        }
      }
    });

    const images: ImageMetadata[] = [];

    if (pageData?.pageSections) {
      for (const section of pageData.pageSections) {
        // Hero section background images
        if (section.heroSection?.mediaUrl) {
          images.push({
            url: section.heroSection.mediaUrl,
            alt: section.heroSection.mediaAlt || `${pageSlug} hero image`,
            title: `${pageSlug} Hero Image`,
            description: `Hero section image for ${pageSlug} page`
          });
        }

        // Media section images
        if (section.mediaSection?.mediaUrl) {
          images.push({
            url: section.mediaSection.mediaUrl,
            alt: section.mediaSection.mediaAlt || `${pageSlug} section image`,
            title: `${pageSlug} Media Section`,
            description: section.mediaSection.headline || `Media section image for ${pageSlug} page`
          });
        }
      }
    }

    return images;
  } catch (error) {
    console.error(`Error fetching images for page ${pageSlug}:`, error);
    return [];
  }
}

// Get all public images from media library
export async function getAllPublicImages(): Promise<ImageMetadata[]> {
  try {
    const images = await prisma.mediaLibrary.findMany({
      where: {
        isActive: true,
        isPublic: true,
        fileType: 'image'
      },
      select: {
        publicUrl: true,
        width: true,
        height: true,
        alt: true,
        title: true,
        description: true,
        mimeType: true,
        fileSize: true
      }
    });

    return images.map(img => ({
      url: img.publicUrl,
      width: img.width || undefined,
      height: img.height || undefined,
      alt: img.alt || img.title || 'Image',
      title: img.title || undefined,
      description: img.description || undefined,
      format: img.mimeType,
      fileSize: img.fileSize
    }));
  } catch (error) {
    console.error('Error fetching all public images:', error);
    return [];
  }
}

// Generate optimal Open Graph image for a page
export async function getOptimalOgImage(pageSlug: string, fallbackUrl?: string): Promise<ImageMetadata | null> {
  try {
    const pageImages = await getPageImages(pageSlug);
    
    // Find the best image for social sharing
    const socialOptimalImage = pageImages.find(img => 
      img.width && img.height && 
      img.width >= 1200 && img.height >= 630 && // Facebook recommended size
      img.width / img.height >= 1.5 && img.width / img.height <= 2.0 // Good aspect ratio
    );

    if (socialOptimalImage) {
      return socialOptimalImage;
    }

    // Find any large image
    const largeImage = pageImages.find(img => 
      img.width && img.height && 
      img.width >= 800 && img.height >= 400
    );

    if (largeImage) {
      return largeImage;
    }

    // Use first available image
    if (pageImages.length > 0) {
      return pageImages[0];
    }

    // Fallback to site logo or default
    if (fallbackUrl) {
      return {
        url: fallbackUrl,
        alt: 'Website logo',
        title: 'Website Logo'
      };
    }

    return null;
  } catch (error) {
    console.error(`Error getting optimal OG image for ${pageSlug}:`, error);
    return null;
  }
}

// Generate structured data for images (ImageObject schema)
export function generateImageStructuredData(images: ImageMetadata[]): any[] {
  return images.map(img => ({
    "@type": "ImageObject",
    "url": img.url,
    "name": img.title || img.alt,
    "alternateName": img.alt,
    "description": img.description,
    ...(img.width && { "width": img.width }),
    ...(img.height && { "height": img.height }),
    ...(img.format && { "encodingFormat": img.format }),
    ...(img.fileSize && { "contentSize": `${img.fileSize} bytes` })
  }));
}

// Generate Twitter Card meta tags for images
export function generateTwitterImageMeta(image: ImageMetadata): Record<string, string> {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:image': image.url,
    'twitter:image:alt': image.alt,
    ...(image.title && { 'twitter:title': image.title }),
    ...(image.description && { 'twitter:description': image.description })
  };
}

// Generate Open Graph meta tags for images
export function generateOpenGraphImageMeta(image: ImageMetadata): Record<string, string> {
  const meta: Record<string, string> = {
    'og:image': image.url,
    'og:image:alt': image.alt
  };

  if (image.width) meta['og:image:width'] = image.width.toString();
  if (image.height) meta['og:image:height'] = image.height.toString();
  if (image.format) meta['og:image:type'] = image.format;

  return meta;
}

// Get image sitemap data
export async function getImageSitemapData(): Promise<Array<{
  loc: string;
  title: string;
  caption?: string;
  geo_location?: string;
  license?: string;
}>> {
  try {
    const [images, siteSettings] = await Promise.all([
      getAllPublicImages(),
      prisma.siteSettings.findFirst()
    ]);

    const sitemapData = images.map(img => ({
      loc: img.url,
      title: img.title || img.alt,
      caption: img.description || img.alt,
      geo_location: siteSettings?.companyAddress || undefined,
      license: undefined // Add license info if available in your media library
    }));

    // Add logo images
    if (siteSettings?.logoUrl) {
      sitemapData.unshift({
        loc: siteSettings.logoUrl,
        title: `${siteSettings.footerCompanyName || 'Company'} Logo`,
        caption: siteSettings.footerCompanyDescription || '',
        geo_location: siteSettings.companyAddress || undefined,
        license: undefined
      });
    }

    return sitemapData;
  } catch (error) {
    console.error('Error generating image sitemap data:', error);
    return [];
  }
}

// Analyze image SEO for a specific URL
export async function analyzeImageSeo(pageSlug: string): Promise<{
  hasImages: boolean;
  imageCount: number;
  hasOptimalOgImage: boolean;
  missingAltTags: number;
  recommendations: string[];
}> {
  try {
    const images = await getPageImages(pageSlug);
    const ogImage = await getOptimalOgImage(pageSlug);
    
    const missingAltTags = images.filter(img => !img.alt || img.alt.trim() === '').length;
    const recommendations: string[] = [];

    if (images.length === 0) {
      recommendations.push('Add relevant images to improve visual appeal and SEO');
    }

    if (!ogImage) {
      recommendations.push('Add a high-quality featured image (1200x630px) for better social sharing');
    }

    if (missingAltTags > 0) {
      recommendations.push(`Add alt text to ${missingAltTags} image${missingAltTags > 1 ? 's' : ''} for accessibility and SEO`);
    }

    if (images.length > 0 && images.every(img => !img.title)) {
      recommendations.push('Add descriptive titles to images for better SEO');
    }

    return {
      hasImages: images.length > 0,
      imageCount: images.length,
      hasOptimalOgImage: !!ogImage,
      missingAltTags,
      recommendations
    };
  } catch (error) {
    console.error(`Error analyzing image SEO for ${pageSlug}:`, error);
    return {
      hasImages: false,
      imageCount: 0,
      hasOptimalOgImage: false,
      missingAltTags: 0,
      recommendations: ['Error analyzing images']
    };
  }
}

// Enhanced image metadata for next/image optimization
export function getOptimizedImageProps(image: ImageMetadata) {
  return {
    src: image.url,
    alt: image.alt,
    ...(image.width && image.height && {
      width: image.width,
      height: image.height
    }),
    ...(image.title && { title: image.title }),
    // Add blur placeholder for better UX
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  };
} 
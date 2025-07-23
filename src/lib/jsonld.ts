interface Organization {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string | Array<{
    "@type": "ImageObject";
    url: string;
    name?: string;
    description?: string;
  }>;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    "@type": "ContactPoint";
    telephone?: string;
    email?: string;
    contactType: string;
  };
  address?: {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

interface WebSite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description?: string;
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  potentialAction?: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

interface BreadcrumbList {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

interface FAQPage {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

interface WebPage {
  "@context": "https://schema.org";
  "@type": "WebPage";
  name: string;
  description?: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  isPartOf: {
    "@type": "WebSite";
    name: string;
    url: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
  };
}

interface Article {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description?: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
}

export interface SiteSettings {
  baseUrl: string;
  siteName: string;
  siteDescription?: string;
  logoUrl?: string;
  logoLightUrl?: string;
  logoDarkUrl?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialInstagram?: string;
  socialYoutube?: string;
}

// Generate Organization JSON-LD
export function generateOrganizationJsonLd(settings: SiteSettings): Organization {
  const sameAs: string[] = [];
  if (settings.socialFacebook) sameAs.push(settings.socialFacebook);
  if (settings.socialTwitter) sameAs.push(settings.socialTwitter);
  if (settings.socialLinkedin) sameAs.push(settings.socialLinkedin);
  if (settings.socialInstagram) sameAs.push(settings.socialInstagram);
  if (settings.socialYoutube) sameAs.push(settings.socialYoutube);

  // Build logo images array for better SEO
  const logoImages: Array<{
    "@type": "ImageObject";
    url: string;
    name?: string;
    description?: string;
  }> = [];

  if (settings.logoUrl) {
    logoImages.push({
      "@type": "ImageObject",
      url: settings.logoUrl.startsWith('http') 
        ? settings.logoUrl 
        : `${settings.baseUrl}${settings.logoUrl}`,
      name: `${settings.siteName} Logo`,
      description: `Official logo of ${settings.siteName}`
    });
  }

  if (settings.logoLightUrl && settings.logoLightUrl !== settings.logoUrl) {
    logoImages.push({
      "@type": "ImageObject",
      url: settings.logoLightUrl.startsWith('http') 
        ? settings.logoLightUrl 
        : `${settings.baseUrl}${settings.logoLightUrl}`,
      name: `${settings.siteName} Light Logo`,
      description: `Light version of ${settings.siteName} logo for dark backgrounds`
    });
  }

  if (settings.logoDarkUrl && settings.logoDarkUrl !== settings.logoUrl && settings.logoDarkUrl !== settings.logoLightUrl) {
    logoImages.push({
      "@type": "ImageObject",
      url: settings.logoDarkUrl.startsWith('http') 
        ? settings.logoDarkUrl 
        : `${settings.baseUrl}${settings.logoDarkUrl}`,
      name: `${settings.siteName} Dark Logo`,
      description: `Dark version of ${settings.siteName} logo for light backgrounds`
    });
  }

  const organization: Organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: settings.baseUrl,
    description: settings.siteDescription,
    ...(logoImages.length > 0 && { 
      logo: logoImages.length === 1 ? logoImages[0].url : logoImages
    }),
    ...(sameAs.length > 0 && { sameAs })
  };

  // Add contact point if we have contact info
  if (settings.companyPhone || settings.companyEmail) {
    organization.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer service",
      ...(settings.companyPhone && { telephone: settings.companyPhone }),
      ...(settings.companyEmail && { email: settings.companyEmail })
    };
  }

  // Add address if we have it
  if (settings.companyAddress) {
    organization.address = {
      "@type": "PostalAddress",
      streetAddress: settings.companyAddress
    };
  }

  return organization;
}

// Generate WebSite JSON-LD
export function generateWebSiteJsonLd(settings: SiteSettings): WebSite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: settings.baseUrl,
    description: settings.siteDescription,
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
      url: settings.baseUrl
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${settings.baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// Generate Breadcrumb JSON-LD
export function generateBreadcrumbJsonLd(
  breadcrumbs: Array<{ name: string; url: string }>,
  baseUrl: string
): BreadcrumbList {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
    }))
  };
}

// Generate FAQ JSON-LD
export function generateFAQJsonLd(
  faqs: Array<{ question: string; answer: string }>
): FAQPage {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

// Generate WebPage JSON-LD
export function generateWebPageJsonLd(
  page: {
    title: string;
    description?: string;
    url: string;
    datePublished?: string;
    dateModified?: string;
  },
  settings: SiteSettings
): WebPage {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: page.url,
    ...(page.datePublished && { datePublished: page.datePublished }),
    ...(page.dateModified && { dateModified: page.dateModified }),
    isPartOf: {
      "@type": "WebSite",
      name: settings.siteName,
      url: settings.baseUrl
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
      url: settings.baseUrl
    }
  };
}

// Generate Article JSON-LD (for blog posts, news articles, etc.)
export function generateArticleJsonLd(
  article: {
    headline: string;
    description?: string;
    url: string;
    datePublished?: string;
    dateModified?: string;
  },
  settings: SiteSettings
): Article {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    url: article.url,
    ...(article.datePublished && { datePublished: article.datePublished }),
    ...(article.dateModified && { dateModified: article.dateModified }),
    author: {
      "@type": "Organization",
      name: settings.siteName,
      url: settings.baseUrl
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
      url: settings.baseUrl
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url
    }
  };
}

// Helper function to combine multiple JSON-LD objects
export function combineJsonLd(...jsonLdObjects: any[]): string {
  const validObjects = jsonLdObjects.filter(obj => obj && typeof obj === 'object');
  
  if (validObjects.length === 0) {
    return '';
  }
  
  if (validObjects.length === 1) {
    return JSON.stringify(validObjects[0], null, 0);
  }
  
  // Multiple objects - wrap in array
  return JSON.stringify(validObjects, null, 0);
}

// Generate JSON-LD script tag
export function generateJsonLdScript(jsonLd: string): string {
  if (!jsonLd) return '';
  
  return `<script type="application/ld+json">${jsonLd}</script>`;
}

// Validate JSON-LD structure
export function validateJsonLd(jsonLd: any): boolean {
  try {
    if (!jsonLd || typeof jsonLd !== 'object') return false;
    
    // Check for required @context and @type
    if (!jsonLd['@context'] || !jsonLd['@type']) return false;
    
    // Basic validation for schema.org context
    if (typeof jsonLd['@context'] === 'string' && !jsonLd['@context'].includes('schema.org')) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Get appropriate JSON-LD for different page types
export function getPageJsonLd(
  pageType: 'home' | 'page' | 'faq-category' | 'faq-question' | 'article',
  pageData: any,
  settings: SiteSettings,
  additionalData?: any
): string {
  const jsonLdObjects: any[] = [];

  // Always include Organization
  jsonLdObjects.push(generateOrganizationJsonLd(settings));

  // Add WebSite for home page
  if (pageType === 'home') {
    jsonLdObjects.push(generateWebSiteJsonLd(settings));
  }

  // Add page-specific JSON-LD
  switch (pageType) {
    case 'home':
    case 'page':
      jsonLdObjects.push(generateWebPageJsonLd({
        title: pageData.title,
        description: pageData.description,
        url: pageData.url,
        datePublished: pageData.createdAt,
        dateModified: pageData.updatedAt
      }, settings));
      break;

    case 'faq-category':
      if (additionalData?.faqs && additionalData.faqs.length > 0) {
        jsonLdObjects.push(generateFAQJsonLd(additionalData.faqs));
      }
      jsonLdObjects.push(generateWebPageJsonLd({
        title: pageData.title,
        description: pageData.description,
        url: pageData.url,
        dateModified: pageData.updatedAt
      }, settings));
      break;

    case 'faq-question':
      if (additionalData?.question && additionalData?.answer) {
        jsonLdObjects.push(generateFAQJsonLd([{
          question: additionalData.question,
          answer: additionalData.answer
        }]));
      }
      jsonLdObjects.push(generateWebPageJsonLd({
        title: pageData.title,
        description: pageData.description,
        url: pageData.url,
        dateModified: pageData.updatedAt
      }, settings));
      break;

    case 'article':
      jsonLdObjects.push(generateArticleJsonLd({
        headline: pageData.title,
        description: pageData.description,
        url: pageData.url,
        datePublished: pageData.createdAt,
        dateModified: pageData.updatedAt
      }, settings));
      break;
  }

  // Add breadcrumbs if provided
  if (additionalData?.breadcrumbs && Array.isArray(additionalData.breadcrumbs)) {
    jsonLdObjects.push(generateBreadcrumbJsonLd(additionalData.breadcrumbs, settings.baseUrl));
  }

  return combineJsonLd(...jsonLdObjects);
} 
import { WebsiteScrapeData } from '../types';
import * as cheerio from 'cheerio';

export class WebsiteScraper {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];

  /**
   * Enrich company data by scraping their website
   */
  async enrich(domain: string): Promise<WebsiteScrapeData | null> {
    try {
      console.log(`🌐 Starting website scraping for ${domain}`);
      
      // Normalize domain
      const normalizedDomain = this.normalizeDomain(domain);
      const urls = this.generateUrlsToScrape(normalizedDomain);
      
      const scrapeData: WebsiteScrapeData = {
        lastScraped: new Date(),
        status: 'success',
        technologies: []
      };

      // Scrape main pages in parallel
      const scrapePromises = urls.map(url => this.scrapePage(url));
      const results = await Promise.allSettled(scrapePromises);
      
      // Process successful scrapes
      const successfulScrapes = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)
        .filter(Boolean);

      if (successfulScrapes.length === 0) {
        throw new Error('No pages could be scraped successfully');
      }

      // Merge data from all successful scrapes
      const mergedData = this.mergeScrapeData(successfulScrapes);
      
      // Extract structured information
      const extractedData = this.extractStructuredData(mergedData);
      
      // Update scrape data with extracted information
      Object.assign(scrapeData, extractedData);
      
      console.log(`✅ Website scraping completed for ${domain}`);
      return scrapeData;
      
    } catch (error) {
      console.error(`❌ Website scraping failed for ${domain}:`, error);
      
      return {
        lastScraped: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Generate URLs to scrape for a domain
   */
  private generateUrlsToScrape(domain: string): string[] {
    const baseUrl = `https://${domain}`;
    return [
      `${baseUrl}/`,
      `${baseUrl}/about`,
      `${baseUrl}/about-us`,
      `${baseUrl}/company`,
      `${baseUrl}/team`,
      `${baseUrl}/contact`,
      `${baseUrl}/contact-us`
    ];
  }

  /**
   * Scrape a single page
   */
  private async scrapePage(url: string): Promise<any> {
    try {
      console.log(`📄 Scraping ${url}`);
      
      // Use fetch for basic scraping (Playwright can be added later for JS-heavy sites)
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      return {
        url,
        html,
        $,
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || ''
      };
      
    } catch (error) {
      console.error(`❌ Failed to scrape ${url}:`, error);
      return null;
    }
  }

  /**
   * Merge data from multiple scraped pages
   */
  private mergeScrapeData(scrapes: any[]): any {
    const merged = {
      title: '',
      description: '',
      keywords: '',
      content: '',
      socialLinks: {} as Record<string, string>,
      contactInfo: {
        emails: [] as string[],
        phones: [] as string[],
        addresses: [] as string[]
      },
      technologies: [] as string[]
    };

    // Merge content from all pages
    scrapes.forEach(scrape => {
      if (scrape.title && !merged.title) {
        merged.title = scrape.title;
      }
      
      if (scrape.description && !merged.description) {
        merged.description = scrape.description;
      }
      
      if (scrape.keywords) {
        merged.keywords += ' ' + scrape.keywords;
      }
      
      if (scrape.html) {
        merged.content += ' ' + scrape.html;
      }
    });

    // Extract social links and contact info from all pages
    scrapes.forEach(scrape => {
      if (scrape.$) {
        this.extractSocialLinks(scrape.$, merged.socialLinks);
        this.extractContactInfo(scrape.$, merged.contactInfo);
        this.extractTechnologies(scrape.$, merged.technologies);
      }
    });

    // Clean up merged data
    merged.keywords = merged.keywords.trim();
    merged.content = merged.content.trim();
    merged.contactInfo.emails = [...new Set(merged.contactInfo.emails)];
    merged.contactInfo.phones = [...new Set(merged.contactInfo.phones)];
    merged.contactInfo.addresses = [...new Set(merged.contactInfo.addresses)];
    merged.technologies = [...new Set(merged.technologies)];

    return merged;
  }

  /**
   * Extract social media links from HTML
   */
  private extractSocialLinks($: cheerio.CheerioAPI, socialLinks: Record<string, string>): void {
    // LinkedIn
    $('a[href*="linkedin.com"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !socialLinks.linkedin) {
        socialLinks.linkedin = href;
      }
    });

    // Twitter/X
    $('a[href*="twitter.com"], a[href*="x.com"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !socialLinks.twitter) {
        socialLinks.twitter = href;
      }
    });

    // Facebook
    $('a[href*="facebook.com"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !socialLinks.facebook) {
        socialLinks.facebook = href;
      }
    });

    // Instagram
    $('a[href*="instagram.com"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !socialLinks.instagram) {
        socialLinks.instagram = href;
      }
    });

    // Also check meta tags for social links
    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property');
      const content = $(el).attr('content');
      
      if (property === 'og:url' && content && content.includes('linkedin.com') && !socialLinks.linkedin) {
        socialLinks.linkedin = content;
      }
    });
  }

  /**
   * Extract contact information from HTML
   */
  private extractContactInfo($: cheerio.CheerioAPI, contactInfo: any): void {
    // Extract emails
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const email = href.replace('mailto:', '').split('?')[0];
        if (this.isValidEmail(email)) {
          contactInfo.emails.push(email);
        }
      }
    });

    // Extract phone numbers
    $('a[href^="tel:"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const phone = href.replace('tel:', '');
        if (this.isValidPhone(phone)) {
          contactInfo.phones.push(phone);
        }
      }
    });

    // Extract phone numbers from text content
    $('body').text().match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g)?.forEach(phone => {
      if (this.isValidPhone(phone) && !contactInfo.phones.includes(phone)) {
        contactInfo.phones.push(phone);
      }
    });

    // Extract addresses (basic pattern matching)
    $('body').text().match(/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Circle|Cir|Square|Sq)[,\s]+[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/g)?.forEach(address => {
      if (!contactInfo.addresses.includes(address)) {
        contactInfo.addresses.push(address);
      }
    });
  }

  /**
   * Extract technology hints from HTML
   */
  private extractTechnologies($: cheerio.CheerioAPI, technologies: string[]): void {
    // Check for common technology indicators
    const techIndicators = [
      'React', 'Vue', 'Angular', 'jQuery', 'Bootstrap', 'Tailwind',
      'WordPress', 'Shopify', 'WooCommerce', 'Magento', 'Drupal',
      'AWS', 'Azure', 'Google Cloud', 'Cloudflare', 'Vercel',
      'Stripe', 'PayPal', 'Square', 'Braintree',
      'Google Analytics', 'Google Tag Manager', 'Facebook Pixel',
      'HubSpot', 'Salesforce', 'Mailchimp', 'SendGrid'
    ];

    const bodyText = $('body').text().toLowerCase();
    
    techIndicators.forEach(tech => {
      if (bodyText.includes(tech.toLowerCase()) && !technologies.includes(tech)) {
        technologies.push(tech);
      }
    });

    // Check for technology-specific classes or data attributes
    $('[class*="react"], [class*="vue"], [class*="angular"]').each((_, el) => {
      const className = $(el).attr('class') || '';
      if (className.includes('react') && !technologies.includes('React')) {
        technologies.push('React');
      }
      if (className.includes('vue') && !technologies.includes('Vue')) {
        technologies.push('Vue');
      }
      if (className.includes('angular') && !technologies.includes('Angular')) {
        technologies.push('Angular');
      }
    });

    // Check for WordPress indicators
    if ($('meta[name="generator"][content*="WordPress"]').length > 0) {
      technologies.push('WordPress');
    }

    // Check for Shopify indicators
    if ($('meta[name="shopify-checkout-api-token"]').length > 0 || 
        $('script[src*="shopify.com"]').length > 0) {
      technologies.push('Shopify');
    }
  }

  /**
   * Extract structured data from merged scrape data
   */
  private extractStructuredData(mergedData: any): Partial<WebsiteScrapeData> {
    return {
      title: mergedData.title,
      description: mergedData.description,
      keywords: mergedData.keywords ? mergedData.keywords.split(/\s+/).filter(Boolean) : [],
      content: mergedData.content,
      socialLinks: mergedData.socialLinks,
      contactInfo: mergedData.contactInfo,
      technologies: mergedData.technologies
    };
  }

  /**
   * Normalize domain (remove protocol, www, etc.)
   */
  private normalizeDomain(domain: string): string {
    return domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .toLowerCase();
  }

  /**
   * Get random user agent
   */
  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)\.]/g, ''));
  }
}

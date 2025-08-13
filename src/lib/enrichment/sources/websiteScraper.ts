import { WebsiteScrapeData } from '../types';
import * as cheerio from 'cheerio';

interface WebsiteScraperConfig {
  maxPages: number;
  timeout: number;
  userAgent: string;
  followRedirects: boolean;
  enableHeadless: boolean;
}

export class WebsiteScraper {
  private config: WebsiteScraperConfig;
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];

  constructor(config: Partial<WebsiteScraperConfig> = {}) {
    this.config = {
      maxPages: 10,
      timeout: 10000,
      userAgent: 'Mozilla/5.0 (compatible; EnrichmentBot/1.0)',
      followRedirects: true,
      enableHeadless: true,
      ...config
    };
  }

  /**
   * Normalize domain/URL to ensure consistent format
   * Handles: example.com, http://example.com, https://example.com, www.example.com
   */
  private normalizeDomain(input: string): string {
    try {
      // Remove leading/trailing whitespace
      let domain = input.trim();
      
      // If no protocol specified, default to https://
      if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        domain = `https://${domain}`;
      }
      
      // Create URL object to parse and normalize
      const url = new URL(domain);
      
      // Remove www. prefix if present
      let hostname = url.hostname;
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      
      // Return clean domain without protocol
      return hostname;
    } catch (error) {
      console.warn(`⚠️ URL normalization failed for "${input}", using as-is:`, error);
      // Fallback: remove common prefixes and return cleaned input
      let cleaned = input.trim();
      if (cleaned.startsWith('http://')) cleaned = cleaned.substring(7);
      if (cleaned.startsWith('https://')) cleaned = cleaned.substring(8);
      if (cleaned.startsWith('www.')) cleaned = cleaned.substring(4);
      return cleaned;
    }
  }

  /**
   * Discover available pages from the base URL by following links
   */
  private async discoverPages(baseUrl: string): Promise<string[]> {
    try {
      console.log(`🔍 Discovering pages from: ${baseUrl}`);
      
      const normalizeUrl = (u: string) => {
        try {
          const url = new URL(u);
          url.hash = '';
          // Normalize host to lowercase and strip leading www.
          let host = url.hostname.toLowerCase();
          if (host.startsWith('www.')) host = host.substring(4);
          let pathname = url.pathname.replace(/\/+$|$/g, (m) => (m ? '' : ''));
          if (pathname.length === 0) pathname = '/';
          const normalized = `${url.protocol}//${host}${pathname}`;
          return normalized;
        } catch {
          return u.replace(/\/+$|$/g, '');
        }
      };

      const isHtmlLikely = (href: string) => !href.match(/\.(png|jpe?g|gif|svg|webp|css|js|json|pdf|ico|woff2?|ttf|eot)(\?|$)/i);

      const normalizedBase = normalizeUrl(baseUrl);
      const discoveredPages = new Set<string>();
      const pagesToVisit: string[] = [normalizedBase];

      // Seed common routes and variants
      const seedPaths = [
        '/', '/home', '/index',
        '/about', '/about-us', '/company', '/our-story', '/who-we-are',
        '/team', '/careers', '/jobs',
        '/contact', '/contact-us', '/get-in-touch',
        '/services', '/solutions', '/what-we-do',
        '/products', '/pricing', '/plans',
        '/case-studies', '/portfolio', '/work',
        '/blog', '/news', '/articles',
        '/privacy', '/terms', '/legal', '/locations'
      ];
      seedPaths.forEach(p => {
        try {
          const u = normalizeUrl(new URL(p, normalizedBase).href);
          if (!pagesToVisit.includes(u)) pagesToVisit.push(u);
        } catch {}
      });

      // Try to discover via sitemaps and robots
      const sitemapCandidates = ['/sitemap.xml', '/site-map.xml', '/sitemap_index.xml', '/sitemap.txt'];
      const robotsTxt = '/robots.txt';
      const collectFromSitemapText = (txt: string) => {
        const urls: string[] = [];
        // XML <loc> tags
        const locRegex = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
        let match;
        while ((match = locRegex.exec(txt)) !== null) {
          urls.push(match[1]);
        }
        // Plain text lines
        if (urls.length === 0) {
          txt.split(/\r?\n/).forEach(line => {
            const l = line.trim();
            if (l.startsWith('http://') || l.startsWith('https://')) urls.push(l);
          });
        }
        return urls;
      };

      // robots.txt sitemap discovery (enqueue candidates only; verify later)
      try {
        const robotsUrl = new URL(robotsTxt, normalizedBase).href;
        const res = await fetch(robotsUrl, { signal: AbortSignal.timeout(this.config.timeout) });
        if (res.ok) {
          const txt = await res.text();
          const lines = txt.split(/\r?\n/);
          const sitemapLines = lines.filter(l => /^sitemap:/i.test(l));
          for (const line of sitemapLines) {
            const smUrl = line.split(/\s+/)[1];
            if (!smUrl) continue;
            try {
              const smRes = await fetch(smUrl, { signal: AbortSignal.timeout(this.config.timeout) });
              if (smRes.ok) {
                const smTxt = await smRes.text();
                const urls = collectFromSitemapText(smTxt);
                urls.forEach(u => {
                  try {
                    if (!isHtmlLikely(u)) return;
                    const normalized = normalizeUrl(new URL(u).href);
                    const baseHost = new URL(normalizedBase).hostname;
                    const linkHost = new URL(normalized).hostname;
                    if (baseHost === linkHost && !pagesToVisit.includes(normalized)) {
                      pagesToVisit.push(normalized);
                    }
                  } catch {}
                });
              }
            } catch {}
          }
        }
      } catch {}

      // Direct sitemap candidates (enqueue only)
      for (const sm of sitemapCandidates) {
        try {
          const smUrl = new URL(sm, normalizedBase).href;
          const res = await fetch(smUrl, { signal: AbortSignal.timeout(this.config.timeout) });
          if (res.ok) {
            const txt = await res.text();
            const urls = collectFromSitemapText(txt);
            urls.forEach(u => {
              try {
                if (!isHtmlLikely(u)) return;
                const normalized = normalizeUrl(new URL(u).href);
                const baseHost = new URL(normalizedBase).hostname;
                const linkHost = new URL(normalized).hostname;
                if (baseHost === linkHost && !pagesToVisit.includes(normalized)) {
                  pagesToVisit.push(normalized);
                }
              } catch {}
            });
          }
        } catch {}
        if (discoveredPages.size >= this.config.maxPages) break;
      }
      const visitedPages = new Set<string>();
      
      while (pagesToVisit.length > 0 && discoveredPages.size < this.config.maxPages) {
        const currentUrl = pagesToVisit.shift()!;
        
        if (visitedPages.has(currentUrl)) continue;
        visitedPages.add(currentUrl);
        
        try {
          console.log(`🔍 Exploring: ${currentUrl}`);
          const { html, status, headers } = await this.fetchPage(currentUrl);
          const isHtmlContent = (headers['content-type'] || '').toLowerCase().includes('text/html');
          if (!(status >= 200 && status < 300) || !isHtmlContent) {
            // Skip non-HTML or error pages; do not count as discovered
            continue;
          }
          // Mark as verified discovered page
          if (!discoveredPages.has(currentUrl)) {
            discoveredPages.add(currentUrl);
          }
          const $ = cheerio.load(html);

          // Extract internal routes from SPA payloads (e.g., __NEXT_DATA__)
          try {
            const nextData = $('script#__NEXT_DATA__').first().text();
            if (nextData) {
              const obj = JSON.parse(nextData);
              const asStrings: string[] = [];
              const collectStrings = (v: any) => {
                if (typeof v === 'string') {
                  if (v.startsWith('/')) asStrings.push(v);
                } else if (Array.isArray(v)) {
                  v.forEach(collectStrings);
                } else if (v && typeof v === 'object') {
                  Object.values(v).forEach(collectStrings);
                }
              };
              collectStrings(obj);
              asStrings.forEach(p => {
                try {
                  const abs = new URL(p, currentUrl).href;
                  if (!isHtmlLikely(abs)) return;
                  const normalized = normalizeUrl(abs);
                  const baseHost = new URL(normalizedBase).hostname;
                  const linkHost = new URL(normalized).hostname;
                  if (baseHost === linkHost && !pagesToVisit.includes(normalized)) {
                    pagesToVisit.push(normalized);
                  }
                } catch {}
              });
            }
          } catch {}
          
          // Find all links on the current page
          const links = $('a[href]');
          links.each((_, element) => {
            const href = $(element).attr('href');
            if (!href) return;
            
            try {
              // Resolve relative URLs to absolute URLs
              if (!isHtmlLikely(href)) return;
              const absoluteUrl = new URL(href, currentUrl).href;
              const normalized = normalizeUrl(absoluteUrl);
              // Only include URLs from the same domain (ignore www differences)
              const baseHost = new URL(normalizedBase).hostname;
              const linkHost = new URL(normalized).hostname;
              const sameHost = baseHost === linkHost;
              if (sameHost && !discoveredPages.has(normalized)) {
                discoveredPages.add(normalized);
                pagesToVisit.push(normalized);
                console.log(`🔗 Found new page: ${absoluteUrl}`);
              }
            } catch (error) {
              // Skip invalid URLs
            }
          });
          
        } catch (error) {
          console.warn(`⚠️ Failed to explore ${currentUrl}:`, error);
        }
      }
      
       const pageList = Array.from(discoveredPages);
      console.log(`✅ Discovered ${pageList.length} pages:`, pageList);
      return pageList;
      
    } catch (error) {
      console.error(`❌ Page discovery failed:`, error);
      return [baseUrl]; // Fallback to just the base URL
    }
  }

  /**
   * Categorize discovered pages based on content and URL patterns
   */
  private categorizePages(pages: string[]): CategorizedPages {
    const categories: CategorizedPages = {
      home: [],
      about: [],
      contact: [],
      services: [],
      products: [],
      team: [],
      blog: [],
      other: []
    };
    
    pages.forEach(page => {
      const url = page.toLowerCase();
      const path = new URL(page).pathname.toLowerCase();
      
      // Categorize based on URL patterns
      if (path === '/' || path === '' || path.includes('home') || path.includes('index')) {
        categories.home.push(page);
      } else if (path.includes('about') || path.includes('company') || path.includes('story')) {
        categories.about.push(page);
      } else if (path.includes('contact') || path.includes('reach') || path.includes('get-in-touch')) {
        categories.contact.push(page);
      } else if (path.includes('service') || path.includes('solution') || path.includes('offer')) {
        categories.services.push(page);
      } else if (path.includes('product') || path.includes('portfolio') || path.includes('work')) {
        categories.products.push(page);
      } else if (path.includes('team') || path.includes('people') || path.includes('staff')) {
        categories.team.push(page);
      } else if (path.includes('blog') || path.includes('news') || path.includes('article')) {
        categories.blog.push(page);
      } else {
        categories.other.push(page);
      }
    });
    
    return categories;
  }

  /**
   * Prioritize pages for scraping based on importance
   */
  private prioritizePages(categorizedPages: CategorizedPages): string[] {
    const priorityOrder = [
      'home',      // Most important - company overview
      'about',     // Company information
      'contact',   // Contact details
      'services',  // What they do
      'products',  // What they offer
      'team',      // Who they are
      'blog',      // Additional content
      'other'      // Everything else
    ];
    
    const prioritizedPages: string[] = [];
    
    priorityOrder.forEach(category => {
      const pages = categorizedPages[category as keyof CategorizedPages];
      if (pages && pages.length > 0) {
        prioritizedPages.push(...pages);
      }
    });
    
    // Limit to max pages and remove duplicates
    const uniquePages = [...new Set(prioritizedPages)];
    return uniquePages.slice(0, this.config.maxPages);
  }

  /**
   * Fetch a single page with proper error handling
   */
  private async fetchPage(url: string): Promise<{ html: string; status: number; headers: Record<string, string>; durationMs: number; }> {
    try {
      const start = Date.now();
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });
      
      const durationMs = Date.now() - start;
      const headers: Record<string, string> = {};
      response.headers.forEach((v, k) => (headers[k] = v));
      const html = await response.text();

      // Simple SPA detection and headless fallback
      const isSpa = () => {
        const aCount = (html.match(/<a\s/gi) || []).length;
        const hasNext = html.includes('__NEXT_DATA__') || html.includes('id="__next"');
        const hasAngular = html.includes('ng-version');
        const hasVue = html.includes('id="__nuxt"') || html.includes('window.__NUXT__');
        return hasNext || hasAngular || hasVue || aCount < 3;
      };

      if (this.config.enableHeadless && (response.status === 200) && isSpa()) {
        try {
          const headless = await this.fetchPageHeadless(url);
          return headless;
        } catch (e) {
          console.warn('⚠️ Headless fallback failed, using static HTML:', e);
        }
      }

      return { html, status: response.status, headers, durationMs };
      
    } catch (error) {
      throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchPageHeadless(url: string): Promise<{ html: string; status: number; headers: Record<string, string>; durationMs: number; }> {
    const start = Date.now();
    try {
      const puppeteer: any = await import('puppeteer');
      const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setUserAgent(this.getRandomUserAgent());
      await page.goto(url, { waitUntil: 'networkidle0', timeout: this.config.timeout });
      // Attempt a small scroll to trigger lazy content
      try {
        await page.evaluate(async () => {
          await new Promise<void>(resolve => {
            const total = document.body.scrollHeight;
            let y = 0;
            const step = Math.max(200, Math.floor(total / 10));
            const timer = setInterval(() => {
              y = Math.min(total, y + step);
              window.scrollTo(0, y);
              if (y >= total) { clearInterval(timer); resolve(); }
            }, 100);
          });
        });
      } catch {}
      const html = await page.content();
      await browser.close();
      const durationMs = Date.now() - start;
      return { html, status: 200, headers: {}, durationMs };
    } catch (error) {
      const durationMs = Date.now() - start;
      throw new Error(`Headless fetch failed for ${url}: ${error instanceof Error ? error.message : 'Unknown error'} (after ${durationMs}ms)`);
    }
  }

  /**
   * Enrich company data by intelligently scraping their website
   */
  async enrich(domain: string): Promise<WebsiteScrapeData | null> {
    try {
      const normalizedDomain = this.normalizeDomain(domain);
      console.log(`🌐 Smart scraping website: ${domain} (normalized: ${normalizedDomain})`);
      
      // Build base URL
      const baseUrl = `https://${normalizedDomain}`;
      
      // Step 1: Discover available pages
      const discoveredPages = await this.discoverPages(baseUrl);
      
      // Step 2: Categorize discovered pages
      const categorizedPages = this.categorizePages(discoveredPages);
      
      // Step 3: Prioritize pages for scraping
      const pagesToScrape = this.prioritizePages(categorizedPages);
      
      console.log(`📋 Pages to scrape (${pagesToScrape.length}):`, pagesToScrape);
      
      // Step 4: Scrape prioritized pages
      const scrapedPages = await Promise.allSettled(
        pagesToScrape.map(page => this.scrapePage(page))
      );
      
      // Step 5: Process successful scrapes
      const successfulScrapes = scrapedPages
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value)
        .filter(Boolean);
      
      if (successfulScrapes.length === 0) {
        console.warn(`⚠️ No pages could be scraped successfully for ${normalizedDomain}`);
        return this.createFallbackData(normalizedDomain);
      }
      
      console.log(`✅ Successfully scraped ${successfulScrapes.length}/${pagesToScrape.length} pages`);
      
      // Step 6: Merge and consolidate data
      const consolidatedData = this.consolidateScrapedData(successfulScrapes, normalizedDomain);

      // Step 7: Attach discovery and per-page scraping metadata so the tracker can log steps 02 and 03
      const pageResults = successfulScrapes.map((page) => ({
        url: page.url,
        status: 'success' as const,
        duration: 0, // Duration not currently measured; set to 0 for now
        title: page.title,
        description: page.description,
        content: page.content,
        contactInfo: page.contactInfo,
        technologies: page.technologies,
        socialLinks: page.socialLinks,
        keywords: page.keywords
      }));

      return {
        ...consolidatedData,
        discoveredPages,
        categorizedPages: (categorizedPages as unknown as Record<string, string[]>),
        prioritizedPages: pagesToScrape,
        // Optional additional detail for tracking
        pageResults
      } as WebsiteScrapeData;
      
    } catch (error) {
      console.error(`❌ Website scraping failed for ${domain}:`, error);
      return this.createFallbackData(domain);
    }
  }

  /**
   * Scrape a single page and extract structured data
   */
  private async scrapePage(url: string): Promise<ScrapedPageData | null> {
    try {
      console.log(`📄 Scraping: ${url}`);
      
      const { html, status, headers, durationMs } = await this.fetchPage(url);
      const $ = cheerio.load(html);

      // Remove non-content and noisy nodes
      $('script,noscript,style,template,iframe,svg,canvas,meta,link,button').remove();
      // Remove Next.js streaming/hydration payloads if any remain
      $('[id^="__NEXT_DATA__"]').remove();
      
      // Extract page data
      const title = $('title').text().trim() || $('h1').first().text().trim();
      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') ||
                         $('p').first().text().trim();
      
      // Extract contact information
      const contactInfo = this.extractContactInfo($, html, url);
      
      // Extract technologies
      const technologies = this.extractTechnologies($, html);
      
      // Extract social links
      const socialLinks = this.extractSocialLinks($);
      
      // Extract keywords
      const keywords = this.extractKeywords($);
      
      const page: ScrapedPageData = {
        url,
        title,
        description,
        content: $('body').text().replace(/\s+/g, ' ').trim(),
        contactInfo,
        technologies,
        socialLinks,
        keywords,
        scrapedAt: new Date()
      };
      return page;
      
    } catch (error) {
      console.error(`❌ Failed to scrape ${url}:`, error);
      return null;
    }
  }

  /**
   * Extract contact information from page content
   */
  private extractContactInfo($: cheerio.Root, html: string, pageUrl: string): ContactInfo {
    const emails: string[] = [];
    const phones: string[] = [];
    const addresses: string[] = [];
    
    // Extract emails (prefer mailto and domain-matching)
    const mailtoSet = new Set<string>();
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const email = href.replace(/^mailto:/i, '').split('?')[0];
      if (email) mailtoSet.add(email.toLowerCase());
    });
    const emailRegex = /(?<![\w-])([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?![\w-])/g;
    const foundEmails = html.match(emailRegex) || [];
    const allEmails = new Set<string>([...mailtoSet, ...foundEmails.map(e => e.toLowerCase())]);
    Array.from(allEmails)
      .filter(e => e.length <= 254)
      .forEach(e => emails.push(e));
    
    // Extract phone numbers (favor tel: links, normalize, and capture snippet)
    const telCandidates = new Map<string, string>(); // number -> snippet
    $('a[href^="tel:"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const raw = href.replace(/^tel:/i, '').split('?')[0];
      const digits = raw.replace(/[^\d+]/g, '');
      if (digits.length >= 7) {
        const linkText = $(el).text().replace(/\s+/g, ' ').trim();
        const parentText = $(el).parent().text().replace(/\s+/g, ' ').trim();
        const snippet = (linkText || parentText).slice(0, 160);
        telCandidates.set(digits, snippet);
      }
    });

    // Stronger phone extraction with context filtering
    // 1) Inline visible text around phone-like strings
    const text = $('body').clone().find('script,style,noscript').remove().end().text();
    const phoneLikeRegex = /(?<!\w)(\+?\d[\d\s().-]{6,}\d)(?!\w)/g;
    const textPhones = Array.from(text.matchAll(phoneLikeRegex)).map(m => ({ raw: m[1], index: m.index || 0 }));

    // 2) Microdata/JSON-LD phones
    const schemaPhones: Array<{ raw: string; snippet: string }> = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const obj = JSON.parse($(el).text());
        const collect = (v: any) => {
          if (!v) return;
          if (typeof v === 'string') {
            if (/^\+?\d[\d\s().-]{6,}\d$/.test(v)) schemaPhones.push({ raw: v, snippet: 'schema.org' });
          } else if (Array.isArray(v)) v.forEach(collect);
          else if (typeof v === 'object') Object.values(v).forEach(collect);
        };
        collect(obj);
      } catch {}
    });

    // Merge and normalize with source/snippet
    const allCandidates = new Map<string, { source: 'tel' | 'text' | 'schema'; snippet: string }>();
    // tel
    telCandidates.forEach((snip, num) => {
      allCandidates.set(num, { source: 'tel', snippet: snip });
    });
    // text (windowed snippet)
    const windowSize = 80;
    textPhones.forEach(({ raw, index }) => {
      const start = Math.max(0, index - windowSize);
      const end = Math.min(text.length, index + raw.length + windowSize);
      const snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
      if (!allCandidates.has(raw)) allCandidates.set(raw, { source: 'text', snippet });
    });
    // schema
    schemaPhones.forEach(({ raw, snippet }) => {
      if (!allCandidates.has(raw)) allCandidates.set(raw, { source: 'schema', snippet });
    });

    // Country/format heuristics and junk filters
    const host = (() => { try { return new URL(pageUrl).hostname; } catch { return ''; } })();
    const likelyNA = /\b(usa|canada|ca|us|saskatoon|ny|ca\b)/i.test(html) || /\+1[\s)\-]/.test(html) || host.endsWith('.ca') || host.endsWith('.us');

    const cleanNumber = (raw: string) => raw.replace(/[^\d+]/g, '');
    const isLikelyPhone = (num: string) => {
      // Disallow sequences of a single repeated digit (e.g., 0000000)
      if (/^(\+)?(\d)\1{6,}$/.test(num)) return false;
      const digitsOnly = num.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) return false;
      // Heuristic: if North America, prefer 10-11 digits (+1...) and valid area-code-like start
      if (likelyNA) {
        if (digitsOnly.length === 10) {
          // Area code cannot start with 0 or 1
          if (/^[01]/.test(digitsOnly[0])) return false;
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
          // Country code 1, check area code at position 1
          if (/^[01]/.test(digitsOnly[1])) return false;
        } else {
          return false;
        }
      }
      // Avoid order numbers/skus: adjacent to words like order, sku, id
      return true;
    };

    const ranked = Array.from(allCandidates.entries())
      .map(([raw, meta]) => ({ raw, meta, num: cleanNumber(raw) }))
      .filter(x => isLikelyPhone(x.num))
      // Prefer numbers that came from tel: or schema.org
      .sort((a, b) => {
        const aPref = (a.meta.source === 'tel' || a.meta.source === 'schema') ? 1 : 0;
        const bPref = (b.meta.source === 'tel' || b.meta.source === 'schema') ? 1 : 0;
        if (aPref !== bPref) return bPref - aPref;
        // Prefer longer (more complete) numbers
        return b.num.length - a.num.length;
      });

    let finalDetails: Array<{ number: string; source: 'tel' | 'text' | 'schema'; snippet: string }> = [];
    const seenNums = new Set<string>();
    ranked.forEach(r => {
      if (!seenNums.has(r.num)) {
        seenNums.add(r.num);
        finalDetails.push({ number: r.num, source: r.meta.source, snippet: r.meta.snippet });
      }
    });

    // Fallback 1: if strict filter yields none, accept tel: candidates with relaxed checks
    if (finalDetails.length === 0 && telCandidates.size > 0) {
      const telFallback: Array<{ number: string; source: 'tel'; snippet: string }> = [];
      telCandidates.forEach((snip, raw) => {
        const num = cleanNumber(raw);
        const digitsOnly = num.replace(/\D/g, '');
        if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
          telFallback.push({ number: num, source: 'tel', snippet: snip });
        }
      });
      const uniq = new Set<string>();
      finalDetails = [];
      telFallback.forEach(t => { if (!uniq.has(t.number)) { uniq.add(t.number); finalDetails.push(t); } });
    }

    // Fallback 2: if still none, accept relaxed text matches (length only)
    if (finalDetails.length === 0 && textPhones.length > 0) {
      const relaxed: Array<{ number: string; source: 'text'; snippet: string }> = [];
      textPhones.forEach(({ raw, index }) => {
        const num = cleanNumber(raw);
        const digitsOnly = num.replace(/\D/g, '');
        if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
          const start = Math.max(0, index - windowSize);
          const end = Math.min(text.length, index + raw.length + windowSize);
          const snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
          relaxed.push({ number: num, source: 'text', snippet });
        }
      });
      const uniq = new Set<string>();
      finalDetails = [];
      relaxed.forEach(t => { if (!uniq.has(t.number)) { uniq.add(t.number); finalDetails.push(t); } });
    }

    phones.push(...finalDetails.map(d => d.number));
    
    // Extract addresses (basic pattern)
    const addressElements = $('address, .address, [class*="address"], [id*="address"]');
    addressElements.each((_, element) => {
      const address = $(element).text().trim();
      if (address && address.length > 10) {
        addresses.push(address);
      }
    });
    
    return { emails, phones, addresses, phoneDetails: finalDetails };
  }

  /**
   * Extract technologies from page
   */
  private extractTechnologies($: cheerio.Root, html: string): string[] {
    const technologies: string[] = [];
    
    // Common technology patterns
    const techPatterns = [
      'WordPress', 'Shopify', 'WooCommerce', 'Magento', 'Drupal', 'Joomla',
      'React', 'Vue', 'Angular', 'jQuery', 'Bootstrap', 'Tailwind',
      'AWS', 'Azure', 'Google Cloud', 'Cloudflare', 'Vercel', 'Netlify',
      'Stripe', 'PayPal', 'Square', 'Mailchimp', 'HubSpot', 'Salesforce'
    ];
    
    techPatterns.forEach(tech => {
      if (html.includes(tech)) {
        technologies.push(tech);
      }
    });

    return technologies;
  }

  /**
   * Extract social media links
   */
  private extractSocialLinks($: cheerio.Root): Record<string, string> {
    const socialLinks: Record<string, string> = {};
    
    const socialPatterns = {
      'linkedin': /linkedin\.com/i,
      'twitter': /twitter\.com|x\.com/i,
      'facebook': /facebook\.com/i,
      'instagram': /instagram\.com/i,
      'youtube': /youtube\.com/i
    };
    
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href') || '';
      
      Object.entries(socialPatterns).forEach(([platform, pattern]) => {
        if (pattern.test(href) && !socialLinks[platform]) {
          socialLinks[platform] = href;
        }
      });
    });
    
    return socialLinks;
  }

  /**
   * Extract keywords from meta tags and content
   */
  private extractKeywords($: cheerio.Root): string[] {
    const keywords: string[] = [];
    
    // Meta keywords
    const metaKeywords = $('meta[name="keywords"]').attr('content');
    if (metaKeywords) {
      keywords.push(...metaKeywords.split(',').map(k => k.trim()));
    }
    
    // H1, H2, H3 tags as potential keywords
    $('h1, h2, h3').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length < 100) {
        keywords.push(text);
      }
    });
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Consolidate data from multiple scraped pages
   */
  private consolidateScrapedData(scrapedPages: ScrapedPageData[], domain: string): WebsiteScrapeData {
    // Find the best title and description
    const homePage = scrapedPages.find(page => 
      page.url.endsWith('/') || page.url.endsWith(domain) || page.url.includes(domain + '/')
    );
    
    const title = homePage?.title || scrapedPages[0]?.title || domain;
    const description = homePage?.description || scrapedPages[0]?.description || `Website for ${domain}`;
    
    // Consolidate contact information
    const allEmails = new Set<string>();
    const allPhones = new Set<string>();
    const allAddresses = new Set<string>();
    
    scrapedPages.forEach(page => {
      page.contactInfo.emails.forEach(email => allEmails.add(email));
      page.contactInfo.phones.forEach(phone => allPhones.add(phone));
      page.contactInfo.addresses.forEach(address => allAddresses.add(address));
    });
    
    // Consolidate technologies
    const allTechnologies = new Set<string>();
    scrapedPages.forEach(page => {
      page.technologies.forEach(tech => allTechnologies.add(tech));
    });
    
    // Consolidate social links
    const socialLinks: Record<string, string> = {};
    scrapedPages.forEach(page => {
      Object.entries(page.socialLinks).forEach(([platform, url]) => {
        if (!socialLinks[platform]) {
          socialLinks[platform] = url;
        }
      });
    });
    
    // Consolidate keywords
    const allKeywords = new Set<string>();
    scrapedPages.forEach(page => {
      page.keywords.forEach(keyword => allKeywords.add(keyword));
    });
    
    return {
      title,
      description,
      keywords: Array.from(allKeywords),
      content: scrapedPages.map(page => page.content).join('\n\n'),
      socialLinks,
      contactInfo: {
        emails: Array.from(allEmails),
        phones: Array.from(allPhones),
        addresses: Array.from(allAddresses)
      },
      technologies: Array.from(allTechnologies),
      lastScraped: new Date(),
      status: 'success'
    };
  }

  /**
   * Create fallback data when scraping fails
   */
  private createFallbackData(domain: string): WebsiteScrapeData {
    return {
      title: domain,
      description: `Website for ${domain}`,
      keywords: [],
      content: '',
      socialLinks: {},
      contactInfo: { emails: [], phones: [], addresses: [] },
      technologies: [],
      lastScraped: new Date(),
      status: 'success'
    };
  }

  /**
   * Get a random user agent string
   */
  private getRandomUserAgent(): string {
    if (this.userAgents && this.userAgents.length > 0) {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }
    return this.config.userAgent;
  }
}

// Types for the new system
interface CategorizedPages {
  home: string[];
  about: string[];
  contact: string[];
  services: string[];
  products: string[];
  team: string[];
  blog: string[];
  other: string[];
}

interface ScrapedPageData {
  url: string;
  title: string;
  description: string;
  content: string;
  contactInfo: ContactInfo;
  technologies: string[];
  socialLinks: Record<string, string>;
  keywords: string[];
  scrapedAt: Date;
}

interface ContactInfo {
  emails: string[];
  phones: string[];
  addresses: string[];
  phoneDetails?: Array<{ number: string; source: 'tel' | 'text' | 'schema'; snippet: string }>;
}

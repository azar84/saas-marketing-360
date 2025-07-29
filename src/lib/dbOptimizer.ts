import { prisma } from './db';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Cache utility functions
export function getCacheKey(prefix: string, params: Record<string, any>): string {
  return `${prefix}:${JSON.stringify(params)}`;
}

export function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(prefix?: string): void {
  if (prefix) {
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

// Optimized query functions
export async function getSiteSettings() {
  const cacheKey = getCacheKey('site-settings', {});
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return cached;
  }

  const settings = await prisma.siteSettings.findFirst();
  setCache(cacheKey, settings);
  return settings;
}

export async function getPageWithSections(slug: string) {
  const cacheKey = getCacheKey('page-sections', { slug });
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return cached;
  }

  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      pageSections: {
        where: { isVisible: true },
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
                include: { feature: true },
                where: { isVisible: true },
                orderBy: { sortOrder: 'asc' }
              }
            }
          },
          mediaSection: {
            include: {
              features: {
                orderBy: { sortOrder: 'asc' }
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
                      _count: { select: { faqs: true } }
                    }
                  }
                },
                orderBy: { sortOrder: 'asc' }
              }
            }
          },
          form: {
            include: {
              _count: {
                select: { fields: true, submissions: true }
              }
            }
          },
          htmlSection: true
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  setCache(cacheKey, page);
  return page;
}

export async function getHeaderConfig() {
  const cacheKey = getCacheKey('header-config', {});
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return cached;
  }

  const config = await prisma.headerConfig.findFirst({
    where: { isActive: true },
    include: {
      navItems: {
        include: { page: true },
        orderBy: { sortOrder: 'asc' }
      },
      headerCTAs: {
        include: { cta: true },
        orderBy: { sortOrder: 'asc' }
      },
      menus: {
        include: {
          menu: {
            include: {
              items: {
                include: { page: true, parent: true },
                orderBy: { sortOrder: 'asc' }
              }
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  setCache(cacheKey, config);
  return config;
}

// Batch query optimization
export async function batchGetPages(pageIds: number[]) {
  if (pageIds.length === 0) return [];
  
  const cacheKey = getCacheKey('batch-pages', { ids: pageIds });
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return cached;
  }

  const pages = await prisma.page.findMany({
    where: { id: { in: pageIds } },
    select: {
      id: true,
      slug: true,
      title: true,
      metaTitle: true,
      metaDesc: true
    }
  });

  setCache(cacheKey, pages);
  return pages;
}

// Database connection health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Cleanup function for cache management
export function cleanupCache(): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupCache, 10 * 60 * 1000);
} 
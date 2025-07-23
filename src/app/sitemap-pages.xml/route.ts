import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function transformSitemapToHTML(pages: any[], baseUrl: string): Promise<string> {
  const now = new Date().toISOString().split('T')[0] + ' ' + 
             new Date().toISOString().split('T')[1].substring(0, 8) + ' +00:00';

  return `<!DOCTYPE html>
<html>
<head>
  <title>XML Sitemap - Pages</title>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body {
      font-family: Verdana, Geneva, sans-serif;
      font-size: 13px;
      margin: 20px;
      background-color: #fff;
      color: #333;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 15px 0;
      color: #333;
    }
    .description {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .description p {
      margin: 8px 0;
    }
    .stats {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    .stats h3 {
      margin: 0 0 10px 0;
      color: #333;
    }
    a {
      color: #1e8cbe;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 20px;
    }
    th, td {
      text-align: left;
      padding: 8px 12px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .url {
      word-break: break-all;
    }
    .priority {
      text-align: center;
      font-weight: bold;
    }
    .high-priority {
      color: #d63384;
    }
    .medium-priority {
      color: #fd7e14;
    }
    .low-priority {
      color: #6c757d;
    }
    .lastmod {
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <h1>XML Sitemap - Pages</h1>
  
  <div class="description">
    <p>This sitemap contains all the main pages of our website.</p>
    <p>You can find more information about XML sitemaps on <a href="https://sitemaps.org" target="_blank">sitemaps.org</a>.</p>
    <p><a href="${baseUrl}/sitemap.xml">← Back to Sitemap Index</a></p>
  </div>

  <div class="stats">
    <h3>Pages Overview:</h3>
    <p>This sitemap contains <strong>${pages.length}</strong> page${pages.length !== 1 ? 's' : ''}, last updated on <strong>${now}</strong>.</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Page URL</th>
        <th>Priority</th>
        <th>Change Frequency</th>
        <th>Last Modified</th>
      </tr>
    </thead>
    <tbody>
      ${pages.map(page => {
        const pageUrl = `${baseUrl}/${page.slug}`;
        const priority = page.slug === 'home' ? 1.0 : 
                        page.slug === 'pricing' ? 0.8 : 
                        page.slug === 'faq' ? 0.8 : 0.7;
        const changefreq = page.slug === 'home' ? 'weekly' : 
                          page.slug === 'pricing' ? 'monthly' : 
                          page.slug === 'faq' ? 'weekly' : 'monthly';
        const lastmod = page.updatedAt ? new Date(page.updatedAt).toISOString().split('T')[0] + ' ' + 
                       new Date(page.updatedAt).toISOString().split('T')[1].substring(0, 8) + ' +00:00' : now;
        
        const priorityClass = priority >= 0.8 ? 'high-priority' : 
                             priority >= 0.7 ? 'medium-priority' : 'low-priority';
        
        return `
        <tr>
          <td class="url">
            <a href="${pageUrl}" target="_blank">${pageUrl}</a>
          </td>
          <td class="priority ${priorityClass}">${priority.toFixed(1)}</td>
          <td>${changefreq}</td>
          <td class="lastmod">${lastmod}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</body>
</html>`;
}

export async function GET(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptHeader = request.headers.get('accept') || '';
    
    // Simplified logic: Only serve HTML if it's clearly a browser request
    // Default to XML for all other requests (APIs, crawlers, etc.)
    const isBrowserRequest = userAgent.includes('Mozilla') && 
                           userAgent.includes('Chrome') && 
                           acceptHeader.includes('text/html') &&
                           !userAgent.includes('bot') &&
                           !userAgent.includes('crawler') &&
                           !userAgent.includes('spider') &&
                           !userAgent.includes('Google-') &&
                           !userAgent.includes('APIs-Google');

    // Generate sitemap content
    const sitemapContent = await generatePagesSitemap();

    // For browser requests, serve as HTML
    if (isBrowserRequest) {
      const siteSettings = await prisma.siteSettings.findFirst();
      const baseUrl = siteSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const pages = await prisma.page.findMany({
        select: {
          slug: true,
          title: true,
          updatedAt: true,
        },
        orderBy: { slug: 'asc' }
      });

      const htmlContent = await transformSitemapToHTML(pages, baseUrl);
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
        }
      });
    }

    // For search engines, serve as XML sitemap
    return new NextResponse(sitemapContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Error generating pages sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

async function generatePagesSitemap(): Promise<string> {
  const siteSettings = await prisma.siteSettings.findFirst();
  const baseUrl = siteSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const pages = await prisma.page.findMany({
    select: {
      slug: true,
      title: true,
      updatedAt: true,
    },
    orderBy: { slug: 'asc' }
  });

  const now = new Date().toISOString();
  
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add each page
  for (const page of pages) {
    const pageUrl = `${baseUrl}/${page.slug}`;
    const lastmod = page.updatedAt ? new Date(page.updatedAt).toISOString() : now;
    
    // Set priority based on page type
    const priority = page.slug === 'home' ? 1.0 : 
                    page.slug === 'pricing' ? 0.8 : 
                    page.slug === 'faq' ? 0.8 : 0.7;
    
    const changefreq = page.slug === 'home' ? 'weekly' : 
                      page.slug === 'pricing' ? 'monthly' : 
                      page.slug === 'faq' ? 'weekly' : 'monthly';
    
    sitemapContent += `
  <url>
    <loc>${escapeXML(pageUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
  }

  sitemapContent += `
</urlset>`;

  return sitemapContent;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
} 
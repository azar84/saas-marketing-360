import path from 'path';
import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // First, try to read the generated robots.txt from the public directory
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    
    try {
      const robotsContent = await readFile(robotsPath, 'utf8');
      return new NextResponse(robotsContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=86400' // Cache for 1 day
        }
      });
    } catch (readError) {
      // If file doesn't exist, generate default content
      console.info('Robots.txt file not found, generating default content');
    }

    // Generate default robots.txt content
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const defaultContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin-panel/
Disallow: /api/admin/
Disallow: /_next/
Disallow: /uploads/temp/

# Allow public uploads
Allow: /uploads/media/

# Generated automatically
# Last updated: ${new Date().toISOString()}`;

    return new NextResponse(defaultContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour for default content
      }
    });

  } catch (error) {
    console.error('Error serving robots.txt:', error);
    
    // Return minimal robots.txt in case of error
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const errorContent = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

    return new NextResponse(errorContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=300' // Short cache for error response
      }
    });
  }
} 
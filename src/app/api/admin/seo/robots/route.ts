import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid robots.txt content provided'
        },
        { status: 400 }
      );
    }

    // Write robots.txt to public directory
    const publicDir = join(process.cwd(), 'public');
    const robotsPath = join(publicDir, 'robots.txt');
    
    try {
      await mkdir(publicDir, { recursive: true });
      await writeFile(robotsPath, content, 'utf8');
    } catch (writeError) {
      console.error('Error writing robots.txt file:', writeError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to write robots.txt file',
          error: writeError instanceof Error ? writeError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Robots.txt saved successfully',
      savedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error saving robots.txt:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save robots.txt',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return default robots.txt content
    const defaultContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sitemap.xml

# Disallow admin areas
Disallow: /admin-panel/
Disallow: /api/admin/
Disallow: /_next/
Disallow: /uploads/temp/

# Allow public uploads
Allow: /uploads/media/`;

    return NextResponse.json({
      success: true,
      content: defaultContent
    });

  } catch (error) {
    console.error('Error getting robots.txt content:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get robots.txt content',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
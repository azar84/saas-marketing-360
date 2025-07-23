import { NextRequest, NextResponse } from 'next/server';
import { submitSitemapToSearchEngines } from '@/lib/sitemapSubmission';

export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (simple auth token check)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'your-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized' 
        }, 
        { status: 401 }
      );
    }

    console.log('🕐 Scheduled sitemap submission started');
    
    // Submit sitemap to search engines
    const result = await submitSitemapToSearchEngines();
    
    console.log('✅ Scheduled sitemap submission completed', result.summary);
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled sitemap submission completed',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Scheduled sitemap submission failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Scheduled sitemap submission failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Support both GET and POST for flexibility with different cron services
  return GET(request);
} 
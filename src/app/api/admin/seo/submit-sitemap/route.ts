import { NextRequest, NextResponse } from 'next/server';
import { submitSitemapToSearchEngines } from '@/lib/sitemapSubmission';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Manual sitemap submission requested');
    
    // Submit sitemap to search engines
    const result = await submitSitemapToSearchEngines();
    
    return NextResponse.json({
      success: true,
      message: `Sitemap submitted to ${result.summary.successful}/${result.summary.totalSubmitted} search engines`,
      data: result,
      submittedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error submitting sitemap:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit sitemap to search engines',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return submission status/info
  return NextResponse.json({
    success: true,
    message: 'Sitemap submission endpoint ready',
    searchEngines: ['Google', 'Bing'],
    autoSubmit: process.env.NODE_ENV !== 'development'
  });
} 
import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { BusinessDirectoryUpdater } from '@/lib/enrichment/businessDirectoryUpdater';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const website = searchParams.get('website');

    if (website) {
      // Get specific business by website
      const business = await BusinessDirectoryUpdater.getBusinessByWebsite(website);
      
      if (!business) {
        return NextResponse.json(
          { error: 'Business not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        business
      });
    } else {
      // Get all enriched businesses
      const businesses = await BusinessDirectoryUpdater.getEnrichedBusinesses(limit, offset);
      
      return NextResponse.json({
        success: true,
        businesses,
        pagination: {
          limit,
          offset,
          count: businesses.length
        }
      });
    }

  } catch (error) {
    console.error('Error in enriched businesses endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

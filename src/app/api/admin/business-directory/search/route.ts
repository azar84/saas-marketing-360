import { NextRequest, NextResponse } from 'next/server';
import { searchBusinesses } from '@/lib/businessDirectory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const city = searchParams.get('city') || undefined;
    const stateProvince = searchParams.get('stateProvince') || undefined;
    const country = searchParams.get('country') || undefined;
    const industry = searchParams.get('industry') || undefined;
    const isActive = searchParams.get('isActive') !== 'false'; // Default to true

    const result = await searchBusinesses(query, {
      page,
      limit,
      city,
      stateProvince,
      country,
      industry,
      isActive
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to search businesses' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Business directory search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

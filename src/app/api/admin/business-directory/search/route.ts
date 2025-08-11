import { NextRequest, NextResponse } from 'next/server';
import { searchBusinesses } from '@/lib/businessDirectory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
    
    // Enhanced filters
    const city = searchParams.get('city') || undefined;
    const stateProvince = searchParams.get('stateProvince') || undefined;
    const country = searchParams.get('country') || undefined;
    const industry = searchParams.get('industry') || undefined;
    const isActive = searchParams.get('isActive') !== 'false'; // Default to true
    
    // New advanced filters
    const minEmployees = searchParams.get('minEmployees') ? parseInt(searchParams.get('minEmployees')!) : undefined;
    const maxEmployees = searchParams.get('maxEmployees') ? parseInt(searchParams.get('maxEmployees')!) : undefined;
    const hasContactPerson = searchParams.get('hasContactPerson') ? searchParams.get('hasContactPerson') === 'true' : undefined;
    const hasIndustries = searchParams.get('hasIndustries') ? searchParams.get('hasIndustries') === 'true' : undefined;
    const createdAfter = searchParams.get('createdAfter') || undefined;
    const createdBefore = searchParams.get('createdBefore') || undefined;
    const updatedAfter = searchParams.get('updatedAfter') || undefined;
    const updatedBefore = searchParams.get('updatedBefore') || undefined;

    const result = await searchBusinesses(query, {
      page,
      limit,
      sortBy,
      sortOrder,
      city,
      stateProvince,
      country,
      industry,
      isActive,
      minEmployees,
      maxEmployees,
      hasContactPerson,
      hasIndustries,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore
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

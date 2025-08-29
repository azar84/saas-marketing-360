import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'label';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const skip = (page - 1) * limit;

    console.log('🔍 Industries Search API - Sorting Debug:', {
      sortBy,
      sortOrder,
      page,
      limit,
      skip
    });

    const where: any = {};
    
    // Text search with case-insensitive support
    if (search) {
      where.OR = [
        { label: { contains: search, mode: 'insensitive' } },
        { label: { startsWith: search, mode: 'insensitive' } }
      ];
    }
    
    // Only show active industries
    where.isActive = true;

    const total = await prisma.industry.count({ where });

    // Handle sorting for count-based fields
    let orderBy: any = {};
    let shouldSortInMemory = false;
    
    if (sortBy === 'id' || sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'label') {
      // Direct database sorting for these fields
      orderBy = { [sortBy]: sortOrder };
      console.log('🔍 Using direct database sorting:', orderBy);
    } else if (sortBy === 'keywordsCount' || sortBy === 'businessesCount' || sortBy === 'childCount') {
      // For count-based fields, we'll sort in memory after fetching
      shouldSortInMemory = true;
      orderBy = { label: 'asc' }; // Default ordering for consistent results
      console.log('🔍 Using in-memory sorting for:', sortBy);
    } else {
      orderBy = { label: 'asc' }; // Default fallback
      console.log('🔍 Using default sorting:', orderBy);
    }

    const rows = await prisma.industry.findMany({
      where,
      orderBy,
      skip: shouldSortInMemory ? 0 : skip, // Fetch all if sorting in memory
      take: shouldSortInMemory ? undefined : limit, // No limit if sorting in memory
      select: { 
        id: true, 
        label: true, 
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            keywords: true,
            business_industries: true,
            subIndustries: true
          }
        }
      },
    });

    // Normalize to the same shape used by NAICS browse for easy frontend reuse
    let data = rows.map((r) => ({
      id: r.id,
      code: '',
      title: r.label,
      level: 'industry',
      parentCode: null as string | null,
      isActive: r.isActive,
      hasChildren: r._count.subIndustries > 0, // Check if industry has sub-industries
      childCount: r._count.subIndustries, // Use actual count from database
      keywordsCount: r._count.keywords, // Use actual count from database
      businessesCount: r._count.business_industries, // Use actual count from database
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    // Sort in memory for count-based fields
    if (shouldSortInMemory) {
      console.log('🔍 Starting in-memory sorting for:', sortBy, 'order:', sortOrder);
      console.log('🔍 Data before sorting (first 3 items):', data.slice(0, 3).map(d => ({
        title: d.title,
        keywordsCount: d.keywordsCount,
        businessesCount: d.businessesCount,
        childCount: d.childCount
      })));
      
      data.sort((a, b) => {
        let aValue: number;
        let bValue: number;
        
        switch (sortBy) {
          case 'keywordsCount':
            aValue = a.keywordsCount || 0;
            bValue = b.keywordsCount || 0;
            break;
          case 'businessesCount':
            aValue = a.businessesCount || 0;
            bValue = b.businessesCount || 0;
            break;
          case 'childCount':
            aValue = a.childCount || 0;
            bValue = b.childCount || 0;
            break;
          default:
            return 0;
        }
        
        if (sortOrder === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
      
      console.log('🔍 Data after sorting (first 3 items):', data.slice(0, 3).map(d => ({
        title: d.title,
        keywordsCount: d.keywordsCount,
        businessesCount: d.businessesCount,
        childCount: d.childCount
      })));
      
      // Apply pagination after sorting
      data = data.slice(skip, skip + limit);
      console.log('🔍 Data after pagination (showing', data.length, 'items from', skip, 'to', skip + limit);
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Error in industries search API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search industries', details: error?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}



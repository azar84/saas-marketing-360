import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'label'; // 'label', 'keywordsCount', 'businessesCount', 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // 'asc' or 'desc'
    const isActive = searchParams.get('isActive'); // 'true', 'false', or undefined
    const minKeywords = searchParams.get('minKeywords'); // minimum keywords count
    const maxKeywords = searchParams.get('maxKeywords'); // maximum keywords count
    const minBusinesses = searchParams.get('minBusinesses'); // minimum businesses count
    const maxBusinesses = searchParams.get('maxBusinesses'); // maximum businesses count
    const createdAfter = searchParams.get('createdAfter'); // ISO date string
    const createdBefore = searchParams.get('createdBefore'); // ISO date string
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Text search with case-insensitive support
    if (search) {
      where.OR = [
        { label: { contains: search, mode: 'insensitive' } },
        { label: { startsWith: search, mode: 'insensitive' } }
      ];
    }
    
    // Active status filter
    if (isActive !== undefined && isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    // Keywords count range filter
    if (minKeywords || maxKeywords) {
      where.keywords = {};
      if (minKeywords) {
        where.keywords._count = { gte: parseInt(minKeywords) };
      }
      if (maxKeywords) {
        where.keywords._count = { ...where.keywords._count, lte: parseInt(maxKeywords) };
      }
    }
    
    // Businesses count range filter
    if (minBusinesses || maxBusinesses) {
      where.businesses = {};
      if (minBusinesses) {
        where.businesses._count = { gte: parseInt(minBusinesses) };
      }
      if (maxBusinesses) {
        where.businesses._count = { ...where.businesses._count, lte: parseInt(maxBusinesses) };
      }
    }
    
    // Date range filter
    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) {
        where.createdAt.gte = new Date(createdAfter);
      }
      if (createdBefore) {
        where.createdAt.lte = new Date(createdBefore);
      }
    }

    const total = await prisma.industry.count({ where });

    // Build orderBy clause based on sortBy parameter
    let orderBy: any = {};
    switch (sortBy) {
      case 'keywordsCount':
        orderBy = { keywords: { _count: sortOrder } };
        break;
      case 'businessesCount':
        orderBy = { businesses: { _count: sortOrder } };
        break;
      case 'createdAt':
        orderBy = { createdAt: sortOrder };
        break;
      case 'updatedAt':
        orderBy = { updatedAt: sortOrder };
        break;
      case 'label':
      default:
        orderBy = { label: sortOrder };
        break;
    }

    const rows = await prisma.industry.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: { 
        id: true, 
        label: true, 
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { 
            keywords: true,
            businesses: true
          }
        }
      },
    });

    // Manual sorting for computed fields since Prisma's orderBy with _count can be unreliable
    if (sortBy === 'keywordsCount' || sortBy === 'businessesCount') {
      rows.sort((a, b) => {
        let aCount: number, bCount: number;
        
        if (sortBy === 'keywordsCount') {
          aCount = a._count.keywords;
          bCount = b._count.keywords;
        } else {
          aCount = a._count.businesses;
          bCount = b._count.businesses;
        }
        
        if (sortOrder === 'asc') {
          return aCount - bCount;
        } else {
          return bCount - aCount;
        }
      });
    }

    // Normalize to the same shape used by NAICS browse for easy frontend reuse
    const data = rows.map((r) => ({
      id: r.id,
      code: '',
      title: r.label,
      level: 'industry',
      parentCode: null as string | null,
      isActive: r.isActive,
      hasChildren: false,
      childCount: 0,
      keywordsCount: r._count.keywords,
      businessesCount: r._count.businesses,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

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
    return NextResponse.json(
      { success: false, error: 'Failed to search industries', details: error?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}



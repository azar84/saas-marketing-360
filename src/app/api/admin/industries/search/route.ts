import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'label'; // 'label' or 'keywordsCount'
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // 'asc' or 'desc'
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.label = { contains: search };
    }

    const total = await prisma.industry.count({ where });

    // Build orderBy clause based on sortBy parameter
    let orderBy: any = {};
    if (sortBy === 'keywordsCount') {
      // For keywords count, we need to use a different approach since it's a computed field
      orderBy = { keywords: { _count: sortOrder } };
    } else {
      // Default to alphabetical sorting by label
      orderBy = { label: sortOrder };
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
        _count: {
          select: { keywords: true }
        }
      },
    });

    // If sorting by keywordsCount, we need to sort the results manually since Prisma's orderBy with _count can be unreliable
    if (sortBy === 'keywordsCount') {
      rows.sort((a, b) => {
        const aCount = a._count.keywords;
        const bCount = b._count.keywords;
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



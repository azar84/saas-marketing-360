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

    // Simple orderBy without _count
    let orderBy: any = {};
    if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'label') {
      orderBy = { [sortBy]: sortOrder };
    } else {
      orderBy = { label: 'asc' }; // Default fallback
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
        updatedAt: true
      },
    });

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
      keywordsCount: 0, // We'll add this later if needed
      businessesCount: 0, // We'll add this later if needed
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
    console.error('Error in industries search API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search industries', details: error?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}



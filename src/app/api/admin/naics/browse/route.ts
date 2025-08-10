import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const level = searchParams.get('level') || '';
    const parentCodeParam = searchParams.get('parentCode');
    const parentCode = parentCodeParam ?? '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { title: { contains: search } }
      ];
    }

    if (level) {
      where.level = level;
    }

    const hasSearch = search.trim().length > 0;
    const hasLevel = level.trim().length > 0;
    const hasParent = parentCode !== '';

    if (hasParent) {
      // Drill-down: fetch children of a specific parent
      where.parentCode = parentCode;
    } else if (!hasSearch && !hasLevel) {
      // Default browse: show top-level sectors when no search/level filter provided
      where.parentCode = null;
    }

    // Get total count for pagination
    const totalCount = await prisma.nAICSClassification.count({ where });

    // Get the data
    const industries = await prisma.nAICSClassification.findMany({
      where,
      select: {
        id: true,
        code: true,
        title: true,
        level: true,
        parentCode: true,
        isActive: true,
        _count: {
          select: {
            children: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { code: 'asc' }
      ],
      skip: offset,
      take: limit
    });

    // Add hierarchy information
    const enrichedIndustries = industries.map(industry => ({
      ...industry,
      hasChildren: industry._count.children > 0,
      childCount: industry._count.children
    }));

    return NextResponse.json({
      success: true,
      data: enrichedIndustries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error browsing NAICS data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to browse NAICS data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Get hierarchy tree for a specific code
export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' }, 
        { status: 400 }
      );
    }

    // Get the industry and its full hierarchy
    const industry = await prisma.nAICSClassification.findUnique({
      where: { code },
      include: {
        parent: true,
        children: {
          orderBy: { code: 'asc' },
          include: {
            _count: {
              select: { children: true }
            }
          }
        }
      }
    });

    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' }, 
        { status: 404 }
      );
    }

    // Build breadcrumb trail
    const breadcrumbs = [];
    let current = industry.parent;
    
    while (current) {
      breadcrumbs.unshift({
        code: current.code,
        title: current.title,
        level: current.level
      });
      
      // Get the parent of current (we need to fetch it)
      if (current.parentCode) {
        current = await prisma.nAICSClassification.findUnique({
          where: { code: current.parentCode }
        });
      } else {
        current = null;
      }
    }

    return NextResponse.json({
      success: true,
      industry: {
        ...industry,
        children: industry.children.map(child => ({
          ...child,
          hasChildren: child._count.children > 0
        }))
      },
      breadcrumbs
    });
    
  } catch (error) {
    console.error('Error getting NAICS hierarchy:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get NAICS hierarchy',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List all industries with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'label';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.label = { contains: search };
    }

    const total = await prisma.industry.count({ where });

    // Build orderBy clause based on sortBy parameter
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

    const data = rows.map((r) => ({
      id: r.id,
      label: r.label,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      keywordsCount: 0, // We'll add this later if needed
      businessesCount: 0, // We'll add this later if needed
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
    console.error('Error fetching industries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch industries', details: error?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}

// POST - Create a new industry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label, isActive = true } = body;

    if (!label || typeof label !== 'string' || label.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Industry label is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check if industry already exists
    const existingIndustry = await prisma.industry.findFirst({
      where: { 
        label: { equals: label.trim(), mode: 'insensitive' }
      }
    });

    if (existingIndustry) {
      return NextResponse.json(
        { success: false, error: 'Industry with this label already exists' },
        { status: 409 }
      );
    }

    const industry = await prisma.industry.create({
      data: {
        label: label.trim(),
        code: label.trim().substring(0, 4).toUpperCase(),
        isActive
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Industry created successfully',
      data: industry
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating industry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create industry', details: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing industry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, label, isActive } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Industry ID is required and must be a number' },
        { status: 400 }
      );
    }

    if (label !== undefined && (typeof label !== 'string' || label.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Industry label must be a non-empty string if provided' },
        { status: 400 }
      );
    }

    // Check if industry exists
    const existingIndustry = await prisma.industry.findUnique({
      where: { id }
    });

    if (!existingIndustry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    // If updating label, check for duplicates
    if (label && label.trim() !== existingIndustry.label) {
      const duplicateIndustry = await prisma.industry.findFirst({
        where: { 
          label: { equals: label.trim(), mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (duplicateIndustry) {
        return NextResponse.json(
          { success: false, error: 'Another industry with this label already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (label !== undefined) updateData.label = label.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedIndustry = await prisma.industry.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Industry updated successfully',
      data: updatedIndustry
    });

  } catch (error: any) {
    console.error('Error updating industry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update industry', details: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an industry and all its related data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid industry ID is required' },
        { status: 400 }
      );
    }

    const industryId = parseInt(id);

    // Check if industry exists
    const existingIndustry = await prisma.industry.findUnique({
      where: { id: industryId },
      include: {
        _count: {
          select: {
            keywords: true,
            companies: true
          }
        }
      }
    });

    if (!existingIndustry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    // Show warning if industry has related data
    if (existingIndustry._count.keywords > 0 || existingIndustry._count.companies > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete industry with related data',
        details: {
          keywordsCount: existingIndustry._count.keywords,
          companiesCount: existingIndustry._count.companies,
          message: 'This industry has keywords and/or company associations. Please delete them first or use the force delete option.'
        }
      }, { status: 400 });
    }

    // Delete the industry (keywords will be deleted automatically due to onDelete: Cascade)
    await prisma.industry.delete({
      where: { id: industryId }
    });

    return NextResponse.json({
      success: true,
      message: 'Industry deleted successfully',
      deletedIndustry: {
        id: existingIndustry.id,
        label: existingIndustry.label
      }
    });

  } catch (error: any) {
    console.error('Error deleting industry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete industry', details: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

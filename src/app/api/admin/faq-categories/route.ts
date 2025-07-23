import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errorHandling';

// GET /api/admin/faq-categories - Get all FAQ categories
export async function GET() {
  try {
    const categories = await prisma.fAQCategory.findMany({
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            faqs: { where: { isActive: true } }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch FAQ categories');
  }
}

// POST /api/admin/faq-categories - Create new FAQ category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, color, sortOrder, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.fAQCategory.create({
      data: {
        name,
        description,
        icon,
        color: color || '#5243E9',
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            faqs: { where: { isActive: true } }
          }
        }
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'Failed to create FAQ category');
  }
}

// PUT /api/admin/faq-categories - Update FAQ category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, icon, color, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.fAQCategory.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        icon,
        color,
        sortOrder,
        isActive
      },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            faqs: { where: { isActive: true } }
          }
        }
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error, 'Failed to update FAQ category');
  }
}

// DELETE /api/admin/faq-categories - Delete FAQ category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category has FAQs
    const categoryWithFaqs = await prisma.fAQCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            faqs: true
          }
        }
      }
    });

    if (!categoryWithFaqs) {
      return NextResponse.json(
        { error: 'FAQ category not found' },
        { status: 404 }
      );
    }

    if (categoryWithFaqs._count.faqs > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that contains FAQs. Please move or delete the FAQs first.' },
        { status: 400 }
      );
    }

    await prisma.fAQCategory.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'FAQ category deleted successfully' });
  } catch (error) {
    return handleApiError(error, 'Failed to delete FAQ category');
  }
} 
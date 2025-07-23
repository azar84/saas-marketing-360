import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/faqs - Get all FAQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    let faqs;
    if (categoryId) {
      faqs = await prisma.fAQ.findMany({
        where: {
          categoryId: parseInt(categoryId)
        },
        include: {
          category: true
        },
        orderBy: {
          sortOrder: 'asc'
        }
      });
    } else {
      faqs = await prisma.fAQ.findMany({
        include: {
          category: true
        },
        orderBy: {
          sortOrder: 'asc'
        }
      });
    }

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/faqs - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, question, answer, sortOrder, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const data: any = {
      question,
      answer,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    };

    if (categoryId) {
      data.categoryId = parseInt(categoryId);
    }

    const faq = await prisma.fAQ.create({
      data,
      include: {
        category: true
      }
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/faqs - Update FAQ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, categoryId, question, answer, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const data: any = {
      question,
      answer,
      sortOrder,
      isActive
    };

    if (categoryId) {
      data.categoryId = parseInt(categoryId);
    } else {
      data.categoryId = null;
    }

    const faq = await prisma.fAQ.update({
      where: { id: parseInt(id) },
      data,
      include: {
        category: true
      }
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/faqs - Delete FAQ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    await prisma.fAQ.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
} 
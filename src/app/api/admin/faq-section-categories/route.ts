import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errorHandling';

// GET /api/admin/faq-section-categories - Get categories for a specific FAQ section
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const faqSectionId = searchParams.get('faqSectionId');

    if (!faqSectionId) {
      return NextResponse.json(
        { error: 'faqSectionId parameter is required' },
        { status: 400 }
      );
    }

    const sectionCategories = await prisma.fAQSectionCategory.findMany({
      where: {
        faqSectionId: parseInt(faqSectionId)
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            color: true,
            sortOrder: true,
            isActive: true,
            _count: {
              select: {
                faqs: true
              }
            }
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    return NextResponse.json(sectionCategories);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/faq-section-categories - Add categories to FAQ section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { faqSectionId, categoryIds } = body;

    if (!faqSectionId || !Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'faqSectionId and categoryIds array are required' },
        { status: 400 }
      );
    }

    // First, remove existing categories for this section
    await prisma.fAQSectionCategory.deleteMany({
      where: {
        faqSectionId: parseInt(faqSectionId)
      }
    });

    // Then add new categories with sort order
    const sectionCategories = await Promise.all(
      categoryIds.map((categoryId: number, index: number) =>
        prisma.fAQSectionCategory.create({
          data: {
            faqSectionId: parseInt(faqSectionId),
            categoryId,
            sortOrder: index
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                color: true,
                isActive: true,
                _count: {
                  select: {
                    faqs: true
                  }
                }
              }
            }
          }
        })
      )
    );

    return NextResponse.json(sectionCategories);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/faq-section-categories - Remove all categories from FAQ section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const faqSectionId = searchParams.get('faqSectionId');

    if (!faqSectionId) {
      return NextResponse.json(
        { error: 'faqSectionId parameter is required' },
        { status: 400 }
      );
    }

    await prisma.fAQSectionCategory.deleteMany({
      where: {
        faqSectionId: parseInt(faqSectionId)
      }
    });

    return NextResponse.json({ message: 'Categories removed successfully' });
  } catch (error) {
    return handleApiError(error);
  }
} 
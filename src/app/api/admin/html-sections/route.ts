import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const HtmlSectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  htmlContent: z.string().min(1, 'HTML content is required'),
  cssContent: z.string().optional().nullable(),
  jsContent: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// GET - Fetch all HTML sections
export async function GET() {
  try {
    const htmlSections = await prisma.htmlSection.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        pageHtmlSections: {
          include: {
            page: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        },
        pageSections: {
          include: {
            page: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            pageHtmlSections: true,
            pageSections: true
          }
        }
      }
    });

    return NextResponse.json(htmlSections);
  } catch (error) {
    console.error('Error fetching HTML sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HTML sections', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create new HTML section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = HtmlSectionSchema.parse(body);

    const htmlSection = await prisma.htmlSection.create({
      data: validatedData,
      include: {
        pageHtmlSections: {
          include: {
            page: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        },
        pageSections: {
          include: {
            page: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            pageHtmlSections: true,
            pageSections: true
          }
        }
      }
    });

    return NextResponse.json(htmlSection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating HTML section:', error);
    return NextResponse.json(
      { error: 'Failed to create HTML section', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update HTML section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'HTML section ID is required' },
        { status: 400 }
      );
    }

    const validatedData = HtmlSectionSchema.partial().parse(updateData);

    const htmlSection = await prisma.htmlSection.update({
      where: { id: parseInt(id) },
      data: validatedData,
      include: {
        pageHtmlSections: {
          include: {
            page: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        },
        pageSections: {
          include: {
            page: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            pageHtmlSections: true,
            pageSections: true
          }
        }
      }
    });

    return NextResponse.json(htmlSection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating HTML section:', error);
    return NextResponse.json(
      { error: 'Failed to update HTML section', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete HTML section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'HTML section ID is required' },
        { status: 400 }
      );
    }

    // Check if HTML section is being used in any pages
    const htmlSection = await prisma.htmlSection.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            pageHtmlSections: true,
            pageSections: true
          }
        }
      }
    });

    if (!htmlSection) {
      return NextResponse.json(
        { error: 'HTML section not found' },
        { status: 404 }
      );
    }

    if (htmlSection._count.pageHtmlSections > 0 || htmlSection._count.pageSections > 0) {
      return NextResponse.json(
        { error: 'Cannot delete HTML section that is being used in pages' },
        { status: 400 }
      );
    }

    await prisma.htmlSection.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'HTML section deleted successfully' });
  } catch (error) {
    console.error('Error deleting HTML section:', error);
    return NextResponse.json(
      { error: 'Failed to delete HTML section', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
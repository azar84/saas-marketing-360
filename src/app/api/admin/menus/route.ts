import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const MenuSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const MenuItemSchema = z.object({
  menuId: z.number(),
  label: z.string().min(1, 'Label is required'),
  url: z.string().optional(),
  icon: z.string().optional(),
  target: z.enum(['_self', '_blank']).default('_self'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  parentId: z.number().optional(),
  pageId: z.number().optional(),
});

const UpdateMenuSchema = MenuSchema.partial().extend({
  id: z.number(),
});

const UpdateMenuItemSchema = MenuItemSchema.partial().extend({
  id: z.number(),
});

// GET - Fetch all menus with their menu items
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        items: {
          include: {
            page: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
            parent: {
              select: {
                id: true,
                label: true,
              },
            },
            children: {
              include: {
                page: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                  },
                },
              },
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        headerConfigs: {
          include: {
            headerConfig: {
              select: {
                id: true,
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
            headerConfigs: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: menus,
    });
  } catch (error) {
    console.error('Failed to fetch menus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}

// POST - Create new menu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = MenuSchema.parse(body);

    const menu = await prisma.menu.create({
      data: validatedData,
      include: {
        items: {
          include: {
            page: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
            parent: {
              select: {
                id: true,
                label: true,
              },
            },
            children: {
              include: {
                page: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                  },
                },
              },
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: {
            items: true,
            headerConfigs: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error('Failed to create menu:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}

// PUT - Update menu
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = UpdateMenuSchema.parse(body);
    const { id, ...updateData } = validatedData;

    const menu = await prisma.menu.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            page: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
            parent: {
              select: {
                id: true,
                label: true,
              },
            },
            children: {
              include: {
                page: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                  },
                },
              },
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: {
            items: true,
            headerConfigs: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error('Failed to update menu:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Menu ID is required' },
        { status: 400 }
      );
    }

    // Check if menu is being used in any header configurations
    const usage = await prisma.headerConfigMenu.findFirst({
      where: { menuId: id },
    });

    if (usage) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete menu that is being used in header configuration' },
        { status: 400 }
      );
    }

    // Delete the menu (this will cascade delete menu items)
    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Menu deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete menu' },
      { status: 500 }
    );
  }
} 
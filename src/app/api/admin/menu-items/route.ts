import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const MenuItemSchema = z.object({
  menuId: z.number(),
  label: z.string().min(1, 'Label is required'),
  url: z.string().optional(),
  icon: z.string().optional(),
  target: z.enum(['_self', '_blank']).default('_self'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  parentId: z.number().optional().nullable(),
  pageId: z.number().optional().nullable(),
  linkType: z.enum(['page', 'custom', 'external']).default('page'),
});

const UpdateMenuItemSchema = MenuItemSchema.partial().extend({
  id: z.number(),
});

// GET - Fetch menu items (optionally filtered by menuId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menuId');

    const whereClause = menuId ? { menuId: parseInt(menuId) } : {};

    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
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
        menu: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          menuId: 'asc',
        },
        {
          parentId: 'asc',
        },
        {
          sortOrder: 'asc',
        },
      ],
    });

    return NextResponse.json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

// POST - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = MenuItemSchema.parse(body);

    // If pageId is provided, get the page URL
    let finalUrl = validatedData.url;
    if (validatedData.pageId && validatedData.linkType === 'page') {
      const page = await prisma.page.findUnique({
        where: { id: validatedData.pageId },
        select: { slug: true },
      });
      if (page) {
        finalUrl = page.slug === 'home' ? '/' : `/${page.slug}`;
      }
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        menuId: validatedData.menuId,
        label: validatedData.label,
        url: finalUrl,
        icon: validatedData.icon,
        target: validatedData.target,
        isActive: validatedData.isActive,
        sortOrder: validatedData.sortOrder,
        parentId: validatedData.parentId,
        pageId: validatedData.linkType === 'page' ? validatedData.pageId : null,
      },
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
        menu: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Failed to create menu item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}

// PUT - Update menu item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = UpdateMenuItemSchema.parse(body);
    const { id, linkType = 'custom', ...updateData } = validatedData;

    // If pageId is provided, get the page URL
    let finalUrl = updateData.url;
    if (updateData.pageId && linkType === 'page') {
      const page = await prisma.page.findUnique({
        where: { id: updateData.pageId },
        select: { slug: true },
      });
      if (page) {
        finalUrl = page.slug === 'home' ? '/' : `/${page.slug}`;
      }
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...updateData,
        url: finalUrl,
        pageId: linkType === 'page' ? updateData.pageId : updateData.pageId || null,
      },
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
        menu: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Failed to update menu item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    // Check if menu item has children
    const menuItemWithChildren = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!menuItemWithChildren) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    if (menuItemWithChildren.children.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete menu item with sub-items. Please delete sub-items first.' },
        { status: 400 }
      );
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
} 
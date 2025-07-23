import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { CreateFeatureGroupItemSchema, UpdateFeatureGroupItemSchema, validateAndTransform, type ApiResponse } from '../../../../lib/validations';

// GET - Fetch feature group items (optionally filtered by group)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featureGroupId = searchParams.get('featureGroupId');

    const featureGroupItems = await prisma.featureGroupItem.findMany({
      where: featureGroupId ? { featureGroupId: parseInt(featureGroupId) } : undefined,
      include: {
        feature: true,
        featureGroup: true
      },
      orderBy: [
        { featureGroupId: 'asc' },
        { sortOrder: 'asc' }
      ]
    });

    const response: ApiResponse = {
      success: true,
      data: featureGroupItems
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch feature group items:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch feature group items'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Add a feature to a group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreateFeatureGroupItemSchema, body);

    // Check if this feature is already in this group
    const existingItem = await prisma.featureGroupItem.findFirst({
      where: {
        featureGroupId: validatedData.featureGroupId,
        featureId: validatedData.featureId
      }
    });

    if (existingItem) {
      const response: ApiResponse = {
        success: false,
        message: 'This feature is already in the group'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // If no sortOrder provided, set it to the next available number
    let finalSortOrder = validatedData.sortOrder;
    if (!finalSortOrder) {
      const maxSortOrder = await prisma.featureGroupItem.findFirst({
        where: { featureGroupId: validatedData.featureGroupId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      finalSortOrder = (maxSortOrder?.sortOrder || 0) + 1;
    }

    const featureGroupItem = await prisma.featureGroupItem.create({
      data: {
        featureGroupId: validatedData.featureGroupId,
        featureId: validatedData.featureId,
        sortOrder: finalSortOrder,
        isVisible: validatedData.isVisible
      },
      include: {
        feature: true,
        featureGroup: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: featureGroupItem
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to add feature to group:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add feature to group'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a feature group item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdateFeatureGroupItemSchema, body);

    const featureGroupItem = await prisma.featureGroupItem.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.sortOrder !== undefined && { sortOrder: validatedData.sortOrder }),
        ...(validatedData.isVisible !== undefined && { isVisible: validatedData.isVisible }),
        updatedAt: new Date()
      },
      include: {
        feature: true,
        featureGroup: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: featureGroupItem
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update feature group item:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update feature group item'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Remove a feature from a group
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'number') {
      const response: ApiResponse = {
        success: false,
        message: 'Valid feature group item ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.featureGroupItem.delete({
      where: { id: parseInt(id.toString()) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Feature removed from group successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to remove feature from group:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to remove feature from group'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
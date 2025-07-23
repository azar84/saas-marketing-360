import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { CreateGlobalFeatureSchema, UpdateGlobalFeatureSchema, validateAndTransform, type ApiResponse } from '../../../../lib/validations';

// GET - Fetch all global features
export async function GET() {
  try {
    const features = await prisma.globalFeature.findMany({
      orderBy: {
        sortOrder: 'asc'
      }
    });

    // Transform data to match component expectations
    const transformedFeatures = features.map(feature => ({
      id: feature.id,
      title: feature.name,           // Map name -> title
      description: feature.description,
      iconName: feature.iconUrl,     // Map iconUrl -> iconName
      category: feature.category,
      isVisible: feature.isActive,   // Map isActive -> isVisible
      sortOrder: feature.sortOrder,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt
    }));

    const response: ApiResponse = {
      success: true,
      data: transformedFeatures
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch features:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch features'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create a new global feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreateGlobalFeatureSchema, body);

    // If no sortOrder provided, set it to the next available number
    let finalSortOrder = validatedData.sortOrder;
    if (!finalSortOrder) {
      const maxSortOrder = await prisma.globalFeature.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      finalSortOrder = (maxSortOrder?.sortOrder || 0) + 1;
    }

    const feature = await prisma.globalFeature.create({
      data: {
        name: validatedData.title,
        description: validatedData.description,
        iconUrl: validatedData.iconName,
        category: validatedData.category,
        sortOrder: finalSortOrder,
        isActive: validatedData.isVisible
      }
    });

    const response: ApiResponse = {
      success: true,
      data: feature
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create feature:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create feature'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a global feature
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdateGlobalFeatureSchema, body);

    const feature = await prisma.globalFeature.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.title !== undefined && { name: validatedData.title }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.iconName !== undefined && { iconUrl: validatedData.iconName }),
        ...(validatedData.category !== undefined && { category: validatedData.category }),
        ...(validatedData.sortOrder !== undefined && { sortOrder: validatedData.sortOrder }),
        ...(validatedData.isVisible !== undefined && { isActive: validatedData.isVisible }),
        updatedAt: new Date()
      }
    });

    const response: ApiResponse = {
      success: true,
      data: feature
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update feature:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update feature'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete a global feature
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'number') {
      const response: ApiResponse = {
        success: false,
        message: 'Valid feature ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.globalFeature.delete({
      where: { id: parseInt(id.toString()) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Feature deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete feature:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete feature'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 
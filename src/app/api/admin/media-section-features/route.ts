import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { 
  CreateMediaSectionFeatureSchema, 
  UpdateMediaSectionFeatureSchema, 
  validateAndTransform, 
  type ApiResponse 
} from '../../../../lib/validations';

// GET - Fetch media section features (optionally filtered by mediaSectionId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaSectionId = searchParams.get('mediaSectionId');

    const features = await prisma.mediaSectionFeature.findMany({
      where: mediaSectionId ? { mediaSectionId: parseInt(mediaSectionId) } : undefined,
      include: {
        mediaSection: {
          select: {
            id: true,
            headline: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { mediaSectionId: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    const response: ApiResponse = {
      success: true,
      data: features
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch media section features:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch media section features'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create a new media section feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreateMediaSectionFeatureSchema, body);

    // Check if media section exists
    const mediaSection = await prisma.mediaSection.findUnique({
      where: { id: validatedData.mediaSectionId }
    });

    if (!mediaSection) {
      const response: ApiResponse = {
        success: false,
        message: 'Media section not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const feature = await prisma.mediaSectionFeature.create({
      data: validatedData,
      include: {
        mediaSection: {
          select: {
            id: true,
            headline: true,
            isActive: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: feature
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create media section feature:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create media section feature'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a media section feature
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdateMediaSectionFeatureSchema, body);

    // Check if feature exists
    const existingFeature = await prisma.mediaSectionFeature.findUnique({
      where: { id: validatedData.id }
    });

    if (!existingFeature) {
      const response: ApiResponse = {
        success: false,
        message: 'Media section feature not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const { id, ...updateData } = validatedData;

    const feature = await prisma.mediaSectionFeature.update({
      where: { id },
      data: updateData,
      include: {
        mediaSection: {
          select: {
            id: true,
            headline: true,
            isActive: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: feature
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update media section feature:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update media section feature'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete a media section feature
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'Valid feature ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if feature exists
    const existingFeature = await prisma.mediaSectionFeature.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingFeature) {
      const response: ApiResponse = {
        success: false,
        message: 'Media section feature not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    await prisma.mediaSectionFeature.delete({
      where: { id: parseInt(id) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Media section feature deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete media section feature:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete media section feature'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 
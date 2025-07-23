import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { 
  CreateMediaSectionSchema, 
  UpdateMediaSectionSchema, 
  validateAndTransform, 
  type ApiResponse 
} from '../../../../lib/validations';

// GET - Fetch all media sections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const mediaSections = await prisma.mediaSection.findMany({
      include: {
        features: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    const response: ApiResponse = {
      success: true,
      data: mediaSections
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch media sections:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch media sections'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create a new media section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreateMediaSectionSchema, body);
    
    // Extract features from the validated data
    const { features, ...mediaSectionData } = validatedData;

    const mediaSection = await prisma.mediaSection.create({
      data: {
        ...mediaSectionData,
        features: features && features.length > 0 ? {
          create: features.map((feature: any, index: number) => ({
            ...feature,
            sortOrder: feature.sortOrder ?? index
          }))
        } : undefined
      },
      include: {
        features: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: mediaSection
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create media section:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create media section'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a media section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdateMediaSectionSchema, body);

    // Check if media section exists
    const existingSection = await prisma.mediaSection.findUnique({
      where: { id: validatedData.id }
    });

    if (!existingSection) {
      const response: ApiResponse = {
        success: false,
        message: 'Media section not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const { id, features, ...updateData } = validatedData;

    // Use a transaction to update the media section and its features
    const mediaSection = await prisma.$transaction(async (tx) => {
      // Update the media section
      const updatedSection = await tx.mediaSection.update({
      where: { id },
      data: updateData,
      include: {
        features: {
          orderBy: { sortOrder: 'asc' }
        }
      }
      });

      // Handle features update
      if (features !== undefined) {
        // Delete existing features
        await tx.mediaSectionFeature.deleteMany({
          where: { mediaSectionId: id }
        });

        // Create new features if provided
        if (features && features.length > 0) {
          await tx.mediaSectionFeature.createMany({
            data: features.map((feature: any, index: number) => ({
              ...feature,
              mediaSectionId: id,
              sortOrder: feature.sortOrder ?? index
            }))
          });
        }

        // Fetch updated section with new features
        return await tx.mediaSection.findUnique({
          where: { id },
          include: {
            features: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        });
      }

      return updatedSection;
    });

    const response: ApiResponse = {
      success: true,
      data: mediaSection
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update media section:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update media section'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete a media section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'Valid media section ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if media section exists
    const existingSection = await prisma.mediaSection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSection) {
      const response: ApiResponse = {
        success: false,
        message: 'Media section not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Delete the media section (features will be cascade deleted)
    await prisma.mediaSection.delete({
      where: { id: parseInt(id) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Media section deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete media section:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete media section'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 
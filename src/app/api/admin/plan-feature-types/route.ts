import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for plan feature type
const PlanFeatureTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  unit: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  iconUrl: z.string().optional(),
  dataType: z.enum(['number', 'boolean', 'text']).default('number'),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

// GET - Fetch all plan feature types
export async function GET() {
  try {
    const featureTypes = await prisma.planFeatureType.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        limits: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json(featureTypes);
  } catch (error) {
    console.error('Error fetching plan feature types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan feature types' },
      { status: 500 }
    );
  }
}

// POST - Create new plan feature type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = PlanFeatureTypeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if name already exists
    const existingFeatureType = await prisma.planFeatureType.findFirst({
      where: { name: data.name }
    });

    if (existingFeatureType) {
      return NextResponse.json(
        { error: 'Feature type with this name already exists' },
        { status: 400 }
      );
    }

    const featureType = await prisma.planFeatureType.create({
      data,
      include: {
        limits: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json(featureType, { status: 201 });
  } catch (error) {
    console.error('Error creating plan feature type:', error);
    return NextResponse.json(
      { error: 'Failed to create plan feature type' },
      { status: 500 }
    );
  }
}

// PUT - Update plan feature type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Feature type ID is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid feature type ID format' },
        { status: 400 }
      );
    }

    const validation = PlanFeatureTypeSchema.partial().safeParse(updateData);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if new name conflicts with existing feature type
    if (data.name) {
      const existingFeatureType = await prisma.planFeatureType.findFirst({
        where: { 
          name: data.name,
          id: { not: id }
        }
      });

      if (existingFeatureType) {
        return NextResponse.json(
          { error: 'Feature type with this name already exists' },
          { status: 400 }
        );
      }
    }

    const featureType = await prisma.planFeatureType.update({
      where: { id },
      data,
      include: {
        limits: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json(featureType);
  } catch (error) {
    console.error('Error updating plan feature type:', error);
    return NextResponse.json(
      { error: 'Failed to update plan feature type' },
      { status: 500 }
    );
  }
}

// DELETE - Delete plan feature type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Feature type ID is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid feature type ID format' },
        { status: 400 }
      );
    }

    // Check if feature type has associated limits
    const existingLimits = await prisma.planFeatureLimit.findFirst({
      where: { featureTypeId: id }
    });

    if (existingLimits) {
      return NextResponse.json(
        { error: 'Cannot delete feature type that has plan limits. Remove limits first.' },
        { status: 400 }
      );
    }

    await prisma.planFeatureType.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Feature type deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan feature type:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan feature type' },
      { status: 500 }
    );
  }
} 
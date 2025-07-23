import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const createSharedFeatureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().optional(),
  category: z.string().optional(),
});

const updateSharedFeatureSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
});

export async function GET() {
  try {
    const sharedFeatures = await prisma.sharedFeature.findMany({
      orderBy: { name: 'asc' },
      include: {
        usedIn: {
          include: {
            plan: true,
          },
        },
      },
    });

    return NextResponse.json(sharedFeatures);
  } catch (error) {
    console.error('Error fetching shared features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared features' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSharedFeatureSchema.parse(body);

    const sharedFeature = await prisma.sharedFeature.create({
      data,
      include: {
        usedIn: {
          include: {
            plan: true,
          },
        },
      },
    });

    return NextResponse.json(sharedFeature, { status: 201 });
  } catch (error) {
    console.error('Error creating shared feature:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create shared feature' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Shared feature ID is required' },
        { status: 400 }
      );
    }

    const data = updateSharedFeatureSchema.parse(updateData);

    const sharedFeature = await prisma.sharedFeature.update({
      where: { id },
      data,
      include: {
        usedIn: {
          include: {
            plan: true,
          },
        },
      },
    });

    return NextResponse.json(sharedFeature);
  } catch (error) {
    console.error('Error updating shared feature:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update shared feature' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Shared feature ID is required' },
        { status: 400 }
      );
    }

    await prisma.sharedFeature.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shared feature:', error);
    return NextResponse.json(
      { error: 'Failed to delete shared feature' },
      { status: 500 }
    );
  }
} 
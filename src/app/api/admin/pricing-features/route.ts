import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createFeatureSchema = z.object({
  name: z.string().min(1, 'Feature name is required'),
  icon: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  position: z.number().default(0),
  isActive: z.boolean().default(true),
});

const updateFeatureSchema = z.object({
  name: z.string().min(1, 'Feature name is required').optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  position: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const features = await prisma.basicFeature.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching pricing features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing features' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createFeatureSchema.parse(body);

    const feature = await prisma.basicFeature.create({
      data: {
        name: data.name,
        description: data.description,
        sortOrder: data.position,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating pricing feature:', error);
    return NextResponse.json(
      { error: 'Failed to create pricing feature' },
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
        { error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    const data = updateFeatureSchema.parse(updateData);

    const feature = await prisma.basicFeature.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        sortOrder: data.position,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(feature);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating pricing feature:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing feature' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    await prisma.basicFeature.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing feature:', error);
    return NextResponse.json(
      { error: 'Failed to delete pricing feature' },
      { status: 500 }
    );
  }
} 
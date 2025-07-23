import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const createPlanFeatureSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  featureId: z.string().optional(), // Optional for custom features
  available: z.boolean().default(true),
  label: z.string().optional(), // For custom features
  icon: z.string().optional(), // For custom features
});

const updatePlanFeatureSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required').optional(),
  featureId: z.string().optional(),
  available: z.boolean().optional(),
  label: z.string().optional(),
  icon: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const planId = url.searchParams.get('planId');

    let whereClause = {};
    if (planId) {
      whereClause = { planId };
    }

    const planFeatures = await prisma.planFeature.findMany({
      where: whereClause,
      include: {
        plan: true,
        feature: true, // Shared feature (can be null for custom features)
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(planFeatures);
  } catch (error) {
    console.error('Error fetching plan features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan features' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPlanFeatureSchema.parse(body);

    // Validate that either featureId exists OR we have custom feature data
    if (!data.featureId && !data.label) {
      return NextResponse.json(
        { error: 'Either featureId (for shared feature) or label (for custom feature) is required' },
        { status: 400 }
      );
    }

    // If using shared feature, validate it exists
    if (data.featureId) {
      const sharedFeature = await prisma.sharedFeature.findUnique({
        where: { id: data.featureId },
      });
      if (!sharedFeature) {
        return NextResponse.json(
          { error: 'Shared feature not found' },
          { status: 404 }
        );
      }
    }

    const planFeature = await prisma.planFeature.create({
      data,
      include: {
        plan: true,
        feature: true,
      },
    });

    return NextResponse.json(planFeature, { status: 201 });
  } catch (error) {
    console.error('Error creating plan feature:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create plan feature' },
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
        { error: 'Plan feature ID is required' },
        { status: 400 }
      );
    }

    const data = updatePlanFeatureSchema.parse(updateData);

    // If updating featureId, validate it exists
    if (data.featureId) {
      const sharedFeature = await prisma.sharedFeature.findUnique({
        where: { id: data.featureId },
      });
      if (!sharedFeature) {
        return NextResponse.json(
          { error: 'Shared feature not found' },
          { status: 404 }
        );
      }
    }

    const planFeature = await prisma.planFeature.update({
      where: { id },
      data,
      include: {
        plan: true,
        feature: true,
      },
    });

    return NextResponse.json(planFeature);
  } catch (error) {
    console.error('Error updating plan feature:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update plan feature' },
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
        { error: 'Plan feature ID is required' },
        { status: 400 }
      );
    }

    await prisma.planFeature.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan feature:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan feature' },
      { status: 500 }
    );
  }
} 
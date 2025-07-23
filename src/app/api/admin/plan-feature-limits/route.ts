import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for plan feature limit
const PlanFeatureLimitSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  featureTypeId: z.string().uuid('Invalid feature type ID'),
  value: z.string().default(''),
  isUnlimited: z.boolean().default(false),
});

// GET - Fetch all plan feature limits (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const featureTypeId = searchParams.get('featureTypeId');

    const where: any = {};
    if (planId) where.planId = planId;
    if (featureTypeId) where.featureTypeId = featureTypeId;

    const limits = await prisma.planFeatureLimit.findMany({
      where,
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        featureType: {
          select: {
            id: true,
            name: true,
            unit: true,
            description: true,
            icon: true,
            dataType: true,
            sortOrder: true,
          }
        }
      },
      orderBy: [
        { featureType: { sortOrder: 'asc' } },
        { featureType: { name: 'asc' } },
        { plan: { position: 'asc' } },
        { plan: { name: 'asc' } }
      ]
    });

    return NextResponse.json(limits);
  } catch (error) {
    console.error('Error fetching plan feature limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan feature limits' },
      { status: 500 }
    );
  }
}

// POST - Create new plan feature limit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = PlanFeatureLimitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if feature type exists
    const featureType = await prisma.planFeatureType.findUnique({
      where: { id: data.featureTypeId }
    });

    if (!featureType) {
      return NextResponse.json(
        { error: 'Feature type not found' },
        { status: 404 }
      );
    }

    // Check if limit already exists for this plan+feature combination
    const existingLimit = await prisma.planFeatureLimit.findUnique({
      where: {
        planId_featureTypeId: {
          planId: data.planId,
          featureTypeId: data.featureTypeId
        }
      }
    });

    if (existingLimit) {
      return NextResponse.json(
        { error: 'Limit already exists for this plan and feature type' },
        { status: 400 }
      );
    }

    const limit = await prisma.planFeatureLimit.create({
      data,
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        featureType: {
          select: {
            id: true,
            name: true,
            unit: true,
            description: true,
            icon: true,
            dataType: true,
            sortOrder: true,
          }
        }
      }
    });

    return NextResponse.json(limit, { status: 201 });
  } catch (error) {
    console.error('Error creating plan feature limit:', error);
    return NextResponse.json(
      { error: 'Failed to create plan feature limit' },
      { status: 500 }
    );
  }
}

// PUT - Update plan feature limit
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Limit ID is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid limit ID format' },
        { status: 400 }
      );
    }

    const validation = PlanFeatureLimitSchema.partial().safeParse(updateData);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // If plan or feature type is being changed, validate they exist
    if (data.planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: data.planId }
      });

      if (!plan) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        );
      }
    }

    if (data.featureTypeId) {
      const featureType = await prisma.planFeatureType.findUnique({
        where: { id: data.featureTypeId }
      });

      if (!featureType) {
        return NextResponse.json(
          { error: 'Feature type not found' },
          { status: 404 }
        );
      }
    }

    // If both planId and featureTypeId are being changed, check for conflicts
    if (data.planId && data.featureTypeId) {
      const existingLimit = await prisma.planFeatureLimit.findFirst({
        where: {
          planId: data.planId,
          featureTypeId: data.featureTypeId,
          id: { not: id }
        }
      });

      if (existingLimit) {
        return NextResponse.json(
          { error: 'Limit already exists for this plan and feature type combination' },
          { status: 400 }
        );
      }
    }

    const limit = await prisma.planFeatureLimit.update({
      where: { id },
      data,
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        featureType: {
          select: {
            id: true,
            name: true,
            unit: true,
            description: true,
            icon: true,
            dataType: true,
            sortOrder: true,
          }
        }
      }
    });

    return NextResponse.json(limit);
  } catch (error) {
    console.error('Error updating plan feature limit:', error);
    return NextResponse.json(
      { error: 'Failed to update plan feature limit' },
      { status: 500 }
    );
  }
}

// DELETE - Delete plan feature limit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Limit ID is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid limit ID format' },
        { status: 400 }
      );
    }

    await prisma.planFeatureLimit.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Plan feature limit deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan feature limit:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan feature limit' },
      { status: 500 }
    );
  }
} 
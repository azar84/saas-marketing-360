import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const createPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  ctaText: z.string().min(1, 'CTA text is required').default('Get Started'),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
});

const updatePlanSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  ctaText: z.string().min(1, 'CTA text is required').optional(),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
});

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { position: 'asc' },
      include: {
        pricing: {
          include: {
            billingCycle: true,
          },
        },
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPlanSchema.parse(body);

    // If setting as popular, unset other popular plans
    if (data.isPopular) {
      await prisma.plan.updateMany({
        where: { isPopular: true },
        data: { isPopular: false },
      });
    }

    const plan = await prisma.plan.create({
      data,
      include: {
        pricing: {
          include: {
            billingCycle: true,
          },
        },
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create plan' },
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
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const data = updatePlanSchema.parse(updateData);

    // If setting as popular, unset other popular plans
    if (data.isPopular) {
      await prisma.plan.updateMany({
        where: { 
          isPopular: true,
          id: { not: id }
        },
        data: { isPopular: false },
      });
    }

    const plan = await prisma.plan.update({
      where: { id },
      data,
      include: {
        pricing: {
          include: {
            billingCycle: true,
          },
        },
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error updating plan:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update plan' },
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
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
} 
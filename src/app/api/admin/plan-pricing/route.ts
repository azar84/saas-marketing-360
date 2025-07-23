import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const createPlanPricingSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  billingCycleId: z.string().min(1, 'Billing cycle ID is required'),
  priceCents: z.number().int().min(0, 'Price must be positive'),
  stripePriceId: z.string().optional(),
  ctaUrl: z.string().refine((val) => val === '' || z.string().url().safeParse(val).success, {
    message: 'CTA URL must be empty or a valid URL'
  }).optional(),
});

const updatePlanPricingSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required').optional(),
  billingCycleId: z.string().min(1, 'Billing cycle ID is required').optional(),
  priceCents: z.number().int().min(0, 'Price must be positive').optional(),
  stripePriceId: z.string().optional(),
  ctaUrl: z.string().refine((val) => val === '' || z.string().url().safeParse(val).success, {
    message: 'CTA URL must be empty or a valid URL'
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const planId = url.searchParams.get('planId');

    let whereClause = {};
    if (planId) {
      whereClause = { planId };
    }

    const planPricing = await prisma.planPricing.findMany({
      where: whereClause,
      include: {
        plan: true,
        billingCycle: true,
      },
      orderBy: [
        { plan: { position: 'asc' } },
        { billingCycle: { multiplier: 'asc' } },
      ],
    });

    return NextResponse.json(planPricing);
  } catch (error) {
    console.error('Error fetching plan pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan pricing' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPlanPricingSchema.parse(body);

    // Check if pricing already exists for this plan + billing cycle
    const existingPricing = await prisma.planPricing.findUnique({
      where: {
        planId_billingCycleId: {
          planId: data.planId,
          billingCycleId: data.billingCycleId,
        },
      },
    });

    if (existingPricing) {
      return NextResponse.json(
        { error: 'Pricing already exists for this plan and billing cycle' },
        { status: 409 }
      );
    }

    const planPricing = await prisma.planPricing.create({
      data,
      include: {
        plan: true,
        billingCycle: true,
      },
    });

    return NextResponse.json(planPricing, { status: 201 });
  } catch (error) {
    console.error('Error creating plan pricing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create plan pricing' },
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
        { error: 'Plan pricing ID is required' },
        { status: 400 }
      );
    }

    const data = updatePlanPricingSchema.parse(updateData);

    const planPricing = await prisma.planPricing.update({
      where: { id },
      data,
      include: {
        plan: true,
        billingCycle: true,
      },
    });

    return NextResponse.json(planPricing);
  } catch (error) {
    console.error('Error updating plan pricing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update plan pricing' },
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
        { error: 'Plan pricing ID is required' },
        { status: 400 }
      );
    }

    await prisma.planPricing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan pricing:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan pricing' },
      { status: 500 }
    );
  }
} 
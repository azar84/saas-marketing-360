import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const createSectionPlanSchema = z.object({
  pricingSectionId: z.number(),
  planId: z.string(),
  sortOrder: z.number().default(0),
  isVisible: z.boolean().default(true)
});

const updateSectionPlanSchema = z.object({
  id: z.number(),
  sortOrder: z.number().optional(),
  isVisible: z.boolean().optional()
});

// GET - Fetch pricing section plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pricingSectionId = searchParams.get('pricingSectionId');

    let whereClause = {};
    if (pricingSectionId) {
      whereClause = { pricingSectionId: parseInt(pricingSectionId) };
    }

    const sectionPlans = await prisma.pricingSectionPlan.findMany({
      where: whereClause,
      include: {
        plan: {
          include: {
            pricing: {
              include: {
                billingCycle: true
              }
            },
            features: {
              include: {
                feature: true
              }
            },
            featureLimits: {
              include: {
                featureType: true
              }
            },
            basicFeatures: {
              include: {
                basicFeature: true
              }
            }
          }
        },
        pricingSection: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    return NextResponse.json(sectionPlans);
  } catch (error) {
    console.error('Failed to fetch pricing section plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing section plans' },
      { status: 500 }
    );
  }
}

// POST - Add a plan to a pricing section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSectionPlanSchema.parse(body);

    // Check if the plan is already in this section
    const existingAssignment = await prisma.pricingSectionPlan.findUnique({
      where: {
        pricingSectionId_planId: {
          pricingSectionId: validatedData.pricingSectionId,
          planId: validatedData.planId
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Plan is already assigned to this pricing section' },
        { status: 400 }
      );
    }

    const sectionPlan = await prisma.pricingSectionPlan.create({
      data: validatedData,
      include: {
        plan: {
          include: {
            pricing: {
              include: {
                billingCycle: true
              }
            },
            features: {
              include: {
                feature: true
              }
            },
            featureLimits: {
              include: {
                featureType: true
              }
            },
            basicFeatures: {
              include: {
                basicFeature: true
              }
            }
          }
        },
        pricingSection: true
      }
    });

    return NextResponse.json(sectionPlan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to add plan to pricing section:', error);
    return NextResponse.json(
      { error: 'Failed to add plan to pricing section' },
      { status: 500 }
    );
  }
}

// PUT - Update pricing section plan (order/visibility)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateSectionPlanSchema.parse(body);
    const { id, ...updateData } = validatedData;

    const sectionPlan = await prisma.pricingSectionPlan.update({
      where: { id },
      data: updateData,
      include: {
        plan: {
          include: {
            pricing: {
              include: {
                billingCycle: true
              }
            }
          }
        },
        pricingSection: true
      }
    });

    return NextResponse.json(sectionPlan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update pricing section plan:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing section plan' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a plan from a pricing section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Pricing section plan ID is required' },
        { status: 400 }
      );
    }

    const sectionPlanId = parseInt(id);

    const sectionPlan = await prisma.pricingSectionPlan.findUnique({
      where: { id: sectionPlanId },
      include: {
        plan: true,
        pricingSection: true
      }
    });

    if (!sectionPlan) {
      return NextResponse.json(
        { error: 'Pricing section plan not found' },
        { status: 404 }
      );
    }

    await prisma.pricingSectionPlan.delete({
      where: { id: sectionPlanId }
    });

    return NextResponse.json({ 
      message: 'Plan removed from pricing section successfully',
      deleted: sectionPlan
    });
  } catch (error) {
    console.error('Failed to remove plan from pricing section:', error);
    return NextResponse.json(
      { error: 'Failed to remove plan from pricing section' },
      { status: 500 }
    );
  }
} 
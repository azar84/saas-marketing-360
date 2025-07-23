import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const createPricingSectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  heading: z.string().min(1, 'Heading is required'),
  subheading: z.string().optional(),
  layoutType: z.string().default('standard'),
  pricingCardsBackgroundColor: z.string().optional(),
  comparisonTableBackgroundColor: z.string().optional(),
  isActive: z.boolean().default(true)
});

const updatePricingSectionSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
  heading: z.string().min(1, 'Heading is required'),
  subheading: z.string().optional(),
  layoutType: z.string().default('standard'),
  pricingCardsBackgroundColor: z.string().optional(),
  comparisonTableBackgroundColor: z.string().optional(),
  isActive: z.boolean().default(true)
});

// GET - Fetch all pricing sections
export async function GET() {
  try {
    const pricingSections = await prisma.pricingSection.findMany({
      include: {
        sectionPlans: {
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
            }
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        _count: {
          select: {
            sectionPlans: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(pricingSections);
  } catch (error) {
    console.error('Failed to fetch pricing sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing sections' },
      { status: 500 }
    );
  }
}

// POST - Create a new pricing section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPricingSectionSchema.parse(body);

    const pricingSection = await prisma.pricingSection.create({
      data: validatedData,
      include: {
        sectionPlans: {
          include: {
            plan: {
              include: {
                pricing: {
                  include: {
                    billingCycle: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            sectionPlans: true
          }
        }
      }
    });

    return NextResponse.json(pricingSection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create pricing section:', error);
    return NextResponse.json(
      { error: 'Failed to create pricing section' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing pricing section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updatePricingSectionSchema.parse(body);
    const { id, ...updateData } = validatedData;

    const pricingSection = await prisma.pricingSection.update({
      where: { id },
      data: updateData,
      include: {
        sectionPlans: {
          include: {
            plan: {
              include: {
                pricing: {
                  include: {
                    billingCycle: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            sectionPlans: true
          }
        }
      }
    });

    return NextResponse.json(pricingSection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update pricing section:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing section' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a pricing section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Pricing section ID is required' },
        { status: 400 }
      );
    }

    const pricingSectionId = parseInt(id);

    // Check if pricing section exists
    const existingSection = await prisma.pricingSection.findUnique({
      where: { id: pricingSectionId },
      include: {
        _count: {
          select: {
            sectionPlans: true
          }
        }
      }
    });

    if (!existingSection) {
      return NextResponse.json(
        { error: 'Pricing section not found' },
        { status: 404 }
      );
    }

    // Delete the pricing section (cascade will handle related records)
    await prisma.pricingSection.delete({
      where: { id: pricingSectionId }
    });

    return NextResponse.json({ 
      message: 'Pricing section deleted successfully',
      deleted: existingSection
    });
  } catch (error) {
    console.error('Failed to delete pricing section:', error);
    return NextResponse.json(
      { error: 'Failed to delete pricing section' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const createBillingCycleSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  multiplier: z.number().positive('Multiplier must be positive'),
  isDefault: z.boolean().default(false),
});

const updateBillingCycleSchema = z.object({
  label: z.string().min(1, 'Label is required').optional(),
  multiplier: z.number().positive('Multiplier must be positive').optional(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  try {
    const billingCycles = await prisma.billingCycle.findMany({
      orderBy: { multiplier: 'asc' },
      include: {
        pricing: {
          include: {
            plan: true,
          },
        },
      },
    });

    return NextResponse.json(billingCycles);
  } catch (error) {
    console.error('Error fetching billing cycles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing cycles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createBillingCycleSchema.parse(body);

    // If setting as default, unset other default billing cycles
    if (data.isDefault) {
      await prisma.billingCycle.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const billingCycle = await prisma.billingCycle.create({
      data,
      include: {
        pricing: {
          include: {
            plan: true,
          },
        },
      },
    });

    return NextResponse.json(billingCycle, { status: 201 });
  } catch (error) {
    console.error('Error creating billing cycle:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create billing cycle' },
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
        { error: 'Billing cycle ID is required' },
        { status: 400 }
      );
    }

    const data = updateBillingCycleSchema.parse(updateData);

    // If setting as default, unset other default billing cycles
    if (data.isDefault) {
      await prisma.billingCycle.updateMany({
        where: { 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false },
      });
    }

    const billingCycle = await prisma.billingCycle.update({
      where: { id },
      data,
      include: {
        pricing: {
          include: {
            plan: true,
          },
        },
      },
    });

    return NextResponse.json(billingCycle);
  } catch (error) {
    console.error('Error updating billing cycle:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update billing cycle' },
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
        { error: 'Billing cycle ID is required' },
        { status: 400 }
      );
    }

    await prisma.billingCycle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting billing cycle:', error);
    return NextResponse.json(
      { error: 'Failed to delete billing cycle' },
      { status: 500 }
    );
  }
} 
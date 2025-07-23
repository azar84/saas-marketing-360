import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const planBasicFeatures = await prisma.planBasicFeature.findMany({
      include: {
        plan: true,
        basicFeature: true
      }
    });
    return NextResponse.json(planBasicFeatures);
  } catch (error) {
    console.error('Error fetching plan basic features:', error);
    return NextResponse.json({ error: 'Failed to fetch plan basic features' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, basicFeatureId } = body;

    if (!planId || !basicFeatureId) {
      return NextResponse.json({ error: 'Plan ID and Basic Feature ID are required' }, { status: 400 });
    }

    // Check if the relationship already exists
    const existing = await prisma.planBasicFeature.findFirst({
      where: {
        planId,
        basicFeatureId
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'This feature is already assigned to this plan' }, { status: 400 });
    }

    const planBasicFeature = await prisma.planBasicFeature.create({
      data: {
        planId,
        basicFeatureId
      },
      include: {
        plan: true,
        basicFeature: true
      }
    });

    return NextResponse.json(planBasicFeature);
  } catch (error) {
    console.error('Error creating plan basic feature:', error);
    return NextResponse.json({ error: 'Failed to create plan basic feature' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.planBasicFeature.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan basic feature:', error);
    return NextResponse.json({ error: 'Failed to delete plan basic feature' }, { status: 500 });
  }
} 
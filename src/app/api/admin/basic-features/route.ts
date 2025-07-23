import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const basicFeatures = await prisma.basicFeature.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json(basicFeatures);
  } catch (error) {
    console.error('Error fetching basic features:', error);
    return NextResponse.json({ error: 'Failed to fetch basic features' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, isActive = true, sortOrder = 0 } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const basicFeature = await prisma.basicFeature.create({
      data: {
        name,
        description: description || '',
        isActive,
        sortOrder
      }
    });

    return NextResponse.json(basicFeature);
  } catch (error) {
    console.error('Error creating basic feature:', error);
    return NextResponse.json({ error: 'Failed to create basic feature' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const basicFeature = await prisma.basicFeature.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder })
      }
    });

    return NextResponse.json(basicFeature);
  } catch (error) {
    console.error('Error updating basic feature:', error);
    return NextResponse.json({ error: 'Failed to update basic feature' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Delete related plan assignments first
    await prisma.planBasicFeature.deleteMany({
      where: { basicFeatureId: id }
    });

    // Delete the basic feature
    await prisma.basicFeature.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting basic feature:', error);
    return NextResponse.json({ error: 'Failed to delete basic feature' }, { status: 500 });
  }
} 
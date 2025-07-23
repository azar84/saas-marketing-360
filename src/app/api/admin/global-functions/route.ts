import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch global functions
export async function GET() {
  try {
    // For now, we'll store this in a simple table
    // You might want to create a dedicated table for this later
    const globalFunctions = await prisma.globalFunctions.findFirst();
    
    return NextResponse.json({
      success: true,
      functions: globalFunctions?.functions || ''
    });
  } catch (error) {
    console.error('Error fetching global functions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch global functions' },
      { status: 500 }
    );
  }
}

// POST - Save global functions
export async function POST(request: NextRequest) {
  try {
    const { functions } = await request.json();
    
    // Upsert global functions
    const result = await prisma.globalFunctions.upsert({
      where: { id: 1 }, // We'll use a single record for global functions
      update: { functions },
      create: { id: 1, functions }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Global functions saved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error saving global functions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save global functions' },
      { status: 500 }
    );
  }
} 
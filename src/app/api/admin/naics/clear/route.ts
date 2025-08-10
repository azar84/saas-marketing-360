import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    console.log('Clearing existing NAICS data...');
    
    // Clear existing data
    await prisma.nAICSClassification.deleteMany();
    
    const count = await prisma.nAICSClassification.count();
    
    return NextResponse.json({
      success: true,
      message: `Successfully cleared NAICS data`,
      count
    });
    
  } catch (error) {
    console.error('Error clearing NAICS data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear NAICS data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

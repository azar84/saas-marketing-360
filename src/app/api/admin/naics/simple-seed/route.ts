import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSimpleNaicsData } from "@/lib/simpleNaics";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    console.log('Starting simple NAICS seeding...');
    
    const industries = getSimpleNaicsData();
    
    // Clear existing data
    await prisma.nAICSClassification.deleteMany();
    
    // Insert industries
    const insertData = industries.map(industry => ({
      code: industry.code,
      title: industry.title,
      level: 'national_industry',
      parentCode: null,
      isActive: true
    }));
    
    await prisma.nAICSClassification.createMany({
      data: insertData
    });
    
    const count = await prisma.nAICSClassification.count();
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${count} industries`,
      count
    });
    
  } catch (error) {
    console.error('Error seeding industries:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to seed industries',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.nAICSClassification.count();
    
    return NextResponse.json({
      success: true,
      count,
      is_seeded: count > 0
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check status' }, 
      { status: 500 }
    );
  }
}

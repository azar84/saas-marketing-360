import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCompleteNaicsData } from "@/lib/completeNaics2022";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    console.log('Starting comprehensive NAICS seeding...');
    
    const industries = getCompleteNaicsData();
    
    // Clear existing data
    await prisma.nAICSClassification.deleteMany();
    
    // Sort industries by hierarchy level to insert parents before children
    const levelOrder = ["sector", "subsector", "industry_group", "industry", "national_industry"];
    const sortedIndustries = industries.sort((a, b) => {
      const aLevel = levelOrder.indexOf(a.level);
      const bLevel = levelOrder.indexOf(b.level);
      if (aLevel !== bLevel) return aLevel - bLevel;
      return a.code.localeCompare(b.code);
    });
    
    // Insert industries one by one to handle foreign key constraints
    let totalInserted = 0;
    
    for (const industry of sortedIndustries) {
      try {
        await prisma.nAICSClassification.create({
          data: {
            code: industry.code,
            title: industry.title,
            level: industry.level,
            parentCode: industry.parentCode,
            isActive: industry.isActive
          }
        });
        totalInserted++;
        
        if (totalInserted % 10 === 0) {
          console.log(`Inserted ${totalInserted} industries so far...`);
        }
      } catch (error) {
        console.error(`Error inserting industry ${industry.code}:`, error);
        // Continue with the rest
      }
    }
    
    const count = await prisma.nAICSClassification.count();
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${count} comprehensive industry classifications`,
      count,
      details: {
        total_processed: industries.length,
        total_inserted: totalInserted,
        final_count: count
      }
    });
    
  } catch (error) {
    console.error('Error seeding comprehensive industries:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to seed comprehensive industries',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.nAICSClassification.count();
    
    // Get counts by level
    const levelCounts = await prisma.nAICSClassification.groupBy({
      by: ['level'],
      _count: {
        level: true
      }
    });
    
    const levelStats = levelCounts.reduce((acc, curr) => {
      acc[curr.level] = curr._count.level;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      success: true,
      count,
      is_seeded: count > 0,
      level_breakdown: levelStats
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check status' }, 
      { status: 500 }
    );
  }
}

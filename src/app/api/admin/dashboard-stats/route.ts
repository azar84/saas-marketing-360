import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import type { ApiResponse } from '../../../../lib/api';

interface DashboardStats {
  totalPages: number;
  heroSections: number;
  features: number;
  pricingPlans: number;
  pagesGrowth: number;
  heroSectionsGrowth: number;
  featuresGrowth: number;
  pricingPlansGrowth: number;
}

export async function GET() {
  try {
    // Get current counts
    const [
      totalPages,
      heroSections,
      features,
      pricingPlans
    ] = await Promise.all([
      prisma.page.count(),
      prisma.heroSection.count(),
      prisma.globalFeature.count(),
      prisma.plan.count()
    ]);

    // For now, we'll use mock growth percentages
    // In a real app, you'd calculate these from historical data
    const stats: DashboardStats = {
      totalPages,
      heroSections,
      features,
      pricingPlans,
      pagesGrowth: 12, // Mock growth percentage
      heroSectionsGrowth: 8,
      featuresGrowth: 24,
      pricingPlansGrowth: 0 // No growth for pricing plans
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: 'Failed to fetch dashboard statistics'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 
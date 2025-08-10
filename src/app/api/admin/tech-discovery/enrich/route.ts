import { NextRequest, NextResponse } from 'next/server';
import { builtWithAPI } from '@/lib/builtwith';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companies } = body;

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Companies array is required' },
        { status: 400 }
      );
    }

    // Limit the number of companies to enrich to prevent abuse
    const maxCompanies = 50;
    const companiesToEnrich = companies.slice(0, maxCompanies);

    if (companies.length > maxCompanies) {
      console.warn(`Enrichment request limited to ${maxCompanies} companies out of ${companies.length} requested`);
    }

    // Enrich companies with tech stack information
    const enrichedCompanies = await builtWithAPI.enrichCompanies(
      companiesToEnrich.map(domain => ({ domain }))
    );

    return NextResponse.json({
      success: true,
      data: enrichedCompanies,
      message: `Enriched ${enrichedCompanies.length} companies`
    });

  } catch (error) {
    console.error('Tech discovery enrichment error:', error);
    
    // Handle specific BuiltWith API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { success: false, message: 'BuiltWith API key is invalid or missing' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { success: false, message: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Failed to enrich companies' },
      { status: 500 }
    );
  }
}

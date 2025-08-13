import { NextRequest, NextResponse } from 'next/server';
import { EnrichmentEngine } from '@/lib/enrichment/engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'example.com';
    
    console.log(`🧪 Testing enrichment API for domain: ${domain}`);
    
    const engine = new EnrichmentEngine();
    
    // Test the enrichment workflow
    const result = await engine.enrichCompany({
      domain,
      priority: 'high'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Enrichment test completed',
      testDomain: domain,
      result: {
        status: result.status,
        progress: result.progress,
        companyName: result.data?.companyName || null,
        industry: result.data?.business?.industry || null,
        description: result.data?.description ? result.data.description.substring(0, 100) + '...' : null,
        contactEmail: result.data?.contact?.email || null,
        contactPhone: result.data?.contact?.phone || null,
        technologies: result.data?.technology?.platforms?.length || 0,
        duration: result.duration || null
      }
    });
    
  } catch (error) {
    console.error('Enrichment test API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Enrichment test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

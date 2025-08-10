import { NextResponse } from "next/server";
import { buildCanonicalNaicsData } from "@/lib/buildCanonicalNaics";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function GET() {
  try {
    console.log('Starting NAICS data build...');
    const startTime = Date.now();
    
    const data = await buildCanonicalNaicsData();
    
    const duration = Date.now() - startTime;
    console.log(`NAICS data build completed in ${duration}ms`);
    console.log(`Classifications: ${data.classifications.length}, Aliases: ${data.aliases.length}, Changes: ${data.changes.length}`);
    
    return NextResponse.json({
      success: true,
      data,
      metadata: {
        classifications_count: data.classifications.length,
        aliases_count: data.aliases.length,
        changes_count: data.changes.length,
        generated_at: new Date().toISOString(),
        processing_time_ms: duration
      }
    });
  } catch (error) {
    console.error('Error building NAICS data:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to build NAICS data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

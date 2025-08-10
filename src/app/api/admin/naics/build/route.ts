import { NextResponse } from "next/server";
import { buildCanonicalNaicsXlsx } from "@/lib/buildCanonicalNaics";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function GET() {
  try {
    console.log('Starting NAICS Excel build...');
    const startTime = Date.now();
    
    const buf = await buildCanonicalNaicsXlsx();
    
    const duration = Date.now() - startTime;
    console.log(`NAICS Excel build completed in ${duration}ms`);
    
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="naics_canonical_2022.xlsx"',
        "Cache-Control": "no-store",
        "Content-Length": buf.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error building NAICS Excel:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to build NAICS Excel file',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST() {
  // Same as GET for convenience
  return GET();
}

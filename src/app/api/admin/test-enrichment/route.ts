import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🧪 Test enrichment endpoint called with:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint received data',
      received: body
    });
  } catch (error) {
    console.error('❌ Test enrichment endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

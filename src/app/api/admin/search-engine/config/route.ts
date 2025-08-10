import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_CUSTOM_SEARCH_API_KEY || '',
      searchEngineId: process.env.NEXT_PUBLIC_GOOGLE_CSE_ID || '',
      hasCredentials: !!(process.env.NEXT_PUBLIC_GOOGLE_CUSTOM_SEARCH_API_KEY && process.env.NEXT_PUBLIC_GOOGLE_CSE_ID)
    };

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error: any) {
    console.error('Config API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get configuration',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

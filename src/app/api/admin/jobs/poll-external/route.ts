/**
 * Poll External API Endpoint
 * Proxies external API calls to avoid CORS issues and handle authentication
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { jobId, pollUrl } = await request.json();

    if (!jobId || !pollUrl) {
      return NextResponse.json(
        { success: false, error: 'Job ID and pollUrl are required' },
        { status: 400 }
      );
    }

    // Construct full URL
    const baseUrl = process.env.MARKETING_MCP_API_URL || 'https://marketing-mcp-beta.vercel.app';
    const fullPollUrl = pollUrl.startsWith('http') ? pollUrl : `${baseUrl}${pollUrl}`;

    // Call external API (no bypass token needed)
    const response = await fetch(fullPollUrl);


    if (response.ok) {
      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        data
      });
    } else {
      const errorText = await response.text();
      
      return NextResponse.json({
        success: false,
        error: `External API error: ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

  } catch (error) {
    console.error('Error polling external API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to poll external API' },
      { status: 500 }
    );
  }
}

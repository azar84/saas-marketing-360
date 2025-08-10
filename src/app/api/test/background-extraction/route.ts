import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test the background extraction API
    const testData = {
      searchResults: [
        {
          title: "Test Company 1",
          link: "https://example1.com",
          snippet: "A test company for background extraction testing"
        },
        {
          title: "Test Company 2", 
          link: "https://example2.com",
          snippet: "Another test company for background extraction testing"
        }
      ],
      industry: "Technology",
      location: "San Francisco",
      city: "San Francisco",
      stateProvince: "CA",
      country: "USA",
      minConfidence: 0.7,
      saveToDirectory: false,
      jobId: `test-${Date.now()}`
    };

    const response = await fetch(`${request.nextUrl.origin}/api/admin/industry-search/background-extraction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      testData,
      result,
      message: 'Background extraction test completed'
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

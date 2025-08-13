import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Simple enrichment test for domain: ${body.domain}`);

    // Simulate enrichment process
    const mockResult = {
      domain: body.domain,
      status: 'completed',
      progress: 100,
      startedAt: new Date(),
      completedAt: new Date(),
      sources: {
        website: true,
        googleSearch: false,
        builtWith: false,
        clearbit: false,
        hunter: false,
        linkedin: false
      },
      data: {
        companyName: `Test Company (${body.domain})`,
        description: `This is a test enrichment result for ${body.domain}`,
        website: `https://${body.domain}`,
        contact: {
          email: 'test@example.com',
          phone: '+1-555-0123',
          address: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'Test Country'
          },
          socialMedia: {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: ''
          }
        },
        business: {
          industry: 'Technology',
          sector: 'Software',
          employeeCount: undefined,
          employeeRange: '10-50',
          revenue: 'Unknown',
          funding: [],
          isPublic: false,
          stockSymbol: ''
        },
        technology: {
          platforms: ['Test Platform'],
          tools: ['Test Tool'],
          infrastructure: ['Test Infrastructure'],
          languages: [],
          databases: []
        },
        people: {
          executives: [],
          totalEmployees: undefined,
          keyDepartments: []
        },
        market: {
          targetCustomers: ['Businesses'],
          competitors: [],
          uniqueValue: '',
          keywords: ['test', 'demo', 'enrichment']
        },
        rawData: {
          website: {
            status: 'success',
            title: `Test Company (${body.domain})`,
            description: `Test description for ${body.domain}`,
            technologies: ['Test Tech'],
            lastScraped: new Date()
          },
          googleSearch: null,
          builtWith: undefined,
          clearbit: undefined,
          hunter: undefined,
          linkedin: undefined,
          llm: {
            company: {
              legalName: `Test Company (${body.domain})`,
              industry: 'Technology',
              description: `Test company in technology sector`
            },
            processedAt: new Date(),
            confidence: 0.8
          }
        }
      },
      metadata: {
        totalSources: 1,
        successfulSources: 1,
        confidence: 0.8,
        lastUpdated: new Date(),
        version: '1.0.0'
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Simple enrichment test completed successfully',
      data: mockResult
    });

  } catch (error) {
    console.error('Simple enrichment API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Simple enrichment endpoint is working',
    timestamp: new Date().toISOString(),
    status: 'operational'
  });
}

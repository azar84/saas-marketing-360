import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

// GET /api/admin/newsletter-subscribers - Get all subscribers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const subscribed = searchParams.get('subscribed');
    const exportExcel = searchParams.get('export') === 'excel';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.email = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (subscribed !== null && subscribed !== undefined) {
      where.subscribed = subscribed === 'true';
    }

    if (exportExcel) {
      // Export all subscribers to Excel
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      
      // Prepare data for Excel
      const excelData = subscribers.map((subscriber: any) => ({
        'Email': subscriber.email,
        'Subscribed': subscriber.subscribed ? 'Yes' : 'No',
        'Created Date': subscriber.createdAt.toLocaleDateString(),
        'Updated Date': subscriber.updatedAt.toLocaleDateString(),
        'Created At': subscriber.createdAt.toISOString(),
        'Updated At': subscriber.updatedAt.toISOString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const columnWidths = [
        { wch: 40 }, // Email
        { wch: 12 }, // Subscribed
        { wch: 15 }, // Created Date
        { wch: 15 }, // Updated Date
        { wch: 25 }, // Created At
        { wch: 25 }  // Updated At
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Newsletter Subscribers');

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Return Excel file
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      });
    }

    // Get paginated results
    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.newsletterSubscriber.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter subscribers' },
      { status: 500 }
    );
  }
}

// POST /api/admin/newsletter-subscribers - Subscribe email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if subscriber already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingSubscriber) {
      // Update existing subscriber to subscribed
      const updatedSubscriber = await prisma.newsletterSubscriber.update({
        where: { id: existingSubscriber.id },
        data: { subscribed: true, updatedAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        data: updatedSubscriber,
        message: 'Email resubscribed successfully'
      });
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        subscribed: true
      }
    });

    return NextResponse.json({
      success: true,
      data: subscriber,
      message: 'Email subscribed successfully'
    });

  } catch (error) {
    console.error('Error subscribing email:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe email' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/newsletter-subscribers - Update subscriber
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, subscribed } = body;

    if (id === undefined || subscribed === undefined) {
      return NextResponse.json(
        { error: 'ID and subscribed status are required' },
        { status: 400 }
      );
    }

    const subscriber = await prisma.newsletterSubscriber.update({
      where: { id: parseInt(id) },
      data: { subscribed, updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: subscriber,
      message: 'Subscriber updated successfully'
    });

  } catch (error) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/newsletter-subscribers - Delete subscriber
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscriber.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
} 
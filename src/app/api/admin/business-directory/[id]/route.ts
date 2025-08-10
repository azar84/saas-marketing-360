import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch single business directory entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const businessId = parseInt(id);
    
    if (isNaN(businessId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const business = await prisma.businessDirectory.findUnique({
      where: { id: businessId },
      include: {
        contactPerson: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            email: true,
            phone: true
          }
        },
        industries: {
          include: {
            industry: {
              select: {
                id: true,
                label: true
              }
            }
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business directory entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: business
    });

  } catch (error) {
    console.error('Error fetching business directory entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business directory entry' },
      { status: 500 }
    );
  }
}

// PUT - Update business directory entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const businessId = parseInt(id);
    
    if (isNaN(businessId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { website, companyName, city, stateProvince, country, phoneNumber, email, employeesCount, contactPersonId, isActive } = body;

    // Check if business exists
    const existingBusiness = await prisma.businessDirectory.findUnique({
      where: { id: businessId }
    });

    if (!existingBusiness) {
      return NextResponse.json(
        { success: false, error: 'Business directory entry not found' },
        { status: 404 }
      );
    }

    // If website is being updated, check for duplicates
    if (website && website !== existingBusiness.website) {
      const duplicateWebsite = await prisma.businessDirectory.findUnique({
        where: { website }
      });

      if (duplicateWebsite) {
        return NextResponse.json(
          { success: false, error: 'A business with this website already exists' },
          { status: 400 }
        );
      }
    }

    // Update business entry
    const updatedBusiness = await prisma.businessDirectory.update({
      where: { id: businessId },
      data: {
        website,
        companyName,
        city,
        stateProvince,
        country,
        phoneNumber,
        email,
        employeesCount: employeesCount ? parseInt(employeesCount) : null,
        contactPersonId: contactPersonId ? parseInt(contactPersonId) : null,
        isActive
      },
      include: {
        contactPerson: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedBusiness,
      message: 'Business directory entry updated successfully'
    });

  } catch (error) {
    console.error('Error updating business directory entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update business directory entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete business directory entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const businessId = parseInt(id);
    
    if (isNaN(businessId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Check if business exists
    const existingBusiness = await prisma.businessDirectory.findUnique({
      where: { id: businessId }
    });

    if (!existingBusiness) {
      return NextResponse.json(
        { success: false, error: 'Business directory entry not found' },
        { status: 404 }
      );
    }

    // Delete business entry
    await prisma.businessDirectory.delete({
      where: { id: businessId }
    });

    return NextResponse.json({
      success: true,
      message: 'Business directory entry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting business directory entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete business directory entry' },
      { status: 500 }
    );
  }
}

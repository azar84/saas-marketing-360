import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch single contact person
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const contactId = parseInt(id);
    
    if (isNaN(contactId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const contactPerson = await prisma.contactPerson.findUnique({
      where: { id: contactId }
    });

    if (!contactPerson) {
      return NextResponse.json(
        { success: false, error: 'Contact person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contactPerson
    });

  } catch (error) {
    console.error('Error fetching contact person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact person' },
      { status: 500 }
    );
  }
}

// PUT - Update contact person
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const contactId = parseInt(id);
    
    if (isNaN(contactId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, title, email, phone, isActive } = body;

    // Check if contact person exists
    const existingContactPerson = await prisma.contactPerson.findUnique({
      where: { id: contactId }
    });

    if (!existingContactPerson) {
      return NextResponse.json(
        { success: false, error: 'Contact person not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Update contact person
    const updatedContactPerson = await prisma.contactPerson.update({
      where: { id: contactId },
      data: {
        firstName,
        lastName,
        title,
        email,
        phone,
        isActive
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedContactPerson,
      message: 'Contact person updated successfully'
    });

  } catch (error) {
    console.error('Error updating contact person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contact person' },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact person
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const contactId = parseInt(id);
    
    if (isNaN(contactId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Check if contact person exists
    const existingContactPerson = await prisma.contactPerson.findUnique({
      where: { id: contactId }
    });

    if (!existingContactPerson) {
      return NextResponse.json(
        { success: false, error: 'Contact person not found' },
        { status: 404 }
      );
    }

    // Note: Contact persons are no longer directly associated with companies in the new system
    // They can be safely deleted

    // Delete contact person
    await prisma.contactPerson.delete({
      where: { id: contactId }
    });

    return NextResponse.json({
      success: true,
      message: 'Contact person deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact person' },
      { status: 500 }
    );
  }
}

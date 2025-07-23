import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/contact-sections - Get all contact sections
export async function GET() {
  try {
    const contactSections = await prisma.contactSection.findMany({
      include: {
        fields: {
          orderBy: { sortOrder: 'asc' }
        },
        emailSettings: true,
        _count: {
          select: {
            fields: true,
            submissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(contactSections);
  } catch (error) {
    console.error('Error fetching contact sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact sections' },
      { status: 500 }
    );
  }
}

// POST /api/admin/contact-sections - Create new contact section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, heading, subheading, successMessage, errorMessage, isActive } = body;

    if (!name || !heading) {
      return NextResponse.json(
        { error: 'Name and heading are required' },
        { status: 400 }
      );
    }

    const contactSection = await prisma.contactSection.create({
      data: {
        name,
        heading,
        subheading,
        successMessage: successMessage || "Thank you for your message! We'll get back to you soon.",
        errorMessage: errorMessage || "Sorry, there was an error sending your message. Please try again.",
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        fields: {
          orderBy: { sortOrder: 'asc' }
        },
        emailSettings: true,
        _count: {
          select: {
            fields: true,
            submissions: true
          }
        }
      }
    });

    return NextResponse.json(contactSection, { status: 201 });
  } catch (error) {
    console.error('Error creating contact section:', error);
    return NextResponse.json(
      { error: 'Failed to create contact section' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contact-sections - Update contact section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, heading, subheading, successMessage, errorMessage, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Contact section ID is required' },
        { status: 400 }
      );
    }

    if (!name || !heading) {
      return NextResponse.json(
        { error: 'Name and heading are required' },
        { status: 400 }
      );
    }

    const contactSection = await prisma.contactSection.update({
      where: { id: parseInt(id) },
      data: {
        name,
        heading,
        subheading,
        successMessage,
        errorMessage,
        isActive
      },
      include: {
        fields: {
          orderBy: { sortOrder: 'asc' }
        },
        emailSettings: true,
        _count: {
          select: {
            fields: true,
            submissions: true
          }
        }
      }
    });

    return NextResponse.json(contactSection);
  } catch (error) {
    console.error('Error updating contact section:', error);
    return NextResponse.json(
      { error: 'Failed to update contact section' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contact-sections - Delete contact section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Contact section ID is required' },
        { status: 400 }
      );
    }

    // Check if section has submissions
    const sectionWithSubmissions = await prisma.contactSection.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            submissions: true
          }
        }
      }
    });

    if (!sectionWithSubmissions) {
      return NextResponse.json(
        { error: 'Contact section not found' },
        { status: 404 }
      );
    }

    if (sectionWithSubmissions._count.submissions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete contact section that has form submissions. Please archive it instead.' },
        { status: 400 }
      );
    }

    await prisma.contactSection.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Contact section deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact section:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact section' },
      { status: 500 }
    );
  }
} 
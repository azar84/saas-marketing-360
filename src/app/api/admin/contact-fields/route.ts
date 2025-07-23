import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const contactSectionId = searchParams.get('contactSectionId');

    if (id) {
      const field = await prisma.contactField.findUnique({
        where: { id: parseInt(id) },
      });

      if (!field) {
        return NextResponse.json({ error: 'Contact field not found' }, { status: 404 });
      }

      return NextResponse.json(field);
    }

    const where = contactSectionId ? { contactSectionId: parseInt(contactSectionId) } : {};
    
    const fields = await prisma.contactField.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(fields);
  } catch (error) {
    console.error('Error fetching contact fields:', error);
    return NextResponse.json({ error: 'Failed to fetch contact fields' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contactSectionId,
      fieldType,
      fieldName,
      label,
      placeholder,
      helpText,
      isRequired = false,
      fieldWidth = 'full',
      fieldOptions,
      sortOrder = 0
    } = body;

    // Validate required fields
    if (!contactSectionId || !fieldType || !fieldName || !label) {
      return NextResponse.json(
        { error: 'Missing required fields: contactSectionId, fieldType, fieldName, label' },
        { status: 400 }
      );
    }

    // Check if contact section exists
    const contactSection = await prisma.contactSection.findUnique({
      where: { id: contactSectionId }
    });

    if (!contactSection) {
      return NextResponse.json({ error: 'Contact section not found' }, { status: 404 });
    }

    // Check for duplicate field names within the same section
    const existingField = await prisma.contactField.findFirst({
      where: {
        contactSectionId,
        fieldName
      }
    });

    if (existingField) {
      return NextResponse.json(
        { error: 'Field name already exists in this contact section' },
        { status: 400 }
      );
    }

    const field = await prisma.contactField.create({
      data: {
        contactSectionId,
        fieldType,
        fieldName,
        label,
        placeholder: placeholder || null,
        helpText: helpText || null,
        isRequired,
        fieldWidth,
        fieldOptions: fieldOptions || null,
        sortOrder
      },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    console.error('Error creating contact field:', error);
    return NextResponse.json({ error: 'Failed to create contact field' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      contactSectionId,
      fieldType,
      fieldName,
      label,
      placeholder,
      helpText,
      isRequired,
      fieldWidth,
      fieldOptions,
      sortOrder
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Field ID is required' }, { status: 400 });
    }

    // Check if field exists
    const existingField = await prisma.contactField.findUnique({
      where: { id }
    });

    if (!existingField) {
      return NextResponse.json({ error: 'Contact field not found' }, { status: 404 });
    }

    // If fieldName is being changed, check for duplicates
    if (fieldName && fieldName !== existingField.fieldName) {
      const duplicateField = await prisma.contactField.findFirst({
        where: {
          contactSectionId: contactSectionId || existingField.contactSectionId,
          fieldName,
          id: { not: id }
        }
      });

      if (duplicateField) {
        return NextResponse.json(
          { error: 'Field name already exists in this contact section' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (contactSectionId !== undefined) updateData.contactSectionId = contactSectionId;
    if (fieldType !== undefined) updateData.fieldType = fieldType;
    if (fieldName !== undefined) updateData.fieldName = fieldName;
    if (label !== undefined) updateData.label = label;
    if (placeholder !== undefined) updateData.placeholder = placeholder || null;
    if (helpText !== undefined) updateData.helpText = helpText || null;
    if (isRequired !== undefined) updateData.isRequired = isRequired;
    if (fieldWidth !== undefined) updateData.fieldWidth = fieldWidth;
    if (fieldOptions !== undefined) updateData.fieldOptions = fieldOptions || null;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const field = await prisma.contactField.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(field);
  } catch (error) {
    console.error('Error updating contact field:', error);
    return NextResponse.json({ error: 'Failed to update contact field' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Field ID is required' }, { status: 400 });
    }

    const fieldId = parseInt(id);

    // Check if field exists
    const existingField = await prisma.contactField.findUnique({
      where: { id: fieldId }
    });

    if (!existingField) {
      return NextResponse.json({ error: 'Contact field not found' }, { status: 404 });
    }

    await prisma.contactField.delete({
      where: { id: fieldId }
    });

    return NextResponse.json({ message: 'Contact field deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact field:', error);
    return NextResponse.json({ error: 'Failed to delete contact field' }, { status: 500 });
  }
} 
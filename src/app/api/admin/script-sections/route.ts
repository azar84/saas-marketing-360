import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const scriptSections = await prisma.script_sections.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(scriptSections);
  } catch (error) {
    console.error('Error fetching script sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch script sections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, scriptContent, scriptType, placement, isActive, loadAsync, loadDefer, priority } = body;

    // Validate required fields
    if (!name || !scriptContent) {
      return NextResponse.json(
        { error: 'Name and script content are required' },
        { status: 400 }
      );
    }

    // Check if name already exists
    const existingScript = await prisma.script_sections.findUnique({
      where: { name }
    });

    if (existingScript) {
      return NextResponse.json(
        { error: 'A script with this name already exists' },
        { status: 400 }
      );
    }

    const scriptSection = await prisma.script_sections.create({
      data: {
        name,
        description: description || null,
        scriptContent,
        scriptType: scriptType || 'javascript',
        placement: placement || 'footer',
        isActive: isActive ?? true,
        loadAsync: loadAsync ?? false,
        loadDefer: loadDefer ?? false,
        priority: priority ?? 0
      }
    });

    return NextResponse.json({ success: true, data: scriptSection });
  } catch (error) {
    console.error('Error creating script section:', error);
    return NextResponse.json(
      { error: 'Failed to create script section' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, scriptContent, scriptType, placement, isActive, loadAsync, loadDefer, priority } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Script section ID is required' },
        { status: 400 }
      );
    }

    // Check if script section exists
    const existingScript = await prisma.script_sections.findUnique({
      where: { id }
    });

    if (!existingScript) {
      return NextResponse.json(
        { error: 'Script section not found' },
        { status: 404 }
      );
    }

    // Check if name already exists (excluding current script)
    if (name && name !== existingScript.name) {
      const nameExists = await prisma.script_sections.findUnique({
        where: { name }
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'A script with this name already exists' },
          { status: 400 }
        );
      }
    }

    const updatedScript = await prisma.script_sections.update({
      where: { id },
      data: {
        name: name || existingScript.name,
        description: description !== undefined ? description : existingScript.description,
        scriptContent: scriptContent || existingScript.scriptContent,
        scriptType: scriptType || existingScript.scriptType,
        placement: placement || existingScript.placement,
        isActive: isActive !== undefined ? isActive : existingScript.isActive,
        loadAsync: loadAsync !== undefined ? loadAsync : existingScript.loadAsync,
        loadDefer: loadDefer !== undefined ? loadDefer : existingScript.loadDefer,
        priority: priority !== undefined ? priority : existingScript.priority,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, data: updatedScript });
  } catch (error) {
    console.error('Error updating script section:', error);
    return NextResponse.json(
      { error: 'Failed to update script section' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Script section ID is required' },
        { status: 400 }
      );
    }

    const scriptId = parseInt(id);

    // Check if script section exists
    const existingScript = await prisma.script_sections.findUnique({
      where: { id: scriptId }
    });

    if (!existingScript) {
      return NextResponse.json(
        { error: 'Script section not found' },
        { status: 404 }
      );
    }

    await prisma.script_sections.delete({
      where: { id: scriptId }
    });

    return NextResponse.json({ success: true, message: 'Script section deleted successfully' });
  } catch (error) {
    console.error('Error deleting script section:', error);
    return NextResponse.json(
      { error: 'Failed to delete script section' },
      { status: 500 }
    );
  }
} 
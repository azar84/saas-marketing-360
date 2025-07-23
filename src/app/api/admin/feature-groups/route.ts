import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { CreateFeatureGroupSchema, UpdateFeatureGroupSchema, validateAndTransform, type ApiResponse } from '../../../../lib/validations';

// GET - Fetch all feature groups
export async function GET() {
  try {
    console.log('Attempting to fetch feature groups...');
    
    const featureGroups = await prisma.featureGroup.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        layoutType: true,
        backgroundColor: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        items: {
          include: {
            feature: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        pageGroups: {
          include: {
            page: {
              select: {
                id: true,
                slug: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            items: true,
            pageGroups: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found feature groups:', featureGroups.length);
    
    // Debug: Log layout types
    featureGroups.forEach(group => {
      console.log(`Group "${group.name}": layoutType = ${group.layoutType}`);
    });

    // Transform data to match component expectations
    const transformedFeatureGroups = featureGroups.map(group => ({
      id: group.id,
      heading: group.name,          // Map name -> heading for component
      subheading: group.description, // Map description -> subheading for component
      name: group.name,             // Keep name for backward compatibility
      description: group.description, // Keep description for backward compatibility
      layoutType: group.layoutType,
      backgroundColor: group.backgroundColor,
      isActive: group.isActive,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      groupItems: group.items.map(item => ({
        ...item,
        feature: {
          ...item.feature,
          title: item.feature.name,           // Map name -> title
          iconName: item.feature.iconUrl,     // Map iconUrl -> iconName
          isVisible: item.feature.isActive    // Map isActive -> isVisible
        }
      })),
      pageAssignments: group.pageGroups,      // Map pageGroups -> pageAssignments
      _count: {
        groupItems: group._count.items,       // Map items -> groupItems
        pageAssignments: group._count.pageGroups  // Map pageGroups -> pageAssignments
      }
    }));

    const response: ApiResponse = {
      success: true,
      data: transformedFeatureGroups
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch feature groups:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch feature groups'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create a new feature group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform component data to match validation schema
    const transformedBody = {
      ...body,
      heading: body.heading || body.name, // Use heading if provided, otherwise use name
      name: body.name || body.heading,     // Ensure name is available
    };
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreateFeatureGroupSchema, transformedBody);

    const featureGroup = await prisma.featureGroup.create({
      data: {
        name: validatedData.name,
        description: validatedData.subheading || null,  // Map subheading -> description
        layoutType: validatedData.layoutType,
        backgroundColor: validatedData.backgroundColor,
        isActive: validatedData.isActive
      } as any,
      include: {
        items: {
          include: {
            feature: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        pageGroups: {
          include: {
            page: {
              select: {
                id: true,
                slug: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            items: true,
            pageGroups: true
          }
        }
      }
    });

    // Transform response to match component expectations
    const transformedFeatureGroup = {
      id: featureGroup.id,
      heading: featureGroup.name,          // Map name -> heading for component
      subheading: featureGroup.description, // Map description -> subheading for component
      name: featureGroup.name,             // Keep name for backward compatibility
      description: featureGroup.description, // Keep description for backward compatibility
      layoutType: featureGroup.layoutType,
      backgroundColor: featureGroup.backgroundColor,
      isActive: featureGroup.isActive,
      createdAt: featureGroup.createdAt,
      updatedAt: featureGroup.updatedAt,
      groupItems: featureGroup.items.map(item => ({
        ...item,
        feature: {
          ...item.feature,
          title: item.feature.name,
          iconName: item.feature.iconUrl,
          isVisible: item.feature.isActive
        }
      })),
      pageAssignments: featureGroup.pageGroups,
      _count: {
        groupItems: featureGroup._count.items,
        pageAssignments: featureGroup._count.pageGroups
      }
    };

    const response: ApiResponse = {
      success: true,
      data: transformedFeatureGroup
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create feature group:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create feature group'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a feature group
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform component data to match validation schema
    const transformedBody = {
      ...body,
      // Ensure both name and heading are available
      name: body.name || body.heading,     // Use name if provided, fallback to heading
      heading: body.heading || body.name,  // Use heading if provided, fallback to name
    };
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdateFeatureGroupSchema, transformedBody);

    const featureGroup = await prisma.featureGroup.update({
      where: { id: validatedData.id },
      data: {
        // Update name field in database (this represents the heading in UI)
        ...(validatedData.heading !== undefined && { name: validatedData.heading }),  // Map heading -> name in DB
        ...(validatedData.subheading !== undefined && { description: validatedData.subheading }),  // Map subheading -> description
        ...(validatedData.layoutType !== undefined && { layoutType: validatedData.layoutType }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        updatedAt: new Date()
      } as any,
      include: {
        items: {
          include: {
            feature: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        pageGroups: {
          include: {
            page: {
              select: {
                id: true,
                slug: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            items: true,
            pageGroups: true
          }
        }
      }
    });

    // Transform response to match component expectations
    const transformedFeatureGroup = {
      id: featureGroup.id,
      heading: featureGroup.name,          // Map name -> heading for component
      subheading: featureGroup.description, // Map description -> subheading for component
      name: featureGroup.name,             // Keep name for backward compatibility
      description: featureGroup.description, // Keep description for backward compatibility
      layoutType: featureGroup.layoutType,
      backgroundColor: featureGroup.backgroundColor,
      isActive: featureGroup.isActive,
      createdAt: featureGroup.createdAt,
      updatedAt: featureGroup.updatedAt,
      groupItems: featureGroup.items.map(item => ({
        ...item,
        feature: {
          ...item.feature,
          title: item.feature.name,
          iconName: item.feature.iconUrl,
          isVisible: item.feature.isActive
        }
      })),
      pageAssignments: featureGroup.pageGroups,
      _count: {
        groupItems: featureGroup._count.items,
        pageAssignments: featureGroup._count.pageGroups
      }
    };

    const response: ApiResponse = {
      success: true,
      data: transformedFeatureGroup
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update feature group:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update feature group'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete a feature group
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'number') {
      const response: ApiResponse = {
        success: false,
        message: 'Valid feature group ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.featureGroup.delete({
      where: { id: parseInt(id.toString()) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Feature group deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete feature group:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete feature group'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
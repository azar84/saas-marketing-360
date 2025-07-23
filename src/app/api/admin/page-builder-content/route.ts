import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { type ApiResponse } from '../../../../lib/validations';

// GET - Fetch available content for page builder
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type');

    if (contentType === 'hero-sections') {
      // Fetch all hero sections
      const heroSections = await (prisma.heroSection as any).findMany({
        where: { visible: true },
        select: {
          id: true,
          name: true,
          headline: true,
          subheading: true,
          layoutType: true,
          sectionHeight: true,
          mediaUrl: true,
          visible: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        data: heroSections
      };
      return NextResponse.json(response);
    }

    if (contentType === 'feature-groups') {
      // Fetch all feature groups
      const featureGroups = await prisma.featureGroup.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          layoutType: true,
          isActive: true,
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        data: featureGroups
      };
      return NextResponse.json(response);
    }

    if (contentType === 'media-sections') {
      // Fetch all media sections
      const mediaSections = await prisma.mediaSection.findMany({
        select: {
          id: true,
          headline: true,
          subheading: true,
          mediaUrl: true,
          mediaType: true,
          layoutType: true,
          badgeText: true,
          position: true,
          _count: {
            select: {
              features: true
            }
          }
        },
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      const response: ApiResponse = {
        success: true,
        data: mediaSections
      };
      return NextResponse.json(response);
    }

    if (contentType === 'pricing-sections') {
      // Fetch all pricing sections
      const pricingSections = await prisma.pricingSection.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          heading: true,
          subheading: true,
          layoutType: true,
          isActive: true,
          _count: {
            select: {
              sectionPlans: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        data: pricingSections
      };
      return NextResponse.json(response);
    }

    if (contentType === 'faq-sections') {
      // Fetch all FAQ sections
      const faqSections = await prisma.fAQSection.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          heading: true,
          subheading: true,
          heroTitle: true,
          heroSubtitle: true,
          searchPlaceholder: true,
          showHero: true,
          showCategories: true,
          backgroundColor: true,
          heroBackgroundColor: true,
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        data: faqSections
      };
      return NextResponse.json(response);
    }

    if (contentType === 'forms') {
      // Fetch all forms
      const forms = await prisma.form.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          title: true,
          subheading: true,
          isActive: true,
          _count: {
            select: {
              fields: true,
              submissions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        data: forms
      };
      return NextResponse.json(response);
    }

    if (contentType === 'html-sections') {
      // Fetch all HTML sections
      const htmlSections = await prisma.htmlSection.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          _count: {
            select: {
              pageSections: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        data: htmlSections
      };
      return NextResponse.json(response);
    }

    // If no specific type, return all content types
    const [heroSections, featureGroups, mediaSections, pricingSections, faqSections, forms, htmlSections] = await Promise.all([
      (prisma.heroSection as any).findMany({
        where: { visible: true },
        select: {
          id: true,
          name: true,
          headline: true,
          subheading: true,
          layoutType: true,
          sectionHeight: true,
          mediaUrl: true,
          visible: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.featureGroup.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          layoutType: true,
          isActive: true,
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mediaSection.findMany({
        select: {
          id: true,
          headline: true,
          subheading: true,
          mediaUrl: true,
          mediaType: true,
          layoutType: true,
          badgeText: true,
          position: true,
          _count: {
            select: {
              features: true
            }
          }
        },
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.pricingSection.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          heading: true,
          subheading: true,
          layoutType: true,
          isActive: true,
          _count: {
            select: {
              sectionPlans: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.fAQSection.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          heading: true,
          subheading: true,
          heroTitle: true,
          heroSubtitle: true,
          searchPlaceholder: true,
          showHero: true,
          showCategories: true,
          backgroundColor: true,
          heroBackgroundColor: true,
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.form.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          title: true,
          subheading: true,
          isActive: true,
          _count: {
            select: {
              fields: true,
              submissions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.htmlSection.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          _count: {
            select: {
              pageSections: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        heroSections,
        featureGroups,
        mediaSections,
        pricingSections,
        faqSections,
        forms,
        htmlSections
      }
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch page builder content:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch page builder content'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { industryName, keywords } = await request.json();

    if (!industryName || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { success: false, error: 'Industry name and keywords array are required' },
        { status: 400 }
      );
    }

    // Find the industry by name
    const industry = await prisma.industry.findUnique({
      where: { label: industryName }
    });

    if (!industry) {
      return NextResponse.json(
        { success: false, error: `Industry not found: ${industryName}` },
        { status: 404 }
      );
    }

    // Process each keyword
    const keywordResults = [];
    for (const keyword of keywords) {
      try {
        // Check if keyword already exists
        const existingKeyword = await prisma.keyword.findUnique({
          where: {
            searchTerm_industryId: {
              searchTerm: keyword,
              industryId: industry.id
            }
          }
        });

        if (existingKeyword) {
          // Update existing keyword if needed
          if (!existingKeyword.isActive) {
            await prisma.keyword.update({
              where: { id: existingKeyword.id },
              data: { isActive: true }
            });
            keywordResults.push({ keyword, action: 'reactivated' });
          } else {
            keywordResults.push({ keyword, action: 'already_exists' });
          }
        } else {
          // Create new keyword
          await prisma.keyword.create({
            data: {
              searchTerm: keyword,
              industryId: industry.id,
              isActive: true
            }
          });
          keywordResults.push({ keyword, action: 'created' });
        }
      } catch (error) {
        console.error(`Error processing keyword "${keyword}":`, error);
        keywordResults.push({ keyword, action: 'error', error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${keywords.length} keywords to industry: ${industryName}`,
      industryId: industry.id,
      results: keywordResults
    });

  } catch (error) {
    console.error('Error syncing keywords to industry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync keywords to industry' },
      { status: 500 }
    );
  }
}

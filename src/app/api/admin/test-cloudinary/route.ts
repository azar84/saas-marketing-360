import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Testing Cloudinary configuration...');
    
    // Test database connection
    let dbConnected = false;
    let settings = null;
    
    try {
      await prisma.$connect();
      dbConnected = true;
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error',
        solution: 'Check your DATABASE_URL environment variable in production'
      }, { status: 500 });
    }

    // Get site settings
    try {
      settings = await prisma.siteSettings.findFirst();
      console.log('📋 Site settings retrieved:', {
        hasSettings: !!settings,
        cloudinaryEnabled: settings?.cloudinaryEnabled,
        hasCloudName: !!settings?.cloudinaryCloudName,
        hasApiKey: !!settings?.cloudinaryApiKey,
        hasApiSecret: !!settings?.cloudinaryApiSecret
      });
    } catch (settingsError) {
      console.error('❌ Failed to get site settings:', settingsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve site settings',
        details: settingsError instanceof Error ? settingsError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Check if Cloudinary is configured
    const isConfigured = settings?.cloudinaryEnabled && 
                        settings?.cloudinaryCloudName && 
                        settings?.cloudinaryApiKey && 
                        settings?.cloudinaryApiSecret;

    if (!isConfigured) {
      console.log('❌ Cloudinary not configured in database');
      return NextResponse.json({
        success: false,
        error: 'Cloudinary not configured',
        details: {
          hasSettings: !!settings,
          cloudinaryEnabled: settings?.cloudinaryEnabled,
          hasCloudName: !!settings?.cloudinaryCloudName,
          hasApiKey: !!settings?.cloudinaryApiKey,
          hasApiSecret: !!settings?.cloudinaryApiSecret
        },
        solution: 'Please configure Cloudinary in the admin panel under Site Settings. You need to enable Cloudinary and provide your Cloud Name, API Key, and API Secret.'
      }, { status: 400 });
    }

    console.log('✅ Cloudinary is properly configured');
    return NextResponse.json({
      success: true,
      message: 'Cloudinary is properly configured',
      details: {
        cloudinaryEnabled: settings!.cloudinaryEnabled,
        hasCloudName: !!settings!.cloudinaryCloudName,
        hasApiKey: !!settings!.cloudinaryApiKey,
        hasApiSecret: !!settings!.cloudinaryApiSecret
      }
    });

  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
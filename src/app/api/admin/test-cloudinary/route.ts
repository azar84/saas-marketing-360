import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryConfig, configureCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing Cloudinary configuration...');
    
    // Check database configuration
    const settings = await prisma.siteSettings.findFirst();
    console.log('Database settings:', {
      cloudinaryEnabled: settings?.cloudinaryEnabled,
      hasCloudName: !!settings?.cloudinaryCloudName,
      hasApiKey: !!settings?.cloudinaryApiKey,
      hasApiSecret: !!settings?.cloudinaryApiSecret
    });
    
    // Check environment variables
    console.log('Environment variables:', {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
    });
    
    // Try to get configuration
    const config = await getCloudinaryConfig();
    console.log('Cloudinary config result:', config ? 'Found' : 'Not found');
    
    if (!config) {
      return NextResponse.json({
        success: false,
        message: 'Cloudinary is not configured',
        details: {
          databaseEnabled: settings?.cloudinaryEnabled || false,
          databaseConfigured: !!(settings?.cloudinaryCloudName && settings?.cloudinaryApiKey && settings?.cloudinaryApiSecret),
          environmentConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
        }
      }, { status: 400 });
    }
    
    // Try to configure Cloudinary
    const isConfigured = await configureCloudinary();
    
    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        message: 'Failed to configure Cloudinary',
        config: {
          cloud_name: config.cloud_name,
          api_key: config.api_key ? `${config.api_key.substring(0, 8)}...` : 'missing',
          api_secret: config.api_secret ? '***' : 'missing'
        }
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cloudinary is properly configured',
      config: {
        cloud_name: config.cloud_name,
        api_key: `${config.api_key.substring(0, 8)}...`,
        api_secret: '***'
      }
    });
    
  } catch (error) {
    console.error('Cloudinary test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error testing Cloudinary configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
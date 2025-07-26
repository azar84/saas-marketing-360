import { prisma } from './db';
import scheduler from './scheduler';

/**
 * Initialize server configuration by loading settings from database
 * This runs once when the server starts
 */
export async function initializeServerConfig() {
  try {
    console.log('🚀 Initializing server configuration...');
    
    // Load site settings from database
    const settings = await prisma.siteSettings.findFirst();
    
    if (settings?.cloudinaryEnabled && settings.cloudinaryCloudName && settings.cloudinaryApiKey && settings.cloudinaryApiSecret) {
      // Set Cloudinary environment variables from database
      process.env.CLOUDINARY_CLOUD_NAME = settings.cloudinaryCloudName;
      process.env.CLOUDINARY_API_KEY = settings.cloudinaryApiKey;
      process.env.CLOUDINARY_API_SECRET = settings.cloudinaryApiSecret;
      
      console.log('✅ Cloudinary configuration loaded from database');
      console.log(`   Cloud Name: ${settings.cloudinaryCloudName}`);
      console.log(`   API Key: ${settings.cloudinaryApiKey.substring(0, 8)}...`);
    } else {
      console.log('⚠️  Cloudinary not configured in database, using environment variables if available');
    }
    
    // Load other configurations as needed
    // if (settings?.baseUrl) {
    //   process.env.NEXT_PUBLIC_BASE_URL = settings.baseUrl;
    //   console.log(`✅ Base URL set from database: ${settings.baseUrl}`);
    // }
    
    // Start the built-in scheduler
    try {
      scheduler.start();
      console.log('✅ Built-in scheduler started successfully');
    } catch (error) {
      console.error('❌ Failed to start scheduler:', error);
    }
    
    console.log('✅ Server configuration initialized');
    
  } catch (error) {
    console.error('❌ Failed to initialize server configuration:', error);
    console.log('⚠️  Using environment variables as fallback');
  }
}

/**
 * Get Cloudinary configuration (for runtime use)
 */
export async function getCloudinaryConfig() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings?.cloudinaryEnabled || !settings.cloudinaryCloudName || !settings.cloudinaryApiKey || !settings.cloudinaryApiSecret) {
      throw new Error('Cloudinary not configured in site settings');
    }

    return {
      cloud_name: settings.cloudinaryCloudName,
      api_key: settings.cloudinaryApiKey,
      api_secret: settings.cloudinaryApiSecret,
    };
  } catch (error) {
    console.error('Error getting Cloudinary config:', error);
    throw new Error('Cloudinary configuration not found');
  }
} 
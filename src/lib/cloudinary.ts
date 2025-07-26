import { v2 as cloudinary } from 'cloudinary';
import { prisma } from './db';

// Function to get Cloudinary config from database or environment
export async function getCloudinaryConfig() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    
    if (settings?.cloudinaryEnabled && settings.cloudinaryCloudName && settings.cloudinaryApiKey && settings.cloudinaryApiSecret) {
      return {
        cloud_name: settings.cloudinaryCloudName,
        api_key: settings.cloudinaryApiKey,
        api_secret: settings.cloudinaryApiSecret,
      };
    }
    
    // Fallback to environment variables
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      return {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      };
    }
    
    // Return null instead of throwing error - let the calling function handle it
    return null;
  } catch (error) {
    console.error('Error getting Cloudinary config:', error);
    return null;
  }
}

// Function to configure Cloudinary with database settings or environment variables
export async function configureCloudinary() {
  try {
    const config = await getCloudinaryConfig();
    
    if (!config) {
      console.warn('Cloudinary not configured - media uploads will be disabled');
      return false;
    }
    
    cloudinary.config(config);
    return true;
  } catch (error) {
    console.error('Failed to configure Cloudinary:', error);
    return false;
  }
}

// Don't initialize Cloudinary configuration at module level
// It will be configured when needed

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export const uploadToCloudinary = async (
  file: File | Buffer,
  options: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'video' | 'raw';
    transformation?: any[];
  } = {}
): Promise<CloudinaryUploadResult> => {
  try {
    // Ensure Cloudinary is configured
    const isConfigured = await configureCloudinary();
    
    if (!isConfigured) {
      throw new Error('Cloudinary is not configured. Please configure Cloudinary in site settings or environment variables.');
    }

    // Convert File to buffer if needed
    let buffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'yourcompany',
          public_id: options.public_id,
          resource_type: options.resource_type || 'auto',
          transformation: options.transformation,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

export const deleteFromCloudinary = async (public_id: string): Promise<void> => {
  try {
    // Ensure Cloudinary is configured
    const isConfigured = await configureCloudinary();
    
    if (!isConfigured) {
      console.warn('Cloudinary is not configured - skipping delete operation');
      return;
    }
    
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

export const getCloudinaryUrl = (public_id: string, options: {
  transformation?: any[];
  format?: string;
} = {}): string => {
  // This function doesn't need configuration check as it just generates URLs
  // But we should ensure Cloudinary is configured for consistency
  try {
    // Note: This is a synchronous operation, so we can't await configureCloudinary
    // The URL generation should work even without full configuration
    return cloudinary.url(public_id, {
      secure: true,
      ...options,
    });
  } catch (error) {
    console.error('Error generating Cloudinary URL:', error);
    // Return a fallback URL or the original public_id
    return public_id;
  }
}; 
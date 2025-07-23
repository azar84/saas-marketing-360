# Cloudinary Setup for File Uploads

## Problem
File uploads were failing on Vercel because:
1. Vercel's serverless functions have a read-only filesystem
2. Files uploaded to local storage would be lost when the function terminates
3. No persistent storage solution was configured

## Solution
We've integrated Cloudinary as the file storage solution. Cloudinary provides:
- Reliable cloud storage for images, videos, and other files
- Automatic image optimization and transformations
- Generous free tier (25GB storage, 25GB bandwidth/month)
- CDN delivery for fast loading

## Setup Instructions

### 1. Create a Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Get your credentials from the Dashboard

### 2. Get Your Cloudinary Credentials
From your Cloudinary Dashboard, you'll need:
- **Cloud Name**: Found in the Dashboard URL (e.g., `https://console.cloudinary.com/console/your-cloud-name`)
- **API Key**: Found in the Dashboard under "API Keys"
- **API Secret**: Found in the Dashboard under "API Keys"

### 3. Add Environment Variables
Add these to your `.env.local` file (for local development) and Vercel environment variables (for production):

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the three Cloudinary variables above
4. Redeploy your application

## What Changed

### Files Modified:
1. **`src/lib/cloudinary.ts`** - New Cloudinary service
2. **`src/app/api/admin/media-library/route.ts`** - Updated to use Cloudinary
3. **`next.config.ts`** - Added Cloudinary domain to image config

### Key Changes:
- File uploads now go to Cloudinary instead of local filesystem
- Files are stored with unique public IDs
- Automatic image optimization and CDN delivery
- Proper cleanup when files are deleted

## Benefits
- ✅ Works on Vercel (no filesystem dependencies)
- ✅ Persistent storage (files don't disappear)
- ✅ Automatic image optimization
- ✅ CDN delivery for fast loading
- ✅ Automatic format conversion (WebP, AVIF)
- ✅ Responsive images with transformations
- ✅ Free tier covers most use cases

## Usage
The upload functionality remains the same from the user's perspective. Files will now be stored in Cloudinary and served via their CDN.

## Migration
Existing files in your database will continue to work, but new uploads will use Cloudinary. If you need to migrate existing files, you can:
1. Download them from their current location
2. Re-upload them through the admin panel
3. Or create a migration script to move them to Cloudinary

## Troubleshooting
- **Upload fails**: Check your Cloudinary credentials
- **Images not loading**: Ensure `res.cloudinary.com` is in your Next.js image domains
- **Large files**: Cloudinary has a 100MB limit per file (increased from 50MB) 
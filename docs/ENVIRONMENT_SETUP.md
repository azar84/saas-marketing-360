# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/saas_marketing"

# JWT Configuration
JWT_SECRET="your-secret-key-here"

# BuiltWith API Configuration (Removed - No longer used)
# BUILTWITH_API_KEY="your_builtwith_api_key_here"

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# SMTP Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# Debug Mode
DEBUG=false
```

## BuiltWith API (Removed)

BuiltWith API integration has been removed from this project.

## Development Setup

1. Copy the environment variables above to your `.env` file
2. Replace the placeholder values with your actual credentials
3. For development, you can use a test API key or set `BUILTWITH_API_KEY="test"` to bypass the API requirement

## Production Setup

1. Set all required environment variables in your production environment
2. Ensure `BUILTWITH_API_KEY` is properly configured
3. Set `DEBUG=false` for production
4. Use strong, unique values for `JWT_SECRET`

## Tech Discovery Feature (Removed)

The Tech Discovery feature has been removed from this project.

See `docs/TECH_DISCOVERY_SETUP.md` for detailed setup instructions.

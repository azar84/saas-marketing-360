# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/saas_marketing"

# JWT Configuration
JWT_SECRET="your-secret-key-here"

# BuiltWith API Configuration (Required for Tech Discovery)
BUILTWITH_API_KEY="your_builtwith_api_key_here"

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

## Getting Your BuiltWith API Key

1. Sign up at [BuiltWith.com](https://builtwith.com)
2. Navigate to your account settings
3. Generate an API key
4. Note your API plan limits and rate limits

## Development Setup

1. Copy the environment variables above to your `.env` file
2. Replace the placeholder values with your actual credentials
3. For development, you can use a test API key or set `BUILTWITH_API_KEY="test"` to bypass the API requirement

## Production Setup

1. Set all required environment variables in your production environment
2. Ensure `BUILTWITH_API_KEY` is properly configured
3. Set `DEBUG=false` for production
4. Use strong, unique values for `JWT_SECRET`

## Tech Discovery Feature

The Tech Discovery feature requires a valid BuiltWith API key to function. Without this key, the feature will show an error message.

For testing purposes, you can:
1. Get a free BuiltWith API key (limited usage)
2. Use the feature with limited functionality
3. Upgrade to a paid plan for full access

See `docs/TECH_DISCOVERY_SETUP.md` for detailed setup instructions.

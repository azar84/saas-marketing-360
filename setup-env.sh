#!/bin/bash

echo "Setting up environment variables for development..."

# Create .env file
cat > .env << EOF
# Database Configuration
DATABASE_URL="file:./prisma/dev.db"

# JWT Configuration
JWT_SECRET="dev-secret-key-change-in-production"

# BuiltWith API Configuration (Required for Tech Discovery)
BUILTWITH_API_KEY="test"

# Debug Mode
DEBUG=true
 
# External API Protection (required for keyword generation)
VERCEL_AUTOMATION_BYPASS_SECRET=""

# Marketing MCP base URL
MARKETING_MCP_API_URL="https://marketing-mcp-beta.vercel.app"
EOF

echo "✅ .env file created successfully!"
echo ""
echo "Next steps:"
echo "1. Run: npx prisma db push"
echo "2. Run: npm run dev"
echo ""
echo "Note: For production, you'll need to:"
echo "- Set up a real database URL"
echo "- Get a real BuiltWith API key"
echo "- Use a strong JWT secret"

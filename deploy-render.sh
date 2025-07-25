#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 SaaS CMS Render Deployment${NC}"

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo -e "${YELLOW}⚠️  Render CLI not found. Installing...${NC}"
    echo -e "${BLUE}📥 Installing Render CLI...${NC}"
    
    # Detect OS and install Render CLI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install render
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -s https://api.render.com/download/linux | bash
    else
        echo -e "${RED}❌ Unsupported OS. Please install Render CLI manually:${NC}"
        echo -e "${BLUE}https://render.com/docs/deploy-create-render-cli${NC}"
        exit 1
    fi
fi

# Check if user is logged in to Render
if ! render whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Render. Please log in:${NC}"
    render login
fi

# Function to create .env file for Render
create_render_env() {
    if [ ! -f .env.render ]; then
        echo -e "${YELLOW}⚠️  Creating .env.render file...${NC}"
        cat > .env.render << EOF
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="https://your-app-name.onrender.com"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Google Analytics
GOOGLE_ANALYTICS_ID="your-google-analytics-id"
GOOGLE_TAG_MANAGER_ID="your-google-tag-manager-id"
EOF
        echo -e "${YELLOW}⚠️  Please update .env.render with your actual values before deploying.${NC}"
    fi
}

# Function to deploy to Render
deploy_to_render() {
    local service_name=$1
    
    echo -e "${BLUE}🔨 Deploying to Render...${NC}"
    
    # Create service if it doesn't exist
    if ! render services list | grep -q "$service_name"; then
        echo -e "${BLUE}📝 Creating new Render service...${NC}"
        render services create --name "$service_name" --env docker --plan starter --region oregon
    fi
    
    # Deploy the service
    echo -e "${BLUE}🚀 Deploying service...${NC}"
    render services deploy "$service_name"
    
    echo -e "${GREEN}✅ Deployment initiated!${NC}"
    echo -e "${BLUE}🌐 Your app will be available at: https://$service_name.onrender.com${NC}"
}

# Function to view deployment logs
view_logs() {
    local service_name=$1
    
    echo -e "${BLUE}📋 Viewing deployment logs...${NC}"
    render services logs "$service_name" --follow
}

# Function to check deployment status
check_status() {
    local service_name=$1
    
    echo -e "${BLUE}📊 Checking deployment status...${NC}"
    render services list | grep "$service_name"
}

# Main script logic
case "$1" in
    "deploy")
        create_render_env
        deploy_to_render "saas-cms"
        ;;
    "logs")
        view_logs "saas-cms"
        ;;
    "status")
        check_status "saas-cms"
        ;;
    "env")
        create_render_env
        echo -e "${GREEN}✅ .env.render file created!${NC}"
        ;;
    "setup")
        echo -e "${BLUE}🔧 Setting up Render deployment...${NC}"
        create_render_env
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo -e "${BLUE}📝 Next steps:${NC}"
        echo -e "  1. Update .env.render with your actual values"
        echo -e "  2. Run: ./deploy-render.sh deploy"
        echo -e "  3. Check status: ./deploy-render.sh status"
        ;;
    *)
        echo -e "${BLUE}📖 Usage:${NC}"
        echo -e "  ${GREEN}./deploy-render.sh setup${NC}   - Initial setup"
        echo -e "  ${GREEN}./deploy-render.sh deploy${NC}  - Deploy to Render"
        echo -e "  ${GREEN}./deploy-render.sh logs${NC}    - View deployment logs"
        echo -e "  ${GREEN}./deploy-render.sh status${NC}  - Check deployment status"
        echo -e "  ${GREEN}./deploy-render.sh env${NC}     - Create .env.render file"
        echo -e ""
        echo -e "${BLUE}📋 Prerequisites:${NC}"
        echo -e "  - Render account (https://render.com)"
        echo -e "  - Render CLI installed and logged in"
        echo -e "  - Environment variables configured"
        ;;
esac 
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 SaaS CMS Container Deployment${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Function to check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${YELLOW}⚠️  Please update the .env file with your configuration before continuing.${NC}"
            exit 1
        else
            echo -e "${YELLOW}⚠️  Creating basic .env file...${NC}"
            cat > .env << EOF
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Google Analytics
GOOGLE_ANALYTICS_ID="your-google-analytics-id"
GOOGLE_TAG_MANAGER_ID="your-google-tag-manager-id"
EOF
            echo -e "${YELLOW}⚠️  Please update the .env file with your configuration before continuing.${NC}"
            exit 1
        fi
    fi
}

# Function to build and start containers
deploy() {
    local environment=$1
    
    echo -e "${BLUE}🔨 Building containers for ${environment}...${NC}"
    
    if [ "$environment" = "production" ]; then
        docker-compose -f docker-compose.yml build
        echo -e "${BLUE}🚀 Starting production containers...${NC}"
        docker-compose -f docker-compose.yml up -d
    else
        docker-compose -f docker-compose.dev.yml build
        echo -e "${BLUE}🚀 Starting development containers...${NC}"
        docker-compose -f docker-compose.dev.yml up -d
    fi
    
    echo -e "${GREEN}✅ Containers started successfully!${NC}"
    echo -e "${BLUE}🌐 Application available at: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Admin panel available at: http://localhost:3000/admin-panel${NC}"
}

# Function to stop containers
stop() {
    local environment=$1
    
    echo -e "${YELLOW}🛑 Stopping containers...${NC}"
    
    if [ "$environment" = "production" ]; then
        docker-compose -f docker-compose.yml down
    else
        docker-compose -f docker-compose.dev.yml down
    fi
    
    echo -e "${GREEN}✅ Containers stopped successfully!${NC}"
}

# Function to view logs
logs() {
    local environment=$1
    
    if [ "$environment" = "production" ]; then
        docker-compose -f docker-compose.yml logs -f
    else
        docker-compose -f docker-compose.dev.yml logs -f
    fi
}

# Function to run database migrations
migrate() {
    echo -e "${BLUE}🗄️  Running database migrations...${NC}"
    docker-compose exec app npx prisma migrate deploy
    echo -e "${GREEN}✅ Migrations completed!${NC}"
}

# Function to seed database
seed() {
    echo -e "${BLUE}🌱 Seeding database...${NC}"
    docker-compose exec app npx prisma db seed
    echo -e "${GREEN}✅ Database seeded!${NC}"
}

# Main script logic
case "$1" in
    "dev")
        check_env_file
        deploy "development"
        ;;
    "prod")
        check_env_file
        deploy "production"
        ;;
    "stop")
        if [ "$2" = "prod" ]; then
            stop "production"
        else
            stop "development"
        fi
        ;;
    "logs")
        if [ "$2" = "prod" ]; then
            logs "production"
        else
            logs "development"
        fi
        ;;
    "migrate")
        migrate
        ;;
    "seed")
        seed
        ;;
    "restart")
        if [ "$2" = "prod" ]; then
            stop "production"
            deploy "production"
        else
            stop "development"
            deploy "development"
        fi
        ;;
    *)
        echo -e "${BLUE}📖 Usage:${NC}"
        echo -e "  ${GREEN}./deploy.sh dev${NC}     - Deploy development environment"
        echo -e "  ${GREEN}./deploy.sh prod${NC}    - Deploy production environment"
        echo -e "  ${GREEN}./deploy.sh stop${NC}    - Stop development containers"
        echo -e "  ${GREEN}./deploy.sh stop prod${NC} - Stop production containers"
        echo -e "  ${GREEN}./deploy.sh logs${NC}    - View development logs"
        echo -e "  ${GREEN}./deploy.sh logs prod${NC} - View production logs"
        echo -e "  ${GREEN}./deploy.sh migrate${NC}  - Run database migrations"
        echo -e "  ${GREEN}./deploy.sh seed${NC}     - Seed database"
        echo -e "  ${GREEN}./deploy.sh restart${NC}  - Restart development containers"
        echo -e "  ${GREEN}./deploy.sh restart prod${NC} - Restart production containers"
        ;;
esac 
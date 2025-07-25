# 🐳 SaaS CMS Containerization Guide

This guide explains how to deploy your SaaS CMS application using Docker containers.

## 📋 Prerequisites

- Docker installed on your system
- Docker Compose installed
- Git (for cloning the repository)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd saas_cms
```

### 2. Environment Configuration

Create a `.env` file with your configuration:

```bash
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
```

### 3. Deploy

#### Development Environment
```bash
./deploy.sh dev
```

#### Production Environment
```bash
./deploy.sh prod
```

## 📁 Container Structure

### Production (`docker-compose.yml`)
- **app**: Next.js application (port 3000)
- **db**: SQLite database container
- **nginx**: Reverse proxy with SSL (optional, port 80/443)

### Development (`docker-compose.dev.yml`)
- **app**: Next.js application with hot reloading
- **db**: SQLite database container
- **db-admin**: Database admin interface (optional, port 8080)

## 🔧 Available Commands

### Deployment Script (`./deploy.sh`)

| Command | Description |
|---------|-------------|
| `./deploy.sh dev` | Deploy development environment |
| `./deploy.sh prod` | Deploy production environment |
| `./deploy.sh stop` | Stop development containers |
| `./deploy.sh stop prod` | Stop production containers |
| `./deploy.sh logs` | View development logs |
| `./deploy.sh logs prod` | View production logs |
| `./deploy.sh migrate` | Run database migrations |
| `./deploy.sh seed` | Seed database |
| `./deploy.sh restart` | Restart development containers |
| `./deploy.sh restart prod` | Restart production containers |

### Manual Docker Commands

#### Development
```bash
# Build and start development containers
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop containers
docker-compose -f docker-compose.dev.yml down
```

#### Production
```bash
# Build and start production containers
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose -f docker-compose.yml logs -f

# Stop containers
docker-compose -f docker-compose.yml down
```

## 🌐 Access Points

### Development
- **Application**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin-panel
- **Database Admin**: http://localhost:8080 (if enabled)

### Production
- **Application**: http://localhost:3000 (or your domain)
- **Admin Panel**: http://localhost:3000/admin-panel
- **With Nginx**: http://localhost (port 80)

## 📊 Database Management

### Run Migrations
```bash
./deploy.sh migrate
```

### Seed Database
```bash
./deploy.sh seed
```

### Access Database Directly
```bash
# Connect to the app container
docker-compose exec app sh

# Run Prisma commands
npx prisma studio
npx prisma migrate dev
npx prisma db push
```

## 🔒 Security Features

### Production Nginx Configuration
- Rate limiting for API endpoints
- Security headers
- Gzip compression
- SSL/TLS support (when configured)

### Environment Variables
- All sensitive data stored in environment variables
- Separate configurations for dev/prod
- No hardcoded secrets in containers

## 📦 Data Persistence

### Volumes
- **Database**: `./prisma` → `/app/prisma` (SQLite file)
- **Uploads**: `./public/uploads` → `/app/public/uploads`
- **Logs**: `./logs` → `/app/logs`

### Backup Strategy
```bash
# Backup database
docker-compose exec app cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads/
```

## 🚀 Deployment to Cloud Platforms

### AWS ECS
1. Build and push Docker image to ECR
2. Create ECS cluster and service
3. Configure environment variables
4. Set up load balancer

### Google Cloud Run
1. Build and push to Google Container Registry
2. Deploy using Cloud Run
3. Configure environment variables
4. Set up custom domain

### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy automatically

## 🔍 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
./deploy.sh logs

# Check container status
docker ps -a

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Database Connection Issues
```bash
# Check database container
docker-compose exec db ls -la /data

# Reset database
docker-compose down
rm -f prisma/dev.db
docker-compose up -d
./deploy.sh migrate
./deploy.sh seed
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER prisma/
sudo chown -R $USER:$USER public/uploads/
```

### Performance Optimization

#### Production Optimizations
- Enable Nginx caching
- Configure CDN for static assets
- Optimize Docker image layers
- Use multi-stage builds

#### Development Optimizations
- Use volume mounts for hot reloading
- Exclude node_modules from Docker context
- Use .dockerignore file

## 📈 Monitoring

### Health Checks
```bash
# Check application health
curl http://localhost:3000/api/health

# Check container health
docker-compose ps
```

### Logs
```bash
# Application logs
./deploy.sh logs

# Database logs
docker-compose logs db

# Nginx logs (production)
docker-compose logs nginx
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server "cd /path/to/app && git pull && ./deploy.sh prod"
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 🤝 Support

For issues related to:
- **Docker**: Check Docker logs and documentation
- **Application**: Check application logs and GitHub issues
- **Database**: Check Prisma documentation and migration logs 
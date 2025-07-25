# 🚀 Render Deployment Guide

This guide will help you deploy your SaaS CMS application to Render.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare your configuration values

## 🚀 Quick Deployment

### Method 1: Using Render Dashboard (Recommended)

1. **Connect Repository**
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: saas-cms
   Environment: Docker
   Region: Oregon (or your preferred region)
   Branch: main
   Root Directory: ./
   Build Command: docker build -t saas-cms .
   Start Command: docker run -p $PORT:3000 saas-cms
   ```

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=file:./prisma/dev.db
   NEXTAUTH_URL=https://your-app-name.onrender.com
   NEXTAUTH_SECRET=your-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   GOOGLE_ANALYTICS_ID=your-ga-id
   GOOGLE_TAG_MANAGER_ID=your-gtm-id
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

### Method 2: Using Render CLI

1. **Install Render CLI**
   ```bash
   # macOS
   brew install render
   
   # Linux
   curl -s https://api.render.com/download/linux | bash
   ```

2. **Login to Render**
   ```bash
   render login
   ```

3. **Deploy**
   ```bash
   ./deploy-render.sh setup
   ./deploy-render.sh deploy
   ```

## 🔧 Configuration Files

### render.yaml
This file defines your Render services:

```yaml
services:
  - type: web
    name: saas-cms
    env: docker
    plan: starter
    region: oregon
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      # ... other environment variables
```

### Dockerfile.render
Optimized Dockerfile for Render deployment with:
- Multi-stage builds
- Production optimizations
- Security best practices

## 🌐 Environment Variables

### Required Variables
```bash
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=your-secret-key
```

### Optional Variables
```bash
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
GOOGLE_ANALYTICS_ID=your-ga-id
GOOGLE_TAG_MANAGER_ID=your-gtm-id
```

## 📊 Database Options

### Option 1: SQLite (Current Setup)
- Uses file-based SQLite database
- Data persists in Render's disk storage
- Good for small to medium applications

### Option 2: PostgreSQL (Recommended for Production)
1. Create a PostgreSQL service in Render
2. Update DATABASE_URL to use PostgreSQL connection string
3. Update Prisma schema to use PostgreSQL

```yaml
# In render.yaml
- type: pserv
  name: saas-cms-db
  env: postgresql
  plan: starter
  region: oregon
```

## 🔍 Monitoring & Logs

### View Logs
```bash
# Using Render CLI
render services logs saas-cms

# Using our script
./deploy-render.sh logs
```

### Check Status
```bash
# Using Render CLI
render services list

# Using our script
./deploy-render.sh status
```

## 🔄 Continuous Deployment

### Automatic Deployments
- Render automatically deploys when you push to your main branch
- You can configure branch-specific deployments
- Manual deployments available through dashboard

### Deployment Hooks
```bash
# Pre-deploy script (optional)
npm run build
npm run migrate

# Post-deploy script (optional)
npm run seed
```

## 🚀 Performance Optimization

### Render-Specific Optimizations
1. **Use Standalone Output**: Already configured in `next.config.ts`
2. **Optimize Docker Image**: Multi-stage builds reduce image size
3. **Enable Caching**: Static assets are cached automatically
4. **Use CDN**: Render provides CDN for static files

### Database Optimization
```sql
-- For SQLite
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=10000;
```

## 🔒 Security

### Environment Variables
- All secrets stored in Render's environment variables
- No hardcoded secrets in code
- Automatic secret rotation available

### HTTPS
- Render provides automatic HTTPS certificates
- All traffic is encrypted by default
- Custom domains supported

## 📈 Scaling

### Auto-Scaling
- Render can auto-scale based on traffic
- Configure minimum and maximum instances
- Set up health checks for reliability

### Manual Scaling
```bash
# Scale to 2 instances
render services scale saas-cms --num-instances 2
```

## 🔍 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
render services logs saas-cms --build

# Common fixes:
# 1. Ensure Dockerfile is in root directory
# 2. Check for syntax errors in code
# 3. Verify all dependencies are in package.json
```

#### Runtime Errors
```bash
# Check runtime logs
render services logs saas-cms

# Common fixes:
# 1. Verify environment variables are set
# 2. Check database connectivity
# 3. Ensure PORT environment variable is used
```

#### Database Issues
```bash
# For SQLite
# Check if database file exists and is writable
# Ensure disk space is available

# For PostgreSQL
# Verify connection string
# Check database permissions
```

### Performance Issues
1. **Enable Caching**: Use Redis or in-memory caching
2. **Optimize Images**: Use WebP format and proper sizing
3. **Database Indexing**: Add indexes for frequently queried fields
4. **Code Splitting**: Use Next.js dynamic imports

## 📞 Support

### Render Support
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

### Application Support
- Check application logs for errors
- Verify environment variables
- Test locally before deploying

## 🎯 Next Steps

1. **Deploy to Render**: Follow the quick deployment guide above
2. **Set up Custom Domain**: Configure your domain in Render dashboard
3. **Enable Monitoring**: Set up alerts and monitoring
4. **Optimize Performance**: Implement caching and CDN
5. **Set up CI/CD**: Configure automatic deployments

## 📚 Additional Resources

- [Render Best Practices](https://render.com/docs/best-practices)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment) 
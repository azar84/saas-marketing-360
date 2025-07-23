# Database Setup Guide

This guide covers setting up your database for both local development and production deployment.

## 🏠 Local Development Setup

### Prerequisites
- PostgreSQL installed via Homebrew
- Node.js and npm installed

### Quick Setup
Run the automated setup script:
```bash
npm run setup-local-db
```

This script will:
1. ✅ Verify PostgreSQL is installed and running
2. 🗄️ Create the `saski_ai_local` database
3. 📝 Configure your `.env` file
4. 🔧 Generate Prisma client
5. 📊 Set up database schema
6. 🌱 Create basic seed data

### Manual Setup (if needed)

1. **Install PostgreSQL** (if not already installed):
```bash
brew install postgresql
brew services start postgresql
```

2. **Create Database**:
```bash
createdb saski_ai_local
```

3. **Configure Environment**:
Create `.env` file with:
```env
DATABASE_URL="postgresql://azarmacbook@localhost:5432/saski_ai_local"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

4. **Setup Schema and Data**:
```bash
npx prisma generate
npx prisma db push
```

5. **Create Basic Data**:
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function seed() {
  await prisma.siteSettings.create({
    data: { baseUrl: 'http://localhost:3000', footerCompanyName: 'Saski AI' }
  });
  await prisma.page.create({
    data: { slug: 'home', title: 'Home', sortOrder: 1, showInHeader: true }
  });
  await prisma.\$disconnect();
}
seed();
"
```

## 🚀 Production Deployment

### Environment Variables
Set these in your production environment:

```env
# Production Database (replace with your actual database URL)
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# Production Base URL
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

# Optional: Cloudinary for media uploads
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Deployment Process

1. **Set Environment Variables** in your hosting platform (Vercel, Railway, etc.)

2. **Database Setup** - Your hosting platform will handle this automatically when you:
   - Push your code
   - The build process runs `prisma generate && prisma db push` (see package.json)

3. **Verify Deployment**:
   - Visit `/admin-panel` to access the admin interface
   - Check `/sitemap.xml` and `/robots.txt` endpoints
   - Use SEO Manager to generate sitemaps

## 📊 Database Schema Overview

### Key Tables
- **`pages`** - Dynamic pages with SEO metadata
- **`site_settings`** - Global site configuration including base URL
- **`design_system`** - Theme and styling configuration
- **Additional tables** - Features, media, forms, etc.

### SEO-Related Fields
- `pages.metaTitle` - SEO title for search engines
- `pages.metaDesc` - SEO meta description
- `pages.showInHeader` - Include in navigation (affects sitemap priority)
- `site_settings.baseUrl` - Used for generating absolute URLs in sitemap

## 🔧 Database Management Commands

### Development Commands
```bash
# Setup local database from scratch
npm run setup-local-db

# Reset database and reseed
npm run db:reset

# Generate Prisma client
npx prisma generate

# Apply schema changes
npx prisma db push

# View database in browser
npx prisma studio
```

### Production Commands (handled automatically)
```bash
# Build command (runs automatically on deployment)
npm run build
# This runs: prisma generate && prisma db push && next build
```

## 🐛 Troubleshooting

### Local Development Issues

1. **PostgreSQL not running**:
```bash
brew services start postgresql
```

2. **Database doesn't exist**:
```bash
createdb saski_ai_local
```

3. **Permission issues**:
```bash
# Check current user
whoami
# Make sure DATABASE_URL uses correct username
```

4. **Prisma client issues**:
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

### Production Issues

1. **Build failing**:
   - Check environment variables are set
   - Verify DATABASE_URL is correct
   - Check build logs for specific errors

2. **Database connection errors**:
   - Verify production DATABASE_URL
   - Check if database allows connections from your hosting platform
   - Ensure database exists and is accessible

3. **Missing data**:
   - Run seed scripts manually if needed
   - Check if migrations were applied

## 📈 SEO Manager Integration

Once your database is set up:

1. **Access Admin Panel**: `/admin-panel`
2. **Go to SEO Manager**: Click "SEO Manager" in navigation
3. **Generate Sitemap**: 
   - Go to Sitemap tab
   - Click "Generate Sitemap"
   - Your sitemap will be available at `/sitemap.xml`
4. **Configure Robots.txt**: 
   - Go to Robots.txt tab
   - Customize rules as needed
   - Save to make it available at `/robots.txt`
5. **Run SEO Audit**:
   - Go to SEO Audit tab
   - Click "Run SEO Audit"
   - Review recommendations for each page

## 🔄 Environment Switching

### Local to Production
- Set production DATABASE_URL in deployment platform
- Update NEXT_PUBLIC_BASE_URL to production domain
- Deploy code - schema will be applied automatically

### Production to Local
- Ensure local PostgreSQL is running
- Use local DATABASE_URL in `.env`
- Run `npm run setup-local-db` if needed

## 💡 Best Practices

1. **Always backup production database** before major changes
2. **Test schema changes locally** before deploying
3. **Use environment-specific URLs** for baseUrl in site settings
4. **Regular SEO audits** to maintain search engine optimization
5. **Monitor sitemap accessibility** at `/sitemap.xml`

This setup ensures your dynamic pages are properly indexed by search engines and your SEO Manager has all the data it needs to generate accurate sitemaps and provide helpful SEO recommendations. 
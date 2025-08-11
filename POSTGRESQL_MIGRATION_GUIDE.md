# PostgreSQL Migration Guide

## Overview
This guide will help you migrate your SaaS Marketing 360 application from SQLite to PostgreSQL while preserving all your data.

## Why PostgreSQL?
- **Better Performance**: Faster queries, especially for complex operations
- **Advanced Features**: Full-text search, JSON support, better indexing
- **Scalability**: Handles larger datasets and concurrent users better
- **Production Ready**: Industry standard for production applications
- **Case-Insensitive Queries**: Native support for `ILIKE` and case-insensitive operations

## Prerequisites

### 1. Install PostgreSQL
- **macOS**: `brew install postgresql`
- **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Start PostgreSQL Service
```bash
# macOS
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql

# Windows
# PostgreSQL service should start automatically
```

### 3. Create Database
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE saas_marketing_360;
CREATE USER saas_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE saas_marketing_360 TO saas_user;
\q
```

## Migration Steps

### Step 1: Export Current Data ✅
Your SQLite data has already been exported:
```bash
npm run db:export
```
**Result**: 46,353 records exported to `backups/postgresql-migration/`

### Step 2: Update Environment Configuration
Update your `.env` file with PostgreSQL credentials:
```bash
# Backup current SQLite config
cp .env .env.backup.sqlite

# Update with PostgreSQL config
DATABASE_URL="postgresql://saas_user:your_secure_password@localhost:5432/saas_marketing_360"
```

### Step 3: Update Prisma Schema ✅
The schema has been updated to use PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 4: Setup PostgreSQL Database
```bash
npm run db:setup-postgresql
```

### Step 5: Restore Your Data
```bash
npm run db:restore
```

### Step 6: Test the Application
```bash
npm run dev
```

## Data Verification

After migration, verify your data:
```bash
# Check record counts
npx prisma studio

# Or use the verification script
node scripts/verify-migration.js
```

## Troubleshooting

### Common Issues

#### 1. Connection Failed
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Check if port 5432 is listening
lsof -i :5432
```

#### 2. Permission Denied
```bash
# Grant proper permissions
psql postgres
GRANT ALL PRIVILEGES ON DATABASE saas_marketing_360 TO saas_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO saas_user;
```

#### 3. Migration Errors
```bash
# Reset and retry
npx prisma migrate reset --force
npm run db:setup-postgresql
```

### Rollback Plan
If you need to rollback to SQLite:
```bash
# Restore SQLite config
cp .env.backup.sqlite .env

# Update schema back to SQLite
# Change provider back to "sqlite" in prisma/schema.prisma

# Regenerate Prisma client
npx prisma generate

# Your data is safe in the export files
```

## Benefits After Migration

### 1. Case-Insensitive Queries
```sql
-- PostgreSQL native support
SELECT * FROM industries WHERE label ILIKE '%landscaping%';

-- Better performance than SQLite's LIKE with UPPER/LOWER
```

### 2. Full-Text Search
```sql
-- PostgreSQL full-text search capabilities
SELECT * FROM industries 
WHERE to_tsvector('english', label) @@ plainto_tsquery('english', 'landscaping services');
```

### 3. Better Performance
- **Indexes**: More efficient indexing strategies
- **Query Optimization**: Better query planner
- **Concurrent Users**: Handle multiple users simultaneously

### 4. Advanced Features
- **JSON Support**: Native JSON operations
- **Array Types**: Better handling of array data
- **Extensions**: PostGIS for geographic data, etc.

## Post-Migration Tasks

### 1. Update API Routes
The case-insensitive search issues in your NAICS industries will be resolved:
```typescript
// Before (SQLite - problematic)
where: { 
  label: { contains: industry, mode: 'insensitive' }
}

// After (PostgreSQL - native support)
where: { 
  label: { contains: industry, mode: 'insensitive' }
}
```

### 2. Performance Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_industries_label ON industries USING gin(to_tsvector('english', label));
CREATE INDEX idx_keywords_search_term ON keywords(search_term);
```

### 3. Monitoring
```bash
# Monitor database performance
npx prisma studio

# Check query performance
EXPLAIN ANALYZE SELECT * FROM industries WHERE label ILIKE '%landscaping%';
```

## Support

If you encounter issues during migration:
1. Check the troubleshooting section above
2. Review the export logs in `backups/postgresql-migration/`
3. Ensure PostgreSQL is running and accessible
4. Verify your database credentials

## Summary

✅ **Data Exported**: 46,353 records safely exported
✅ **Schema Updated**: Prisma schema configured for PostgreSQL
✅ **Scripts Created**: Automated setup and restore scripts
✅ **Rollback Plan**: Safe rollback to SQLite if needed

**Next Steps**:
1. Install and configure PostgreSQL
2. Update your `.env` file
3. Run `npm run db:setup-postgresql`
4. Run `npm run db:restore`
5. Test your application

Your data is safely backed up and ready for migration! 🚀

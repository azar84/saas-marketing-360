# Industry Update with Subcategories

This document explains how to update the industries table to include the new industries and sub-industries from the CSV data.

## What Was Updated

1. **Schema Changes**: Added `SubIndustry` model to `prisma/schema.prisma`
2. **Migration**: Created migration file for the `sub_industries` table
3. **Scripts**: Updated existing scripts to handle sub-industries

## Files Modified/Created

- `prisma/schema.prisma` - Added SubIndustry model
- `prisma/migrations/20250823000000_add_sub_industries/migration.sql` - Database migration
- `scripts/upload-industries.js` - Updated to include subcategories
- `scripts/create-sub-industries-table.js` - Manual table creation script
- `INDUSTRY_UPDATE_README.md` - This file

## How to Apply the Changes

### Option 1: Use Prisma Migration (Recommended)
```bash
npx prisma migrate dev --name add_sub_industries
```

### Option 2: Manual Table Creation (If migration fails)
```bash
node scripts/create-sub-industries-table.js
```

### Step 3: Upload Industries with Subcategories
```bash
node scripts/upload-industries.js
```

## What the Scripts Do

### `create-sub-industries-table.js`
- Creates the `sub_industries` table if it doesn't exist
- Sets up proper indexes and foreign key constraints
- Safe to run multiple times

### `upload-industries.js`
- Uploads/updates 25 main industries
- Creates 150+ sub-industries
- Handles both new creation and updates of existing data
- Provides detailed logging of the process

## Industries Included

The script includes all 25 industries from your CSV:

1. **Technology & Software** (TECH) - 7 subcategories
2. **Marketing & Advertising** (MKTG) - 6 subcategories
3. **Construction & Building** (CONST) - 6 subcategories
4. **Healthcare & Medical** (HEALTH) - 6 subcategories
5. **Biotech & Life Sciences** (BIOTECH) - 5 subcategories
6. **Financial & Banking** (FINANCE) - 6 subcategories
7. **Insurance & Risk Management** (INSURANCE) - 6 subcategories
8. **Retail & Commerce** (RETAIL) - 6 subcategories
9. **Food & Beverage** (FOOD) - 5 subcategories
10. **Hospitality & Travel** (HOSP) - 6 subcategories
11. **Entertainment & Recreation** (ENTERTAIN) - 5 subcategories
12. **Arts & Culture** (ARTS) - 5 subcategories
13. **Media & Publishing** (MEDIA) - 6 subcategories
14. **Transportation & Logistics** (TRANSPORT) - 6 subcategories
15. **Automotive** (AUTO) - 5 subcategories
16. **Manufacturing & Production** (MFG) - 5 subcategories
17. **Agriculture & Farming** (AGRI) - 5 subcategories
18. **Energy & Utilities** (ENERGY) - 4 subcategories
19. **Real Estate & Property** (REALESTATE) - 5 subcategories
20. **Education & Training** (EDU) - 5 subcategories
21. **Legal & Professional Services** (LEGAL) - 5 subcategories
22. **Business Services** (BUSINESS) - 5 subcategories
23. **Telecommunications** (TELECOM) - 5 subcategories
24. **Government & Public Services** (GOVT) - 5 subcategories
25. **Non-Profit & Social Services** (NONPROFIT) - 5 subcategories

## Database Schema

### Industries Table
- `id` - Primary key
- `code` - Unique industry code (e.g., "TECH", "MKTG")
- `label` - Industry name
- `description` - Industry description
- `isActive` - Whether the industry is active
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Sub Industries Table
- `id` - Primary key
- `name` - Sub-industry name
- `industryId` - Foreign key to industries table
- `isActive` - Whether the sub-industry is active
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Troubleshooting

### If you get "table doesn't exist" errors:
1. Run `node scripts/create-sub-industries-table.js` first
2. Then run `node scripts/upload-industries.js`

### If you get foreign key constraint errors:
1. Make sure the industries table exists and has data
2. Check that the migration was applied correctly

### If you get duplicate key errors:
- The script handles duplicates gracefully
- It will update existing records instead of creating duplicates

## Verification

After running the scripts, you can verify the data:

```bash
# Check total industries
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.industry.count().then(count => { console.log('Industries:', count); prisma.$disconnect(); });"

# Check total sub-industries
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.subIndustry.count().then(count => { console.log('Sub-industries:', count); prisma.$disconnect(); });"
```

## Notes

- The script is idempotent - safe to run multiple times
- It will update existing industries and create new ones
- Sub-industries are linked to their parent industries
- All data is marked as active by default
- The script provides detailed logging of the process

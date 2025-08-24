# 🚨 Industry Manager Recovery Guide

## What Happened

The industry manager is now empty because the upload script may have overwritten or cleared existing industry data. This is a common issue when scripts don't properly handle existing data.

## Quick Fix

### Step 1: Check Current Status
```bash
node scripts/check-current-industries.js
```

This will show you exactly what's currently in the database.

### Step 2: Restore Original Industries
```bash
node scripts/restore-original-industries.js
```

This will restore the basic industries that were likely in your system before.

### Step 3: Add Sub-Industries (Optional)
```bash
node scripts/upload-industries.js
```

This will now safely add sub-industries without overwriting existing data.

## What Each Script Does

### `check-current-industries.js`
- Shows what industries currently exist in the database
- Shows what sub-industries exist
- Shows business-industry relationships
- Helps diagnose the problem

### `restore-original-industries.js`
- Restores 24 basic industries that were likely in your system
- Includes common industries like Technology, Healthcare, Finance, etc.
- Safe to run multiple times
- Won't overwrite existing data

### `upload-industries.js` (Fixed Version)
- Now safely handles existing industries
- Only updates if data actually changed
- Adds sub-industries for each industry
- Won't clear existing data

## Why This Happened

The original upload script was designed to:
1. Update existing industries (which could overwrite data)
2. Create new industries
3. Add sub-industries

But it didn't properly check if the existing data was different before updating, which could have caused issues.

## Prevention

For future reference:
1. **Always backup your database** before running data scripts
2. **Test scripts on a copy** of your data first
3. **Use scripts that check existing data** before making changes
4. **Run scripts in small batches** to test each step

## Verification

After running the recovery scripts, verify everything is working:

1. Check the admin panel industry manager
2. Verify industries are visible
3. Check that sub-industries are linked properly
4. Test creating a new business with industry selection

## If You Still Have Issues

1. Check the database directly:
   ```bash
   node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.industry.count().then(count => { console.log('Industries:', count); prisma.$disconnect(); });"
   ```

2. Check for any error messages in the console

3. Verify the database connection is working

4. Check if the `sub_industries` table was created properly

## Contact

If you continue to have issues, please provide:
- The output from `check-current-industries.js`
- Any error messages you see
- What you see in the admin panel industry manager

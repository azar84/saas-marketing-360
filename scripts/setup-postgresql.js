const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function setupPostgreSQL() {
  try {
    console.log('🚀 Setting up PostgreSQL database...');
    
    // Test database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Run Prisma migrations
    console.log('🔄 Running Prisma migrations...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations completed successfully!');
    } catch (error) {
      console.log('⚠️  Migrations failed, trying to reset...');
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
      console.log('✅ Database reset and migrations completed!');
    }
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated!');
    
    console.log('\n🎉 PostgreSQL setup completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Update your .env file with PostgreSQL credentials');
    console.log('   2. Run: npm run db:restore to restore your data');
    console.log('   3. Test the application');
    
  } catch (error) {
    console.error('❌ PostgreSQL setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function restoreData() {
  try {
    console.log('🚀 Starting data restoration...');
    
    // Find the latest export file
    const exportDir = path.join(process.cwd(), 'backups', 'postgresql-migration');
    const files = await fs.readdir(exportDir);
    const exportFiles = files.filter(f => f.startsWith('sqlite-export-') && f.endsWith('.json'));
    
    if (exportFiles.length === 0) {
      throw new Error('No export files found. Please run the export script first.');
    }
    
    // Sort by timestamp and get the latest
    exportFiles.sort().reverse();
    const latestExport = exportFiles[0];
    const exportPath = path.join(exportDir, latestExport);
    
    console.log(`📁 Using export file: ${latestExport}`);
    
    // Read the export data
    const exportData = JSON.parse(await fs.readFile(exportPath, 'utf8'));
    
    let totalRestored = 0;
    const errors = [];
    
    // Restore data table by table
    for (const [tableName, records] of Object.entries(exportData)) {
      if (!Array.isArray(records) || records.length === 0) {
        console.log(`⏭️  Skipping ${tableName} (no records)`);
        continue;
      }
      
      try {
        console.log(`📊 Restoring ${tableName} (${records.length} records)...`);
        
        // Use dynamic property access to get the table
        const table = prisma[tableName];
        
        if (!table) {
          console.log(`⚠️  Table ${tableName} not found in Prisma schema, skipping...`);
          continue;
        }
        
        // Restore records in batches
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          
          // Handle different table structures
          if (tableName === 'City') {
            // Cities table has special handling due to large size
            for (const record of batch) {
              try {
                await table.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
              } catch (error) {
                console.log(`⚠️  Failed to restore city ${record.id}: ${error.message}`);
              }
            }
          } else {
            // Other tables use batch upsert
            try {
              await table.createMany({
                data: batch,
                skipDuplicates: true
              });
            } catch (error) {
              console.log(`⚠️  Batch restore failed for ${tableName}: ${error.message}`);
              // Fallback to individual records
              for (const record of batch) {
                try {
                  await table.upsert({
                    where: { id: record.id },
                    update: record,
                    create: record
                  });
                } catch (error) {
                  console.log(`⚠️  Failed to restore ${tableName} record ${record.id}: ${error.message}`);
                }
              }
            }
          }
        }
        
        totalRestored += records.length;
        console.log(`✅ ${tableName}: ${records.length} records restored`);
        
      } catch (error) {
        console.error(`❌ Failed to restore ${tableName}:`, error.message);
        errors.push({ table: tableName, error: error.message });
      }
    }
    
    console.log(`\n🎉 Data restoration completed!`);
    console.log(`📊 Total records restored: ${totalRestored}`);
    
    if (errors.length > 0) {
      console.log(`⚠️  Errors encountered: ${errors.length}`);
      errors.forEach(({ table, error }) => {
        console.log(`   - ${table}: ${error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Data restoration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'setup') {
  setupPostgreSQL()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else if (command === 'restore') {
  restoreData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  console.log('Usage:');
  console.log('  node scripts/setup-postgresql.js setup    - Setup PostgreSQL database');
  console.log('  node scripts/setup-postgresql.js restore  - Restore data from export');
}

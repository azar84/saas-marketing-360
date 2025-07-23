const { execSync } = require('child_process');

console.log('🔄 Running simple migration...');

// Set advisory lock timeout to 60 seconds
process.env.DATABASE_ADVISORY_LOCK_TIMEOUT = '60';

async function runMigration() {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`📋 Deploying migrations (attempt ${attempt}/${maxRetries})...`);
      
      // Try to deploy migrations (buffered, so we can parse error output)
      execSync('npx prisma migrate deploy');
      console.log('✅ Migrations deployed successfully!');
      return;
      
    } catch (error) {
      console.log(`⚠️  Migration failed on attempt ${attempt}...`);
      const output = [
        error.message,
        error.stdout && error.stdout.toString(),
        error.stderr && error.stderr.toString()
      ].join('\n');
      console.log('🔍 Error output:', output);

      // Check if this is a timeout error (P1002)
      if (output.includes('P1002') || output.includes('timed out')) {
        if (attempt < maxRetries) {
          console.log(`🔄 Retrying in 5 seconds... (${maxRetries - attempt} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        } else {
          console.error('❌ Migration failed after all retries due to timeout');
          process.exit(1);
        }
      }

      // Check if this is a P3005 error (database not empty)
      if (output.includes('P3005') || output.includes('database schema is not empty')) {
        console.log('🔧 Baselining existing database...');
        
        // Mark all existing migrations as applied
        const fs = require('fs');
        const path = require('path');
        const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
        
        if (fs.existsSync(migrationsDir)) {
          const migrations = fs.readdirSync(migrationsDir)
            .filter(dir => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
            .sort();
          
          console.log(`📝 Found ${migrations.length} migrations to baseline`);
          
          for (const migration of migrations) {
            try {
              execSync(`npx prisma migrate resolve --applied "${migration}"`, { stdio: 'pipe' });
              console.log(`✓ ${migration} marked as applied`);
            } catch (resolveError) {
              // Ignore if already applied
              console.log(`✓ ${migration} already applied`);
            }
          }
          
          // Now try to deploy again (show output live)
          console.log('🔄 Deploying remaining migrations...');
          execSync('npx prisma migrate deploy', { stdio: 'inherit' });
          console.log('✅ All migrations deployed successfully!');
          return;
        }
      }

      // For other errors, fail immediately
      console.error('❌ Migration failed:', output);
      process.exit(1);
    }
  }
}

// Run the migration
runMigration().then(() => {
  console.log('🎉 Migration completed!');
}).catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}); 
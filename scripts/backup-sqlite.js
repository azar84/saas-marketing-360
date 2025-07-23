const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function backupSQLite() {
  try {
    console.log('💾 Creating SQLite database backup...');
    
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const backupDir = path.join(process.cwd(), 'backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.db`);
    
    // Create backup directory
    try {
      await fs.mkdir(backupDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    // Check if database exists
    try {
      await fs.access(dbPath);
    } catch (error) {
      console.error('❌ Database file not found:', dbPath);
      process.exit(1);
    }
    
    // Copy database file
    await fs.copyFile(dbPath, backupPath);
    
    console.log('✅ Backup created successfully!');
    console.log(`📁 Backup location: ${backupPath}`);
    
    // Get file size
    const stats = await fs.stat(backupPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Backup size: ${fileSizeInMB} MB`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Run backup
backupSQLite(); 
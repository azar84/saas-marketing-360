#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up local development environment...');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const hasEnvLocal = fs.existsSync(envLocalPath);

if (hasEnvLocal) {
  console.log('✅ .env.local found - using Neon database');
  console.log('📝 Make sure your Neon database URLs are set in .env.local');
} else {
  console.log('⚠️  No .env.local found - setting up local SQLite database');
  
  // Copy development schema
  const devSchemaPath = path.join(process.cwd(), 'prisma', 'schema.dev.prisma');
  const mainSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  
  if (fs.existsSync(devSchemaPath)) {
    console.log('📋 Copying development schema...');
    fs.copyFileSync(devSchemaPath, mainSchemaPath);
    console.log('✅ Development schema copied');
  }
  
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated');
  } catch (error) {
    console.error('❌ Failed to generate Prisma client:', error.message);
  }
  
  // Push schema to local database
  console.log('🗄️  Setting up local database...');
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Local database set up');
  } catch (error) {
    console.error('❌ Failed to set up local database:', error.message);
  }
  
  // Seed the database
  console.log('🌱 Seeding local database...');
  try {
    execSync('node seed-neon.js', { stdio: 'inherit' });
    console.log('✅ Database seeded');
  } catch (error) {
    console.error('❌ Failed to seed database:', error.message);
  }
}

console.log('\n🎉 Development environment setup complete!');
console.log('\n📋 Next steps:');
if (hasEnvLocal) {
  console.log('1. Make sure your Neon database URLs are correct in .env.local');
  console.log('2. Run: npm run dev');
} else {
  console.log('1. Run: npm run dev');
  console.log('2. Your app will use the local SQLite database');
}
console.log('\n💡 To switch back to Neon:');
console.log('1. Create .env.local with your Neon database URLs');
console.log('2. Run: npm run dev'); 
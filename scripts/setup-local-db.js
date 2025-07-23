#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Local PostgreSQL Database...\n');

// Check if PostgreSQL is installed
try {
  execSync('pg_config --version', { stdio: 'ignore' });
  console.log('✅ PostgreSQL is installed');
} catch (error) {
  console.error('❌ PostgreSQL is not installed. Please install it first:');
  console.error('   brew install postgresql');
  console.error('   brew services start postgresql');
  process.exit(1);
}

// Check if PostgreSQL service is running
try {
  execSync('pg_isready', { stdio: 'ignore' });
  console.log('✅ PostgreSQL service is running');
} catch (error) {
  console.log('⚠️  PostgreSQL service is not running. Starting it...');
  try {
    execSync('brew services start postgresql', { stdio: 'inherit' });
    console.log('✅ PostgreSQL service started');
  } catch (startError) {
    console.error('❌ Failed to start PostgreSQL service');
    process.exit(1);
  }
}

// Create database if it doesn't exist
const dbName = 'saski_ai_local';
try {
  execSync(`createdb ${dbName}`, { stdio: 'ignore' });
  console.log(`✅ Database '${dbName}' created`);
} catch (error) {
  console.log(`ℹ️  Database '${dbName}' already exists`);
}

// Check if .env file exists and has correct DATABASE_URL
const envPath = path.join(process.cwd(), '.env');
const expectedDbUrl = `postgresql://azarmacbook@localhost:5432/${dbName}`;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes(expectedDbUrl)) {
    console.log('✅ Environment file is correctly configured');
  } else {
    console.log('⚠️  Environment file exists but may need DATABASE_URL update');
    console.log(`   Expected: DATABASE_URL="${expectedDbUrl}"`);
  }
} else {
  console.log('⚠️  No .env file found. Creating one...');
  const envContent = `DATABASE_URL="${expectedDbUrl}"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="dvz6gkfa0"
CLOUDINARY_API_KEY="962622565128576"
CLOUDINARY_API_SECRET="vlcn7HN-tOCmrS3-5zfScWK58uw"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created');
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.error('❌ Failed to generate Prisma client');
  process.exit(1);
}

// Push database schema
console.log('\n📊 Setting up database schema...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema created');
} catch (error) {
  console.error('❌ Failed to create database schema');
  process.exit(1);
}

// Create basic data
console.log('\n🌱 Creating basic data...');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBasicData() {
  try {
    // Create site settings
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        logoUrl: null,
        baseUrl: 'http://localhost:3000',
        footerCompanyName: 'Saski AI',
        footerCompanyDescription: 'Transform your customer communication with AI',
        footerBackgroundColor: '#F9FAFB',
        footerTextColor: '#374151',
      }
    });
    console.log('✅ Site settings created');

    // Create basic pages
    const pages = [
      {
        slug: 'home',
        title: 'Home',
        metaTitle: 'Saski AI - Transform Your Customer Communication',
        metaDesc: 'Award-winning AI platform that transforms customer communication with intelligent automation and personalized experiences.',
        sortOrder: 1,
        showInHeader: true,
        showInFooter: false,
      },
      {
        slug: 'about',
        title: 'About',
        metaTitle: 'About Saski AI - Our Story and Mission',
        metaDesc: 'Learn about Saski AI\'s mission to revolutionize customer communication through cutting-edge AI technology.',
        sortOrder: 2,
        showInHeader: true,
        showInFooter: true,
      },
      {
        slug: 'contact',
        title: 'Contact',
        metaTitle: 'Contact Saski AI - Get in Touch',
        metaDesc: 'Get in touch with the Saski AI team. We\'re here to help you transform your customer communication.',
        sortOrder: 3,
        showInHeader: true,
        showInFooter: true,
      },
      {
        slug: 'features',
        title: 'Features',
        metaTitle: 'Saski AI Features - Powerful AI Tools',
        metaDesc: 'Discover the powerful features of Saski AI that will transform your customer communication strategy.',
        sortOrder: 4,
        showInHeader: true,
        showInFooter: false,
      }
    ];

    for (const pageData of pages) {
      await prisma.page.upsert({
        where: { slug: pageData.slug },
        update: {},
        create: pageData
      });
    }
    console.log('✅ Basic pages created');

    await prisma.$disconnect();
    console.log('✅ Basic data setup complete');
  } catch (error) {
    console.error('❌ Failed to create basic data:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createBasicData().then(() => {
  console.log('\n🎉 Local PostgreSQL database setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000/admin-panel');
  console.log('3. Go to SEO Manager to generate your sitemap');
  console.log('\n💡 Your sitemap will be available at: http://localhost:3000/sitemap.xml');
  console.log('💡 Your robots.txt will be available at: http://localhost:3000/robots.txt');
}); 
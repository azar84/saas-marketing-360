const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSubIndustriesTable() {
  try {
    console.log('🔧 Checking if sub_industries table exists...');
    
    // Try to query the sub_industries table to see if it exists
    try {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'sub_industries'
        );
      `;
      
      const tableExists = result[0]?.exists;
      
      if (tableExists) {
        console.log('✅ sub_industries table already exists');
        return true;
      }
    } catch (error) {
      console.log('ℹ️  Could not check table existence, proceeding to create...');
    }
    
    console.log('📝 Creating sub_industries table...');
    
    // Create the table manually
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."sub_industries" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "industryId" INTEGER NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sub_industries_pkey" PRIMARY KEY ("id")
      );
    `;
    
    console.log('✅ Table created successfully');
    
    // Create indexes
    console.log('📊 Creating indexes...');
    
    try {
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "sub_industries_name_industryId_key" 
        ON "public"."sub_industries"("name", "industryId");
      `;
      console.log('✅ Unique index created');
    } catch (error) {
      console.log('⚠️  Unique index creation failed (might already exist):', error.message);
    }
    
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "sub_industries_industryId_idx" 
        ON "public"."sub_industries"("industryId");
      `;
      console.log('✅ Industry ID index created');
    } catch (error) {
      console.log('⚠️  Industry ID index creation failed (might already exist):', error.message);
    }
    
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "sub_industries_isActive_idx" 
        ON "public"."sub_industries"("isActive");
      `;
      console.log('✅ Active status index created');
    } catch (error) {
      console.log('⚠️  Active status index creation failed (might already exist):', error.message);
    }
    
    // Create foreign key constraint
    console.log('🔗 Creating foreign key constraint...');
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "public"."sub_industries" 
        ADD CONSTRAINT IF NOT EXISTS "sub_industries_industryId_fkey" 
        FOREIGN KEY ("industryId") 
        REFERENCES "public"."industries"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `;
      console.log('✅ Foreign key constraint created');
    } catch (error) {
      console.log('⚠️  Foreign key constraint creation failed (might already exist):', error.message);
    }
    
    console.log('🎉 sub_industries table setup completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error creating sub_industries table:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the table creation
if (require.main === module) {
  createSubIndustriesTable()
    .then((success) => {
      if (success) {
        console.log('🎉 Table creation completed successfully!');
        process.exit(0);
      } else {
        console.error('💥 Table creation failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Table creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createSubIndustriesTable };

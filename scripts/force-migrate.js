const { execSync } = require('child_process');

console.log('🔄 Force creating missing tables...');

// SQL to create the tables directly
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS "public"."service_account_credentials" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "privateKeyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "authUri" TEXT NOT NULL,
    "tokenUri" TEXT NOT NULL,
    "authProviderX509CertUrl" TEXT NOT NULL,
    "clientX509CertUrl" TEXT NOT NULL,
    "universeDomain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_account_credentials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."sitemap_submission_logs" (
    "id" TEXT NOT NULL,
    "sitemapUrl" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "searchEngine" TEXT NOT NULL,
    "googleResponse" TEXT,
    "errorMessage" TEXT,
    "statusCode" INTEGER,
    "submissionId" TEXT,
    "warnings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sitemap_submission_logs_pkey" PRIMARY KEY ("id")
);

-- Add warnings column if it doesn't exist (for existing tables)
ALTER TABLE "public"."sitemap_submission_logs" 
ADD COLUMN IF NOT EXISTS "warnings" TEXT;

-- Create script_sections table
CREATE TABLE IF NOT EXISTS "public"."script_sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scriptType" TEXT NOT NULL DEFAULT 'javascript',
    "scriptContent" TEXT NOT NULL,
    "placement" TEXT NOT NULL DEFAULT 'footer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "loadAsync" BOOLEAN NOT NULL DEFAULT false,
    "loadDefer" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "script_sections_pkey" PRIMARY KEY ("id")
);

-- Create unique index on script_sections name
CREATE UNIQUE INDEX IF NOT EXISTS "script_sections_name_key" ON "script_sections"("name");

-- Add scriptSectionId column to page_sections if it doesn't exist
ALTER TABLE "public"."page_sections" 
ADD COLUMN IF NOT EXISTS "scriptSectionId" INTEGER;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'page_sections_scriptSectionId_fkey'
    ) THEN
        ALTER TABLE "public"."page_sections" 
        ADD CONSTRAINT "page_sections_scriptSectionId_fkey" 
        FOREIGN KEY ("scriptSectionId") REFERENCES "script_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
`;

try {
  console.log('📋 Creating tables directly...');
  execSync(`npx prisma db execute --schema prisma/schema.prisma --stdin`, { 
    input: createTablesSQL,
    stdio: ['pipe', 'inherit', 'inherit']
  });
  console.log('✅ Tables created successfully!');
} catch (error) {
  console.error('❌ Failed to create tables:', error.message);
  process.exit(1);
}

console.log('🎉 Force migration completed!'); 
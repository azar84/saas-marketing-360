-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "design_system" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "primaryColor" TEXT NOT NULL DEFAULT '#5243E9',
    "primaryColorLight" TEXT NOT NULL DEFAULT '#6366F1',
    "primaryColorDark" TEXT NOT NULL DEFAULT '#4338CA',
    "secondaryColor" TEXT NOT NULL DEFAULT '#7C3AED',
    "accentColor" TEXT NOT NULL DEFAULT '#06B6D4',
    "successColor" TEXT NOT NULL DEFAULT '#10B981',
    "warningColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "errorColor" TEXT NOT NULL DEFAULT '#EF4444',
    "infoColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "grayLight" TEXT NOT NULL DEFAULT '#F9FAFB',
    "grayMedium" TEXT NOT NULL DEFAULT '#6B7280',
    "grayDark" TEXT NOT NULL DEFAULT '#374151',
    "backgroundPrimary" TEXT NOT NULL DEFAULT '#FFFFFF',
    "backgroundSecondary" TEXT NOT NULL DEFAULT '#F6F8FC',
    "backgroundDark" TEXT NOT NULL DEFAULT '#0F1A2A',
    "textPrimary" TEXT NOT NULL DEFAULT '#1F2937',
    "textSecondary" TEXT NOT NULL DEFAULT '#6B7280',
    "textMuted" TEXT NOT NULL DEFAULT '#9CA3AF',
    "fontFamily" TEXT NOT NULL DEFAULT 'Manrope',
    "fontFamilyMono" TEXT NOT NULL DEFAULT 'ui-monospace',
    "fontSizeBase" TEXT NOT NULL DEFAULT '16px',
    "lineHeightBase" TEXT NOT NULL DEFAULT '1.5',
    "fontWeightNormal" TEXT NOT NULL DEFAULT '400',
    "fontWeightMedium" TEXT NOT NULL DEFAULT '500',
    "fontWeightBold" TEXT NOT NULL DEFAULT '700',
    "spacingXs" TEXT NOT NULL DEFAULT '4px',
    "spacingSm" TEXT NOT NULL DEFAULT '8px',
    "spacingMd" TEXT NOT NULL DEFAULT '16px',
    "spacingLg" TEXT NOT NULL DEFAULT '24px',
    "spacingXl" TEXT NOT NULL DEFAULT '32px',
    "spacing2xl" TEXT NOT NULL DEFAULT '48px',
    "borderRadiusSm" TEXT NOT NULL DEFAULT '4px',
    "borderRadiusMd" TEXT NOT NULL DEFAULT '8px',
    "borderRadiusLg" TEXT NOT NULL DEFAULT '12px',
    "borderRadiusXl" TEXT NOT NULL DEFAULT '16px',
    "borderRadiusFull" TEXT NOT NULL DEFAULT '9999px',
    "shadowSm" TEXT NOT NULL DEFAULT '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    "shadowMd" TEXT NOT NULL DEFAULT '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    "shadowLg" TEXT NOT NULL DEFAULT '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    "shadowXl" TEXT NOT NULL DEFAULT '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    "animationFast" TEXT NOT NULL DEFAULT '150ms',
    "animationNormal" TEXT NOT NULL DEFAULT '300ms',
    "animationSlow" TEXT NOT NULL DEFAULT '500ms',
    "breakpointSm" TEXT NOT NULL DEFAULT '640px',
    "breakpointMd" TEXT NOT NULL DEFAULT '768px',
    "breakpointLg" TEXT NOT NULL DEFAULT '1024px',
    "breakpointXl" TEXT NOT NULL DEFAULT '1280px',
    "breakpoint2xl" TEXT NOT NULL DEFAULT '1536px',
    "themeMode" TEXT NOT NULL DEFAULT 'light',
    "customVariables" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "showInHeader" BOOLEAN NOT NULL DEFAULT false,
    "showInFooter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "hero_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'Untitled Hero Section',
    "layoutType" TEXT NOT NULL DEFAULT 'split',
    "sectionHeight" TEXT NOT NULL DEFAULT '100vh',
    "tagline" TEXT,
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "textAlignment" TEXT NOT NULL DEFAULT 'left',
    "ctaPrimaryId" INTEGER,
    "ctaSecondaryId" INTEGER,
    "mediaUrl" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "mediaAlt" TEXT,
    "mediaHeight" TEXT NOT NULL DEFAULT '80vh',
    "mediaPosition" TEXT NOT NULL DEFAULT 'right',
    "backgroundType" TEXT NOT NULL DEFAULT 'color',
    "backgroundValue" TEXT NOT NULL DEFAULT '#FFFFFF',
    "taglineColor" TEXT NOT NULL DEFAULT '#5243E9',
    "headlineColor" TEXT NOT NULL DEFAULT '#1F2937',
    "subheadingColor" TEXT NOT NULL DEFAULT '#6B7280',
    "ctaPrimaryBgColor" TEXT NOT NULL DEFAULT '#5243E9',
    "ctaPrimaryTextColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "ctaSecondaryBgColor" TEXT NOT NULL DEFAULT 'transparent',
    "ctaSecondaryTextColor" TEXT NOT NULL DEFAULT '#5243E9',
    "showTypingEffect" BOOLEAN NOT NULL DEFAULT false,
    "enableBackgroundAnimation" BOOLEAN NOT NULL DEFAULT false,
    "customClasses" TEXT,
    "paddingTop" INTEGER NOT NULL DEFAULT 80,
    "paddingBottom" INTEGER NOT NULL DEFAULT 80,
    "containerMaxWidth" TEXT NOT NULL DEFAULT '2xl',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hero_sections_ctaPrimaryId_fkey" FOREIGN KEY ("ctaPrimaryId") REFERENCES "ctas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "hero_sections_ctaSecondaryId_fkey" FOREIGN KEY ("ctaSecondaryId") REFERENCES "ctas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "features" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "features_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "layoutType" TEXT NOT NULL DEFAULT 'media_right',
    "badgeText" TEXT,
    "badgeColor" TEXT NOT NULL DEFAULT '#5243E9',
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "description" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "mediaAlt" TEXT,
    "ctaPrimaryText" TEXT,
    "ctaPrimaryUrl" TEXT,
    "ctaSecondaryText" TEXT,
    "ctaSecondaryUrl" TEXT,
    "backgroundType" TEXT NOT NULL DEFAULT 'white',
    "backgroundValue" TEXT,
    "paddingTop" INTEGER NOT NULL DEFAULT 80,
    "paddingBottom" INTEGER NOT NULL DEFAULT 80,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "media_section_features" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mediaSectionId" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "media_section_features_mediaSectionId_fkey" FOREIGN KEY ("mediaSectionId") REFERENCES "media_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "header_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logoUrl" TEXT,
    "logoAlt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "header_nav_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "headerConfigId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "header_nav_items_headerConfigId_fkey" FOREIGN KEY ("headerConfigId") REFERENCES "header_config" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "header_nav_items_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ctas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "style" TEXT NOT NULL DEFAULT 'primary',
    "target" TEXT NOT NULL DEFAULT '_self',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "header_ctas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "headerConfigId" INTEGER NOT NULL,
    "ctaId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "header_ctas_headerConfigId_fkey" FOREIGN KEY ("headerConfigId") REFERENCES "header_config" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "header_ctas_ctaId_fkey" FOREIGN KEY ("ctaId") REFERENCES "ctas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "home_page_hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tagline" TEXT,
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "ctaPrimaryText" TEXT,
    "ctaPrimaryUrl" TEXT,
    "ctaSecondaryText" TEXT,
    "ctaSecondaryUrl" TEXT,
    "mediaUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "trust_indicators" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "url" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "global_features" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "feature_groups" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layoutType" TEXT NOT NULL DEFAULT 'grid',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "feature_group_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "featureGroupId" INTEGER NOT NULL,
    "featureId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "feature_group_items_featureGroupId_fkey" FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "feature_group_items_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "global_features" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "page_feature_groups" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "featureGroupId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "page_feature_groups_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_feature_groups_featureGroupId_fkey" FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "sectionType" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "heroSectionId" INTEGER,
    "featureGroupId" INTEGER,
    "mediaSectionId" INTEGER,
    "pricingSectionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "page_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_sections_heroSectionId_fkey" FOREIGN KEY ("heroSectionId") REFERENCES "hero_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_featureGroupId_fkey" FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_mediaSectionId_fkey" FOREIGN KEY ("mediaSectionId") REFERENCES "media_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_pricingSectionId_fkey" FOREIGN KEY ("pricingSectionId") REFERENCES "pricing_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "section_templates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "avatarUrl" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "billing_cycles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "multiplier" REAL NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "plan_pricing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "billingCycleId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "stripePriceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "plan_pricing_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "plan_pricing_billingCycleId_fkey" FOREIGN KEY ("billingCycleId") REFERENCES "billing_cycles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plan_feature_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "iconUrl" TEXT,
    "dataType" TEXT NOT NULL DEFAULT 'number',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "plan_feature_limits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "featureTypeId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isUnlimited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "plan_feature_limits_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "plan_feature_limits_featureTypeId_fkey" FOREIGN KEY ("featureTypeId") REFERENCES "plan_feature_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shared_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "plan_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "featureId" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "plan_features_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "plan_features_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "shared_features" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_library" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "alt" TEXT,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" REAL,
    "originalUrl" TEXT NOT NULL,
    "localPath" TEXT,
    "publicUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "folderId" INTEGER,
    "tags" TEXT,
    "uploadSource" TEXT NOT NULL DEFAULT 'upload',
    "uploadedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "media_library_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "media_folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_folders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "color" TEXT NOT NULL DEFAULT '#5243E9',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "media_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "media_folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_usage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mediaId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "fieldName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_usage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "basic_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "plan_basic_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "basicFeatureId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plan_basic_features_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "plan_basic_features_basicFeatureId_fkey" FOREIGN KEY ("basicFeatureId") REFERENCES "basic_features" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pricing_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "layoutType" TEXT NOT NULL DEFAULT 'standard',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pricing_section_plans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pricingSectionId" INTEGER NOT NULL,
    "planId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pricing_section_plans_pricingSectionId_fkey" FOREIGN KEY ("pricingSectionId") REFERENCES "pricing_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pricing_section_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "page_pricing_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "pricingSectionId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "page_pricing_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_pricing_sections_pricingSectionId_fkey" FOREIGN KEY ("pricingSectionId") REFERENCES "pricing_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "feature_group_items_featureGroupId_featureId_key" ON "feature_group_items"("featureGroupId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "page_feature_groups_pageId_featureGroupId_key" ON "page_feature_groups"("pageId", "featureGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_pricing_planId_billingCycleId_key" ON "plan_pricing"("planId", "billingCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_feature_limits_planId_featureTypeId_key" ON "plan_feature_limits"("planId", "featureTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "media_usage_mediaId_entityType_entityId_fieldName_key" ON "media_usage"("mediaId", "entityType", "entityId", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "plan_basic_features_planId_basicFeatureId_key" ON "plan_basic_features"("planId", "basicFeatureId");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_section_plans_pricingSectionId_planId_key" ON "pricing_section_plans"("pricingSectionId", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "page_pricing_sections_pageId_pricingSectionId_key" ON "page_pricing_sections"("pageId", "pricingSectionId");

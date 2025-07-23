-- CreateTable
CREATE TABLE "site_settings" (
    "id" SERIAL NOT NULL,
    "logoUrl" TEXT,
    "logoLightUrl" TEXT,
    "logoDarkUrl" TEXT,
    "faviconUrl" TEXT,
    "faviconLightUrl" TEXT,
    "faviconDarkUrl" TEXT,
    "smtpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT,
    "smtpPort" INTEGER DEFAULT 587,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "smtpFromEmail" TEXT,
    "smtpFromName" TEXT,
    "smtpReplyTo" TEXT,
    "emailSignature" TEXT,
    "emailFooterText" TEXT,
    "emailBrandingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "adminNotificationEmail" TEXT,
    "emailLoggingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailRateLimitPerHour" INTEGER DEFAULT 100,
    "companyPhone" TEXT,
    "companyEmail" TEXT,
    "companyAddress" TEXT,
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialLinkedin" TEXT,
    "socialInstagram" TEXT,
    "socialYoutube" TEXT,
    "footerNewsletterFormId" INTEGER,
    "footerCopyrightMessage" TEXT,
    "footerMenuIds" TEXT,
    "footerShowContactInfo" BOOLEAN NOT NULL DEFAULT true,
    "footerShowSocialLinks" BOOLEAN NOT NULL DEFAULT true,
    "footerCompanyName" TEXT,
    "footerCompanyDescription" TEXT,
    "footerBackgroundColor" TEXT DEFAULT '#F9FAFB',
    "footerTextColor" TEXT DEFAULT '#374151',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_system" (
    "id" SERIAL NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_system_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "showInHeader" BOOLEAN NOT NULL DEFAULT false,
    "showInFooter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cta" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "style" TEXT NOT NULL DEFAULT 'primary',
    "target" TEXT NOT NULL DEFAULT '_self',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_sections" (
    "id" SERIAL NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_sections" (
    "id" SERIAL NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "layoutType" TEXT NOT NULL DEFAULT 'media_right',
    "badgeText" TEXT,
    "badgeColor" TEXT NOT NULL DEFAULT '#5243E9',
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "alignment" TEXT NOT NULL DEFAULT 'left',
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "mediaUrl" TEXT,
    "mediaAlt" TEXT,
    "mediaSize" TEXT NOT NULL DEFAULT 'md',
    "mediaPosition" TEXT NOT NULL DEFAULT 'right',
    "showBadge" BOOLEAN NOT NULL DEFAULT true,
    "showCtaButton" BOOLEAN NOT NULL DEFAULT false,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "ctaStyle" TEXT NOT NULL DEFAULT 'primary',
    "enableScrollAnimations" BOOLEAN NOT NULL DEFAULT false,
    "animationType" TEXT NOT NULL DEFAULT 'none',
    "backgroundStyle" TEXT NOT NULL DEFAULT 'solid',
    "backgroundColor" TEXT NOT NULL DEFAULT '#F6F8FC',
    "textColor" TEXT NOT NULL DEFAULT '#0F1A2A',
    "paddingTop" INTEGER NOT NULL DEFAULT 80,
    "paddingBottom" INTEGER NOT NULL DEFAULT 80,
    "containerMaxWidth" TEXT NOT NULL DEFAULT '2xl',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_section_features" (
    "id" SERIAL NOT NULL,
    "mediaSectionId" INTEGER NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'MessageSquare',
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#5243E9',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_section_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" SERIAL NOT NULL,
    "menuId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "target" TEXT NOT NULL DEFAULT '_self',
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_config" (
    "id" SERIAL NOT NULL,
    "logoUrl" TEXT,
    "logoLightUrl" TEXT,
    "logoDarkUrl" TEXT,
    "backgroundColor" TEXT DEFAULT '#FFFFFF',
    "menuTextColor" TEXT DEFAULT '#374151',
    "menuHoverColor" TEXT DEFAULT '#5243E9',
    "menuActiveColor" TEXT DEFAULT '#5243E9',
    "ctaButtons" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_page_hero" (
    "id" SERIAL NOT NULL,
    "tagline" TEXT,
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "ctaPrimaryId" INTEGER,
    "ctaSecondaryId" INTEGER,
    "backgroundType" TEXT NOT NULL DEFAULT 'color',
    "backgroundValue" TEXT NOT NULL DEFAULT '#FFFFFF',
    "backgroundColor" TEXT DEFAULT '#F6F8FC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_page_hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basic_features" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basic_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ctaText" TEXT DEFAULT 'Get Started',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_cycles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "intervalCount" INTEGER NOT NULL DEFAULT 1,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_pricing" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "billingCycleId" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "ctaUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "submitButtonText" TEXT NOT NULL DEFAULT 'Submit',
    "successMessage" TEXT,
    "errorMessage" TEXT,
    "sendToRecipients" BOOLEAN NOT NULL DEFAULT false,
    "recipientEmails" TEXT,
    "sendToSubmitterEmail" BOOLEAN NOT NULL DEFAULT false,
    "submitterEmailField" TEXT,
    "submitterEmailSubject" TEXT,
    "submitterEmailTemplate" TEXT,
    "captchaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "captchaType" TEXT NOT NULL DEFAULT 'creative',
    "backgroundColor" TEXT DEFAULT '#FFFFFF',
    "textColor" TEXT DEFAULT '#374151',
    "borderRadius" TEXT DEFAULT '8px',
    "padding" TEXT DEFAULT '24px',
    "maxWidth" TEXT DEFAULT '600px',
    "position" TEXT DEFAULT 'center',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "validation" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "emailStatus" TEXT DEFAULT 'not_configured',
    "emailMessageId" TEXT,
    "emailRecipients" TEXT,
    "emailSubject" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "emailError" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_library" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "title" TEXT,
    "description" TEXT,
    "tags" TEXT,
    "folderId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "sectionType" TEXT NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- AddForeignKey
ALTER TABLE "hero_sections" ADD CONSTRAINT "hero_sections_ctaPrimaryId_fkey" FOREIGN KEY ("ctaPrimaryId") REFERENCES "cta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_sections" ADD CONSTRAINT "hero_sections_ctaSecondaryId_fkey" FOREIGN KEY ("ctaSecondaryId") REFERENCES "cta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_section_features" ADD CONSTRAINT "media_section_features_mediaSectionId_fkey" FOREIGN KEY ("mediaSectionId") REFERENCES "media_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_page_hero" ADD CONSTRAINT "home_page_hero_ctaPrimaryId_fkey" FOREIGN KEY ("ctaPrimaryId") REFERENCES "cta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_page_hero" ADD CONSTRAINT "home_page_hero_ctaSecondaryId_fkey" FOREIGN KEY ("ctaSecondaryId") REFERENCES "cta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_pricing" ADD CONSTRAINT "plan_pricing_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_pricing" ADD CONSTRAINT "plan_pricing_billingCycleId_fkey" FOREIGN KEY ("billingCycleId") REFERENCES "billing_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE; 
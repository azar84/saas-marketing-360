import { z } from 'zod';

// Common validations
export const IdSchema = z.number().int().positive();
export const SlugSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9-_]+$/, 'Invalid slug format');
export const UrlSchema = z.string().url('Invalid URL format');

// Helper for optional string fields that can be empty
const optionalString = z.string().optional().nullable().transform(val => val === '' ? null : val);
const optionalUrl = z.string().optional().nullable().transform(val => val === '' ? null : val).refine(val => {
  if (val === null || val === undefined) return true;
  // Allow data URIs for base64 encoded images
  if (val.startsWith('data:')) return true;
  // Allow relative paths (starting with /)
  if (val.startsWith('/')) return true;
  // Allow regular URLs
  return z.string().url().safeParse(val).success;
}, { message: "Invalid URL format" });
const optionalEmail = z.string().optional().nullable().transform(val => val === '' ? null : val).refine(val => {
  if (val === null || val === undefined) return true;
  return z.string().email().safeParse(val).success;
}, { message: "Invalid email format" });

// Site Settings Schema
export const SiteSettingsSchema = z.object({
  logoUrl: optionalUrl,
  logoLightUrl: optionalUrl,
  logoDarkUrl: optionalUrl,
  faviconUrl: optionalUrl,
  faviconLightUrl: optionalUrl,
  faviconDarkUrl: optionalUrl,
  
  // Email Configuration
  smtpEnabled: z.boolean().optional(),
  smtpHost: optionalString,
  smtpPort: z.number().int().min(1).max(65535).optional().nullable(),
  smtpSecure: z.boolean().optional(),
  smtpUsername: optionalString,
  smtpPassword: optionalString,
  smtpFromEmail: optionalEmail,
  smtpFromName: optionalString,
  smtpReplyTo: optionalEmail,
  
  // Email Templates Configuration
  emailSignature: optionalString,
  emailFooterText: optionalString,
  emailBrandingEnabled: z.boolean().optional(),
  
  // Email Notification Settings
  adminNotificationEmail: optionalEmail,
  emailLoggingEnabled: z.boolean().optional(),
  emailRateLimitPerHour: z.number().int().min(1).max(1000).optional().nullable(),
  
  // Company Contact Information
  companyPhone: optionalString,
  companyEmail: optionalEmail,
  companyAddress: optionalString,
  
  // Social Media Links
  socialFacebook: optionalUrl,
  socialTwitter: optionalUrl,
  socialLinkedin: optionalUrl,
  socialInstagram: optionalUrl,
  socialYoutube: optionalUrl,
  
  // Footer Configuration
  footerNewsletterFormId: z.number().int().optional().nullable(),
  footerCopyrightMessage: optionalString,
  footerMenuIds: optionalString,
  footerShowContactInfo: z.boolean().optional(),
  footerShowSocialLinks: z.boolean().optional(),
  footerCompanyName: optionalString,
  footerCompanyDescription: optionalString,
  footerBackgroundColor: z.string().optional().nullable(),
  footerTextColor: z.string().optional().nullable(),
  gaMeasurementId: z.string().optional().nullable().refine(val => {
    if (val === '' || val === null || val === undefined) return true;
    return /^G-[A-Z0-9]{10}$/.test(val);
  }, { message: 'Invalid GA4 Measurement ID format. Must be G-XXXXXXXXXX' }),
  gtmContainerId: z.string().optional().nullable().refine(val => {
    if (val === '' || val === null || val === undefined) return true;
    return /^GTM-[A-Z0-9]{5,8}$/.test(val);
  }, { message: 'Invalid GTM Container ID format. Must be GTM-XXXXX to GTM-XXXXXXXX' }),
  gtmEnabled: z.boolean().optional(),
  baseUrl: optionalUrl,
});

// Partial schema for updates - all fields are optional
export const SiteSettingsUpdateSchema = SiteSettingsSchema.partial();

// Page Schema
export const CreatePageSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(1, 'Title is required').max(200),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
  showInHeader: z.boolean().default(true),
  showInFooter: z.boolean().default(false),
});

export const UpdatePageSchema = CreatePageSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// CTA Button Schema
export const CTAStyleEnum = z.enum(['primary', 'secondary', 'accent', 'ghost', 'destructive', 'success', 'info', 'outline', 'muted']);
export const CTATargetEnum = z.enum(['_self', '_blank']);

// Custom URL validation that accepts both full URLs and anchor links
const CTAUrlSchema = z.string()
  .min(1, 'URL is required')
  .refine((url) => {
    // Allow empty anchor tags (#)
    if (url === '#') {
      return true;
    }
    // Allow anchor links (starting with #)
    if (url.startsWith('#')) {
      return url.length > 1; // Must have content after #
    }
    // Allow relative paths (starting with /)
    if (url.startsWith('/')) {
      return true;
    }
    // For full URLs, use standard URL validation
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, {
    message: 'Must be a valid URL, relative path (/page), anchor link (#section), or empty anchor (#)'
  });

export const CreateCTASchema = z.object({
  text: z.string().min(1, 'Text is required').max(50),
  url: CTAUrlSchema,
  customId: z.string().max(50).optional(),
  icon: z.string().max(50).optional(),
  style: CTAStyleEnum.default('primary'),
  target: CTATargetEnum.default('_self'),
  isActive: z.boolean().default(true),
  // JavaScript Events
  onClickEvent: z.string().max(1000).optional(),
  onHoverEvent: z.string().max(1000).optional(),
  onMouseOutEvent: z.string().max(1000).optional(),
  onFocusEvent: z.string().max(1000).optional(),
  onBlurEvent: z.string().max(1000).optional(),
  onKeyDownEvent: z.string().max(1000).optional(),
  onKeyUpEvent: z.string().max(1000).optional(),
  onTouchStartEvent: z.string().max(1000).optional(),
  onTouchEndEvent: z.string().max(1000).optional(),
  // Enhanced Events
  events: z.array(z.object({
    id: z.string(),
    eventType: z.enum(['onClick', 'onHover', 'onMouseOut', 'onFocus', 'onBlur', 'onKeyDown', 'onKeyUp', 'onTouchStart', 'onTouchEnd']),
    functionName: z.string(),
    description: z.string()
  })).optional(),
});

export const UpdateCTASchema = CreateCTASchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Hero Section Schema
export const HeroLayoutTypeEnum = z.enum(['split', 'centered', 'overlay']);
export const HeroTextAlignmentEnum = z.enum(['left', 'center', 'right']);
export const HeroMediaTypeEnum = z.enum(['image', 'video', 'animation', '3d']);
export const HeroMediaPositionEnum = z.enum(['left', 'right']);
export const HeroBackgroundTypeEnum = z.enum(['color', 'gradient', 'image', 'video']);
export const HeroContainerMaxWidthEnum = z.enum(['xl', '2xl', 'full']);

export const CreateHeroSectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional().default('Untitled Hero Section'),
  layoutType: HeroLayoutTypeEnum.default('split'),
  sectionHeight: z.string().max(50).optional().default('100vh'), // CSS height value (e.g., "100vh", "80vh", "600px")
  tagline: z.string().max(100).optional(),
  headline: z.string().min(1, 'Headline is required').max(200),
  subheading: z.string().max(500).optional(),
  textAlignment: HeroTextAlignmentEnum.default('left'),
  
  // CTA References
  ctaPrimaryId: z.number().int().positive().nullable().optional(),
  ctaSecondaryId: z.number().int().positive().nullable().optional(),
  
  // Media + Background
  mediaUrl: z.string().max(500).optional(),
  mediaType: HeroMediaTypeEnum.default('image'),
  mediaAlt: z.string().max(200).optional(),
  mediaHeight: z.string().max(50).default('80vh'), // CSS height value (e.g., "80vh", "500px", "auto")
  mediaPosition: HeroMediaPositionEnum.default('right'),
  backgroundType: HeroBackgroundTypeEnum.default('color'),
  backgroundValue: z.string().max(500).default('#FFFFFF'),
  
  // Text Colors
  taglineColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#5243E9'),
  headlineColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#1F2937'),
  subheadingColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#6B7280'),
  
  // CTA Styling
  ctaPrimaryBgColor: z.string().regex(/^(#[0-9A-Fa-f]{6}|transparent)$/, 'Invalid hex color or transparent').default('#5243E9'),
  ctaPrimaryTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#FFFFFF'),
  ctaSecondaryBgColor: z.string().regex(/^(#[0-9A-Fa-f]{6}|transparent)$/, 'Invalid hex color or transparent').default('transparent'),
  ctaSecondaryTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#5243E9'),
  
  // Advanced
  showTypingEffect: z.boolean().default(false),
  enableBackgroundAnimation: z.boolean().default(false),
  customClasses: z.string().max(500).optional(),
  paddingTop: z.number().int().min(0).max(300).default(80),
  paddingBottom: z.number().int().min(0).max(300).default(80),
  containerMaxWidth: HeroContainerMaxWidthEnum.default('2xl'),
  
  visible: z.boolean().default(true),
});

export const UpdateHeroSectionSchema = CreateHeroSectionSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Feature Schema (for page-specific features)
export const FeatureCategoryEnum = z.enum(['integration', 'ai', 'automation', 'analytics', 'security', 'support']);

export const CreateFeatureSchema = z.object({
  pageId: IdSchema,
  iconUrl: UrlSchema.optional(),
  heading: z.string().min(1, 'Heading is required').max(200),
  subheading: z.string().max(500).optional(),
  position: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export const UpdateFeatureSchema = CreateFeatureSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Trust Indicator Schema
export const TrustIndicatorSchema = z.object({
  iconName: z.string().min(1, 'Icon name is required').max(50),
  text: z.string().min(1, 'Text is required').max(100),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

// Global Feature Schema (for site-wide features)
export const CreateGlobalFeatureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  iconName: z.string().min(1, 'Icon name is required').max(50),
  category: FeatureCategoryEnum.default('integration'),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const UpdateGlobalFeatureSchema = CreateGlobalFeatureSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Feature Group Schema
export const FeatureGroupLayoutEnum = z.enum(['grid', 'list']);

export const CreateFeatureGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  heading: z.string().min(1, 'Heading is required').max(200),
  subheading: z.string().max(500).optional(),
  layoutType: FeatureGroupLayoutEnum.default('grid'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#ffffff'),
  isActive: z.boolean().default(true),
});

export const UpdateFeatureGroupSchema = CreateFeatureGroupSchema.extend({
  id: z.number().min(1, 'Valid ID is required'),
}).partial().required({ id: true });

// Feature Group Item Schema
export const CreateFeatureGroupItemSchema = z.object({
  featureGroupId: IdSchema,
  featureId: IdSchema,
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const UpdateFeatureGroupItemSchema = CreateFeatureGroupItemSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Page Feature Group Schema
export const CreatePageFeatureGroupSchema = z.object({
  pageId: IdSchema,
  featureGroupId: IdSchema,
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const UpdatePageFeatureGroupSchema = CreatePageFeatureGroupSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Home Hero Schema  
export const HomeHeroSchema = z.object({
  heading: z.string().min(1, 'Heading is required').max(200),
  subheading: z.string().max(500),
  backgroundColor: z.string().optional(),
  primaryCtaId: z.number().int().positive().nullable(),
  secondaryCtaId: z.number().int().positive().nullable(),
  isActive: z.boolean().default(true),
  trustIndicators: z.array(TrustIndicatorSchema).optional(),
});

export const UpdateHomeHeroSchema = HomeHeroSchema.partial();

// Header Config Schema
export const HeaderNavItemSchema = z.object({
  pageId: z.number().int().positive().nullable(),
  customText: z.string().max(100).nullable(),
  customUrl: z.string().max(500).nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const HeaderConfigSchema = z.object({
  isActive: z.boolean().default(true),
  navItems: z.array(HeaderNavItemSchema).optional(),
});

// Media Section Validation Schemas
export const MediaLayoutTypeEnum = z.enum(['media_left', 'media_right']);
export const AlignmentEnum = z.enum(['left', 'center', 'right']);
export const MediaTypeEnum = z.enum(['image', 'video']);
export const MediaSizeEnum = z.enum(['sm', 'md', 'lg', 'full']);
export const MediaPositionEnum = z.enum(['left', 'right']);
export const AnimationTypeEnum = z.enum(['fade', 'slide', 'zoom', 'pulse', 'rotate', 'none']);
export const BackgroundStyleEnum = z.enum(['solid', 'gradient', 'radial', 'none']);
export const ContainerMaxWidthEnum = z.enum(['xl', '2xl', 'full']);

export const CreateMediaSectionSchema = z.object({
  position: z.number().int().min(0).default(0),
  layoutType: MediaLayoutTypeEnum.default('media_right'),
  badgeText: z.string().max(100).optional(),
  badgeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#5243E9'),
  headline: z.string().min(1, 'Headline is required').max(200),
  subheading: z.string().max(500).optional(),
  alignment: AlignmentEnum.default('left'),
  mediaType: MediaTypeEnum.default('image'),
  mediaUrl: z.string().max(500).optional(),
  mediaAlt: z.string().max(200).optional(),
  mediaSize: MediaSizeEnum.default('md'),
  mediaPosition: MediaPositionEnum.default('right'),
  showBadge: z.boolean().default(true),
  showCtaButton: z.boolean().default(false),
  ctaText: z.string().max(50).optional(),
  ctaUrl: z.string().max(500).optional(),
  ctaStyle: CTAStyleEnum.default('primary'),
  enableScrollAnimations: z.boolean().default(false),
  animationType: AnimationTypeEnum.default('none'),
  backgroundStyle: BackgroundStyleEnum.default('solid'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#F6F8FC'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#0F1A2A'),
  paddingTop: z.number().int().min(0).max(200).default(80),
  paddingBottom: z.number().int().min(0).max(200).default(80),
  containerMaxWidth: ContainerMaxWidthEnum.default('2xl'),
  isActive: z.boolean().default(true),
  features: z.array(z.object({
    icon: z.string().min(1, 'Icon is required').max(50).default('MessageSquare'),
    label: z.string().min(1, 'Label is required').max(100),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#5243E9'),
    sortOrder: z.number().int().min(0).default(0),
  })).optional().default([]),
});

export const UpdateMediaSectionSchema = CreateMediaSectionSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

export const CreateMediaSectionFeatureSchema = z.object({
  mediaSectionId: IdSchema,
  icon: z.string().min(1, 'Icon is required').max(50).default('MessageSquare'),
  label: z.string().min(1, 'Label is required').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#5243E9'),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateMediaSectionFeatureSchema = CreateMediaSectionFeatureSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Utility function to validate and transform request data
export function validateAndTransform<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  
  return result.data;
}

// API Response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// Media Library Validation Schemas
export const CreateMediaLibrarySchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  alt: z.string().optional(),
  fileType: z.enum(['image', 'video', 'audio', 'document', 'other']),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSize: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  originalUrl: z.string().min(1), // Allow any string, not just URLs for file uploads
  localPath: z.string().optional(),
  publicUrl: z.string().min(1), // Allow any string, not just URLs for relative paths
  thumbnailUrl: z.string().optional(),
  folderId: z.number().int().positive().nullable().optional(),
  tags: z.string().nullable().optional(), // Allow null values
  uploadSource: z.enum(['upload', 'url_import', 'drag_drop']).default('upload'),
  uploadedBy: z.string().optional(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true)
});

export const UpdateMediaLibrarySchema = z.object({
  id: IdSchema,
  filename: z.string().min(1, 'Filename is required').optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  alt: z.string().optional(),
  fileType: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
  mimeType: z.string().min(1, 'MIME type is required').optional(),
  fileSize: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  originalUrl: z.string().url().optional(),
  localPath: z.string().optional(),
  publicUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  folderId: z.number().int().positive().nullable().optional(),
  tags: z.string().optional(),
  uploadSource: z.enum(['upload', 'url_import', 'drag_drop']).optional(),
  uploadedBy: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional()
});

export const CreateMediaFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100),
  description: z.string().optional(),
  parentId: z.number().int().positive().nullable().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#5243E9'),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
});

export const UpdateMediaFolderSchema = z.object({
  id: IdSchema,
  name: z.string().min(1, 'Folder name is required').max(100).optional(),
  description: z.string().optional(),
  parentId: z.number().int().positive().nullable().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

export const CreateMediaUsageSchema = z.object({
  mediaId: IdSchema,
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: IdSchema,
  fieldName: z.string().min(1, 'Field name is required')
});

export const MediaUploadSchema = z.object({
  file: z.any(), // File object validation
  folderId: z.number().int().positive().nullable().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  alt: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const MediaUrlImportSchema = z.object({
  url: z.string().url('Invalid URL format'),
  folderId: z.number().int().positive().nullable().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  alt: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const MediaSearchSchema = z.object({
  query: z.string().optional(),
  fileType: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
  folderId: z.number().int().positive().nullable().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'filename', 'fileSize']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Page Builder Validation Schemas
export const SectionTypeEnum = z.enum(['hero', 'home_hero', 'features', 'media', 'testimonials', 'pricing', 'faq', 'form', 'cta', 'html', 'custom']);

export const CreatePageSectionSchema = z.object({
  pageId: IdSchema,
  sectionType: SectionTypeEnum,
  title: z.string().max(200).optional(),
  subtitle: z.string().max(500).optional(),
  content: z.string().optional(), // JSON content
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
  // References to existing content
  heroSectionId: z.number().int().positive().nullable().optional(),
  featureGroupId: z.number().int().positive().nullable().optional(),
  mediaSectionId: z.number().int().positive().nullable().optional(),
  pricingSectionId: z.number().int().positive().optional(),
  faqSectionId: z.number().int().positive().nullable().optional(),
  faqCategoryId: z.number().int().positive().nullable().optional(),
  contactSectionId: z.number().int().positive().nullable().optional(),
  formId: z.number().int().positive().nullable().optional(),
  htmlSectionId: z.number().int().positive().nullable().optional()
});

export const UpdatePageSectionSchema = CreatePageSectionSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

export const ReorderPageSectionsSchema = z.object({
  pageId: IdSchema,
  sectionIds: z.array(IdSchema).min(1, 'At least one section ID is required'),
});

// Testimonials Validation Schemas
export const CreateTestimonialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  content: z.string().min(1, 'Content is required').max(1000),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5').optional(),
  avatarUrl: UrlSchema.optional(),
  logoUrl: UrlSchema.optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateTestimonialSchema = CreateTestimonialSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// FAQ Validation Schemas
export const CreateFAQSchema = z.object({
  question: z.string().min(1, 'Question is required').max(300),
  answer: z.string().min(1, 'Answer is required').max(2000),
  category: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateFAQSchema = CreateFAQSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Pricing Plans Validation Schemas
export const PricingIntervalEnum = z.enum(['month', 'year', 'one-time']);

export const CreatePricingPlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  interval: PricingIntervalEnum.default('month'),
  features: z.string().min(1, 'Features are required'), // JSON array
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  ctaText: z.string().max(50).optional(),
  ctaUrl: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdatePricingPlanSchema = CreatePricingPlanSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Section Templates Validation Schemas
export const CreateSectionTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  sectionType: SectionTypeEnum,
  description: z.string().max(500).optional(),
  thumbnail: UrlSchema.optional(),
  content: z.string().min(1, 'Content is required'), // JSON template
  isActive: z.boolean().default(true),
});

export const UpdateSectionTemplateSchema = CreateSectionTemplateSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });
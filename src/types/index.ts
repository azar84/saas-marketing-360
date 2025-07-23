// Core API Types
export interface StrapiMedia {
  id: number;
  attributes: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
    mime?: string;
  };
}

export interface StrapiEntity {
  id: number;
  attributes: Record<string, any>;
}

// Hero Section Types
export interface HeroSection {
  id: number;
  attributes: {
    headline: string;
    subheadline: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
    secondaryCtaText?: string;
    secondaryCtaUrl?: string;
    emailPlaceholder: string;
    backgroundImage?: StrapiMedia;
    heroVideo?: StrapiMedia;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Feature Types
export interface Feature {
  id: number;
  attributes: {
    title: string;
    description: string;
    icon?: StrapiMedia;
    iconName?: string;
    category: 'core' | 'integration' | 'communication' | 'automation' | 'analytics';
    isHighlighted: boolean;
    order: number;
    benefits?: string[];
    learnMoreUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Channel Types
export interface Channel {
  id: number;
  attributes: {
    name: string;
    description: string;
    icon?: StrapiMedia;
    iconName?: string;
    color: string;
    isSupported: boolean;
    category: 'messaging' | 'social' | 'email' | 'voice' | 'video';
    features: string[];
    setupGuideUrl?: string;
    demoUrl?: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  };
}

// Language Types
export interface Language {
  id: number;
  attributes: {
    name: string;
    code: string;
    flag?: StrapiMedia;
    isSupported: boolean;
    supportLevel: 'native' | 'translated' | 'beta';
    order: number;
    createdAt: string;
    updatedAt: string;
  };
}

// Integration Types
export interface Integration {
  id: number;
  attributes: {
    name: string;
    description: string;
    logo?: StrapiMedia;
    category: 'crm' | 'calendar' | 'helpdesk' | 'ecommerce' | 'analytics' | 'productivity';
    isActive: boolean;
    isPremium: boolean;
    setupDifficulty: 'easy' | 'medium' | 'advanced';
    setupTime: string;
    features: string[];
    documentationUrl?: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  };
}

// Testimonial Types
export interface Testimonial {
  id: number;
  attributes: {
    content: string;
    authorName: string;
    authorTitle: string;
    authorCompany: string;
    authorAvatar?: StrapiMedia;
    companyLogo?: StrapiMedia;
    rating: number;
    isFeatured: boolean;
    useCase: string;
    resultsAchieved?: string[];
    order: number;
    createdAt: string;
    updatedAt: string;
  };
}

// Pricing Types
export interface PricingPlan {
  id: number;
  attributes: {
    name: string;
    description: string;
    price: number;
    currency: string;
    billingPeriod: 'monthly' | 'yearly';
    isPopular: boolean;
    isActive: boolean;
    features: string[];
    limitations: string[];
    ctaText: string;
    ctaUrl: string;
    order: number;
    maxUsers?: number;
    maxChannels?: number;
    supportLevel: 'community' | 'standard' | 'priority' | 'dedicated';
    createdAt: string;
    updatedAt: string;
  };
}

// FAQ Types
export interface FAQ {
  id: number;
  attributes: {
    question: string;
    answer: string;
    category: 'general' | 'technical' | 'billing' | 'features' | 'integrations';
    isActive: boolean;
    order: number;
    tags: string[];
    helpfulCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

// Benefit Types
export interface Benefit {
  id: number;
  attributes: {
    title: string;
    description: string;
    icon?: StrapiMedia;
    iconName?: string;
    metric?: string;
    metricValue?: string;
    isActive: boolean;
    category: 'efficiency' | 'cost' | 'satisfaction' | 'growth';
    order: number;
    createdAt: string;
    updatedAt: string;
  };
}

// CTA Section Types
export interface CTASection {
  id: number;
  attributes: {
    headline: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
    placement: 'header' | 'footer' | 'inline' | 'floating';
    style: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
    isActive: boolean;
    backgroundImage?: StrapiMedia;
    createdAt: string;
    updatedAt: string;
  };
}

// Blog Types
export interface BlogPost {
  id: number;
  attributes: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: StrapiMedia;
    author: string;
    authorAvatar?: StrapiMedia;
    category: string;
    tags: string[];
    readingTime: number;
    publishedAt: string;
    isActive: boolean;
    seoTitle?: string;
    seoDescription?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Global Settings Types
export interface GlobalSettings {
  id: number;
  attributes: {
    siteName: string;
    siteDescription: string;
    logo?: StrapiMedia;
    favicon?: StrapiMedia;
    contactEmail: string;
    supportEmail: string;
    phone?: string;
    address?: string;
    socialLinks: {
      twitter?: string;
      linkedin?: string;
      facebook?: string;
      github?: string;
      youtube?: string;
    };
    seoDefaults: {
      title: string;
      description: string;
      image?: StrapiMedia;
    };
    analytics: {
      googleAnalyticsId?: string;
      facebookPixel?: string;
      hotjarId?: string;
    };
    maintenance: {
      isEnabled: boolean;
      message: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Animation Props
export interface AnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

// Homepage Props
export interface HomepageProps {
  hero: HeroSection | null;
  features: Feature[];
  benefits: Benefit[];
  channels: Channel[];
  languages: Language[];
  testimonials: Testimonial[];
  pricing: PricingPlan[];
  faqs: FAQ[];
  ctas: CTASection[];
}

// Form Data Types
export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  source?: string;
}

export interface NewsletterFormData {
  email: string;
  firstName?: string;
  interests?: string[];
}

// Utility Types
export type Theme = 'light' | 'dark' | 'system';

export type Device = 'mobile' | 'tablet' | 'desktop';

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// ===================================
// NEW DATABASE TYPES (Prisma-based)
// ===================================

// Site Settings Types
export interface SiteSettings {
  id: number;
  logoUrl: string | null;
  faviconUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Page Types
export interface Page {
  id: number;
  slug: string;
  title: string;
  metaTitle: string | null;
  metaDesc: string | null;
  sortOrder: number;
  showInHeader: boolean;
  showInFooter: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageWithContent extends Page {
  features: FeatureDB[];
  mediaSections: MediaSectionDB[];
  _count: {
    features: number;
    mediaSections: number;
  };
}

// Page Builder Types
export interface PageSection {
  id: number;
  pageId: number;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  sortOrder: number;
  isVisible: boolean;
  heroSectionId?: number;
  featureGroupId?: number;
  mediaSectionId?: number;
  pricingSectionId?: number;
  createdAt: string;
  updatedAt: string;
  page: {
    id: number;
    slug: string;
    title: string;
  };
  heroSection?: HeroSectionDB;
  featureGroup?: FeatureGroupDB;
  mediaSection?: MediaSectionDB;
  pricingSection?: PricingSection;
}

// Feature Group Types
export interface FeatureGroupDB {
  id: number;
  name: string;
  description?: string;
  layoutType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    items: number;
  };
}

// Hero Section Database Types
export interface HeroSectionDB {
  id: number;
  position: number;
  layoutType: string;
  tagline?: string;
  headline: string;
  subheading?: string;
  textAlignment: string;
  ctaPrimaryId?: number;
  ctaSecondaryId?: number;
  mediaUrl?: string;
  mediaType: string;
  mediaAlt?: string;
  mediaPosition: string;
  backgroundType: string;
  backgroundValue: string;
  showTypingEffect: boolean;
  enableBackgroundAnimation: boolean;
  customClasses?: string;
  paddingTop: number;
  paddingBottom: number;
  containerMaxWidth: string;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Feature Database Types
export interface FeatureDB {
  id: number;
  pageId: number;
  iconUrl: string | null;
  heading: string;
  subheading: string | null;
  position: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
  page: Page;
}

// Media Section Database Types
export interface MediaSectionDB {
  id: number;
  pageId: number;
  heading: string | null;
  subheading: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  position: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
  page: Page;
}

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
  isActive: boolean;
}

// Header Configuration Types
export interface HeaderConfig {
  id: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  navItems: HeaderNavItem[];
  ctaButtons: HeaderCTA[];
}

export interface HeaderNavItem {
  id: number;
  headerConfigId: number;
  pageId: number | null;
  customText: string | null;
  customUrl: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  page?: Page | null;
}

export interface CTA {
  id: number;
  text: string;
  url: string;
  style: string;
  target: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeaderCTA {
  id: number;
  headerConfigId: number;
  ctaId: number;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  cta: CTA;
}

// Pricing Section Types (NEW)
export interface PricingSection {
  id: number;
  name: string;
  heading: string;
  subheading?: string;
  layoutType: string;
  pricingCardsBackgroundColor?: string;
  comparisonTableBackgroundColor?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  sectionPlans: PricingSectionPlan[];
  pageAssignments?: PagePricingSection[];
  _count?: {
    sectionPlans: number;
    pageAssignments: number;
  };
}

export interface PricingSectionPlan {
  id: number;
  pricingSectionId: number;
  planId: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  plan: PlanDB;
  pricingSection?: PricingSection;
}

export interface PagePricingSection {
  id: number;
  pageId: number;
  pricingSectionId: number;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  page: Page;
  pricingSection: PricingSection;
}

// Pricing System Types (Database Models)
export interface PlanDB {
  id: string;
  name: string;
  description?: string;
  ctaText?: string;
  position: number;
  isActive: boolean;
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
  pricing: PlanPricing[];
  features: PlanFeature[];
  featureLimits: PlanFeatureLimit[];
  basicFeatures: PlanBasicFeature[];
  sectionPlans?: PricingSectionPlan[];
}

export interface BillingCycle {
  id: string;
  label: string;
  multiplier: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  pricing: PlanPricing[];
}

export interface PlanPricing {
  id: string;
  planId: string;
  billingCycleId: string;
  priceCents: number;
  stripePriceId?: string;
  ctaUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  plan: PlanDB;
  billingCycle: BillingCycle;
}

export interface PlanFeatureType {
  id: string;
  name: string;
  unit?: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  dataType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  limits: PlanFeatureLimit[];
}

export interface PlanFeatureLimit {
  id: string;
  planId: string;
  featureTypeId: string;
  value: string;
  isUnlimited: boolean;
  createdAt: Date;
  updatedAt: Date;
  plan: PlanDB;
  featureType: PlanFeatureType;
}

export interface SharedFeature {
  id: string;
  name: string;
  icon?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  usedIn: PlanFeature[];
}

export interface PlanFeature {
  id: string;
  planId: string;
  featureId?: string;
  available: boolean;
  label?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  plan: PlanDB;
  feature?: SharedFeature;
}

export interface BasicFeature {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  planAssignments: PlanBasicFeature[];
}

export interface PlanBasicFeature {
  id: string;
  planId: string;
  basicFeatureId: string;
  createdAt: Date;
  plan: PlanDB;
  basicFeature: BasicFeature;
}

// Layout Type Options for Pricing Sections
export type PricingSectionLayout = 
  | 'standard'      // Traditional 3-column layout
  | 'comparison'    // Feature comparison table
  | 'cards'         // Card-based layout with shadows
  | 'grid'          // Grid layout for many plans
  | 'list'          // Vertical list layout
  | 'slider';       // Carousel/slider layout 

// Type aliases for compatibility
export type Plan = PlanDB;
export type FeatureType = PlanFeatureType; 
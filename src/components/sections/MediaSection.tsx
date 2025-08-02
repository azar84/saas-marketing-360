'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  ArrowRight,
  MessageSquare,
  Users,
  Shield,
  Clock,
  Zap,
  Star,
  Target,
  Layers,
  Globe,
  Heart,
  Sparkles,
  Rocket,
  Award,
  Briefcase,
  Code,
  Database,
  Monitor,
  Smartphone,
  Wifi,
  Lock,
  // Additional icons from the full library
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Pause,
  Download,
  Upload,
  Share,
  Share2,
  Image,
  Music,
  Film,
  Mail,
  Phone,
  Video,
  Send,
  Home,
  Menu,
  Settings,
  Search,
  ExternalLink,
  DollarSign,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  BarChart,
  Cloud,
  Terminal,
  Bug,
  Component,
  Box,
  User,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  XCircle,
  AlertCircle,
  Info,
  Loader,
  Loader2,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Calendar,
  Timer,
  Hourglass,
  CalendarDays,
  CalendarCheck,
  File,
  FileText,
  Folder,
  Archive,
  Package,
  Key,
  Eye,
  EyeOff,
  Fingerprint,
  Edit,
  Edit2,
  Copy,
  Save,
  Trash2,
  Wrench,
  Hammer,
  Scissors,
  Paintbrush,
  Pen,
  PenTool,
  Crown,
  Diamond,
  Flame,
  Sun,
  Moon,
  Layout,
  Grid,
  Palette,
  CheckSquare,
  Clipboard,
  Book,
  BookOpen,
  Lightbulb,
  Bell,
  BellOff,
  Coffee,
  Gamepad,
  Dice1,
  Dice2,
  Dice3,
  Activity,
  Thermometer,
  Pill,
  Car,
  Plane,
  Train,
  Truck,
  Bike,
  Bus,
  Ship,
  Pizza,
  Apple,
  Cherry,
  Grape,
  GitBranch,
  GitCommit,
  GitMerge
} from 'lucide-react';
import { renderIcon, getIconComponent } from '@/lib/iconUtils';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { applyCTAEvents, executeCTAEvent, CTAWithEvents } from '@/lib/utils';

interface MediaSectionFeature {
  id: number;
  icon: string;
  label: string;
  color: string;
  sortOrder: number;
}

interface MediaSectionProps {
  id: number;
  headline: string;
  subheading?: string;
  mediaUrl: string;
  mediaType: string;
  mediaAlt?: string;
  layoutType: string;
  badgeText?: string;
  badgeColor?: string;
  isActive: boolean;
  position: number;
  alignment: string;
  mediaSize: string;
  mediaPosition: string;
  showBadge: boolean;
  showCtaButton: boolean;
  ctaId?: number;
  cta?: {
    id: number;
    text: string;
    url: string;
    icon?: string;
    style: string;
    target: string;
    isActive: boolean;
    customId?: string;

  };
  enableScrollAnimations: boolean;
  animationType: string;
  backgroundStyle: string;
  backgroundColor: string;
  textColor: string;
  paddingTop: number;
  paddingBottom: number;
  containerMaxWidth: string;
  features: MediaSectionFeature[];
  className?: string;
}

const MediaSection: React.FC<MediaSectionProps> = ({
  id,
  headline,
  subheading,
  mediaUrl,
  mediaType,
  layoutType,
  badgeText,
  badgeColor,
  alignment,
  mediaSize,
  showBadge,
  showCtaButton,
  ctaId,
  cta,
  backgroundStyle,
  backgroundColor,
  textColor,
  paddingTop,
  paddingBottom,
  containerMaxWidth,
  features = [],
  className = '',
  mediaAlt,
  enableScrollAnimations,
  animationType
}) => {
  const { designSystem } = useDesignSystem();
  // Available icons mapping
  const availableIcons: { [key: string]: React.ComponentType<any> } = {
    MessageSquare,
    Users,
    Shield,
    Clock,
    Zap,
    Star,
    Target,
    Layers,
    Globe,
    Heart,
    Sparkles,
    Rocket,
    Award,
    Briefcase,
    Code,
    Database,
    Monitor,
    Smartphone,
    Wifi,
    Lock,
    ArrowLeft,
    ArrowUp,
    ArrowDown,
    Plus,
    Minus,
    X,
    Check,
    ChevronDown,
    ChevronUp,
    Pause,
    Download,
    Upload,
    Share,
    Share2,
    Image,
    Music,
    Film,
    Mail,
    Phone,
    Video,
    Send,
    Home,
    Menu,
    Settings,
    Search,
    ExternalLink,
    DollarSign,
    CreditCard,
    ShoppingCart,
    TrendingUp,
    BarChart,
    Cloud,
    Terminal,
    Bug,
    Component,
    Box,
    User,
    ThumbsUp,
    ThumbsDown,
    Flag,
    Bookmark,
    XCircle,
    AlertCircle,
    Info,
    Loader,
    Loader2,
    RefreshCw,
    RotateCcw,
    RotateCw,
    Calendar,
    Timer,
    Hourglass,
    CalendarDays,
    CalendarCheck,
    File,
    FileText,
    Folder,
    Archive,
    Package,
    Key,
    Eye,
    EyeOff,
    Fingerprint,
    Edit,
    Edit2,
    Copy,
    Save,
    Trash2,
    Wrench,
    Hammer,
    Scissors,
    Paintbrush,
    Pen,
    PenTool,
    Crown,
    Diamond,
    Flame,
    Sun,
    Moon,
    Layout,
    Grid,
    Palette,
    CheckSquare,
    Clipboard,
    Book,
    BookOpen,
    Lightbulb,
    Bell,
    BellOff,
    Coffee,
    Gamepad,
    Dice1,
    Dice2,
    Dice3,
    Activity,
    Thermometer,
    Pill,
    Car,
    Plane,
    Train,
    Truck,
    Bike,
    Bus,
    Ship,
    Pizza,
    Apple,
    Cherry,
    Grape,
    GitBranch,
    GitCommit,
    GitMerge
  };

  const getIconComponent = (iconName: string) => {
    // Handle new universal icon format (library:iconName)
    if (iconName && iconName.includes(':')) {
      const [library, icon] = iconName.split(':');
      
      // Return a component that renders the universal icon
      const IconComponent = (props: any) => {
        return renderIcon(iconName, props);
      };
      return IconComponent;
    }
    
    // Fallback to old format for backward compatibility
    return availableIcons[iconName] || MessageSquare;
  };

  // Get icon category color for consistent styling
  const getIconCategoryColor = (iconName: string) => {
    // Map icons to their categories (same as in admin panel)
    const iconCategories: { [key: string]: string } = {
      MessageSquare: 'communication',
      Users: 'social',
      Shield: 'security',
      Clock: 'time',
      Zap: 'special',
      Star: 'social',
      Target: 'business',
      Layers: 'design',
      Globe: 'navigation',
      Heart: 'social',
      Sparkles: 'special',
      Rocket: 'special',
      Award: 'business',
      Briefcase: 'business',
      Code: 'technology',
      Database: 'technology',
      Monitor: 'technology',
      Smartphone: 'technology',
      Wifi: 'technology',
      Lock: 'security',
      // Additional mappings for new icons
      ArrowRight: 'arrows',
      ArrowLeft: 'arrows',
      ArrowUp: 'arrows',
      ArrowDown: 'arrows',
      Plus: 'actions',
      Minus: 'actions',
      X: 'actions',
      Check: 'actions',
      ChevronDown: 'arrows',
      ChevronUp: 'arrows',
      Pause: 'media',
      Download: 'actions',
      Upload: 'actions',
      Share: 'actions',
      Share2: 'social',
      Image: 'media',
      Music: 'media',
      Film: 'media',
      Mail: 'communication',
      Phone: 'communication',
      Video: 'communication',
      Send: 'communication',
      Home: 'navigation',
      Menu: 'navigation',
      Settings: 'navigation',
      Search: 'navigation',
      ExternalLink: 'navigation',
      DollarSign: 'business',
      CreditCard: 'business',
      ShoppingCart: 'business',
      TrendingUp: 'business',
      BarChart: 'business',
      Cloud: 'technology',
      Terminal: 'technology',
      Bug: 'technology',
      Component: 'technology',
      Box: 'technology',
      User: 'social',
      ThumbsUp: 'social',
      ThumbsDown: 'social',
      Flag: 'social',
      Bookmark: 'social',
      XCircle: 'status',
      AlertCircle: 'status',
      Info: 'status',
      Loader: 'status',
      Loader2: 'status',
      RefreshCw: 'status',
      RotateCcw: 'status',
      RotateCw: 'status',
      Calendar: 'time',
      Timer: 'time',
      Hourglass: 'time',
      CalendarDays: 'time',
      CalendarCheck: 'time',
      File: 'files',
      FileText: 'files',
      Folder: 'files',
      Archive: 'files',
      Package: 'files',
      Key: 'security',
      Eye: 'security',
      EyeOff: 'security',
      Fingerprint: 'security',
      Edit: 'tools',
      Edit2: 'tools',
      Copy: 'tools',
      Save: 'tools',
      Trash2: 'tools',
      Wrench: 'tools',
      Hammer: 'tools',
      Scissors: 'tools',
      Paintbrush: 'tools',
      Pen: 'tools',
      PenTool: 'tools',
      Crown: 'special',
      Diamond: 'special',
      Flame: 'special',
      Sun: 'weather',
      Moon: 'weather',
      Layout: 'design',
      Grid: 'design',
      Palette: 'design',
      CheckSquare: 'productivity',
      Clipboard: 'productivity',
      Book: 'productivity',
      BookOpen: 'productivity',
      Lightbulb: 'productivity',
      Bell: 'productivity',
      BellOff: 'productivity',
      Coffee: 'productivity',
      Gamepad: 'gaming',
      Dice1: 'gaming',
      Dice2: 'gaming',
      Dice3: 'gaming',
      Activity: 'health',
      Thermometer: 'health',
      Pill: 'health',
      Car: 'transport',
      Plane: 'transport',
      Train: 'transport',
      Truck: 'transport',
      Bike: 'transport',
      Bus: 'transport',
      Ship: 'transport',
      Pizza: 'food',
      Apple: 'food',
      Cherry: 'food',
      Grape: 'food',
      GitBranch: 'development',
      GitCommit: 'development',
      GitMerge: 'development'
    };

    const category = iconCategories[iconName] || 'actions';
    
    switch (category) {
      case 'actions': return 'text-blue-600';
      case 'arrows': return 'text-gray-600';
      case 'media': return 'text-purple-600';
      case 'communication': return 'text-green-600';
      case 'navigation': return 'text-indigo-600';
      case 'business': return 'text-emerald-600';
      case 'technology': return 'text-cyan-600';
      case 'social': return 'text-pink-600';
      case 'status': return 'text-orange-600';
      case 'time': return 'text-yellow-600';
      case 'files': return 'text-slate-600';
      case 'security': return 'text-red-600';
      case 'tools': return 'text-amber-600';
      case 'special': return 'text-violet-600';
      case 'weather': return 'text-sky-600';
      case 'design': return 'text-rose-600';
      case 'productivity': return 'text-lime-600';
      case 'gaming': return 'text-fuchsia-600';
      case 'health': return 'text-teal-600';
      case 'transport': return 'text-blue-500';
      case 'food': return 'text-orange-500';
      case 'development': return 'text-gray-700';
      default: return 'text-gray-600';
    }
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getContainerMaxWidth = () => {
    switch (containerMaxWidth) {
      case 'xl': return 'max-w-7xl';
      case '2xl': return 'max-w-8xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-7xl';
    }
  };

  const getMediaSizeClass = () => {
    switch (mediaSize) {
      case 'sm': return 'w-full max-w-md';
      case 'md': return 'w-full max-w-lg';
      case 'lg': return 'w-full max-w-2xl';
      case 'full': return 'w-full';
      default: return 'w-full max-w-lg';
    }
  };

  const getAlignmentClass = () => {
    switch (alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'left': 
      default: return 'text-left';
    }
  };

  const renderCTA = () => {
    if (!showCtaButton || !cta || !cta.isActive) {
      return null;
    }

    const IconComponent = cta.icon ? getIconComponent(cta.icon) : null;
    const ctaEvents = applyCTAEvents(cta as CTAWithEvents);
    
    // Runtime safeguard for allowed styles
    const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'destructive', 'success', 'info', 'outline', 'muted'];
    const safeStyle = allowedStyles.includes(cta.style) ? cta.style : 'primary';

    return (
      <div className="mb-8">
        <a
          href={cta.url}
          target={cta.target}
          id={cta.customId}
          className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg transition-all duration-200 select-none relative overflow-hidden btn-${safeStyle}`}
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-sans)',
          }}
          onClick={ctaEvents.onClick ? (e) => {
            executeCTAEvent(ctaEvents.onClick, e, e.currentTarget);
          } : undefined}
          onMouseOver={ctaEvents.onMouseOver ? (e) => {
            executeCTAEvent(ctaEvents.onMouseOver, e, e.currentTarget);
          } : undefined}
          onMouseOut={ctaEvents.onMouseOut ? (e) => {
            executeCTAEvent(ctaEvents.onMouseOut, e, e.currentTarget);
          } : undefined}
          onFocus={ctaEvents.onFocus ? (e) => {
            executeCTAEvent(ctaEvents.onFocus, e, e.currentTarget);
          } : undefined}
          onBlur={ctaEvents.onBlur ? (e) => {
            executeCTAEvent(ctaEvents.onBlur, e, e.currentTarget);
          } : undefined}
          onKeyDown={ctaEvents.onKeyDown ? (e) => {
            executeCTAEvent(ctaEvents.onKeyDown, e, e.currentTarget);
          } : undefined}
          onKeyUp={ctaEvents.onKeyUp ? (e) => {
            executeCTAEvent(ctaEvents.onKeyUp, e, e.currentTarget);
          } : undefined}
          onTouchStart={ctaEvents.onTouchStart ? (e) => {
            executeCTAEvent(ctaEvents.onTouchStart, e, e.currentTarget);
          } : undefined}
          onTouchEnd={ctaEvents.onTouchEnd ? (e) => {
            executeCTAEvent(ctaEvents.onTouchEnd, e, e.currentTarget);
          } : undefined}
        >
          {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
          {cta.text}
          {cta.target === '_blank' && <ArrowRight className="ml-2 w-4 h-4" />}
        </a>
      </div>
    );
  };

  const getBackgroundStyle = () => {
    const getDesignSystemColor = (colorKey: string, fallback: string) => {
      return designSystem?.[colorKey as keyof typeof designSystem] || fallback;
    };
    
    const bgColor = backgroundColor || getDesignSystemColor('backgroundPrimary', '#ffffff');
    switch (backgroundStyle) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}80 100%)`
        };
      case 'radial':
        return {
          background: `radial-gradient(circle at center, ${bgColor} 0%, ${bgColor}80 100%)`
        };
      case 'none':
        return {
          backgroundColor: 'transparent'
        };
      case 'solid':
      default:
        return {
          backgroundColor: bgColor
        };
    }
  };

  const renderMedia = () => {
    // If no media URL is provided, don't render anything
    if (!mediaUrl || mediaUrl.trim() === '') {
      return null;
    }

    if (mediaType === 'video') {
      const videoId = getVideoId(mediaUrl);
      if (videoId) {
        return (
          <div className={`relative ${getMediaSizeClass()} mx-auto`}>
            <div className="relative w-full pb-[56.25%] h-0 overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Video"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        );
      }
    }
    
    // Default to image for other media types or fallback
    return (
      <div className={`${getMediaSizeClass()} mx-auto`}>
        <img
          src={mediaUrl}
          alt={mediaAlt || headline}
          className="w-full h-auto"
          onError={(e) => {
            // Hide the image if it fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  };

  // Client-side motion wrapper
  const MotionFeatureItem: React.FC<{
    children: React.ReactNode;
    animationType: string;
    index: number;
  }> = ({ children, animationType, index }) => {
    // Animation variants for features
    const featureVariants = {
      slide: {
        animate: {
          x: [0, -40, 0],
          opacity: [0, 0, 1]
        }
      },
      fade: {
        animate: {
          opacity: [0, 1, 0]
        }
      },
      zoom: {
        animate: {
          scale: [0.7, 1, 0.7],
          opacity: [0, 1, 0]
        }
      },
      pulse: {
        animate: {
          scale: [1, 1.08, 1],
          boxShadow: [
            '0 0 0px rgba(0,0,0,0.08)',
            '0 0 12px rgba(80,80,255,0.10)',
            '0 0 0px rgba(0,0,0,0.08)'
          ]
        }
      },
      rotate: {
        animate: {
          rotate: [0, 360]
        }
      }
    };

    // All animations are continuous
    const transition = animationType === 'pulse'
      ? { duration: 6, repeat: Infinity, delay: index * 0.12 }
      : animationType === 'rotate'
      ? { repeat: Infinity, duration: 8, delay: index * 0.12 }
      : animationType === 'fade'
      ? { repeat: Infinity, duration: 5, delay: index * 0.12 }
      : animationType === 'slide'
      ? { repeat: Infinity, duration: 7, delay: index * 0.12 }
      : animationType === 'zoom'
      ? { repeat: Infinity, duration: 5, delay: index * 0.12 }
      : { duration: 0.6, delay: index * 0.1 };
      
    // For rotation, determine direction based on index (alternating)
    const rotationDirection = animationType === 'rotate' ? (index % 2 === 0 ? [0, 360] : [360, 0]) : undefined;

    return (
      <motion.div
        className="flex items-center space-x-3"
        animate={animationType === 'rotate' 
          ? { rotate: rotationDirection }
          : featureVariants[animationType as keyof typeof featureVariants]?.animate
        }
        transition={transition}
      >
        {children}
      </motion.div>
    );
  };

  // --- Render features with selected animation ---
  const renderFeatures = () => {
    if (features.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {features
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((feature, i) => {
            const IconComponent = getIconComponent(feature.icon);
            
            return (
              <MotionFeatureItem
                key={feature.id}
                animationType={animationType}
                index={i}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: designSystem?.grayLight || '#F3F4F6' }}>
                  <IconComponent className="w-4 h-4" style={{ color: feature.color }} />
                </div>
                <span className="text-sm font-medium" style={{ color: textColor }}>
                  {feature.label}
                </span>
              </MotionFeatureItem>
            );
          })}
      </div>
    );
  };

  const isMediaLeft = layoutType === 'media_left';
  const isStacked = layoutType === 'stacked';

  return (
    <>
      {/* Inject button styles for CTAs and TinyMCE content styles */}
      <style dangerouslySetInnerHTML={{ 
        __html: `
          /* TinyMCE Content Styles */
          .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            font-weight: 600;
            line-height: 1.25;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          .prose h1 { font-size: 2.25em; }
          .prose h2 { font-size: 1.875em; }
          .prose h3 { font-size: 1.5em; }
          .prose h4 { font-size: 1.25em; }
          .prose h5 { font-size: 1.125em; }
          .prose h6 { font-size: 1em; }
          
          .prose p {
            margin-top: 1.25em;
            margin-bottom: 1.25em;
            line-height: 1.75;
          }
          
          .prose ul, .prose ol {
            margin-top: 1.25em;
            margin-bottom: 1.25em;
            padding-left: 1.625em;
          }
          
          .prose li {
            margin-top: 0.5em;
            margin-bottom: 0.5em;
          }
          
          .prose ul {
            list-style-type: disc;
          }
          
          .prose ol {
            list-style-type: decimal;
          }
          
          .prose blockquote {
            font-style: italic;
            border-left: 4px solid #e5e7eb;
            padding-left: 1em;
            margin: 1.5em 0;
          }
          
          .prose strong {
            font-weight: 600;
          }
          
          .prose em {
            font-style: italic;
          }
          
          .prose code {
            background-color: #f3f4f6;
            padding: 0.125em 0.25em;
            border-radius: 0.25em;
            font-size: 0.875em;
          }
          
          .prose pre {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 1em;
            border-radius: 0.5em;
            overflow-x: auto;
            margin: 1.5em 0;
          }
          
          .prose a {
            color: var(--color-primary, #5243E9);
            text-decoration: underline;
          }
          
          .prose a:hover {
            color: var(--color-primary-dark, #4338CA);
          }
          
          /* Button Styles */
          .btn-primary {
            background-color: var(--color-primary);
            color: white;
            border: none;
          }
          .btn-primary:hover:not(:disabled) {
            background-color: var(--color-primary-light, var(--color-primary));
            transform: scale(1.02);
          }
          .btn-primary:active:not(:disabled) {
            background-color: var(--color-primary-dark, var(--color-primary));
            transform: scale(0.98);
          }

          .btn-secondary {
            background-color: var(--color-secondary, #7C3AED);
            color: white;
            border: 1px solid var(--color-secondary, #7C3AED);
          }
          .btn-secondary:hover:not(:disabled) {
            background-color: var(--color-secondary-dark, var(--color-secondary));
            transform: scale(1.02);
          }

          .btn-accent {
            background-color: var(--color-accent);
            color: white;
            border: none;
          }
          .btn-accent:hover:not(:disabled) {
            background-color: var(--color-accent-dark, var(--color-accent));
            transform: scale(1.02);
          }

          .btn-ghost {
            background-color: transparent;
            color: var(--color-text-primary);
            border: 1px solid transparent;
          }
          .btn-ghost:hover:not(:disabled) {
            background-color: var(--color-primary-light, rgba(99, 102, 241, 0.1));
            opacity: 0.1;
            transform: scale(1.02);
          }

          .btn-destructive {
            background-color: var(--color-error);
            color: white;
            border: none;
          }
          .btn-destructive:hover:not(:disabled) {
            background-color: var(--color-error-dark, var(--color-error));
            transform: scale(1.02);
          }

          .btn-success {
            background-color: var(--color-success);
            color: white;
            border: none;
          }
          .btn-success:hover:not(:disabled) {
            background-color: var(--color-success-dark, var(--color-success));
            transform: scale(1.02);
          }

          .btn-info {
            background-color: var(--color-info);
            color: white;
            border: none;
          }
          .btn-info:hover:not(:disabled) {
            background-color: var(--color-info-dark, var(--color-info));
            transform: scale(1.02);
          }

          .btn-outline {
            background-color: transparent;
            color: var(--color-primary);
            border: 2px solid var(--color-primary);
          }
          .btn-outline:hover:not(:disabled) {
            background-color: var(--color-primary-light, rgba(99, 102, 241, 0.1));
            transform: scale(1.02);
          }

          .btn-muted {
            background-color: var(--color-bg-secondary);
            color: var(--color-text-muted);
            border: 1px solid var(--color-border-medium);
            cursor: not-allowed;
            opacity: 0.5;
          }
        `
      }} />
      
      <section
        className={`py-24 ${className} ${enableScrollAnimations ? 'scroll-animation' : ''}`}
        data-animation-type={animationType}
        style={{
          ...getBackgroundStyle(),
          color: textColor || designSystem?.textPrimary || '#000000',
          paddingTop: `${paddingTop || 0}px`,
          paddingBottom: `${paddingBottom || 0}px`,
          backgroundColor: backgroundStyle === 'none' ? 'transparent' : (backgroundColor || designSystem?.backgroundPrimary || '#ffffff')
        }}
      >

      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${getContainerMaxWidth()}`}>
        {isStacked ? (
          // Stacked layout
          <div className="space-y-12">
            <div className={`${getAlignmentClass()}`}>
              {showBadge && badgeText && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6"
                     style={{ backgroundColor: badgeColor || designSystem?.primaryColor || '#5243E9', color: 'white' }}>
                  {badgeText}
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                {headline}
              </h2>
              {subheading && (
                <div 
                  className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto mb-8 prose prose-lg max-w-none"
                  style={{ color: textColor || designSystem?.textSecondary || '#666666' }}
                  dangerouslySetInnerHTML={{ __html: subheading }}
                />
              )}
              {renderCTA()}
              {renderFeatures()}
            </div>
            <div className="flex justify-center">
              {renderMedia()}
            </div>
          </div>
        ) : (
          // Side-by-side layout
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isMediaLeft ? 'lg:grid-flow-col-dense' : ''}`}>
            <div className={`${getAlignmentClass()} ${isMediaLeft ? 'lg:col-start-2' : ''}`}>
              {showBadge && badgeText && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6"
                     style={{ backgroundColor: badgeColor || designSystem?.primaryColor || '#5243E9', color: 'white' }}>
                  {badgeText}
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                {headline}
              </h2>
              {subheading && (
                <div 
                  className="text-lg sm:text-xl opacity-90 mb-8 prose prose-lg max-w-none"
                  style={{ color: textColor || designSystem?.textSecondary || '#666666' }}
                  dangerouslySetInnerHTML={{ __html: subheading }}
                />
              )}
              {renderCTA()}
              {renderFeatures()}
            </div>
            <div className={`${isMediaLeft ? 'lg:col-start-1' : ''}`}>
              {renderMedia()}
            </div>
          </div>
        )}
      </div>
    </section>
    </>
  );
};

export default MediaSection; 

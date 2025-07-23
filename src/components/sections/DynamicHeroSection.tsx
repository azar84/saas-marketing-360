'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { renderIcon } from '@/lib/iconUtils';
import { applyCTAEvents, hasCTAEvents, executeCTAEvent, type CTAWithEvents } from '@/lib/utils';

interface CTA {
  id: number;
  text: string;
  url: string;
  customId?: string;
  icon?: string;
  style: string;
  target: string;
  isActive: boolean;
  // JavaScript Events
  onClickEvent?: string;
  onHoverEvent?: string;
  onMouseOutEvent?: string;
  onFocusEvent?: string;
  onBlurEvent?: string;
  onKeyDownEvent?: string;
  onKeyUpEvent?: string;
  onTouchStartEvent?: string;
  onTouchEndEvent?: string;
}

interface HeroSectionData {
  id: number;
  layoutType: string;
  sectionHeight?: string; // Added missing section height field
  tagline?: string;
  headline: string;
  subheading?: string;
  textAlignment: string;
  ctaPrimaryId?: number;
  ctaSecondaryId?: number;
  mediaUrl?: string;
  mediaType: string;
  mediaAlt?: string;
  mediaHeight: string;
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
  ctaPrimary?: CTA;
  ctaSecondary?: CTA;
}

interface DynamicHeroSectionProps {
  heroSection: HeroSectionData;
  overrideTitle?: string;
  overrideSubtitle?: string;
  className?: string;
}

const DynamicHeroSection: React.FC<DynamicHeroSectionProps> = ({
  heroSection,
  overrideTitle,
  overrideSubtitle,
  className = ''
}) => {
  const {
    layoutType,
    sectionHeight,
    tagline,
    headline,
    subheading,
    textAlignment,
    mediaUrl,
    mediaType,
    mediaAlt,
    mediaHeight,
    mediaPosition,
    backgroundType,
    backgroundValue,
    showTypingEffect,
    enableBackgroundAnimation,
    customClasses,
    paddingTop,
    paddingBottom,
    containerMaxWidth,
    ctaPrimary,
    ctaSecondary
  } = heroSection;

  // Get icon component with responsive sizing
  const getIconComponent = (iconName: string, size?: string) => {
    if (!iconName) return null;
    
    const iconSize = size || getButtonSizeClasses(true).icon;
    
    // Handle new universal icon format (library:iconName)
    if (iconName.includes(':')) {
      return renderIcon(iconName, { className: iconSize });
    }
    
    // Fallback to old format for backward compatibility - assume lucide
    return renderIcon(`lucide:${iconName}`, { className: iconSize });
  };

  // Get container max width class
  const getContainerMaxWidth = () => {
    switch (containerMaxWidth) {
      case 'xl': return 'max-w-7xl';
      case '2xl': return 'max-w-screen-2xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-screen-2xl';
    }
  };

  // Get text alignment class
  const getTextAlignment = () => {
    switch (textAlignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'left':
      default: return 'text-left';
    }
  };

  // Get background styles
  const getBackgroundStyles = () => {
    switch (backgroundType) {
      case 'gradient':
        return { background: backgroundValue };
      case 'image':
        return { 
          backgroundImage: `url(${backgroundValue})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'video':
        return { backgroundColor: '#000' }; // Fallback for video
      case 'color':
      default:
        return { backgroundColor: backgroundValue };
    }
  };

  // Determine if text should be light or dark based on background
  const getTextColor = () => {
    if (backgroundType === 'color') {
      // Simple heuristic: if background is dark, use light text
      const hex = backgroundValue.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? 'text-gray-900' : 'text-white';
    }
    // For gradients and images, assume light text
    return 'text-white';
  };

  // Get responsive button size classes - modernized and sleeker
  const getButtonSizeClasses = (isHeroSection = true) => {
    if (isHeroSection) {
      // More refined, less bulky buttons for hero sections
      return {
        padding: 'px-6 py-3 lg:px-8 lg:py-4',
        text: 'text-sm lg:text-base',
        icon: 'w-4 h-4 lg:w-5 lg:h-5'
      };
    }
    return {
      padding: 'px-4 py-2',
      text: 'text-sm',
      icon: 'w-4 h-4'
    };
  };

  // Get button style classes - modern, clean design
  const getButtonClasses = (buttonType: 'primary' | 'secondary', style: string) => {
    const buttonSizes = getButtonSizeClasses(true);
    const baseClasses = `${buttonSizes.padding} ${buttonSizes.text} rounded-xl font-medium transition-all duration-300 hover:transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm`;
    
    // Use smart design system colors based on background
    const smartTextColor = getTextColor();
    const isDarkBackground = smartTextColor === 'text-white';
    
    switch (style) {
      case 'primary':
        return `${baseClasses} ${isDarkBackground 
          ? 'bg-white/95 text-[var(--color-primary)] hover:bg-white border border-white/20'
          : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] border border-[var(--color-primary)]'}`;
      case 'secondary':
        return `${baseClasses} ${isDarkBackground
          ? 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
          : 'bg-[var(--color-bg-secondary)] text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-white'}`;
      case 'accent':
        return `${baseClasses} ${isDarkBackground
          ? 'bg-[var(--color-accent)]/90 text-white hover:bg-[var(--color-accent)] border border-[var(--color-accent)]/30'
          : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] border border-[var(--color-accent)]'}`;
      case 'ghost':
        return `${baseClasses} ${isDarkBackground
          ? 'bg-transparent text-white hover:bg-white/10 border border-transparent'
          : 'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-primary)]/5 border border-transparent'}`;
      case 'destructive':
        return `${baseClasses} ${isDarkBackground
          ? 'bg-[var(--color-error)]/90 text-white hover:bg-[var(--color-error)] border border-[var(--color-error)]/30'
          : 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error-dark)] border border-[var(--color-error)]'}`;
      case 'success':
        return `${baseClasses} ${isDarkBackground
          ? 'bg-[var(--color-success)]/90 text-white hover:bg-[var(--color-success)] border border-[var(--color-success)]/30'
          : 'bg-[var(--color-success)] text-white hover:bg-[var(--color-success-dark)] border border-[var(--color-success)]'}`;
      case 'info':
        return `${baseClasses} ${isDarkBackground
          ? 'bg-[var(--color-info)]/90 text-white hover:bg-[var(--color-info)] border border-[var(--color-info)]/30'
          : 'bg-[var(--color-info)] text-white hover:bg-[var(--color-info-dark)] border border-[var(--color-info)]'}`;
      case 'outline':
        return `${baseClasses} ${isDarkBackground
          ? 'bg-transparent text-white border-2 border-white/50 hover:bg-white/10 hover:border-white'
          : 'bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]'}`;
      case 'muted':
        return `${baseClasses} bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border-medium)] cursor-not-allowed opacity-50`;
      default:
        return `${baseClasses} ${isDarkBackground 
          ? 'bg-white/95 text-[var(--color-primary)] hover:bg-white border border-white/20'
          : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] border border-[var(--color-primary)]'}`;
    }
  };

  // Get responsive media height classes - larger, more prominent images
  const getMediaHeightClasses = () => {
    // If section height is specified, make media larger and more prominent
    if (sectionHeight) {
      const sectionVh = parseInt(sectionHeight);
      if (sectionVh >= 100) return 'h-[65vh] lg:h-[75vh]'; // Large for full screen
      if (sectionVh >= 80) return 'h-[55vh] lg:h-[65vh]';  // Prominent for large sections
      if (sectionVh >= 60) return 'h-[45vh] lg:h-[55vh]';  // Good size for medium
      if (sectionVh >= 50) return 'h-[40vh] lg:h-[45vh]';  // Balanced for compact sections
    }
    
    // Fallback to media height settings - all increased
    if (mediaHeight.includes('vh')) {
      const vh = parseInt(mediaHeight);
      if (vh >= 90) return 'h-[65vh] lg:h-[75vh]';
      if (vh >= 75) return 'h-[55vh] lg:h-[65vh]';
      if (vh >= 60) return 'h-[45vh] lg:h-[55vh]';
      if (vh >= 50) return 'h-[40vh] lg:h-[50vh]';
      return 'h-[35vh] lg:h-[45vh]';
    }
    if (mediaHeight.includes('px')) {
      const px = parseInt(mediaHeight);
      if (px >= 800) return 'h-80 lg:h-[500px]';
      if (px >= 600) return 'h-72 lg:h-96';
      if (px >= 400) return 'h-64 lg:h-80';
      return 'h-56 lg:h-64';
    }
    // Default larger proportions
    return 'h-64 md:h-80 lg:h-96';
  };

  // Render media content - clean, modern styling
  const renderMedia = () => {
    if (!mediaUrl) return null;

    const heightClasses = getMediaHeightClasses();
    const mediaClasses = `w-full object-cover rounded-2xl ${heightClasses}`;

    switch (mediaType) {
      case 'video':
        if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
          const videoId = mediaUrl.includes('youtu.be') 
            ? mediaUrl.split('/').pop()?.split('?')[0]
            : mediaUrl.split('v=')[1]?.split('&')[0];
          
          return (
            <div className={`relative w-full rounded-2xl overflow-hidden ${heightClasses}`}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        return (
          <video 
            className={mediaClasses}
            controls
            muted
            autoPlay
            loop
          >
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      
      case 'animation':
        return (
          <div className={`w-full flex items-center justify-center rounded-2xl ${heightClasses}`}>
            <div className="animate-pulse bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl w-full h-full flex items-center justify-center">
              <span className="text-white font-medium">Animation Placeholder</span>
            </div>
          </div>
        );
      
      case '3d':
        return (
          <div className={`w-full flex items-center justify-center rounded-2xl ${heightClasses}`}>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full h-full flex items-center justify-center">
              <span className="text-white font-medium">3D Model Placeholder</span>
            </div>
          </div>
        );
      
      case 'image':
      default:
        return (
          <img
            src={mediaUrl}
            alt={mediaAlt || headline}
            className={mediaClasses}
          />
        );
    }
  };

  // Render CTAs with modern spacing and layout
  const renderCTAs = () => {
    const ctas: React.ReactElement[] = [];

    if (ctaPrimary && ctaPrimary.isActive) {
      const ctaEvents = applyCTAEvents(ctaPrimary as CTAWithEvents);
      // Runtime safeguard for allowed styles
      const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'outline', 'muted'];
      const safeStyle = allowedStyles.includes(ctaPrimary.style) ? ctaPrimary.style : 'primary';
      // Always render as <a> tag if URL is present (even if it's '#')
      if (ctaPrimary.url) {
        ctas.push(
          <motion.a
            key="primary"
            href={ctaPrimary.url}
            target={ctaPrimary.target}
            id={ctaPrimary.customId}
            className={`inline-flex items-center gap-2.5 ${getButtonClasses('primary', safeStyle)}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
            {ctaPrimary.icon && getIconComponent(ctaPrimary.icon)}
            {ctaPrimary.text}
          </motion.a>
        );
      } else {
        // Fallback to button if no URL
        ctas.push(
          <motion.button
            key="primary"
            type="button"
            id={ctaPrimary.customId}
            className={`inline-flex items-center gap-2.5 ${getButtonClasses('primary', safeStyle)}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
            {ctaPrimary.icon && getIconComponent(ctaPrimary.icon)}
            {ctaPrimary.text}
          </motion.button>
        );
      }
    }

    if (ctaSecondary && ctaSecondary.isActive) {
      const ctaEvents = applyCTAEvents(ctaSecondary as CTAWithEvents);
      // Runtime safeguard for allowed styles
      const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'outline', 'muted'];
      const safeStyle = allowedStyles.includes(ctaSecondary.style) ? ctaSecondary.style : 'primary';
      // Always render as <a> tag if URL is present (even if it's '#')
      if (ctaSecondary.url) {
        ctas.push(
          <motion.a
            key="secondary"
            href={ctaSecondary.url}
            target={ctaSecondary.target}
            id={ctaSecondary.customId}
            className={`inline-flex items-center gap-2.5 ${getButtonClasses('secondary', safeStyle)}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
            {ctaSecondary.icon && getIconComponent(ctaSecondary.icon)}
            {ctaSecondary.text}
          </motion.a>
        );
      } else {
        // Fallback to button if no URL
        ctas.push(
          <motion.button
            key="secondary"
            type="button"
            id={ctaSecondary.customId}
            className={`inline-flex items-center gap-2.5 ${getButtonClasses('secondary', safeStyle)}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
            {ctaSecondary.icon && getIconComponent(ctaSecondary.icon)}
            {ctaSecondary.text}
          </motion.button>
        );
      }
    }

    return ctas.length > 0 ? (
      <div className={`flex flex-col sm:flex-row gap-3 lg:gap-4 ${
        textAlignment === 'center' ? 'justify-center' : 
        textAlignment === 'right' ? 'justify-end' : 
        'justify-start'
      }`}>
        {ctas}
      </div>
    ) : null;
  };

  // Layout-specific rendering
  const renderContent = () => {
    const smartTextColor = getTextColor(); // Smart design system color calculation
    const textAlign = getTextAlignment();
    
    const titleElement = (
      <motion.h1 
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 lg:mb-6 leading-tight ${textAlign} ${smartTextColor}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {overrideTitle || headline}
      </motion.h1>
    );

    const subtitleElement = (overrideSubtitle || subheading) ? (
      <motion.p 
        className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl mb-6 lg:mb-8 ${textAlign} max-w-4xl leading-relaxed ${textAlignment === 'center' ? 'mx-auto' : ''} ${smartTextColor === 'text-white' ? 'text-white/90' : 'text-gray-600'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {overrideSubtitle || subheading}
      </motion.p>
    ) : null;

    const taglineElement = tagline ? (
      <motion.div 
        className={`inline-block px-3 py-1.5 lg:px-4 lg:py-2 rounded-full ${smartTextColor === 'text-white' ? 'bg-white/15 border-white/25' : 'bg-gray-100 border-gray-200'} backdrop-blur-sm border text-xs lg:text-sm font-medium mb-4 lg:mb-6 ${smartTextColor}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {tagline}
      </motion.div>
    ) : null;

    const ctasElement = (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {renderCTAs()}
      </motion.div>
    );

    switch (layoutType) {
      case 'centered':
        return (
          <div className="text-center max-w-5xl mx-auto">
            <div className="space-y-4 lg:space-y-6">
            {taglineElement}
            {titleElement}
            {subtitleElement}
            {ctasElement}
            </div>
            {mediaUrl && (
              <motion.div 
                className="mt-10 lg:mt-14"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {renderMedia()}
              </motion.div>
            )}
          </div>
        );

      case 'overlay':
        return (
          <div className="relative z-10">
            <div className={`${textAlign}`}>
              {taglineElement}
              {titleElement}
              {subtitleElement}
              {ctasElement}
            </div>
            {mediaUrl && (
              <div className="absolute inset-0 -z-10">
                {renderMedia()}
              </div>
            )}
          </div>
        );

      case 'split':
      default:
        const isMediaLeft = mediaPosition === 'left';
        return (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 xl:gap-14 items-center ${isMediaLeft ? 'lg:flex-row-reverse' : ''}`}>
            <motion.div 
              className={`${textAlign} ${isMediaLeft ? 'lg:order-2' : ''} space-y-4 lg:space-y-6`}
              initial={{ opacity: 0, x: isMediaLeft ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {taglineElement}
              {titleElement}
              {subtitleElement}
              {ctasElement}
            </motion.div>
            {mediaUrl && (
              <motion.div 
                className={`${isMediaLeft ? 'lg:order-1' : ''}`}
                initial={{ opacity: 0, x: isMediaLeft ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {renderMedia()}
              </motion.div>
            )}
          </div>
        );
    }
  };

  // Get section height classes and styles
  const getSectionHeight = () => {
    if (!sectionHeight) return { className: 'min-h-[70vh]', style: {} }; // Default minimum height
    
    if (sectionHeight.includes('vh')) {
      const vh = parseInt(sectionHeight);
      if (vh === 100) return { className: 'min-h-screen', style: {} };
      if (vh >= 90) return { className: 'min-h-[90vh]', style: {} };
      if (vh >= 80) return { className: 'min-h-[80vh]', style: {} };
      if (vh >= 70) return { className: 'min-h-[70vh]', style: {} };
      if (vh >= 60) return { className: 'min-h-[60vh]', style: {} };
      if (vh >= 50) return { className: 'min-h-[50vh]', style: {} };
      return { className: '', style: { minHeight: sectionHeight } };
    }
    
    if (sectionHeight.includes('px')) {
      const px = parseInt(sectionHeight);
      if (px >= 800) return { className: 'min-h-[800px]', style: {} };
      if (px >= 600) return { className: 'min-h-[600px]', style: {} };
      if (px >= 500) return { className: 'min-h-[500px]', style: {} };
      if (px >= 400) return { className: 'min-h-[400px]', style: {} };
      return { className: '', style: { minHeight: sectionHeight } };
    }
    
    return { className: '', style: { minHeight: sectionHeight } };
  };

  const sectionHeightConfig = getSectionHeight();

  return (
    <section 
      className={`relative overflow-hidden ${sectionHeightConfig.className} flex items-center ${customClasses || ''} ${className}`}
      style={{
        ...getBackgroundStyles(),
        ...sectionHeightConfig.style,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        marginTop: '-3vh'
      }}
    >
      {/* Background Animation */}
      {enableBackgroundAnimation && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-white/5 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        </div>
      )}

      {/* Background Video */}
      {backgroundType === 'video' && (
        <div className="absolute inset-0 -z-10">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={backgroundValue} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}

      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${getContainerMaxWidth()} relative z-10 w-full`}>
        <div className="w-full">
        {renderContent()}
        </div>
      </div>
    </section>
  );
};

export default DynamicHeroSection; 

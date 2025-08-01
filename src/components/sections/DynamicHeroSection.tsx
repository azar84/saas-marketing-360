'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { renderIcon } from '@/lib/iconUtils';
import { applyCTAEvents, hasCTAEvents, executeCTAEvent, executeCTAEventFromConfig, cn, type CTAWithEvents } from '@/lib/utils';

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
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundOverlay?: string;
  // Color configurations
  taglineColor?: string;
  headlineColor?: string;
  subheadingColor?: string;
  ctaPrimaryBgColor?: string;
  ctaPrimaryTextColor?: string;
  ctaSecondaryBgColor?: string;
  ctaSecondaryTextColor?: string;
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
    backgroundImage,
    backgroundSize,
    backgroundOverlay,
    // Color configurations
    taglineColor,
    headlineColor,
    subheadingColor,
    ctaPrimaryBgColor,
    ctaPrimaryTextColor,
    ctaSecondaryBgColor,
    ctaSecondaryTextColor,
    showTypingEffect,
    enableBackgroundAnimation,
    customClasses,
    paddingTop,
    paddingBottom,
    containerMaxWidth,
    ctaPrimary,
    ctaSecondary
  } = heroSection;

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

  // Determine if background is dark for CTA styling
  const smartTextColor = getTextColor();
  const isDarkBackground = smartTextColor === 'text-white';

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
    const baseStyles: React.CSSProperties = {};
    
    // Handle background image if provided
    if (backgroundImage) {
      baseStyles.backgroundImage = `url(${backgroundImage})`;
      baseStyles.backgroundSize = backgroundSize || 'cover';
      baseStyles.backgroundPosition = 'center';
      baseStyles.backgroundRepeat = 'no-repeat';
    } else {
      // Fallback to background type
      switch (backgroundType) {
        case 'gradient':
          baseStyles.background = backgroundValue;
          break;
        case 'image':
          baseStyles.backgroundImage = `url(${backgroundValue})`;
          baseStyles.backgroundSize = backgroundSize || 'cover';
          baseStyles.backgroundPosition = 'center';
          baseStyles.backgroundRepeat = 'no-repeat';
          break;
        case 'video':
          baseStyles.backgroundColor = 'var(--color-background-dark)';
          break;
        case 'color':
        default:
          baseStyles.backgroundColor = backgroundValue;
          break;
      }
    }
    
    return baseStyles;
  };

  // Get responsive button size classes - modernized and sleeker
  const getButtonSizeClasses = (isHeroSection = true) => {
    if (isHeroSection) {
      // Use larger sizing for hero sections - more prominent
      return {
        padding: 'h-12 px-6',
        text: 'text-base',
        icon: 'w-5 h-5'
      };
    }
    return {
      padding: 'px-4 py-2',
      text: 'text-sm',
      icon: 'w-4 h-4'
    };
  };

  // Get button style classes - modern, clean design
  // Use unified CTA styling from utils
  const getButtonClasses = (buttonType: 'primary' | 'secondary', style: string, customColors?: {
    backgroundColor?: string;
    textColor?: string;
  }) => {
    const buttonSizes = getButtonSizeClasses(true);
    const baseClasses = `${buttonSizes.padding} ${buttonSizes.text} rounded-lg font-medium transition-all duration-200 select-none relative overflow-hidden`;
    
    // If custom colors are provided, use them
    if (customColors) {
      const { backgroundColor, textColor } = customColors;
      return `${baseClasses} hover:opacity-90 shadow-lg`;
    }
    
    // Use the same approach as the header - CSS classes instead of getCTAStyles
    const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'destructive', 'success', 'info', 'outline', 'muted'];
    const safeStyle = allowedStyles.includes(style) ? style : 'primary';
    
    return `${baseClasses} btn-${safeStyle}`;
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
      const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'destructive', 'success', 'info', 'outline', 'muted'];
      const safeStyle = allowedStyles.includes(ctaPrimary.style) ? ctaPrimary.style : 'primary';
      // Get button classes using the same approach as header
      const buttonClasses = getButtonClasses('primary', safeStyle);
      // Always render as <a> tag if URL is present (even if it's '#')
      if (ctaPrimary.url) {
        
        ctas.push(
          <motion.a
            key="primary"
            href={ctaPrimary.url}
            target={ctaPrimary.target}
            id={ctaPrimary.customId}
            className={`inline-flex items-center gap-2.5 ${buttonClasses}`}
            style={{}}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={ctaEvents.onClick ? (e) => {
              e.preventDefault(); // Prevent navigation when there's a JavaScript event
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
            className={`inline-flex items-center gap-2.5 ${buttonClasses}`}
            style={{}}
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
      const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'destructive', 'success', 'info', 'outline', 'muted'];
      const safeStyle = allowedStyles.includes(ctaSecondary.style) ? ctaSecondary.style : 'primary';
      // Always render as <a> tag if URL is present (even if it's '#')
      if (ctaSecondary.url) {
        // Get button classes using the same approach as header
        const secondaryButtonClasses = getButtonClasses('secondary', safeStyle);
        
        ctas.push(
          <motion.a
            key="secondary"
            href={ctaSecondary.url}
            target={ctaSecondary.target}
            id={ctaSecondary.customId}
            className={`inline-flex items-center gap-2.5 ${secondaryButtonClasses}`}
            style={{}}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={ctaEvents.onClick ? (e) => {
              e.preventDefault(); // Prevent navigation when there's a JavaScript event
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
            className={`inline-flex items-center gap-2.5 ${getButtonClasses('secondary', safeStyle, {
              backgroundColor: ctaSecondaryBgColor,
              textColor: ctaSecondaryTextColor
            })}`}
            style={{
              backgroundColor: ctaSecondaryBgColor || undefined,
              color: ctaSecondaryTextColor || undefined
            }}
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
    const textAlign = getTextAlignment();
    
    const titleElement = (
      <motion.h1 
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 lg:mb-6 leading-tight ${textAlign}`}
                        style={{ color: headlineColor || 'var(--color-text-primary)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {overrideTitle || headline}
      </motion.h1>
    );

    const subtitleElement = (overrideSubtitle || subheading) ? (
      <motion.p 
        className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl mb-6 lg:mb-8 ${textAlign} max-w-4xl leading-relaxed ${textAlignment === 'center' ? 'mx-auto' : ''}`}
                        style={{ color: subheadingColor || 'var(--color-text-muted)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {overrideSubtitle || subheading}
      </motion.p>
    ) : null;

    const taglineElement = tagline ? (
      <motion.div 
        className={`inline-block px-3 py-1.5 lg:px-4 lg:py-2 rounded-full backdrop-blur-sm border text-xs lg:text-sm font-medium mb-4 lg:mb-6`}
        style={{ 
                      color: taglineColor || 'var(--color-primary)',
            backgroundColor: `${taglineColor || 'var(--color-primary)'}15`,
            borderColor: `${taglineColor || 'var(--color-primary)'}25`
        }}
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
    <>
      {/* Inject button styles for CTAs - same as header */}
      <style dangerouslySetInnerHTML={{ 
        __html: `
          .btn-primary {
            background-color: var(--color-primary);
            color: white;
            border: none;
          }
          .btn-primary:hover {
            background-color: var(--color-primary-light, var(--color-primary));
            transform: scale(1.02);
          }
          .btn-secondary {
            background-color: var(--color-secondary);
            color: white;
            border: 1px solid var(--color-secondary);
          }
          .btn-secondary:hover {
            background-color: var(--color-secondary-dark, var(--color-secondary));
            transform: scale(1.02);
          }
          .btn-accent {
            background-color: var(--color-accent);
            color: white;
            border: none;
          }
          .btn-accent:hover {
            background-color: var(--color-accent-dark, var(--color-accent));
            transform: scale(1.02);
          }
          .btn-ghost {
            background-color: transparent;
            color: var(--color-text-primary);
            border: 1px solid transparent;
          }
          .btn-ghost:hover {
            background-color: var(--color-primary-light, rgba(99, 102, 241, 0.1));
            transform: scale(1.02);
          }
          .btn-destructive {
            background-color: var(--color-error);
            color: white;
            border: none;
          }
          .btn-destructive:hover {
            background-color: var(--color-error-dark, var(--color-error));
            transform: scale(1.02);
          }
          .btn-success {
            background-color: var(--color-success);
            color: white;
            border: none;
          }
          .btn-success:hover {
            background-color: var(--color-success-dark, var(--color-success));
            transform: scale(1.02);
          }
          .btn-info {
            background-color: var(--color-info);
            color: white;
            border: none;
          }
          .btn-info:hover {
            background-color: var(--color-info-dark, var(--color-info));
            transform: scale(1.02);
          }
          .btn-outline {
            background-color: transparent;
            color: var(--color-primary);
            border: 1px solid var(--color-primary);
          }
          .btn-outline:hover {
            background-color: var(--color-primary);
            color: white;
            transform: scale(1.02);
          }
          .btn-muted {
            background-color: var(--color-gray-light);
            color: var(--color-text-muted);
            border: 1px solid var(--color-gray-dark);
            cursor: not-allowed;
          }
          .btn-muted:hover {
            background-color: var(--color-gray-medium);
            transform: scale(1.02);
            border-color: var(--color-gray-dark);
          }
        `
      }} />
      
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
      {/* Background Overlay */}
      {backgroundOverlay && (
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: backgroundOverlay,
            opacity: 0.1
          }}
        />
      )}

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
    </>
  );
};

export default DynamicHeroSection; 

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, UserPlus, LogIn, Star, ArrowRight } from 'lucide-react';
import { renderIcon } from '@/lib/iconUtils';
import { cn, getAppropriateLogoUrl, applyCTAEvents, hasCTAEvents, executeCTAEvent, type CTAWithEvents } from '@/lib/utils';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { Button } from '@/components/ui/Button';

// Utility function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
};

// Get automatic text color based on background
const getAutoTextColor = (backgroundColor: string): string => {
  return isLightColor(backgroundColor) ? '#1F2937' : '#FFFFFF';
};

// Get automatic hover color based on background
const getAutoHoverColor = (backgroundColor: string): string => {
  return isLightColor(backgroundColor) ? '#3B82F6' : '#60A5FA';
};

interface NavigationItem {
  name: string;
  href: string;
  isActive: boolean;
  children?: NavigationItem[];
}

interface SiteSettings {
  id: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
}

interface CTAButton {
  text: string;
  url: string;
  customId?: string;
  icon?: string; // Optional Lucide icon name
  style: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  target: '_self' | '_blank';
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

interface ClientHeaderProps {
  navigationItems: NavigationItem[];
  ctaButtons?: CTAButton[];
  siteSettings: SiteSettings | null;
  backgroundColor?: string;
  menuTextColor?: string;
  menuHoverColor?: string;
  menuActiveColor?: string;
}

export default function ClientHeader({ 
  navigationItems, 
  ctaButtons = [], 
  siteSettings, 
  backgroundColor = '#ffffff',
  menuTextColor = '#374151',
  menuHoverColor = '#5243E9',
  menuActiveColor = '#5243E9'
}: ClientHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState<Set<string>>(new Set());
  const { designSystem } = useDesignSystem();

  // Auto-detect colors if defaults are being used
  const autoTextColor = getAutoTextColor(backgroundColor);
  const autoHoverColor = getAutoHoverColor(backgroundColor);
  
  // Use custom colors if they're different from defaults, otherwise use auto-detected colors
  const finalMenuTextColor = menuTextColor !== '#374151' ? menuTextColor : autoTextColor;
  const finalMenuHoverColor = menuHoverColor !== '#5243E9' ? menuHoverColor : autoHoverColor;
  const finalMenuActiveColor = menuActiveColor !== '#5243E9' ? menuActiveColor : autoHoverColor;

  // Function to get icon component from icon name using universal icon system
  const getIconComponent = (iconName: string | undefined) => {
    if (!iconName) return null;
    
    // Handle new universal icon format (library:iconName)
    if (iconName.includes(':')) {
      return renderIcon(iconName, { className: 'w-4 h-4 flex-shrink-0' });
    }
    
    // Fallback to old format for backward compatibility - assume lucide
    return renderIcon(`lucide:${iconName}`, { className: 'w-4 h-4 flex-shrink-0' });
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleMobileSubmenu = (itemName: string) => {
    setExpandedMobileItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Inject button styles for CTAs */}
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
            background-color: var(--color-bg-secondary, #EEE7F9);
            color: var(--color-primary);
            border: 1px solid var(--color-primary);
          }
          .btn-secondary:hover {
            background-color: var(--color-primary-light, var(--color-primary));
            color: white;
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
            background-color: var(--color-muted);
            color: var(--color-text-primary);
            border: none;
          }
          .btn-muted:hover {
            background-color: var(--color-muted-dark, var(--color-muted));
            transform: scale(1.02);
          }
        `
      }} />
      
      <header 
        data-header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent",
          "border-b border-gray-200/50"
        )}
        style={{
          backgroundColor: isScrolled ? `${backgroundColor}95` : backgroundColor,
          borderBottomColor: isScrolled ? `${finalMenuTextColor}20` : 'transparent'
        }}
      >
      {/* Subtle border animation */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#5243E9] via-[#7C3AED] to-[#5243E9]"
        initial={{ width: 0 }}
        animate={{ width: isScrolled ? '100%' : '0%' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <nav className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10"
            >
              <Link href="/" className="flex items-center flex-shrink-0 group">
                {(() => {
                  const logoUrl = getAppropriateLogoUrl(siteSettings || {}, backgroundColor);
                  return logoUrl ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Image
                        src={logoUrl}
                        alt="Saski AI"
                        width={200}
                        height={60}
                        className="h-10 lg:h-12 w-auto object-contain transition-all duration-300 group-hover:brightness-110"
                        priority
                        onLoad={() => console.log('ClientHeader - Logo image loaded successfully:', logoUrl)}
                        onError={(e) => console.error('ClientHeader - Logo image failed to load:', logoUrl, e)}
                      />
                    </motion.div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center overflow-hidden group-hover:shadow-lg transition-all duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#5243E9] via-[#7C3AED] to-[#8B5CF6] animate-pulse" />
                        
                        {/* Icon */}
                        <span className="relative text-white font-bold text-lg lg:text-xl z-10">
                          S
                        </span>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>
                      <motion.span 
                        className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#5243E9] to-[#7C3AED] bg-clip-text text-transparent group-hover:from-[#4338CA] group-hover:to-[#6D28D9] transition-all duration-300"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        Saski AI
                      </motion.span>
                    </div>
                  );
                })()}
              </Link>
            </motion.div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex flex-1 justify-center relative z-10">
              <nav className="flex items-center space-x-2">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                    className="relative group"
                  >
                    {item.children && item.children.length > 0 ? (
                      // Dropdown menu item with children
                      <div className="relative group">
                        <Link
                          href={item.href}
                          className="relative px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl overflow-hidden hover:scale-105 flex items-center space-x-1.5"
                          style={{
                            color: item.isActive ? finalMenuActiveColor : finalMenuTextColor
                          }}
                          onMouseEnter={(e) => {
                            if (!item.isActive) {
                              (e.target as HTMLAnchorElement).style.color = finalMenuHoverColor;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!item.isActive) {
                              (e.target as HTMLAnchorElement).style.color = finalMenuTextColor;
                            }
                          }}
                        >
                          {/* Elegant hover background effect */}
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
                            style={{
                              background: `linear-gradient(135deg, ${finalMenuHoverColor}08, ${finalMenuHoverColor}15, ${finalMenuHoverColor}08)`
                            }}
                          />
                          
                          {/* Active state background with subtle animation */}
                          {item.isActive && (
                            <motion.div
                              layoutId="activeNavTab"
                              className="absolute inset-0 rounded-xl"
                              style={{
                                background: `linear-gradient(135deg, ${finalMenuActiveColor}12, ${finalMenuActiveColor}20, ${finalMenuActiveColor}12)`
                              }}
                              initial={false}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          
                          {/* Sophisticated hover underline effect */}
                          <motion.div
                            className="absolute bottom-0 left-1/2 h-0.5 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${finalMenuHoverColor}, ${finalMenuActiveColor}, ${finalMenuHoverColor})`
                            }}
                            initial={{ width: 0, x: '-50%' }}
                            whileHover={{ width: '85%' }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                          />
                          
                          <span className="relative z-10 font-medium">{item.name}</span>
                          
                          {/* Sophisticated dropdown arrow with smooth rotation - only show if has children */}
                          {item.children && item.children.length > 0 && (
                            <motion.div
                              className="relative z-10"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <motion.svg
                                className="w-4 h-4 transition-all duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                animate={{ rotate: 0 }}
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </motion.svg>
                            </motion.div>
                          )}
                        </Link>
                        
                        {/* Simple Dropdown Menu - Child Items Only */}
                        <motion.div
                          className="absolute top-full left-0 mt-1 min-w-48 rounded-xl shadow-xl border overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50"
                          style={{
                            backgroundColor: designSystem?.backgroundPrimary || '#ffffff',
                            borderColor: designSystem?.grayLight || '#e5e7eb'
                          }}
                          initial={{ y: 5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                          {/* Child Items Only */}
                          <div className="py-1">
                            {item.children?.map((child, childIndex) => (
                              <motion.div
                                key={child.href}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ 
                                  duration: 0.1, 
                                  delay: childIndex * 0.02,
                                  ease: "easeOut"
                                }}
                              >
                                <Link
                                  href={child.href}
                                  className="flex items-center px-4 py-2.5 text-sm transition-all duration-150 group/child"
                                  style={{
                                    color: child.isActive 
                                      ? designSystem?.primaryColor || finalMenuActiveColor
                                      : designSystem?.textSecondary || '#6b7280'
                                  }}
                                  onMouseEnter={(e) => {
                                    (e.target as HTMLElement).style.backgroundColor = designSystem?.backgroundSecondary || '#f8fafc';
                                    if (!child.isActive) {
                                      (e.target as HTMLElement).style.color = designSystem?.textPrimary || '#1f2937';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                    if (!child.isActive) {
                                      (e.target as HTMLElement).style.color = designSystem?.textSecondary || '#6b7280';
                                    }
                                  }}
                                >
                                  <span className="group-hover/child:font-medium transition-all duration-150">
                                    {child.name}
                                  </span>
                                  {child.isActive && (
                                    <div 
                                      className="ml-auto w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: designSystem?.primaryColor || finalMenuActiveColor }}
                                    ></div>
                                  )}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      // Regular menu item (no children)
                      <Link
                        href={item.href}
                        className="relative px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl overflow-hidden hover:scale-105"
                        style={{
                          color: item.isActive ? finalMenuActiveColor : finalMenuTextColor
                        }}
                        onMouseEnter={(e) => {
                          if (!item.isActive) {
                            (e.target as HTMLAnchorElement).style.color = finalMenuHoverColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!item.isActive) {
                            (e.target as HTMLAnchorElement).style.color = finalMenuTextColor;
                          }
                        }}
                      >
                        {/* Elegant hover background effect */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${finalMenuHoverColor}08, ${finalMenuHoverColor}15, ${finalMenuHoverColor}08)`
                          }}
                        />
                        
                        {/* Active state background with subtle animation */}
                        {item.isActive && (
                          <motion.div
                            layoutId="activeNavTab"
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background: `linear-gradient(135deg, ${finalMenuActiveColor}12, ${finalMenuActiveColor}20, ${finalMenuActiveColor}12)`
                            }}
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        
                        {/* Sophisticated hover underline effect */}
                        <motion.div
                          className="absolute bottom-0 left-1/2 h-0.5 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${finalMenuHoverColor}, ${finalMenuActiveColor}, ${finalMenuHoverColor})`
                          }}
                          initial={{ width: 0, x: '-50%' }}
                          whileHover={{ width: '85%' }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        
                        <span className="relative z-10 font-medium">{item.name}</span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Right Side Buttons */}
            <motion.div 
              className="hidden lg:flex items-center space-x-4 flex-shrink-0 relative z-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {ctaButtons.map((cta, index) => {
                const ctaEvents = applyCTAEvents(cta as CTAWithEvents);
                const hasEvents = hasCTAEvents(cta as CTAWithEvents);
                // Runtime safeguard for allowed styles
                const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'outline', 'muted'];
                const safeStyle = allowedStyles.includes(cta.style) ? cta.style : 'primary';
                return (
                  <motion.div
                    key={`header-cta-${cta.text}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={cta.url}
                      target={cta.target}
                      id={cta.customId}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg transition-all duration-200 select-none relative overflow-hidden',
                        `btn-${safeStyle}`,
                        safeStyle === 'primary' && 'focus-visible:ring-blue-500 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100',
                        safeStyle === 'secondary' && 'focus-visible:ring-blue-500',
                        safeStyle === 'accent' && 'focus-visible:ring-purple-500 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100',
                        safeStyle === 'ghost' && 'focus-visible:ring-blue-500',
                        safeStyle === 'destructive' && 'focus-visible:ring-red-500',
                        safeStyle === 'success' && 'focus-visible:ring-green-500',
                        safeStyle === 'info' && 'focus-visible:ring-blue-400',
                        safeStyle === 'outline' && 'focus-visible:ring-blue-500',
                        safeStyle === 'muted' && 'cursor-not-allowed'
                      )}
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
                      {cta.icon && getIconComponent(cta.icon)}
                      <span>{cta.text}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="lg:hidden relative p-3 rounded-xl hover:bg-gradient-to-r hover:from-[var(--color-primary)]/5 hover:to-[#7C3AED]/5 transition-all duration-300 group"
              type="button"
              onClick={toggleMenu}
              aria-controls="navbarSupportedContent"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-[#7C3AED]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative z-10"
              >
                {isMenuOpen ? (
                  <motion.div
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X 
                      className="w-6 h-6 group-hover:text-[#7C3AED] transition-colors duration-300" 
                      style={{ color: finalMenuTextColor }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu 
                      className="w-6 h-6 group-hover:text-[var(--color-primary)] transition-colors duration-300" 
                      style={{ color: finalMenuTextColor }}
                    />
                  </motion.div>
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl shadow-2xl"
            id="navbarSupportedContent"
            style={{
              backgroundColor: `${backgroundColor}f5`, // 96% opacity
              borderTopColor: `${finalMenuTextColor}20`
            }}
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/3 via-transparent to-[#7C3AED]/3 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
              <nav className="space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1 + 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="group"
                  >
                    {item.children && item.children.length > 0 ? (
                      // Mobile dropdown menu item
                      <div className="space-y-2">
                        <button
                          onClick={() => toggleMobileSubmenu(item.name)}
                          className="relative w-full px-6 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:shadow-lg text-left"
                          style={{
                            color: item.isActive ? finalMenuActiveColor : finalMenuTextColor
                          }}
                        >
                          {/* Enhanced background gradient effect */}
                          <div 
                            className="absolute inset-0 transition-all duration-300 rounded-2xl"
                            style={{
                              background: item.isActive 
                                ? `linear-gradient(135deg, ${finalMenuActiveColor}12, ${finalMenuActiveColor}20, ${finalMenuActiveColor}12)`
                                : `linear-gradient(135deg, ${finalMenuHoverColor}08, ${finalMenuHoverColor}15, ${finalMenuHoverColor}08)`,
                              opacity: item.isActive ? 1 : 0
                            }}
                          />
                          
                          {/* Sophisticated animated underline */}
                          <motion.div
                            className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${finalMenuHoverColor}, ${finalMenuActiveColor}, ${finalMenuHoverColor})`
                            }}
                            initial={{ scaleX: item.isActive ? 1 : 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                          />
                          
                          <span className="relative z-10 flex items-center justify-between">
                            <span className="font-medium">{item.name}</span>
                            
                            {/* Enhanced dropdown arrow */}
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <motion.svg
                                className="w-5 h-5 transition-all duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                animate={{ 
                                  rotate: expandedMobileItems.has(item.name) ? 180 : 0 
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </motion.svg>
                            </motion.div>
                          </span>
                        </button>
                        
                        {/* Mobile Submenu */}
                        <AnimatePresence>
                          {expandedMobileItems.has(item.name) && (
                            <motion.div
                              className="ml-4 space-y-1 overflow-hidden"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {item.children.map((child, childIndex) => (
                                <motion.div
                                  key={child.href}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ 
                                    duration: 0.3, 
                                    delay: childIndex * 0.05 + 0.1 
                                  }}
                                >
                                  <Link
                                    href={child.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="group/child relative block px-6 py-3.5 text-base font-medium rounded-xl transition-all duration-300 overflow-hidden hover:scale-[1.02]"
                                    style={{
                                      color: child.isActive ? finalMenuActiveColor : finalMenuTextColor
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!child.isActive) {
                                        (e.target as HTMLAnchorElement).style.color = finalMenuHoverColor;
                                        (e.target as HTMLAnchorElement).style.backgroundColor = `${finalMenuHoverColor}12`;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!child.isActive) {
                                        (e.target as HTMLAnchorElement).style.color = finalMenuTextColor;
                                        (e.target as HTMLAnchorElement).style.backgroundColor = 'transparent';
                                      }
                                    }}
                                  >
                                    {/* Enhanced hover effect */}
                                    <div 
                                      className="absolute inset-0 opacity-0 group-hover/child:opacity-100 transition-all duration-300 rounded-xl"
                                      style={{
                                        background: `linear-gradient(90deg, ${finalMenuHoverColor}08, ${finalMenuHoverColor}15, ${finalMenuHoverColor}08)`
                                      }}
                                    />
                                    
                                    <span className="relative z-10 flex items-center justify-between">
                                      <span className="flex items-center space-x-3">
                                        {/* Enhanced bullet point */}
                                        <motion.span 
                                          className="w-2 h-2 rounded-full" 
                                          style={{ backgroundColor: finalMenuHoverColor }}
                                          whileHover={{ scale: 1.5 }}
                                          transition={{ duration: 0.2 }}
                                        />
                                        <span className="font-medium">{child.name}</span>
                                      </span>
                                      
                                      {/* Smooth arrow transition */}
                                      <motion.svg
                                        className="w-4 h-4 opacity-0 group-hover/child:opacity-70 transition-all duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        initial={{ x: -8 }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                      </motion.svg>
                                    </span>
                                    
                                    {/* Active state indicator */}
                                    {child.isActive && (
                                      <motion.div
                                        className="absolute left-3 top-1/2 w-1 h-4 rounded-full"
                                        style={{ backgroundColor: finalMenuActiveColor }}
                                        initial={{ scale: 0, y: '-50%' }}
                                        animate={{ scale: 1, y: '-50%' }}
                                        transition={{ duration: 0.3 }}
                                      />
                                    )}
                                  </Link>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      // Regular mobile menu item
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="relative block px-6 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:shadow-lg"
                        style={{
                          color: item.isActive ? finalMenuActiveColor : finalMenuTextColor
                        }}
                        onMouseEnter={(e) => {
                          if (!item.isActive) {
                            (e.target as HTMLAnchorElement).style.color = finalMenuHoverColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!item.isActive) {
                            (e.target as HTMLAnchorElement).style.color = finalMenuTextColor;
                          }
                        }}
                      >
                        {/* Enhanced background gradient effect */}
                        <div 
                          className="absolute inset-0 transition-all duration-300 rounded-2xl"
                          style={{
                            background: item.isActive 
                              ? `linear-gradient(135deg, ${finalMenuActiveColor}12, ${finalMenuActiveColor}20, ${finalMenuActiveColor}12)`
                              : `linear-gradient(135deg, ${finalMenuHoverColor}08, ${finalMenuHoverColor}15, ${finalMenuHoverColor}08)`,
                            opacity: item.isActive ? 1 : 0
                          }}
                          onMouseEnter={(e) => {
                            if (!item.isActive) {
                              (e.target as HTMLDivElement).style.opacity = '1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!item.isActive) {
                              (e.target as HTMLDivElement).style.opacity = '0';
                            }
                          }}
                        />
                        
                        {/* Sophisticated animated underline */}
                        <motion.div
                          className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${finalMenuHoverColor}, ${finalMenuActiveColor}, ${finalMenuHoverColor})`
                          }}
                          initial={{ scaleX: item.isActive ? 1 : 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        
                        <span className="relative z-10 font-medium">
                          {item.name}
                        </span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>
              
              {/* Mobile CTA Buttons */}
              {ctaButtons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="pt-6 mt-6 border-t border-gray-200"
                >
                  <div className="flex flex-col space-y-3">
                    {ctaButtons.map((cta, index) => {
                      const ctaEvents = applyCTAEvents(cta as CTAWithEvents);
                      
                      return (
                        <motion.div
                          key={`mobile-cta-${cta.text}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                        >
                          <Link
                            href={cta.url}
                            target={cta.target}
                            id={cta.customId}
                            onClick={(e) => {
                              setIsMenuOpen(false);
                              if (ctaEvents.onClick) {
                                executeCTAEvent(ctaEvents.onClick, e, e.currentTarget);
                              }
                            }}
                            className={cn(
                              'inline-flex items-center justify-center gap-2 w-full h-12 px-6 rounded-lg transition-all duration-200 select-none relative overflow-hidden',
                              `btn-${cta.style}`,
                              cta.style === 'primary' && 'focus-visible:ring-blue-500',
                              cta.style === 'secondary' && 'focus-visible:ring-blue-500',
                              cta.style === 'accent' && 'focus-visible:ring-purple-500',
                              cta.style === 'ghost' && 'focus-visible:ring-blue-500',
                              cta.style === 'destructive' && 'focus-visible:ring-red-500',
                              cta.style === 'success' && 'focus-visible:ring-green-500',
                              cta.style === 'info' && 'focus-visible:ring-blue-400',
                              cta.style === 'outline' && 'focus-visible:ring-blue-500',
                              cta.style === 'muted' && 'cursor-not-allowed'
                            )}
                            style={{
                              fontSize: 'var(--font-size-base)',
                              fontWeight: 'var(--font-weight-medium)',
                              fontFamily: 'var(--font-family-sans)',
                            }}
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
                            {cta.icon && getIconComponent(cta.icon)}
                            <span>{cta.text}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  );
} 

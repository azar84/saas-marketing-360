'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ClientHeader from './ClientHeader';

// Import the CTAButton type from ClientHeader
interface CTAButton {
  text: string;
  url: string;
  customId?: string;
  icon?: string;
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

interface Page {
  id: number;
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  sortOrder: number;
  showInHeader: boolean;
}

interface SiteSettings {
  id: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
}

interface HeaderConfig {
  id: number;
  isActive: boolean;
  backgroundColor: string;
  menuTextColor: string;
  menuHoverColor: string;
  menuActiveColor: string;
  navItems: any[];
  headerCTAs: any[];
  menus: any[];
}

export default function Header() {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        // Fetch header configuration from API with cache-busting
        const headerResponse = await fetch(`/api/admin/header-config?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!headerResponse.ok) {
          console.error('Failed to fetch header config, status:', headerResponse.status);
          // Continue with default values if header config fails
        }
        
        const headerData = headerResponse.ok ? await headerResponse.json() : [];
        
        // Fetch site settings from API with cache-busting
        const settingsResponse = await fetch(`/api/admin/site-settings?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!settingsResponse.ok) {
          console.error('Failed to fetch site settings, status:', settingsResponse.status);
          throw new Error(`Site settings fetch failed: ${settingsResponse.status}`);
        }
        
        const settingsData = await settingsResponse.json();

        // Handle header config response (returns array directly)
        if (Array.isArray(headerData) && headerData.length > 0) {
          setHeaderConfig(headerData[0]); // Get the first active config
        }
        
        // Handle site settings response - API returns { success: true, data: {...} }
        if (settingsData) {
          const settings = settingsData.success ? settingsData.data : settingsData;
          setSiteSettings(settings);
        }

      } catch (error) {
        console.error('Failed to fetch header data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderData();
  }, []);

  if (loading) {
    return <div className="h-16 bg-white"></div>; // Loading placeholder
  }

  // Generate navigation items from header configuration
  let navigationItems: Array<{name: string; href: string; isActive: boolean; children?: Array<{name: string; href: string; isActive: boolean}>}> = [];
  let ctaButtons: CTAButton[] = [];
  let backgroundColor = '#ffffff'; // Default background color
  let menuTextColor = '#374151'; // Default menu text color
  let menuHoverColor = '#5243E9'; // Default menu hover color
  let menuActiveColor = '#5243E9'; // Default menu active color

  if (headerConfig) {
    // Use colors from header configuration
    backgroundColor = headerConfig.backgroundColor || '#ffffff';
    menuTextColor = headerConfig.menuTextColor || '#374151';
    menuHoverColor = headerConfig.menuHoverColor || '#5243E9';
    menuActiveColor = headerConfig.menuActiveColor || '#5243E9';

    // Get navigation items from selected menu
    if (headerConfig.menus.length > 0 && headerConfig.menus[0].menu.items.length > 0) {
      // Filter only top-level items (parentId is null) but include their children
      const topLevelItems = headerConfig.menus[0].menu.items.filter((item: any) => !item.parentId);
      navigationItems = topLevelItems.map((item: any) => ({
        name: item.label,
        href: item.url || (item.page?.slug === 'home' ? '/' : `/${item.page?.slug}`) || '#',
        isActive: false,
        children: item.children?.map((child: any) => ({
          name: child.label,
          href: child.url || (child.page?.slug === 'home' ? '/' : `/${child.page?.slug}`) || '#',
          isActive: false
        })) || []
      }));
    } else if (headerConfig.navItems.length > 0) {
      // Fallback to direct nav items if no menu is selected
      navigationItems = headerConfig.navItems.map((item: any) => ({
        name: item.customText || item.page?.title || '',
        href: item.customUrl || (item.page?.slug === 'home' ? '/' : `/${item.page?.slug}`) || '',
        isActive: false
      }));
    }

    // Get CTA buttons
    ctaButtons = headerConfig.headerCTAs.map((item: any) => ({
      text: item.cta.text,
      url: item.cta.url,
      customId: item.cta.customId,
      ...(item.cta.icon && { icon: item.cta.icon }),
      style: item.cta.style as "info" | "primary" | "secondary" | "accent" | "ghost" | "destructive" | "success" | "outline" | "muted",
      target: item.cta.target as "_self" | "_blank",
      // JavaScript Events
      onClickEvent: item.cta.onClickEvent,
      onHoverEvent: item.cta.onHoverEvent,
      onMouseOutEvent: item.cta.onMouseOutEvent,
      onFocusEvent: item.cta.onFocusEvent,
      onBlurEvent: item.cta.onBlurEvent,
      onKeyDownEvent: item.cta.onKeyDownEvent,
      onKeyUpEvent: item.cta.onKeyUpEvent,
      onTouchStartEvent: item.cta.onTouchStartEvent,
      onTouchEndEvent: item.cta.onTouchEndEvent
    }));

  }

  return (
    <ClientHeader
      navigationItems={navigationItems}
      ctaButtons={ctaButtons}
      siteSettings={siteSettings}
      backgroundColor={backgroundColor}
      menuTextColor={menuTextColor}
      menuHoverColor={menuHoverColor}
      menuActiveColor={menuActiveColor}
    />
  );
} 

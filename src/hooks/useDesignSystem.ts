'use client';

import { useState, useEffect } from 'react';

interface DesignSystem {
  id?: number;
  // Brand Colors
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  secondaryColor: string;
  accentColor: string;
  // Semantic Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  // Neutral Colors
  grayLight: string;
  grayMedium: string;
  grayDark: string;
  // Background Colors
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundDark: string;
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Typography
  fontFamily: string;
  fontFamilyMono: string;
  fontSizeBase: string;
  lineHeightBase: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  // Spacing Scale
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  spacing2xl: string;
  // Border Radius
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  borderRadiusXl: string;
  borderRadiusFull: string;
  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  // Animation Durations
  animationFast: string;
  animationNormal: string;
  animationSlow: string;
  // Breakpoints
  breakpointSm: string;
  breakpointMd: string;
  breakpointLg: string;
  breakpointXl: string;
  breakpoint2xl: string;

  // Custom Variables
  customVariables?: string;
}

export const useDesignSystem = () => {
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesignSystem = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/design-system');
        const result = await response.json();

        if (result.success) {
          setDesignSystem(result.data);
          setError(null);
        } else {
          setError(result.message || 'Failed to load design system');
        }
      } catch (err) {
        console.error('Failed to fetch design system:', err);
        setError('Failed to load design system');
      } finally {
        setLoading(false);
      }
    };

    fetchDesignSystem();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/design-system');
      const result = await response.json();

      if (result.success) {
        setDesignSystem(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load design system');
      }
    } catch (err) {
      console.error('Failed to fetch design system:', err);
      setError('Failed to load design system');
    } finally {
      setLoading(false);
    }
  };

  return {
    designSystem,
    loading,
    error,
    refetch
  };
};

// Helper function to get theme defaults for form initialization
export const getThemeDefaults = (designSystem: DesignSystem | null) => {
  if (!designSystem) {
    // Fallback defaults if design system isn't loaded yet
    return {
      primaryColor: '#5243E9',
      secondaryColor: '#7C3AED',
      backgroundPrimary: '#FFFFFF',
      backgroundSecondary: '#F6F8FC',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF'
    };
  }

  return {
    primaryColor: designSystem.primaryColor,
    secondaryColor: designSystem.secondaryColor,
    backgroundPrimary: designSystem.backgroundPrimary,
    backgroundSecondary: designSystem.backgroundSecondary,
    textPrimary: designSystem.textPrimary,
    textSecondary: designSystem.textSecondary,
    textMuted: designSystem.textMuted
  };
};

// Helper function to get reliable admin panel colors (always light theme)
export const getAdminPanelColors = (designSystem?: DesignSystem | null) => {
  if (designSystem) {
    return {
      textPrimary: designSystem.textPrimary,
      textSecondary: designSystem.textSecondary,
      textMuted: designSystem.textMuted,
      background: designSystem.backgroundPrimary,
      backgroundSecondary: designSystem.backgroundSecondary,
      border: designSystem.grayLight || '#E5E7EB'
    };
  }

  // Fallback to design system defaults
  return {
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    border: '#E5E7EB'
  };
};

// Helper function to get admin panel colors with design system priority
export const getAdminPanelColorsWithDesignSystem = (designSystem: DesignSystem | null) => {
  return {
    // Text Colors
    textPrimary: designSystem?.textPrimary || '#1F2937',
    textSecondary: designSystem?.textSecondary || '#6B7280',
    textMuted: designSystem?.textMuted || '#9CA3AF',
    
    // Background Colors
    backgroundPrimary: designSystem?.backgroundPrimary || '#FFFFFF',
    backgroundSecondary: designSystem?.backgroundSecondary || '#F9FAFB',
    backgroundDark: designSystem?.backgroundDark || '#1F2937',
    
    // Brand Colors
    primary: designSystem?.primaryColor || '#5243E9',
    secondary: designSystem?.secondaryColor || '#7C3AED',
    accent: designSystem?.accentColor || '#06B6D4',
    
    // Semantic Colors
    success: designSystem?.successColor || '#10B981',
    warning: designSystem?.warningColor || '#F59E0B',
    error: designSystem?.errorColor || '#EF4444',
    info: designSystem?.infoColor || '#3B82F6',
    
    // Neutral Colors
    grayLight: designSystem?.grayLight || '#E5E7EB',
    grayMedium: designSystem?.grayMedium || '#9CA3AF',
    grayDark: designSystem?.grayDark || '#374151',
    
    // Border Colors
    border: designSystem?.grayLight || '#E5E7EB'
  };
}; 
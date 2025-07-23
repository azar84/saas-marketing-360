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
export const getAdminPanelColors = () => {
  return {
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    border: '#E5E7EB'
  };
}; 
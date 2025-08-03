'use client';

import React, { useState, useEffect } from 'react';
import FeaturesGridLayout from './FeaturesGridLayout';
import FeaturesListLayout from './FeaturesListLayout';

interface GlobalFeature {
  id: number;
  title: string;
  description: string;
  iconName: string;
  category: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeaturesSectionProps {
  features?: GlobalFeature[];
  featureGroupId?: number;
  pageSlug?: string;
  heading?: string;
  subheading?: string;
  layoutType?: 'grid' | 'list';
  backgroundColor?: string;
}

// Default features fallback
const defaultFeatures: GlobalFeature[] = [
  {
    id: 1,
    title: "Smart Conversations",
    description: "AI-powered chat that understands context and provides intelligent responses to your customers.",
    iconName: "MessageSquare",
    category: "Communication",
    sortOrder: 1,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Multi-Channel Support",
    description: "Connect across WhatsApp, website chat, email, and more from a single dashboard.",
    iconName: "Globe",
    category: "Integration",
    sortOrder: 2,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Analytics & Insights",
    description: "Track performance, customer satisfaction, and team productivity with detailed reports.",
    iconName: "TrendingUp",
    category: "Analytics",
    sortOrder: 3,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ 
  features: propFeatures = [], 
  featureGroupId,
  pageSlug,
  heading: propHeading,
  subheading: propSubheading,
  layoutType: propLayoutType,
  backgroundColor
}) => {
  const [features, setFeatures] = useState<GlobalFeature[]>(propFeatures);
  const [loading, setLoading] = useState(propFeatures.length === 0);
  const [groupHeading, setGroupHeading] = useState<string>('');
  const [groupSubheading, setGroupSubheading] = useState<string>('');
  const [layoutType, setLayoutType] = useState<'grid' | 'list'>(propLayoutType || 'grid');
  const [finalBackgroundColor, setFinalBackgroundColor] = useState<string>(backgroundColor || 'var(--color-bg-secondary)');

  // Fetch features from API if not provided via props
  useEffect(() => {
    console.log('🎯 FeaturesSection - propLayoutType received:', propLayoutType);
    console.log('🎯 FeaturesSection - propFeatures length:', propFeatures.length);
    
    if (propFeatures.length > 0) {
      console.log('🎯 FeaturesSection - Using propFeatures, count:', propFeatures.length);
      console.log('🎯 FeaturesSection - propLayoutType:', propLayoutType);
      setFeatures(propFeatures);
      setGroupHeading(propHeading || 'Why Choose Us?');
      setGroupSubheading(propSubheading || 'Simple. Smart. Built for growing businesses');
      setLayoutType(propLayoutType || 'grid');
      setFinalBackgroundColor(backgroundColor || 'var(--color-bg-secondary)');
      setLoading(false);
      return;
    }

    // If no propFeatures but we have propLayoutType, use it
    if (propLayoutType) {
      console.log('🎯 FeaturesSection - No propFeatures but using propLayoutType:', propLayoutType);
      setLayoutType(propLayoutType);
    }

    const fetchFeatures = async () => {
      try {
        let featuresData: GlobalFeature[] = [];
        let heading = 'Why Choose Us?';
        let subheading = 'Simple. Smart. Built for growing businesses';
        let layout: 'grid' | 'list' = 'grid';
        let bgColor = backgroundColor || 'var(--color-bg-secondary)';

                // Priority 1: Specific feature group ID
        if (featureGroupId) {
          console.log('🎯 FeaturesSection - Fetching feature group with ID:', featureGroupId);
          const response = await fetch(`/api/admin/feature-groups`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const group = result.data.find((g: any) => g.id === featureGroupId && g.isActive);
              if (group) {
                console.log('🎯 Found feature group:', group.name, 'layoutType:', group.layoutType);
                console.log('🎯 Group items count:', group.groupItems.length);
                console.log('🎯 Visible items count:', group.groupItems.filter((item: any) => item.isVisible).length);
                featuresData = group.groupItems
                  .filter((item: any) => item.isVisible)
                  .map((item: any) => item.feature)
                  .sort((a: GlobalFeature, b: GlobalFeature) => a.sortOrder - b.sortOrder);
                heading = group.heading;
                subheading = group.subheading || '';
                layout = group.layoutType || 'grid';
                bgColor = group.backgroundColor || backgroundColor || 'var(--color-bg-secondary)';
                console.log('🎯 Setting layout to:', layout);
                console.log('🎯 Features data count:', featuresData.length);
              }
            }
          }
        }
        
        // Priority 2: Page-specific feature groups
        else if (pageSlug) {
          const pageResponse = await fetch('/api/admin/pages');
          if (pageResponse.ok) {
            const pageResult = await pageResponse.json();
            if (pageResult.success && pageResult.data) {
              const page = pageResult.data.find((p: any) => p.slug === pageSlug);
              if (page) {
                const groupResponse = await fetch(`/api/admin/page-feature-groups?pageId=${page.id}`);
                if (groupResponse.ok) {
                  const groupResult = await groupResponse.json();
                  if (groupResult.success && groupResult.data && groupResult.data.length > 0) {
                    // Use the first visible feature group for this page
                    const pageGroup = groupResult.data.find((pg: any) => pg.isVisible && pg.featureGroup.isActive);
                    if (pageGroup) {
                      featuresData = pageGroup.featureGroup.groupItems
                        .filter((item: any) => item.isVisible)
                        .map((item: any) => item.feature)
                        .sort((a: GlobalFeature, b: GlobalFeature) => a.sortOrder - b.sortOrder);
                      heading = pageGroup.featureGroup.heading;
                      subheading = pageGroup.featureGroup.subheading || '';
                      layout = pageGroup.featureGroup.layoutType || 'grid';
                      bgColor = pageGroup.featureGroup.backgroundColor || backgroundColor || 'var(--color-bg-secondary)';
                    }
                  }
                }
              }
            }
          }
        }

        // Priority 3: Default fallback - fetch all visible features
        if (featuresData.length === 0) {
          console.log('🎯 FeaturesSection - Fetching from /api/admin/features (fallback)');
          const response = await fetch('/api/admin/features');
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              console.log('🎯 FeaturesSection - Total features from API:', result.data.length);
              console.log('🎯 FeaturesSection - All features:', result.data.map((f: any) => ({
                id: f.id,
                title: f.title,
                isVisible: f.isVisible
              })));
              featuresData = result.data
                .filter((feature: GlobalFeature) => feature.isVisible)
                .sort((a: GlobalFeature, b: GlobalFeature) => a.sortOrder - b.sortOrder);
              console.log('🎯 FeaturesSection - Visible features count:', featuresData.length);
              console.log('🎯 FeaturesSection - Visible features:', featuresData.map((f: any) => ({
                id: f.id,
                title: f.title
              })));
              // Use propLayoutType for fallback as well
              layout = propLayoutType || 'grid';
            }
          }
        }

        // Final fallback if all API calls fail
        if (featuresData.length === 0) {
          featuresData = defaultFeatures;
        }

        setFeatures(featuresData);
        setGroupHeading(propHeading || heading);
        setGroupSubheading(propSubheading || subheading);
        // Use propLayoutType if available, otherwise use the fetched layout
        setLayoutType(propLayoutType || layout);
        setFinalBackgroundColor(bgColor);

      } catch (error) {
        // Fall back to default features if everything fails
        setFeatures(defaultFeatures);
        setGroupHeading(propHeading || 'Why Choose Us?');
        setGroupSubheading(propSubheading || 'Simple. Smart. Built for growing businesses');
        setLayoutType('grid');
        setFinalBackgroundColor(backgroundColor || 'var(--color-bg-secondary)');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [propFeatures, featureGroupId, pageSlug, propHeading, propSubheading, propLayoutType, backgroundColor]);

  // Show loading state
  if (loading) {
    return (
      <section className="py-20" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="elementor-container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no features
  if (features.length === 0) {
    return null;
  }

    console.log('🎯 FeaturesSection - Final layoutType:', layoutType);
  console.log('🎯 FeaturesSection - Features count:', features.length);

  // Dynamic component selection based on layoutType
  if (layoutType === 'list') {
    console.log('🎯 Rendering LIST layout');
    return (
      <FeaturesListLayout 
        features={features}
        heading={groupHeading || 'Why Choose Us?'}
        subheading={groupSubheading}
        backgroundColor={finalBackgroundColor}
      />
    );
  }

  // Default to grid layout
  console.log('🎯 Rendering GRID layout');
  return (
    <FeaturesGridLayout 
      features={features}
      heading={groupHeading || 'Why Choose Us?'}
      subheading={groupSubheading}
      backgroundColor={finalBackgroundColor}
    />
  );
};

export default FeaturesSection; 
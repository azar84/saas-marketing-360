'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check, Settings, CheckCircle, X } from 'lucide-react';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { iconLibrary } from '@/components/ui/IconPicker';

interface BillingCycle {
  id: string;
  label: string;
  multiplier: number;
  isDefault: boolean;
}

interface PlanPricing {
  id: string;
  planId: string;
  billingCycleId: string;
  priceCents: number;
  stripePriceId?: string;
  ctaUrl?: string;
  billingCycle: BillingCycle;
}

interface FeatureType {
  id: string;
  name: string;
  unit: string;
  description: string;
  icon: string;
  iconUrl?: string;
  dataType: string;
  sortOrder: number;
  isActive: boolean;
}

interface PlanFeatureLimit {
  id: string;
  planId: string;
  featureTypeId: string;
  value: string;
  isUnlimited: boolean;
  plan: {
    id: string;
    name: string;
    description: string;
  };
  featureType: FeatureType;
}

interface BasicFeature {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

interface PlanBasicFeature {
  id: string;
  planId: string;
  basicFeatureId: string;
  plan: {
    id: string;
    name: string;
    description: string;
  };
  basicFeature: BasicFeature;
}

interface Plan {
  id: string;
  name: string;
  description?: string;
  ctaText?: string;
  position: number;
  isActive: boolean;
  isPopular: boolean;
  pricing: PlanPricing[];
  featureLimits?: PlanFeatureLimit[];
  basicFeatures?: PlanBasicFeature[];
}

interface PricingSectionPlan {
  id: number;
  pricingSectionId: number;
  planId: string;
  sortOrder: number;
  isVisible: boolean;
  plan: Plan;
}

interface PricingSection {
  id: number;
  name: string;
  heading: string;
  subheading?: string;
  layoutType: string;
  pricingCardsBackgroundColor?: string;
  comparisonTableBackgroundColor?: string;
  isActive: boolean;
  sectionPlans: PricingSectionPlan[];
}

interface ConfigurablePricingSectionProps {
  heading?: string;
  subheading?: string;
  pricingSectionId?: number;
  layoutType?: string;
  className?: string;
  pricingData?: any; // Add server-side pricing data prop
}

// IconDisplay component exactly like admin panel
const IconDisplay = ({ iconName, iconUrl, className = "w-4 h-4" }: { 
  iconName: string; 
  iconUrl?: string; 
  className?: string;
}) => {
  if (iconUrl) {
    return <img src={iconUrl} alt={iconName} className={`${className} object-contain`} />;
  }
  
  const iconData = iconLibrary.find(icon => icon.name === iconName);
  if (iconData) {
    const IconComponent = iconData.component;
    return <IconComponent className={className} />;
  }
  
  return <Settings className={className} />;
};

export default function ConfigurablePricingSection({
  heading,
  subheading,
  pricingSectionId,
  layoutType = 'standard',
  className = '',
  pricingData: serverPricingData
}: ConfigurablePricingSectionProps) {
  // State variables exactly like admin panel
  const [pricingSection, setPricingSection] = useState<PricingSection | null>(
    serverPricingData?.pricingSection || null
  );
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>(
    serverPricingData?.billingCycles || []
  );
  const [selectedBillingCycleId, setSelectedBillingCycleId] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>(
    serverPricingData?.plans || []
  );
  const [planFeatureTypes, setPlanFeatureTypes] = useState<FeatureType[]>(
    serverPricingData?.planFeatureTypes || []
  );
  const [planLimits, setPlanLimits] = useState<PlanFeatureLimit[]>(
    serverPricingData?.planLimits || []
  );
  const [planBasicFeatures, setPlanBasicFeatures] = useState<PlanBasicFeature[]>(
    serverPricingData?.planBasicFeatures || []
  );
  const [basicFeatures, setBasicFeatures] = useState<BasicFeature[]>(
    serverPricingData?.basicFeatures || []
  );
  const [loading, setLoading] = useState(!serverPricingData);
  const [error, setError] = useState<string | null>(null);
  const { designSystem } = useDesignSystem();

  // Helper functions exactly like admin panel
  const getPlanLimit = (planId: string, featureTypeId: string) => {
    return planLimits.find(l => l.planId === planId && l.featureTypeId === featureTypeId);
  };

  const getPlanPricing = (planId: string, billingCycleId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.pricing.find(p => p.billingCycleId === billingCycleId);
  };

  const formatPrice = (priceCents: number) => {
    const dollars = priceCents / 100;
    return dollars === Math.floor(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
  };

  const isPlanBasicFeatureEnabled = (planId: string, featureId: string) => {
    return planBasicFeatures.some(pbf => 
      pbf.planId === planId && pbf.basicFeatureId === featureId
    );
  };

  const getEnabledBasicFeatures = (planId: string) => {
    return basicFeatures.filter(bf => 
      bf.isActive && isPlanBasicFeatureEnabled(planId, bf.id)
    );
  };

  const calculateSavings = (cycle: BillingCycle) => {
    if (cycle.multiplier <= 1) return 0;
    
    // Calculate savings based on actual price differences
    // Get the first plan to calculate savings (using Starter as reference)
    const referencePlan = plans[0]; // Use first plan as reference
    if (!referencePlan) return 0;
    
    // Get monthly pricing for reference plan
    const monthlyBillingCycle = billingCycles.find(c => c.multiplier === 1);
    if (!monthlyBillingCycle) return 0;
    
    const monthlyPricing = getPlanPricing(referencePlan.id, monthlyBillingCycle.id);
    const yearlyPricing = getPlanPricing(referencePlan.id, cycle.id);
    
    if (!monthlyPricing || !yearlyPricing) return 0;
    
    // Calculate: (monthly * 12 - yearly) / (monthly * 12) * 100
    const monthlyTotal = monthlyPricing.priceCents * 12;
    const yearlyCost = yearlyPricing.priceCents;
    const savings = ((monthlyTotal - yearlyCost) / monthlyTotal) * 100;
    
    return Math.round(savings);
  };

  // Load data exactly like admin panel approach
  useEffect(() => {
    // Only fetch if server data not provided
    if (!serverPricingData) {
      const loadData = async () => {
        try {
          setLoading(true);
          
          // Fetch all data in parallel
          const [cyclesRes, sectionsRes, featureTypesRes, limitsRes, basicFeaturesRes, planBasicFeaturesRes] = await Promise.all([
            fetch('/api/admin/billing-cycles'),
            fetch('/api/admin/pricing-sections'),
            fetch('/api/admin/plan-feature-types'),
            fetch('/api/admin/plan-feature-limits'),
            fetch('/api/admin/basic-features'),
            fetch('/api/admin/plan-basic-features')
          ]);

          const cycles = await cyclesRes.json();
          const sections = await sectionsRes.json();
          const featureTypes = await featureTypesRes.json();
          const limits = await limitsRes.json();
          const basicFeaturesData = await basicFeaturesRes.json();
          const planBasicFeaturesData = await planBasicFeaturesRes.json();
          
          // Set data exactly like admin panel
          setBillingCycles(cycles || []);
          setPlanFeatureTypes(featureTypes || []);
          setPlanLimits(limits || []);
          setBasicFeatures(basicFeaturesData || []);
          setPlanBasicFeatures(planBasicFeaturesData || []);
          
          // Set default billing cycle
          const defaultCycle = cycles?.find((c: BillingCycle) => c.isDefault) || cycles?.[0];
          if (defaultCycle) {
            setSelectedBillingCycleId(defaultCycle.id);
          }

          // Find and set pricing section with plans
          if (pricingSectionId) {
            const section = sections?.find((s: PricingSection) => s.id === pricingSectionId);
            if (section) {
              setPricingSection(section);
              // Extract plans from section
              const sectionPlans = section.sectionPlans
                ?.filter((sp: PricingSectionPlan) => sp.isVisible && sp.plan.isActive)
                ?.sort((a: PricingSectionPlan, b: PricingSectionPlan) => a.plan.position - b.plan.position)
                ?.map((sp: PricingSectionPlan) => sp.plan) || [];
              setPlans(sectionPlans);
            } else {
              setError('Pricing section not found');
            }
          } else {
            setError('No pricing section ID provided');
          }
        } catch (err) {
          console.error('Error loading pricing data:', err);
          setError('Failed to load pricing data');
        } finally {
          setLoading(false);
        }
      };

      loadData();
    } else {
      // Set default billing cycle when server data is provided
      const defaultCycle = serverPricingData.billingCycles?.find((c: BillingCycle) => c.isDefault) || serverPricingData.billingCycles?.[0];
      if (defaultCycle) {
        setSelectedBillingCycleId(defaultCycle.id);
      }
    }
  }, [pricingSectionId, serverPricingData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg" style={{ color: designSystem?.textSecondary || '#6B7280' }}>
          Loading pricing data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!pricingSection || plans.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg" style={{ color: designSystem?.textSecondary || '#6B7280' }}>
          No pricing plans available
        </div>
      </div>
    );
  }

  return (
    <section className={`${className}`} style={{ backgroundColor: designSystem?.backgroundSecondary || '#F6F8FC' }}>
      {/* Full-Width Pricing Cards Section */}
      <div 
        className="w-full py-16"
        style={{ backgroundColor: pricingSection?.pricingCardsBackgroundColor || 'transparent' }}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: designSystem?.textPrimary || '#111827' }}>
            {heading || pricingSection.heading || 'Pricing Plans'}
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: designSystem?.textSecondary || '#6B7280' }}>
            {subheading || pricingSection.subheading || 'Choose a plan below and unlock all the features of Saski AI'}
          </p>
        </div>

        {/* Billing Toggle */}
        {billingCycles.length > 1 && (
          <div className="flex justify-center mb-16">
            <div className="p-2 rounded-xl border shadow-sm" style={{ 
              backgroundColor: designSystem?.backgroundPrimary || '#FFFFFF',
              borderColor: designSystem?.grayMedium || '#6B7280'
            }}>
              {billingCycles.map((cycle) => {
                const savings = calculateSavings(cycle);
                return (
                  <button
                    key={cycle.id}
                    onClick={() => setSelectedBillingCycleId(cycle.id)}
                    className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 relative ${
                      selectedBillingCycleId === cycle.id ? 'shadow-md' : 'hover:bg-opacity-50'
                    }`}
                    style={{
                      backgroundColor: selectedBillingCycleId === cycle.id 
                        ? designSystem?.primaryColor || '#6366F1'
                        : 'transparent',
                      color: selectedBillingCycleId === cycle.id 
                        ? '#FFFFFF'
                        : designSystem?.textPrimary || '#111827'
                    }}
                  >
                    PAY {cycle.label.toUpperCase()}
                    {savings > 0 && selectedBillingCycleId !== cycle.id && (
                      <span className="absolute -top-2 -right-2 text-white text-xs px-2 py-1 rounded-full font-bold"
                            style={{ backgroundColor: designSystem?.accentColor || '#8B5CF6' }}>
                        Save {savings}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const pricing = getPlanPricing(plan.id, selectedBillingCycleId);
            return (
              <div
                key={plan.id}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    plan.isPopular
                      ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
              >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                  </div>
                )}

                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <h4 className="text-xl font-bold text-purple-600">
                          {plan.name}
                        </h4>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">
                          {pricing ? formatPrice(pricing.priceCents) : '$0.00'}
                        </span>
                        <span className="text-gray-600 ml-1">
                          /{billingCycles.find(c => c.id === selectedBillingCycleId)?.label.replace('ly', '') || 'month'}
                        </span>
                      </div>

                    <button 
                        className={`w-full py-3 rounded-lg font-medium transition-all duration-300 mb-6 ${
                          plan.isPopular 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                        onClick={() => {
                          if (pricing?.ctaUrl) {
                            window.open(pricing.ctaUrl, '_blank');
                          }
                        }}
                      >
                        <span className="mr-2">{plan.ctaText || 'Get Started'}</span>
                        <span className="text-lg">✨</span>
                    </button>
                  </div>

                    {/* Feature Limits Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {planFeatureTypes
                        .filter(ft => ft.isActive)
                        .slice(0, 4)
                        .map((featureType) => {
                      const limit = getPlanLimit(plan.id, featureType.id);
                      const limitValue = limit?.isUnlimited ? '∞' : (limit?.value || '0');
                      
                      return (
                            <div 
                              key={featureType.id} 
                              className="bg-gray-50 rounded-lg p-3 text-center"
                            >
                              <div className="flex items-center justify-center mb-1">
                                <IconDisplay 
                                  iconName={featureType.icon} 
                                  iconUrl={featureType.iconUrl} 
                                  className="w-4 h-4 text-gray-600"
                                />
                                <span className="ml-1 text-sm font-medium text-gray-700">
                                  {featureType.name}
                                </span>
                            </div>
                              <div className="text-xl font-bold text-gray-900">
                                {limitValue}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                    {/* Basic Features List */}
                    <div className="space-y-2">
                      {getEnabledBasicFeatures(plan.id).map((feature) => (
                        <div key={feature.id} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-700">
                          {feature.name}
                        </span>
                      </div>
                    ))}
                      {getEnabledBasicFeatures(plan.id).length === 0 && (
                        <div className="text-sm text-gray-500 italic">
                          No basic features assigned to this plan
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Full-Width Comparison Table Section */}
      <div 
        className="w-full py-16"
        style={{ backgroundColor: pricingSection?.comparisonTableBackgroundColor || 'transparent' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 shadow-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: designSystem?.backgroundPrimary || '#FFFFFF' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ background: `linear-gradient(to right, ${designSystem?.primaryColor || '#6366F1'}, ${designSystem?.accentColor || '#8B5CF6'})` }}
                >
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h3 
                  className="text-xl font-bold"
                  style={{ color: designSystem?.textPrimary || '#111827' }}
                >
                  Plan Comparison
                </h3>
              </div>
        </div>

            <div className="overflow-x-auto p-4">
              <table className="min-w-full">
              <thead>
                  <tr className="border-b-2" style={{ borderColor: designSystem?.grayLight || '#E5E7EB' }}>
                    <th 
                      className="text-left py-4 px-6 font-semibold rounded-tl-lg"
                      style={{ 
                        backgroundColor: designSystem?.backgroundSecondary || '#F6F8FC',
                        color: designSystem?.textPrimary || '#111827'
                      }}
                    >
                    Features
                  </th>
                  {plans.map((plan) => {
                    const pricing = getPlanPricing(plan.id, selectedBillingCycleId);
                    
                    return (
                        <th 
                          key={plan.id} 
                          className="text-center py-4 px-6 font-semibold relative"
                          style={{ 
                            backgroundColor: designSystem?.backgroundSecondary || '#F6F8FC',
                            color: designSystem?.textPrimary || '#111827'
                          }}
                        >
                          {plan.isPopular && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <span 
                                className="text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                                style={{
                                  background: `linear-gradient(to right, ${designSystem?.primaryColor || '#6366F1'}, ${designSystem?.accentColor || '#8B5CF6'})`
                                }}
                              >
                              Most Popular
                            </span>
                          </div>
                        )}
                        <div className="mt-2">
                            <div 
                              className="text-lg font-bold"
                              style={{ color: designSystem?.primaryColor || '#6366F1' }}
                            >
                              {plan.name}
                            </div>
                            <div 
                              className="text-2xl font-bold mt-1"
                              style={{ color: designSystem?.textPrimary || '#111827' }}
                            >
                            {pricing ? formatPrice(pricing.priceCents) : '$0.00'}
                          </div>
                            <div 
                              className="text-sm"
                              style={{ color: designSystem?.textSecondary || '#6B7280' }}
                            >
                            /{billingCycles.find(c => c.id === selectedBillingCycleId)?.label.replace('ly', '') || 'month'}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
                <tbody className="divide-y" style={{ borderColor: designSystem?.grayLight || '#E5E7EB' }}>
                {/* Feature Limits Section */}
                  <tr style={{ backgroundColor: designSystem?.backgroundSecondary || '#F6F8FC' }}>
                    <td 
                      colSpan={plans.length + 1} 
                      className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                      style={{ color: designSystem?.textPrimary || '#111827' }}
                    >
                    Feature Limits
                  </td>
                </tr>
                
                {/* Dynamic Feature Types from Database */}
                {planFeatureTypes.filter(ft => ft.isActive).map((featureType) => (
                    <tr key={featureType.id} className="hover:opacity-90 transition-all">
                      <td 
                        className="px-6 py-4 font-medium"
                        style={{ color: designSystem?.textPrimary || '#111827' }}
                      >
                      <div className="flex items-center space-x-3">
                          <IconDisplay 
                            iconName={featureType.icon} 
                            iconUrl={featureType.iconUrl} 
                            className="w-5 h-5 text-gray-600"
                          />
                        <div>
                          <div className="font-semibold">{featureType.name}</div>
                          {featureType.description && (
                              <div 
                                className="text-sm"
                                style={{ color: designSystem?.textSecondary || '#6B7280' }}
                              >
                                {featureType.description}
                              </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {plans.map((plan) => {
                      const limit = getPlanLimit(plan.id, featureType.id);
                      const limitValue = limit?.isUnlimited ? '∞' : (limit?.value || '0');
                      
                      return (
                        <td key={plan.id} className="px-6 py-4 text-center">
                            <div 
                              className="text-lg font-bold"
                              style={{ color: designSystem?.textPrimary || '#111827' }}
                            >
                            {limitValue}
                          </div>
                          {featureType.unit && (
                              <div 
                                className="text-xs"
                                style={{ color: designSystem?.textSecondary || '#6B7280' }}
                              >
                                {featureType.unit}
                              </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Basic Features Section */}
                {basicFeatures.filter(bf => bf.isActive).length > 0 && (
                  <>
                      <tr style={{ backgroundColor: designSystem?.backgroundSecondary || '#F6F8FC' }}>
                        <td 
                          colSpan={plans.length + 1} 
                          className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                          style={{ color: designSystem?.textPrimary || '#111827' }}
                        >
                        Basic Features
                      </td>
                    </tr>
                    {basicFeatures
                      .filter(bf => bf.isActive)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((feature) => (
                          <tr key={feature.id} className="hover:opacity-90 transition-all">
                            <td 
                              className="px-6 py-4 font-medium"
                              style={{ color: designSystem?.textPrimary || '#111827' }}
                            >
                            <div className="flex items-center space-x-3">
                                <CheckCircle 
                                  className="w-5 h-5" 
                                  style={{ color: designSystem?.primaryColor || '#6366F1' }} 
                                />
                              <div>
                                <div className="font-semibold">{feature.name}</div>
                                {feature.description && (
                                    <div 
                                      className="text-sm"
                                      style={{ color: designSystem?.textSecondary || '#6B7280' }}
                                    >
                                      {feature.description}
                                    </div>
                                )}
                              </div>
                            </div>
                          </td>
                          {plans.map((plan) => {
                            const isEnabled = isPlanBasicFeatureEnabled(plan.id, feature.id);
                            
                            return (
                              <td key={plan.id} className="px-6 py-4 text-center">
                                {isEnabled ? (
                                    <Check 
                                      className="w-6 h-6 mx-auto" 
                                      style={{ color: designSystem?.primaryColor || '#6366F1' }} 
                                    />
                                ) : (
                                    <X 
                                      className="w-6 h-6 mx-auto"
                                      style={{ color: designSystem?.grayMedium || '#6B7280' }}
                                    />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {/* CTA Row */}
            <div className="mt-8 border-t pt-6" style={{ borderColor: designSystem?.grayLight || '#E5E7EB' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="hidden md:block"></div>
                {plans.map((plan) => {
                  const pricing = getPlanPricing(plan.id, selectedBillingCycleId);
                  return (
                <div key={plan.id} className="text-center">
                      <button 
                        className="w-full py-3 rounded-lg font-medium transition-all duration-300 text-white shadow-lg hover:shadow-xl"
                        style={{
                          background: plan.isPopular
                            ? `linear-gradient(to right, ${designSystem?.primaryColor || '#6366F1'}, ${designSystem?.accentColor || '#8B5CF6'})`
                            : designSystem?.primaryColor || '#6366F1'
                        }}
                        onClick={() => {
                          if (pricing?.ctaUrl) {
                            window.open(pricing.ctaUrl, '_blank');
                          }
                        }}
                  >
                        <span className="mr-2">{plan.ctaText || `Choose ${plan.name}`}</span>
                    {plan.isPopular && <span className="text-lg">⭐</span>}
                        {pricing?.ctaUrl && <span className="text-lg">→</span>}
                      </button>
                    </div>
                  );
                })}
                </div>
            </div>
          </Card>
          </div>
      </div>
    </section>
  );
} 
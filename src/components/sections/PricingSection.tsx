'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check, X, Star, Zap, Users, Database, Phone } from 'lucide-react';

interface BillingCycle {
  id: string;
  label: string;
  multiplier: number;
  isDefault: boolean;
}

interface SharedFeature {
  id: string;
  name: string;
  icon?: string;
  category?: string;
}

interface PlanFeature {
  id: string;
  planId: string;
  featureId?: string;
  available: boolean;
  label?: string;
  icon?: string;
  feature?: SharedFeature; // Linked shared feature (null for custom features)
}

interface PlanPricing {
  id: string;
  planId: string;
  billingCycleId: string;
  priceCents: number;
  tokens: number;
  assistants: number;
  knowledgebases: number;
  phoneNumbers: number;
  stripePriceId?: string;
  billingCycle: BillingCycle;
}

interface Plan {
  id: string;
  name: string;
  description?: string;
  position: number;
  isActive: boolean;
  isPopular: boolean;
  pricing: PlanPricing[];
  features: PlanFeature[];
}

export default function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [selectedBillingCycleId, setSelectedBillingCycleId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const [plansRes, cyclesRes] = await Promise.all([
          fetch('/api/admin/plans').then(res => res.json()),
          fetch('/api/admin/billing-cycles').then(res => res.json()),
        ]);

        const activePlans = (plansRes || [])
          .filter((plan: Plan) => plan.isActive)
          .sort((a: Plan, b: Plan) => a.position - b.position);

        const activeCycles = (cyclesRes || [])
          .sort((a: BillingCycle, b: BillingCycle) => a.multiplier - b.multiplier);

        setPlans(activePlans);
        setBillingCycles(activeCycles);

        // Set default billing cycle
        const defaultCycle = activeCycles.find((c: any) => c.isDefault) || activeCycles[0];
        if (defaultCycle) {
          setSelectedBillingCycleId(defaultCycle.id);
        }
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  const formatPrice = (cents: number) => {
    const dollars = cents / 100;
    return dollars === Math.floor(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
  };

  const formatLimit = (value: number, unit: string = '') => {
    if (value === -1) return 'Unlimited';
    return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
  };

  const getPlanPricing = (plan: Plan, billingCycleId: string) => {
    return plan.pricing.find(p => p.billingCycleId === billingCycleId);
  };

  const getFeatureDisplayName = (planFeature: PlanFeature) => {
    // For custom features, use the label
    if (!planFeature.featureId && planFeature.label) {
      return planFeature.label;
    }
    // For shared features, use the shared feature name
    if (planFeature.feature) {
      return planFeature.feature.name;
    }
    // Fallback
    return planFeature.label || 'Unknown Feature';
  };

  const getFeatureIcon = (planFeature: PlanFeature) => {
    // Custom feature icon override
    if (planFeature.icon) {
      return planFeature.icon;
    }
    // Shared feature icon
    if (planFeature.feature?.icon) {
      return planFeature.feature.icon;
    }
    // Default icon
    return 'Check';
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (plans.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Pricing Plans Available</h2>
            <p className="text-gray-600">Please check back later for our pricing options.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your business. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Billing Toggle */}
        {billingCycles.length > 1 && (
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1 rounded-lg border border-gray-200">
              {billingCycles.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => setSelectedBillingCycleId(cycle.id)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedBillingCycleId === cycle.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {cycle.label}
                  {cycle.multiplier > 1 && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Save {Math.round((1 - 1/cycle.multiplier) * 100)}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const pricing = getPlanPricing(plan, selectedBillingCycleId);
            const availableFeatures = plan.features.filter(f => f.available);

            return (
              <Card
                key={plan.id}
                className={`relative p-8${plan.isPopular ? ' ring-2 ring-blue-500 shadow-lg' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                  )}
                  
                  {pricing ? (
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(pricing.priceCents)}
                        </span>
                        <span className="text-gray-600 ml-2">
                          /{billingCycles.find(c => c.id === selectedBillingCycleId)?.label.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="text-lg text-gray-500">Custom Pricing</span>
                    </div>
                  )}
                </div>

                {/* Usage Limits */}
                {pricing && (
                  <div className="mb-8 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        Assistants
                      </span>
                      <span className="font-medium">{formatLimit(pricing.assistants)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Zap className="w-4 h-4" />
                        Tokens
                      </span>
                      <span className="font-medium">{formatLimit(pricing.tokens)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Database className="w-4 h-4" />
                        Knowledge Bases
                      </span>
                      <span className="font-medium">{formatLimit(pricing.knowledgebases)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        Phone Numbers
                      </span>
                      <span className="font-medium">{formatLimit(pricing.phoneNumbers)}</span>
                    </div>
                  </div>
                )}

                {/* Features List */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Features included:</h4>
                  <ul className="space-y-3">
                    {availableFeatures.map((planFeature) => (
                      <li key={planFeature.id} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                          {getFeatureDisplayName(planFeature)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.isPopular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  Get Started with {plan.name}
                </Button>

                {pricing?.stripePriceId && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Stripe Price ID: {pricing.stripePriceId}
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            All plans include our core features and 24/7 customer support.
          </p>
          <p className="text-sm text-gray-500">
            Need a custom solution? <a href="#contact" className="text-blue-600 hover:text-blue-700">Contact our sales team</a>
          </p>
        </div>
      </div>
    </section>
  );
} 
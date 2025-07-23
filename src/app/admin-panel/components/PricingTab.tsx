'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Trash2,
  DollarSign,
  Edit,
  Save,
  X,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description?: string;
  position: number;
  isActive: boolean;
  isPopular: boolean;
}

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
  billingCycle?: BillingCycle;
  plan?: Plan;
}

export default function PricingTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [planPricing, setPlanPricing] = useState<PlanPricing[]>([]);
  const [editingPricing, setEditingPricing] = useState<string | null>(null);
  
  const [newPricing, setNewPricing] = useState({
    planId: '',
    billingCycleId: '',
    priceCents: 0,
    stripePriceId: '',
  });

  const api = useAdminApi();

  const fetchData = async () => {
    try {
      const [plansRes, billingCyclesRes, pricingRes] = await Promise.all([
        api.get('/api/admin/plans'),
        api.get('/api/admin/billing-cycles'),
        api.get('/api/admin/plan-pricing'),
      ]);

      setPlans((plansRes as any[]) || []);
      setBillingCycles((billingCyclesRes as any[]) || []);
      setPlanPricing((pricingRes as any[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePricing = async () => {
    if (!newPricing.planId || !newPricing.billingCycleId || newPricing.priceCents <= 0) return;
    
    try {
      await api.post('/api/admin/plan-pricing', newPricing);
      setNewPricing({
        planId: '',
        billingCycleId: '',
        priceCents: 0,
        stripePriceId: '',
      });
      await fetchData();
    } catch (error) {
      console.error('Error creating pricing:', error);
    }
  };

  const handleUpdatePricing = async (id: string, updates: Partial<PlanPricing>) => {
    try {
      await api.put('/api/admin/plan-pricing', { id, ...updates });
      setEditingPricing(null);
      await fetchData();
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  };

  const handleDeletePricing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing?')) return;
    
    try {
      await api.delete(`/api/admin/plan-pricing?id=${id}`);
      await fetchData();
    } catch (error) {
      console.error('Error deleting pricing:', error);
    }
  };

  const getPlanPricing = (planId: string, billingCycleId: string) => {
    return planPricing.find(p => p.planId === planId && p.billingCycleId === billingCycleId);
  };

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const getPlanName = (planId: string) => {
    return plans.find(p => p.id === planId)?.name || 'Unknown Plan';
  };

  const getBillingCycleLabel = (billingCycleId: string) => {
    return billingCycles.find(bc => bc.id === billingCycleId)?.label || 'Unknown Cycle';
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-900 mb-2">💰 Pricing Management</h3>
        <p className="text-green-800">
          Set prices for each plan across different billing cycles. Include Stripe price IDs for payment integration.
        </p>
      </div>

      {/* Add New Pricing */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">➕ Add Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select
              value={newPricing.planId}
              onChange={(e) => setNewPricing({ ...newPricing, planId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Plan</option>
              {plans.filter(p => p.isActive).map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
            <select
              value={newPricing.billingCycleId}
              onChange={(e) => setNewPricing({ ...newPricing, billingCycleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Cycle</option>
              {billingCycles.map(cycle => (
                <option key={cycle.id} value={cycle.id}>{cycle.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (cents)</label>
            <Input
              type="number"
              placeholder="999 (for $9.99)"
              value={newPricing.priceCents}
              onChange={(e) => setNewPricing({ ...newPricing, priceCents: parseInt(e.target.value) || 0 })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Price ID</label>
            <Input
              placeholder="price_1234567890"
              value={newPricing.stripePriceId}
              onChange={(e) => setNewPricing({ ...newPricing, stripePriceId: e.target.value })}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleCreatePricing}
            disabled={!newPricing.planId || !newPricing.billingCycleId || newPricing.priceCents <= 0 || api.loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Pricing
          </Button>
        </div>
      </Card>

      {/* Pricing Grid */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">💳 Current Pricing</h3>
        
        {planPricing.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billing Cycle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stripe Price ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {planPricing.map((pricing) => {
                  const isEditing = editingPricing === pricing.id;
                  
                  return (
                    <tr key={pricing.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getPlanName(pricing.planId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getBillingCycleLabel(pricing.billingCycleId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={pricing.priceCents}
                            onChange={(e) => 
                              setPlanPricing(prev => 
                                prev.map(p => p.id === pricing.id ? { ...p, priceCents: parseInt(e.target.value) || 0 } : p)
                              )
                            }
                            className="w-24"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(pricing.priceCents)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <Input
                            value={pricing.stripePriceId || ''}
                            onChange={(e) => 
                              setPlanPricing(prev => 
                                prev.map(p => p.id === pricing.id ? { ...p, stripePriceId: e.target.value } : p)
                              )
                            }
                            placeholder="price_1234567890"
                            className="w-32"
                          />
                        ) : (
                          <div className="text-sm text-gray-600">
                            {pricing.stripePriceId || 'Not set'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePricing(pricing.id, pricing)}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingPricing(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingPricing(pricing.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePricing(pricing.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No pricing set yet. Add pricing above!</p>
          </div>
        )}
      </Card>

      {/* Pricing Matrix Preview */}
      {plans.length > 0 && billingCycles.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Pricing Matrix</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  {billingCycles.map((cycle) => (
                    <th key={cycle.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {cycle.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans
                  .filter(p => p.isActive)
                  .sort((a, b) => a.position - b.position)
                  .map((plan) => (
                    <tr key={plan.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                            <div className="text-sm text-gray-500">{plan.description}</div>
                          </div>
                          {plan.isPopular && (
                            <Badge variant="success" className="ml-2">Popular</Badge>
                          )}
                        </div>
                      </td>
                      {billingCycles.map((cycle) => {
                        const pricing = getPlanPricing(plan.id, cycle.id);
                        return (
                          <td key={cycle.id} className="px-6 py-4 whitespace-nowrap">
                            {pricing ? (
                              <div className="text-sm text-gray-900">
                                {formatPrice(pricing.priceCents)}
                                {cycle.multiplier > 1 && (
                                  <div className="text-xs text-gray-500">
                                    {formatPrice(pricing.priceCents / cycle.multiplier)}/month
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not set</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
} 
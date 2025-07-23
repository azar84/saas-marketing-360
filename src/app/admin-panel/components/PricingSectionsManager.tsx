'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Layout,
  Grid,
  List,
  Eye,
  EyeOff,
  Users,
  Star,
  ArrowUpDown,
  Check,
  Settings,
  DollarSign,
  Crown,
  ChevronUp,
  ChevronDown,
  Package,
  CheckCircle2,
  Palette
} from 'lucide-react';
import type { 
  PricingSection, 
  PricingSectionPlan, 
  PlanDB,
  PricingSectionLayout 
} from '@/types';

interface PricingSectionsManagerProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

interface DesignSystem {
  id: number;
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  grayLight: string;
  grayMedium: string;
  grayDark: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundDark: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  [key: string]: any;
}

interface ColorOption {
  value: string;
  label: string;
  category: string;
  description: string;
}

const layoutOptions: { value: PricingSectionLayout; label: string; description: string; icon: any }[] = [
  { 
    value: 'standard', 
    label: 'Standard', 
    description: 'Traditional 3-column layout',
    icon: Grid
  },
  { 
    value: 'comparison', 
    label: 'Comparison', 
    description: 'Feature comparison table',
    icon: List
  },
  { 
    value: 'cards', 
    label: 'Cards', 
    description: 'Card-based layout with shadows',
    icon: Grid
  },
  { 
    value: 'grid', 
    label: 'Grid', 
    description: 'Grid layout for many plans',
    icon: Grid
  },
  { 
    value: 'list', 
    label: 'List', 
    description: 'Vertical list layout',
    icon: List
  },
  { 
    value: 'slider', 
    label: 'Slider', 
    description: 'Carousel/slider layout',
    icon: ArrowUpDown
  }
];

// Color Selector Component
const ColorSelector = ({ 
  value, 
  onChange, 
  label, 
  description 
}: { 
  value: string; 
  onChange: (color: string) => void; 
  label: string; 
  description: string; 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const { get } = useAdminApi();

  useEffect(() => {
    const loadDesignSystem = async () => {
      try {
        const response = await get('/api/admin/design-system') as { data?: DesignSystem };
        if (response && response.data) {
          setDesignSystem(response.data);
        }
      } catch (error) {
        console.error('Failed to load design system:', error);
      }
    };
    loadDesignSystem();
  }, [get]);

  const getColorOptions = (): ColorOption[] => {
    if (!designSystem) return [];

    return [
      // Brand Colors
      { value: designSystem.primaryColor, label: 'Primary', category: 'Brand', description: 'Main brand color' },
      { value: designSystem.primaryColorLight, label: 'Primary Light', category: 'Brand', description: 'Light variant of primary' },
      { value: designSystem.primaryColorDark, label: 'Primary Dark', category: 'Brand', description: 'Dark variant of primary' },
      { value: designSystem.secondaryColor, label: 'Secondary', category: 'Brand', description: 'Secondary brand color' },
      { value: designSystem.accentColor, label: 'Accent', category: 'Brand', description: 'Accent color for highlights' },
      
      // Background Colors
      { value: designSystem.backgroundPrimary, label: 'Background Primary', category: 'Background', description: 'Main background color' },
      { value: designSystem.backgroundSecondary, label: 'Background Secondary', category: 'Background', description: 'Secondary background color' },
      { value: designSystem.backgroundDark, label: 'Background Dark', category: 'Background', description: 'Dark background color' },
      
      // Semantic Colors
      { value: designSystem.successColor, label: 'Success', category: 'Semantic', description: 'Success/positive color' },
      { value: designSystem.warningColor, label: 'Warning', category: 'Semantic', description: 'Warning/alert color' },
      { value: designSystem.errorColor, label: 'Error', category: 'Semantic', description: 'Error/danger color' },
      { value: designSystem.infoColor, label: 'Info', category: 'Semantic', description: 'Information color' },
      
      // Neutral Colors
      { value: designSystem.grayLight, label: 'Gray Light', category: 'Neutral', description: 'Light gray color' },
      { value: designSystem.grayMedium, label: 'Gray Medium', category: 'Neutral', description: 'Medium gray color' },
      { value: designSystem.grayDark, label: 'Gray Dark', category: 'Neutral', description: 'Dark gray color' },
      
      // Text Colors
      { value: designSystem.textPrimary, label: 'Text Primary', category: 'Text', description: 'Primary text color' },
      { value: designSystem.textSecondary, label: 'Text Secondary', category: 'Text', description: 'Secondary text color' },
      { value: designSystem.textMuted, label: 'Text Muted', category: 'Text', description: 'Muted text color' },
      
      // Common Colors
      { value: '#FFFFFF', label: 'White', category: 'Common', description: 'Pure white' },
      { value: '#000000', label: 'Black', category: 'Common', description: 'Pure black' },
      { value: '#F8FAFC', label: 'Slate 50', category: 'Common', description: 'Very light slate' },
      { value: '#F1F5F9', label: 'Slate 100', category: 'Common', description: 'Light slate' },
      { value: '#E2E8F0', label: 'Slate 200', category: 'Common', description: 'Medium light slate' },
      { value: '#CBD5E1', label: 'Slate 300', category: 'Common', description: 'Medium slate' },
      { value: '#94A3B8', label: 'Slate 400', category: 'Common', description: 'Medium dark slate' },
      { value: '#64748B', label: 'Slate 500', category: 'Common', description: 'Dark slate' },
      { value: '#475569', label: 'Slate 600', category: 'Common', description: 'Darker slate' },
      { value: '#334155', label: 'Slate 700', category: 'Common', description: 'Very dark slate' },
      { value: '#1E293B', label: 'Slate 800', category: 'Common', description: 'Almost black slate' },
      { value: '#0F172A', label: 'Slate 900', category: 'Common', description: 'Black slate' },
    ];
  };

  const colorOptions = getColorOptions();
  const selectedColor = colorOptions.find(option => option.value === value);
  const categories = [...new Set(colorOptions.map(option => option.category))];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-6 h-6 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: value }}
            />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">
                {selectedColor ? selectedColor.label : 'Select color'}
              </div>
              <div className="text-xs text-gray-500">
                {selectedColor ? selectedColor.description : 'Choose from design system'}
              </div>
            </div>
          </div>
          <Palette className="w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-[9999] w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Search colors..."
                  className="flex-1 text-sm"
                  onChange={(e) => {
                    // Simple search functionality
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredOptions = colorOptions.filter(option => 
                      option.label.toLowerCase().includes(searchTerm) ||
                      option.description.toLowerCase().includes(searchTerm)
                    );
                    // You could implement more sophisticated search here
                  }}
                />
              </div>
            </div>
            
            <div className="p-3 space-y-4">
              {categories.map(category => {
                const categoryColors = colorOptions.filter(option => option.category === category);
                return (
                  <div key={category} className="space-y-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {category}
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {categoryColors.map((colorOption) => (
                        <button
                          key={colorOption.value}
                          type="button"
                          onClick={() => {
                            onChange(colorOption.value);
                            setIsOpen(false);
                          }}
                          className={`flex items-center space-x-3 p-2 rounded text-left hover:bg-gray-50 transition-colors ${
                            value === colorOption.value ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <div 
                            className="w-5 h-5 rounded border border-gray-300 shadow-sm"
                            style={{ backgroundColor: colorOption.value }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {colorOption.label}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {colorOption.description}
                            </div>
                          </div>
                          {value === colorOption.value && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
};

export default function PricingSectionsManager({ onSuccess, onError }: PricingSectionsManagerProps) {
  const { get, post, put, delete: del } = useAdminApi();
  const [loading, setLoading] = useState(false);
  
  const [pricingSections, setPricingSections] = useState<PricingSection[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PlanDB[]>([]);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  
  const [newSection, setNewSection] = useState({
    name: '',
    heading: '',
    subheading: '',
    layoutType: 'standard' as PricingSectionLayout,
    pricingCardsBackgroundColor: '#FFFFFF',
    comparisonTableBackgroundColor: '#F9FAFB',
    isActive: true
  });
  
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editSectionData, setEditSectionData] = useState<any>(null);
  
  const showSuccess = (message: string) => {
    onSuccess?.(message);
  };

  const showError = (message: string) => {
    onError?.(message);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sectionsData, plansData] = await Promise.all([
        get('/api/admin/pricing-sections'),
        get('/api/admin/plans')
      ]);
      
      setPricingSections((sectionsData as PricingSection[]) || []);
      setAvailablePlans(((plansData as PlanDB[]) || []).filter(plan => plan.isActive));
    } catch (error) {
      console.error('Failed to load pricing sections data:', error);
      showError('Failed to load pricing sections data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSection = async () => {
    if (!newSection.name.trim() || !newSection.heading.trim()) {
      showError('Name and heading are required');
      return;
    }

    try {
      setLoading(true);
      const createdSection = await post('/api/admin/pricing-sections', newSection) as PricingSection;
      setPricingSections([...pricingSections, createdSection]);
      setNewSection({
        name: '',
        heading: '',
        subheading: '',
        layoutType: 'standard',
        pricingCardsBackgroundColor: '#FFFFFF',
        comparisonTableBackgroundColor: '#F9FAFB',
        isActive: true
      });
      showSuccess(`Pricing section "${createdSection.name}" created successfully!`);
    } catch (error) {
      console.error('Failed to create pricing section:', error);
      showError('Failed to create pricing section');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSection = (section: PricingSection) => {
    setEditingSection(section.id);
    setEditSectionData({
      name: section.name,
      heading: section.heading,
      subheading: section.subheading || '',
      layoutType: section.layoutType,
      pricingCardsBackgroundColor: section.pricingCardsBackgroundColor || '#FFFFFF',
      comparisonTableBackgroundColor: section.comparisonTableBackgroundColor || '#F9FAFB',
      isActive: section.isActive
    });
  };

  const handleUpdateSection = async () => {
    if (!editingSection || !editSectionData) return;

    try {
      setLoading(true);
      const updatedSection = await put('/api/admin/pricing-sections', {
        id: editingSection,
        ...editSectionData
      }) as PricingSection;

      setPricingSections(pricingSections.map(section => 
        section.id === editingSection ? updatedSection : section
      ));

      setEditingSection(null);
      setEditSectionData(null);
      showSuccess(`Pricing section "${editSectionData.name}" updated successfully!`);
    } catch (error) {
      console.error('Failed to update pricing section:', error);
      showError('Failed to update pricing section');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditSectionData(null);
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this pricing section?')) return;

    try {
      setLoading(true);
      await del(`/api/admin/pricing-sections?id=${sectionId}`);
      setPricingSections(pricingSections.filter(section => section.id !== sectionId));
      showSuccess('Pricing section deleted successfully');
    } catch (error) {
      console.error('Failed to delete pricing section:', error);
      showError('Failed to delete pricing section');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlanToSection = async (sectionId: number, planId: string) => {
    try {
      setLoading(true);
      const newSectionPlan = await post('/api/admin/pricing-section-plans', {
        pricingSectionId: sectionId,
        planId,
        sortOrder: 0,
        isVisible: true
      }) as PricingSectionPlan;

      // Update the local state
      setPricingSections(pricingSections.map(section => 
        section.id === sectionId 
          ? { ...section, sectionPlans: [...section.sectionPlans, newSectionPlan] }
          : section
      ));

      showSuccess('Plan added to pricing section successfully');
    } catch (error) {
      console.error('Failed to add plan to section:', error);
      showError('Failed to add plan to pricing section');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlanFromSection = async (sectionPlanId: number, sectionId: number) => {
    try {
      setLoading(true);
      await del(`/api/admin/pricing-section-plans?id=${sectionPlanId}`);

      // Update the local state
      setPricingSections(pricingSections.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              sectionPlans: section.sectionPlans.filter(sp => sp.id !== sectionPlanId) 
            }
          : section
      ));

      showSuccess('Plan removed from pricing section successfully');
    } catch (error) {
      console.error('Failed to remove plan from section:', error);
      showError('Failed to remove plan from pricing section');
    } finally {
      setLoading(false);
    }
  };

  const getAvailablePlansForSection = (sectionId: number) => {
    const section = pricingSections.find(s => s.id === sectionId);
    if (!section) return availablePlans;

    const usedPlanIds = section.sectionPlans.map(sp => sp.planId);
    return availablePlans.filter(plan => !usedPlanIds.includes(plan.id));
  };

  const getLayoutIcon = (layoutType: string) => {
    const layout = layoutOptions.find(l => l.value === layoutType);
    return layout ? layout.icon : Grid;
  };

  const formatPlanPrice = (plan: PlanDB) => {
    if (!plan.pricing || plan.pricing.length === 0) return 'Custom';
    
    // Get the first pricing (usually monthly)
    const pricing = plan.pricing[0];
    const price = pricing.priceCents / 100;
    return `$${price}${price === Math.floor(price) ? '' : '.00'}`;
  };

  const getPlanFeatureCount = (plan: PlanDB) => {
    let count = 0;
    if (plan.features) count += plan.features.length;
    if (plan.basicFeatures) count += plan.basicFeatures.length;
    if (plan.featureLimits) count += plan.featureLimits.length;
    return count;
  };

  if (loading && pricingSections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Create New Pricing Section */}
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Plus className="w-6 h-6 text-white" />
          </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Create New Pricing Section</h3>
              <p className="text-blue-100 mt-1">Design and configure a new pricing section for your website</p>
            </div>
          </div>
        </div>
        
        {/* Form Content */}
        <div className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Internal Name <span className="text-red-500">*</span>
                </label>
          <Input
                  placeholder="e.g., 'Home Page Pricing', 'Enterprise Plans'"
            value={newSection.name}
            onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                  className="h-12 text-base"
          />
                <p className="text-xs text-gray-500">Used internally for organization</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Display Heading <span className="text-red-500">*</span>
                </label>
          <Input
                  placeholder="e.g., 'Choose Your Plan', 'Pricing Plans'"
            value={newSection.heading}
            onChange={(e) => setNewSection({ ...newSection, heading: e.target.value })}
                  className="h-12 text-base"
          />
                <p className="text-xs text-gray-500">Main heading shown to visitors</p>
              </div>
        </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Subheading
              </label>
          <Input
                placeholder="e.g., 'Select the perfect plan for your business needs'"
            value={newSection.subheading}
            onChange={(e) => setNewSection({ ...newSection, subheading: e.target.value })}
                className="h-12 text-base"
          />
              <p className="text-xs text-gray-500">Optional subtitle to provide more context</p>
            </div>
        </div>

          {/* Layout Selection */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">Layout Configuration</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Choose Layout Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {layoutOptions.map((layout) => {
              const IconComponent = layout.icon;
              const isSelected = newSection.layoutType === layout.value;
              return (
                <button
                  key={layout.value}
                  onClick={() => setNewSection({ ...newSection, layoutType: layout.value })}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="text-center">
                        <div className={`p-3 rounded-xl mb-3 mx-auto w-fit ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <IconComponent className={`w-8 h-8 ${
                            isSelected ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className={`text-sm font-semibold mb-1 ${
                          isSelected ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {layout.label}
                        </div>
                        <div className={`text-xs ${
                          isSelected ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {layout.description}
                        </div>
                      </div>
                </button>
              );
            })}
              </div>
          </div>
        </div>

          {/* Background Colors */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">Visual Styling</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Pricing Cards Background
                  </label>
                  <ColorSelector
                    value={newSection.pricingCardsBackgroundColor}
                    onChange={(color) => setNewSection({ ...newSection, pricingCardsBackgroundColor: color })}
                    label="Pricing Cards Background"
                    description="Background color for the pricing cards section"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Comparison Table Background
                  </label>
                  <ColorSelector
                    value={newSection.comparisonTableBackgroundColor}
                    onChange={(color) => setNewSection({ ...newSection, comparisonTableBackgroundColor: color })}
                    label="Comparison Table Background"
                    description="Background color for the comparison table section"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </div>
          <Button
            onClick={handleCreateSection}
            disabled={loading || !newSection.name.trim() || !newSection.heading.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
            Create Pricing Section
                </>
              )}
          </Button>
          </div>
        </div>
      </Card>

      {/* Existing Pricing Sections */}
      <div className="grid grid-cols-1 gap-6">
        {pricingSections.map((section) => {
          const isExpanded = expandedSection === section.id;
          const isEditing = editingSection === section.id;
          const LayoutIcon = getLayoutIcon(section.layoutType);
          const availablePlansForSection = getAvailablePlansForSection(section.id);
          
          return (
            <Card key={section.id} className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/30 px-6 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-sm">
                      <LayoutIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      {isEditing ? (
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                          <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                <h5 className="text-base font-semibold text-gray-900">Edit Information</h5>
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Internal Name <span className="text-red-500">*</span>
                                  </label>
                          <Input
                            value={editSectionData?.name || ''}
                            onChange={(e) => setEditSectionData({ ...editSectionData, name: e.target.value })}
                            placeholder="Section name"
                                    className="h-11 text-base"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Display Heading <span className="text-red-500">*</span>
                                  </label>
                          <Input
                            value={editSectionData?.heading || ''}
                            onChange={(e) => setEditSectionData({ ...editSectionData, heading: e.target.value })}
                            placeholder="Display heading"
                                    className="h-11 text-base"
                          />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Subheading
                                </label>
                          <Input
                            value={editSectionData?.subheading || ''}
                            onChange={(e) => setEditSectionData({ ...editSectionData, subheading: e.target.value })}
                            placeholder="Subheading (optional)"
                                  className="h-11 text-base"
                          />
                              </div>
                            </div>

                            {/* Layout Selection */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                                <h5 className="text-base font-semibold text-gray-900">Layout Type</h5>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {layoutOptions.map((layout) => {
                                  const IconComponent = layout.icon;
                                  const isSelected = editSectionData?.layoutType === layout.value;
                                  return (
                                    <button
                                      key={layout.value}
                                      onClick={() => setEditSectionData({ ...editSectionData, layoutType: layout.value })}
                                      className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                                        isSelected
                                          ? 'border-blue-500 bg-blue-50 shadow-md'
                                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                          <Check className="w-3 h-3 text-white" />
                                        </div>
                                      )}
                                      <div className="text-center">
                                        <div className={`p-2 rounded-lg mb-2 mx-auto w-fit ${
                                          isSelected ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
                                        }`}>
                                          <IconComponent className={`w-6 h-6 ${
                                            isSelected ? 'text-blue-600' : 'text-gray-600'
                                          }`} />
                                        </div>
                                        <div className={`text-xs font-medium mb-1 ${
                                          isSelected ? 'text-blue-700' : 'text-gray-900'
                                        }`}>
                                          {layout.label}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Background Colors */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                                <h5 className="text-base font-semibold text-gray-900">Background Colors</h5>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Pricing Cards Background
                                  </label>
                                  <ColorSelector
                                    value={editSectionData?.pricingCardsBackgroundColor || '#FFFFFF'}
                                    onChange={(color) => setEditSectionData({ ...editSectionData, pricingCardsBackgroundColor: color })}
                                    label="Pricing Cards Background"
                                    description="Background color for the pricing cards section"
                                  />
                                </div>
                                
                                <div className="space-y-3">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Comparison Table Background
                                  </label>
                                  <ColorSelector
                                    value={editSectionData?.comparisonTableBackgroundColor || '#F9FAFB'}
                                    onChange={(color) => setEditSectionData({ ...editSectionData, comparisonTableBackgroundColor: color })}
                                    label="Comparison Table Background"
                                    description="Background color for the comparison table section"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div className="text-sm text-gray-500">
                                <span className="text-red-500">*</span> Required fields
                              </div>
                              <div className="flex space-x-3">
                                <Button
                                  onClick={handleCancelEdit}
                                  variant="outline"
                                  className="px-6 py-2 h-10 text-sm font-medium border-gray-300 hover:bg-gray-50"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleUpdateSection}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 h-10 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                  {loading ? (
                                    <div className="flex items-center space-x-2">
                                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                      <span>Saving...</span>
                        </div>
                      ) : (
                                    <>
                                      <Save className="w-4 h-4 mr-2" />
                                      Save Changes
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{section.name}</h3>
                            <div className="space-y-1">
                              <p className="text-gray-700 font-medium">"{section.heading}"</p>
                          {section.subheading && (
                                <p className="text-sm text-gray-500 italic">"{section.subheading}"</p>
                          )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant={section.isActive ? 'default' : 'secondary'} className="px-3 py-1">
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${section.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <span>{section.isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                            </Badge>
                            <Badge variant="outline" className="capitalize px-3 py-1 border-blue-200 text-blue-700 bg-blue-50">
                              <LayoutIcon className="w-3 h-3 mr-1" />
                              {section.layoutType}
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1 border-purple-200 text-purple-700 bg-purple-50">
                              <Package className="w-3 h-3 mr-1" />
                              {section.sectionPlans.length} plans
                            </Badge>
                          </div>
                          
                          {/* Background Color Preview */}
                          <div className="flex items-center space-x-4 pt-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Cards BG:</span>
                              <div 
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: section.pricingCardsBackgroundColor || '#FFFFFF' }}
                              ></div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Table BG:</span>
                              <div 
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: section.comparisonTableBackgroundColor || '#F9FAFB' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {isEditing ? (
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleUpdateSection}
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                          size="sm"
                          className={`px-4 py-2 h-9 text-sm font-medium transition-all duration-200 ${
                            isExpanded 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                              : 'bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Plans
                            </>
                          ) : (
                            <>
                              <Package className="w-4 h-4 mr-2" />
                              Manage Plans
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleEditSection(section)}
                          size="sm"
                          variant="outline"
                          className="px-4 py-2 h-9 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteSection(section.id)}
                          size="sm"
                          variant="outline"
                          className="px-4 py-2 h-9 text-sm font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Plan Management Section */}
              {isExpanded && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-pink-600" />
                      Plan Management
                    </h4>
                    <div className="text-sm text-gray-500">
                      {section.sectionPlans.length} of {availablePlans.length} plans selected
                    </div>
                  </div>

                  {/* Available Plans Grid */}
                  {availablePlansForSection.length > 0 && (
                    <div>
                      <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                        <Plus className="w-4 h-4 mr-2 text-green-600" />
                        Available Plans to Add ({availablePlansForSection.length})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availablePlansForSection.map((plan) => (
                          <Card
                            key={plan.id}
                            className="p-4 hover:shadow-md border-2 border-dashed border-gray-200 hover:border-green-300 transition-all cursor-pointer bg-gradient-to-br from-white to-green-50/30"
                            onClick={() => handleAddPlanToSection(section.id, plan.id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h6 className="font-semibold text-gray-900">{plan.name}</h6>
                                  {plan.isPopular && (
                                    <Crown className="w-4 h-4 text-yellow-500 fill-current" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <DollarSign className="w-3 h-3" />
                                  <span className="font-medium">{formatPlanPrice(plan)}</span>
                                  <span>•</span>
                                  <span>{getPlanFeatureCount(plan)} features</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700 ml-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddPlanToSection(section.id, plan.id);
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                            {plan.description && (
                              <p className="text-xs text-gray-500 line-clamp-2">{plan.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              <Badge variant={plan.isActive ? 'default' : 'secondary'} className="text-xs">
                                {plan.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <div className="text-xs text-gray-400">
                                Position: {plan.position}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Plans in Section */}
                  <div>
                    <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                      Plans in This Section ({section.sectionPlans.length})
                    </h5>
                    
                    {section.sectionPlans.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.sectionPlans.map((sectionPlan) => (
                          <Card
                            key={sectionPlan.id}
                            className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h6 className="font-semibold text-gray-900">{sectionPlan.plan.name}</h6>
                                  {sectionPlan.plan.isPopular && (
                                    <Crown className="w-4 h-4 text-yellow-500 fill-current" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <DollarSign className="w-3 h-3" />
                                  <span className="font-medium">{formatPlanPrice(sectionPlan.plan)}</span>
                                  <span>•</span>
                                  <span>{getPlanFeatureCount(sectionPlan.plan)} features</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 border-red-200 ml-2"
                                onClick={() => handleRemovePlanFromSection(sectionPlan.id, section.id)}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant={sectionPlan.isVisible ? 'default' : 'secondary'} className="text-xs">
                                  {sectionPlan.isVisible ? 'Visible' : 'Hidden'}
                                </Badge>
                                {sectionPlan.plan.isPopular && (
                                  <Badge className="text-xs bg-yellow-100 text-yellow-800">Popular</Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Order: {sectionPlan.sortOrder}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center border-2 border-dashed border-gray-200 bg-gray-50">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <h6 className="font-semibold text-gray-700 mb-1">No Plans Added Yet</h6>
                        <p className="text-sm text-gray-500 mb-4">
                          Add plans from the available list above to populate this pricing section
                        </p>
                        {availablePlansForSection.length > 0 && (
                          <Button
                            size="sm"
                            onClick={() => handleAddPlanToSection(section.id, availablePlansForSection[0].id)}
                            className="bg-pink-600 text-white hover:bg-pink-700"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add First Plan
                          </Button>
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {pricingSections.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pricing Sections Yet</h3>
          <p className="text-gray-600 mb-6">Create your first pricing section to get started organizing your pricing displays.</p>
        </Card>
      )}
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import UniversalIconPicker from '@/components/ui/UniversalIconPicker';
import { renderIcon } from '@/lib/iconUtils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Copy,
  ExternalLink,
  Target,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  Eye,
  EyeOff
} from 'lucide-react';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';

interface CTA {
  id: number;
  text: string;
  url: string;
  customId?: string;
  icon?: string;
  style: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  target: '_self' | '_blank';
  isActive: boolean;
  // JavaScript Events
  events?: Array<{
    id: string;
    eventType: 'onClick' | 'onHover' | 'onMouseOut' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'onKeyUp' | 'onTouchStart' | 'onTouchEnd';
    functionName: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface HeaderCTA {
  id: number;
  headerConfigId: number;
  ctaId: number;
  sortOrder: number;
  isVisible: boolean;
  cta: CTA;
}

interface CTAFormData {
    text: string;
    url: string;
    customId: string;
    icon: string;
    style: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
    target: '_self' | '_blank';
    isActive: boolean;
    // JavaScript Events
    events: Array<{
        id: string;
        eventType: 'onClick' | 'onHover' | 'onMouseOut' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'onKeyUp' | 'onTouchStart' | 'onTouchEnd';
        functionName: string;
        description: string;
    }>;
}

export default function CTAManager() {
  const { designSystem } = useDesignSystem();
  const adminColors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  const [ctas, setCtas] = useState<CTA[]>([]);
  const [headerCtas, setHeaderCtas] = useState<HeaderCTA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showGlobalFunctions, setShowGlobalFunctions] = useState(false);
  const [globalFunctions, setGlobalFunctions] = useState<string>('');
  const [formData, setFormData] = useState<CTAFormData>({
    text: '',
    url: '',
    customId: '',
    icon: '',
    style: 'primary',
    target: '_self',
    isActive: true,
    events: []
  });

  // Event type options
  const eventTypeOptions = [
    { value: 'onClick', label: 'Click Event', description: 'Executes when button is clicked' },
    { value: 'onHover', label: 'Hover Event', description: 'Executes when mouse enters button' },
    { value: 'onMouseOut', label: 'Mouse Out Event', description: 'Executes when mouse leaves button' },
    { value: 'onFocus', label: 'Focus Event', description: 'Executes when button gains focus' },
    { value: 'onBlur', label: 'Blur Event', description: 'Executes when button loses focus' },
    { value: 'onKeyDown', label: 'Key Down Event', description: 'Executes when key is pressed' },
    { value: 'onKeyUp', label: 'Key Up Event', description: 'Executes when key is released' },
    { value: 'onTouchStart', label: 'Touch Start Event', description: 'Executes when touch begins' },
    { value: 'onTouchEnd', label: 'Touch End Event', description: 'Executes when touch ends' }
  ];

  // Predefined function templates
  const functionTemplates = [
    { name: 'openYouTubePopup', code: 'function openYouTubePopup() {\n  // Create modal or popup for YouTube video\n  const modal = document.createElement("div");\n  modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;";\n  modal.innerHTML = \'<iframe width="560" height="315" src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1" frameborder="0" allowfullscreen></iframe><button onclick="this.parentElement.remove()" style="position:absolute;top:20px;right:20px;background:white;border:none;padding:10px;cursor:pointer;">×</button>\';\n  document.body.appendChild(modal);\n}' },
    { name: 'trackAnalytics', code: 'function trackAnalytics(eventName, category = "CTA") {\n  // Google Analytics tracking\n  if (typeof gtag !== "undefined") {\n    gtag("event", eventName, {\n      event_category: category,\n      event_label: "CTA Button"\n    });\n  }\n  console.log(`Analytics: ${eventName} in ${category}`);\n}' },
    { name: 'showNotification', code: 'function showNotification(message, type = "info") {\n  const notification = document.createElement("div");\n  notification.style.cssText = "position:fixed;top:20px;right:20px;padding:15px;border-radius:5px;color:white;z-index:9999;max-width:300px;";\n  notification.style.background = type === "success" ? "#10B981" : type === "error" ? "#EF4444" : "#3B82F6";\n  notification.textContent = message;\n  document.body.appendChild(notification);\n  setTimeout(() => notification.remove(), 3000);\n}' },
    { name: 'scrollToSection', code: 'function scrollToSection(sectionId) {\n  const element = document.getElementById(sectionId);\n  if (element) {\n    element.scrollIntoView({ behavior: "smooth" });\n  }\n}' },
    { name: 'toggleModal', code: 'function toggleModal(modalId) {\n  const modal = document.getElementById(modalId);\n  if (modal) {\n    modal.style.display = modal.style.display === "none" ? "block" : "none";\n  }\n}' }
  ];

  const fetchCtas = async () => {
    try {
      const response = await fetch('/api/admin/cta-buttons');
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          console.log('Fetched CTAs:', result.data);
          setCtas(result.data);
        } else {
          console.error('Invalid CTA data structure:', result);
          setCtas([]);
        }
      } else {
        console.error('Failed to fetch CTAs:', response.status);
        setCtas([]);
      }
    } catch (error) {
      console.error('Error fetching CTAs:', error);
      setCtas([]);
    }
  };

  const fetchHeaderConfig = async () => {
    try {
      const response = await fetch('/api/admin/header-config');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setHeaderCtas(data[0].headerCTAs || []);
        } else {
          setHeaderCtas([]);
        }
      } else {
        console.error('Failed to fetch header config:', response.status);
        setHeaderCtas([]);
      }
    } catch (error) {
      console.error('Error fetching header config:', error);
      setHeaderCtas([]);
    }
  };

  const fetchGlobalFunctions = async () => {
    try {
      const response = await fetch('/api/admin/global-functions');
      if (response.ok) {
        const data = await response.json();
        setGlobalFunctions(data.functions || '');
      }
    } catch (error) {
      console.error('Error fetching global functions:', error);
    }
  };

  const saveGlobalFunctions = async () => {
    try {
      const response = await fetch('/api/admin/global-functions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ functions: globalFunctions })
      });
      if (response.ok) {
        console.log('Global functions saved successfully');
      }
    } catch (error) {
      console.error('Error saving global functions:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCtas(), fetchHeaderConfig(), fetchGlobalFunctions()]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/cta-buttons';
      const method = editingId ? 'PUT' : 'POST';
      
      // Prepare the body with events array
      const body = editingId ? { 
        ...formData, 
        id: editingId,
        events: formData.events
      } : {
        ...formData,
        events: formData.events
      };

      console.log('Saving CTA with data:', body);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('CTA saved successfully:', result);
        await fetchCtas();
        await fetchHeaderConfig();
        resetForm();
      } else {
        console.error('Failed to save CTA:', result);
        alert(`Failed to save CTA: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving CTA:', error);
      alert('Network error occurred while saving CTA');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this CTA button?')) return;

    try {
      const response = await fetch('/api/admin/cta-buttons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        await fetchCtas();
        await fetchHeaderConfig();
      }
    } catch (error) {
      console.error('Error deleting CTA:', error);
    }
  };

  const toggleHeaderVisibility = async (headerCtaId: number, currentVisibility: boolean) => {
    try {
      const response = await fetch('/api/admin/header-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headerCTAs: headerCtas.map(hcta => 
            hcta.id === headerCtaId 
              ? { ...hcta, isVisible: !currentVisibility }
              : hcta
          )
        })
      });

      if (response.ok) {
        await fetchHeaderConfig();
      }
    } catch (error) {
      console.error('Error toggling header visibility:', error);
    }
  };

  const addToHeader = async (ctaId: number) => {
    try {
      const newHeaderCta = {
        headerConfigId: 1, // Assuming first header config
        ctaId: ctaId,
        sortOrder: headerCtas.length + 1,
        isVisible: true
      };

      const response = await fetch('/api/admin/header-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headerCTAs: [...headerCtas, newHeaderCta]
        })
      });

      if (response.ok) {
        await fetchHeaderConfig();
      }
    } catch (error) {
      console.error('Error adding CTA to header:', error);
    }
  };

  const removeFromHeader = async (headerCtaId: number) => {
    try {
      const response = await fetch('/api/admin/header-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headerCTAs: headerCtas.filter(hcta => hcta.id !== headerCtaId)
        })
      });

      if (response.ok) {
        await fetchHeaderConfig();
      }
    } catch (error) {
      console.error('Error removing CTA from header:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      url: '',
      customId: '',
      icon: '',
      style: 'primary',
      target: '_self',
      isActive: true,
      events: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (cta: CTA) => {
    setFormData({
      text: cta.text,
      url: cta.url,
      customId: cta.customId || '',
      icon: cta.icon || '',
      style: cta.style,
      target: cta.target,
      isActive: cta.isActive,
      events: cta.events || []
    });
    setEditingId(cta.id);
    setShowForm(true);
  };

  const getStyleColor = (style: string) => {
    const colors: { [key: string]: string } = {
      primary: 'bg-blue-100 text-blue-800',
      secondary: 'bg-gray-100 text-gray-800',
      accent: 'bg-purple-100 text-purple-800',
      ghost: 'bg-gray-100 text-gray-600',
      destructive: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
      info: 'bg-blue-100 text-blue-800',
      outline: 'bg-white text-gray-800 border border-gray-300',
      muted: 'bg-gray-100 text-gray-500'
    };
    return colors[style] || colors.primary;
  };

  const isCtaInHeader = (ctaId: number) => {
    return headerCtas.some(headerCta => headerCta.ctaId === ctaId);
  };

  const addEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      eventType: 'onClick' as const,
      functionName: '',
      description: ''
    };
    setFormData({
      ...formData,
      events: [...formData.events, newEvent]
    });
  };

  const removeEvent = (eventId: string) => {
    setFormData({
      ...formData,
      events: formData.events.filter(event => event.id !== eventId)
    });
  };

  const updateEvent = (eventId: string, field: string, value: string) => {
    setFormData({
      ...formData,
      events: formData.events.map(event => 
        event.id === eventId ? { ...event, [field]: value } : event
      )
    });
  };

  const insertFunctionTemplate = (template: { name: string; code: string }) => {
    setGlobalFunctions(prev => prev + '\n\n' + template.code);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: 'var(--color-primary, #5243E9)' }}
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 
            className="text-3xl font-bold"
            style={{ color: 'var(--color-text-primary, #1F2937)' }}
          >
            CTA Button Manager
          </h2>
          <p 
            className="mt-2"
            style={{ color: 'var(--color-text-secondary, #6B7280)' }}
          >
            Manage call-to-action buttons for your website header
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({
              text: '',
              url: '',
              customId: '',
              icon: '',
              style: 'primary',
              target: '_self',
              isActive: true,
              events: []
            });
            setShowForm(true);
          }}
          style={{
            backgroundColor: 'var(--color-success, #10B981)',
            color: '#FFFFFF'
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create CTA Button
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-6 border-2">
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold"
              style={{ color: 'var(--color-text-primary, #1F2937)' }}
            >
              {editingId ? 'Edit CTA Button' : 'Create New CTA Button'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              style={{ color: 'var(--color-text-secondary, #6B7280)' }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  Button Text *
                </label>
                <Input
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="e.g., Get Started, Sign Up, Learn More"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  URL *
                </label>
                <Input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com, /page, #section, or #"
                  required
                  className="h-12"
                />
                <p 
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                >
                  Enter a full URL, relative path, anchor link (e.g., #pricing, #contact), or empty anchor (#)
                </p>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  Custom ID (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.customId}
                  onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                  placeholder="e.g., cta-primary, signup-button, hero-cta"
                  className="h-12"
                />
                <p 
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                >
                  Custom HTML ID for the button element (for CSS/JS targeting)
                </p>
              </div>

              <div className="md:col-span-2">
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  Button Style
                </label>
                
                {/* Style Preview Grid */}
                <div 
                  className="mb-4 p-4 border rounded-lg"
                  style={{ 
                    borderColor: 'var(--color-gray-light, #E5E7EB)',
                    backgroundColor: 'var(--color-bg-secondary, #F9FAFB)'
                  }}
                >
                  <p 
                    className="text-sm mb-3"
                    style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                  >
                    Click a style to select it:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { value: 'primary', label: 'Primary', description: 'Main action' },
                      { value: 'secondary', label: 'Secondary', description: 'Supporting action' },
                      { value: 'accent', label: 'Accent', description: 'Special offers' },
                      { value: 'ghost', label: 'Ghost', description: 'Minimal action' },
                      { value: 'destructive', label: 'Destructive', description: 'Delete/Remove' },
                      { value: 'success', label: 'Success', description: 'Save/Confirm' },
                      { value: 'info', label: 'Info', description: 'Help/More info' },
                      { value: 'outline', label: 'Outline', description: 'Styled secondary' },
                      { value: 'muted', label: 'Muted', description: 'Disabled/Inactive' }
                    ].map((styleOption) => (
                      <div
                        key={styleOption.value}
                        className="p-3 rounded-lg border-2 cursor-pointer transition-all duration-200"
                        style={{
                          borderColor: formData.style === styleOption.value
                            ? 'var(--color-primary, #5243E9)'
                            : 'var(--color-gray-light, #E5E7EB)',
                          backgroundColor: formData.style === styleOption.value
                            ? 'var(--color-bg-secondary, #F9FAFB)'
                            : 'var(--color-bg-primary, #FFFFFF)',
                          boxShadow: formData.style === styleOption.value ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : undefined
                        }}
                        onClick={() => setFormData({ ...formData, style: styleOption.value as any })}
                      >
                        <div className="text-center space-y-2">
                          <Button
                            variant={styleOption.value as any}
                            size="sm"
                            className="w-full pointer-events-none"
                            disabled={styleOption.value === 'muted'}
                          >
                            {formData.text || 'Sample Text'}
                          </Button>
                          <div>
                            <p 
                              className="text-xs font-semibold"
                              style={{ color: 'var(--color-text-primary, #1F2937)' }}
                            >
                              {styleOption.label}
                            </p>
                            <p 
                              className="text-xs"
                              style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                            >
                              {styleOption.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fallback select for accessibility */}
                <select
                  value={formData.style}
                  onChange={(e) => {
                    const value = e.target.value as 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
                    setFormData({ ...formData, style: value });
                  }}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sr-only"
                  aria-label="Button style selector"
                >
                  <option value="primary">Primary - Main Action (Brand)</option>
                  <option value="secondary">Secondary - Supporting Action</option>
                  <option value="accent">Accent - Limited Offers/Highlights</option>
                  <option value="ghost">Ghost - Minimal Action</option>
                  <option value="destructive">Destructive - Delete/Remove</option>
                  <option value="success">Success - Confirmations/Save</option>
                  <option value="info">Info - Help/More Info</option>
                  <option value="outline">Outline - Styled Secondary</option>
                  <option value="muted">Muted - Disabled/Inactive</option>
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  Link Target
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => {
                    const value = e.target.value as '_self' | '_blank';
                    setFormData({ ...formData, target: value });
                  }}
                  className="w-full h-12 px-4 border rounded-lg"
                  style={{
                    borderColor: 'var(--color-gray-light, #E5E7EB)',
                    backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
                    color: 'var(--color-text-primary, #1F2937)'
                  }}
                >
                  <option value="_self">Same Tab</option>
                  <option value="_blank">New Tab</option>
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  Icon
                </label>
                <UniversalIconPicker
                  value={formData.icon}
                  onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
                  placeholder="Select an icon"
                  className="w-full"
                />
              </div>
            </div>

            {/* Enhanced JavaScript Events Section */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h4 
                  className="text-lg font-semibold flex items-center"
                  style={{ color: 'var(--color-text-primary, #1F2937)' }}
                >
                  <MousePointer 
                    className="w-5 h-5 mr-2"
                    style={{ color: 'var(--color-secondary, #7C3AED)' }}
                  />
                  JavaScript Events & Functions
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGlobalFunctions(!showGlobalFunctions)}
                  style={{
                    color: 'var(--color-secondary, #7C3AED)',
                    borderColor: 'var(--color-secondary, #7C3AED)'
                  }}
                >
                  {showGlobalFunctions ? 'Hide' : 'Show'} Global Functions
                </Button>
              </div>

              {/* Global Functions Section */}
              {showGlobalFunctions && (
                <div 
                  className="mb-6 p-4 border rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary, #F9FAFB)',
                    borderColor: 'var(--color-secondary, #7C3AED)'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 
                      className="text-md font-semibold"
                      style={{ color: 'var(--color-secondary, #7C3AED)' }}
                    >
                      Global JavaScript Functions
                    </h5>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveGlobalFunctions}
                        style={{
                          backgroundColor: 'var(--color-secondary, #7C3AED)',
                          color: '#FFFFFF'
                        }}
                      >
                        Save Functions
                      </Button>
                    </div>
                  </div>
                  
                  <p 
                    className="text-sm mb-3"
                    style={{ color: 'var(--color-secondary, #7C3AED)' }}
                  >
                    These functions will be loaded globally and available to all CTAs. They're injected after the body tag opens.
                  </p>

                  {/* Function Templates */}
                  <div className="mb-3">
                    <p 
                      className="text-xs font-medium mb-2"
                      style={{ color: 'var(--color-secondary, #7C3AED)' }}
                    >
                      Quick Templates:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {functionTemplates.map((template) => (
                        <Button
                          key={template.name}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => insertFunctionTemplate(template)}
                          style={{
                            borderColor: 'var(--color-secondary, #7C3AED)',
                            color: 'var(--color-secondary, #7C3AED)'
                          }}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={globalFunctions}
                    onChange={(e) => setGlobalFunctions(e.target.value)}
                    placeholder="// Add your global JavaScript functions here\n// These will be available to all CTAs\n\nfunction exampleFunction() {\n  console.log('Hello from global function!');\n}"
                    className="w-full h-32 px-3 py-2 border rounded-lg text-sm font-mono"
                    style={{
                      borderColor: 'var(--color-secondary, #7C3AED)',
                      backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
                      color: 'var(--color-text-primary, #1F2937)'
                    }}
                  />
                  <style jsx>{`
                    textarea::placeholder {
                      color: var(--color-text-muted, #9CA3AF) !important;
                      opacity: 1;
                    }
                    textarea::-webkit-input-placeholder {
                      color: var(--color-text-muted, #9CA3AF) !important;
                      opacity: 1;
                    }
                    textarea::-moz-placeholder {
                      color: var(--color-text-muted, #9CA3AF) !important;
                      opacity: 1;
                    }
                    textarea:-ms-input-placeholder {
                      color: var(--color-text-muted, #9CA3AF) !important;
                      opacity: 1;
                    }
                    textarea:-moz-placeholder {
                      color: var(--color-text-muted, #9CA3AF) !important;
                      opacity: 1;
                    }
                  `}</style>
                </div>
              )}

              {/* Event Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 
                    className="text-md font-semibold"
                    style={{ color: 'var(--color-text-primary, #1F2937)' }}
                  >
                    Event Configuration
                  </h5>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addEvent}
                    style={{
                      backgroundColor: 'var(--color-primary, #5243E9)',
                      color: '#FFFFFF'
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Event
                  </Button>
                </div>

                {formData.events.length === 0 ? (
                  <div 
                    className="text-center py-6 rounded-lg border-2 border-dashed"
                    style={{ 
                      backgroundColor: 'var(--color-bg-secondary, #F9FAFB)',
                      borderColor: 'var(--color-text-muted, #9CA3AF)'
                    }}
                  >
                    <MousePointer 
                      className="w-8 h-8 mx-auto mb-2"
                      style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                    />
                    <p style={{ color: 'var(--color-text-secondary, #6B7280)' }}>
                      No events configured
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                    >
                      Click "Add Event" to configure JavaScript events
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.events.map((event) => (
                      <div 
                        key={event.id} 
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--color-bg-secondary, #F9FAFB)',
                          borderColor: 'var(--color-gray-light, #E5E7EB)'
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h6 
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-text-primary, #1F2937)' }}
                          >
                            Event #{event.id}
                          </h6>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEvent(event.id)}
                            style={{ color: 'var(--color-error, #EF4444)' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label 
                              className="block text-xs font-medium mb-1"
                              style={{ color: 'var(--color-text-primary, #1F2937)' }}
                            >
                              Event Type
                            </label>
                            <select
                              value={event.eventType}
                              onChange={(e) => updateEvent(event.id, 'eventType', e.target.value)}
                              className="w-full px-3 py-2 border rounded-md text-sm"
                              style={{
                                borderColor: 'var(--color-gray-light, #E5E7EB)',
                                backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
                                color: 'var(--color-text-primary, #1F2937)'
                              }}
                            >
                              {eventTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label 
                              className="block text-xs font-medium mb-1"
                              style={{ color: 'var(--color-text-primary, #1F2937)' }}
                            >
                              Function Name
                            </label>
                            <input
                              type="text"
                              value={event.functionName}
                              onChange={(e) => updateEvent(event.id, 'functionName', e.target.value)}
                              placeholder="e.g., openYouTubePopup, trackAnalytics"
                              className="w-full px-3 py-2 border rounded-md text-sm"
                              style={{
                                borderColor: 'var(--color-gray-light, #E5E7EB)',
                                backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
                                color: 'var(--color-text-primary, #1F2937)'
                              }}
                            />
                          </div>
                          
                          <div>
                            <label 
                              className="block text-xs font-medium mb-1"
                              style={{ color: 'var(--color-text-primary, #1F2937)' }}
                            >
                              Description
                            </label>
                            <input
                              type="text"
                              value={event.description}
                              onChange={(e) => updateEvent(event.id, 'description', e.target.value)}
                              placeholder="Brief description of what this does"
                              className="w-full px-3 py-2 border rounded-md text-sm"
                              style={{
                                borderColor: 'var(--color-gray-light, #E5E7EB)',
                                backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
                                color: 'var(--color-text-primary, #1F2937)'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div 
                className="mt-4 p-3 border rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-secondary, #F9FAFB)',
                  borderColor: 'var(--color-primary, #5243E9)'
                }}
              >
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-primary, #5243E9)' }}
                >
                  <strong>💡 How it works:</strong> 
                  <br />• Global functions are loaded once at the app root level
                  <br />• Event functions are called when the specified event occurs
                  <br />• Use <code 
                    className="px-1 rounded"
                    style={{ backgroundColor: 'var(--color-primary, #5243E9)', color: '#FFFFFF' }}
                  >this</code> to reference the button element
                  <br />• Use <code 
                    className="px-1 rounded"
                    style={{ backgroundColor: 'var(--color-primary, #5243E9)', color: '#FFFFFF' }}
                  >event</code> for event details
                </p>
              </div>
            </div>

            {/* Live Preview Section */}
            <div 
              className="p-6 rounded-lg border"
              style={{
                background: 'linear-gradient(to right, var(--color-bg-secondary, #F9FAFB), var(--color-bg-primary, #FFFFFF))',
                borderColor: 'var(--color-primary, #5243E9)'
              }}
            >
              <h4 
                className="text-lg font-semibold mb-3"
                style={{ color: 'var(--color-text-primary, #1F2937)' }}
              >
                Live Preview
              </h4>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  {/* Light background preview */}
                  <div 
                    className="flex-1 p-4 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
                      borderColor: 'var(--color-gray-light, #E5E7EB)'
                    }}
                  >
                    <p 
                      className="text-xs mb-2 text-center"
                      style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                    >
                      On Light Background
                    </p>
                    <div className="flex justify-center">
                      <Button
                        variant={formData.style as any}
                        size="md"
                        className="pointer-events-none"
                        disabled={formData.style === 'muted'}
                        leftIcon={formData.icon ? renderIcon(formData.icon, { className: 'w-4 h-4' }) : undefined}
                      >
                        {formData.text || 'Button Text'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Dark background preview */}
                  <div 
                    className="flex-1 p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--color-bg-dark, #1F2937)',
                      borderColor: 'var(--color-text-muted, #9CA3AF)'
                    }}
                  >
                    <p 
                      className="text-xs mb-2 text-center"
                      style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                    >
                      On Dark Background
                    </p>
                    <div className="flex justify-center">
                      <Button
                        variant={formData.style as any}
                        size="md"
                        className="pointer-events-none"
                        disabled={formData.style === 'muted'}
                        leftIcon={formData.icon ? renderIcon(formData.icon, { className: 'w-4 h-4' }) : undefined}
                      >
                        {formData.text || 'Button Text'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Preview details */}
                <div className="text-center space-y-1">
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--color-text-primary, #1F2937)' }}
                  >
                    <span className="font-medium">Text:</span> {formData.text || 'Button Text'} |{' '}
                    <span className="font-medium">Style:</span> {formData.style} |{' '}
                    <span className="font-medium">Target:</span> {formData.target === '_blank' ? 'New Tab' : 'Same Tab'}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                  >
                    <span className="font-medium">URL:</span> {formData.url || 'No URL set'} |{' '}
                    <span className="font-medium">Icon:</span> {formData.icon || 'None'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label 
                htmlFor="isActive" 
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-primary, #1F2937)' }}
              >
                Active (Available for use)
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                style={{
                  backgroundColor: 'var(--color-success, #10B981)',
                  color: '#FFFFFF'
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update CTA' : 'Create CTA'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}



      {/* All CTAs Section */}
      <Card className="p-6">
        <h3 
          className="text-xl font-semibold mb-4"
          style={{ color: 'var(--color-text-primary, #1F2937)' }}
        >
          All CTA Buttons
        </h3>
        
        {!Array.isArray(ctas) || ctas.length === 0 ? (
          <p 
            className="text-center py-8"
            style={{ color: 'var(--color-text-secondary, #6B7280)' }}
          >
            No CTA buttons created yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ctas.map((cta) => (
              <div
                key={cta.id}
                className="border-2 rounded-xl p-6 transition-all duration-200"
                style={{
                  borderColor: cta.isActive
                    ? 'var(--color-gray-light, #E5E7EB)'
                    : 'var(--color-text-muted, #9CA3AF)',
                  backgroundColor: cta.isActive
                    ? 'var(--color-bg-primary, #FFFFFF)'
                    : 'var(--color-bg-secondary, #F9FAFB)',
                  opacity: cta.isActive ? 1 : 0.6
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStyleColor(cta.style)}>
                      {cta.style}
                    </Badge>
                    {/* JavaScript Events Indicator */}
                    {cta.events && cta.events.length > 0 && (
                      <Badge 
                        className="text-xs"
                        style={{
                          backgroundColor: 'var(--color-secondary, #7C3AED)',
                          color: '#FFFFFF'
                        }}
                      >
                        <MousePointer className="w-3 h-3 mr-1" />
                        JS Events
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-1">

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(cta)}
                      className="p-1"
                      style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(cta.id)}
                      className="p-1"
                      style={{ color: 'var(--color-error, #EF4444)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {cta.icon && renderIcon(cta.icon, { 
                    className: 'w-4 h-4',
                    style: { color: 'var(--color-text-secondary, #6B7280)' }
                  } as any)}
                  <h4 className="font-semibold" style={{ color: 'var(--color-text-primary, #1F2937)' }}>{cta.text}</h4>
                </div>
                <p className="text-sm mb-3 break-all" style={{ color: 'var(--color-text-secondary, #6B7280)' }}>{cta.url}</p>
                
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>
                  <span>Target: {cta.target}</span>
                  <span style={{ 
                    color: cta.isActive ? 'var(--color-success-dark, #065F46)' : 'var(--color-error-dark, #991B1B)' 
                  }}>
                    {cta.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                

              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
} 

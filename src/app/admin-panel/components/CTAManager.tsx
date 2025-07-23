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
  onClickEvent?: string;
  onHoverEvent?: string;
  onMouseOutEvent?: string;
  onFocusEvent?: string;
  onBlurEvent?: string;
  onKeyDownEvent?: string;
  onKeyUpEvent?: string;
  onTouchStartEvent?: string;
  onTouchEndEvent?: string;
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
    // Enhanced JavaScript Events
    events: Array<{
        id: string;
        eventType: 'onClick' | 'onHover' | 'onMouseOut' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'onKeyUp' | 'onTouchStart' | 'onTouchEnd';
        functionName: string;
        description: string;
    }>;
    // Legacy fields for backward compatibility
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

export default function CTAManager() {
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
    events: [],
    onClickEvent: '',
    onHoverEvent: '',
    onMouseOutEvent: '',
    onFocusEvent: '',
    onBlurEvent: '',
    onKeyDownEvent: '',
    onKeyUpEvent: '',
    onTouchStartEvent: '',
    onTouchEndEvent: ''
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
      
      // Prepare the body with both legacy and new event systems
      const body = editingId ? { 
        ...formData, 
        id: editingId,
        // Convert new events to legacy format for backward compatibility
        onClickEvent: formData.events.find(e => e.eventType === 'onClick')?.functionName || formData.onClickEvent,
        onHoverEvent: formData.events.find(e => e.eventType === 'onHover')?.functionName || formData.onHoverEvent,
        onMouseOutEvent: formData.events.find(e => e.eventType === 'onMouseOut')?.functionName || formData.onMouseOutEvent,
        onFocusEvent: formData.events.find(e => e.eventType === 'onFocus')?.functionName || formData.onFocusEvent,
        onBlurEvent: formData.events.find(e => e.eventType === 'onBlur')?.functionName || formData.onBlurEvent,
        onKeyDownEvent: formData.events.find(e => e.eventType === 'onKeyDown')?.functionName || formData.onKeyDownEvent,
        onKeyUpEvent: formData.events.find(e => e.eventType === 'onKeyUp')?.functionName || formData.onKeyUpEvent,
        onTouchStartEvent: formData.events.find(e => e.eventType === 'onTouchStart')?.functionName || formData.onTouchStartEvent,
        onTouchEndEvent: formData.events.find(e => e.eventType === 'onTouchEnd')?.functionName || formData.onTouchEndEvent,
      } : {
        ...formData,
        // Convert new events to legacy format for backward compatibility
        onClickEvent: formData.events.find(e => e.eventType === 'onClick')?.functionName || formData.onClickEvent,
        onHoverEvent: formData.events.find(e => e.eventType === 'onHover')?.functionName || formData.onHoverEvent,
        onMouseOutEvent: formData.events.find(e => e.eventType === 'onMouseOut')?.functionName || formData.onMouseOutEvent,
        onFocusEvent: formData.events.find(e => e.eventType === 'onFocus')?.functionName || formData.onFocusEvent,
        onBlurEvent: formData.events.find(e => e.eventType === 'onBlur')?.functionName || formData.onBlurEvent,
        onKeyDownEvent: formData.events.find(e => e.eventType === 'onKeyDown')?.functionName || formData.onKeyDownEvent,
        onKeyUpEvent: formData.events.find(e => e.eventType === 'onKeyUp')?.functionName || formData.onKeyUpEvent,
        onTouchStartEvent: formData.events.find(e => e.eventType === 'onTouchStart')?.functionName || formData.onTouchStartEvent,
        onTouchEndEvent: formData.events.find(e => e.eventType === 'onTouchEnd')?.functionName || formData.onTouchEndEvent,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      
      if (response.ok) {
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
      events: [],
      onClickEvent: '',
      onHoverEvent: '',
      onMouseOutEvent: '',
      onFocusEvent: '',
      onBlurEvent: '',
      onKeyDownEvent: '',
      onKeyUpEvent: '',
      onTouchStartEvent: '',
      onTouchEndEvent: ''
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
      events: [], // Clear events when editing
      onClickEvent: cta.onClickEvent || '',
      onHoverEvent: cta.onHoverEvent || '',
      onMouseOutEvent: cta.onMouseOutEvent || '',
      onFocusEvent: cta.onFocusEvent || '',
      onBlurEvent: cta.onBlurEvent || '',
      onKeyDownEvent: cta.onKeyDownEvent || '',
      onKeyUpEvent: cta.onKeyUpEvent || '',
      onTouchStartEvent: cta.onTouchStartEvent || '',
      onTouchEndEvent: cta.onTouchEndEvent || ''
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">CTA Button Manager</h2>
          <p className="text-gray-600 mt-2">Manage call-to-action buttons for your website header</p>
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
              events: [],
              onClickEvent: '',
              onHoverEvent: '',
              onMouseOutEvent: '',
              onFocusEvent: '',
              onBlurEvent: '',
              onKeyDownEvent: '',
              onKeyUpEvent: '',
              onTouchStartEvent: '',
              onTouchEndEvent: ''
            });
            setShowForm(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create CTA Button
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingId ? 'Edit CTA Button' : 'Create New CTA Button'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <p className="text-xs text-gray-500 mt-1">
                  Enter a full URL, relative path, anchor link (e.g., #pricing, #contact), or empty anchor (#)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom ID (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.customId}
                  onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                  placeholder="e.g., cta-primary, signup-button, hero-cta"
                  className="h-12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Custom HTML ID for the button element (for CSS/JS targeting)
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Button Style
                </label>
                
                {/* Style Preview Grid */}
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">Click a style to select it:</p>
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
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          formData.style === styleOption.value
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
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
                            <p className="text-xs font-semibold text-gray-900">{styleOption.label}</p>
                            <p className="text-xs text-gray-600">{styleOption.description}</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Target
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => {
                    const value = e.target.value as '_self' | '_blank';
                    setFormData({ ...formData, target: value });
                  }}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="_self">Same Tab</option>
                  <option value="_blank">New Tab</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MousePointer className="w-5 h-5 mr-2 text-purple-600" />
                  JavaScript Events & Functions
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGlobalFunctions(!showGlobalFunctions)}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  {showGlobalFunctions ? 'Hide' : 'Show'} Global Functions
                </Button>
              </div>

              {/* Global Functions Section */}
              {showGlobalFunctions && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-md font-semibold text-purple-900">Global JavaScript Functions</h5>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveGlobalFunctions}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Save Functions
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-purple-700 mb-3">
                    These functions will be loaded globally and available to all CTAs. They're injected after the body tag opens.
                  </p>

                  {/* Function Templates */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-purple-700 mb-2">Quick Templates:</p>
                    <div className="flex flex-wrap gap-2">
                      {functionTemplates.map((template) => (
                        <Button
                          key={template.name}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => insertFunctionTemplate(template)}
                          className="text-xs border-purple-300 text-purple-700 hover:bg-purple-100"
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
                    className="w-full h-32 px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono bg-white"
                  />
                </div>
              )}

              {/* Event Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-md font-semibold text-gray-900">Event Configuration</h5>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addEvent}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Event
                  </Button>
                </div>

                {formData.events.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <MousePointer className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No events configured</p>
                    <p className="text-sm text-gray-500">Click "Add Event" to configure JavaScript events</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.events.map((event) => (
                      <div key={event.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-sm font-medium text-gray-900">Event #{event.id}</h6>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEvent(event.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Event Type
                            </label>
                            <select
                              value={event.eventType}
                              onChange={(e) => updateEvent(event.id, 'eventType', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {eventTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Function Name
                            </label>
                            <input
                              type="text"
                              value={event.functionName}
                              onChange={(e) => updateEvent(event.id, 'functionName', e.target.value)}
                              placeholder="e.g., openYouTubePopup, trackAnalytics"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={event.description}
                              onChange={(e) => updateEvent(event.id, 'description', e.target.value)}
                              placeholder="Brief description of what this does"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 How it works:</strong> 
                  <br />• Global functions are loaded once at the app root level
                  <br />• Event functions are called when the specified event occurs
                  <br />• Use <code className="bg-blue-100 px-1 rounded">this</code> to reference the button element
                  <br />• Use <code className="bg-blue-100 px-1 rounded">event</code> for event details
                </p>
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Live Preview</h4>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  {/* Light background preview */}
                  <div className="flex-1 p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 text-center">On Light Background</p>
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
                  <div className="flex-1 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-2 text-center">On Dark Background</p>
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
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Text:</span> {formData.text || 'Button Text'} |{' '}
                    <span className="font-medium">Style:</span> {formData.style} |{' '}
                    <span className="font-medium">Target:</span> {formData.target === '_blank' ? 'New Tab' : 'Same Tab'}
                  </p>
                  <p className="text-xs text-gray-600">
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
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (Available for use)
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
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

      {/* Header CTAs Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
          CTAs Currently in Header
        </h3>
        
        {!Array.isArray(headerCtas) || headerCtas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No CTA buttons in header yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {headerCtas.map((headerCta) => (
              <div
                key={headerCta.id}
                className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStyleColor(headerCta.cta.style)}>
                    {headerCta.cta.style}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleHeaderVisibility(headerCta.id, headerCta.isVisible)}
                      className="p-1"
                    >
                      {headerCta.isVisible ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromHeader(headerCta.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {headerCta.cta.icon && renderIcon(headerCta.cta.icon, { className: 'w-4 h-4 text-blue-600' })}
                  <h4 className="font-semibold text-gray-900">{headerCta.cta.text}</h4>
                </div>
                <p className="text-sm text-gray-600 truncate">{headerCta.cta.url}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Order: {headerCta.sortOrder} | {headerCta.isVisible ? 'Visible' : 'Hidden'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* All CTAs Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">All CTA Buttons</h3>
        
        {!Array.isArray(ctas) || ctas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No CTA buttons created yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ctas.map((cta) => (
              <div
                key={cta.id}
                className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                  cta.isActive
                    ? 'border-gray-200 bg-white hover:shadow-lg'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStyleColor(cta.style)}>
                      {cta.style}
                    </Badge>
                    {/* JavaScript Events Indicator */}
                    {(cta.onClickEvent || cta.onHoverEvent || cta.onMouseOutEvent || cta.onFocusEvent || 
                      cta.onBlurEvent || cta.onKeyDownEvent || cta.onKeyUpEvent || cta.onTouchStartEvent || 
                      cta.onTouchEndEvent) && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        <MousePointer className="w-3 h-3 mr-1" />
                        JS Events
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    {!isCtaInHeader(cta.id) && cta.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addToHeader(cta.id)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title="Add to Header"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(cta)}
                      className="p-1 text-gray-600 hover:text-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(cta.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {cta.icon && renderIcon(cta.icon, { className: 'w-4 h-4 text-gray-600' })}
                  <h4 className="font-semibold text-gray-900">{cta.text}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3 break-all">{cta.url}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Target: {cta.target}</span>
                  <span className={cta.isActive ? 'text-green-600' : 'text-red-600'}>
                    {cta.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {isCtaInHeader(cta.id) && (
                  <div className="mt-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full text-center">
                    In Header
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
} 

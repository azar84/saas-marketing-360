'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Save,
  X,
  Layout,
  Zap,
  Image,
  MessageSquare,
  DollarSign,
  HelpCircle,
  MousePointer,
  Settings,
  Copy,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Code
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

// Section type icons mapping
const sectionIcons = {
  home_hero: Layout,
  hero: Layout,
  features: Zap,
  media: Image,
  testimonials: MessageSquare,
  pricing: DollarSign,
  faq: HelpCircle,
  form: MessageSquare,
  cta: MousePointer,
  html: Code,
  custom: Settings
};

// Section type labels
const sectionLabels = {
  home_hero: 'Home Hero',
  hero: 'Hero Section',
  features: 'Features',
  media: 'Media',
  testimonials: 'Testimonials',
  pricing: 'Pricing',
  faq: 'FAQ',
  form: 'Form',
  cta: 'Call to Action',
  html: 'HTML Section',
  custom: 'Custom'
};

interface PageSection {
  id: number;
  pageId: number;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  page: {
    id: number;
    slug: string;
    title: string;
  };
  heroSectionId?: number;
  featureGroupId?: number;
  mediaSectionId?: number;
  pricingSectionId?: number;
  faqSectionId?: number;
  formId?: number;
  htmlSectionId?: number;
}

interface Page {
  id: number;
  slug: string;
  title: string;
}

interface SortableItemProps {
  id: number;
  section: PageSection;
  onEdit: (section: PageSection) => void;
  onDelete: (section: PageSection) => void;
  onToggleVisibility: (section: PageSection) => void;
  onDuplicate: (section: PageSection) => void;
}

// Sortable section item component
const SortableItem: React.FC<SortableItemProps> = ({
  id,
  section,
  onEdit,
  onDelete,
  onToggleVisibility,
  onDuplicate
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = sectionIcons[section.sectionType as keyof typeof sectionIcons] || Settings;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border-2 transition-all duration-200 ${
        isDragging 
          ? 'border-blue-400 shadow-lg scale-105 opacity-90' 
          : section.isVisible 
            ? 'border-gray-200 hover:border-gray-300' 
            : 'border-gray-100 bg-gray-50 opacity-60'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="w-5 h-5" />
            </div>

            {/* Section Icon & Info */}
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                section.isVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <IconComponent className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                                 <div className="flex items-center gap-2">
                   <h4 className="font-medium text-gray-900">
                     {section.title || 
                      (section as any).heroSection?.heading || 
                      (section as any).featureGroup?.heading ||
                      (section as any).pricingSection?.heading ||
                      (section as any).form?.title ||
                      (section as any).htmlSection?.name ||
                      sectionLabels[section.sectionType as keyof typeof sectionLabels]}
                   </h4>
                   <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                     {section.sectionType}
                   </span>
                 </div>
                 {(section.subtitle || (section as any).heroSection?.subheading || (section as any).featureGroup?.subheading || (section as any).pricingSection?.subheading || (section as any).form?.subheading || (section as any).htmlSection?.description) && (
                   <p className="text-sm text-gray-500 mt-1">
                     {section.subtitle || (section as any).heroSection?.subheading || (section as any).featureGroup?.subheading || (section as any).pricingSection?.subheading || (section as any).form?.subheading || (section as any).htmlSection?.description}
                   </p>
                 )}
                 {(section as any).featureGroup && (
                   <p className="text-xs text-blue-600 mt-1">
                     Linked to: {(section as any).featureGroup.name} ({(section as any).featureGroup._count?.groupItems || 0} features)
                   </p>
                 )}
                 {(section as any).heroSection && (
                   <p className="text-xs text-purple-600 mt-1">
                     Linked to: Hero Section "{(section as any).heroSection.name || (section as any).heroSection.headline || 'Untitled'}"
                   </p>
                 )}
                 {(section as any).pricingSection && (
                   <p className="text-xs text-green-600 mt-1">
                     Linked to: Pricing Section "{(section as any).pricingSection.name}" ({(section as any).pricingSection._count?.sectionPlans || 0} plans)
                   </p>
                 )}
                 {(section as any).form && (
                   <p className="text-xs text-orange-600 mt-1">
                     Linked to: Form "{(section as any).form.name}" ({(section as any).form._count?.fields || 0} fields, {(section as any).form._count?.submissions || 0} submissions)
                   </p>
                 )}
                 {(section as any).htmlSection && (
                   <p className="text-xs text-red-600 mt-1">
                     Linked to: HTML Section "{(section as any).htmlSection.name}"
                   </p>
                 )}
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>Order: {section.sortOrder}</span>
                  <span>•</span>
                  <span>ID: {section.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleVisibility(section)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title={section.isVisible ? 'Hide section' : 'Show section'}
            >
              {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDuplicate(section)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Duplicate section"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(section)}
              className="p-2 text-blue-600 hover:text-blue-700"
              title="Edit section"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(section)}
              className="p-2 text-red-600 hover:text-red-700"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PageBuilderProps {
  selectedPageId?: number;
}

interface FormData {
  sectionType: string;
  title: string;
  subtitle: string;
  content: string;
  isVisible: boolean;
  heroSectionId?: number;
  featureGroupId?: number;
  mediaSectionId?: number;
  pricingSectionId?: number;
  faqSectionId?: number;
  formId?: number;
  htmlSectionId?: number;
}

interface AvailableContent {
  heroSections: any[];
  featureGroups: any[];
  mediaSections: any[];
  pricingSections: any[];
  faqSections: any[];
  forms: any[];
  htmlSections: any[];
}

const PageBuilder: React.FC<PageBuilderProps> = ({ selectedPageId }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [currentPageId, setCurrentPageId] = useState<number | null>(selectedPageId || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    sectionType: '',
    title: '',
    subtitle: '',
    content: '',
    isVisible: true,
    heroSectionId: undefined,
    featureGroupId: undefined,
    mediaSectionId: undefined,
    pricingSectionId: undefined,
    faqSectionId: undefined,
    formId: undefined,
    htmlSectionId: undefined
  });

  // Available content for selection
  const [availableContent, setAvailableContent] = useState<AvailableContent>({
    heroSections: [],
    featureGroups: [],
    mediaSections: [],
    pricingSections: [],
    faqSections: [],
    forms: [],
    htmlSections: []
  });

  // Track which hero sections are in use by other pages
  const [heroSectionUsage, setHeroSectionUsage] = useState<{[key: number]: string[]}>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchPages();
    fetchAvailableContent();
  }, []);

  useEffect(() => {
    if (currentPageId) {
      fetchSections();
      fetchHeroSectionUsage(); // Refresh usage when page changes
    }
  }, [currentPageId]);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setPages(result.data);
          // If no page selected and pages exist, select the first one
          if (!currentPageId && result.data.length > 0) {
            setCurrentPageId(result.data[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setMessage({ type: 'error', text: 'Failed to load pages' });
    }
  };

  const fetchSections = async () => {
    if (!currentPageId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/page-sections?pageId=${currentPageId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSections(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setMessage({ type: 'error', text: 'Failed to load sections' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableContent = async () => {
    try {
      const response = await fetch('/api/admin/page-builder-content');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAvailableContent(result.data);
        }
      }
      
      // Also fetch hero section usage across all pages
      await fetchHeroSectionUsage();
    } catch (error) {
      console.error('Error fetching available content:', error);
      setMessage({ type: 'error', text: 'Failed to load available content' });
    }
  };

  const fetchHeroSectionUsage = async () => {
    try {
      const response = await fetch('/api/admin/page-sections');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const usage: {[key: number]: string[]} = {};
          result.data.forEach((section: any) => {
            if (section.heroSectionId && section.pageId !== currentPageId) {
              if (!usage[section.heroSectionId]) {
                usage[section.heroSectionId] = [];
              }
              usage[section.heroSectionId].push(section.page.title);
            }
          });
          setHeroSectionUsage(usage);
        }
      }
    } catch (error) {
      console.error('Error fetching hero section usage:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over?.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      // Update sort orders in the database
      try {
        const sectionIds = newSections.map(section => section.id);
        const response = await fetch('/api/admin/page-sections', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reorder',
            pageId: currentPageId,
            sectionIds
          })
        });

        if (!response.ok) {
          throw new Error('Failed to reorder sections');
        }

        setMessage({ type: 'success', text: 'Sections reordered successfully!' });
      } catch (error) {
        console.error('Error reordering sections:', error);
        setMessage({ type: 'error', text: 'Failed to reorder sections' });
        // Revert the change
        fetchSections();
      }
    }
  };

  const handleAddSection = async () => {
    if (!currentPageId) return;

    // Validate required fields based on section type
    if (formData.sectionType === 'hero' && !formData.heroSectionId) {
      setMessage({ type: 'error', text: 'Please select a hero section' });
      return;
    }
    
    if (formData.sectionType === 'features' && !formData.featureGroupId) {
      setMessage({ type: 'error', text: 'Please select a feature group' });
      return;
    }

    if (formData.sectionType === 'media' && !formData.mediaSectionId) {
      setMessage({ type: 'error', text: 'Please select a media section' });
      return;
    }

    if (formData.sectionType === 'pricing' && !formData.pricingSectionId) {
      setMessage({ type: 'error', text: 'Please select a pricing section' });
      return;
    }

    if (formData.sectionType === 'faq' && !formData.faqSectionId) {
      setMessage({ type: 'error', text: 'Please select a FAQ section' });
      return;
    }

    if (formData.sectionType === 'form' && !formData.formId) {
      setMessage({ type: 'error', text: 'Please select a form' });
      return;
    }

    if (formData.sectionType === 'html' && !formData.htmlSectionId) {
      setMessage({ type: 'error', text: 'Please select an HTML section' });
      return;
    }

    setSaving(true);
    try {
      const requestData = {
        pageId: currentPageId,
        ...formData
      };
      
      const response = await fetch('/api/admin/page-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Section added successfully!' });
        await fetchSections();
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to add section');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to add section' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSection = async () => {
    if (!editingSection) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/page-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSection.id,
          ...formData
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Section updated successfully!' });
        await fetchSections();
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to update section');
      }
    } catch (error) {
      console.error('Error updating section:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update section' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (section: PageSection) => {
    if (!confirm(`Are you sure you want to delete the "${section.title || sectionLabels[section.sectionType as keyof typeof sectionLabels]}" section?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/page-sections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: section.id })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Section deleted successfully!' });
        await fetchSections();
      } else {
        throw new Error(result.message || 'Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      setMessage({ type: 'error', text: 'Failed to delete section' });
    }
  };

  const handleToggleVisibility = async (section: PageSection) => {
    try {
      const response = await fetch('/api/admin/page-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: section.id,
          isVisible: !section.isVisible
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: `Section ${!section.isVisible ? 'shown' : 'hidden'} successfully!` });
        await fetchSections();
      } else {
        throw new Error(result.message || 'Failed to toggle section visibility');
      }
    } catch (error) {
      console.error('Error toggling section visibility:', error);
      setMessage({ type: 'error', text: 'Failed to toggle section visibility' });
    }
  };

  const handleDuplicateSection = async (section: PageSection) => {
    try {
      const response = await fetch('/api/admin/page-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: section.pageId,
          sectionType: section.sectionType,
          title: section.title ? `${section.title} (Copy)` : undefined,
          subtitle: section.subtitle,
          content: section.content,
          isVisible: section.isVisible
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Section duplicated successfully!' });
        await fetchSections();
      } else {
        throw new Error(result.message || 'Failed to duplicate section');
      }
    } catch (error) {
      console.error('Error duplicating section:', error);
      setMessage({ type: 'error', text: 'Failed to duplicate section' });
    }
  };

  const startEdit = (section: PageSection) => {
    setEditingSection(section);
    setFormData({
      sectionType: section.sectionType,
      title: section.title || '',
      subtitle: section.subtitle || '',
      content: section.content || '',
      isVisible: section.isVisible,
      heroSectionId: section.heroSectionId,
      featureGroupId: section.featureGroupId,
      mediaSectionId: section.mediaSectionId,
      pricingSectionId: section.pricingSectionId,
      faqSectionId: section.faqSectionId,
      formId: section.formId,
      htmlSectionId: section.htmlSectionId
    });
    setShowAddSection(true);
  };

  const resetForm = () => {
    setFormData({
      sectionType: 'home_hero',
      title: '',
      subtitle: '',
      content: '',
      isVisible: true,
      heroSectionId: undefined,
      featureGroupId: undefined,
      mediaSectionId: undefined,
      pricingSectionId: undefined,
      faqSectionId: undefined,
      formId: undefined,
      htmlSectionId: undefined
    });
    setEditingSection(null);
    setShowAddSection(false);
  };

  const duplicateHeroSection = async (originalHeroId: number) => {
    try {
      // First, fetch the original hero section
      const response = await fetch('/api/admin/hero-sections');
      if (!response.ok) throw new Error('Failed to fetch hero sections');
      
      const result = await response.json();
      if (!result.success) throw new Error('Failed to fetch hero sections');
      
      const originalHero = result.data.find((h: any) => h.id === originalHeroId);
      if (!originalHero) throw new Error('Original hero section not found');
      
      // Create a duplicate with modified name
      const currentPage = pages.find(p => p.id === currentPageId);
      const duplicateData = {
        ...originalHero,
        name: `${originalHero.name || originalHero.headline} (${currentPage?.title} Copy)`,
        headline: originalHero.headline,
        id: undefined // Remove ID so it creates a new record
      };
      
      const createResponse = await fetch('/api/admin/hero-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });
      
      if (!createResponse.ok) throw new Error('Failed to create duplicate hero section');
      
      const createResult = await createResponse.json();
      if (!createResult.success) throw new Error('Failed to create duplicate hero section');
      
      // Update form data to use the new hero section
      setFormData({ ...formData, heroSectionId: createResult.data.id });
      
      // Refresh available content
      await fetchAvailableContent();
      
      setMessage({ type: 'success', text: 'Hero section duplicated successfully!' });
      
      return createResult.data.id;
    } catch (error) {
      console.error('Error duplicating hero section:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to duplicate hero section' });
      return null;
    }
  };

  const currentPage = pages.find(page => page.id === currentPageId);

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Page Builder</h2>
          <p className="text-gray-600 mt-1">Design your pages with drag-and-drop sections</p>
        </div>
        <Button
          onClick={() => setShowAddSection(true)}
          disabled={!currentPageId}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Page Selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Page to Edit</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setCurrentPageId(page.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                currentPageId === page.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
              }`}
            >
              <h4 className="font-medium">{page.title}</h4>
              <p className="text-sm text-gray-500 mt-1">/{page.slug}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Sections */}
      {currentPageId && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Page Sections - {currentPage?.title}
            </h3>
            <div className="text-sm text-gray-500">
              {sections.length} section{sections.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-12">
              <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
              <p className="text-gray-500 mb-6">Start building your page by adding sections.</p>
              <Button
                onClick={() => setShowAddSection(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Section
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {sections.map((section) => (
                    <SortableItem
                      key={section.id}
                      id={section.id}
                      section={section}
                      onEdit={startEdit}
                      onDelete={handleDeleteSection}
                      onToggleVisibility={handleToggleVisibility}
                      onDuplicate={handleDuplicateSection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Add/Edit Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSection ? 'Edit Section' : 'Add New Section'}
                </h2>
                <Button
                  onClick={resetForm}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Section Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Section Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(sectionLabels).map(([type, label]) => {
                    const IconComponent = sectionIcons[type as keyof typeof sectionIcons];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, sectionType: type as any })}
                        className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                          formData.sectionType === type
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Home Hero Special Section */}
              {formData.sectionType === 'home_hero' && (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-900">Home Hero Section Selected</h4>
                        <p className="text-sm text-green-700 mt-1">
                          This is your special Home Hero section that's managed separately. 
                          It will automatically use your configured Home Hero content and styling.
                        </p>
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-start space-x-2">
                            <div className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0">💡</div>
                            <div className="text-sm text-blue-800">
                              <p className="font-medium">Want to customize this section?</p>
                              <p className="mt-1">Head over to the <strong>Home Page Hero</strong> menu in your admin panel to configure the content, styling, and layout of your hero section.</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-white rounded border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">Home Hero</div>
                              <div className="text-sm text-gray-600">Pre-configured hero section</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Auto-configured
                              </span>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Selection */}
              {formData.sectionType === 'hero' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Hero Section *
                    {formData.heroSectionId && (
                      <span className="ml-2 text-sm text-green-600">✓ Selected</span>
                    )}
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Hero sections can be shared across pages</p>
                        <p className="mt-1">If a hero section is already used on another page, you can either:</p>
                        <ul className="mt-1 ml-4 list-disc space-y-1">
                          <li>Use the same hero section (changes will affect both pages)</li>
                          <li>Create a copy specifically for this page using the "Create Copy" button</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {availableContent.heroSections.map((hero) => {
                      const isInUse = heroSectionUsage[hero.id]?.length > 0;
                      const usedInPages = heroSectionUsage[hero.id] || [];
                      
                      return (
                        <div key={hero.id} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, heroSectionId: hero.id })}
                            className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          formData.heroSectionId === hero.id
                            ? 'border-green-500 bg-green-50 text-green-900'
                                : isInUse
                                ? 'border-amber-300 bg-amber-50 text-amber-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                              <div className="font-medium">{hero.name || hero.heading || 'Untitled Hero'}</div>
                              <div className="flex items-center space-x-2">
                                {isInUse && (
                                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                                    In Use
                                  </span>
                                )}
                          {formData.heroSectionId === hero.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{hero.heading}</div>
                        {hero.subheading && (
                              <div className="text-xs text-gray-400 mt-1">{hero.subheading}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                              Height: {hero.sectionHeight || '100vh'} • Layout: {hero.layoutType}
                        </div>
                            {isInUse && (
                              <div className="text-xs text-amber-600 mt-2">
                                ⚠️ Currently used in: {usedInPages.join(', ')}
                              </div>
                            )}
                      </button>
                          
                          {isInUse && (
                            <button
                              type="button"
                              onClick={() => duplicateHeroSection(hero.id)}
                              className="w-full px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                              <Copy className="w-4 h-4" />
                              <span>Create Copy for This Page</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {availableContent.heroSections.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No hero sections available. Create one first in Hero Sections manager.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {formData.sectionType === 'features' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Feature Group *
                    {formData.featureGroupId && (
                      <span className="ml-2 text-sm text-green-600">✓ Selected</span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {availableContent.featureGroups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, featureGroupId: group.id })}
                        className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          formData.featureGroupId === group.id
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{group.name}</div>
                          {formData.featureGroupId === group.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{group.heading}</div>
                        {group.subheading && (
                          <div className="text-sm text-gray-500 mt-1">{group.subheading}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {group._count.groupItems} features
                        </div>
                      </button>
                    ))}
                    {availableContent.featureGroups.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No feature groups available. Create one first in Feature Groups manager.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {formData.sectionType === 'media' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Media Section *
                    {formData.mediaSectionId && (
                      <span className="ml-2 text-sm text-green-600">✓ Selected</span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {availableContent.mediaSections.map((media) => (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, mediaSectionId: media.id })}
                        className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          formData.mediaSectionId === media.id
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{media.headline}</div>
                          {formData.mediaSectionId === media.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        {media.subheading && (
                          <div className="text-sm text-gray-500 mt-1">{media.subheading}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1 flex items-center space-x-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                            {media.mediaType}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md font-medium">
                            {media.layoutType.replace('_', ' ')}
                          </span>
                          <span>{media._count.features} features</span>
                        </div>
                        {media.badgeText && (
                          <div className="text-xs text-gray-500 mt-1">
                            Badge: {media.badgeText}
                          </div>
                        )}
                      </button>
                    ))}
                    {availableContent.mediaSections.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No media sections available. Create one first in Media Sections manager.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {formData.sectionType === 'pricing' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Pricing Section *
                    {formData.pricingSectionId && (
                      <span className="ml-2 text-sm text-green-600">✓ Selected</span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {availableContent.pricingSections.map((pricing) => (
                      <button
                        key={pricing.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, pricingSectionId: pricing.id })}
                        className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          formData.pricingSectionId === pricing.id
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{pricing.name}</div>
                          {formData.pricingSectionId === pricing.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{pricing.heading}</div>
                        {pricing.subheading && (
                          <div className="text-sm text-gray-500 mt-1">{pricing.subheading}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1 flex items-center space-x-3">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md font-medium capitalize">
                            {pricing.layoutType}
                          </span>
                          <span>{pricing._count.sectionPlans} plans</span>
                        </div>
                      </button>
                    ))}
                    {availableContent.pricingSections.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No pricing sections available. Create one first in Pricing Sections manager.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {formData.sectionType === 'faq' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select FAQ Section *
                    {formData.faqSectionId && (
                      <span className="ml-2 text-sm text-green-600">✓ Selected</span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {availableContent.faqSections.map((faq) => (
                      <button
                        key={faq.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, faqSectionId: faq.id })}
                        className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          formData.faqSectionId === faq.id
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{faq.name}</div>
                          {formData.faqSectionId === faq.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{faq.heading}</div>
                        {faq.subheading && (
                          <div className="text-sm text-gray-500 mt-1">{faq.subheading}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1 flex items-center space-x-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                            {faq.showHero ? 'With Hero' : 'No Hero'}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md font-medium">
                            {faq.showCategories ? 'With Categories' : 'No Categories'}
                          </span>
                        </div>
                        {faq.heroTitle && (
                          <div className="text-xs text-gray-500 mt-1">
                            Hero: {faq.heroTitle}
                          </div>
                        )}
                      </button>
                    ))}
                    {availableContent.faqSections.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No FAQ sections available. Create one first in FAQ Sections manager.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {formData.sectionType === 'form' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Form *
                    {formData.formId && (
                      <span className="ml-2 text-sm text-green-600">✓ Selected</span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {availableContent.forms.map((form) => (
                      <button
                        key={form.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, formId: form.id })}
                        className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          formData.formId === form.id
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{form.name}</div>
                          {formData.formId === form.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{form.title}</div>
                        {form.subheading && (
                          <div className="text-sm text-gray-500 mt-1">{form.subheading}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1 flex items-center space-x-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                            {form._count.fields} fields
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-medium">
                            {form._count.submissions} submissions
                          </span>
                        </div>
                      </button>
                    ))}
                    {availableContent.forms.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No forms available. Create one first in Form Builder.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {formData.sectionType === 'html' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select HTML Section *
                    {formData.htmlSectionId && (
                      <span className="ml-2 text-sm text-green-600">✓ Selected</span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {availableContent.htmlSections.map((htmlSection) => (
                      <button
                        key={htmlSection.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, htmlSectionId: htmlSection.id })}
                        className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          formData.htmlSectionId === htmlSection.id
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{htmlSection.name}</div>
                          {formData.htmlSectionId === htmlSection.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        {htmlSection.description && (
                          <div className="text-sm text-gray-600 mt-1">{htmlSection.description}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1 flex items-center space-x-3">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md font-medium">
                            HTML Section
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                            {htmlSection._count.pageSections} page uses
                          </span>
                        </div>
                      </button>
                    ))}
                    {availableContent.htmlSections.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No HTML sections available. Create one first in HTML Sections manager.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title Override
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter section title (optional)"
                  className="w-full"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Subtitle
                </label>
                <Input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Enter section subtitle (optional)"
                  className="w-full"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Content (JSON)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter section configuration as JSON (optional)"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Advanced: JSON configuration for section-specific settings
                </p>
              </div>

              {/* Visibility */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">
                  Section is visible
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                {/* Validation Status */}
                {(formData.sectionType === 'hero' || formData.sectionType === 'features' || formData.sectionType === 'media' || formData.sectionType === 'pricing' || formData.sectionType === 'faq' || formData.sectionType === 'form' || formData.sectionType === 'html') && (
                  <div className="flex-1 text-sm">
                    {formData.sectionType === 'hero' && !formData.heroSectionId && (
                      <div className="text-amber-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Please select a hero section
                      </div>
                    )}
                    {formData.sectionType === 'features' && !formData.featureGroupId && (
                      <div className="text-amber-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Please select a feature group
                      </div>
                    )}
                    {formData.sectionType === 'media' && !formData.mediaSectionId && (
                      <div className="text-amber-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Please select a media section
                      </div>
                    )}
                    {formData.sectionType === 'pricing' && !formData.pricingSectionId && (
                      <div className="text-amber-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Please select a pricing section
                      </div>
                    )}
                    {formData.sectionType === 'faq' && !formData.faqSectionId && (
                      <div className="text-amber-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Please select a FAQ section
                      </div>
                    )}
                    {formData.sectionType === 'form' && !formData.formId && (
                      <div className="text-amber-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Please select a form
                      </div>
                    )}
                    {formData.sectionType === 'html' && !formData.htmlSectionId && (
                      <div className="text-amber-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Please select an HTML section
                      </div>
                    )}
                    {((formData.sectionType === 'hero' && formData.heroSectionId) || 
                      (formData.sectionType === 'features' && formData.featureGroupId) ||
                      (formData.sectionType === 'media' && formData.mediaSectionId) ||
                      (formData.sectionType === 'pricing' && formData.pricingSectionId) ||
                      (formData.sectionType === 'faq' && formData.faqSectionId) ||
                      (formData.sectionType === 'form' && formData.formId) ||
                      (formData.sectionType === 'html' && formData.htmlSectionId)) && (
                      <div className="text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Ready to save
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-4">
                  <Button
                    onClick={editingSection ? handleEditSection : handleAddSection}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : (editingSection ? 'Update Section' : 'Add Section')}
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBuilder;

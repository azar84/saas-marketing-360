'use client';

import React, { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import UniversalIconPicker from '@/components/ui/UniversalIconPicker';
import { renderIcon } from '@/lib/iconUtils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ChevronRight, 
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Menu as MenuIcon,
  ExternalLink,
  Home,
  Link,
  Settings,
  Users,
  Mail,
  FileText,
  Star,
  Search,
  Globe,
  ShoppingCart,
  Phone,
  GripVertical,
  ArrowRight,
  ArrowDown,
  Palette,
  CheckCircle
} from 'lucide-react';

// Drag and Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
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

import { motion } from 'framer-motion';

interface MenuItem {
  id: number;
  menuId: number;
  label: string;
  url?: string;
  icon?: string;
  target: '_self' | '_blank';
  isActive: boolean;
  sortOrder: number;
  parentId?: number;
  pageId?: number;
  page?: {
    id: number;
    slug: string;
    title: string;
  };
  parent?: {
    id: number;
    label: string;
  };
  children?: MenuItem[];
  menu?: {
    id: number;
    name: string;
  };
}

interface Menu {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  items: MenuItem[];
  _count?: {
    items: number;
    headerConfigs: number;
  };
}

interface Page {
  id: number;
  slug: string;
  title: string;
}

interface FlattenedItem extends MenuItem {
  depth: number;
  index: number;
}

const iconOptions = [
  { value: '', label: 'No Icon' },
  { value: 'Home', label: 'Home', icon: Home },
  { value: 'FileText', label: 'Page', icon: FileText },
  { value: 'Link', label: 'Link', icon: Link },
  { value: 'ExternalLink', label: 'External Link', icon: ExternalLink },
  { value: 'Settings', label: 'Settings', icon: Settings },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Mail', label: 'Contact', icon: Mail },
  { value: 'Star', label: 'Featured', icon: Star },
  { value: 'Search', label: 'Search', icon: Search },
  { value: 'Globe', label: 'Website', icon: Globe },
  { value: 'ShoppingCart', label: 'Shop', icon: ShoppingCart },
  { value: 'Phone', label: 'Phone', icon: Phone },
];

// Utility functions for hierarchical data
const flattenTree = (items: MenuItem[], parentId: number | null = null, depth = 0): FlattenedItem[] => {
  return items
    .filter(item => item.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .reduce<FlattenedItem[]>((acc, item, index) => {
      return [
        ...acc,
        { ...item, depth, index },
        ...flattenTree(items, item.id, depth + 1),
      ];
    }, []);
};

const buildTree = (flattenedItems: FlattenedItem[]): MenuItem[] => {
  const root: MenuItem[] = [];
  const lookup: { [key: number]: MenuItem } = {};

  // First pass: create all items
  flattenedItems.forEach(item => {
    lookup[item.id] = { ...item, children: [] };
  });

  // Second pass: build the tree
  flattenedItems.forEach(item => {
    if (item.parentId) {
      if (lookup[item.parentId]) {
        lookup[item.parentId].children!.push(lookup[item.id]);
      }
    } else {
      root.push(lookup[item.id]);
    }
  });

  return root;
};

const removeChildrenOf = (items: FlattenedItem[], ids: number[]): FlattenedItem[] => {
  const excludeParentIds = [...ids];

  return items.filter(item => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (ids.includes(item.id)) {
        return false;
      }
      excludeParentIds.push(item.id);
      return false;
    }
    return !ids.includes(item.id);
  });
};

const getDragDepth = (offset: number, indentationWidth: number) => {
  return Math.round(offset / indentationWidth);
};

const getMaxDepth = ({ previousItem }: { previousItem: FlattenedItem }) => {
  return previousItem ? previousItem.depth + 1 : 0;
};

const getMinDepth = ({ nextItem }: { nextItem: FlattenedItem }) => {
  return nextItem ? nextItem.depth : 0;
};

// Drop Indicator Component
interface DropIndicatorProps {
  depth: number;
  isVisible: boolean;
}

const DropIndicator: React.FC<DropIndicatorProps> = ({ depth, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="h-1 bg-blue-500 rounded-full opacity-80 transition-all duration-200 mb-1"
      style={{ 
        marginLeft: `${depth * 24 + 12}px`,
        width: `calc(100% - ${depth * 24 + 12}px)`
      }}
    >
      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse" />
    </div>
  );
};

// Sortable Item Component
interface SortableItemProps {
  item: FlattenedItem;
  isExpanded: boolean;
  onToggleExpanded: (id: number) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onIndent?: (item: MenuItem) => void;
  onOutdent?: (item: MenuItem) => void;
  onMoveUp?: (item: MenuItem) => void;
  onMoveDown?: (item: MenuItem) => void;
  getIconComponent: (iconName?: string) => React.ReactNode;
  clone?: boolean;
  ghost?: boolean;
  childCount?: number;
  depth?: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  handleProps?: any;
  indicator?: boolean;
  collapsed?: boolean;
  onCollapse?: () => void;
  onRemove?: () => void;
  style?: React.CSSProperties;
  value?: string;
  wrapperRef?: (node: HTMLElement) => void;
  dragOverlay?: boolean;
  projected?: {
    depth: number;
    parentId: number | null;
  };
  isOverItem?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  isExpanded,
  onToggleExpanded,
  onEdit,
  onDelete,
  onIndent,
  onOutdent,
  onMoveUp,
  onMoveDown,
  getIconComponent,
  clone,
  ghost,
  childCount = 0,
  depth = 0,
  disableInteraction,
  disableSelection,
  handleProps,
  indicator,
  style,
  value,
  wrapperRef,
  dragOverlay,
  projected,
  isOverItem,
  ...props
}) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id: item.id,
  });

  const sortableStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const effectiveDepth = projected?.depth ?? depth;
  const indentationWidth = 24;

  return (
    <div
      ref={setNodeRef}
      style={{ ...sortableStyle, ...style }}
      className={`
        ${clone ? 'opacity-50' : ''}
        ${ghost ? 'opacity-30' : ''}
        ${isDragging ? 'z-50' : ''}
        ${dragOverlay ? 'rotate-3 shadow-2xl' : ''}
      `}
      {...attributes}
    >
      <div
        className={`
          flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg mb-2 
          hover:shadow-sm transition-all duration-200 group
          ${isDragging ? 'shadow-lg ring-2 ring-blue-500 bg-blue-50' : ''}
          ${isOverItem ? 'ring-2 ring-blue-300 bg-blue-25' : ''}
          ${disableSelection ? 'select-none' : ''}
          ${clone ? 'shadow-xl' : ''}
          ${dragOverlay ? 'ring-2 ring-blue-400 shadow-2xl' : ''}
        `}
        style={{ paddingLeft: `${effectiveDepth * indentationWidth + 12}px` }}
      >
        {/* Drag Handle */}
        <button
          ref={setActivatorNodeRef}
          className={`
            flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 
            cursor-grab active:cursor-grabbing transition-colors duration-200
            ${isDragging ? 'text-blue-600' : ''}
            group-hover:text-gray-600
          `}
          {...listeners}
          {...handleProps}
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Hierarchy Indicator */}
        {effectiveDepth > 0 && (
          <div className="flex items-center">
            {Array.from({ length: effectiveDepth }).map((_, index) => (
              <div key={index} className="w-4 h-4 flex items-center justify-center">
                {index === effectiveDepth - 1 ? (
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                ) : (
                  <div className="w-px h-4 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Expand/Collapse Button */}
        {childCount > 0 && (
          <button
            onClick={() => onToggleExpanded(item.id)}
            className="flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Icon */}
        <div className="flex items-center justify-center w-5 h-5 text-blue-600">
          {getIconComponent(item.icon)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">{item.label}</div>
              <div className="text-sm text-gray-500 truncate">
                {item.url} {item.page && `(${item.page.title})`}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <span className={`px-2 py-1 text-xs rounded-full transition-colors duration-200 ${
                item.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
              
              {childCount > 0 && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {childCount} child{childCount !== 1 ? 'ren' : ''}
                </span>
              )}
              
              {/* Indent/Outdent Controls */}
              {!disableInteraction && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* Move Up Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp?.(item);
                    }}
                    className="hover:bg-blue-50 hover:text-blue-600"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  
                  {/* Move Down Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown?.(item);
                    }}
                    className="hover:bg-blue-50 hover:text-blue-600"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>

                  {/* Outdent Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOutdent?.(item);
                    }}
                    disabled={effectiveDepth === 0}
                    className={`${effectiveDepth === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-orange-50 hover:text-orange-600'}`}
                    title={effectiveDepth === 0 ? "Can't outdent root-level item" : "Move left (outdent)"}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {/* Indent Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onIndent?.(item);
                    }}
                    disabled={effectiveDepth >= 2}
                    className={`${effectiveDepth >= 2 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-green-50 hover:text-green-600'}`}
                    title={effectiveDepth >= 2 ? "Maximum nesting depth reached" : "Move right (indent)"}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                disabled={disableInteraction}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Edit item"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                disabled={disableInteraction}
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Projected depth indicator for drag overlay */}
      {projected && dragOverlay && (
        <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
          Level {projected.depth + 1}
        </div>
      )}
    </div>
  );
};

export default function MenuManager() {
  const [activeTab, setActiveTab] = useState<'menus' | 'header' | 'footer'>('menus');
  const [menus, setMenus] = useState<Menu[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Header configuration state
  const [headerConfig, setHeaderConfig] = useState<any>(null);
  const [ctas, setCtas] = useState<any[]>([]);
  const [headerFormData, setHeaderFormData] = useState({
    backgroundColor: '#ffffff',
    menuTextColor: '#374151',
    menuHoverColor: '#5243E9',
    menuActiveColor: '#5243E9',
    selectedMenuId: null as number | null,
    selectedCtas: [] as number[]
  });

  // Footer configuration state
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  const [footerSaving, setFooterSaving] = useState(false);
  const [footerSaveSuccess, setFooterSaveSuccess] = useState(false);
  const [headerSaving, setHeaderSaving] = useState(false);
  const [headerSaveSuccess, setHeaderSaveSuccess] = useState(false);

  // Design system hook
  const { designSystem } = useDesignSystem();

  // Drag and drop state
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [flattenedItems, setFlattenedItems] = useState<FlattenedItem[]>([]);

  const { get, post, put, delete: del } = useAdminApi();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Form state for menus
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });

  // Form state for menu items
  const [itemFormData, setItemFormData] = useState({
    menuId: 0,
    label: '',
    url: '',
    icon: '',
    target: '_self' as '_self' | '_blank',
    isActive: true,
    sortOrder: 0,
    parentId: undefined as number | undefined,
    pageId: undefined as number | undefined,
    linkType: 'page' as 'page' | 'custom' | 'external',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      setFlattenedItems(flattenTree(selectedMenu.items));
    }
  }, [selectedMenu]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menusResponse, pagesResponse, headerResponse, ctasResponse, siteSettingsResponse, formsResponse] = await Promise.all([
        get<{success: boolean, data: Menu[]}>('/api/admin/menus'),
        get<{success: boolean, data: Page[]}>('/api/admin/pages'),
        get('/api/admin/header-config'),
        get<{success: boolean, data: any[]}>('/api/admin/cta-buttons'),
        get('/api/admin/site-settings'),
        get('/api/admin/forms')
      ]);
      
      if (menusResponse.success) {
        setMenus(menusResponse.data);
      }
      
      if (pagesResponse.success) {
        setPages(pagesResponse.data);
      }

      // Handle header config
      if (headerResponse && Array.isArray(headerResponse) && headerResponse.length > 0) {
        const config = headerResponse[0];
        setHeaderConfig(config);
        setHeaderFormData({
          backgroundColor: config.backgroundColor || '#ffffff',
          menuTextColor: config.menuTextColor || '#374151',
          menuHoverColor: config.menuHoverColor || '#5243E9',
          menuActiveColor: config.menuActiveColor || '#5243E9',
          selectedMenuId: config.menus?.[0]?.menuId || null,
          selectedCtas: config.headerCTAs?.map((cta: any) => cta.ctaId) || []
        });
      }

      // Handle CTAs
      if (ctasResponse.success) {
        setCtas(ctasResponse.data);
      }

      // Handle site settings for footer
      if (siteSettingsResponse) {
        setSiteSettings(siteSettingsResponse);

        // Parse footer menu IDs if they exist
        if ((siteSettingsResponse as any).footerMenuIds) {
          try {
            const menuIds = JSON.parse((siteSettingsResponse as any).footerMenuIds);
            setSelectedMenuIds(menuIds);
          } catch (error) {
            console.error('Error parsing footer menu IDs:', error);
          }
        }
      }

      // Handle forms
      if (formsResponse) {
        // Forms API returns data directly, not wrapped in success object
        setForms(Array.isArray(formsResponse) ? formsResponse : []);
        console.log('Forms loaded:', Array.isArray(formsResponse) ? formsResponse.length : 0);
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetMenuForm = () => {
    setMenuFormData({
      name: '',
      description: '',
      isActive: true,
      sortOrder: 0,
    });
  };

  const resetItemForm = () => {
    setItemFormData({
      menuId: selectedMenu?.id || 0,
      label: '',
      url: '',
      icon: '',
      target: '_self',
      isActive: true,
      sortOrder: 0,
      parentId: undefined,
      pageId: undefined,
      linkType: 'page',
    });
  };

  const handleCreateMenu = () => {
    resetMenuForm();
    setIsCreatingMenu(true);
    setEditingMenu(null);
  };

  const handleEditMenu = (menu: Menu) => {
    setMenuFormData({
      name: menu.name,
      description: menu.description || '',
      isActive: menu.isActive,
      sortOrder: menu.sortOrder,
    });
    setEditingMenu(menu);
    setIsCreatingMenu(false);
  };

  const handleCreateItem = () => {
    if (!selectedMenu) return;
    resetItemForm();
    setIsCreatingItem(true);
    setEditingItem(null);
  };

  const handleEditItem = (item: MenuItem) => {
    setItemFormData({
      menuId: item.menuId,
      label: item.label,
      url: item.url || '',
      icon: item.icon || '',
      target: item.target,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      parentId: item.parentId,
      pageId: item.pageId,
      linkType: item.pageId ? 'page' : (item.url?.startsWith('http') ? 'external' : 'custom'),
    });
    setEditingItem(item);
    setIsCreatingItem(false);
  };

  const handleCancelMenu = () => {
    setIsCreatingMenu(false);
    setEditingMenu(null);
    resetMenuForm();
  };

  const handleCancelItem = () => {
    setIsCreatingItem(false);
    setEditingItem(null);
    resetItemForm();
  };

  const handleSaveMenu = async () => {
    try {
      if (editingMenu) {
        await put(`/api/admin/menus`, {
          id: editingMenu.id,
          ...menuFormData,
        });
      } else {
        await post('/api/admin/menus', menuFormData);
      }
      
      await fetchData();
      handleCancelMenu();
    } catch (err) {
      setError('Failed to save menu');
      console.error('Error saving menu:', err);
    }
  };

  const handleSaveItem = async () => {
    try {
      const itemData = {
        ...itemFormData,
        url: itemFormData.linkType === 'page' ? undefined : itemFormData.url,
        pageId: itemFormData.linkType === 'page' ? itemFormData.pageId : undefined,
      };

      if (editingItem) {
        await put(`/api/admin/menu-items`, {
          id: editingItem.id,
          ...itemData,
        });
      } else {
        await post('/api/admin/menu-items', itemData);
      }
      
      await fetchData();
      // Update selected menu to reflect changes
      if (selectedMenu) {
        const updatedMenus = await get<{success: boolean, data: Menu[]}>('/api/admin/menus');
        if (updatedMenus.success) {
          const updatedMenu = updatedMenus.data.find(m => m.id === selectedMenu.id);
          if (updatedMenu) {
            setSelectedMenu(updatedMenu);
          }
        }
      }
      handleCancelItem();
    } catch (err) {
      setError('Failed to save menu item');
      console.error('Error saving menu item:', err);
    }
  };

  const handleDeleteMenu = async (menu: Menu) => {
    if (!confirm(`Are you sure you want to delete the menu "${menu.name}"? This will also delete all its items.`)) {
      return;
    }

    try {
      await del(`/api/admin/menus?id=${menu.id}`);
      await fetchData();
      if (selectedMenu?.id === menu.id) {
        setSelectedMenu(null);
      }
    } catch (err) {
      setError('Failed to delete menu');
      console.error('Error deleting menu:', err);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.label}"?`)) {
      return;
    }

    try {
      await del(`/api/admin/menu-items?id=${item.id}`);
      await fetchData();
      // Update selected menu to reflect changes
      if (selectedMenu) {
        const updatedMenus = await get<{success: boolean, data: Menu[]}>('/api/admin/menus');
        if (updatedMenus.success) {
          const updatedMenu = updatedMenus.data.find(m => m.id === selectedMenu.id);
          if (updatedMenu) {
            setSelectedMenu(updatedMenu);
          }
        }
      }
    } catch (err) {
      setError('Failed to delete menu item');
      console.error('Error deleting menu item:', err);
    }
  };

  const toggleItemExpanded = (itemId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleIndentItem = async (item: MenuItem) => {
    if (!selectedMenu) {
      setError('No menu selected');
      return;
    }

    const currentIndex = flattenedItems.findIndex(i => i.id === item.id);
    if (currentIndex <= 0) {
      setError('Cannot indent first item or item not found');
      return;
    }

    const previousItem = flattenedItems[currentIndex - 1];
    
    // Don't allow indenting deeper than 3 levels for usability
    if (previousItem.depth >= 2) {
      setError('Maximum nesting depth reached (3 levels)');
      return;
    }

    const newParentId = previousItem.id;

    // Check if this would create a circular reference
    const wouldCreateCircle = (itemId: number, potentialParentId: number): boolean => {
      const checkItem = flattenedItems.find(i => i.id === potentialParentId);
      if (!checkItem) return false;
      if (checkItem.parentId === itemId) return true;
      if (checkItem.parentId) return wouldCreateCircle(itemId, checkItem.parentId);
      return false;
    };

    if (wouldCreateCircle(item.id, newParentId)) {
      setError('Cannot create circular menu structure');
      return;
    }

    try {
      console.log('Indenting item:', {
        id: item.id,
        currentParentId: item.parentId,
        newParentId: newParentId,
        linkType: item.pageId ? 'page' : 'custom'
      });

      const response = await put('/api/admin/menu-items', {
        id: item.id,
        menuId: item.menuId,
        label: item.label,
        url: item.url || '',
        icon: item.icon || '',
        target: item.target,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
        parentId: newParentId,
        pageId: item.pageId || null,
        linkType: item.pageId ? 'page' : 'custom',
      });

      console.log('Indent response:', response);

      // Refresh data
      await fetchData();
      
      // Update selected menu
      const updatedMenus = await get<{success: boolean, data: Menu[]}>('/api/admin/menus');
      if (updatedMenus.success) {
        const updatedMenu = updatedMenus.data.find(m => m.id === selectedMenu.id);
        if (updatedMenu) {
          setSelectedMenu(updatedMenu);
        }
      }

      // Clear any previous errors
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to indent menu item';
      setError(errorMessage);
      console.error('Error indenting menu item:', err);
    }
  };

  const handleOutdentItem = async (item: MenuItem) => {
    if (!selectedMenu) {
      setError('No menu selected');
      return;
    }
    
    if (!item.parentId) {
      setError('Cannot outdent root-level items');
      return;
    }

    const parent = flattenedItems.find(i => i.id === item.parentId);
    if (!parent) {
      setError('Parent item not found');
      return;
    }

    const newParentId = parent.parentId || null;

    try {
      console.log('Outdenting item:', {
        id: item.id,
        currentParentId: item.parentId,
        newParentId: newParentId,
        linkType: item.pageId ? 'page' : 'custom'
      });

      const response = await put('/api/admin/menu-items', {
        id: item.id,
        menuId: item.menuId,
        label: item.label,
        url: item.url || '',
        icon: item.icon || '',
        target: item.target,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
        parentId: newParentId,
        pageId: item.pageId || null,
        linkType: item.pageId ? 'page' : 'custom',
      });

      console.log('Outdent response:', response);

      // Refresh data
      await fetchData();
      
      // Update selected menu
      const updatedMenus = await get<{success: boolean, data: Menu[]}>('/api/admin/menus');
      if (updatedMenus.success) {
        const updatedMenu = updatedMenus.data.find(m => m.id === selectedMenu.id);
        if (updatedMenu) {
          setSelectedMenu(updatedMenu);
        }
      }

      // Clear any previous errors
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to outdent menu item';
      setError(errorMessage);
      console.error('Error outdenting menu item:', err);
    }
  };

  const handleMoveItemUp = async (item: MenuItem) => {
    if (!selectedMenu) return;

    try {
      const flatItems = flattenTree(selectedMenu.items);
      const currentIndex = flatItems.findIndex(i => i.id === item.id);
      
      if (currentIndex <= 0) return; // Can't move up if it's the first item
      
      const previousItem = flatItems[currentIndex - 1];
      
      // Swap sort orders
      await Promise.all([
        put('/api/admin/menu-items', {
          id: item.id,
          menuId: item.menuId,
          label: item.label,
          url: item.url || '',
          icon: item.icon || '',
          target: item.target,
          isActive: item.isActive,
          sortOrder: previousItem.sortOrder,
          parentId: item.parentId,
          pageId: item.pageId || null,
          linkType: item.pageId ? 'page' : 'custom',
        }),
        put('/api/admin/menu-items', {
          id: previousItem.id,
          menuId: previousItem.menuId,
          label: previousItem.label,
          url: previousItem.url || '',
          icon: previousItem.icon || '',
          target: previousItem.target,
          isActive: previousItem.isActive,
          sortOrder: item.sortOrder,
          parentId: previousItem.parentId,
          pageId: previousItem.pageId || null,
          linkType: previousItem.pageId ? 'page' : 'custom',
        })
      ]);

      // Refresh data
      await fetchData();
      
      // Update selected menu
      const updatedMenus = await get<{success: boolean, data: Menu[]}>('/api/admin/menus');
      if (updatedMenus.success) {
        const updatedMenu = updatedMenus.data.find(m => m.id === selectedMenu.id);
        if (updatedMenu) {
          setSelectedMenu(updatedMenu);
        }
      }

      setError(null);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to move menu item up';
      setError(errorMessage);
      console.error('Error moving menu item up:', err);
    }
  };

  const handleMoveItemDown = async (item: MenuItem) => {
    if (!selectedMenu) return;

    try {
      const flatItems = flattenTree(selectedMenu.items);
      const currentIndex = flatItems.findIndex(i => i.id === item.id);
      
      if (currentIndex >= flatItems.length - 1) return; // Can't move down if it's the last item
      
      const nextItem = flatItems[currentIndex + 1];
      
      // Swap sort orders
      await Promise.all([
        put('/api/admin/menu-items', {
          id: item.id,
          menuId: item.menuId,
          label: item.label,
          url: item.url || '',
          icon: item.icon || '',
          target: item.target,
          isActive: item.isActive,
          sortOrder: nextItem.sortOrder,
          parentId: item.parentId,
          pageId: item.pageId || null,
          linkType: item.pageId ? 'page' : 'custom',
        }),
        put('/api/admin/menu-items', {
          id: nextItem.id,
          menuId: nextItem.menuId,
          label: nextItem.label,
          url: nextItem.url || '',
          icon: nextItem.icon || '',
          target: nextItem.target,
          isActive: nextItem.isActive,
          sortOrder: item.sortOrder,
          parentId: nextItem.parentId,
          pageId: nextItem.pageId || null,
          linkType: nextItem.pageId ? 'page' : 'custom',
        })
      ]);

      // Refresh data
      await fetchData();
      
      // Update selected menu
      const updatedMenus = await get<{success: boolean, data: Menu[]}>('/api/admin/menus');
      if (updatedMenus.success) {
        const updatedMenu = updatedMenus.data.find(m => m.id === selectedMenu.id);
        if (updatedMenu) {
          setSelectedMenu(updatedMenu);
        }
      }

      setError(null);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to move menu item down';
      setError(errorMessage);
      console.error('Error moving menu item down:', err);
    }
  };

  const getIconComponent = (iconName?: string) => {
    if (iconName) {
      return renderIcon(iconName, { className: "w-5 h-5" });
    }
    return <MenuIcon className="w-5 h-5 text-gray-400" />;
  };

  const handleSaveHeaderConfig = async () => {
    try {
      setHeaderSaving(true);
      setHeaderSaveSuccess(false);
      setError(null);
      
      const payload = {
        backgroundColor: headerFormData.backgroundColor,
        menuTextColor: headerFormData.menuTextColor,
        menuHoverColor: headerFormData.menuHoverColor,
        menuActiveColor: headerFormData.menuActiveColor,
        menuId: headerFormData.selectedMenuId,
        ctaIds: headerFormData.selectedCtas
      };

      console.log('Saving header config with payload:', payload);

      let response: any;
      if (headerConfig?.id) {
        response = await put('/api/admin/header-config', {
          id: headerConfig.id,
          ...payload
        });
      } else {
        response = await post('/api/admin/header-config', payload);
      }

      console.log('Header config save response:', response);

      if (response?.success) {
        // Update local state immediately for preview
        setHeaderConfig(response.data);
        // Also refresh all data to ensure consistency
        await fetchData();
        setHeaderSaveSuccess(true);
        setError(null);
        console.log('Header configuration saved successfully');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setHeaderSaveSuccess(false);
        }, 3000);
      } else {
        const errorMsg = response?.message || 'Failed to save header configuration';
        setError(errorMsg);
        console.error('Failed to save header config:', errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Failed to save header configuration';
      setError(errorMsg);
      console.error('Error saving header config:', err);
    } finally {
      setHeaderSaving(false);
    }
  };

  const handleCtaToggle = (ctaId: number) => {
    setHeaderFormData(prev => ({
      ...prev,
      selectedCtas: prev.selectedCtas.includes(ctaId)
        ? prev.selectedCtas.filter(id => id !== ctaId)
        : [...prev.selectedCtas, ctaId]
    }));
  };

  const handleSaveFooterConfig = async () => {
    try {
      setFooterSaving(true);
      setFooterSaveSuccess(false);
      setError(null);

      const payload = {
        footerMenuIds: JSON.stringify(selectedMenuIds),
        footerNewsletterFormId: siteSettings?.footerNewsletterFormId,
        footerShowContactInfo: siteSettings?.footerShowContactInfo,
        footerShowSocialLinks: siteSettings?.footerShowSocialLinks,
        footerBackgroundColor: siteSettings?.footerBackgroundColor,
        footerTextColor: siteSettings?.footerTextColor
      };

      console.log('Saving footer config with payload:', payload);

      const response = await put<{ success: boolean; data: any; message: string }>('/api/admin/site-settings', payload);

      if (response && response.success) {
        setSiteSettings(response.data);
        setFooterSaveSuccess(true);
        setError(null);
        console.log('Footer configuration saved successfully:', response);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setFooterSaveSuccess(false);
        }, 3000);
      } else {
        setError('Failed to save footer configuration');
      }
    } catch (err) {
      setError('Failed to save footer configuration');
      console.error('Error saving footer config:', err);
    } finally {
      setFooterSaving(false);
    }
  };

  const handleFooterMenuToggle = (menuId: number) => {
    setSelectedMenuIds(prev => 
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Drag and drop handlers
  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as number);
    setOverId(active.id as number);

    const activeItem = flattenedItems.find(item => item.id === active.id);
    if (activeItem) {
      setFlattenedItems(prevItems => removeChildrenOf(prevItems, [activeItem.id]));
    }
  };

  const handleDragMove = ({ delta }: any) => {
    // Simplified - we don't need complex offset tracking for simple reordering
    setOffsetLeft(0);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverId(over?.id as number);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    resetState();

    if (!over || !selectedMenu) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    if (activeId === overId) return;

    const activeIndex = flattenedItems.findIndex(item => item.id === activeId);
    const overIndex = flattenedItems.findIndex(item => item.id === overId);

    if (activeIndex === -1 || overIndex === -1) return;

    // Simple reordering - just move the item to the new position
    // Keep the same parent and depth, only change sort order
    const newItems = arrayMove(flattenedItems, activeIndex, overIndex);
    
    try {
      // Update only the sort orders, keeping existing parent relationships
      const updatePromises = newItems.map((item, index) => 
        put('/api/admin/menu-items', {
          id: item.id,
          menuId: item.menuId,
          label: item.label,
          url: item.url || '',
          icon: item.icon || '',
          target: item.target,
          isActive: item.isActive,
          sortOrder: index,
          parentId: item.parentId, // Keep existing parent
          pageId: item.pageId || null,
          linkType: item.pageId ? 'page' : 'custom',
        })
      );

      await Promise.all(updatePromises);
      
      // Refresh data
      await fetchData();
      
      // Update selected menu
      const updatedMenus = await get<{success: boolean, data: Menu[]}>('/api/admin/menus');
      if (updatedMenus.success) {
        const updatedMenu = updatedMenus.data.find(m => m.id === selectedMenu.id);
        if (updatedMenu) {
          setSelectedMenu(updatedMenu);
        }
      }

      setError(null);
      console.log('Menu items reordered successfully');
    } catch (err) {
      setError('Failed to reorder menu items');
      console.error('Error reordering menu items:', err);
    }
  };

  const handleDragCancel = () => {
    resetState();
  };

  const resetState = () => {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    
    if (selectedMenu) {
      setFlattenedItems(flattenTree(selectedMenu.items));
    }
  };

  const getProjection = (
    items: FlattenedItem[],
    activeIndex: number,
    overIndex: number,
    dragOffset: number,
    indentationWidth: number
  ) => {
    const overItem = items[overIndex];
    const isGoingDown = activeIndex < overIndex;
    const modifier = isGoingDown ? 1 : -1;
    const newIndex = overIndex + modifier;

    const item = items[newIndex];

    if (item) {
      const maxDepth = getMaxDepth({
        previousItem: item,
      });
      const minDepth = getMinDepth({ nextItem: item });
      let depth = Math.round(dragOffset / indentationWidth);

      depth = Math.max(depth, minDepth);
      depth = Math.min(depth, maxDepth);

      const getParentId = () => {
        if (depth === 0 || !item) {
          return null;
        }

        const parentItem = items
          .slice(0, newIndex)
          .reverse()
          .find((item) => item.depth === depth - 1);

        return parentItem?.id ?? null;
      };

      return {
        depth,
        maxDepth,
        minDepth,
        parentId: getParentId(),
      };
    }

    return {
      depth: 0,
      maxDepth: 0,
      minDepth: 0,
      parentId: null,
    };
  };

  const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  const renderMenuForm = () => (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {editingMenu ? 'Edit Menu' : 'Create Menu'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Menu Name
          </label>
          <Input
            value={menuFormData.name}
            onChange={(e) => setMenuFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Main Navigation, Footer Links"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <Input
            value={menuFormData.description}
            onChange={(e) => setMenuFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of this menu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <Input
            type="number"
            value={menuFormData.sortOrder}
            onChange={(e) => setMenuFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={menuFormData.isActive}
            onChange={(e) => setMenuFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 appearance-none bg-white border-2 checked:bg-blue-600 checked:border-blue-600 relative checked:after:content-['✓'] checked:after:text-white checked:after:text-xs checked:after:absolute checked:after:top-0 checked:after:left-0.5"
          />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={handleCancelMenu}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSaveMenu}>
          <Save className="w-4 h-4 mr-2" />
          {editingMenu ? 'Update' : 'Create'}
        </Button>
      </div>
    </Card>
  );

  // Get design system colors for color picker
  const getDesignSystemColors = () => {
    if (!designSystem) return [];
    
    return [
      { name: 'Primary', value: designSystem.primaryColor, description: 'Main brand color' },
      { name: 'Primary Light', value: designSystem.primaryColorLight, description: 'Light primary variant' },
      { name: 'Primary Dark', value: designSystem.primaryColorDark, description: 'Dark primary variant' },
      { name: 'Secondary', value: designSystem.secondaryColor, description: 'Secondary brand color' },
      { name: 'Accent', value: designSystem.accentColor, description: 'Accent color' },
      { name: 'Success', value: designSystem.successColor, description: 'Success state color' },
      { name: 'Warning', value: designSystem.warningColor, description: 'Warning state color' },
      { name: 'Error', value: designSystem.errorColor, description: 'Error state color' },
      { name: 'Info', value: designSystem.infoColor, description: 'Info state color' },
      { name: 'Background Primary', value: designSystem.backgroundPrimary, description: 'Primary background' },
      { name: 'Background Secondary', value: designSystem.backgroundSecondary, description: 'Secondary background' },
      { name: 'Background Dark', value: designSystem.backgroundDark, description: 'Dark background' },
      { name: 'Gray Light', value: designSystem.grayLight, description: 'Light gray' },
      { name: 'Gray Medium', value: designSystem.grayMedium, description: 'Medium gray' },
      { name: 'Gray Dark', value: designSystem.grayDark, description: 'Dark gray' }
    ];
  };

  const renderHeaderConfigTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <Palette className="w-6 h-6 mr-3 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Header Configuration</h3>
        </div>
        
        <div className="space-y-6">
          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Background Color
            </label>
            
            {/* Theme Color Options */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Choose from your design system:</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {getDesignSystemColors().map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setHeaderFormData(prev => ({ 
                      ...prev, 
                      backgroundColor: color.value 
                    }))}
                    className={`group relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      headerFormData.backgroundColor === color.value 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={color.name}
                  >
                    <div 
                      className="w-full h-8 rounded-md mb-2 shadow-sm border"
                      style={{ backgroundColor: color.value }}
                    />
                    <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                      {color.name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {color.value}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">Or enter a custom color:</p>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={headerFormData.backgroundColor}
                  onChange={(e) => setHeaderFormData(prev => ({ 
                    ...prev, 
                    backgroundColor: e.target.value 
                  }))}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
                />
                <Input
                  value={headerFormData.backgroundColor}
                  onChange={(e) => setHeaderFormData(prev => ({ 
                    ...prev, 
                    backgroundColor: e.target.value 
                  }))}
                  placeholder="#ffffff"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Menu Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <MenuIcon className="w-4 h-4 inline mr-2" />
              Navigation Menu
            </label>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Select which menu to display in the header navigation
              </p>
              <select
                value={headerFormData.selectedMenuId || ''}
                onChange={(e) => setHeaderFormData(prev => ({ 
                  ...prev, 
                  selectedMenuId: e.target.value ? parseInt(e.target.value) : null 
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              >
                <option value="">No Menu Selected</option>
                {menus.filter(menu => menu.isActive).map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name} ({menu._count?.items || 0} items)
                  </option>
                ))}
              </select>
              {menus.filter(menu => menu.isActive).length === 0 && (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <MenuIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No active menus found.</p>
                  <p className="text-xs mt-1">Create a menu in the "Menu Management" tab first.</p>
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Settings className="w-4 h-4 inline mr-2" />
              CTA Buttons ({headerFormData.selectedCtas.length} selected)
            </label>
            
            {ctas.filter(cta => cta.isActive).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ctas.filter(cta => cta.isActive).map(cta => {
                  const isSelected = headerFormData.selectedCtas.includes(cta.id);
                  
                  return (
                    <div
                      key={cta.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleCtaToggle(cta.id)}
                    >
                      {/* Enhanced Checkbox */}
                      <div className="absolute top-3 right-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'bg-white border-gray-400 hover:border-gray-500'
                        }`}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      
                      {/* CTA Preview */}
                      <div className="pr-8">
                        <div className="mb-3">
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md ${
                              cta.style === 'primary' 
                                ? 'bg-blue-600 text-white' :
                              cta.style === 'secondary' 
                                ? 'bg-gray-100 text-gray-900 border border-gray-300' :
                              cta.style === 'outline' 
                                ? 'border border-blue-600 text-blue-600 bg-white' :
                              cta.style === 'ghost'
                                ? 'text-gray-700 bg-gray-50' :
                                'text-gray-700 bg-gray-100'
                            }`}
                          >
                            {cta.icon && (
                              <div className="w-4 h-4">
                                {getIconComponent(cta.icon)}
                              </div>
                            )}
                            <span>{cta.text}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">{cta.text}</div>
                          <div className="text-xs text-gray-500 font-mono">{cta.url}</div>
                          <div className="text-xs text-gray-400">{cta.style} style</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">No CTA buttons available</p>
                <p className="text-xs text-gray-500">Create CTA buttons in the CTA Management section first.</p>
              </div>
            )}
          </div>

          {/* Menu Item Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <MenuIcon className="w-4 h-4 inline mr-2" />
              Menu Item Colors
            </label>
            
            {/* Menu Text Color */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Menu item text color:</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                {getDesignSystemColors().map((color) => (
                  <button
                    key={`text-${color.name}`}
                    onClick={() => setHeaderFormData(prev => ({ 
                      ...prev, 
                      menuTextColor: color.value 
                    }))}
                    className={`group relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      headerFormData.menuTextColor === color.value 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}

                  >
                    <div 
                      className="w-full h-8 rounded-md mb-2 shadow-sm border flex items-center justify-center"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <span className="text-sm font-medium" style={{ color: color.value }}>
                        Aa
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                      {color.name}
                    </p>
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={headerFormData.menuTextColor}
                  onChange={(e) => setHeaderFormData(prev => ({ 
                    ...prev, 
                    menuTextColor: e.target.value 
                  }))}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
                />
                <Input
                  value={headerFormData.menuTextColor}
                  onChange={(e) => setHeaderFormData(prev => ({ 
                    ...prev, 
                    menuTextColor: e.target.value 
                  }))}
                  placeholder="#374151"
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            {/* Menu Hover Color */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Menu item hover color:</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                {getDesignSystemColors().map((color) => (
                  <button
                    key={`hover-${color.name}`}
                    onClick={() => setHeaderFormData(prev => ({ 
                      ...prev, 
                      menuHoverColor: color.value 
                    }))}
                    className={`group relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      headerFormData.menuHoverColor === color.value 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={`${color.name} - Hover`}
                  >
                    <div 
                      className="w-full h-8 rounded-md mb-2 shadow-sm border flex items-center justify-center"
                      style={{ backgroundColor: color.value }}
                    >
                      <span className="text-sm font-medium text-white">
                        Hover
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                      {color.name}
                    </p>
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={headerFormData.menuHoverColor}
                  onChange={(e) => setHeaderFormData(prev => ({ 
                    ...prev, 
                    menuHoverColor: e.target.value 
                  }))}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
                />
                <Input
                  value={headerFormData.menuHoverColor}
                  onChange={(e) => setHeaderFormData(prev => ({ 
                    ...prev, 
                    menuHoverColor: e.target.value 
                  }))}
                  placeholder="#5243E9"
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            {/* Menu Active Color */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Menu item active/clicked color:</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                {getDesignSystemColors().map((color) => (
                  <button
                    key={`active-${color.name}`}
                    onClick={() => setHeaderFormData(prev => ({ 
                      ...prev, 
                      menuActiveColor: color.value 
                    }))}
                    className={`group relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      headerFormData.menuActiveColor === color.value 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={`${color.name} - Active`}
                  >
                    <div 
                      className="w-full h-8 rounded-md mb-2 shadow-sm border flex items-center justify-center"
                      style={{ backgroundColor: color.value }}
                    >
                      <span className="text-sm font-medium text-white">
                        Active
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                      {color.name}
                    </p>
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={headerFormData.menuActiveColor}
                  onChange={(e) => setHeaderFormData(prev => ({ 
                    ...prev, 
                    menuActiveColor: e.target.value 
                  }))}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
                />
                <Input
                  value={headerFormData.menuActiveColor}
                  onChange={(e) => setHeaderFormData(prev => ({ 
                    ...prev, 
                    menuActiveColor: e.target.value 
                  }))}
                  placeholder="#5243E9"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-end mt-8 pt-6 border-t space-y-3">
          <Button 
            onClick={handleSaveHeaderConfig}
            disabled={headerSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {headerSaving ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Header Configuration
              </>
            )}
          </Button>
          
          {headerSaveSuccess && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Header configuration saved successfully!</span>
            </div>
          )}
        </div>
      </Card>

      {/* Preview */}
      {headerConfig && (
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <div className="w-6 h-6 bg-blue-600 rounded" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Live Preview</h3>
          </div>
          
          {/* Header Preview */}
          <div className="mb-6">
            <div 
              className="rounded-lg p-4 border-2 border-dashed border-gray-300 transition-all duration-300"
              style={{ backgroundColor: headerFormData.backgroundColor }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="font-bold text-lg">Saski AI</span>
                </div>
                
                {/* Navigation Preview */}
                {headerFormData.selectedMenuId && (
                  <div className="hidden md:flex items-center space-x-6">
                    {menus.find(m => m.id === headerFormData.selectedMenuId)?.items?.slice(0, 4).map((item: any, index: number) => (
                      <span 
                        key={index} 
                        className="text-sm cursor-pointer transition-colors duration-200"
                        style={{ 
                          color: headerFormData.menuTextColor
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLSpanElement).style.color = headerFormData.menuHoverColor;
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLSpanElement).style.color = headerFormData.menuTextColor;
                        }}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* CTA Preview */}
                {headerFormData.selectedCtas.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {headerFormData.selectedCtas.slice(0, 2).map((ctaId: number) => {
                      const cta = ctas.find(c => c.id === ctaId);
                      if (!cta) return null;
                      return (
                        <button
                          key={ctaId}
                          className={`px-4 py-2 text-sm rounded-lg font-medium ${
                            cta.style === 'primary' ? 'bg-blue-600 text-white' :
                            cta.style === 'secondary' ? 'bg-purple-600 text-white' :
                            cta.style === 'outline' ? 'border border-gray-300 text-gray-700 bg-white' :
                            'text-gray-600'
                          }`}
                        >
                          {cta.text}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Background Color */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center mb-3">
                <Palette className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-700">Background</span>
              </div>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 border-2 border-gray-300 rounded-lg shadow-sm"
                  style={{ backgroundColor: headerFormData.backgroundColor }}
                />
                <span className="text-sm font-mono text-gray-600">
                  {headerFormData.backgroundColor}
                </span>
              </div>
            </div>

            {/* Menu Colors */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center mb-3">
                <MenuIcon className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-700">Menu Colors</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <span className="text-xs font-bold" style={{ color: headerFormData.menuTextColor }}>
                      A
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">Text</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 border border-gray-300 rounded"
                    style={{ backgroundColor: headerFormData.menuHoverColor }}
                  />
                  <span className="text-xs text-gray-600">Hover</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 border border-gray-300 rounded"
                    style={{ backgroundColor: headerFormData.menuActiveColor }}
                  />
                  <span className="text-xs text-gray-600">Active</span>
                </div>
              </div>
            </div>
            
            {/* Active Menu */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center mb-3">
                <MenuIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-700">Navigation</span>
              </div>
              {headerFormData.selectedMenuId ? (
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {menus.find(m => m.id === headerFormData.selectedMenuId)?.name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {menus.find(m => m.id === headerFormData.selectedMenuId)?._count?.items || 0} items
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No menu selected</div>
              )}
            </div>
            
            {/* Active CTAs */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center mb-3">
                <Settings className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-700">CTA Buttons</span>
              </div>
              {headerFormData.selectedCtas.length > 0 ? (
                <div className="space-y-2">
                  {headerFormData.selectedCtas.slice(0, 3).map((ctaId: number) => {
                    const cta = ctas.find(c => c.id === ctaId);
                    if (!cta) return null;
                    return (
                      <div key={ctaId} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{cta.text}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          cta.style === 'primary' ? 'bg-blue-100 text-blue-800' :
                          cta.style === 'secondary' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cta.style}
                        </span>
                      </div>
                    );
                  })}
                  {headerFormData.selectedCtas.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{headerFormData.selectedCtas.length - 3} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No CTAs selected</div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderItemForm = () => (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
        {selectedMenu && <span className="text-gray-500"> to "{selectedMenu.name}"</span>}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label (Display Text)
          </label>
          <Input
            value={itemFormData.label}
            onChange={(e) => setItemFormData(prev => ({ ...prev, label: e.target.value }))}
            placeholder="Text shown in navigation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link Type
          </label>
          <select
            value={itemFormData.linkType}
            onChange={(e) => setItemFormData(prev => ({ 
              ...prev, 
              linkType: e.target.value as 'page' | 'custom' | 'external',
              pageId: e.target.value === 'page' ? prev.pageId : undefined,
              url: e.target.value === 'page' ? '' : prev.url
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="page">Link to Page</option>
            <option value="custom">Custom URL</option>
            <option value="external">External URL</option>
          </select>
        </div>

        {itemFormData.linkType === 'page' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Page
            </label>
            <select
              value={itemFormData.pageId || ''}
              onChange={(e) => setItemFormData(prev => ({ 
                ...prev, 
                pageId: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a page</option>
              {pages.map(page => (
                <option key={page.id} value={page.id}>
                  {page.title} ({page.slug})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <Input
              value={itemFormData.url}
              onChange={(e) => setItemFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder={itemFormData.linkType === 'external' ? 'https://example.com' : '/custom-path'}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icon
          </label>
          <UniversalIconPicker
            value={itemFormData.icon || ''}
            onChange={(iconName, iconComponent, library) => setItemFormData(prev => ({ ...prev, icon: iconName }))}
            placeholder="Select an icon for this menu item"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target
          </label>
          <select
            value={itemFormData.target}
            onChange={(e) => setItemFormData(prev => ({ ...prev, target: e.target.value as '_self' | '_blank' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="_self">Same Window</option>
            <option value="_blank">New Window</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent Item (Optional)
          </label>
          <select
            value={itemFormData.parentId || ''}
            onChange={(e) => setItemFormData(prev => ({ 
              ...prev, 
              parentId: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Parent (Top Level)</option>
            {selectedMenu?.items.filter(item => !item.parentId && item.id !== editingItem?.id).map(item => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <Input
            type="number"
            value={itemFormData.sortOrder}
            onChange={(e) => setItemFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={itemFormData.isActive}
            onChange={(e) => setItemFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 appearance-none bg-white border-2 checked:bg-blue-600 checked:border-blue-600 relative checked:after:content-['✓'] checked:after:text-white checked:after:text-xs checked:after:absolute checked:after:top-0 checked:after:left-0.5"
          />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={handleCancelItem}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSaveItem}>
          <Save className="w-4 h-4 mr-2" />
          {editingItem ? 'Update' : 'Add'}
        </Button>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading menus...</div>
      </div>
    );
  }

  const activeItem = activeId ? flattenedItems.find(item => item.id === activeId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu & Header Management</h2>
          <p className="text-gray-600">Create menus, organize navigation items, and configure header settings</p>
        </div>
        {activeTab === 'menus' && (
          <Button onClick={handleCreateMenu}>
            <Plus className="w-4 h-4 mr-2" />
            Create Menu
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('menus')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'menus'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MenuIcon className="w-4 h-4 inline mr-2" />
            Menu Management
          </button>
          <button
            onClick={() => setActiveTab('header')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'header'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Header Configuration
          </button>
          <button
            onClick={() => setActiveTab('footer')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'footer'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Footer Configuration
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <X className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'menus' && (
        <>
          {(isCreatingMenu || editingMenu) && renderMenuForm()}
          {(isCreatingItem || editingItem) && renderItemForm()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menus List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Menus</h3>
          <div className="space-y-2">
            {menus.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MenuIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No menus found. Create your first menu to get started.</p>
              </div>
            ) : (
              menus.map(menu => (
                <div 
                  key={menu.id} 
                  className={`
                    border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 group
                    ${selectedMenu?.id === menu.id 
                      ? 'bg-blue-50 border-blue-300 shadow-sm' 
                      : 'bg-white hover:bg-gray-50 hover:shadow-sm'
                    }
                  `}
                  onClick={() => setSelectedMenu(menu)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{menu.name}</div>
                      {menu.description && (
                        <div className="text-sm text-gray-500 mt-1">{menu.description}</div>
                      )}
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="text-xs text-gray-400">
                          {menu._count?.items || 0} items
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          menu.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {menu.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMenu(menu);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Edit menu"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMenu(menu);
                        }}
                        className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Delete menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menu Items with Drag & Drop */}
        <div className="lg:col-span-2">
          {selectedMenu ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    Menu Items for "{selectedMenu.name}"
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <GripVertical className="w-4 h-4 inline mr-1" />
                    Drag items vertically to reorder, use up/down arrows, or use indent/outdent buttons for hierarchy.
                  </p>
                </div>
                <Button onClick={handleCreateItem} className="shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-800 font-medium">Error:</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="mt-2 text-red-600 hover:text-red-800"
                  >
                    Dismiss
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {flattenedItems.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <MenuIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Items Yet</h4>
                    <p className="text-sm mb-4">Add your first menu item to get started building your navigation.</p>
                    <Button onClick={handleCreateItem} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                  >
                    <SortableContext items={flattenedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1">
                        {flattenedItems.map((item) => {
                          const childCount = flattenedItems.filter(child => child.parentId === item.id).length;
                          const isOverThisItem = overId === item.id;
                          
                          return (
                            <div key={item.id}>
                              {/* Drop indicator above item */}
                              <DropIndicator 
                                depth={item.depth} 
                                isVisible={isOverThisItem && activeId !== item.id} 
                              />
                              
                              <SortableItem
                                item={item}
                                isExpanded={expandedItems.has(item.id)}
                                onToggleExpanded={toggleItemExpanded}
                                onEdit={handleEditItem}
                                onDelete={handleDeleteItem}
                                onIndent={handleIndentItem}
                                onOutdent={handleOutdentItem}
                                onMoveUp={handleMoveItemUp}
                                onMoveDown={handleMoveItemDown}
                                getIconComponent={getIconComponent}
                                childCount={childCount}
                                depth={item.depth}
                                isOverItem={isOverThisItem && activeId !== item.id}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </SortableContext>
                    <DragOverlay dropAnimation={dropAnimationConfig}>
                      {activeItem ? (
                        <SortableItem
                          item={activeItem}
                          isExpanded={expandedItems.has(activeItem.id)}
                          onToggleExpanded={() => {}}
                          onEdit={() => {}}
                          onDelete={() => {}}
                          onIndent={() => {}}
                          onOutdent={() => {}}
                          onMoveUp={() => {}}
                          onMoveDown={() => {}}
                          getIconComponent={getIconComponent}
                          clone
                          dragOverlay
                          disableInteraction
                          childCount={flattenedItems.filter(child => child.parentId === activeItem.id).length}
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </div>

              {/* Instructions */}
              {flattenedItems.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    <GripVertical className="w-4 h-4 inline mr-1" />
                    Menu Management Instructions
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-blue-900 mb-1">Drag & Drop</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-blue-600" />
                          Drag items up and down to reorder them
                        </li>
                        <li className="flex items-center">
                          <ChevronUp className="w-4 h-4 mr-2 text-blue-600" />
                          Use up/down arrow buttons for precise positioning
                        </li>
                        <li className="flex items-center">
                          <GripVertical className="w-4 h-4 mr-2 text-blue-600" />
                          Drag handle appears on hover for easy reordering
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-blue-900 mb-1">Indent/Outdent Buttons</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li className="flex items-center">
                          <ChevronRight className="w-4 h-4 mr-2 text-green-600" />
                          Click right arrow to indent (make sub-item)
                        </li>
                        <li className="flex items-center">
                          <ChevronLeft className="w-4 h-4 mr-2 text-orange-600" />
                          Click left arrow to outdent (promote level)
                        </li>
                        <li className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-blue-600" />
                          Hover over items to see indent/outdent buttons
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <MenuIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Menu Selected</h3>
              <p className="text-sm">Select a menu from the left to view and manage its items.</p>
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Header Configuration Tab */}
      {activeTab === 'header' && renderHeaderConfigTab()}

      {/* Footer Configuration Tab */}
      {activeTab === 'footer' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Newsletter Form */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Newsletter Signup</h3>
                  <p className="text-gray-600 text-sm">Select a form for newsletter subscription</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Newsletter Form
                  </label>
                  <select
                    value={siteSettings?.footerNewsletterFormId || ''}
                    onChange={(e) => setSiteSettings((prev: any) => ({ 
                      ...prev, 
                      footerNewsletterFormId: parseInt(e.target.value) || null 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No newsletter form</option>
                    {forms.map((form) => (
                      <option key={form.id} value={form.id}>
                        {form.name} ({form.fields?.length || 0} fields)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a form from Forms Manager to display in footer
                  </p>
                </div>

                {forms.length === 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      No forms available. Create a form in the Forms Manager first.
                    </p>
                  </div>
                )}

                {siteSettings?.footerNewsletterFormId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✓ Newsletter form will be displayed in the footer
                    </p>
                    {(() => {
                      const selectedForm = forms.find(f => f.id === siteSettings.footerNewsletterFormId);
                      return selectedForm ? (
                        <div className="mt-2 text-xs text-green-600">
                          <p><strong>Selected:</strong> {selectedForm.name}</p>
                          <p><strong>Fields:</strong> {selectedForm.fields?.map((f: any) => f.label || f.fieldName).join(', ') || 'No fields'}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                
                {forms.length > 0 && !siteSettings?.footerNewsletterFormId && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 Select a form above to enable newsletter signup in your footer
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Footer Menus - Enhanced UI */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MenuIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Footer Navigation</h3>
                  <p className="text-gray-600 text-sm">Select menus to display in footer navigation</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">
                      Available Menus ({selectedMenuIds.length} selected)
                    </label>
                    {selectedMenuIds.length > 0 && (
                      <button
                        onClick={() => setSelectedMenuIds([])}
                        className="text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  
                  {menus.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {menus.map((menu) => {
                        const isSelected = selectedMenuIds.includes(menu.id);
                        return (
                          <div 
                            key={menu.id} 
                            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                            onClick={() => handleFooterMenuToggle(menu.id)}
                          >
                            {/* Selection indicator */}
                            <div className="absolute top-3 right-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-blue-600 border-blue-600' 
                                  : 'bg-white border-gray-400 hover:border-gray-500'
                              }`}>
                                {isSelected && (
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            
                            {/* Menu info */}
                            <div className="pr-8">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-base font-semibold text-gray-900">{menu.name}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  menu.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {menu.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              
                              {menu.description && (
                                <p className="text-sm text-gray-600 mb-2">{menu.description}</p>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <MenuIcon className="w-3 h-3" />
                                  <span>{menu.items?.length || 0} items</span>
                                </span>
                                {menu.items && menu.items.length > 0 && (
                                  <span className="flex items-center space-x-1">
                                    <span>Preview:</span>
                                    <span className="font-medium">
                                      {menu.items.slice(0, 3).map(item => item.label).join(', ')}
                                      {menu.items.length > 3 && ` +${menu.items.length - 3} more`}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <MenuIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">No menus available</p>
                      <p className="text-xs text-gray-500">Create menus in the "Menu Management" tab first.</p>
                    </div>
                  )}

                  {/* Selection summary */}
                  {selectedMenuIds.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {selectedMenuIds.length} menu{selectedMenuIds.length !== 1 ? 's' : ''} selected for footer navigation
                        </span>
                      </div>
                      <div className="text-xs text-blue-700">
                        Selected menus will appear as navigation sections in your footer.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Display Options */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Settings className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Display Options</h3>
                  <p className="text-gray-600 text-sm">Configure what to show in footer</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Show Contact Information */}
                <div className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-gray-50 hover:bg-blue-50">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      id="footerShowContactInfo"
                      checked={siteSettings?.footerShowContactInfo !== false}
                      onChange={(e) => setSiteSettings((prev: any) => ({ 
                        ...prev, 
                        footerShowContactInfo: e.target.checked 
                      }))}
                      className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-2 border-gray-400 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="footerShowContactInfo" className="block text-base font-semibold text-gray-900 cursor-pointer">
                      Show Contact Information
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Display company phone, email, and address from Site Settings in the footer
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    siteSettings?.footerShowContactInfo !== false ? 'bg-green-500' : 'bg-gray-300'
                  } transition-colors`}></div>
                </div>

                {/* Show Social Media Links */}
                <div className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-gray-50 hover:bg-blue-50">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      id="footerShowSocialLinks"
                      checked={siteSettings?.footerShowSocialLinks !== false}
                      onChange={(e) => setSiteSettings((prev: any) => ({ 
                        ...prev, 
                        footerShowSocialLinks: e.target.checked 
                      }))}
                      className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-2 border-gray-400 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="footerShowSocialLinks" className="block text-base font-semibold text-gray-900 cursor-pointer">
                      Show Social Media Links
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Display social media icons and links from Site Settings in the footer
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    siteSettings?.footerShowSocialLinks !== false ? 'bg-green-500' : 'bg-gray-300'
                  } transition-colors`}></div>
                </div>

                {/* Current Status Preview */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">Footer Display Status:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">Contact Information:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        siteSettings?.footerShowContactInfo !== false
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {siteSettings?.footerShowContactInfo !== false ? '✓ Visible' : '✗ Hidden'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">Social Media Links:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        siteSettings?.footerShowSocialLinks !== false
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {siteSettings?.footerShowSocialLinks !== false ? '✓ Visible' : '✗ Hidden'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">Newsletter Form:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        siteSettings?.footerNewsletterFormId
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {siteSettings?.footerNewsletterFormId ? '✓ Configured' : '○ Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">Footer Menus:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedMenuIds.length > 0
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedMenuIds.length > 0 ? `✓ ${selectedMenuIds.length} selected` : '○ None selected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Footer Styling */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Palette className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Footer Styling</h3>
                  <p className="text-gray-600 text-sm">Customize footer colors and appearance</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Footer Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Footer Background Color
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Select a background color for the footer. The logo will automatically adjust based on the color.
                  </p>
                  
                  {/* Design System Color Palette */}
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-4">
                    {getDesignSystemColors().map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSiteSettings((prev: any) => ({ 
                          ...prev, 
                          footerBackgroundColor: color.value 
                        }))}
                        className={`group relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          siteSettings?.footerBackgroundColor === color.value 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={color.name}
                      >
                        <div 
                          className="w-full h-8 rounded-md mb-2 shadow-sm border"
                          style={{ backgroundColor: color.value }}
                        />
                        <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                          {color.name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {color.value}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Custom Color Input */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">Or enter a custom color:</p>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={siteSettings?.footerBackgroundColor || '#F9FAFB'}
                        onChange={(e) => setSiteSettings((prev: any) => ({ 
                          ...prev, 
                          footerBackgroundColor: e.target.value 
                        }))}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
                      />
                      <Input
                        value={siteSettings?.footerBackgroundColor || ''}
                        onChange={(e) => setSiteSettings((prev: any) => ({ 
                          ...prev, 
                          footerBackgroundColor: e.target.value 
                        }))}
                        placeholder="#F9FAFB"
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Footer Text Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Footer Text Color
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Select the text color for footer content (headings, links, text).
                  </p>
                  
                  {/* Design System Color Palette for Text */}
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-4">
                    {[
                      ...getDesignSystemColors().filter(c => 
                        c.name.includes('Text') || 
                        c.name.includes('Primary') || 
                        c.name.includes('Secondary') || 
                        c.name.includes('Gray') ||
                        c.value === '#FFFFFF' ||
                        c.value === '#000000'
                      ),
                      { name: 'White', value: '#FFFFFF', description: 'Pure white' },
                      { name: 'Black', value: '#000000', description: 'Pure black' }
                    ].map((color) => (
                      <button
                        key={`text-${color.name}`}
                        onClick={() => setSiteSettings((prev: any) => ({ 
                          ...prev, 
                          footerTextColor: color.value 
                        }))}
                        className={`group relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          siteSettings?.footerTextColor === color.value 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={`${color.name} - Text`}
                      >
                        <div 
                          className="w-full h-8 rounded-md mb-2 shadow-sm border flex items-center justify-center"
                          style={{ backgroundColor: color.value }}
                        >
                          <span className="text-sm font-medium text-white">
                            A
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                          {color.name}
                        </p>
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Text Color Input */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">Or enter a custom text color:</p>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={siteSettings?.footerTextColor || '#374151'}
                        onChange={(e) => setSiteSettings((prev: any) => ({ 
                          ...prev, 
                          footerTextColor: e.target.value 
                        }))}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
                      />
                      <Input
                        value={siteSettings?.footerTextColor || ''}
                        onChange={(e) => setSiteSettings((prev: any) => ({ 
                          ...prev, 
                          footerTextColor: e.target.value 
                        }))}
                        placeholder="#374151"
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Button
                    onClick={handleSaveFooterConfig}
                    disabled={footerSaving}
                    className="w-full"
                  >
                    {footerSaving ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Footer Configuration
                      </>
                    )}
                  </Button>
                  
                  {footerSaveSuccess && (
                    <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Footer configuration saved successfully!</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Footer Preview */}
          <Card className="p-6 bg-gray-50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Globe className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Footer Preview</h3>
                <p className="text-gray-600 text-sm">Preview of how your footer will look</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Company Section */}
                <div className="md:col-span-1">
                  <div className="flex items-center space-x-2 mb-4">
                    {siteSettings?.logoUrl ? (
                      <img src={siteSettings.logoUrl} alt="Logo" className="h-8 w-auto" />
                    ) : (
                      <div className="text-lg font-bold text-gray-900">
                        {siteSettings?.footerCompanyName || 'Your Company'}
                      </div>
                    )}
                  </div>
                  {siteSettings?.footerCompanyDescription && (
                    <p className="text-sm text-gray-600 mb-4">
                      {siteSettings.footerCompanyDescription}
                    </p>
                  )}
                  {siteSettings?.footerNewsletterFormId && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">Subscribe to our newsletter</p>
                      <div className="flex space-x-2">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                          disabled
                        />
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md" disabled>
                          Subscribe
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Menu Sections */}
                {selectedMenuIds.length > 0 && selectedMenuIds.map((menuId) => {
                  const menu = menus.find(m => m.id === menuId);
                  if (!menu) return null;
                  
                  return (
                    <div key={menuId}>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">{menu.name}</h4>
                      <ul className="space-y-2">
                        {(menu.items || []).slice(0, 5).map((item: any, index: number) => (
                          <li key={index}>
                            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                              {item.label}
                            </a>
                          </li>
                        ))}
                        {(menu.items || []).length > 5 && (
                          <li className="text-xs text-gray-500">
                            +{(menu.items || []).length - 5} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}

                {/* Contact Info */}
                {siteSettings?.footerShowContactInfo && siteSettings && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Info</h4>
                    <div className="space-y-2">
                      {siteSettings.companyEmail && (
                        <p className="text-sm text-gray-600">{siteSettings.companyEmail}</p>
                      )}
                      {siteSettings.companyPhone && (
                        <p className="text-sm text-gray-600">{siteSettings.companyPhone}</p>
                      )}
                      {siteSettings.companyAddress && (
                        <p className="text-sm text-gray-600">{siteSettings.companyAddress}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-gray-600">
                  {siteSettings?.footerCopyrightMessage 
                    ? siteSettings.footerCopyrightMessage.replace('{year}', new Date().getFullYear().toString())
                    : `© ${new Date().getFullYear()} ${siteSettings?.footerCompanyName || 'Your Company'}. All rights reserved.`
                  }
                </p>
                
                {siteSettings?.footerShowSocialLinks && siteSettings && (
                  <div className="flex space-x-4 mt-4 md:mt-0">
                    {siteSettings.socialFacebook && (
                      <div className="w-5 h-5 bg-blue-600 rounded"></div>
                    )}
                    {siteSettings.socialTwitter && (
                      <div className="w-5 h-5 bg-blue-400 rounded"></div>
                    )}
                    {siteSettings.socialLinkedin && (
                      <div className="w-5 h-5 bg-blue-700 rounded"></div>
                    )}
                    {siteSettings.socialInstagram && (
                      <div className="w-5 h-5 bg-pink-600 rounded"></div>
                    )}
                    {siteSettings.socialYoutube && (
                      <div className="w-5 h-5 bg-red-600 rounded"></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 
import React, { useState, useMemo } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Card } from './Card';
import { 
  Search, X, Check, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Plus, Minus,
  Play, Pause, Download, Upload, Share, Copy, Save, Trash2, Edit, Edit2,
  Mail, MessageSquare, Phone, Video, Send, 
  Home, Menu, Settings, Globe, ExternalLink,
  Calendar, Clock, Target, Award, Star, Heart,
  Code, Database, Cloud, Wifi, Monitor, Smartphone,
  Users, User, CheckCircle, XCircle, AlertCircle, Info,
  File, FileText, Folder, Shield, Lock, Eye, EyeOff,
  Rocket, Sparkles, Zap, Gift, Crown, Diamond, Flame,
  Sun, Moon, Layout, Grid, Layers, Palette,
  CheckSquare, Clipboard, BookOpen, Lightbulb,
  DollarSign, CreditCard, ShoppingCart, TrendingUp, BarChart,
  Image, Music, Film, Gamepad, Activity, Car, Plane,
  Bell, BellOff, Bookmark, Flag, Share2, ThumbsUp, ThumbsDown,
  Loader, Loader2, RefreshCw, RotateCcw, RotateCw,
  Key, Fingerprint, Wrench, Hammer, Scissors, Paintbrush,
  Coffee, Book, Pen, PenTool, Archive, Package, Building,
  Timer, Hourglass, CalendarDays, CalendarCheck,
  Thermometer, Pill, Truck, Train, Bike, Bus, Ship,
  Pizza, Apple, Cherry, Grape, Dice1, Dice2, Dice3,
  GitBranch, GitCommit, GitMerge, Terminal, Bug, Component, Box
} from 'lucide-react';

export interface IconData {
  name: string;
  component: React.ComponentType<any>;
  category: string;
  keywords: string[];
}

const iconLibrary: IconData[] = [
  // Actions & Navigation
  { name: 'ArrowRight', component: ArrowRight, category: 'arrows', keywords: ['arrow', 'right', 'next', 'forward'] },
  { name: 'ArrowLeft', component: ArrowLeft, category: 'arrows', keywords: ['arrow', 'left', 'back', 'previous'] },
  { name: 'ArrowUp', component: ArrowUp, category: 'arrows', keywords: ['arrow', 'up', 'top'] },
  { name: 'ArrowDown', component: ArrowDown, category: 'arrows', keywords: ['arrow', 'down', 'bottom'] },
  { name: 'Plus', component: Plus, category: 'actions', keywords: ['add', 'create', 'new', 'plus'] },
  { name: 'Minus', component: Minus, category: 'actions', keywords: ['remove', 'subtract', 'minus'] },
  { name: 'X', component: X, category: 'actions', keywords: ['close', 'cancel', 'remove', 'delete'] },
  { name: 'Check', component: Check, category: 'actions', keywords: ['confirm', 'done', 'success', 'complete'] },
  { name: 'ChevronDown', component: ChevronDown, category: 'arrows', keywords: ['chevron', 'down', 'dropdown'] },
  { name: 'ChevronUp', component: ChevronUp, category: 'arrows', keywords: ['chevron', 'up'] },
  
  // Media & Entertainment
  { name: 'Play', component: Play, category: 'media', keywords: ['play', 'start', 'video', 'audio'] },
  { name: 'Pause', component: Pause, category: 'media', keywords: ['pause', 'stop', 'break'] },
  { name: 'Download', component: Download, category: 'actions', keywords: ['download', 'save', 'export'] },
  { name: 'Upload', component: Upload, category: 'actions', keywords: ['upload', 'import', 'add'] },
  { name: 'Share', component: Share, category: 'actions', keywords: ['share', 'export', 'send'] },
  { name: 'Share2', component: Share2, category: 'social', keywords: ['share', 'social', 'spread'] },
  { name: 'Image', component: Image, category: 'media', keywords: ['image', 'picture', 'photo'] },
  { name: 'Music', component: Music, category: 'media', keywords: ['music', 'audio', 'sound'] },
  { name: 'Film', component: Film, category: 'media', keywords: ['video', 'movie', 'film'] },
  
  // Communication
  { name: 'Mail', component: Mail, category: 'communication', keywords: ['email', 'message', 'contact', 'envelope'] },
  { name: 'MessageSquare', component: MessageSquare, category: 'communication', keywords: ['chat', 'message', 'talk', 'conversation'] },
  { name: 'Phone', component: Phone, category: 'communication', keywords: ['call', 'telephone', 'contact'] },
  { name: 'Video', component: Video, category: 'communication', keywords: ['video call', 'camera', 'meeting'] },
  { name: 'Send', component: Send, category: 'communication', keywords: ['send', 'submit', 'share'] },
  
  // Navigation & Interface
  { name: 'Home', component: Home, category: 'navigation', keywords: ['home', 'house', 'main'] },
  { name: 'Menu', component: Menu, category: 'navigation', keywords: ['menu', 'hamburger', 'navigation'] },
  { name: 'Settings', component: Settings, category: 'navigation', keywords: ['settings', 'config', 'preferences'] },
  { name: 'Search', component: Search, category: 'navigation', keywords: ['search', 'find', 'look'] },
  { name: 'Globe', component: Globe, category: 'navigation', keywords: ['world', 'global', 'international'] },
  { name: 'ExternalLink', component: ExternalLink, category: 'navigation', keywords: ['link', 'external', 'open'] },
  
  // Business & Finance
  { name: 'DollarSign', component: DollarSign, category: 'business', keywords: ['money', 'price', 'cost', 'payment'] },
  { name: 'CreditCard', component: CreditCard, category: 'business', keywords: ['payment', 'card', 'billing'] },
  { name: 'ShoppingCart', component: ShoppingCart, category: 'business', keywords: ['cart', 'shop', 'buy', 'purchase'] },
  { name: 'TrendingUp', component: TrendingUp, category: 'business', keywords: ['growth', 'increase', 'profit', 'success'] },
  { name: 'BarChart', component: BarChart, category: 'business', keywords: ['chart', 'analytics', 'data', 'statistics'] },
  { name: 'Target', component: Target, category: 'business', keywords: ['goal', 'target', 'objective', 'aim'] },
  { name: 'Award', component: Award, category: 'business', keywords: ['award', 'achievement', 'success', 'trophy'] },
  { name: 'Building', component: Building, category: 'business', keywords: ['building', 'office', 'company'] },
  
  // Technology
  { name: 'Code', component: Code, category: 'technology', keywords: ['code', 'programming', 'development'] },
  { name: 'Database', component: Database, category: 'technology', keywords: ['database', 'storage', 'data'] },
  { name: 'Cloud', component: Cloud, category: 'technology', keywords: ['cloud', 'storage', 'online'] },
  { name: 'Wifi', component: Wifi, category: 'technology', keywords: ['wifi', 'internet', 'connection'] },
  { name: 'Monitor', component: Monitor, category: 'technology', keywords: ['screen', 'display', 'computer'] },
  { name: 'Smartphone', component: Smartphone, category: 'technology', keywords: ['phone', 'mobile', 'device'] },
  { name: 'Terminal', component: Terminal, category: 'technology', keywords: ['terminal', 'command', 'code'] },
  { name: 'Bug', component: Bug, category: 'technology', keywords: ['bug', 'error', 'debug'] },
  { name: 'Component', component: Component, category: 'technology', keywords: ['component', 'module', 'part'] },
  { name: 'Box', component: Box, category: 'technology', keywords: ['box', 'package', 'container'] },
  
  // Social & Community
  { name: 'Users', component: Users, category: 'social', keywords: ['users', 'people', 'team', 'community'] },
  { name: 'User', component: User, category: 'social', keywords: ['user', 'person', 'profile', 'account'] },
  { name: 'Heart', component: Heart, category: 'social', keywords: ['like', 'love', 'favorite', 'heart'] },
  { name: 'Star', component: Star, category: 'social', keywords: ['star', 'rating', 'favorite', 'bookmark'] },
  { name: 'ThumbsUp', component: ThumbsUp, category: 'social', keywords: ['like', 'approve', 'positive'] },
  { name: 'ThumbsDown', component: ThumbsDown, category: 'social', keywords: ['dislike', 'disapprove', 'negative'] },
  { name: 'Flag', component: Flag, category: 'social', keywords: ['flag', 'report', 'mark'] },
  { name: 'Bookmark', component: Bookmark, category: 'social', keywords: ['bookmark', 'save', 'favorite'] },
  
  // Status & Feedback
  { name: 'CheckCircle', component: CheckCircle, category: 'status', keywords: ['success', 'complete', 'done', 'verified'] },
  { name: 'XCircle', component: XCircle, category: 'status', keywords: ['error', 'failed', 'wrong', 'cancel'] },
  { name: 'AlertCircle', component: AlertCircle, category: 'status', keywords: ['warning', 'alert', 'attention'] },
  { name: 'Info', component: Info, category: 'status', keywords: ['info', 'information', 'help'] },
  { name: 'Loader', component: Loader, category: 'status', keywords: ['loading', 'spinner', 'progress'] },
  { name: 'Loader2', component: Loader2, category: 'status', keywords: ['loading', 'spinner', 'progress'] },
  { name: 'RefreshCw', component: RefreshCw, category: 'status', keywords: ['refresh', 'reload', 'update'] },
  { name: 'RotateCcw', component: RotateCcw, category: 'status', keywords: ['undo', 'rotate', 'back'] },
  { name: 'RotateCw', component: RotateCw, category: 'status', keywords: ['redo', 'rotate', 'forward'] },
  
  // Time & Calendar
  { name: 'Calendar', component: Calendar, category: 'time', keywords: ['calendar', 'date', 'schedule', 'event'] },
  { name: 'Clock', component: Clock, category: 'time', keywords: ['time', 'clock', 'schedule'] },
  { name: 'Timer', component: Timer, category: 'time', keywords: ['timer', 'countdown'] },
  { name: 'Hourglass', component: Hourglass, category: 'time', keywords: ['hourglass', 'time', 'waiting'] },
  { name: 'CalendarDays', component: CalendarDays, category: 'time', keywords: ['calendar', 'days', 'schedule'] },
  { name: 'CalendarCheck', component: CalendarCheck, category: 'time', keywords: ['calendar', 'check', 'done'] },
  
  // Files & Documents
  { name: 'File', component: File, category: 'files', keywords: ['file', 'document', 'paper'] },
  { name: 'FileText', component: FileText, category: 'files', keywords: ['document', 'text', 'article'] },
  { name: 'Folder', component: Folder, category: 'files', keywords: ['folder', 'directory', 'organize'] },
  { name: 'Archive', component: Archive, category: 'files', keywords: ['archive', 'zip', 'compress'] },
  { name: 'Package', component: Package, category: 'files', keywords: ['package', 'box', 'delivery'] },
  
  // Security
  { name: 'Shield', component: Shield, category: 'security', keywords: ['security', 'protection', 'safe'] },
  { name: 'Lock', component: Lock, category: 'security', keywords: ['lock', 'secure', 'private'] },
  { name: 'Key', component: Key, category: 'security', keywords: ['key', 'password', 'access'] },
  { name: 'Eye', component: Eye, category: 'security', keywords: ['view', 'show', 'visible'] },
  { name: 'EyeOff', component: EyeOff, category: 'security', keywords: ['hide', 'invisible', 'private'] },
  { name: 'Fingerprint', component: Fingerprint, category: 'security', keywords: ['fingerprint', 'biometric', 'identity'] },
  
  // Tools & Utilities
  { name: 'Edit', component: Edit, category: 'tools', keywords: ['edit', 'modify', 'change', 'pencil'] },
  { name: 'Edit2', component: Edit2, category: 'tools', keywords: ['edit', 'pencil', 'write'] },
  { name: 'Copy', component: Copy, category: 'tools', keywords: ['copy', 'duplicate', 'clone'] },
  { name: 'Save', component: Save, category: 'tools', keywords: ['save', 'disk', 'store'] },
  { name: 'Trash2', component: Trash2, category: 'tools', keywords: ['delete', 'remove', 'trash', 'bin'] },
  { name: 'Wrench', component: Wrench, category: 'tools', keywords: ['wrench', 'tool', 'fix'] },
  { name: 'Hammer', component: Hammer, category: 'tools', keywords: ['hammer', 'tool', 'build'] },
  { name: 'Scissors', component: Scissors, category: 'tools', keywords: ['scissors', 'cut', 'trim'] },
  { name: 'Paintbrush', component: Paintbrush, category: 'tools', keywords: ['paintbrush', 'paint', 'design'] },
  { name: 'Pen', component: Pen, category: 'tools', keywords: ['pen', 'write', 'edit'] },
  { name: 'PenTool', component: PenTool, category: 'tools', keywords: ['pen tool', 'design', 'draw'] },
  
  // Special & Fun
  { name: 'Rocket', component: Rocket, category: 'special', keywords: ['rocket', 'launch', 'fast', 'startup'] },
  { name: 'Sparkles', component: Sparkles, category: 'special', keywords: ['sparkles', 'magic', 'special', 'new'] },
  { name: 'Zap', component: Zap, category: 'special', keywords: ['lightning', 'fast', 'energy', 'power'] },
  { name: 'Gift', component: Gift, category: 'special', keywords: ['gift', 'present', 'bonus', 'reward'] },
  { name: 'Crown', component: Crown, category: 'special', keywords: ['crown', 'premium', 'royal', 'king'] },
  { name: 'Diamond', component: Diamond, category: 'special', keywords: ['diamond', 'premium', 'valuable'] },
  { name: 'Flame', component: Flame, category: 'special', keywords: ['fire', 'hot', 'trending', 'popular'] },
  
  // Weather & Nature
  { name: 'Sun', component: Sun, category: 'weather', keywords: ['sun', 'light', 'day', 'bright'] },
  { name: 'Moon', component: Moon, category: 'weather', keywords: ['moon', 'night', 'dark'] },
  
  // Layout & Design
  { name: 'Layout', component: Layout, category: 'design', keywords: ['layout', 'design', 'structure'] },
  { name: 'Grid', component: Grid, category: 'design', keywords: ['grid', 'layout', 'organize'] },
  { name: 'Layers', component: Layers, category: 'design', keywords: ['layers', 'stack', 'organize'] },
  { name: 'Palette', component: Palette, category: 'design', keywords: ['colors', 'design', 'theme'] },
  
  // Productivity
  { name: 'CheckSquare', component: CheckSquare, category: 'productivity', keywords: ['task', 'todo', 'complete'] },
  { name: 'Clipboard', component: Clipboard, category: 'productivity', keywords: ['clipboard', 'copy', 'notes'] },
  { name: 'Book', component: Book, category: 'productivity', keywords: ['book', 'reading', 'knowledge'] },
  { name: 'BookOpen', component: BookOpen, category: 'productivity', keywords: ['book', 'read', 'learn', 'education'] },
  { name: 'Lightbulb', component: Lightbulb, category: 'productivity', keywords: ['idea', 'innovation', 'creative'] },
  { name: 'Bell', component: Bell, category: 'productivity', keywords: ['notification', 'alert', 'bell'] },
  { name: 'BellOff', component: BellOff, category: 'productivity', keywords: ['notification off', 'silent', 'mute'] },
  { name: 'Coffee', component: Coffee, category: 'productivity', keywords: ['coffee', 'break', 'energy'] },
  
  // Gaming & Entertainment
  { name: 'Gamepad', component: Gamepad, category: 'gaming', keywords: ['game', 'play', 'controller'] },
  { name: 'Dice1', component: Dice1, category: 'gaming', keywords: ['dice', 'random', 'game'] },
  { name: 'Dice2', component: Dice2, category: 'gaming', keywords: ['dice', 'random', 'game'] },
  { name: 'Dice3', component: Dice3, category: 'gaming', keywords: ['dice', 'random', 'game'] },
  
  // Health & Medical
  { name: 'Activity', component: Activity, category: 'health', keywords: ['health', 'activity', 'fitness'] },
  { name: 'Thermometer', component: Thermometer, category: 'health', keywords: ['temperature', 'health'] },
  { name: 'Pill', component: Pill, category: 'health', keywords: ['pill', 'medicine', 'health'] },
  
  // Transport & Travel
  { name: 'Car', component: Car, category: 'transport', keywords: ['car', 'vehicle', 'drive'] },
  { name: 'Plane', component: Plane, category: 'transport', keywords: ['plane', 'flight', 'travel'] },
  { name: 'Train', component: Train, category: 'transport', keywords: ['train', 'railway', 'transport'] },
  { name: 'Truck', component: Truck, category: 'transport', keywords: ['truck', 'delivery', 'shipping'] },
  { name: 'Bike', component: Bike, category: 'transport', keywords: ['bike', 'bicycle', 'cycling'] },
  { name: 'Bus', component: Bus, category: 'transport', keywords: ['bus', 'public transport'] },
  { name: 'Ship', component: Ship, category: 'transport', keywords: ['ship', 'boat', 'sailing'] },
  
  // Food & Drink
  { name: 'Pizza', component: Pizza, category: 'food', keywords: ['pizza', 'food', 'meal'] },
  { name: 'Apple', component: Apple, category: 'food', keywords: ['apple', 'fruit', 'healthy'] },
  { name: 'Cherry', component: Cherry, category: 'food', keywords: ['cherry', 'fruit', 'sweet'] },
  { name: 'Grape', component: Grape, category: 'food', keywords: ['grape', 'fruit', 'wine'] },
  
  // Development & Git
  { name: 'GitBranch', component: GitBranch, category: 'development', keywords: ['git', 'branch', 'version'] },
  { name: 'GitCommit', component: GitCommit, category: 'development', keywords: ['git', 'commit', 'save'] },
  { name: 'GitMerge', component: GitMerge, category: 'development', keywords: ['git', 'merge', 'combine'] },
];

export interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  placeholder = "Select an icon",
  className = "",
  showLabel = true,
  label = "Icon"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(iconLibrary.map(icon => icon.category)));
    return ['all', ...cats.sort()];
  }, []);

  const filteredIcons = useMemo(() => {
    let filtered = iconLibrary;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(icon => icon.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(icon => 
        icon.name.toLowerCase().includes(term) ||
        icon.keywords.some(keyword => keyword.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  const selectedIcon = iconLibrary.find(icon => icon.name === value);

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchTerm('');
    
    // Add to recently used
    setRecentlyUsed(prev => {
      const newRecent = [iconName, ...prev.filter(name => name !== iconName)].slice(0, 8);
      return newRecent;
    });
  };

  const clearSelection = () => {
    onChange('');
    setIsOpen(false);
  };

  // Get recently used icons
  const recentlyUsedIcons = recentlyUsed
    .map(name => iconLibrary.find(icon => icon.name === name))
    .filter(Boolean);

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-12 px-4"
      >
        <div className="flex items-center space-x-2">
          {selectedIcon ? (
            <>
              <div className={`
                ${(() => {
                  switch (selectedIcon.category) {
                    case 'actions': return 'text-blue-600';
                    case 'arrows': return 'text-gray-600';
                    case 'media': return 'text-purple-600';
                    case 'communication': return 'text-green-600';
                    case 'navigation': return 'text-indigo-600';
                    case 'business': return 'text-emerald-600';
                    case 'technology': return 'text-cyan-600';
                    case 'social': return 'text-pink-600';
                    case 'status': return 'text-orange-600';
                    case 'time': return 'text-yellow-600';
                    case 'files': return 'text-slate-600';
                    case 'security': return 'text-red-600';
                    case 'tools': return 'text-amber-600';
                    case 'special': return 'text-violet-600';
                    case 'weather': return 'text-sky-600';
                    case 'design': return 'text-rose-600';
                    case 'productivity': return 'text-lime-600';
                    case 'gaming': return 'text-fuchsia-600';
                    case 'health': return 'text-teal-600';
                    case 'transport': return 'text-blue-500';
                    case 'food': return 'text-orange-500';
                    case 'development': return 'text-gray-700';
                    default: return 'text-gray-600';
                  }
                })()}
              `}>
                <selectedIcon.component className="w-4 h-4" />
              </div>
              <span className="font-medium">{selectedIcon.name}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {selectedIcon.category}
              </span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 p-4 max-h-96 overflow-hidden shadow-lg border min-w-96">
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/4 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {value && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Selection
              </Button>
            )}
          </div>

          <div className="overflow-y-auto max-h-64">
            {filteredIcons.length > 0 ? (
              <div className="space-y-4">
                {/* Recently Used Section */}
                {recentlyUsedIcons.length > 0 && searchTerm === '' && selectedCategory === 'all' && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Recently Used</h4>
                    <div className="grid grid-cols-8 gap-2 mb-4">
                      {recentlyUsedIcons.map((icon) => {
                        const IconComponent = icon!.component;
                        const isSelected = value === icon!.name;
                        
                        const getIconColor = (category: string) => {
                          switch (category) {
                            case 'actions': return 'text-blue-600';
                            case 'arrows': return 'text-gray-600';
                            case 'media': return 'text-purple-600';
                            case 'communication': return 'text-green-600';
                            case 'navigation': return 'text-indigo-600';
                            case 'business': return 'text-emerald-600';
                            case 'technology': return 'text-cyan-600';
                            case 'social': return 'text-pink-600';
                            case 'status': return 'text-orange-600';
                            case 'time': return 'text-yellow-600';
                            case 'files': return 'text-slate-600';
                            case 'security': return 'text-red-600';
                            case 'tools': return 'text-amber-600';
                            case 'special': return 'text-violet-600';
                            case 'weather': return 'text-sky-600';
                            case 'design': return 'text-rose-600';
                            case 'productivity': return 'text-lime-600';
                            case 'gaming': return 'text-fuchsia-600';
                            case 'health': return 'text-teal-600';
                            case 'transport': return 'text-blue-500';
                            case 'food': return 'text-orange-500';
                            case 'development': return 'text-gray-700';
                            default: return 'text-gray-600';
                          }
                        };
                        
                        return (
                          <button
                            key={icon!.name}
                            type="button"
                            onClick={() => handleIconSelect(icon!.name)}
                            className={`
                              p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105
                              flex flex-col items-center justify-center space-y-1 group relative
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                              }
                            `}
                            title={`${icon!.name} (${icon!.category})`}
                          >
                            <div className={`
                              ${isSelected ? 'text-blue-600' : getIconColor(icon!.category)}
                              transition-colors duration-200
                            `}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Icons Section */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    {selectedCategory === 'all' ? 'All Icons' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  </h4>
                  <div className="grid grid-cols-8 gap-2">
                    {filteredIcons.map((icon) => {
                      const IconComponent = icon.component;
                      const isSelected = value === icon.name;
                      
                      // Color scheme based on category
                      const getIconColor = (category: string) => {
                        switch (category) {
                          case 'actions': return 'text-blue-600';
                          case 'arrows': return 'text-gray-600';
                          case 'media': return 'text-purple-600';
                          case 'communication': return 'text-green-600';
                          case 'navigation': return 'text-indigo-600';
                          case 'business': return 'text-emerald-600';
                          case 'technology': return 'text-cyan-600';
                          case 'social': return 'text-pink-600';
                          case 'status': return 'text-orange-600';
                          case 'time': return 'text-yellow-600';
                          case 'files': return 'text-slate-600';
                          case 'security': return 'text-red-600';
                          case 'tools': return 'text-amber-600';
                          case 'special': return 'text-violet-600';
                          case 'weather': return 'text-sky-600';
                          case 'design': return 'text-rose-600';
                          case 'productivity': return 'text-lime-600';
                          case 'gaming': return 'text-fuchsia-600';
                          case 'health': return 'text-teal-600';
                          case 'transport': return 'text-blue-500';
                          case 'food': return 'text-orange-500';
                          case 'development': return 'text-gray-700';
                          default: return 'text-gray-600';
                        }
                      };
                      
                      return (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => handleIconSelect(icon.name)}
                          className={`
                            p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
                            flex flex-col items-center justify-center space-y-2 group relative
                            ${isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                            }
                          `}
                          title={`${icon.name} (${icon.category})`}
                        >
                          <div className={`
                            ${isSelected ? 'text-blue-600' : getIconColor(icon.category)}
                            transition-colors duration-200
                          `}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="text-xs text-center leading-tight max-w-full truncate font-medium">
                            {icon.name}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No icons found</p>
                <p className="text-sm">Try a different search term or category</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
            {filteredIcons.length} of {iconLibrary.length} icons
          </div>
        </Card>
      )}
    </div>
  );
};

export default IconPicker;
export { iconLibrary };
 

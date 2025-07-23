'use client';

import { useState } from 'react';
import { MessageSquare, FolderOpen, Settings } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import FAQCategoriesManager from './FAQCategoriesManager';
import FAQsManager from './FAQsManager';
import FAQSectionsManager from './FAQSectionsManager';

type FAQTab = 'categories' | 'faqs' | 'sections';

const tabs = [
  {
    id: 'categories' as FAQTab,
    name: 'Categories',
    icon: FolderOpen,
    description: 'Manage FAQ categories with colors and icons'
  },
  {
    id: 'faqs' as FAQTab,
    name: 'FAQs',
    icon: MessageSquare,
    description: 'Create and manage frequently asked questions'
  },
  {
    id: 'sections' as FAQTab,
    name: 'Sections',
    icon: Settings,
    description: 'Configure FAQ section display settings and styling'
  }
];

export default function FAQManager() {
  const [activeTab, setActiveTab] = useState<FAQTab>('categories');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">FAQ Management</h1>
        <p className="text-gray-600">
          Organize and manage your frequently asked questions, categories, and display settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon
                  className={`mr-2 h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'categories' && <FAQCategoriesManager />}
        {activeTab === 'faqs' && <FAQsManager />}
        {activeTab === 'sections' && <FAQSectionsManager />}
      </div>
    </div>
  );
} 
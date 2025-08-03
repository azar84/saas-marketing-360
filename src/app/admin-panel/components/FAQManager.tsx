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
      <div className="border-b pb-6" style={{ borderColor: 'var(--color-gray-light, #E5E7EB)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary, #1F2937)' }}>FAQ Management</h1>
        <p style={{ color: 'var(--color-text-secondary, #6B7280)' }}>
          Organize and manage your frequently asked questions, categories, and display settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b" style={{ borderColor: 'var(--color-gray-light, #E5E7EB)' }}>
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                style={{
                  borderColor: isActive 
                    ? 'var(--color-primary, #5243E9)' 
                    : 'transparent',
                  color: isActive 
                    ? 'var(--color-primary, #5243E9)' 
                    : 'var(--color-text-secondary, #6B7280)'
                }}
              >
                <Icon
                  className="mr-2 h-5 w-5 transition-colors"
                  style={{
                    color: isActive 
                      ? 'var(--color-primary, #5243E9)' 
                      : 'var(--color-text-secondary, #6B7280)'
                  }}
                />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-info-light, #DBEAFE)' }}>
        <p className="text-sm" style={{ color: 'var(--color-info-dark, #1E40AF)' }}>
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
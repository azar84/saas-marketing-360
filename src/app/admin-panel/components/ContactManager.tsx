'use client';

import { useState } from 'react';
import { Mail, Database } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import FormBuilder from './FormBuilder';
import FormSubmissionsManager from './FormSubmissionsManager';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';

type ContactTab = 'forms' | 'submissions';

const tabs = [
  {
    id: 'forms' as ContactTab,
    name: 'Form Builder',
    icon: Mail,
    description: 'Create and manage dynamic forms with drag-and-drop field builder'
  },
  {
    id: 'submissions' as ContactTab,
    name: 'Form Submissions',
    icon: Database,
    description: 'View and manage form submissions from your website'
  }
];

export default function ContactManager() {
  const { designSystem } = useDesignSystem();
  const adminColors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  const [activeTab, setActiveTab] = useState<ContactTab>('forms');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div 
        className="border-b pb-6"
        style={{ borderColor: 'var(--color-gray-light, #E5E7EB)' }}
      >
        <h1 
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary, #1F2937)' }}
        >
          Forms Management
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #6B7280)' }}>
          Build and manage dynamic contact forms with custom fields and validation
        </p>
      </div>

      {/* Tab Navigation */}
      <div 
        className="border-b"
        style={{ borderColor: 'var(--color-gray-light, #E5E7EB)' }}
      >
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
      <div 
        className="rounded-lg p-4"
        style={{ backgroundColor: 'var(--color-bg-secondary, #F9FAFB)' }}
      >
        <p 
          className="text-sm"
          style={{ color: 'var(--color-success, #10B981)' }}
        >
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'forms' && <FormBuilder />}
        {activeTab === 'submissions' && <FormSubmissionsManager />}
      </div>
    </div>
  );
} 
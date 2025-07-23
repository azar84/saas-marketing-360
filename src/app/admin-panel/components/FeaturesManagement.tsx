'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import FeaturesManager from './FeaturesManager';
import FeatureGroupsManager from './FeatureGroupsManager';

type ActiveTab = 'feature-groups' | 'individual-features';

const FeaturesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feature-groups');

  const tabs = [
    {
      id: 'feature-groups' as const,
      name: 'Feature Groups',
      icon: Layers,
      description: 'Manage grouped features and their layouts'
    },
    {
      id: 'individual-features' as const,
      name: 'Individual Features',
      icon: Star,
      description: 'Manage individual feature items'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'feature-groups':
        return <FeatureGroupsManager />;
      case 'individual-features':
        return <FeaturesManager />;
      default:
        return <FeatureGroupsManager />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Features Management</h1>
        <p className="text-gray-600">Manage feature groups and individual features for your website</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? 'border-[#5243E9] text-[#5243E9]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`mr-2 h-5 w-5 ${
                  isActive ? 'text-[#5243E9]' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="mb-6">
        {tabs.map((tab) => {
          if (activeTab !== tab.id) return null;
          
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.description}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-[600px]"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default FeaturesManagement; 
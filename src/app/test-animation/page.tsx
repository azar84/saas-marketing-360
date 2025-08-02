'use client';

import React from 'react';
import FeaturesListLayout from '@/components/sections/FeaturesListLayout';

const testFeatures = [
  {
    id: 1,
    title: "Smart Conversations",
    description: "AI-powered chat that understands context and provides intelligent responses to your customers.",
    iconName: "MessageSquare",
    category: "Communication",
    sortOrder: 1,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Multi-Channel Support",
    description: "Connect across WhatsApp, website chat, email, and more from a single dashboard.",
    iconName: "Globe",
    category: "Integration",
    sortOrder: 2,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Analytics & Insights",
    description: "Track performance, customer satisfaction, and team productivity with detailed reports.",
    iconName: "TrendingUp",
    category: "Analytics",
    sortOrder: 3,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function TestAnimationPage() {
  return (
    <div className="min-h-screen">
      <FeaturesListLayout 
        features={testFeatures}
        heading="Test Animation"
        subheading="Testing the list layout animation"
        backgroundColor="#ffffff"
      />
    </div>
  );
} 
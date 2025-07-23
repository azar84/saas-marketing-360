'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Eye, RotateCcw, Sparkles } from 'lucide-react';

interface HeroData {
  title: string;
  subtitle: string;
  primaryCTA: string;
  secondaryCTA: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
}

export default function HeroManager() {
  const [heroData, setHeroData] = useState<HeroData>({
    title: "Transform Customer Conversations with AI",
    subtitle: "Automate support, boost engagement, and scale your business with intelligent chatbots across all channels",
    primaryCTA: "Start Free Trial",
    secondaryCTA: "See Demo",
    stats: [
      { label: "Response Time", value: "<30s" },
      { label: "Languages", value: "100+" },
      { label: "Integrations", value: "50+" },
      { label: "Uptime", value: "99.9%" }
    ]
  });

  const [isPreview, setIsPreview] = useState(false);

  const handleSave = () => {
    // Here you would typically save to your backend/CMS
    // Debug info only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Saving hero data:', heroData);
    }
    alert('Hero section saved successfully!');
  };

  const handleReset = () => {
    setHeroData({
      title: "Transform Customer Conversations with AI",
      subtitle: "Automate support, boost engagement, and scale your business with intelligent chatbots across all channels",
      primaryCTA: "Start Free Trial",
      secondaryCTA: "See Demo",
      stats: [
        { label: "Response Time", value: "<30s" },
        { label: "Languages", value: "100+" },
        { label: "Integrations", value: "50+" },
        { label: "Uptime", value: "99.9%" }
      ]
    });
  };

  const updateStat = (index: number, field: 'label' | 'value', value: string) => {
    const newStats = [...heroData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setHeroData({ ...heroData, stats: newStats });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Hero Section</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Edit the main hero section content that visitors see first</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsPreview(!isPreview)}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {isPreview ? (
        /* Preview Mode */
        <Card className="p-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium mb-6">
              ✨ Live Preview
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              {heroData.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {heroData.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 text-lg"
              >
                {heroData.primaryCTA}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-lg"
              >
                {heroData.secondaryCTA}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
              {heroData.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        /* Edit Mode */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Main Content */}
          <Card className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Main Content
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Main Title
                </label>
                <Input
                  value={heroData.title}
                  onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                  placeholder="Enter main title"
                  className="w-full h-12 px-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Subtitle
                </label>
                <textarea
                  value={heroData.subtitle}
                  onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                  placeholder="Enter subtitle"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Primary CTA Button
                  </label>
                  <Input
                    value={heroData.primaryCTA}
                    onChange={(e) => setHeroData({ ...heroData, primaryCTA: e.target.value })}
                    placeholder="Primary button text"
                    className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Secondary CTA Button
                  </label>
                  <Input
                    value={heroData.secondaryCTA}
                    onChange={(e) => setHeroData({ ...heroData, secondaryCTA: e.target.value })}
                    placeholder="Secondary button text"
                    className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <Card className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Statistics
            </h3>
            <div className="space-y-6">
              {heroData.stats.map((stat, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Stat {index + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Value
                      </label>
                      <Input
                        value={stat.value}
                        onChange={(e) => updateStat(index, 'value', e.target.value)}
                        placeholder="e.g., 100+"
                        className="w-full h-10 px-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Label
                      </label>
                      <Input
                        value={stat.label}
                        onChange={(e) => updateStat(index, 'label', e.target.value)}
                        placeholder="e.g., Languages"
                        className="w-full h-10 px-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

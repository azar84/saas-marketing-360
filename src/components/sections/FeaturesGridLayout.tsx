'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { renderIcon } from '@/lib/iconUtils';

interface GlobalFeature {
  id: number;
  title: string;
  description: string;
  iconName: string;
  category: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeaturesGridLayoutProps {
  features: GlobalFeature[];
  heading: string;
  subheading?: string;
  backgroundColor?: string;
}

const FeaturesGridLayout: React.FC<FeaturesGridLayoutProps> = ({ 
  features, 
  heading, 
  subheading,
  backgroundColor = 'var(--color-bg-secondary)'
}) => {

  const getIconComponent = (iconName: string) => {
    // Use the universal renderIcon utility
    // If iconName doesn't include a library prefix, assume it's a Lucide icon
    const iconString = iconName.includes(':') ? iconName : `lucide:${iconName}`;
    return renderIcon(iconString, { className: 'w-10 h-10' }) || renderIcon('lucide:Star', { className: 'w-10 h-10' });
  };

  const displayFeatures = features; // Show all features

  return (
    <section 
      className="w-full min-h-screen flex items-center justify-center py-20"
      style={{ 
        backgroundColor: backgroundColor
      }}
    >
      {/* Elementor Container */}
      <div className="elementor-container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8">
        <div className="elementor-column elementor-col-100">
          <div className="elementor-widget-wrap">
            
            {/* Header Section */}
            <div className="elementor-widget elementor-widget-heading text-center mb-4">
              <div className="elementor-widget-container">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="elementor-heading-title text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {heading}
                </motion.h2>
              </div>
            </div>

            {/* Subtitle Section */}
            {subheading && (
              <div className="elementor-widget elementor-widget-text-editor text-center mb-16">
                <div className="elementor-widget-container">
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-lg leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <span>{subheading}</span>
                  </motion.p>
                </div>
              </div>
            )}

            {/* First Row - 3 Columns */}
            <section className="elementor-inner-section mb-12">
              <div className="elementor-container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {displayFeatures.slice(0, 3).map((feature, index) => (
                    <div key={feature.id} className="elementor-column elementor-col-33">
                      <div className="elementor-widget-wrap">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="group rounded-xl px-16 py-8 shadow-sm border hover:shadow-md transition-all duration-300"
                          style={{ 
                            backgroundColor: 'var(--color-bg-secondary)',
                            borderColor: 'var(--color-gray-light)'
                          }}
                        >
                          <div className="elementor-icon-box-wrapper">
                            {/* Icon */}
                            <div className="elementor-icon-box-icon mb-3 flex justify-start">
                              <span className="elementor-icon">
                                <div className="w-12 h-12 flex items-center justify-center">
                                  <div style={{ color: 'var(--color-primary)' }}>
                                    {getIconComponent(feature.iconName)}
                                  </div>
                                </div>
                              </span>
                            </div>
                            
                            {/* Content */}
                            <div className="elementor-icon-box-content">
                              <h3 className="elementor-icon-box-title text-xl font-bold mb-3 group-hover:text-[var(--color-primary)] transition-colors duration-300"
                                style={{ color: 'var(--color-text-primary)' }}>
                                <span>
                                  {feature.title}
                                </span>
                              </h3>
                              
                              <p className="elementor-icon-box-description leading-relaxed"
                                style={{ color: 'var(--color-text-secondary)' }}>
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Second Row - 3 Columns (if we have more than 3 features) */}
            {displayFeatures.length > 3 && (
              <section className="elementor-inner-section mb-12">
                <div className="elementor-container">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayFeatures.slice(3, 6).map((feature, index) => (
                      <div key={feature.id} className="elementor-column elementor-col-33">
                        <div className="elementor-widget-wrap">
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: (index + 3) * 0.1 }}
                            className="group rounded-xl px-16 py-8 shadow-sm border hover:shadow-md transition-all duration-300"
                            style={{ 
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: 'var(--color-gray-light)'
                            }}
                          >
                            <div className="elementor-icon-box-wrapper">
                              {/* Icon */}
                              <div className="elementor-icon-box-icon mb-3 flex justify-start">
                                <span className="elementor-icon">
                                  <div className="w-12 h-12 flex items-center justify-center">
                                    <div style={{ color: 'var(--color-primary)' }}>
                                      {getIconComponent(feature.iconName)}
                                    </div>
                                  </div>
                                </span>
                              </div>
                              
                              {/* Content */}
                              <div className="elementor-icon-box-content">
                                <h3 className="elementor-icon-box-title text-xl font-bold mb-3 group-hover:text-[var(--color-primary)] transition-colors duration-300"
                                  style={{ color: 'var(--color-text-primary)' }}>
                                  <span>
                                    {feature.title}
                                  </span>
                                </h3>
                                
                                <p className="elementor-icon-box-description leading-relaxed"
                                  style={{ color: 'var(--color-text-secondary)' }}>
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Third Row - 3 Columns (if we have more than 6 features) */}
            {displayFeatures.length > 6 && (
              <section className="elementor-inner-section">
                <div className="elementor-container">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayFeatures.slice(6, 9).map((feature, index) => (
                      <div key={feature.id} className="elementor-column elementor-col-33">
                        <div className="elementor-widget-wrap">
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: (index + 6) * 0.1 }}
                            className="group rounded-xl px-16 py-8 shadow-sm border hover:shadow-md transition-all duration-300"
                            style={{ 
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: 'var(--color-gray-light)'
                            }}
                          >
                            <div className="elementor-icon-box-wrapper">
                              {/* Icon */}
                              <div className="elementor-icon-box-icon mb-3 flex justify-start">
                                <span className="elementor-icon">
                                  <div className="w-12 h-12 flex items-center justify-center">
                                    <div style={{ color: 'var(--color-primary)' }}>
                                      {getIconComponent(feature.iconName)}
                                    </div>
                                  </div>
                                </span>
                              </div>
                              
                              {/* Content */}
                              <div className="elementor-icon-box-content">
                                <h3 className="elementor-icon-box-title text-xl font-bold mb-3 group-hover:text-[var(--color-primary)] transition-colors duration-300"
                                  style={{ color: 'var(--color-text-primary)' }}>
                                  <span>
                                    {feature.title}
                                  </span>
                                </h3>
                                
                                <p className="elementor-icon-box-description leading-relaxed"
                                  style={{ color: 'var(--color-text-secondary)' }}>
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGridLayout; 
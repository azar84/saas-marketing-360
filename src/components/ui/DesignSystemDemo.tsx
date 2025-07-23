'use client';

import React from 'react';

const DesignSystemDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
        Design System Demo
      </h2>
      
      {/* Color Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Colors
        </h3>
        <div className="flex space-x-4">
          <div 
            className="w-16 h-16 rounded-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
            title="Primary Color"
          ></div>
          <div 
            className="w-16 h-16 rounded-lg"
            style={{ backgroundColor: 'var(--color-secondary)' }}
            title="Secondary Color"
          ></div>
          <div 
            className="w-16 h-16 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent)' }}
            title="Accent Color"
          ></div>
          <div 
            className="w-16 h-16 rounded-lg"
            style={{ backgroundColor: 'var(--color-success)' }}
            title="Success Color"
          ></div>
        </div>
      </div>

      {/* Button Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Buttons Using Design System
        </h3>
        <div className="flex space-x-4">
          <button
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderRadius: 'var(--border-radius-md)',
              border: 'none',
              boxShadow: 'var(--shadow-md)',
              fontFamily: 'var(--font-family-sans)',
              transition: `all var(--animation-normal)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }}
          >
            Primary Button
          </button>
          
          <button
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-primary)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderRadius: 'var(--border-radius-md)',
              border: `2px solid var(--color-primary)`,
              fontFamily: 'var(--font-family-sans)',
              transition: `all var(--animation-normal)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
          >
            Secondary Button
          </button>
        </div>
      </div>

      {/* Card Example */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Card Using Design System
        </h3>
        <div
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            padding: 'var(--spacing-xl)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: `1px solid var(--color-gray-light)`,
          }}
        >
          <h4 
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Dynamic Card
          </h4>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            This card automatically adapts to your design system changes.
            The colors, spacing, shadows, and typography all use CSS variables
            that are controlled by your admin panel.
          </p>
          <div className="mt-4 flex space-x-2">
            <span
              style={{
                backgroundColor: 'var(--color-success)',
                color: '#FFFFFF',
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--border-radius-full)',
                fontSize: '0.875rem',
              }}
            >
              Success
            </span>
            <span
              style={{
                backgroundColor: 'var(--color-warning)',
                color: '#FFFFFF',
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--border-radius-full)',
                fontSize: '0.875rem',
              }}
            >
              Warning
            </span>
          </div>
        </div>
      </div>

      {/* Typography Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Typography Scale
        </h3>
        <div className="space-y-2">
          <h1 
            className="text-4xl font-bold"
            style={{ 
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-family-sans)',
            }}
          >
            Heading 1 - Primary Color
          </h1>
          <h2 
            className="text-3xl font-semibold"
            style={{ 
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-sans)',
            }}
          >
            Heading 2 - Primary Text
          </h2>
          <p 
            style={{ 
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-base)',
              lineHeight: 'var(--line-height-base)',
              fontFamily: 'var(--font-family-sans)',
            }}
          >
            Body text using design system variables for font size, line height, and color.
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Secondary text with muted color from the design system.
          </p>
          <code 
            style={{ 
              fontFamily: 'var(--font-family-mono)',
              backgroundColor: 'var(--color-gray-light)',
              padding: 'var(--spacing-xs)',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--color-text-primary)',
            }}
          >
            Monospace text using design system variables
          </code>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemDemo; 

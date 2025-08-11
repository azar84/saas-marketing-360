import React from 'react';
import { cn } from '../../lib/utils';

export interface ActionGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  fullWidth?: boolean;
}

const ActionGroup = React.forwardRef<HTMLDivElement, ActionGroupProps>(
  ({ 
    children, 
    className,
    orientation = 'horizontal',
    spacing = 'md',
    align = 'center',
    justify = 'start',
    fullWidth = false,
    ...props 
  }, ref) => {
    const getSpacingClasses = () => {
      switch (spacing) {
        case 'sm':
          return orientation === 'horizontal' ? 'space-x-2' : 'space-y-2';
        case 'md':
          return orientation === 'horizontal' ? 'space-x-3' : 'space-y-3';
        case 'lg':
          return orientation === 'horizontal' ? 'space-x-4' : 'space-y-4';
        default:
          return orientation === 'horizontal' ? 'space-x-3' : 'space-y-3';
      }
    };

    const getAlignClasses = () => {
      switch (align) {
        case 'start':
          return orientation === 'horizontal' ? 'items-start' : 'justify-start';
        case 'center':
          return orientation === 'horizontal' ? 'items-center' : 'justify-center';
        case 'end':
          return orientation === 'horizontal' ? 'items-end' : 'justify-end';
        default:
          return orientation === 'horizontal' ? 'items-center' : 'justify-center';
      }
    };

    const getJustifyClasses = () => {
      switch (justify) {
        case 'start':
          return 'justify-start';
        case 'center':
          return 'justify-center';
        case 'end':
          return 'justify-end';
        case 'between':
          return 'justify-between';
        case 'around':
          return 'justify-around';
        default:
          return 'justify-start';
      }
    };

    const getOrientationClasses = () => {
      return orientation === 'horizontal' ? 'flex-row' : 'flex-col';
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          getOrientationClasses(),
          getSpacingClasses(),
          getAlignClasses(),
          getJustifyClasses(),
          fullWidth && 'w-full',
          className
        )}
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-4)',
          border: '1px solid var(--color-gray-light)',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ActionGroup.displayName = 'ActionGroup';

export { ActionGroup };

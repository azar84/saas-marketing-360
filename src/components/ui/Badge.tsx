'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default',
  {
    variants: {
      variant: {
        default: [
          'border-transparent text-white',
          'hover:opacity-90'
        ],
        secondary: 'border-transparent text-white hover:opacity-90',
        success: [
          'border-transparent text-white',
          'hover:opacity-90'
        ],
        warning: [
          'border-transparent text-white',
          'hover:opacity-90'
        ],
        destructive: [
          'border-transparent text-white',
          'hover:opacity-90'
        ],
        outline: 'text-white bg-transparent hover:opacity-90',
        gradient: [
          'border-transparent text-white',
          'hover:opacity-90'
        ],
      },
      size: {
        default: 'px-2.5 py-0.5',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
        icon: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, children, onRemove, ...props }, ref) => {
    // Get badge colors based on variant
    const getBadgeColors = () => {
      switch (variant) {
        case 'default':
          return {
            backgroundColor: 'var(--color-primary)',
            borderColor: 'var(--color-primary)',
            color: 'var(--color-bg-primary)'
          };
        case 'secondary':
          return {
            backgroundColor: 'var(--color-secondary)',
            borderColor: 'var(--color-secondary)',
            color: 'var(--color-bg-primary)'
          };
        case 'success':
          return {
            backgroundColor: 'var(--color-success)',
            borderColor: 'var(--color-success)',
            color: 'var(--color-bg-primary)'
          };
        case 'warning':
          return {
            backgroundColor: 'var(--color-warning)',
            borderColor: 'var(--color-warning)',
            color: 'var(--color-bg-primary)'
          };
        case 'destructive':
          return {
            backgroundColor: 'var(--color-error)',
            borderColor: 'var(--color-error)',
            color: 'var(--color-bg-primary)'
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            borderColor: 'var(--color-gray-light)',
            color: 'var(--color-text-primary)'
          };
        case 'gradient':
          return {
            background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
            borderColor: 'transparent',
            color: 'var(--color-bg-primary)'
          };
        default:
          return {
            backgroundColor: 'var(--color-primary)',
            borderColor: 'var(--color-primary)',
            color: 'var(--color-bg-primary)'
          };
      }
    };

    const badgeColors = getBadgeColors();

    return (
      <>
        {/* Inject dynamic styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .badge-default {
            background-color: var(--color-primary);
            border-color: var(--color-primary);
            color: var(--color-bg-primary);
          }
          .badge-secondary {
            background-color: var(--color-secondary);
            border-color: var(--color-secondary);
            color: var(--color-bg-primary);
          }
          .badge-success {
            background-color: var(--color-success);
            border-color: var(--color-success);
            color: var(--color-bg-primary);
          }
          .badge-warning {
            background-color: var(--color-warning);
            border-color: var(--color-warning);
            color: var(--color-bg-primary);
          }
          .badge-destructive {
            background-color: var(--color-error);
            border-color: var(--color-error);
            color: var(--color-bg-primary);
          }
          .badge-outline {
            background-color: transparent;
            border-color: var(--color-gray-light);
            color: var(--color-text-primary);
          }
          .badge-gradient {
            background: linear-gradient(to right, var(--color-primary), var(--color-accent));
            border-color: transparent;
            color: var(--color-bg-primary);
          }
        `}} />
        
        <div
          ref={ref}
          className={cn(badgeVariants({ variant, size, className }))}
          style={badgeColors}
          {...props}
        >
          {icon && (
            <span className="mr-1 flex-shrink-0">
              {icon}
            </span>
          )}
          {children}
          {onRemove && (
            <button
              onClick={onRemove}
              className="ml-1 flex-shrink-0 h-3 w-3 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
              aria-label="Remove"
            >
              <svg
                className="h-2 w-2"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L7 7M7 1L1 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants }; 

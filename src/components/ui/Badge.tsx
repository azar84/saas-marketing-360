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
          'border-transparent bg-[#5243E9] text-white',
          'hover:bg-[#4338CA]'
        ],
        secondary: 'border-transparent bg-[#E2E8F0] text-[#475569] hover:bg-[#CBD4E1]',
        success: [
          'border-transparent bg-[#10B981] text-white',
          'hover:bg-[#059669]'
        ],
        warning: [
          'border-transparent bg-[#F59E0B] text-white',
          'hover:bg-[#D97706]'
        ],
        destructive: [
          'border-transparent bg-[#EF4444] text-white',
          'hover:bg-[#DC2626]'
        ],
        outline: 'text-[#475569] border-[#E2E8F0] bg-transparent hover:bg-[#F6F8FC]',
        gradient: [
          'border-transparent bg-gradient-to-r from-[#5243E9] to-[#7C3AED] text-white',
          'hover:from-[#4338CA] hover:to-[#6D28D9]'
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
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
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
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants }; 

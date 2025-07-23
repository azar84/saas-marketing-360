'use client';

import React, { useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-[#E2E8F0] text-[#1E2A3B] focus-visible:ring-[#5243E9] focus-visible:border-[#5243E9]',
        filled: 'bg-[#F6F8FC] border-transparent text-[#1E2A3B] focus-visible:ring-[#5243E9] focus-visible:bg-white focus-visible:border-[#5243E9]',
        ghost: 'border-transparent text-[#1E2A3B] focus-visible:ring-[#5243E9] focus-visible:border-[#5243E9]',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-4 text-sm',
        lg: 'h-13 px-5 text-base',
      },
      hasError: {
        true: 'border-[#EF4444] focus-visible:ring-red-500 focus-visible:border-[#EF4444]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  description?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = 'text',
    label,
    error,
    leftIcon,
    rightIcon,
    description,
    id,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-[#1E2A3B] mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/4 text-[#64748B]">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant, size, hasError, className }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/4 text-[#64748B]">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || description) && (
          <div className="mt-2">
            {error && (
              <p className="text-sm text-[#EF4444] font-medium">
                {error}
              </p>
            )}
            {description && !error && (
              <p className="text-sm text-[#64748B]">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants }; 

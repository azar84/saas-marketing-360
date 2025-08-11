import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

const splitButtonVariants = cva(
  'inline-flex rounded-md shadow-sm whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        secondary: 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        accent: 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        destructive: 'focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2',
        success: 'focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2',
        info: 'focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2',
        outline: 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        ghost: 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface SplitButtonOption {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'success' | 'info';
}

export interface SplitButtonProps
  extends VariantProps<typeof splitButtonVariants> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mainAction: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
  };
  options: SplitButtonOption[];
  className?: string;
  fullWidth?: boolean;
  showDivider?: boolean;
  dropdownPosition?: 'bottom' | 'top';
  maxHeight?: string;
}

const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(
  ({ 
    className, 
    variant = 'primary',
    size = 'md',
    mainAction,
    options,
    fullWidth = false,
    showDivider = true,
    dropdownPosition = 'bottom',
    maxHeight = '200px',
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && 
          !buttonRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown when pressing Escape
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleOptionClick = (option: SplitButtonOption) => {
      if (!option.disabled) {
        option.onClick();
        setIsOpen(false);
      }
    };

    const getDropdownPositionClasses = () => {
      return dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1';
    };

    return (
      <div
        ref={ref}
        className={cn(
          splitButtonVariants({ variant, size, className }),
          fullWidth && 'w-full',
          'relative'
        )}
        {...props}
      >
        {/* Main Action Button */}
        <div ref={buttonRef} className="flex">
          <Button
            variant={variant}
            size={size}
            onClick={mainAction.onClick}
            disabled={mainAction.disabled}
            className={cn(
              'rounded-r-none',
              showDivider && 'border-r-0',
              fullWidth && 'flex-1'
            )}
            leftIcon={mainAction.icon}
          >
            {mainAction.label}
          </Button>
          
          {/* Dropdown Toggle Button */}
          <Button
            variant={variant}
            size={size}
            onClick={() => setIsOpen(!isOpen)}
            disabled={mainAction.disabled}
            className={cn(
              'rounded-l-none border-l-0',
              'px-2', // Smaller padding for dropdown arrow
              'focus:z-10' // Ensure focus ring appears above other elements
            )}
            aria-label="Open dropdown menu"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <ChevronDown 
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isOpen && 'rotate-180'
              )} 
            />
          </Button>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              'absolute z-50 min-w-[200px] rounded-md shadow-lg',
              getDropdownPositionClasses(),
              'left-0 right-0'
            )}
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-gray-light)',
              maxHeight,
              overflowY: 'auto',
            }}
          >
            <div className="py-1">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  disabled={option.disabled}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm transition-colors duration-150',
                    'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    option.variant === 'destructive' && 'text-red-600 hover:bg-red-50',
                    option.variant === 'success' && 'text-green-600 hover:bg-green-50',
                    option.variant === 'info' && 'text-blue-600 hover:bg-blue-50',
                  )}
                  style={{
                    color: option.disabled 
                      ? 'var(--color-text-muted)' 
                      : option.variant === 'destructive'
                      ? 'var(--color-error)'
                      : option.variant === 'success'
                      ? 'var(--color-success)'
                      : option.variant === 'info'
                      ? 'var(--color-info)'
                      : 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                  }}
                >
                  <div className="flex items-center">
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SplitButton.displayName = 'SplitButton';

export { SplitButton, splitButtonVariants };

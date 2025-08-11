import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const progressButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: [
          'btn-primary focus-visible:ring-blue-500'
        ],
        secondary: [
          'btn-secondary focus-visible:ring-blue-500'
        ],
        accent: [
          'btn-accent focus-visible:ring-blue-500'
        ],
        ghost: [
          'btn-ghost focus-visible:ring-blue-500'
        ],
        destructive: [
          'btn-destructive focus-visible:ring-red-500'
        ],
        success: [
          'btn-success focus-visible:ring-green-500'
        ],
        info: [
          'btn-info focus-visible:ring-blue-400'
        ],
        outline: [
          'btn-outline focus-visible:ring-blue-500'
        ],
        muted: [
          'btn-muted'
        ],
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
        xl: 'h-14 px-8',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ProgressButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof progressButtonVariants> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  progress?: number; // 0-100
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  showProgressBar?: boolean;
  progressBarColor?: string;
}

const ProgressButton = React.forwardRef<HTMLButtonElement, ProgressButtonProps>(
  ({ 
    className, 
    variant = 'primary',
    size = 'md',
    fullWidth,
    progress = 0,
    isLoading = false, 
    loadingText,
    disabled,
    leftIcon, 
    rightIcon, 
    children,
    showProgressBar = true,
    progressBarColor,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading || variant === 'muted';

    // Get typography styles from design system
    const getTypographyStyles = () => {
      return {
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-medium)',
        fontFamily: 'var(--font-family-sans)',
      };
    };

    // Get size styles
    const getSizeStyles = () => {
      const baseSize = 16; // Assuming 16px base
      switch (size) {
        case 'sm':
          return { fontSize: `${baseSize * 0.875}px` };
        case 'md':
          return { fontSize: 'var(--font-size-base)' };
        case 'lg':
          return { fontSize: `${baseSize * 1.125}px` };
        case 'xl':
          return { fontSize: `${baseSize * 1.25}px` };
        default:
          return { fontSize: 'var(--font-size-base)' };
      }
    };

    const combinedStyles = {
      ...getTypographyStyles(),
      ...getSizeStyles(),
      ...props.style
    };

    // Get progress bar color based on variant or custom color
    const getProgressBarColor = () => {
      if (progressBarColor) return progressBarColor;
      
      switch (variant) {
        case 'primary':
          return 'var(--color-primary-dark)';
        case 'secondary':
          return 'var(--color-secondary-dark)';
        case 'accent':
          return 'var(--color-accent-dark)';
        case 'success':
          return 'var(--color-success-dark)';
        case 'destructive':
          return 'var(--color-error-dark)';
        case 'info':
          return 'var(--color-info-dark)';
        default:
          return 'var(--color-primary-dark)';
      }
    };

    return (
      <>
        {/* Inject dynamic styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .btn-primary {
            background-color: var(--color-primary);
            color: var(--color-bg-primary);
            border: none;
          }
          .btn-primary:hover {
            background-color: var(--color-primary-dark);
          }
          .btn-secondary {
            background-color: var(--color-secondary);
            color: var(--color-bg-primary);
            border: none;
          }
          .btn-secondary:hover {
            background-color: var(--color-secondary-dark);
          }
          .btn-accent {
            background-color: var(--color-accent);
            color: var(--color-bg-primary);
            border: none;
          }
          .btn-accent:hover {
            background-color: var(--color-accent-dark);
          }
          .btn-ghost {
            background-color: transparent;
            color: var(--color-text-primary);
            border: none;
          }
          .btn-ghost:hover {
            background-color: var(--color-bg-secondary);
          }
          .btn-destructive {
            background-color: var(--color-error);
            color: var(--color-bg-primary);
            border: none;
          }
          .btn-destructive:hover {
            background-color: var(--color-error-dark);
          }
          .btn-success {
            background-color: var(--color-success);
            color: var(--color-bg-primary);
            border: none;
          }
          .btn-success:hover {
            background-color: var(--color-success-dark);
          }
          .btn-info {
            background-color: var(--color-info);
            color: var(--color-bg-primary);
            border: none;
          }
          .btn-info:hover {
            background-color: var(--color-info-dark);
          }
          .btn-outline {
            background-color: transparent;
            color: var(--color-text-primary);
            border: 1px solid var(--color-gray-light);
          }
          .btn-outline:hover {
            background-color: var(--color-bg-secondary);
          }
          .btn-muted {
            background-color: var(--color-gray-light);
            color: var(--color-text-muted);
            border: none;
            cursor: not-allowed;
          }
        `}} />
        
        <button
          className={cn(progressButtonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          disabled={isDisabled}
          style={combinedStyles}
          {...props}
        >
          {/* Progress Bar Overlay */}
          {showProgressBar && progress > 0 && (
            <div 
              className="absolute inset-0 transition-all duration-300 ease-out"
              style={{
                backgroundColor: getProgressBarColor(),
                width: `${progress}%`,
                opacity: 0.3,
              }}
            />
          )}
          
          {/* Content */}
          <div className="relative z-10 flex items-center">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {isLoading && loadingText ? loadingText : children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
          </div>
        </button>
      </>
    );
  }
);

ProgressButton.displayName = 'ProgressButton';

export { ProgressButton, progressButtonVariants };

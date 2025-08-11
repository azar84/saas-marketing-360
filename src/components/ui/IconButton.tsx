import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
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
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    className, 
    variant = 'ghost',
    size = 'md',
    disabled,
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || variant === 'muted';

    // Get typography styles from design system
    const getTypographyStyles = () => {
      return {
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-medium)',
        fontFamily: 'var(--font-family-sans)',
      };
    };

    // Get size styles for icon sizing
    const getIconSizeStyles = () => {
      switch (size) {
        case 'sm':
          return { fontSize: '14px' };
        case 'md':
          return { fontSize: '16px' };
        case 'lg':
          return { fontSize: '20px' };
        case 'xl':
          return { fontSize: '24px' };
        default:
          return { fontSize: '16px' };
      }
    };

    const combinedStyles = {
      ...getTypographyStyles(),
      ...getIconSizeStyles(),
      ...props.style
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
          className={cn(iconButtonVariants({ variant, size, className }))}
          ref={ref}
          disabled={isDisabled}
          style={combinedStyles}
          {...props}
        >
          {children}
        </button>
      </>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const fabVariants = cva(
  'fixed rounded-full shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95 whitespace-nowrap',
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
        success: [
          'btn-success focus-visible:ring-green-500'
        ],
        info: [
          'btn-info focus-visible:ring-blue-400'
        ],
      },
      size: {
        sm: 'h-12 w-12',
        md: 'h-14 w-14',
        lg: 'h-16 w-16',
        xl: 'h-20 w-20',
      },
      position: {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6',
        'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
        'top-center': 'top-6 left-1/2 transform -translate-x-1/2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      position: 'bottom-right',
    },
  }
);

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'info';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center' | 'top-center';
  children: React.ReactNode;
  className?: string;
  tooltip?: string;
  showTooltip?: boolean;
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ 
    className, 
    variant = 'primary',
    size = 'md',
    position = 'bottom-right',
    disabled,
    children, 
    tooltip,
    showTooltip = false,
    ...props 
  }, ref) => {
    const isDisabled = disabled;

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
          return { fontSize: '18px' };
        case 'md':
          return { fontSize: '20px' };
        case 'lg':
          return { fontSize: '24px' };
        case 'xl':
          return { fontSize: '28px' };
        default:
          return { fontSize: '20px' };
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
        `}} />
        
        <div className="relative group">
          <button
            className={cn(fabVariants({ variant, size, position, className }))}
            ref={ref}
            disabled={isDisabled}
            style={combinedStyles}
            {...props}
          >
            {children}
          </button>
          
          {/* Tooltip */}
          {tooltip && showTooltip && (
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div 
                className="px-2 py-1 text-sm rounded text-white whitespace-nowrap"
                style={{ 
                  backgroundColor: 'var(--color-gray-dark)',
                  color: 'var(--color-bg-primary)',
                  transform: position.includes('right') ? 'translateX(-100%)' : 'translateX(0)',
                  marginRight: position.includes('right') ? '8px' : '0',
                  marginLeft: position.includes('left') ? '8px' : '0',
                }}
              >
                {tooltip}
                {/* Tooltip arrow */}
                <div 
                  className="absolute w-0 h-0 border-4 border-transparent"
                  style={{
                    borderLeftColor: position.includes('right') ? 'var(--color-gray-dark)' : 'transparent',
                    borderRightColor: position.includes('left') ? 'var(--color-gray-dark)' : 'transparent',
                    left: position.includes('right') ? '100%' : 'auto',
                    right: position.includes('left') ? '100%' : 'auto',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

export { FloatingActionButton, fabVariants };

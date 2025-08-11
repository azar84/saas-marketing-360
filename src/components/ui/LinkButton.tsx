import React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { ExternalLink, ArrowRight } from 'lucide-react';

const linkButtonVariants = cva(
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

export interface LinkButtonProps
  extends VariantProps<typeof linkButtonVariants> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  href: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showArrow?: boolean;
  style?: React.CSSProperties;
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ 
    className, 
    variant = 'primary',
    size = 'md',
    fullWidth,
    href,
    external = false,
    children, 
    leftIcon,
    rightIcon,
    showArrow = false,
    style,
    ...props 
  }, ref) => {
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
      ...(style || {})
    };

    const content = (
      <>
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
        {showArrow && <ArrowRight className="ml-2 h-4 w-4" />}
        {external && <ExternalLink className="ml-2 h-4 w-4" />}
      </>
    );

    if (external) {
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
          
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(linkButtonVariants({ variant, size, fullWidth, className }))}
            ref={ref}
            style={combinedStyles}
            {...props}
          >
            {content}
          </a>
        </>
      );
    }

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
        
        <Link
          href={href}
          className={cn(linkButtonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          style={combinedStyles}
          {...props}
        >
          {content}
        </Link>
      </>
    );
  }
);

LinkButton.displayName = 'LinkButton';

export { LinkButton, linkButtonVariants };

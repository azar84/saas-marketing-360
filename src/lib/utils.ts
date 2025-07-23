import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers with abbreviations (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Debounce function for search and form inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(elementId: string, offset = 0): void {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Generate random ID for components
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Format date for blog posts and testimonials
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * Get contrast ratio for accessibility
 */
export function getContrastRatio(color1: string, color2: string): number {
  // This is a simplified version - in production, you'd want a more robust implementation
  return 4.5; // Placeholder
}

/**
 * Animation easing functions
 */
export const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

/**
 * Animation variants for Framer Motion
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easing.easeOut }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: easing.easeOut }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: easing.easeOut }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: easing.easeOut }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * SEO meta tag generator
 */
export function generateMetaTags({
  title,
  description,
  image,
  url,
  type = 'website'
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type,
      url,
      images: image ? [{ url: image }] : [],
      siteName: 'Saski AI',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
      creator: '@saskiai',
    },
  };
}

export const siteConfig = {
  siteName: 'AI Assistant',
  description: 'Transform your customer communication with AI-powered automation',
  url: 'https://example.com',
  ogImage: 'https://example.com/og.jpg',
  creator: '@ai_assistant',
  keywords: ['AI', 'customer support', 'automation', 'chatbot', 'communication']
} as const;

/**
 * Determines if a color is considered "dark" based on its luminance
 * @param color - Hex color string (e.g., "#FFFFFF" or "#000000")
 * @returns true if the color is dark, false if light
 */
export function isColorDark(color: string): boolean {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using the relative luminance formula
  // https://www.w3.org/WAI/GL/wiki/Relative_luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If luminance is less than 0.5, consider it dark
  return luminance < 0.5;
}

/**
 * Intelligently selects the appropriate logo based on background color
 * @param siteSettings - Site settings object containing logo URLs
 * @param backgroundColor - Background color to check against (hex format)
 * @returns The appropriate logo URL or null if no logo available
 */
export function getAppropriateLogoUrl(
  siteSettings: {
    logoLightUrl?: string | null;
    logoDarkUrl?: string | null;
    logoUrl?: string | null;
  },
  backgroundColor: string = '#FFFFFF'
): string | null {
  // If background is dark, use light logo
  if (isColorDark(backgroundColor)) {
    if (siteSettings.logoLightUrl) {
      return siteSettings.logoLightUrl;
    }
  } else {
    // If background is light, use dark logo
    if (siteSettings.logoDarkUrl) {
      return siteSettings.logoDarkUrl;
    }
  }
  
  // Fallback to legacy logo if specific logo not available
  if (siteSettings.logoUrl) {
    return siteSettings.logoUrl;
  }
  
  // No logo available
  return null;
}

/**
 * Get the base URL for server-side API calls
 * Uses environment variables with fallbacks for different environments
 */
export function getBaseUrl(): string {
  // In production (Vercel), use VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Use BASE_URL environment variable if set
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  // Fallback for local development
  return 'http://localhost:3000';
} 

// CTA JavaScript Events Utility
export interface CTAWithEvents {
  id: number;
  text: string;
  url: string;
  customId?: string;
  icon?: string;
  style: string;
  target: string;
  isActive: boolean;
  onClickEvent?: string;
  onHoverEvent?: string;
  onMouseOutEvent?: string;
  onFocusEvent?: string;
  onBlurEvent?: string;
  onKeyDownEvent?: string;
  onKeyUpEvent?: string;
  onTouchStartEvent?: string;
  onTouchEndEvent?: string;
}

export const applyCTAEvents = (cta: CTAWithEvents) => {
  const events: { [key: string]: string } = {};
  
  if (cta.onClickEvent) events.onClick = cta.onClickEvent;
  if (cta.onHoverEvent) events.onMouseOver = cta.onHoverEvent;
  if (cta.onMouseOutEvent) events.onMouseOut = cta.onMouseOutEvent;
  if (cta.onFocusEvent) events.onFocus = cta.onFocusEvent;
  if (cta.onBlurEvent) events.onBlur = cta.onBlurEvent;
  if (cta.onKeyDownEvent) events.onKeyDown = cta.onKeyDownEvent;
  if (cta.onKeyUpEvent) events.onKeyUp = cta.onKeyUpEvent;
  if (cta.onTouchStartEvent) events.onTouchStart = cta.onTouchStartEvent;
  if (cta.onTouchEndEvent) events.onTouchEnd = cta.onTouchEndEvent;
  
  return events;
};

export const hasCTAEvents = (cta: CTAWithEvents): boolean => {
  return !!(cta.onClickEvent || cta.onHoverEvent || cta.onMouseOutEvent || 
           cta.onFocusEvent || cta.onBlurEvent || cta.onKeyDownEvent || 
           cta.onKeyUpEvent || cta.onTouchStartEvent || cta.onTouchEndEvent);
};

// Enhanced CTA event execution with support for both legacy and new event systems
export const executeCTAEvent = (eventCode: string, event: React.SyntheticEvent, element: HTMLElement) => {
  try {
    // Check if the event code calls any global functions that might not be loaded yet
    const globalFunctionCalls = eventCode.match(/(\w+)\(/g);
    if (globalFunctionCalls) {
      const functionNames = globalFunctionCalls.map(call => call.replace('(', ''));
      
      // Check if any of these functions are not defined
      const undefinedFunctions = functionNames.filter(funcName => typeof (window as any)[funcName] !== 'function');
      
      if (undefinedFunctions.length > 0) {
        // Wait for scripts to load and retry
        setTimeout(() => {
          try {
            executeEventCode(eventCode, event, element);
          } catch (retryError) {
            console.error('CTA event execution error after retry:', retryError);
            console.error('Functions not found:', undefinedFunctions);
          }
        }, 500); // Wait 500ms for scripts to load
        return;
      }
    }

    executeEventCode(eventCode, event, element);
  } catch (error) {
    console.error('CTA event execution error:', error);
  }
};

// Helper function to execute event code
const executeEventCode = (eventCode: string, event: React.SyntheticEvent, element: HTMLElement) => {
  // Create a context object with element properties
  const context = {
    style: element.style,
    textContent: element.textContent,
    id: element.id,
    className: element.className,
    innerHTML: element.innerHTML,
    outerHTML: element.outerHTML,
    tagName: element.tagName,
    // Add any other commonly used properties
  };
  
  // Execute the event code with the context
  const executeWithContext = new Function('context', 'event', `
    const { style, textContent, id, className, innerHTML, outerHTML, tagName } = context;
    ${eventCode}
  `);
  
  executeWithContext(context, event.nativeEvent);
};

// New function to execute CTA events from the enhanced event system
export const executeCTAEventFromConfig = (events: any[], eventType: string, event: React.SyntheticEvent, element: HTMLElement) => {
  try {
    if (!events || !Array.isArray(events)) return;
    
    // Find events that match the current event type
    const matchingEvents = events.filter(eventConfig => eventConfig.eventType === eventType);
    
    matchingEvents.forEach(eventConfig => {
      if (eventConfig.functionName) {
        // Extract function name and parameters from the function call string
        const functionCall = eventConfig.functionName;
        const functionMatch = functionCall.match(/^(\w+)\s*\(([^)]*)\)$/);
        
        if (functionMatch) {
          const [, functionName, paramsString] = functionMatch;
          
          // Check if the function exists globally
          if (typeof (window as any)[functionName] === 'function') {
            try {
              // Parse parameters (handle strings, numbers, etc.)
              let params: any[] = [];
              if (paramsString.trim()) {
                // Simple parameter parsing - handle strings and numbers
                const paramMatches = paramsString.match(/'([^']*)'|"([^"]*)"|(\d+)/g);
                if (paramMatches) {
                  params = paramMatches.map((param: string) => {
                    // Remove quotes if it's a string
                    if (param.startsWith("'") || param.startsWith('"')) {
                      return param.slice(1, -1);
                    }
                    // Convert to number if it's numeric
                    return isNaN(Number(param)) ? param : Number(param);
                  });
                }
              }
              
              // Call the global function with parameters
              (window as any)[functionName](...params);
              console.log(`✅ Executed CTA function: ${functionName}(${params.join(', ')})`);
            } catch (error) {
              console.error(`Error executing CTA function ${functionName}:`, error);
            }
          } else {
            console.warn(`Function ${functionName} is not defined globally`);
            console.log('Available global functions:', Object.keys(window).filter(key => typeof (window as any)[key] === 'function'));
          }
        } else {
          console.warn(`Invalid function call format: ${functionCall}`);
        }
      }
    });
  } catch (error) {
    console.error('Error executing CTA events from config:', error);
  }
}; 
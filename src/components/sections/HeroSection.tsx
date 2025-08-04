'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Advanced client-only component for animated HTML content
const ClientOnlyHTML: React.FC<{ htmlContent: string; fallback: React.ReactNode }> = ({ htmlContent, fallback }) => {
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && containerRef.current && htmlContent) {
      try {
        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Extract styles and scripts
        const styles = tempDiv.querySelectorAll('style');
        const scripts = tempDiv.querySelectorAll('script');
        
        // Remove styles and scripts from the content
        styles.forEach(style => style.remove());
        scripts.forEach(script => script.remove());
        
        // Set the HTML content without styles and scripts
        containerRef.current.innerHTML = tempDiv.innerHTML;
        
        // Add styles to document head
        styles.forEach((style, index) => {
          const newStyle = document.createElement('style');
          newStyle.textContent = style.textContent || '';
          document.head.appendChild(newStyle);
        });
        
        // Execute scripts
        scripts.forEach((script, index) => {
          const newScript = document.createElement('script');
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent || '';
          }
          document.head.appendChild(newScript);
        });
        
        // Cleanup function
        return () => {
          // Remove added styles and scripts
          styles.forEach(() => {
            const addedStyles = document.head.querySelectorAll('style');
            if (addedStyles.length > 0) {
              document.head.removeChild(addedStyles[addedStyles.length - 1]);
            }
          });
          scripts.forEach(() => {
            const addedScripts = document.head.querySelectorAll('script');
            if (addedScripts.length > 0) {
              document.head.removeChild(addedScripts[addedScripts.length - 1]);
            }
          });
        };
      } catch (error) {
        console.error('Error processing animated HTML:', error);
        // Fallback to simple innerHTML
        containerRef.current.innerHTML = htmlContent;
      }
    }
  }, [isClient, htmlContent]);

  if (!isClient) {
    return <>{fallback}</>;
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full"
      suppressHydrationWarning={true}
    />
  );
};
import { 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Sparkles,
  MessageSquare,
  Zap,
  Mail,
  Star,
  Users,
  Globe,
  Shield,
  TrendingUp,
  Layers,
  Award,
  Clock,
  Send,
  User,
  Code,
  Timer,
  CheckCircle2,
  Heart,
  Download,
  ExternalLink,
  Phone,
  Video,
  Calendar,
  BookOpen,
  Gift,
  Rocket
} from 'lucide-react';
import { renderIcon } from '@/lib/iconUtils';
import { Button, Input } from '@/components/ui';
import { applyCTAEvents, hasCTAEvents, executeCTAEvent, executeCTAEventFromConfig, cn, type CTAWithEvents } from '@/lib/utils';

// AI Assistant Avatar Component
const AIAvatar = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full shadow-sm ring-2 ring-white/20`}>
      <svg
        viewBox="0 0 190 226"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-2/3 h-2/3"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M91.5832 1.23942C88.5555 2.5755 86.5522 4.82055 85.683 7.85216C84.6292 11.5256 85.5645 14.3846 88.9142 17.7344C91.9188 20.7389 91.9808 20.9195 91.9808 26.6741V32.5472L87.4755 33.1095C72.6228 34.9657 58.4915 41.4798 47.445 51.5624C43.4153 55.2406 42.6861 55.5897 38.1864 55.989C25.7649 57.0912 14.2214 67.2414 12.0487 78.9726C11.6399 81.1763 10.6871 82.4647 8.07781 84.3384C5.91544 85.8915 3.88191 88.3346 2.58401 90.9392C0.692835 94.7335 0.523438 95.9033 0.523438 105.138C0.523438 110.673 0.930622 116.418 1.42847 117.906C2.67865 121.639 5.81921 125.671 8.88661 127.482C10.9162 128.678 11.5723 129.7 11.9898 132.311C13.2448 140.158 20.2393 149.104 27.9543 152.731C33.8449 155.5 37.6392 155.959 54.8014 155.98L71.3035 155.999V157.864C71.3035 158.89 71.9302 160.265 72.6952 160.922C74.8162 162.741 94.3356 174.29 95.2884 174.29C96.2562 174.29 112.597 164.643 116.436 161.805C118.087 160.584 119.02 159.213 119.02 158.011V156.127L137.511 155.833C154.545 155.561 156.364 155.394 160.611 153.709C168.857 150.438 176.849 140.733 178.374 132.14C178.737 130.089 179.73 128.729 182.147 126.97C184.152 125.511 186.276 122.907 187.613 120.267C189.669 116.209 189.8 115.322 189.8 105.512C189.8 95.8119 189.652 94.7756 187.69 90.839C186.333 88.1167 184.369 85.7516 182.192 84.2167C179.626 82.4082 178.674 81.1302 178.265 78.9511C176.075 67.274 164.525 57.1024 152.184 55.9834C147.576 55.5659 146.919 55.2382 141.729 50.7711C134.213 44.3023 127.971 40.3879 120.725 37.5973C114.599 35.2385 104.107 32.7302 100.365 32.7302C98.3701 32.7302 98.343 32.6459 98.343 26.4594C98.343 20.6164 98.4814 20.0979 100.369 18.8613C102.917 17.192 105.493 13.0318 105.497 10.5824C105.503 7.03224 103.112 3.44473 99.6083 1.74919C95.717 -0.134831 94.8231 -0.191289 91.5832 1.23942ZM35.9135 65.2532C30.3544 66.6807 25.263 70.8703 22.2839 76.4706C20.9248 79.0259 20.8031 81.4396 20.8031 105.896C20.8031 131.677 20.8588 132.641 22.5193 135.719C24.5282 139.441 27.6433 142.5 31.5394 144.575C34.1718 145.977 37.5135 146.07 93.1005 146.276C157.898 146.517 157.018 146.576 162.983 141.634C164.635 140.265 166.783 137.658 167.754 135.841C169.475 132.623 169.521 131.874 169.521 106.691C169.521 86.8316 169.269 80.1297 168.43 77.7582C166.947 73.5591 162.316 68.6109 157.989 66.6012C154.472 64.9677 153.41 64.9367 96.3548 64.7903C64.4243 64.7076 37.2257 64.9168 35.9135 65.2532ZM51.8191 79.1603C46.5607 80.8455 44.007 82.4901 40.0076 86.7656C33.6994 93.5095 31.4169 101.151 33.1586 109.695C35.0856 119.153 41.8256 127.338 50.2969 130.507C54.4936 132.078 56.2504 132.14 95.8602 132.14H131.608C135.192 132.14 138.727 131.306 141.933 129.704V129.704C147.355 126.995 152.076 122.161 154.923 116.406C156.49 113.238 156.78 111.421 156.787 104.703C156.794 97.618 156.564 96.3129 154.68 92.7421C152.25 88.1382 146.976 82.9792 141.963 80.3047V80.3047C139.692 79.0925 137.159 78.4537 134.584 78.4439L96.7525 78.2998C64.6104 78.1765 54.2678 78.3745 51.8191 79.1603ZM59.014 95.6313C53.4391 100.526 53.4192 108.471 58.9726 112.707C62.5625 115.445 67.0455 116.025 70.8104 114.239C78.3465 110.662 79.5895 101.194 73.2527 95.6298C70.8589 93.5278 69.8266 93.1715 66.1341 93.1715C62.4409 93.1715 61.4094 93.5278 59.014 95.6313ZM119.816 93.7314C117.369 94.6213 114.197 98.3623 113.41 101.285C112.344 105.246 113.625 110.062 116.306 112.17C123.401 117.751 132.465 115.217 134.939 106.962C136.919 100.354 131.241 93.1047 124.19 93.2376C122.44 93.2702 120.472 93.4928 119.816 93.7314Z"
          fill="white"
        />
        <path
          d="M77.3506 205.535L85.022 174.485C85.2639 173.505 86.3449 172.996 87.2544 173.432L94.7438 177.027C95.1789 177.236 95.6853 177.236 96.1204 177.027L103.59 173.442C104.506 173.002 105.593 173.523 105.826 174.512L113.131 205.555C113.253 206.074 113.107 206.619 112.743 207.007L96.5798 224.248C95.9561 224.913 94.902 224.919 94.271 224.261L77.7464 207.017C77.3692 206.624 77.2199 206.065 77.3506 205.535Z"
          fill="white"
        />
      </svg>
    </div>
  );
};

// Refined particle animation - more subtle
const Particle = ({ delay = 0 }: { delay?: number }) => {
  // Use delay to create deterministic but varied positions
  const seedValue = delay * 1000; // Convert to integer for seed
  const leftPosition = (seedValue * 37 + 123) % 100; // Deterministic "random" position
  const xMovement1 = ((seedValue * 17 + 456) % 20) - 10;
  const xMovement2 = ((seedValue * 23 + 789) % 40) - 20;
  const repeatDelay = ((seedValue * 13 + 321) % 6000) / 1000;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.4, 0],
        scale: [0, 1, 0],
        y: [0, -100, -200],
        x: [0, xMovement1, xMovement2]
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        repeatDelay
      }}
      className="absolute w-1 h-1 bg-gradient-to-r from-[var(--color-primary)]/40 to-[var(--color-primary-light)]/30 rounded-full blur-[0.5px]"
      style={{
        left: `${leftPosition}%`,
        bottom: '0%'
      }}
    />
  );
};

// Typing animation hook
const useTypingAnimation = (text: string, speed: number = 40) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
};

// Add this type at the top of the file (or near other types/interfaces)
type ConversationStep = {
  type: string;
  message?: string;
  delay: number;
};

interface HeroSectionProps {
  heroData?: any;
}

const HeroSection: React.FC<HeroSectionProps> = ({ heroData: propHeroData }) => {
  const [currentConversationStep, setCurrentConversationStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const heroRef = useRef<HTMLElement>(null);



  // Use server-side data if provided, otherwise use default fallback
  const heroData = propHeroData || {
    heading: 'Automate Conversations, Capture Leads, Serve Customers — All Without Code',
    subheading: 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.',
    primaryCtaId: null,
    primaryCta: null,
    secondaryCtaId: null,
    secondaryCta: null,
    trustIndicators: [
      { iconName: 'Shield', text: '99.9% Uptime', isVisible: true },
      { iconName: 'Clock', text: '24/7 Support', isVisible: true },
      { iconName: 'Code', text: 'No Code Required', isVisible: true }
    ]
  };

  // Ensure trustIndicators is always an array and filter visible ones
  const visibleTrustIndicators = (heroData.trustIndicators || []).filter((indicator: any) => indicator.isVisible);

  // Smart color calculation based on background color
  const getTextColor = () => {
    // Use custom heading color if available, otherwise use default
    if (heroData?.headingColor) {
      return { color: heroData.headingColor };
    }
    // Default heading color (same as API default)
    return { color: '#1F2937' };
  };

  // Get secondary text color based on design system
  const getSecondaryTextColor = () => {
    // Use custom subheading color if available, otherwise use default
    if (heroData?.subheadingColor) {
      return { color: heroData.subheadingColor };
    }
    // Default subheading color (same as API default)
    return { color: '#6B7280' };
  };

  // Get trust indicator colors based on design system
  const getTrustIndicatorColors = () => {
    // Use custom trust indicator colors if available, otherwise use defaults
    const textColor = heroData?.trustIndicatorTextColor ? 
      { color: heroData.trustIndicatorTextColor } : 
      { color: '#6B7280' }; // Default text color (same as API default)
    
    const backgroundColor = heroData?.trustIndicatorBackgroundColor ? 
      { backgroundColor: heroData.trustIndicatorBackgroundColor } : 
      { backgroundColor: '#F9FAFB' }; // Default background color (same as API default)
    
    return {
      text: textColor,
      background: backgroundColor,
      border: { borderColor: 'var(--color-gray-light)' },
      icon: { color: 'var(--color-primary)' }
    };
  };

  // Get layout classes based on layoutType and mediaPosition
  const getLayoutClasses = () => {
    const layoutType = heroData?.layoutType || 'split';
    const mediaPosition = heroData?.mediaPosition || 'right';
    
    switch (layoutType) {
      case 'centered':
        return 'text-center max-w-5xl mx-auto';
      case 'overlay':
        return 'relative z-10';
      case 'split':
      default:
        const isMediaLeft = mediaPosition === 'left';
        return `grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${isMediaLeft ? 'lg:flex-row-reverse' : ''}`;
    }
  };

  // Get text content classes based on layout
  const getTextContentClasses = () => {
    const layoutType = heroData?.layoutType || 'split';
    const mediaPosition = heroData?.mediaPosition || 'right';
    
    switch (layoutType) {
      case 'centered':
        return 'text-center max-w-4xl mx-auto';
      case 'overlay':
        return 'text-center max-w-4xl mx-auto';
      case 'split':
      default:
        const isMediaLeft = mediaPosition === 'left';
        return `${isMediaLeft ? 'lg:order-2' : ''}`;
    }
  };

  // Get animation direction based on media position
  const getTextAnimationDirection = () => {
    const mediaPosition = heroData?.mediaPosition || 'right';
    return mediaPosition === 'left' ? 50 : -50;
  };

  // Get media size classes based on mediaSize setting
  const getMediaSizeClasses = () => {
    const mediaSize = heroData?.mediaSize || 'full';
    
    switch (mediaSize) {
      case 'full':
        return 'w-full h-full';
      case 'original':
        return 'w-full h-full';
      case 'contained':
        return 'w-full h-full object-contain';
      case 'small':
        return 'w-full h-[15vh] object-contain';
      case 'medium':
        return 'w-full h-[25vh] object-contain';
      case 'large':
        return 'w-full max-w-4xl h-auto object-contain';
      default:
        return 'w-full h-full';
    }
  };

  // Get media container classes based on layout and size
  const getMediaContainerClasses = () => {
    const layoutType = heroData?.layoutType || 'split';
    const mediaSize = heroData?.mediaSize || 'full';
    
    // For overlay mode, always center the media regardless of size
    if (layoutType === 'overlay') {
      return 'w-full h-full flex items-center justify-center';
    }
    
    // For other layouts, use the size classes with centering
    return `${getMediaSizeClasses()} flex items-center justify-center`;
  };

  // Get media content classes for the actual media elements (video, image, etc.)
  const getMediaContentClasses = () => {
    const layoutType = heroData?.layoutType || 'split';
    const mediaSize = heroData?.mediaSize || 'full';
    
    // For overlay mode, use the size classes but ensure it fits in the centered container
    if (layoutType === 'overlay') {
      switch (mediaSize) {
        case 'small':
          return 'w-[400px] h-[300px] object-cover';
        case 'medium':
          return 'w-[600px] h-[450px] object-cover';
        case 'large':
          return 'w-full max-w-4xl h-auto object-cover';
        case 'original':
          return 'w-full aspect-[3/2] object-contain';
        case 'contained':
          return 'w-full h-full object-contain';
        case 'full':
        default:
          return 'w-full h-full object-cover';
      }
    }
    
    // For other layouts, use the size classes to ensure proper sizing
    switch (mediaSize) {
      case 'small':
        return 'w-[300px] h-[200px] object-cover mx-auto';
      case 'medium':
        return 'w-[500px] h-[350px] object-cover mx-auto';
      case 'large':
        return 'w-[800px] h-[600px] object-cover mx-auto';
      case 'original':
        return 'w-full aspect-[3/2] object-contain mx-auto';
      case 'contained':
        return 'w-full h-full object-contain mx-auto';
      case 'full':
      default:
        return 'w-full h-full object-cover mx-auto';
    }
  };

  // Get hero height classes
  const getHeroHeightClasses = () => {
    const heroHeight = heroData?.heroHeight || 'auto';
    
    switch (heroHeight) {
      case 'auto':
        return 'min-h-[400px] sm:min-h-[500px]';
      case '50vh':
        return 'min-h-[400px] sm:h-[50vh]';
      case '60vh':
        return 'min-h-[400px] sm:h-[60vh]';
      case '70vh':
        return 'min-h-[400px] sm:h-[70vh]';
      case '80vh':
        return 'min-h-[400px] sm:h-[80vh]';
      case '90vh':
        return 'min-h-[400px] sm:h-[90vh]';
      case '100vh':
        return 'min-h-[400px] sm:h-screen';
      case '400px':
        return 'min-h-[400px]';
      case '500px':
        return 'min-h-[400px] sm:h-[500px]';
      case '600px':
        return 'min-h-[400px] sm:h-[600px]';
      case '700px':
        return 'min-h-[400px] sm:h-[700px]';
      case '800px':
        return 'min-h-[400px] sm:h-[800px]';
      default:
        return 'min-h-[400px] sm:min-h-[500px]';
    }
  };

  // Get line spacing styles
  const getLineSpacingClasses = () => {
    const lineSpacing = heroData?.lineSpacing || '4';
    
    // Map numeric values to predefined Tailwind classes
    if (!isNaN(parseInt(lineSpacing))) {
      const spacingValue = parseInt(lineSpacing);
      // Map spacing values to Tailwind gap classes
      switch (spacingValue) {
        case 0:
          return 'flex flex-col gap-0';
        case 1:
          return 'flex flex-col gap-1';
        case 2:
          return 'flex flex-col gap-2';
        case 3:
          return 'flex flex-col gap-3';
        case 4:
          return 'flex flex-col gap-4';
        case 5:
          return 'flex flex-col gap-5';
        case 6:
          return 'flex flex-col gap-6';
        case 7:
          return 'flex flex-col gap-7';
        case 8:
          return 'flex flex-col gap-8';
        case 9:
          return 'flex flex-col gap-9';
        case 10:
          return 'flex flex-col gap-10';
        case 11:
          return 'flex flex-col gap-11';
        case 12:
          return 'flex flex-col gap-12';
        case 13:
          return 'flex flex-col gap-14';
        case 14:
          return 'flex flex-col gap-16';
        case 15:
          return 'flex flex-col gap-20';
        case 16:
          return 'flex flex-col gap-24';
        case 17:
          return 'flex flex-col gap-28';
        case 18:
          return 'flex flex-col gap-32';
        case 19:
          return 'flex flex-col gap-36';
        case 20:
          return 'flex flex-col gap-40';
        default:
          return 'flex flex-col gap-4';
      }
    }
    
    // Fallback for legacy string values
    switch (lineSpacing) {
      case 'tight':
        return 'flex flex-col gap-2';
      case 'normal':
        return 'flex flex-col gap-4';
      case 'relaxed':
        return 'flex flex-col gap-6';
      case 'loose':
        return 'flex flex-col gap-8';
      default:
        return 'flex flex-col gap-4';
    }
  };

  // Get horizontal spacing styles


  // Get button styles based on background
  // Use unified CTA styling from utils
  const getButtonStyles = (style: string) => {
    // Use the same approach as the header - CSS classes instead of getCTAStyles
    const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'destructive', 'success', 'info', 'outline', 'muted'];
    const safeStyle = allowedStyles.includes(style) ? style : 'primary';
    
    const baseClasses = cn(
      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg transition-all duration-200 select-none relative overflow-hidden',
      `btn-${safeStyle}`,
      safeStyle === 'primary' && 'focus-visible:ring-blue-500 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100',
      safeStyle === 'secondary' && 'focus-visible:ring-blue-500',
      safeStyle === 'accent' && 'focus-visible:ring-purple-500 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100',
      safeStyle === 'ghost' && 'focus-visible:ring-blue-500',
      safeStyle === 'destructive' && 'focus-visible:ring-red-500',
      safeStyle === 'success' && 'focus-visible:ring-green-500',
      safeStyle === 'info' && 'focus-visible:ring-blue-400',
      safeStyle === 'outline' && 'focus-visible:ring-blue-500',
      safeStyle === 'muted' && 'cursor-not-allowed'
    );
    
                  return {
                className: baseClasses,
                style: {
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-sans)',
                }
              };
  };

  // Dynamic conversation flow from heroData
  const conversationFlow = heroData?.animationData?.conversationFlow || [
    {
      type: 'user',
      message: "Hi! Can I return a product if I'm outside Canada?",
      delay: 1000
    },
    {
      type: 'typing',
      delay: 2000
    },
    {
      type: 'ai',
      message: "Yes! Returns are accepted within 30 days globally. Need help creating a return label?",
      delay: 3500
    },
    {
      type: 'user',
      message: "That would be great! My order number is #SK-2024-001",
      delay: 6000
    },
    {
      type: 'typing',
      delay: 7000
    },
    {
      type: 'ai',
      message: "Perfect! I've generated your return label and sent it to your email. You'll also receive tracking updates. Anything else I can help with?",
      delay: 8500
    }
  ];

  const [messages, setMessages] = useState<Array<{type: string, message: string}>>([]);
  const aiResponse = useTypingAnimation(
    messages.length > 0 && messages[messages.length - 1]?.type === 'ai' 
      ? messages[messages.length - 1].message 
      : '',
    35
  );

  // Conversation effect
  useEffect(() => {
    const runConversation = () => {
      conversationFlow.forEach((step: ConversationStep, index: number) => {
        setTimeout(() => {
          if (step.type === 'typing') {
            setIsTyping(true);
          } else {
            setIsTyping(false);
            if (step.message) {
              setMessages(prev => [...prev, { type: step.type, message: step.message! }]);
            }
          }
        }, step.delay);
      });

      // Restart conversation after completion
      setTimeout(() => {
        setMessages([]);
        setIsTyping(false);
      }, 12000);
    };

    runConversation();
    const interval = setInterval(runConversation, 15000);

    return () => clearInterval(interval);
  }, []);

  const getIconComponent = (iconName: string) => {
    // Handle new universal icon format (library:iconName)
    if (iconName && iconName.includes(':')) {
      // Return a component that renders the universal icon
      const IconComponent = (props: any) => {
        return renderIcon(iconName, props);
      };
      return IconComponent;
    }
    
    // Fallback to old format for backward compatibility
    const icons: { [key: string]: any } = {
      Shield, Clock, Code, Globe, Zap, Star, Award, Users, TrendingUp, Heart, Sparkles,
      Play, ArrowRight, Download, ExternalLink, Mail, Phone, MessageSquare, Video, 
      Calendar, BookOpen, Gift, Rocket
    };
    return icons[iconName] || Shield;
  };

  // Render media section based on layout
  const renderMediaSection = () => {
    const layoutType = heroData?.layoutType || 'split';
    const mediaPosition = heroData?.mediaPosition || 'right';
    
    // Check if animation should be rendered
    const animationContent = renderAnimation();
    
    if (!animationContent) {
      return null; // Don't render anything when no creatives are needed
    }
    
    switch (layoutType) {
      case 'centered':
        return (
          <motion.div 
            className="mt-10 lg:mt-14"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {animationContent}
          </motion.div>
        );

      case 'overlay':
        return (
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            {animationContent}
          </div>
        );

      case 'split':
      default:
        const isMediaLeft = mediaPosition === 'left';
        return (
          <motion.div 
            className={`${isMediaLeft ? 'lg:order-1' : ''} relative ${getMediaContainerClasses()} min-h-[500px]`}
            initial={{ opacity: 0, x: isMediaLeft ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {animationContent}
          </motion.div>
        );
    }
  };

  // Render different animation types
  const renderAnimation = () => {
    const animationType = heroData?.animationType || 'conversation';
    
    console.log('🔍 renderAnimation - animationType:', animationType);
    console.log('🔍 renderAnimation - heroData:', heroData);
    
    switch (animationType) {
      case 'video':
        return (
          <motion.div 
            className={`${getMediaContainerClasses()} overflow-hidden`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            {heroData?.animationData?.videoUrl ? (
              (() => {
                const videoUrl = heroData.animationData.videoUrl;
                
                // Check if it's a YouTube URL
                const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                const youtubeMatch = videoUrl.match(youtubeRegex);
                
                if (youtubeMatch) {
                  // It's a YouTube URL, create embed URL
                  const videoId = youtubeMatch[1];
                  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${heroData?.animationData?.autoplay ? '1' : '0'}&loop=${heroData?.animationData?.loop ? '1' : '0'}&mute=${heroData?.animationData?.autoplay ? '1' : '0'}&controls=${!heroData?.animationData?.autoplay ? '1' : '0'}&rel=0&modestbranding=1&playsinline=1`;
                  
                  return (
                    <iframe
                      src={embedUrl}
                      className={`${getMediaContentClasses()} rounded-2xl`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Hero video"
                    />
                  );
                } else {
                  // It's a direct video file URL
                  return (
                    <video 
                      className={`${getMediaContentClasses()} rounded-2xl`}
                      controls={!heroData?.animationData?.autoplay}
                      muted={heroData?.animationData?.autoplay}
                      autoPlay={heroData?.animationData?.autoplay}
                      loop={heroData?.animationData?.loop}
                      playsInline
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  );
                }
              })()
            ) : (
                      <div className={`${getMediaContentClasses()} bg-[var(--color-bg-secondary,#F9FAFB)] rounded-2xl flex items-center justify-center`}>
                              <span className="text-[var(--color-text-muted)]">No video URL provided</span>
        </div>
            )}
          </motion.div>
        );

      case 'html':
        return (
          <motion.div 
            className={`${getMediaContainerClasses()} min-h-[500px] overflow-hidden p-6`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`${getMediaContentClasses()}`}>
              <ClientOnlyHTML 
                htmlContent={heroData?.animationData?.htmlContent || ''}
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[var(--color-text-muted)]">
                      {heroData?.animationData?.htmlContent ? 'Loading animated content...' : 'No HTML content provided'}
                    </span>
                  </div>
                }
              />
            </div>
          </motion.div>
        );

      case 'script':
        return (
          <motion.div 
            className={`${getMediaContainerClasses()} min-h-[500px] overflow-hidden`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            {heroData?.animationData?.scriptContent ? (
              <>
                <div id="custom-animation-container" className={`${getMediaContentClasses()}`} />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      (function() {
                        try {
                          ${heroData.animationData.scriptContent}
                        } catch (error) {
                          console.error('Custom animation script error:', error);
                        }
                      })();
                    `
                  }}
                />
              </>
            ) : (
              <div className={`${getMediaContentClasses()} bg-[var(--color-bg-primary)] rounded-2xl flex items-center justify-center border`} style={{ borderColor: 'var(--color-gray-light)' }}>
                <span className="text-[var(--color-text-muted)]">No script content provided</span>
              </div>
            )}
          </motion.div>
        );

                  case 'image':
              return (
                <motion.div
                  className={`${getMediaContainerClasses()} overflow-hidden`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {(heroData?.animationData?.imageUrl || heroData?.animationData?.imageItem?.publicUrl) ? (
                    <img 
                      src={heroData.animationData.imageUrl || heroData.animationData.imageItem.publicUrl}
                      alt={heroData.animationData.imageAlt || heroData.animationData.imageItem?.alt || 'Hero animation'}
                      className={`${getMediaContentClasses()}`}
                    />
                  ) : (
                    <div className={`${getMediaContentClasses()} flex items-center justify-center`}>
                      <span className="text-[var(--color-text-muted)]">No image selected</span>
                    </div>
                  )}
                </motion.div>
              );

      default:
        // If animationType is empty (No Creatives Needed), return null
        if (!animationType || animationType === '') {
          return null;
        }
        
        return (
          <motion.div 
            className={`${getMediaContainerClasses()} min-h-[500px] overflow-hidden flex items-center justify-center`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-bg-primary)] rounded-full flex items-center justify-center mx-auto mb-4 border" style={{ borderColor: 'var(--color-gray-light)' }}>
                <Video className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">No Content Selected</h3>
              <p className="text-[var(--color-text-muted)]">Please select a content type from the admin panel</p>
            </div>
          </motion.div>
        );
    }
  };





  return (
    <>
      {/* Inject button styles for CTAs - same as header */}
      <style dangerouslySetInnerHTML={{ 
        __html: `
          .btn-primary {
            background-color: var(--color-primary);
            color: white;
            border: none;
          }
          .btn-primary:hover {
            background-color: var(--color-primary-light, var(--color-primary));
            transform: scale(1.02);
          }
          .btn-secondary {
            background-color: var(--color-secondary);
            color: white;
            border: 1px solid var(--color-secondary);
          }
          .btn-secondary:hover {
            background-color: var(--color-secondary-dark, var(--color-secondary));
            transform: scale(1.02);
          }
          .btn-accent {
            background-color: var(--color-accent);
            color: white;
            border: none;
          }
          .btn-accent:hover {
            background-color: var(--color-accent-dark, var(--color-accent));
            transform: scale(1.02);
          }
          .btn-ghost {
            background-color: transparent;
            color: var(--color-text-primary);
            border: 1px solid transparent;
          }
          .btn-ghost:hover {
            background-color: var(--color-primary-light, rgba(99, 102, 241, 0.1));
            transform: scale(1.02);
          }
          .btn-destructive {
            background-color: var(--color-error);
            color: white;
            border: none;
          }
          .btn-destructive:hover {
            background-color: var(--color-error-dark, var(--color-error));
            transform: scale(1.02);
          }
          .btn-success {
            background-color: var(--color-success);
            color: white;
            border: none;
          }
          .btn-success:hover {
            background-color: var(--color-success-dark, var(--color-success));
            transform: scale(1.02);
          }
          .btn-info {
            background-color: var(--color-info);
            color: white;
            border: none;
          }
          .btn-info:hover {
            background-color: var(--color-info-dark, var(--color-info));
            transform: scale(1.02);
          }
          .btn-outline {
            background-color: transparent;
            color: var(--color-primary);
            border: 1px solid var(--color-primary);
          }
          .btn-outline:hover {
            background-color: var(--color-primary);
            color: white;
            transform: scale(1.02);
          }
          .btn-muted {
            background-color: var(--color-gray-light);
            color: var(--color-text-muted);
            border: 1px solid var(--color-gray-dark);
            cursor: not-allowed;
          }
          .btn-muted:hover {
            background-color: var(--color-gray-medium);
            transform: scale(1.02);
            border-color: var(--color-gray-dark);
          }
        `
      }} />
      
      <motion.section 
        ref={heroRef}
        style={{ 
          backgroundColor: heroData?.backgroundColor || 'var(--color-bg-primary)',
          backgroundImage: heroData?.backgroundImage ? `url(${heroData.backgroundImage})` : 'none',
          backgroundSize: heroData?.backgroundSize || 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        className={`relative flex items-center justify-center overflow-hidden pt-16 sm:pt-20 lg:pt-24 ${getHeroHeightClasses()}`}
      >
      {/* Background Overlay */}
      {heroData?.backgroundOverlay && (
        <div 
          className="absolute inset-0" 
          style={{
            backgroundColor: heroData.backgroundOverlay,
            opacity: 0.1
          }}
        />
      )}

      {/* Enhanced Background with Soft Radial Gradient - Only if no background image */}
      {!heroData?.backgroundImage && (
        <div 
          className="absolute inset-0" 
          style={{
            background: heroData?.backgroundColor 
              ? `radial-gradient(circle at center, ${heroData.backgroundColor}, ${heroData.backgroundColor})`
              : 'radial-gradient(circle at center, var(--color-background-light), var(--color-background))'
          }}
        />
      )}
      
      {/* Subtle Particle Background - Reduced */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <Particle key={`particle-${i}`} delay={i * 1.2} />
        ))}
      </div>

      {/* Soft Gradient Mesh - More Subtle */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[var(--color-primary)]/8 to-[var(--color-primary-light)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[var(--color-primary-light)]/6 to-[var(--color-accent)]/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full pb-8 lg:pb-0 px-4 sm:px-6 lg:px-8">
        <div className={`${getLayoutClasses()} max-w-7xl mx-auto`}>
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: getTextAnimationDirection() }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`${getTextContentClasses()} ${getLineSpacingClasses()} px-4 sm:px-0`}
          >
            {/* Tighter Main Headline with Refined Typography */}
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight sm:leading-[1.05]"
                style={getTextColor()}
              >
                {heroData?.heading || 'Automate Conversations, Capture Leads, Serve Customers — All Without Code'}
              </motion.h1>
            </div>

            {/* Refined Subheading */}
            {heroData?.subheading && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="text-base sm:text-lg leading-relaxed max-w-lg font-medium mx-auto"
                style={getSecondaryTextColor()}
              >
                {heroData.subheading}
              </motion.p>
            )}

            {/* Enhanced CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-2"
            >
              {heroData?.primaryCtaId && heroData?.primaryCta && (() => {
                console.log('HeroSection - Primary CTA data:', heroData.primaryCta);
                const ctaEvents = applyCTAEvents(heroData.primaryCta as CTAWithEvents);
                const hasEvents = hasCTAEvents(heroData.primaryCta as CTAWithEvents);
                console.log('HeroSection - Applied CTA events:', ctaEvents);
                console.log('HeroSection - Has events:', hasEvents);
                
                // Runtime safeguard for allowed styles
                const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'destructive', 'success', 'info', 'outline', 'muted'];
                const safeStyle = allowedStyles.includes(heroData.primaryCta.style) ? heroData.primaryCta.style : 'primary';
                
                // Get button styles with custom colors if provided
                        const buttonStyles = getButtonStyles(safeStyle);
                
                // Always render as <a> tag if URL is present (even if it's '#')
                if (heroData.primaryCta.url) {
                  return (
                    <motion.a
                      href={heroData.primaryCta.url}
                      target={heroData.primaryCta.target}
                      id={heroData.primaryCta.customId}
                      className={`inline-flex items-center gap-2.5 ${buttonStyles.className}`}
                      style={buttonStyles.style}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        console.log('HeroSection - Button clicked!');
                        console.log('HeroSection - Events from CTA:', heroData.primaryCta.events);
                        console.log('HeroSection - ctaEvents.onClick:', ctaEvents.onClick);
                        
                        // Prevent navigation when there are JavaScript events
                        if (heroData.primaryCta.events || ctaEvents.onClick) {
                          e.preventDefault();
                          console.log('HeroSection - Prevented default navigation');
                        }
                        
                        // Handle URL navigation (only if no JavaScript events)
                        if (!heroData.primaryCta.events && !ctaEvents.onClick) {
                          console.log('HeroSection - No events, handling URL navigation');
                          if (heroData.primaryCta.url.startsWith('#')) {
                            const selector = heroData.primaryCta.url;
                            if (selector.length > 1) {
                              const element = document.querySelector(selector);
                              element?.scrollIntoView({ behavior: 'smooth' });
                            }
                          } else if (heroData.primaryCta.target === '_blank') {
                            window.open(heroData.primaryCta.url, '_blank');
                          } else {
                            window.location.href = heroData.primaryCta.url;
                          }
                        }
                        
                                                     // Execute CTA events
                             if (heroData.primaryCta.events) {
                               console.log('HeroSection - Executing events');
                               console.log('Events data:', heroData.primaryCta.events);
                               executeCTAEventFromConfig(heroData.primaryCta.events, 'onClick', e, e.currentTarget);
                             } else {
                               console.log('HeroSection - No events to execute');
                             }
                      }}
                      onMouseOver={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onHover', e, e.currentTarget);
                      } : undefined}
                      onMouseOut={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onMouseOut', e, e.currentTarget);
                      } : undefined}
                      onFocus={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onFocus', e, e.currentTarget);
                      } : undefined}
                      onBlur={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onBlur', e, e.currentTarget);
                      } : undefined}
                      onKeyDown={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onKeyDown', e, e.currentTarget);
                      } : undefined}
                      onKeyUp={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onKeyUp', e, e.currentTarget);
                      } : undefined}
                      onTouchStart={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onTouchStart', e, e.currentTarget);
                      } : undefined}
                      onTouchEnd={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onTouchEnd', e, e.currentTarget);
                      } : undefined}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        {heroData.primaryCta.icon && (() => {
                          const IconComponent = getIconComponent(heroData.primaryCta.icon);
                          return <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform" />;
                        })()}
                        {heroData.primaryCta.text || 'Try Live Demo'}
                      </span>
                    </motion.a>
                  );
                } else {
                  // Fallback to button if no URL
                  return (
                    <motion.button
                      type="button"
                      id={heroData.primaryCta.customId}
                      className={`inline-flex items-center gap-2.5 ${buttonStyles.className}`}
                      style={buttonStyles.style}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        // Execute CTA events
                        if (heroData.primaryCta.events) {
                          executeCTAEventFromConfig(heroData.primaryCta.events, 'onClick', e, e.currentTarget);
                        }
                      }}
                      onMouseOver={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onHover', e, e.currentTarget);
                      } : undefined}
                      onMouseOut={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onMouseOut', e, e.currentTarget);
                      } : undefined}
                      onFocus={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onFocus', e, e.currentTarget);
                      } : undefined}
                      onBlur={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onBlur', e, e.currentTarget);
                      } : undefined}
                      onKeyDown={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onKeyDown', e, e.currentTarget);
                      } : undefined}
                      onKeyUp={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onKeyUp', e, e.currentTarget);
                      } : undefined}
                      onTouchStart={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onTouchStart', e, e.currentTarget);
                      } : undefined}
                      onTouchEnd={heroData.primaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.primaryCta.events, 'onTouchEnd', e, e.currentTarget);
                      } : undefined}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        {heroData.primaryCta.icon && (() => {
                          const IconComponent = getIconComponent(heroData.primaryCta.icon);
                          return <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform" />;
                        })()}
                        {heroData.primaryCta.text || 'Try Live Demo'}
                      </span>
                    </motion.button>
                  );
                }
              })()}
              
              {heroData?.secondaryCtaId && heroData?.secondaryCta && (() => {
                const ctaEvents = applyCTAEvents(heroData.secondaryCta as CTAWithEvents);
                const hasEvents = hasCTAEvents(heroData.secondaryCta as CTAWithEvents);
                
                // Runtime safeguard for allowed styles
                const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'destructive', 'success', 'info', 'outline', 'muted'];
                const safeStyle = allowedStyles.includes(heroData.secondaryCta.style) ? heroData.secondaryCta.style : 'secondary';
                
                // Get button styles with custom colors if provided
                                  const secondaryButtonStyles = getButtonStyles(safeStyle);
                
                // Always render as <a> tag if URL is present (even if it's '#')
                if (heroData.secondaryCta.url) {
                  return (
                    <motion.a
                      href={heroData.secondaryCta.url}
                      target={heroData.secondaryCta.target}
                      id={heroData.secondaryCta.customId}
                      className={`inline-flex items-center gap-2.5 ${secondaryButtonStyles.className}`}
                      style={secondaryButtonStyles.style}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        // Prevent navigation when there are JavaScript events
                        if (heroData.secondaryCta.events || ctaEvents.onClick) {
                          e.preventDefault();
                        }
                        
                        // Handle URL navigation (only if no JavaScript events)
                        if (!heroData.secondaryCta.events && !ctaEvents.onClick) {
                          if (heroData.secondaryCta.url.startsWith('#')) {
                            const selector = heroData.secondaryCta.url;
                            if (selector.length > 1) {
                              const element = document.querySelector(selector);
                              element?.scrollIntoView({ behavior: 'smooth' });
                            }
                          } else if (heroData.secondaryCta.target === '_blank') {
                            window.open(heroData.secondaryCta.url, '_blank');
                          } else {
                            window.location.href = heroData.secondaryCta.url;
                          }
                        }
                        
                        // Execute CTA events
                        if (heroData.secondaryCta.events) {
                          executeCTAEventFromConfig(heroData.secondaryCta.events, 'onClick', e, e.currentTarget);
                        }
                      }}
                      onMouseOver={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onHover', e, e.currentTarget);
                      } : undefined}
                      onMouseOut={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onMouseOut', e, e.currentTarget);
                      } : undefined}
                      onFocus={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onFocus', e, e.currentTarget);
                      } : undefined}
                      onBlur={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onBlur', e, e.currentTarget);
                      } : undefined}
                      onKeyDown={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onKeyDown', e, e.currentTarget);
                      } : undefined}
                      onKeyUp={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onKeyUp', e, e.currentTarget);
                      } : undefined}
                      onTouchStart={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onTouchStart', e, e.currentTarget);
                      } : undefined}
                      onTouchEnd={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onTouchEnd', e, e.currentTarget);
                      } : undefined}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        {heroData.secondaryCta.icon && (() => {
                          const IconComponent = getIconComponent(heroData.secondaryCta.icon);
                          return <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform" />;
                        })()}
                        {heroData.secondaryCta.text || 'Join Waitlist'}
                      </span>
                    </motion.a>
                  );
                } else {
                  // Fallback to button if no URL
                  return (
                    <motion.button
                      type="button"
                      id={heroData.secondaryCta.customId}
                      className={`inline-flex items-center gap-2.5 ${secondaryButtonStyles.className}`}
                      style={secondaryButtonStyles.style}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        // Execute CTA events
                        if (heroData.secondaryCta.events) {
                          executeCTAEventFromConfig(heroData.secondaryCta.events, 'onClick', e, e.currentTarget);
                        }
                      }}
                      onMouseOver={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onHover', e, e.currentTarget);
                      } : undefined}
                      onMouseOut={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onMouseOut', e, e.currentTarget);
                      } : undefined}
                      onFocus={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onFocus', e, e.currentTarget);
                      } : undefined}
                      onBlur={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onBlur', e, e.currentTarget);
                      } : undefined}
                      onKeyDown={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onKeyDown', e, e.currentTarget);
                      } : undefined}
                      onKeyUp={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onKeyUp', e, e.currentTarget);
                      } : undefined}
                      onTouchStart={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onTouchStart', e, e.currentTarget);
                      } : undefined}
                      onTouchEnd={heroData.secondaryCta.events ? (e) => {
                        executeCTAEventFromConfig(heroData.secondaryCta.events, 'onTouchEnd', e, e.currentTarget);
                      } : undefined}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        {heroData.secondaryCta.icon && (() => {
                          const IconComponent = getIconComponent(heroData.secondaryCta.icon);
                          return <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform" />;
                        })()}
                        {heroData.secondaryCta.text || 'Join Waitlist'}
                      </span>
                    </motion.button>
                  );
                }
              })()}
            </motion.div>

            {/* Responsive Trust Indicators */}
            {visibleTrustIndicators && visibleTrustIndicators.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {visibleTrustIndicators.map((indicator: any, index: number) => {
                  const IconComponent = getIconComponent(indicator.iconName);
                  const trustColors = getTrustIndicatorColors();
                  return (
                    <motion.div 
                      key={indicator.id || index} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                      className="flex items-center gap-2 backdrop-blur-sm px-3 py-2 rounded-lg border"
                      style={{
                        ...trustColors.text,
                        ...trustColors.background,
                        ...trustColors.border
                      }}
                    >
                      <IconComponent className="w-4 h-4" style={trustColors.icon} />
                      <span className="text-sm font-medium">{indicator.text}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

          {/* Media Section - Dynamic Animation */}
          {renderMediaSection()}
        </div>
      </div>
      </motion.section>
    </>
  );
};

export default HeroSection; 

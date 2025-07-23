'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
import { applyCTAEvents, hasCTAEvents, executeCTAEvent, executeCTAEventFromConfig, type CTAWithEvents } from '@/lib/utils';

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

interface HeroSectionProps {
  heroData?: any;
}

const HeroSection: React.FC<HeroSectionProps> = ({ heroData: propHeroData }) => {
  const [currentConversationStep, setCurrentConversationStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
    if (!heroData?.backgroundColor) return 'text-gray-900'; // Default dark text
    
    const hex = heroData.backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'text-gray-900' : 'text-white';
  };

  // Get secondary text color based on background
  const getSecondaryTextColor = () => {
    const primaryColor = getTextColor();
    return primaryColor === 'text-white' ? 'text-white/90' : 'text-gray-600';
  };

  // Get trust indicator colors based on background
  const getTrustIndicatorColors = () => {
    const primaryColor = getTextColor();
    if (primaryColor === 'text-white') {
      return {
        text: 'text-white/90',
        background: 'bg-white/10',
        border: 'border-white/20',
        icon: 'text-white'
      };
    }
    return {
      text: 'text-gray-700',
      background: 'bg-white/60',
      border: 'border-white/40',
      icon: 'text-[var(--color-primary)]'
    };
  };

  // Get button styles based on background
  const getButtonStyles = (buttonType: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted') => {
    const isDarkBackground = getTextColor() === 'text-white';
    const baseClasses = 'group px-8 py-4 text-base font-semibold transition-all duration-300 relative overflow-hidden rounded-xl';
    
    switch (buttonType) {
      case 'primary':
      return isDarkBackground 
        ? `${baseClasses} bg-white/95 text-[var(--color-primary)] hover:bg-white border border-white/20 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20`
          : `${baseClasses} bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-xl hover:shadow-[var(--color-primary)]/35`;
      
      case 'secondary':
        return isDarkBackground
          ? `${baseClasses} bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-white/10`
          : `${baseClasses} bg-[var(--color-bg-secondary)] text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-white shadow-lg shadow-[var(--color-primary)]/15`;
      
      case 'accent':
        return isDarkBackground
          ? `${baseClasses} bg-[var(--color-accent)]/90 text-white hover:bg-[var(--color-accent)] border border-[var(--color-accent)]/30`
          : `${baseClasses} bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] shadow-lg shadow-[var(--color-accent)]/25 hover:shadow-xl hover:shadow-[var(--color-accent)]/35`;
      
      case 'ghost':
        return isDarkBackground
          ? `${baseClasses} text-white hover:bg-white/10 border border-transparent hover:border-white/20 backdrop-blur-sm`
          : `${baseClasses} text-[var(--color-text-primary)] hover:bg-[var(--color-primary)]/10 border border-transparent hover:border-[var(--color-primary)]/20`;
      
      case 'destructive':
        return isDarkBackground
          ? `${baseClasses} bg-[var(--color-error)]/90 text-white hover:bg-[var(--color-error)] border border-[var(--color-error)]/30`
          : `${baseClasses} bg-[var(--color-error)] text-white hover:bg-[var(--color-error-dark)] shadow-lg shadow-[var(--color-error)]/25`;
      
      case 'success':
        return isDarkBackground
          ? `${baseClasses} bg-[var(--color-success)]/90 text-white hover:bg-[var(--color-success)] border border-[var(--color-success)]/30`
          : `${baseClasses} bg-[var(--color-success)] text-white hover:bg-[var(--color-success-dark)] shadow-lg shadow-[var(--color-success)]/25`;
      
      case 'info':
        return isDarkBackground
          ? `${baseClasses} bg-[var(--color-info)]/90 text-white hover:bg-[var(--color-info)] border border-[var(--color-info)]/30`
          : `${baseClasses} bg-[var(--color-info)] text-white hover:bg-[var(--color-info-dark)] shadow-lg shadow-[var(--color-info)]/25`;
      
      case 'outline':
      return isDarkBackground
        ? `${baseClasses} min-w-[200px] border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-white/10`
          : `${baseClasses} min-w-[200px] border-2 border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)] backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-[var(--color-primary)]/25`;
      
      case 'muted':
        return `${baseClasses} bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border-medium)] cursor-not-allowed opacity-50`;
      
      default:
        return baseClasses;
    }
  };

  // Conversation flow
  const conversationFlow: Array<{
    type: 'user' | 'ai' | 'typing';
    message?: string;
    delay: number;
  }> = [
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
      conversationFlow.forEach((step, index) => {
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



  return (
    <motion.section 
      ref={heroRef}
      style={{ 
        opacity,
        backgroundColor: heroData?.backgroundColor || '#FFFFFF'
      }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20 lg:pt-24"
    >
      {/* Enhanced Background with Soft Radial Gradient */}
      <div 
        className="absolute inset-0" 
        style={{
          background: heroData?.backgroundColor 
            ? `radial-gradient(circle at center, ${heroData.backgroundColor}, ${heroData.backgroundColor})`
            : 'radial-gradient(circle at center, #FBFBFB, #FFFFFF)'
        }}
      />
      
      {/* Subtle Particle Background - Reduced */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <Particle key={`particle-${i}`} delay={i * 1.2} />
        ))}
      </div>

      {/* Soft Gradient Mesh - More Subtle */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[var(--color-primary)]/8 to-[var(--color-primary-light)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[var(--color-primary-light)]/6 to-[#8B5CF6]/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-8 pb-8 lg:pb-0">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          
          {/* Left Side - Refined Text & Actions */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Tighter Main Headline with Refined Typography */}
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] ${getTextColor()}`}
              >
                {heroData?.heading || 'Automate Conversations, Capture Leads, Serve Customers — All Without Code'}
              </motion.h1>
            </div>

            {/* Refined Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className={`text-lg ${getSecondaryTextColor()} leading-relaxed max-w-lg font-medium`}
            >
              {heroData?.subheading || 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.'}
            </motion.p>

            {/* Enhanced CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              {heroData?.primaryCtaId && heroData?.primaryCta && (() => {
                const ctaEvents = applyCTAEvents(heroData.primaryCta as CTAWithEvents);
                const hasEvents = hasCTAEvents(heroData.primaryCta as CTAWithEvents);
                
                // Runtime safeguard for allowed styles
                const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'outline', 'muted'];
                const safeStyle = allowedStyles.includes(heroData.primaryCta.style) ? heroData.primaryCta.style : 'primary';
                
                // Always render as <a> tag if URL is present (even if it's '#')
                if (heroData.primaryCta.url) {
                  return (
                    <motion.a
                      href={heroData.primaryCta.url}
                      target={heroData.primaryCta.target}
                      id={heroData.primaryCta.customId}
                      className={`inline-flex items-center gap-2.5 ${getButtonStyles(safeStyle)}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        // Handle URL navigation
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
                        
                        // Execute CTA events (only use new event system)
                        if (heroData.primaryCta.events) {
                          executeCTAEventFromConfig(heroData.primaryCta.events, 'onClick', e, e.currentTarget);
                        } else if (ctaEvents.onClick) {
                          // Fallback to legacy system only if no new events
                          executeCTAEvent(ctaEvents.onClick, e, e.currentTarget);
                        }
                      }}
                      onMouseOver={ctaEvents.onMouseOver ? (e) => {
                        executeCTAEvent(ctaEvents.onMouseOver, e, e.currentTarget);
                      } : undefined}
                      onMouseOut={ctaEvents.onMouseOut ? (e) => {
                        executeCTAEvent(ctaEvents.onMouseOut, e, e.currentTarget);
                      } : undefined}
                      onFocus={ctaEvents.onFocus ? (e) => {
                        executeCTAEvent(ctaEvents.onFocus, e, e.currentTarget);
                      } : undefined}
                      onBlur={ctaEvents.onBlur ? (e) => {
                        executeCTAEvent(ctaEvents.onBlur, e, e.currentTarget);
                      } : undefined}
                      onKeyDown={ctaEvents.onKeyDown ? (e) => {
                        executeCTAEvent(ctaEvents.onKeyDown, e, e.currentTarget);
                      } : undefined}
                      onKeyUp={ctaEvents.onKeyUp ? (e) => {
                        executeCTAEvent(ctaEvents.onKeyUp, e, e.currentTarget);
                      } : undefined}
                      onTouchStart={ctaEvents.onTouchStart ? (e) => {
                        executeCTAEvent(ctaEvents.onTouchStart, e, e.currentTarget);
                      } : undefined}
                      onTouchEnd={ctaEvents.onTouchEnd ? (e) => {
                        executeCTAEvent(ctaEvents.onTouchEnd, e, e.currentTarget);
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
                      className={`inline-flex items-center gap-2.5 ${getButtonStyles(safeStyle)}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        // Execute CTA events (only use new event system)
                        if (heroData.primaryCta.events) {
                          executeCTAEventFromConfig(heroData.primaryCta.events, 'onClick', e, e.currentTarget);
                        } else if (ctaEvents.onClick) {
                          // Fallback to legacy system only if no new events
                          executeCTAEvent(ctaEvents.onClick, e, e.currentTarget);
                        }
                      }}
                      onMouseOver={ctaEvents.onMouseOver ? (e) => {
                        executeCTAEvent(ctaEvents.onMouseOver, e, e.currentTarget);
                      } : undefined}
                      onMouseOut={ctaEvents.onMouseOut ? (e) => {
                        executeCTAEvent(ctaEvents.onMouseOut, e, e.currentTarget);
                      } : undefined}
                      onFocus={ctaEvents.onFocus ? (e) => {
                        executeCTAEvent(ctaEvents.onFocus, e, e.currentTarget);
                      } : undefined}
                      onBlur={ctaEvents.onBlur ? (e) => {
                        executeCTAEvent(ctaEvents.onBlur, e, e.currentTarget);
                      } : undefined}
                      onKeyDown={ctaEvents.onKeyDown ? (e) => {
                        executeCTAEvent(ctaEvents.onKeyDown, e, e.currentTarget);
                      } : undefined}
                      onKeyUp={ctaEvents.onKeyUp ? (e) => {
                        executeCTAEvent(ctaEvents.onKeyUp, e, e.currentTarget);
                      } : undefined}
                      onTouchStart={ctaEvents.onTouchStart ? (e) => {
                        executeCTAEvent(ctaEvents.onTouchStart, e, e.currentTarget);
                      } : undefined}
                      onTouchEnd={ctaEvents.onTouchEnd ? (e) => {
                        executeCTAEvent(ctaEvents.onTouchEnd, e, e.currentTarget);
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
                const allowedStyles = ['primary', 'secondary', 'accent', 'ghost', 'outline', 'muted'];
                const safeStyle = allowedStyles.includes(heroData.secondaryCta.style) ? heroData.secondaryCta.style : 'secondary';
                
                // Always render as <a> tag if URL is present (even if it's '#')
                if (heroData.secondaryCta.url) {
                  return (
                    <motion.a
                      href={heroData.secondaryCta.url}
                      target={heroData.secondaryCta.target}
                      id={heroData.secondaryCta.customId}
                      className={`inline-flex items-center gap-2.5 ${getButtonStyles(safeStyle)}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        // Handle URL navigation
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
                        
                        // Execute CTA events (only use new event system)
                        if (heroData.secondaryCta.events) {
                          executeCTAEventFromConfig(heroData.secondaryCta.events, 'onClick', e, e.currentTarget);
                        } else if (ctaEvents.onClick) {
                          // Fallback to legacy system only if no new events
                          executeCTAEvent(ctaEvents.onClick, e, e.currentTarget);
                        }
                      }}
                      onMouseOver={ctaEvents.onMouseOver ? (e) => {
                        executeCTAEvent(ctaEvents.onMouseOver, e, e.currentTarget);
                      } : undefined}
                      onMouseOut={ctaEvents.onMouseOut ? (e) => {
                        executeCTAEvent(ctaEvents.onMouseOut, e, e.currentTarget);
                      } : undefined}
                      onFocus={ctaEvents.onFocus ? (e) => {
                        executeCTAEvent(ctaEvents.onFocus, e, e.currentTarget);
                      } : undefined}
                      onBlur={ctaEvents.onBlur ? (e) => {
                        executeCTAEvent(ctaEvents.onBlur, e, e.currentTarget);
                      } : undefined}
                      onKeyDown={ctaEvents.onKeyDown ? (e) => {
                        executeCTAEvent(ctaEvents.onKeyDown, e, e.currentTarget);
                      } : undefined}
                      onKeyUp={ctaEvents.onKeyUp ? (e) => {
                        executeCTAEvent(ctaEvents.onKeyUp, e, e.currentTarget);
                      } : undefined}
                      onTouchStart={ctaEvents.onTouchStart ? (e) => {
                        executeCTAEvent(ctaEvents.onTouchStart, e, e.currentTarget);
                      } : undefined}
                      onTouchEnd={ctaEvents.onTouchEnd ? (e) => {
                        executeCTAEvent(ctaEvents.onTouchEnd, e, e.currentTarget);
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
                      className={`inline-flex items-center gap-2.5 ${getButtonStyles(safeStyle)}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        // Execute CTA events (only use new event system)
                        if (heroData.secondaryCta.events) {
                          executeCTAEventFromConfig(heroData.secondaryCta.events, 'onClick', e, e.currentTarget);
                        } else if (ctaEvents.onClick) {
                          // Fallback to legacy system only if no new events
                          executeCTAEvent(ctaEvents.onClick, e, e.currentTarget);
                        }
                      }}
                      onMouseOver={ctaEvents.onMouseOver ? (e) => {
                        executeCTAEvent(ctaEvents.onMouseOver, e, e.currentTarget);
                      } : undefined}
                      onMouseOut={ctaEvents.onMouseOut ? (e) => {
                        executeCTAEvent(ctaEvents.onMouseOut, e, e.currentTarget);
                      } : undefined}
                      onFocus={ctaEvents.onFocus ? (e) => {
                        executeCTAEvent(ctaEvents.onFocus, e, e.currentTarget);
                      } : undefined}
                      onBlur={ctaEvents.onBlur ? (e) => {
                        executeCTAEvent(ctaEvents.onBlur, e, e.currentTarget);
                      } : undefined}
                      onKeyDown={ctaEvents.onKeyDown ? (e) => {
                        executeCTAEvent(ctaEvents.onKeyDown, e, e.currentTarget);
                      } : undefined}
                      onKeyUp={ctaEvents.onKeyUp ? (e) => {
                        executeCTAEvent(ctaEvents.onKeyUp, e, e.currentTarget);
                      } : undefined}
                      onTouchStart={ctaEvents.onTouchStart ? (e) => {
                        executeCTAEvent(ctaEvents.onTouchStart, e, e.currentTarget);
                      } : undefined}
                      onTouchEnd={ctaEvents.onTouchEnd ? (e) => {
                        executeCTAEvent(ctaEvents.onTouchEnd, e, e.currentTarget);
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
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4"
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
                      className={`flex items-center gap-2 ${trustColors.text} ${trustColors.background} backdrop-blur-sm px-3 py-2 rounded-lg border ${trustColors.border}`}
                    >
                      <IconComponent className={`w-4 h-4 ${trustColors.icon}`} />
                      <span className="text-sm font-medium">{indicator.text}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

          {/* Right Side - Enhanced Glassmorphism Chat UI */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mb-8 lg:mb-0"
          >
            {/* Floating AI Avatar with Subtle Animation */}
            <motion.div
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-8 -left-8 z-20"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <AIAvatar size="lg" className="shadow-xl shadow-[var(--color-primary)]/25" />
                {/* Verified Badge */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg border border-gray-200/40"
                >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced Glassmorphism Chat Window */}
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-purple-500/20 overflow-hidden">
              
              {/* Refined Chat Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 border-b border-white/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <AIAvatar size="sm" />
              <div>
                <div className="font-semibold text-gray-900 text-sm">
                  AI Assistant
                </div>
                <div className="text-xs text-purple-600 flex items-center gap-1.5">
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-purple-600 rounded-full"
                  />
                      Online • Avg response: 0.2s
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
              </div>

              {/* Refined Chat Messages */}
              <div className="p-5 space-y-4 h-80 overflow-y-auto">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -15, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`flex gap-3 ${message.type === 'ai' ? 'justify-start' : 'justify-end'}`}
                    >
                      {message.type === 'ai' && (
                        <AIAvatar size="sm" className="flex-shrink-0 mt-1" />
                      )}
                      
                      <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        message.type === 'ai' 
                          ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white rounded-bl-sm shadow-lg' 
                          : 'bg-gray-50 text-gray-900 rounded-br-sm border border-gray-200 shadow-sm'
                      }`}>
                        <p>
                          {message.type === 'ai' && index === messages.length - 1 
                            ? aiResponse.displayText 
                            : message.message}
                        </p>
                        {message.type === 'ai' && index === messages.length - 1 && !aiResponse.isComplete && (
                          <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="inline-block w-2 h-4 bg-white/80 ml-1"
                          />
                        )}
                      </div>

                      {message.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-3 justify-start"
                    >
                      <AIAvatar size="sm" className="flex-shrink-0 mt-1" />
                      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-lg">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={`typing-dot-${i}`}
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ 
                                duration: 1, 
                                repeat: Infinity, 
                                delay: i * 0.2 
                              }}
                              className="w-2 h-2 bg-white/80 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat Input Area */}
              <div className="p-4 border-t border-white/20 bg-white/40 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/80 rounded-xl px-4 py-2 text-sm text-gray-500 border border-gray-200/50">
                    Type your message...
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 p-2 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection; 

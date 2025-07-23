'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { renderIcon } from '@/lib/iconUtils';

interface GlobalFeature {
  id: number;
  title: string;
  description: string;
  iconName: string;
  category: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeaturesListLayoutProps {
  features: GlobalFeature[];
  heading: string;
  subheading?: string;
  backgroundColor?: string;
}

const FeaturesListLayout: React.FC<FeaturesListLayoutProps> = ({ 
  features, 
  heading, 
  subheading,
  backgroundColor = '#ffffff'
}) => {
  const { designSystem } = useDesignSystem();
  const sectionRef = useRef<HTMLElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const geometricRef = useRef<HTMLDivElement>(null);
  const dnaRef = useRef<HTMLDivElement>(null);
  const [faviconUrl, setFaviconUrl] = useState<string>('/favicon.ico');

  // Fetch favicon URL from database
  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const siteSettings = await response.json();
          if (siteSettings?.faviconUrl) {
            setFaviconUrl(siteSettings.faviconUrl);
            console.log('🎯 Favicon URL loaded from database:', siteSettings.faviconUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch favicon URL:', error);
      }
    };
    
    fetchFavicon();
  }, []);

  // Get icon component using universal renderIcon utility
  const getIconComponent = (iconName: string) => {
    // Use the universal renderIcon utility
    // If iconName doesn't include a library prefix, assume it's a Lucide icon
    const iconString = iconName.includes(':') ? iconName : `lucide:${iconName}`;
    return renderIcon(iconString, { className: 'w-8 h-8' }) || renderIcon('lucide:Star', { className: 'w-8 h-8' });
  };

  // Use design system colors with fallbacks
  const primaryColor = designSystem?.primaryColor || '#5243E9';
  const secondaryColor = designSystem?.secondaryColor || '#7C3AED';
  const accentColor = designSystem?.accentColor || '#A020F0';
  const backgroundPrimary = designSystem?.backgroundPrimary || '#FFFFFF';
  const backgroundSecondary = designSystem?.backgroundSecondary || '#F6F8FC';
  const textPrimary = designSystem?.textPrimary || '#1F2937';
  const textSecondary = designSystem?.textSecondary || '#6B7280';

  // Create DNA base pairs
  const createDNABases = () => {
    const strands = dnaRef.current?.querySelectorAll('.dna-strand');
    strands?.forEach((strand, strandIndex) => {
      strand.innerHTML = '';
      for (let i = 0; i < 50; i++) {
        const base = document.createElement('div');
        base.className = 'dna-base';
        base.style.position = 'absolute';
        base.style.width = '20px';
        base.style.height = '2px';
        base.style.background = secondaryColor;
        base.style.top = `${i * 4}%`;
        base.style.left = `${Math.sin(i * 0.5 + strandIndex * 2) * 30}px`;
        base.style.animation = `dnaPulse 2s ease-in-out infinite ${i * 0.1}s`;
        strand.appendChild(base);
      }
    });
  };

  // Create particle system
  const createParticles = () => {
    if (!particlesRef.current) return;
    particlesRef.current.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.position = 'absolute';
      particle.style.width = '3px';
      particle.style.height = '3px';
      particle.style.background = primaryColor;
      particle.style.borderRadius = '50%';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animation = `particleFloat ${15 + Math.random() * 10}s linear infinite ${Math.random() * 15}s`;
      particlesRef.current.appendChild(particle);
    }
  };

  // Create geometric shapes
  const createGeometricShapes = () => {
    if (!geometricRef.current) return;
    
    // Clear existing shapes
    geometricRef.current.innerHTML = '';
    
    // Create various geometric shapes
    for (let i = 0; i < 15; i++) {
      const shape = document.createElement('div');
      const shapeType = Math.floor(Math.random() * 3);
      
      shape.style.position = 'absolute';
      shape.style.left = `${Math.random() * 100}%`;
      shape.style.top = `${Math.random() * 100}%`;
      shape.style.animation = `geometryFloat ${10 + Math.random() * 10}s ease-in-out infinite ${Math.random() * 10}s`;
      
      if (shapeType === 0) {
        // Circle
        shape.style.width = `${20 + Math.random() * 30}px`;
        shape.style.height = shape.style.width;
        shape.style.borderRadius = '50%';
        shape.style.background = `linear-gradient(45deg, ${primaryColor}40, ${secondaryColor}40)`;
      } else if (shapeType === 1) {
        // Triangle
        shape.style.width = '0';
        shape.style.height = '0';
        const size = 15 + Math.random() * 20;
        shape.style.borderLeft = `${size}px solid transparent`;
        shape.style.borderRight = `${size}px solid transparent`;
        shape.style.borderBottom = `${size * 1.5}px solid ${accentColor}40`;
      } else {
        // Square
        const size = 15 + Math.random() * 25;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.background = `linear-gradient(45deg, ${accentColor}40, ${primaryColor}40)`;
        shape.style.transform = `rotate(${Math.random() * 360}deg)`;
      }
      
      geometricRef.current.appendChild(shape);
    }

    // Create animated SaskiAI logos spread across full width
    console.log('🚀 Creating 15 animated SaskiAI logos...');
    for (let i = 0; i < 15; i++) {
      const logoContainer = document.createElement('div');
      logoContainer.className = 'saski-logo';
      logoContainer.style.position = 'absolute';
      logoContainer.style.left = `${Math.random() * 100}%`;
      logoContainer.style.top = `${Math.random() * 100}%`;
      logoContainer.style.animation = `logoFloat ${20 + Math.random() * 10}s linear infinite ${Math.random() * 20}s`;
      logoContainer.style.zIndex = '35';
      
      // Create SaskiAI logo using the actual favicon.svg
      const logo = document.createElement('img');
      logo.src = '/favicon.svg';
      logo.alt = 'SaskiAI';
      logo.style.width = '60px';
      logo.style.height = '60px';
      logo.style.opacity = '0.8';
      logo.style.filter = `hue-rotate(${Math.random() * 360}deg) brightness(1.8) saturate(1.5)`;
      logo.style.animation = `logoSpin ${6 + Math.random() * 8}s linear infinite`;
      logo.style.boxShadow = `0 0 40px ${primaryColor}90, 0 0 80px ${primaryColor}60, 0 0 120px ${primaryColor}30`;
      logo.style.borderRadius = '50%';
      logo.style.border = `3px solid ${primaryColor}50`;
      
      // Add error handling - fallback to styled div if SVG doesn't load
      logo.onerror = () => {
        const fallback = document.createElement('div');
        fallback.style.width = '60px';
        fallback.style.height = '60px';
        fallback.style.borderRadius = '50%';
        fallback.style.background = `linear-gradient(45deg, ${primaryColor}, ${accentColor})`;
        fallback.style.display = 'flex';
        fallback.style.alignItems = 'center';
        fallback.style.justifyContent = 'center';
        fallback.style.fontSize = '28px';
        fallback.style.fontWeight = 'bold';
        fallback.style.color = 'white';
        fallback.style.fontFamily = 'Arial, sans-serif';
        fallback.textContent = 'S';
        fallback.style.opacity = '0.8';
        fallback.style.filter = `hue-rotate(${Math.random() * 360}deg) brightness(1.8) saturate(1.5)`;
        fallback.style.animation = `logoSpin ${6 + Math.random() * 8}s linear infinite`;
        fallback.style.boxShadow = `0 0 40px ${primaryColor}90, 0 0 80px ${primaryColor}60, 0 0 120px ${primaryColor}30`;
        fallback.style.border = `3px solid ${primaryColor}50`;
        logoContainer.replaceChild(fallback, logo);
      };
      
      logoContainer.appendChild(logo);
      geometricRef.current.appendChild(logoContainer);
    }
  };

  // Mouse tracking for 3D effects
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = section.querySelectorAll('.feature-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    };

    const handleMouseLeave = () => {
      const cards = section.querySelectorAll('.feature-card');
      cards.forEach((card) => {
        (card as HTMLElement).style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    };

    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Initialize animations
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🎬 Initializing FeaturesListLayout animations...');
      createDNABases();
      createParticles();
      createGeometricShapes();
      console.log('✅ All animations initialized');
    }, 100);

    return () => clearTimeout(timer);
  }, [primaryColor, secondaryColor, accentColor, faviconUrl]);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      if (dnaRef.current) {
        dnaRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
      if (particlesRef.current) {
        particlesRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
      if (geometricRef.current) {
        geometricRef.current.style.transform = `translateY(${scrolled * 0.2}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 overflow-hidden"
      style={{ 
        backgroundColor: backgroundColor,
        fontFamily: designSystem?.fontFamily || 'Manrope, sans-serif'
      }}
    >
      {/* Content */}
      <div className="relative z-50 max-w-7xl mx-auto px-6">
        {/* Simple Header */}
        <div className="text-center mb-16">
          <h1 
            className="text-4xl md:text-6xl font-bold mb-8"
            style={{ color: textPrimary }}
          >
            {heading}
          </h1>
          {subheading && (
            <p 
              className="text-xl md:text-2xl max-w-4xl mx-auto"
              style={{ color: textSecondary }}
            >
              {subheading}
            </p>
          )}
        </div>

        {/* Animation Container - starts below heading */}
        <div className="relative min-h-screen">
          {/* Full Width Animation Layer - positioned absolutely to extend beyond container */}
          <div className="absolute inset-0 pointer-events-none" style={{ left: '-50vw', width: '200vw', top: '0' }}>
            {/* Full Width Background Gradient Animation */}
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 20% 50%, ${primaryColor}10 0%, transparent 50%), 
                           radial-gradient(ellipse at 80% 20%, ${accentColor}10 0%, transparent 50%),
                           radial-gradient(ellipse at 40% 80%, ${secondaryColor}10 0%, transparent 50%)`,
                animation: 'gradientShift 20s ease-in-out infinite'
              }}
            />

            {/* DNA Helix Background - Full Width */}
            <div 
              ref={dnaRef}
              className="absolute inset-0"
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="dna-strand absolute w-1 h-full"
                  style={{
                    left: `${25 + i * 6.25}%`,
                    background: `linear-gradient(to bottom, ${primaryColor}, ${accentColor}, ${primaryColor})`,
                    animation: `dnaRotate 8s linear infinite ${-i * 2}s`
                  }}
                />
              ))}
            </div>

            {/* Particle Field - Full Width */}
            <div 
              ref={particlesRef}
              className="absolute inset-0"
            />

            {/* Geometric Background - Full Width */}
            <div 
              ref={geometricRef}
              className="absolute inset-0"
            />

            {/* Wave Animation - Full Width */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-[120px]"
                  style={{
                    top: `${10 + i * 12}%`,
                    left: '0%',
                    width: '100%',
                    background: `linear-gradient(90deg, transparent, ${primaryColor}15, ${primaryColor}30, ${primaryColor}15, transparent)`,
                    animation: `waveMove ${6 + i * 1.5}s linear infinite ${-i * 1.5}s`,
                    borderRadius: '60px'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="relative z-50 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-16">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="feature-card relative rounded-3xl p-10 cursor-pointer overflow-hidden"
                style={{
                  background: `rgba(255, 255, 255, 0.05)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  animation: `fadeInUp 0.8s ease-out forwards ${index * 0.1}s`,
                  opacity: 0
                }}
              >
                {/* Rotating Border Effect */}
                <div 
                  className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-0 transition-opacity duration-500"
                  style={{
                    background: `conic-gradient(from 0deg, ${primaryColor}, ${accentColor}, ${secondaryColor}, ${primaryColor})`,
                    animation: 'rotate 4s linear infinite'
                  }}
                />
                
                {/* Card Background */}
                <div 
                  className="absolute inset-0.5 rounded-3xl z-10"
                  style={{ backgroundColor: backgroundPrimary }}
                />

                {/* Content */}
                <div className="relative z-20">
                  {/* Morphing Icon */}
                  <div className="w-20 h-20 mx-auto mb-8 relative flex items-center justify-center">
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `linear-gradient(45deg, ${primaryColor}, ${index % 2 === 0 ? secondaryColor : accentColor})`,
                        animation: 'morphIcon 6s ease-in-out infinite'
                      }}
                    />
                    <div className="relative z-10 text-white">
                      {getIconComponent(feature.iconName)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-2xl font-bold mb-6 text-center"
                    style={{ color: textPrimary }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p 
                    className="text-center text-lg leading-relaxed mb-8"
                    style={{ color: textSecondary }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes dnaRotate {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        @keyframes dnaPulse {
          0%, 100% { opacity: 0.3; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.5); }
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes waveMove {
          0% { transform: translateX(-100%) skewY(-3deg) scale(0.8); }
          50% { transform: translateX(0%) skewY(3deg) scale(1.2); }
          100% { transform: translateX(100%) skewY(-3deg) scale(0.8); }
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes morphIcon {
          0%, 100% { 
            border-radius: 50%;
            transform: rotate(0deg) scale(1);
          }
          25% { 
            border-radius: 30%;
            transform: rotate(90deg) scale(1.1);
          }
          50% { 
            border-radius: 20%;
            transform: rotate(180deg) scale(0.9);
          }
          75% { 
            border-radius: 40%;
            transform: rotate(270deg) scale(1.05);
          }
        }

        @keyframes geometryFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-50px) rotate(180deg);
            opacity: 0.8;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            transform: rotate(0deg) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: rotate(120deg) scale(1.1);
            opacity: 0.5;
          }
          66% {
            transform: rotate(240deg) scale(0.9);
            opacity: 0.4;
          }
        }
          0%, 100% {
            transform: rotate(0deg) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: rotate(120deg) scale(1.1);
            opacity: 0.5;
          }
          66% {
            transform: rotate(240deg) scale(0.9);
            opacity: 0.4;
          }
        }

        @keyframes logoFloat {
          0% {
            transform: translateY(120vh) translateX(-50px) rotate(0deg) scale(0.3);
            opacity: 0;
          }
          5% {
            opacity: 0.8;
          }
          25% {
            transform: translateY(80vh) translateX(50px) rotate(90deg) scale(0.8);
            opacity: 1;
          }
          50% {
            transform: translateY(40vh) translateX(-30px) rotate(180deg) scale(1.2);
            opacity: 0.9;
          }
          75% {
            transform: translateY(20vh) translateX(40px) rotate(270deg) scale(0.9);
            opacity: 0.8;
          }
          95% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-30vh) translateX(-40px) rotate(360deg) scale(0.3);
            opacity: 0;
          }
        }

        @keyframes logoSpin {
          0% { 
            transform: rotate(0deg) scale(1);
            filter: hue-rotate(0deg) brightness(1.5) saturate(1.2);
          }
          25% { 
            transform: rotate(90deg) scale(1.3);
            filter: hue-rotate(90deg) brightness(2) saturate(1.5);
          }
          50% { 
            transform: rotate(180deg) scale(0.7);
            filter: hue-rotate(180deg) brightness(1.2) saturate(1);
          }
          75% { 
            transform: rotate(270deg) scale(1.1);
            filter: hue-rotate(270deg) brightness(1.8) saturate(1.3);
          }
          100% { 
            transform: rotate(360deg) scale(1);
            filter: hue-rotate(360deg) brightness(1.5) saturate(1.2);
          }
        }

        .feature-card:hover {
          transform: translateY(-20px) scale(1.05) !important;
          box-shadow: 0 40px 80px ${primaryColor}30;
        }

        .feature-card:hover > div:first-child {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .feature-card {
            padding: 30px;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturesListLayout;
 
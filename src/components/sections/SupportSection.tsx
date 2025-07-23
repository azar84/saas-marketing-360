'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Sun, Moon, MessageSquare } from 'lucide-react';

interface SupportSectionProps {
  heading?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  className?: string;
}

const SupportSection: React.FC<SupportSectionProps> = ({
  heading = "Real-Time, Always-On Support",
  title = "No Delays. No Queues. Just Instant Answers.",
  description = "Whether it's 2 PM or 2 AM, Saski AI answers instantly—no wait, no backlog. Your customers get support, and you stay focused on growth.",
  imageUrl = "https://saskiai.com/wp-content/uploads/2025/06/ChatGPT-Image-Jun-5-2025-at-09_59_27-AM-1.png",
  imageAlt = "Real-time AI customer support illustration showing instant responses across multiple channels",
  className = ""
}) => {
  return (
    <>
      <section className={`bg-gradient-to-b from-[#F6F8FC] to-[#FBFBFB] py-20 ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Section Badge */}
              <div className="inline-block px-3 py-1 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-light-200)] rounded-full mb-6" style={{fontFamily: 'Manrope, sans-serif'}}>
                {heading}
              </div>
              
              {/* Main Heading */}
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-dark-900)] leading-tight tracking-normal mb-6" style={{fontFamily: 'Manrope, sans-serif'}}>
                {title}
              </h2>
              
              {/* Description */}
              <p className="text-[var(--color-dark-600)] leading-relaxed mb-8 lg:max-w-xl" style={{fontFamily: 'Manrope, sans-serif'}}>
                {description}
              </p>
              
              {/* Feature List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0 mb-8">
                {[
                  "24/7 Availability",
                  "Instant Response Time", 
                  "Multi-Channel Support",
                  "Zero Queue Wait"
                ].map((feature, index) => (
                  <div key={`support-feature-${index}`} className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[var(--color-light-200)] text-[var(--color-primary)] flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-[var(--color-dark-700)]" style={{fontFamily: 'Manrope, sans-serif'}}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Always-On Badge */}
              <div className="flex justify-center lg:justify-start">
                <span className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-light-200)] px-3 py-1 rounded-full" style={{fontFamily: 'Manrope, sans-serif'}}>
                  Online
                </span>
              </div>
            </div>
            
            {/* Animated Visual Section */}
            <div className="flex-1 relative">
              {/* Day/Night Animation Container */}
              <div className="relative w-full h-96 overflow-hidden rounded-2xl">
                {/* Dynamic Background - Changes from light to dark */}
                <div className="absolute inset-0 rounded-2xl transition-all duration-3000 ease-in-out day-night-bg"></div>
                
                {/* Sun/Moon Orbit Container - Centered around image */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                  <div className="relative w-80 h-80 rounded-full">
                    {/* Orbiting Path */}
                    <div className="absolute inset-0 orbit-path">
                      {/* Sun */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sun-position transition-all duration-1000 ease-in-out">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg sun-glow">
                          <Sun className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      {/* Moon */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 moon-position transition-all duration-1000 ease-in-out opacity-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full flex items-center justify-center shadow-lg moon-glow">
                          <Moon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Main Support Image - Centered */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="relative max-w-sm">
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      width={400}
                      height={300}
                      className="w-full h-auto rounded-xl shadow-2xl"
                      priority
                    />
                    
                    {/* Time Indicators - Floating around image */}
                    <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 animate-bounce time-indicator">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-[var(--color-dark-700)]" style={{fontFamily: 'Manrope, sans-serif'}}>6:00 AM</span>
                      </div>
                    </div>
                    
                    <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 animate-pulse time-indicator">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-ping"></div>
                        <span className="text-sm font-medium text-[var(--color-dark-700)]" style={{fontFamily: 'Manrope, sans-serif'}}>6:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Light Rays - Only visible during day */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 light-rays opacity-100 transition-opacity duration-1000">
                  <div className="w-1 h-16 bg-gradient-to-b from-yellow-200/60 to-transparent transform rotate-12"></div>
                  <div className="absolute w-1 h-12 bg-gradient-to-b from-yellow-200/40 to-transparent transform -rotate-12 left-2"></div>
                  <div className="absolute w-1 h-14 bg-gradient-to-b from-yellow-200/50 to-transparent transform rotate-45 -left-2"></div>
                </div>
                
                {/* Enhanced Stars - Only visible during night */}
                <div className="absolute inset-0 stars opacity-0 transition-opacity duration-1000">
                  {/* Large twinkling stars */}
                  <div className="absolute top-8 left-12 star-large"></div>
                  <div className="absolute top-12 right-16 star-medium" style={{animationDelay: '0.7s'}}></div>
                  <div className="absolute top-20 left-20 star-small" style={{animationDelay: '1.2s'}}></div>
                  <div className="absolute top-16 right-8 star-large" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute top-28 left-8 star-medium" style={{animationDelay: '1.8s'}}></div>
                  <div className="absolute top-32 right-24 star-small" style={{animationDelay: '0.9s'}}></div>
                  <div className="absolute top-24 left-32 star-large" style={{animationDelay: '2.1s'}}></div>
                  <div className="absolute top-36 right-12 star-medium" style={{animationDelay: '1.5s'}}></div>
                  
                  {/* Smaller scattered stars */}
                  <div className="absolute top-14 left-24 star-tiny" style={{animationDelay: '0.4s'}}></div>
                  <div className="absolute top-22 right-32 star-tiny" style={{animationDelay: '1.1s'}}></div>
                  <div className="absolute top-30 left-16 star-tiny" style={{animationDelay: '1.7s'}}></div>
                  <div className="absolute top-18 right-20 star-tiny" style={{animationDelay: '0.8s'}}></div>
                  <div className="absolute top-26 left-28 star-tiny" style={{animationDelay: '2.3s'}}></div>
                  <div className="absolute top-34 right-16 star-tiny" style={{animationDelay: '1.4s'}}></div>
                </div>
              </div>
            </div>
            
            {/* Custom CSS for Day/Night Animation */}
            <style jsx>{`
              @keyframes dayNightCycle {
                0%, 50% {
                  background: linear-gradient(135deg, #FEFEFE 0%, #F8FAFC 50%, #F1F5F9 100%);
                }
                50.1%, 100% {
                  background: linear-gradient(135deg, #1E293B 0%, #334155 50%, #475569 100%);
                }
              }
              
              @keyframes sunOrbit {
                0% { 
                  transform: translateX(-170px) translateY(0px);
                  opacity: 1;
                }
                12.5% { 
                  transform: translateX(-120px) translateY(-120px);
                  opacity: 1;
                }
                25% { 
                  transform: translateX(0px) translateY(-170px);
                  opacity: 1;
                }
                37.5% { 
                  transform: translateX(120px) translateY(-120px);
                  opacity: 1;
                }
                50% { 
                  transform: translateX(170px) translateY(0px);
                  opacity: 1;
                }
                50.1% { 
                  transform: translateX(170px) translateY(0px);
                  opacity: 0;
                }
                62.5% { 
                  transform: translateX(120px) translateY(120px);
                  opacity: 0;
                }
                75% { 
                  transform: translateX(0px) translateY(170px);
                  opacity: 0;
                }
                87.5% { 
                  transform: translateX(-120px) translateY(120px);
                  opacity: 0;
                }
                100% { 
                  transform: translateX(-170px) translateY(0px);
                  opacity: 1;
                }
              }
              
              @keyframes moonOrbit {
                0% { 
                  transform: translateX(-170px) translateY(0px);
                  opacity: 0;
                }
                12.5% { 
                  transform: translateX(-120px) translateY(-120px);
                  opacity: 0;
                }
                25% { 
                  transform: translateX(0px) translateY(-170px);
                  opacity: 0;
                }
                37.5% { 
                  transform: translateX(120px) translateY(-120px);
                  opacity: 0;
                }
                50% { 
                  transform: translateX(170px) translateY(0px);
                  opacity: 0;
                }
                50.1% { 
                  transform: translateX(170px) translateY(0px);
                  opacity: 1;
                }
                62.5% { 
                  transform: translateX(120px) translateY(120px);
                  opacity: 1;
                }
                75% { 
                  transform: translateX(0px) translateY(170px);
                  opacity: 1;
                }
                87.5% { 
                  transform: translateX(-120px) translateY(120px);
                  opacity: 1;
                }
                100% { 
                  transform: translateX(-170px) translateY(0px);
                  opacity: 1;
                }
              }
              
              @keyframes sunGlow {
                0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.6); }
                50% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.9); }
              }
              
              @keyframes moonGlow {
                0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
                50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.9); }
              }
              
              @keyframes lightRaysToggle {
                0%, 50% { opacity: 1; }
                50.1%, 100% { opacity: 0; }
              }
              
              @keyframes starsToggle {
                0%, 50% { opacity: 0; }
                50.1%, 100% { opacity: 1; }
              }
              
              @keyframes starTwinkle {
                0%, 100% { 
                  opacity: 0.3; 
                  transform: scale(0.8) rotate(0deg);
                }
                50% { 
                  opacity: 1; 
                  transform: scale(1.2) rotate(180deg);
                }
              }
              
              @keyframes starSparkle {
                0%, 100% { 
                  opacity: 0.4;
                  transform: scale(0.6) rotate(0deg);
                  box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
                }
                25% { 
                  opacity: 0.8;
                  transform: scale(1) rotate(90deg);
                  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
                }
                75% { 
                  opacity: 0.6;
                  transform: scale(0.8) rotate(270deg);
                  box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
                }
              }
              
              .day-night-bg {
                animation: dayNightCycle 12s ease-in-out infinite;
              }
              
              .sun-position {
                animation: sunOrbit 12s ease-in-out infinite;
              }
              
              .moon-position {
                animation: moonOrbit 12s ease-in-out infinite;
              }
              
              .sun-glow {
                animation: sunGlow 3s ease-in-out infinite;
              }
              
              .moon-glow {
                animation: moonGlow 3s ease-in-out infinite;
              }
              
              .light-rays {
                animation: lightRaysToggle 12s ease-in-out infinite;
              }
              
              .stars {
                animation: starsToggle 12s ease-in-out infinite;
              }
              
              .time-indicator {
                backdrop-filter: blur(8px);
              }
              
              /* Enhanced Star Styles */
              .star-large {
                width: 6px;
                height: 6px;
                background: radial-gradient(circle, #ffffff 0%, #e0e7ff 70%, transparent 100%);
                border-radius: 50%;
                position: relative;
                animation: starTwinkle 3s ease-in-out infinite;
              }
              
              .star-large::before,
              .star-large::after {
                content: '';
                position: absolute;
                background: linear-gradient(45deg, transparent 30%, #ffffff 50%, transparent 70%);
                border-radius: 2px;
              }
              
              .star-large::before {
                width: 12px;
                height: 1px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              
              .star-large::after {
                width: 1px;
                height: 12px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              
              .star-medium {
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #ffffff 0%, #ddd6fe 60%, transparent 100%);
                border-radius: 50%;
                position: relative;
                animation: starSparkle 2.5s ease-in-out infinite;
              }
              
              .star-medium::before,
              .star-medium::after {
                content: '';
                position: absolute;
                background: linear-gradient(45deg, transparent 40%, #ffffff 50%, transparent 60%);
                border-radius: 1px;
              }
              
              .star-medium::before {
                width: 8px;
                height: 0.8px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              
              .star-medium::after {
                width: 0.8px;
                height: 8px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              
              .star-small {
                width: 3px;
                height: 3px;
                background: radial-gradient(circle, #ffffff 0%, #c7d2fe 50%, transparent 100%);
                border-radius: 50%;
                position: relative;
                animation: starTwinkle 2s ease-in-out infinite;
              }
              
              .star-small::before,
              .star-small::after {
                content: '';
                position: absolute;
                background: linear-gradient(45deg, transparent 45%, #ffffff 50%, transparent 55%);
                border-radius: 0.5px;
              }
              
              .star-small::before {
                width: 6px;
                height: 0.6px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              
              .star-small::after {
                width: 0.6px;
                height: 6px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              
              .star-tiny {
                width: 2px;
                height: 2px;
                background: radial-gradient(circle, #ffffff 0%, #a5b4fc 40%, transparent 100%);
                border-radius: 50%;
                animation: starSparkle 1.8s ease-in-out infinite;
                box-shadow: 0 0 3px rgba(255, 255, 255, 0.4);
              }
            `}</style>
          </div>
        </div>
      </section>
      

    </>
  );
};

export default SupportSection; 

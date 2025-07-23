'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Video, Globe, MessageSquare, Mic } from 'lucide-react';

interface ConversationSectionProps {
  heading?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  className?: string;
}

const ConversationSection: React.FC<ConversationSectionProps> = ({
  heading = "Smarter Conversations, Less Work",
  title = "Your AI Assistant. Everywhere Your Customers Are.",
  description = "Saski AI responds on SMS, WhatsApp, voice, chat, and social platforms — instantly capturing leads, solving support issues, and syncing with your CRM.",
  imageUrl = "https://saskiai.com/wp-content/uploads/2025/06/ChatGPT-Image-Jun-1-2025-at-08_09_09-AM.png",
  imageAlt = "3D illustration of Saski AI assistant interface automating customer support tasks including chat replies, CRM updates, appointment confirmations, and ticket creation across WhatsApp, Messenger, SMS, and voice channels.",
  className = ""
}) => {
  const channels = [
    { icon: MessageCircle, name: 'SMS & WhatsApp', color: '#25D366' },
    { icon: Phone, name: 'Voice Calls', color: '#5243E9' },
    { icon: MessageSquare, name: 'Facebook Messenger', color: '#0084FF' },
    { icon: Globe, name: 'Website Chat', color: '#6366F1' }
  ];

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Enhanced 3D Device */}
          <div className="relative order-2 lg:order-1">
            {/* Immersive Glow Effect */}
            <div className="absolute inset-0 bg-[var(--color-primary)] opacity-20 blur-[80px] rounded-full scale-110" />
            
            {/* Glass Base */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-80 h-8 bg-gradient-to-r from-transparent via-[#5243E9] to-transparent opacity-10 backdrop-blur-md rounded-full" />
            
            {/* Main Device Container */}
            <div className="relative aspect-[2/3] max-w-md mx-auto lg:mx-0">
              {/* 3D Device with Glass Effect */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden backdrop-blur-md bg-white/10 shadow-2xl border border-white/20">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  priority={false}
                />
                
                {/* AI Activity Indicator */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-gray-700">AI Active</span>
                  </div>
                </div>

                {/* Typing Animation */}
                <div className="absolute bottom-6 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 bg-[var(--color-primary)] rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-[var(--color-primary)] rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-[var(--color-primary)] rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">AI is typing...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Channel Icons */}
              <motion.div
                className="absolute -top-4 -right-4 w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </motion.div>

              <motion.div
                className="absolute top-1/3 -left-6 w-10 h-10 bg-[#0084FF] rounded-lg flex items-center justify-center shadow-lg"
                animate={{ x: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </motion.div>

              <motion.div
                className="absolute bottom-1/4 -right-6 w-11 h-11 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Mic className="w-5 h-5 text-white" />
              </motion.div>
            </div>
            
            {/* Enhanced Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-[#5243E9]/20 via-[#6366F1]/15 to-transparent rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-gradient-to-tl from-[#8B5CF6]/20 via-[#A855F7]/15 to-transparent rounded-full blur-2xl" />
          </div>

          {/* Right Column - Enhanced Content */}
          <div className="space-y-6 lg:pl-8 order-1 lg:order-2">
            <div className="space-y-4">
              <motion.h4 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {heading}
              </motion.h4>
              
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {title}
              </motion.h3>
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 leading-relaxed"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {description}
            </motion.p>

            {/* Enhanced Channel Cards */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              {channels.map((channel, index) => {
                const IconComponent = channel.icon;
                return (
                  <motion.div
                    key={channel.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="group bg-[var(--color-light-100)] hover:bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-[var(--color-primary)]/20"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: `${channel.color}20` }}
                      >
                        <IconComponent 
                          className="w-4 h-4 transition-colors duration-300" 
                          style={{ color: channel.color }}
                        />
                      </div>
                      <span 
                        className="text-sm font-medium text-gray-700 group-hover:text-[var(--color-primary)] transition-colors duration-300"
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
                        {channel.name}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* "Fully Automated" Badge with Speech Bubble */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="relative inline-flex items-center gap-3 bg-gradient-to-r from-[#5243E9] to-[#6366F1] text-white px-6 py-3 rounded-full shadow-lg"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Fully Automated
              </span>
              
              {/* Speech Bubble Animation */}
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageCircle className="w-3 h-3 text-[var(--color-primary)]" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConversationSection; 

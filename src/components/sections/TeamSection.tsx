'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Linkedin, 
  Twitter, 
  Github, 
  Globe, 
  Mail,
  ExternalLink,
  Phone
} from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio?: string;
  photoUrl?: string;
  photoAlt?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

interface TeamSectionProps {
  heading: string;
  subheading?: string;
  layoutType: 'grid' | 'staggered' | 'list';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundOverlay?: string;
  headingColor?: string;
  subheadingColor?: string;
  cardBackgroundColor?: string;
  photoBackgroundColor?: string;
  nameColor?: string;
  positionColor?: string;
  bioColor?: string;
  socialTextColor?: string;
  socialBackgroundColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  containerMaxWidth?: string;
  teamMembers: TeamMember[];
  className?: string;
}

export default function TeamSection({
  heading,
  subheading,
  layoutType = 'grid',
  backgroundColor = '#ffffff',
  backgroundImage,
  backgroundSize = 'cover',
  backgroundOverlay = 'rgba(0,0,0,0.5)',
  headingColor = '#000000',
  subheadingColor = '#666666',
  cardBackgroundColor = '#ffffff',
  photoBackgroundColor = '#f3f4f6',
  nameColor = '#000000',
  positionColor = '#666666',
  bioColor = '#333333',
  socialTextColor = '#000000',
  socialBackgroundColor = '#f3f4f6',
  paddingTop = 96,
  paddingBottom = 96,
  containerMaxWidth = 'xl',
  teamMembers = [],
  className = ''
}: TeamSectionProps) {
  const getContainerMaxWidth = () => {
    switch (containerMaxWidth) {
      case '2xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-6xl';
    }
  };

  const getLayoutClasses = (memberCount: number) => {
    switch (layoutType) {
      case 'grid':
        // Dynamic columns based on member count
        if (memberCount === 1) return 'grid grid-cols-1 gap-8 justify-items-center';
        if (memberCount === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center';
        if (memberCount === 3) return 'grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center';
        if (memberCount === 4) return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center';
        // For 5+ members, use responsive grid
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center';
      case 'staggered':
        return 'space-y-12';
      case 'list':
        return 'space-y-6';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center';
    }
  };

  const renderSocialLinks = (member: TeamMember, layoutType: string = 'grid') => {
    const socialLinks = [
      { url: member.linkedinUrl, icon: Linkedin, label: 'LinkedIn' },
      { url: member.twitterUrl, icon: Twitter, label: 'Twitter' },
      { url: member.githubUrl, icon: Github, label: 'GitHub' },
      { url: member.websiteUrl, icon: Globe, label: 'Website' }
    ].filter(link => link.url);

    if (socialLinks.length === 0) return null;

    return (
      <div className="flex space-x-2">
        {socialLinks.map((link, index) => (
          <motion.a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full transition-colors"
            style={{
              backgroundColor: socialBackgroundColor,
              color: socialTextColor
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={link.label}
          >
            <link.icon className="w-4 h-4" />
          </motion.a>
        ))}
      </div>
    );
  };

  const renderContactInfo = (member: TeamMember) => {
    const contactItems = [];
    
    if (member.email) {
      contactItems.push(
        <a
          key="email"
          href={`mailto:${member.email}`}
          className="flex items-center space-x-3 text-base hover:opacity-80 transition-opacity font-medium"
          style={{ color: socialTextColor }}
        >
          <Mail className="w-5 h-5" />
          <span>{member.email}</span>
        </a>
      );
    }
    
    if (member.phone) {
      contactItems.push(
        <a
          key="phone"
          href={`tel:${member.phone}`}
          className="flex items-center space-x-3 text-base hover:opacity-80 transition-opacity font-medium"
          style={{ color: socialTextColor }}
        >
          <Phone className="w-5 h-5" />
          <span>{member.phone}</span>
        </a>
      );
    }

    if (contactItems.length === 0) return null;

    return (
      <div className="space-y-2">
        {contactItems}
      </div>
    );
  };

  const renderGridMember = (member: TeamMember, index: number) => (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 w-full max-w-sm p-2"
      style={{ backgroundColor: photoBackgroundColor }}
    >
      {/* Square Photo Section */}
      <div className="mb-4">
        <div className="aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.photoAlt || member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      
      {/* Content Section */}
      <div style={{ backgroundColor: cardBackgroundColor }} className="rounded-lg">
        <div className="p-4">
          {/* Name and Role with Social Icons */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1" style={{ color: nameColor }}>{member.name}</h3>
              <p className="text-base" style={{ color: positionColor }}>{member.position}</p>
            </div>
            <div className="flex space-x-2 ml-3">
              {renderSocialLinks(member, 'grid')}
            </div>
          </div>
          
          {/* Contact Information */}
          {renderContactInfo(member)}
          
          {/* Bio */}
          {member.bio && (
            <p className="text-sm leading-relaxed" style={{ color: bioColor }}>{member.bio}</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderStaggeredMember = (member: TeamMember, index: number) => (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`flex items-center space-x-8 p-3 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${
        index % 2 === 1 ? 'flex-row-reverse space-x-reverse' : ''
      }`}
      style={{ backgroundColor: photoBackgroundColor }}
    >
      <div className="flex-shrink-0">
        <div className="w-56 h-56 rounded-full overflow-hidden p-2" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.photoAlt || member.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 rounded-lg" style={{ backgroundColor: cardBackgroundColor }}>
        <div className="p-4">
          <h3 className="text-2xl font-bold mb-2" style={{ color: nameColor }}>{member.name}</h3>
          <p className="text-lg mb-4" style={{ color: positionColor }}>{member.position}</p>
          
          {/* Contact Information */}
          {renderContactInfo(member)}
          
          {member.bio && (
            <p className="leading-relaxed mb-4" style={{ color: bioColor }}>{member.bio}</p>
          )}
          {renderSocialLinks(member, 'staggered')}
        </div>
      </div>
    </motion.div>
  );

  const renderListMember = (member: TeamMember, index: number) => (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ 
        y: -4,
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      className="flex items-start space-x-8 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
      style={{ backgroundColor: cardBackgroundColor }}
    >
      {/* Photo Section */}
      <div className="flex-shrink-0">
        <div className="w-40 h-40 rounded-full overflow-hidden shadow-md" style={{ backgroundColor: photoBackgroundColor }}>
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.photoAlt || member.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        {/* Header with Name, Position, and Social Links */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold mb-2" style={{ color: nameColor }}>{member.name}</h3>
            <p className="text-lg font-medium mb-3" style={{ color: positionColor }}>{member.position}</p>
          </div>
          <div className="flex-shrink-0 ml-4">
            {renderSocialLinks(member, 'list')}
          </div>
        </div>

        {/* Contact Information */}
        {renderContactInfo(member)}
        
        {/* Bio */}
        {member.bio && (
          <div className="mt-4">
            <p className="text-base leading-relaxed" style={{ color: bioColor }}>{member.bio}</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderMembers = () => {
    const activeMembers = teamMembers.filter(member => member.isActive);
    const memberCount = activeMembers.length;
    
    switch (layoutType) {
      case 'grid':
        return (
          <div className="flex justify-center">
            <div className={getLayoutClasses(memberCount)}>
              {activeMembers.map((member, index) => renderGridMember(member, index))}
            </div>
          </div>
        );
      case 'staggered':
        return (
          <div className={getLayoutClasses(memberCount)}>
            {activeMembers.map((member, index) => renderStaggeredMember(member, index))}
          </div>
        );
      case 'list':
        return (
          <div className={getLayoutClasses(memberCount)}>
            {activeMembers.map((member, index) => renderListMember(member, index))}
          </div>
        );
      default:
        return (
          <div className="flex justify-center">
            <div className={getLayoutClasses(memberCount)}>
              {activeMembers.map((member, index) => renderGridMember(member, index))}
            </div>
          </div>
        );
    }
  };

  return (
    <section
      className={`${className} relative`}
              style={{
          backgroundColor,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: backgroundSize,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`
        }}
    >
              {/* Background Overlay */}
        {backgroundOverlay && (
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: backgroundOverlay,
              opacity: 0.1
            }}
          />
        )}
      
      {/* Content */}
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${getContainerMaxWidth()} relative z-10`}>
        {/* Title and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: headingColor }}
          >
            {heading}
          </h2>
          {subheading && (
            <p 
              className="text-xl md:text-2xl max-w-3xl mx-auto"
              style={{ color: subheadingColor }}
            >
              {subheading}
            </p>
          )}
        </motion.div>

        {renderMembers()}
      </div>

              {/* Layout content */}
    </section>
  );
}
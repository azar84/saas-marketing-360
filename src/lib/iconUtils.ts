import React from 'react';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io';
import * as BiIcons from 'react-icons/bi';

interface IconLibraries {
  [key: string]: { [iconName: string]: React.ComponentType<any> };
}

// Define available icon libraries
const iconLibraries: IconLibraries = {
  lucide: LucideIcons as any,
  'react-icons-fa': FaIcons as any,
  'react-icons-md': MdIcons as any,
  'react-icons-io': IoIcons as any,
  'react-icons-bi': BiIcons as any,
};

/**
 * Get icon component from icon string (format: "library:iconName")
 */
export const getIconComponent = (iconString: string): React.ComponentType<any> | null => {
  if (!iconString || !iconString.includes(':')) {
    // Fallback to Lucide if no library specified
    return (LucideIcons as any)[iconString] || null;
  }

  const [library, iconName] = iconString.split(':');
  const libraryIcons = iconLibraries[library];
  
  if (!libraryIcons) {
    console.warn(`Icon library "${library}" not found`);
    return null;
  }

  return libraryIcons[iconName] || null;
};

/**
 * Render an icon from icon string
 */
export const renderIcon = (
  iconString: string, 
  props: React.ComponentProps<'svg'> = {}
): React.ReactElement | null => {
  const IconComponent = getIconComponent(iconString);
  
  if (!IconComponent) {
    console.warn(`Icon "${iconString}" not found`);
    return null;
  }

  return React.createElement(IconComponent, props);
};

/**
 * Get all available icon libraries
 */
export const getIconLibraries = () => {
  return Object.keys(iconLibraries).map(library => ({
    name: library,
    iconCount: Object.keys(iconLibraries[library]).length,
    description: getLibraryDescription(library)
  }));
};

/**
 * Get library description
 */
const getLibraryDescription = (library: string): string => {
  const descriptions: { [key: string]: string } = {
    lucide: 'Beautiful & consistent icons',
    'react-icons-fa': 'Font Awesome icons',
    'react-icons-md': 'Material Design icons',
    'react-icons-io': 'Ionicons',
    'react-icons-bi': 'Bootstrap icons',
  };
  
  return descriptions[library] || library;
};

/**
 * Search icons across all libraries
 */
export const searchIcons = (searchTerm: string, limit: number = 50) => {
  const results: Array<{ library: string; iconName: string; component: React.ComponentType<any> }> = [];
  
  Object.entries(iconLibraries).forEach(([library, icons]) => {
    Object.entries(icons).forEach(([iconName, component]) => {
      if (iconName.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({ library, iconName, component });
        if (results.length >= limit) return;
      }
    });
  });
  
  return results;
};

/**
 * Get popular icons for quick selection
 */
export const getPopularIcons = () => {
  const popularIconNames = [
    'lucide:home', 'lucide:user', 'lucide:settings', 'lucide:search', 'lucide:heart',
    'lucide:star', 'lucide:check', 'lucide:x', 'lucide:plus', 'lucide:minus',
    'lucide:arrow-right', 'lucide:arrow-left', 'lucide:download', 'lucide:upload',
    'lucide:mail', 'lucide:phone', 'lucide:message-circle', 'lucide:calendar',
    'react-icons-fa:FaHome', 'react-icons-fa:FaUser', 'react-icons-fa:FaCog',
    'react-icons-md:MdSearch', 'react-icons-md:MdFavorite', 'react-icons-md:MdStar'
  ];

  return popularIconNames
    .map(iconString => {
      const component = getIconComponent(iconString);
      if (!component) return null;
      
      const [library, iconName] = iconString.split(':');
      return { library, iconName, component, iconString };
    })
    .filter(Boolean);
};

/**
 * Validate icon string format
 */
export const isValidIconString = (iconString: string): boolean => {
  if (!iconString || !iconString.includes(':')) return false;
  
  const [library, iconName] = iconString.split(':');
  const libraryIcons = iconLibraries[library];
  
  return !!(libraryIcons && libraryIcons[iconName]);
};

/**
 * Convert old icon format to new format
 */
export const convertIconFormat = (oldIcon: string): string => {
  // If it's already in new format, return as is
  if (oldIcon.includes(':')) return oldIcon;
  
  // If it's a Lucide icon name, convert to new format
  if ((LucideIcons as any)[oldIcon]) {
    return `lucide:${oldIcon}`;
  }
  
  // If it's a React Icons name, try to find the library
  for (const [library, icons] of Object.entries(iconLibraries)) {
    if (library !== 'lucide' && icons[oldIcon]) {
      return `${library}:${oldIcon}`;
    }
  }
  
  // If not found, return as is (will be treated as Lucide)
  return oldIcon;
}; 
'use client';

import React, { useState } from 'react';
import UniversalIconPicker from './UniversalIconPicker';
import { renderIcon } from '../../lib/iconUtils';

const IconPickerExample: React.FC = () => {
  const [selectedIcon, setSelectedIcon] = useState<string>('lucide:home');

  const handleIconChange = (iconName: string, iconComponent: React.ComponentType<any>, library: string) => {
    setSelectedIcon(iconName);
    console.log('Selected icon:', iconName, 'from library:', library);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Icon Picker Example</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select an Icon
          </label>
          <UniversalIconPicker
            value={selectedIcon}
            onChange={handleIconChange}
            placeholder="Choose an icon..."
            className="w-full"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Icon:</h3>
          <div className="flex items-center space-x-3">
            {selectedIcon && renderIcon(selectedIcon, { className: 'w-8 h-8 text-blue-600' })}
            <span className="text-sm text-gray-600">{selectedIcon}</span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 mb-2">Usage Example:</h3>
          <pre className="text-xs text-blue-800 bg-blue-100 p-2 rounded overflow-x-auto">
{`// In your component:
const [icon, setIcon] = useState('lucide:home');

<UniversalIconPicker
  value={icon}
  onChange={(iconName, iconComponent, library) => {
    setIcon(iconName);
  }}
/>

// To render the icon:
import { renderIcon } from '@/lib/iconUtils';
{renderIcon(icon, { className: 'w-6 h-6' })}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default IconPickerExample; 
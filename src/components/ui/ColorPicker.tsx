import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from './Button';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  designSystemColors?: Array<{ name: string; value: string; description?: string }>;
  allowTransparent?: boolean;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  designSystemColors = [],
  allowTransparent = false,
  className = ''
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(value.startsWith('#') ? value : '#000000');

  const presetColors = [
    ...designSystemColors,
    { name: 'White', value: '#FFFFFF', description: 'White' },
    { name: 'Black', value: '#000000', description: 'Black' },
  ];

  const handlePresetClick = (color: string) => {
    onChange(color);
    setShowPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPicker(false);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center">
          <div
            style={{ backgroundColor: value }}
            className="w-8 h-8 rounded-lg"
          ></div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPicker(!showPicker);
          }}
          className="text-gray-500 hover:text-gray-700 ml-2"
        >
          <Palette className="w-4 h-4" />
        </Button>
      </div>

      {showPicker && (
        <div className="absolute top-full left-0 z-50 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg min-w-64">
          <div className="space-y-3">
            {designSystemColors.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Design System Colors</label>
                <div className="grid grid-cols-4 gap-2">
                  {designSystemColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePresetClick(color.value);
                      }}
                      className="w-8 h-8 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Custom Color</label>
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="w-full h-10 border border-gray-300 rounded"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
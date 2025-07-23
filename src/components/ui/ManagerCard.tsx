'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';

interface ManagerCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
  showActions?: boolean;
}

const ManagerCard: React.FC<ManagerCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  onSave,
  onCancel,
  isLoading = false,
  className = '',
  showActions = true
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {children}
        
        {showActions && (onSave || onCancel) && (
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            {onSave && (
              <Button
                onClick={onSave}
                isLoading={isLoading}
                disabled={isLoading}
              >
                Save Changes
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagerCard; 
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'progress';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // Auto-dismiss after X milliseconds
  progress?: {
    current: number;
    total: number;
    percentage: number;
    status: string;
  };
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  }[];
}

interface NotificationCenterProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  maxNotifications?: number;
}

export function NotificationCenter({ 
  notifications, 
  onDismiss, 
  onClearAll, 
  maxNotifications = 10 
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.length; // All notifications are considered unread for now
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'progress':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const displayedNotifications = notifications.slice(0, maxNotifications);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="relative p-0 border border-gray-300 bg-white flex items-center justify-center"
        style={{ minWidth: '32px', minHeight: '32px' }}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="fixed right-4 top-20 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notifications ({notifications.length})</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-2">
            {displayedNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
                <p className="text-xs text-gray-400 mt-1">Total: {notifications.length}</p>
              </div>
            ) : (
              displayedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDismiss={onDismiss}
                  getNotificationIcon={getNotificationIcon}
                  getNotificationColor={getNotificationColor}
                  formatTime={formatTime}
                />
              ))
            )}
          </div>

          {notifications.length > maxNotifications && (
            <div className="p-3 border-t border-gray-200 text-center text-sm text-gray-500">
              {notifications.length - maxNotifications} more notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  getNotificationIcon: (type: Notification['type']) => React.ReactNode;
  getNotificationColor: (type: Notification['type']) => string;
  formatTime: (timestamp: Date) => string;
}

function NotificationItem({
  notification,
  onDismiss,
  getNotificationIcon,
  getNotificationColor,
  formatTime
}: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(notification.id), 300); // Wait for fade out
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onDismiss]);

  if (!isVisible) {
    return null;
  }

  return (
    <Card className={`mb-2 p-3 border ${getNotificationColor(notification.type)} transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {notification.title}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(notification.id)}
              className="p-1 h-auto text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {notification.message}
          </p>

          {/* Progress Bar */}
          {notification.progress && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{notification.progress.status}</span>
                <span>{Math.round(notification.progress.percentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${notification.progress.percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {notification.progress.current} of {notification.progress.total}
              </div>
            </div>
          )}

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {notification.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'secondary'}
                  size="sm"
                  onClick={action.onClick}
                  className="text-xs h-7 px-2"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-400 mt-2">
            {formatTime(notification.timestamp)}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    return id;
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, ...updates } : n)
    );
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    updateNotification
  };
}

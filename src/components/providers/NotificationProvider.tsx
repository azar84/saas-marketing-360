'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Notification } from '@/components/ui/NotificationCenter';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date()
    };
    
    console.log('🔔 NotificationProvider: Adding notification:', newNotification);
    setNotifications(prev => {
      const newNotifications = [newNotification, ...prev];
      console.log('🔔 NotificationProvider: Updated notifications array:', newNotifications);
      return newNotifications;
    });
    return id;
  };

  const dismissNotification = (id: string) => {
    console.log('🔔 NotificationProvider: Dismissing notification:', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    console.log('🔔 NotificationProvider: Clearing all notifications');
    setNotifications([]);
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    console.log('🔔 NotificationProvider: Updating notification:', id, updates);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, ...updates } : n)
    );
  };

  // Debug logging for notifications state changes
  useEffect(() => {
    console.log('🔔 NotificationProvider: Notifications state changed:', notifications);
  }, [notifications]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    updateNotification
  };

  console.log('🔔 NotificationProvider: Rendering with value:', value);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

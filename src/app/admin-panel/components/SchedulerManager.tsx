'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Play, Pause, RefreshCw, Clock, CheckCircle, XCircle, Settings, Calendar, Activity, Edit, Save, X } from 'lucide-react';

interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  lastRun?: string | null;
  nextRun?: string | null;
  isRunning: boolean;
  enabled: boolean;
}

interface SchedulerStatus {
  isRunning: boolean;
  taskCount: number;
  enabledTaskCount: number;
  nextTask?: { id: string; name: string; nextRun: string };
}

interface CronSchedule {
  frequency: 'every-minute' | 'every-x-minutes' | 'every-x-hours' | 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  customExpression?: string;
  interval?: number; // For every X minutes/hours
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

const CronExpressionEditor = ({ 
  cronExpression, 
  onSave, 
  onCancel 
}: { 
  cronExpression: string; 
  onSave: (expression: string) => void; 
  onCancel: () => void; 
}) => {
  const [schedule, setSchedule] = useState<CronSchedule>(() => {
    // Parse existing cron expression to populate form
    const parts = cronExpression.split(' ');
    if (parts.length === 5) {
      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      
      // Check for every minute: * * * * *
      if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        return {
          frequency: 'every-minute',
          time: '00:00'
        };
      }
      
      // Check for every X minutes: */X * * * *
      if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        const interval = parseInt(minute.substring(2));
        return {
          frequency: 'every-x-minutes',
          time: '00:00',
          interval: interval
        };
      }
      
      // Check for every X hours: 0 */X * * *
      if (minute === '0' && hour.startsWith('*/') && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        const interval = parseInt(hour.substring(2));
        return {
          frequency: 'every-x-hours',
          time: '00:00',
          interval: interval
        };
      }
      
      // Check for daily: X X * * *
      if (dayOfWeek === '*' && dayOfMonth === '*') {
        return {
          frequency: 'daily',
          time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
        };
      } else if (dayOfWeek !== '*') {
        return {
          frequency: 'weekly',
          time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
          dayOfWeek: parseInt(dayOfWeek)
        };
      } else if (dayOfMonth !== '*') {
        return {
          frequency: 'monthly',
          time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
          dayOfMonth: parseInt(dayOfMonth)
        };
      }
    }
    
    return {
      frequency: 'custom',
      time: '02:00',
      customExpression: cronExpression
    };
  });

  const generateCronExpression = (): string => {
    const [hour, minute] = schedule.time.split(':');
    
    switch (schedule.frequency) {
      case 'every-minute':
        return '* * * * *';
      case 'every-x-minutes':
        return `*/${schedule.interval || 1} * * * *`;
      case 'every-x-hours':
        return `0 */${schedule.interval || 1} * * *`;
      case 'daily':
        return `${minute} ${hour} * * *`;
      case 'weekly':
        return `${minute} ${hour} * * ${schedule.dayOfWeek || 0}`;
      case 'monthly':
        return `${minute} ${hour} ${schedule.dayOfMonth || 1} * *`;
      case 'custom':
        return schedule.customExpression || '0 2 * * *';
      default:
        return '0 2 * * *';
    }
  };

  const handleSave = () => {
    const expression = generateCronExpression();
    onSave(expression);
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const getCronDescription = (cronExpression: string): string => {
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return 'Invalid cron expression';
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // Every minute
    if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 'Every minute';
    }
    
    // Every X minutes
    if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      const interval = minute.substring(2);
      return `Every ${interval} minute(s)`;
    }
    
    // Every X hours
    if (minute === '0' && hour.startsWith('*/') && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      const interval = hour.substring(2);
      return `Every ${interval} hour(s)`;
    }
    
    // Daily at specific time
    if (dayOfWeek === '*' && dayOfMonth === '*') {
      return `Daily at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    }
    
    // Weekly on specific day
    if (dayOfWeek !== '*') {
      const dayName = getDayName(parseInt(dayOfWeek));
      return `Weekly on ${dayName} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    }
    
    // Monthly on specific day
    if (dayOfMonth !== '*') {
      return `Monthly on day ${dayOfMonth} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    }
    
    return 'Custom schedule';
  };

  return (
    <Card className="p-4 space-y-4" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Edit Schedule</h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            size="sm" 
            leftIcon={<Save className="w-4 h-4" />}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-primary)' }}
          >
            Save
          </Button>
          <Button 
            onClick={onCancel} 
            variant="outline" 
            size="sm" 
            leftIcon={<X className="w-4 h-4" />}
            style={{ 
              color: 'var(--color-text-secondary)', 
              borderColor: 'var(--color-gray-light)',
              backgroundColor: 'var(--color-bg-primary)'
            }}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Frequency</label>
          <select
            value={schedule.frequency}
            onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value as any })}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
            style={{ 
              borderColor: 'var(--color-gray-light)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-primary)'
            }}
          >
            <option value="every-minute">Every Minute</option>
            <option value="every-x-minutes">Every X Minutes</option>
            <option value="every-x-hours">Every X Hours</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Cron Expression</option>
          </select>
        </div>

        {/* Interval Selection for Every X Minutes/Hours */}
        {(schedule.frequency === 'every-x-minutes' || schedule.frequency === 'every-x-hours') && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {schedule.frequency === 'every-x-minutes' ? 'Minutes Interval' : 'Hours Interval'}
            </label>
            <input
              type="number"
              min="1"
              max={schedule.frequency === 'every-x-minutes' ? "59" : "23"}
              value={schedule.interval || 1}
              onChange={(e) => setSchedule({ ...schedule, interval: parseInt(e.target.value) || 1 })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-primary)'
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {schedule.frequency === 'every-x-minutes' 
                ? 'Enter a number between 1-59 (e.g., 5 for every 5 minutes)' 
                : 'Enter a number between 1-23 (e.g., 2 for every 2 hours)'
              }
            </p>
          </div>
        )}

        {/* Time Selection - Only show for daily, weekly, monthly */}
        {(schedule.frequency === 'daily' || schedule.frequency === 'weekly' || schedule.frequency === 'monthly') && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Time (UTC)</label>
            <input
              type="time"
              value={schedule.time}
              onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-primary)'
              }}
            />
          </div>
        )}

        {/* Day of Week (for weekly) */}
        {schedule.frequency === 'weekly' && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Day of Week</label>
            <select
              value={schedule.dayOfWeek || 0}
              onChange={(e) => setSchedule({ ...schedule, dayOfWeek: parseInt(e.target.value) })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-primary)'
              }}
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>
        )}

        {/* Day of Month (for monthly) */}
        {schedule.frequency === 'monthly' && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Day of Month</label>
            <select
              value={schedule.dayOfMonth || 1}
              onChange={(e) => setSchedule({ ...schedule, dayOfMonth: parseInt(e.target.value) })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-primary)'
              }}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Cron Expression */}
        {schedule.frequency === 'custom' && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Custom Cron Expression</label>
            <input
              type="text"
              value={schedule.customExpression || ''}
              onChange={(e) => setSchedule({ ...schedule, customExpression: e.target.value })}
              placeholder="0 2 * * * (minute hour day month weekday)"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-primary)'
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Format: minute hour day month weekday (e.g., "0 2 * * *" for daily at 2 AM)
            </p>
          </div>
        )}

        {/* Preview */}
        <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Generated Expression:</strong> {generateCronExpression()}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {schedule.frequency === 'every-minute' && 'Runs every minute'}
            {schedule.frequency === 'every-x-minutes' && `Runs every ${schedule.interval || 1} minute(s)`}
            {schedule.frequency === 'every-x-hours' && `Runs every ${schedule.interval || 1} hour(s)`}
            {schedule.frequency === 'daily' && `Runs daily at ${schedule.time} UTC`}
            {schedule.frequency === 'weekly' && `Runs weekly on ${getDayName(schedule.dayOfWeek || 0)} at ${schedule.time} UTC`}
            {schedule.frequency === 'monthly' && `Runs monthly on day ${schedule.dayOfMonth || 1} at ${schedule.time} UTC`}
            {schedule.frequency === 'custom' && 'Custom schedule'}
          </p>
          
          {/* Cron Expression Help */}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-gray-light)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <strong>Cron Format:</strong> minute hour day month weekday<br/>
              <strong>Examples:</strong><br/>
              • <code>* * * * *</code> = Every minute<br/>
              • <code>*/5 * * * *</code> = Every 5 minutes<br/>
              • <code>0 */2 * * *</code> = Every 2 hours<br/>
              • <code>0 2 * * *</code> = Daily at 2:00 AM<br/>
              • <code>0 9 * * 1</code> = Weekly on Monday at 9:00 AM
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function SchedulerManager() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [selectedTaskForLogs, setSelectedTaskForLogs] = useState<string | null>(null);
  const [taskLogs, setTaskLogs] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Helper function to get human-readable cron description
  const getCronDescription = (cronExpression: string): string => {
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return 'Invalid cron expression';
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // Every minute
    if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 'Every minute';
    }
    
    // Every X minutes
    if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      const interval = minute.substring(2);
      return `Every ${interval} minute(s)`;
    }
    
    // Every X hours
    if (minute === '0' && hour.startsWith('*/') && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      const interval = hour.substring(2);
      return `Every ${interval} hour(s)`;
    }
    
    // Daily at specific time
    if (dayOfWeek === '*' && dayOfMonth === '*') {
      return `Daily at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    }
    
    // Weekly on specific day
    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[parseInt(dayOfWeek)] || 'Unknown';
      return `Weekly on ${dayName} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    }
    
    // Monthly on specific day
    if (dayOfMonth !== '*') {
      return `Monthly on day ${dayOfMonth} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    }
    
    return 'Custom schedule';
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000); // Auto-hide after 5 seconds
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/scheduler');
      const data = await response.json();
      setStatus(data.status);
      setTasks(data.tasks);
      setLastUpdated(new Date());
      await fetchTaskLogs();
    } catch (error) {
      console.error('Failed to fetch scheduler data:', error);
      showMessage('error', 'Failed to load scheduler data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskLogs = async () => {
    try {
      const url = selectedTaskForLogs 
        ? `/api/admin/scheduler/logs?taskId=${selectedTaskForLogs}`
        : '/api/admin/scheduler/logs';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Ensure we're setting an array, with fallback to empty array
        const logs = Array.isArray(data.logs) ? data.logs : [];
        setTaskLogs(logs);
      } else {
        // If response is not ok, set empty array
        setTaskLogs([]);
      }
    } catch (error) {
      console.error('Failed to fetch task logs:', error);
      // On error, set empty array
      setTaskLogs([]);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up automatic refresh every 30 seconds to keep UI in sync
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTaskForLogs !== null) {
      fetchTaskLogs();
      
      // Set up frequent refresh for task logs when viewing them
      const interval = setInterval(() => {
        fetchTaskLogs();
      }, 10000); // 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [selectedTaskForLogs]);

  const handleSchedulerAction = async (action: 'start' | 'stop' | 'refresh') => {
    try {
      const response = await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        if (action === 'refresh') {
          showMessage('success', 'Task schedules refreshed successfully');
        } else {
          showMessage('success', `Scheduler ${action === 'start' ? 'started' : 'stopped'} successfully`);
        }
        fetchData();
      } else {
        const error = await response.json();
        showMessage('error', error.error || `Failed to ${action} scheduler`);
      }
    } catch (error) {
      console.error(`Failed to ${action} scheduler:`, error);
      showMessage('error', `Failed to ${action} scheduler`);
    }
  };

  const handleTaskAction = async (taskId: string, action: 'trigger' | 'toggle') => {
    try {
      if (action === 'trigger') {
        const response = await fetch('/api/admin/scheduler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, taskId })
        });
        
        if (response.ok) {
          showMessage('success', 'Task triggered successfully');
          fetchData();
        } else {
          const error = await response.json();
          showMessage('error', error.error || 'Failed to trigger task');
        }
      } else if (action === 'toggle') {
        const task = tasks.find(t => t.id === taskId);
        const newEnabledStatus = !task?.enabled;
        
        const response = await fetch('/api/admin/scheduler', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            taskId, 
            updates: { enabled: newEnabledStatus } 
          })
        });
        
        if (response.ok) {
          const status = newEnabledStatus ? 'enabled' : 'disabled';
          showMessage('success', `Task ${status} successfully`);
          fetchData();
        } else {
          const error = await response.json();
          showMessage('error', error.error || 'Failed to toggle task');
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} task:`, error);
      showMessage('error', `Failed to ${action} task`);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ScheduledTask>) => {
    try {
      const response = await fetch('/api/admin/scheduler', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, updates })
      });
      
      if (response.ok) {
        showMessage('success', 'Task updated successfully');
        setEditingTask(null);
        fetchData();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      showMessage('error', 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/scheduler?taskId=${taskId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showMessage('success', 'Task deleted successfully');
        fetchData();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      showMessage('error', 'Failed to delete task');
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    try {
      if (!date) {
        return 'Never';
      }
      
      const dateObj = new Date(date);
      
      // Check if date is valid
      if (isNaN(dateObj.getTime()) || dateObj.getTime() <= 0) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const diffMs = dateObj.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // If it's within the next 24 hours, show relative time
      if (diffMs > 0 && diffMs < 24 * 60 * 60 * 1000) {
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
        }
        return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      }
      
      // If it's within the next 7 days, show day and time
      if (diffMs > 0 && diffDays < 7) {
        return dateObj.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Otherwise show full date
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'text-green-600' : 'text-gray-400';
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'var(--color-text-secondary)' }} /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Scheduler Management</h1>
          <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Manage automated tasks and schedules</p>
        </div>
        <div className="flex gap-2">
          {status?.isRunning ? (
            <Button 
              onClick={() => handleSchedulerAction('stop')} 
              variant="outline" 
              leftIcon={<Pause className="w-4 h-4" />}
              style={{ 
                color: 'var(--color-error)', 
                borderColor: 'var(--color-error-light)',
                backgroundColor: 'var(--color-bg-primary)'
              }}
            >
              Stop Scheduler
            </Button>
          ) : (
            <Button 
              onClick={() => handleSchedulerAction('start')} 
              leftIcon={<Play className="w-4 h-4" />}
              style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-text-primary)' }}
            >
              Start Scheduler
            </Button>
          )}
          <Button 
            onClick={() => handleSchedulerAction('refresh')}
            variant="outline" 
            leftIcon={<RefreshCw className="w-4 h-4" />}
            style={{ 
              color: 'var(--color-info)', 
              borderColor: 'var(--color-info-light)',
              backgroundColor: 'var(--color-bg-primary)'
            }}
            title="Refresh task schedules"
          >
            Refresh Schedules
          </Button>
          <Button 
            onClick={fetchData} 
            variant="outline" 
            leftIcon={<RefreshCw className="w-4 h-4" />}
            style={{ 
              color: 'var(--color-text-secondary)', 
              borderColor: 'var(--color-gray-light)',
              backgroundColor: 'var(--color-bg-primary)'
            }}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="p-4 rounded-lg" style={{
          backgroundColor: message.type === 'success' ? 'var(--color-success-light)' : 'var(--color-error-light)',
          color: message.type === 'success' ? 'var(--color-success-dark)' : 'var(--color-error-dark)',
          borderColor: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'
        }}>
          {message.text}
        </div>
      )}

      {/* Status Overview */}
      <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{status?.isRunning ? 'Running' : 'Stopped'}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{status?.taskCount || 0}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{status?.enabledTaskCount || 0}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Enabled Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {status?.nextTask ? formatDate(status.nextTask.nextRun) : 'No tasks scheduled'}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Next Task</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Last updated: {lastUpdated.toLocaleTimeString()} (Auto-refreshes every 30s)
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Scheduled Tasks</h2>
        
        {tasks.length === 0 ? (
          <div className="p-12 text-center" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)', borderRadius: '0.5rem', border: '1px solid' }}>
            <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No scheduled tasks found</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Scheduled tasks will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)' }}>
                {editingTask === task.id ? (
                  <CronExpressionEditor
                    cronExpression={task.cronExpression}
                    onSave={(expression) => handleUpdateTask(task.id, { cronExpression: expression })}
                    onCancel={() => setEditingTask(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{task.name}</h3>
                        <span className="flex items-center gap-1 text-sm" style={{ color: task.enabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                          {getStatusIcon(task.enabled)}
                          {task.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        {task.isRunning && (
                          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-info)' }}>
                            <Activity className="w-4 h-4 animate-pulse" />
                            Running
                          </span>
                        )}
                      </div>
                      <div className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                        <div>
                          <strong style={{ color: 'var(--color-text-primary)' }}>Schedule:</strong> 
                          <span className="ml-1 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {task.cronExpression}
                          </span>
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                          {getCronDescription(task.cronExpression)}
                        </div>
                        <div><strong style={{ color: 'var(--color-text-primary)' }}>Last Run:</strong> {task.lastRun ? formatDate(task.lastRun) : 'Never'}</div>
                        <div><strong style={{ color: 'var(--color-text-primary)' }}>Next Run:</strong> {task.nextRun ? formatDate(task.nextRun) : 'Not scheduled'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => setEditingTask(task.id)}
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit className="w-4 h-4" />}
                      style={{ 
                        color: 'var(--color-info)', 
                        borderColor: 'var(--color-info-light)',
                        backgroundColor: 'var(--color-bg-primary)'
                      }}
                      title="Edit schedule"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleTaskAction(task.id, 'trigger')}
                      variant="outline"
                      size="sm"
                      leftIcon={<Play className="w-4 h-4" />}
                      style={{ 
                        color: 'var(--color-success)', 
                        borderColor: 'var(--color-success-light)',
                        backgroundColor: 'var(--color-bg-primary)'
                      }}
                      disabled={task.isRunning}
                      title="Run task now"
                    >
                      Run
                    </Button>
                    <Button
                      onClick={() => handleTaskAction(task.id, 'toggle')}
                      variant="outline"
                      size="sm"
                      leftIcon={task.enabled ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      style={{ 
                        color: task.enabled ? 'var(--color-error)' : 'var(--color-success)', 
                        borderColor: task.enabled ? 'var(--color-error-light)' : 'var(--color-success-light)',
                        backgroundColor: 'var(--color-bg-primary)'
                      }}
                      title={task.enabled ? 'Disable task' : 'Enable task'}
                    >
                      {task.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      onClick={() => handleDeleteTask(task.id)}
                      variant="outline"
                      size="sm"
                      leftIcon={<X className="w-4 h-4" />}
                      style={{ 
                        color: 'var(--color-error)', 
                        borderColor: 'var(--color-error-light)',
                        backgroundColor: 'var(--color-bg-primary)'
                      }}
                      title="Delete task"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              </Card>
            ))}

            {/* Task Logs Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Task Execution Logs
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  onClick={() => setSelectedTaskForLogs(null)}
                  variant="outline"
                  size="sm"
                  style={{ 
                    color: 'var(--color-text-secondary)', 
                    borderColor: 'var(--color-gray-light)',
                    backgroundColor: 'var(--color-bg-primary)'
                  }}
                >
                  All Tasks
                </Button>
              </div>

              {/* Task Selection for Logs */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Select Task to View Logs:
                </label>
                <select
                  value={selectedTaskForLogs || ''}
                  onChange={(e) => setSelectedTaskForLogs(e.target.value || null)}
                  className="w-full p-2 border rounded-md"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)', 
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="">All Tasks</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Logs Display */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {!Array.isArray(taskLogs) || taskLogs.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                    No logs available. Run a task to see execution logs.
                  </p>
                ) : (
                  taskLogs.map((log, index) => {
                    // Ensure log has required properties with fallbacks
                    const level = log?.level || 'info';
                    const message = log?.message || 'No message';
                    const timestamp = log?.timestamp || new Date().toISOString();
                    const details = log?.details;
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-md text-sm ${
                          level === 'error' ? 'bg-red-50 border border-red-200' :
                          level === 'warn' ? 'bg-yellow-50 border border-yellow-200' :
                          level === 'success' ? 'bg-green-50 border border-green-200' :
                          'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                level === 'error' ? 'bg-red-100 text-red-800' :
                                level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                                level === 'success' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {level.toUpperCase()}
                              </span>
                              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                {new Date(timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {message}
                            </p>
                            {details && (
                              <pre className="mt-2 text-xs overflow-x-auto" style={{ color: 'var(--color-text-secondary)' }}>
                                {typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 
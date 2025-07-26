'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Play, Pause, RefreshCw, Clock, CheckCircle, XCircle, Settings, Calendar, Activity, Edit, Save, X } from 'lucide-react';

interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  lastRun?: Date;
  nextRun?: Date;
  isRunning: boolean;
  enabled: boolean;
}

interface SchedulerStatus {
  isRunning: boolean;
  taskCount: number;
  enabledTaskCount: number;
  nextTask?: { id: string; name: string; nextRun: Date };
}

interface CronSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  customExpression?: string;
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit Schedule</h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            size="sm" 
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </Button>
          <Button 
            onClick={onCancel} 
            variant="outline" 
            size="sm" 
            leftIcon={<X className="w-4 h-4" />}
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
          <select
            value={schedule.frequency}
            onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value as any })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Cron Expression</option>
          </select>
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time (UTC)</label>
          <input
            type="time"
            value={schedule.time}
            onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Day of Week (for weekly) */}
        {schedule.frequency === 'weekly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
            <select
              value={schedule.dayOfWeek || 0}
              onChange={(e) => setSchedule({ ...schedule, dayOfWeek: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Month</label>
            <select
              value={schedule.dayOfMonth || 1}
              onChange={(e) => setSchedule({ ...schedule, dayOfMonth: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Cron Expression</label>
            <input
              type="text"
              value={schedule.customExpression || ''}
              onChange={(e) => setSchedule({ ...schedule, customExpression: e.target.value })}
              placeholder="0 2 * * * (minute hour day month weekday)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: minute hour day month weekday (e.g., "0 2 * * *" for daily at 2 AM)
            </p>
          </div>
        )}

        {/* Preview */}
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Generated Expression:</strong> {generateCronExpression()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {schedule.frequency === 'daily' && `Runs daily at ${schedule.time} UTC`}
            {schedule.frequency === 'weekly' && `Runs weekly on ${getDayName(schedule.dayOfWeek || 0)} at ${schedule.time} UTC`}
            {schedule.frequency === 'monthly' && `Runs monthly on day ${schedule.dayOfMonth || 1} at ${schedule.time} UTC`}
            {schedule.frequency === 'custom' && 'Custom schedule'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function SchedulerManager() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

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
    } catch (error) {
      console.error('Failed to fetch scheduler data:', error);
      showMessage('error', 'Failed to load scheduler data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSchedulerAction = async (action: 'start' | 'stop') => {
    try {
      const response = await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        showMessage('success', `Scheduler ${action === 'start' ? 'started' : 'stopped'} successfully`);
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
        showMessage('success', 'Schedule updated successfully');
        fetchData();
        setEditingTask(null);
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      showMessage('error', 'Failed to update schedule');
    }
  };

  const formatDate = (date: Date | string) => {
    try {
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
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduler Management</h1>
          <p className="text-gray-600 mt-2">Manage automated tasks and schedules</p>
        </div>
        <div className="flex gap-2">
          {status?.isRunning ? (
            <Button 
              onClick={() => handleSchedulerAction('stop')} 
              variant="outline" 
              leftIcon={<Pause className="w-4 h-4" />}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Stop Scheduler
            </Button>
          ) : (
            <Button 
              onClick={() => handleSchedulerAction('start')} 
              leftIcon={<Play className="w-4 h-4" />}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Start Scheduler
            </Button>
          )}
          <Button 
            onClick={fetchData} 
            variant="outline" 
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Status Overview */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{status?.isRunning ? 'Running' : 'Stopped'}</div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{status?.taskCount || 0}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{status?.enabledTaskCount || 0}</div>
            <div className="text-sm text-gray-600">Enabled Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {status?.nextTask ? formatDate(status.nextTask.nextRun) : 'No tasks scheduled'}
            </div>
            <div className="text-sm text-gray-600">Next Task</div>
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Scheduled Tasks</h2>
        
        {tasks.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled tasks found</h3>
            <p className="text-gray-600">Scheduled tasks will appear here.</p>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="p-6 hover:shadow-lg transition-shadow">
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
                      <h3 className="text-xl font-semibold text-gray-900">{task.name}</h3>
                      <span className={`flex items-center gap-1 text-sm ${getStatusColor(task.enabled)}`}>
                        {getStatusIcon(task.enabled)}
                        {task.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      {task.isRunning && (
                        <span className="flex items-center gap-1 text-sm text-blue-600">
                          <Activity className="w-4 h-4 animate-pulse" />
                          Running
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Schedule:</strong> {task.cronExpression}</div>
                      <div><strong>Last Run:</strong> {task.lastRun ? formatDate(task.lastRun) : 'Never'}</div>
                      <div><strong>Next Run:</strong> {task.nextRun ? formatDate(task.nextRun) : 'Not scheduled'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => setEditingTask(task.id)}
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit className="w-4 h-4" />}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      title="Edit schedule"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleTaskAction(task.id, 'trigger')}
                      variant="outline"
                      size="sm"
                      leftIcon={<Play className="w-4 h-4" />}
                      className="text-green-600 border-green-200 hover:bg-green-50"
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
                      className={task.enabled ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}
                      title={task.enabled ? 'Disable task' : 'Enable task'}
                    >
                      {task.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 
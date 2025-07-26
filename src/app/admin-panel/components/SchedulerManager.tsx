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
          <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            <X className="w-4 h-4 mr-1" />
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

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/scheduler');
      const data = await response.json();
      setStatus(data.status);
      setTasks(data.tasks);
    } catch (error) {
      console.error('Failed to fetch scheduler data:', error);
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
        fetchData();
      }
    } catch (error) {
      console.error(`Failed to ${action} scheduler:`, error);
    }
  };

  const handleTaskAction = async (taskId: string, action: 'trigger' | 'toggle') => {
    try {
      const response = await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, taskId })
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error(`Failed to ${action} task:`, error);
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
        fetchData();
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
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
          <h1 className="text-2xl font-bold text-gray-900">Scheduler Management</h1>
          <p className="text-gray-600">Manage automated tasks and schedules</p>
        </div>
        <div className="flex gap-2">
          {status?.isRunning ? (
            <Button onClick={() => handleSchedulerAction('stop')} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <Pause className="w-4 h-4 mr-2" />
              Stop Scheduler
            </Button>
          ) : (
            <Button onClick={() => handleSchedulerAction('start')} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Start Scheduler
            </Button>
          )}
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

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
              {status?.nextTask ? formatDate(status.nextTask.nextRun).split(',')[0] : 'None'}
            </div>
            <div className="text-sm text-gray-600">Next Task</div>
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Scheduled Tasks</h2>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4">
              {editingTask === task.id ? (
                <CronExpressionEditor
                  cronExpression={task.cronExpression}
                  onSave={(expression) => handleUpdateTask(task.id, { cronExpression: expression })}
                  onCancel={() => setEditingTask(null)}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{task.name}</h3>
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
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingTask(task.id)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Schedule
                    </Button>
                    <Button
                      onClick={() => handleTaskAction(task.id, 'trigger')}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      disabled={task.isRunning}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Run Now
                    </Button>
                    <Button
                      onClick={() => handleTaskAction(task.id, 'toggle')}
                      variant="outline"
                      size="sm"
                      className={task.enabled ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}
                    >
                      {task.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No scheduled tasks found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 
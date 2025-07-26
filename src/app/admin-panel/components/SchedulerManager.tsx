'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Settings,
  Calendar,
  Activity
} from 'lucide-react';

interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  enabled: boolean;
  isRunning: boolean;
  lastRun?: string;
  nextRun?: string;
}

interface SchedulerStatus {
  isRunning: boolean;
  taskCount: number;
  enabledTaskCount: number;
  nextTask?: {
    id: string;
    name: string;
    nextRun: string;
  };
}

export default function SchedulerManager() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSchedulerData = async () => {
    try {
      const response = await fetch('/api/admin/scheduler');
      const result = await response.json();
      
      if (result.success) {
        setStatus(result.data.status);
        setTasks(result.data.tasks);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to load scheduler data' });
      }
    } catch (error) {
      console.error('Failed to fetch scheduler data:', error);
      setMessage({ type: 'error', text: 'Failed to load scheduler data' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedulerData();
  }, []);

  const handleSchedulerAction = async (action: 'start' | 'stop') => {
    try {
      const response = await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchSchedulerData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error(`Failed to ${action} scheduler:`, error);
      setMessage({ type: 'error', text: `Failed to ${action} scheduler` });
    }
  };

  const handleTriggerTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger', taskId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchSchedulerData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Failed to trigger task:', error);
      setMessage({ type: 'error', text: 'Failed to trigger task' });
    }
  };

  const handleToggleTask = async (taskId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/scheduler', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, enabled })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchSchedulerData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
      setMessage({ type: 'error', text: 'Failed to toggle task' });
    }
  };

  const formatCronExpression = (cron: string) => {
    const [minute, hour, day, month, dayOfWeek] = cron.split(' ');
    
    if (dayOfWeek === '*') {
      return `Daily at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    } else if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Weekly on ${days[parseInt(dayOfWeek)]} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    }
    
    return `Cron: ${cron}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduler Manager</h1>
          <p className="text-gray-600 mt-2">Manage automated tasks and background jobs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setRefreshing(true);
              fetchSchedulerData();
            }}
            variant="outline"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {status?.isRunning ? (
            <Button
              onClick={() => handleSchedulerAction('stop')}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop Scheduler
            </Button>
          ) : (
            <Button
              onClick={() => handleSchedulerAction('start')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Scheduler
            </Button>
          )}
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
      {status && (
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Scheduler Status</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${status.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                {status.isRunning ? 'Running' : 'Stopped'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{status.taskCount}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{status.enabledTaskCount}</div>
              <div className="text-sm text-gray-600">Enabled Tasks</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {status.nextTask ? formatDate(status.nextTask.nextRun) : 'None'}
              </div>
              <div className="text-sm text-gray-600">Next Task</div>
            </div>
          </div>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Scheduled Tasks</h2>
        
        {tasks.length === 0 ? (
          <Card className="p-12 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Scheduled tasks will appear here.</p>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                    <div className="flex items-center gap-2">
                      {task.enabled ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Enabled
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          Disabled
                        </span>
                      )}
                      {task.isRunning && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Running
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatCronExpression(task.cronExpression)}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Last Run:</span> {formatDate(task.lastRun)}
                    </div>
                    <div>
                      <span className="font-medium">Next Run:</span> {formatDate(task.nextRun)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => handleTriggerTask(task.id)}
                    variant="outline"
                    size="sm"
                    disabled={task.isRunning}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleToggleTask(task.id, !task.enabled)}
                    variant="outline"
                    size="sm"
                    className={task.enabled 
                      ? "text-red-600 border-red-200 hover:bg-red-50" 
                      : "text-green-600 border-green-200 hover:bg-green-50"
                    }
                  >
                    {task.enabled ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 
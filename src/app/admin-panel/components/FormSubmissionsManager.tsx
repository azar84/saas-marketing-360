'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { 
  Mail, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Clock,
  Send
} from 'lucide-react';

interface FormSubmission {
  id: number;
  formId: number;
  formData: Record<string, any>;
  metadata: {
    userAgent?: string;
    timestamp?: string;
    url?: string;
  ipAddress?: string;
  };
  emailStatus: 'pending' | 'sent' | 'failed' | 'not_configured';
  emailDetails?: {
    messageId?: string;
    recipients?: string[];
    subject?: string;
    sentAt?: string;
    error?: string;
  };
  createdAt: string;
  updatedAt: string;
  form: {
    id: number;
    name: string;
    title: string;
    emailNotification: boolean;
    emailRecipients?: string;
    dynamicEmailRecipients?: boolean;
    emailFieldRecipients?: string;
    sendToSubmitterEmail?: boolean;
    submitterEmailField?: string;
  };
}

const FormSubmissionsManager: React.FC = () => {
  const { designSystem } = useDesignSystem();
  const adminColors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formFilter, setFormFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/form-submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const response = await fetch(`/api/admin/form-submissions?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSubmissions(submissions.filter(s => s.id !== id));
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const retryEmail = async (submissionId: number) => {
    try {
      const response = await fetch('/api/admin/form-submissions/retry-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update the submission with new email status
        setSubmissions(submissions.map(s => 
          s.id === submissionId 
            ? { ...s, emailStatus: result.success ? 'sent' : 'failed', emailDetails: result.emailDetails }
            : s
        ));
      }
    } catch (error) {
      console.error('Error retrying email:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { 
        style: { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success-dark)' }, 
        icon: CheckCircle, 
        text: 'Email Sent' 
      },
      failed: { 
        style: { backgroundColor: 'var(--color-error-light)', color: 'var(--color-error-dark)' }, 
        icon: XCircle, 
        text: 'Email Failed' 
      },
      pending: { 
        style: { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning-dark)' }, 
        icon: Clock, 
        text: 'Email Pending' 
      },
      not_configured: { 
        style: { backgroundColor: 'var(--color-gray-light)', color: 'var(--color-text-secondary)' }, 
        icon: AlertCircle, 
        text: 'No Email' 
      },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_configured;
    const Icon = config.icon;
    
    return (
      <Badge className="flex items-center space-x-1" style={config.style}>
        <Icon className="w-3 h-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = searchTerm === '' || 
      submission.form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(submission.formData).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.emailStatus === statusFilter;
    const matchesForm = formFilter === 'all' || submission.formId.toString() === formFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const submissionDate = new Date(submission.createdAt);
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          matchesDate = submissionDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = submissionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = submissionDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesForm && matchesDate;
  });

  const uniqueForms = Array.from(new Set(submissions.map(s => s.form.name)))
    .map(name => submissions.find(s => s.form.name === name)?.form)
    .filter(Boolean);

  const exportSubmissions = () => {
    const csvContent = [
      ['ID', 'Form', 'Submitted At', 'Email Status', 'Form Data'].join(','),
      ...filteredSubmissions.map(s => [
        s.id,
        s.form.name,
        new Date(s.createdAt).toLocaleString(),
        s.emailStatus,
        JSON.stringify(s.formData)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw 
          className="w-8 h-8 animate-spin"
          style={{ color: 'var(--color-primary, #5243E9)' }}
        />
        <span 
          className="ml-2"
          style={{ color: 'var(--color-text-secondary, #6B7280)' }}
        >
          Loading submissions...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary, #1F2937)' }}
          >
            Form Submissions
          </h2>
          <p style={{ color: 'var(--color-text-secondary, #6B7280)' }}>
            Monitor and debug form submissions and email delivery
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchSubmissions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
          <Button onClick={exportSubmissions} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Search</label>
            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/4 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Email Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-gray-light)' }}
            >
              <option value="all">All Statuses</option>
              <option value="sent">Email Sent</option>
              <option value="failed">Email Failed</option>
              <option value="pending">Email Pending</option>
              <option value="not_configured">No Email</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Form</label>
          <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-gray-light)' }}
            >
              <option value="all">All Forms</option>
              {uniqueForms.map(form => (
                <option key={form?.id} value={form?.id.toString()}>
                  {form?.name}
              </option>
            ))}
          </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-gray-light)' }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-info-light)' }}>
              <User className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Submissions</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{submissions.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-success-light)' }}>
              <CheckCircle className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Emails Sent</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {submissions.filter(s => s.emailStatus === 'sent').length}
              </p>
            </div>
                  </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-error-light)' }}>
              <XCircle className="w-6 h-6" style={{ color: 'var(--color-error)' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Email Failures</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {submissions.filter(s => s.emailStatus === 'failed').length}
              </p>
            </div>
                  </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-warning-light)' }}>
              <Clock className="w-6 h-6" style={{ color: 'var(--color-warning)' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Pending</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {submissions.filter(s => s.emailStatus === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
                  </div>
                  
      {/* Submissions List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                  Form & Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                  Email Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                  Form Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} style={{ borderBottom: '1px solid var(--color-gray-light)' }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {submission.form.name}
                      </div>
                      <div className="text-sm flex items-center" style={{ color: 'var(--color-text-secondary)' }}>
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(submission.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(submission.emailStatus)}
                      {submission.emailDetails?.messageId && (
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          ID: {submission.emailDetails.messageId.slice(1, 9)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm max-w-xs" style={{ color: 'var(--color-text-primary)' }}>
                      {Object.entries(submission.formData).slice(0, 2).map(([key, value]) => (
                        <div key={key} className="truncate">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                      {Object.keys(submission.formData).length > 2 && (
                        <div style={{ color: 'var(--color-text-muted)' }}>
                          +{Object.keys(submission.formData).length - 2} more fields
                    </div>
                  )}
                </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                      onClick={() => setSelectedSubmission(submission)}
                    variant="outline"
                    size="sm"
                  >
                      <Eye className="w-4 h-4" />
                  </Button>
                    {submission.emailStatus === 'failed' && (
                  <Button
                        onClick={() => retryEmail(submission.id)}
                    variant="outline"
                    size="sm"
                        style={{ color: 'var(--color-primary)' }}
                  >
                        <Send className="w-4 h-4" />
                  </Button>
                    )}
          <Button
                      onClick={() => deleteSubmission(submission.id)}
            variant="outline"
                      size="sm"
                      style={{ color: 'var(--color-error)' }}
          >
                      <Trash2 className="w-4 h-4" />
          </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12" style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="mt-2 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>No submissions found</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {searchTerm || statusFilter !== 'all' || formFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No form submissions have been received yet'}
            </p>
        </div>
      )}
      </Card>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Submission Details - {selectedSubmission.form.name}
                </h3>
              <Button
                  onClick={() => setSelectedSubmission(null)}
                variant="outline"
                size="sm"
              >
                  ✕
              </Button>
            </div>
            
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Data */}
              <div>
                  <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Form Data</h4>
                  <div className="p-4 rounded-lg space-y-2" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    {Object.entries(selectedSubmission.formData).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{key}:</span>
                        <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email Details */}
                <div>
                  <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Email Details</h4>
                  <div className="p-4 rounded-lg space-y-2" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div>
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedSubmission.emailStatus)}</span>
                    </div>
                    
                    {selectedSubmission.form.emailNotification && (
                      <>
                        <div>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Static Recipients:</span>
                          <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                            {selectedSubmission.form.emailRecipients || 'None'}
                          </span>
              </div>
              
                        {selectedSubmission.form.dynamicEmailRecipients && (
                          <div>
                            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Dynamic Recipients:</span>
                            <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                              {selectedSubmission.form.emailFieldRecipients || 'None configured'}
                            </span>
                          </div>
                        )}
                        
                        {selectedSubmission.form.sendToSubmitterEmail && (
                          <div>
                            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Submitter Email Field:</span>
                            <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                              {selectedSubmission.form.submitterEmailField || 'None configured'}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {selectedSubmission.emailDetails && (
                      <>
                        {selectedSubmission.emailDetails.messageId && (
                          <div>
                            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Message ID:</span>
                            <span className="ml-2 text-xs" style={{ color: 'var(--color-text-primary)' }}>
                              {selectedSubmission.emailDetails.messageId}
                            </span>
                          </div>
                        )}
                        
                        {selectedSubmission.emailDetails.recipients && (
                          <div>
                            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Sent To:</span>
                            <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                              {selectedSubmission.emailDetails.recipients.join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {selectedSubmission.emailDetails.subject && (
                          <div>
                            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Subject:</span>
                            <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                              {selectedSubmission.emailDetails.subject}
                            </span>
                          </div>
                        )}
                        
                        {selectedSubmission.emailDetails.sentAt && (
                          <div>
                            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Sent At:</span>
                            <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                              {new Date(selectedSubmission.emailDetails.sentAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                        
                        {selectedSubmission.emailDetails.error && (
              <div>
                            <span className="font-medium" style={{ color: 'var(--color-error)' }}>Error:</span>
                            <span className="ml-2" style={{ color: 'var(--color-error)' }}>
                              {selectedSubmission.emailDetails.error}
                      </span>
                    </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="lg:col-span-2">
                  <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Submission Metadata</h4>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <pre className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)' }}>
                      {JSON.stringify(selectedSubmission.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
              
              {selectedSubmission.emailStatus === 'failed' && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => retryEmail(selectedSubmission.id)}
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Retry Email
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FormSubmissionsManager; 
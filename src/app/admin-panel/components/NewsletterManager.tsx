'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Mail, 
  Download, 
  Search, 
  UserCheck, 
  UserX, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users
} from 'lucide-react';
import { useDesignSystem, getAdminPanelColors } from '@/hooks/useDesignSystem';

interface NewsletterSubscriber {
  id: number;
  email: string;
  subscribed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubscribed, setFilterSubscribed] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [exporting, setExporting] = useState(false);
  
  const { designSystem } = useDesignSystem();
  const adminColors = getAdminPanelColors();

  const getPrimaryColor = () => {
    return designSystem?.primaryColor || '#5243E9';
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        ...(filterSubscribed !== 'all' && { subscribed: filterSubscribed })
      });

      const response = await fetch(`/api/admin/newsletter-subscribers?${params}`);
      if (response.ok) {
        const result = await response.json();
        setSubscribers(result.data || []);
        setPagination(result.pagination || pagination);
      } else {
        console.error('Failed to fetch subscribers');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        export: 'excel',
        search: searchTerm,
        ...(filterSubscribed !== 'all' && { subscribed: filterSubscribed })
      });

      const response = await fetch(`/api/admin/newsletter-subscribers?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to export subscribers');
      }
    } catch (error) {
      console.error('Error exporting subscribers:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleUpdateSubscription = async (id: number, subscribed: boolean) => {
    try {
      const response = await fetch('/api/admin/newsletter-subscribers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, subscribed })
      });

      if (response.ok) {
        fetchSubscribers();
      } else {
        console.error('Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const response = await fetch(`/api/admin/newsletter-subscribers?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSubscribers();
      } else {
        console.error('Failed to delete subscriber');
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSubscribers();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [pagination.page, filterSubscribed]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (subscribed: boolean) => {
    return subscribed ? '#10B981' : '#EF4444';
  };

  const getStatusIcon = (subscribed: boolean) => {
    return subscribed ? UserCheck : UserX;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${getPrimaryColor()}20` }}>
            <Mail className="w-6 h-6" style={{ color: getPrimaryColor() }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: adminColors.textPrimary }}>Newsletter Subscribers</h1>
            <p style={{ color: adminColors.textSecondary }}>Manage your newsletter subscriber list</p>
          </div>
        </div>
        
        <Button
          onClick={handleExportExcel}
          disabled={exporting}
          className="flex items-center space-x-2"
          style={{ backgroundColor: getPrimaryColor() }}
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm" style={{ color: adminColors.textSecondary }}>Total Subscribers</p>
              <p className="text-2xl font-bold" style={{ color: adminColors.textPrimary }}>{pagination.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm" style={{ color: adminColors.textSecondary }}>Active Subscribers</p>
              <p className="text-2xl font-bold" style={{ color: adminColors.textPrimary }}>
                {subscribers.filter(s => s.subscribed).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm" style={{ color: adminColors.textSecondary }}>Unsubscribed</p>
              <p className="text-2xl font-bold" style={{ color: adminColors.textPrimary }}>
                {subscribers.filter(s => !s.subscribed).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/4 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by email address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterSubscribed}
              onChange={(e) => setFilterSubscribed(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            >
              <option value="all">All Subscribers</option>
              <option value="true">Subscribed Only</option>
              <option value="false">Unsubscribed Only</option>
            </select>
          </div>
          
          <Button onClick={handleSearch} style={{ backgroundColor: getPrimaryColor() }}>
            Search
          </Button>
        </div>
      </Card>

      {/* Subscribers Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottomColor: adminColors.border }} className="border-b">
                <th className="text-left py-3 px-4 font-medium" style={{ color: adminColors.textPrimary }}>Email</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: adminColors.textPrimary }}>Status</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: adminColors.textPrimary }}>Subscribed Date</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: adminColors.textPrimary }}>Last Updated</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: adminColors.textPrimary }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8" style={{ color: adminColors.textSecondary }}>
                    Loading subscribers...
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8" style={{ color: adminColors.textSecondary }}>
                    No subscribers found
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => {
                  const StatusIcon = getStatusIcon(subscriber.subscribed);
                  return (
                    <tr key={subscriber.id} style={{ borderBottomColor: adminColors.border }} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="font-medium" style={{ color: adminColors.textPrimary }}>{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon 
                            className="w-4 h-4" 
                            style={{ color: getStatusColor(subscriber.subscribed) }}
                          />
                          <span 
                            className="text-sm font-medium"
                            style={{ color: getStatusColor(subscriber.subscribed) }}
                          >
                            {subscriber.subscribed ? 'Subscribed' : 'Unsubscribed'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: adminColors.textSecondary }}>
                        {formatDate(subscriber.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: adminColors.textSecondary }}>
                        {formatDate(subscriber.updatedAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateSubscription(subscriber.id, !subscriber.subscribed)}
                            className="text-sm"
                          >
                            {subscriber.subscribed ? 'Unsubscribe' : 'Subscribe'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSubscriber(subscriber.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6" style={{ borderTopColor: adminColors.border, borderTopWidth: '1px' }}>
            <div className="text-sm" style={{ color: adminColors.textSecondary }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} subscribers
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <span className="text-sm" style={{ color: adminColors.textSecondary }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 
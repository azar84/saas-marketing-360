'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Database, 
  Table, 
  Eye, 
  RefreshCw,
  Download,
  Search
} from 'lucide-react';

interface TableData {
  tableName: string;
  count: number;
  columns: string[];
  sampleData: any[];
}

export default function DatabaseViewer() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const traceabilityTables = [
    'search_sessions',
    'search_results', 
    'llm_processing_sessions',
    'llm_processing_results'
  ];

  // Fetch table information
  const fetchTableInfo = async () => {
    setLoading(true);
    try {
      // For now, we'll create mock data since we don't have a direct database API
      // In a real implementation, you'd have API endpoints to get table metadata
      const mockTables: TableData[] = traceabilityTables.map(tableName => ({
        tableName,
        count: Math.floor(Math.random() * 100) + 1,
        columns: getTableColumns(tableName),
        sampleData: generateSampleData(tableName)
      }));
      
      setTables(mockTables);
    } catch (error) {
      console.error('Failed to fetch table info:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get table columns based on table name
  const getTableColumns = (tableName: string): string[] => {
    switch (tableName) {
      case 'search_sessions':
        return ['id', 'searchQueries', 'industry', 'location', 'city', 'stateProvince', 'country', 'totalResults', 'status', 'createdAt'];
      case 'search_results':
        return ['id', 'searchSessionId', 'position', 'title', 'url', 'displayUrl', 'query', 'isProcessed', 'createdAt'];
      case 'llm_processing_sessions':
        return ['id', 'searchSessionId', 'status', 'totalResults', 'processedResults', 'acceptedCount', 'rejectedCount', 'extractionQuality', 'createdAt'];
      case 'llm_processing_results':
        return ['id', 'searchResultId', 'llmProcessingSessionId', 'status', 'confidence', 'companyName', 'categories', 'processingTime', 'createdAt'];
      default:
        return [];
    }
  };

  // Generate sample data for demonstration
  const generateSampleData = (tableName: string): any[] => {
    const sampleCount = 5;
    const data = [];
    
    for (let i = 0; i < sampleCount; i++) {
      switch (tableName) {
        case 'search_sessions':
          data.push({
            id: `session_${i + 1}`,
            searchQueries: [`web design companies saskatoon ${i + 1}`],
            industry: 'Web Design',
            location: 'Saskatoon',
            city: 'Saskatoon',
            stateProvince: 'SK',
            country: 'Canada',
            totalResults: Math.floor(Math.random() * 50) + 10,
            status: ['completed', 'processing', 'pending'][Math.floor(Math.random() * 3)],
            createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
          });
          break;
          
        case 'search_results':
          data.push({
            id: `result_${i + 1}`,
            searchSessionId: `session_${Math.floor(Math.random() * 3) + 1}`,
            position: i + 1,
            title: `Sample Company ${i + 1} - Web Design Services`,
            url: `https://example${i + 1}.com`,
            displayUrl: `example${i + 1}.com`,
            query: 'web design companies saskatoon',
            isProcessed: Math.random() > 0.5,
            createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
          });
          break;
          
        case 'llm_processing_sessions':
          data.push({
            id: `llm_session_${i + 1}`,
            searchSessionId: `session_${Math.floor(Math.random() * 3) + 1}`,
            status: ['completed', 'processing', 'pending'][Math.floor(Math.random() * 3)],
            totalResults: Math.floor(Math.random() * 50) + 10,
            processedResults: Math.floor(Math.random() * 50) + 5,
            acceptedCount: Math.floor(Math.random() * 20) + 1,
            rejectedCount: Math.floor(Math.random() * 20) + 1,
            extractionQuality: Math.random() * 0.5 + 0.5,
            createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
          });
          break;
          
        case 'llm_processing_results':
          data.push({
            id: `llm_result_${i + 1}`,
            searchResultId: `result_${Math.floor(Math.random() * 5) + 1}`,
            llmProcessingSessionId: `llm_session_${Math.floor(Math.random() * 3) + 1}`,
            status: ['accepted', 'rejected', 'error'][Math.floor(Math.random() * 3)],
            confidence: Math.random() * 0.5 + 0.5,
            companyName: `Sample Company ${i + 1}`,
            categories: ['Web Design', 'Digital Marketing'],
            processingTime: Math.random() * 2 + 0.5,
            createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
          });
          break;
      }
    }
    
    return data;
  };

  // View table data
  const viewTableData = (tableName: string) => {
    setSelectedTable(tableName);
    const table = tables.find(t => t.tableName === tableName);
    if (table) {
      setTableData(table.sampleData);
    }
  };

  // Export table data as CSV
  const exportTableData = (tableName: string) => {
    const table = tables.find(t => t.tableName === tableName);
    if (!table) return;
    
    const csvContent = [
      table.columns.join(','),
      ...table.sampleData.map(row => 
        table.columns.map(col => {
          const value = row[col];
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }
          return `"${value || ''}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter table data
  const filteredTableData = tableData.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    fetchTableInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading database information...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Viewer</h1>
          <p className="text-gray-600">View raw data from traceability tables for debugging and analysis</p>
        </div>
        <Button onClick={fetchTableInfo} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card key={table.tableName} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Table className="w-6 h-6 text-blue-500 mr-2" />
                <h3 className="font-medium text-gray-900">{table.tableName.replace(/_/g, ' ')}</h3>
              </div>
              <Badge variant="outline">{table.count} records</Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                {table.columns.length} columns
              </p>
              <p className="text-xs text-gray-500">
                {table.columns.slice(0, 3).join(', ')}
                {table.columns.length > 3 && '...'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => viewTableData(table.tableName)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                onClick={() => exportTableData(table.tableName)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Table Data Viewer */}
      {selectedTable && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedTable.replace(/_/g, ' ')} Data
            </h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button
                onClick={() => exportTableData(selectedTable)}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => setSelectedTable(null)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {tables.find(t => t.tableName === selectedTable)?.columns.map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTableData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {tables.find(t => t.tableName === selectedTable)?.columns.map((column) => (
                      <td
                        key={column}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {(() => {
                          const value = row[column];
                          if (Array.isArray(value)) {
                            return value.join(', ');
                          }
                          if (typeof value === 'boolean') {
                            return value ? 'Yes' : 'No';
                          }
                          if (typeof value === 'number') {
                            return value.toFixed(2);
                          }
                          if (value && typeof value === 'string' && value.includes('T')) {
                            return new Date(value).toLocaleString();
                          }
                          return value || '-';
                        })()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTableData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No data found matching your search criteria.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

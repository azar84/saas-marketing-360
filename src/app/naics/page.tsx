"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileSpreadsheet, Database, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function NAICSTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const downloadExcel = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/naics/build');
      if (!response.ok) throw new Error('Failed to generate Excel');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'naics_canonical_2022.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Excel file downloaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download Excel file' });
      console.error('Error downloading Excel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAPI = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/naics/data');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `API working! Found ${data.metadata.classifications_count} classifications, ${data.metadata.aliases_count} aliases, and ${data.metadata.changes_count} changes.` 
        });
      } else {
        setMessage({ type: 'error', text: 'API returned error' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test API' });
      console.error('Error testing API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            NAICS Classification System
          </h1>
          <p className="text-gray-600">
            Test the North American Industry Classification System integration
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <Card className="mb-6 p-4">
            <div className={`flex items-center gap-2 ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              {message.text}
            </div>
          </Card>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Download Excel</h3>
                <p className="text-gray-600 text-sm">
                  Generate and download the complete NAICS Excel file
                </p>
              </div>
            </div>
            <Button 
              onClick={downloadExcel}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Generating...' : 'Download NAICS Excel'}
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">Test API</h3>
                <p className="text-gray-600 text-sm">
                  Test the NAICS data API endpoint
                </p>
              </div>
            </div>
            <Button 
              onClick={testAPI}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test NAICS API'}
            </Button>
          </Card>
        </div>

        {/* Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">About NAICS</h3>
          <div className="text-gray-600 space-y-2 text-sm">
            <p>
              The North American Industry Classification System (NAICS) is the standard used by Federal 
              statistical agencies in classifying business establishments for the purpose of collecting, 
              analyzing, and publishing statistical data related to the U.S. business economy.
            </p>
            <p>
              This implementation provides:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Complete 2022 NAICS classifications (2-6 digit codes)</li>
              <li>US and Canadian industry codes unified</li>
              <li>Canadian wholesale aliases mapped to US equivalents</li>
              <li>Historical changes from 2017 to 2022</li>
              <li>Excel export functionality</li>
              <li>Database integration for applications</li>
            </ul>
          </div>
        </Card>

        {/* Admin Panel Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            For full management capabilities, visit the admin panel
          </p>
          <Button 
            onClick={() => window.location.href = '/admin-panel'}
            variant="outline"
          >
            Go to Admin Panel
          </Button>
        </div>
      </div>
    </main>
  );
}

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface EnrichedDataDisplayProps {
  data: any;
  className?: string;
}

export function EnrichedDataDisplay({ data, className }: EnrichedDataDisplayProps) {
  if (!data) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        No enriched data available
      </div>
    );
  }

  const renderSection = (title: string, content: any, icon: string) => (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h6 className="font-semibold text-gray-900">{title}</h6>
      </div>
      {content}
    </Card>
  );

  const renderList = (items: string[], emptyMessage: string = 'None available') => {
    if (!items || items.length === 0) {
      return <span className="text-gray-500 text-sm">{emptyMessage}</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {item}
          </Badge>
        ))}
      </div>
    );
  };

  const renderContactInfo = (contact: any) => {
    if (!contact) return <span className="text-gray-500 text-sm">No contact information</span>;
    
    return (
      <div className="space-y-2 text-sm">
        {contact.email && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📧</span>
            <span className="font-mono">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📞</span>
            <span className="font-mono">{contact.phone}</span>
          </div>
        )}
        {contact.address && (
          <div className="flex items-start gap-2">
            <span className="text-gray-600">📍</span>
            <div className="text-sm">
              {contact.address.street && <div>{contact.address.street}</div>}
              {contact.address.city && contact.address.state && (
                <div>{contact.address.city}, {contact.address.state}</div>
              )}
              {contact.address.country && <div>{contact.address.country}</div>}
            </div>
          </div>
        )}
        {contact.socialMedia && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">🔗</span>
            <div className="flex gap-2">
              {contact.socialMedia.linkedin && (
                <a href={contact.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline text-xs">LinkedIn</a>
              )}
              {contact.socialMedia.twitter && (
                <a href={contact.socialMedia.twitter} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline text-xs">Twitter</a>
              )}
              {contact.socialMedia.facebook && (
                <a href={contact.socialMedia.facebook} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline text-xs">Facebook</a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExecutives = (executives: any[]) => {
    if (!executives || executives.length === 0) {
      return <span className="text-gray-500 text-sm">No executive information available</span>;
    }
    
    return (
      <div className="space-y-2">
        {executives.map((exec, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div>
              <div className="font-medium text-sm">{exec.name}</div>
              <div className="text-xs text-gray-600">{exec.title}</div>
            </div>
            {exec.linkedin && (
              <a href={exec.linkedin} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline text-xs">LinkedIn</a>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTechnology = (tech: any) => {
    if (!tech) return <span className="text-gray-500 text-sm">No technology information</span>;
    
    return (
      <div className="space-y-3">
        {tech.platforms && tech.platforms.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Platforms</div>
            {renderList(tech.platforms)}
          </div>
        )}
        {tech.tools && tech.tools.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Tools</div>
            {renderList(tech.tools)}
          </div>
        )}
        {tech.infrastructure && tech.infrastructure.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Infrastructure</div>
            {renderList(tech.infrastructure)}
          </div>
        )}
        {tech.languages && tech.languages.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Programming Languages</div>
            {renderList(tech.languages)}
          </div>
        )}
        {tech.databases && tech.databases.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Databases</div>
            {renderList(tech.databases)}
          </div>
        )}
      </div>
    );
  };

  const renderMarketData = (market: any) => {
    if (!market) return <span className="text-gray-500 text-sm">No market information</span>;
    
    return (
      <div className="space-y-3">
        {market.targetCustomers && market.targetCustomers.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Target Customers</div>
            {renderList(market.targetCustomers)}
          </div>
        )}
        {market.competitors && market.competitors.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Competitors</div>
            {renderList(market.competitors)}
          </div>
        )}
        {market.keywords && market.keywords.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Keywords</div>
            {renderList(market.keywords)}
          </div>
        )}
        {market.uniqueValue && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Unique Value Proposition</div>
            <div className="text-sm bg-blue-50 p-2 rounded">{market.uniqueValue}</div>
          </div>
        )}
      </div>
    );
  };

  const renderRawData = (rawData: any) => {
    if (!rawData) return null;
    
    return (
      <Card className="p-4">
        <h6 className="font-semibold text-gray-900 mb-3">🔍 Raw Source Data</h6>
        <div className="space-y-3 text-xs">
          {rawData.website && (
            <div>
              <div className="font-medium text-gray-700 mb-1">Website Scraping</div>
              <div className="bg-gray-50 p-2 rounded">
                <div><strong>Title:</strong> {rawData.website.title || 'N/A'}</div>
                <div><strong>Description:</strong> {rawData.website.description || 'N/A'}</div>
                <div><strong>Technologies:</strong> {renderList(rawData.website.technologies || [])}</div>
                <div><strong>Status:</strong> <Badge variant={rawData.website.status === 'success' ? 'default' : 'destructive'}>{rawData.website.status}</Badge></div>
              </div>
            </div>
          )}
          
          {rawData.googleSearch && (
            <div>
              <div className="font-medium text-gray-700 mb-1">Google Search Results</div>
              <div className="bg-gray-50 p-2 rounded">
                <div><strong>Results Found:</strong> {rawData.googleSearch.searchResults?.length || 0}</div>
                {rawData.googleSearch.extractedInfo && (
                  <div className="mt-1">
                    {rawData.googleSearch.extractedInfo.employeeCount && (
                      <div><strong>Employees:</strong> {rawData.googleSearch.extractedInfo.employeeCount}</div>
                    )}
                    {rawData.googleSearch.extractedInfo.funding && (
                      <div><strong>Funding:</strong> {rawData.googleSearch.extractedInfo.funding}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {rawData.llm && (
            <div>
              <div className="font-medium text-gray-700 mb-1">AI Processing</div>
              <div className="bg-gray-50 p-2 rounded">
                <div><strong>Processed At:</strong> {new Date(rawData.llm.processedAt).toLocaleString()}</div>
                <div><strong>Confidence:</strong> <Badge variant="outline">{(rawData.llm.confidence * 100).toFixed(1)}%</Badge></div>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Company Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSection(
          "🏢 Company Information",
          <div className="space-y-2 text-sm">
            <div><strong>Name:</strong> {data.companyName || 'N/A'}</div>
            {data.legalName && <div><strong>Legal Name:</strong> {data.legalName}</div>}
            {data.dba && <div><strong>DBA:</strong> {data.dba}</div>}
            {data.description && (
              <div>
                <strong>Description:</strong>
                <div className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">{data.description}</div>
              </div>
            )}
            {data.founded && <div><strong>Founded:</strong> {data.founded}</div>}
            <div><strong>Website:</strong> <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{data.website}</a></div>
          </div>,
          "🏢"
        )}

        {renderSection(
          "📞 Contact Information",
          renderContactInfo(data.contact),
          "📞"
        )}
      </div>

      {/* Business Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSection(
          "💼 Business Details",
          <div className="space-y-2 text-sm">
            {data.business?.industry && <div><strong>Industry:</strong> {data.business.industry}</div>}
            {data.business?.sector && <div><strong>Sector:</strong> {data.business.sector}</div>}
            {data.business?.employeeCount && <div><strong>Employee Count:</strong> {data.business.employeeCount}</div>}
            {data.business?.employeeRange && <div><strong>Employee Range:</strong> {data.business.employeeRange}</div>}
            {data.business?.revenue && <div><strong>Revenue:</strong> {data.business.revenue}</div>}
            {data.business?.isPublic && <div><strong>Public Company:</strong> <Badge variant={data.business.isPublic ? 'default' : 'secondary'}>{data.business.isPublic ? 'Yes' : 'No'}</Badge></div>}
            {data.business?.stockSymbol && <div><strong>Stock Symbol:</strong> {data.business.stockSymbol}</div>}
          </div>,
          "💼"
        )}

        {renderSection(
          "👥 People & Team",
          <div className="space-y-2 text-sm">
            {data.people?.totalEmployees && <div><strong>Total Employees:</strong> {data.people.totalEmployees}</div>}
            {data.people?.keyDepartments && (
              <div>
                <strong>Key Departments:</strong>
                {renderList(data.people.keyDepartments)}
              </div>
            )}
            {data.people?.executives && (
              <div>
                <strong>Executives:</strong>
                {renderExecutives(data.people.executives)}
              </div>
            )}
          </div>,
          "👥"
        )}
      </div>

      {/* Technology Stack */}
      {renderSection(
        "🛠️ Technology Stack",
        renderTechnology(data.technology),
        "🛠️"
      )}

      {/* Market & Positioning */}
      {renderSection(
        "🎯 Market & Positioning",
        renderMarketData(data.market),
        "🎯"
      )}

      {/* Raw Source Data */}
      {renderRawData(data.rawData)}

      {/* Metadata */}
      <Card className="p-4">
        <h6 className="font-semibold text-gray-900 mb-3">📊 Enrichment Metadata</h6>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Confidence</div>
            <div className="font-medium">{((data.metadata?.confidence || 0) * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-gray-600">Sources Used</div>
            <div className="font-medium">{data.metadata?.successfulSources || 0}/{data.metadata?.totalSources || 0}</div>
          </div>
          <div>
            <div className="text-gray-600">Last Updated</div>
            <div className="font-medium">{data.metadata?.lastUpdated ? new Date(data.metadata.lastUpdated).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-600">Version</div>
            <div className="font-medium">{data.metadata?.version || 'N/A'}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

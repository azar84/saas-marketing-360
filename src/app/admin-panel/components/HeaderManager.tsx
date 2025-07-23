'use client';

import React, { useState, useEffect } from 'react';
import { Page, CTA, HeaderConfig, HeaderNavItem, HeaderCTA } from '../../../types';

const HeaderManager = () => {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [ctaButtons, setCtaButtons] = useState<CTA[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCTAForm, setShowCTAForm] = useState(false);

  // Form states
  const [navItems, setNavItems] = useState<Partial<HeaderNavItem>[]>([]);
  const [selectedCTAs, setSelectedCTAs] = useState<Array<{
    id?: number; // HeaderCTA ID
    ctaId: number; // CTA ID
    sortOrder: number;
    isVisible: boolean;
  }>>([]);
  const [newCTA, setNewCTA] = useState({
    text: '',
    url: '',
    style: 'primary',
    target: '_self'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [headerResponse, pagesResponse, ctaResponse] = await Promise.all([
        fetch('/api/admin/header-config'),
        fetch('/api/admin/pages'),
        fetch('/api/admin/cta-buttons')
      ]);

      const headerData = await headerResponse.json();
      const pagesData = await pagesResponse.json();
      const ctaData = await ctaResponse.json();

      // Handle header config data
      if (Array.isArray(headerData) && headerData.length > 0) {
        const config = headerData[0];
        setHeaderConfig(config);
        setNavItems(config.navItems || []);
        // Map HeaderCTA objects to include both the headerCTA ID and the CTA ID
        setSelectedCTAs((config.headerCTAs || []).map((headerCta: any) => ({
          id: headerCta.id, // HeaderCTA ID
          ctaId: headerCta.ctaId, // CTA ID
          sortOrder: headerCta.sortOrder,
          isVisible: headerCta.isVisible
        })));
      } else if (headerData.success) {
        setHeaderConfig(headerData.data);
        if (headerData.data) {
          setNavItems(headerData.data.navItems || []);
          // Map HeaderCTA objects to include both the headerCTA ID and the CTA ID
          setSelectedCTAs((headerData.data.headerCTAs || []).map((headerCta: any) => ({
            id: headerCta.id, // HeaderCTA ID
            ctaId: headerCta.ctaId, // CTA ID
            sortOrder: headerCta.sortOrder,
            isVisible: headerCta.isVisible
          })));
        }
      }

      // Handle pages data
      if (Array.isArray(pagesData)) {
        setPages(pagesData);
      } else if (pagesData.success) {
        setPages(pagesData.data);
      }

      // Handle CTA data
      if (Array.isArray(ctaData)) {
        setCtaButtons(ctaData);
      } else if (ctaData.success) {
        setCtaButtons(ctaData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNavItem = () => {
    setNavItems([
      ...navItems,
      {
        pageId: null,
        customText: '',
        customUrl: '',
        sortOrder: navItems.length,
        isVisible: true
      }
    ]);
  };

  const updateNavItem = (index: number, updates: Partial<HeaderNavItem>) => {
    const updated = [...navItems];
    updated[index] = { ...updated[index], ...updates };
    setNavItems(updated);
  };

  const removeNavItem = (index: number) => {
    setNavItems(navItems.filter((_, i) => i !== index));
  };

  const addCTAToHeader = async (ctaId: number) => {
    if (selectedCTAs.find(item => item.ctaId === ctaId)) {
      alert('CTA is already in header');
      return;
    }

    try {
      const response = await fetch('/api/admin/header-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addCta',
          ctaId: ctaId
        })
      });

      const result = await response.json();
      if (result.success) {
        // Refresh the header config to get the proper HeaderCTA ID
        await fetchData();
        alert('CTA added to header successfully!');
      } else {
        alert(result.message || 'Failed to add CTA to header');
      }
    } catch (error) {
      console.error('Failed to add CTA to header:', error);
      alert('Failed to add CTA to header');
    }
  };

  const removeCTAFromHeader = async (ctaId: number) => {
    const headerCta = selectedCTAs.find(item => item.ctaId === ctaId);
    if (!headerCta) return;

    try {
      // If we have the headerCTA ID, use the remove action
      if (headerCta.id) {
        const response = await fetch('/api/admin/header-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'removeCta',
            headerCtaId: headerCta.id
          })
        });

                 const result = await response.json();
         if (result.success) {
           // Refresh the header config to get updated state
           await fetchData();
           alert('CTA removed from header successfully!');
         } else {
           alert(result.message || 'Failed to remove CTA from header');
         }
      } else {
        // If no headerCTA ID, just remove from local state (for newly added items)
        setSelectedCTAs(selectedCTAs.filter(item => item.ctaId !== ctaId));
        alert('CTA removed from header!');
      }
    } catch (error) {
      console.error('Failed to remove CTA from header:', error);
      alert('Failed to remove CTA from header');
    }
  };

  const createCTA = async () => {
    if (!newCTA.text || !newCTA.url) return;

    try {
      const response = await fetch('/api/admin/cta-buttons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCTA, isActive: true })
      });

      if (response.ok) {
        // Refresh the CTA buttons list
        const ctaResponse = await fetch('/api/admin/cta-buttons');
        const ctaData = await ctaResponse.json();
        
        if (Array.isArray(ctaData)) {
          setCtaButtons(ctaData);
        }
        
        setNewCTA({ text: '', url: '', style: 'primary', target: '_self' });
        setShowCTAForm(false);
        alert('CTA button created successfully!');
      } else {
        alert('Failed to create CTA button');
      }
    } catch (error) {
      console.error('Failed to create CTA:', error);
      alert('Failed to create CTA button');
    }
  };

  const saveHeaderConfig = async () => {
    try {
      setSaving(true);

      const configData = {
        navItems: navItems.map((item, index) => ({
          ...item,
          sortOrder: index
        })),
        ctaButtons: selectedCTAs.map((item, index) => ({
          ...item,
          sortOrder: index
        }))
      };

      const url = '/api/admin/header-config';
      const method = headerConfig ? 'PUT' : 'POST';
      const body = headerConfig 
        ? { ...configData, id: headerConfig.id }
        : configData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        setHeaderConfig(data.data);
        alert('Header configuration saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save header config:', error);
      alert('Failed to save header configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Header Configuration</h2>
          <p className="text-gray-600 mt-2">Configure navigation items and CTA buttons for your website header</p>
        </div>
        <button
          onClick={saveHeaderConfig}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Navigation Items Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Navigation Items</h3>
          <button
            onClick={addNavItem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add Navigation Item
          </button>
        </div>

        <div className="space-y-4">
          {navItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Type
                  </label>
                  <select
                    value={item.pageId ? 'page' : 'custom'}
                    onChange={(e) => {
                      if (e.target.value === 'page') {
                        updateNavItem(index, { pageId: pages[0]?.id || null, customText: null, customUrl: null });
                      } else {
                        updateNavItem(index, { pageId: null, customText: '', customUrl: '' });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="page">Page Link</option>
                    <option value="custom">Custom Link</option>
                  </select>
                </div>

                {item.pageId ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Page
                    </label>
                    <select
                      value={item.pageId || ''}
                      onChange={(e) => updateNavItem(index, { pageId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a page</option>
                      {pages.map(page => (
                        <option key={page.id} value={page.id}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link Text
                      </label>
                      <input
                        type="text"
                        value={item.customText || ''}
                        onChange={(e) => updateNavItem(index, { customText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter link text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link URL
                      </label>
                      <input
                        type="url"
                        value={item.customUrl || ''}
                        onChange={(e) => updateNavItem(index, { customUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <div className="relative mr-2">
                      <input
                        type="checkbox"
                        checked={item.isVisible}
                        onChange={(e) => updateNavItem(index, { isVisible: e.target.checked })}
                        className="w-4 h-4 appearance-none bg-white border border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 checked:bg-blue-600 checked:border-blue-600"
                        style={{ appearance: 'none' }}
                      />
                      {item.isVisible && (
                        <svg
                          className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">Visible</span>
                  </label>
                  <button
                    onClick={() => removeNavItem(index)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">CTA Buttons</h3>
          <button
            onClick={() => setShowCTAForm(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Create New CTA
          </button>
        </div>

        {/* Available CTA Buttons */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Available CTA Buttons</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ctaButtons.map(cta => (
              <div key={cta.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{cta.text}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    cta.style === 'primary' ? 'bg-blue-100 text-blue-800' :
                    cta.style === 'secondary' ? 'bg-gray-100 text-gray-800' :
                    cta.style === 'outline' ? 'bg-white text-gray-800 border border-gray-300' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {cta.style}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{cta.url}</p>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${cta.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {cta.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {selectedCTAs.find(item => item.ctaId === cta.id) ? (
                    <button
                      onClick={() => removeCTAFromHeader(cta.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove from Header
                    </button>
                  ) : (
                    <button
                      onClick={() => addCTAToHeader(cta.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Add to Header
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected CTA Buttons */}
        {selectedCTAs.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Selected for Header</h4>
            <div className="space-y-2">
              {selectedCTAs.map((item, index) => {
                const cta = ctaButtons.find(c => c.id === item.ctaId);
                if (!cta) return null;
                
                return (
                  <div key={item.ctaId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                      <span className="font-medium">{cta.text}</span>
                      <span className="text-sm text-gray-600">({cta.style})</span>
                    </div>
                    <button
                      onClick={() => item.ctaId && removeCTAFromHeader(item.ctaId)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create CTA Modal */}
      {showCTAForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New CTA Button</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={newCTA.text}
                  onChange={(e) => setNewCTA({ ...newCTA, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Get Started"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button URL
                </label>
                <input
                  type="text"
                  value={newCTA.url}
                  onChange={(e) => setNewCTA({ ...newCTA, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com, /page, or #section"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a full URL, relative path, or anchor link (e.g., #pricing, #contact)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Style
                </label>
                <select
                  value={newCTA.style}
                  onChange={(e) => setNewCTA({ ...newCTA, style: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target
                </label>
                <select
                  value={newCTA.target}
                  onChange={(e) => setNewCTA({ ...newCTA, target: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="_self">Same Window</option>
                  <option value="_blank">New Window</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCTAForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createCTA}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create CTA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderManager; 

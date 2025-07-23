'use client';

import React, { useEffect, useState } from 'react';
import ClientFooter from './ClientFooter';

interface Page {
  id: number;
  slug: string;
  title: string;
  showInFooter: boolean;
  sortOrder: number;
}

export default function Footer() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        // Fetch pages that should show in footer from API
        const response = await fetch('/api/admin/pages');
        const data = await response.json();
        
        if (data.success && data.data) {
          const footerPages = data.data.filter((page: any) => page.showInFooter);
          setPages(footerPages);
        }
      } catch (error) {
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  return <ClientFooter pages={pages} />;
} 

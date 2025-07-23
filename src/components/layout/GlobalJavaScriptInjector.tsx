'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface GlobalFunctions {
  functions: string;
}

export default function GlobalJavaScriptInjector() {
  const [functions, setFunctions] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();

  // Check if we're on an admin panel page
  const isAdminPanel = pathname?.startsWith('/admin-panel');

  useEffect(() => {
    // Skip global functions injection if we're on admin panel pages
    if (isAdminPanel) {
      console.log('🚫 Skipping global functions injection on admin panel page');
      return;
    }

    const fetchAndInjectFunctions = async () => {
      try {
        const response = await fetch('/api/admin/global-functions');
        if (response.ok) {
          const data: GlobalFunctions = await response.json();
          if (data.functions && data.functions.trim()) {
            setFunctions(data.functions);
            
            // Create and inject the script
            const script = document.createElement('script');
            script.id = 'global-cta-functions';
            script.textContent = data.functions;
            script.setAttribute('data-injected', 'true');
            
            // Remove any existing script
            const existingScript = document.getElementById('global-cta-functions');
            if (existingScript) {
              existingScript.remove();
            }
            
            // Inject after body tag opens
            document.body.appendChild(script);
            setIsLoaded(true);
            
            console.log('Global CTA functions injected successfully');
          }
        }
      } catch (error) {
        console.error('Error fetching global functions:', error);
      }
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fetchAndInjectFunctions);
    } else {
      fetchAndInjectFunctions();
    }

    return () => {
      // Cleanup: remove the script when component unmounts
      const script = document.getElementById('global-cta-functions');
      if (script) {
        script.remove();
      }
    };
  }, [isAdminPanel]);

  // This component doesn't render anything visible
  return null;
} 
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface ScriptSection {
  id: number;
  name: string;
  scriptContent: string;
  isActive: boolean;
  createdAt: string;
}

const ScriptInjector: React.FC = () => {
  const [scripts, setScripts] = useState<ScriptSection[]>([]);
  const [injectedScripts, setInjectedScripts] = useState<Set<number>>(new Set());
  const pathname = usePathname();

  // Check if we're on an admin panel page
  const isAdminPanel = pathname?.startsWith('/admin-panel');

  useEffect(() => {
    // Skip script injection if we're on admin panel pages
    if (isAdminPanel) {
      console.log('🚫 Skipping script injection on admin panel page');
      return;
    }

    const fetchAndInjectScripts = async () => {
      try {
        const response = await fetch('/api/admin/script-sections');
        if (!response.ok) return;
        
        const allScripts: ScriptSection[] = await response.json();
        
        // Filter active scripts and sort by creation date
        const activeScripts = allScripts
          .filter(script => script.isActive)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        setScripts(activeScripts);
        
        // Inject scripts that haven't been injected yet
        activeScripts.forEach(script => {
          if (!injectedScripts.has(script.id)) {
            injectScript(script);
            setInjectedScripts(prev => new Set(prev).add(script.id));
          }
        });
        
      } catch (error) {
        console.error('Error fetching scripts:', error);
      }
    };

    fetchAndInjectScripts();
  }, [injectedScripts, isAdminPanel]);

  const injectScript = (script: ScriptSection) => {
    try {
      // Create script element
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('data-script-id', script.id.toString());
      scriptElement.setAttribute('data-script-name', script.name);
      
      // Check if it's an external script or inline script
      if (script.scriptContent.includes('src=')) {
        // Extract src from script tag
        const srcMatch = script.scriptContent.match(/src=["']([^"']+)["']/);
        if (srcMatch) {
          scriptElement.src = srcMatch[1];
        } else {
          // Fallback to inline script - extract content from script tags
          const contentMatch = script.scriptContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
          scriptElement.textContent = contentMatch ? contentMatch[1] : script.scriptContent;
        }
      } else {
        // Inline script - extract content from script tags if present
        const contentMatch = script.scriptContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        scriptElement.textContent = contentMatch ? contentMatch[1] : script.scriptContent;
      }
      
      // Inject into footer (end of body)
      document.body.appendChild(scriptElement);
      
      console.log(`✅ Injected script: ${script.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to inject script "${script.name}":`, error);
    }
  };

  // Cleanup function to remove scripts when component unmounts
  useEffect(() => {
    return () => {
      // Remove all injected scripts
      scripts.forEach(script => {
        const scriptElement = document.querySelector(`[data-script-id="${script.id}"]`);
        if (scriptElement) {
          scriptElement.remove();
        }
      });
    };
  }, [scripts]);

  // This component doesn't render anything visible
  return null;
};

export default ScriptInjector; 
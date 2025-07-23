/**
 * SSR Page Template for Saski AI Website
 * 
 * Copy this template when creating new pages to ensure SSR is properly configured.
 * 
 * Usage:
 * 1. Copy this file to your new page location (e.g., src/app/new-page/page.tsx)
 * 2. Update the component name and content
 * 3. Add any server-side data fetching as needed
 * 4. Ensure all content is rendered server-side (no useEffect for initial data)
 */

import { prisma } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// ✅ REQUIRED: Force dynamic rendering to ensure SSR
export const dynamic = 'force-dynamic';

// Optional: Disable caching if needed
export const revalidate = 0;

// Server-side data fetching (if needed)
async function getPageData() {
  try {
    // Example: Fetch data from database
    const data = await prisma.siteSettings.findFirst();
    return data;
  } catch (error) {
    console.error('Error fetching page data:', error);
    return null;
  }
}

export default async function NewPageName() {
  // ✅ Fetch data on the server (not in useEffect)
  const pageData = await getPageData();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Page Title
        </h1>
        
        <div className="prose max-w-none">
          <p>Your page content here...</p>
          
          {/* ✅ Server-rendered content */}
          {pageData && (
            <div>
              <h2>Server-side Data:</h2>
              <pre>{JSON.stringify(pageData, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

/**
 * ✅ SSR Checklist for New Pages:
 * 
 * [ ] export const dynamic = 'force-dynamic'
 * [ ] All content rendered server-side (no useEffect for initial data)
 * [ ] Server-side data fetching with async/await
 * [ ] Error handling for data fetching
 * [ ] No client-side only hooks for main content
 * [ ] Test that page source shows full HTML content
 */ 
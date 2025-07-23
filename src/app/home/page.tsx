import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServerDynamicPageRenderer from '@/components/sections/ServerDynamicPageRenderer';
import { generatePageMetadata } from '@/lib/metadata';

// Force dynamic rendering - ensures SSR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate metadata for home page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('home');
}

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div>
        {/* Server-Side Rendered Page Content from Page Builder */}
        <ServerDynamicPageRenderer pageSlug="home" />
      </div>
      
      <Footer />
    </main>
  );
} 
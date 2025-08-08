import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DesignSystemProvider from '../components/layout/DesignSystemProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SaaS Admin Panel',
  description: 'Modern SaaS admin panel for platform administration',
  keywords: 'admin, dashboard, saas, management',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'SaaS Admin Panel',
    description: 'Modern SaaS admin panel for platform administration',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaS Admin Panel',
    description: 'Modern SaaS admin panel for platform administration',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DesignSystemProvider>
          {children}
        </DesignSystemProvider>
      </body>
    </html>
  );
}

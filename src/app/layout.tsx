import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import DesignSystemProvider from "../components/layout/DesignSystemProvider";
import DynamicFavicon from "../components/layout/DynamicFavicon";
import AnalyticsProvider from "../components/layout/AnalyticsProvider";
import ScriptInjector from "../components/layout/ScriptInjector";
import GlobalJavaScriptInjector from "../components/layout/GlobalJavaScriptInjector";
import "./globals.css";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Saski AI - Transform Your Customer Communication with AI",
    description: "Empower your business with intelligent conversations across WhatsApp, SMS, Telegram, and more. Automate responses, capture leads, and delight customers 24/7.",
    keywords: "AI chatbot, customer service automation, WhatsApp business, multi-channel communication, lead generation",
    authors: [{ name: "Saski AI" }],
    creator: "Saski AI",
    publisher: "Saski AI",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://saskiai.com"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "Saski AI - Transform Your Customer Communication with AI",
      description: "Empower your business with intelligent conversations across WhatsApp, SMS, Telegram, and more. Automate responses, capture leads, and delight customers 24/7.",
      url: "https://saskiai.com",
      siteName: "Saski AI",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Saski AI - AI-Powered Customer Communication",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Saski AI - Transform Your Customer Communication with AI",
      description: "Empower your business with intelligent conversations across WhatsApp, SMS, Telegram, and more.",
      images: ["/og-image.jpg"],
      creator: "@saskiai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
    },
    other: {
      'color-scheme': 'light'
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="light" style={{colorScheme: 'light'}}>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <DesignSystemProvider>
            <ThemeProvider
              attribute="data-theme"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange={false}
            >
              <DynamicFavicon />
              <AnalyticsProvider />
              <ScriptInjector />
              <GlobalJavaScriptInjector />
              {children}
            </ThemeProvider>
          </DesignSystemProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

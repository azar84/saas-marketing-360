import Image from 'next/image';
import { prisma } from '@/lib/db';

// Force dynamic rendering - ensures SSR
export const dynamic = 'force-dynamic';

// Server-side data fetching
async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return settings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

export default async function TestLogoPage() {
  const siteSettings = await getSiteSettings();

  if (!siteSettings) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Logo Test Page</h1>
        <div className="text-red-600">Failed to load site settings</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Logo Test Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Site Settings:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(siteSettings, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Logo Tests:</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {siteSettings?.logoLightUrl && (
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">Light Logo (for dark backgrounds)</h3>
              <div className="bg-gray-800 p-4 rounded">
                <Image
                  src={siteSettings.logoLightUrl}
                  alt="Light Logo"
                  width={200}
                  height={60}
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{siteSettings.logoLightUrl}</p>
            </div>
          )}

          {siteSettings?.logoDarkUrl && (
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">Dark Logo (for light backgrounds)</h3>
              <div className="bg-white p-4 rounded border">
                <Image
                  src={siteSettings.logoDarkUrl}
                  alt="Dark Logo"
                  width={200}
                  height={60}
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{siteSettings.logoDarkUrl}</p>
            </div>
          )}

          {siteSettings?.faviconUrl && (
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">Favicon</h3>
              <div className="bg-white p-4 rounded border">
                <Image
                  src={siteSettings.faviconUrl}
                  alt="Favicon"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{siteSettings.faviconUrl}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
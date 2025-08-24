import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: number;
      username: string;
      role: string;
    };
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  console.log('🔒 Middleware executing for:', request.nextUrl.pathname);
  console.log('🔒 Middleware URL:', request.url);
  console.log('🔒 Middleware method:', request.method);
  
  // Handle admin panel authentication
  if (request.nextUrl.pathname.startsWith('/admin-panel')) {
    console.log('🔒 Admin panel route detected:', request.nextUrl.pathname);
    
    // Skip auth for login and reset password pages
    if (request.nextUrl.pathname === '/admin-panel/login' || 
        request.nextUrl.pathname === '/admin-panel/reset-password') {
      console.log('🔒 Skipping auth for login/reset page');
      return NextResponse.next();
    }

    // Check for JWT token in cookies or headers
    const cookieToken = request.cookies.get('adminToken')?.value;
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const token = cookieToken || headerToken;
    
    console.log('🔒 Token found in cookie:', !!cookieToken);
    console.log('🔒 Token found in header:', !!headerToken);
    console.log('🔒 Final token:', !!token);

    if (!token) {
      console.log('🔐 No token found - redirecting to login');
      return NextResponse.redirect(new URL('/admin-panel/login', request.url));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('🔐 Invalid token - redirecting to login');
      // Clear invalid token cookie if present
      const response = NextResponse.redirect(new URL('/admin-panel/login', request.url));
      response.cookies.delete('adminToken');
      return response;
    }

    console.log('🔐 Valid token found for user:', decoded.username);
    // Add user info to request for API routes
    (request as AuthenticatedRequest).user = decoded;
  }

  // Get the response for all routes
  const response = NextResponse.next();
  
  // Force no-cache for all pages to ensure SSR
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  // Add SSR indicator header for debugging
  response.headers.set('X-SSR-Enforced', 'true');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match admin panel routes and other page routes, but exclude:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap files)
     */
    '/admin-panel/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap|uploads).*)',
  ],
}; 
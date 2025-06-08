
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth'; 

const publicPaths = ['/login'];
const protectedPathsPrefix = '/dashboard'; // All paths starting with this are protected

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('adminity_session')?.value;

  let sessionPayload = null;
  if (sessionCookie) {
    try {
      sessionPayload = await decrypt(sessionCookie);
    } catch (error) {
      // Decryption failed (e.g. invalid token, expired)
      sessionPayload = null;
    }
  }
  
  const isAuthenticated = !!sessionPayload?.userId;

  // Handle public paths
  if (publicPaths.includes(path)) {
    if (isAuthenticated) {
      // User is authenticated but trying to access a public page (e.g., /login)
      // Redirect them to the dashboard.
      return NextResponse.redirect(new URL(protectedPathsPrefix, request.url));
    }
    // User is not authenticated and is on a public path, allow access.
    return NextResponse.next();
  }

  // For all other paths (assumed to be protected or require authentication check)
  if (isAuthenticated) {
    // User is authenticated, allow access to the protected path.
    return NextResponse.next();
  }

  // User is NOT authenticated and is trying to access a protected path (or any path not explicitly public).
  // Redirect them to the login page.
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  if (sessionCookie && !sessionPayload) {
    // If there was a session cookie but it was invalid (decryption failed or no userId),
    // clear it to prevent a redirect loop with a bad cookie.
    response.cookies.delete('adminity_session');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

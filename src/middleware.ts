
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth'; 

const publicPaths = ['/login'];
const protectedPathsPrefix = '/dashboard'; // All paths starting with this are protected

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('adminity_session')?.value;

  let sessionPayload = null;
  // Explicitly check if sessionCookie is not undefined AND not an empty string before attempting decryption
  if (sessionCookie && sessionCookie !== '') {
    try {
      sessionPayload = await decrypt(sessionCookie);
    } catch (error) {
      // Decryption failed (e.g. invalid token, expired)
      sessionPayload = null;
    }
  } else if (sessionCookie === '') {
    // If the cookie is an empty string, it implies an invalid/cleared session.
    sessionPayload = null;
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

  // This logic is for clearing a cookie if it was present but invalid.
  // After logout, sessionCookie might be '' or undefined.
  // If sessionCookie was present (not undefined) but decrypt() returned null (making sessionPayload null),
  // this ensures the bad/invalid cookie is cleared.
  if (typeof sessionCookie === 'string' && !sessionPayload) {
    // Ensure consistent cookie clearing method
    response.cookies.set('adminity_session', '', { 
      expires: new Date(0), 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

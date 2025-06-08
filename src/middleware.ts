import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth'; 

const publicPaths = ['/login'];
const protectedPathsPrefix = '/dashboard';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('adminity_session')?.value;

  // Try to decrypt the session cookie
  let sessionPayload = null;
  if (sessionCookie) {
    sessionPayload = await decrypt(sessionCookie);
  }

  const isAuthenticated = !!sessionPayload?.userId;

  // If trying to access a protected route without authentication, redirect to login
  if (path.startsWith(protectedPathsPrefix) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated and trying to access a public route like /login, redirect to dashboard
  if (isAuthenticated && publicPaths.includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If session is invalid/expired and user is on a protected route, redirect to login
  if (path.startsWith(protectedPathsPrefix) && sessionCookie && !sessionPayload) {
     // Optionally, delete the invalid cookie
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('adminity_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

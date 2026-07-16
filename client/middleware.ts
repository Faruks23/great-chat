import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const hasToken = Boolean(request.cookies.get('authToken')?.value);
    const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url));

    if (pathname === '/') {
      return hasToken ? redirectTo('/chat') : NextResponse.next();
    }

    if (pathname === '/login' || pathname === '/register') {
      return hasToken ? redirectTo('/chat') : NextResponse.next();
    }

    const isProtectedRoute = ['/chat', '/calls', '/groups', '/profile', '/settings']
      .some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !hasToken) {
      return redirectTo('/login');
    }

    return NextResponse.next();
  } catch (error) {
    // Middleware must never make the whole deployment unavailable. Authentication
    // is also verified by the API, so allow the request if Edge request parsing
    // fails and record the cause in Vercel's runtime logs.
    console.error('Middleware failed:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/', '/login', '/register', '/chat/:path*', '/calls/:path*', '/groups/:path*', '/profile/:path*', '/settings/:path*'],
};

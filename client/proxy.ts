import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const token = request.cookies.get('authToken');

  if (url.pathname === '/') {
    if (token) {
      url.pathname = '/chat';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (url.pathname === '/login' || url.pathname === '/register') {
    if (token) {
      url.pathname = '/chat';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (url.pathname.startsWith('/chat') || url.pathname.startsWith('/calls') || url.pathname.startsWith('/groups') || url.pathname.startsWith('/profile') || url.pathname.startsWith('/settings')) {
    if (!token) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/chat/:path*', '/calls/:path*', '/groups/:path*', '/profile/:path*', '/settings/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getHomePathForRole } from '@/lib/authRedirects';
import { USER_ROLES } from '@/lib/roles';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return new TextEncoder().encode(secret);
}

async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  const role = typeof payload.role === 'string' ? payload.role : USER_ROLES.client;
  return { role, home: getHomePathForRole(role) };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Already logged in: skip login page and send clients to dashboard (not /schedule)
  if (pathname === '/login' || pathname === '/') {
    if (!token) return NextResponse.next();
    try {
      const { home } = await verifyAuthToken(token);
      return NextResponse.redirect(new URL(home, request.url));
    } catch {
      return NextResponse.next();
    }
  }

  // Admin area: require admin role
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { role } = await verifyAuthToken(token);
    if (role !== USER_ROLES.admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/admin', '/admin/:path*'],
};

import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.SESSION_SECRET ?? '';
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token && secret ? await verifySessionToken(token, secret) : null;
  const isLogin = pathname === '/admin/login';

  if (isLogin && session) return NextResponse.redirect(new URL('/admin', request.url));
  if (!isLogin && !session) return NextResponse.redirect(new URL('/admin/login', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };

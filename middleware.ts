import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface AuthUser {
  id: number;
  username: string;
  role: string;
}

function verifyTokenEdgeRuntime(token: string): AuthUser | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return null;
    
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    const user = verifyTokenEdgeRuntime(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*']
};
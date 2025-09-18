import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { storage } from '@server/storage';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const statistics = await storage.getStatistics();
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Statistics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
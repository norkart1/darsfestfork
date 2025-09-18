import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { storage } from '@server/storage';
import { darsSchema } from '@/lib/validation';

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

    const darsData = await storage.getAllDars();
    return NextResponse.json({ darsData });
  } catch (error) {
    console.error('Get dars error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = darsSchema.parse(body);

    const dars = await storage.createDars(validatedData);
    return NextResponse.json({ dars }, { status: 201 });
  } catch (error) {
    console.error('Create dars error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
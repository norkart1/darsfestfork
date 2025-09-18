import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken, createAdminUser } from '@/lib/auth';
import { storage } from '@server/storage';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if this is the first time - create default admin user
    const existingAdmin = await storage.getUserByUsername('admin');
    if (!existingAdmin && username === 'admin' && password === '123@Admin') {
      await createAdminUser('admin', '123@Admin');
    }

    // Authenticate user
    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Login endpoint' });
}
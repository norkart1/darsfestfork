import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

// Rate limiting store (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const { username, password } = validatedData;

    // Simple rate limiting
    const clientIp = request.ip || 'unknown';
    const now = Date.now();
    const attempts = loginAttempts.get(clientIp);
    
    if (attempts && attempts.count >= 5 && now - attempts.lastAttempt < 15 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // No auto-provisioning - admin users must be created separately

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
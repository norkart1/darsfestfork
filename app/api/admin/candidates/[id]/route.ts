import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { storage } from '@server/storage';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const candidateId = parseInt(params.id);
    const updateData = await request.json();

    const candidate = await storage.updateCandidate(candidateId, updateData);
    return NextResponse.json({ candidate });
  } catch (error) {
    console.error('Update candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const candidateId = parseInt(params.id);
    await storage.deleteCandidate(candidateId);
    
    return NextResponse.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
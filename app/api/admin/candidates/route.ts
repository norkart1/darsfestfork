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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const zone = searchParams.get('zone');

    let candidates;
    if (search || zone) {
      candidates = await storage.searchCandidates(search || '', zone || undefined);
    } else {
      candidates = await storage.getAllCandidates();
    }

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error('Get candidates error:', error);
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

    const candidateData = await request.json();
    
    // Check if candidate code already exists
    const existing = await storage.getCandidateByCode(candidateData.code);
    if (existing) {
      return NextResponse.json(
        { error: 'Candidate code already exists' },
        { status: 400 }
      );
    }

    const candidate = await storage.createCandidate(candidateData);
    return NextResponse.json({ candidate }, { status: 201 });
  } catch (error) {
    console.error('Create candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
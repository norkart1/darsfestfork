import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@server/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const zone = searchParams.get('zone') || '';
    const category = searchParams.get('category') || '';

    let candidates;
    
    if (search || zone || category) {
      // Use advanced search
      candidates = await storage.searchCandidatesAdvanced(search, zone, category);
    } else {
      // Get all candidates
      candidates = await storage.getAllCandidates();
    }

    return NextResponse.json({
      success: true,
      candidates,
      total: candidates.length
    });
  } catch (error) {
    console.error('Get public candidates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@server/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const zone = searchParams.get('zone') || '';

    const programs = await storage.getProgramsWithCandidateCounts(category, zone);

    return NextResponse.json({
      success: true,
      programs,
      total: programs.length
    });
  } catch (error) {
    console.error('Get public programs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@server/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get('zone') || '';
    const search = searchParams.get('search') || '';

    const darsData = await storage.getDarsWithCandidateCounts(zone, search);

    return NextResponse.json({
      success: true,
      dars: darsData,
      total: darsData.length
    });
  } catch (error) {
    console.error('Get public dars error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dars data' },
      { status: 500 }
    );
  }
}
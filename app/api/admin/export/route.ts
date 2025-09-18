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
    const type = searchParams.get('type');

    if (!type || !['candidates', 'programs', 'dars'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid export type' },
        { status: 400 }
      );
    }

    let data;
    let filename;
    let headers;

    switch (type) {
      case 'candidates':
        data = await storage.getAllCandidates();
        filename = `candidates-export-${new Date().toISOString().split('T')[0]}.csv`;
        headers = [
          'Code', 'Name', 'Dars Name', 'Dars Place', 'Zone', 'Category',
          'Stage 1', 'Stage 2', 'Stage 3', 'Group Stage 1', 'Group Stage 2', 'Group Stage 3',
          'Off Stage 1', 'Off Stage 2', 'Off Stage 3', 'Group Off Stage'
        ];
        break;

      case 'programs':
        data = await storage.getAllPrograms();
        filename = `programs-export-${new Date().toISOString().split('T')[0]}.csv`;
        headers = ['Name', 'Category', 'Type', 'Description'];
        break;

      case 'dars':
        data = await storage.getDarsWithCandidateCounts();
        filename = `dars-export-${new Date().toISOString().split('T')[0]}.csv`;
        headers = ['Dars Name', 'Place', 'Zone', 'Total Candidates'];
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        );
    }

    // Convert data to CSV
    const csvContent = convertToCSV(data, type, headers);

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

function convertToCSV(data: any[], type: string, headers: string[]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.map(header => `"${header}"`).join(','));

  // Add data rows
  data.forEach(item => {
    const row = [];
    
    switch (type) {
      case 'candidates':
        row.push(
          item.code || '',
          item.name || '',
          item.darsname || '',
          item.darsplace || '',
          item.zone || '',
          item.category || '',
          item.stage1 || '',
          item.stage2 || '',
          item.stage3 || '',
          item.groupstage1 || '',
          item.groupstage2 || '',
          item.groupstage3 || '',
          item.offstage1 || '',
          item.offstage2 || '',
          item.offstage3 || '',
          item.groupoffstage || ''
        );
        break;

      case 'programs':
        row.push(
          item.name || '',
          item.category || '',
          item.type || '',
          item.description || ''
        );
        break;

      case 'dars':
        row.push(
          item.darsname || '',
          item.darsplace || '',
          item.zone || '',
          item.totalCandidates || '0'
        );
        break;
    }

    // Escape quotes and wrap in quotes
    const escapedRow = row.map(field => 
      `"${String(field).replace(/"/g, '""')}"`
    );
    csvRows.push(escapedRow.join(','));
  });

  return csvRows.join('\n');
}
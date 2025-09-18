import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { storage } from '@server/storage';
import Data from '@/data/FullData.json';

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

    let imported = 0;
    let errors = 0;

    // Import candidates from JSON data
    for (const item of Data) {
      try {
        // Check if candidate already exists
        const existing = await storage.getCandidateByCode(item.code);
        if (!existing) {
          await storage.createCandidate({
            code: item.code,
            name: item.name,
            darsname: item.darsname,
            darsplace: item.darsplace,
            zone: item.zone,
            slug: item.slug,
            category: item.category,
            stage1: item.stage1 || null,
            stage2: item.stage2 || null,
            stage3: item.stage3 || null,
            groupstage1: item.groupstage1 || null,
            groupstage2: item.groupstage2 || null,
            groupstage3: item.groupstage3 || null,
            offstage1: item.offstage1 || null,
            offstage2: item.offstage2 || null,
            offstage3: item.offstage3 || null,
            groupoffstage: item.groupoffstage || null,
          });
          imported++;
        }
      } catch (error) {
        console.error(`Error importing candidate ${item.code}:`, error);
        errors++;
      }
    }

    // Create unique dars entries
    const uniqueDars = Array.from(new Set(Data.map(item => item.darsname)))
      .map(darsname => {
        const item = Data.find(d => d.darsname === darsname);
        return {
          darsname,
          darsplace: item?.darsplace || '',
          zone: item?.zone || '',
          slug: item?.slug || '',
          totalCandidates: Data.filter(d => d.darsname === darsname).length
        };
      });

    let darsImported = 0;
    for (const darsItem of uniqueDars) {
      try {
        const existing = await storage.getAllDars();
        const existingDars = existing.find(d => d.darsname === darsItem.darsname);
        
        if (!existingDars) {
          await storage.createDars(darsItem);
          darsImported++;
        }
      } catch (error) {
        console.error(`Error importing dars ${darsItem.darsname}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${imported} candidates, ${darsImported} dars imported`,
      errors: errors > 0 ? `${errors} errors encountered` : null
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
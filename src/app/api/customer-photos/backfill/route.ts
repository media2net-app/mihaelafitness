import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { list } from '@vercel/blob';

// Backfill CustomerPhoto DB rows by scanning Vercel Blob for a given customerId + week
// It looks for keys like: customer-photos/<customerId>_week<week>_<position>_<timestamp>.<ext>
// Positions supported: front | side | back
export async function POST(request: NextRequest) {
  try {
    const { customerId, week } = await request.json();
    if (!customerId || !week || typeof week !== 'number') {
      return NextResponse.json({ error: 'customerId (string) and week (number) are required' }, { status: 400 });
    }

    const prefix = `customer-photos/${customerId}_week${week}_`;

    // List blobs by prefix
    const { blobs } = await list({ prefix });
    if (!blobs || blobs.length === 0) {
      return NextResponse.json({ error: 'No blobs found for given prefix', prefix }, { status: 404 });
    }

    // Map by position
    const byPos: Record<string, string> = {};
    for (const b of blobs) {
      const name = b.pathname || '';
      // Try to extract position between ..._week{n}_ and next underscore
      const m = name.match(new RegExp(`${customerId}_week${week}_(front|side|back)_`, 'i'));
      if (m) {
        const pos = m[1].toLowerCase();
        // Prefer latest modified (they are listed newest first typically), overwrite
        byPos[pos] = b.url || b.downloadUrl || b.url;
      }
    }

    const positions: Array<'front' | 'side' | 'back'> = ['front', 'side', 'back'];
    let created = 0;
    let skipped = 0;
    const results: Array<{ position: string; status: 'created' | 'skipped'; url?: string }> = [];

    for (const pos of positions) {
      const url = byPos[pos];
      if (!url) {
        results.push({ position: pos, status: 'skipped' });
        continue;
      }

      // Check if already exists
      const existing = await prisma.customerPhoto.findFirst({ where: { customerId, week, position: pos } });
      if (existing) {
        skipped += 1;
        results.push({ position: pos, status: 'skipped', url });
        continue;
      }

      await prisma.customerPhoto.create({
        data: {
          customerId,
          week,
          position: pos,
          date: new Date(),
          imageUrl: url,
          notes: null,
        },
      });
      created += 1;
      results.push({ position: pos, status: 'created', url });
    }

    return NextResponse.json({ success: true, customerId, week, created, skipped, results });
  } catch (error: any) {
    console.error('Backfill error:', error);
    return NextResponse.json({ error: 'Failed to backfill photos', details: String(error?.message || error) }, { status: 500 });
  }
}

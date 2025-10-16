import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { list } from '@vercel/blob';

// Bulk backfill CustomerPhoto rows by scanning all blobs and inserting missing DB rows.
// Pass { week: number } in the POST body to restrict to a specific week (recommended: 2).
// It parses keys like: customer-photos/<customerId>_week<week>_<position>_<timestamp>.<ext>
// Positions: front | side | back
export async function POST(request: NextRequest) {
  try {
    const { week } = await request.json();
    if (!week || typeof week !== 'number') {
      return NextResponse.json({ error: 'week (number) is required' }, { status: 400 });
    }

    const prefix = 'customer-photos/';

    let cursor: string | undefined = undefined;
    const created: Array<{ customerId: string; week: number; position: string }> = [];
    const skipped: Array<{ customerId: string; week: number; position: string; reason: string }> = [];

    const regex = new RegExp(
      String.raw`^customer-photos\/([a-z0-9]+)_week(${week})_(front|side|back)_[0-9]+\.(?:png|jpg|jpeg|webp)$`,
      'i'
    );

    do {
      const { blobs, cursor: next } = await list({ prefix, cursor });
      cursor = next;

      for (const b of blobs) {
        const path = b.pathname || '';
        const m = path.match(regex);
        if (!m) continue;

        const customerId = m[1];
        const wk = Number(m[2]);
        const position = m[3].toLowerCase() as 'front' | 'side' | 'back';
        const url = b.url || b.downloadUrl || '';
        if (!url) {
          skipped.push({ customerId, week: wk, position, reason: 'no-url' });
          continue;
        }

        const exists = await prisma.customerPhoto.findFirst({
          where: { customerId, week: wk, position }
        });
        if (exists) {
          skipped.push({ customerId, week: wk, position, reason: 'exists' });
          continue;
        }

        await prisma.customerPhoto.create({
          data: {
            customerId,
            week: wk,
            position,
            date: new Date(),
            imageUrl: url,
            notes: null,
          },
        });
        created.push({ customerId, week: wk, position });
      }
    } while (cursor);

    return NextResponse.json({ success: true, week, createdCount: created.length, skippedCount: skipped.length, created, skippedSample: skipped.slice(0, 20) });
  } catch (error: any) {
    console.error('Bulk backfill error:', error);
    return NextResponse.json({ error: 'Failed to bulk backfill photos', details: String(error?.message || error) }, { status: 500 });
  }
}

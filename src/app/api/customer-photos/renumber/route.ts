import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildPhotoWeekMeta, photoWeeksNeedRenumber } from '@/lib/photoWeeks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = body?.customerId as string | undefined;

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    const photos = await prisma.customerPhoto.findMany({
      where: { customerId },
      select: { id: true, week: true, date: true, position: true },
    });

    if (!photos.length) {
      return NextResponse.json({ success: true, renumbered: false, photos: [] });
    }

    if (!photoWeeksNeedRenumber(photos)) {
      return NextResponse.json({ success: true, renumbered: false, photos });
    }

    const { ordered } = buildPhotoWeekMeta(photos);

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < ordered.length; i++) {
        const tempWeek = 10_000 + i;
        await tx.customerPhoto.updateMany({
          where: { customerId, week: ordered[i].storedWeek },
          data: { week: tempWeek },
        });
      }
      for (let i = 0; i < ordered.length; i++) {
        const tempWeek = 10_000 + i;
        const newWeek = i + 1;
        await tx.customerPhoto.updateMany({
          where: { customerId, week: tempWeek },
          data: { week: newWeek },
        });
      }
    });

    const refreshed = await prisma.customerPhoto.findMany({
      where: { customerId },
      orderBy: [{ week: 'asc' }, { position: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      renumbered: true,
      weekCount: ordered.length,
      photos: refreshed,
    });
  } catch (error) {
    console.error('Renumber customer photos error:', error);
    return NextResponse.json({ error: 'Failed to renumber photo weeks' }, { status: 500 });
  }
}

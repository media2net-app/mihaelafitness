import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function addMinutes(time: string, minutesToAdd: number) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutesToAdd;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${pad(nh)}:${pad(nm)}`;
}

export async function POST(request: NextRequest) {
  try {
    // Find all group sessions
    const sessions = await prisma.trainingSession.findMany({
      where: {
        type: 'group'
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        date: true,
      }
    });

    const toFix = sessions.filter(s => addMinutes(s.startTime, 30) === s.endTime);

    let updated = 0;
    for (const s of toFix) {
      const newEnd = addMinutes(s.startTime, 60);
      await prisma.trainingSession.update({
        where: { id: s.id },
        data: { endTime: newEnd }
      });
      updated++;
    }

    return NextResponse.json({ success: true, scanned: sessions.length, fixed: updated });
  } catch (error: any) {
    console.error('Error normalizing group durations:', error);
    return NextResponse.json({ error: 'Failed to normalize group durations' }, { status: 500 });
  }
}

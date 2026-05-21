import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';
import { parseDateKey, toDateKey } from '@/lib/foodTracking';
import { WATER_CUPS_TARGET, clampCups } from '@/lib/waterTracking';

export const runtime = 'nodejs';

async function getTracking(customerId: string, date: Date) {
  return prisma.dailyWaterTracking.findFirst({
    where: { customerId, date },
  });
}

function toResponse(dateKey: string, cups: number, target: number) {
  return {
    date: dateKey,
    cups,
    target,
    completed: cups >= target,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateKey = searchParams.get('date') || toDateKey(new Date());
    const date = parseDateKey(dateKey);

    const row = await getTracking(auth.userId, date);
    const target = WATER_CUPS_TARGET;
    const cups = row?.amount != null ? clampCups(row.amount, target) : 0;

    return NextResponse.json(toResponse(dateKey, cups, target));
  } catch (error) {
    console.error('online-water GET:', error);
    return NextResponse.json({ error: 'Failed to fetch water intake' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const dateKey = (body.date as string) || toDateKey(new Date());
    const date = parseDateKey(dateKey);
    const target = WATER_CUPS_TARGET;

    const existing = await getTracking(auth.userId, date);
    let cups = existing?.amount != null ? clampCups(existing.amount, target) : 0;

    if (body.action === 'add') {
      cups = clampCups(cups + 1, target);
    } else if (body.action === 'remove') {
      cups = clampCups(cups - 1, target);
    } else if (typeof body.cups === 'number') {
      cups = clampCups(body.cups, target);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await prisma.dailyWaterTracking.upsert({
      where: {
        customerId_date: {
          customerId: auth.userId,
          date,
        },
      },
      update: {
        amount: cups,
        target,
        updatedAt: new Date(),
      },
      create: {
        customerId: auth.userId,
        date,
        amount: cups,
        target,
      },
    });

    return NextResponse.json(toResponse(dateKey, cups, target));
  } catch (error) {
    console.error('online-water POST:', error);
    return NextResponse.json({ error: 'Failed to update water intake' }, { status: 500 });
  }
}

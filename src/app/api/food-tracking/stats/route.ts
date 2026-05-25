import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';
import {
  eachDateKey,
  FOOD_MEALS_PER_DAY,
  isDayComplete,
  startOfDay,
  startOfDayFromDb,
  toDateKey,
  toDateKeyFromDb,
} from '@/lib/foodTracking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') || auth.userId;

    if (customerId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: customerId },
      select: { createdAt: true, joinDate: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = startOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const trackingStart = startOfDayFromDb(user.joinDate || user.createdAt);
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - 13);

    const queryFrom = trackingStart > rangeStart ? trackingStart : rangeStart;

    const photos = await prisma.dailyFoodPhoto.findMany({
      where: {
        customerId,
        date: { gte: queryFrom, lte: today },
      },
      select: { date: true, mealSlot: true },
    });

    const countByDay = new Map<string, number>();
    for (const p of photos) {
      const key = toDateKeyFromDb(p.date);
      countByDay.set(key, (countByDay.get(key) || 0) + 1);
    }

    const todayKey = toDateKey(today);
    const todayCount = countByDay.get(todayKey) || 0;
    const todayComplete = isDayComplete(todayCount);

    const missedDays: string[] = [];
    const checkEnd = yesterday;
    if (checkEnd >= trackingStart) {
      for (const key of eachDateKey(trackingStart, checkEnd)) {
        const count = countByDay.get(key) || 0;
        if (!isDayComplete(count)) {
          missedDays.push(key);
        }
      }
    }
    missedDays.sort((a, b) => b.localeCompare(a));

    const last7Keys = eachDateKey(
      (() => {
        const d = new Date(today);
        d.setDate(d.getDate() - 6);
        return d > trackingStart ? d : trackingStart;
      })(),
      today,
    );

    const last7Days = last7Keys.map((date) => {
      const count = countByDay.get(date) || 0;
      return {
        date,
        uploadedCount: count,
        completed: isDayComplete(count),
      };
    });

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekFrom = weekStart > trackingStart ? weekStart : trackingStart;
    const weekKeys = eachDateKey(weekFrom, today);
    const weekCompleted = weekKeys.filter((k) => isDayComplete(countByDay.get(k) || 0)).length;

    let streak = 0;
    const cursor = new Date(today);
    while (cursor >= trackingStart) {
      const key = toDateKey(cursor);
      if (isDayComplete(countByDay.get(key) || 0)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (key === todayKey && !todayComplete) {
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    const totalTrackedDays = eachDateKey(trackingStart, today).length;
    const completedDays = [...countByDay.entries()].filter(([, c]) => isDayComplete(c)).length;

    return NextResponse.json({
      today: {
        date: todayKey,
        uploadedCount: todayCount,
        requiredCount: FOOD_MEALS_PER_DAY,
        completed: todayComplete,
      },
      missedDays,
      hasMissedDays: missedDays.length > 0,
      streak,
      weekCompleted,
      weekTotal: weekKeys.length,
      last7Days,
      completedDays,
      totalTrackedDays,
      trackingSince: toDateKey(trackingStart),
    });
  } catch (error) {
    console.error('Food tracking stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}

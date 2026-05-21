import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';
import { parseDateKey, toDateKey } from '@/lib/foodTracking';
import {
  LIFESTYLE_HABITS,
  MAX_ACTIVE_LIFESTYLE_HABITS,
  computeHabitStreak,
  isLifestyleHabitKey,
  summarizeHabitDays,
} from '@/lib/lifestyleHabits';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayKey = toDateKey(new Date());
    const today = parseDateKey(todayKey);
    const from = new Date(today);
    from.setDate(from.getDate() - 60);

    const [activeRows, logs] = await Promise.all([
      prisma.onlineClientHabit.findMany({
        where: { customerId: auth.userId, isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.onlineHabitDailyLog.findMany({
        where: {
          customerId: auth.userId,
          date: { gte: from },
        },
      }),
    ]);

    const activeKeys = activeRows.map((r) => r.habitKey);
    const todayLogs = logs.filter((l) => toDateKey(l.date) === todayKey && l.completed);

    const streaks: Record<string, number> = {};
    for (const key of activeKeys) {
      const dates = new Set(
        logs
          .filter((l) => l.habitKey === key && l.completed)
          .map((l) => toDateKey(l.date)),
      );
      streaks[key] = computeHabitStreak(dates);
    }

    const last7Days = summarizeHabitDays(activeKeys, logs, 7);
    const completedToday = todayLogs.filter((l) => activeKeys.includes(l.habitKey)).length;

    return NextResponse.json({
      catalog: LIFESTYLE_HABITS,
      maxActive: MAX_ACTIVE_LIFESTYLE_HABITS,
      active: activeKeys,
      today: {
        date: todayKey,
        completed: completedToday,
        total: activeKeys.length,
      },
      streaks,
      last7Days,
      habits: LIFESTYLE_HABITS.map((h) => ({
        ...h,
        active: activeKeys.includes(h.key),
        doneToday: todayLogs.some((l) => l.habitKey === h.key),
        streak: streaks[h.key] ?? 0,
      })),
    });
  } catch (error) {
    console.error('online-habits GET:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, habitKey } = body as { action: string; habitKey?: string };

    if (!habitKey || !isLifestyleHabitKey(habitKey)) {
      return NextResponse.json({ error: 'Invalid habit' }, { status: 400 });
    }

    if (action === 'activate') {
      const activeCount = await prisma.onlineClientHabit.count({
        where: { customerId: auth.userId, isActive: true },
      });
      const existing = await prisma.onlineClientHabit.findUnique({
        where: {
          customerId_habitKey: { customerId: auth.userId, habitKey },
        },
      });
      if (!existing?.isActive && activeCount >= MAX_ACTIVE_LIFESTYLE_HABITS) {
        return NextResponse.json(
          { error: 'max_active', max: MAX_ACTIVE_LIFESTYLE_HABITS },
          { status: 400 },
        );
      }
      await prisma.onlineClientHabit.upsert({
        where: {
          customerId_habitKey: { customerId: auth.userId, habitKey },
        },
        update: { isActive: true, updatedAt: new Date() },
        create: { customerId: auth.userId, habitKey, isActive: true },
      });
    } else if (action === 'deactivate') {
      await prisma.onlineClientHabit.upsert({
        where: {
          customerId_habitKey: { customerId: auth.userId, habitKey },
        },
        update: { isActive: false, updatedAt: new Date() },
        create: { customerId: auth.userId, habitKey, isActive: false },
      });
    } else if (action === 'toggle') {
      const active = await prisma.onlineClientHabit.findFirst({
        where: { customerId: auth.userId, habitKey, isActive: true },
      });
      if (!active) {
        return NextResponse.json({ error: 'Habit not active' }, { status: 400 });
      }

      const dateKey = (body.date as string) || toDateKey(new Date());
      const date = parseDateKey(dateKey);
      const existing = await prisma.onlineHabitDailyLog.findUnique({
        where: {
          customerId_habitKey_date: {
            customerId: auth.userId,
            habitKey,
            date,
          },
        },
      });

      if (existing?.completed) {
        await prisma.onlineHabitDailyLog.update({
          where: { id: existing.id },
          data: { completed: false, updatedAt: new Date() },
        });
      } else {
        await prisma.onlineHabitDailyLog.upsert({
          where: {
            customerId_habitKey_date: {
              customerId: auth.userId,
              habitKey,
              date,
            },
          },
          update: { completed: true, updatedAt: new Date() },
          create: {
            customerId: auth.userId,
            habitKey,
            date,
            completed: true,
          },
        });
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('online-habits POST:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

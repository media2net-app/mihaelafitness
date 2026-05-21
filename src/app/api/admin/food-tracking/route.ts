import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';
import { isAdminRole } from '@/lib/roles';
import {
  eachDateKey,
  FOOD_MEALS_PER_DAY,
  isDayComplete,
  parseDateKey,
  startOfDay,
  toDateKey,
} from '@/lib/foodTracking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ONLINE_PLAN = 'Training-Only';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId || !isAdminRole(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateKey = searchParams.get('date') || toDateKey(new Date());
    const customerId = searchParams.get('customerId');
    const date = parseDateKey(dateKey);

    if (customerId) {
      const customer = await prisma.user.findFirst({
        where: { id: customerId, plan: ONLINE_PLAN },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
          joinDate: true,
          createdAt: true,
        },
      });

      if (!customer) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }

      const photos = await prisma.dailyFoodPhoto.findMany({
        where: { customerId, date },
        orderBy: { mealSlot: 'asc' },
      });

      const today = startOfDay(new Date());
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 6);
      const trackingStart = startOfDay(customer.joinDate || customer.createdAt);
      const queryFrom = trackingStart > weekStart ? trackingStart : weekStart;

      const recentPhotos = await prisma.dailyFoodPhoto.findMany({
        where: {
          customerId,
          date: { gte: queryFrom, lte: today },
        },
        select: { date: true, mealSlot: true },
      });

      const countByDay = new Map<string, number>();
      for (const p of recentPhotos) {
        const key = toDateKey(new Date(p.date));
        countByDay.set(key, (countByDay.get(key) || 0) + 1);
      }

      const last7Days = eachDateKey(queryFrom, today).map((key) => {
        const count = countByDay.get(key) || 0;
        return { date: key, uploadedCount: count, completed: isDayComplete(count) };
      });

      return NextResponse.json({
        customer,
        date: dateKey,
        photos,
        uploadedCount: photos.length,
        completed: photos.length >= FOOD_MEALS_PER_DAY,
        requiredCount: FOOD_MEALS_PER_DAY,
        last7Days,
      });
    }

    const clients = await prisma.user.findMany({
      where: { plan: ONLINE_PLAN },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        status: true,
        joinDate: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    const clientIds = clients.map((c) => c.id);

    const dayPhotos =
      clientIds.length === 0
        ? []
        : await prisma.dailyFoodPhoto.findMany({
            where: {
              customerId: { in: clientIds },
              date,
            },
            select: {
              id: true,
              customerId: true,
              mealSlot: true,
              imageUrl: true,
              notes: true,
            },
            orderBy: { mealSlot: 'asc' },
          });

    const photosByCustomer = new Map<string, typeof dayPhotos>();
    for (const photo of dayPhotos) {
      const list = photosByCustomer.get(photo.customerId) ?? [];
      list.push(photo);
      photosByCustomer.set(photo.customerId, list);
    }

    const today = startOfDay(new Date());
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);

    const weekPhotos =
      clientIds.length === 0
        ? []
        : await prisma.dailyFoodPhoto.findMany({
            where: {
              customerId: { in: clientIds },
              date: { gte: weekStart, lte: today },
            },
            select: { customerId: true, date: true },
          });

    const weekCountsByCustomer = new Map<string, Map<string, number>>();
    for (const p of weekPhotos) {
      const key = toDateKey(new Date(p.date));
      if (!weekCountsByCustomer.has(p.customerId)) {
        weekCountsByCustomer.set(p.customerId, new Map());
      }
      const m = weekCountsByCustomer.get(p.customerId)!;
      m.set(key, (m.get(key) || 0) + 1);
    }

    const clientsSummary = clients.map((client) => {
      const photos = photosByCustomer.get(client.id) ?? [];
      const uploadedCount = photos.length;
      const dayCounts = weekCountsByCustomer.get(client.id);
      let weekCompleted = 0;
      if (dayCounts) {
        for (const [, count] of dayCounts) {
          if (isDayComplete(count)) weekCompleted++;
        }
      }
      const weekKeys = eachDateKey(weekStart, today);
      return {
        ...client,
        uploadedCount,
        completed: isDayComplete(uploadedCount),
        requiredCount: FOOD_MEALS_PER_DAY,
        photos,
        weekCompleted,
        weekTotal: weekKeys.length,
      };
    });

    const completedToday = clientsSummary.filter((c) => c.completed).length;
    const partialToday = clientsSummary.filter(
      (c) => c.uploadedCount > 0 && !c.completed,
    ).length;
    const notStartedToday = clientsSummary.filter((c) => c.uploadedCount === 0).length;

    return NextResponse.json({
      date: dateKey,
      requiredCount: FOOD_MEALS_PER_DAY,
      summary: {
        totalClients: clientsSummary.length,
        completedToday,
        partialToday,
        notStartedToday,
      },
      clients: clientsSummary,
    });
  } catch (error) {
    console.error('Admin food tracking GET error:', error);
    return NextResponse.json({ error: 'Failed to load food tracking' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';
import { isAdminRole } from '@/lib/roles';
import {
  eachDateKey,
  FOOD_MEALS_PER_DAY,
  isDayComplete,
  isDemoFoodTrackingClient,
  parseDateKey,
  startOfDayFromDb,
  toDateKey,
  toDateKeyFromDb,
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
      const historyDays = Math.min(
        31,
        Math.max(7, parseInt(searchParams.get('historyDays') || '14', 10) || 14),
      );

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

      if (!customer || isDemoFoodTrackingClient(customer)) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }

      const photos = await prisma.dailyFoodPhoto.findMany({
        where: { customerId, date },
        orderBy: { mealSlot: 'asc' },
        select: {
          id: true,
          mealSlot: true,
          imageUrl: true,
          notes: true,
        },
      });

      const today = parseDateKey(toDateKey(new Date()));
      const rangeStart = new Date(today.getTime() - (historyDays - 1) * 86400000);
      const trackingStart = startOfDayFromDb(customer.joinDate || customer.createdAt);
      const queryFrom = trackingStart > rangeStart ? trackingStart : rangeStart;

      const recentPhotos = await prisma.dailyFoodPhoto.findMany({
        where: {
          customerId,
          date: { gte: queryFrom, lte: today },
        },
        select: { date: true, mealSlot: true },
      });

      const slotsByDay = new Map<string, number[]>();
      for (const p of recentPhotos) {
        const key = toDateKeyFromDb(p.date);
        const slots = slotsByDay.get(key) ?? [];
        if (!slots.includes(p.mealSlot)) slots.push(p.mealSlot);
        slotsByDay.set(key, slots);
      }

      const history = eachDateKey(queryFrom, today).map((key) => {
        const filledSlots = (slotsByDay.get(key) ?? []).sort((a, b) => a - b);
        const uploadedCount = filledSlots.length;
        return {
          date: key,
          uploadedCount,
          completed: isDayComplete(uploadedCount),
          filledSlots,
        };
      });

      return NextResponse.json({
        customer,
        date: dateKey,
        photos,
        uploadedCount: photos.length,
        completed: isDayComplete(photos.length),
        requiredCount: FOOD_MEALS_PER_DAY,
        history,
      });
    }

    const clients = await prisma.user.findMany({
      where: {
        plan: ONLINE_PLAN,
        NOT: {
          OR: [
            { email: { contains: 'demo@mihaelafitness.com', mode: 'insensitive' } },
            { email: { contains: 'demo-online@', mode: 'insensitive' } },
            { email: { contains: 'demo-klant@', mode: 'insensitive' } },
          ],
        },
      },
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
              customerId: true,
              mealSlot: true,
            },
          });

    const slotsByCustomer = new Map<string, number[]>();
    for (const photo of dayPhotos) {
      const slots = slotsByCustomer.get(photo.customerId) ?? [];
      if (!slots.includes(photo.mealSlot)) slots.push(photo.mealSlot);
      slotsByCustomer.set(photo.customerId, slots);
    }

    const today = parseDateKey(toDateKey(new Date()));
    const weekStart = new Date(today.getTime() - 6 * 86400000);

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
      const key = toDateKeyFromDb(p.date);
      if (!weekCountsByCustomer.has(p.customerId)) {
        weekCountsByCustomer.set(p.customerId, new Map());
      }
      const m = weekCountsByCustomer.get(p.customerId)!;
      m.set(key, (m.get(key) || 0) + 1);
    }

    const clientsSummary = clients.map((client) => {
      const filledSlots = (slotsByCustomer.get(client.id) ?? []).sort((a, b) => a - b);
      const uploadedCount = filledSlots.length;
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
        filledSlots,
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

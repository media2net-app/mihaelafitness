import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';
import {
  requiredTrainingDayCount,
  slotsFromWeekdays,
  type TrainingDaySlot,
} from '@/lib/onlineTrainingDays';

export const runtime = 'nodejs';

function parseSlots(body: unknown): TrainingDaySlot[] | null {
  if (!Array.isArray(body)) return null;
  const slots: TrainingDaySlot[] = [];
  for (const item of body) {
    const weekday = Number((item as { weekday?: number }).weekday);
    const trainingDay = Number((item as { trainingDay?: number }).trainingDay);
    if (weekday < 1 || weekday > 7 || trainingDay < 1) return null;
    slots.push({ weekday, trainingDay });
  }
  return slots;
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignments = await prisma.customerScheduleAssignment.findMany({
      where: { customerId: auth.userId, isActive: true },
      include: { workout: { select: { id: true, name: true } } },
      orderBy: { weekday: 'asc' },
    });

    return NextResponse.json({
      workoutId: assignments[0]?.workoutId ?? null,
      workoutName: assignments[0]?.workout?.name ?? null,
      requiredCount: requiredTrainingDayCount(
        assignments.map((a) => ({ weekday: a.weekday, trainingDay: a.trainingDay })),
      ),
      slots: assignments.map((a) => ({
        weekday: a.weekday,
        trainingDay: a.trainingDay,
      })),
    });
  } catch (error) {
    console.error('online-training-days GET:', error);
    return NextResponse.json({ error: 'Failed to load training days' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let slots = parseSlots(body.slots);
    const weekdays: number[] | undefined = Array.isArray(body.weekdays)
      ? body.weekdays.map(Number).filter((w: number) => w >= 1 && w <= 7)
      : undefined;

    const existing = await prisma.customerScheduleAssignment.findMany({
      where: { customerId: auth.userId, isActive: true },
    });

    if (!existing.length) {
      return NextResponse.json({ error: 'No training plan assigned' }, { status: 400 });
    }

    const workoutId = body.workoutId || existing[0].workoutId;
    const requiredCount = requiredTrainingDayCount(
      existing.map((a) => ({ weekday: a.weekday, trainingDay: a.trainingDay })),
    );

    if (weekdays && !slots) {
      if (weekdays.length !== requiredCount) {
        return NextResponse.json(
          { error: 'invalid_count', required: requiredCount },
          { status: 400 },
        );
      }
      slots = slotsFromWeekdays(weekdays);
    }

    if (!slots || slots.length !== requiredCount) {
      return NextResponse.json(
        { error: 'invalid_count', required: requiredCount },
        { status: 400 },
      );
    }

    const weekdaysUsed = new Set(slots.map((s) => s.weekday));
    if (weekdaysUsed.size !== slots.length) {
      return NextResponse.json({ error: 'duplicate_weekday' }, { status: 400 });
    }

    const trainingDaysUsed = new Set(slots.map((s) => s.trainingDay));
    if (trainingDaysUsed.size !== slots.length) {
      return NextResponse.json({ error: 'invalid_training_days' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.customerScheduleAssignment.deleteMany({
        where: { customerId: auth.userId },
      }),
      ...slots.map((slot) =>
        prisma.customerScheduleAssignment.create({
          data: {
            customerId: auth.userId,
            workoutId,
            weekday: slot.weekday,
            trainingDay: slot.trainingDay,
            isActive: true,
          },
        }),
      ),
    ]);

    return NextResponse.json({
      success: true,
      slots,
      requiredCount,
    });
  } catch (error) {
    console.error('online-training-days PUT:', error);
    return NextResponse.json({ error: 'Failed to save training days' }, { status: 500 });
  }
}

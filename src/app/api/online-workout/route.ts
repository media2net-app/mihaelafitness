import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';
import { resolveTrainingDay, toDateKey } from '@/lib/onlineWorkout';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = auth.userId;
    const params = new URL(request.url).searchParams;
    const dayParam = parseInt(params.get('day') || '', 10);
    const todayKey = toDateKey(new Date());
    const today = new Date(`${todayKey}T12:00:00.000Z`);

    const assignments = await prisma.customerScheduleAssignment.findMany({
      where: { customerId, isActive: true },
      include: { workout: { select: { id: true, name: true, description: true, difficulty: true } } },
      orderBy: { trainingDay: 'asc' },
    });

    if (assignments.length === 0) {
      return NextResponse.json({ error: 'No plan assigned' }, { status: 404 });
    }

    const suggestedDay = resolveTrainingDay(
      assignments.map((a) => ({
        weekday: a.weekday,
        trainingDay: a.trainingDay,
        isActive: a.isActive,
      })),
      today,
    );

    const trainingDay = Number.isFinite(dayParam) && dayParam > 0 ? dayParam : suggestedDay;
    const assignment =
      assignments.find((a) => a.trainingDay === trainingDay) || assignments[0];
    const workoutId = assignment.workoutId;

    const workoutExercises = await prisma.workoutExercise.findMany({
      where: { workoutId, day: trainingDay },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            muscleGroup: true,
            equipment: true,
            difficulty: true,
            videoUrl: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }],
    });

    const exercises = [...workoutExercises].sort((a, b) => {
      const aw = a.section === 'warmup' ? 0 : 1;
      const bw = b.section === 'warmup' ? 0 : 1;
      if (aw !== bw) return aw - bw;
      return a.order - b.order;
    });

    const mainCount = exercises.filter((e) => e.section !== 'warmup').length;

    let session = await prisma.onlineWorkoutSession.findUnique({
      where: {
        customerId_date_trainingDay: {
          customerId,
          date: today,
          trainingDay,
        },
      },
    });

    const setLogs = session
      ? await prisma.exerciseSetLog.findMany({
          where: { sessionId: session.id },
          orderBy: { setNumber: 'asc' },
        })
      : [];

    const lastWeights: Record<string, number> = {};
    await Promise.all(
      exercises.map(async (ex) => {
        const log = await prisma.exerciseSetLog.findFirst({
          where: {
            customerId,
            trainingDay,
            exerciseId: ex.exerciseId,
            createdAt: { lt: today },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (log && log.weightKg > 0) lastWeights[ex.exerciseId] = log.weightKg;
      }),
    );

    const trainingDays = [...new Set(assignments.map((a) => a.trainingDay))].sort((a, b) => a - b);

    return NextResponse.json({
      suggestedDay,
      trainingDay,
      trainingDays,
      todayKey,
      workout: assignment.workout,
      assignment: {
        weekday: assignment.weekday,
        trainingDay: assignment.trainingDay,
      },
      exercises,
      mainExerciseCount: mainCount,
      session,
      setLogs,
      lastWeights,
    });
  } catch (error) {
    console.error('GET /api/online-workout', error);
    return NextResponse.json({ error: 'Failed to load workout' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, trainingDay, sessionId, durationSec } = body;
    const customerId = auth.userId;
    const todayKey = toDateKey(new Date());
    const today = new Date(`${todayKey}T12:00:00.000Z`);

    if (action === 'start') {
      if (!trainingDay) {
        return NextResponse.json({ error: 'trainingDay required' }, { status: 400 });
      }

      const assignment = await prisma.customerScheduleAssignment.findFirst({
        where: { customerId, trainingDay: Number(trainingDay), isActive: true },
      });
      if (!assignment) {
        return NextResponse.json({ error: 'No assignment for this day' }, { status: 404 });
      }

      const session = await prisma.onlineWorkoutSession.upsert({
        where: {
          customerId_date_trainingDay: {
            customerId,
            date: today,
            trainingDay: Number(trainingDay),
          },
        },
        create: {
          customerId,
          workoutId: assignment.workoutId,
          trainingDay: Number(trainingDay),
          date: today,
          status: 'in_progress',
        },
        update: {
          status: 'in_progress',
          completedAt: null,
        },
      });

      return NextResponse.json({ session });
    }

    if (action === 'complete') {
      if (!sessionId) {
        return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
      }

      const session = await prisma.onlineWorkoutSession.findFirst({
        where: { id: sessionId, customerId },
      });
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const updated = await prisma.onlineWorkoutSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          durationSec: typeof durationSec === 'number' ? durationSec : null,
        },
      });

      await prisma.user.update({
        where: { id: customerId },
        data: { lastWorkout: new Date() },
      });

      return NextResponse.json({ session: updated });
    }

    if (action === 'restart') {
      if (!trainingDay) {
        return NextResponse.json({ error: 'trainingDay required' }, { status: 400 });
      }

      const assignment = await prisma.customerScheduleAssignment.findFirst({
        where: { customerId, trainingDay: Number(trainingDay), isActive: true },
      });
      if (!assignment) {
        return NextResponse.json({ error: 'No assignment for this day' }, { status: 404 });
      }

      const existing = await prisma.onlineWorkoutSession.findUnique({
        where: {
          customerId_date_trainingDay: {
            customerId,
            date: today,
            trainingDay: Number(trainingDay),
          },
        },
      });

      if (existing) {
        await prisma.exerciseSetLog.deleteMany({ where: { sessionId: existing.id } });
      }

      const session = await prisma.onlineWorkoutSession.upsert({
        where: {
          customerId_date_trainingDay: {
            customerId,
            date: today,
            trainingDay: Number(trainingDay),
          },
        },
        create: {
          customerId,
          workoutId: assignment.workoutId,
          trainingDay: Number(trainingDay),
          date: today,
          status: 'in_progress',
        },
        update: {
          status: 'in_progress',
          completedAt: null,
          durationSec: null,
        },
      });

      return NextResponse.json({ session });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/online-workout', error);
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/exercise-set-logs?sessionId=...&customerId=...&trainingDay=...&exerciseId=...&before=YYYY-MM-DD&start=YYYY-MM-DD&end=YYYY-MM-DD&limit=20
// Supports filtering by:
// - sessionId (recommended for restoring today's progress), optionally plus exerciseId
// - OR customerId + trainingDay, optionally plus exerciseId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const customerId = searchParams.get('customerId');
    const trainingDay = searchParams.get('trainingDay');
    const exerciseId = searchParams.get('exerciseId');
    const before = searchParams.get('before');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build filter: prefer sessionId if present; else require customerId + trainingDay
    const where: any = {};
    if (sessionId) {
      where.sessionId = sessionId;
    } else if (customerId) {
      where.customerId = customerId;
      if (trainingDay) where.trainingDay = Number(trainingDay);
    } else {
      return NextResponse.json({ error: 'Provide sessionId or customerId' }, { status: 400 });
    }
    if (exerciseId) {
      where.exerciseId = exerciseId;
    }
    if (before) {
      const d = new Date(before);
      d.setHours(23, 59, 59, 999);
      where.createdAt = { lte: d };
    }
    if (start || end) {
      const gte = start ? new Date(`${start}T00:00:00.000Z`) : undefined;
      const lte = end ? new Date(`${end}T23:59:59.999Z`) : undefined;
      where.createdAt = { ...(where.createdAt || {}), ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
    }

    const logs = await prisma.exerciseSetLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (e) {
    console.error('GET /exercise-set-logs failed', e);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

// POST /api/exercise-set-logs
// { sessionId, customerId, trainingDay, workoutId, exerciseId, setNumber, weightKg, repsDone? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, customerId, trainingDay, workoutId, exerciseId, setNumber, weightKg, repsDone } = body || {};
    if (!sessionId || !customerId || !trainingDay || !workoutId || !exerciseId || !setNumber || typeof weightKg !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const upserted = await prisma.exerciseSetLog.upsert({
      where: { sessionId_exerciseId_setNumber: { sessionId, exerciseId, setNumber } },
      create: {
        sessionId,
        customerId,
        trainingDay: Number(trainingDay),
        workoutId,
        exerciseId,
        setNumber: Number(setNumber),
        weightKg: Number(weightKg),
        repsDone: typeof repsDone === 'number' ? repsDone : null,
      },
      update: {
        weightKg: Number(weightKg),
        repsDone: typeof repsDone === 'number' ? repsDone : null,
      },
    });

    return NextResponse.json(upserted, { status: 201 });
  } catch (e) {
    console.error('POST /exercise-set-logs failed', e);
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
}

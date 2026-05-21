import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';
import {
  estimateE1rm,
  rangeToDate,
  startOfWeek,
  type TimeRange,
  weekKey,
} from '@/lib/trainingProgress';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RANGES: TimeRange[] = ['1w', '1m', '3m', '6m', '1y', 'all'];

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = auth.userId;
    const params = new URL(request.url).searchParams;
    const range = (params.get('range') || '6m') as TimeRange;
    const exerciseId = params.get('exerciseId') || undefined;

    if (!RANGES.includes(range)) {
      return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
    }

    const now = new Date();
    const since = rangeToDate(now, range);

    const [logs, sessions, assignments, exercises] = await Promise.all([
      prisma.exerciseSetLog.findMany({
        where: {
          customerId,
          weightKg: { gt: 0 },
          ...(since ? { createdAt: { gte: since } } : {}),
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.onlineWorkoutSession.findMany({
        where: { customerId },
        orderBy: { date: 'asc' },
      }),
      prisma.customerScheduleAssignment.findMany({
        where: { customerId, isActive: true },
        include: { workout: { select: { id: true, name: true } } },
        orderBy: { trainingDay: 'asc' },
      }),
      prisma.exercise.findMany({
        where: {
          workoutExercises: {
            some: {
              workout: {
                scheduleAssignments: { some: { customerId, isActive: true } },
              },
            },
          },
        },
        select: { id: true, name: true, muscleGroup: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const exerciseIdsFromLogs = [...new Set(logs.map((l) => l.exerciseId))];
    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
    for (const id of exerciseIdsFromLogs) {
      if (!exerciseMap.has(id)) {
        const ex = await prisma.exercise.findUnique({
          where: { id },
          select: { id: true, name: true, muscleGroup: true },
        });
        if (ex) exerciseMap.set(id, ex);
      }
    }

    const exerciseList = [...exerciseMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    const selectedId =
      exerciseId && exerciseMap.has(exerciseId)
        ? exerciseId
        : exerciseList[0]?.id;

    const allLogs = await prisma.exerciseSetLog.findMany({
      where: { customerId, weightKg: { gt: 0 } },
      orderBy: { createdAt: 'asc' },
    });

    const prThreshold = new Map<string, number>();
    const personalRecords: Array<{
      id: string;
      date: string;
      exerciseId: string;
      exerciseName: string;
      weightKg: number;
      deltaKg: number;
    }> = [];

    for (const log of allLogs) {
      const prev = prThreshold.get(log.exerciseId) ?? 0;
      if (log.weightKg > prev) {
        const ex = exerciseMap.get(log.exerciseId);
        personalRecords.push({
          id: log.id,
          date: log.createdAt.toISOString(),
          exerciseId: log.exerciseId,
          exerciseName: ex?.name || 'Exercise',
          weightKg: log.weightKg,
          deltaKg: Math.round((log.weightKg - prev) * 10) / 10,
        });
        prThreshold.set(log.exerciseId, log.weightKg);
      }
    }

    const prsFiltered = personalRecords
      .filter((pr) => !since || new Date(pr.date) >= since)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 40);

    const logsBySession = new Map<string, typeof allLogs>();
    for (const log of allLogs) {
      const arr = logsBySession.get(log.sessionId) || [];
      arr.push(log);
      logsBySession.set(log.sessionId, arr);
    }

    const buildStrengthSeries = (exId: string) => {
      const exLogs = allLogs.filter((l) => l.exerciseId === exId);
      const bySession = new Map<string, { date: Date; e1rm: number; weight: number }>();

      for (const log of exLogs) {
        const e1 = estimateE1rm(log.weightKg, log.repsDone);
        const existing = bySession.get(log.sessionId);
        if (!existing || e1 > existing.e1rm) {
          bySession.set(log.sessionId, {
            date: log.createdAt,
            e1rm: e1,
            weight: log.weightKg,
          });
        }
      }

      let points = [...bySession.values()]
        .map((p) => ({
          date: p.date.toISOString(),
          label: p.date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
          e1rm: p.e1rm,
          weightKg: p.weight,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (since) {
        points = points.filter((p) => new Date(p.date) >= since);
      }

      return points;
    };

    const strengthPoints = selectedId ? buildStrengthSeries(selectedId) : [];
    const currentMax = strengthPoints.length
      ? strengthPoints[strengthPoints.length - 1].e1rm
      : 0;
    const firstInRange = strengthPoints[0]?.e1rm ?? 0;
    const changePct =
      firstInRange > 0
        ? Math.round(((currentMax - firstInRange) / firstInRange) * 1000) / 10
        : 0;

    const daysAgo = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d;
    };

    const maxBefore = (before: Date) => {
      const pts = selectedId ? buildStrengthSeries(selectedId) : [];
      const filtered = pts.filter((p) => new Date(p.date) < before);
      return filtered.length ? Math.max(...filtered.map((p) => p.e1rm)) : 0;
    };

    const max30 = maxBefore(daysAgo(30));
    const max90 = maxBefore(daysAgo(90));
    const vs30 = max30 > 0 ? Math.round((currentMax - max30) * 10) / 10 : currentMax;
    const vs90 = max90 > 0 ? Math.round((currentMax - max90) * 10) / 10 : currentMax;

    const prCountInRange = selectedId
      ? prsFiltered.filter((p) => p.exerciseId === selectedId).length
      : prsFiltered.length;

    const bestSet =
      strengthPoints.length > 0
        ? Math.max(...strengthPoints.map((p) => p.weightKg))
        : 0;

    const trainingDays = [
      ...new Set(assignments.map((a) => a.trainingDay)),
    ].sort((a, b) => a - b);

    const completedSessions = sessions.filter((s) => s.status === 'completed');
    const weekKeysSorted = [...new Set(completedSessions.map((s) => weekKey(s.date)))].sort();
    const last8Weeks = weekKeysSorted.slice(-8);

    if (last8Weeks.length < 8) {
      const cursor = startOfWeek(now);
      for (let i = 7; i >= 0; i--) {
        const w = new Date(cursor);
        w.setDate(w.getDate() - i * 7);
        const k = weekKey(w);
        if (!last8Weeks.includes(k)) last8Weeks.unshift(k);
      }
      while (last8Weeks.length > 8) last8Weeks.shift();
    }

    const consistencyWeeks = last8Weeks.map((wk, wi) => {
      const weekStart = new Date(wk);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const maxBeforeWeek = new Map<string, number>();
      for (const log of allLogs) {
        if (new Date(log.createdAt) >= weekStart) break;
        const m = maxBeforeWeek.get(log.exerciseId) ?? 0;
        if (log.weightKg > m) maxBeforeWeek.set(log.exerciseId, log.weightKg);
      }

      const days = trainingDays.map((td) => {
        const session = completedSessions.find(
          (s) => s.trainingDay === td && weekKey(s.date) === wk,
        );
        let status: 'empty' | 'completed' | 'missed' | 'future' | 'pr' = 'empty';
        if (session) {
          const sLogs = logsBySession.get(session.id) || [];
          let hadPr = false;
          const running = new Map(maxBeforeWeek);
          for (const log of sLogs) {
            const prev = running.get(log.exerciseId) ?? 0;
            if (log.weightKg > prev) hadPr = true;
            running.set(log.exerciseId, Math.max(prev, log.weightKg));
          }
          status = hadPr ? 'pr' : 'completed';
        } else if (weekEnd < now) {
          status = 'missed';
        } else {
          status = 'future';
        }
        return { trainingDay: td, status };
      });

      return { weekIndex: wi + 1, weekKey: wk, days };
    });

    const totalSlots = consistencyWeeks.reduce((n, w) => n + w.days.length, 0);
    const doneSlots = consistencyWeeks.reduce(
      (n, w) => n + w.days.filter((d) => d.status === 'completed').length,
      0,
    );
    const percentComplete =
      totalSlots > 0 ? Math.round((doneSlots / totalSlots) * 100) : 0;

    const planName = assignments[0]?.workout?.name || 'Training plan';
    const startedAt =
      completedSessions[0]?.date?.toISOString() ||
      sessions[0]?.startedAt?.toISOString() ||
      null;
    const endsAt =
      completedSessions[completedSessions.length - 1]?.date?.toISOString() || null;

    return NextResponse.json({
      exercises: exerciseList,
      selectedExerciseId: selectedId,
      range,
      strength: {
        exerciseName: selectedId ? exerciseMap.get(selectedId)?.name : null,
        currentMax,
        changePct,
        points: strengthPoints,
        stats: {
          vs30d: vs30,
          vs90d: vs90,
          prCount: prCountInRange,
          bestSet,
        },
      },
      personalRecords: prsFiltered,
      consistency: {
        planName,
        percentComplete,
        trainingDays,
        weeks: consistencyWeeks,
        startedAt,
        endsAt,
      },
    });
  } catch (error) {
    console.error('GET /api/online-training-progress', error);
    return NextResponse.json({ error: 'Failed to load training progress' }, { status: 500 });
  }
}

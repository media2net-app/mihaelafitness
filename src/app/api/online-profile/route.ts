import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = new URL(request.url).searchParams.get('customerId') || auth.userId;
    if (customerId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [profile, user, assignments] = await Promise.all([
      prisma.onlineClientProfile.findUnique({ where: { customerId } }),
      prisma.user.findUnique({
        where: { id: customerId },
        select: { id: true, name: true, email: true, goal: true, plan: true },
      }),
      prisma.customerScheduleAssignment.findMany({
        where: { customerId, isActive: true },
        include: { workout: { select: { id: true, name: true, difficulty: true } } },
        orderBy: { weekday: 'asc' },
      }),
    ]);

    return NextResponse.json({
      profile,
      user,
      assignedPlan: assignments[0]?.workout ?? null,
      trainingDays: assignments.map((a) => ({
        weekday: a.weekday,
        trainingDay: a.trainingDay,
      })),
      onboardingComplete: Boolean(profile?.onboardingCompletedAt),
    });
  } catch (error) {
    console.error('Online profile GET error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const customerId = body.customerId || auth.userId;
    if (customerId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, gender, heightCm, weightKg, fitnessGoals } = body;

    if (name?.trim()) {
      await prisma.user.update({
        where: { id: customerId },
        data: { name: name.trim() },
      });
    }

    const goalsText = Array.isArray(fitnessGoals) ? fitnessGoals.join(', ') : '';

    const profile = await prisma.onlineClientProfile.upsert({
      where: { customerId },
      update: {
        gender: gender || null,
        heightCm: heightCm ? Number(heightCm) : null,
        fitnessGoals: fitnessGoals ?? [],
        onboardingCompletedAt: new Date(),
      },
      create: {
        customerId,
        gender: gender || null,
        heightCm: heightCm ? Number(heightCm) : null,
        fitnessGoals: fitnessGoals ?? [],
        onboardingCompletedAt: new Date(),
      },
    });

    if (goalsText) {
      await prisma.user.update({
        where: { id: customerId },
        data: { goal: goalsText },
      });
    }

    const height = heightCm ? Number(heightCm) : null;
    const weight = weightKg ? Number(weightKg) : null;
    const bmi =
      height && weight ? Math.round((weight / (height / 100) ** 2) * 10) / 10 : null;

    const existingBaseline = await prisma.customerMeasurement.findFirst({
      where: { customerId, week: 1 },
    });

    if (!existingBaseline && (weight || height)) {
      await prisma.customerMeasurement.create({
        data: {
          customerId,
          week: 1,
          date: new Date(),
          weight: weight ?? null,
          height: height ?? null,
          bmi,
          notes: 'Baseline from online onboarding',
        },
      });
    }

    return NextResponse.json({ profile, onboardingComplete: true });
  } catch (error) {
    console.error('Online profile POST error:', error);
    return NextResponse.json({ error: 'Failed to save onboarding' }, { status: 500 });
  }
}

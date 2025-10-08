import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MEALS = ['breakfast','snack','lunch','dinner'] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const dayKey = String(body?.dayKey || '').toLowerCase();
    if (!dayKey) return NextResponse.json({ error: 'Missing dayKey' }, { status: 400 });

    const plan = await prisma.nutritionPlan.findUnique({ where: { id } });
    if (!plan) return NextResponse.json({ error: 'Nutrition plan not found' }, { status: 404 });

    const weekMenu: any = (plan as any).weekMenu || {};
    const day = { ...(weekMenu[dayKey] || {}) };
    for (const meal of MEALS) day[meal] = '';
    const updatedWeek = { ...weekMenu, [dayKey]: day };

    const updated = await prisma.nutritionPlan.update({
      where: { id },
      data: { weekMenu: updatedWeek }
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (error) {
    console.error('Error clearing day meals:', error);
    return NextResponse.json({ error: 'Failed to clear day meals' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id;
    const { dayKey, mealType, mealText } = await request.json();
    if (!dayKey || !mealType) {
      return NextResponse.json({ error: 'Missing dayKey or mealType' }, { status: 400 });
    }

    const plan = await prisma.nutritionPlan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const weekMenu: any = (plan.weekMenu as any) || {};
    weekMenu[dayKey] = { ...(weekMenu[dayKey] || {}), [mealType]: mealText || '' };

    const updated = await prisma.nutritionPlan.update({
      where: { id: planId },
      data: { weekMenu }
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (e) {
    console.error('[set-meal] error', e);
    return NextResponse.json({ error: 'Failed to set meal' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

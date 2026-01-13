import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



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
    const dayMenu = { ...(weekMenu[dayKey] || {}) };
    const currentMealData = dayMenu[mealType];
    
    // Handle both string and object formats
    // If current meal is an object with ingredients and cookingInstructions, preserve the structure
    if (currentMealData && typeof currentMealData === 'object' && ('ingredients' in currentMealData || 'cookingInstructions' in currentMealData)) {
      // New format: clear ingredients but preserve structure
      dayMenu[mealType] = {
        ingredients: mealText || '',
        cookingInstructions: currentMealData.cookingInstructions || ''
      };
    } else {
      // Old format: just set as string
      dayMenu[mealType] = mealText || '';
    }
    
    weekMenu[dayKey] = dayMenu;

    const updated = await prisma.nutritionPlan.update({
      where: { id: planId },
      data: { weekMenu }
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (e) {
    console.error('[set-meal] error', e);
    return NextResponse.json({ error: 'Failed to set meal' }, { status: 500 });
  }
}

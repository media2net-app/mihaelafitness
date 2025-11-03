import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const { dayKey, mealType, mealText } = await request.json();
    
    console.log(`[V3 API] POST /api/nutrition-plans-v3/${planId}/update-meal`);
    console.log(`[V3 API] Updating ${dayKey}.${mealType} with:`, mealText);
    
    if (!dayKey || !mealType) {
      return NextResponse.json({ error: 'Missing dayKey or mealType' }, { status: 400 });
    }

    // Get current plan
    const currentPlan = await prisma.nutritionPlan.findUnique({
      where: { id: planId },
    });

    if (!currentPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Parse current weekMenu
    const weekMenu = currentPlan.weekMenu as any || {};
    
    // Ensure day exists
    if (!weekMenu[dayKey]) {
      weekMenu[dayKey] = {};
    }
    
    // Update meal data
    weekMenu[dayKey][mealType] = mealText;
    
    // Save updated plan
    const updatedPlan = await prisma.nutritionPlan.update({
      where: { id: planId },
      data: {
        weekMenu: weekMenu,
        updatedAt: new Date(),
      },
    });

    console.log(`[V3 API] Successfully updated ${dayKey}.${mealType}`);
    
    return NextResponse.json({ 
      success: true, 
      plan: updatedPlan,
      meal: mealText 
    });
  } catch (error) {
    console.error('[V3 API] Error updating meal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

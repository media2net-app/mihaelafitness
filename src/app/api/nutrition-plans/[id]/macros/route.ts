import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params
    const body = await request.json()
    const {
      proteinPct,
      carbsPct,
      fatPct,
      protein,
      carbs,
      fat,
    } = body || {}

    if (!planId) {
      return NextResponse.json({ error: 'Missing plan id' }, { status: 400 })
    }
    if (
      [proteinPct, carbsPct, fatPct].some(v => typeof v !== 'number') ||
      Math.round((proteinPct + carbsPct + fatPct) * 100) !== 100 * 100
    ) {
      return NextResponse.json({ error: 'Percentages must be numbers and sum to 100' }, { status: 400 })
    }

    // Fetch current plan to merge meta
    const plan = await prisma.nutritionPlan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const weekMenu = (plan.weekMenu as any) || {}
    const meta = { ...(weekMenu.meta || {}) }
    meta.macroSplit = { proteinPct, carbsPct, fatPct }
    const updatedWeekMenu = { ...weekMenu, meta }

    const updated = await prisma.nutritionPlan.update({
      where: { id: planId },
      data: {
        protein: typeof protein === 'number' ? Math.round(protein) : plan.protein,
        carbs: typeof carbs === 'number' ? Math.round(carbs) : plan.carbs,
        fat: typeof fat === 'number' ? Math.round(fat) : plan.fat,
        weekMenu: updatedWeekMenu,
        lastUsed: new Date(),
      },
    })

    return NextResponse.json({ success: true, plan: updated })
  } catch (error: any) {
    console.error('[macros][PATCH] error', error)
    return NextResponse.json({ error: 'Failed to update macros', details: error?.message }, { status: 500 })
  }
}

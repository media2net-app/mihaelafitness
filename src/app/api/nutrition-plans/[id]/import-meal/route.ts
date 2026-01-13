import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetPlanId } = await params
    const { sourcePlanId, sourceDay, targetDay, mealType } = await request.json()

    if (!targetPlanId || !sourcePlanId || !sourceDay || !mealType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const [target, source] = await Promise.all([
      prisma.nutritionPlan.findUnique({ where: { id: targetPlanId } }),
      prisma.nutritionPlan.findUnique({ where: { id: sourcePlanId } }),
    ])

    if (!target) return NextResponse.json({ error: 'Target plan not found' }, { status: 404 })
    if (!source) return NextResponse.json({ error: 'Source plan not found' }, { status: 404 })

    const srcWeekMenu: any = (source.weekMenu as any) || {}
    const targetWeekMenu: any = { ...((target.weekMenu as any) || {}) }

    // Get source day data
    const srcDay = srcWeekMenu?.[sourceDay] || null
    if (!srcDay) {
      return NextResponse.json({ error: `Source day "${sourceDay}" not found in template plan` }, { status: 404 })
    }

    // Get the meal from source day (can be string or object)
    const srcMeal = srcDay[mealType]
    if (!srcMeal) {
      return NextResponse.json({ error: `Meal "${mealType}" not found in source day` }, { status: 404 })
    }

    // Copy the meal to target day
    const dayToUpdate = targetDay || sourceDay
    if (!targetWeekMenu[dayToUpdate]) {
      targetWeekMenu[dayToUpdate] = {}
    }
    
    // Handle both string and object meal structures
    if (typeof srcMeal === 'string') {
      targetWeekMenu[dayToUpdate][mealType] = srcMeal
    } else if (typeof srcMeal === 'object') {
      // Copy the entire meal object (includes ingredients, cookingInstructions, etc.)
      targetWeekMenu[dayToUpdate][mealType] = { ...srcMeal }
    } else {
      return NextResponse.json({ error: `Invalid meal format in source day` }, { status: 400 })
    }

    const updated = await prisma.nutritionPlan.update({
      where: { id: targetPlanId },
      data: {
        weekMenu: targetWeekMenu,
        lastUsed: new Date(),
      },
    })

    return NextResponse.json({ success: true, plan: updated })
  } catch (error: any) {
    console.error('[import-meal][POST] error', error)
    return NextResponse.json({ error: 'Failed to import meal', details: error?.message }, { status: 500 })
  }
}


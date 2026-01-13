import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetPlanId } = await params
    const { sourcePlanId, sourceDay, targetDay } = await request.json()

    if (!targetPlanId || !sourcePlanId || !sourceDay) {
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

    // Copy the day to target (use targetDay if provided, otherwise use sourceDay)
    const dayToUpdate = targetDay || sourceDay
    targetWeekMenu[dayToUpdate] = srcDay

    // Also copy cooking instructions if they exist
    const srcInstrKey = `${sourceDay}_instructions`
    const targetInstrKey = `${dayToUpdate}_instructions`
    if (srcWeekMenu?.[srcInstrKey]) {
      targetWeekMenu[targetInstrKey] = srcWeekMenu[srcInstrKey]
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
    console.error('[import-day][POST] error', error)
    return NextResponse.json({ error: 'Failed to import day', details: error?.message }, { status: 500 })
  }
}



import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeWeekMenu = searchParams.get('includeWeekMenu') === 'true';
    
    // Base select fields (always included)
    const baseSelect = {
      id: true,
      name: true,
      goal: true,
      calories: true,
      protein: true,
      carbs: true,
      fat: true,
      meals: true,
      clients: true,
      status: true,
      description: true,
      created: true,
      lastUsed: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      customerNutritionPlans: {
        select: {
          id: true,
          customerId: true,
          status: true,
          assignedAt: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    };

    // Add weekMenu only if specifically requested
    const selectFields = includeWeekMenu 
      ? { ...baseSelect, weekMenu: true }
      : baseSelect;

    const nutritionPlans = await prisma.nutritionPlan.findMany({
      select: selectFields,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(nutritionPlans)
  } catch (error) {
    console.error('Error fetching nutrition plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nutrition plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('📊 Creating nutrition plan with data:', JSON.stringify(data, null, 2))
    
    const nutritionPlan = await prisma.nutritionPlan.create({
      data: {
        name: data.name,
        goal: data.goal || 'weight_loss',
        calories: data.totalCalories || data.calories,
        protein: data.totalProtein || data.protein,
        carbs: data.totalCarbs || data.carbs,
        fat: data.totalFat || data.fat,
        meals: data.meals || 0,
        clients: data.clients || 0,
        status: data.status || 'active',
        description: data.description,
        weekMenu: data.weekMenu,
        userId: data.userId
      }
    })

    console.log('✅ Nutrition plan created successfully:', nutritionPlan.id)
    return NextResponse.json(nutritionPlan, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating nutrition plan:', error)
    console.error('❌ Error details:', error.message)
    return NextResponse.json(
      { error: 'Failed to create nutrition plan', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Nutrition plan ID is required' },
        { status: 400 }
      )
    }

    // Check if nutrition plan exists before attempting to delete
    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: { id },
      include: {
        customerNutritionPlans: {
          select: { id: true }
        }
      }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Nutrition plan not found' },
        { status: 404 }
      )
    }

    // Delete the nutrition plan (cascade delete will handle related CustomerNutritionPlan records)
    await prisma.nutritionPlan.delete({
      where: { id }
    })

    console.log(`Nutrition plan ${id} deleted successfully (cascaded ${existingPlan.customerNutritionPlans.length} customer assignments)`)
    return NextResponse.json({ 
      success: true,
      message: 'Nutrition plan deleted successfully',
      id: id
    })
  } catch (error) {
    console.error('Error deleting nutrition plan:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete nutrition plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

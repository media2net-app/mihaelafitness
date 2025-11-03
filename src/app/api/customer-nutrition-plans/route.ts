import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const nutritionPlanId = searchParams.get('nutritionPlanId')

    let whereClause = {}
    if (customerId) {
      whereClause = { customerId }
    }
    if (nutritionPlanId) {
      whereClause = { ...whereClause, nutritionPlanId }
    }

    const assignments = await prisma.customerNutritionPlan.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        nutritionPlan: {
          select: {
            id: true,
            name: true,
            goal: true,
            calories: true,
            protein: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching customer nutrition plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer nutrition plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { customerId, nutritionPlanId, status = 'active', notes } = data

    if (!customerId || !nutritionPlanId) {
      return NextResponse.json(
        { error: 'Customer ID and Nutrition Plan ID are required' },
        { status: 400 }
      )
    }

    // Validate that customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, email: true }
    })

    if (!customer) {
      return NextResponse.json(
        { error: `Customer with ID ${customerId} not found` },
        { status: 404 }
      )
    }

    // Validate that nutrition plan exists
    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { id: nutritionPlanId },
      select: { id: true, name: true, goal: true }
    })

    if (!nutritionPlan) {
      return NextResponse.json(
        { error: `Nutrition plan with ID ${nutritionPlanId} not found` },
        { status: 404 }
      )
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.customerNutritionPlan.findUnique({
      where: {
        customerId_nutritionPlanId: {
          customerId,
          nutritionPlanId
        }
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'This nutrition plan is already assigned to this customer' },
        { status: 400 }
      )
    }

    const assignment = await prisma.customerNutritionPlan.create({
      data: {
        customerId,
        nutritionPlanId,
        status,
        notes,
        assignedAt: new Date()
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        nutritionPlan: {
          select: {
            id: true,
            name: true,
            goal: true,
            calories: true,
            protein: true
          }
        }
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating customer nutrition plan assignment:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      customerId,
      nutritionPlanId
    })
    
    // Return more detailed error message
    const errorMessage = error?.message || 'Failed to create customer nutrition plan assignment'
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error?.code === 'P2002' ? 'A unique constraint violation occurred. This assignment may already exist.' : error?.message,
        code: error?.code
      },
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
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    await prisma.customerNutritionPlan.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer nutrition plan assignment:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer nutrition plan assignment' },
      { status: 500 }
    )
  }
}
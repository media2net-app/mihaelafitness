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
        notes
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
  } catch (error) {
    console.error('Error creating customer nutrition plan assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create customer nutrition plan assignment' },
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
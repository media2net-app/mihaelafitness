import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        goal: true,
        joinDate: true,
        status: true,
        plan: true,
        trainingFrequency: true,
        lastWorkout: true,
        totalSessions: true,
        rating: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await request.json()
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        goal: data.goal,
        status: data.status,
        plan: data.plan,
        trainingFrequency: data.trainingFrequency,
        totalSessions: data.totalSessions,
        rating: data.rating,
        lastWorkout: data.lastWorkout ? new Date(data.lastWorkout) : undefined
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // First, clean up orphaned pricing calculations and payments
    console.log(`🧹 Cleaning up orphaned data for user ${id}...`);
    
    // Delete pricing calculations that reference this user
    const deletedPricing = await prisma.pricingCalculation.deleteMany({
      where: {
        OR: [
          { customerId: id },
          { customerId: { contains: id } } // For group training entries
        ]
      }
    });
    console.log(`🗑️  Deleted ${deletedPricing.count} pricing calculations`);
    
    // Delete payments for this user
    const deletedPayments = await prisma.payment.deleteMany({
      where: { customerId: id }
    });
    console.log(`💳 Deleted ${deletedPayments.count} payments`);
    
    // Delete the user (this will cascade delete related data due to foreign keys)
    await prisma.user.delete({
      where: { id }
    });

    console.log(`✅ User ${id} and all related data deleted successfully`);
    return NextResponse.json({ 
      success: true,
      deletedPricing: deletedPricing.count,
      deletedPayments: deletedPayments.count
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

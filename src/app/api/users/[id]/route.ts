import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // First try to find by ID
    let user = await prisma.user.findUnique({
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

    // If not found by ID, try to find by name (for backward compatibility)
    if (!user) {
      user = await prisma.user.findFirst({
        where: { name: id },
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
    }

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
    
    // Get current user to check if trainingFrequency changed
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { trainingFrequency: true }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Build update object with only provided fields
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.goal !== undefined) updateData.goal = data.goal
    if (data.status !== undefined) updateData.status = data.status
    if (data.plan !== undefined) updateData.plan = data.plan
    
    let newFrequency: number | undefined;
    if (data.trainingFrequency !== undefined && data.trainingFrequency !== null) {
      // Ensure trainingFrequency is a number
      newFrequency = typeof data.trainingFrequency === 'string' 
        ? parseInt(data.trainingFrequency, 10) 
        : Number(data.trainingFrequency)
      updateData.trainingFrequency = newFrequency
    }
    
    if (data.totalSessions !== undefined && data.totalSessions !== null) {
      updateData.totalSessions = typeof data.totalSessions === 'string'
        ? parseInt(data.totalSessions, 10)
        : Number(data.totalSessions)
    }
    if (data.rating !== undefined && data.rating !== null) {
      updateData.rating = typeof data.rating === 'string'
        ? parseFloat(data.rating)
        : Number(data.rating)
    }
    if (data.lastWorkout !== undefined && data.lastWorkout !== null) {
      updateData.lastWorkout = new Date(data.lastWorkout)
    }
    
    // If trainingFrequency changed, create history entry
    if (newFrequency !== undefined && newFrequency !== currentUser.trainingFrequency) {
      await prisma.trainingFrequencyHistory.create({
        data: {
          customerId: id,
          frequency: newFrequency,
          effectiveFrom: new Date()
        }
      });
      console.log(`Training frequency changed from ${currentUser.trainingFrequency} to ${newFrequency} for user ${id}`);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error updating user:', error)
    
    // Provide more detailed error messages
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
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

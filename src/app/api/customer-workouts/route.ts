import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (customerId) {
      // Get workouts for specific customer
      const customerWorkouts = await prisma.customerWorkout.findMany({
        where: { customerId },
        include: {
          workout: true,
          customer: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { assignedAt: 'desc' }
      });

      return NextResponse.json(customerWorkouts);
    } else {
      // Get all customer-workout assignments
      const customerWorkouts = await prisma.customerWorkout.findMany({
        include: {
          workout: true,
          customer: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { assignedAt: 'desc' }
      });

      return NextResponse.json(customerWorkouts);
    }
  } catch (error) {
    console.error('Error fetching customer workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer workouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Check if assignment already exists
    const existingAssignment = await prisma.customerWorkout.findUnique({
      where: {
        customerId_workoutId: {
          customerId: data.customerId,
          workoutId: data.workoutId
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Workout already assigned to this customer' },
        { status: 400 }
      );
    }

    const customerWorkout = await prisma.customerWorkout.create({
      data: {
        customerId: data.customerId,
        workoutId: data.workoutId,
        status: data.status || 'active',
        notes: data.notes
      },
      include: {
        workout: true,
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Update workout clients count
    await prisma.workout.update({
      where: { id: data.workoutId },
      data: {
        clients: {
          increment: 1
        },
        lastUsed: new Date()
      }
    });

    return NextResponse.json(customerWorkout, { status: 201 });
  } catch (error) {
    console.error('Error creating customer workout assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create customer workout assignment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    const customerWorkout = await prisma.customerWorkout.update({
      where: { id: data.id },
      data: {
        status: data.status,
        notes: data.notes
      },
      include: {
        workout: true,
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(customerWorkout);
  } catch (error) {
    console.error('Error updating customer workout assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update customer workout assignment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    // Get the assignment to update workout clients count
    const assignment = await prisma.customerWorkout.findUnique({
      where: { id }
    });

    if (assignment) {
      // Update workout clients count
      await prisma.workout.update({
        where: { id: assignment.workoutId },
        data: {
          clients: {
            decrement: 1
          }
        }
      });
    }

    await prisma.customerWorkout.delete({
      where: { id }
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error deleting customer workout assignment:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer workout assignment' },
      { status: 500 }
    );
  }
}

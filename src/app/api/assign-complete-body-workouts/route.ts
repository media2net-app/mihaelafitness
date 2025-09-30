import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🏋️ Assigning Complete Body workouts to customers...');
    
    // Get all customers
    const customers = await prisma.user.findMany();
    console.log(`Found ${customers.length} customers`);
    
    // Get the Complete Body workouts
    const completeBodyWorkouts = await prisma.workout.findMany({
      where: {
        category: 'Complete Body'
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`Found ${completeBodyWorkouts.length} Complete Body workouts:`);
    completeBodyWorkouts.forEach(workout => {
      console.log(`  - ${workout.name}`);
    });
    
    if (completeBodyWorkouts.length === 0) {
      return NextResponse.json({ 
        error: 'No Complete Body workouts found. Please run the workout creation script first.' 
      }, { status: 400 });
    }
    
    let totalAssignments = 0;
    
    // Assign workouts to each customer
    for (const customer of customers) {
      console.log(`\n👤 Assigning workouts to ${customer.name}...`);
      
      // Clear existing assignments for this customer
      await prisma.customerScheduleAssignment.deleteMany({
        where: { customerId: customer.id }
      });
      
      // Assign each workout based on training day number (not weekday)
      // trainingDay 1 = Day 1 (Legs & Glutes)
      // trainingDay 2 = Day 2 (Back + Triceps + Abs)
      // trainingDay 3 = Day 3 (Chest + Shoulders + Biceps + Abs)
      for (let i = 0; i < completeBodyWorkouts.length; i++) {
        const workout = completeBodyWorkouts[i];
        const trainingDay = i + 1; // Training day 1, 2, 3
        
        // Set weekday to 0 (any day) since we're using trainingDay for workout selection
        await prisma.customerScheduleAssignment.create({
          data: {
            customerId: customer.id,
            workoutId: workout.id,
            weekday: trainingDay, // Keep for compatibility but won't be used for workout selection
            trainingDay: trainingDay, // This is what matters - 1st, 2nd, or 3rd session
            isActive: true
          }
        });
        
        console.log(`  ✅ Assigned ${workout.name} to Training Day ${trainingDay}`);
        totalAssignments++;
      }
    }
    
    console.log('\n🎉 All Complete Body workouts assigned successfully!');
    
    return NextResponse.json({
      success: true,
      message: `Assigned Complete Body workouts to ${customers.length} customers`,
      totalAssignments,
      customers: customers.length
    });
    
  } catch (error) {
    console.error('❌ Error assigning workouts:', error);
    return NextResponse.json(
      { error: 'Failed to assign workouts' },
      { status: 500 }
    );
  }
}

function getWeekdayName(weekday: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[weekday];
}

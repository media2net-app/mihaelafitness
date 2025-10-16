import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Assign the 3 Complete Body workouts to all customers that have a 3x/week subscription
// Source of truth for subscription: PricingCalculation rows where frequency contains "3x/week" (case-insensitive)
export async function POST(_request: NextRequest) {
  try {
    // 1) Find all pricing calculations with frequency exactly 3 (3x/week)
    // Note: in our data this field is numeric
    const allCalcs = await prisma.pricingCalculation.findMany({
      where: { frequency: 3 },
      orderBy: { createdAt: 'desc' }
    });

    // 2) Extract unique customer IDs from those calculations
    const customerIdSet = new Set<string>();
    for (const c of allCalcs) {
      const ids = String(c.customerId || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      ids.forEach((id) => customerIdSet.add(id));
    }

    if (customerIdSet.size === 0) {
      return NextResponse.json({
        success: true,
        message: 'No customers found with 3x/week subscription',
        assignedCustomers: 0,
        totalAssignments: 0
      });
    }

    // 3) Select exactly one workout to use for all three days
    const allWorkouts = await prisma.workout.findMany({ orderBy: { name: 'asc' } });
    const byName = (s: string) => allWorkouts.find(w => String(w.name || '').toLowerCase() === s.toLowerCase());
    let selected = byName('3x per week - Complete Body');
    if (!selected) {
      selected = allWorkouts.find(w => /3x/.test(String(w.name || '')) && /complete body/i.test(String(w.name || '')));
    }
    if (!selected) {
      selected = allWorkouts.find(w => String(w.category || '').toLowerCase().includes('full body')) || allWorkouts[0];
    }

    // Use the same workout for Training Day 1..3
    const dayWorkouts = [selected, selected, selected];

    // 4) Assign to each customer: clear existing assignments, then create 3 trainingDay assignments
    let totalAssignments = 0;
    const customerIds = Array.from(customerIdSet);

    for (const customerId of customerIds) {
      // Clear old schedule assignments for this customer
      await prisma.customerScheduleAssignment.deleteMany({ where: { customerId } });

      for (let i = 0; i < dayWorkouts.length; i++) {
        const w = dayWorkouts[i];
        const trainingDay = i + 1;
        await prisma.customerScheduleAssignment.create({
          data: {
            customerId,
            workoutId: w.id,
            weekday: trainingDay, // kept for compatibility with any existing logic
            trainingDay,
            isActive: true,
          }
        });
        totalAssignments++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Assigned 3x/week workouts to ${customerIds.length} customers`,
      assignedCustomers: customerIds.length,
      totalAssignments
    });
  } catch (error) {
    console.error('Error auto-assigning 3x/week workouts:', error);
    return NextResponse.json({ error: 'Failed to auto-assign 3x/week workouts' }, { status: 500 });
  }
}

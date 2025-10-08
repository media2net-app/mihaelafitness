import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/customers/:id/schedule-assignments
// Returns active schedule assignments (weekdays) for a customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const assignments = await prisma.customerScheduleAssignment.findMany({
      where: { customerId: id, isActive: true },
      select: { id: true, weekday: true, trainingDay: true },
      orderBy: { weekday: 'asc' },
    });

    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    console.error('Error fetching customer schedule assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch customer schedule assignments' }, { status: 500 });
  }
}

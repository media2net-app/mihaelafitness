import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/nutrition-plans/:id/customer
// Returns the active customer (if any) that this nutrition plan is assigned to
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Nutrition plan ID is required' }, { status: 400 });
    }

    // Find active assignment for this plan
    const assignment = await prisma.customerNutritionPlan.findFirst({
      where: {
        nutritionPlanId: id,
        status: 'active',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            trainingFrequency: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    if (!assignment?.customer) {
      return NextResponse.json({ customer: null }, { status: 200 });
    }

    return NextResponse.json({ customer: assignment.customer }, { status: 200 });
  } catch (error) {
    console.error('Error fetching nutrition plan customer:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition plan customer' }, { status: 500 });
  }
}

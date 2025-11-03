import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    
    console.log(`[V3 API] GET /api/nutrition-plans-v3/${planId}`);
    
    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { id: planId },
    });

    if (!nutritionPlan) {
      console.log(`[V3 API] Plan not found: ${planId}`);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    console.log(`[V3 API] Plan found: ${planId}`);
    
    const response = NextResponse.json(nutritionPlan);
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('[V3 API] Error fetching plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


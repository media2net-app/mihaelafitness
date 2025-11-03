import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    console.log('PUT /api/pricing-calculations/[id] - Updating pricing calculation:', { id, data });

    // Check if pricing calculation exists
    const existingCalculation = await prisma.pricingCalculation.findUnique({
      where: { id }
    });

    if (!existingCalculation) {
      return NextResponse.json(
        { error: 'Pricing calculation not found' },
        { status: 404 }
      );
    }

    const updatedCalculation = await prisma.pricingCalculation.update({
      where: { id },
      data: {
        service: data.service,
        duration: data.duration,
        frequency: data.frequency,
        discount: data.discount,
        vat: data.vat,
        finalPrice: data.finalPrice,
        includeNutritionPlan: data.includeNutritionPlan,
        nutritionPlanCount: data.nutritionPlanCount,
        customerId: data.customerId,
        customerName: data.customerName
      }
    });

    console.log('Pricing calculation updated successfully:', id);
    return NextResponse.json(updatedCalculation);
  } catch (error) {
    console.error('Error updating pricing calculation:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing calculation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('DELETE /api/pricing-calculations/[id] - Deleting pricing calculation:', { id });

    // Check if pricing calculation exists
    const existingCalculation = await prisma.pricingCalculation.findUnique({
      where: { id }
    });

    if (!existingCalculation) {
      return NextResponse.json(
        { error: 'Pricing calculation not found' },
        { status: 404 }
      );
    }

    await prisma.pricingCalculation.delete({
      where: { id }
    });

    console.log('Pricing calculation deleted successfully:', id);
    return NextResponse.json({ 
      success: true, 
      message: 'Pricing calculation deleted successfully',
      id 
    });
  } catch (error) {
    console.error('Error deleting pricing calculation:', error);
    return NextResponse.json(
      { error: 'Failed to delete pricing calculation' },
      { status: 500 }
    );
  }
}


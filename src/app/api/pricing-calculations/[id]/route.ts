import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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


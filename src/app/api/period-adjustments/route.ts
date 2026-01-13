import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to check if periodAdjustment model exists
const checkModelExists = () => {
  try {
    // Try to access the model - if it doesn't exist, this will throw
    return 'periodAdjustment' in prisma;
  } catch {
    return false;
  }
};

// Get all period adjustments for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId is required' },
        { status: 400 }
      );
    }

    // Check if model exists, if not return empty array (for backwards compatibility)
    if (!checkModelExists()) {
      console.warn('PeriodAdjustment model not found, returning empty array');
      return NextResponse.json([]);
    }

    const adjustments = await prisma.periodAdjustment.findMany({
      where: { customerId },
      orderBy: { periodNumber: 'asc' }
    });

    return NextResponse.json(adjustments);
  } catch (error: any) {
    console.error('Error fetching period adjustments:', error);
    
    // If it's a model not found error, return empty array
    if (error.message?.includes('periodAdjustment') || error.code === 'P2001') {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch period adjustments' },
      { status: 500 }
    );
  }
}

// Create or update a period adjustment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerId, periodNumber, customStartDate, notes } = data;

    if (!customerId || !periodNumber || !customStartDate) {
      return NextResponse.json(
        { error: 'customerId, periodNumber, and customStartDate are required' },
        { status: 400 }
      );
    }

    // Check if model exists
    if (!checkModelExists()) {
      return NextResponse.json(
        { 
          error: 'Database schema not updated. Please run: npx prisma generate && npx prisma db push',
          code: 'SCHEMA_NOT_UPDATED'
        },
        { status: 503 }
      );
    }

    // Get customer to check training frequency for this period
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { trainingFrequency: true, joinDate: true }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get frequency history to determine the frequency for this period
    let frequencyHistory: any[] = [];
    try {
      if ('trainingFrequencyHistory' in prisma) {
        frequencyHistory = await (prisma as any).trainingFrequencyHistory.findMany({
          where: { customerId },
          orderBy: { effectiveFrom: 'asc' }
        });
      }
    } catch (e) {
      console.warn('Could not fetch frequency history:', e);
    }

    const startDate = new Date(customStartDate);
    startDate.setHours(0, 0, 0, 0);

    // Determine the frequency that was active at the start of this period
    let periodFrequency = customer.trainingFrequency;
    for (const entry of frequencyHistory) {
      if (new Date(entry.effectiveFrom) <= startDate) {
        periodFrequency = entry.frequency;
      }
    }

    // Calculate end date: 4 weeks (28 days) from start date
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 27); // 28 days - 1 (0-indexed)
    endDate.setHours(23, 59, 59, 999);

    // Use type assertion to access the model
    const PeriodAdjustmentModel = (prisma as any).periodAdjustment;
    
    if (!PeriodAdjustmentModel) {
      return NextResponse.json(
        { 
          error: 'PeriodAdjustment model not found. Please run: npx prisma generate && npx prisma db push',
          code: 'MODEL_NOT_FOUND'
        },
        { status: 503 }
      );
    }

    const adjustment = await PeriodAdjustmentModel.upsert({
      where: {
        customerId_periodNumber: {
          customerId,
          periodNumber: parseInt(periodNumber, 10)
        }
      },
      update: {
        customStartDate: startDate,
        notes: notes || null,
        updatedAt: new Date()
      },
      create: {
        customerId,
        periodNumber: parseInt(periodNumber, 10),
        customStartDate: startDate,
        notes: notes || null
      }
    });

    return NextResponse.json({
      ...adjustment,
      customEndDate: endDate.toISOString(),
      expectedSessions: periodFrequency * 4
    });
  } catch (error: any) {
    console.error('Error creating/updating period adjustment:', error);
    console.error('Error details:', {
      code: error.code,
      meta: error.meta,
      message: error.message,
      stack: error.stack
    });
    
    // Check if it's a Prisma schema issue
    if (error.message?.includes('periodAdjustment') || 
        error.message?.includes('upsert') ||
        error.message?.includes('undefined') ||
        error.code === 'P2001') {
      return NextResponse.json(
        { 
          error: 'Database schema niet bijgewerkt. Voer uit: npx prisma generate && npx prisma db push',
          code: 'SCHEMA_ERROR',
          details: error.message
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to save period adjustment' },
      { status: 500 }
    );
  }
}

// Delete a period adjustment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const periodNumber = searchParams.get('periodNumber');

    if (!customerId || !periodNumber) {
      return NextResponse.json(
        { error: 'customerId and periodNumber are required' },
        { status: 400 }
      );
    }

    await prisma.periodAdjustment.delete({
      where: {
        customerId_periodNumber: {
          customerId,
          periodNumber: parseInt(periodNumber, 10)
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting period adjustment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete period adjustment' },
      { status: 500 }
    );
  }
}


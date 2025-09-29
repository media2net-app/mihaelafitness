import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json()
    
    console.log('PUT /api/customer-measurements/[id] - Updating measurement:', { id, data });
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Measurement ID is required' },
        { status: 400 }
      )
    }

    // Check if measurement exists
    const existingMeasurement = await prisma.customerMeasurement.findUnique({
      where: { id }
    })

    if (!existingMeasurement) {
      return NextResponse.json(
        { error: 'Measurement not found' },
        { status: 404 }
      )
    }

    const measurement = await prisma.customerMeasurement.update({
      where: { id },
      data: {
        week: data.week,
        date: new Date(data.date),
        weight: data.weight ? parseFloat(data.weight) : null,
        height: data.height ? parseFloat(data.height) : null,
        age: data.age ? parseInt(data.age) : null,
        chest: data.chest ? parseFloat(data.chest) : null,
        waist: data.waist ? parseFloat(data.waist) : null,
        hips: data.hips ? parseFloat(data.hips) : null,
        thigh: data.thigh ? parseFloat(data.thigh) : null,
        arm: data.arm ? parseFloat(data.arm) : null,
        neck: data.neck ? parseFloat(data.neck) : null,
        bodyFat: data.bodyFat ? parseFloat(data.bodyFat) : null,
        muscleMass: data.muscleMass ? parseFloat(data.muscleMass) : null,
        bmi: data.bmi ? parseFloat(data.bmi) : null,
        notes: data.notes || null
      }
    })

    console.log('Measurement updated successfully:', measurement);
    return NextResponse.json(measurement)
  } catch (error) {
    console.error('Error updating measurement:', error)
    return NextResponse.json(
      { error: `Failed to update measurement: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('DELETE /api/customer-measurements/[id] - Deleting measurement:', { id });

    // Check if measurement exists
    const existingMeasurement = await prisma.customerMeasurement.findUnique({
      where: { id }
    })

    if (!existingMeasurement) {
      return NextResponse.json(
        { error: 'Measurement not found' },
        { status: 404 }
      )
    }

    await prisma.customerMeasurement.delete({
      where: { id }
    })

    console.log('Measurement deleted successfully:', id);
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting measurement:', error)
    return NextResponse.json(
      { error: `Failed to delete measurement: ${error.message}` },
      { status: 500 }
    )
  }
}

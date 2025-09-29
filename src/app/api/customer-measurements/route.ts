import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (customerId) {
      // Get measurements for specific customer
      const measurements = await prisma.customerMeasurement.findMany({
        where: { customerId },
        orderBy: [
          { week: 'asc' },
          { date: 'asc' }
        ]
      })
      return NextResponse.json(measurements)
    } else {
      // Get all measurements with customer information
      const measurements = await prisma.customerMeasurement.findMany({
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { week: 'asc' },
          { date: 'asc' }
        ]
      })

      // Transform the data to include customer information
      const transformedMeasurements = measurements.map(measurement => ({
        ...measurement,
        customerId: measurement.customerId,
        customerName: measurement.customer.name
      }))

      return NextResponse.json(transformedMeasurements)
    }
  } catch (error) {
    console.error('Error fetching customer measurements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch measurements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Creating measurement with data:', data)
    
    // Validate required fields
    if (!data.customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    if (!data.week || !data.date) {
      return NextResponse.json(
        { error: 'Week and date are required' },
        { status: 400 }
      )
    }

    // Convert string values to numbers where needed
    const measurementData = {
      customerId: data.customerId,
      week: parseInt(data.week),
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

    console.log('Processed measurement data:', measurementData)
    
    const measurement = await prisma.customerMeasurement.create({
      data: measurementData
    })

    console.log('Measurement created successfully:', measurement)
    return NextResponse.json(measurement, { status: 201 })
  } catch (error) {
    console.error('Error creating measurement:', error)
    return NextResponse.json(
      { error: `Failed to create measurement: ${error.message}` },
      { status: 500 }
    )
  }
}



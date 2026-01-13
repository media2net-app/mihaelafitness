import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, preferredDate, preferredTime, message } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Create client with Intake label
    const client = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        status: 'Intake', // This will be the label
        plan: 'Intake',
        trainingFrequency: 0,
        // Add any other default fields as needed
      }
    });

    // If preferred date and time are provided, validate and create a training session
    if (preferredDate && preferredTime) {
      const sessionDate = new Date(preferredDate);
      const [hours, minutes] = preferredTime.split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);

      // Validate: no Sundays (Sunday=0)
      const dayOfWeek = sessionDate.getDay();
      const isWeekend = dayOfWeek === 0; // Only Sunday is closed
      if (isWeekend) {
        return NextResponse.json(
          { error: 'Selected date is not available (Sunday closed). Please choose another day.' },
          { status: 400 }
        );
      }

      // Working hours and breaks aligned with schedule UI
      const workingHours = { start: '08:00', end: '20:00' };
      // No breaks on Friday (5) and Saturday (6)
      const breaks: Array<{ start: string; end: string }> = [];
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        // Only apply lunch break on Monday-Thursday (not Friday/Saturday)
        breaks.push({ start: '12:30', end: '13:00' });
      }

      const pad = (n: number) => n.toString().padStart(2, '0');
      const startStr = `${pad(hours)}:${pad(minutes)}`;
      // 30-minute intake
      const endMinutesTotal = hours * 60 + minutes + 30;
      const endHours = Math.floor(endMinutesTotal / 60);
      const endMins = endMinutesTotal % 60;
      const endStr = `${pad(endHours)}:${pad(endMins)}`;

      // Check within working hours
      if (!(startStr >= workingHours.start && endStr <= workingHours.end)) {
        return NextResponse.json(
          { error: 'Selected time is outside working hours.' },
          { status: 400 }
        );
      }

      // Check break overlap
      const overlapsBreak = breaks.some(b => startStr < b.end && endStr > b.start);
      if (overlapsBreak) {
        return NextResponse.json(
          { error: 'Selected time overlaps a break. Choose another time.' },
          { status: 400 }
        );
      }

      // Get existing sessions on the same day to avoid overlaps
      const startOfDay = new Date(sessionDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(sessionDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingSessions = await prisma.trainingSession.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: 'scheduled', // Only check conflicts with scheduled sessions
        },
        select: { startTime: true, endTime: true },
      });

      const hasConflict = existingSessions.some(s => startStr < s.endTime && endStr > s.startTime);
      if (hasConflict) {
        return NextResponse.json(
          { error: 'Selected time is already booked. Please choose another time.' },
          { status: 400 }
        );
      }

      await prisma.trainingSession.create({
        data: {
          customerId: client.id,
          date: sessionDate,
          startTime: startStr,
          endTime: endStr,
          type: 'Intake Consultation',
          notes: message || 'Free intake consultation',
          status: 'scheduled',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Intake request submitted successfully',
      clientId: client.id
    });

  } catch (error) {
    console.error('Error creating intake request:', error);
    return NextResponse.json(
      { error: 'Failed to submit intake request' },
      { status: 500 }
    );
  }
}






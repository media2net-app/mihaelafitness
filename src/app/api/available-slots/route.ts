import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Check if the date is a specific holiday (only Oct 10-11, 2025)
    const dateObj = new Date(date);
    const dateString = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
    // Check if Sunday is closed (Sunday = 0)
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0; // Only Sunday is closed
    
    if (isWeekend) {
      return NextResponse.json({
        date,
        availableSlots: [],
        workingHours: {
          start: '08:00',
          end: '20:00'
        },
        breaks: [
          { start: '12:30', end: '14:00' },
          { start: '17:00', end: '17:30' },
          { start: '17:30', end: '19:00' },
        ],
        weekend: isWeekend,
        friday: false,
        message: 'Weekend in Holland'
      });
    }

    // Get all training sessions for the specified date
    // Use robust date comparison to avoid timezone issues
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingSessions = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: 'scheduled' // Only consider scheduled sessions for conflicts
      },
      select: {
        startTime: true,
        endTime: true,
        type: true,
        status: true,
      }
    });

    console.log(`📅 Available Slots API - Date: ${date}`);
    console.log(`📋 Existing sessions for date:`, existingSessions.map(s => `${s.startTime}-${s.endTime} (${s.type})`));


    // Define working hours and breaks (aligned with schedule UI)
    const workingHours = {
      start: '08:00',
      end: '20:00'
    };

    // Break windows to exclude from booking
    // No breaks on Friday (5) and Saturday (6)
    const breaks: Array<{ start: string; end: string }> = [];
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      // Only apply lunch break on Monday-Thursday (not Friday/Saturday)
      breaks.push({ start: '12:30', end: '13:00' });
    }

    // Generate all possible 30-minute time slots for intake consultations
    const timeSlots = [] as Array<{ start: string; end: string; available: boolean }>;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const startMinutes = 8 * 60; // 08:00
    const endMinutes = 20 * 60;  // 20:00 hard close
    const slotDuration = 30;     // 30 minutes

    for (let m = startMinutes; m + slotDuration <= endMinutes; m += 30) {
      const hour = Math.floor(m / 60);
      const minute = m % 60;
      const endM = m + slotDuration;
      const endHour = Math.floor(endM / 60);
      const endMinute = endM % 60;

      const timeString = `${pad(hour)}:${pad(minute)}`;
      const endTimeString = `${pad(endHour)}:${pad(endMinute)}`;

      // Check break overlap
      const isInBreak = breaks.some(b => timeString < b.end && endTimeString > b.start);

      // Check conflicts with existing scheduled sessions only
      const conflictingSession = existingSessions.find(session => (
        timeString < session.endTime && endTimeString > session.startTime
      ));

      const isBooked = !!conflictingSession;

      if (isInBreak) {
        console.log(`⏸️  ${timeString}-${endTimeString}: BLOCKED (Break time)`);
      } else if (isBooked) {
        console.log(`🚫 ${timeString}-${endTimeString}: BLOCKED (${conflictingSession?.type || 'Session'})`);
      } else {
        console.log(`✅ ${timeString}-${endTimeString}: AVAILABLE`);
        timeSlots.push({ start: timeString, end: endTimeString, available: true });
      }
    }

    console.log(`📊 Summary for ${date}:`);
    console.log(`   Total sessions scheduled: ${existingSessions.length}`);
    console.log(`   Available time slots: ${timeSlots.length}`);
    console.log(`   Breaks: ${breaks.length}`);

    return NextResponse.json({
      date,
      availableSlots: timeSlots,
      workingHours,
      breaks
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}

/**
 * Assigns Lazarescu Denisa workout to user and creates training sessions.
 * Run: node scripts/assign-lazarescu-denisa-schedule.js
 */
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL = 'lazarescu.denisa@mihaelafitness.com';
const WORKOUT_NAME = 'Lazarescu Denisa';
// Mon=1, Wed=3, Fri=5 (weekday 1=Monday in schema)
const WEEKDAYS = [
  { weekday: 1, trainingDay: 1 }, // Monday = Day 1
  { weekday: 3, trainingDay: 2 }, // Wednesday = Day 2
  { weekday: 5, trainingDay: 3 }, // Friday = Day 3
];

function getNextWeekday(date, targetWeekday) {
  const d = new Date(date);
  const current = d.getDay();
  const diff = (targetWeekday - current + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 && current !== targetWeekday ? 7 : diff));
  return d;
}

async function main() {
  const user = await prisma.user.findFirst({ where: { email: EMAIL } });
  if (!user) {
    console.error('User not found. Run: node scripts/add-lazarescu-denisa-user.js');
    process.exit(1);
  }

  const workout = await prisma.workout.findFirst({ where: { name: WORKOUT_NAME } });
  if (!workout) {
    console.error('Workout not found. Run: node scripts/add-lazarescu-denisa-plan.js');
    process.exit(1);
  }

  console.log('Assigning schedule for', user.name, '...\n');

  // 1. Create CustomerScheduleAssignment
  for (const { weekday, trainingDay } of WEEKDAYS) {
    await prisma.customerScheduleAssignment.upsert({
      where: {
        customerId_weekday: { customerId: user.id, weekday }
      },
      update: { workoutId: workout.id, trainingDay, isActive: true },
      create: {
        customerId: user.id,
        workoutId: workout.id,
        weekday,
        trainingDay,
        isActive: true,
      },
    });
    console.log('  Assigned weekday', weekday, '-> trainingDay', trainingDay);
  }

  // 2. Create TrainingSession for next 8 weeks (Mon, Wed, Fri 10:00-11:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sessions = [];
  for (let week = 0; week < 8; week++) {
    for (const { weekday } of WEEKDAYS) {
      const sessionDate = getNextWeekday(today, weekday === 7 ? 0 : weekday);
      sessionDate.setDate(sessionDate.getDate() + week * 7);
      sessions.push({
        customerId: user.id,
        date: sessionDate,
        startTime: '10:00',
        endTime: '11:00',
        type: '1:1',
        status: 'scheduled',
        notes: `${WORKOUT_NAME} - Day ${WEEKDAYS.find(w => w.weekday === weekday)?.trainingDay || ''}`,
      });
    }
  }

  for (const s of sessions) {
    await prisma.trainingSession.create({ data: s });
  }
  console.log('\n  Created', sessions.length, 'training sessions (8 weeks, 3x/week)');

  console.log('\nDone. Lazarescu Denisa can now see her schedule at /schedule when logged in.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

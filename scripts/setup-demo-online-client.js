/**
 * Demo online client (Training-Only) with the same 3-day plan as Maria / Lazarescu Denisa.
 * Run: node scripts/setup-demo-online-client.js
 */
if (process.env.DOTENV_CONFIG_PATH) {
  require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH, override: true });
} else {
  require('dotenv').config();
  require('dotenv').config({ path: '.env.local' });
}
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL = 'demo-online@mihaelafitness.com';
const NAME = 'Demo Online Klant';
const PASSWORD = 'DemoOnline2025';
const WORKOUT_NAME = 'Training Plan - 3 Dagen';
const WEEKDAYS = [
  { weekday: 1, trainingDay: 1 },
  { weekday: 3, trainingDay: 2 },
  { weekday: 5, trainingDay: 3 },
];

async function main() {
  const workout = await prisma.workout.findFirst({ where: { name: WORKOUT_NAME } });
  if (!workout) {
    console.error(`Workout not found: ${WORKOUT_NAME}`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      name: NAME,
      password: hashedPassword,
      loginPassword: PASSWORD,
      plan: 'Training-Only',
      status: 'active',
      trainingFrequency: 3,
    },
    create: {
      email: EMAIL,
      name: NAME,
      password: hashedPassword,
      loginPassword: PASSWORD,
      plan: 'Training-Only',
      status: 'active',
      trainingFrequency: 3,
      goal: 'Demo account — zelfde online schema als Maria en Lazarescu Denisa',
    },
  });

  await prisma.onlineClientProfile.upsert({
    where: { customerId: user.id },
    update: {
      onboardingCompletedAt: new Date(),
      gender: 'female',
      heightCm: 168,
      fitnessGoals: ['lose-weight', 'build-strength'],
    },
    create: {
      customerId: user.id,
      onboardingCompletedAt: new Date(),
      gender: 'female',
      heightCm: 168,
      fitnessGoals: ['lose-weight', 'build-strength'],
    },
  });

  for (const { weekday, trainingDay } of WEEKDAYS) {
    await prisma.customerScheduleAssignment.upsert({
      where: {
        customerId_weekday: { customerId: user.id, weekday },
      },
      update: {
        workoutId: workout.id,
        trainingDay,
        isActive: true,
      },
      create: {
        customerId: user.id,
        workoutId: workout.id,
        weekday,
        trainingDay,
        isActive: true,
      },
    });
  }

  console.log('\nDemo online client ready.\n');
  console.log('Login URL:  /login  (or http://localhost:3001/login)');
  console.log('Email:      ', EMAIL);
  console.log('Password:   ', PASSWORD);
  console.log('After login: /schedule (Training Plan - 3 Dagen, dag 1–3 met video\'s)\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

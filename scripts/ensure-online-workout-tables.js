/**
 * Ensures online_workout_sessions exists (exercise_set_logs may already exist).
 * Run: node scripts/ensure-online-workout-tables.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS online_workout_sessions (
      id TEXT PRIMARY KEY,
      "customerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "workoutId" TEXT NOT NULL,
      "trainingDay" INTEGER NOT NULL,
      date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "completedAt" TIMESTAMP(3),
      "durationSec" INTEGER,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT online_workout_sessions_customer_date_day_key UNIQUE ("customerId", date, "trainingDay")
    );
  `);
  console.log('✓ online_workout_sessions ready');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

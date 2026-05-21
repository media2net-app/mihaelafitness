/**
 * Ensures all tables required for online (Training-Only) clients.
 * Run: node scripts/ensure-all-online-tables.js
 */
if (process.env.DOTENV_CONFIG_PATH) {
  require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH, override: true });
} else {
  require('dotenv').config();
  require('dotenv').config({ path: '.env.local' });
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function exec(sql) {
  await prisma.$executeRawUnsafe(sql);
}

async function main() {
  await exec(`
    CREATE TABLE IF NOT EXISTS online_client_profiles (
      id TEXT PRIMARY KEY,
      "customerId" TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      "onboardingCompletedAt" TIMESTAMP(3),
      gender TEXT,
      "heightCm" DOUBLE PRECISION,
      "fitnessGoals" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS daily_food_photos (
      id TEXT PRIMARY KEY,
      "customerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TIMESTAMP(3) NOT NULL,
      "mealSlot" INTEGER NOT NULL,
      "imageUrl" TEXT NOT NULL,
      notes TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT daily_food_photos_customer_date_slot_key UNIQUE ("customerId", date, "mealSlot")
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS daily_water_tracking (
      id TEXT PRIMARY KEY,
      "customerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TIMESTAMP(3) NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      target DOUBLE PRECISION NOT NULL DEFAULT 2.0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT daily_water_tracking_customer_date_key UNIQUE ("customerId", date)
    );
  `);

  await exec(`
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

  await exec(`
    CREATE TABLE IF NOT EXISTS online_client_habits (
      id TEXT PRIMARY KEY,
      "customerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "habitKey" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT online_client_habits_customer_habit_key UNIQUE ("customerId", "habitKey")
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS online_habit_daily_logs (
      id TEXT PRIMARY KEY,
      "customerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "habitKey" TEXT NOT NULL,
      date DATE NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT online_habit_daily_logs_customer_habit_date_key UNIQUE ("customerId", "habitKey", date)
    );
  `);

  await exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS login_password TEXT;`);

  console.log('✓ All online client tables verified (exercise_set_logs uses existing snake_case columns)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

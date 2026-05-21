/**
 * Ensures online_client_habits and online_habit_daily_logs exist.
 * Run: node scripts/ensure-online-habit-tables.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
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
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS online_client_habits_customer_active_idx
    ON online_client_habits ("customerId", "isActive");
  `);
  await prisma.$executeRawUnsafe(`
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
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS online_habit_daily_logs_customer_date_idx
    ON online_habit_daily_logs ("customerId", date);
  `);
  console.log('✓ online habit tables ready');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

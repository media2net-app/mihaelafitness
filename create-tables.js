require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function createTables() {
  try {
    console.log('🔍 Creating daily tasks tables...');
    
    // Execute SQL statements one by one
    const statements = [
      `CREATE TABLE IF NOT EXISTS "daily_tasks" (
        "id" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "targetValue" DOUBLE PRECISION,
        "unit" TEXT,
        "icon" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "daily_tasks_pkey" PRIMARY KEY ("id")
      )`,
      
      `CREATE TABLE IF NOT EXISTS "daily_task_completions" (
        "id" TEXT NOT NULL,
        "dailyTaskId" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT true,
        "value" DOUBLE PRECISION,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "daily_task_completions_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "daily_task_completions_dailyTaskId_customerId_date_key" UNIQUE ("dailyTaskId", "customerId", "date")
      )`,
      
      `CREATE TABLE IF NOT EXISTS "daily_nutrition_tracking" (
        "id" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "followed" BOOLEAN NOT NULL DEFAULT false,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "daily_nutrition_tracking_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "daily_nutrition_tracking_customerId_date_key" UNIQUE ("customerId", "date")
      )`,
      
      `CREATE TABLE IF NOT EXISTS "daily_water_tracking" (
        "id" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "target" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "daily_water_tracking_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "daily_water_tracking_customerId_date_key" UNIQUE ("customerId", "date")
      )`
    ];
    
    // Create tables
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
    
    console.log('✅ Tables created!');
    
    // Add foreign keys
    console.log('🔗 Adding foreign keys...');
    const fkStatements = [
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_tasks_customerId_fkey') THEN
          ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_customerId_fkey" 
          FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_task_completions_dailyTaskId_fkey') THEN
          ALTER TABLE "daily_task_completions" ADD CONSTRAINT "daily_task_completions_dailyTaskId_fkey" 
          FOREIGN KEY ("dailyTaskId") REFERENCES "daily_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_task_completions_customerId_fkey') THEN
          ALTER TABLE "daily_task_completions" ADD CONSTRAINT "daily_task_completions_customerId_fkey" 
          FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_nutrition_tracking_customerId_fkey') THEN
          ALTER TABLE "daily_nutrition_tracking" ADD CONSTRAINT "daily_nutrition_tracking_customerId_fkey" 
          FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_water_tracking_customerId_fkey') THEN
          ALTER TABLE "daily_water_tracking" ADD CONSTRAINT "daily_water_tracking_customerId_fkey" 
          FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$`
    ];
    
    for (const statement of fkStatements) {
      await prisma.$executeRawUnsafe(statement);
    }
    
    console.log('✅ Foreign keys added!');
    
    // Create indexes
    console.log('📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "daily_tasks_customerId_idx" ON "daily_tasks"("customerId")',
      'CREATE INDEX IF NOT EXISTS "daily_task_completions_dailyTaskId_idx" ON "daily_task_completions"("dailyTaskId")',
      'CREATE INDEX IF NOT EXISTS "daily_task_completions_customerId_idx" ON "daily_task_completions"("customerId")',
      'CREATE INDEX IF NOT EXISTS "daily_task_completions_date_idx" ON "daily_task_completions"("date")',
      'CREATE INDEX IF NOT EXISTS "daily_nutrition_tracking_customerId_idx" ON "daily_nutrition_tracking"("customerId")',
      'CREATE INDEX IF NOT EXISTS "daily_nutrition_tracking_date_idx" ON "daily_nutrition_tracking"("date")',
      'CREATE INDEX IF NOT EXISTS "daily_water_tracking_customerId_idx" ON "daily_water_tracking"("customerId")',
      'CREATE INDEX IF NOT EXISTS "daily_water_tracking_date_idx" ON "daily_water_tracking"("date")'
    ];
    
    for (const index of indexes) {
      await prisma.$executeRawUnsafe(index);
    }
    
    console.log('✅ Indexes created!');
    console.log('\n✅ All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTables()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });


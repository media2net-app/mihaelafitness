require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMealCompletionsTable() {
  try {
    console.log('🔍 Creating daily_meal_completions table...');
    
    // Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "daily_meal_completions" (
        "id" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "mealType" TEXT NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "daily_meal_completions_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "daily_meal_completions_customerId_date_mealType_key" UNIQUE ("customerId", "date", "mealType")
      )
    `);

    // Add foreign key
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'daily_meal_completions_customerId_fkey'
        ) THEN
          ALTER TABLE "daily_meal_completions" 
          ADD CONSTRAINT "daily_meal_completions_customerId_fkey" 
          FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    // Create index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "daily_meal_completions_customerId_date_idx" 
      ON "daily_meal_completions"("customerId", "date")
    `);

    console.log('✅ Table created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMealCompletionsTable();


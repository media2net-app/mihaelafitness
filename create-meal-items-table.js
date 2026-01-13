require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMealItemsTable() {
  try {
    // Create the daily_meal_items table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS daily_meal_items (
        id TEXT PRIMARY KEY,
        "mealCompletionId" TEXT NOT NULL,
        "itemText" TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT daily_meal_items_mealCompletionId_fkey 
          FOREIGN KEY ("mealCompletionId") 
          REFERENCES daily_meal_completions(id) 
          ON DELETE CASCADE
      );
    `);

    // Create index for faster lookups
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_daily_meal_items_meal_completion 
      ON daily_meal_items("mealCompletionId");
    `);

    console.log('✅ Daily meal items table created successfully!');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMealItemsTable();


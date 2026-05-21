/**
 * Adds the "hasOwnVideo" column to the exercises table if it doesn't exist.
 * Run: node scripts/ensure-has-own-video-column.js
 */
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking for hasOwnVideo column on exercises table...');
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE exercises
      ADD COLUMN IF NOT EXISTS "hasOwnVideo" BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('Done. Column "hasOwnVideo" exists (or was just added).');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

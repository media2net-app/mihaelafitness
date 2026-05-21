/**
 * Adds workout_exercises.section if missing (Prisma schema field).
 * Uses NODE_TLS_REJECT_UNAUTHORIZED=0 when needed (some corporate / proxy TLS setups).
 */
import 'dotenv/config';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const client = new pg.Client({
  connectionString: url,
  connectionTimeoutMillis: 30000,
});

try {
  await client.connect();
  await client.query(
    'ALTER TABLE "workout_exercises" ADD COLUMN IF NOT EXISTS "section" TEXT'
  );
  console.log('Column workout_exercises.section is present.');
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}

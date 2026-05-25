/**
 * Ensures admin_alert_dismissals table for "Solved" admin top-bar tasks.
 * Run: node scripts/ensure-admin-alert-dismissals.js
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
    CREATE TABLE IF NOT EXISTS admin_alert_dismissals (
      id TEXT PRIMARY KEY,
      "alertType" TEXT NOT NULL,
      "targetId" TEXT NOT NULL,
      "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT admin_alert_dismissals_alert_type_target_id_key UNIQUE ("alertType", "targetId")
    );
  `);
  await exec(`
    CREATE INDEX IF NOT EXISTS admin_alert_dismissals_alertType_idx
    ON admin_alert_dismissals ("alertType");
  `);
  console.log('admin_alert_dismissals table ready');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

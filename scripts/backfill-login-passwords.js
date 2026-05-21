/**
 * Saves known plaintext passwords on users (admin user table).
 * Run: node scripts/backfill-login-passwords.js
 */
if (process.env.DOTENV_CONFIG_PATH) {
  require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH, override: true });
} else {
  require('dotenv').config();
  require('dotenv').config({ path: '.env.local' });
}

const { PrismaClient } = require('@prisma/client');

const KNOWN = {
  'info@mihaelafitness.com': 'Miki210591',
  'chiel@media2net.nl': 'W4t3rk0k3r^',
  'demo-online@mihaelafitness.com': 'DemoOnline2025',
  'demo-klant@mihaelafitness.com': 'demo123',
  'lazarescu.denisa@mihaelafitness.com': 'Lazarescu2025',
};

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS login_password TEXT;`,
  );

  let updated = 0;
  for (const [email, loginPassword] of Object.entries(KNOWN)) {
    const res = await prisma.user.updateMany({
      where: { email: { equals: email, mode: 'insensitive' } },
      data: { loginPassword },
    });
    if (res.count > 0) {
      console.log(`✓ ${email}`);
      updated += res.count;
    }
  }
  console.log(`Done. Updated ${updated} user(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * Creates user Lazarescu Denisa with password and Training-Only plan.
 * Run: node scripts/setup-lazarescu-denisa.js
 * For PRODUCTION: set DATABASE_URL to production DB first.
 */
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL = 'lazarescu.denisa@mihaelafitness.com';
const NAME = 'Lazarescu Denisa';
const PASSWORD = 'Lazarescu2025';

async function main() {
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      name: NAME,
      password: hashedPassword,
      loginPassword: PASSWORD,
      plan: 'Training-Only',
      status: 'active',
      trainingFrequency: 3,
    },
    create: {
      email: EMAIL,
      name: NAME,
      password: hashedPassword,
      loginPassword: PASSWORD,
      plan: 'Training-Only',
      status: 'active',
      trainingFrequency: 3,
    },
  });
  console.log('User ready. Login:', EMAIL, '/', PASSWORD);
  prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });

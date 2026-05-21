/**
 * Creates user "Lazarescu Denisa" in the database.
 * Run from project root: node scripts/add-lazarescu-denisa-user.js
 */
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL = 'lazarescu.denisa@mihaelafitness.com';
const NAME = 'Lazarescu Denisa';

async function main() {
  console.log('Creating user:', NAME, '...\n');

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {},
    create: {
      email: EMAIL,
      name: NAME,
      phone: null,
      status: 'active',
      plan: 'Premium',
      trainingFrequency: 3,
      rating: null,
    },
  });

  console.log('User created:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Name:', user.name);
  console.log('   Plan:', user.plan);
  console.log('   Status:', user.status);
  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

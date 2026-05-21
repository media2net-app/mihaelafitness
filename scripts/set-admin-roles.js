/**
 * Set role=admin for known admin accounts; all others client.
 * Run: node scripts/set-admin-roles.js
 */
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ADMIN_EMAILS = ['info@mihaelafitness.com', 'chiel@media2net.nl'];

async function main() {
  for (const email of ADMIN_EMAILS) {
    const user = await prisma.user.updateMany({
      where: { email },
      data: { role: 'admin' },
    });
    console.log(`admin: ${email} → updated ${user.count} row(s)`);
  }

  const clients = await prisma.user.updateMany({
    where: { email: { notIn: ADMIN_EMAILS } },
    data: { role: 'client' },
  });
  console.log(`client: set role on ${clients.count} other user(s)`);

  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { email: true, name: true },
  });
  console.log('\nAdmin accounts:', admins.length);
  admins.forEach((u) => console.log(' -', u.email, u.name));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

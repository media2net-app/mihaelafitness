/**
 * Creates "Group 4" and adds members: Gabriela Ene, Stan Elena Michele.
 * Run from project root: node scripts/add-group-4.js
 */
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GROUP_NAME = 'Group 4';
const MEMBER_NAMES = ['Gabriela Ene', 'Stan Elena Michele'];

async function findUserByName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { equals: trimmed } },
        { name: { equals: lower } },
        { name: { contains: trimmed, mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true }
  });
  return users.length > 0 ? users[0] : null;
}

async function main() {
  const customerIds = [];
  const customerNames = [];

  for (const fullName of MEMBER_NAMES) {
    const user = await findUserByName(fullName);
    if (!user) {
      console.error(`User not found: "${fullName}". Add this client in the admin first, then add them to the group via the Groups page.`);
      process.exit(1);
    }
    customerIds.push(user.id);
    customerNames.push(user.name);
    console.log(`Found: ${user.name} (${user.id})`);
  }

  const existing = await prisma.pricingCalculation.findFirst({
    where: { service: `${GROUP_NAME} Group Training` }
  });
  if (existing) {
    console.log(`Group "${GROUP_NAME}" already exists (id: ${existing.id}). Updating members.`);
    await prisma.pricingCalculation.update({
      where: { id: existing.id },
      data: {
        customerId: customerIds.join(','),
        customerName: customerNames.join(',')
      }
    });
    console.log(`Group 4 updated with: ${customerNames.join(', ')}`);
    return;
  }

  const group = await prisma.pricingCalculation.create({
    data: {
      service: `${GROUP_NAME} Group Training`,
      customerId: customerIds.join(','),
      customerName: customerNames.join(','),
      duration: 0,
      frequency: 0,
      finalPrice: 0,
      discount: 0,
      vat: 0,
      includeNutritionPlan: false,
      nutritionPlanCount: 0
    }
  });

  console.log(`Created ${GROUP_NAME} (id: ${group.id}) with members: ${customerNames.join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

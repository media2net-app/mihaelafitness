const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Checking Prisma client...');
console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.includes('$')));
console.log('Has nutritionCalculationV2:', !!prisma.nutritionCalculationV2);
prisma.$disconnect();

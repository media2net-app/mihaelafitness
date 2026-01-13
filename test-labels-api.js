// Test if labels are correctly returned from Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLabels() {
  try {
    console.log('Testing Prisma labels...\n');
    
    const recipe = await prisma.recipe.findFirst({
      where: { name: { contains: 'Breakfast Egg Wrap' } },
      select: { id: true, name: true, labels: true }
    });
    
    console.log('Sample recipe:');
    console.log('  Name:', recipe?.name);
    console.log('  Labels (raw):', recipe?.labels);
    console.log('  Labels type:', typeof recipe?.labels);
    console.log('  Is array:', Array.isArray(recipe?.labels));
    console.log('  Length:', recipe?.labels?.length);
    
    const allRecipes = await prisma.recipe.findMany({
      select: { name: true, labels: true },
      take: 10
    });
    
    const withLabels = allRecipes.filter(r => r.labels && r.labels.length > 0);
    console.log(`\nRecipes with labels (first 10): ${withLabels.length}/10`);
    
    if (withLabels.length > 0) {
      console.log('\nSample recipes with labels:');
      withLabels.slice(0, 5).forEach(r => {
        console.log(`  - ${r.name}: ${JSON.stringify(r.labels)}`);
      });
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

testLabels();







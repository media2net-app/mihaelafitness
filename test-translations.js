require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTranslations() {
  try {
    console.log('🔍 Checking for Romanian translations...\n');
    
    // Get a few sample ingredients to check
    const ingredients = await prisma.ingredient.findMany({
      where: {
        OR: [
          { name: 'Banana' },
          { name: 'Carrot' },
          { name: 'Chicken Breast' },
          { name: 'Apple' },
          { name: 'Tomato' }
        ]
      },
      select: {
        id: true,
        name: true,
        nameRo: true
      }
    });
    
    console.log('Found ingredients:');
    ingredients.forEach(ing => {
      console.log(`  ${ing.name} (${ing.id})`);
      console.log(`    RO: ${ing.nameRo || 'NOT TRANSLATED'}\n`);
    });
    
    // Count translated vs not translated
    const totalActive = await prisma.ingredient.count({
      where: { isActive: true }
    });
    
    const translated = await prisma.ingredient.count({
      where: { 
        isActive: true,
        nameRo: { not: null }
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total active ingredients: ${totalActive}`);
    console.log(`   Translated to Romanian: ${translated}`);
    console.log(`   Not translated: ${totalActive - translated}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTranslations();


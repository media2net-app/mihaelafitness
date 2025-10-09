const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTranslations() {
  try {
    // Count total ingredients
    const total = await prisma.ingredient.count();
    console.log('📊 Total ingredients:', total);
    
    // Count ingredients with Romanian translations
    const withTranslations = await prisma.ingredient.count({
      where: {
        nameRo: {
          not: null
        }
      }
    });
    console.log('✅ Ingredients with Romanian translations:', withTranslations);
    
    // Show first 15 examples
    const examples = await prisma.ingredient.findMany({
      where: {
        nameRo: {
          not: null
        }
      },
      take: 15,
      select: {
        name: true,
        nameRo: true
      }
    });
    
    console.log('\n📝 Examples:');
    examples.forEach(ing => {
      console.log(`  "${ing.name}" -> "${ing.nameRo}"`);
    });
    
    // Check specific ingredients that user mentioned
    const specificChecks = ['Egg', 'Banana', 'Basmati Rice', 'Cucumber', 'Carrot'];
    console.log('\n🔍 Checking specific ingredients:');
    for (const name of specificChecks) {
      const ing = await prisma.ingredient.findFirst({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        },
        select: {
          name: true,
          nameRo: true
        }
      });
      if (ing) {
        console.log(`  "${ing.name}" -> "${ing.nameRo || 'NO TRANSLATION'}"`);
      } else {
        console.log(`  "${name}" -> NOT FOUND IN DATABASE`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTranslations();


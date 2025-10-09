const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSpecificIngredients() {
  try {
    // Check the ingredients the user mentioned
    const ingredients = [
      'Egg',
      '1 Egg', 
      'Cucumber',
      '1 Cucumber',
      'Ground Turkey',
      'Turkey',
      'Apple',
      '1 Apple',
      'Carrot',
      '1 Carrot',
      'Banana',
      '1 Banana'
    ];
    
    console.log('🔍 Checking specific ingredients mentioned by user:\n');
    
    for (const name of ingredients) {
      const ing = await prisma.ingredient.findFirst({
        where: {
          name: name
        },
        select: {
          name: true,
          nameRo: true
        }
      });
      
      if (ing) {
        if (ing.nameRo) {
          console.log(`✅ "${ing.name}" -> "${ing.nameRo}"`);
        } else {
          console.log(`⚠️  "${ing.name}" -> NO TRANSLATION`);
        }
      } else {
        console.log(`❌ "${name}" -> NOT IN DATABASE`);
      }
    }
    
    // Also check what's actually in the plan
    console.log('\n\n🔍 Checking what ingredients are actually in the nutrition plan:\n');
    const planId = 'cmgh1c6jq006j89gxlq1h2eo8';
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id: planId }
    });
    
    if (plan && plan.weekMenu) {
      const ingredientNames = new Set();
      const weekMenu = plan.weekMenu;
      
      Object.entries(weekMenu).forEach(([dayKey, day]) => {
        Object.entries(day || {}).forEach(([mealKey, meal]) => {
          if (typeof meal === 'string' && meal.trim()) {
            const ingredientItems = meal.split(',');
            ingredientItems.forEach((item) => {
              const pipeMatch = item.match(/\|(.+)$/);
              if (pipeMatch && pipeMatch[1]) {
                const ingredientName = pipeMatch[1].trim();
                ingredientNames.add(ingredientName);
              }
            });
          }
        });
      });
      
      console.log(`Found ${ingredientNames.size} unique ingredients in plan`);
      const sortedNames = Array.from(ingredientNames).sort();
      
      console.log('\nChecking which ones have translations:\n');
      for (const name of sortedNames) {
        const ing = await prisma.ingredient.findFirst({
          where: { name: name },
          select: { name: true, nameRo: true }
        });
        
        if (ing) {
          if (ing.nameRo) {
            console.log(`✅ "${ing.name}" -> "${ing.nameRo}"`);
          } else {
            console.log(`⚠️  "${ing.name}" -> NO TRANSLATION IN DB`);
          }
        } else {
          console.log(`❌ "${name}" -> NOT FOUND IN DATABASE AT ALL`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificIngredients();


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTranslationLogic() {
  try {
    // Get a nutrition plan
    const planId = 'cmgh1c6jq006j89gxlq1h2eo8'; // Andreea Popescu's nutrition plan
    
    console.log('🔍 Fetching nutrition plan:', planId);
    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { id: planId }
    });
    
    if (!nutritionPlan) {
      console.log('❌ Plan not found!');
      return;
    }
    
    console.log('✅ Plan found:', nutritionPlan.name);
    console.log('📋 WeekMenu structure:', nutritionPlan.weekMenu ? 'EXISTS' : 'MISSING');
    
    // Extract ingredient names (same logic as API route)
    const ingredientNames = new Set();
    console.log('\n🔍 [Translation Debug] Starting to extract ingredient names from weekMenu');
    
    if (nutritionPlan.weekMenu && typeof nutritionPlan.weekMenu === 'object') {
      const weekMenu = nutritionPlan.weekMenu;
      console.log('📋 [Translation Debug] WeekMenu keys:', Object.keys(weekMenu));
      
      Object.entries(weekMenu).forEach(([dayKey, day]) => {
        console.log(`\n📅 [Translation Debug] Processing day: ${dayKey}`);
        Object.entries(day || {}).forEach(([mealKey, meal]) => {
          // Meals are stored as strings in format: "100 id|Name, 200 id|Name, ..."
          if (typeof meal === 'string' && meal.trim()) {
            console.log(`  🍽️ [Translation Debug] Processing meal: ${mealKey}`);
            // Split by comma to get individual ingredients
            const ingredientItems = meal.split(',');
            console.log(`    Split into ${ingredientItems.length} items`);
            
            ingredientItems.forEach((item, idx) => {
              // Format: "100 id|Ingredient Name"
              // Extract the name after the pipe
              const pipeMatch = item.match(/\|(.+)$/);
              if (pipeMatch && pipeMatch[1]) {
                const ingredientName = pipeMatch[1].trim();
                ingredientNames.add(ingredientName);
                console.log(`    ✅ Item ${idx}: Extracted "${ingredientName}"`);
              } else {
                console.log(`    ❌ Item ${idx}: Failed to extract from "${item}"`);
              }
            });
          }
        });
      });
    }
    
    console.log(`\n📊 [Translation Debug] Total unique ingredients extracted: ${ingredientNames.size}`);
    console.log('🔤 [Translation Debug] Ingredient names:', Array.from(ingredientNames).slice(0, 20));
    
    // Fetch translations
    console.log('\n🔍 [Translation Debug] Querying database for ingredients...');
    const ingredients = await prisma.ingredient.findMany({
      where: {
        name: {
          in: Array.from(ingredientNames)
        }
      },
      select: {
        name: true,
        nameRo: true
      }
    });
    
    console.log(`\n📊 [Translation Debug] Found ${ingredients.length} ingredients in database`);
    ingredients.forEach(ing => {
      console.log(`  🔤 [Translation Debug] DB: "${ing.name}" -> "${ing.nameRo || 'NO TRANSLATION'}"`);
    });
    
    // Create translation map
    const translationMap = {};
    ingredients.forEach(ing => {
      if (ing.nameRo) {
        translationMap[ing.name] = ing.nameRo;
      }
    });
    
    console.log('\n📦 [Translation Debug] Final translation map:');
    console.log('   Count:', Object.keys(translationMap).length);
    Object.entries(translationMap).slice(0, 15).forEach(([en, ro]) => {
      console.log(`   "${en}" -> "${ro}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTranslationLogic();


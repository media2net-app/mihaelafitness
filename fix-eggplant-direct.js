// Script to directly fix "1 Eggplant" to "1 Egg" in nutrition plan
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEggplantDirect() {
  try {
    const planId = 'cmhjjot0e000edyk0plvlz2a5';
    
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id: planId }
    });
    
    if (!plan) {
      console.log('Plan not found');
      return;
    }
    
    // Get ingredient IDs
    const egg = await prisma.ingredient.findFirst({
      where: { name: '1 Egg' }
    });
    
    const eggplant = await prisma.ingredient.findFirst({
      where: { name: '1 Eggplant' }
    });
    
    if (!egg || !eggplant) {
      console.log('Ingredients not found:', { egg: !!egg, eggplant: !!eggplant });
      return;
    }
    
    console.log(`Egg ID: ${egg.id}`);
    console.log(`Eggplant ID: ${eggplant.id}`);
    
    const weekMenu = JSON.parse(JSON.stringify(plan.weekMenu || {}));
    let updated = false;
    
    // Search all days and meals - handle both string and object formats
    Object.keys(weekMenu).forEach(day => {
      const dayMenu = weekMenu[day] || {};
      Object.keys(dayMenu).forEach(meal => {
        let mealData = dayMenu[meal];
        let needsUpdate = false;
        let newMealData = mealData;
        
        if (typeof mealData === 'string') {
          // String format: "100 id|Name, 200 id|Name" or recipe format
          if (mealData.includes(eggplant.id) || mealData.includes('1 Eggplant') || mealData.includes('Vânătă') || mealData.includes('Vunata')) {
            console.log(`\nFound in ${day} - ${meal} (string):`);
            console.log(`Before: ${mealData}`);
            
            // Replace all occurrences
            newMealData = mealData.replace(new RegExp(eggplant.id, 'g'), egg.id);
            newMealData = newMealData.replace(/1 Eggplant/gi, '1 Egg');
            newMealData = newMealData.replace(/Vânătă/gi, egg.nameRo || 'Ou');
            newMealData = newMealData.replace(/Vunata/gi, egg.nameRo || 'Ou');
            
            console.log(`After:  ${newMealData}`);
            needsUpdate = true;
          }
        } else if (mealData && typeof mealData === 'object') {
          // Object format: { ingredients: "...", cookingInstructions: "..." }
          if (mealData.ingredients) {
            const ingredients = mealData.ingredients;
            if (ingredients.includes(eggplant.id) || ingredients.includes('1 Eggplant') || ingredients.includes('Vânătă') || ingredients.includes('Vunata')) {
              console.log(`\nFound in ${day} - ${meal} (object):`);
              console.log(`Before: ${ingredients}`);
              
              let newIngredients = ingredients.replace(new RegExp(eggplant.id, 'g'), egg.id);
              newIngredients = newIngredients.replace(/1 Eggplant/gi, '1 Egg');
              newIngredients = newIngredients.replace(/Vânătă/gi, egg.nameRo || 'Ou');
              newIngredients = newIngredients.replace(/Vunata/gi, egg.nameRo || 'Ou');
              
              console.log(`After:  ${newIngredients}`);
              
              newMealData = {
                ...mealData,
                ingredients: newIngredients
              };
              needsUpdate = true;
            }
          }
        }
        
        if (needsUpdate && newMealData !== mealData) {
          weekMenu[day][meal] = newMealData;
          updated = true;
        }
      });
    });
    
    if (updated) {
      await prisma.nutritionPlan.update({
        where: { id: planId },
        data: { weekMenu }
      });
      console.log('\n✅ Plan updated successfully!');
      console.log('Please refresh the page to see the changes.');
    } else {
      console.log('\n⚠️  No changes needed - ingredient not found in plan');
      console.log('\nPlan structure:');
      console.log('Days:', Object.keys(weekMenu));
      Object.keys(weekMenu).slice(0, 1).forEach(day => {
        console.log(`\n${day}:`);
        const dayMenu = weekMenu[day] || {};
        Object.keys(dayMenu).forEach(meal => {
          const mealData = dayMenu[meal];
          if (typeof mealData === 'string') {
            console.log(`  ${meal}: ${mealData.substring(0, 100)}${mealData.length > 100 ? '...' : ''}`);
          } else if (mealData && typeof mealData === 'object') {
            console.log(`  ${meal}: ${JSON.stringify(mealData).substring(0, 100)}...`);
          }
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixEggplantDirect();







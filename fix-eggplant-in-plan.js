// Script to find and fix Eggplant -> Egg in nutrition plan
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEggplantInPlan() {
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
    
    console.log(`Searching for Eggplant ID: ${eggplant.id}`);
    console.log(`Will replace with Egg ID: ${egg.id}`);
    
    const weekMenu = plan.weekMenu || {};
    let updated = false;
    
    // Search all days and meals
    Object.keys(weekMenu).forEach(day => {
      const dayMenu = weekMenu[day] || {};
      Object.keys(dayMenu).forEach(meal => {
        const mealData = dayMenu[meal];
        
        if (typeof mealData === 'string') {
          // Check if it contains eggplant ID or name
          if (mealData.includes(eggplant.id) || mealData.toLowerCase().includes('vanata') || mealData.includes('Vânătă')) {
            console.log(`\nFound in ${day} - ${meal}:`);
            console.log(`Before: ${mealData.substring(0, 200)}`);
            
            // Replace eggplant ID with egg ID
            let newMeal = mealData.replace(new RegExp(eggplant.id, 'g'), egg.id);
            // Replace eggplant Romanian name with egg Romanian name
            newMeal = newMeal.replace(new RegExp(eggplant.nameRo || 'Vânătă', 'gi'), egg.nameRo || 'Ou');
            newMeal = newMeal.replace(/Vânătă/gi, egg.nameRo || 'Ou');
            newMeal = newMeal.replace(/Vunata/gi, egg.nameRo || 'Ou');
            // Replace English names
            newMeal = newMeal.replace(new RegExp(eggplant.name || '1 Eggplant', 'gi'), egg.name || '1 Egg');
            
            console.log(`After:  ${newMeal.substring(0, 200)}`);
            
            if (newMeal !== mealData) {
              weekMenu[day][meal] = newMeal;
              updated = true;
            }
          }
        } else if (mealData && typeof mealData === 'object' && mealData.ingredients) {
          // Object format
          const ingredients = mealData.ingredients || '';
          if (ingredients.includes(eggplant.id) || ingredients.toLowerCase().includes('vanata') || ingredients.includes('Vânătă')) {
            console.log(`\nFound in ${day} - ${meal} (object format):`);
            console.log(`Before: ${ingredients.substring(0, 200)}`);
            
            let newIngredients = ingredients.replace(new RegExp(eggplant.id, 'g'), egg.id);
            newIngredients = newIngredients.replace(new RegExp(eggplant.nameRo || 'Vânătă', 'gi'), egg.nameRo || 'Ou');
            newIngredients = newIngredients.replace(/Vânătă/gi, egg.nameRo || 'Ou');
            newIngredients = newIngredients.replace(/Vunata/gi, egg.nameRo || 'Ou');
            newIngredients = newIngredients.replace(new RegExp(eggplant.name || '1 Eggplant', 'gi'), egg.name || '1 Egg');
            
            console.log(`After:  ${newIngredients.substring(0, 200)}`);
            
            if (newIngredients !== ingredients) {
              weekMenu[day][meal] = {
                ...mealData,
                ingredients: newIngredients
              };
              updated = true;
            }
          }
        }
      });
    });
    
    if (updated) {
      await prisma.nutritionPlan.update({
        where: { id: planId },
        data: { weekMenu }
      });
      console.log('\n✅ Plan updated successfully!');
    } else {
      console.log('\n⚠️  No changes needed - ingredient not found in plan');
      console.log('Checking if plan uses JSON format...');
      
      // Try JSON format
      Object.keys(weekMenu).forEach(day => {
        const dayMenu = weekMenu[day] || {};
        Object.keys(dayMenu).forEach(meal => {
          const mealData = dayMenu[meal];
          if (typeof mealData === 'string' && mealData.startsWith('[')) {
            try {
              const parsed = JSON.parse(mealData);
              if (Array.isArray(parsed)) {
                parsed.forEach((ing, idx) => {
                  if (ing.id === eggplant.id || ing.name === '1 Eggplant' || ing.name === 'Vânătă') {
                    console.log(`Found in ${day} - ${meal} as JSON array:`);
                    console.log(`  Ingredient ${idx}:`, ing);
                  }
                });
              }
            } catch (e) {
              // Not JSON
            }
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

fixEggplantInPlan();







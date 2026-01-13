// Script to fix "Vânătă" (Eggplant) to "Ou" (Egg) in nutrition plan
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEggplantToEgg() {
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
    
    console.log(`Replacing "${eggplant.name}" (${eggplant.nameRo}) with "${egg.name}" (${egg.nameRo})`);
    console.log(`Egg ID: ${egg.id}`);
    console.log(`Eggplant ID: ${eggplant.id}`);
    
    const weekMenu = plan.weekMenu || {};
    let updated = false;
    
    // Replace in all days and meals
    Object.keys(weekMenu).forEach(day => {
      const dayMenu = weekMenu[day] || {};
      Object.keys(dayMenu).forEach(meal => {
        const mealData = dayMenu[meal];
        
        if (typeof mealData === 'string') {
          // String format: replace eggplant ID with egg ID and name
          if (mealData.includes(eggplant.id) || mealData.includes(eggplant.nameRo) || mealData.includes('Vânătă') || mealData.includes('Vunata')) {
            // Replace eggplant ID with egg ID
            let newMeal = mealData.replace(new RegExp(eggplant.id, 'g'), egg.id);
            // Replace eggplant name with egg name
            newMeal = newMeal.replace(new RegExp(eggplant.nameRo || 'Vânătă', 'gi'), egg.nameRo || 'Ou');
            newMeal = newMeal.replace(new RegExp(eggplant.name || '1 Eggplant', 'gi'), egg.name || '1 Egg');
            newMeal = newMeal.replace(/Vânătă/gi, egg.nameRo || 'Ou');
            newMeal = newMeal.replace(/Vunata/gi, egg.nameRo || 'Ou');
            
            if (newMeal !== mealData) {
              weekMenu[day][meal] = newMeal;
              updated = true;
              console.log(`Updated ${day} - ${meal}:`);
              console.log(`  Old: ${mealData.substring(0, 150)}`);
              console.log(`  New: ${newMeal.substring(0, 150)}`);
            }
          }
        } else if (mealData && typeof mealData === 'object' && mealData.ingredients) {
          // Object format with ingredients string
          if (mealData.ingredients.includes(eggplant.id) || mealData.ingredients.includes(eggplant.nameRo) || mealData.ingredients.includes('Vânătă') || mealData.ingredients.includes('Vunata')) {
            let newIngredients = mealData.ingredients.replace(new RegExp(eggplant.id, 'g'), egg.id);
            newIngredients = newIngredients.replace(new RegExp(eggplant.nameRo || 'Vânătă', 'gi'), egg.nameRo || 'Ou');
            newIngredients = newIngredients.replace(new RegExp(eggplant.name || '1 Eggplant', 'gi'), egg.name || '1 Egg');
            newIngredients = newIngredients.replace(/Vânătă/gi, egg.nameRo || 'Ou');
            newIngredients = newIngredients.replace(/Vunata/gi, egg.nameRo || 'Ou');
            
            if (newIngredients !== mealData.ingredients) {
              weekMenu[day][meal] = {
                ...mealData,
                ingredients: newIngredients
              };
              updated = true;
              console.log(`Updated ${day} - ${meal} (object format):`);
              console.log(`  Old: ${mealData.ingredients.substring(0, 150)}`);
              console.log(`  New: ${newIngredients.substring(0, 150)}`);
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
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixEggplantToEgg();







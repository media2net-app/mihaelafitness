// Script to fix "X g Rice cake" to "X piece Rice cake" in nutrition plans
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRiceCakesToPieces() {
  try {
    const riceCakeId = 'cmgh5qg91006s89gxiy8sei1d'; // Rice cake ID
    
    console.log('Finding all nutrition plans with Rice cake...\n');
    
    const plans = await prisma.nutritionPlan.findMany({
      select: { id: true, name: true, weekMenu: true }
    });
    
    let totalFixed = 0;
    let plansUpdated = 0;
    
    for (const plan of plans) {
      const weekMenu = JSON.parse(JSON.stringify(plan.weekMenu || {}));
      let planChanged = false;
      
      Object.keys(weekMenu).forEach(day => {
        const dayMenu = weekMenu[day] || {};
        Object.keys(dayMenu).forEach(meal => {
          let mealData = dayMenu[meal];
          let needsUpdate = false;
          let newMealData = mealData;
          
          if (typeof mealData === 'string') {
            // Check for "X g" followed by Rice cake ID
            // Pattern: "2 g cmgh5qg91006s89gxiy8sei1d|Rice cake" or "3 g Rice cake"
            const riceCakePattern = new RegExp(`(\\d+)\\s*g\\s+${riceCakeId}\\|Rice\\s+cake`, 'gi');
            const match = mealData.match(riceCakePattern);
            
            if (match) {
              // Replace "X g" with "X" (remove the 'g' unit for piece-based items)
              newMealData = mealData.replace(riceCakePattern, (m, amount) => {
                return `${amount} ${riceCakeId}|Rice cake`;
              });
              needsUpdate = true;
              console.log(`  ${plan.name} - ${day} ${meal}: ${mealData.substring(0, 100)} -> ${newMealData.substring(0, 100)}`);
            }
            
            // Also check for "X g Rice cake" without ID (if format is different)
            const riceCakePattern2 = new RegExp(`(\\d+)\\s*g\\s+([^,]*rice\\s+cake[^,]*|${riceCakeId})`, 'gi');
            const match2 = mealData.match(riceCakePattern2);
            if (match2 && !match) {
              newMealData = mealData.replace(riceCakePattern2, (m, amount, rest) => {
                return `${amount} ${rest}`;
              });
              needsUpdate = true;
              console.log(`  ${plan.name} - ${day} ${meal}: ${mealData.substring(0, 100)} -> ${newMealData.substring(0, 100)}`);
            }
          } else if (mealData && typeof mealData === 'object' && mealData.ingredients) {
            // Object format
            const ingredients = mealData.ingredients || '';
            const riceCakePattern = new RegExp(`(\\d+)\\s*g\\s+${riceCakeId}\\|Rice\\s+cake`, 'gi');
            const match = ingredients.match(riceCakePattern);
            
            if (match) {
              let newIngredients = ingredients.replace(riceCakePattern, (m, amount) => {
                return `${amount} ${riceCakeId}|Rice cake`;
              });
              
              newMealData = {
                ...mealData,
                ingredients: newIngredients
              };
              needsUpdate = true;
              console.log(`  ${plan.name} - ${day} ${meal} (object): ${ingredients.substring(0, 100)} -> ${newIngredients.substring(0, 100)}`);
            }
          }
          
          if (needsUpdate && newMealData !== mealData) {
            weekMenu[day][meal] = newMealData;
            planChanged = true;
            totalFixed++;
          }
        });
      });
      
      if (planChanged) {
        await prisma.nutritionPlan.update({
          where: { id: plan.id },
          data: { weekMenu }
        });
        plansUpdated++;
      }
    }
    
    console.log(`\n✅ Fixed ${totalFixed} rice cake entries in ${plansUpdated} plans`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixRiceCakesToPieces();


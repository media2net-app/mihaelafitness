// Script to recalculate macros for all recipes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateMacros(ingredient, quantity, unit) {
  if (!ingredient) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  let multiplier = 1;
  const per = (ingredient.per || '100g').toLowerCase();
  
  // Handle "1 scoop (15g)" format
  if (per.includes('scoop')) {
    const scoopMatch = per.match(/(\d+(?:\.\d+)?)\s*g/);
    if (scoopMatch) {
      const scoopGrams = parseFloat(scoopMatch[1]);
      if (unit === 'g' || unit === 'gram' || unit === 'grams') {
        multiplier = quantity / scoopGrams;
      } else if (unit === 'scoop' || unit === 'scoops') {
        multiplier = quantity;
      } else {
        multiplier = quantity / scoopGrams;
      }
    }
  }
  // Handle "1" format (for pieces like eggs)
  else if (per === '1' || per.match(/^1\s*(piece|unit|egg)$/)) {
    multiplier = quantity;
  }
  // Handle "100g" or "100ml" format
  else {
    const perMatch = per.match(/(\d+(?:\.\d+)?)/);
    const baseAmount = perMatch ? parseFloat(perMatch[1]) : 100;
    if (unit === 'g' || unit === 'ml' || unit === 'gram' || unit === 'grams') {
      multiplier = quantity / baseAmount;
    } else if (unit === 'piece' || unit === 'pieces') {
      // Estimate piece weight (e.g., 1 egg ≈ 50g, 1 wrap ≈ 60g)
      const pieceWeight = 50; // Default estimate
      multiplier = (quantity * pieceWeight) / baseAmount;
    } else if (unit === 'tsp') {
      // 1 tsp ≈ 5g
      const tspInGrams = quantity * 5;
      multiplier = tspInGrams / baseAmount;
    } else if (unit === 'tbsp') {
      // 1 tbsp ≈ 15g
      const tbspInGrams = quantity * 15;
      multiplier = tbspInGrams / baseAmount;
    }
  }
  
  return {
    calories: Math.round(ingredient.calories * multiplier),
    protein: Math.round(ingredient.protein * multiplier * 10) / 10,
    carbs: Math.round(ingredient.carbs * multiplier * 10) / 10,
    fat: Math.round(ingredient.fat * multiplier * 10) / 10,
  };
}

async function recalculateAllMacros() {
  try {
    console.log('Loading all recipes and ingredients...\n');
    
    const recipes = await prisma.recipe.findMany({
      include: { ingredients: true },
      orderBy: { name: 'asc' }
    });
    
    const allIngredients = await prisma.ingredient.findMany();
    const ingredientMap = new Map();
    allIngredients.forEach(ing => {
      ingredientMap.set(ing.id, ing);
    });
    
    console.log(`Found ${recipes.length} recipes`);
    console.log(`Found ${allIngredients.length} ingredients\n`);
    
    let totalUpdated = 0;
    let recipesWithChanges = 0;
    
    for (const recipe of recipes) {
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      let hasUnmatched = false;
      
      for (const ing of recipe.ingredients) {
        if (!ing.exists || !ing.apiMatch) {
          hasUnmatched = true;
          continue;
        }
        
        try {
          const apiMatch = JSON.parse(ing.apiMatch);
          const ingredient = ingredientMap.get(apiMatch.id);
          
          if (!ingredient) {
            hasUnmatched = true;
            continue;
          }
          
          const macros = calculateMacros(ingredient, ing.quantity, ing.unit);
          totalCalories += macros.calories;
          totalProtein += macros.protein;
          totalCarbs += macros.carbs;
          totalFat += macros.fat;
        } catch (error) {
          hasUnmatched = true;
        }
      }
      
      // Round totals
      const calculatedCalories = Math.round(totalCalories);
      const calculatedProtein = Math.round(totalProtein * 10) / 10;
      const calculatedCarbs = Math.round(totalCarbs * 10) / 10;
      const calculatedFat = Math.round(totalFat * 10) / 10;
      
      // Compare with stored values
      const storedCalories = recipe.totalCalories;
      const storedProtein = recipe.totalProtein;
      const storedCarbs = recipe.totalCarbs;
      const storedFat = recipe.totalFat;
      
      const caloriesDiff = Math.abs(calculatedCalories - storedCalories);
      const proteinDiff = Math.abs(calculatedProtein - storedProtein);
      const carbsDiff = Math.abs(calculatedCarbs - storedCarbs);
      const fatDiff = Math.abs(calculatedFat - storedFat);
      
      const hasDifference = caloriesDiff > 1 || proteinDiff > 0.1 || carbsDiff > 0.1 || fatDiff > 0.1;
      
      if (hasDifference || hasUnmatched) {
        if (hasDifference) {
          console.log(`📝 ${recipe.name}:`);
          console.log(`   Old: ${storedCalories} kcal, ${storedProtein}g protein, ${storedCarbs}g carbs, ${storedFat}g fat`);
          console.log(`   New: ${calculatedCalories} kcal, ${calculatedProtein}g protein, ${calculatedCarbs}g carbs, ${calculatedFat}g fat`);
        }
        
        // Update recipe macros
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            totalCalories: calculatedCalories,
            totalProtein: calculatedProtein,
            totalCarbs: calculatedCarbs,
            totalFat: calculatedFat
          }
        });
        
        totalUpdated++;
        if (hasDifference) recipesWithChanges++;
      }
    }
    
    console.log(`\n\n📊 Summary:`);
    console.log(`   Recipes checked: ${recipes.length}`);
    console.log(`   Recipes with macro changes: ${recipesWithChanges}`);
    console.log(`   Total recipes updated: ${totalUpdated}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

recalculateAllMacros();







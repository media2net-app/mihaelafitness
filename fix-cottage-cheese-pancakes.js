// Script to fix High Protein Cottage Cheese Pancakes recipe
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findIngredient(ingredientName, ingredients) {
  const cleanName = ingredientName.toLowerCase().trim();
  
  // Try exact match first
  let ingredient = ingredients.find(ing => 
    ing.name?.toLowerCase() === cleanName ||
    ing.nameRo?.toLowerCase() === cleanName
  );
  
  if (!ingredient) {
    // Try partial match
    ingredient = ingredients.find(ing => {
      const name = (ing.name || '').toLowerCase();
      const nameRo = (ing.nameRo || '').toLowerCase();
      return name.includes(cleanName) || cleanName.includes(name) ||
             nameRo.includes(cleanName) || cleanName.includes(nameRo);
    });
  }
  
  return ingredient;
}

function calculateMacros(ingredient, quantity, unit) {
  if (!ingredient) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  let multiplier = 1;
  const per = (ingredient.per || '100g').toLowerCase();
  
  // Handle "1 scoop (15g)" format
  if (per.includes('scoop')) {
    const scoopMatch = per.match(/(\d+(?:\.\d+)?)\s*g/);
    if (scoopMatch) {
      const scoopGrams = parseFloat(scoopMatch[1]);
      if (unit === 'g') {
        multiplier = quantity / scoopGrams;
      } else if (unit === 'scoop' || unit === 'scoops') {
        multiplier = quantity;
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
    if (unit === 'g' || unit === 'ml') {
      multiplier = quantity / baseAmount;
    } else if (unit === 'piece' || unit === 'pieces') {
      // Estimate piece weight (e.g., 1 egg ≈ 50g)
      multiplier = (quantity * 50) / baseAmount;
    }
  }
  
  return {
    calories: Math.round(ingredient.calories * multiplier),
    protein: Math.round(ingredient.protein * multiplier * 10) / 10,
    carbs: Math.round(ingredient.carbs * multiplier * 10) / 10,
    fat: Math.round(ingredient.fat * multiplier * 10) / 10,
  };
}

async function fixRecipe() {
  try {
    console.log('Loading recipe and ingredients...');
    
    // Find the recipe
    const recipe = await prisma.recipe.findFirst({
      where: { name: 'High Protein Cottage Cheese Pancakes' },
      include: { ingredients: true }
    });
    
    if (!recipe) {
      console.error('Recipe not found!');
      return;
    }
    
    console.log(`Found recipe: ${recipe.name}`);
    
    // Load all ingredients
    const allIngredients = await prisma.ingredient.findMany();
    
    // Find correct ingredients
    const correctEgg = allIngredients.find(ing => ing.name === '1 Egg' || (ing.name === 'Egg' && ing.per === '1'));
    const correctMango = allIngredients.find(ing => ing.name === 'Mango' || ing.name === '1 Mango');
    
    console.log('\nCorrect ingredients:');
    console.log('Egg:', correctEgg ? `${correctEgg.name} (${correctEgg.id})` : 'NOT FOUND');
    console.log('Mango:', correctMango ? `${correctMango.name} (${correctMango.id})` : 'NOT FOUND');
    
    // Recalculate macros
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    const updatedIngredients = [];
    
    for (const ing of recipe.ingredients) {
      let ingredient;
      let apiMatch;
      
      // Fix specific ingredients
      if (ing.name === 'Egg' && ing.unit === 'piece') {
        ingredient = correctEgg;
        apiMatch = correctEgg ? {
          id: correctEgg.id,
          name: correctEgg.name,
          nameRo: correctEgg.nameRo
        } : null;
      } else if (ing.name === 'Mango' && ing.unit === 'g') {
        // Use Mango (100g basis) for mango in grams, not "1 Mango" (piece basis)
        ingredient = allIngredients.find(ing => ing.name === 'Mango' && ing.per?.includes('100'));
        apiMatch = ingredient ? {
          id: ingredient.id,
          name: ingredient.name,
          nameRo: ingredient.nameRo
        } : null;
      } else if (ing.name === 'Mango Puree') {
        // Use Mango (100g basis) for mango puree, not "1 Mango" (piece basis)
        ingredient = allIngredients.find(ing => ing.name === 'Mango' && ing.per?.includes('100'));
        apiMatch = ingredient ? {
          id: ingredient.id,
          name: ingredient.name,
          nameRo: ingredient.nameRo
        } : null;
      } else {
        // Find other ingredients normally
        ingredient = await findIngredient(ing.name, allIngredients);
        if (ingredient) {
          apiMatch = {
            id: ingredient.id,
            name: ingredient.name,
            nameRo: ingredient.nameRo
          };
        }
      }
      
      if (!ingredient) {
        console.log(`⚠️  Ingredient not found: ${ing.name}`);
        updatedIngredients.push({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          exists: false,
          availableInApi: false,
          apiMatch: null
        });
        continue;
      }
      
      const macros = calculateMacros(ingredient, ing.quantity, ing.unit);
      totalCalories += macros.calories;
      totalProtein += macros.protein;
      totalCarbs += macros.carbs;
      totalFat += macros.fat;
      
      console.log(`${ing.name}: ${macros.calories} kcal, ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat`);
      
      updatedIngredients.push({
        id: ing.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        exists: true,
        availableInApi: true,
        apiMatch: JSON.stringify(apiMatch)
      });
    }
    
    console.log('\n📊 Total Macros:');
    console.log(`Calories: ${totalCalories}`);
    console.log(`Protein: ${totalProtein.toFixed(1)}g`);
    console.log(`Carbs: ${totalCarbs.toFixed(1)}g`);
    console.log(`Fat: ${totalFat.toFixed(1)}g`);
    
    // Update recipe macros
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10
      }
    });
    
    // Update ingredients with correct apiMatch
    for (const ing of recipe.ingredients) {
      let ingredient;
      let apiMatch;
      
      // Fix specific ingredients
      if (ing.name === 'Egg' && ing.unit === 'piece') {
        ingredient = correctEgg;
        apiMatch = correctEgg ? JSON.stringify({
          id: correctEgg.id,
          name: correctEgg.name,
          nameRo: correctEgg.nameRo
        }) : null;
      } else if (ing.name === 'Mango' && ing.unit === 'g') {
        ingredient = allIngredients.find(i => i.name === 'Mango' && i.per?.includes('100'));
        apiMatch = ingredient ? JSON.stringify({
          id: ingredient.id,
          name: ingredient.name,
          nameRo: ingredient.nameRo
        }) : null;
      } else if (ing.name === 'Mango Puree') {
        ingredient = allIngredients.find(i => i.name === 'Mango' && i.per?.includes('100'));
        apiMatch = ingredient ? JSON.stringify({
          id: ingredient.id,
          name: ingredient.name,
          nameRo: ingredient.nameRo
        }) : null;
      } else {
        ingredient = await findIngredient(ing.name, allIngredients);
        if (ingredient) {
          apiMatch = JSON.stringify({
            id: ingredient.id,
            name: ingredient.name,
            nameRo: ingredient.nameRo
          });
        }
      }
      
      await prisma.recipeIngredient.update({
        where: { id: ing.id },
        data: {
          exists: ingredient ? true : false,
          availableInApi: ingredient ? true : false,
          apiMatch: apiMatch
        }
      });
    }
    
    console.log('\n✅ Recipe fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing recipe:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixRecipe();


// Script to check and fix all 18 newly added recipes
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
      if (unit === 'g' || unit === 'gram' || unit === 'grams') {
        // Convert grams to scoops
        multiplier = quantity / scoopGrams;
      } else if (unit === 'scoop' || unit === 'scoops') {
        multiplier = quantity;
      } else {
        // Unknown unit, assume grams
        multiplier = quantity / scoopGrams;
      }
    } else {
      // No grams specified, assume 1 scoop = 1
      multiplier = unit === 'scoop' || unit === 'scoops' ? quantity : 1;
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

// List of new recipe names
const newRecipeNames = [
  "Low Carb Pancakes",
  "Waffles",
  "Protein Pancakes",
  "Protein Chocolate Waffles",
  "High Protein Pizza",
  "Protein Muffins",
  "Protein Tart with Plums",
  "Protein Papanases",
  "Pancakes with Banana and Cinnamon",
  "Banana Bread",
  "Protein Pancakes Classic",
  "Protein Pancakes with Frozen Fruits",
  "Protein Pancakes Berry",
  "High Protein Cottage Cheese Pancakes",
  "Vanilla Waffle",
  "Blueberry Pancakes"
];

async function checkAndFixRecipes() {
  try {
    console.log('Loading all ingredients...');
    const allIngredients = await prisma.ingredient.findMany();
    console.log(`Found ${allIngredients.length} ingredients in database\n`);

    let fixedCount = 0;
    let checkedCount = 0;

    for (const recipeName of newRecipeNames) {
      console.log(`\n📝 Checking: ${recipeName}`);
      
      const recipe = await prisma.recipe.findFirst({
        where: { name: recipeName },
        include: { ingredients: true }
      });
      
      if (!recipe) {
        console.log(`⚠️  Recipe not found: ${recipeName}`);
        continue;
      }
      
      checkedCount++;
      
      // Recalculate macros
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      const ingredientDetails = [];
      
      for (const ing of recipe.ingredients) {
        let ingredient;
        
        // Special handling for common mismatches
        if (ing.name === 'Egg' && ing.unit === 'piece') {
          ingredient = allIngredients.find(i => i.name === '1 Egg' || (i.name === 'Egg' && i.per === '1'));
        } else if (ing.name === 'Mango' && ing.unit === 'g') {
          ingredient = allIngredients.find(i => i.name === 'Mango' && i.per?.includes('100'));
        } else if (ing.name === 'Mango Puree') {
          ingredient = allIngredients.find(i => i.name === 'Mango' && i.per?.includes('100'));
        } else {
          ingredient = await findIngredient(ing.name, allIngredients);
        }
        
        if (!ingredient) {
          console.log(`  ⚠️  Ingredient not found: ${ing.name}`);
          ingredientDetails.push({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            exists: false
          });
          continue;
        }
        
        const macros = calculateMacros(ingredient, ing.quantity, ing.unit);
        totalCalories += macros.calories;
        totalProtein += macros.protein;
        totalCarbs += macros.carbs;
        totalFat += macros.fat;
        
        ingredientDetails.push({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          exists: true,
          ingredient: ingredient
        });
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
      
      if (hasDifference) {
        console.log(`  ❌ MISMATCH FOUND!`);
        console.log(`     Stored:  ${storedCalories} kcal, ${storedProtein}g protein, ${storedCarbs}g carbs, ${storedFat}g fat`);
        console.log(`     Calculated: ${calculatedCalories} kcal, ${calculatedProtein}g protein, ${calculatedCarbs}g carbs, ${calculatedFat}g fat`);
        console.log(`     Differences: ${caloriesDiff} kcal, ${proteinDiff}g protein, ${carbsDiff}g carbs, ${fatDiff}g fat`);
        
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
        
        // Update ingredient apiMatch if needed
        for (const ing of recipe.ingredients) {
          const detail = ingredientDetails.find(d => d.name === ing.name && d.quantity === ing.quantity && d.unit === ing.unit);
          
          if (detail && detail.exists && detail.ingredient) {
            const correctMatch = JSON.stringify({
              id: detail.ingredient.id,
              name: detail.ingredient.name,
              nameRo: detail.ingredient.nameRo
            });
            
            // Check if apiMatch needs updating
            const currentMatch = ing.apiMatch;
            if (currentMatch !== correctMatch) {
              await prisma.recipeIngredient.update({
                where: { id: ing.id },
                data: {
                  exists: true,
                  availableInApi: true,
                  apiMatch: correctMatch
                }
              });
            }
          }
        }
        
        console.log(`  ✅ Fixed!`);
        fixedCount++;
      } else {
        console.log(`  ✅ OK: ${calculatedCalories} kcal, ${calculatedProtein}g protein, ${calculatedCarbs}g carbs, ${calculatedFat}g fat`);
      }
    }
    
    console.log(`\n\n📊 Summary:`);
    console.log(`   Checked: ${checkedCount} recipes`);
    console.log(`   Fixed: ${fixedCount} recipes`);
    console.log(`   OK: ${checkedCount - fixedCount} recipes`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixRecipes();


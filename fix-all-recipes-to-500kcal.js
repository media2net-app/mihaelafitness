// Script to fix all recipes to exactly 500 kcal and calculate correct macros
// This will adjust ingredient quantities to reach 500 kcal, then calculate macros

async function calculateIngredientNutrition(ingredientName, quantity, unit, allIngredients) {
  let match = null;
  
  match = allIngredients.find(ing => 
    ing.name.toLowerCase() === ingredientName.toLowerCase()
  );
  
  if (!match) {
    match = allIngredients.find(ing => 
      ingredientName.toLowerCase().includes(ing.name.toLowerCase()) ||
      ing.name.toLowerCase().includes(ingredientName.toLowerCase())
    );
  }
  
  if (!match) {
    return null; // Return null if not found
  }
  
  let factor = 1;
  const per = match.per || '100g';
  
  if (unit === 'g' || unit === 'ml') {
    const perMatch = per.match(/(\d+(?:\.\d+)?)/);
    const baseAmount = perMatch ? parseFloat(perMatch[1]) : 100;
    factor = quantity / baseAmount;
  } else if (unit === 'piece' || unit === 'pieces') {
    if (per.includes('1') || per.toLowerCase().includes('piece')) {
      factor = quantity;
    } else {
      const perMatch = per.match(/(\d+(?:\.\d+)?)/);
      const basePieces = perMatch ? parseFloat(perMatch[1]) : 1;
      factor = quantity / basePieces;
    }
  } else {
    factor = quantity / 100;
  }
  
  return {
    ingredient: match,
    calories: (match.calories || 0) * factor,
    protein: (match.protein || 0) * factor,
    carbs: (match.carbs || 0) * factor,
    fat: (match.fat || 0) * factor,
    kcalPerUnit: match.calories || 0,
    per: per
  };
}

async function adjustTo500Kcal(recipe, allIngredients) {
  // First, calculate current totals
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const ingredientData = [];
  
  for (const ing of recipe.ingredients) {
    const data = await calculateIngredientNutrition(ing.name, ing.quantity, ing.unit, allIngredients);
    if (data) {
      totals.calories += data.calories;
      totals.protein += data.protein;
      totals.carbs += data.carbs;
      totals.fat += data.fat;
      
      ingredientData.push({
        ...ing,
        ...data,
        originalQuantity: ing.quantity
      });
    }
  }
  
  const currentCalories = totals.calories;
  const targetCalories = 500;
  const difference = targetCalories - currentCalories;
  
  if (Math.abs(difference) < 1) {
    // Already at 500 kcal
    return {
      ingredients: recipe.ingredients,
      totals: {
        calories: Math.round(currentCalories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10
      }
    };
  }
  
  // Need to adjust - prioritize adjusting pasta/rice/carbs, then protein sources, then vegetables
  // Sort ingredients by flexibility (carbs > protein > vegetables)
  const sortedIngredients = ingredientData.sort((a, b) => {
    const aIsCarb = ['pasta', 'rice', 'quinoa', 'couscous', 'bulgur', 'potato', 'sweet potato'].some(c => 
      a.name.toLowerCase().includes(c)
    );
    const bIsCarb = ['pasta', 'rice', 'quinoa', 'couscous', 'bulgur', 'potato', 'sweet potato'].some(c => 
      b.name.toLowerCase().includes(c)
    );
    const aIsProtein = ['beef', 'chicken', 'turkey', 'pork', 'salmon', 'tuna', 'egg'].some(p => 
      a.name.toLowerCase().includes(p)
    );
    const bIsProtein = ['beef', 'chicken', 'turkey', 'pork', 'salmon', 'tuna', 'egg'].some(p => 
      b.name.toLowerCase().includes(p)
    );
    
    if (aIsCarb && !bIsCarb) return -1;
    if (!aIsCarb && bIsCarb) return 1;
    if (aIsProtein && !bIsProtein) return -1;
    if (!aIsProtein && bIsProtein) return 1;
    return 0;
  });
  
  // Adjust ingredients to reach 500 kcal
  let remainingDiff = difference;
  const adjustedIngredients = [...recipe.ingredients];
  
  for (const ingData of sortedIngredients) {
    if (Math.abs(remainingDiff) < 0.5) break;
    
    const ingIndex = adjustedIngredients.findIndex(ing => ing.name === ingData.name);
    if (ingIndex === -1) continue;
    
    // Calculate how much to adjust
    let adjustFactor = 1;
    const per = ingData.per || '100g';
    
    if (ingData.ingredient.unit === 'g' || ingData.unit === 'ml' || ingData.unit === 'g') {
      const perMatch = per.match(/(\d+(?:\.\d+)?)/);
      const baseAmount = perMatch ? parseFloat(perMatch[1]) : 100;
      const kcalPerUnit = ingData.kcalPerUnit / baseAmount;
      
      if (kcalPerUnit > 0) {
        const neededAdjustment = remainingDiff / kcalPerUnit;
        adjustFactor = 1 + (neededAdjustment / ingData.originalQuantity);
        
        // Limit adjustment to reasonable range (don't go below 50% or above 200%)
        adjustFactor = Math.max(0.5, Math.min(2.0, adjustFactor));
        
        const newQuantity = Math.round(ingData.originalQuantity * adjustFactor);
        adjustedIngredients[ingIndex].quantity = newQuantity;
        
        // Recalculate what this adjustment actually gives us
        const actualAdjustment = (newQuantity - ingData.originalQuantity) * kcalPerUnit;
        remainingDiff -= actualAdjustment;
      }
    }
  }
  
  // Recalculate totals with adjusted quantities
  totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  for (let i = 0; i < adjustedIngredients.length; i++) {
    const ing = adjustedIngredients[i];
    const data = await calculateIngredientNutrition(ing.name, ing.quantity, ing.unit, allIngredients);
    if (data) {
      totals.calories += data.calories;
      totals.protein += data.protein;
      totals.carbs += data.carbs;
      totals.fat += data.fat;
    }
  }
  
  // Final adjustment if still not 500
  if (Math.abs(totals.calories - 500) > 5 && sortedIngredients.length > 0) {
    const primaryIng = sortedIngredients[0];
    const ingIndex = adjustedIngredients.findIndex(ing => ing.name === primaryIng.name);
    if (ingIndex !== -1) {
      const per = primaryIng.per || '100g';
      const perMatch = per.match(/(\d+(?:\.\d+)?)/);
      const baseAmount = perMatch ? parseFloat(perMatch[1]) : 100;
      const kcalPerGram = primaryIng.kcalPerUnit / baseAmount;
      const finalAdjustment = (500 - totals.calories) / kcalPerGram;
      adjustedIngredients[ingIndex].quantity = Math.round(
        adjustedIngredients[ingIndex].quantity + finalAdjustment
      );
      
      // Recalculate one more time
      totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      for (const ing of adjustedIngredients) {
        const data = await calculateIngredientNutrition(ing.name, ing.quantity, ing.unit, allIngredients);
        if (data) {
          totals.calories += data.calories;
          totals.protein += data.protein;
          totals.carbs += data.carbs;
          totals.fat += data.fat;
        }
      }
    }
  }
  
  return {
    ingredients: adjustedIngredients,
    totals: {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10
    }
  };
}

async function fixAllRecipes() {
  try {
    console.log('🔄 Fetching all recipes and ingredients...\n');
    
    const ingredientsResponse = await fetch('http://localhost:4000/api/ingredients');
    if (!ingredientsResponse.ok) throw new Error('Failed to fetch ingredients');
    const allIngredients = await ingredientsResponse.json();
    console.log(`✓ Loaded ${allIngredients.length} ingredients`);
    
    const recipesResponse = await fetch('http://localhost:4000/api/recipes');
    if (!recipesResponse.ok) throw new Error('Failed to fetch recipes');
    const recipes = await recipesResponse.json();
    console.log(`✓ Loaded ${recipes.length} recipes\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      process.stdout.write(`\r[${i + 1}/${recipes.length}] Processing: ${recipe.name.substring(0, 50)}...`);
      
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        skipped++;
        continue;
      }
      
      try {
        const result = await adjustTo500Kcal(recipe, allIngredients);
        
        const currentCalories = recipe.totalCalories || 0;
        const needsUpdate = Math.abs(currentCalories - result.totals.calories) > 1 ||
          Math.abs((recipe.totalProtein || 0) - result.totals.protein) > 0.5;
        
        if (needsUpdate) {
          const updateResponse = await fetch(`http://localhost:4000/api/recipes/${recipe.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ingredients: result.ingredients.map(ing => ({
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
                exists: ing.exists,
                availableInApi: ing.availableInApi,
                apiMatch: ing.apiMatch
              })),
              totalCalories: result.totals.calories,
              totalProtein: result.totals.protein,
              totalCarbs: result.totals.carbs,
              totalFat: result.totals.fat
            }),
          });
          
          if (updateResponse.ok) {
            updated++;
            process.stdout.write(` ✓ (${result.totals.calories} kcal)`);
          } else {
            errors++;
            process.stdout.write(` ✗`);
          }
        } else {
          skipped++;
        }
      } catch (error) {
        errors++;
        process.stdout.write(` ✗ Error`);
      }
    }
    
    console.log(`\n\n✅ Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${recipes.length}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

fixAllRecipes();


// Script to fix all recipes - calculate and update correct totals
// This will calculate calories, protein, carbs, and fat for all recipes based on their ingredients

async function calculateIngredientNutrition(ingredientName, quantity, unit, allIngredients) {
  // Find matching ingredient
  let match = null;
  
  // Try exact match first
  match = allIngredients.find(ing => 
    ing.name.toLowerCase() === ingredientName.toLowerCase()
  );
  
  // Try partial match
  if (!match) {
    match = allIngredients.find(ing => 
      ingredientName.toLowerCase().includes(ing.name.toLowerCase()) ||
      ing.name.toLowerCase().includes(ingredientName.toLowerCase())
    );
  }
  
  if (!match) {
    console.log(`  ⚠️  Ingredient not found: ${ingredientName}`);
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  
  // Calculate factor based on unit and 'per' field
  let factor = 1;
  const per = match.per || '100g';
  
  if (unit === 'g' || unit === 'ml') {
    // Extract number from 'per' field (e.g., "100g" -> 100)
    const perMatch = per.match(/(\d+(?:\.\d+)?)/);
    const baseAmount = perMatch ? parseFloat(perMatch[1]) : 100;
    factor = quantity / baseAmount;
  } else if (unit === 'piece' || unit === 'pieces') {
    // For pieces, check if per is "1" or similar
    if (per.includes('1') || per.toLowerCase().includes('piece')) {
      factor = quantity;
    } else {
      // Try to extract piece count from per
      const perMatch = per.match(/(\d+(?:\.\d+)?)/);
      const basePieces = perMatch ? parseFloat(perMatch[1]) : 1;
      factor = quantity / basePieces;
    }
  } else {
    // Default: assume per 100g
    factor = quantity / 100;
  }
  
  return {
    calories: (match.calories || 0) * factor,
    protein: (match.protein || 0) * factor,
    carbs: (match.carbs || 0) * factor,
    fat: (match.fat || 0) * factor
  };
}

async function fixAllRecipes() {
  try {
    console.log('🔄 Fetching all recipes and ingredients...');
    
    // Fetch all ingredients
    const ingredientsResponse = await fetch('http://localhost:4000/api/ingredients');
    if (!ingredientsResponse.ok) {
      throw new Error('Failed to fetch ingredients');
    }
    const allIngredients = await ingredientsResponse.json();
    console.log(`✓ Loaded ${allIngredients.length} ingredients`);
    
    // Fetch all recipes
    const recipesResponse = await fetch('http://localhost:4000/api/recipes');
    if (!recipesResponse.ok) {
      throw new Error('Failed to fetch recipes');
    }
    const recipes = await recipesResponse.json();
    console.log(`✓ Loaded ${recipes.length} recipes\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      console.log(`\n[${i + 1}/${recipes.length}] Processing: ${recipe.name}`);
      
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        console.log('  ⏭️  No ingredients, skipping');
        skipped++;
        continue;
      }
      
      let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      // Calculate totals from ingredients
      for (const ing of recipe.ingredients) {
        const nutrition = await calculateIngredientNutrition(
          ing.name,
          ing.quantity,
          ing.unit,
          allIngredients
        );
        
        totals.calories += nutrition.calories;
        totals.protein += nutrition.protein;
        totals.carbs += nutrition.carbs;
        totals.fat += nutrition.fat;
      }
      
      // Round values
      const roundedTotals = {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10
      };
      
      // Check if update is needed
      const currentCalories = recipe.totalCalories || 0;
      const currentProtein = recipe.totalProtein || 0;
      const currentCarbs = recipe.totalCarbs || 0;
      const currentFat = recipe.totalFat || 0;
      
      const needsUpdate = 
        Math.abs(currentCalories - roundedTotals.calories) > 0.5 ||
        Math.abs(currentProtein - roundedTotals.protein) > 0.1 ||
        Math.abs(currentCarbs - roundedTotals.carbs) > 0.1 ||
        Math.abs(currentFat - roundedTotals.fat) > 0.1;
      
      if (needsUpdate) {
        console.log(`  📊 Current: ${currentCalories} kcal, ${currentProtein}g protein`);
        console.log(`  ✨ New: ${roundedTotals.calories} kcal, ${roundedTotals.protein}g protein, ${roundedTotals.carbs}g carbs, ${roundedTotals.fat}g fat`);
        
        // Update recipe
        try {
          const updateResponse = await fetch(`http://localhost:4000/api/recipes/${recipe.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              totalCalories: roundedTotals.calories,
              totalProtein: roundedTotals.protein,
              totalCarbs: roundedTotals.carbs,
              totalFat: roundedTotals.fat
            }),
          });
          
          if (updateResponse.ok) {
            console.log('  ✓ Updated successfully');
            updated++;
          } else {
            const errorData = await updateResponse.json();
            console.log(`  ✗ Failed: ${errorData.error || 'Unknown error'}`);
            errors++;
          }
        } catch (error) {
          console.log(`  ✗ Error: ${error.message}`);
          errors++;
        }
      } else {
        console.log(`  ✓ Already correct (${roundedTotals.calories} kcal)`);
        skipped++;
      }
    }
    
    console.log(`\n\n✅ Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped (already correct): ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${recipes.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAllRecipes();







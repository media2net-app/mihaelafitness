import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { recipeId, dayKey, mealType } = await request.json();

    if (!recipeId || !dayKey || !mealType) {
      return NextResponse.json(
        { error: 'Missing required fields: recipeId, dayKey, mealType' },
        { status: 400 }
      );
    }

    // Get the recipe with its ingredients
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: true
      }
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Get all ingredients from database for matching
    const dbIngredients = await prisma.ingredient.findMany({
      where: {
        calories: { gt: 0 }
      }
    });

    // Create ingredient map for quick lookup
    const ingredientMap = new Map();
    dbIngredients.forEach(ing => {
      ingredientMap.set(ing.name.toLowerCase(), ing);
    });

    // Get the current nutrition plan
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Nutrition plan not found' },
        { status: 404 }
      );
    }

    // Parse current week menu
    const weekMenu = plan.weekMenu as any || {};
    const dayMenu = weekMenu[dayKey] || {};

    // Create recipe group identifier
    const recipeGroupId = `recipe_${recipeId}_${Date.now()}`;
    
    // Helper function to clean ingredient name for matching
    const cleanIngredientName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/^\d+(\.\d+)?\s*/, '') // Remove leading numbers
        .replace(/\s*(g|gram|grams|ml|milliliter|milliliters|piece|pieces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|scoop|scoops)\s*$/i, '') // Remove trailing units
        .trim();
    };

    // Match recipe ingredients with database ingredients and format properly
    const matchedIngredients: string[] = [];
    recipe.ingredients.forEach(ing => {
      // Clean the recipe ingredient name for matching
      const cleanedName = cleanIngredientName(ing.name);
      
      // Try to find matching ingredient in database
      let matchedIng = ingredientMap.get(cleanedName);
      
      if (!matchedIng) {
        // Try partial match - search through all ingredients
        // But prefer exact matches and avoid partial word matches (e.g., "Egg" should not match "Eggplant")
        const candidates = Array.from(ingredientMap.values()).filter((dbIng: any) => {
          const dbCleaned = cleanIngredientName(dbIng.name);
          return dbCleaned === cleanedName ||
                 dbCleaned.includes(cleanedName) ||
                 cleanedName.includes(dbCleaned) ||
                 // Handle plural/singular
                 (cleanedName + 's') === dbCleaned ||
                 (dbCleaned + 's') === cleanedName;
        });
        
        // Sort candidates to prefer exact matches and avoid partial matches
        if (candidates.length > 0) {
          candidates.sort((a: any, b: any) => {
            const aCleaned = cleanIngredientName(a.name);
            const bCleaned = cleanIngredientName(b.name);
            
            // Exact match first
            if (aCleaned === cleanedName && bCleaned !== cleanedName) return -1;
            if (bCleaned === cleanedName && aCleaned !== cleanedName) return 1;
            
            // Word boundary match (starts with cleanedName + space or exact match)
            const aWordBoundary = aCleaned === cleanedName || aCleaned.startsWith(cleanedName + ' ');
            const bWordBoundary = bCleaned === cleanedName || bCleaned.startsWith(cleanedName + ' ');
            if (aWordBoundary && !bWordBoundary) return -1;
            if (!aWordBoundary && bWordBoundary) return 1;
            
            // Avoid partial matches (e.g., "Egg" should not prefer "Eggplant")
            const aIsPartial = aCleaned.includes(cleanedName) && aCleaned !== cleanedName && !aCleaned.startsWith(cleanedName + ' ');
            const bIsPartial = bCleaned.includes(cleanedName) && bCleaned !== cleanedName && !bCleaned.startsWith(cleanedName + ' ');
            if (!aIsPartial && bIsPartial) return -1;
            if (aIsPartial && !bIsPartial) return 1;
            
            return 0;
          });
          
          matchedIng = candidates[0];
        }
      }

      if (matchedIng) {
        // Use database ingredient with proper format: quantity unit name
        const quantity = ing.quantity || 1;
        // Use recipe unit if specified, otherwise use database 'per' unit, otherwise 'g'
        const unit = ing.unit || matchedIng.per || 'g';
        matchedIngredients.push(`${quantity}${unit} ${matchedIng.name}`);
      } else {
        // Fallback to recipe ingredient format (clean the name first)
        const quantity = ing.quantity || 1;
        const unit = ing.unit || 'g';
        // Remove leading numbers from name if present
        const cleanName = ing.name.replace(/^\d+(\.\d+)?\s*/, '').trim();
        matchedIngredients.push(`${quantity}${unit} ${cleanName}`);
      }
    });

    // Create the recipe group string with special formatting
    const recipeGroupString = `[RECIPE:${recipe.name}] ${matchedIngredients.join(', ')}`;

    // Parse recipe instructions (they are stored as JSON string)
    let recipeInstructions: string[] = [];
    if (recipe.instructions) {
      try {
        recipeInstructions = typeof recipe.instructions === 'string' 
          ? JSON.parse(recipe.instructions) 
          : recipe.instructions;
      } catch (e) {
        console.error('Error parsing recipe instructions:', e);
        recipeInstructions = [];
      }
    }

    // Format instructions as a single string, removing quantities
    const instructionsText = recipeInstructions.length > 0
      ? recipeInstructions
          .map((instruction: string) => {
            // Remove quantities like "190g", "55g", "120g", "61g" etc. from instructions
            // Pattern: number followed by optional decimal, followed by unit (g, ml, etc.), followed by space or end
            return instruction
              .replace(/\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms)\s+/gi, '') // Remove "190g ", "55g ", etc.
              .replace(/\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms)$/gi, '') // Remove "190g" at end
              .trim();
          })
          .filter((instruction: string) => instruction.length > 0) // Remove empty instructions
          .join('\n')
      : '';

    // Add to existing meal or create new meal
    const currentMeal = dayMenu[mealType] || '';
    const newMeal = currentMeal 
      ? `${currentMeal}, ${recipeGroupString}`
      : recipeGroupString;

    // Update the day menu
    const updatedDayMenu = {
      ...dayMenu,
      [mealType]: newMeal
    };

    // Store cooking instructions in the instructions structure
    const instructionsKey = `${dayKey}_instructions`;
    const currentInstructions = weekMenu[instructionsKey] || {};
    const updatedInstructions = {
      ...currentInstructions,
      [mealType]: instructionsText
    };

    // Update the week menu with both meal and instructions
    const updatedWeekMenu = {
      ...weekMenu,
      [dayKey]: updatedDayMenu,
      [instructionsKey]: updatedInstructions
    };

    // Update the nutrition plan
    const updatedPlan = await prisma.nutritionPlan.update({
      where: { id },
      data: {
        weekMenu: updatedWeekMenu
      }
    });

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      recipeGroup: {
        id: recipeGroupId,
        name: recipe.name,
        ingredients: recipe.ingredients
      }
    });

  } catch (error) {
    console.error('Error adding recipe to nutrition plan:', error);
    return NextResponse.json(
      { error: 'Failed to add recipe to nutrition plan' },
      { status: 500 }
    );
  }
}



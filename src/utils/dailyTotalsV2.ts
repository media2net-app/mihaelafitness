/**
 * V2 Daily Totals Calculator
 * Clean, simple calculation without any caching or complex logic
 */

interface IngredientData {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DayData {
  breakfast?: string;
  'morning-snack'?: string;
  lunch?: string;
  'afternoon-snack'?: string;
  dinner?: string;
  'evening-snack'?: string;
}

/**
 * Parse meal description to extract ingredients
 */
function parseMealDescription(mealDescription: string): string[] {
  if (!mealDescription || mealDescription.trim() === '') {
    return [];
  }

  console.log('🔍 [V2] Parsing meal:', mealDescription);

  // Clean the description (remove DB IDs)
  let cleaned = mealDescription.replace(/[a-z0-9]{26}\|/g, '');
  console.log('🔍 [V2] Cleaned:', cleaned);

  // Try different separators
  let ingredients: string[] = [];

  // Try comma separation first
  if (cleaned.includes(',')) {
    ingredients = cleaned.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
    console.log('🔍 [V2] Parsed by comma:', ingredients);
  }
  // Try plus separation
  else if (cleaned.includes('+')) {
    ingredients = cleaned.split('+').map(ing => ing.trim()).filter(ing => ing.length > 0);
    console.log('🔍 [V2] Parsed by plus:', ingredients);
  }
  // Single ingredient
  else if (cleaned.trim().length > 0) {
    ingredients = [cleaned.trim()];
    console.log('🔍 [V2] Single ingredient:', ingredients);
  }

  return ingredients;
}

/**
 * Call the calculate-macros API to get ingredient data
 */
async function getIngredientDataFromAPI(ingredients: string[]): Promise<IngredientData[]> {
  if (!ingredients || ingredients.length === 0) {
    return [];
  }

  console.log('🔍 [V2] Calling API with ingredients:', ingredients);

  try {
    const response = await fetch('/api/calculate-macros', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    console.log('🔍 [V2] API response:', results);

    // Process results
    const ingredientResults: IngredientData[] = results.map((result: any) => {
      // Extract clean ingredient name (remove quantities and IDs)
      let cleanName = result.ingredient || '';
      
      // Remove DB id pipes if present (e.g., "cmg123|Milk" -> "Milk")
      if (cleanName.includes('|')) {
        const parts = cleanName.split('|');
        cleanName = parts[parts.length - 1].trim();
      }
      
      // Remove common quantity patterns
      cleanName = cleanName
        .replace(/^\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|slice|slices)\s*/i, '')
        .replace(/^\d+(?:\.\d+)?\s*(?:piece|pieces)\s*/i, '')
        .replace(/^\d+(?:\.\d+)?\s*/i, '')
        .replace(/^(\d+\/\d+|\d+)\s*/i, '')
        .replace(/^\([^)]*\)\s*/g, '')
        .replace(/^[^a-zA-Z]*/, '')
        .replace(/\)$/, '')
        .trim();

      // Create portion string using parsed amount and unit from API
      let portion = '';
      
      if (result.unit === 'g' && result.amount) {
        portion = `${Math.round(result.amount)} g`;
      } else if (result.unit === 'ml' && result.amount) {
        portion = `${Math.round(result.amount)} ml`;
      } else if (result.unit === 'tsp' && result.amount) {
        portion = `${result.amount} tsp`;
      } else if (result.unit === 'tbsp' && result.amount) {
        portion = `${result.amount} tbsp`;
      } else if (result.unit === 'piece' && result.pieces) {
        if (result.pieces === 0.5) {
          portion = '1/2 piece';
        } else if (result.pieces === 0.25) {
          portion = '1/4 piece';
        } else if (result.pieces === 0.33) {
          portion = '1/3 piece';
        } else if (result.pieces === 1) {
          portion = '1 piece';
        } else {
          portion = `${result.pieces} pieces`;
        }
      } else if (result.amount) {
        portion = `${Math.round(result.amount)} ${result.unit || 'g'}`;
      } else {
        portion = '1 piece';
      }

      return {
        name: cleanName,
        portion: portion,
        calories: Math.round(result.macros?.calories || 0),
        protein: Math.round((result.macros?.protein || 0) * 10) / 10,
        carbs: Math.round((result.macros?.carbs || 0) * 10) / 10,
        fat: Math.round((result.macros?.fat || 0) * 10) / 10,
        fiber: Math.round((result.macros?.fiber || 0) * 10) / 10
      };
    });

    console.log('🔍 [V2] Processed ingredients:', ingredientResults);
    return ingredientResults;

  } catch (error) {
    console.error('❌ [V2] API call failed:', error);
    return [];
  }
}

/**
 * Get meal string from day data
 */
function getMealString(dayData: DayData, mealType: string): string {
  if (!dayData) return '';
  
  switch (mealType) {
    case 'breakfast':
      return dayData.breakfast || '';
    case 'morning-snack':
      return dayData['morning-snack'] || '';
    case 'lunch':
      return dayData.lunch || '';
    case 'afternoon-snack':
      return dayData['afternoon-snack'] || '';
    case 'dinner':
      return dayData.dinner || '';
    case 'evening-snack':
      return dayData['evening-snack'] || '';
    default:
      return '';
  }
}

/**
 * V2: Calculate daily totals - CLEAN AND SIMPLE
 */
export async function calculateDailyTotalsV2(dayData: DayData): Promise<DailyTotals> {
  console.log('🚀 [V2] Starting clean calculation for dayData:', dayData);
  
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (!dayData || typeof dayData !== 'object') {
    console.log('🚀 [V2] No dayData, returning zeros');
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  // Process each meal type
  const mealTypes = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
  
  for (const mealType of mealTypes) {
    const meal = getMealString(dayData, mealType);
    console.log(`🚀 [V2] Processing ${mealType}: "${meal}"`);
    
    if (!meal || meal.trim() === '') {
      console.log(`🚀 [V2] ${mealType} is empty, skipping`);
      continue;
    }

    try {
      // Parse ingredients from meal description
      const ingredients = parseMealDescription(meal);
      
      if (ingredients.length === 0) {
        console.log(`🚀 [V2] ${mealType} has no parseable ingredients`);
        continue;
      }

      // Get ingredient data from API - always fresh, no cache
      const ingredientData = await getIngredientDataFromAPI(ingredients);
      console.log(`🚀 [V2] ${mealType} ingredient data:`, ingredientData);
      
      if (ingredientData && ingredientData.length > 0) {
        // Calculate meal totals
        const mealTotals = ingredientData.reduce((acc, ing) => ({
          calories: acc.calories + (ing.calories || 0),
          protein: acc.protein + (ing.protein || 0),
          carbs: acc.carbs + (ing.carbs || 0),
          fat: acc.fat + (ing.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        console.log(`🚀 [V2] ${mealType} totals:`, mealTotals);
        
        // Add to daily totals
        totalCalories += mealTotals.calories;
        totalProtein += mealTotals.protein;
        totalCarbs += mealTotals.carbs;
        totalFat += mealTotals.fat;
      } else {
        console.log(`🚀 [V2] ${mealType} has no ingredient data from API`);
      }
    } catch (error) {
      console.error(`❌ [V2] Error calculating ${mealType}:`, error);
    }
  }

  const finalTotals = {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
  };
  
  console.log('🎯 [V2] FINAL DAILY TOTALS:', finalTotals);
  return finalTotals;
}

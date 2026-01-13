/**
 * V3 Daily Totals Calculator - OPTIMIZED VERSION
 * Uses caching and batch API calls for better performance
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
  breakfast?: string | { description: string; cookingInstructions?: string } | { ingredients: string; cookingInstructions?: string };
  'morning-snack'?: string | { description: string; cookingInstructions?: string } | { ingredients: string; cookingInstructions?: string };
  lunch?: string | { description: string; cookingInstructions?: string } | { ingredients: string; cookingInstructions?: string };
  'afternoon-snack'?: string | { description: string; cookingInstructions?: string } | { ingredients: string; cookingInstructions?: string };
  dinner?: string | { description: string; cookingInstructions?: string } | { ingredients: string; cookingInstructions?: string };
  'evening-snack'?: string | { description: string; cookingInstructions?: string } | { ingredients: string; cookingInstructions?: string };
}

// Cache for ingredient data to avoid repeated API calls
const ingredientCache = new Map<string, IngredientData[]>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: IngredientData[];
  timestamp: number;
}

/**
 * Parse meal description to extract ingredients
 */
function parseMealDescription(mealDescription: string): string[] {
  if (!mealDescription || mealDescription.trim() === '') {
    return [];
  }

  // Clean the description (remove DB IDs)
  let cleaned = mealDescription.replace(/[a-z0-9]{26}\|/g, '');

  // Try different separators
  let ingredients: string[] = [];

  // Try comma separation first
  if (cleaned.includes(',')) {
    ingredients = cleaned.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
  }
  // Try plus separation
  else if (cleaned.includes('+')) {
    ingredients = cleaned.split('+').map(ing => ing.trim()).filter(ing => ing.length > 0);
  }
  // Single ingredient
  else if (cleaned.trim().length > 0) {
    ingredients = [cleaned.trim()];
  }

  return ingredients;
}

/**
 * Get ingredient data from API with caching
 */
async function getIngredientDataFromAPI(ingredients: string[]): Promise<IngredientData[]> {
  if (!ingredients || ingredients.length === 0) {
    return [];
  }

  // Create cache key from sorted ingredients
  const cacheKey = ingredients.sort().join('|');
  
  // Check cache first
  const cached = ingredientCache.get(cacheKey) as CacheEntry | undefined;
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('🚀 [V3] Using cached data for:', ingredients);
    return cached.data;
  }

  console.log('🔍 [V3] Calling API with ingredients:', ingredients);

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

    // Cache the results
    ingredientCache.set(cacheKey, {
      data: ingredientResults,
      timestamp: Date.now()
    });

    console.log('🔍 [V3] Cached data for:', ingredients);
    return ingredientResults;

  } catch (error) {
    console.error('❌ [V3] API call failed:', error);
    return [];
  }
}

/**
 * Get meal string from day data
 */
function getMealString(dayData: DayData, mealType: string): string {
  if (!dayData) return '';
  
  let mealData: string | { description: string; cookingInstructions?: string } | { ingredients: string; cookingInstructions?: string } | undefined;
  
  switch (mealType) {
    case 'breakfast':
      mealData = dayData.breakfast;
      break;
    case 'morning-snack':
      mealData = dayData['morning-snack'];
      break;
    case 'lunch':
      mealData = dayData.lunch;
      break;
    case 'afternoon-snack':
      mealData = dayData['afternoon-snack'];
      break;
    case 'dinner':
      mealData = dayData.dinner;
      break;
    case 'evening-snack':
      mealData = dayData['evening-snack'];
      break;
    default:
      return '';
  }
  
  // Support string format and object format (with description or ingredients field)
  if (typeof mealData === 'string') {
    return mealData;
  } else if (mealData && typeof mealData === 'object') {
    if ('description' in mealData) {
      return mealData.description;
    } else if ('ingredients' in mealData) {
      return mealData.ingredients;
    }
  }
  
  return '';
}

/**
 * V3: Calculate daily totals - OPTIMIZED WITH CACHING
 */
export async function calculateDailyTotalsV3(dayData: DayData): Promise<DailyTotals> {
  console.log('🚀 [V3] Starting optimized calculation for dayData:', dayData);
  
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (!dayData || typeof dayData !== 'object') {
    console.log('🚀 [V3] No dayData, returning zeros');
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  // Collect all ingredients from all meals first
  const allIngredients = new Set<string>();
  const mealIngredients: { [mealType: string]: string[] } = {};
  
  const mealTypes = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
  
  for (const mealType of mealTypes) {
    const meal = getMealString(dayData, mealType);
    
    if (!meal || meal.trim() === '') {
      continue;
    }

    const ingredients = parseMealDescription(meal);
    mealIngredients[mealType] = ingredients;
    
    // Add to global set
    ingredients.forEach(ing => allIngredients.add(ing));
  }

  // Make single API call for all unique ingredients
  const uniqueIngredients = Array.from(allIngredients);
  console.log('🚀 [V3] Making single API call for all ingredients:', uniqueIngredients);
  
  const allIngredientData = await getIngredientDataFromAPI(uniqueIngredients);
  
  // Create a map for quick lookup
  const ingredientMap = new Map<string, IngredientData>();
  allIngredientData.forEach(ing => {
    ingredientMap.set(ing.name.toLowerCase(), ing);
  });

  // Now calculate totals for each meal
  for (const mealType of mealTypes) {
    const ingredients = mealIngredients[mealType];
    
    if (!ingredients || ingredients.length === 0) {
      continue;
    }

    // Calculate meal totals using cached data
    const mealTotals = ingredients.reduce((acc, ingredientName) => {
      const ingredientData = ingredientMap.get(ingredientName.toLowerCase());
      if (ingredientData) {
        return {
          calories: acc.calories + (ingredientData.calories || 0),
          protein: acc.protein + (ingredientData.protein || 0),
          carbs: acc.carbs + (ingredientData.carbs || 0),
          fat: acc.fat + (ingredientData.fat || 0)
        };
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    console.log(`🚀 [V3] ${mealType} totals:`, mealTotals);
    
    // Add to daily totals
    totalCalories += mealTotals.calories;
    totalProtein += mealTotals.protein;
    totalCarbs += mealTotals.carbs;
    totalFat += mealTotals.fat;
  }

  const finalTotals = {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
  };
  
  console.log('🎯 [V3] FINAL DAILY TOTALS:', finalTotals);
  return finalTotals;
}

/**
 * Clear the ingredient cache (useful for testing or when data changes)
 */
export function clearIngredientCache(): void {
  ingredientCache.clear();
  console.log('🧹 [V3] Ingredient cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: ingredientCache.size,
    keys: Array.from(ingredientCache.keys())
  };
}

























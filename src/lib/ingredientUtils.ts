// V3 Ingredient Utilities - Clean, simple, reliable

export interface Ingredient {
  id: string;
  name: string; // English name for DB matching
  nameRo: string; // Romanian name for display
  quantity: number;
  unit: string;
  per: string; // e.g., "100g", "1"
  calories: number; // Already scaled to quantity
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: string;
}

export interface ParsedIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface DatabaseIngredient {
  id: string;
  name: string;
  nameRo: string;
  per: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: string;
  aliases: string[];
}

/**
 * Parse ingredient string into structured data
 * Handles formats like: "100g chicken breast", "1 apple", "200ml milk"
 */
export function parseIngredientString(input: string): ParsedIngredient | null {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // Enhanced regex to capture amount, unit, and name
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(g|gram|grams|ml|milliliter|milliliters|tsp|tbsp|tablespoon|teaspoon|slice|slices|piece|pieces|buc|felie|felii|cup|cups|oz|ounce|ounces|lb|pound|pounds|kg|kilogram|kilograms|l|liter|liters)?\s+(.+)$/i);
  
  if (match) {
    const amount = parseFloat(match[1]);
    const unit = (match[2] || 'g').toLowerCase();
    const name = match[3].trim();
    
    return { name, amount, unit };
  }
  
  // Fallback: try to extract just number and name
  const fallbackMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/i);
  if (fallbackMatch) {
    const amount = parseFloat(fallbackMatch[1]);
    const name = fallbackMatch[2].trim();
    
    // Try to extract unit from name
            const unitMatch = name.match(/^(g|gram|grams|ml|milliliter|milliliters|tsp|tbsp|tablespoon|teaspoon|slice|slices|piece|pieces|buc|felie|felii|cup|cups|oz|ounce|ounces|lb|pound|pounds|kg|kilogram|kilograms|l|liter|liters)\s+(.+)$/i);
    if (unitMatch) {
      return {
        name: unitMatch[2].trim(),
        amount,
        unit: unitMatch[1].toLowerCase()
      };
    }
    
    return { name, amount, unit: 'g' }; // Default to grams
  }
  
  return null;
}

/**
 * Normalize ingredient name for database matching
 */
export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

/**
 * Find ingredient in database with flexible matching
 * Avoids partial word matches (e.g., "Egg" should not match "Eggplant")
 */
export function findIngredientInDatabase(
  parsedIngredient: ParsedIngredient,
  databaseIngredients: DatabaseIngredient[]
): DatabaseIngredient | null {
  const { name, unit } = parsedIngredient;
  const normalizedName = normalizeIngredientName(name);
  
  // Create search variations
  const searchVariations = [
    name,
    name.replace(/s$/, ''), // Remove trailing 's'
    name + 's', // Add trailing 's'
    name.replace(/^\d+\s*/, ''), // Remove leading numbers
  ];
  
  // Try exact matches first
  for (const variation of searchVariations) {
    const normalized = normalizeIngredientName(variation);
    
    // Exact match
    let match = databaseIngredients.find(ing => 
      normalizeIngredientName(ing.name) === normalized
    );
    if (match) return match;
    
    // Match with aliases
    match = databaseIngredients.find(ing => 
      ing.aliases?.some(alias => 
        normalizeIngredientName(alias.replace(/^(Pure:|TYPE:)/, '')) === normalized
      )
    );
    if (match) return match;
  }
  
  // Try partial matches, but prefer word boundary matches and avoid partial word matches
  const candidates: Array<{ ingredient: DatabaseIngredient; score: number }> = [];
  
  for (const variation of searchVariations) {
    const normalized = normalizeIngredientName(variation);
    
    databaseIngredients.forEach(ing => {
      const ingName = normalizeIngredientName(ing.name);
      const ingNameRo = normalizeIngredientName(ing.nameRo || '');
      
      // Check if it's a potential match
      if (ingName.includes(normalized) || normalized.includes(ingName) ||
          ingNameRo.includes(normalized) || normalized.includes(ingNameRo)) {
        
        let score = 0;
        
        // Exact match gets highest score
        if (ingName === normalized || ingNameRo === normalized) {
          score = 100;
        }
        // Word boundary match (starts with normalized + space or exact match)
        else if (ingName === normalized || ingName.startsWith(normalized + ' ') ||
                 ingNameRo === normalized || ingNameRo.startsWith(normalized + ' ')) {
          score = 80;
        }
        // Partial match (but avoid partial word matches like "Egg" in "Eggplant")
        else {
          const isPartial = (ingName.includes(normalized) && ingName !== normalized && !ingName.startsWith(normalized + ' ')) ||
                           (ingNameRo.includes(normalized) && ingNameRo !== normalized && !ingNameRo.startsWith(normalized + ' '));
          if (isPartial) {
            score = 20; // Lower score for partial matches
          } else {
            score = 50; // Medium score for other matches
          }
        }
        
        candidates.push({ ingredient: ing, score });
      }
    });
  }
  
  // Sort by score (highest first) and return the best match
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].ingredient;
  }
  
  return null;
}

/**
 * Determine final unit for ingredient
 */
export function determineIngredientUnit(
  parsedUnit: string,
  dbIngredient: DatabaseIngredient | null
): string {
  // Check for TYPE alias in database
  if (dbIngredient?.aliases) {
    const typeAlias = dbIngredient.aliases.find(alias => alias.startsWith('TYPE:'));
    if (typeAlias) {
      return typeAlias.replace('TYPE:', '').toLowerCase();
    }
  }
  
  // Use parsed unit or default
  return parsedUnit || 'g';
}

/**
 * Calculate macros for ingredient based on quantity
 */
export function calculateIngredientMacros(
  dbIngredient: DatabaseIngredient,
  quantity: number,
  unit: string
): { calories: number; protein: number; carbs: number; fat: number; fiber: number } {
  // Parse the 'per' field to get base amount
  const perMatch = dbIngredient.per.match(/(\d+(?:\.\d+)?)/);
  const baseAmount = perMatch ? parseFloat(perMatch[1]) : 100;
  
  // Calculate ratio
  const ratio = baseAmount > 0 ? quantity / baseAmount : 0;
  
  return {
    calories: Math.round(dbIngredient.calories * ratio),
    protein: Math.round(dbIngredient.protein * ratio),
    carbs: Math.round(dbIngredient.carbs * ratio),
    fat: Math.round(dbIngredient.fat * ratio),
    fiber: Math.round(dbIngredient.fiber * ratio),
  };
}

/**
 * Create complete ingredient object
 */
export function createIngredientObject(
  parsedIngredient: ParsedIngredient,
  dbIngredient: DatabaseIngredient,
  finalUnit: string
): Ingredient {
  const macros = calculateIngredientMacros(dbIngredient, parsedIngredient.amount, finalUnit);
  
  return {
    id: dbIngredient.id,
    name: dbIngredient.name,
    nameRo: dbIngredient.nameRo,
    quantity: parsedIngredient.amount,
    unit: finalUnit,
    per: dbIngredient.per,
    ...macros,
    category: dbIngredient.category,
  };
}

/**
 * Parse meal description into ingredient objects
 */
export function parseMealDescription(
  mealDescription: string,
  databaseIngredients: DatabaseIngredient[]
): Ingredient[] {
  if (!mealDescription || !databaseIngredients.length) {
    return [];
  }
  
  // Check if it's JSON format
  if (mealDescription.trim().startsWith('[') && mealDescription.trim().endsWith(']')) {
    try {
      const jsonIngredients = JSON.parse(mealDescription);
      if (Array.isArray(jsonIngredients)) {
        return jsonIngredients.map((ing: any) => ({
          id: ing.id || `temp_${Date.now()}_${Math.random()}`,
          name: ing.name || '',
          nameRo: ing.nameRo || ing.name || '',
          quantity: ing.quantity || 0,
          unit: ing.unit || 'g',
          per: ing.per || '100g',
          calories: ing.calories || 0,
          protein: ing.protein || 0,
          carbs: ing.carbs || 0,
          fat: ing.fat || 0,
          fiber: ing.fiber || 0,
          category: ing.category || 'other',
        }));
      }
    } catch (error) {
      console.error('Error parsing JSON meal:', error);
    }
  }
  
  // Parse as string format
  const ingredients: Ingredient[] = [];
  const tokens = mealDescription.split(',').map(t => t.trim()).filter(Boolean);
  
  for (const token of tokens) {
    const parsed = parseIngredientString(token);
    if (!parsed) continue;
    
    const dbIngredient = findIngredientInDatabase(parsed, databaseIngredients);
    if (!dbIngredient) {
      console.warn(`No database match found for: ${token}`);
      continue;
    }
    
    const finalUnit = determineIngredientUnit(parsed.unit, dbIngredient);
    const ingredient = createIngredientObject(parsed, dbIngredient, finalUnit);
    
    ingredients.push(ingredient);
  }
  
  return ingredients;
}

/**
 * Calculate total macros for a list of ingredients
 */
export function calculateTotalMacros(ingredients: Ingredient[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
} {
  const totals = ingredients.reduce(
    (total, ingredient) => ({
      calories: total.calories + ingredient.calories,
      protein: total.protein + ingredient.protein,
      carbs: total.carbs + ingredient.carbs,
      fat: total.fat + ingredient.fat,
      fiber: total.fiber + ingredient.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
  
  // Round all totals to whole numbers
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
    fiber: Math.round(totals.fiber),
  };
}

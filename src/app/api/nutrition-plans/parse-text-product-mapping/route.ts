import { NextRequest, NextResponse } from 'next/server';

interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  matched?: boolean;
  dbIngredient?: any;
  originalText?: string;
}

interface ParsedMeal {
  name: string;
  ingredients: ParsedIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface ParsedDay {
  dayNumber: number;
  dayName: string;
  meals: ParsedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// Simplified Product mapping parser that preserves original macro values
class ProductMappingParser {
  private mealNameMapping: { [key: string]: string } = {
    'breakfast': 'breakfast',
    'lunch': 'lunch',
    'dinner': 'dinner',
    'snack 1': 'morning-snack',
    'snack 2': 'afternoon-snack',
    'evening snack': 'evening-snack',
    'snack': 'snack'
  };

  parseNutritionPlan(text: string): ParsedDay[] {
    console.log('[ProductMappingParser] Starting to parse text...');
    const days: ParsedDay[] = [];
    
    // Split text into day sections
    const daySections = text.split(/📅\s*Day\s+\d+/);
    
    if (daySections.length > 1) {
      // Multiple days found
      for (let i = 1; i < daySections.length; i++) { // Skip first empty section
        const daySection = daySections[i];
        const dayNumber = i;
        const dayName = this.extractDayName(daySection);
        
        console.log(`[ProductMappingParser] Processing day ${dayNumber}: ${dayName}`);
        
        const meals = this.parseDayMeals(daySection);
        
        // Calculate day totals
        const dayTotals = this.calculateDayTotals(meals);
        
        days.push({
          dayNumber,
          dayName,
          meals,
          ...dayTotals
        });
      }
    } else {
      // No day headers found, treat entire text as one day
      console.log(`[ProductMappingParser] No day headers found, treating as single day`);
      
      const meals = this.parseDayMeals(text);
      
      // Calculate day totals
      const dayTotals = this.calculateDayTotals(meals);
      
      days.push({
        dayNumber: 1,
        dayName: 'Day 1',
        meals,
        ...dayTotals
      });
    }
    
    console.log(`[ProductMappingParser] Parsed ${days.length} days`);
    return days;
  }
  
  private extractDayName(daySection: string): string {
    const match = daySection.match(/[–-]\s*([^(]+)/);
    return match ? match[1].trim() : `Day ${daySection.split('\n')[0]?.trim() || 'Unknown'}`;
  }

  private parseDayMeals(dayContent: string): ParsedMeal[] {
    const meals: ParsedMeal[] = [];
    let currentMeal: ParsedMeal | null = null;
    
    const lines = dayContent.split('\n');
    console.log(`[ProductMappingParser] Processing ${lines.length} lines in day content`);
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
      
      console.log(`[ProductMappingParser] Processing line: "${line}"`);
      
      // Check if this is a meal header
      const mealMatch = this.parseMealHeader(trimmedLine);
      if (mealMatch) {
        // Save previous meal if exists
        if (currentMeal) {
          meals.push(currentMeal);
        }
        
        // Start new meal
        currentMeal = {
          name: mealMatch.name,
          ingredients: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0
        };
        
        console.log(`[ProductMappingParser] Found meal: ${mealMatch.name}`);
        continue;
      }
      
      // Check if this is an ingredient line
      const ingredient = this.parseIngredientLine(line); // Use original line, not trimmed
      if (ingredient && currentMeal) {
        currentMeal.ingredients.push(ingredient);
        console.log(`[ProductMappingParser] Found ingredient: ${ingredient.name} (${ingredient.quantity}${ingredient.unit}) - ${ingredient.calories} kcal`);
      } else {
        console.log(`[ProductMappingParser] Line is not an ingredient: "${line}"`);
      }
    }
    
    // Add the last meal
    if (currentMeal) {
      meals.push(currentMeal);
    }
    
    // Calculate meal totals
    meals.forEach(meal => {
      const totals = this.calculateMealTotals(meal.ingredients);
      meal.totalCalories = totals.totalCalories;
      meal.totalProtein = totals.totalProtein;
      meal.totalCarbs = totals.totalCarbs;
      meal.totalFat = totals.totalFat;
    });
    
    return meals;
  }

  private parseMealHeader(line: string): { name: string } | null {
    if (!line || typeof line !== 'string') {
      return null;
    }
    
    // Try to match meal patterns
    const patterns = [
      /^(breakfast|lunch|dinner|snack\s*\d*|evening\s*snack)/i,
      /^([A-Za-z\s]+?)(?:\s*[–-])/,
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        let mealName = match[1].toLowerCase().trim();
        
        // Map to standard meal names
        const mappedName = this.mealNameMapping[mealName] || mealName;
        
        return { name: mappedName };
      }
    }
    
    return null;
  }

  private parseIngredientLine(line: string): ParsedIngredient | null {
    // Skip non-ingredient lines
    if (!line.includes('→') || !line.includes('kcal')) {
      return null;
    }

    console.log(`[ProductMappingParser] Trying to parse ingredient line: "${line}"`);

    // Simple string parsing approach
    try {
      // Find the arrow and split
      const arrowIndex = line.indexOf('→');
      if (arrowIndex === -1) return null;
      
      const ingredientPart = line.substring(0, arrowIndex).trim();
      const macroPart = line.substring(arrowIndex + 1).trim();
      
      // Remove bullet point from ingredient part
      const cleanIngredientPart = ingredientPart.replace(/^[•\t\s]+/, '');
      
      // Parse macros
      const macroMatch = macroPart.match(/(\d+)\s*kcal\s*\|\s*P:(\d+(?:\.\d+)?)g\s*\|\s*C:(\d+(?:\.\d+)?)g\s*\|\s*F:(\d+(?:\.\d+)?)g/);
      if (!macroMatch) {
        console.log(`[ProductMappingParser] Could not parse macros: ${macroPart}`);
        return null;
      }
      
      const calories = parseInt(macroMatch[1]);
      const protein = parseFloat(macroMatch[2]);
      const carbs = parseFloat(macroMatch[3]);
      const fat = parseFloat(macroMatch[4]);
      
      // Parse the ingredient name and quantity
      const ingredientInfo = this.parseIngredientNameAndQuantity(cleanIngredientPart);
      
      console.log(`[ProductMappingParser] Successfully parsed ingredient: ${ingredientInfo.name}`);
      
      return {
        name: ingredientInfo.name,
        quantity: ingredientInfo.quantity,
        unit: ingredientInfo.unit,
        calories,
        protein,
        carbs,
        fat,
        matched: false, // No automatic matching in product mapping
        originalText: line.trim()
      };
    } catch (error) {
      console.log(`[ProductMappingParser] Error parsing ingredient line: ${error}`);
      return null;
    }
  }

  private parseIngredientNameAndQuantity(text: string): { name: string; quantity: number; unit: string } {
    if (!text || typeof text !== 'string') {
      return { name: 'Unknown', quantity: 1, unit: 'g' };
    }
    
    // Remove bullet point and tabs if present
    const cleanText = text.replace(/^\t?•\s*/, '');
    
    // Pattern for "3 egg whites (100 g)" - prioritize parentheses
    const parenthesesMatch = cleanText.match(/^(.+?)\s*\((\d+(?:\.\d+)?)\s*(g|ml|tsp|tbsp|cups?|pieces?|whole|large|medium|small)\)$/i);
    if (parenthesesMatch && parenthesesMatch[1] && parenthesesMatch[2] && parenthesesMatch[3]) {
      return {
        name: parenthesesMatch[1].trim(),
        quantity: parseFloat(parenthesesMatch[2]),
        unit: parenthesesMatch[3].toLowerCase()
      };
    }
    
    // Pattern for "50 g oats" or "150 ml almond milk"
    const standardMatch = cleanText.match(/^(\d+(?:\.\d+)?)\s*(g|ml|tsp|tbsp|cups?|pieces?|whole|large|medium|small)\s+(.+)$/i);
    if (standardMatch && standardMatch[1] && standardMatch[2] && standardMatch[3]) {
      return {
        name: standardMatch[3].trim(),
        quantity: parseFloat(standardMatch[1]),
        unit: standardMatch[2].toLowerCase()
      };
    }
    
    // Pattern for "2 whole eggs" or "1 cup cooked rice"
    const prefixMatch = cleanText.match(/^(\d+(?:\.\d+)?)\s+(whole|large|medium|small|cup|cups|tsp|tbsp|piece|pieces)\s+(.+)$/i);
    if (prefixMatch && prefixMatch[1] && prefixMatch[2] && prefixMatch[3]) {
      return {
        name: prefixMatch[3].trim(),
        quantity: parseFloat(prefixMatch[1]),
        unit: prefixMatch[2].toLowerCase()
      };
    }
    
    // Fallback: try to extract any number and unit
    const fallbackMatch = cleanText.match(/^(\d+(?:\.\d+)?)\s*(g|ml|tsp|tbsp|cups?|pieces?|whole|large|medium|small)?\s*(.+)$/i);
    if (fallbackMatch && fallbackMatch[1] && fallbackMatch[3]) {
      return {
        name: fallbackMatch[3].trim(),
        quantity: parseFloat(fallbackMatch[1]),
        unit: (fallbackMatch[2] || 'g').toLowerCase()
      };
    }
    
    // Last resort: return as-is with default values
    console.log(`[ProductMappingParser] Could not parse ingredient: ${cleanText}`);
    return {
      name: cleanText,
      quantity: 1,
      unit: 'g'
    };
  }

  private calculateMealTotals(ingredients: ParsedIngredient[]) {
    return ingredients.reduce((totals, ingredient) => ({
      totalCalories: totals.totalCalories + (ingredient.calories || 0),
      totalProtein: totals.totalProtein + (ingredient.protein || 0),
      totalCarbs: totals.totalCarbs + (ingredient.carbs || 0),
      totalFat: totals.totalFat + (ingredient.fat || 0)
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    });
  }

  private calculateDayTotals(meals: ParsedMeal[]) {
    return meals.reduce((totals, meal) => ({
      totalCalories: totals.totalCalories + meal.totalCalories,
      totalProtein: totals.totalProtein + meal.totalProtein,
      totalCarbs: totals.totalCarbs + meal.totalCarbs,
      totalFat: totals.totalFat + meal.totalFat
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, planId } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    console.log('[ProductMappingAPI] Starting product mapping parse...');
    console.log('[ProductMappingAPI] Input text length:', text.length);
    console.log('[ProductMappingAPI] Input text preview:', text.substring(0, 200));
    
    const parser = new ProductMappingParser();
    const parsedData = parser.parseNutritionPlan(text);
    
    console.log('[ProductMappingAPI] Parsed data:', JSON.stringify(parsedData, null, 2));
    
    // Calculate statistics
    const totalDays = parsedData.length;
    const totalMeals = parsedData.reduce((sum, day) => sum + day.meals.length, 0);
    const totalIngredients = parsedData.reduce((sum, day) =>
      sum + day.meals.reduce((mealSum, meal) => mealSum + meal.ingredients.length, 0), 0
    );
    
    // In product mapping, no automatic matching is done
    const matchedIngredients = 0;
    const unmatchedIngredients = totalIngredients;
    
    const statistics = {
      totalDays,
      totalMeals,
      totalIngredients,
      matchedIngredients,
      unmatchedIngredients,
      matchRate: 0 // No automatic matching in product mapping
    };
    
    console.log('[ProductMappingAPI] Parse completed:', statistics);
    
    return NextResponse.json({
      success: true,
      parsedData,
      statistics
    });
    
  } catch (error) {
    console.error('[ProductMappingAPI] Error:', error);
    console.error('[ProductMappingAPI] Error stack:', error.stack);
    return NextResponse.json(
      { error: `Failed to parse text: ${error.message}` },
      { status: 500 }
    );
  }
}
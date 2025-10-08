interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  rawText: string;
}

interface ParsedMeal {
  name: string;
  ingredients: ParsedIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  instructions?: string;
}

interface ParsedDay {
  dayNumber: number;
  dayName: string;
  meals: ParsedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  description?: string;
}

export class NutritionTextParser {
  private dayPattern = /📅\s*Day\s*(\d+)\s*–\s*([^(]+)/i;
  private mealPattern = /(Breakfast|Snack\s*\d+|Lunch|Dinner|Evening\s*Snack)\s*–\s*([^\n]+)/i;
  private ingredientPattern = /•\s*(.+?)\s*→\s*(\d+)\s*kcal\s*\|\s*P:(\d+(?:\.\d+)?)g\s*\|\s*C:(\d+(?:\.\d+)?)g\s*\|\s*F:(\d+(?:\.\d+)?)g/i;
  private totalPattern = /Total:\s*(\d+)\s*kcal\s*\|\s*P:(\d+(?:\.\d+)?)g\s*\|\s*C:(\d+(?:\.\d+)?)g\s*\|\s*F:(\d+(?:\.\d+)?)g/i;
  private dayTotalPattern = /Day\s*\d+\s*Total:\s*(\d+)\s*kcal\s*\|\s*P:(\d+(?:\.\d+)?)g\s*\|\s*C:(\d+(?:\.\d+)?)g\s*\|\s*F:(\d+(?:\.\d+)?)g/i;

  private mealNameMapping: { [key: string]: string } = {
    'breakfast': 'breakfast',
    'snack 1': 'morning-snack',
    'snack 2': 'afternoon-snack',
    'lunch': 'lunch',
    'dinner': 'dinner',
    'evening snack': 'evening-snack'
  };

  private dayNameMapping: { [key: string]: string } = {
    'monday': 'monday',
    'tuesday': 'tuesday',
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    'saturday': 'saturday',
    'sunday': 'sunday'
  };

  parseNutritionPlan(text: string): ParsedDay[] {
    const lines = text.split('\n');
    const days: ParsedDay[] = [];
    let currentDay: ParsedDay | null = null;
    let currentMeal: ParsedMeal | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and separators
      if (!line || line === '⸻' || line === '—') continue;

      // Check for day header
      const dayMatch = line.match(this.dayPattern);
      if (dayMatch) {
        // Save previous day if exists
        if (currentDay) {
          days.push(currentDay);
        }

        const dayNumber = parseInt(dayMatch[1]);
        const dayName = dayMatch[2].trim().toLowerCase();
        const mappedDayName = this.dayNameMapping[dayName] || dayName;

        currentDay = {
          dayNumber,
          dayName: mappedDayName,
          meals: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          description: line
        };
        currentMeal = null;
        continue;
      }

      // Check for meal header
      const mealMatch = line.match(this.mealPattern);
      if (mealMatch && currentDay) {
        // Save previous meal if exists
        if (currentMeal) {
          currentDay.meals.push(currentMeal);
        }

        const mealName = mealMatch[1].trim().toLowerCase();
        const mealDescription = mealMatch[2].trim();
        const mappedMealName = this.mealNameMapping[mealName] || mealName;

        currentMeal = {
          name: mappedMealName,
          ingredients: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          instructions: mealDescription
        };
        continue;
      }

      // Check for ingredient
      const ingredientMatch = line.match(this.ingredientPattern);
      if (ingredientMatch && currentMeal) {
        const rawIngredient = ingredientMatch[1].trim();
        const calories = parseFloat(ingredientMatch[2]);
        const protein = parseFloat(ingredientMatch[3]);
        const carbs = parseFloat(ingredientMatch[4]);
        const fat = parseFloat(ingredientMatch[5]);

        // Check for multi-ingredient combinations
        if (rawIngredient.includes(' + ')) {
          // Split multi-ingredient combinations
          const ingredients = this.splitMultiIngredient(rawIngredient);
          const caloriesPerIngredient = calories / ingredients.length;
          const proteinPerIngredient = protein / ingredients.length;
          const carbsPerIngredient = carbs / ingredients.length;
          const fatPerIngredient = fat / ingredients.length;

          for (const ingredientText of ingredients) {
            const parsedIngredient = this.parseIngredientText(ingredientText);

            const ingredient: ParsedIngredient = {
              name: parsedIngredient.name,
              quantity: parsedIngredient.quantity,
              unit: parsedIngredient.unit,
              calories: caloriesPerIngredient,
              protein: proteinPerIngredient,
              carbs: carbsPerIngredient,
              fat: fatPerIngredient,
              rawText: ingredientText
            };

            currentMeal.ingredients.push(ingredient);
          }
        } else {
          // Single ingredient
          const parsedIngredient = this.parseIngredientText(rawIngredient);

          const ingredient: ParsedIngredient = {
            name: parsedIngredient.name,
            quantity: parsedIngredient.quantity,
            unit: parsedIngredient.unit,
            calories,
            protein,
            carbs,
            fat,
            rawText: rawIngredient
          };

          currentMeal.ingredients.push(ingredient);
        }
        continue;
      }

      // Check for meal total
      const mealTotalMatch = line.match(this.totalPattern);
      if (mealTotalMatch && currentMeal) {
        currentMeal.totalCalories = parseFloat(mealTotalMatch[1]);
        currentMeal.totalProtein = parseFloat(mealTotalMatch[2]);
        currentMeal.totalCarbs = parseFloat(mealTotalMatch[3]);
        currentMeal.totalFat = parseFloat(mealTotalMatch[4]);
        continue;
      }

      // Check for day total
      const dayTotalMatch = line.match(this.dayTotalPattern);
      if (dayTotalMatch && currentDay) {
        currentDay.totalCalories = parseFloat(dayTotalMatch[1]);
        currentDay.totalProtein = parseFloat(dayTotalMatch[2]);
        currentDay.totalCarbs = parseFloat(dayTotalMatch[3]);
        currentDay.totalFat = parseFloat(dayTotalMatch[4]);
        continue;
      }

      // Check for instructions
      if (line.toLowerCase().startsWith('instructions:') && currentMeal) {
        currentMeal.instructions = line.substring(13).trim();
        continue;
      }
    }

    // Save the last day and meal
    if (currentMeal && currentDay) {
      currentDay.meals.push(currentMeal);
    }
    if (currentDay) {
      days.push(currentDay);
    }

    return days;
  }

  private parseIngredientText(text: string): { name: string; quantity: number; unit: string } {
    // Remove common prefixes and clean up the text
    let cleanText = text
      .replace(/^•\s*/, '') // Remove bullet point
      .replace(/^\d+\s*(whole|large|medium|small)\s*/i, '') // Remove "2 whole eggs"
      .trim();

    // Check for multi-ingredient combinations (e.g., "zucchini + peppers + onion")
    if (cleanText.includes(' + ')) {
      // For multi-ingredient combinations, we'll return the first one and let the caller handle splitting
      const firstIngredient = cleanText.split(' + ')[0].trim();
      return this.parseIngredientText(firstIngredient);
    }

    // Common quantity and unit patterns
    const patterns = [
      // "3 egg whites (100 g)" -> quantity: 100, unit: g, name: egg whites
      /^(.+?)\s*\((\d+(?:\.\d+)?)\s*(g|kg|ml|l|oz|lb|tbsp|tsp|cup|cups|slice|slices|piece|pieces)\)/i,
      // "150 g chicken breast" -> quantity: 150, unit: g, name: chicken breast
      /^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|oz|lb|tbsp|tsp|cup|cups|slice|slices|piece|pieces)\s+(.+)$/i,
      // "1 tsp olive oil" -> quantity: 1, unit: tsp, name: olive oil
      /^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|oz|lb|tbsp|tsp|cup|cups|slice|slices|piece|pieces)\s+(.+)$/i,
    ];

    for (const pattern of patterns) {
      const match = cleanText.match(pattern);
      if (match) {
        if (pattern.source.includes('\\(.*\\)')) {
          // Pattern with parentheses: "3 egg whites (100 g)"
          return {
            name: match[1].trim(),
            quantity: parseFloat(match[2]),
            unit: match[3].toLowerCase()
          };
        } else {
          // Regular pattern: "150 g chicken breast"
          return {
            name: match[3].trim(),
            quantity: parseFloat(match[1]),
            unit: match[2].toLowerCase()
          };
        }
      }
    }

    // If no pattern matches, try to extract number and unit from the beginning
    const numberMatch = cleanText.match(/^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|oz|lb|tbsp|tsp|cup|cups|slice|slices|piece|pieces)?/i);
    if (numberMatch) {
      const quantity = parseFloat(numberMatch[1]);
      const unit = numberMatch[2]?.toLowerCase() || 'g';
      const name = cleanText.substring(numberMatch[0].length).trim();
      
      return {
        name: name || cleanText,
        quantity: isNaN(quantity) ? 1 : quantity,
        unit
      };
    }

    // Fallback: return the whole text as name with default quantity and unit
    return {
      name: cleanText,
      quantity: 1,
      unit: 'g'
    };
  }

  // New method to split multi-ingredient combinations
  private splitMultiIngredient(text: string): string[] {
    if (!text.includes(' + ')) {
      return [text];
    }
    
    return text.split(' + ').map(ingredient => ingredient.trim());
  }

  // Helper method to normalize ingredient names for matching
  normalizeIngredientName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  // Helper method to find similar ingredients
  findSimilarIngredients(targetName: string, ingredientList: any[], threshold: number = 0.7): any[] {
    const normalizedTarget = this.normalizeIngredientName(targetName);
    
    return ingredientList
      .map(ingredient => ({
        ...ingredient,
        similarity: this.calculateSimilarity(normalizedTarget, this.normalizeIngredientName(ingredient.name))
      }))
      .filter(ingredient => ingredient.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }

  // Simple similarity calculation using Levenshtein distance
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

export type { ParsedIngredient, ParsedMeal, ParsedDay };

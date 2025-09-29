import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ error: 'Ingredients array is required' }, { status: 400 });
    }

    const results = [];

    for (const ingredientString of ingredients) {
      try {
        // Parse ingredient string (e.g., "100g chicken breast" or "2 eggs")
        const parsed = parseIngredientString(ingredientString);
        if (!parsed) {
          results.push({
            ingredient: ingredientString,
            macros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
            error: 'Could not parse ingredient'
          });
          continue;
        }

        // Search for ingredient in database
        const ingredient = await prisma.ingredient.findFirst({
          where: {
            name: {
              equals: parsed.name.toLowerCase().trim(),
              mode: 'insensitive'
            }
          }
        });

        if (!ingredient) {
          results.push({
            ingredient: ingredientString,
            macros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
            error: 'Ingredient not found in database'
          });
          continue;
        }

        // Calculate macros based on amount
        const multiplier = parsed.amount / 100; // Convert to per 100g basis
        const macros = {
          calories: Math.round(ingredient.calories * multiplier),
          protein: Math.round(ingredient.protein * multiplier),
          carbs: Math.round(ingredient.carbs * multiplier),
          fat: Math.round(ingredient.fat * multiplier),
          fiber: Math.round(ingredient.fiber * multiplier)
        };

        results.push({
          ingredient: ingredientString,
          macros,
          amount: parsed.amount,
          unit: parsed.unit,
          pieces: parsed.pieces || 1
        });
      } catch (error) {
        console.error(`Error processing ingredient ${ingredientString}:`, error);
        results.push({
          ingredient: ingredientString,
          macros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          error: 'Processing error'
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error calculating macros:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function parseIngredientString(ingredientString: string) {
  // Remove extra whitespace and normalize
  const cleaned = ingredientString.trim().replace(/\s+/g, ' ');
  
  // Pattern to match: amount + unit + ingredient name
  // Examples: "100g chicken breast", "2 eggs", "1 cup rice", "50ml milk"
  const patterns = [
    // Pattern 1: number + g/gram/grams + ingredient
    /^(\d+(?:\.\d+)?)\s*(g|gram|grams)\s+(.+)$/i,
    // Pattern 2: number + ml/milliliter + ingredient  
    /^(\d+(?:\.\d+)?)\s*(ml|milliliter|milliliters)\s+(.+)$/i,
    // Pattern 3: number + cup/cups + ingredient
    /^(\d+(?:\.\d+)?)\s*(cup|cups)\s+(.+)$/i,
    // Pattern 4: number + tbsp/tablespoon + ingredient
    /^(\d+(?:\.\d+)?)\s*(tbsp|tablespoon|tablespoons)\s+(.+)$/i,
    // Pattern 5: number + tsp/teaspoon + ingredient
    /^(\d+(?:\.\d+)?)\s*(tsp|teaspoon|teaspoons)\s+(.+)$/i,
    // Pattern 6: number + slice/slices + ingredient
    /^(\d+(?:\.\d+)?)\s*(slice|slices)\s+(.+)$/i,
    // Pattern 7: number + piece/pieces + ingredient
    /^(\d+(?:\.\d+)?)\s*(piece|pieces)\s+(.+)$/i,
    // Pattern 8: number + egg/eggs + ingredient
    /^(\d+(?:\.\d+)?)\s*(egg|eggs)\s+(.+)$/i,
    // Pattern 9: number + ingredient (assume grams)
    /^(\d+(?:\.\d+)?)\s+(.+)$/i,
    // Pattern 10: Just ingredient name (assume 100g)
    /^([a-zA-Z\s&,]+)$/i
  ];

  // Special handling for common ingredient patterns
  const specialPatterns = [
    // "eggs" -> "eggs" with 1 piece (most specific first)
    { pattern: /^eggs$/i, name: 'eggs', amount: 50, pieces: 1 },
    // "scrambled eggs" -> "scrambled eggs" with 1 piece
    { pattern: /^scrambled\s+eggs$/i, name: 'scrambled eggs', amount: 50, pieces: 1 },
    // "boiled eggs" -> "boiled eggs" with 1 piece
    { pattern: /^boiled\s+eggs$/i, name: 'boiled eggs', amount: 50, pieces: 1 },
    // "Omelette (2 eggs" -> "eggs" with 2 pieces
    { pattern: /omelette\s*\((\d+)\s+eggs?/i, name: 'eggs', amount: 50, pieces: 2 },
    // "2 egg whites)" -> "egg whites" with 2 pieces
    { pattern: /(\d+)\s+egg\s+whites?\)?/i, name: 'egg whites', amount: 50, pieces: 2 },
    // "2 eggs" -> "eggs" with 2 pieces
    { pattern: /(\d+)\s+eggs?/i, name: 'eggs', amount: 50, pieces: 2 },
    // "rice" -> "rice" with 1 piece
    { pattern: /^rice$/i, name: 'rice', amount: 100, pieces: 1 },
    // "rice cooked" -> "rice cooked" with 1 piece
    { pattern: /^rice\s+cooked$/i, name: 'rice cooked', amount: 100, pieces: 1 },
    // "rice 100g cooked" -> "rice 100g cooked" with 1 piece
    { pattern: /^rice\s+100g\s+cooked$/i, name: 'rice 100g cooked', amount: 100, pieces: 1 },
    // "½ avocado" (Unicode symbol) -> "avocado" with 0.5 pieces (most specific first)
    { pattern: /½\s+avocado/i, name: 'avocado', amount: 50, pieces: 0.5 },
    // "1/2 avocado" -> "avocado" with 0.5 pieces
    { pattern: /1\/2\s+avocado/i, name: 'avocado', amount: 50, pieces: 0.5 },
    // "half avocado" -> "avocado" with 0.5 pieces
    { pattern: /half\s+avocado/i, name: 'avocado', amount: 50, pieces: 0.5 },
    // "1 avocado" -> "avocado" with 1 piece (less specific, comes after)
    { pattern: /^(\d+)\s+avocado$/i, name: 'avocado', amount: 100, pieces: 1 },
    // "1 slice whole-grain bread" -> "whole-grain bread" with 1 piece
    { pattern: /(\d+)\s+slice\s+whole-grain\s+bread/i, name: 'whole-grain bread', amount: 25, pieces: 1 },
    // "2 slices whole-grain bread" -> "whole-grain bread" with 2 pieces
    { pattern: /(\d+)\s+slices\s+whole-grain\s+bread/i, name: 'whole-grain bread', amount: 25, pieces: 2 },
    // "1 banana" -> "banana" with 1 piece
    { pattern: /(\d+)\s+banana/i, name: 'banana', amount: 100, pieces: 1 },
    // "1 apple" -> "apple" with 1 piece
    { pattern: /(\d+)\s+apple/i, name: 'apple', amount: 100, pieces: 1 },
    // "1 orange" -> "orange" with 1 piece
    { pattern: /(\d+)\s+orange/i, name: 'orange', amount: 100, pieces: 1 },
    // "1 kiwi" -> "kiwi" with 1 piece
    { pattern: /(\d+)\s+kiwi/i, name: 'kiwi', amount: 100, pieces: 1 },
    // "120 g grilled chicken" -> "grilled chicken"
    { pattern: /(\d+)\s*g\s+grilled\s+chicken/i, name: 'grilled chicken', amount: 1 },
    // "150 g baked sweet potato" -> "baked sweet potato"
    { pattern: /(\d+)\s*g\s+baked\s+sweet\s+potato/i, name: 'baked sweet potato', amount: 1 },
    // "green salad" -> "green salad"
    { pattern: /green\s+salad/i, name: 'green salad', amount: 100, pieces: 1 },
    // "cucumber" -> "cucumber" with 1 piece
    { pattern: /cucumber/i, name: 'cucumber', amount: 100, pieces: 1 }
  ];

  // Check special patterns first
  for (const special of specialPatterns) {
    const match = cleaned.match(special.pattern);
    if (match) {
      let amount, pieces;
      if (match[1]) {
        // Pattern with amount
        amount = parseFloat(match[1]) * special.amount;
        pieces = parseFloat(match[1]);
      } else {
        // Pattern without amount (like "green salad")
        amount = special.amount;
        pieces = special.pieces || 1;
      }
      return {
        name: special.name,
        amount: amount,
        unit: 'g',
        pieces: pieces
      };
    }
  }

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let amount, unit, name;
      
      if (match.length === 4) {
        // Pattern with amount, unit, and name
        amount = parseFloat(match[1]);
        unit = match[2] || 'g';
        name = match[3];
      } else if (match.length === 2) {
        // Pattern with just ingredient name
        amount = 100; // Default to 100g
        unit = 'g';
        name = match[1];
      } else {
        continue;
      }
      
      // Convert to grams for calculation
      let amountInGrams = amount;
      if (unit.toLowerCase().includes('ml')) {
        // Assume 1ml = 1g for liquids
        amountInGrams = amount;
      } else if (unit.toLowerCase().includes('cup')) {
        // Rough conversion: 1 cup ≈ 240ml ≈ 240g for most ingredients
        amountInGrams = amount * 240;
      } else if (unit.toLowerCase().includes('tbsp')) {
        // 1 tbsp ≈ 15ml ≈ 15g
        amountInGrams = amount * 15;
      } else if (unit.toLowerCase().includes('tsp')) {
        // 1 tsp ≈ 5ml ≈ 5g
        amountInGrams = amount * 5;
      } else if (unit.toLowerCase().includes('slice')) {
        // Assume 1 slice ≈ 25g for bread
        amountInGrams = amount * 25;
      } else if (unit.toLowerCase().includes('piece')) {
        // Assume 1 piece ≈ 50g
        amountInGrams = amount * 50;
      } else if (unit.toLowerCase().includes('egg')) {
        // 1 large egg ≈ 50g
        amountInGrams = amount * 50;
      }
      
      // Calculate pieces based on unit
      let pieces = 1;
      if (unit.toLowerCase().includes('slice')) {
        pieces = amount;
      } else if (unit.toLowerCase().includes('piece')) {
        pieces = amount;
      } else if (unit.toLowerCase().includes('egg')) {
        pieces = amount;
      } else if (unit.toLowerCase().includes('cup')) {
        pieces = amount;
      } else if (unit.toLowerCase().includes('tbsp')) {
        pieces = amount;
      } else if (unit.toLowerCase().includes('tsp')) {
        pieces = amount;
      }
      
      return {
        name: name.trim(),
        amount: amountInGrams,
        unit: unit.toLowerCase(),
        pieces: pieces
      };
    }
  }
  
  return null;
}

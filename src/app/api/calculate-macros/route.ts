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
        // Filter out placeholder/descriptive text
        const placeholderPatterns = [
          /personalized breakfast based on your goals/i,
          /healthy snack to support your nutrition goals/i,
          /balanced lunch with optimal macronutrients/i,
          /nutritious dinner to complete your daily intake/i,
          /personalized.*based on.*goals/i,
          /healthy.*to support.*nutrition/i,
          /balanced.*with optimal.*macronutrients/i,
          /nutritious.*to complete.*daily/i
        ];
        
        const isPlaceholder = placeholderPatterns.some(pattern => pattern.test(ingredientString));
        if (isPlaceholder) {
          console.log('Skipping placeholder text:', ingredientString);
          continue; // Skip this ingredient entirely
        }
        
        // Parse ingredient string (e.g., "100g chicken breast" or "2 eggs" or "id|name")
        const parsed = parseIngredientString(ingredientString);
        if (!parsed) {
          results.push({
            ingredient: ingredientString,
            macros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
            error: 'Could not parse ingredient'
          });
          continue;
        }

        // Check if ingredient name contains ID (format: "id|name")
        const needle = parsed.name.trim();
        let ingredient;
        
        if (needle.includes('|')) {
          // Extract ID from "id|name" format
          const [ingredientId, ingredientName] = needle.split('|', 2);
          ingredient = await prisma.ingredient.findUnique({
            where: { id: ingredientId.trim() }
          });
          
          if (ingredient) {
            // Found ingredient by ID
          }
        }
        
        // If no ingredient found by ID, search by name
        if (!ingredient) {
          // First try exact match
          let candidates = await prisma.ingredient.findMany({
            where: {
              name: { equals: needle }
            }
          });
          
          // If no exact match, try contains match
          if (candidates.length === 0) {
            candidates = await prisma.ingredient.findMany({
              where: {
                name: { contains: needle }
              }
            });
          }
          
          // If still no match, try without numbers (e.g., "0.5 Banana" -> "Banana")
          if (candidates.length === 0) {
            const nameWithoutNumbers = needle.replace(/^\d+(?:\.\d+)?\s*/, '');
            if (nameWithoutNumbers !== needle) {
              candidates = await prisma.ingredient.findMany({
                where: {
                  OR: [
                    { name: { equals: nameWithoutNumbers } },
                    { name: { contains: nameWithoutNumbers } }
                  ]
                }
              });
            }
          }
          
          if (candidates.length > 0) {
            // Sort to prefer exact matches and unit-appropriate matches
            candidates.sort((a: any, b: any) => {
              const aExact = a.name.toLowerCase() === needle.toLowerCase();
              const bExact = b.name.toLowerCase() === needle.toLowerCase();
              
              // If exact match, prefer it
              if (aExact && !bExact) return -1;
              if (!aExact && bExact) return 1;
              
              // If both or neither are exact, prefer unit-appropriate matches
              const aPer = String(a.per || '').toLowerCase();
              const bPer = String(b.per || '').toLowerCase();
              const parsedUnit = parsed.unit?.toLowerCase();
              
              // If we're looking for tsp, prefer tsp versions
              if (parsedUnit === 'tsp') {
                const aIsTsp = aPer.includes('tsp');
                const bIsTsp = bPer.includes('tsp');
                if (aIsTsp && !bIsTsp) return -1;
                if (!aIsTsp && bIsTsp) return 1;
              }
              
              // If we're looking for specific tsp ingredients, prefer exact matches
              if (parsedUnit === 'tsp' && needle.toLowerCase().includes('coconut oil')) {
                const aIsTspCoconut = aPer.includes('tsp') && a.name.toLowerCase().includes('coconut oil');
                const bIsTspCoconut = bPer.includes('tsp') && b.name.toLowerCase().includes('coconut oil');
                if (aIsTspCoconut && !bIsTspCoconut) return -1;
                if (!aIsTspCoconut && bIsTspCoconut) return 1;
              }
              
              // If we're looking for tbsp, prefer tbsp versions
              if (parsedUnit === 'tbsp') {
                const aIsTbsp = aPer.includes('tbsp');
                const bIsTbsp = bPer.includes('tbsp');
                if (aIsTbsp && !bIsTbsp) return -1;
                if (!aIsTbsp && bIsTbsp) return 1;
              }
              
              // Prefer piece-based ingredients for piece units
              if (parsed.unit === 'piece' || (parsed.pieces && typeof parsed.pieces === 'number' && parsed.pieces > 1)) {
                const aIsPiece = aPer.includes('1') && !aPer.includes('g') && !aPer.includes('ml');
                const bIsPiece = bPer.includes('1') && !bPer.includes('g') && !bPer.includes('ml');
                if (aIsPiece && !bIsPiece) return -1;
                if (!aIsPiece && bIsPiece) return 1;
              }
              
              return 0;
            });
            
            ingredient = candidates[0];
          }
        }
        
        if (!ingredient) {
          results.push({
            ingredient: ingredientString,
            macros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
            error: 'Ingredient not found in database'
          });
          continue;
        }

        // Compute multiplier based on ingredient.per
        const per = String(ingredient.per || '').toLowerCase();
        let multiplier = 0;
        const gramM = per.match(/(\d+(?:\.\d+)?)\s*g/);
        const mlM = per.match(/(\d+(?:\.\d+)?)\s*ml/);
        const tspM = per.match(/(\d+(?:\.\d+)?)\s*tsp/);
        const tbspM = per.match(/(\d+(?:\.\d+)?)\s*tbsp/);
        const pieceM = per.match(/(\d+(?:\.\d+)?)\s*(piece|pieces|slice|slices|stuks)/);
        if (gramM) {
          const base = parseFloat(gramM[1]) || 100;
          multiplier = (parsed.amount || 0) / base; // parsed.amount already grams
        } else if (mlM) {
          const base = parseFloat(mlM[1]) || 100;
          multiplier = (parsed.amount || 0) / base; // treat ml≈g
        } else if (tspM) {
          const baseTsp = parseFloat(tspM[1]) || 1;
          // For tsp, we need to check if the parsed unit is tsp
          if (parsed.unit === 'tsp') {
            multiplier = (parsed.amount || 0) / baseTsp;
          } else {
            // If parsed amount is in grams, convert tsp to grams (1 tsp ≈ 5g)
            const tspInGrams = (parsed.amount || 0) / 5; // Convert grams to tsp
            multiplier = tspInGrams / baseTsp;
          }
        } else if (tbspM) {
          const baseTbsp = parseFloat(tbspM[1]) || 1;
          // For tbsp, we need to check if the parsed unit is tbsp
          if (parsed.unit === 'tbsp') {
            multiplier = (parsed.amount || 0) / baseTbsp;
          } else {
            // If parsed amount is in grams, convert tbsp to grams (1 tbsp ≈ 15g)
            const tbspInGrams = (parsed.amount || 0) / 15; // Convert grams to tbsp
            multiplier = tbspInGrams / baseTbsp;
          }
        } else if (pieceM) {
          const basePieces = parseFloat(pieceM[1]) || 1;
          const pcs = parsed.pieces && typeof parsed.pieces === 'number' && parsed.pieces > 0 ? parsed.pieces : 1;
          multiplier = (pcs || 1) / basePieces;
        } else {
          // For simple numbers like "1", treat as 1 piece
          const numMatch = per.match(/^(\d+(?:\.\d+)?)$/);
          if (numMatch) {
            const basePieces = parseFloat(numMatch[1]) || 1;
            const pcs = parsed.pieces && typeof parsed.pieces === 'number' && parsed.pieces > 0 ? parsed.pieces : 1;
            multiplier = pcs / basePieces;
          } else {
            // Fallback assume per 100g
            multiplier = (parsed.amount || 0) / 100;
          }
        }

        const macros = {
          calories: Math.round((ingredient.calories ?? 0) * multiplier),
          protein: Math.round((ingredient.protein ?? 0) * multiplier),
          carbs: Math.round((ingredient.carbs ?? 0) * multiplier),
          fat: Math.round((ingredient.fat ?? 0) * multiplier),
          fiber: Math.round((ingredient.fiber ?? 0) * multiplier)
        };

        results.push({
          ingredient: ingredientString,
          macros,
          amount: parsed.amount,
          unit: parsed.unit,
          pieces: parsed.pieces || 1,
          nameRo: ingredient.nameRo || ingredient.name, // Include Romanian translation
          nameEn: ingredient.name
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

    const response = NextResponse.json({ results });
    
    // Add cache control headers to prevent stale data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error calculating macros:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function parseIngredientString(ingredientString: string) {
  // Remove extra whitespace and normalize
  const cleaned = ingredientString.trim().replace(/\s+/g, ' ');
  
  // Check if it's an ID format first (e.g., "id|name" or "1 id|name")
  if (cleaned.includes('|')) {
    const parts = cleaned.split('|');
    if (parts.length >= 2) {
      // Check if the first part contains a quantity (e.g., "1 cmgbfexoi01be8igvuow7a57d")
      const firstPart = parts[0].trim();
      const quantityMatch = firstPart.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
      
      if (quantityMatch) {
        // Format: "1 cmgbfexoi01be8igvuow7a57d|1 Beef Steak" or "100g cmgbf5ljc017j8igvp7v9hmpk|Whole Wheat Bread"
        const quantity = parseFloat(quantityMatch[1]);
        const ingredientId = quantityMatch[2];
        const ingredientName = parts.slice(1).join('|').trim();
        
        // Check if the quantity part contains a unit (g, ml, etc.)
        const unitMatch = firstPart.match(/(\d+(?:\.\d+)?)\s*(g|ml|gram|grams|milliliter|milliliters)\s+(.+)$/i);
        if (unitMatch) {
          // Format: "100g cmgbf5ljc017j8igvp7v9hmpk|Whole Wheat Bread"
          const unit = unitMatch[2].toLowerCase() === 'g' || unitMatch[2].toLowerCase() === 'gram' || unitMatch[2].toLowerCase() === 'grams' ? 'g' : 'ml';
          return {
            name: `${ingredientId}|${ingredientName}`,
            amount: quantity,
            unit: unit,
            pieces: 1
          };
        } else {
          // Format: "1 cmgbfexoi01be8igvuow7a57d|1 Beef Steak" or "100 cmgbf5ljc017j8igvp7v9hmpk|Whole Wheat Bread"
          // Check if the ingredient name contains slice/piece indicators
          const nameLower = ingredientName.toLowerCase();
          if (nameLower.includes('slice') || nameLower.includes('piece') || nameLower.includes('stuk') || nameLower.includes('1 ')) {
            // Piece-based ingredient
            return {
              name: `${ingredientId}|${ingredientName}`,
              amount: quantity * 50, // Convert to grams for piece-based items
              unit: 'piece',
              pieces: quantity
            };
          } else {
            // Gram-based ingredient
            return {
              name: `${ingredientId}|${ingredientName}`,
              amount: quantity,
              unit: 'g',
              pieces: 1
            };
          }
        }
      } else {
        // Format: "cmgbfexoi01be8igvuow7a57d|1 Beef Steak"
        const ingredientId = firstPart;
        const ingredientName = parts.slice(1).join('|').trim();
        
        return {
          name: cleaned,
          amount: 100,
          unit: 'g',
          pieces: 1
        };
      }
    }
  }
  
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
    // Handle double numbers like "0.5 1 Banana" -> "1 Banana" (use the piece version)
    { pattern: /^(\d+(?:\.\d+)?)\s+1\s+(.+)$/i, name: (match: RegExpMatchArray) => `1 ${match[2]}`, amount: (match: RegExpMatchArray) => parseFloat(match[1]) * 50, pieces: (match: RegExpMatchArray) => parseFloat(match[1]) },
    // Handle "1 1 Egg" -> "1 Egg"
    { pattern: /^1\s+1\s+(.+)$/i, name: (match: RegExpMatchArray) => `1 ${match[1]}`, amount: 50, pieces: 1 },
    // Handle "10 Egg Whites" -> "Egg Whites" with 10 pieces
    { pattern: /^(\d+)\s+egg\s+whites?$/i, name: 'Egg Whites', amount: (match: RegExpMatchArray) => parseFloat(match[1]) * 33, pieces: (match: RegExpMatchArray) => parseFloat(match[1]) },
    // Handle "0.25 Baking Powder" -> "Baking Powder" with tsp unit
    { pattern: /^(\d+(?:\.\d+)?)\s+baking\s+powder$/i, name: 'Baking Powder', amount: (match: RegExpMatchArray) => parseFloat(match[1]) * 5, unit: 'tsp', pieces: (match: RegExpMatchArray) => parseFloat(match[1]) },
    // Handle "0.5 Coconut Oil" -> "1 tsp Coconut Oil" with tsp unit
    { pattern: /^(\d+(?:\.\d+)?)\s+coconut\s+oil$/i, name: '1 tsp Coconut Oil', amount: (match: RegExpMatchArray) => parseFloat(match[1]) * 5, unit: 'tsp', pieces: (match: RegExpMatchArray) => parseFloat(match[1]) },
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
    { pattern: /cucumber/i, name: 'cucumber', amount: 100, pieces: 1 },
    // "1 scoop protein powder" -> "scoop protein powder" with 1 piece
    { pattern: /(\d+)\s+scoop\s+protein\s+powder/i, name: 'scoop protein powder', amount: 30, pieces: 1 }
  ];

  // Additional specials for common items with piece defaults
  const extraPieceMap: Array<{ pattern: RegExp; name: string; gramsPerPiece: number }> = [
    { pattern: /(\d+)\s+carrots?/i, name: 'carrot', gramsPerPiece: 61 },
    { pattern: /(\d+)\s+chicken\s+thighs?/i, name: 'chicken thigh', gramsPerPiece: 100 },
  ];
  for (const extra of extraPieceMap) {
    const m = cleaned.match(extra.pattern);
    if (m) {
      const n = parseFloat(m[1]);
      return { name: extra.name, amount: n * extra.gramsPerPiece, unit: 'g', pieces: n };
    }
  }

  // Check special patterns first
  for (const special of specialPatterns) {
    const match = cleaned.match(special.pattern);
    if (match) {
      let amount, pieces, name;
      
      // Handle function-based patterns (new style)
      if (typeof special.name === 'function') {
        name = special.name(match);
        amount = typeof special.amount === 'function' ? special.amount(match) : special.amount;
        pieces = typeof special.pieces === 'function' ? special.pieces(match) : (special.pieces || 1);
      } else {
        // Handle string-based patterns (old style)
        name = special.name;
        if (match[1]) {
          // Pattern with amount
          amount = parseFloat(match[1]) * (typeof special.amount === 'number' ? special.amount : 1);
          pieces = parseFloat(match[1]);
        } else {
          // Pattern without amount (like "green salad")
          amount = typeof special.amount === 'number' ? special.amount : 1;
          pieces = special.pieces || 1;
        }
      }
      
      return {
        name: name,
        amount: amount,
        unit: special.unit || 'g',
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
      } else if (match.length === 3) {
        // Pattern with amount and name (no unit): assume pieces for some items; otherwise grams
        amount = parseFloat(match[1]);
        name = match[2];
        // Heuristic: if name contains words suggesting piece-like items
        if (/\b(egg|eggs|carrot|banana|apple|orange|kiwi|thigh|piece|slice|steak|breast|fillet)\b/i.test(name)) {
          unit = 'piece';
          // For piece-based items, keep the full name including the number for better database matching
          name = `${amount} ${name}`;
        } else {
          unit = 'g';
        }
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

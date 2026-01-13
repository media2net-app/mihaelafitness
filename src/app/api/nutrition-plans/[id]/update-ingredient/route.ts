import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to find ingredient in database and get all possible name variations
async function findIngredientNames(targetName: string): Promise<string[]> {
  const normalizedTarget = targetName.toLowerCase().trim();
  const variations: string[] = [normalizedTarget];
  
  // Try to find ingredient in database by name or nameRo
  const ingredient = await prisma.ingredient.findFirst({
    where: {
      OR: [
        { name: { equals: targetName, mode: 'insensitive' } },
        { nameRo: { equals: targetName, mode: 'insensitive' } }
      ]
    }
  });
  
  if (ingredient) {
    // Add both English and Romanian names if available
    if (ingredient.name) {
      variations.push(ingredient.name.toLowerCase().trim());
    }
    if (ingredient.nameRo) {
      variations.push(ingredient.nameRo.toLowerCase().trim());
    }
  }
  
  return [...new Set(variations)]; // Remove duplicates
}

interface Body {
  dayKey: string;
  mealType: string; // breakfast|snack|lunch|dinner (lowercase)
  name: string; // ingredient display name
  newAmount: number; // numeric amount
  unit: string; // g|ml|tsp|tbsp|scoop|piece|pieces|slice
  ingredientString?: string; // optional: exact ingredient string to match (for precise updates)
  index?: number; // optional: index of ingredient to update (0-based)
}

function splitMeal(meal: string): string[] {
  if (!meal || typeof meal !== 'string') return [];
  // unify delimiters
  const cleaned = meal.replace(/\s*\+\s*/g, ',');
  return cleaned
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

function normalizeNamePart(part: string): string {
  // Remove ID prefix if present (format: "quantity id|name")
  let cleanPart = part;
  if (cleanPart.includes('|')) {
    // Format: "55 cmgbf5jgf016v8igv5viv7qkz|Chicken Breast" -> "Chicken Breast"
    const pipeIndex = cleanPart.indexOf('|');
    cleanPart = cleanPart.substring(pipeIndex + 1).trim();
  }
  
  // Remove quantity and unit prefix (handles both "55g Name" and "55 g Name")
  cleanPart = cleanPart
    .replace(/^\s*\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms|piece|pieces|slice|stuks|stuk|buc|bucăți|tsp|tbsp|scoop)?\s*/i, '')
    .trim();
  
  // Remove parentheses content (e.g., "Paste (fiert)" -> "Paste")
  cleanPart = cleanPart.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  
  return cleanPart.toLowerCase();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Body = await request.json();
    const dayKey = (body.dayKey || '').toLowerCase();
    const mealType = (body.mealType || '').toLowerCase();
    const name = (body.name || '').trim();
    const newAmount = Number(body.newAmount);
    const unit = (body.unit || 'g').trim();

    if (!dayKey || !mealType || !name || !Number.isFinite(newAmount) || newAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const plan = await prisma.nutritionPlan.findUnique({ where: { id } });
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const weekMenu: any = plan.weekMenu || {};
    const dayMenu: any = weekMenu[dayKey] || {};
    const mealData: any = dayMenu[mealType];
    const isObjectMeal = mealData && typeof mealData === 'object' && ('ingredients' in mealData);
    const meal: string = typeof mealData === 'string' ? mealData : (isObjectMeal ? (mealData.ingredients || '') : '');

    // Check if meal has a RECIPE prefix and extract it
    const recipePrefixMatch = meal.match(/^(\[RECIPE:[^\]]+\]\s*)/);
    const recipePrefix = recipePrefixMatch ? recipePrefixMatch[1] : '';
    const mealWithoutPrefix = recipePrefix ? meal.substring(recipePrefix.length) : meal;

    const parts = splitMeal(mealWithoutPrefix);
    const targetLower = name.toLowerCase().trim();
    const ingredientString = body.ingredientString || '';
    const targetIndex = body.index !== undefined ? body.index : -1;
    
    // Get all name variations (English, Romanian, etc.) for better matching
    const nameVariations = await findIngredientNames(name);
    console.log('[update-ingredient] Searching for ingredient:', { name, targetLower, nameVariations, ingredientString, targetIndex, meal, partsCount: parts.length });
    console.log('[update-ingredient] Parts:', parts.map(p => ({ original: p, normalized: normalizeNamePart(p) })));

    let changed = false;
    let matchCount = 0; // Track how many matches we've found
    
    const updatedParts = parts.map((p, idx) => {
      // If ingredientString is provided, use exact match first
      if (ingredientString && p.trim() === ingredientString.trim()) {
        changed = true;
        console.log('[update-ingredient] Exact string match found! Updating:', p);
        
        // Update the exact match
        if (p.includes('|')) {
          const parts = p.split('|');
          const idPart = parts[0];
          const namePart = parts.slice(1).join('|');
          const idMatch = idPart.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
          if (idMatch) {
            const ingredientId = idMatch[2];
            return `${newAmount}${unit} ${ingredientId}|${namePart}`.trim();
          }
        }
        const recipeFormatMatch = p.match(/^(\d+(?:\.\d+)?)\s*(g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms)\s+(.+)$/i);
        if (recipeFormatMatch) {
          const originalName = recipeFormatMatch[3].trim();
          return `${newAmount}${unit} ${originalName}`.trim();
        }
        if (unit.toLowerCase() === 'piece' || unit.toLowerCase() === 'pieces') {
          return `${newAmount} ${name}`.trim();
        }
        return `${newAmount}${unit} ${name}`.trim();
      }
      
      const pName = normalizeNamePart(p);
      // Check if normalized part name matches any variation of the target name
      const matches = nameVariations.some(variation => {
        const normalizedVariation = normalizeNamePart(variation);
        return pName === normalizedVariation;
      }) || pName === targetLower;
      
      // If index is provided, only update at that specific index if name also matches
      if (targetIndex >= 0) {
        if (idx === targetIndex && matches) {
          changed = true;
          console.log('[update-ingredient] Match at specified index! Updating:', p);
        } else {
          return p; // Don't update this one
        }
      } 
      // If no index specified, only update first match
      else {
        if (matches && matchCount === 0) {
          matchCount++;
          changed = true;
          console.log('[update-ingredient] First match found! Updating:', p);
        } else {
          return p; // Don't update this one
        }
      }
      
      console.log('[update-ingredient] Comparing:', { 
        idx,
        pName, 
        targetLower, 
        nameVariations: nameVariations.map(v => normalizeNamePart(v)),
        match: matches,
        matchCount,
        targetIndex,
        shouldUpdate: (targetIndex >= 0 && idx === targetIndex && matches) || (targetIndex < 0 && matches && matchCount === 1)
      });
      
      // Only proceed if we've already determined this should be updated
      const shouldUpdate = (targetIndex >= 0 && idx === targetIndex && matches) || (targetIndex < 0 && matches && matchCount === 1);
      if (!shouldUpdate) {
        return p;
      }
      
      // Check if the original part has an ID format
      if (p.includes('|')) {
          // Extract ID and reconstruct with new amount
          const parts = p.split('|');
          const idPart = parts[0];
          const namePart = parts.slice(1).join('|');
          
          // Parse the ID part to extract quantity and ID
          const idMatch = idPart.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
          if (idMatch) {
            const ingredientId = idMatch[2];
            const updated = `${newAmount} ${ingredientId}|${namePart}`.trim();
            console.log('[update-ingredient] ID format updated:', { old: p, new: updated });
            return updated;
          } else {
            // Fallback: treat as simple ID
            const updated = `${newAmount} ${idPart}|${namePart}`.trim();
            console.log('[update-ingredient] ID format (fallback) updated:', { old: p, new: updated });
            return updated;
          }
        } else {
          // Check if it's a recipe format: "55g Beef" or "55g Carne de Vită"
          const recipeFormatMatch = p.match(/^(\d+(?:\.\d+)?)\s*(g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms)\s+(.+)$/i);
          if (recipeFormatMatch) {
            // Recipe format - keep the original name from the meal string, only update quantity
            const originalName = recipeFormatMatch[3].trim();
            const updated = `${newAmount}${unit} ${originalName}`.trim();
            console.log('[update-ingredient] Recipe format updated:', { old: p, new: updated, originalName });
            return updated;
          }
          
          // For count-based items (piece/pieces), do not glue unit to the number
          if (unit.toLowerCase() === 'piece' || unit.toLowerCase() === 'pieces') {
            const displayName = name;
            const updated = `${newAmount} ${displayName}`.trim();
            console.log('[update-ingredient] Piece format updated:', { old: p, new: updated });
            return updated;
          }
          const updated = `${newAmount}${unit} ${name}`.trim();
          console.log('[update-ingredient] Standard format updated:', { old: p, new: updated });
          return updated;
        }
      
      return p;
    });

    // Reconstruct meal string with RECIPE prefix if it existed
    const newMeal = recipePrefix + updatedParts.join(', ');
    console.log('[update-ingredient] Result:', { changed, oldMeal: meal, newMeal, recipePrefix });
    
    if (!changed) {
      // If not found, return original without error to avoid breaking UI
      console.warn('[update-ingredient] Ingredient not found in meal:', { name, targetLower, parts: parts.map(normalizeNamePart) });
      return NextResponse.json({ success: false, meal: meal, message: 'Ingredient not found in meal' });
    }

    // Write back depending on structure
    if (isObjectMeal) {
      weekMenu[dayKey] = {
        ...dayMenu,
        [mealType]: {
          ...mealData,
          ingredients: newMeal,
        }
      };
    } else {
      weekMenu[dayKey] = { ...dayMenu, [mealType]: newMeal };
    }

    console.log('[update-ingredient] Updating database with weekMenu:', JSON.stringify(weekMenu[dayKey][mealType], null, 2));
    
    const updated = await prisma.nutritionPlan.update({
      where: { id },
      data: { weekMenu },
    });

    console.log('[update-ingredient] Database updated successfully. Returning updated plan.');
    
    return NextResponse.json({ success: true, meal: newMeal, plan: updated });
  } catch (e) {
    console.error('Error updating ingredient amount:', e);
    return NextResponse.json({ error: 'Failed to update ingredient amount' }, { status: 500 });
  }
}

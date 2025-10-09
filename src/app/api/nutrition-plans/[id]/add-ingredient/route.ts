import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { ingredientId, quantity, dayKey, mealType } = body;

    // Validate required fields
    if (!ingredientId || !quantity || !dayKey || !mealType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the ingredient details
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId }
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    // Get the current nutrition plan
    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { id }
    });

    if (!nutritionPlan) {
      return NextResponse.json(
        { error: 'Nutrition plan not found' },
        { status: 404 }
      );
    }

    // Parse the current weekMenu and ensure structure exists
    const weekMenu = (nutritionPlan.weekMenu as any) || {};
    if (!weekMenu[dayKey]) {
      weekMenu[dayKey] = {};
    }
    if (typeof weekMenu[dayKey][mealType] !== 'string') {
      // Initialize missing meal with empty string
      weekMenu[dayKey][mealType] = '';
    }

    // Get the current meal description
    const currentMeal = String(weekMenu[dayKey][mealType] || '');
    
    // Parse base unit from ingredient.per and aliases (e.g., "100g", "250ml", "1 piece", "1 cup")
    const per = (ingredient as any).per as string || '';
    const aliases: string[] = Array.isArray((ingredient as any).aliases) ? (ingredient as any).aliases : [];
    const parseBase = (perStr: string, aliases: string[]): { amount: number; unit: 'g' | 'ml' | 'piece' | 'cup' } => {
      const g = perStr.match(/(\d+(?:\.\d+)?)\s*g/i);
      if (g) return { amount: parseFloat(g[1]), unit: 'g' };
      const ml = perStr.match(/(\d+(?:\.\d+)?)\s*ml/i);
      if (ml) return { amount: parseFloat(ml[1]), unit: 'ml' };
      const cup = perStr.match(/(\d+(?:\.\d+)?)\s*(cup|cups)/i);
      if (cup) return { amount: parseFloat(cup[1]), unit: 'cup' };
      const piece = perStr.match(/(\d+(?:\.\d+)?)\s*(piece|pieces|slice|slices|stuks)/i);
      if (piece) return { amount: parseFloat(piece[1]), unit: 'piece' };
      const numOnly = perStr.match(/^\s*(\d+(?:\.\d+)?)\s*$/);
      if (numOnly) {
        const amt = parseFloat(numOnly[1]);
        const aliasStr = (() => {
          try {
            const aliasesArray = typeof aliases === 'string' ? JSON.parse(aliases) : aliases;
            return Array.isArray(aliasesArray) ? aliasesArray.join(' ').toLowerCase() : '';
          } catch {
            return '';
          }
        })();
        // Check ingredient name for slice/piece indicators
        const ingredientName = (ingredient as any).name || '';
        const nameLower = ingredientName.toLowerCase();
        if (nameLower.includes('slice') || nameLower.includes('piece') || nameLower.includes('stuk')) {
          return { amount: amt, unit: 'piece' };
        }
        if (aliasStr.includes('type:gram')) return { amount: amt, unit: 'g' };
        if (aliasStr.includes('type:ml')) return { amount: amt, unit: 'ml' };
        if (aliasStr.includes('type:cup')) return { amount: amt, unit: 'cup' };
        if (aliasStr.includes('type:piece') || aliasStr.includes('type:stuks')) return { amount: amt, unit: 'piece' };
        return { amount: amt, unit: 'g' };
      }
      return { amount: 100, unit: 'g' };
    };
    const base = parseBase(per, aliases);
    const factor = quantity / (base.amount || 1);
    const addedCalories = Math.round((ingredient as any).calories * factor);
    const addedProtein = Math.round((ingredient as any).protein * factor * 10) / 10;
    const addedCarbs = Math.round((ingredient as any).carbs * factor * 10) / 10;
    const addedFat = Math.round((ingredient as any).fat * factor * 10) / 10;

    // Helpers for normalization and parsing
    type Unit = 'g' | 'ml' | 'cup' | 'piece';
    type Item = { name: string; qty: number; unit: Unit };

    const normalizeNameOnly = (s: string): string => {
      return s
        .replace(/^[^A-Za-z0-9(]*/, '')
        .replace(/^[\s\t]*/, '')
        .replace(/^\s*\d+(?:\.\d+)?\s*(g|gram|grams|ml|milliliter|milliliters|tsp|tbsp|teaspoon|tablespoon|scoop|slice|cup|cups|piece|pieces|stuks)?\s*/i, '')
        .replace(/^\s*\d+\s+/, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    };

    const parsePart = (part: string): Item | null => {
      let s = part.trim();
      if (!s) return null;
      // Collapse malformed patterns like "3 1 Egg" -> "3 Egg", "1 1 Avocado" -> "1 Avocado"
      let m = s.match(/^\s*(\d+(?:\.\d+)?)\s+1\s+(.+)$/i);
      if (m) s = `${m[1]} ${m[2]}`;
      m = s.match(/^\s*1\s+1\s+(.+)$/i);
      if (m) s = `1 ${m[1]}`;

      // 100g Name or 250ml Name (but convert '1g 1 Slice Name' -> '1 piece Name')
      m = s.match(/^\s*(\d+(?:\.\d+)?)\s*(g|ml)\s+(.+)$/i);
      if (m) {
        const qty = parseFloat(m[1]);
        const unitRaw = m[2].toLowerCase();
        const nameFull = m[3].trim();
        
        // Check if this is an ID format first (e.g., "id|name")
        if (nameFull.includes('|')) {
          const unit = unitRaw as Unit;
          return { name: nameFull, qty, unit };
        }
        
        // If name starts with '<N> slice(s) ' treat as pieces
        const sm = nameFull.match(/^\s*(\d+(?:\.\d+)?)\s*(slice|slices)\b\s*(.+)$/i);
        if (sm) {
          const pieces = parseFloat(sm[1]);
          const restName = sm[3].trim();
          return { name: `${sm[2].toLowerCase().includes('slice') ? 'Slice ' : ''}${restName}`.trim(), qty: pieces, unit: 'piece' };
        }
        const unit = unitRaw as Unit;
        return { name: nameFull, qty, unit };
      }
      // N cup(s) Name
      m = s.match(/^\s*(\d+(?:\.\d+)?)\s*(cup|cups)\s+(.+)$/i);
      if (m) {
        const qty = parseFloat(m[1]);
        const unit: Unit = 'cup';
        const name = m[3].trim();
        return { name, qty, unit };
      }
      // Piece-like: N Name
      m = s.match(/^\s*(\d+(?:\.\d+)?)\s+(.+)$/i);
      if (m) {
        const qty = parseFloat(m[1]);
        const name = m[2].trim();
        return { name, qty, unit: 'piece' };
      }
      // Name only -> treat as 1 piece
      const nm = s.trim();
      if (nm) return { name: nm, qty: 1, unit: 'piece' };
      return null;
    };

    const formatItem = (it: Item): string => {
      // Always use simple format: "quantity id|name" regardless of unit
      return `${it.qty} ${it.name}`;
    };

    // Build a map from existing meal
    const parts = currentMeal
      .replace(/\s*\+\s*/g, ',')
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    const map = new Map<string, Item>();
    for (const p of parts) {
      const it = parsePart(p);
      if (!it) continue;
      const key = `${normalizeNameOnly(it.name)}|${it.unit}`;
      const ex = map.get(key);
      if (ex) {
        ex.qty += it.qty;
      } else {
        map.set(key, it);
      }
    }

    // Normalize the new ingredient as an Item - always use simple format: "quantity id|name"
    const newItem: Item = { 
      name: `${ingredient.id}|${ingredient.name}`, 
      qty: quantity, 
      unit: base.unit 
    };

    // Merge into map (dedupe by normalized name + unit)
    const newKey = `${normalizeNameOnly(newItem.name)}|${newItem.unit}`;
    const existing = map.get(newKey);
    if (existing) {
      existing.qty += newItem.qty;
    } else {
      map.set(newKey, newItem);
    }

    // Rebuild canonical meal string
    const updatedMeal = Array.from(map.values()).map(formatItem).join(', ');
    
    console.log('🔍 Adding ingredient to meal:', {
      currentMeal,
      updatedMeal,
      dayKey,
      mealType
    });
    
    // Update the weekMenu
    const updatedWeekMenu = {
      ...weekMenu,
      [dayKey]: {
        ...weekMenu[dayKey],
        [mealType]: updatedMeal
      }
    };

    // Update the nutrition plan in the database
    const updatedPlan = await prisma.nutritionPlan.update({
      where: { id },
      data: {
        weekMenu: updatedWeekMenu
      }
    });

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      addedIngredient: {
        name: ingredient.name,
        quantity,
        calories: addedCalories,
        protein: addedProtein,
        carbs: addedCarbs,
        fat: addedFat
      }
    });

  } catch (error) {
    console.error('Error adding ingredient to meal:', error);
    return NextResponse.json(
      { error: 'Failed to add ingredient to meal' },
      { status: 500 }
    );
  }
}

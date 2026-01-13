'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChefHat, 
  ArrowLeft, 
  Edit, 
  Save, 
  Trash2, 
  Copy, 
  Download,
  Users,
  Calendar,
  Target,
  Apple,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Plus,
  X,
  Search,
  ShoppingCart,
  ChefHat as ChefIcon,
  Sunrise,
  UtensilsCrossed,
  Moon,
  Cherry,
  CircleDot
} from 'lucide-react';
import IngredientSelectorV2 from './IngredientSelectorV2';
import { calculateDailyTotalsV3 } from '@/utils/dailyTotalsV3';

interface Ingredient {
  id: string;
  name: string;
  per: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  category?: string;
  aliases: string[];
}

export default function NutritionPlanDetailV2Page() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeDay, setActiveDay] = useState('monday');
  const [activeTab, setActiveTab] = useState<'menu' | 'ingredients' | 'shopping'>('menu');
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [dailyTotals, setDailyTotals] = useState<any>(null);
  const [mealMacros, setMealMacros] = useState<{[key: string]: any}>({});
  const [mealIngredientDetails, setMealIngredientDetails] = useState<Record<string, Array<{ name: string; portion: string; calories: number; protein: number; carbs: number; fat: number }>>>({});
  const [forceUpdate, setForceUpdate] = useState(0);
  const [macroPct, setMacroPct] = useState<{ proteinPct: number; carbsPct: number; fatPct: number } | null>(null);
  const [editMacroOpen, setEditMacroOpen] = useState(false);
  const [editProteinPct, setEditProteinPct] = useState<number>(30);
  const [editCarbsPct, setEditCarbsPct] = useState<number>(45);
  const [editFatPct, setEditFatPct] = useState<number>(25);

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];

  // Helper: get meal string from day data (same as original)
  const getMealString = (dayData: any, mealType: string): string => {
    if (!dayData || typeof dayData !== 'object') return '';
    
    const mealData = dayData[mealType];
    
    // New structure: { ingredients: string, cookingInstructions: string }
    if (mealData && typeof mealData === 'object' && mealData.ingredients) {
      return mealData.ingredients;
    }
    
    // Old structure: direct string
    if (typeof mealData === 'string') {
      return mealData;
    }
    
    // Fallback: try capitalized key
    const capKey = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    const capVal = dayData[capKey];
    if (capVal && typeof capVal === 'object' && capVal.ingredients) {
      return capVal.ingredients;
    }
    if (typeof capVal === 'string') {
      return capVal;
    }
    
    return '';
  };

  // Helper function to clean individual ingredients with smart unit detection
  const cleanIngredient = (ingredient: string): string => {
    let cleaned = ingredient.trim();
    
    // Remove DB id pipes if present (e.g., "20 cmg123|Bacon" -> "20g Bacon")
    if (cleaned.includes('|')) {
      const pipeParts = cleaned.split('|');
      const beforePipe = pipeParts[0].trim(); // "20"
      const afterPipe = pipeParts[pipeParts.length - 1].trim(); // "Bacon"
      
      // Smart unit detection based on ingredient type
      if (/^\d+$/.test(beforePipe)) {
        const ingredientName = afterPipe.toLowerCase();
        
        // Ingredients that are typically measured in pieces
        const pieceIngredients = [
          'egg', 'eggs', 'cucumber', 'cucumbers', 'banana', 'bananas',
          'apple', 'apples', 'orange', 'oranges', 'slice', 'slices',
          'piece', 'pieces', 'bread', 'loaf', 'loaves'
        ];
        
        // Check if ingredient name contains piece-related keywords
        const isPieceIngredient = pieceIngredients.some(keyword => 
          ingredientName.includes(keyword)
        );
        
        if (isPieceIngredient) {
          cleaned = `${beforePipe} pieces ${afterPipe}`.trim();
        } else {
          cleaned = `${beforePipe}g ${afterPipe}`.trim();
        }
      } else {
        cleaned = `${beforePipe} ${afterPipe}`.trim();
      }
    }
    
    // Additional cleanup: remove any remaining DB IDs that might be in the middle
    cleaned = cleaned.replace(/\b[a-z0-9]{24,28}\b/g, '').replace(/\s{2,}/g, ' ').trim();
    
    return cleaned;
  };

  const parseMealDescription = (mealDescription: string): string[] => {
    console.log('🔍 [V2] DEBUG: Parsing meal description:', mealDescription);
    
    if (!mealDescription || mealDescription.trim() === '') {
      return [];
    }

    // Clean the description (remove DB IDs) - SAME AS V1
    let cleaned = mealDescription.replace(/[a-z0-9]{26}\|/g, '');
    
    console.log('🔍 [V2] DEBUG: Cleaned description:', cleaned);

    // Try different separators - SAME AS V1
    let ingredients: string[] = [];

    // Try comma separation first
    if (cleaned.includes(',')) {
      ingredients = cleaned.split(',').map(ing => {
        let cleaned = ing.trim();
        
        // Add unit if missing - same logic as V1
        if (/^\d+$/.test(cleaned.split(' ')[0])) {
          const parts = cleaned.split(' ');
          const quantity = parts[0];
          const ingredientName = parts.slice(1).join(' ');
          
          // Smart unit detection based on ingredient type
          const ingredientNameLower = ingredientName.toLowerCase();
          const pieceIngredients = [
            'egg', 'eggs', 'cucumber', 'banana', 'apple', 'orange', 'slice', 'bread',
            'tomato', 'avocado', 'lemon', 'lime', 'onion', 'garlic', 'clove'
          ];
          
          if (pieceIngredients.some(piece => ingredientNameLower.includes(piece))) {
            // Fix singular/plural for better API matching
            let fixedName = ingredientName;
            if (ingredientNameLower === 'egg') {
              fixedName = 'Eggs';
            } else if (ingredientNameLower === 'slice') {
              fixedName = 'Slice';
            }
            return `${quantity} pieces ${fixedName}`;
          } else {
            return `${quantity}g ${ingredientName}`;
          }
        }
        
        return cleaned;
      }).filter(ing => ing.length > 0);
    }
    // Try plus separation
    else if (cleaned.includes('+')) {
      ingredients = cleaned.split('+').map(ing => {
        let cleaned = ing.trim();
        
        // Add unit if missing - same logic as V1
        if (/^\d+$/.test(cleaned.split(' ')[0])) {
          const parts = cleaned.split(' ');
          const quantity = parts[0];
          const ingredientName = parts.slice(1).join(' ');
          
          // Smart unit detection based on ingredient type
          const ingredientNameLower = ingredientName.toLowerCase();
          const pieceIngredients = [
            'egg', 'eggs', 'cucumber', 'banana', 'apple', 'orange', 'slice', 'bread',
            'tomato', 'avocado', 'lemon', 'lime', 'onion', 'garlic', 'clove'
          ];
          
          if (pieceIngredients.some(piece => ingredientNameLower.includes(piece))) {
            // Fix singular/plural for better API matching
            let fixedName = ingredientName;
            if (ingredientNameLower === 'egg') {
              fixedName = 'Eggs';
            } else if (ingredientNameLower === 'slice') {
              fixedName = 'Slice';
            }
            return `${quantity} pieces ${fixedName}`;
          } else {
            return `${quantity}g ${ingredientName}`;
          }
        }
        
        return cleaned;
      }).filter(ing => ing.length > 0);
    }
    // Single ingredient
    else if (cleaned.trim().length > 0) {
      let cleaned = cleaned.trim();
      
      // Add unit if missing - same logic as V1
      if (/^\d+$/.test(cleaned.split(' ')[0])) {
        const parts = cleaned.split(' ');
        const quantity = parts[0];
        const ingredientName = parts.slice(1).join(' ');
        
        // Smart unit detection based on ingredient type
        const ingredientNameLower = ingredientName.toLowerCase();
        const pieceIngredients = [
          'egg', 'eggs', 'cucumber', 'banana', 'apple', 'orange', 'slice', 'bread',
          'tomato', 'avocado', 'lemon', 'lime', 'onion', 'garlic', 'clove'
        ];
        
        if (pieceIngredients.some(piece => ingredientNameLower.includes(piece))) {
          cleaned = `${quantity} pieces ${ingredientName}`;
        } else {
          cleaned = `${quantity}g ${ingredientName}`;
        }
      }
      
      ingredients = [cleaned];
    }

    console.log('🔍 [V2] DEBUG: Parsed ingredients:', ingredients);
    return ingredients;
  };

  // Calculate meal macros and daily totals (same as original)
  const calculateMealMacrosAndTotalsV2 = async (dayData: any) => {
    console.log('🚀 [V2] DEBUG: Calculating meal macros and daily totals for:', dayData);
    console.log('🚀 [V2] DEBUG: Full dayData structure:', JSON.stringify(dayData, null, 2));
    
    const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
    const newMealMacros: {[key: string]: any} = {};
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const mealType of mealOrder) {
      const meal = getMealString(dayData, mealType);
      console.log(`🚀 [V2] DEBUG: Processing ${mealType}: "${meal}"`);
      
      if (!meal || meal.trim() === '') {
        newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        console.log(`🚀 [V2] DEBUG: ${mealType} is empty, setting to zeros`);
        continue;
      }

      try {
        // Parse ingredients from meal description
        const ingredients = parseMealDescription(meal);
        console.log(`🚀 [V2] DEBUG: ${mealType} parsed ingredients:`, ingredients);
        
        if (ingredients.length === 0) {
          newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          console.log(`🚀 [V2] DEBUG: ${mealType} has no parseable ingredients`);
          continue;
        }

        // Get ingredient data from API - same as V2 daily totals
        const ingredientData = await getIngredientDataFromAPI(meal);
        console.log(`🚀 [V2] DEBUG: ${mealType} ingredient data:`, ingredientData);
        
        if (ingredientData && ingredientData.length > 0) {
          // Calculate meal totals
          const mealTotals = ingredientData.reduce((acc: any, ing: any) => ({
            calories: acc.calories + (ing.calories || 0),
            protein: acc.protein + (ing.protein || 0),
            carbs: acc.carbs + (ing.carbs || 0),
            fat: acc.fat + (ing.fat || 0)
          }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
          
          newMealMacros[mealType] = {
            calories: Math.round(mealTotals.calories),
            protein: Math.round(mealTotals.protein * 10) / 10,
            carbs: Math.round(mealTotals.carbs * 10) / 10,
            fat: Math.round(mealTotals.fat * 10) / 10,
          };
          
          // Add to daily totals
          totalCalories += newMealMacros[mealType].calories;
          totalProtein += newMealMacros[mealType].protein;
          totalCarbs += newMealMacros[mealType].carbs;
          totalFat += newMealMacros[mealType].fat;
          
          console.log(`🚀 [V2] ${mealType} totals:`, newMealMacros[mealType]);
        } else {
          newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          console.log(`🚀 [V2] ${mealType} has no ingredient data from API`);
        }
      } catch (error) {
        console.error(`❌ [V2] Error calculating ${mealType}:`, error);
        newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
    }

    const dailyTotals = {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    };

    console.log('🎯 [V2] FINAL DAILY TOTALS:', dailyTotals);
    console.log('🎯 [V2] MEAL MACROS:', newMealMacros);

    return {
      mealMacros: newMealMacros,
      dailyTotals: dailyTotals
    };
  };

  // Get ingredient data from API (same as original)
  const getIngredientDataFromAPI = async (mealDescription: string) => {
    console.log('🔍 [V2] DEBUG: getIngredientDataFromAPI called with:', mealDescription);
    try {
      if (!mealDescription || mealDescription.trim() === '') {
        console.log('🔍 [V2] DEBUG: Empty meal description, returning empty array');
        return [];
      }

      // Check if meal is JSON string (new format) - use directly
      if (mealDescription.startsWith('[') && mealDescription.endsWith(']')) {
        try {
          const jsonIngredients = JSON.parse(mealDescription);
          if (Array.isArray(jsonIngredients)) {
            return jsonIngredients.map((ingredient: any) => {
              const quantity = ingredient.quantity || 0;
              const per = ingredient.per || '100g';
              
              // Parse the per field to get the base amount
              let baseAmount = 100;
              let multiplier = 1;
              
              if (per === '100g') {
                baseAmount = 100;
                multiplier = quantity / baseAmount;
              } else if (per === '100ml') {
                baseAmount = 100;
                multiplier = quantity / baseAmount;
              } else if (per === '1') {
                multiplier = 1;
              } else {
                const perMatch = per.match(/(\d+(?:\.\d+)?)/);
                if (perMatch) {
                  baseAmount = parseFloat(perMatch[1]);
                  multiplier = quantity / baseAmount;
                } else {
                  baseAmount = 100;
                  multiplier = quantity / baseAmount;
                }
              }
              
              const calculatedMacros = {
                calories: Math.round((ingredient.calories || 0) * multiplier),
                protein: Math.round((ingredient.protein || 0) * multiplier),
                carbs: Math.round((ingredient.carbs || 0) * multiplier),
                fat: Math.round((ingredient.fat || 0) * multiplier),
                fiber: Math.round((ingredient.fiber || 0) * multiplier)
              };
              
              // Create portion string
              let portion = '';
              if (ingredient.unit === 'g' || ingredient.unit === 'ml') {
                portion = `${quantity}${ingredient.unit}`;
              } else if (ingredient.unit === 'tsp' || ingredient.unit === 'tbsp') {
                portion = `${quantity} ${ingredient.unit}`;
              } else if (ingredient.unit === 'slice') {
                portion = `${quantity} slice${quantity !== 1 ? 's' : ''}`;
              } else {
                portion = `${quantity} ${ingredient.unit}`;
              }
              
              return {
                name: ingredient.name,
                portion: portion,
                calories: calculatedMacros.calories,
                protein: calculatedMacros.protein,
                carbs: calculatedMacros.carbs,
                fat: calculatedMacros.fat,
                fiber: calculatedMacros.fiber
              };
            });
          }
        } catch (error) {
          console.log('Failed to parse JSON meal:', mealDescription);
        }
      }

      // Fallback to string parsing and API call
      const ingredients = parseMealDescription(mealDescription);
      console.log('🔍 [V2] DEBUG: Parsed ingredients for API:', ingredients);
      
      console.log('🔍 [V2] DEBUG: Making API call to /api/calculate-macros with:', { ingredients });
      const response = await fetch('/api/calculate-macros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      if (!response.ok) {
        console.error('🔍 [V2] DEBUG: API call failed:', response.status, response.statusText);
        throw new Error('Failed to calculate macros');
      }

      const data = await response.json();
      console.log('🔍 [V2] DEBUG: API response:', data);
      const results = data.results;
      console.log('🔍 [V2] DEBUG: API results:', results);

      // Process results with the same logic as IngredientBreakdown
      const ingredientResults = results.map((result: any) => {
        // Extract clean ingredient name (remove quantities and IDs)
        let cleanName = result.ingredient;
        
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

      return ingredientResults;

    } catch (error) {
      console.error('❌ [V2] Error getting ingredient data:', error);
      return [];
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadNutritionPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/nutrition-plans/${planId}`);
      if (response.ok) {
        const data = await response.json();
        setPlan(data);
        // Load macro percentages from meta if present
        const pct = data?.weekMenu?.meta?.macroSplit;
        if (pct && (pct.proteinPct || pct.carbsPct || pct.fatPct)) {
          setMacroPct({
            proteinPct: Number(pct.proteinPct) || 0,
            carbsPct: Number(pct.carbsPct) || 0,
            fatPct: Number(pct.fatPct) || 0,
          });
          setEditProteinPct(Number(pct.proteinPct) || 0);
          setEditCarbsPct(Number(pct.carbsPct) || 0);
          setEditFatPct(Number(pct.fatPct) || 0);
        } else {
          // Fallback based on existing grams if available
          const calories = Number(data?.calories) || 0;
          const p = Number(data?.protein) || 0;
          const c = Number(data?.carbs) || 0;
          const f = Number(data?.fat) || 0;
          if (calories > 0 && (p || c || f)) {
            const proteinPct = Math.round(((p * 4) / calories) * 100);
            const carbsPct = Math.round(((c * 4) / calories) * 100);
            const fatPct = Math.max(0, 100 - proteinPct - carbsPct);
            setMacroPct({ proteinPct, carbsPct, fatPct });
            setEditProteinPct(proteinPct);
            setEditCarbsPct(carbsPct);
            setEditFatPct(fatPct);
          }
        }
        console.log('✅ [V2] Plan loaded:', data);
      } else {
        setError(`Failed to load nutrition plan: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ [V2] Error loading plan:', error);
      setError('Error loading nutrition plan. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    if (mounted && planId) {
      loadNutritionPlan();
    }
  }, [mounted, planId, loadNutritionPlan]);

  // Compute macro targets (grams) based on percentages if available
  const targetProtein = useMemo(() => {
    const calories = Number(plan?.calories) || 0;
    if (macroPct) return Math.round((calories * (macroPct.proteinPct || 0)) / 4 / 100);
    return Number(plan?.protein) || 0;
  }, [plan?.calories, plan?.protein, macroPct]);
  const targetCarbs = useMemo(() => {
    const calories = Number(plan?.calories) || 0;
    if (macroPct) return Math.round((calories * (macroPct.carbsPct || 0)) / 4 / 100);
    return Number(plan?.carbs) || 0;
  }, [plan?.calories, plan?.carbs, macroPct]);
  const targetFat = useMemo(() => {
    const calories = Number(plan?.calories) || 0;
    if (macroPct) return Math.round((calories * (macroPct.fatPct || 0)) / 9 / 100);
    return Number(plan?.fat) || 0;
  }, [plan?.calories, plan?.fat, macroPct]);

  const openEditMacro = () => {
    setEditProteinPct(macroPct?.proteinPct ?? 0);
    setEditCarbsPct(macroPct?.carbsPct ?? 0);
    setEditFatPct(macroPct?.fatPct ?? 0);
    setEditMacroOpen(true);
  };

  const saveMacroPct = async () => {
    const total = editProteinPct + editCarbsPct + editFatPct;
    if (total !== 100) {
      alert('Percentages must sum to 100%.');
      return;
    }
    if (!plan) return;
    try {
      const calories = Number(plan.calories) || 0;
      const newProtein = Math.round((calories * editProteinPct) / 4 / 100);
      const newCarbs = Math.round((calories * editCarbsPct) / 4 / 100);
      const newFat = Math.round((calories * editFatPct) / 9 / 100);

      const newWeekMenu = {
        ...(plan.weekMenu || {}),
        meta: {
          ...(plan.weekMenu?.meta || {}),
          macroSplit: {
            proteinPct: editProteinPct,
            carbsPct: editCarbsPct,
            fatPct: editFatPct,
          },
        },
      };

      const res = await fetch(`/api/nutrition-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekMenu: newWeekMenu,
          protein: newProtein,
          carbs: newCarbs,
          fat: newFat,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPlan(updated);
        setMacroPct({ proteinPct: editProteinPct, carbsPct: editCarbsPct, fatPct: editFatPct });
        setEditMacroOpen(false);
        setForceUpdate(x => x + 1);
      } else {
        alert('Failed to save macro percentages');
      }
    } catch (e) {
      console.error(e);
      alert('Error while saving percentages');
    }
  };

  // Calculate daily totals when plan or activeDay changes
  useEffect(() => {
    const calculateTotals = async () => {
      if (!plan?.weekMenu?.[activeDay]) {
        setDailyTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setMealMacros({});
        return;
      }

      try {
        console.log('🚀 [V2] Calculating totals for day:', activeDay);
        const dayData = plan.weekMenu[activeDay];
        
        // Use original calculateMealMacrosAndTotalsV2 function
        const { mealMacros: calculatedMealMacros, dailyTotals: calculatedDailyTotals } = await calculateMealMacrosAndTotalsV2(dayData);
        setMealMacros(calculatedMealMacros);
        setDailyTotals(calculatedDailyTotals);
        
        // Load per-ingredient details for display
        const details: Record<string, Array<{ name: string; portion: string; calories: number; protein: number; carbs: number; fat: number }>> = {};
        for (const mealType of mealOrder) {
          const meal = getMealString(dayData, mealType);
          if (meal && meal.trim()) {
            try {
              const ingredientData = await getIngredientDataFromAPI(meal);
              details[mealType] = ingredientData.map(ing => ({
                name: ing.name,
                portion: ing.portion,
                calories: ing.calories,
                protein: ing.protein,
                carbs: ing.carbs,
                fat: ing.fat,
              }));
            } catch (error) {
              console.error(`Error getting ingredient details for ${mealType}:`, error);
              details[mealType] = [];
            }
          } else {
            details[mealType] = [];
          }
        }
        setMealIngredientDetails(details);
        
        console.log('✅ [V2] Totals calculated:', calculatedDailyTotals);
        console.log('✅ [V2] Meal macros:', calculatedMealMacros);
        console.log('✅ [V2] Ingredient details:', details);
      } catch (error) {
        console.error('❌ [V2] Error calculating totals:', error);
        setDailyTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setMealMacros({});
      }
    };

    calculateTotals();
  }, [plan, activeDay, forceUpdate]);


  const getGoalColor = (goal: string) => {
    switch (goal?.toLowerCase()) {
      case 'weight-loss': return 'bg-red-100 text-red-800 border-red-200';
      case 'weight-gain': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMealIcon = (mealType: string) => {
    const iconClass = "w-4 h-4 sm:w-5 sm:h-5 text-gray-700";
    switch (mealType) {
      case 'breakfast': return <Sunrise className={iconClass} />;
      case 'morning-snack': return <Apple className={iconClass} />;
      case 'lunch': return <UtensilsCrossed className={iconClass} />;
      case 'afternoon-snack': return <CircleDot className={iconClass} />;
      case 'dinner': return <Moon className={iconClass} />;
      case 'evening-snack': return <Cherry className={iconClass} />;
      default: return <UtensilsCrossed className={iconClass} />;
    }
  };

  const handleAddIngredient = async (ingredient: Ingredient, quantity: number) => {
    if (!plan || !selectedMeal) return;

    try {
      const ingredientString = `${quantity}${ingredient.per === '100g' ? 'g' : ingredient.per} ${ingredient.name}`;
      const currentMeal = plan.weekMenu?.[activeDay]?.[selectedMeal] || '';
      const newMeal = currentMeal ? `${currentMeal}, ${ingredientString}` : ingredientString;

      const response = await fetch(`/api/nutrition-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekMenu: {
            ...plan.weekMenu,
            [activeDay]: {
              ...plan.weekMenu[activeDay],
              [selectedMeal]: newMeal
            }
          }
        })
      });

      if (response.ok) {
        const updatedPlan = await response.json();
        setPlan(updatedPlan);
        setForceUpdate(prev => prev + 1); // Trigger recalculation
        setShowIngredientSelector(false);
        setSelectedMeal(null);
      }
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  const handleClearMeal = async (mealType: string) => {
    if (!plan) return;

    try {
      const response = await fetch(`/api/nutrition-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekMenu: {
            ...plan.weekMenu,
            [activeDay]: {
              ...plan.weekMenu[activeDay],
              [mealType]: ''
            }
          }
        })
      });

      if (response.ok) {
        const updatedPlan = await response.json();
        setPlan(updatedPlan);
        setForceUpdate(prev => prev + 1); // Trigger recalculation
      }
    } catch (error) {
      console.error('Error clearing meal:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading nutrition plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin/v2/nutrition-plans')}
            className="inline-block bg-red-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No Plan Found</h1>
          <p className="text-gray-600 mb-6">The nutrition plan you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/v2/nutrition-plans')}
            className="inline-block bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/v2/nutrition-plans')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{plan.name}</h1>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getGoalColor(plan.goal)}`}>
                {plan.goal === 'weight-loss' ? 'Weight Loss' : 
                 plan.goal === 'weight-gain' ? 'Weight Gain' : 
                 plan.goal === 'maintenance' ? 'Maintenance' : 
                 plan.goal}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  {editing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={() => router.push('/admin/v2/nutrition-plans')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Plan Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Apple className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Calories</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">{plan.calories}</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Protein</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{targetProtein}g</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Carbs</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{targetCarbs}g</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Fat</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">{targetFat}g</p>
          </div>
        </div>

        {/* Macro split editor */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Macro Split (percentages)</h3>
              <p className="text-xs text-gray-500">Per plan opgeslagen. Totaal moet 100% zijn.</p>
            </div>
            <button onClick={openEditMacro} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Edit</button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs text-blue-700">Protein</div>
              <div className="text-lg font-semibold text-blue-700">{macroPct?.proteinPct ?? Math.round(((targetProtein*4)/(plan?.calories||1))*100)}%</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs text-green-700">Carbs</div>
              <div className="text-lg font-semibold text-green-700">{macroPct?.carbsPct ?? Math.round(((targetCarbs*4)/(plan?.calories||1))*100)}%</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-xs text-purple-700">Fat</div>
              <div className="text-lg font-semibold text-purple-700">{macroPct?.fatPct ?? Math.round(((targetFat*9)/(plan?.calories||1))*100)}%</div>
            </div>
          </div>
        </div>

        {/* Weekly Menu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Weekly Menu Schedule</h2>
            
            {/* Tabs */}
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📅 Menu
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'ingredients'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🥗 Ingredients
              </button>
              <button
                onClick={() => setActiveTab('shopping')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'shopping'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🛒 Shopping List
              </button>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
              {Object.entries(dayNames).map(([dayKey, dayName]) => (
                <button
                  key={dayKey}
                  onClick={() => setActiveDay(dayKey)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    activeDay === dayKey
                      ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dayName}
                </button>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'menu' && (
            <>
              {/* Daily Totals */}
              {dailyTotals && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-200 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                    {dayNames[activeDay as keyof typeof dayNames]} - Daily Overview
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Calories</span>
                        <span className="text-sm font-bold text-orange-600">{dailyTotals.calories} / {plan.calories}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-orange-500 transition-all duration-300"
                          style={{ width: `${Math.min((dailyTotals.calories / plan.calories) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Protein</span>
                        <span className="text-sm font-bold text-blue-600">{dailyTotals.protein}g / {targetProtein}g</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${Math.min((dailyTotals.protein / Math.max(targetProtein,1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Carbs</span>
                        <span className="text-sm font-bold text-green-600">{dailyTotals.carbs}g / {targetCarbs}g</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500 transition-all duration-300"
                          style={{ width: `${Math.min((dailyTotals.carbs / Math.max(targetCarbs,1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Fat</span>
                        <span className="text-sm font-bold text-purple-600">{dailyTotals.fat}g / {targetFat}g</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                          style={{ width: `${Math.min((dailyTotals.fat / Math.max(targetFat,1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Meals Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Protein</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fat</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mealOrder.map((mealType) => {
                      const meal = getMealString(plan.weekMenu?.[activeDay], mealType);
                      const macros = mealMacros[mealType] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
                      const ingredients = parseMealDescription(meal);

                      return (
                        <tr key={mealType} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-2 flex items-center">{getMealIcon(mealType)}</span>
                              <div className="text-sm font-medium text-gray-900">
                                {mealType === 'morning-snack' ? 'Morning Snack' : 
                                 mealType === 'afternoon-snack' ? 'Afternoon Snack' : 
                                 mealType === 'evening-snack' ? 'Evening Snack' : 
                                 mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 max-w-md">
                              {(() => {
                                const perIng = mealIngredientDetails[mealType] || [];
                                if (perIng.length > 0) {
                                  return (
                                    <div className="space-y-1">
                                      {perIng.map((ing, idx) => (
                                        <div key={idx} className="flex items-start justify-between gap-3 py-1">
                                          <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-900 truncate">{ing.name}</div>
                                            <div className="text-[10px] text-gray-500">{ing.portion}</div>
                                          </div>
                                          <div className="flex items-center gap-1 text-[10px] flex-shrink-0">
                                            <span className="px-1 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">{ing.calories}</span>
                                            <span className="px-1 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{ing.protein}g</span>
                                            <span className="px-1 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">{ing.carbs}g</span>
                                            <span className="px-1 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">{ing.fat}g</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                // Fallback: show parsed strings if details missing
                                if (ingredients.length > 0) {
                                  return (
                                    <div className="space-y-1">
                                      {ingredients.map((ingredient, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                          <span>{ingredient}</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                return <span className="text-gray-400 italic">No ingredients yet</span>;
                              })()}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {macros.calories}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {macros.protein}g
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {macros.carbs}g
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {macros.fat}g
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedMeal(mealType);
                                  setShowIngredientSelector(true);
                                }}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Add ingredient"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              {meal && (
                                <button
                                  onClick={() => handleClearMeal(mealType)}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                  title="Clear meal"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'ingredients' && (
            <div className="text-center py-8">
              <ChefIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingredients Analysis</h3>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          )}

          {activeTab === 'shopping' && (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Shopping List</h3>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Ingredient Selector Modal */}
      {showIngredientSelector && selectedMeal && (
        <IngredientSelectorV2
          onAddIngredient={handleAddIngredient}
          onClose={() => {
            setShowIngredientSelector(false);
            setSelectedMeal(null);
          }}
          mealType={selectedMeal}
        />
      )}
      {/* Edit Macro Percentages Modal */}
      {editMacroOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditMacroOpen(false)} />
          <div className="relative bg-white w-[95vw] max-w-md rounded-lg shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Macro Percentages</h3>
              <button onClick={() => setEditMacroOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protein (%)</label>
                <input type="number" min={0} max={100} value={editProteinPct} onChange={(e)=>setEditProteinPct(parseInt(e.target.value || '0'))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (%)</label>
                <input type="number" min={0} max={100} value={editCarbsPct} onChange={(e)=>setEditCarbsPct(parseInt(e.target.value || '0'))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fat (%)</label>
                <input type="number" min={0} max={100} value={editFatPct} onChange={(e)=>setEditFatPct(parseInt(e.target.value || '0'))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="text-sm text-gray-500">Total: {editProteinPct + editCarbsPct + editFatPct}%</div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={()=>setEditMacroOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button onClick={saveMacroPct} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
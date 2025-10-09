'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Utensils, X, Plus, Search } from 'lucide-react';

interface IngredientBreakdownProps {
  mealDescription: string;
  mealType: string; // display label
  // Optional editing wiring (only used when mealDescription is JSON array string)
  planId?: string;
  dayKey?: string;
  mealTypeKey?: string; // 'breakfast' | 'lunch' ... lowercase key in plan
  editable?: boolean;
  onPlanUpdated?: (updatedPlan: any) => void; // parent can refresh macros & totals
  onMacrosUpdated?: () => void; // New callback for when macros change
  ingredientTranslations?: { [key: string]: string }; // EN -> RO translations
}

// Improved parsing function for meal descriptions
function parseMealDescription(mealDescription: string): string[] {
  console.log('Parsing meal description:', mealDescription);
  
  if (!mealDescription || mealDescription.trim() === '') {
    console.log('Empty meal description');
    return [];
  }
  
  // Check if the mealDescription is a JSON string (from the Text Converter)
  if (mealDescription.startsWith('[') && mealDescription.endsWith(']')) {
    try {
      const parsedIngredients = JSON.parse(mealDescription);
      if (Array.isArray(parsedIngredients)) {
        console.log('Parsed JSON ingredients:', parsedIngredients);
        // Convert ingredient objects to ingredient strings for the API
        const ingredientStrings = parsedIngredients.map((ingredient: any) => {
          // Format: "quantity unit name" (e.g., "6 g Egg Whites", "2 g Eggs")
          return `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`;
        });
        console.log('Converted to ingredient strings:', ingredientStrings);
        return ingredientStrings;
      }
    } catch (error) {
      console.log('Failed to parse as JSON, falling back to text parsing:', error);
      // Fall through to text parsing
    }
  }
  
  // Remove cooking instructions and descriptions
  let cleaned = mealDescription
    .replace(/\. Cook.*$/i, '') // Remove "Cook pancakes and serve with yogurt + berries"
    .replace(/\. Serve.*$/i, '') // Remove serving instructions
    .replace(/\. Mix.*$/i, '') // Remove mixing instructions
    .trim();
  
  console.log('Cleaned description:', cleaned);
  
  // Remove placeholder text but keep recipe content
  const placeholderPatterns = [
    /personalized breakfast based on your goals,\s*/i,
    /healthy snack to support your nutrition goals,\s*/i,
    /balanced lunch with optimal macronutrients,\s*/i,
    /nutritious dinner to complete your daily intake,\s*/i,
    /personalized.*based on.*goals,\s*/i,
    /healthy.*to support.*nutrition,\s*/i,
    /balanced.*with optimal.*macronutrients,\s*/i,
    /nutritious.*to complete.*daily,\s*/i
  ];
  
  // Remove placeholder text from the beginning
  for (const pattern of placeholderPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  cleaned = cleaned.trim();
  
  // Check if there's any actual content left
  if (!cleaned || cleaned.length === 0) {
    console.log('No content left after cleaning, returning empty array');
    return [];
  }
  
  // Handle recipe patterns like "[RECIPE:Protein Pancakes] ingredient1, ingredient2, ..."
  const recipePattern = /\[RECIPE:\s*([^\]]+)\]\s*([^,]+(?:,\s*[^,]+)*)/;
  const recipeMatch = cleaned.match(recipePattern);
  if (recipeMatch) {
    const recipeName = recipeMatch[1];
    const recipeContent = recipeMatch[2];
    console.log('Found recipe:', recipeName, 'with content:', recipeContent);
    
    // Split recipe content by commas and clean up
    const ingredients = recipeContent.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
    console.log('Parsed recipe ingredients:', ingredients);
    return ingredients;
  }
  
  // Handle specific patterns like "Pancakes: 60g oats, 2 eggs, 1 banana"
  if (cleaned.includes(':')) {
    const afterColon = cleaned.split(':')[1]?.trim();
    if (afterColon) {
      // Split on commas and clean up
      const ingredients = afterColon.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
      console.log('Parsed ingredients from colon:', ingredients);
      return ingredients;
    }
  }
  
  // Handle patterns like "60g oats, 2 eggs, 1 banana" (without colon)
  if (cleaned.includes(',')) {
    const ingredients = cleaned.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
    console.log('Parsed ingredients from comma:', ingredients);
    return ingredients;
  }
  
  // For other patterns, split on + but be more careful about context
  const parts = cleaned.split(/\s*\+\s*/);
  
  // Clean up each part
  const ingredients = parts
    .map(part => part.trim())
    .filter(part => part.length > 0);
    
  console.log('Parsed ingredients from plus:', ingredients);
  return ingredients;
}

export default function IngredientBreakdown({ mealDescription, mealType, planId, dayKey, mealTypeKey, editable = false, onPlanUpdated, onMacrosUpdated, ingredientTranslations = {} }: IngredientBreakdownProps) {
  const [ingredientData, setIngredientData] = useState<any[]>([]);
  const [totalMacros, setTotalMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonIngredients, setJsonIngredients] = useState<any[]>([]);
  const [editAmounts, setEditAmounts] = useState<number[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<number[]>([]);
  const initialized = useRef(false);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState<any[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  // Debug log function (simplified)
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
  }, []);

  console.log('[IngredientBreakdown] Component rendered with:', { mealDescription, mealType, editable, planId, dayKey, mealTypeKey });
  
  // Add debug log only on mount
  useEffect(() => {
    addDebugLog(`Component mounted: ${mealType} - editable: ${editable} - planId: ${planId ? 'yes' : 'no'}`);
  }, [addDebugLog, mealType, editable, planId]);

  // Note: Initialization is now handled directly in the main useEffect where ingredientData is set

  // Helpers to compute live scaling
  const getBaseAmount = (idx: number): number => {
    if (jsonMode) {
      const q = Number(jsonIngredients[idx]?.quantity || 0);
      return q > 0 ? q : 0;
    }
    // from parsed portion or rawAmount
    const i = ingredientData[idx];
    const m = String(i?.portion || '').match(/^(\d+(?:\.[0-9]+)?)/);
    const fromPortion = m ? Number(m[1]) : 0;
    return fromPortion > 0 ? fromPortion : Number(i?.rawAmount || 0) || 0;
  };

  const getCurrentAmount = (idx: number): number => {
    if (jsonMode) return Number(jsonIngredients[idx]?.quantity || 0);
    const val = editAmounts[idx];
    if (val !== undefined) return Number(val) || 0;
    return getBaseAmount(idx);
  };

  const scaledMacrosFor = (idx: number) => {
    const base = getBaseAmount(idx);
    const cur = getCurrentAmount(idx);
    const ratio = base > 0 ? cur / base : 1;
    const src = ingredientData[idx] || {};
    return {
      calories: Math.round((src.calories || 0) * ratio),
      protein: Math.round((src.protein || 0) * ratio),
      carbs: Math.round((src.carbs || 0) * ratio),
      fat: Math.round((src.fat || 0) * ratio),
    };
  };

  // Recompute meal totals live when quantities change
  useEffect(() => {
    if (!ingredientData || ingredientData.length === 0) {
      setTotalMacros({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      // Notify parent that macros have changed
      if (onMacrosUpdated) {
        setTimeout(onMacrosUpdated, 50); // Small delay to ensure DOM is updated
      }
      return;
    }
    const totals = ingredientData.reduce((acc: any, _row: any, idx: number) => {
      const s = scaledMacrosFor(idx);
      acc.calories += s.calories;
      acc.protein  += s.protein;
      acc.carbs    += s.carbs;
      acc.fat      += s.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    setTotalMacros(totals);
    
    // Notify parent that macros have changed
    if (onMacrosUpdated) {
      setTimeout(onMacrosUpdated, 50); // Small delay to ensure DOM is updated
    }
  }, [ingredientData, editAmounts, jsonIngredients, jsonMode, onMacrosUpdated]);

  // Auto-save with debounce when quantities change
  useEffect(() => {
    addDebugLog(`Auto-save useEffect triggered: initialized=${initialized.current}, editAmounts=${JSON.stringify(editAmounts)}, ingredientDataLength=${ingredientData.length}`);
    if (!initialized.current) {
      addDebugLog('Auto-save skipped: not initialized yet');
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        if (!planId || !dayKey || !mealTypeKey || !onPlanUpdated) return;
        const updates: Array<Promise<any>> = [];
        const len = ingredientData.length;
        for (let idx = 0; idx < len; idx++) {
          const current = getCurrentAmount(idx);
          if (!Number.isFinite(current) || current <= 0) {
            // skip invalid or empty values
            continue;
          }
          const prev = lastSaved.current[idx] ?? getBaseAmount(idx);
          if (Number(current) === Number(prev)) continue;
          const unit = jsonMode ? (jsonIngredients[idx]?.unit || 'g') : (ingredientData[idx]?.rawUnit || 'g');
          const name = String(ingredientData[idx]?.displayName || ingredientData[idx]?.name || '').trim();
          addDebugLog(`Making API call: name=${name}, newAmount=${current}, unit=${unit}, mealTypeKey=${mealTypeKey}, dayKey=${dayKey}`);
          updates.push(
            fetch(`/api/nutrition-plans/${planId}/update-ingredient`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dayKey, mealType: mealTypeKey, name, newAmount: current, unit })
            })
              .then(async (res) => {
                if (!res.ok) {
                  let details = '';
                  try { details = await res.text(); } catch {}
                  console.warn('Autosave failed', { status: res.status, details, name, current, unit });
                  return null;
                }
                const data = await res.json();
                lastSaved.current[idx] = current;
                return data.plan;
              })
          );
        }
        addDebugLog(`Auto-save check: updatesLength=${updates.length}, editAmounts=${JSON.stringify(editAmounts)}, lastSaved=${JSON.stringify(lastSaved.current)}`);
        if (updates.length === 0) {
          // Even if no API calls, we need to refresh the parent component
          // because the local totals have changed
          if (onPlanUpdated) {
            // Trigger a refresh by calling the callback with current plan data
            // This will force the parent to recalculate totals
            addDebugLog('Triggering onPlanUpdated for local changes');
            try {
              onPlanUpdated(null); // Pass null to indicate local changes only
              addDebugLog('onPlanUpdated(null) executed successfully');
            } catch (error) {
              addDebugLog(`Error executing onPlanUpdated(null): ${error}`);
              console.error('Error executing onPlanUpdated(null):', error);
            }
          } else {
            addDebugLog('WARNING: onPlanUpdated is undefined (local changes)');
          }
          return;
        }
        // Use the last returned plan to refresh UI
        let latestPlan: any = null;
        for (const p of updates) {
          try { const r = await p; if (r) latestPlan = r; } catch (e) { console.error(e); }
        }
        if (latestPlan) {
          addDebugLog('Calling onPlanUpdated with updated plan from API');
          if (onPlanUpdated) {
            try {
              addDebugLog('Executing onPlanUpdated callback...');
              onPlanUpdated(latestPlan);
              addDebugLog('onPlanUpdated callback executed successfully');
            } catch (error) {
              addDebugLog(`Error executing onPlanUpdated: ${error}`);
              console.error('Error executing onPlanUpdated:', error);
            }
          } else {
            addDebugLog('WARNING: onPlanUpdated is undefined!');
          }
        }
      } catch (e) {
        console.error('Auto-save failed', e);
      }
    }, 700); // debounce ~0.7s
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [editAmounts, jsonIngredients, jsonMode]);

  // Load available ingredients when modal opens
  useEffect(() => {
    if (showAddModal && availableIngredients.length === 0) {
      loadAvailableIngredients();
    }
  }, [showAddModal]);

  // Filter ingredients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredIngredients(availableIngredients);
    } else {
      const filtered = availableIngredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredIngredients(filtered);
    }
  }, [searchTerm, availableIngredients]);

  const loadAvailableIngredients = async () => {
    setLoadingIngredients(true);
    try {
      const response = await fetch('/api/ingredients');
      if (response.ok) {
        const data = await response.json();
        setAvailableIngredients(data);
        setFilteredIngredients(data);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoadingIngredients(false);
    }
  };

  useEffect(() => {
    const calculateMacros = async () => {
      try {
        addDebugLog(`useEffect triggered: ${mealDescription ? mealDescription.substring(0, 50) + '...' : 'empty'}`);
        
        // Check if we have JSON ingredients directly (from Text Converter)
        if (mealDescription.startsWith('[') && mealDescription.endsWith(']')) {
          try {
            const jsonIngredients = JSON.parse(mealDescription);
            if (Array.isArray(jsonIngredients)) {
              // console.log('[IngredientBreakdown] Processing JSON ingredients directly:', jsonIngredients);
              setJsonMode(true);
              setJsonIngredients(jsonIngredients);
              
              // Process JSON ingredients directly without API call
              const ingredientResults = jsonIngredients.map((ingredient: any) => {
                // Calculate actual macros based on quantity and per-unit values
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
                  // per: "1" means the nutritional values are already for the full amount
                  // No multiplication needed
                  multiplier = 1;
                } else {
                  const perMatch = per.match(/(\d+(?:\.\d+)?)/);
                  if (perMatch) {
                    baseAmount = parseFloat(perMatch[1]);
                    multiplier = quantity / baseAmount;
                  } else {
                    // Fallback: assume per 100g
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
                
                // Create portion string (Romanian units)
                let portion = '';
                if (ingredient.unit === 'g' || ingredient.unit === 'ml') {
                  portion = `${quantity} ${ingredient.unit}`;
                } else if (ingredient.unit === 'tsp') {
                  portion = `${quantity} lgț`; // linguriță
                } else if (ingredient.unit === 'tbsp') {
                  portion = `${quantity} lgă`; // lingură
                } else if (ingredient.unit === 'slice') {
                  portion = `${quantity} ${quantity === 1 ? 'felie' : 'felii'}`; // slice(s)
                } else if (ingredient.unit === 'piece' || ingredient.unit === 'pieces') {
                  portion = `${quantity} buc`; // bucăți
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
                  fiber: calculatedMacros.fiber,
                  error: null
                };
              });
              
              // Calculate total macros
              const total = ingredientResults.reduce((acc: any, ingredient: any) => ({
                calories: acc.calories + (ingredient.calories || 0),
                protein: acc.protein + (ingredient.protein || 0),
                carbs: acc.carbs + (ingredient.carbs || 0),
                fat: acc.fat + (ingredient.fat || 0)
              }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
              
              setIngredientData(ingredientResults);
              setTotalMacros(total);
              setLoading(false);
              
              // Initialize editAmounts for JSON mode
              const seeded = ingredientResults.map((ingredient: any) => ingredient.quantity || 0);
              setEditAmounts(seeded);
              lastSaved.current = [...seeded];
              initialized.current = true;
              addDebugLog(`JSON mode initialized: seeded=${JSON.stringify(seeded)}, initialized=${initialized.current}`);
              return;
            }
          } catch (error) {
            console.log('[IngredientBreakdown] Failed to parse JSON, falling back to string parsing:', error);
          }
        }
        setJsonMode(false);
        
        // Fallback to string parsing for non-JSON descriptions
        const ingredients = parseMealDescription(mealDescription);
        // console.log('[IngredientBreakdown] Parsed ingredients:', ingredients);
        // console.log('[IngredientBreakdown] Sending ingredients to API:', ingredients);
        
        // Call API to calculate macros
        const response = await fetch('/api/calculate-macros', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ingredients }),
        });

        if (!response.ok) {
          throw new Error('Failed to calculate macros');
        }

        const data = await response.json();
        console.log('🔍 [API Response] calculate-macros:', {
          totalResults: data.results?.length,
          sample: data.results?.slice(0, 2).map((r: any) => ({
            ingredient: r.ingredient,
            nameEn: r.nameEn,
            nameRo: r.nameRo,
            amount: r.amount,
            unit: r.unit,
            pieces: r.pieces,
            calories: r.macros?.calories,
            protein: r.macros?.protein,
            carbs: r.macros?.carbs,
            fat: r.macros?.fat
          }))
        });
        const results = data.results;

        // Process results with portion information from API
        const ingredientResults = results.map((result: any) => {
          // The API already returns the correct ingredient name
          // Just extract it from the result object
          let cleanName = result.nameEn || result.ingredient;
          
          // Remove DB id pipes if present (e.g., "cmg123|1 Egg" -> "1 Egg")
          if (cleanName.includes('|')) {
            const parts = cleanName.split('|');
            cleanName = parts[parts.length - 1].trim();
          }
          
          // Keep the name as-is - no further cleaning
          // Names like "1 Egg", "Avocado", "Whole Wheat Bread" stay intact
          
          // Create portion string - use parsed amount and unit from API
          let portion = '';
          
          if (result.unit === 'g' && result.amount) {
            // For gram-based ingredients, show just grams
            portion = `${Math.round(result.amount)} g`;
          } else if (result.unit === 'ml' && result.amount) {
            // For ml-based ingredients, show ml
            portion = `${Math.round(result.amount)} ml`;
          } else if (result.unit === 'tsp' && result.amount) {
            // For tsp-based ingredients, show tsp (Romanian: linguriță = lgț)
            portion = `${result.amount} lgț`;
          } else if (result.unit === 'tbsp' && result.amount) {
            // For tbsp-based ingredients, show tbsp (Romanian: lingură = lgă)
            portion = `${result.amount} lgă`;
          } else if (result.unit === 'piece' && result.pieces) {
            // For piece-based ingredients, show pieces (Romanian: bucăți = buc)
            if (result.pieces === 0.5) {
              portion = '1/2 buc';
            } else if (result.pieces === 0.25) {
              portion = '1/4 buc';
            } else if (result.pieces === 0.33) {
              portion = '1/3 buc';
            } else if (result.pieces === 1) {
              portion = '1 buc';
            } else {
              portion = `${result.pieces} buc`;
            }
          } else if (result.amount) {
            // Fallback: show amount with unit
            portion = `${Math.round(result.amount)} ${result.unit || 'g'}`;
          } else {
            portion = '1 buc';
          }
          
          // Derive amount/unit from API response
          const rawAmount = Math.round(result.amount || (result.pieces || 0));
          const rawUnit = (result.unit || '').toLowerCase() || 'g';

          return {
            name: cleanName,
            portion: portion,
            calories: Math.round(result.macros.calories),
            protein: Math.round(result.macros.protein),
            carbs: Math.round(result.macros.carbs),
            fat: Math.round(result.macros.fat),
            fiber: Math.round(result.macros.fiber),
            error: result.error,
            // extra data for editing in string mode
            rawAmount,
            rawUnit,
            displayName: ingredientTranslations[cleanName] || result.nameRo || cleanName,
            displayNameEn: result.nameEn || cleanName, // Keep English for reference
          };
        });

        // Calculate total macros
        const total = ingredientResults.reduce((acc: any, ingredient: any) => ({
          calories: acc.calories + (ingredient.calories || 0),
          protein: acc.protein + (ingredient.protein || 0),
          carbs: acc.carbs + (ingredient.carbs || 0),
          fat: acc.fat + (ingredient.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // Round to whole numbers
        const roundedTotal = {
          calories: Math.round(total.calories),
          protein: Math.round(total.protein),
          carbs: Math.round(total.carbs),
          fat: Math.round(total.fat)
        };

        console.log('📊 [Processed Data] Setting ingredientData:', {
          count: ingredientResults.length,
          sample: ingredientResults.slice(0, 2).map((i: any) => ({
            name: i.name,
            displayName: i.displayName,
            calories: i.calories,
            protein: i.protein,
            portion: i.portion
          }))
        });
        setIngredientData(ingredientResults);
        setTotalMacros(roundedTotal);
        
        // Initialize editAmounts for API mode
        const seeded = ingredientResults.map((ingredient: any) => {
          const m = String(ingredient.portion || '').match(/^(\d+(?:\.[0-9]+)?)/);
          return m ? Number(m[1]) : 0;
        });
        setEditAmounts(seeded);
        lastSaved.current = [...seeded];
        initialized.current = true;
        addDebugLog(`API mode initialized: seeded=${JSON.stringify(seeded)}, initialized=${initialized.current}`);
      } catch (error) {
        console.error('Error calculating macros:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateMacros();
  }, [mealDescription]);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mt-3">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500"></div>
          <span className="ml-2 text-gray-600">Calculating macros...</span>
        </div>
      </div>
    );
  }

  return (
    <>
    <div 
      className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6 mt-3 sm:mt-4"
      data-meal-type={mealTypeKey}
      data-day={dayKey}
      data-ingredients={JSON.stringify((() => {
        const result = ingredientData.map((ing, idx) => {
          const scaled = scaledMacrosFor(idx);
          const currentAmount = getCurrentAmount(idx);
          
          // Build proper portion string with actual quantities
          let portionString = '';
          if (jsonMode) {
            const unit = jsonIngredients[idx]?.unit || 'g';
            portionString = `${Math.round(currentAmount)} ${unit}`;
          } else {
            const unit = ing.rawUnit || 'g';
            portionString = `${Math.round(currentAmount)} ${unit}`;
          }
          
          return {
            name: ing.name,
            portion: portionString, // Use actual current amount, not base portion
            calories: scaled.calories,
            protein: scaled.protein,
            carbs: scaled.carbs,
            fat: scaled.fat,
            fiber: ing.fiber || 0
          };
        });
        
        // Debug log to verify correct portions
        if (result.length > 0) {
          console.log(`[IngredientBreakdown] ${mealType} data-ingredients:`, result.map(r => `${r.portion} ${r.name}`).join(', '));
        }
        
        return result;
      })())}
      data-meal-totals={JSON.stringify(totalMacros)}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h4 className="font-bold text-gray-800 flex items-center text-sm sm:text-base lg:text-lg">
          <Utensils className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {mealType} - Ingredients:
        </h4>
        {editable && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            <span className="mr-1">+</span>
            Voeg ingrediënt
          </button>
        )}
      </div>
      
      {/* Table Header - only show on desktop for read-only, always show for editable */}
      {editable ? (
        <div className="grid grid-cols-11 gap-2 mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <div className="col-span-5">Ingrediënt</div>
          <div className="col-span-2 text-center">Hoeveelheid</div>
          <div className="col-span-1 text-center">Kcal</div>
          <div className="col-span-1 text-center">Eiwit</div>
          <div className="col-span-1 text-center">Vet</div>
          <div className="col-span-1 text-center">Koolh.</div>
          <div className="col-span-1 text-center">Actie</div>
        </div>
      ) : (
        <div className="hidden sm:grid sm:grid-cols-9 gap-2 mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <div className="col-span-4">Ingrediënt</div>
          <div className="col-span-1 text-center">Porție</div>
          <div className="col-span-1 text-center">Cal</div>
          <div className="col-span-1 text-center">Proteine</div>
          <div className="col-span-1 text-center">Carbohidrați</div>
          <div className="col-span-1 text-center">Grăsimi</div>
        </div>
      )}
      
      <div className="space-y-2">
        {ingredientData.map((ingredient, index) => {
          // Read-only mode - mobile-friendly card layout - uses ingredient.calories directly
          if (!editable) {
            return (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                {/* Mobile: Vertical card layout */}
                <div className="block sm:hidden">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-2 flex-1">
                      <span className="text-gray-500 text-sm mt-0.5">•</span>
                      <span className="font-medium text-gray-800 text-sm">
                        {ingredient.displayName || ingredient.name}
                      </span>
                    </div>
                    <span className="text-gray-600 text-sm font-semibold ml-2 whitespace-nowrap">
                      {ingredient.portion}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <div className="text-gray-500 text-[10px] mb-0.5">Cal</div>
                      <div className="text-orange-600 font-bold">{ingredient.calories}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-[10px] mb-0.5">Prot</div>
                      <div className="text-blue-600 font-semibold">{ingredient.protein}g</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-[10px] mb-0.5">Carb</div>
                      <div className="text-green-600 font-semibold">{ingredient.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-[10px] mb-0.5">Fat</div>
                      <div className="text-purple-600 font-semibold">{ingredient.fat}g</div>
                    </div>
                  </div>
                </div>
                
                {/* Desktop: Table layout */}
                <div className="hidden sm:grid sm:grid-cols-9 gap-2 items-center">
                  <div className="col-span-4 flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="font-medium text-gray-800 text-sm">
                      {ingredient.displayName || ingredient.name}
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-gray-600 text-sm">{ingredient.portion}</span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-orange-600 font-bold text-sm">{ingredient.calories}</span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-blue-600 font-semibold text-sm">{ingredient.protein}g</span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-green-600 font-semibold text-sm">{ingredient.carbs}g</span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-purple-600 font-semibold text-sm">{ingredient.fat}g</span>
                  </div>
                </div>
              </div>
            );
          }
          
          // Editable mode - full layout with controls
          return (
          <div key={index} className="grid grid-cols-11 gap-2 items-center bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
            <div className="col-span-5 flex items-center space-x-2">
              <span className="text-gray-500 text-sm">•</span>
              <span className="font-medium text-gray-800 text-sm sm:text-base truncate">
                {ingredient.portion} {ingredient.displayName || ingredient.name}
              </span>
            </div>
            <div className="col-span-2 text-center">
              {editable && jsonMode ? (
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={jsonIngredients[index]?.quantity ?? 0}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                      setJsonIngredients(prev => prev.map((ing, i) => i===index ? { ...ing, quantity: val === '' ? 0 : Number(val) } : ing));
                    }}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                  <span className="text-xs text-gray-600">{jsonIngredients[index]?.unit || 'g'}</span>
                  {/* autosave active, no per-row button */}
                  <div className="text-[10px] text-gray-400 leading-tight mt-1">
                    dbg: qty={jsonIngredients[index]?.quantity ?? 0} unit={jsonIngredients[index]?.unit || 'g'} jsonMode={String(jsonMode)} portion="{ingredient.portion}" name="{ingredient.name}"
                  </div>
                </div>
              ) : editable && !jsonMode ? (
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={
                      (editAmounts[index] !== undefined)
                        ? editAmounts[index]
                        : (() => { const m = String(ingredient.portion || '').match(/^(\d+(?:\.\d+)?)/); return m ? Number(m[1]) : 0; })()
                    }
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value || 0));
                      addDebugLog(`Ingredient changed: name=${ingredient.displayName}, oldValue=${editAmounts[index]}, newValue=${val}`);
                      setEditAmounts((prev) => {
                        const next = prev && prev.length ? [...prev] : Array.from({ length: ingredientData.length }, (_, i) => {
                          const m = String(ingredientData[i]?.portion || '').match(/^(\d+(?:\.[0-9]+)?)/);
                          return m ? Number(m[1]) : Number(ingredientData[i]?.rawAmount || 0) || 0;
                        });
                        next[index] = val;
                        return next;
                      });
                    }}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                  <span className="text-xs text-gray-600">{ingredient.rawUnit || 'g'}</span>
                  {/* autosave active, no per-row button */}
                  <div className="text-[10px] text-gray-400 leading-tight mt-1">
                    dbg: amt={editAmounts[index] ?? 0} unit={ingredient.rawUnit || 'g'} jsonMode={String(jsonMode)} portion="{ingredient.portion}" name="{ingredient.name}"
                  </div>
                </div>
              ) : (
                <span className="text-gray-600 text-sm">—</span>
              )}
            </div>
            {(() => { const s = scaledMacrosFor(index); return (
              <>
                <div className="col-span-1 text-center">
                  <span className="text-orange-600 font-bold text-sm">{s.calories}</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-blue-600 font-semibold text-sm">{s.protein}g</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-purple-600 font-semibold text-sm">{s.fat}g</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-green-600 font-semibold text-sm">{s.carbs}g</span>
                </div>
              </>
            ); })()}
            <div className="col-span-1 text-center">
              <button
                onClick={async () => {
                  try {
                    // Optimistic UI removal
                    const updatedLocal = ingredientData.filter((_, i) => i !== index);
                    setIngredientData(updatedLocal);

                    if (!planId || !dayKey || !mealTypeKey) return; // no server save possible

                    // Build new meal string from remaining rows
                    let tokens: string[] = [];
                    if (jsonMode) {
                      const updatedJson = jsonIngredients.filter((_, i) => i !== index);
                      tokens = updatedJson.map((ing: any) => {
                        const q = Math.round(Number(ing?.quantity || 0));
                        const u = String(ing?.unit || 'g');
                        const n = String(ing?.name || '').trim();
                        return `${q} ${u} ${n}`.trim();
                      }).filter(Boolean);
                    } else {
                      tokens = updatedLocal.map((row: any, idx: number) => {
                        const amt = Math.round(getCurrentAmount(idx));
                        const unit = String(row?.rawUnit || 'g');
                        const name = String(row?.displayName || row?.name || '').trim();
                        return `${amt} ${unit} ${name}`.trim();
                      }).filter(Boolean);
                    }

                    const mealText = tokens.join(', ');
                    const res = await fetch(`/api/nutrition-plans/${planId}/set-meal`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ dayKey, mealType: mealTypeKey, mealText })
                    });
                    if (!res.ok) {
                      console.warn('set-meal save failed, keeping local state');
                      return;
                    }
                    const data = await res.json();
                    if (data?.plan && onPlanUpdated) onPlanUpdated(data.plan);
                  } catch (e) {
                    console.error('Delete via set-meal failed', e);
                  }
                }}
                className="text-red-500 hover:text-red-700 text-sm"
                title="Verwijder ingrediënt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          ); // end editable return
        })}
      </div>
        
        {/* Meal Total */}
        <div className="bg-rose-50 rounded-lg p-3 sm:p-4 border border-rose-200 mt-3">
          {/* Mobile: Compact grid */}
          {!editable && (
            <div className="block sm:hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800 text-sm">Total</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <div className="text-gray-500 text-[10px] mb-0.5">Cal</div>
                  <div className={`text-orange-600 font-bold totalcalories-${mealType.toLowerCase()}`}>
                    {totalMacros.calories}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] mb-0.5">Prot</div>
                  <div className={`text-blue-600 font-bold totalprotein-${mealType.toLowerCase()}`}>
                    {totalMacros.protein}g
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] mb-0.5">Carb</div>
                  <div className={`text-green-600 font-bold totalcarbs-${mealType.toLowerCase()}`}>
                    {totalMacros.carbs}g
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] mb-0.5">Fat</div>
                  <div className={`text-purple-600 font-bold totalfat-${mealType.toLowerCase()}`}>
                    {totalMacros.fat}g
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Desktop: Table layout */}
          <div className={`${!editable ? 'hidden sm:grid' : 'grid'} ${editable ? 'grid-cols-10' : 'grid-cols-9'} gap-2 items-center`}>
            <div className={editable ? "col-span-5" : "col-span-4"}>
              <span className="font-bold text-gray-800 text-sm sm:text-base">
                Total
              </span>
            </div>
            {!editable && (
              <div className="col-span-1 text-center">
                <span className="text-gray-600 font-semibold text-sm">—</span>
              </div>
            )}
            <div className="col-span-1 text-center">
              <span className={`text-orange-600 font-bold text-sm totalcalories-${mealType.toLowerCase()}`}>
                {totalMacros.calories}
              </span>
            </div>
            <div className="col-span-1 text-center">
              <span className={`text-blue-600 font-bold text-sm totalprotein-${mealType.toLowerCase()}`}>
                {totalMacros.protein}g
              </span>
            </div>
            <div className="col-span-1 text-center">
              <span className={`text-green-600 font-bold text-sm totalcarbs-${mealType.toLowerCase()}`}>
                {totalMacros.carbs}g
              </span>
            </div>
            <div className="col-span-1 text-center">
              <span className={`text-purple-600 font-bold text-sm totalfat-${mealType.toLowerCase()}`}>
                {totalMacros.fat}g
              </span>
            </div>
            {editable && (
              <div className="col-span-1 text-center">
                <span className="text-gray-500 text-xs">
                  Totaal
                </span>
              </div>
            )}
          </div>
        </div>
    </div>

    {/* Add Ingredient Modal */}
    {showAddModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Voeg ingrediënt toe - {mealType}
            </h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex h-[70vh]">
            {/* Left Column - Current Ingredients */}
            <div className="w-1/2 p-4 border-r border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Huidige ingrediënten</h4>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {ingredientData.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">
                        {ingredient.portion} {ingredient.displayName || ingredient.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {ingredient.protein}P {ingredient.fat}F {ingredient.carbs}C → {ingredient.calories} kcal
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = ingredientData.filter((_, i) => i !== index);
                        setIngredientData(updated);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {ingredientData.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Geen ingrediënten toegevoegd
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Database Ingredients */}
            <div className="w-1/2 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Database ingrediënten</h4>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Zoek ingrediënt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Ingredients List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {loadingIngredients ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Laden...</p>
                  </div>
                ) : (
                  filteredIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200 hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm">
                          {ingredient.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {ingredient.calories} kcal | {ingredient.protein}g P | {ingredient.carbs}g C | {ingredient.fat}g F
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Add ingredient to current meal
                          const newIngredient = {
                            name: ingredient.name,
                            portion: `100g`,
                            calories: ingredient.calories,
                            protein: ingredient.protein,
                            fat: ingredient.fat,
                            carbs: ingredient.carbs
                          };
                          setIngredientData([...ingredientData, newIngredient]);
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Toevoegen
                      </button>
                    </div>
                  ))
                )}
                {!loadingIngredients && filteredIngredients.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Geen ingrediënten gevonden
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Sluiten
            </button>
            <button
              onClick={() => {
                // Here you would save the updated ingredients to the meal
                setShowAddModal(false);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Opslaan
            </button>
          </div>
        </div>
      </div>
    )}

    </>
  );
}

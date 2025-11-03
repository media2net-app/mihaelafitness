'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Ingredient, 
  DatabaseIngredient, 
  parseMealDescription, 
  calculateTotalMacros,
  createIngredientObject,
  findIngredientInDatabase,
  determineIngredientUnit
} from '@/lib/ingredientUtils';
import IngredientModalV3 from './IngredientModalV3';

interface IngredientBreakdownV3Props {
  planId: string;
  dayKey: string;
  mealTypeKey: string;
  mealDescription: string;
  onPlanUpdated: (plan: any) => void;
  editable: boolean;
}

export default function IngredientBreakdownV3({
  planId,
  dayKey,
  mealTypeKey,
  mealDescription,
  onPlanUpdated,
  editable
}: IngredientBreakdownV3Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [databaseIngredients, setDatabaseIngredients] = useState<DatabaseIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Debug logging
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  }, []);

  // Fetch database ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        // Fetch all ingredients without pagination
        const response = await fetch('/api/ingredients');
        if (response.ok) {
          const data = await response.json();
          setDatabaseIngredients(data);
          addDebugLog(`Loaded ${data.length} database ingredients`);
        } else {
          addDebugLog(`Failed to fetch ingredients: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        addDebugLog(`Error fetching ingredients: ${error}`);
      }
    };

    fetchIngredients();
  }, [addDebugLog]);

  // Parse meal description when it changes
  useEffect(() => {
    if (databaseIngredients.length > 0) {
      const parsedIngredients = parseMealDescription(mealDescription, databaseIngredients);
      setIngredients(parsedIngredients);
      addDebugLog(`Parsed ${parsedIngredients.length} ingredients from meal description`);
      setLoading(false);
    }
  }, [mealDescription, databaseIngredients, addDebugLog]);

  // Calculate total macros
  const totalMacros = useMemo(() => {
    return calculateTotalMacros(ingredients);
  }, [ingredients]);

  // Auto-save with debouncing
  const saveMeal = useCallback(async (newIngredients: Ingredient[]) => {
    if (!editable || saving) return;
    
    setSaving(true);
    addDebugLog('Starting auto-save...');
    
    try {
      // Convert ingredients to JSON string
      const mealData = JSON.stringify(newIngredients);
      
      const response = await fetch(`/api/nutrition-plans-v3/${planId}/update-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayKey,
          mealType: mealTypeKey,
          mealText: mealData
        })
      });

      if (response.ok) {
        const result = await response.json();
        addDebugLog('Auto-save successful');
        onPlanUpdated(result.plan);
      } else {
        addDebugLog(`Auto-save failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      addDebugLog(`Auto-save error: ${error}`);
    } finally {
      setSaving(false);
    }
  }, [planId, dayKey, mealTypeKey, editable, saving, onPlanUpdated, addDebugLog]);

  // Debounced save
  const debouncedSave = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (newIngredients: Ingredient[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => saveMeal(newIngredients), 1000);
    };
  }, [saveMeal]);

  // Update ingredient quantity
  const updateIngredientQuantity = useCallback((index: number, newQuantity: number) => {
    if (!editable) return;
    
    const updatedIngredients = ingredients.map((ingredient, i) => {
      if (i === index) {
        const dbIngredient = databaseIngredients.find(db => db.id === ingredient.id);
        if (dbIngredient) {
          const finalUnit = determineIngredientUnit(ingredient.unit, dbIngredient);
          return createIngredientObject(
            { name: ingredient.name, amount: newQuantity, unit: ingredient.unit },
            dbIngredient,
            finalUnit
          );
        }
      }
      return ingredient;
    });
    
    setIngredients(updatedIngredients);
    debouncedSave(updatedIngredients);
    addDebugLog(`Updated ingredient ${index} quantity to ${newQuantity}`);
  }, [ingredients, databaseIngredients, editable, debouncedSave, addDebugLog]);

  // Add new ingredient
  const addIngredient = useCallback((ingredient: Ingredient) => {
    if (!editable) return;
    
    const updatedIngredients = [...ingredients, ingredient];
    setIngredients(updatedIngredients);
    debouncedSave(updatedIngredients);
    addDebugLog(`Added ingredient: ${ingredient.name}`);
  }, [ingredients, editable, debouncedSave, addDebugLog]);

  // Remove ingredient
  const removeIngredient = useCallback((index: number) => {
    if (!editable) return;
    
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
    debouncedSave(updatedIngredients);
    addDebugLog(`Removed ingredient at index ${index}`);
  }, [ingredients, editable, debouncedSave, addDebugLog]);

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 capitalize">
          {mealTypeKey.replace('-', ' ')}
        </h3>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          🐛 Debug
        </button>
      </div>

      {/* Ingredients List */}
      <div className="space-y-3 mb-4">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-base text-gray-900">{ingredient.nameRo}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {ingredient.calories}C • {ingredient.protein}P • {ingredient.carbs}CH • {ingredient.fat}F
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredientQuantity(index, parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    disabled={!editable}
                  />
                  <span className="text-sm text-gray-600 font-medium">{ingredient.unit}</span>
                </div>
                {editable && (
                  <button
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700 text-lg font-bold px-2 py-1 hover:bg-red-50 rounded"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Ingredient Button */}
      {editable && (
        <div className="mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            + Add Ingredient
          </button>
        </div>
      )}

      {/* Total Macros */}
      <div className="border-t pt-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-bold text-gray-900 text-center">
            Total: {totalMacros.calories}C • {totalMacros.protein}P • {totalMacros.carbs}CH • {totalMacros.fat}F
          </div>
        </div>
      </div>

      {/* Ingredient Modal */}
      <IngredientModalV3
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addIngredient}
        databaseIngredients={databaseIngredients}
      />

      {/* Debug Panel */}
      {showDebug && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <div className="font-medium mb-2">Debug Info</div>
          <div className="space-y-1">
            <div>Plan ID: {planId}</div>
            <div>Day: {dayKey}</div>
            <div>Meal: {mealTypeKey}</div>
            <div>Ingredients: {ingredients.length}</div>
            <div>Editable: {editable ? 'Yes' : 'No'}</div>
            <div>Saving: {saving ? 'Yes' : 'No'}</div>
          </div>
          <div className="mt-2">
            <div className="font-medium">Debug Logs:</div>
            <div className="max-h-32 overflow-y-auto">
              {debugLogs.map((log, i) => (
                <div key={i} className="text-gray-600">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

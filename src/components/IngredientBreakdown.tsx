'use client';

import { useState, useEffect } from 'react';
import { Utensils } from 'lucide-react';

interface IngredientBreakdownProps {
  mealDescription: string;
  mealType: string;
}

// Improved parsing function for meal descriptions
function parseMealDescription(mealDescription: string): string[] {
  console.log('Parsing meal description:', mealDescription);
  
  // Remove cooking instructions and descriptions
  let cleaned = mealDescription
    .replace(/\. Cook.*$/i, '') // Remove "Cook pancakes and serve with yogurt + berries"
    .replace(/\. Serve.*$/i, '') // Remove serving instructions
    .replace(/\. Mix.*$/i, '') // Remove mixing instructions
    .trim();
  
  console.log('Cleaned description:', cleaned);
  
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

export default function IngredientBreakdown({ mealDescription, mealType }: IngredientBreakdownProps) {
  const [ingredientData, setIngredientData] = useState<any[]>([]);
  const [totalMacros, setTotalMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateMacros = async () => {
      try {
        // Parse ingredients from meal description - improved parsing
        const ingredients = parseMealDescription(mealDescription);
        console.log('Sending ingredients to API:', ingredients);
        
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
        const results = data.results;

        // Process results with portion information from API
        const ingredientResults = results.map((result: any) => {
          // Extract clean ingredient name (remove quantities)
          let cleanName = result.ingredient;
          
          // Remove common quantity patterns but be more careful
          cleanName = cleanName
            .replace(/^\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|slice|slices)\s*/i, '')
            .replace(/^\d+(?:\.\d+)?\s*(?:piece|pieces)\s*/i, '')
            .replace(/^\d+(?:\.\d+)?\s*/i, '')
            .replace(/^(\d+\/\d+|\d+)\s*/i, '')
            .replace(/^\([^)]*\)\s*/g, '')
            .replace(/^[^a-zA-Z]*/, '')
            .replace(/\)$/, '') // Remove trailing )
            .trim();
          
          // Handle special cases - be more specific
          if (cleanName.toLowerCase().includes('egg') && !cleanName.toLowerCase().includes('white')) {
            cleanName = 'eggs';
          } else if (cleanName.toLowerCase().includes('egg whites') || cleanName.toLowerCase().includes('whites')) {
            cleanName = 'egg whites';
          } else if (cleanName.toLowerCase().includes('banana')) {
            cleanName = 'banana';
          } else if (cleanName.toLowerCase().includes('rice') && cleanName.toLowerCase().includes('cooked')) {
            cleanName = 'rice cooked';
          } else if (cleanName.toLowerCase().includes('rice') && cleanName.toLowerCase().includes('100g')) {
            cleanName = 'rice 100g cooked';
          } else if (cleanName.toLowerCase().includes('rice')) {
            cleanName = 'rice';
          } else if (cleanName.toLowerCase().includes('whole-grain bread') || cleanName.toLowerCase().includes('whole grain bread')) {
            cleanName = 'whole-grain bread';
          } else if (cleanName.toLowerCase().includes('grilled chicken')) {
            cleanName = 'grilled chicken';
          } else if (cleanName.toLowerCase().includes('baked sweet potato')) {
            cleanName = 'baked sweet potato';
          } else if (cleanName.toLowerCase().includes('almond milk')) {
            cleanName = 'almond milk';
          } else if (cleanName.toLowerCase().includes('peanut butter')) {
            cleanName = 'peanut butter';
          } else if (cleanName.toLowerCase().includes('avocado')) {
            cleanName = 'avocado';
          } else if (cleanName.toLowerCase().includes('oats')) {
            cleanName = 'oats';
          } else if (cleanName.toLowerCase().includes('cinnamon')) {
            cleanName = 'cinnamon';
          } else if (cleanName.toLowerCase().includes('greek yogurt')) {
            cleanName = 'Greek yogurt';
          } else if (cleanName.toLowerCase().includes('berries')) {
            cleanName = 'berries';
          }
          
          // Create portion string - match your exact format
          let portion = '';
          
          // Check if this is a piece-based ingredient (eggs, banana, etc.)
          if (cleanName.toLowerCase().includes('eggs')) {
            // For eggs, show "2 eggs (100 g)" format
            if (result.pieces && result.pieces !== 1) {
              portion = `${result.pieces} eggs (${Math.round(result.amount)} g)`;
            } else {
              portion = `1 egg (${Math.round(result.amount)} g)`;
            }
          } else if (cleanName.toLowerCase().includes('banana')) {
            // For banana, show "1 banana (120 g)" format
            portion = `1 banana (${Math.round(result.amount)} g)`;
          } else if (cleanName.toLowerCase().includes('apple')) {
            // For apple, show "1 apple (150 g)" format
            portion = `1 apple (${Math.round(result.amount)} g)`;
          } else if (result.unit === 'g' && result.amount) {
            // For gram-based ingredients, show just grams
            portion = `${Math.round(result.amount)} g`;
          } else if (result.pieces && result.pieces !== 1) {
            // For other piece-based ingredients
            if (result.pieces === 0.5) {
              portion = '1/2 piece';
            } else if (result.pieces === 0.25) {
              portion = '1/4 piece';
            } else if (result.pieces === 0.33) {
              portion = '1/3 piece';
            } else {
              portion = `${result.pieces} pieces`;
            }
          } else {
            portion = '1 piece';
          }
          
          return {
            name: cleanName,
            portion: portion,
            calories: Math.round(result.macros.calories),
            protein: Math.round(result.macros.protein),
            carbs: Math.round(result.macros.carbs),
            fat: Math.round(result.macros.fat),
            fiber: Math.round(result.macros.fiber),
            error: result.error
          };
        });

        // Calculate total macros
        const total = ingredientResults.reduce((acc, ingredient) => ({
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

        setIngredientData(ingredientResults);
        setTotalMacros(roundedTotal);
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
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6 mt-3 sm:mt-4">
      <h4 className="font-bold text-gray-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base lg:text-lg">
        <Utensils className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Ingredients:
      </h4>
      
      <div className="space-y-2 sm:space-y-3">
        {ingredientData.map((ingredient, index) => (
          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm">•</span>
                <span className="font-medium text-gray-800 text-sm sm:text-base">
                  {ingredient.portion} {ingredient.name}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
              <span className="text-blue-600 font-semibold">
                {ingredient.protein} P
              </span>
              <span className="text-purple-600 font-semibold">
                {ingredient.fat} F
              </span>
              <span className="text-green-600 font-semibold">
                {ingredient.carbs} C
              </span>
              <span className="text-orange-600 font-bold">
                → {ingredient.calories} kcal
              </span>
            </div>
          </div>
        ))}
        
        {/* Meal Total */}
        <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-lg p-3 sm:p-4 border-2 border-rose-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800 text-sm sm:text-base">
              Meal total:
            </span>
            <div className="flex items-center space-x-3 sm:space-x-4 text-sm sm:text-base">
              <span className="text-blue-600 font-bold">
                {totalMacros.protein} P
              </span>
              <span className="text-purple-600 font-bold">
                {totalMacros.fat} F
              </span>
              <span className="text-green-600 font-bold">
                {totalMacros.carbs} C
              </span>
              <span className="text-orange-600 font-bold text-lg">
                → {totalMacros.calories} kcal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

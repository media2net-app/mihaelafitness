'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, X, Check } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface SelectedIngredient extends Ingredient {
  amount: number; // in grams
}

interface IngredientSelectorProps {
  selectedIngredients: SelectedIngredient[];
  onIngredientsChange: (ingredients: SelectedIngredient[]) => void;
  className?: string;
}

export default function IngredientSelector({ 
  selectedIngredients, 
  onIngredientsChange, 
  className = '' 
}: IngredientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load available ingredients
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ingredients');
        if (response.ok) {
          const ingredients = await response.json();
          setAvailableIngredients(ingredients);
        }
      } catch (error) {
        console.error('Error loading ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIngredients();
  }, []);

  // Filter ingredients based on search term
  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedIngredients.some(selected => selected.id === ingredient.id)
  );

  const handleAddIngredient = (ingredient: Ingredient) => {
    const newSelectedIngredient: SelectedIngredient = {
      ...ingredient,
      amount: 100 // Default to 100g
    };
    onIngredientsChange([...selectedIngredients, newSelectedIngredient]);
    setSearchTerm('');
    setShowSearch(false);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    onIngredientsChange(selectedIngredients.filter(ingredient => ingredient.id !== ingredientId));
  };

  const handleAmountChange = (ingredientId: string, amount: number) => {
    const updatedIngredients = selectedIngredients.map(ingredient =>
      ingredient.id === ingredientId ? { ...ingredient, amount } : ingredient
    );
    onIngredientsChange(updatedIngredients);
  };

  // Calculate total macros for selected ingredients
  const totalMacros = selectedIngredients.reduce((totals, ingredient) => {
    const multiplier = ingredient.amount / 100; // Convert to per 100g
    return {
      calories: totals.calories + (ingredient.calories * multiplier),
      protein: totals.protein + (ingredient.protein * multiplier),
      carbs: totals.carbs + (ingredient.carbs * multiplier),
      fat: totals.fat + (ingredient.fat * multiplier),
      fiber: totals.fiber + (ingredient.fiber * multiplier)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Add Button */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSearch(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          
          {/* Search Results Dropdown */}
          {showSearch && searchTerm && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading ingredients...</div>
              ) : filteredIngredients.length > 0 ? (
                filteredIngredients.slice(0, 10).map((ingredient) => (
                  <button
                    key={ingredient.id}
                    onClick={() => handleAddIngredient(ingredient)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{ingredient.name}</div>
                      <div className="text-sm text-gray-500">
                        {ingredient.calories} cal • {ingredient.protein}g protein • {ingredient.carbs}g carbs • {ingredient.fat}g fat
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No ingredients found</div>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Ingredient
        </button>
      </div>

      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Selected Ingredients</h4>
          
          {selectedIngredients.map((ingredient) => (
            <div key={ingredient.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900 capitalize">{ingredient.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveIngredient(ingredient.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Amount:</label>
                <input
                  type="number"
                  value={ingredient.amount}
                  onChange={(e) => handleAmountChange(ingredient.id, parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-rose-500 focus:border-transparent"
                  min="0"
                  step="1"
                />
                <span className="text-sm text-gray-600">g</span>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                {Math.round(ingredient.calories * ingredient.amount / 100)} cal • 
                {Math.round(ingredient.protein * ingredient.amount / 100)}g protein • 
                {Math.round(ingredient.carbs * ingredient.amount / 100)}g carbs • 
                {Math.round(ingredient.fat * ingredient.amount / 100)}g fat
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Macros Summary */}
      {selectedIngredients.length > 0 && (
        <div className="bg-rose-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Total Macros</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
            <div className="text-center">
              <div className="font-bold text-gray-900">{Math.round(totalMacros.calories)}</div>
              <div className="text-gray-600">Calories</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">{Math.round(totalMacros.protein)}g</div>
              <div className="text-gray-600">Protein</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">{Math.round(totalMacros.carbs)}g</div>
              <div className="text-gray-600">Carbs</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">{Math.round(totalMacros.fat)}g</div>
              <div className="text-gray-600">Fat</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">{Math.round(totalMacros.fiber)}g</div>
              <div className="text-gray-600">Fiber</div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close search */}
      {showSearch && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowSearch(false)}
        />
      )}
    </div>
  );
}

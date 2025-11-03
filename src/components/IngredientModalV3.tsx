'use client';

import { useState, useEffect } from 'react';
import { DatabaseIngredient, Ingredient, createIngredientObject, determineIngredientUnit } from '@/lib/ingredientUtils';

interface IngredientModalV3Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (ingredient: Ingredient) => void;
  databaseIngredients: DatabaseIngredient[];
}

export default function IngredientModalV3({
  isOpen,
  onClose,
  onAdd,
  databaseIngredients
}: IngredientModalV3Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<DatabaseIngredient | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState('g');

  // Filter ingredients based on search
  const filteredIngredients = databaseIngredients
    .filter(ingredient =>
      (ingredient.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ingredient.nameRo || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Prioritize gram-based ingredients (TYPE:gram) over others
      const aIsGram = a.aliases?.some(alias => alias.startsWith('TYPE:gram'));
      const bIsGram = b.aliases?.some(alias => alias.startsWith('TYPE:gram'));
      
      if (aIsGram && !bIsGram) return -1;
      if (!aIsGram && bIsGram) return 1;
      
      // Then sort by name
      return (a.name || '').localeCompare(b.name || '');
    })
    .slice(0, 50); // Limit to 50 results

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIngredient(null);
      setQuantity(100); // Default to 100, will be adjusted when ingredient is selected
      setUnit('g');
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (selectedIngredient) {
      const finalUnit = determineIngredientUnit(unit, selectedIngredient);
      const newIngredient = createIngredientObject(
        { name: selectedIngredient.name, amount: quantity, unit },
        selectedIngredient,
        finalUnit
      );
      onAdd(newIngredient);
      onClose();
    }
  };

  const handleIngredientSelect = (ingredient: DatabaseIngredient) => {
    setSelectedIngredient(ingredient);
    
    // Auto-set unit based on ingredient type
    const typeAlias = ingredient.aliases?.find(alias => alias.startsWith('TYPE:'));
    let newUnit = 'g'; // Default to grams
    
    if (typeAlias) {
      newUnit = typeAlias.replace('TYPE:', '').toLowerCase();
    } else {
      // If no TYPE alias, try to infer from the 'per' field
      const per = ingredient.per || '';
      if (per.includes('ml')) {
        newUnit = 'ml';
      } else if (per.includes('piece') || per.includes('slice') || per.includes('handful')) {
        newUnit = 'piece';
      } else if (per.includes('tsp')) {
        newUnit = 'tsp';
      } else if (per.includes('tbsp')) {
        newUnit = 'tbsp';
      } else if (per.includes('cup')) {
        newUnit = 'cup';
      } else if (per.includes('oz')) {
        newUnit = 'oz';
      } else if (per.includes('lb')) {
        newUnit = 'lb';
      } else if (per.includes('kg')) {
        newUnit = 'kg';
      } else if (per.includes('l')) {
        newUnit = 'l';
      } else {
        // Default to grams if no clear unit found
        newUnit = 'g';
      }
    }
    
    setUnit(newUnit);
    
    // Auto-set quantity based on unit
    if (newUnit === 'g' || newUnit === 'ml') {
      setQuantity(100);
    } else {
      setQuantity(1); // piece, slice, handful, tsp, tbsp, scoop, cup, oz, lb, kg, l
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Ingredient</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Ingredient List */}
        <div className="mb-4 max-h-64 overflow-y-auto">
          {filteredIngredients.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? 'No ingredients found matching your search' : 'No ingredients available'}
            </div>
          ) : (
            <>
              <div className="text-xs text-gray-500 mb-2">
                Showing {filteredIngredients.length} ingredients
              </div>
              {filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  onClick={() => handleIngredientSelect(ingredient)}
                  className={`p-2 cursor-pointer rounded ${
                    selectedIngredient?.id === ingredient.id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{ingredient.nameRo || ingredient.name}</div>
                  <div className="text-xs text-gray-500">{ingredient.name}</div>
                  <div className="text-xs text-gray-400">
                    {ingredient.calories}C, {ingredient.protein}P, {ingredient.carbs}CH, {ingredient.fat}F per {ingredient.per}
                    {ingredient.aliases?.some(alias => alias.startsWith('TYPE:gram')) && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        100g default
                      </span>
                    )}
                    {ingredient.aliases?.some(alias => alias.startsWith('TYPE:handful')) && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        1 handful default
                      </span>
                    )}
                    {ingredient.aliases?.some(alias => alias.startsWith('TYPE:piece')) && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        1 piece default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Quantity and Unit */}
        {selectedIngredient && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => {
                  const newUnit = e.target.value;
                  setUnit(newUnit);
                  // Auto-adjust quantity based on unit
                  if (newUnit === 'g' || newUnit === 'ml') {
                    setQuantity(100);
                  } else {
                    setQuantity(1); // piece, slice, handful, tsp, tbsp, scoop, cup, oz, lb, kg, l
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="g">g (grams)</option>
                <option value="ml">ml (milliliters)</option>
                <option value="piece">piece</option>
                <option value="slice">slice</option>
                <option value="tsp">tsp (teaspoon)</option>
                <option value="tbsp">tbsp (tablespoon)</option>
                <option value="cup">cup</option>
                <option value="oz">oz (ounce)</option>
                <option value="lb">lb (pound)</option>
                <option value="kg">kg (kilogram)</option>
                <option value="l">l (liter)</option>
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedIngredient}
            className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Ingredient
          </button>
        </div>
      </div>
    </div>
  );
}

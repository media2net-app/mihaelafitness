'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, X, ChefHat } from 'lucide-react';

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

interface IngredientSelectorV2Props {
  onAddIngredient: (ingredient: Ingredient, quantity: number) => Promise<void>;
  onClose: () => void;
  mealType: string;
}

export default function IngredientSelectorV2({ onAddIngredient, onClose, mealType }: IngredientSelectorV2Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const categories = ['all', 'protein', 'carbs', 'fats', 'vegetables', 'fruits', 'dairy', 'grains', 'other'];

  // Fetch ingredients from database
  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/ingredients');
        if (response.ok) {
          const data = await response.json();
          setIngredients(data);
          setFilteredIngredients(data);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  // Filter ingredients based on search term and category
  useEffect(() => {
    let filtered = ingredients;

    if (searchTerm) {
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ingredient => ingredient.category === selectedCategory);
    }

    setFilteredIngredients(filtered);
  }, [ingredients, searchTerm, selectedCategory]);

  const handleAddIngredient = async () => {
    if (!selectedIngredient) return;

    try {
      await onAddIngredient(selectedIngredient, quantity);
      setSelectedIngredient(null);
      setQuantity(100);
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  const getMealDisplayName = (mealType: string) => {
    switch (mealType) {
      case 'morning-snack': return 'Morning Snack';
      case 'afternoon-snack': return 'Afternoon Snack';
      case 'evening-snack': return 'Evening Snack';
      default: return mealType.charAt(0).toUpperCase() + mealType.slice(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-[95vw] max-w-4xl max-h-[85vh] overflow-auto rounded-lg shadow-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Add Ingredient to {getMealDisplayName(mealType)}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Ingredients</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Ingredient and Quantity */}
          {selectedIngredient && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Selected Ingredient</h4>
                <button
                  onClick={() => setSelectedIngredient(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Ingredient</div>
                  <div className="text-lg font-semibold text-gray-900">{selectedIngredient.name}</div>
                  <div className="text-sm text-gray-500">Per {selectedIngredient.per}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-500">
                      {selectedIngredient.per === '100g' ? 'g' : selectedIngredient.per}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Calories</div>
                  <div className="text-lg font-semibold text-orange-600">
                    {Math.round(selectedIngredient.calories * (quantity / 100))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Protein</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {Math.round(selectedIngredient.protein * (quantity / 100))}g
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Carbs</div>
                  <div className="text-lg font-semibold text-green-600">
                    {Math.round(selectedIngredient.carbs * (quantity / 100))}g
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Fat</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {Math.round(selectedIngredient.fat * (quantity / 100))}g
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddIngredient}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Meal
                </button>
              </div>
            </div>
          )}

          {/* Ingredients List */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Ingredients</h4>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading ingredients...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    onClick={() => setSelectedIngredient(ingredient)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedIngredient?.id === ingredient.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{ingredient.name}</h5>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {ingredient.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Per {ingredient.per}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-orange-600">{ingredient.calories} cal</div>
                      <div className="text-blue-600">{ingredient.protein}g protein</div>
                      <div className="text-green-600">{ingredient.carbs}g carbs</div>
                      <div className="text-purple-600">{ingredient.fat}g fat</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredIngredients.length === 0 && !loading && (
              <div className="text-center py-8">
                <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No ingredients found</h4>
                <p className="text-gray-500">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}














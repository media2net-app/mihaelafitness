'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Plus, Search, Edit, Trash2, Clock, Users, Utensils } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  per: string;
}

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  exists: boolean;
  availableInApi: boolean;
  ingredient?: Ingredient;
  apiMatch?: any;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export default function ReceptenPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewRecipeModal, setShowNewRecipeModal] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      try {
        // Load ingredients from database
        let ingredientsData: Ingredient[] = [];
        const ingredientsResponse = await fetch('/api/ingredients');
        if (ingredientsResponse.ok) {
          ingredientsData = await ingredientsResponse.json();
          setIngredients(ingredientsData);
        }

        // Load recipes from database
        const recipesResponse = await fetch('/api/recipes');
        if (recipesResponse.ok) {
          const recipesData = await recipesResponse.json();
          
          // Convert database recipes to frontend format with ingredient matching
          const formattedRecipes = recipesData.map((dbRecipe: any) => {
            const formattedRecipe: Recipe = {
              id: dbRecipe.id,
              name: dbRecipe.name,
              description: dbRecipe.description,
              prepTime: dbRecipe.prepTime,
              servings: dbRecipe.servings,
              instructions: dbRecipe.instructions || '',
              totalCalories: dbRecipe.totalCalories,
              totalProtein: dbRecipe.totalProtein,
              totalCarbs: dbRecipe.totalCarbs,
              totalFat: dbRecipe.totalFat,
              ingredients: dbRecipe.ingredients.map((dbIng: any) => {
                // Find matching ingredient in database
                let existingIngredient = null;
                let exists = false;
                
                if (ingredientsData && ingredientsData.length > 0) {
                  // Try exact match first
                  existingIngredient = ingredientsData.find((ing: any) => 
                    ing.name.toLowerCase() === dbIng.name.toLowerCase()
                  );
                  
                  if (existingIngredient) {
                    exists = true;
                  } else {
                    // Try partial match
                    existingIngredient = ingredientsData.find((ing: any) => 
                      ing.name.toLowerCase().includes(dbIng.name.toLowerCase()) ||
                      dbIng.name.toLowerCase().includes(ing.name.toLowerCase())
                    );
                    
                    if (existingIngredient) {
                      exists = true;
                    }
                  }
                }
                
                return {
                  name: dbIng.name,
                  quantity: dbIng.quantity,
                  unit: dbIng.unit,
                  exists: exists,
                  availableInApi: dbIng.availableInApi || false,
                  apiMatch: dbIng.apiMatch ? JSON.parse(dbIng.apiMatch) : null,
                  ingredient: existingIngredient
                };
              })
            };
            
            return formattedRecipe;
          });
          
          setRecipes(formattedRecipes);
        } else {
          console.error('Failed to load recipes from database');
          setRecipes([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRecipeClick = (recipeId: string) => {
    router.push(`/admin/recepten/${recipeId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <ChefHat className="w-6 h-6 mr-3 text-indigo-500" />
          Recepten
        </h1>
        <p className="text-gray-600">Manage your recipes and meal preparations</p>
      </div>

      {/* Search and Add Button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowNewRecipeModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Recipe
        </button>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecipes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No recipes found</h3>
            <p className="text-gray-500">Create your first recipe to get started</p>
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => handleRecipeClick(recipe.id)}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              {/* Recipe Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{recipe.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{recipe.description}</p>
                  
                  {/* Recipe Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.prepTime} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement edit functionality
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement delete functionality
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nutrition Summary */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <div className="text-sm font-semibold text-orange-600">{Math.round(recipe.totalCalories)}</div>
                  <div className="text-xs text-gray-500">kcal</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-sm font-semibold text-blue-600">{Math.round(recipe.totalProtein)}g</div>
                  <div className="text-xs text-gray-500">protein</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-sm font-semibold text-green-600">{Math.round(recipe.totalCarbs)}g</div>
                  <div className="text-xs text-gray-500">carbs</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="text-sm font-semibold text-purple-600">{Math.round(recipe.totalFat)}g</div>
                  <div className="text-xs text-gray-500">fat</div>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Utensils className="w-4 h-4 mr-1" />
                  Ingredients
                </h4>
                <div className="space-y-1">
                  {recipe.ingredients.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <div className="font-medium mb-1">Geen ingrediënten toegevoegd</div>
                      <div className="text-xs">Voeg je eerste ingrediënt toe om te beginnen</div>
                    </div>
                  ) : (
                    recipe.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                        ingredient.exists 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      <span className="font-medium">
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </span>
                      {!ingredient.exists && (
                        <div className="flex gap-1">
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                            Missing
                          </span>
                          {ingredient.availableInApi && (
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                              API
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    ))
                  )}
                </div>
              </div>

              {/* Instructions Preview */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h4>
                <div className="text-sm text-gray-600">
                  {recipe.instructions.split('\n').slice(0, 2).map((instruction, index) => (
                    <div key={index} className="mb-1">
                      {instruction.trim()}
                    </div>
                  ))}
                  {recipe.instructions.split('\n').length > 2 && (
                    <div className="text-indigo-500 text-xs mt-1">
                      +{recipe.instructions.split('\n').length - 2} more steps
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

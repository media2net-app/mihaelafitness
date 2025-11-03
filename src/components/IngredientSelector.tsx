'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiPlus, FiX, FiCheckCircle } from 'react-icons/fi';

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

interface MealMacros { calories: number; protein: number; carbs: number; fat: number }
interface IngredientSelectorProps {
  onAddIngredient: (ingredient: Ingredient, quantity: number, mealType: string) => Promise<void> | void;
  onAddRecipe?: (recipe: any, mealType: string) => Promise<void> | void; // optional: for adding recipes
  mealType: string;
  dayKey: string;
  currentMealMacros?: MealMacros; // optional: to display combined totals (current + selected)
}

export default function IngredientSelector({ onAddIngredient, onAddRecipe, mealType, dayKey, currentMealMacros }: IngredientSelectorProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [keepOpen, setKeepOpen] = useState(true); // default enabled
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  // Right column: selected items (cart)
  const [selectedItems, setSelectedItems] = useState<Array<{ ingredient: Ingredient; quantity: number }>>([]);
  // Create new ingredient inline
  const [showCreate, setShowCreate] = useState(false);
  // Recipe selector state
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
  const [selectedRecipeLabel, setSelectedRecipeLabel] = useState<string>('all');
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [addingRecipe, setAddingRecipe] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [savingNew, setSavingNew] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);
  const [applyingIngredients, setApplyingIngredients] = useState(false);
  const [applyProgress, setApplyProgress] = useState<string[]>([]);
  const defaultNewIng = {
    name: '',
    per: '100g',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    category: 'other',
    aliases: ''
  } as const;

  const [newIng, setNewIng] = useState<{ 
    name: string; per: string; calories: string; protein: string; carbs: string; fat: string; fiber: string; sugar: string; category: string; aliases: string;
  }>({...defaultNewIng});

  const openCreateForm = () => {
    setNewIng({...defaultNewIng});
    setShowCreate(true);
  };

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

  // Load recipes when recipe selector opens
  const loadRecipes = async () => {
    setLoadingRecipes(true);
    try {
      const response = await fetch('/api/recipes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load recipes:', response.status, errorText);
        setRecipes([]);
        setFilteredRecipes([]);
        return;
      }
      
      const data = await response.json();
      
      // Check if data is an array or has an error
      if (Array.isArray(data)) {
        setRecipes(data);
        setFilteredRecipes(data);
      } else if (data.error) {
        console.error('API returned error:', data.error);
        setRecipes([]);
        setFilteredRecipes([]);
      } else {
        // Unexpected format
        console.error('Unexpected response format:', data);
        setRecipes([]);
        setFilteredRecipes([]);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      // Show user-friendly error
      setRecipes([]);
      setFilteredRecipes([]);
      alert('Failed to load recipes. Please check if the server is running and try again.');
    } finally {
      setLoadingRecipes(false);
    }
  };

  // Filter recipes based on search term and label
  useEffect(() => {
    if (!showRecipeSelector || recipes.length === 0) return;
    
    let filtered = recipes;
    
    // Filter by search term
    if (recipeSearchTerm.trim()) {
      const search = recipeSearchTerm.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(search) ||
        recipe.description?.toLowerCase().includes(search)
      );
    }
    
    // Filter by label
    if (selectedRecipeLabel !== 'all') {
      filtered = filtered.filter(recipe =>
        recipe.labels?.includes(selectedRecipeLabel)
      );
    }
    
    // Sort alphabetically by name (A to Z)
    filtered = filtered.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    setFilteredRecipes(filtered);
  }, [recipes, recipeSearchTerm, selectedRecipeLabel, showRecipeSelector]);

  // Get unique labels from recipes
  const recipeLabels = Array.from(new Set(recipes.flatMap(r => r.labels || []))).sort();

  // Auto-scroll progress logs to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current && progressLogs.length > 0) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [progressLogs]);

  // Filter ingredients based on search and category (debounced on searchTerm)
  useEffect(() => {
    const run = () => {
      let filtered = ingredients;
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        filtered = filtered.filter(ingredient =>
          ingredient.name.toLowerCase().includes(term) ||
          (() => {
            try {
              const aliasesArray = typeof ingredient.aliases === 'string' ? JSON.parse(ingredient.aliases) : ingredient.aliases;
              return Array.isArray(aliasesArray) && aliasesArray.some(alias => alias.toLowerCase().includes(term));
            } catch {
              return false;
            }
          })()
        );
      }
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(ingredient => ingredient.category === selectedCategory);
      }
      setFilteredIngredients(filtered);
      setShowCreate(term.length > 0 && filtered.length === 0);
    };

    if (debounceTimer) clearTimeout(debounceTimer);
    const t = setTimeout(run, 250);
    setDebounceTimer(t);
    return () => clearTimeout(t);
  }, [ingredients, searchTerm, selectedCategory]);

  // Get unique categories (coerce undefined to 'other' to avoid TS warnings)
  const categories = ['all', ...Array.from(new Set(ingredients.map(ing => ing.category ?? 'other')))];

  // Extract type from aliases
  const getIngredientType = (ingredient: Ingredient): string => {
    try {
      const aliasesArray = typeof ingredient.aliases === 'string' ? JSON.parse(ingredient.aliases) : ingredient.aliases;
      const typeAlias = Array.isArray(aliasesArray) ? aliasesArray.find(alias => alias.startsWith('TYPE:')) : null;
      return typeAlias ? typeAlias.replace('TYPE:', '') : 'gram';
    } catch {
      return 'gram';
    }
  };

  // Parse base quantity from `per` field (e.g., "100g", "1 piece", "250ml")
  const getBaseQuantity = (ingredient: Ingredient): { amount: number; unit: 'g'|'ml'|'piece'; type: string } => {
    const per = ingredient.per || '';
    const typeAlias = getIngredientType(ingredient); // 'gram' | 'ml' | 'piece'
    const gMatch = per.match(/(\d+(?:\.\d+)?)\s*g/i);
    if (gMatch) return { amount: parseFloat(gMatch[1]), unit: 'g', type: 'gram' };
    const mlMatch = per.match(/(\d+(?:\.\d+)?)\s*ml/i);
    if (mlMatch) return { amount: parseFloat(mlMatch[1]), unit: 'ml', type: 'ml' };
    const pieceMatch = per.match(/(\d+(?:\.\d+)?)\s*(piece|pieces|slice|slices|stuks)/i);
    if (pieceMatch) return { amount: parseFloat(pieceMatch[1]), unit: 'piece', type: 'piece' };
    // If per is just a number (no unit), infer unit from alias type
    const numOnly = per.match(/^\s*(\d+(?:\.\d+)?)\s*$/);
    if (numOnly) {
      const amt = parseFloat(numOnly[1]);
      if (typeAlias === 'gram') return { amount: amt, unit: 'g', type: 'gram' };
      if (typeAlias === 'ml') return { amount: amt, unit: 'ml', type: 'ml' };
      return { amount: amt, unit: 'piece', type: 'piece' };
    }
    // default to gram 100
    return { amount: 100, unit: 'g', type: 'gram' };
  };

  const displayUnit = (unit: string) => unit;

  // Compute scaled macros for a given ingredient and quantity relative to base `per`
  const getScaledMacros = (ingredient: Ingredient, qty: number): MealMacros => {
    const base = getBaseQuantity(ingredient).amount || 1;
    const factor = qty / base;
    return {
      calories: Math.round((ingredient.calories || 0) * factor),
      protein: Math.round((ingredient.protein || 0) * factor),
      carbs: Math.round((ingredient.carbs || 0) * factor),
      fat: Math.round((ingredient.fat || 0) * factor),
    };
  };

  // Handle adding ingredient
  const handleAddIngredient = (ingredient: Ingredient) => {
    // Determine default quantity from `per` if quantity left at 1
    const per = ingredient.per || '';
    let defaultQty = quantity;
    if (quantity === 1) {
      const gMatch = per.match(/(\d+(?:\.\d+)?)\s*g/i);
      if (gMatch) defaultQty = parseFloat(gMatch[1]);
      const mlMatch = per.match(/(\d+(?:\.\d+)?)\s*ml/i);
      if (!gMatch && mlMatch) defaultQty = parseFloat(mlMatch[1]);
      const pieceMatch = per.match(/(\d+(?:\.\d+)?)\s*(piece|pieces|slice|slices|stuks)/i);
      // For piece-like units keep 1 as default; user explicitly chooses count
      if (!gMatch && !mlMatch && pieceMatch) defaultQty = 1;
      // per is a number only, infer unit from alias type
      if (!gMatch && !mlMatch && !pieceMatch) {
        const numOnly = per.match(/^\s*(\d+(?:\.\d+)?)\s*$/);
        if (numOnly) {
          const amt = parseFloat(numOnly[1]);
          const typeAlias = getIngredientType(ingredient);
          if (typeAlias === 'gram') defaultQty = amt;
          else if (typeAlias === 'ml') defaultQty = amt;
          else defaultQty = 1; // piece-like
        }
      }
    }
    setSelectedItems(prev => {
      // if already present, increment its quantity
      const idx = prev.findIndex(i => i.ingredient.id === ingredient.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + defaultQty };
        return copy;
      }
      return [...prev, { ingredient, quantity: defaultQty }];
    });
    setSearchTerm('');
    setQuantity(1);
  };

  const handleRemoveSelected = (id: string) => {
    setSelectedItems(items => items.filter(i => i.ingredient.id !== id));
  };

  const handleChangeSelectedQty = (id: string, newQty: number) => {
    if (!Number.isFinite(newQty) || newQty < 0.25) return;
    setSelectedItems(items => items.map(i => i.ingredient.id === id ? { ...i, quantity: newQty } : i));
  };

  const handleApplyToMeal = async () => {
    if (selectedItems.length === 0) return;
    
    setApplyingIngredients(true);
    setApplyProgress([]);
    
    try {
      // Apply sequentially to avoid race conditions where later writes overwrite earlier ones
      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        setApplyProgress(prev => [...prev, `Adding ${item.ingredient.name}...`]);
        
        // Await in case onAddIngredient is async
        await onAddIngredient(item.ingredient, item.quantity, mealType);
        
        setApplyProgress(prev => [...prev, `✅ ${item.ingredient.name} added successfully`]);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setApplyProgress(prev => [...prev, '🎉 All ingredients added successfully!']);
      
      // Clear cart after apply
      setSelectedItems([]);
      
      // Wait a moment to show success message, then close modal
      setTimeout(() => {
        setApplyingIngredients(false);
        setApplyProgress([]);
        if (!keepOpen) setIsOpen(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error applying ingredients:', error);
      setApplyProgress(prev => [...prev, '❌ Error adding ingredients. Please try again.']);
      
      setTimeout(() => {
        setApplyingIngredients(false);
        setApplyProgress([]);
      }, 2000);
    }
  };

  const selectedTotals: MealMacros = selectedItems.reduce((acc, it) => {
    const m = getScaledMacros(it.ingredient, it.quantity);
    return {
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleCreateIngredient = async () => {
    try {
      setNewError(null);
      setSavingNew(true);
      const payload = {
        name: newIng.name.trim(),
        per: newIng.per.trim(),
        calories: Number(newIng.calories) || 0,
        protein: Number(newIng.protein) || 0,
        carbs: Number(newIng.carbs) || 0,
        fat: Number(newIng.fat) || 0,
        fiber: Number(newIng.fiber) || 0,
        sugar: Number(newIng.sugar) || 0,
        category: newIng.category || 'other',
        aliases: newIng.aliases
          .split(',')
          .map(a => a.trim())
          .filter(Boolean)
      };
      if (!payload.name) return alert('Please provide a name');
      if (!payload.per) return alert('Please provide the base unit (e.g., 100g)');
      const res = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to create ingredient');
      }
      const created = await res.json();
      // Update local list and select it
      const updatedList = [created, ...ingredients];
      setIngredients(updatedList);
      setFilteredIngredients(updatedList);
      // Auto-add to cart with its base quantity
      const base = getBaseQuantity(created);
      setSelectedItems(prev => [...prev, { ingredient: created, quantity: base.amount }]);
      setShowCreate(false);
    } catch (e: any) {
      alert(`Failed to create ingredient: ${e.message || e}`);
    }
  };

  // Handle adding recipe
  const handleAddRecipe = async (recipe: any) => {
    if (!onAddRecipe) return;

    // Show progress modal
    setShowProgressModal(true);
    setProgressLogs([`Starting to add recipe: ${recipe.name}`]);
    setAddingRecipe(true);

    // Get recipe details with ingredients if not already loaded
    let recipeWithIngredients = recipe;
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      try {
        const recipeResponse = await fetch(`/api/recipes/${recipe.id}`);
        if (recipeResponse.ok) {
          recipeWithIngredients = await recipeResponse.json();
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      }
    }

    // Add log for each ingredient
    const ingredients = recipeWithIngredients.ingredients || [];

    const addLog = (message: string) => {
      setProgressLogs(prev => [...prev, message]);
    };

    // Simulate adding ingredients one by one
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      const ingredientName = ingredient.name || `Ingredient ${i + 1}`;
      const quantity = ingredient.quantity || 1;
      const unit = ingredient.unit || 'g';
      
      addLog(`Adding ingredient ${i + 1}/${ingredients.length}: ${quantity}${unit} ${ingredientName}`);
      
      // Small delay for visual effect (only if not the last ingredient)
      if (i < ingredients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    addLog(`All ingredients processed. Saving recipe to meal plan...`);

    try {
      // Actually add the recipe via the callback
      await onAddRecipe(recipeWithIngredients, mealType);
      
      addLog(`✅ Recipe "${recipe.name}" successfully added!`);
      
      // Wait a moment to show success message
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Close both modals
      setShowProgressModal(false);
      setShowRecipeSelector(false);
      setProgressLogs([]);
    } catch (error) {
      console.error('Error adding recipe:', error);
      addLog(`❌ Error: Failed to add recipe. Please try again.`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowProgressModal(false);
      setProgressLogs([]);
    } finally {
      setAddingRecipe(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
        >
          <FiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Ingredient</span>
          <span className="sm:hidden">Add</span>
        </button>
        
        {onAddRecipe && (
          <button
            onClick={() => {
              setShowRecipeSelector(true);
              loadRecipes();
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
          >
            <FiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Recipe</span>
            <span className="sm:hidden">Recipe</span>
          </button>
        )}
      </div>

      {isOpen && (
        <>
          {/* Modal Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
            onClick={() => !applyingIngredients && setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[90vw] lg:w-[900px] bg-white rounded-xl shadow-2xl border border-gray-200 z-[1000] max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {applyingIngredients ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                      Adding Ingredients...
                    </>
                  ) : (
                    'Add Ingredient'
                  )}
                </h3>
                <div className="flex items-center gap-3">
                  {!applyingIngredients && (
                    <>
                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input type="checkbox" checked={keepOpen} onChange={(e)=>setKeepOpen(e.target.checked)} />
                        Keep open
                      </label>
                      <button onClick={openCreateForm} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100">New</button>
                    </>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)} 
                    disabled={applyingIngredients}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <FiX className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-1 xl:grid-cols-2 gap-0 h-full ${applyingIngredients ? 'pointer-events-none opacity-50' : ''}`}>
              {/* Left column: search and list */}
              <div className="p-4 border-r border-gray-100">
                {/* Search */}
                <div className="relative mb-3">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ingredients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                {!showCreate && (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={openCreateForm}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      + Add new ingredient
                    </button>
                  </div>
                )}

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Results */}
                <div className="max-h-[40vh] sm:max-h-[50vh] overflow-y-auto rounded-lg border border-gray-100">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
                      Loading ingredients...
                    </div>
                  ) : filteredIngredients.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filteredIngredients.map((ingredient) => {
                        const type = getIngredientType(ingredient);
                        return (
                          <div
                            key={ingredient.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer transition-colors active:bg-green-50"
                            onClick={() => handleAddIngredient(ingredient)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{ingredient.name}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <div className="hidden sm:block">{ingredient.per} • {type} • {ingredient.calories} cal | P {ingredient.protein}g • C {ingredient.carbs}g • F {ingredient.fat}g</div>
                                  <div className="sm:hidden">{ingredient.per} • {ingredient.calories} cal</div>
                                </div>
                              </div>
                              <FiPlus className="w-5 h-5 text-green-500 flex-shrink-0" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="text-sm text-gray-600 mb-2">No ingredients found for "{searchTerm}"</div>
                      <button className="px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" onClick={openCreateForm}>Create new ingredient</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column: selected items cart + totals + create form */}
              <div className="p-4 overflow-y-auto max-h-[50vh] xl:max-h-none">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default quantity for next add</label>
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Use 0.25 (1/4), 0.5 (1/2), 1, 1.5, etc. for per-piece ingredients
                  </div>
                </div>

                {/* Selected items */}
                <div className="border border-gray-200 rounded-lg divide-y">
                  {selectedItems.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No items selected yet. Click an ingredient on the left to add.</div>
                  ) : (
                    selectedItems.map(({ ingredient, quantity }) => {
                      const base = getBaseQuantity(ingredient);
                      const macros = getScaledMacros(ingredient, quantity);
                      return (
                        <div key={ingredient.id} className="p-3 flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{ingredient.name}</div>
                            <div className="text-xs text-gray-500">per {ingredient.per}</div>
                            <div className="mt-1 text-xs text-gray-600">
                              <div className="hidden sm:block">{macros.calories} cal | P {macros.protein}g • C {macros.carbs}g • F {macros.fat}g</div>
                              <div className="sm:hidden">{macros.calories} cal</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <input
                              type="number"
                              min={0.25}
                              step={0.25}
                              value={quantity}
                              onChange={(e)=> handleChangeSelectedQty(ingredient.id, parseFloat(e.target.value) || base.amount)}
                              className="w-16 sm:w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <span className="text-xs text-gray-500 hidden sm:inline">{displayUnit(base.unit)}</span>
                            <button onClick={()=>handleRemoveSelected(ingredient.id)} className="p-1 rounded hover:bg-gray-100 active:bg-gray-200">
                              <FiX className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Totals */}
                <div className="mt-3 p-3 bg-gray-50 rounded border text-sm">
                  <div className="font-semibold text-gray-800 mb-2">Totals</div>
                  {currentMealMacros ? (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Current meal</span>
                        <span className="font-medium text-right">
                          <div className="hidden sm:block">{currentMealMacros.calories} cal | P {currentMealMacros.protein}g • C {currentMealMacros.carbs}g • F {currentMealMacros.fat}g</div>
                          <div className="sm:hidden">{currentMealMacros.calories} cal</div>
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Selected items</span>
                        <span className="font-medium text-right">
                          <div className="hidden sm:block">{selectedTotals.calories} cal | P {selectedTotals.protein}g • C {selectedTotals.carbs}g • F {selectedTotals.fat}g</div>
                          <div className="sm:hidden">{selectedTotals.calories} cal</div>
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-t pt-2">
                        <span className="text-gray-800 font-medium">Resulting meal</span>
                        <span className="font-semibold text-right">
                          <div className="hidden sm:block">{currentMealMacros.calories + selectedTotals.calories} cal | P {currentMealMacros.protein + selectedTotals.protein}g • C {currentMealMacros.carbs + selectedTotals.carbs}g • F {currentMealMacros.fat + selectedTotals.fat}g</div>
                          <div className="sm:hidden">{currentMealMacros.calories + selectedTotals.calories} cal</div>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-gray-600">Selected items</span>
                      <span className="font-medium text-right">
                        <div className="hidden sm:block">{selectedTotals.calories} cal | P {selectedTotals.protein}g • C {selectedTotals.carbs}g • F {selectedTotals.fat}g</div>
                        <div className="sm:hidden">{selectedTotals.calories} cal</div>
                      </span>
                    </div>
                  )}
                </div>

                {/* Apply */}
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    disabled={selectedItems.length === 0 || applyingIngredients}
                    onClick={handleApplyToMeal}
                    className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 hover:bg-green-600 active:bg-green-700 font-medium flex items-center gap-2"
                  >
                    {applyingIngredients ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      'Apply to meal'
                    )}
                  </button>
                </div>

                {/* Progress Log */}
                {applyingIngredients && applyProgress.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-2">Adding ingredients...</div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {applyProgress.map((message, index) => (
                        <div key={index} className="text-xs text-blue-700 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          {message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showCreate && (
                  <>
                    {/* Nested focus modal for creating ingredient */}
                    <div className="fixed inset-0 bg-black/40 z-[1100]" onClick={()=>setShowCreate(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[92vw] max-w-[680px] bg-white rounded-xl shadow-2xl z-[1200] border border-gray-200 max-h-[90vh] overflow-y-auto">
                      <div className="px-5 py-4 border-b flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-800">New Ingredient</h4>
                        <button className="p-2 rounded hover:bg-gray-100" onClick={()=>setShowCreate(false)}>
                          <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Name</label>
                            <input className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" placeholder="e.g., Banana" value={newIng.name} onChange={(e)=>setNewIng({...newIng, name: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Per (base unit)</label>
                            <input className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" placeholder="e.g., 100g, 1 piece, 250ml" value={newIng.per} onChange={(e)=>setNewIng({...newIng, per: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Calories (per base)</label>
                            <input type="number" inputMode="decimal" placeholder="0" className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" value={newIng.calories} onChange={(e)=>setNewIng({...newIng, calories: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Protein g (per base)</label>
                            <input type="number" inputMode="decimal" placeholder="0" className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" value={newIng.protein} onChange={(e)=>setNewIng({...newIng, protein: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Carbs g (per base)</label>
                            <input type="number" inputMode="decimal" placeholder="0" className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" value={newIng.carbs} onChange={(e)=>setNewIng({...newIng, carbs: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Fat g (per base)</label>
                            <input type="number" inputMode="decimal" placeholder="0" className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" value={newIng.fat} onChange={(e)=>setNewIng({...newIng, fat: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Fiber g (per base)</label>
                            <input type="number" inputMode="decimal" placeholder="0" className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" value={newIng.fiber} onChange={(e)=>setNewIng({...newIng, fiber: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Sugar g (per base)</label>
                            <input type="number" inputMode="decimal" placeholder="0" className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" value={newIng.sugar} onChange={(e)=>setNewIng({...newIng, sugar: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Category</label>
                            <select className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" value={newIng.category} onChange={(e)=>setNewIng({...newIng, category: e.target.value})}>
                              {['proteins','carbohydrates','fruits','vegetables','healthy-fats','dairy','nuts-seeds','other'].map(c=> (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-gray-600">Aliases (comma-separated)</label>
                            <input className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" placeholder="e.g., Lime, Citrus aurantiifolia" value={newIng.aliases} onChange={(e)=>setNewIng({...newIng, aliases: e.target.value})} />
                          </div>
                          {newError && (
                            <div className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{newError}</div>
                          )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={()=>setShowCreate(false)}>Cancel</button>
                          <button disabled={savingNew} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" onClick={handleCreateIngredient}>{savingNew ? 'Saving...' : 'Save Ingredient'}</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recipe Selector Modal */}
      {showRecipeSelector && (
        <>
          {/* Modal Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
            onClick={() => setShowRecipeSelector(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[90vw] lg:w-[700px] xl:w-[800px] bg-white rounded-xl shadow-2xl border border-gray-200 z-[1000] max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Select Recipe</h2>
              <button
                onClick={() => {
                  setShowRecipeSelector(false);
                  setRecipeSearchTerm('');
                  setSelectedRecipeLabel('all');
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={recipeSearchTerm}
                    onChange={(e) => setRecipeSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Label Filter */}
                {recipeLabels.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedRecipeLabel('all')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedRecipeLabel === 'all'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    {recipeLabels.map(label => (
                      <button
                        key={label}
                        onClick={() => setSelectedRecipeLabel(label)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                          selectedRecipeLabel === label
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Results count */}
              {filteredRecipes.length !== recipes.length && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing {filteredRecipes.length} of {recipes.length} recipes
                </p>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingRecipes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Loading recipes...</span>
                </div>
              ) : filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 group"
                      onClick={() => handleAddRecipe(recipe)}
                    >
                      {/* Recipe Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 mb-1">
                            {recipe.name}
                          </h3>
                          {recipe.labels && recipe.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {recipe.labels.map((label: string) => (
                                <span
                                  key={label}
                                  className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddRecipe(recipe);
                          }}
                          className="ml-2 px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors font-medium flex-shrink-0"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Nutrition Info */}
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <div className="text-xs font-semibold text-orange-600">{Math.round(recipe.totalCalories || 0)}</div>
                          <div className="text-xs text-gray-500">kcal</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-xs font-semibold text-blue-600">{Math.round(recipe.totalProtein || 0)}g</div>
                          <div className="text-xs text-gray-500">protein</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-xs font-semibold text-green-600">{Math.round(recipe.totalCarbs || 0)}g</div>
                          <div className="text-xs text-gray-500">carbs</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="text-xs font-semibold text-purple-600">{Math.round(recipe.totalFat || 0)}g</div>
                          <div className="text-xs text-gray-500">fat</div>
                        </div>
                      </div>
                      
                      {/* Recipe Info */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                        <span>{recipe.ingredients?.length || 0} ingredients</span>
                        {recipe.prepTime && (
                          <span>{recipe.prepTime} min</span>
                        )}
                      </div>
                      
                      {/* Description (if available, truncated) */}
                      {recipe.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {recipe.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No recipes found</p>
                  {recipeSearchTerm || selectedRecipeLabel !== 'all' ? (
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">Create your first recipe to get started</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Progress Modal */}
      {showProgressModal && (
        <>
          {/* Modal Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[1001]"
            onClick={() => {}} // Don't close on backdrop click during adding
          />
          
          {/* Modal Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[90vw] lg:w-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 z-[1002] max-h-[60vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {addingRecipe ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                ) : (
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                )}
                Adding Recipe
              </h2>
              {!addingRecipe && (
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    setProgressLogs([]);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Progress Logs */}
            <div 
              ref={logContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-gray-50"
              style={{ maxHeight: 'calc(60vh - 80px)' }}
            >
              <div className="space-y-2">
                {progressLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded-lg ${
                      log.includes('✅') 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : log.includes('❌')
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : log.includes('Adding ingredient')
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {log.includes('✅') && (
                        <FiCheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="font-mono text-xs">{log}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            {!addingRecipe && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    setProgressLogs([]);
                    setShowRecipeSelector(false);
                  }}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
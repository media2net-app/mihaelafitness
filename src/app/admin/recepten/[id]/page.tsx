'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChefHat, Clock, Users, Utensils, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

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

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Function to extract correct unit from ingredient per value
  const getCorrectUnit = (ingredient: RecipeIngredient) => {
    if (!ingredient.exists || !ingredient.ingredient) {
      return ingredient.unit; // Fallback to stored unit
    }

    const per = ingredient.ingredient.per || '100g';
    
    // Check for explicit patterns first
    if (per.includes('scoop')) return 'scoop';
    if (per.includes('ml')) return 'ml';
    if (per.includes('tsp')) return 'tsp';
    if (per.includes('tbsp')) return 'tbsp';
    if (per.includes('piece') || per.includes('stuk')) return 'piece';
    if (per.includes('cup')) return 'cup';
    if (per.includes('l')) return 'l';
    if (per.includes('kg')) return 'kg';
    
    // For liquids, default to ml even if per shows "100g"
    const liquidIngredients = ['milk', 'water', 'oil', 'juice', 'broth', 'soup', 'sauce', 'vinegar', 'wine', 'beer'];
    const isLiquid = liquidIngredients.some(liquid => 
      ingredient.name?.toLowerCase().includes(liquid)
    );
    
    if (isLiquid && per.includes('g')) {
      return 'ml';
    }
    
    // Check for gram patterns
    if (per.includes('g') || per.includes('gram')) return 'g';
    
    // If it's just a number, assume it's a piece
    if (/^\d+(\.\d+)?$/.test(per)) return 'piece';
    
    // Default to stored unit
    return ingredient.unit;
  };

  // Function to format quantity and unit for display (converts grams to scoops if applicable)
  const formatIngredientQuantity = (ingredient: RecipeIngredient): { quantity: number | string, unit: string } => {
    if (!ingredient.exists || !ingredient.ingredient) {
      return { quantity: ingredient.quantity, unit: ingredient.unit };
    }

    const per = ingredient.ingredient.per || '100g';
    
    // Handle scoop-based ingredients (e.g., "1 scoop (15g)")
    if (per.includes('scoop')) {
      // Extract scoop size in grams from per field (e.g., "1 scoop (15g)" -> 15)
      const scoopGramsMatch = per.match(/\((\d+(?:\.\d+)?)\s*g\)/);
      if (scoopGramsMatch) {
        const scoopGrams = parseFloat(scoopGramsMatch[1]);
        // If quantity is in grams and matches scoop size exactly, convert to 1 scoop
        if (ingredient.unit === 'g' && ingredient.quantity && Math.abs(ingredient.quantity - scoopGrams) < 0.1) {
          return { quantity: 1, unit: 'scoop' };
        }
        // If quantity is a multiple of scoop size, convert to scoops
        if (ingredient.unit === 'g' && ingredient.quantity && ingredient.quantity > 0) {
          const scoops = ingredient.quantity / scoopGrams;
          // Only convert if it's close to a whole number of scoops (within 0.1)
          if (Math.abs(scoops - Math.round(scoops)) < 0.1) {
            const roundedScoops = Math.round(scoops);
            return { quantity: roundedScoops, unit: roundedScoops === 1 ? 'scoop' : 'scoops' };
          }
        }
      }
      // If already in scoop unit, return as is but fix plural
      if (ingredient.unit === 'scoop' || ingredient.unit === 'scoops') {
        return { quantity: ingredient.quantity, unit: ingredient.quantity === 1 ? 'scoop' : 'scoops' };
      }
    }
    
    // For other units, use getCorrectUnit
    return { quantity: ingredient.quantity, unit: getCorrectUnit(ingredient) };
  };

  // Function to get default quantity and unit from ingredient per value
  const getDefaultQuantityAndUnit = (ingredient: any) => {
    const per = ingredient.per || '100g';
    
    // Check for scoop pattern (e.g., "1 scoop (15g)")
    if (per.includes('scoop')) {
      const scoopMatch = per.match(/(\d+(?:\.\d+)?)\s*scoop/);
      return {
        quantity: scoopMatch ? scoopMatch[1] : '1',
        unit: 'scoop'
      };
    }
    
    // Check for ml pattern (e.g., "100ml")
    if (per.includes('ml')) {
      const mlMatch = per.match(/(\d+(?:\.\d+)?)\s*ml/);
      return {
        quantity: mlMatch ? mlMatch[1] : '100',
        unit: 'ml'
      };
    }
    
    // Check for tsp pattern
    if (per.includes('tsp')) {
      const tspMatch = per.match(/(\d+(?:\.\d+)?)\s*tsp/);
      return {
        quantity: tspMatch ? tspMatch[1] : '1',
        unit: 'tsp'
      };
    }
    
    // Check for tbsp pattern
    if (per.includes('tbsp')) {
      const tbspMatch = per.match(/(\d+(?:\.\d+)?)\s*tbsp/);
      return {
        quantity: tbspMatch ? tbspMatch[1] : '1',
        unit: 'tbsp'
      };
    }
    
    // Check for piece pattern (e.g., "1" or "1 piece")
    if (per.includes('piece') || per.includes('stuk') || /^\d+(\.\d+)?$/.test(per)) {
      const pieceMatch = per.match(/(\d+(?:\.\d+)?)/);
      return {
        quantity: pieceMatch ? pieceMatch[1] : '1',
        unit: 'piece'
      };
    }
    
    // Check for cup pattern
    if (per.includes('cup')) {
      const cupMatch = per.match(/(\d+(?:\.\d+)?)\s*cup/);
      return {
        quantity: cupMatch ? cupMatch[1] : '1',
        unit: 'cup'
      };
    }
    
    // Check for liter pattern
    if (per.includes('l') && !per.includes('ml')) {
      const lMatch = per.match(/(\d+(?:\.\d+)?)\s*l/);
      return {
        quantity: lMatch ? lMatch[1] : '1',
        unit: 'l'
      };
    }
    
    // Check for kg pattern
    if (per.includes('kg')) {
      const kgMatch = per.match(/(\d+(?:\.\d+)?)\s*kg/);
      return {
        quantity: kgMatch ? kgMatch[1] : '1',
        unit: 'kg'
      };
    }
    
    // For liquids, default to ml even if per shows "100g"
    const liquidIngredients = ['milk', 'water', 'oil', 'juice', 'broth', 'soup', 'sauce', 'vinegar', 'wine', 'beer'];
    const isLiquid = liquidIngredients.some(liquid => 
      ingredient.name?.toLowerCase().includes(liquid)
    );
    
    if (isLiquid && per.includes('g')) {
      return {
        quantity: '100',
        unit: 'ml'
      };
    }
    
    // Default to grams
    const gMatch = per.match(/(\d+(?:\.\d+)?)\s*g/);
    return {
      quantity: gMatch ? gMatch[1] : '100',
      unit: 'g'
    };
  };

  // Function to get correct "Per" display text for ingredient list
  const getPerDisplayText = (ingredient: any) => {
    const per = ingredient.per || '100g';
    
    // For liquids, show ml even if per shows "100g"
    const liquidIngredients = ['milk', 'water', 'oil', 'juice', 'broth', 'soup', 'sauce', 'vinegar', 'wine', 'beer'];
    const isLiquid = liquidIngredients.some(liquid => 
      ingredient.name?.toLowerCase().includes(liquid)
    );
    
    if (isLiquid && per.includes('g')) {
      return 'Per 100ml';
    }
    
    // Return the per value as is, but with proper formatting
    if (per === '1') {
      return 'Per 1 piece';
    }
    
    return `Per ${per}`;
  };
  const [checkingApi, setCheckingApi] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiLog, setApiLog] = useState<string[]>([]);
  const [foundIngredients, setFoundIngredients] = useState<any[]>([]);
  const [addingToDatabase, setAddingToDatabase] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [manualAddIngredient, setManualAddIngredient] = useState<any>(null);
  const [manualAddData, setManualAddData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    category: 'other',
    per: '100'
  });
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('g');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);
  const [ingredientQuantities, setIngredientQuantities] = useState<{[key: string]: string}>({});
  const [ingredientUnits, setIngredientUnits] = useState<{[key: string]: string}>({});
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');


  useEffect(() => {
    const loadData = async () => {
      try {
        // Load ingredients from database
        const ingredientsResponse = await fetch('/api/ingredients');
        if (ingredientsResponse.ok) {
          const ingredientsData = await ingredientsResponse.json();
          setIngredients(ingredientsData);
          
          // Load recipe from database
          const recipeResponse = await fetch(`/api/recipes/${params.id}`);
          if (recipeResponse.ok) {
            const recipeData = await recipeResponse.json();
            
            // Parse instructions if it's a JSON string
            let instructionsParsed = recipeData.instructions || '';
            if (typeof instructionsParsed === 'string') {
              try {
                // Try to parse as JSON first
                const parsed = JSON.parse(instructionsParsed);
                if (Array.isArray(parsed)) {
                  instructionsParsed = parsed.join('\n');
                }
              } catch {
                // If not JSON, use as is
                instructionsParsed = instructionsParsed;
              }
            }
            
            // Convert database recipe to frontend format
            const updatedRecipe = {
              id: recipeData.id,
              name: recipeData.name,
              description: recipeData.description || '',
              prepTime: recipeData.prepTime,
              servings: recipeData.servings,
              instructions: instructionsParsed,
              totalCalories: recipeData.totalCalories,
              totalProtein: recipeData.totalProtein,
              totalCarbs: recipeData.totalCarbs,
              totalFat: recipeData.totalFat,
              ingredients: recipeData.ingredients.map((dbIng: any) => {
                // Find matching ingredient in database
                let existingIngredient = ingredientsData.find((ing: Ingredient) => 
                  ing.name.toLowerCase() === dbIng.name.toLowerCase()
                );
                
                // If no exact match, try partial match but prefer gram-based ingredients
                if (!existingIngredient) {
                  const partialMatches = ingredientsData.filter((ing: Ingredient) => 
                    ing.name.toLowerCase().includes(dbIng.name.toLowerCase()) ||
                    dbIng.name.toLowerCase().includes(ing.name.toLowerCase())
                  );
                  
                  // Prefer gram-based ingredients (per: "100") over piece-based (per: "1")
                  existingIngredient = partialMatches.find((ing: Ingredient) => ing.per === "100") || 
                                     partialMatches.find((ing: Ingredient) => ing.per === "1") ||
                                     partialMatches[0];
                }
                
                return {
                  name: dbIng.name,
                  quantity: dbIng.quantity,
                  unit: dbIng.unit,
                  exists: existingIngredient ? true : false,
                  availableInApi: dbIng.availableInApi,
                  apiMatch: dbIng.apiMatch ? JSON.parse(dbIng.apiMatch) : null,
                  ingredient: existingIngredient
                };
              })
            };
            
            setRecipe(updatedRecipe);
          } else {
            console.error('Recipe not found in database');
            setRecipe(null);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  // Functions to handle editing name, description, and instructions
  const handleStartEditName = () => {
    if (recipe) {
      setEditName(recipe.name);
      setEditingName(true);
    }
  };

  const handleSaveName = async () => {
    if (!recipe || !editName.trim()) return;
    
    const updatedRecipe = { ...recipe, name: editName.trim() };
    setRecipe(updatedRecipe);
    setEditingName(false);
    await saveRecipeWithData(updatedRecipe, 'Recipe name updated', true);
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    if (recipe) setEditName(recipe.name);
  };

  const handleStartEditDescription = () => {
    if (recipe) {
      setEditDescription(recipe.description || '');
      setEditingDescription(true);
    }
  };

  const handleSaveDescription = async () => {
    if (!recipe) return;
    
    const updatedRecipe = { ...recipe, description: editDescription.trim() };
    setRecipe(updatedRecipe);
    setEditingDescription(false);
    await saveRecipeWithData(updatedRecipe, 'Recipe description updated', false, true);
  };

  const handleCancelEditDescription = () => {
    setEditingDescription(false);
    if (recipe) setEditDescription(recipe.description || '');
  };

  const handleStartEditInstructions = () => {
    if (recipe) {
      setEditInstructions(recipe.instructions || '');
      setEditingInstructions(true);
    }
  };

  const handleSaveInstructions = async () => {
    if (!recipe) return;
    
    const updatedRecipe = { ...recipe, instructions: editInstructions };
    setRecipe(updatedRecipe);
    setEditingInstructions(false);
    await saveRecipeWithData(updatedRecipe, 'Recipe instructions updated', false, false, true);
  };

  const handleCancelEditInstructions = () => {
    setEditingInstructions(false);
    if (recipe) setEditInstructions(recipe.instructions || '');
  };

  const handleDeleteRecipe = async () => {
    if (!recipe) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Navigate back to recipes list
        router.push('/admin/recepten');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete recipe: ${errorData.error || 'Unknown error'}`);
        setDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const checkIngredientInApi = async (ingredientName: string): Promise<{ available: boolean; results: any[]; bestMatch?: any }> => {
    try {
      setApiLog(prev => [...prev, `🔍 Checking "${ingredientName}" in Open Food Facts API...`]);
      const response = await fetch(`/api/openfoodfacts-search?query=${encodeURIComponent(ingredientName)}`);
      if (response.ok) {
        const data = await response.json();
        const available = data.foods && data.foods.length > 0;
        if (available) {
          setApiLog(prev => [...prev, `✅ Found ${data.foods.length} results for "${ingredientName}"`]);
          setApiLog(prev => [...prev, `📊 Top result: "${data.foods[0].name}" (${data.foods[0].calories} kcal/100g)`]);
          return { available, results: data.foods || [], bestMatch: data.foods[0] };
        } else {
          setApiLog(prev => [...prev, `❌ No results found for "${ingredientName}"`]);
        }
        return { available, results: [] };
      }
      setApiLog(prev => [...prev, `⚠️ API error for "${ingredientName}": ${response.status}`]);
      return { available: false, results: [] };
    } catch (error) {
      console.error('Error checking ingredient in API:', error);
      setApiLog(prev => [...prev, `❌ Error checking "${ingredientName}": ${error}`]);
      return { available: false, results: [] };
    }
  };

  const checkMissingIngredientsInApi = async () => {
    if (!recipe) return;
    
    // Open modal and reset log
    setShowApiModal(true);
    setApiLog([]);
    setFoundIngredients([]);
    setCheckingApi(true);
    
    const updatedRecipe = { ...recipe };
    
    // Check only missing ingredients
    const missingIngredients = updatedRecipe.ingredients.filter(ing => !ing.exists);
    
    setApiLog(prev => [...prev, `🚀 Starting API check for ${missingIngredients.length} missing ingredients...`]);
    setApiLog(prev => [...prev, `📋 Missing ingredients: ${missingIngredients.map(ing => ing.name).join(', ')}`]);
    
    let foundCount = 0;
    const foundIngredientsList: any[] = [];
    
    for (const ingredient of missingIngredients) {
      const result = await checkIngredientInApi(ingredient.name);
      ingredient.availableInApi = result.available;
      ingredient.apiMatch = result.bestMatch || null;
      
      if (result.available && result.bestMatch) {
        foundCount++;
        foundIngredientsList.push({
          originalName: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          ...result.bestMatch
        });
      }
      
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setApiLog(prev => [...prev, `🎉 API check completed! Found ${foundCount}/${missingIngredients.length} ingredients in Open Food Facts`]);
    setApiLog(prev => [...prev, `📊 Found ingredients overview:`]);
    
    // Add found ingredients to log
    foundIngredientsList.forEach((ing, index) => {
      setApiLog(prev => [...prev, `   ${index + 1}. ${ing.name} - ${ing.calories} kcal, ${ing.protein}g protein, ${ing.carbs}g carbs, ${ing.fat}g fat`]);
    });
    
    setFoundIngredients(foundIngredientsList);
    setRecipe(updatedRecipe);
    setCheckingApi(false);
  };

  const addIngredientsToDatabase = async () => {
    if (foundIngredients.length === 0) return;
    
    setAddingToDatabase(true);
    setApiLog(prev => [...prev, `🔄 Starting to add ${foundIngredients.length} ingredients to database...`]);
    
    let addedCount = 0;
    
    for (const ingredient of foundIngredients) {
      try {
        setApiLog(prev => [...prev, `➕ Adding "${ingredient.name}" to database...`]);
        
        const response = await fetch('/api/ingredients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: ingredient.name,
            calories: ingredient.calories,
            protein: ingredient.protein,
            carbs: ingredient.carbs,
            fat: ingredient.fat,
            fiber: ingredient.fiber || 0,
            per: '100' // Default to per 100g
          }),
        });
        
        if (response.ok) {
          setApiLog(prev => [...prev, `✅ Successfully added "${ingredient.name}" to database`]);
          addedCount++;
        } else {
          setApiLog(prev => [...prev, `❌ Failed to add "${ingredient.name}": ${response.status}`]);
        }
        
        // Add small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        setApiLog(prev => [...prev, `❌ Error adding "${ingredient.name}": ${error}`]);
      }
    }
    
    setApiLog(prev => [...prev, `🎉 Database update completed! Added ${addedCount}/${foundIngredients.length} ingredients`]);
    setApiLog(prev => [...prev, `🔄 Refreshing page to show updated ingredients...`]);
    
    setAddingToDatabase(false);
    setShowSuccess(true);
    
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleRefreshIngredientApiCheck = async (ingredientIndex: number) => {
    if (!recipe) return;
    
    const ingredient = recipe.ingredients[ingredientIndex];
    if (!ingredient) return;
    
    setApiLog(prev => [...prev, `🔄 Refreshing API check for "${ingredient.name}"...`]);
    
    const result = await checkIngredientInApi(ingredient.name);
    ingredient.availableInApi = result.available;
    ingredient.apiMatch = result.bestMatch || null;
    
    if (result.available && result.bestMatch) {
      setApiLog(prev => [...prev, `✅ New match found: "${result.bestMatch.name}" (${result.bestMatch.calories} kcal/100g)`]);
    } else {
      setApiLog(prev => [...prev, `❌ No new match found for "${ingredient.name}"`]);
    }
    
    // Update the recipe state
    setRecipe({ ...recipe });
  };

  const handleManualAddIngredient = (ingredientIndex: number) => {
    if (!recipe) return;
    
    const ingredient = recipe.ingredients[ingredientIndex];
    if (!ingredient) return;
    
    setManualAddIngredient({ ...ingredient, index: ingredientIndex });
    setManualAddData({
      name: ingredient.name,
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      category: 'other',
      per: ingredient.unit === 'piece' || ingredient.unit === 'tsp' || ingredient.unit === 'ml' ? '1' : '100'
    });
    setShowManualAddModal(true);
  };

  const handleManualAddSubmit = async () => {
    if (!manualAddData.name || !manualAddData.calories || !manualAddData.protein || !manualAddData.carbs || !manualAddData.fat) {
      alert('Please fill in all required fields (name, calories, protein, carbs, fat)');
      return;
    }

    try {
      const ingredientData = {
        name: manualAddData.name,
        calories: parseFloat(manualAddData.calories),
        protein: parseFloat(manualAddData.protein),
        carbs: parseFloat(manualAddData.carbs),
        fat: parseFloat(manualAddData.fat),
        fiber: parseFloat(manualAddData.fiber) || 0,
        sugar: parseFloat(manualAddData.sugar) || 0,
        category: manualAddData.category,
        per: manualAddData.per
      };

      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientData),
      });

      if (response.ok) {
        // Close modal and reset form
        setShowManualAddModal(false);
        setManualAddIngredient(null);
        setManualAddData({
          name: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          fiber: '',
          sugar: '',
          category: 'other',
          per: '100'
        });
        
        // Show success message and reload page
        setShowSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert('Failed to add ingredient to database');
      }
    } catch (error) {
      console.error('Error adding ingredient:', error);
      alert('Error adding ingredient to database');
    }
  };

  const handleAddIngredientToRecipe = () => {
    if (!recipe || !selectedIngredient || !ingredientQuantity) {
      alert('Please select an ingredient and enter a quantity');
      return;
    }

    const newIngredient: RecipeIngredient = {
      name: selectedIngredient.name,
      quantity: parseFloat(ingredientQuantity),
      unit: ingredientUnit,
      exists: true,
      availableInApi: false,
      apiMatch: null,
      ingredient: selectedIngredient
    };

    // Add to recipe ingredients
    const updatedRecipe = {
      ...recipe,
      ingredients: [...recipe.ingredients, newIngredient]
    };

    // Recalculate totals
    updatedRecipe.totalCalories = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.calories * factor);
      }
      return total;
    }, 0);
    
    updatedRecipe.totalProtein = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.protein * factor);
      }
      return total;
    }, 0);
    
    updatedRecipe.totalCarbs = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.carbs * factor);
      }
      return total;
    }, 0);
    
    updatedRecipe.totalFat = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.fat * factor);
      }
      return total;
    }, 0);

    setRecipe(updatedRecipe);
    
    // Save to database
    saveRecipeWithData(updatedRecipe, `Ingredient "${newIngredient.name}" added to recipe`);
    
    // Close modal and reset form
    setShowAddIngredientModal(false);
    setSelectedIngredient(null);
    setIngredientQuantity('');
    setIngredientUnit('g');
    setIngredientSearch('');
  };

  const handleAddToSelection = (ingredient: any) => {
    if (selectedIngredients.find(ing => ing.id === ingredient.id)) {
      return; // Already selected
    }
    
    const newSelection = [...selectedIngredients, ingredient];
    setSelectedIngredients(newSelection);
    
    // Get default quantity and unit from ingredient per value
    const { quantity, unit } = getDefaultQuantityAndUnit(ingredient);
    
    // Set default quantity and unit based on database per value
    setIngredientQuantities(prev => ({
      ...prev,
      [ingredient.id]: quantity
    }));
    setIngredientUnits(prev => ({
      ...prev,
      [ingredient.id]: unit
    }));
  };

  const handleAddIngredientDirectly = (ingredient: any) => {
    if (!recipe) {
      alert('Recipe not found');
      return;
    }

    // Get default quantity and unit from ingredient per value
    const { quantity, unit } = getDefaultQuantityAndUnit(ingredient);

    // Create new ingredient for recipe
    const newIngredient: RecipeIngredient = {
      name: ingredient.name,
      quantity: parseFloat(quantity),
      unit: unit,
      exists: true,
      availableInApi: false,
      apiMatch: null,
      ingredient: ingredient
    };

    // Add ingredient to recipe
    const updatedRecipe = {
      ...recipe,
      ingredients: [...recipe.ingredients, newIngredient]
    };

    // Recalculate totals
    updatedRecipe.totalCalories = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.calories * factor);
      }
      return total;
    }, 0);
    
    updatedRecipe.totalProtein = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.protein * factor);
      }
      return total;
    }, 0);
    
    updatedRecipe.totalCarbs = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.carbs * factor);
      }
      return total;
    }, 0);
    
    updatedRecipe.totalFat = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.fat * factor);
      }
      return total;
    }, 0);

    // Save to database
    saveRecipeWithData(updatedRecipe, `Ingredient "${newIngredient.name}" added to recipe`);
    
    // Close modal and reset form
    setShowAddIngredientModal(false);
    setIngredientSearch('');
    setSelectedIngredients([]);
    setIngredientQuantities({});
    setIngredientUnits({});
  };

  const handleRemoveFromSelection = (ingredientId: string) => {
    setSelectedIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
    setIngredientQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[ingredientId];
      return newQuantities;
    });
    setIngredientUnits(prev => {
      const newUnits = { ...prev };
      delete newUnits[ingredientId];
      return newUnits;
    });
  };

  const handleBulkAddToRecipe = () => {
    if (!recipe || selectedIngredients.length === 0) {
      alert('Please select at least one ingredient');
      return;
    }

    const newIngredients: RecipeIngredient[] = selectedIngredients.map(ingredient => ({
      name: ingredient.name,
      quantity: parseFloat(ingredientQuantities[ingredient.id] || '1'),
      unit: ingredientUnits[ingredient.id] || 'g',
      exists: true,
      availableInApi: false,
      apiMatch: null,
      ingredient: ingredient
    }));

    // Add all ingredients to recipe
    const updatedRecipe = {
      ...recipe,
      ingredients: [...recipe.ingredients, ...newIngredients]
    };

    // Recalculate totals
    updatedRecipe.totalCalories = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.calories * factor);
      }
      return total;
    }, 0);
    
    updatedRecipe.totalProtein = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.protein * factor);
      }
      return total;
    }, 0);
    
    updatedRecipe.totalCarbs = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.carbs * factor);
      }
      return total;
    }, 0);
    
    updatedRecipe.totalFat = updatedRecipe.ingredients.reduce((total, ing) => {
      if (ing.exists && ing.ingredient) {
        const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
        return total + (ing.ingredient.fat * factor);
      }
      return total;
    }, 0);

    setRecipe(updatedRecipe);
    
    // Save to database
    saveRecipeWithData(updatedRecipe, `${newIngredients.length} ingredient${newIngredients.length !== 1 ? 's' : ''} added to recipe`);
    
    // Close modal and reset form
    setShowAddIngredientModal(false);
    setSelectedIngredient(null);
    setIngredientQuantity('');
    setIngredientUnit('g');
    setIngredientSearch('');
    setSelectedIngredients([]);
    setIngredientQuantities({});
    setIngredientUnits({});
  };

  const handleRemoveIngredient = (index: number) => {
    if (!recipe) return;
    
    const ingredientToRemove = recipe.ingredients[index];
    const confirmed = window.confirm(
      `Are you sure you want to remove "${ingredientToRemove.quantity} ${ingredientToRemove.unit} ${ingredientToRemove.name}" from this recipe?`
    );
    
    if (!confirmed) return;

    // Remove ingredient from recipe
    const updatedIngredients = recipe.ingredients.filter((_, i) => i !== index);
    
    // Recalculate totals
    const updatedRecipe = {
      ...recipe,
      ingredients: updatedIngredients,
      totalCalories: updatedIngredients.reduce((total, ing) => {
        if (ing.exists && ing.ingredient) {
          const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
          return total + (ing.ingredient.calories * factor);
        }
        return total;
      }, 0),
      totalProtein: updatedIngredients.reduce((total, ing) => {
        if (ing.exists && ing.ingredient) {
          const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
          return total + (ing.ingredient.protein * factor);
        }
        return total;
      }, 0),
      totalCarbs: updatedIngredients.reduce((total, ing) => {
        if (ing.exists && ing.ingredient) {
          const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
          return total + (ing.ingredient.carbs * factor);
        }
        return total;
      }, 0),
      totalFat: updatedIngredients.reduce((total, ing) => {
        if (ing.exists && ing.ingredient) {
          const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
          return total + (ing.ingredient.fat * factor);
        }
        return total;
      }, 0)
    };

    setRecipe(updatedRecipe);
    
    // Save to database
    saveRecipeWithData(updatedRecipe, `Ingredient "${ingredientToRemove.name}" removed from recipe`);
  };

  const saveRecipeWithData = async (recipeData: any, message: string, includeName?: boolean, includeDescription?: boolean, includeInstructions?: boolean) => {
    try {
      const payload: any = {
        ingredients: recipeData.ingredients.map((ing: any) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          exists: ing.exists,
          availableInApi: ing.availableInApi,
          apiMatch: ing.apiMatch
        })),
        totalCalories: recipeData.totalCalories,
        totalProtein: recipeData.totalProtein,
        totalCarbs: recipeData.totalCarbs,
        totalFat: recipeData.totalFat
      };

      // Include name, description, and instructions if requested
      if (includeName) payload.name = recipeData.name;
      if (includeDescription) payload.description = recipeData.description;
      if (includeInstructions) {
        // Convert instructions string to array if needed
        const instructionsArray = typeof recipeData.instructions === 'string' 
          ? recipeData.instructions.split('\n').filter((line: string) => line.trim())
          : recipeData.instructions;
        payload.instructions = instructionsArray;
      }
      
      const response = await fetch(`/api/recipes/${recipeData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSaveMessage(message);
        setShowSaveMessage(true);
        setTimeout(() => {
          setShowSaveMessage(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Failed to save recipe:', errorData);
        alert(`Failed to save recipe: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Recipe not found</h3>
          <p className="text-gray-500 mb-4">The recipe you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-500 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Recipes
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {editingName ? (
              <div className="mb-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-3xl font-bold text-gray-800 w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEditName();
                  }}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEditName}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h1 
                className="text-3xl font-bold text-gray-800 mb-2 flex items-center cursor-pointer hover:text-indigo-500 transition-colors group"
                onClick={handleStartEditName}
                title="Click to edit name"
              >
                <ChefHat className="w-8 h-8 mr-3 text-indigo-500" />
                {recipe.name}
                <Edit className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
              </h1>
            )}
            {editingDescription ? (
              <div className="mb-4">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-gray-600 text-lg w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') handleCancelEditDescription();
                  }}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveDescription}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEditDescription}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p 
                className="text-gray-600 text-lg mb-4 cursor-pointer hover:text-indigo-500 transition-colors group"
                onClick={handleStartEditDescription}
                title="Click to edit description"
              >
                {recipe.description || <span className="text-gray-400 italic">Click to add description</span>}
                <Edit className="w-4 h-4 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
              </p>
            )}
            
            {/* Recipe Info */}
            <div className="flex items-center gap-6 text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{recipe.prepTime} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={checkMissingIngredientsInApi}
              disabled={checkingApi}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors text-sm font-medium"
            >
              {checkingApi ? 'Checking...' : 'Check API'}
            </button>
            <button 
              onClick={() => setShowAddIngredientModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Ingredient
            </button>
            <button 
              onClick={() => {
                // Scroll to top or focus on name field to edit
                handleStartEditName();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-3 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit recipe"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete recipe"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Ingredients */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Utensils className="w-5 h-5 mr-2 text-indigo-500" />
              Ingredients
            </h2>
            
            <div className="space-y-3">
              {recipe.ingredients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg font-medium mb-2">Geen ingrediënten toegevoegd</div>
                  <div className="text-sm">Voeg je eerste ingrediënt toe om te beginnen</div>
                </div>
              ) : (
                recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    ingredient.exists 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {(() => {
                        const formatted = formatIngredientQuantity(ingredient);
                        return `${formatted.quantity} ${formatted.unit} ${ingredient.name}`;
                      })()}
                    </div>
                    {ingredient.exists && ingredient.ingredient && (() => {
                      const per = ingredient.ingredient.per || '100g';
                      let multiplier = 0;
                      
                      if (per.includes('scoop')) {
                        const scoopGramsMatch = per.match(/\((\d+(?:\.\d+)?)\s*g\)/);
                        if (scoopGramsMatch) {
                          const scoopGrams = parseFloat(scoopGramsMatch[1]);
                          multiplier = ingredient.unit === 'g' ? ingredient.quantity / scoopGrams : ingredient.quantity;
                        } else {
                          multiplier = ingredient.unit === 'scoop' || ingredient.unit === 'scoops' ? ingredient.quantity : 1;
                        }
                      } else if (per === '1' || per.match(/^\d+(\.\d+)?$/)) {
                        multiplier = ingredient.quantity;
                      } else {
                        multiplier = ingredient.quantity / 100;
                      }
                      
                      return (
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(ingredient.ingredient.calories * multiplier)} kcal
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    {!ingredient.exists && (
                      <>
                        <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                          Missing
                        </span>
                        {ingredient.availableInApi && (
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                            API
                          </span>
                        )}
                        <button
                          onClick={() => handleRefreshIngredientApiCheck(index)}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                          title="Refresh API check for this ingredient"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => handleManualAddIngredient(index)}
                          className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                          title="Add ingredient manually to database"
                        >
                          Add Manual
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                      title="Remove ingredient from recipe"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Instructions and Nutrition */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nutrition Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Nutrition Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{Math.round(recipe.totalCalories)}</div>
                <div className="text-sm text-gray-500">kcal</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(recipe.totalProtein)}g</div>
                <div className="text-sm text-gray-500">protein</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(recipe.totalCarbs)}g</div>
                <div className="text-sm text-gray-500">carbs</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(recipe.totalFat)}g</div>
                <div className="text-sm text-gray-500">fat</div>
              </div>
            </div>

            {/* Nutrition Breakdown Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">Nutrition Breakdown per Ingredient</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Protein</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fat</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fiber</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recipe.ingredients.map((ingredient, index) => {
                      // Calculate multiplier for nutrition values
                      const calculateMultiplier = () => {
                        if (!ingredient.exists || !ingredient.ingredient) return 0;
                        
                        const per = ingredient.ingredient.per || '100g';
                        
                        // Handle scoop-based ingredients
                        if (per.includes('scoop')) {
                          const scoopGramsMatch = per.match(/\((\d+(?:\.\d+)?)\s*g\)/);
                          if (scoopGramsMatch) {
                            const scoopGrams = parseFloat(scoopGramsMatch[1]);
                            // If quantity is in grams, convert to number of scoops
                            if (ingredient.unit === 'g') {
                              return ingredient.quantity / scoopGrams;
                            }
                            // If already in scoop unit, use quantity directly
                            if (ingredient.unit === 'scoop' || ingredient.unit === 'scoops') {
                              return ingredient.quantity;
                            }
                          }
                          // Fallback: assume 1 scoop per unit
                          return ingredient.unit === 'scoop' || ingredient.unit === 'scoops' ? ingredient.quantity : 1;
                        }
                        
                        // Handle piece-based ingredients
                        if (per === '1' || per.match(/^\d+(\.\d+)?$/)) {
                          return ingredient.quantity;
                        }
                        
                        // Default: divide by 100 (for 100g based ingredients)
                        return ingredient.quantity / 100;
                      };
                      
                      const multiplier = calculateMultiplier();
                      
                      const nutrition = ingredient.exists && ingredient.ingredient ? {
                        calories: Math.round(ingredient.ingredient.calories * multiplier),
                        protein: Math.round(ingredient.ingredient.protein * multiplier * 10) / 10,
                        carbs: Math.round(ingredient.ingredient.carbs * multiplier * 10) / 10,
                        fat: Math.round(ingredient.ingredient.fat * multiplier * 10) / 10,
                        fiber: Math.round((ingredient.ingredient.fiber || 0) * multiplier * 10) / 10
                      } : {
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fat: 0,
                        fiber: 0
                      };

                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{ingredient.name}</span>
                              {!ingredient.exists && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                    Missing
                                  </span>
                                  {ingredient.availableInApi && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      API
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">
                            {(() => {
                              const formatted = formatIngredientQuantity(ingredient);
                              return `${formatted.quantity} ${formatted.unit}`;
                            })()}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-orange-600">
                            {nutrition.calories}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-blue-600">
                            {nutrition.protein}g
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-green-600">
                            {nutrition.carbs}g
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-purple-600">
                            {nutrition.fat}g
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                            {nutrition.fiber}g
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-gray-900">-</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-orange-600">
                        {Math.round(recipe.totalCalories)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-blue-600">
                        {Math.round(recipe.totalProtein)}g
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-green-600">
                        {Math.round(recipe.totalCarbs)}g
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-purple-600">
                        {Math.round(recipe.totalFat)}g
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-gray-600">
                        {Math.round(recipe.ingredients.reduce((total, ing) => {
                          if (ing.exists && ing.ingredient) {
                            const factor = ing.quantity / (ing.ingredient.per === '1' || ing.ingredient.per.includes('scoop') ? 1 : 100);
                            return total + ((ing.ingredient.fiber || 0) * factor);
                          }
                          return total;
                        }, 0))}g
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Instructions</h2>
              {!editingInstructions && (
                <button
                  onClick={handleStartEditInstructions}
                  className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
            {editingInstructions ? (
              <div>
                <textarea
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[300px] font-mono text-sm"
                  placeholder="Enter instructions, one per line..."
                  autoFocus
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveInstructions}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Save Instructions
                  </button>
                  <button
                    onClick={handleCancelEditInstructions}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recipe.instructions && recipe.instructions.trim() ? (
                  recipe.instructions.split('\n').filter(line => line.trim()).map((instruction, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-700 leading-relaxed">{instruction.trim()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No instructions added yet</p>
                    <button
                      onClick={handleStartEditInstructions}
                      className="text-indigo-500 hover:text-indigo-600 underline"
                    >
                      Click to add instructions
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Checking Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {checkingApi ? 'Checking API...' : 'API Check Complete'}
                </h2>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-full overflow-y-auto font-mono text-sm">
                {apiLog.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
                      <p className="text-gray-400">Initializing API check...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {apiLog.map((log, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-gray-500 text-xs mt-1 min-w-[3rem]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1">{log}</span>
                      </div>
                    ))}
                    {checkingApi && (
                      <div className="flex items-center gap-2 text-yellow-400 mt-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                        <span>Processing...</span>
                      </div>
                    )}
                    {addingToDatabase && (
                      <div className="flex items-center gap-2 text-blue-400 mt-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        <span>Adding to database...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Found Ingredients Table */}
            {foundIngredients.length > 0 && !checkingApi && !addingToDatabase && (
              <div className="px-6 pb-4">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Found Ingredients</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Original</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">API Match</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Calories</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Protein</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Carbs</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Fat</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {foundIngredients.map((ingredient, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{ingredient.originalName}</td>
                            <td className="px-3 py-2 text-sm text-blue-600">{ingredient.name}</td>
                            <td className="px-3 py-2 text-center text-sm text-orange-600">{ingredient.calories}</td>
                            <td className="px-3 py-2 text-center text-sm text-blue-600">{ingredient.protein}g</td>
                            <td className="px-3 py-2 text-center text-sm text-green-600">{ingredient.carbs}g</td>
                            <td className="px-3 py-2 text-center text-sm text-purple-600">{ingredient.fat}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {checkingApi ? 'Please wait while we check the API...' : 
                 addingToDatabase ? 'Adding ingredients to database...' :
                 foundIngredients.length > 0 ? `Found ${foundIngredients.length} ingredients ready to add` :
                 'Check completed successfully!'}
              </div>
              <div className="flex gap-2">
                {foundIngredients.length > 0 && !checkingApi && !addingToDatabase && (
                  <button
                    onClick={addIngredientsToDatabase}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Toevoegen aan Database
                  </button>
                )}
                <button
                  onClick={() => setShowApiModal(false)}
                  disabled={checkingApi || addingToDatabase}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {checkingApi ? 'Checking...' : addingToDatabase ? 'Adding...' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">
                Ingredients have been successfully added to the database. The page will refresh automatically.
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Ingredient Modal */}
      {showManualAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-orange-500 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">Add Ingredient Manually</h2>
              <p className="text-orange-100 text-sm mt-1">
                Add "{manualAddIngredient?.name}" to the database with custom nutritional values
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={manualAddData.name}
                    onChange={(e) => setManualAddData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ingredient name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={manualAddData.category}
                    onChange={(e) => setManualAddData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="protein">Protein</option>
                    <option value="carbohydrates">Carbohydrates</option>
                    <option value="fats">Fats</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="dairy">Dairy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Per
                  </label>
                  <select
                    value={manualAddData.per}
                    onChange={(e) => setManualAddData(prev => ({ ...prev, per: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="100">100g</option>
                    <option value="1">1 piece</option>
                  </select>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Nutritional Values</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualAddData.calories}
                      onChange={(e) => setManualAddData(prev => ({ ...prev, calories: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="kcal"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protein *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualAddData.protein}
                      onChange={(e) => setManualAddData(prev => ({ ...prev, protein: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="g"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carbs *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualAddData.carbs}
                      onChange={(e) => setManualAddData(prev => ({ ...prev, carbs: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="g"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fat *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualAddData.fat}
                      onChange={(e) => setManualAddData(prev => ({ ...prev, fat: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="g"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiber
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualAddData.fiber}
                      onChange={(e) => setManualAddData(prev => ({ ...prev, fiber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="g"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sugar
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualAddData.sugar}
                      onChange={(e) => setManualAddData(prev => ({ ...prev, sugar: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="g"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowManualAddModal(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualAddSubmit}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Add to Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-green-500 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">Add Ingredient to Recipe</h2>
              <p className="text-green-100 text-sm mt-1">
                Select an ingredient from the database to add to this recipe
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side - Ingredient selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Select Ingredient</h3>
                  
                  {/* Search input */}
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={ingredientSearch}
                      onChange={(e) => setIngredientSearch(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      placeholder="Search ingredients..."
                    />
                    {ingredientSearch && (
                      <button
                        onClick={() => setIngredientSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {(() => {
                      const filteredIngredients = ingredients.filter(ingredient => 
                        ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase()) ||
                        ingredient.category.toLowerCase().includes(ingredientSearch.toLowerCase())
                      );
                      
                      if (filteredIngredients.length === 0 && ingredientSearch) {
                        return (
                          <div className="p-8 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p>No ingredients found matching "{ingredientSearch}"</p>
                            <p className="text-sm mt-1">Try searching for ingredient name or category</p>
                          </div>
                        );
                      }
                      
                      return filteredIngredients.map((ingredient) => {
                        const isSelected = selectedIngredients.find(ing => ing.id === ingredient.id);
                        return (
                          <div
                            key={ingredient.id}
                            onClick={() => isSelected ? handleRemoveFromSelection(ingredient.id) : handleAddToSelection(ingredient)}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                              isSelected ? 'bg-green-50 border-green-200' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {ingredient.calories} kcal • {ingredient.protein}g protein • {ingredient.carbs}g carbs • {ingredient.fat}g fat
                                </p>
                                <p className="text-xs text-gray-400">{getPerDisplayText(ingredient)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-400 capitalize">
                                  {ingredient.category}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    isSelected ? handleRemoveFromSelection(ingredient.id) : handleAddToSelection(ingredient);
                                  }}
                                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                    isSelected 
                                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                                  }`}
                                >
                                  {isSelected ? 'Remove' : 'Add'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right side - Selected ingredients and quantities */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Selected Ingredients ({selectedIngredients.length})
                  </h3>
                  
                  {selectedIngredients.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedIngredients.map((ingredient) => (
                        <div key={ingredient.id} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                              <p className="text-sm text-gray-500">
                                {ingredient.calories} kcal • {ingredient.protein}g protein • {ingredient.carbs}g carbs • {ingredient.fat}g fat
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveFromSelection(ingredient.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={ingredientQuantities[ingredient.id] || '1'}
                                onChange={(e) => setIngredientQuantities(prev => ({
                                  ...prev,
                                  [ingredient.id]: e.target.value
                                }))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="1"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Unit
                              </label>
                              <select
                                value={ingredientUnits[ingredient.id] || 'g'}
                                onChange={(e) => setIngredientUnits(prev => ({
                                  ...prev,
                                  [ingredient.id]: e.target.value
                                }))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                              >
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                                <option value="ml">ml</option>
                                <option value="l">l</option>
                                <option value="piece">piece</option>
                                <option value="tsp">tsp</option>
                                <option value="tbsp">tbsp</option>
                                <option value="cup">cup</option>
                                <option value="scoop">scoop</option>
                              </select>
                            </div>
                          </div>
                          
                          {ingredientQuantities[ingredient.id] && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                              <div className="grid grid-cols-2 gap-1">
                                <div><span className="text-green-600">Calories:</span> {Math.round((ingredient.calories * parseFloat(ingredientQuantities[ingredient.id] || '1')) / (ingredient.per === '1' || ingredient.per.includes('scoop') ? 1 : 100))}</div>
                                <div><span className="text-green-600">Protein:</span> {((ingredient.protein * parseFloat(ingredientQuantities[ingredient.id] || '1')) / (ingredient.per === '1' || ingredient.per.includes('scoop') ? 1 : 100)).toFixed(1)}g</div>
                                <div><span className="text-green-600">Carbs:</span> {((ingredient.carbs * parseFloat(ingredientQuantities[ingredient.id] || '1')) / (ingredient.per === '1' || ingredient.per.includes('scoop') ? 1 : 100)).toFixed(1)}g</div>
                                <div><span className="text-green-600">Fat:</span> {((ingredient.fat * parseFloat(ingredientQuantities[ingredient.id] || '1')) / (ingredient.per === '1' || ingredient.per.includes('scoop') ? 1 : 100)).toFixed(1)}g</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p>Select ingredients from the list to add to recipe</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedIngredients.length > 0 && (
                  <span>{selectedIngredients.length} ingredient{selectedIngredients.length !== 1 ? 's' : ''} selected</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddIngredientModal(false);
                    setIngredientSearch('');
                    setSelectedIngredient(null);
                    setIngredientQuantity('');
                    setSelectedIngredients([]);
                    setIngredientQuantities({});
                    setIngredientUnits({});
                  }}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAddToRecipe}
                  disabled={selectedIngredients.length === 0}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add {selectedIngredients.length > 0 ? `${selectedIngredients.length} ` : ''}to Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Message */}
      {showSaveMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 ease-in-out animate-bounce">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{saveMessage}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">Delete Recipe</h2>
                <p className="text-gray-600 text-sm mt-1">This action cannot be undone</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={deleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>"{recipe?.name}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                All recipe data, including ingredients and instructions, will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecipe}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Recipe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

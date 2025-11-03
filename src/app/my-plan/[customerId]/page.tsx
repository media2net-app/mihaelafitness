'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Apple, TrendingUp, User, Heart, ShoppingCart, Check, ChefHat } from 'lucide-react';
import IngredientBreakdown from '@/components/IngredientBreakdown';

interface NutritionPlan {
  id: string;
  name: string;
  goal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weekMenu: any;
  _ingredientTranslations?: { [key: string]: string };
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export default function MyPlanPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [activeDay, setActiveDay] = useState<string>('monday');
  const [activeView, setActiveView] = useState<'plan' | 'shopping'>('plan');
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, try to fetch as customerId (check for assignments)
        const response = await fetch(`/api/customer-nutrition-plans?customerId=${customerId}`);
        if (!response.ok) throw new Error('Failed to fetch nutrition plan');
        
        const assignments = await response.json();
        
        if (assignments.length > 0) {
          // Found assignment - treat as customerId
          const assignment = assignments[0];
          setCustomer(assignment.customer);

              // Fetch full nutrition plan details (including weekMenu with cookingInstructions)
              const planResponse = await fetch(`/api/nutrition-plans/${assignment.nutritionPlanId}`);
              if (!planResponse.ok) throw new Error('Failed to fetch plan details');
              
              const planData = await planResponse.json();
              console.log('[MyPlan] Fetched plan data:', {
                id: planData.id,
                hasWeekMenu: !!planData.weekMenu,
                mondayBreakfast: typeof planData.weekMenu?.monday?.breakfast,
                hasCookingInstructions: typeof planData.weekMenu?.monday?.breakfast === 'object' && !!planData.weekMenu?.monday?.breakfast?.cookingInstructions
              });
              setNutritionPlan(planData);
        } else {
          // No assignment found - try to fetch as planId directly
          const planResponse = await fetch(`/api/nutrition-plans/${customerId}`);
          if (!planResponse.ok) {
            // Not a valid planId either
            setLoading(false);
            return;
          }
          
          const planData = await planResponse.json();
          setNutritionPlan(planData);
          
          // Optionally try to get customer info if plan is assigned
          const customerResponse = await fetch(`/api/nutrition-plans/${customerId}/customer`);
          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            if (customerData.customer) {
              setCustomer(customerData.customer);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  // Update document title and meta tags when plan is loaded
  useEffect(() => {
    if (nutritionPlan) {
      const title = customer 
        ? `${nutritionPlan.name} - ${customer.name} | Mihaela Fitness`
        : `${nutritionPlan.name} | Mihaela Fitness`;
      document.title = title;

      // Update Open Graph meta tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', title);

      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', 'Planul Tău Nutrițional Personalizat');

      // Update Twitter Card meta tags
      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitle) {
        twitterTitle = document.createElement('meta');
        twitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitle);
      }
      twitterTitle.setAttribute('content', title);

      let twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDescription) {
        twitterDescription = document.createElement('meta');
        twitterDescription.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDescription);
      }
      twitterDescription.setAttribute('content', 'Planul Tău Nutrițional Personalizat');
    }
  }, [nutritionPlan, customer]);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames: { [key: string]: string } = {
    monday: 'Luni',
    tuesday: 'Marți',
    wednesday: 'Miercuri',
    thursday: 'Joi',
    friday: 'Vineri',
    saturday: 'Sâmbătă',
    sunday: 'Duminică'
  };

  const mealNames: { [key: string]: string } = {
    'breakfast': 'Mic Dejun',
    'morning-snack': 'Gustare Dimineață',
    'lunch': 'Prânz',
    'afternoon-snack': 'Gustare După-Amiază',
    'dinner': 'Cină',
    'evening-snack': 'Gustare Seară'
  };

  // Unit translations to Romanian
  const translateUnit = (unit: string): string => {
    const unitTranslations: { [key: string]: string } = {
      'g': 'g',
      'gram': 'g',
      'grams': 'g',
      'kg': 'kg',
      'ml': 'ml',
      'l': 'l',
      'stuks': 'buc', // bucăți (pieces)
      'piece': 'buc',
      'pieces': 'buc',
      'stuk': 'buc',
      'slice': 'felie',
      'slices': 'felii',
      'tbsp': 'lgă', // lingură (tablespoon)
      'tablespoon': 'lingură',
      'tsp': 'lgţ', // linguriță (teaspoon)
      'teaspoon': 'linguriță',
      'cup': 'ceașcă',
      'cups': 'cești'
    };
    return unitTranslations[unit.toLowerCase()] || unit;
  };

  // Generate shopping list from all week's ingredients - with smart grouping
  const shoppingList = useMemo(() => {
    if (!nutritionPlan?.weekMenu) return [];

    const ingredientMap = new Map<string, { 
      quantity: number; 
      unit: string; 
      name: string; 
      ingredientId: string;
      isPiece: boolean;
      gramEquivalent?: number; // For piece-based items, track gram equivalent
    }>();
    const meals = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];

    days.forEach(day => {
      const dayData = nutritionPlan.weekMenu[day];
      if (!dayData) return;

      meals.forEach(meal => {
        const mealData = dayData[meal];
        if (!mealData) return;

        let mealDescription = '';
        if (typeof mealData === 'string') {
          mealDescription = mealData;
        } else if (mealData && typeof mealData === 'object') {
          // Handle JSON array format
          if (Array.isArray(mealData)) {
            // Convert JSON array to ingredient string format
            mealDescription = mealData.map((ing: any) => {
              const qty = ing.quantity || 0;
              const unit = ing.unit || 'g';
              const name = ing.name || '';
              return `${qty}${unit} ${name}`;
            }).join(', ');
          } else {
            mealDescription = mealData.description || mealData.ingredients || '';
          }
        }

        if (!mealDescription || mealDescription.trim() === '') return;

        // Check if this is a recipe format: [RECIPE:Recipe Name] ingredient1, ingredient2, ...
        let ingredientStrs: string[] = [];
        if (mealDescription.includes('[RECIPE:')) {
          // Extract recipe name and ingredients
          const recipeMatch = mealDescription.match(/\[RECIPE:[^\]]+\]\s*(.*)/);
          if (recipeMatch) {
            const recipeIngredients = recipeMatch[1];
            // Split ingredients from recipe
            ingredientStrs = recipeIngredients.split(',').map(s => s.trim()).filter(s => s.length > 0);
          }
        } else {
          // Regular format - parse ingredients from description
          ingredientStrs = mealDescription.split(',').map(s => s.trim());
        }
        
        ingredientStrs.forEach(ingredientStr => {
          // Handle recipe ingredient format: "55g Carne de Vită" or "190g Paste (fiert)" or "61 g Light Cream Sauce"
          // First try recipe format (quantity + optional space + unit + name)
          let match = ingredientStr.match(/^([\d.]+)\s*(g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms|piece|pieces|stuks|stuk|buc|bucăți)\s+(.+)$/i);
          
          if (!match) {
            // Fall back to ID format: "2 cmgbfewgp01b78igv3zsoydrf|1 Egg" or "100 cmgbf5jgf016v8igv5viv7qkz|Chicken Breast"
            match = ingredientStr.match(/^([\d.]+)\s+([a-z0-9]+)\|(.+)$/i);
          }
          
          if (!match) return;
          
          let quantity: number;
          let unit: string;
          let ingredientName: string;
          let ingredientId: string = '';
          
          if (ingredientStr.includes('|')) {
            // ID format: "100 ingredientId|Name"
            const [, quantityStr, id, name] = match;
            quantity = parseFloat(quantityStr);
            ingredientId = id;
            ingredientName = name;
          } else {
            // Recipe format: "55g Carne de Vită"
            const [, quantityStr, unitStr, name] = match;
            quantity = parseFloat(quantityStr);
            unit = unitStr.toLowerCase();
            ingredientName = name;
            
            // Normalize units
            if (unit === 'g' || unit === 'gram' || unit === 'grams') {
              unit = 'g';
            } else if (unit === 'ml' || unit === 'milliliter' || unit === 'milliliters') {
              unit = 'ml';
            } else if (unit === 'piece' || unit === 'pieces' || unit === 'stuks' || unit === 'stuk' || unit === 'buc' || unit === 'bucăți') {
              unit = 'stuks';
            } else if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') {
              unit = 'kg';
              quantity = quantity * 1000; // Convert to grams for consistency
              unit = 'g';
            }
          }

          // Clean the ingredient name - remove leading numbers and quantities
          let cleanName = ingredientName.split('|').pop()?.trim() || ingredientName;
          
          // Remove patterns like "1 ", "2 ", "1.5 " from the start of the name
          const baseCleanName = cleanName.replace(/^\d+(?:\.\d+)?\s+/, '').trim();
          
          // Determine if this is a piece-based ingredient
          const isPiece = unit === 'stuks' || unit === 'piece' || unit === 'pieces' || unit === 'stuk' || unit === 'buc' || unit === 'bucăți';
          
          // If no unit was determined (from ID format), default to 'g'
          if (!unit) {
            unit = 'g';
          }
          
          // Create a smart grouping key based on base name
          const baseKey = baseCleanName.toLowerCase().trim();
          
          // Find if we already have this ingredient (by base name)
          let existingKey: string | null = null;
          for (const [key, value] of ingredientMap.entries()) {
            const existingBaseName = value.name.replace(/^\d+(?:\.\d+)?\s+/, '').toLowerCase().trim();
            if (existingBaseName === baseKey) {
              existingKey = key;
              break;
            }
          }

          if (existingKey) {
            const existing = ingredientMap.get(existingKey)!;
            
            // Smart aggregation: if mixing pieces and grams, convert to grams
            if (isPiece && !existing.isPiece) {
              // Adding pieces to grams - convert pieces to grams (rough estimate: 1 piece ≈ 100g for fruits/veg)
              const gramsPerPiece = 100;
              existing.quantity += quantity * gramsPerPiece;
              existing.unit = 'g';
              existing.isPiece = false;
            } else if (!isPiece && existing.isPiece) {
              // Adding grams to pieces - convert existing pieces to grams first
              const gramsPerPiece = 100;
              existing.quantity = (existing.quantity * gramsPerPiece) + quantity;
              existing.unit = 'g';
              existing.isPiece = false;
            } else {
              // Same unit type, just add (ensure units match)
              if (existing.unit === unit) {
                existing.quantity += quantity;
              } else {
                // Different units but same type - try to convert
                if ((existing.unit === 'g' && unit === 'ml') || (existing.unit === 'ml' && unit === 'g')) {
                  // For most liquids, 1ml ≈ 1g
                  existing.quantity += quantity;
                  existing.unit = 'g';
                } else {
                  // Can't convert, keep as is but aggregate
                  existing.quantity += quantity;
                }
              }
            }
          } else {
            // New ingredient
            const key = ingredientId ? `${ingredientId}-${baseKey}` : `recipe-${baseKey}-${Date.now()}`;
            ingredientMap.set(key, { 
              quantity, 
              unit: isPiece ? 'stuks' : unit, 
              name: baseCleanName, 
              ingredientId: ingredientId || key,
              isPiece
            });
          }
        });
      });
    });

      // Convert map to sorted array
    return Array.from(ingredientMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [nutritionPlan, days]);

  // Get Romanian translations from the nutrition plan data (already loaded)
  const ingredientTranslationsMap = useMemo(() => {
    if (!nutritionPlan) {
      return {};
    }
    return nutritionPlan._ingredientTranslations || {};
  }, [nutritionPlan]);

  // Helper function to get Romanian ingredient name from translation map
  const getIngredientName = (englishName: string): string => {
    // Try exact match first
    let translation = ingredientTranslationsMap[englishName];
    if (translation) {
      return translation;
    }
    
    // Try with "1 " prefix (for items like "Egg" -> try "1 Egg")
    translation = ingredientTranslationsMap[`1 ${englishName}`];
    if (translation) {
      return translation;
    }
    
    // Try without number prefix (for items like "2 Egg" -> try "Egg")
    const withoutNumber = englishName.replace(/^\d+(?:\.\d+)?\s+/, '');
    if (withoutNumber !== englishName) {
      translation = ingredientTranslationsMap[withoutNumber];
      if (translation) {
        return translation;
      }
      // Also try "1 " prefix on the base name
      translation = ingredientTranslationsMap[`1 ${withoutNumber}`];
      if (translation) {
        return translation;
      }
    }
    
    // If no translation found, return original English name
    return englishName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Se încarcă planul tău nutrițional...</p>
        </div>
      </div>
    );
  }

  if (!nutritionPlan || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <Apple className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Plan Negăsit</h2>
          <p className="text-gray-600">Încă nu ai un plan nutrițional asignat. Te rog contactează antrenorul tău.</p>
        </div>
      </div>
    );
  }

  const weekMenu = nutritionPlan?.weekMenu || {};
  const dayData = weekMenu[activeDay] || {};
  const meals = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Mobile Layout: Logo + Name on top, subtitle below */}
          <div className="sm:hidden">
                  {/* Top row: Logo and Customer name */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <img src="/logo-mihaela.svg" alt="Mihaela Fitness" className="h-12 w-auto" />
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-sm">{customer.name}</span>
                    </div>
                  </div>
            {/* Bottom row: Subtitle */}
            <p className="text-sm text-rose-100">Planul Tău Nutrițional Personalizat</p>
          </div>

          {/* Desktop Layout: Original horizontal layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-mihaela.svg" alt="Mihaela Fitness" className="h-10 w-auto" />
              <div>
                <p className="text-sm text-rose-100">Planul Tău Nutrițional Personalizat</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <User className="w-5 h-5" />
              <span className="font-medium">{customer.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Apple className="w-6 h-6 text-rose-500" />
            {nutritionPlan.name}
          </h2>
          
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            <span className="text-gray-600 font-medium">{nutritionPlan.goal}</span>
          </div>

          {/* Macro Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Calorii</p>
              <p className="text-3xl font-bold">{nutritionPlan.calories}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Proteine</p>
              <p className="text-3xl font-bold">{nutritionPlan.protein}g</p>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Carbohidrați</p>
              <p className="text-3xl font-bold">{nutritionPlan.carbs}g</p>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Grăsimi</p>
              <p className="text-3xl font-bold">{nutritionPlan.fat}g</p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('plan')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeView === 'plan'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Plan Săptămânal</span>
            </button>
            <button
              onClick={() => setActiveView('shopping')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeView === 'shopping'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Lista de Cumpărături</span>
            </button>
          </div>
        </div>

        {/* Day Selector - only show when on plan view */}
        {activeView === 'plan' && (
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 overflow-x-auto scrollbar-mobile">
            <div className="flex gap-2 min-w-max day-scroll-container">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeDay === day
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dayNames[day]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meal Plan View */}
        {activeView === 'plan' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-rose-500" />
              {dayNames[activeDay]} - Plan de Mese
            </h3>

          <div className="space-y-6">
            {meals.map((meal) => {
              const mealData = dayData[meal];
              let mealDescription = '';
              let cookingInstructions = '';

              // Handle both string format and object format with cookingInstructions
              if (typeof mealData === 'string') {
                mealDescription = mealData;
                // Check for instructions in separate instructions structure (old format from add-recipe API)
                const instructionsKey = `${activeDay}_instructions`;
                const dayInstructions = weekMenu?.[instructionsKey];
                if (dayInstructions && typeof dayInstructions === 'object' && dayInstructions[meal]) {
                  const rawInstructions = dayInstructions[meal] || '';
                  // Filter out placeholder values
                  cookingInstructions = rawInstructions && 
                                       rawInstructions.trim() !== '-' && 
                                       rawInstructions.trim().toLowerCase() !== 'n/a' &&
                                       rawInstructions.trim().toLowerCase() !== 'na' &&
                                       rawInstructions.trim() !== ''
                                       ? rawInstructions.trim() : '';
                } else {
                  cookingInstructions = '';
                }
              } else if (mealData && typeof mealData === 'object') {
                // New object format: { ingredients: string, cookingInstructions: string }
                mealDescription = mealData.ingredients || mealData.description || '';
                const rawInstructions = mealData.cookingInstructions || '';
                // Filter out placeholder values like "-", "n/a", empty strings
                cookingInstructions = rawInstructions && 
                                     rawInstructions.trim() !== '-' && 
                                     rawInstructions.trim().toLowerCase() !== 'n/a' &&
                                     rawInstructions.trim().toLowerCase() !== 'na' &&
                                     rawInstructions.trim() !== ''
                                     ? rawInstructions.trim() : '';
                
                // Debug: log if we have cooking instructions
                if (cookingInstructions) {
                  console.log(`[MyPlan] Found cooking instructions for ${meal}:`, cookingInstructions.substring(0, 50) + '...');
                } else if (rawInstructions) {
                  console.log(`[MyPlan] Skipping placeholder cooking instructions for ${meal}: "${rawInstructions}"`);
                }
              } else if (mealData === null || mealData === undefined) {
                // Empty meal
                return null;
              }

              if (!mealDescription || mealDescription.trim() === '') {
                return null;
              }

              const mealTitle = mealNames[meal] || meal;

              return (
                <div key={`${activeDay}-${meal}`} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3">
                    <h4 className="font-bold text-white">{mealTitle}</h4>
                  </div>
                  
                  <div className="p-4">
                    <IngredientBreakdown
                      mealDescription={mealDescription}
                      mealType={mealTitle}
                      planId={nutritionPlan?.id}
                      dayKey={activeDay}
                      mealTypeKey={meal}
                      editable={false}
                      ingredientTranslations={ingredientTranslationsMap}
                    />
                    {cookingInstructions && cookingInstructions.trim() && (
                      <div className="mt-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <ChefHat className="w-5 h-5 text-orange-600" />
                          <div className="text-sm font-bold text-orange-800">Instrucțiuni de gătit - {mealTitle}</div>
                        </div>
                        <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed bg-white rounded p-3 border border-orange-100">
                          {cookingInstructions}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {Object.keys(dayData).length === 0 && (
            <div className="text-center py-12">
              <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nu există mese planificate pentru această zi încă.</p>
            </div>
          )}
          </div>
        )}

        {/* Shopping List View */}
        {activeView === 'shopping' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-rose-500" />
              Lista de Cumpărături - Săptămână Completă
            </h3>

            {shoppingList.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nu există ingrediente în plan.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {shoppingList.map((item, index) => {
                  const itemKey = `${item.name}-${item.unit}`;
                  const isChecked = checkedItems[itemKey] || false;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <button
                        onClick={() => setCheckedItems(prev => ({ ...prev, [itemKey]: !isChecked }))}
                        className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-rose-500'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1">
                        <span className={`font-medium ${isChecked ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                          {getIngredientName(item.name)}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`font-semibold ${isChecked ? 'text-gray-400' : 'text-rose-600'}`}>
                          {Math.round(item.quantity)} {translateUnit(item.unit)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary - Sticky on mobile */}
            {shoppingList.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border-2 border-rose-200 sticky bottom-0 left-0 right-0 z-10 shadow-lg backdrop-blur-sm bg-opacity-95">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Progres:</span>
                  <span className="text-lg font-bold text-rose-600">
                    {Object.values(checkedItems).filter(Boolean).length} / {shoppingList.length}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(Object.values(checkedItems).filter(Boolean).length / shoppingList.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Message */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl shadow-xl p-6 mt-6 text-white text-center">
          <Heart className="w-12 h-12 mx-auto mb-3 animate-pulse" />
          <p className="text-lg font-medium mb-2">Rămâi dedicată obiectivelor tale!</p>
          <p className="text-rose-100">Urmează planul tău personalizat și privește transformarea.</p>
        </div>
      </div>
    </div>
  );
}


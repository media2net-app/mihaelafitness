'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Apple, TrendingUp, User, Heart, ShoppingCart, Check } from 'lucide-react';
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
  const [ingredientTranslations, setIngredientTranslations] = useState<{ [id: string]: { nameRo: string; nameEn: string } }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customer's assigned nutrition plan
        const response = await fetch(`/api/customer-nutrition-plans?customerId=${customerId}`);
        if (!response.ok) throw new Error('Failed to fetch nutrition plan');
        
        const assignments = await response.json();
        if (assignments.length === 0) {
          setLoading(false);
          return;
        }

        const assignment = assignments[0];
        setCustomer(assignment.customer);

        // Fetch full nutrition plan details
        const planResponse = await fetch(`/api/nutrition-plans/${assignment.nutritionPlanId}`);
        if (!planResponse.ok) throw new Error('Failed to fetch plan details');
        
        const planData = await planResponse.json();
        setNutritionPlan(planData);
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
    if (nutritionPlan && customer) {
      const title = `${nutritionPlan.name} - ${customer.name} | Mihaela Fitness`;
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
          mealDescription = mealData.description || mealData.ingredients || '';
        }

        if (!mealDescription || mealDescription.trim() === '') return;

        // Parse ingredients from description
        const ingredientStrs = mealDescription.split(',').map(s => s.trim());
        
        ingredientStrs.forEach(ingredientStr => {
          // Parse format: "2 cmgbfewgp01b78igv3zsoydrf|1 Egg" or "100 cmgbf5jgf016v8igv5viv7qkz|Chicken Breast"
          const match = ingredientStr.match(/^([\d.]+)\s+([a-z0-9]+)\|(.+)$/i);
          if (!match) return;

          const [, quantityStr, ingredientId, ingredientName] = match;
          const quantity = parseFloat(quantityStr);
          
          // Clean the ingredient name - remove leading numbers and quantities
          let cleanName = ingredientName.split('|').pop()?.trim() || ingredientName;
          
          // Check if this is a piece-based ingredient (starts with "1 ")
          const isPiece = /^1\s+/.test(cleanName);
          
          // Remove patterns like "1 ", "2 ", "1.5 " from the start of the name
          const baseCleanName = cleanName.replace(/^\d+(?:\.\d+)?\s+/, '');
          
          // Create a smart grouping key based on base name (without "1 " prefix)
          // This way "Banana" and "1 Banana" will have the same base key
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
            } else if (!isPiece && existing.isPiece) {
              // Adding grams to pieces - convert existing pieces to grams first
              const gramsPerPiece = 100;
              existing.quantity = (existing.quantity * gramsPerPiece) + quantity;
              existing.unit = 'g';
              existing.isPiece = false;
            } else {
              // Same unit type, just add
              existing.quantity += quantity;
            }
          } else {
            // New ingredient
            const key = `${ingredientId}-${baseKey}`;
            ingredientMap.set(key, { 
              quantity, 
              unit: isPiece ? 'stuks' : 'g', 
              name: baseCleanName, 
              ingredientId,
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

  // Fetch Romanian translations for shopping list ingredients
  useEffect(() => {
    const fetchTranslations = async () => {
      if (shoppingList.length === 0) {
        console.log('📝 Shopping list is empty, skipping translation fetch');
        return;
      }
      
      const uniqueIds = [...new Set(shoppingList.map(item => item.ingredientId))];
      console.log('🔍 Fetching translations for', uniqueIds.length, 'ingredients');
      
      try {
        const translationsMap: { [id: string]: { nameRo: string; nameEn: string } } = {};
        
        // Fetch each ingredient to get its Romanian name
        const results = await Promise.allSettled(
          uniqueIds.map(async (id) => {
            try {
              console.log('🌐 Fetching ingredient:', id);
              const response = await fetch(`/api/ingredients/${id}`);
              if (response.ok) {
                const ingredient = await response.json();
                console.log('✅ Got translation:', ingredient.name, '->', ingredient.nameRo || 'NO TRANSLATION');
                translationsMap[id] = {
                  nameRo: ingredient.nameRo || ingredient.name,
                  nameEn: ingredient.name
                };
              } else {
                console.error('❌ Failed to fetch ingredient', id, '- Status:', response.status);
              }
            } catch (error) {
              console.error(`❌ Error fetching ingredient ${id}:`, error);
            }
          })
        );
        
        console.log('📊 Translation results:', Object.keys(translationsMap).length, 'translations loaded');
        setIngredientTranslations(translationsMap);
      } catch (error) {
        console.error('💥 Error fetching ingredient translations:', error);
      }
    };
    
    fetchTranslations();
  }, [shoppingList]);

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

  const dayData = nutritionPlan.weekMenu?.[activeDay] || {};
  const meals = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
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

              if (typeof mealData === 'string') {
                mealDescription = mealData;
              } else if (mealData && typeof mealData === 'object') {
                mealDescription = mealData.description || mealData.ingredients || '';
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
                    />
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
                          {ingredientTranslations[item.ingredientId]?.nameRo || item.name}
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


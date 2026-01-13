'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Apple, Loader2, AlertCircle, Calendar, ShoppingCart, User, TrendingUp, ChefHat, Heart, Check } from 'lucide-react';
import IngredientBreakdown from '@/components/IngredientBreakdown';

export default function NutritionPlanPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>('monday');
  const [activeView, setActiveView] = useState<'plan' | 'shopping'>('plan');
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role === 'admin') {
      router.push('/admin');
      return;
    }

    if (user?.id && token) {
      fetchNutritionPlan();
    }
  }, [isAuthenticated, user, token, router]);

  const fetchNutritionPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customer nutrition plan assignments
      const response = await fetch(`/api/customer-nutrition-plans?customerId=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nutrition plan');
      }

      const assignments = await response.json();

      if (!assignments || assignments.length === 0) {
        setError('Geen voedingsplan toegewezen. Neem contact op met je trainer.');
        setLoading(false);
        return;
      }

      // Get the active assignment
      const activeAssignment = assignments.find((a: any) => a.status === 'active') || assignments[0];

      // Fetch full nutrition plan details
      const planResponse = await fetch(`/api/nutrition-plans/${activeAssignment.nutritionPlanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!planResponse.ok) {
        throw new Error('Failed to fetch plan details');
      }

      const planData = await planResponse.json();
      setNutritionPlan(planData);
    } catch (error: any) {
      console.error('Error fetching nutrition plan:', error);
      setError(error.message || 'Er is een fout opgetreden bij het laden van je voedingsplan.');
    } finally {
      setLoading(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames: { [key: string]: string } = {
    monday: 'Maandag',
    tuesday: 'Dinsdag',
    wednesday: 'Woensdag',
    thursday: 'Donderdag',
    friday: 'Vrijdag',
    saturday: 'Zaterdag',
    sunday: 'Zondag'
  };

  const mealNames: { [key: string]: string } = {
    'breakfast': 'Ontbijt',
    'morning-snack': 'Ochtendsnack',
    'lunch': 'Lunch',
    'afternoon-snack': 'Middagsnack',
    'dinner': 'Avondeten',
    'evening-snack': 'Avondsnack'
  };

  // Generate shopping list from all week's ingredients
  const shoppingList = useMemo(() => {
    if (!nutritionPlan?.weekMenu) return [];

    const ingredientMap = new Map<string, { 
      quantity: number; 
      unit: string; 
      name: string; 
      ingredientId: string;
      isPiece: boolean;
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
          if (Array.isArray(mealData)) {
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

        let ingredientStrs: string[] = [];
        if (mealDescription.includes('[RECIPE:')) {
          const recipeMatch = mealDescription.match(/\[RECIPE:[^\]]+\]\s*(.*)/);
          if (recipeMatch) {
            const recipeIngredients = recipeMatch[1];
            ingredientStrs = recipeIngredients.split(',').map(s => s.trim()).filter(s => s.length > 0);
          }
        } else {
          ingredientStrs = mealDescription.split(',').map(s => s.trim());
        }
        
        ingredientStrs.forEach(ingredientStr => {
          let match = ingredientStr.match(/^([\d.]+)\s*(g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms|piece|pieces|stuks|stuk|buc|bucăți)\s+(.+)$/i);
          
          if (!match) {
            match = ingredientStr.match(/^([\d.]+)\s+([a-z0-9]+)\|(.+)$/i);
          }
          
          if (!match) return;
          
          let quantity: number;
          let unit: string;
          let ingredientName: string;
          let ingredientId: string = '';
          
          if (ingredientStr.includes('|')) {
            const [, quantityStr, id, name] = match;
            quantity = parseFloat(quantityStr);
            ingredientId = id;
            ingredientName = name;
          } else {
            const [, quantityStr, unitStr, name] = match;
            quantity = parseFloat(quantityStr);
            unit = unitStr.toLowerCase();
            ingredientName = name;
            
            if (unit === 'g' || unit === 'gram' || unit === 'grams') {
              unit = 'g';
            } else if (unit === 'ml' || unit === 'milliliter' || unit === 'milliliters') {
              unit = 'ml';
            } else if (unit === 'piece' || unit === 'pieces' || unit === 'stuks' || unit === 'stuk' || unit === 'buc' || unit === 'bucăți') {
              unit = 'stuks';
            } else if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') {
              quantity = quantity * 1000;
              unit = 'g';
            }
          }

          let cleanName = ingredientName.split('|').pop()?.trim() || ingredientName;
          const baseCleanName = cleanName.replace(/^\d+(?:\.\d+)?\s+/, '').trim();
          const isPiece = unit === 'stuks' || unit === 'piece' || unit === 'pieces' || unit === 'stuk' || unit === 'buc' || unit === 'bucăți';
          
          if (!unit) {
            unit = 'g';
          }
          
          const baseKey = baseCleanName.toLowerCase().trim();
          
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
            
            if (isPiece && !existing.isPiece) {
              const gramsPerPiece = 100;
              existing.quantity += quantity * gramsPerPiece;
              existing.unit = 'g';
              existing.isPiece = false;
            } else if (!isPiece && existing.isPiece) {
              const gramsPerPiece = 100;
              existing.quantity = (existing.quantity * gramsPerPiece) + quantity;
              existing.unit = 'g';
              existing.isPiece = false;
            } else {
              if (existing.unit === unit) {
                existing.quantity += quantity;
              } else {
                if ((existing.unit === 'g' && unit === 'ml') || (existing.unit === 'ml' && unit === 'g')) {
                  existing.quantity += quantity;
                  existing.unit = 'g';
                } else {
                  existing.quantity += quantity;
                }
              }
            }
          } else {
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

    return Array.from(ingredientMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [nutritionPlan, days]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Je voedingsplan wordt geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !nutritionPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <Apple className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Geen voedingsplan</h2>
          <p className="text-gray-600">{error || 'Geen voedingsplan gevonden. Neem contact op met je trainer.'}</p>
        </div>
      </div>
    );
  }

  const weekMenu = nutritionPlan?.weekMenu || {};
  const dayData = weekMenu[activeDay] || {};
  const meals = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];

  const goalLabels: { [key: string]: string } = {
    'weight-loss': 'Gewichtsverlies',
    'weight-gain': 'Gewichtstoename',
    'maintenance': 'Onderhoud'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Mobile Layout */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <img src="/logo-mihaela.svg" alt="Mihaela Fitness" className="h-12 w-auto" />
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                <User className="w-4 h-4" />
                <span className="font-medium text-sm">{user?.name || 'Klant'}</span>
              </div>
            </div>
            <p className="text-sm text-rose-100">Je Persoonlijke Voedingsplan</p>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-mihaela.svg" alt="Mihaela Fitness" className="h-10 w-auto" />
              <div>
                <p className="text-sm text-rose-100">Je Persoonlijke Voedingsplan</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <User className="w-5 h-5" />
              <span className="font-medium">{user?.name || 'Klant'}</span>
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
            <span className="text-gray-600 font-medium">{goalLabels[nutritionPlan.goal] || nutritionPlan.goal}</span>
          </div>

          {/* Macro Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Calorieën</p>
              <p className="text-3xl font-bold">{nutritionPlan.calories}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Eiwit</p>
              <p className="text-3xl font-bold">{nutritionPlan.protein}g</p>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Koolhydraten</p>
              <p className="text-3xl font-bold">{nutritionPlan.carbs}g</p>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Vet</p>
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
              <span>Weekplan</span>
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
              <span>Boodschappenlijst</span>
            </button>
          </div>
        </div>

        {/* Day Selector */}
        {activeView === 'plan' && (
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
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
              {dayNames[activeDay]} - Maaltijden
            </h3>

            <div className="space-y-6">
              {meals.map((meal) => {
                const mealData = dayData[meal];
                let mealDescription = '';
                let cookingInstructions = '';

                if (typeof mealData === 'string') {
                  mealDescription = mealData;
                  const instructionsKey = `${activeDay}_instructions`;
                  const dayInstructions = weekMenu?.[instructionsKey];
                  if (dayInstructions && typeof dayInstructions === 'object' && dayInstructions[meal]) {
                    const rawInstructions = dayInstructions[meal] || '';
                    cookingInstructions = rawInstructions && 
                                         rawInstructions.trim() !== '-' && 
                                         rawInstructions.trim().toLowerCase() !== 'n/a' &&
                                         rawInstructions.trim().toLowerCase() !== 'na' &&
                                         rawInstructions.trim() !== ''
                                         ? rawInstructions.trim() : '';
                  }
                } else if (mealData && typeof mealData === 'object') {
                  mealDescription = mealData.ingredients || mealData.description || '';
                  const rawInstructions = mealData.cookingInstructions || '';
                  cookingInstructions = rawInstructions && 
                                       rawInstructions.trim() !== '-' && 
                                       rawInstructions.trim().toLowerCase() !== 'n/a' &&
                                       rawInstructions.trim().toLowerCase() !== 'na' &&
                                       rawInstructions.trim() !== ''
                                       ? rawInstructions.trim() : '';
                } else if (mealData === null || mealData === undefined) {
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
                        ingredientTranslations={nutritionPlan?._ingredientTranslations || {}}
                      />
                      {cookingInstructions && cookingInstructions.trim() && (
                        <div className="mt-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <ChefHat className="w-5 h-5 text-orange-600" />
                            <div className="text-sm font-bold text-orange-800">Bereidingsinstructies - {mealTitle}</div>
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
                <p className="text-gray-500">Geen maaltijden gepland voor deze dag.</p>
              </div>
            )}
          </div>
        )}

        {/* Shopping List View */}
        {activeView === 'shopping' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-rose-500" />
              Boodschappenlijst - Hele Week
            </h3>

            {shoppingList.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Geen ingrediënten in het plan.</p>
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
                          {item.name}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`font-semibold ${isChecked ? 'text-gray-400' : 'text-rose-600'}`}>
                          {Math.round(item.quantity)} {item.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {shoppingList.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border-2 border-rose-200 sticky bottom-0 left-0 right-0 z-10 shadow-lg backdrop-blur-sm bg-opacity-95">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Voortgang:</span>
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
          <p className="text-lg font-medium mb-2">Blijf toegewijd aan je doelen!</p>
          <p className="text-rose-100">Volg je persoonlijke plan en zie de transformatie.</p>
        </div>
      </div>
    </div>
  );
}

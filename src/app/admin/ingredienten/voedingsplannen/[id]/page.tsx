'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';

interface NutritionPlan {
  id: string;
  name: string;
  goal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: number;
  clients: number;
  status: string;
  description: string;
  weekMenu: any;
  createdAt: string;
  updatedAt: string;
}

export default function NutritionPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [planDetail, setPlanDetail] = useState<any>(null);
  const [planDetailLoading, setPlanDetailLoading] = useState(true);
  const [ingredientAmounts, setIngredientAmounts] = useState<{[key: string]: number}>({});
  const [ingredientCalories, setIngredientCalories] = useState<{[key: string]: number}>({});
  const [ingredientMacros, setIngredientMacros] = useState<{[key: string]: {protein: number; carbs: number; fat: number}}>({});
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState('monday');

  // Fetch plan detail
  const fetchPlanDetail = async (planId: string) => {
    setPlanDetailLoading(true);
    try {
      const response = await fetch(`/api/nutrition-plans/${planId}`);
      if (response.ok) {
        const data = await response.json();
        setPlanDetail(data);
      } else {
        console.error('Error fetching plan detail:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching plan detail:', error);
    } finally {
      setPlanDetailLoading(false);
    }
  };

  // Function to calculate macros for an ingredient
  const calculateIngredientMacros = async (ingredientString: string, amount: number) => {
    try {
      // Parse ingredient: "100 id|Name" or "100 Name"
      const match = ingredientString.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
      if (!match) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      const namePart = match[2];
      
      // Check if it has ID format: "id|Name"
      const idMatch = namePart.match(/^([^|]+)\|(.+)$/);
      const ingredientName = idMatch ? idMatch[2] : namePart;
      
      // Make API call to calculate macros
      const response = await fetch('/api/calculate-macros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredientString: `${amount} ${ingredientName}`
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          calories: data.calories || 0,
          protein: data.protein || 0,
          carbs: data.carbs || 0,
          fat: data.fat || 0
        };
      }
      
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    } catch (error) {
      console.error('Error calculating macros:', error);
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
  };

  // Save changes
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      if (!planDetail) return;

      // Create updated weekMenu with new amounts
      const updatedWeekMenu = { ...planDetail.weekMenu };
      
      // Update each meal with new ingredient amounts
      for (const dayKey of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
        const day = updatedWeekMenu[dayKey];
        if (!day) continue;
        
        for (const mealKey of ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack']) {
          const meal = day[mealKey];
          if (typeof meal === 'string' && meal.trim()) {
            const ingredients = meal.split(',');
            const updatedIngredients = ingredients.map((ingredient, idx) => {
              const trimmed = ingredient.trim();
              if (!trimmed) return ingredient;
              
              const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
              if (match) {
                const ingredientKey = `${dayKey}-${mealKey}-${idx}`;
                const newAmount = ingredientAmounts[ingredientKey];
                
                if (newAmount !== undefined && newAmount !== parseFloat(match[1])) {
                  return `${newAmount} ${match[2]}`;
                }
              }
              return ingredient;
            });
            
            day[mealKey] = updatedIngredients.join(',');
          }
        }
      }

      // Save to database
      const response = await fetch(`/api/nutrition-plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekMenu: updatedWeekMenu
        }),
      });

      if (response.ok) {
        // Refresh plan detail to get updated data
        await fetchPlanDetail(planId);
        alert('Wijzigingen opgeslagen!');
      } else {
        throw new Error('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Fout bij opslaan van wijzigingen');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (planId) {
      fetchPlanDetail(planId);
    }
  }, [planId]);

  // Calculate macros for all ingredients when plan detail loads
  useEffect(() => {
    if (planDetail && planDetail.weekMenu) {
      const calculateAllMacros = async () => {
        const newCalories: {[key: string]: number} = {};
        const newMacros: {[key: string]: {protein: number; carbs: number; fat: number}} = {};
        
        for (const dayKey of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
          const day = planDetail.weekMenu[dayKey];
          if (!day) continue;
          
          for (const mealKey of ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack']) {
            const meal = day[mealKey];
            if (typeof meal === 'string' && meal.trim()) {
              const ingredients = meal.split(',');
              
              for (let idx = 0; idx < ingredients.length; idx++) {
                const ingredient = ingredients[idx].trim();
                if (!ingredient) continue;
                
                const ingredientKey = `${dayKey}-${mealKey}-${idx}`;
                const match = ingredient.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
                if (match) {
                  const amount = parseFloat(match[1]);
                  const macros = await calculateIngredientMacros(ingredient, amount);
                  newCalories[ingredientKey] = macros.calories;
                  newMacros[ingredientKey] = {
                    protein: macros.protein,
                    carbs: macros.carbs,
                    fat: macros.fat
                  };
                }
              }
            }
          }
        }
        
        setIngredientCalories(newCalories);
        setIngredientMacros(newMacros);
      };
      
      calculateAllMacros();
    }
  }, [planDetail]);

  if (planDetailLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading nutrition plan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!planDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Nutrition plan not found.</p>
            <button
              onClick={() => router.push('/admin/ingredienten')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Nutrition Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/admin/ingredienten')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{planDetail.name}</h1>
                  <p className="text-sm text-gray-600">
                    {planDetail.goal === 'weight-loss' ? 'Gewichtsverlies' :
                     planDetail.goal === 'weight-gain' ? 'Gewichtstoename' :
                     planDetail.goal === 'muscle-gain' ? 'Spieropbouw' :
                     'Onderhoud'} • {planDetail.calories} cal • {planDetail.meals} maaltijden
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  planDetail.goal === 'weight-loss' ? 'bg-red-100 text-red-800' :
                  planDetail.goal === 'weight-gain' ? 'bg-green-100 text-green-800' :
                  planDetail.goal === 'muscle-gain' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {planDetail.goal === 'weight-loss' ? 'Gewichtsverlies' :
                   planDetail.goal === 'weight-gain' ? 'Gewichtstoename' :
                   planDetail.goal === 'muscle-gain' ? 'Spieropbouw' :
                   'Onderhoud'}
                </span>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">{planDetail.calories}</div>
            <div className="text-sm text-gray-600">Calorieën</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">{planDetail.protein}g</div>
            <div className="text-sm text-gray-600">Eiwit</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">{planDetail.carbs}g</div>
            <div className="text-sm text-gray-600">Koolhydraten</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">{planDetail.fat}g</div>
            <div className="text-sm text-gray-600">Vetten</div>
          </div>
        </div>

        {/* Day Tabs */}
        {planDetail.weekMenu && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((dayKey) => (
                <button
                  key={dayKey}
                  onClick={() => setActiveDay(dayKey)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeDay === dayKey
                      ? 'bg-white text-rose-600 border-b-2 border-rose-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {dayKey === 'monday' ? 'Maandag' :
                   dayKey === 'tuesday' ? 'Dinsdag' :
                   dayKey === 'wednesday' ? 'Woensdag' :
                   dayKey === 'thursday' ? 'Donderdag' :
                   dayKey === 'friday' ? 'Vrijdag' :
                   dayKey === 'saturday' ? 'Zaterdag' :
                   dayKey === 'sunday' ? 'Zondag' : dayKey}
                </button>
              ))}
            </div>

            {/* Active Day Content */}
            {(() => {
              const day = planDetail.weekMenu[activeDay];
              if (!day) return null;

              return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="space-y-8">
                      {['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'].map((mealKey) => {
                        const meal = day[mealKey];
                        
                        return (
                          <div key={mealKey} className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold text-gray-800 capitalize">
                                {mealKey === 'breakfast' ? 'Ontbijt' :
                                 mealKey === 'morning-snack' ? 'Ochtendsnack' :
                                 mealKey === 'lunch' ? 'Lunch' :
                                 mealKey === 'afternoon-snack' ? 'Middagsnack' :
                                 mealKey === 'dinner' ? 'Diner' :
                                 mealKey === 'evening-snack' ? 'Avondsnack' : mealKey}
                              </h3>
                              <button
                                onClick={() => {
                                  // TODO: Implement add ingredient functionality
                                  alert('Add ingredient functionality will be implemented next');
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                              >
                                + Voeg ingrediënt toe
                              </button>
                            </div>
                            
                            {typeof meal === 'string' && meal.trim() ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm border border-gray-200 rounded-lg">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="text-left py-3 px-4 font-medium text-gray-600">Ingrediënt</th>
                                      <th className="text-right py-3 px-4 font-medium text-gray-600">Hoeveelheid</th>
                                      <th className="text-right py-3 px-4 font-medium text-gray-600">Cal</th>
                                      <th className="text-right py-3 px-4 font-medium text-gray-600">Eiwit (g)</th>
                                      <th className="text-right py-3 px-4 font-medium text-gray-600">Koolhydraten (g)</th>
                                      <th className="text-right py-3 px-4 font-medium text-gray-600">Vetten (g)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {meal.split(',').map((ingredient: string, idx: number) => {
                                      const trimmed = ingredient.trim();
                                      if (!trimmed) return null;

                                      // Parse ingredient: "100 id|Name" or "100 Name"
                                      const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
                                      if (match) {
                                        const amount = match[1];
                                        const namePart = match[2];

                                        // Check if it has ID format: "id|Name"
                                        const idMatch = namePart.match(/^([^|]+)\|(.+)$/);
                                        const ingredientName = idMatch ? idMatch[2] : namePart;

                                        // Determine the correct unit based on ingredient name and original string
                                        let displayUnit = 'g';
                                        let displayAmount = amount;
                                        
                                        // Check if the original string contains "gram" - if so, it's always grams
                                        const hasGramInString = trimmed.toLowerCase().includes('gram');
                                        
                                        if (hasGramInString) {
                                          // If "gram" is in the original string, always use grams
                                          displayUnit = 'g';
                                          displayAmount = amount;
                                        } else {
                                          // Check for piece-based ingredients only if no "gram" in string
                                          const pieceBasedIngredients = [
                                            'egg', 'banana', 'apple', 'orange', 'pear', 'peach', 'kiwi', 'mango', 'lemon', 'lime',
                                            'carrot', 'cucumber', 'bell pepper', 'onion', 'sweet potato', 'potato', 'zucchini',
                                            'chicken breast', 'chicken thigh', 'salmon fillet', 'cod fillet', 'pork chop', 'beef steak', 'turkey breast',
                                            'slice', 'piece', 'cup', 'tablespoon', 'handful', 'scoop'
                                          ];
                                          
                                          const isPieceBased = pieceBasedIngredients.some(piece => 
                                            ingredientName.toLowerCase().includes(piece.toLowerCase())
                                          );
                                          
                                          if (isPieceBased) {
                                            // For piece-based ingredients, show the amount as pieces
                                            if (parseFloat(amount) === 1) {
                                              displayUnit = 'stuk';
                                              displayAmount = '1';
                                            } else {
                                              displayUnit = 'stuk';
                                              displayAmount = amount;
                                            }
                                          } else {
                                            // For weight-based ingredients, show as grams
                                            displayUnit = 'g';
                                            displayAmount = amount;
                                          }
                                        }
                                        
                                        const ingredientKey = `${activeDay}-${mealKey}-${idx}`;
                                        const currentAmount = ingredientAmounts[ingredientKey] || parseFloat(displayAmount);
                                        const currentCalories = ingredientCalories[ingredientKey] || 0;
                                        const currentMacros = ingredientMacros[ingredientKey] || { protein: 0, carbs: 0, fat: 0 };

                                        return (
                                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-700">{ingredientName}</td>
                                            <td className="py-3 px-4 text-right">
                                              <div className="flex items-center justify-end gap-1">
                                                <input
                                                  type="number"
                                                  value={currentAmount}
                                                  onChange={async (e) => {
                                                    const newAmount = parseFloat(e.target.value) || 0;
                                                    setIngredientAmounts(prev => ({
                                                      ...prev,
                                                      [ingredientKey]: newAmount
                                                    }));

                                                    // Create new ingredient string with updated amount
                                                    const newIngredientString = `${newAmount} ${namePart}`;
                                                    
                                                    // Calculate macros for new amount
                                                    const macros = await calculateIngredientMacros(newIngredientString, newAmount);
                                                    setIngredientCalories(prev => ({
                                                      ...prev,
                                                      [ingredientKey]: macros.calories
                                                    }));
                                                    setIngredientMacros(prev => ({
                                                      ...prev,
                                                      [ingredientKey]: {
                                                        protein: macros.protein,
                                                        carbs: macros.carbs,
                                                        fat: macros.fat
                                                      }
                                                    }));
                                                  }}
                                                  className="w-20 text-right border border-gray-200 rounded px-2 py-1 text-sm"
                                                  min="0"
                                                  step="0.1"
                                                />
                                                <span className="text-gray-500 text-xs">{displayUnit}</span>
                                              </div>
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-600">
                                              {currentCalories > 0 ? Math.round(currentCalories) : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-600">
                                              {currentMacros.protein > 0 ? Math.round(currentMacros.protein * 10) / 10 : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-600">
                                              {currentMacros.carbs > 0 ? Math.round(currentMacros.carbs * 10) / 10 : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-600">
                                              {currentMacros.fat > 0 ? Math.round(currentMacros.fat * 10) / 10 : '-'}
                                            </td>
                                          </tr>
                                        );
                                      }

                                      return (
                                        <tr key={idx} className="border-b border-gray-100">
                                          <td colSpan={6} className="py-3 px-4 text-sm text-gray-700">
                                            {trimmed}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot className="bg-gray-50">
                                    <tr className="border-t-2 border-gray-300">
                                      <td className="py-3 px-4 font-semibold text-gray-800">Maaltijd Totaal</td>
                                      <td className="py-3 px-4 text-right font-semibold text-gray-800"></td>
                                      <td className="py-3 px-4 text-right font-semibold text-gray-800">
                                        {(() => {
                                          const mealTotal = meal.split(',').reduce((total, ingredient, idx) => {
                                            const ingredientKey = `${activeDay}-${mealKey}-${idx}`;
                                            return total + (ingredientCalories[ingredientKey] || 0);
                                          }, 0);
                                          return mealTotal > 0 ? Math.round(mealTotal) : '-';
                                        })()}
                                      </td>
                                      <td className="py-3 px-4 text-right font-semibold text-gray-800">
                                        {(() => {
                                          const mealTotal = meal.split(',').reduce((total, ingredient, idx) => {
                                            const ingredientKey = `${activeDay}-${mealKey}-${idx}`;
                                            return total + (ingredientMacros[ingredientKey]?.protein || 0);
                                          }, 0);
                                          return mealTotal > 0 ? Math.round(mealTotal * 10) / 10 : '-';
                                        })()}
                                      </td>
                                      <td className="py-3 px-4 text-right font-semibold text-gray-800">
                                        {(() => {
                                          const mealTotal = meal.split(',').reduce((total, ingredient, idx) => {
                                            const ingredientKey = `${activeDay}-${mealKey}-${idx}`;
                                            return total + (ingredientMacros[ingredientKey]?.carbs || 0);
                                          }, 0);
                                          return mealTotal > 0 ? Math.round(mealTotal * 10) / 10 : '-';
                                        })()}
                                      </td>
                                      <td className="py-3 px-4 text-right font-semibold text-gray-800">
                                        {(() => {
                                          const mealTotal = meal.split(',').reduce((total, ingredient, idx) => {
                                            const ingredientKey = `${activeDay}-${mealKey}-${idx}`;
                                            return total + (ingredientMacros[ingredientKey]?.fat || 0);
                                          }, 0);
                                          return mealTotal > 0 ? Math.round(mealTotal * 10) / 10 : '-';
                                        })()}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500 italic">
                                Geen maaltijd gepland
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Daily Total */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-blue-800">Dag Totaal</span>
                        <div className="flex gap-6 text-sm">
                          <span className="text-blue-700">Cal: <strong>
                            {(() => {
                              const dailyTotal = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'].reduce((total, mealKey) => {
                                const meal = day[mealKey];
                                if (typeof meal === 'string' && meal.trim()) {
                                  return total + meal.split(',').reduce((mealTotal, ingredient, idx) => {
                                    const ingredientKey = `${activeDay}-${mealKey}-${idx}`;
                                    return mealTotal + (ingredientCalories[ingredientKey] || 0);
                                  }, 0);
                                }
                                return total;
                              }, 0);
                              return dailyTotal > 0 ? Math.round(dailyTotal) : '-';
                            })()}
                          </strong></span>
                          <span className="text-blue-700">Eiwit: <strong>
                            {(() => {
                              const dailyTotal = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'].reduce((total, mealKey) => {
                                const meal = day[mealKey];
                                if (typeof meal === 'string' && meal.trim()) {
                                  return total + meal.split(',').reduce((mealTotal, ingredient, idx) => {
                                    const ingredientKey = `${activeDay}-${mealKey}-${idx}`;
                                    return mealTotal + (ingredientMacros[ingredientKey]?.protein || 0);
                                  }, 0);
                                }
                                return total;
                              }, 0);
                              return dailyTotal > 0 ? Math.round(dailyTotal * 10) / 10 : '-';
                            })()}g</strong></span>
                          <span className="text-blue-700">Koolhydraten: <strong>
                            {(() => {
                              const dailyTotal = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'].reduce((total, mealKey) => {
                                const meal = day[mealKey];
                                if (typeof meal === 'string' && meal.trim()) {
                                  return total + meal.split(',').reduce((mealTotal, ingredient, idx) => {
                                    const ingredientKey = `${activeDay}-${mealKey}-${idx}`;
                                    return mealTotal + (ingredientMacros[ingredientKey]?.carbs || 0);
                                  }, 0);
                                }
                                return total;
                              }, 0);
                              return dailyTotal > 0 ? Math.round(dailyTotal * 10) / 10 : '-';
                            })()}g</strong></span>
                          <span className="text-blue-700">Vetten: <strong>
                            {(() => {
                              const dailyTotal = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'].reduce((total, mealKey) => {
                                const meal = day[mealKey];
                                if (typeof meal === 'string' && meal.trim()) {
                                  return total + meal.split(',').reduce((mealTotal, ingredient, idx) => {
                                    const ingredientKey = `${activeDay}-${mealKey}-${idx}`;
                                    return mealTotal + (ingredientMacros[ingredientKey]?.fat || 0);
                                  }, 0);
                                }
                                return total;
                              }, 0);
                              return dailyTotal > 0 ? Math.round(dailyTotal * 10) / 10 : '-';
                            })()}g</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
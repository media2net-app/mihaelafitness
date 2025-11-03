'use client';

import { useState, useEffect } from 'react';
import IngredientBreakdownV3 from '@/components/IngredientBreakdownV3';
import { FiLink, FiCopy } from 'react-icons/fi';

interface NutritionPlan {
  id: string;
  name: string;
  goal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: number;
  weekMenu: {
    [day: string]: {
      [mealType: string]: string;
    };
  };
}

interface NutritionPlanV3ClientProps {
  planId: string;
}

export default function NutritionPlanV3Client({ planId }: NutritionPlanV3ClientProps) {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/nutrition-plans-v3/${planId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch plan: ${response.status}`);
        }
        
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const handlePlanUpdate = (updatedPlan: NutritionPlan) => {
    setPlan(updatedPlan);
  };

  // Copy personal link to clipboard
  const copyPersonalLink = async () => {
    const personalLink = `${window.location.origin}/my-plan/${plan?.id}`;
    try {
      await navigator.clipboard.writeText(personalLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Calculate daily totals for a specific day
  const calculateDailyTotals = (day: string) => {
    const dayMenu = plan?.weekMenu[day];
    if (!dayMenu) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    mealTypes.forEach(mealType => {
      const mealData = dayMenu[mealType];
      if (mealData && mealData.trim().startsWith('[') && mealData.trim().endsWith(']')) {
        try {
          const ingredients = JSON.parse(mealData);
          if (Array.isArray(ingredients)) {
            ingredients.forEach((ingredient: any) => {
              totalCalories += Math.round(ingredient.calories || 0);
              totalProtein += Math.round(ingredient.protein || 0);
              totalCarbs += Math.round(ingredient.carbs || 0);
              totalFat += Math.round(ingredient.fat || 0);
            });
          }
        } catch (error) {
          console.error(`Error parsing meal data for ${day}-${mealType}:`, error);
        }
      }
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat
    };
  };

  // Calculate progress percentages for daily targets
  const calculateProgressPercentages = (day: string) => {
    const totals = calculateDailyTotals(day);
    const targets = {
      calories: plan?.calories || 0,
      protein: plan?.protein || 0,
      carbs: plan?.carbs || 0,
      fat: plan?.fat || 0
    };

    return {
      calories: targets.calories > 0 ? Math.min((totals.calories / targets.calories) * 100, 100) : 0,
      protein: targets.protein > 0 ? Math.min((totals.protein / targets.protein) * 100, 100) : 0,
      carbs: targets.carbs > 0 ? Math.min((totals.carbs / targets.carbs) * 100, 100) : 0,
      fat: targets.fat > 0 ? Math.min((totals.fat / targets.fat) * 100, 100) : 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading nutrition plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Plan not found</div>
          <p className="text-gray-500">The nutrition plan could not be loaded.</p>
        </div>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealTypes = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
          <button
            onClick={copyPersonalLink}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <FiLink className="w-4 h-4 mr-2" />
            {copySuccess ? (
              <>
                <FiCopy className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              'Copy Personal Link'
            )}
          </button>
        </div>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Goal: <span className="font-medium capitalize">{plan.goal}</span></span>
          <span>Meals: <span className="font-medium">{plan.meals}</span></span>
          <span>Calories: <span className="font-medium">{plan.calories}</span></span>
          <span>Protein: <span className="font-medium">{plan.protein}g</span></span>
          <span>Carbs: <span className="font-medium">{plan.carbs}g</span></span>
          <span>Fat: <span className="font-medium">{plan.fat}g</span></span>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {days.map((day) => {
              const dailyTotals = calculateDailyTotals(day);
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`${
                    isSelected
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize flex items-center space-x-2`}
                >
                  <span>{day}</span>
                  {dailyTotals.calories > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {dailyTotals.calories} kcal
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {selectedDay}
              </h2>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-orange-600 font-medium">
                  {calculateDailyTotals(selectedDay).calories} kcal
                </span>
                <span className="text-blue-600 font-medium">
                  {calculateDailyTotals(selectedDay).protein}g eiwit
                </span>
                <span className="text-green-600 font-medium">
                  {calculateDailyTotals(selectedDay).carbs}g koolhydraten
                </span>
                <span className="text-purple-600 font-medium">
                  {calculateDailyTotals(selectedDay).fat}g vet
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Daily Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Calories Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-orange-600 font-medium">Calories</span>
                  <span className="text-gray-600">
                    {calculateDailyTotals(selectedDay).calories} / {plan?.calories || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgressPercentages(selectedDay).calories}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {Math.round(calculateProgressPercentages(selectedDay).calories)}%
                </div>
              </div>

              {/* Protein Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600 font-medium">Protein</span>
                  <span className="text-gray-600">
                    {calculateDailyTotals(selectedDay).protein}g / {plan?.protein || 0}g
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgressPercentages(selectedDay).protein}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {Math.round(calculateProgressPercentages(selectedDay).protein)}%
                </div>
              </div>

              {/* Carbs Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">Carbs</span>
                  <span className="text-gray-600">
                    {calculateDailyTotals(selectedDay).carbs}g / {plan?.carbs || 0}g
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgressPercentages(selectedDay).carbs}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {Math.round(calculateProgressPercentages(selectedDay).carbs)}%
                </div>
              </div>

              {/* Fat Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-600 font-medium">Fat</span>
                  <span className="text-gray-600">
                    {calculateDailyTotals(selectedDay).fat}g / {plan?.fat || 0}g
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgressPercentages(selectedDay).fat}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {Math.round(calculateProgressPercentages(selectedDay).fat)}%
                </div>
              </div>
            </div>
          </div>

          {/* Meals Grid */}
          <div className="space-y-4">
            {mealTypes.map((mealType) => (
              <IngredientBreakdownV3
                key={`${selectedDay}-${mealType}`}
                planId={planId}
                dayKey={selectedDay}
                mealTypeKey={mealType}
                mealDescription={plan.weekMenu[selectedDay]?.[mealType] || ''}
                onPlanUpdated={handlePlanUpdate}
                editable={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

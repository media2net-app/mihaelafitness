"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import IngredientBreakdown from "@/components/IngredientBreakdown";
// Removed calculateDailyTotalsV2 import - using DOM-based calculation like V3
import { FiLink, FiCopy } from "react-icons/fi";

const dayOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const mealOrder = [
  "breakfast",
  "morning-snack",
  "lunch",
  "afternoon-snack",
  "dinner",
  "evening-snack",
] as const;

const dayNames = {
  monday: "Monday",
  tuesday: "Tuesday", 
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday"
};

type WeekMenu = Record<string, any>;

function getMealString(dayMenu: any, mealType: string): string {
  if (!dayMenu || typeof dayMenu !== "object") return "";
  const mealData = dayMenu[mealType];
  if (mealData && typeof mealData === "object" && mealData.ingredients) return mealData.ingredients;
  if (typeof mealData === "string") return mealData;
  const capKey = mealType.charAt(0).toUpperCase() + mealType.slice(1);
  const capVal = dayMenu[capKey];
  if (capVal && typeof capVal === "object" && capVal.ingredients) return capVal.ingredients;
  if (typeof capVal === "string") return capVal;
  return "";
}

// Helper function to get color based on target vs actual
function getTextColor(actual: number, target: number, baseClass: string): string {
  if (actual >= target) return baseClass.replace('text-gray-800', 'text-green-600');
  if (actual >= target * 0.8) return baseClass.replace('text-gray-800', 'text-yellow-600');
  return baseClass;
}

export default function NutritionPlanV2Client({ params }: { params: { id: string } }) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>('monday');
  const [dailyTotals, setDailyTotals] = useState<any>(null);
  const [loadingDailyTotals, setLoadingDailyTotals] = useState(false);
  const [mealMacros, setMealMacros] = useState<{[key: string]: any}>({});
  const [forceTableUpdate, setForceTableUpdate] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [nutritionCalculation, setNutritionCalculation] = useState<any>(null);

  // Fetch customer and nutrition calculation data
  const fetchCustomerData = async (planId: string) => {
    try {
      // Get customer assigned to this plan
      const customerResponse = await fetch(`/api/nutrition-plans/${planId}/customer`);
      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        setCustomer(customerData.customer);
        
        // If customer found, get their nutrition calculation
        if (customerData.customer?.id) {
          const calcResponse = await fetch(`/api/nutrition-calculations?customerId=${customerData.customer.id}&limit=1`);
          if (calcResponse.ok) {
            const calculations = await calcResponse.json();
            if (calculations.length > 0) {
              setNutritionCalculation(calculations[0]); // Get most recent calculation
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
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

  // V3-style DOM-based calculation (replaces old API-based calculation)
  const calculateDailyTotals = useCallback(() => {
    console.log('🔍 [V2] Calculating daily totals from DOM values (V3-style)');
    const totals = calculateDailyTotalsFromDOM();
    setDailyTotals(totals);
    setLoadingDailyTotals(false);
  }, []);

  // Get individual meal macros from DOM
  const getMealMacrosFromDOM = (mealType: string): { calories: number; protein: number; carbs: number; fat: number } => {
    try {
      // Convert mealType to match DOM class format (keep spaces as they are in DOM)
      const domMealType = mealType.toLowerCase();
      
      // Get calories - use attribute selector to handle spaces in class names
      const caloriesElement = document.querySelector(`[class*="totalcalories-${domMealType}"]`);
      const calories = caloriesElement ? parseInt(caloriesElement.textContent || '0') : 0;
      console.log(`🔔 [DEBUG] ${mealType} calories element:`, caloriesElement, 'value:', calories);

      // Get protein - use attribute selector to handle spaces in class names
      const proteinElement = document.querySelector(`[class*="totalprotein-${domMealType}"]`);
      const proteinText = proteinElement?.textContent || '0g';
      const protein = parseFloat(proteinText.replace('g', '')) || 0;
      console.log(`🔔 [DEBUG] ${mealType} protein element:`, proteinElement, 'value:', protein);

      // Get fat - use attribute selector to handle spaces in class names
      const fatElement = document.querySelector(`[class*="totalfat-${domMealType}"]`);
      const fatText = fatElement?.textContent || '0g';
      const fat = parseFloat(fatText.replace('g', '')) || 0;
      console.log(`🔔 [DEBUG] ${mealType} fat element:`, fatElement, 'value:', fat);

      // Get carbs - use attribute selector to handle spaces in class names
      const carbsElement = document.querySelector(`[class*="totalcarbs-${domMealType}"]`);
      const carbsText = carbsElement?.textContent || '0g';
      const carbs = parseFloat(carbsText.replace('g', '')) || 0;
      console.log(`🔔 [DEBUG] ${mealType} carbs element:`, carbsElement, 'value:', carbs);

      const result = {
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
      };
      
      console.log(`🔔 [DEBUG] ${mealType} final result:`, result);
      return result;
    } catch (error) {
      console.error(`❌ [V2] Error reading ${mealType} macros from DOM:`, error);
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
  };

  // Calculate daily totals by reading actual values from DOM
  const calculateDailyTotalsFromDOM = (): { calories: number; protein: number; carbs: number; fat: number } => {
    console.log('🔔 [DEBUG] calculateDailyTotalsFromDOM called');
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const mealType of mealOrder) {
      try {
        // Convert mealType to match the display format used in IngredientBreakdown
        const displayMealType = mealType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const mealMacros = getMealMacrosFromDOM(displayMealType);
        console.log(`🔔 [DEBUG] ${mealType} macros from DOM:`, mealMacros);
        totalCalories += mealMacros.calories;
        totalProtein += mealMacros.protein;
        totalCarbs += mealMacros.carbs;
        totalFat += mealMacros.fat;
      } catch (error) {
        console.error(`❌ [V2] Error getting ${mealType} macros:`, error);
      }
    }

    const totals = {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    };
    
    console.log('🔔 [DEBUG] Final calculated totals:', totals);
    return totals;
  };

  // V3-style callback for when meal macros change
  const onMealMacrosUpdated = useCallback(() => {
    console.log('🔔 [DEBUG] onMealMacrosUpdated called');
    // Recalculate daily totals from DOM when any meal macros change (V3 approach)
    const totals = calculateDailyTotalsFromDOM();
    console.log('🔔 [DEBUG] Calculated totals from DOM:', totals);
    setDailyTotals(prev => {
      console.log('🔔 [DEBUG] Current dailyTotals state before update:', prev);
      console.log('🔔 [DEBUG] Setting new dailyTotals to:', totals);
      return {...totals};
    });
    // Force table update to show new values
    setForceTableUpdate(prev => prev + 1);
    console.log('🔄 [V2] Daily totals and table updated from macros change:', totals);
  }, []);

  // Calculate daily totals when active day or plan changes (V3-style)
  useEffect(() => {
    console.log('🔔 [DEBUG] useEffect triggered for daily totals calculation');
    console.log('🔔 [DEBUG] activeDay:', activeDay);
    console.log('🔔 [DEBUG] plan?.weekMenu?.[activeDay]:', plan?.weekMenu?.[activeDay]);
    
    if (plan?.weekMenu?.[activeDay]) {
      // Use DOM-based calculation for more accurate results (V3 approach)
      setTimeout(() => {
        console.log('🔔 [DEBUG] calculateDailyTotals called from useEffect');
        const totals = calculateDailyTotalsFromDOM();
        console.log('🔔 [DEBUG] Totals from useEffect calculation:', totals);
        setDailyTotals(totals);
        console.log('🔔 [DEBUG] setDailyTotals called from useEffect with:', totals);
      }, 1000); // Give more time for components to render
    }
  }, [activeDay, plan, calculateDailyTotals]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        
        // Try direct by-id endpoint first
        let data: any | null = null;
        let status = 0;
        let listStatus = 0;
        try {
          const url = `/api/nutrition-plans/${params.id}`;
          const res = await fetch(url);
          status = res.status;
          if (res.ok) {
            data = await res.json();
            console.log('🔄 [V2] Data loaded from API:', {
              planId: data?.id,
              weekMenu: data?.weekMenu ? Object.keys(data.weekMenu) : 'none',
              mondayBreakfast: data?.weekMenu?.monday?.breakfast || 'none'
            });
          }
        } catch (e) {
          console.error('[V2] by-id fetch failed:', e);
        }

        // Fallback: try listing and find the plan client-side
        if (!data) {
          try {
            const listRes = await fetch(`/api/nutrition-plans?includeWeekMenu=true&limit=200`);
            listStatus = listRes.status;
            if (listRes.ok) {
              const arr = await listRes.json();
              if (Array.isArray(arr)) {
                const found = arr.find((p: any) => String(p?.id) === String(params.id));
                if (found) data = found;
              }
            }
          } catch (e) {
            console.error('[V2] list fetch failed:', e);
          }
        }

        if (!data) {
          const errorMsg = `Failed to load plan (by-id status: ${status}, list status: ${listStatus})`;
          console.error('[V2]', errorMsg);
          throw new Error(errorMsg);
        }
        
        setPlan(data);
        
        // Fetch customer and nutrition calculation data
        if (data?.id) {
          await fetchCustomerData(data.id);
        }
      } catch (e: any) {
        console.error('[V2] Error in run function:', e);
        setError(e?.message || "Failed to load plan");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params.id]);

  if (loading) return <div className="p-6 text-gray-600">Loading plan…</div>;
  if (error) return (
    <div className="p-6 text-red-600 space-y-2">
      <div className="font-bold">{error}</div>
      <div className="text-sm text-gray-600">Try opening the original page: <a className="underline" href={`/admin/voedingsplannen/${params.id}`}>/admin/voedingsplannen/{params.id}</a></div>
    </div>
  );
  if (!plan) return <div className="p-6 text-gray-600">No plan</div>;

  const wm: WeekMenu = plan.weekMenu || { days: plan.days } || {};
  const ingredientTranslations = plan?._ingredientTranslations || {};
  const activeDayData = wm[activeDay] || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{plan.name || 'Nutrition Plan V2'}</h1>
        <p className="text-gray-600">Plan ID: {plan.id}</p>
      </div>

      {/* Personal Link Section */}
      <div className="mb-6 bg-white rounded-lg border border-rose-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <FiLink className="text-rose-600" size={20} />
          <span className="text-gray-700 font-medium">Persoonlijke Link voor {plan.name || 'Nutrition Plan'}</span>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/my-plan/${plan?.id}`}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-600"
          />
          <button
            onClick={copyPersonalLink}
            className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors ${
              copySuccess
                ? 'bg-green-600 text-white'
                : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}
          >
            <FiCopy size={16} />
            {copySuccess ? 'Gekopieerd!' : 'Kopieer Link'}
          </button>
        </div>
      </div>

      {/* Daily Overview */}
      {dailyTotals && (
        <div className="mb-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 sm:p-6 border border-rose-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {dayNames[activeDay as keyof typeof dayNames]} - Daily Overview
            </h2>
            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
              Training Day
            </span>
          </div>
          
          {/* Macro Overview with Progress Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Calories */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Calories</div>
              <div className="text-lg font-bold text-gray-800 mb-2">
                {dailyTotals.calories}/{plan.calories || 0}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, ((dailyTotals.calories || 0) / (plan.calories || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Protein */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Protein</div>
              <div className="text-lg font-bold text-gray-800 mb-2">
                {dailyTotals.protein}g/{plan.protein || 0}g
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, ((dailyTotals.protein || 0) / (plan.protein || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Carbs</div>
              <div className="text-lg font-bold text-gray-800 mb-2">
                {dailyTotals.carbs}g/{plan.carbs || 0}g
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, ((dailyTotals.carbs || 0) / (plan.carbs || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Fat */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Fat</div>
              <div className="text-lg font-bold text-gray-800 mb-2">
                {dailyTotals.fat}g/{plan.fat || 0}g
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, ((dailyTotals.fat || 0) / (plan.fat || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          {customer && (
            <div className="mt-4 p-3 bg-white/50 rounded-lg border border-rose-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Klant:</span>
                <span>{customer.name}</span>
                {nutritionCalculation && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="font-medium">Doel:</span>
                    <span>{plan.calories} kcal/dag</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">BMR:</span>
                    <span>{Math.round(nutritionCalculation.bmr)} kcal</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">TDEE:</span>
                    <span>{Math.round(nutritionCalculation.maintenanceCalories)} kcal</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Meal Macros Table (V3-style) */}
      {dailyTotals && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {dayNames[activeDay as keyof typeof dayNames]} - Meal Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Protein</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fat</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mealOrder.map((mealType) => {
                  const displayMealType = mealType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  // Use V3 DOM-based calculation for meal macros display
                  const macros = forceTableUpdate >= 0 ? getMealMacrosFromDOM(displayMealType) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
                  
                  return (
                    <tr key={mealType} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {displayMealType}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-800">
                        {macros.calories}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-800">
                        {macros.protein}g
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-800">
                        {macros.carbs}g
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-800">
                        {macros.fat}g
                      </td>
                    </tr>
                  );
                })}
                {/* Daily Totals Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">Daily Total</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                    {dailyTotals.calories}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                    {dailyTotals.protein}g
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                    {dailyTotals.carbs}g
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                    {dailyTotals.fat}g
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Day Tabs */}
      <div className="mb-6">
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto pb-1">
      {dayOrder.map((dayKey) => {
            const dayMenu = wm[dayKey] || {};
        const hasAny = mealOrder.some((m) => !!getMealString(dayMenu, m));
        if (!hasAny) return null;
            
        return (
              <button
                key={dayKey}
                onClick={() => setActiveDay(dayKey)}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeDay === dayKey
                    ? 'bg-rose-500 text-white border-b-2 border-rose-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {dayNames[dayKey as keyof typeof dayNames]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Content */}
            <div className="space-y-5">
              {mealOrder.map((mealType) => {
          const meal = getMealString(activeDayData, mealType);
                // Always render meal sections, even if empty, so users can add ingredients
          
                return (
            <div key={`${activeDay}-${mealType}`} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-gray-700">
                      {mealType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Editable
                </div>
                    </div>
                    <IngredientBreakdown
                      mealDescription={meal}
                      mealType={mealType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      planId={plan.id}
                dayKey={activeDay}
                      mealTypeKey={mealType}
                editable={true}
                onPlanUpdated={(updatedPlan) => {
                  console.log('🔔 [DEBUG] onPlanUpdated called');
                  console.log('🔔 [DEBUG] updatedPlan:', updatedPlan);
                  console.log('🔔 [DEBUG] Current dailyTotals before onPlanUpdated:', dailyTotals);
                  console.log('🔔 [DEBUG] Current plan.weekMenu before update:', plan?.weekMenu?.[activeDay]);
                  
                  if (updatedPlan && updatedPlan.weekMenu) {
                    console.log('✅ [V2] Updated plan has weekMenu, updating state');
                    console.log('🔔 [DEBUG] New plan.weekMenu:', updatedPlan.weekMenu?.[activeDay]);
                    setPlan(updatedPlan);
                  } else {
                    console.log('❌ [V2] Updated plan is invalid or missing weekMenu, keeping current plan');
                  }
                  // Always trigger recalculation when plan is updated (V3 approach)
                  setForceTableUpdate(prev => prev + 1);
                  // Recalculate daily totals after a short delay to ensure DOM is updated
                  setTimeout(() => {
                    console.log('🔔 [DEBUG] Recalculating totals after onPlanUpdated timeout');
                    const totals = calculateDailyTotalsFromDOM();
                    console.log('🔔 [DEBUG] New totals calculated:', totals);
                    console.log('🔔 [DEBUG] Current dailyTotals state before setDailyTotals:', dailyTotals);
                    setDailyTotals(totals);
                    console.log('🔔 [DEBUG] setDailyTotals called with:', totals);
                  }, 300);
                }}
                onMacrosUpdated={onMealMacrosUpdated}
                      ingredientTranslations={ingredientTranslations}
                    />
                  </div>
                );
              })}
            </div>
    </div>
  );
}




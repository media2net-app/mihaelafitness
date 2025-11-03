'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChefHat, ArrowLeft, Calculator, Loader2 } from 'lucide-react';

function NewNutritionPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calculationId = searchParams.get('calculationId');
  
  const [loading, setLoading] = useState(false);
  const [calculation, setCalculation] = useState<any>(null);
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (calculationId) {
      loadCalculation();
    }
  }, [calculationId]);

  const loadCalculation = async () => {
    try {
      const response = await fetch(`/api/nutrition-calculations-v2`);
      if (response.ok) {
        const calculations = await response.json();
        const found = calculations.find((calc: any) => calc.id === calculationId);
        if (found) {
          setCalculation(found);
          setPlanName(`Nutrition Plan - ${found.customerName}`);
          setDescription(`Based on calculation for ${found.customerName} (${found.finalCalories} kcal/day)`);
        }
      }
    } catch (error) {
      console.error('Error loading calculation:', error);
    }
  };

  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      alert('Please enter a plan name');
      return;
    }

    setLoading(true);
    try {
      const planData: any = {
        name: planName,
        description: description || '',
        goal: calculation?.objective === 'scadere' ? 'weight-loss' : 
              calculation?.objective === 'crestere' ? 'weight-gain' : 'maintenance',
        calories: calculation?.finalCalories || 0,
        protein: calculation?.protein || 0,
        carbs: calculation?.carbs || 0,
        fat: calculation?.fat || 0,
        status: 'active',
        meals: 5,
        weekMenu: {
          monday: {},
          tuesday: {},
          wednesday: {},
          thursday: {},
          friday: {},
          saturday: {},
          sunday: {}
        }
      };

      const response = await fetch('/api/nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        const newPlan = await response.json();
        router.push(`/admin/v2/nutrition-plans/${newPlan.id}`);
      } else {
        const error = await response.json();
        alert(`Failed to create plan: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Error creating nutrition plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500" />
            Create Nutrition Plan
          </h1>
          {calculation && (
            <p className="text-gray-600 mt-2">
              Based on calculation for <strong>{calculation.customerName}</strong>
            </p>
          )}
        </div>

        {/* Calculation Summary */}
        {calculation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Calculation Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Calories</div>
                <div className="text-2xl font-bold text-blue-600">{calculation.finalCalories}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Protein</div>
                <div className="text-2xl font-bold text-blue-600">{calculation.protein}g</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Carbs</div>
                <div className="text-2xl font-bold text-blue-600">{calculation.carbs}g</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Fat</div>
                <div className="text-2xl font-bold text-blue-600">{calculation.fat}g</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Weight:</span>
                <span className="ml-2 font-medium">{calculation.weight} kg</span>
              </div>
              <div>
                <span className="text-gray-600">Age:</span>
                <span className="ml-2 font-medium">{calculation.age} years</span>
              </div>
              <div>
                <span className="text-gray-600">Objective:</span>
                <span className="ml-2 font-medium capitalize">{calculation.objective}</span>
              </div>
            </div>
          </div>
        )}

        {/* Plan Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name *
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Enter plan name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Enter plan description..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={loading || !planName.trim()}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ChefHat className="w-5 h-5" />
                    Create Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewNutritionPlanPage() {
  return (
    <Suspense fallback={
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        </div>
      </div>
    }>
      <NewNutritionPlanContent />
    </Suspense>
  );
}

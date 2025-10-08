'use client';

import { useState, useEffect } from 'react';
import { Calculator, Apple, Scale, Target, Plus, Trash2, Save, Download, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cachedFetch } from '@/lib/cache';

interface NutritionCalculation {
  id: string;
  customerName: string;
  customerId: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  activityLevel: string;
  bmr: number;
  maintenanceCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export default function MobileNutritionCalculatorPage() {
  const { t } = useLanguage();
  
  const [calculations, setCalculations] = useState<NutritionCalculation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<NutritionCalculation | null>(null);
  const [converting, setConverting] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedCarbType, setSelectedCarbType] = useState<string>('middle');
  
  // Calculator form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerId: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    age: '',
    activityLevel: 'moderate',
    gender: 'female'
  });

  useEffect(() => {
    fetchCalculations();
    fetchCustomers();
  }, []);

  const fetchCalculations = async () => {
    try {
      setLoading(true);
      // Use cached fetch with 1 minute TTL for calculations
      const data = await cachedFetch('/api/nutrition-calculations?limit=20', {}, 60000);
      setCalculations(data);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // Handle the new API response structure with users array and pagination
        let arrayData = [];
        if (data.users && Array.isArray(data.users)) {
          arrayData = data.users;
        } else if (Array.isArray(data)) {
          // Fallback for old API structure
          arrayData = data;
        } else {
          console.warn('Expected /api/users to return an object with users array. Got:', data);
        }
        
        // Filter out admin users and only show customers
        const customerList = arrayData.filter((user: any) => 
          !user.name?.includes('Own Training') && 
          !user.email?.includes('mihaela@mihaelafitness.com') &&
          !user.email?.includes('demo@mihaelafitness.com')
        );
        setCustomers(customerList);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const calculateNutrition = () => {
    const weight = parseFloat(formData.currentWeight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);
    
    if (!weight || !height || !age) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate BMR using Mifflin-St Jeor Equation (same as tdeecalculator.net)
    let bmr;
    if (formData.gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Activity multipliers (same as tdeecalculator.net)
    const activityMultipliers = {
      'sedentary': 1.2,        // Sedentary (office job)
      'light': 1.375,          // Light Exercise (1-2 days/week)
      'moderate': 1.55,        // Moderate Exercise (3-5 days/week)
      'active': 1.725,         // Heavy Exercise (6-7 days/week)
      'very-active': 1.9       // Athlete (2x per day)
    };

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultipliers[formData.activityLevel as keyof typeof activityMultipliers];

    // Macronutrient distribution based on TDEE
    const protein = Math.round(weight * 2.2); // 1g per lb of bodyweight
    const proteinCalories = protein * 4;
    const fatCalories = tdee * 0.25; // 25% from fat
    const fat = Math.round(fatCalories / 9);
    const carbCalories = tdee - proteinCalories - fatCalories;
    const carbs = Math.round(carbCalories / 4);

    return {
      maintenanceCalories: Math.round(tdee), // TDEE is the same as maintenance calories
      protein,
      carbs,
      fat
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nutrition = calculateNutrition();
    
    try {
      const response = await fetch('/api/nutrition-calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerId: formData.customerId,
          currentWeight: parseFloat(formData.currentWeight),
          height: parseFloat(formData.height),
          age: parseInt(formData.age),
          activityLevel: formData.activityLevel,
          gender: formData.gender,
          calculatedProtein: nutrition.protein,
          calculatedCarbs: nutrition.carbs,
          calculatedFat: nutrition.fat
        }),
      });

      if (response.ok) {
        const newCalculation = await response.json();
        setCalculations([newCalculation, ...calculations]);
        setShowCalculator(false);
        setFormData({
          customerName: '',
          customerId: '',
          currentWeight: '',
          targetWeight: '',
          height: '',
          age: '',
          activityLevel: 'moderate',
          gender: 'female'
        });
      } else {
        alert('Error creating calculation');
      }
    } catch (error) {
      console.error('Error submitting calculation:', error);
      alert('Error creating calculation');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this calculation?')) {
      try {
        const response = await fetch(`/api/nutrition-calculations/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCalculations(calculations.filter(calc => calc.id !== id));
        } else {
          alert('Error deleting calculation');
        }
      } catch (error) {
        console.error('Error deleting calculation:', error);
        alert('Error deleting calculation');
      }
    }
  };

  const handleConvertToPlan = (calculation: NutritionCalculation) => {
    setSelectedCalculation(calculation);
    setShowConvertModal(true);
  };

  const convertToPlan = async (goal: string, carbType: string) => {
    if (!selectedCalculation) return;

    setConverting(true);
    try {
      const response = await fetch(`/api/nutrition-calculations/${selectedCalculation.id}/convert-to-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal, carbType }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Nutrition plan created successfully for ${selectedCalculation.customerName}!`);
        setShowConvertModal(false);
        setSelectedCalculation(null);
        setSelectedGoal('');
        setSelectedCarbType('middle');
      } else {
        const error = await response.json();
        alert(`Error creating plan: ${error.error}`);
      }
    } catch (error) {
      console.error('Error converting to plan:', error);
      alert('Error creating nutrition plan');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading nutrition calculator...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nutrition Calculator</h1>
          <p className="text-gray-600">Calculate personalized nutrition plans for your customers</p>
        </div>

        {/* New Calculation Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCalculator(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
          >
            <Calculator className="w-5 h-5" />
            New Maintenance Calculation
          </button>
        </div>

        {/* Calculations List */}
        <div className="space-y-4">
          {calculations.length === 0 ? (
            <div className="text-center py-12">
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No calculations yet</h3>
              <p className="text-gray-500">Create your first nutrition calculation</p>
            </div>
          ) : (
            calculations.map((calculation) => (
              <div
                key={calculation.id}
                className="bg-white rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{calculation.customerName}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {calculation.gender ? calculation.gender.charAt(0).toUpperCase() + calculation.gender.slice(1) : 'Unknown Gender'} • 
                      {calculation.age || 'Unknown'} years old • 
                      {calculation.weight}kg • {calculation.height}cm
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleConvertToPlan(calculation)}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                      title="Convert to Nutrition Plan"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(calculation.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Calculation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Nutrition Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Apple className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-orange-600">{Math.round(calculation.maintenanceCalories)}</div>
                    <div className="text-xs text-gray-600">TDEE (Total Daily Energy Expenditure)</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Scale className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-600">{calculation.protein}g</div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-600">{calculation.carbs}g</div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Scale className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-purple-600">{calculation.fat}g</div>
                    <div className="text-xs text-gray-600">Fat</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Created: {new Date(calculation.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Maintenance Calculation</h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Calculate maintenance calories and macronutrients. Goals will be set when converting to a nutrition plan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => {
                    const selectedCustomer = customers.find(c => c.id === e.target.value);
                    setFormData({
                      ...formData, 
                      customerId: e.target.value,
                      customerName: selectedCustomer?.name || ''
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({...formData, currentWeight: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="70"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({...formData, targetWeight: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="65"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="170"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="30"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="sedentary">Sedentary (office job)</option>
                  <option value="light">Light Exercise (1-2 days/week)</option>
                  <option value="moderate">Moderate Exercise (3-5 days/week)</option>
                  <option value="active">Heavy Exercise (6-7 days/week)</option>
                  <option value="very-active">Athlete (2x per day)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCalculator(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Calculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Plan Modal */}
      {showConvertModal && selectedCalculation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Convert to Nutrition Plan</h3>
              <button
                onClick={() => {
                  setShowConvertModal(false);
                  setSelectedCalculation(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Create a nutrition plan for <strong>{selectedCalculation.customerName}</strong> based on this calculation.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Current Calculation:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>TDEE: <span className="font-medium">{Math.round(selectedCalculation.maintenanceCalories)}</span></div>
                  <div>Protein: <span className="font-medium">{selectedCalculation.protein}g</span></div>
                  <div>Carbs: <span className="font-medium">{selectedCalculation.carbs}g</span></div>
                  <div>Fat: <span className="font-medium">{selectedCalculation.fat}g</span></div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Goal for Plan:</label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedGoal('weight-loss')}
                  disabled={converting}
                  className={`w-full p-3 text-left border rounded-lg transition-colors disabled:opacity-50 ${
                    selectedGoal === 'weight-loss' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:bg-orange-50 hover:border-orange-300'
                  }`}
                >
                  <div className="font-medium text-gray-800">Weight Loss</div>
                  <div className="text-sm text-gray-600">-500 calories from TDEE</div>
                </button>
                <button
                  onClick={() => setSelectedGoal('maintenance')}
                  disabled={converting}
                  className={`w-full p-3 text-left border rounded-lg transition-colors disabled:opacity-50 ${
                    selectedGoal === 'maintenance' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:bg-orange-50 hover:border-orange-300'
                  }`}
                >
                  <div className="font-medium text-gray-800">Maintenance</div>
                  <div className="text-sm text-gray-600">Same as TDEE</div>
                </button>
                <button
                  onClick={() => setSelectedGoal('weight-gain')}
                  disabled={converting}
                  className={`w-full p-3 text-left border rounded-lg transition-colors disabled:opacity-50 ${
                    selectedGoal === 'weight-gain' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:bg-orange-50 hover:border-orange-300'
                  }`}
                >
                  <div className="font-medium text-gray-800">Weight Gain</div>
                  <div className="text-sm text-gray-600">+500 calories from TDEE</div>
                </button>
              </div>
            </div>

            {selectedGoal && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Carb Type:</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCarbType('low')}
                    disabled={converting}
                    className={`w-full p-3 text-left border rounded-lg transition-colors disabled:opacity-50 ${
                      selectedCarbType === 'low' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:bg-green-50 hover:border-green-300'
                    }`}
                  >
                    <div className="font-medium text-gray-800">Low Carbs</div>
                    <div className="text-sm text-gray-600">High protein, low carbs (20% carbs, 35% protein, 45% fat)</div>
                  </button>
                  <button
                    onClick={() => setSelectedCarbType('middle')}
                    disabled={converting}
                    className={`w-full p-3 text-left border rounded-lg transition-colors disabled:opacity-50 ${
                      selectedCarbType === 'middle' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium text-gray-800">Middle Carbs</div>
                    <div className="text-sm text-gray-600">Balanced macros (45% carbs, 25% protein, 30% fat)</div>
                  </button>
                  <button
                    onClick={() => setSelectedCarbType('high')}
                    disabled={converting}
                    className={`w-full p-3 text-left border rounded-lg transition-colors disabled:opacity-50 ${
                      selectedCarbType === 'high' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium text-gray-800">High Carbs</div>
                    <div className="text-sm text-gray-600">High carbs, lower fat (60% carbs, 20% protein, 20% fat)</div>
                  </button>
                </div>
              </div>
            )}

            {converting && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Creating nutrition plan...</span>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowConvertModal(false);
                  setSelectedCalculation(null);
                  setSelectedGoal('');
                  setSelectedCarbType('middle');
                }}
                disabled={converting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => convertToPlan(selectedGoal, selectedCarbType)}
                disabled={converting || !selectedGoal}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

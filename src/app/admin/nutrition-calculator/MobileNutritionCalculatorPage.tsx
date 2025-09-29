'use client';

import { useState, useEffect } from 'react';
import { Calculator, Apple, Scale, Target, Plus, Trash2, Save, Download, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NutritionCalculation {
  id: string;
  customerName: string;
  customerId: string;
  goal: string;
  currentWeight: number;
  targetWeight: number;
  height: number;
  age: number;
  activityLevel: string;
  gender: string;
  calculatedCalories: number;
  calculatedProtein: number;
  calculatedCarbs: number;
  calculatedFat: number;
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
  
  // Calculator form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerId: '',
    goal: 'weight-loss',
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
      const response = await fetch('/api/nutrition-calculations');
      if (response.ok) {
        const data = await response.json();
        setCalculations(data);
      }
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
        // Filter out admin users and only show customers
        const customerList = data.filter((user: any) => 
          !user.name.includes('Own Training') && 
          !user.email.includes('mihaela@mihaelafitness.com') &&
          !user.email.includes('demo@mihaelafitness.com')
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

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (formData.gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very-active': 1.9
    };

    const tdee = bmr * activityMultipliers[formData.activityLevel as keyof typeof activityMultipliers];

    // Goal adjustments
    let calories;
    switch (formData.goal) {
      case 'weight-loss':
        calories = tdee - 500; // 500 calorie deficit
        break;
      case 'weight-gain':
        calories = tdee + 500; // 500 calorie surplus
        break;
      case 'maintenance':
        calories = tdee;
        break;
      default:
        calories = tdee;
    }

    // Macronutrient distribution
    const protein = Math.round(weight * 2.2); // 1g per lb of bodyweight
    const proteinCalories = protein * 4;
    const fatCalories = calories * 0.25; // 25% from fat
    const fat = Math.round(fatCalories / 9);
    const carbCalories = calories - proteinCalories - fatCalories;
    const carbs = Math.round(carbCalories / 4);

    return {
      calories: Math.round(calories),
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
          goal: formData.goal,
          currentWeight: parseFloat(formData.currentWeight),
          targetWeight: parseFloat(formData.targetWeight),
          height: parseFloat(formData.height),
          age: parseInt(formData.age),
          activityLevel: formData.activityLevel,
          gender: formData.gender,
          calculatedCalories: nutrition.calories,
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
          goal: 'weight-loss',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Nutrition Calculator</h1>
          <p className="text-gray-600">Calculate personalized nutrition plans for your customers</p>
        </div>

        {/* New Calculation Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCalculator(true)}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-rose-600 hover:to-pink-700 transition-all duration-200 shadow-lg"
          >
            <Calculator className="w-5 h-5" />
            New Nutrition Calculation
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
                      {calculation.goal ? calculation.goal.charAt(0).toUpperCase() + calculation.goal.slice(1).replace('-', ' ') : 'Unknown Goal'} • 
                      {calculation.gender ? calculation.gender.charAt(0).toUpperCase() + calculation.gender.slice(1) : 'Unknown Gender'} • 
                      {calculation.age || 'Unknown'} years old
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDelete(calculation.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Nutrition Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Apple className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-orange-600">{calculation.calculatedCalories}</div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Scale className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-600">{calculation.calculatedProtein}g</div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-600">{calculation.calculatedCarbs}g</div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Scale className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-purple-600">{calculation.calculatedFat}g</div>
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Nutrition Calculation</h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="weight-loss">Weight Loss</option>
                  <option value="weight-gain">Weight Gain</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({...formData, currentWeight: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light Activity</option>
                  <option value="moderate">Moderate Activity</option>
                  <option value="active">Active</option>
                  <option value="very-active">Very Active</option>
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
                  className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Calculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

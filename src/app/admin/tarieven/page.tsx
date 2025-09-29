'use client';

import { useState, useEffect } from 'react';
import { Calculator, Plus, Save, Download, Euro, Users, Clock, Target, TrendingUp, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TarievenPage() {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedService, setSelectedService] = useState('personal-training-1-1');
  const [includeNutritionPlan, setIncludeNutritionPlan] = useState(false);
  const [nutritionPlanCount, setNutritionPlanCount] = useState<number | ''>('');
  const [duration, setDuration] = useState<number | ''>('');
  const [frequency, setFrequency] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');

  const [customers, setCustomers] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
    plan: string;
  }[]>([]);

  // Default service data for immediate calculation
  const defaultService = {
    id: 'personal-training-1-1',
    name: 'Personal Training 1:1',
    basePrice: 50,
    description: '1-on-1 personal training session. Price varies by frequency: 1x=50 RON, 2x=45 RON, 3x=42 RON, 4x=41 RON, 5x=40 RON'
  };

  const nutritionPlanPrice = 200; // 200 RON per nutrition plan

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      }
    };

    fetchCustomers();
  }, []);

  const selectedServiceData = defaultService;
  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  // Frequency-based pricing for training sessions
  const getPricePerSession = (frequency: number | '') => {
    if (typeof frequency !== 'number') return 0;
    switch (frequency) {
      case 1: return 50;
      case 2: return 45;
      case 3: return 42;
      case 4: return 41;
      case 5: return 40;
      default: return 50;
    }
  };

  const calculatePrice = () => {
    // Return zero values if duration or frequency are not set
    if (typeof duration !== 'number' || typeof frequency !== 'number') {
      return {
        basePrice: 0,
        totalPrice: 0,
        discountAmount: 0,
        priceAfterDiscount: 0,
        finalPrice: 0,
        isNutritionPlan: includeNutritionPlan
      };
    }

    let totalPrice = 0;

    // Check for specific pricing combinations
    if (duration === 4 && frequency === 3) {
      totalPrice = 500; // 4 weeks / 3 times a week = 500 RON
    } else if (duration === 12 && frequency === 3) {
      totalPrice = 1500; // 12 weeks / 3 times a week = 1500 RON
    } else if (duration === 4 && frequency === 5) {
      totalPrice = 800; // 4 weeks / 5 times a week = 800 RON
    } else if (duration === 12 && frequency === 5) {
      totalPrice = 2400; // 12 weeks / 5 times a week = 2400 RON
    } else {
      // Use existing frequency-based pricing for other combinations
      const pricePerSession = getPricePerSession(frequency);
      const totalSessions = duration * frequency;
      totalPrice = pricePerSession * totalSessions;
    }
    
    // Add nutrition plan if selected
    if (includeNutritionPlan && typeof nutritionPlanCount === 'number' && nutritionPlanCount > 0) {
      totalPrice += nutritionPlanPrice * nutritionPlanCount;
    }
    
    const discountAmount = (totalPrice * (typeof discount === 'number' ? discount : 0)) / 100;
    const priceAfterDiscount = totalPrice - discountAmount;
    const finalPrice = Math.round(priceAfterDiscount);
    
    return {
      basePrice: totalPrice / (duration * frequency), // Calculate average price per session
      totalPrice,
      discountAmount,
      priceAfterDiscount,
      finalPrice,
      isNutritionPlan: includeNutritionPlan
    };
  };

  const priceCalculation = calculatePrice();

  const saveCalculation = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer first');
      return;
    }

    if (typeof duration !== 'number' || typeof frequency !== 'number') {
      alert('Please enter duration and frequency');
      return;
    }

    try {
      const response = await fetch('/api/pricing-calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          customerName: selectedCustomerData?.name || '',
          service: selectedServiceData?.name || '',
          includeNutritionPlan,
          nutritionPlanCount: typeof nutritionPlanCount === 'number' ? nutritionPlanCount : 0,
          duration,
          frequency,
          discount: typeof discount === 'number' ? discount : 0,
          finalPrice: priceCalculation.finalPrice
        }),
      });

      if (response.ok) {
        alert(`Calculation saved for ${selectedCustomerData?.name}!`);
      } else {
        alert('Error saving calculation');
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('Error saving calculation');
    }
  };

  const exportCalculation = () => {
    const data = {
      customer: selectedCustomerData?.name,
      service: selectedServiceData?.name,
      includeNutritionPlan,
      nutritionPlanCount: typeof nutritionPlanCount === 'number' ? nutritionPlanCount : 0,
      duration,
      frequency,
      discount: typeof discount === 'number' ? discount : 0,
      calculations: priceCalculation,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricing-calculation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Pricing Calculator</h1>
              <p className="text-gray-600">Calculate prices and rates for your services</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={saveCalculation}
                className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-xl font-medium hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={exportCalculation}
                className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Calculator Form */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Calculation Settings</h2>
            
            <div className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  required
                >
                  <option value="">Select a customer... ({customers.length} available)</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email}) - {customer.plan}
                    </option>
                  ))}
                </select>
                {selectedCustomerData && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedCustomerData.name} • {selectedCustomerData.plan} • {selectedCustomerData.status}
                  </p>
                )}
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
                  Personal Training 1:1 - 50 RON
                </div>
                <p className="text-sm text-gray-600 mt-2">{selectedServiceData.description}</p>
              </div>

              {/* Nutrition Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Include Nutrition Plan</label>
                <select
                  value={includeNutritionPlan ? 'yes' : 'no'}
                  onChange={(e) => {
                    setIncludeNutritionPlan(e.target.value === 'yes');
                    if (e.target.value === 'no') {
                      setNutritionPlanCount('');
                    }
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes: 200 RON per plan</option>
                </select>
                <p className="text-sm text-gray-600 mt-2">Personalized nutrition plan with meal recommendations and dietary guidelines</p>
              </div>

              {/* Nutrition Plan Count - Only show when nutrition plan is selected */}
              {includeNutritionPlan && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Nutrition Plans
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={nutritionPlanCount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setNutritionPlanCount('');
                      } else {
                        setNutritionPlanCount(parseInt(value) || '');
                      }
                    }}
                    placeholder="Enter number of nutrition plans"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  />
                  <p className="text-sm text-gray-600 mt-2">Each nutrition plan costs 200 RON (e.g., 3 plans = 600 RON)</p>
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={duration}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setDuration('');
                    } else {
                      setDuration(parseInt(value) || '');
                    }
                  }}
                  placeholder="Enter number of weeks"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                />
                <p className="text-sm text-gray-600 mt-2">1 month (4 weeks) and 3 months (12 weeks)</p>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency (sessions per week)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={frequency}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFrequency('');
                    } else {
                      const numValue = parseInt(value) || '';
                      if (typeof numValue === 'number') {
                        setFrequency(Math.min(Math.max(numValue, 1), 5));
                      } else {
                        setFrequency('');
                      }
                    }
                  }}
                  placeholder="Enter sessions per week (max 5)"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setDiscount('');
                    } else {
                      setDiscount(parseInt(value) || 0);
                    }
                  }}
                  placeholder="Enter discount percentage"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Price Calculation */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Price Calculation</h2>
            
            <div className="space-y-4">
              {/* Customer Info */}
              {selectedCustomerData && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Customer</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {selectedCustomerData.name} • {selectedCustomerData.plan} • {selectedCustomerData.status}
                  </p>
                </div>
              )}

              <>
                {/* Training Session Pricing */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Price per session ({frequency}x per week):</span>
                  <span className="font-semibold">{priceCalculation.basePrice} RON</span>
                </div>

                {/* Total Sessions */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Total sessions ({duration} weeks × {frequency}/week):</span>
                  <span className="font-semibold">{duration * frequency}</span>
                </div>

                {/* Training Sessions Subtotal */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Training sessions:</span>
                  <span className="font-semibold">{(priceCalculation.basePrice * duration * frequency).toFixed(0)} RON</span>
                </div>

                {/* Nutrition Plan */}
                {includeNutritionPlan && typeof nutritionPlanCount === 'number' && nutritionPlanCount > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Nutrition Plans ({nutritionPlanCount} × 200 RON):</span>
                    <span className="font-semibold text-blue-600">{(nutritionPlanCount * 200).toFixed(0)} RON</span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{priceCalculation.totalPrice.toFixed(0)} RON</span>
                </div>

                {/* Discount */}
                {typeof discount === 'number' && discount > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Discount ({discount}%):</span>
                    <span className="font-semibold text-green-600">-{priceCalculation.discountAmount.toFixed(0)} RON</span>
                  </div>
                )}

                {/* Price after discount */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">After discount:</span>
                  <span className="font-semibold">{priceCalculation.priceAfterDiscount.toFixed(0)} RON</span>
                </div>

                {/* Final Price */}
                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl px-4">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-rose-600">{priceCalculation.finalPrice.toFixed(0)} RON</span>
                </div>

                {/* Price per session */}
                <div className="text-center py-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">Price per session:</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {(priceCalculation.finalPrice / (duration * frequency)).toFixed(0)} RON
                  </p>
                </div>

                {/* Platform Access Info */}
                <div className="text-center py-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
                  <p className="text-sm font-semibold text-rose-700 mb-2">✨ All prices include unlimited access to:</p>
                  <p className="text-sm text-gray-800">• Academy</p>
                  <p className="text-sm text-gray-800">• Mindset</p>
                  <p className="text-sm text-gray-800">• Progressie</p>
                  <p className="text-sm text-gray-800">• Motivation</p>
                </div>
              </>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Service Type</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Personal Training</p>
              </div>
              <Calculator className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Price Range</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">40-50 RON</p>
              </div>
              <Euro className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">1x per week</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">50 RON</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">5x per week</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">40 RON</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
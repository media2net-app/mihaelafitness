'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calculator, User, Scale, Target, Activity, Dumbbell, TrendingUp, TrendingDown, Minus, Save, Users } from 'lucide-react';

interface CalculationResult {
  step1_mb: number;
  step2_gender: number;
  step3_age: number;
  step4_bodyType: number;
  step5_objective: number;
  step6_dailyActivity: number;
  step7_training: number;
  finalCalories: number;
  protein: number;
  fat: number;
  carbs: number;
}

function KcalCalculatorV2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    weight: '',
    age: '',
    gender: 'female' as 'male' | 'female',
    bodyType: 'mezomorf' as 'ectomorf' | 'mezomorf' | 'endomorf',
    objective: 'mentinere' as 'crestere' | 'mentinere' | 'scadere',
    objectivePercentage: '15',
    dailyActivity: '20',
    trainingHours: '',
    trainingIntensity: '5.5', // cal/Kg/h
    proteinMale: '2.2', // g/Kg
    proteinFemale: '1.6', // g/Kg
    fatPerKg: '0.8', // g/Kg
    carbsMin: '2' // g/Kg (minimum)
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [customers, setCustomers] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadingCalculation, setLoadingCalculation] = useState(false);

  // Load calculation data from query parameter
  useEffect(() => {
    const calculationId = searchParams.get('calculationId');
    if (calculationId) {
      loadCalculationData(calculationId);
    }
  }, [searchParams]);

  const loadCalculationData = async (calculationId: string) => {
    setLoadingCalculation(true);
    try {
      const response = await fetch('/api/nutrition-calculations-v2');
      if (response.ok) {
        const calculations = await response.json();
        const calculation = calculations.find((calc: any) => calc.id === calculationId);
        
        if (calculation) {
          // Map calculation data to formData
          const newFormData = {
            weight: calculation.weight?.toString() || '',
            age: calculation.age?.toString() || '',
            gender: calculation.gender || 'female',
            bodyType: calculation.bodyType || 'mezomorf',
            objective: calculation.objective || 'mentinere',
            objectivePercentage: calculation.objectivePercentage?.toString() || '15',
            dailyActivity: calculation.dailyActivity?.toString() || '20',
            trainingHours: calculation.trainingHours?.toString() || '',
            trainingIntensity: calculation.trainingIntensity?.toString() || '5.5',
            proteinMale: calculation.proteinMale?.toString() || '2.2',
            proteinFemale: calculation.proteinFemale?.toString() || '1.6',
            fatPerKg: calculation.fatPerKg?.toString() || '0.8',
            carbsMin: calculation.carbsMin?.toString() || '2'
          };
          
          setFormData(newFormData);
          
          // Set customer if available
          if (calculation.customerId) {
            setSelectedCustomerId(calculation.customerId);
          }
          
          // Calculate results with the new data
          // Use setTimeout to ensure state is updated
          setTimeout(() => {
            const weight = parseFloat(newFormData.weight);
            const age = parseInt(newFormData.age);
            if (weight && age) {
              calculateWithData(newFormData, true);
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error loading calculation:', error);
    } finally {
      setLoadingCalculation(false);
    }
  };

  // Helper function to calculate with specific form data
  const calculateWithData = useCallback((data: typeof formData, autoCalculate = false) => {
    const weight = parseFloat(data.weight);
    const age = parseInt(data.age);
    const trainingHours = parseFloat(data.trainingHours) || 0;
    const trainingIntensity = parseFloat(data.trainingIntensity);
    const objectivePercentage = parseFloat(data.objectivePercentage);
    const dailyActivityPercentage = parseFloat(data.dailyActivity);

    if (!weight || !age) {
      if (!autoCalculate) {
        alert('Completați greutatea și vârsta');
      }
      setShowResults(false);
      return;
    }

    // Step 1: Basal Metabolic Rate (MB) = KG × 24
    const step1_mb = weight * 24;

    // Step 2: Gender adjustment
    const step2_gender = data.gender === 'female' 
      ? step1_mb * 0.9
      : step1_mb;

    // Step 3: Age adjustment
    const decadesOver40 = Math.max(0, Math.floor((age - 40) / 10));
    const ageAdjustment = step1_mb * -0.10 * decadesOver40;
    const step3_age = step2_gender + ageAdjustment;

    // Step 4: Body Type adjustment
    let bodyTypeAdjustment = 0;
    if (data.bodyType === 'ectomorf') {
      bodyTypeAdjustment = step1_mb * 0.05;
    } else if (data.bodyType === 'endomorf') {
      bodyTypeAdjustment = step1_mb * -0.05;
    }
    const step4_bodyType = step3_age + bodyTypeAdjustment;

    // Step 5: Objective adjustment
    let objectiveAdjustment = 0;
    if (data.objective === 'crestere') {
      objectiveAdjustment = step1_mb * (objectivePercentage / 100);
    } else if (data.objective === 'scadere') {
      objectiveAdjustment = step1_mb * -(objectivePercentage / 100);
    }
    const step5_objective = step4_bodyType + objectiveAdjustment;

    // Step 6: Daily Activity adjustment
    const dailyActivityAdjustment = step1_mb * (dailyActivityPercentage / 100);
    const step6_dailyActivity = step5_objective + dailyActivityAdjustment;

    // Step 7: Training adjustment
    const weeklyTrainingCalories = weight * trainingHours * trainingIntensity;
    const dailyTrainingCalories = weeklyTrainingCalories / 7;
    const step7_training = step6_dailyActivity + dailyTrainingCalories;

    // Final calories
    const finalCalories = Math.round(step7_training);

    // Macronutrients
    const proteinPerKg = data.gender === 'male' 
      ? parseFloat(data.proteinMale) 
      : parseFloat(data.proteinFemale);
    const protein = Math.round(weight * proteinPerKg);
    const fat = Math.round(weight * parseFloat(data.fatPerKg));
    const carbsMin = Math.round(weight * parseFloat(data.carbsMin));
    const remainingCalories = finalCalories - (protein * 4) - (fat * 9);
    const carbs = Math.max(carbsMin, Math.round(remainingCalories / 4));

    setResult({
      step1_mb,
      step2_gender,
      step3_age,
      step4_bodyType,
      step5_objective,
      step6_dailyActivity,
      step7_training,
      finalCalories,
      protein,
      fat,
      carbs
    });
    setShowResults(true);
  }, []);

  const calculate = useCallback((autoCalculate = false) => {
    const weight = parseFloat(formData.weight);
    const age = parseInt(formData.age);
    const trainingHours = parseFloat(formData.trainingHours) || 0;
    const trainingIntensity = parseFloat(formData.trainingIntensity);
    const objectivePercentage = parseFloat(formData.objectivePercentage);
    const dailyActivityPercentage = parseFloat(formData.dailyActivity);

    if (!weight || !age) {
      if (!autoCalculate) {
        alert('Completați greutatea și vârsta');
      }
      setShowResults(false);
      return;
    }

    // Step 1: Basal Metabolic Rate (MB) = KG × 24
    const step1_mb = weight * 24;

    // ALLE percentages worden toegepast op MB (niet cumulatief volgens notitie)
    // Alle percentages zijn "din MB" (van MB)

    // Step 2: Gender adjustment -10% din MB (alleen voor vrouw)
    const step2_gender = formData.gender === 'female' 
      ? step1_mb * 0.9 // -10% van MB
      : step1_mb; // Geen aanpassing voor man

    // Step 3: Age adjustment -10% din MB per decennium boven 40
    const decadesOver40 = Math.max(0, Math.floor((age - 40) / 10));
    const ageAdjustment = step1_mb * -0.10 * decadesOver40; // -10% van MB per decennium
    const step3_age = step2_gender + ageAdjustment;

    // Step 4: Body Type adjustment - alle percentages "din MB"
    let bodyTypeAdjustment = 0;
    if (formData.bodyType === 'ectomorf') {
      bodyTypeAdjustment = step1_mb * 0.05; // +5% van MB
    } else if (formData.bodyType === 'endomorf') {
      bodyTypeAdjustment = step1_mb * -0.05; // -5% van MB
    }
    // Mezomorf: geen aanpassing (0)
    const step4_bodyType = step3_age + bodyTypeAdjustment;

    // Step 5: Objective adjustment - percentage "din MB"
    let objectiveAdjustment = 0;
    if (formData.objective === 'crestere') {
      objectiveAdjustment = step1_mb * (objectivePercentage / 100); // +10-20% van MB
    } else if (formData.objective === 'scadere') {
      objectiveAdjustment = step1_mb * -(objectivePercentage / 100); // -10-20% van MB
    }
    // Mentinere: geen aanpassing (0)
    const step5_objective = step4_bodyType + objectiveAdjustment;

    // Step 6: Daily Activity adjustment - percentage "din MB"
    const dailyActivityAdjustment = step1_mb * (dailyActivityPercentage / 100); // +10-30% van MB
    const step6_dailyActivity = step5_objective + dailyActivityAdjustment;

    // Step 7: Training adjustment
    // +4 to +7 cal/Kg body/h of training
    // trainingHours is per week, direct toevoegen zonder deling
    const trainingCalories = weight * trainingHours * trainingIntensity;
    const step7_training = step6_dailyActivity + trainingCalories;

    // Final calories
    const finalCalories = Math.round(step7_training);

    // Macronutrients
    // Proteins: gebruik aangepaste factoren
    const proteinPerKg = formData.gender === 'male' 
      ? parseFloat(formData.proteinMale) 
      : parseFloat(formData.proteinFemale);
    const protein = Math.round(weight * proteinPerKg);

    // Fats: gebruik aangepaste factor
    const fatPerKg = parseFloat(formData.fatPerKg);
    const fat = Math.round(weight * fatPerKg);

    // Carbohydrates: MINIMUM gebruiken uit factor, resterende calorieën
    const carbsMinPerKg = parseFloat(formData.carbsMin);
    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;
    const carbCalories = finalCalories - proteinCalories - fatCalories;
    const carbs = Math.max(Math.round(weight * carbsMinPerKg), Math.round(carbCalories / 4));

    setResult({
      step1_mb: Math.round(step1_mb),
      step2_gender: Math.round(step2_gender),
      step3_age: Math.round(step3_age),
      step4_bodyType: Math.round(step4_bodyType),
      step5_objective: Math.round(step5_objective),
      step6_dailyActivity: Math.round(step6_dailyActivity),
      step7_training: Math.round(step7_training),
      finalCalories,
      protein,
      fat,
      carbs
    });

    setShowResults(true);
  }, [formData.weight, formData.age, formData.gender, formData.bodyType, formData.objective, formData.objectivePercentage, formData.dailyActivity, formData.trainingHours, formData.trainingIntensity, formData.proteinMale, formData.proteinFemale, formData.fatPerKg, formData.carbsMin]);

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          const customerList = Array.isArray(data) ? data : (data.users || []);
          // Filter out admin users
          const filtered = customerList.filter((user: any) => 
            !user.name?.includes('Own Training') && 
            !user.email?.includes('mihaela@mihaelafitness.com') &&
            !user.email?.includes('blocked-time@system.local')
          );
          setCustomers(filtered);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  // Auto-calculate when all required fields are filled
  useEffect(() => {
    if (formData.weight && formData.age) {
      calculate(true);
    } else {
      setShowResults(false);
    }
  }, [formData.weight, formData.age, formData.gender, formData.bodyType, formData.objective, formData.objectivePercentage, formData.dailyActivity, formData.trainingHours, formData.trainingIntensity, formData.proteinMale, formData.proteinFemale, formData.fatPerKg, formData.carbsMin, calculate]);

  const reset = () => {
    setFormData({
      weight: '',
      age: '',
      gender: 'female',
      bodyType: 'mezomorf',
      objective: 'mentinere',
      objectivePercentage: '15',
      dailyActivity: '20',
      trainingHours: '',
      trainingIntensity: '5.5',
      proteinMale: '2.2',
      proteinFemale: '1.6',
      fatPerKg: '0.8',
      carbsMin: '2'
    });
    setResult(null);
    setShowResults(false);
    setSelectedCustomerId('');
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedCustomerId) {
      alert('Selectați un client pentru a salva calculația');
      return;
    }

    if (!result) {
      alert('Calculați mai întâi rezultatele');
      return;
    }

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    if (!selectedCustomer) {
      alert('Client invalid');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const calculationData = {
        customerId: selectedCustomerId,
        customerName: selectedCustomer.name,
        weight: parseFloat(formData.weight),
        age: parseInt(formData.age),
        gender: formData.gender,
        bodyType: formData.bodyType,
        objective: formData.objective,
        objectivePercentage: parseFloat(formData.objectivePercentage),
        dailyActivity: parseFloat(formData.dailyActivity),
        trainingHours: parseFloat(formData.trainingHours) || 0,
        trainingIntensity: parseFloat(formData.trainingIntensity),
        ...result,
        calculationType: 'v2' // Mark as V2 calculation
      };

      const response = await fetch('/api/nutrition-calculations-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calculationData),
      });

      if (response.ok) {
        setSaveSuccess(true);
        // Redirect to overview page after successful save
        setTimeout(() => {
          router.push('/admin/nutrition-calculations');
        }, 1500);
      } else {
        const error = await response.json();
        const errorMessage = error.details ? `${error.error}: ${error.details}` : error.error || 'Eroare necunoscută';
        console.error('Save error:', error);
        alert(`Eroare la salvare: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KCAL Calculator V2</h1>
              <p className="text-gray-600 text-sm">Calculează pas cu pas caloriile corecte pentru clienți</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informații Client</h2>
            
            <div className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Selectați Client
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">-- Selectați un client --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Scale className="w-4 h-4 inline mr-1" />
                  Greutate (KG)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Ex. 70"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Vârstă
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Ex. 35"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genul
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, gender: 'male' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.gender === 'male'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Bărbat (Fără ajustare)
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, gender: 'female' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.gender === 'female'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Femeie (-10% din MB)
                  </button>
                </div>
              </div>

              {/* Body Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipul Somatic
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, bodyType: 'ectomorf' })}
                    className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                      formData.bodyType === 'ectomorf'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Ectomorf (+5%)
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, bodyType: 'mezomorf' })}
                    className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                      formData.bodyType === 'mezomorf'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Mezomorf (Ø)
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, bodyType: 'endomorf' })}
                    className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                      formData.bodyType === 'endomorf'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Endomorf (-5%)
                  </button>
                </div>
              </div>

              {/* Objective */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Obiectiv
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    onClick={() => setFormData({ ...formData, objective: 'crestere' })}
                    className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                      formData.objective === 'crestere'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Creștere
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, objective: 'mentinere' })}
                    className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                      formData.objective === 'mentinere'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Menținere
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, objective: 'scadere' })}
                    className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                      formData.objective === 'scadere'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 inline mr-1" />
                    Scădere
                  </button>
                </div>
                {(formData.objective === 'crestere' || formData.objective === 'scadere') && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Procent ({formData.objective === 'crestere' ? '10-20%' : '10-20%'}):
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="20"
                      value={formData.objectivePercentage}
                      onChange={(e) => setFormData({ ...formData, objectivePercentage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Daily Activity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity className="w-4 h-4 inline mr-1" />
                  Activitate Zilnică
                </label>
                <div className="mb-2">
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={formData.dailyActivity}
                    onChange={(e) => setFormData({ ...formData, dailyActivity: e.target.value })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10%</span>
                    <span className="font-semibold">{formData.dailyActivity}%</span>
                    <span>30%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">+{formData.dailyActivity}% din MB</p>
              </div>

              {/* Training */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Dumbbell className="w-4 h-4 inline mr-1" />
                  Antrenament
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Ore pe săptămână (hours per week):</label>
                    <input
                      type="number"
                      value={formData.trainingHours}
                      onChange={(e) => setFormData({ ...formData, trainingHours: e.target.value })}
                      placeholder="Ex. 5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Notă: Training caloriile sunt adăugate direct (ore/săptămână)</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Intensitate (cal/Kg/h):</label>
                    <input
                      type="number"
                      min="4"
                      max="7"
                      step="0.5"
                      value={formData.trainingIntensity}
                      onChange={(e) => setFormData({ ...formData, trainingIntensity: e.target.value })}
                      placeholder="4-7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  +{formData.trainingIntensity} cal/Kg corp/oră antrenament
                </p>
              </div>

              {/* Macro Factors */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Target className="w-4 h-4 inline mr-1" />
                  Factori Macronutrienți (g/Kg)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Show protein factor based on selected gender */}
                  {formData.gender === 'male' ? (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Proteine - Bărbați:</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="3"
                        value={formData.proteinMale}
                        onChange={(e) => setFormData({ ...formData, proteinMale: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">g/Kg</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Proteine - Femei:</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="3"
                        value={formData.proteinFemale}
                        onChange={(e) => setFormData({ ...formData, proteinFemale: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">g/Kg</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Grăsimi:</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="2"
                      value={formData.fatPerKg}
                      onChange={(e) => setFormData({ ...formData, fatPerKg: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">g/Kg</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Carbohidrați (minim):</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={formData.carbsMin}
                      onChange={(e) => setFormData({ ...formData, carbsMin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">g/Kg (minim)</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => calculate(false)}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Calculează
                </button>
                <button
                  onClick={reset}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Resetează
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {showResults && result && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Rezultate Calcul</h2>
              
              <div className="space-y-4">
                {/* Step 1: MB */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-blue-900">Pasul 1: Metabolism Bazal (MB)</span>
                    <span className="text-2xl font-bold text-blue-700">{result.step1_mb} kcal</span>
                  </div>
                  <p className="text-sm text-blue-700 font-mono">
                    {formData.weight} KG × 24 = {parseFloat(formData.weight) * 24} kcal
                  </p>
                </div>

                {/* Step 2: Gender */}
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-purple-900">
                      Pasul 2: Genul ({formData.gender === 'male' ? 'Bărbat' : 'Femeie'})
                    </span>
                    <span className="text-2xl font-bold text-purple-700">{result.step2_gender} kcal</span>
                  </div>
                  <p className="text-sm text-purple-700 font-mono">
                    {formData.gender === 'female' 
                      ? `${result.step1_mb} × 0.9 = ${Math.round(result.step1_mb * 0.9)} kcal (-10% din MB)`
                      : 'Fără ajustare (bărbat) = ' + result.step2_gender + ' kcal'}
                  </p>
                </div>

                {/* Step 3: Age */}
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-green-900">Pasul 3: Vârstă</span>
                    <span className="text-2xl font-bold text-green-700">{result.step3_age} kcal</span>
                  </div>
                  <p className="text-sm text-green-700 font-mono">
                    {parseInt(formData.age) > 40 
                      ? (() => {
                          const decades = Math.max(0, Math.floor((parseInt(formData.age) - 40) / 10));
                          const ageAdjustment = Math.round(result.step1_mb * -0.10 * decades);
                          return `${result.step2_gender} + (${result.step1_mb} × -10% × ${decades} decenii) = ${result.step2_gender} + ${ageAdjustment} = ${result.step3_age} kcal`;
                        })()
                      : `${result.step2_gender} + 0 = ${result.step3_age} kcal (Fără ajustare < 40 ani)`}
                  </p>
                </div>

                {/* Step 4: Body Type */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-yellow-900">
                      Pasul 4: Tipul Somatic ({formData.bodyType})
                    </span>
                    <span className="text-2xl font-bold text-yellow-700">{result.step4_bodyType} kcal</span>
                  </div>
                  <p className="text-sm text-yellow-700 font-mono">
                    {formData.bodyType === 'ectomorf' 
                      ? `${result.step3_age} + (${result.step1_mb} × +5%) = ${result.step3_age} + ${Math.round(result.step1_mb * 0.05)} = ${result.step4_bodyType} kcal`
                      : formData.bodyType === 'endomorf'
                      ? `${result.step3_age} + (${result.step1_mb} × -5%) = ${result.step3_age} + ${Math.round(result.step1_mb * -0.05)} = ${result.step4_bodyType} kcal`
                      : `${result.step3_age} + 0 = ${result.step4_bodyType} kcal (Mezomorf - Fără ajustare)`}
                  </p>
                </div>

                {/* Step 5: Objective */}
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-indigo-900">
                      Pasul 5: Obiectiv ({formData.objective === 'crestere' ? 'Creștere' : formData.objective === 'scadere' ? 'Scădere' : 'Menținere'})
                    </span>
                    <span className="text-2xl font-bold text-indigo-700">{result.step5_objective} kcal</span>
                  </div>
                  <p className="text-sm text-indigo-700 font-mono">
                    {formData.objective === 'mentinere' 
                      ? `${result.step4_bodyType} + 0 = ${result.step5_objective} kcal (Fără ajustare)`
                      : `${result.step4_bodyType} + (${result.step1_mb} × ${formData.objective === 'crestere' ? '+' : '-'}${formData.objectivePercentage}%) = ${result.step4_bodyType} + ${Math.round(result.step1_mb * (parseFloat(formData.objectivePercentage) / 100) * (formData.objective === 'crestere' ? 1 : -1))} = ${result.step5_objective} kcal`}
                  </p>
                </div>

                {/* Step 6: Daily Activity */}
                <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-teal-900">Pasul 6: Activitate Zilnică</span>
                    <span className="text-2xl font-bold text-teal-700">{result.step6_dailyActivity} kcal</span>
                  </div>
                  <p className="text-sm text-teal-700 font-mono">
                    {result.step5_objective} + ({result.step1_mb} × +{formData.dailyActivity}%) = {result.step5_objective} + {Math.round(result.step1_mb * (parseFloat(formData.dailyActivity) / 100))} = {result.step6_dailyActivity} kcal
                  </p>
                </div>

                {/* Step 7: Training */}
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-orange-900">Pasul 7: Antrenament</span>
                    <span className="text-2xl font-bold text-orange-700">{result.step7_training} kcal</span>
                  </div>
                  <p className="text-sm text-orange-700 font-mono">
                    {(() => {
                      const weight = parseFloat(formData.weight);
                      const hours = parseFloat(formData.trainingHours) || 0;
                      const intensity = parseFloat(formData.trainingIntensity);
                      const trainingCalories = weight * hours * intensity;
                      const trainingCaloriesRounded = Math.round(trainingCalories);
                      return `${result.step6_dailyActivity} + (${weight} kg × ${hours} ore/săptămână × ${intensity} cal/Kg/h) = ${result.step6_dailyActivity} + ${trainingCaloriesRounded} = ${result.step7_training} kcal`;
                    })()}
                  </p>
                </div>

                {/* Final Result */}
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6 rounded-lg shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">KCAL TOTALE ZILNICE</span>
                    <span className="text-4xl font-bold">{result.finalCalories} kcal</span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={!selectedCustomerId || saving}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedCustomerId && !saving
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Salvare...' : saveSuccess ? 'Salvat cu succes!' : 'Salvează Calculația'}
                  </button>
                  {!selectedCustomerId && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Selectați un client pentru a salva calculația
                    </p>
                  )}
                </div>

                {/* Macronutrients */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Macronutrienți</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="text-sm text-red-700 mb-1">Proteine</div>
                      <div className="text-2xl font-bold text-red-900">{result.protein} g</div>
                      <div className="text-xs text-red-600 mt-1">
                        {formData.gender === 'male' ? `${formData.proteinMale} g/Kg` : `${formData.proteinFemale} g/Kg`}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="text-sm text-yellow-700 mb-1">Grăsimi</div>
                      <div className="text-2xl font-bold text-yellow-900">{result.fat} g</div>
                      <div className="text-xs text-yellow-600 mt-1">{formData.fatPerKg} g/Kg</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-sm text-green-700 mb-1">Carbohidrați</div>
                      <div className="text-2xl font-bold text-green-900">{result.carbs} g</div>
                      <div className="text-xs text-green-600 mt-1">Min {formData.carbsMin} g/Kg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showResults && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">
                <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Completați câmpurile pentru a vedea rezultatele</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KcalCalculatorV2Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calculator className="w-12 h-12 animate-pulse text-rose-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading calculator...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <KcalCalculatorV2Content />
    </Suspense>
  );
}


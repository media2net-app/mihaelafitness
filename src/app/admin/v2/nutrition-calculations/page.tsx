'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Plus, Trash2, Search, Calendar, User, FileText } from 'lucide-react';

interface NutritionCalculation {
  id: string;
  customerId: string;
  customerName: string;
  weight: number;
  age: number;
  gender: string;
  bodyType: string;
  objective: string;
  finalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

export default function NutritionCalculationsPage() {
  const router = useRouter();
  const [calculations, setCalculations] = useState<NutritionCalculation[]>([]);
  const [filteredCalculations, setFilteredCalculations] = useState<NutritionCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadCalculations();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCalculations(calculations);
    } else {
      const filtered = calculations.filter(calc =>
        calc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCalculations(filtered);
    }
  }, [searchTerm, calculations]);

  const loadCalculations = async () => {
    try {
      const response = await fetch('/api/nutrition-calculations-v2');
      if (response.ok) {
        const data = await response.json();
        setCalculations(data);
        setFilteredCalculations(data);
      }
    } catch (error) {
      console.error('Error loading calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this calculation?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/nutrition-calculations-v2?id=${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setCalculations(prev => prev.filter(calc => calc.id !== id));
        setFilteredCalculations(prev => prev.filter(calc => calc.id !== id));
      } else {
        alert('Failed to delete calculation');
      }
    } catch (error) {
      console.error('Error deleting calculation:', error);
      alert('Error deleting calculation');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreatePlan = (calculation: NutritionCalculation) => {
    // Navigate to create nutrition plan with calculation data in query params
    router.push(`/admin/v2/nutrition-plans/new?calculationId=${calculation.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500" />
              Nutrition Calculations
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredCalculations.length} {filteredCalculations.length === 1 ? 'calculation' : 'calculations'}
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/v2/kcal-calculator-v2')}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Calculation
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by customer name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Calculations Grid */}
      {filteredCalculations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No calculations found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Create your first nutrition calculation to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => router.push('/admin/v2/kcal-calculator-v2')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Calculation
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCalculations.map((calculation) => (
            <div
              key={calculation.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <User className="w-5 h-5 text-rose-500" />
                    {calculation.customerName}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(calculation.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(calculation.id)}
                  disabled={deletingId === calculation.id}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Calculation Details */}
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Weight:</span>
                    <span className="ml-2 font-medium text-gray-900">{calculation.weight} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 font-medium text-gray-900">{calculation.age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">{calculation.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Objective:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">{calculation.objective}</span>
                  </div>
                </div>
              </div>

              {/* Macros Summary */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <div className="text-sm font-semibold text-orange-600">{calculation.finalCalories}</div>
                  <div className="text-xs text-gray-500">kcal</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-sm font-semibold text-blue-600">{calculation.protein}g</div>
                  <div className="text-xs text-gray-500">protein</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-sm font-semibold text-green-600">{calculation.carbs}g</div>
                  <div className="text-xs text-gray-500">carbs</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="text-sm font-semibold text-purple-600">{calculation.fat}g</div>
                  <div className="text-xs text-gray-500">fat</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/v2/kcal-calculator-v2?calculationId=${calculation.id}`)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleCreatePlan(calculation)}
                  className="flex-1 px-3 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Create Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}







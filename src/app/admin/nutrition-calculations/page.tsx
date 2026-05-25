'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Plus, Trash2, Search, Calendar, User, FileText } from 'lucide-react';
import AdminPageContent from '@/components/admin/AdminPageContent';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import {
  adminCardStyle,
  adminGhostBtnClassName,
  adminInputClassName,
  adminInnerCardStyle,
  adminPrimaryBtnClassName,
} from '@/lib/adminStyles';

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
      const filtered = calculations.filter(
        (calc) =>
          calc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          calc.customerId.toLowerCase().includes(searchTerm.toLowerCase()),
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
        method: 'DELETE',
      });
      if (response.ok) {
        setCalculations((prev) => prev.filter((calc) => calc.id !== id));
        setFilteredCalculations((prev) => prev.filter((calc) => calc.id !== id));
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
    router.push(`/admin/voedingsplannen/new?calculationId=${calculation.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminPageContent>
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#F36088]" />
        </div>
      </AdminPageContent>
    );
  }

  return (
    <AdminPageContent>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminStatsCard
          title="Calculations"
          value={filteredCalculations.length}
          icon={Calculator}
        />
        <button
          type="button"
          onClick={() => router.push('/admin/kcal-calculator-v2')}
          className={adminPrimaryBtnClassName}
        >
          <Plus className="h-5 w-5" />
          New Calculation
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Search by customer name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${adminInputClassName} pl-10`}
        />
      </div>

      {filteredCalculations.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={adminCardStyle}>
          <Calculator className="mx-auto mb-4 h-16 w-16 text-white/30" />
          <h3 className="mb-2 text-lg font-semibold text-white">No calculations found</h3>
          <p className="mb-4 text-white/55">
            {searchTerm ? 'Try adjusting your search' : 'Create your first nutrition calculation to get started'}
          </p>
          {!searchTerm && (
            <button
              type="button"
              onClick={() => router.push('/admin/kcal-calculator-v2')}
              className={adminPrimaryBtnClassName}
            >
              <Plus className="h-5 w-5" />
              New Calculation
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCalculations.map((calculation) => (
            <div key={calculation.id} className="rounded-xl p-4 sm:p-6" style={adminCardStyle}>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-white">
                    <User className="h-5 w-5 text-[#F36088]" />
                    {calculation.customerName}
                  </h3>
                  <p className="flex items-center gap-1 text-sm text-white/55">
                    <Calendar className="h-4 w-4" />
                    {formatDate(calculation.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(calculation.id)}
                  disabled={deletingId === calculation.id}
                  className="rounded-lg p-2 text-red-300 transition-colors hover:bg-red-500/15 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-white/55">Weight:</span>
                    <span className="ml-2 font-medium text-white">{calculation.weight} kg</span>
                  </div>
                  <div>
                    <span className="text-white/55">Age:</span>
                    <span className="ml-2 font-medium text-white">{calculation.age} years</span>
                  </div>
                  <div>
                    <span className="text-white/55">Gender:</span>
                    <span className="ml-2 font-medium capitalize text-white">{calculation.gender}</span>
                  </div>
                  <div>
                    <span className="text-white/55">Objective:</span>
                    <span className="ml-2 font-medium capitalize text-white">{calculation.objective}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-4 gap-2">
                {[
                  { label: 'kcal', value: calculation.finalCalories },
                  { label: 'protein', value: `${calculation.protein}g` },
                  { label: 'carbs', value: `${calculation.carbs}g` },
                  { label: 'fat', value: `${calculation.fat}g` },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg p-2 text-center" style={adminInnerCardStyle}>
                    <div className="text-sm font-semibold text-white">{m.value}</div>
                    <div className="text-xs text-white/55">{m.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/kcal-calculator-v2?calculationId=${calculation.id}`)}
                  className={`${adminGhostBtnClassName} flex-1 text-sm`}
                >
                  <Calculator className="h-4 w-4" />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => handleCreatePlan(calculation)}
                  className={`${adminPrimaryBtnClassName} flex-1 text-sm`}
                >
                  <FileText className="h-4 w-4" />
                  Create Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageContent>
  );
}

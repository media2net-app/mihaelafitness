'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChefHat, 
  ArrowLeft, 
  Edit, 
  Save, 
  Trash2, 
  Copy, 
  Download,
  Users,
  Calendar,
  Target,
  Apple,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Plus,
  X
} from 'lucide-react';

export default function NutritionPlanDetailClient() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (planId) {
      loadNutritionPlan();
    }
  }, [planId]);

  const loadNutritionPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/nutrition-plans/${planId}`);
      if (response.ok) {
        const data = await response.json();
        setPlan(data);
      } else {
        setError(`Failed to load nutrition plan: ${response.statusText}`);
      }
    } catch (error) {
      setError('Error loading nutrition plan. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal?.toLowerCase()) {
      case 'weight-loss': return 'bg-red-100 text-red-800 border-red-200';
      case 'weight-gain': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading nutrition plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin/v2/nutrition-plans')}
            className="inline-block bg-red-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No Plan Found</h1>
          <p className="text-gray-600 mb-6">The nutrition plan you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/v2/nutrition-plans')}
            className="inline-block bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/v2/nutrition-plans')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{plan.name}</h1>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getGoalColor(plan.goal)}`}>
                {plan.goal === 'weight-loss' ? 'Weight Loss' : 
                 plan.goal === 'weight-gain' ? 'Weight Gain' : 
                 plan.goal === 'maintenance' ? 'Maintenance' : 
                 plan.goal}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  {editing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={() => router.push('/admin/v2/nutrition-plans')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Nutrition Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nutritional Information</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{plan.calories || '--'}</div>
                  <div className="text-sm text-gray-500">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{plan.protein || '--'}g</div>
                  <div className="text-sm text-gray-500">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{plan.carbs || '--'}g</div>
                  <div className="text-sm text-gray-500">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{plan.fat || '--'}g</div>
                  <div className="text-sm text-gray-500">Fat</div>
                </div>
              </div>
            </div>

            {/* Week Menu */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Menu</h2>
              {plan.weekMenu ? (
                <div className="space-y-4">
                  {Object.entries(plan.weekMenu).map(([day, meals]: [string, any]) => (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 capitalize mb-3">{day}</h3>
                      <div className="space-y-2">
                        {Object.entries(meals).map(([mealType, mealData]: [string, any]) => (
                          <div key={mealType} className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {mealType.replace('-', ' ')}
                            </span>
                            <div className="text-sm text-gray-900 max-w-xs text-right">
                              {typeof mealData === 'string' ? mealData : mealData?.ingredients || 'No meal planned'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No weekly menu available</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Plan Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Meals per day</span>
                  <span className="text-sm font-medium text-gray-900">{plan.meals || '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Clients assigned</span>
                  <span className="text-sm font-medium text-gray-900">{plan.clients || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <Users className="w-4 h-4" />
                  Assign to Client
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}














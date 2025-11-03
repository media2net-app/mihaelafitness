'use client';

import { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Download,
  Users,
  Calendar,
  Target,
  Apple,
  Clock,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Nutrition Plan Card Component
function NutritionPlanCard({ plan, onEdit, onDelete, onView, onCopy }: {
  plan: any;
  onEdit: (plan: any) => void;
  onDelete: (plan: any) => void;
  onView: (plan: any) => void;
  onCopy: (plan: any) => void;
}) {
  const getGoalColor = (goal: string) => {
    switch (goal?.toLowerCase()) {
      case 'weight-loss': return 'bg-red-100 text-red-800 border-red-200';
      case 'weight-gain': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
            <p className="text-sm text-gray-500">{plan.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGoalColor(plan.goal)}`}>
            {plan.goal === 'weight-loss' ? 'Weight Loss' : 
             plan.goal === 'weight-gain' ? 'Weight Gain' : 
             plan.goal === 'maintenance' ? 'Maintenance' : 
             plan.goal}
          </span>
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onView(plan)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button onClick={() => onEdit(plan)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => onCopy(plan)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button onClick={() => onDelete(plan)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{plan.calories || '--'}</div>
          <div className="text-xs text-gray-500">Calories</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{plan.protein || '--'}g</div>
          <div className="text-xs text-gray-500">Protein</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{plan.carbs || '--'}g</div>
          <div className="text-xs text-gray-500">Carbs</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{plan.fat || '--'}g</div>
          <div className="text-xs text-gray-500">Fat</div>
        </div>
      </div>

      {/* Plan Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{plan.clientCount || 0} clients</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{plan.duration || '--'} days</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Created {new Date(plan.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// Quick Stats Component
function QuickStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-orange-500 rounded-lg">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.totalPlans}</div>
            <div className="text-sm text-gray-500">Total Plans</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">+{stats.newThisMonth} this month</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.activeClients}</div>
            <div className="text-sm text-gray-500">Active Clients</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">{stats.completionRate}% completion rate</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.weightLoss}</div>
            <div className="text-sm text-gray-500">Weight Loss</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">kg lost this month</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.muscleGain}</div>
            <div className="text-sm text-gray-500">Muscle Gain</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">kg gained this month</div>
      </div>
    </div>
  );
}

export default function NutritionPlansV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadNutritionPlans();
  }, []);

  const loadNutritionPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real nutrition plans from API
      const response = await fetch('/api/nutrition-plans');
      if (response.ok) {
        const data = await response.json();
        
        // Transform API data to match component expectations
        const transformedPlans = data.map((plan: any) => ({
          id: plan.id,
          name: plan.name || 'Unnamed Plan',
          description: plan.description || 'No description available',
          goal: plan.goal || 'Maintenance',
          calories: plan.calories || 0,
          protein: plan.protein || 0,
          carbs: plan.carbs || 0,
          fat: plan.fat || 0,
          clientCount: plan.customerNutritionPlans?.length || 0,
          duration: 30, // Default duration
          createdAt: plan.createdAt,
          status: plan.status || 'active',
          meals: plan.meals || 0,
          lastUsed: plan.lastUsed
        }));
        
        setPlans(transformedPlans);
      } else {
        const errorText = await response.text();
        setError(`Failed to load nutrition plans: ${response.statusText}`);
        console.error('Failed to fetch nutrition plans:', response.statusText, errorText);
        setPlans([]);
      }
    } catch (error) {
      setError('Error loading nutrition plans. Please check your connection and try again.');
      console.error('Error loading nutrition plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGoal = filterGoal === 'all' || plan.goal.toLowerCase() === filterGoal.toLowerCase();
    return matchesSearch && matchesGoal;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name': return a.name.localeCompare(b.name);
      case 'clients': return b.clientCount - a.clientCount;
      default: return 0;
    }
  });

  const stats = {
    totalPlans: plans.length,
    newThisMonth: 3,
    activeClients: 25,
    completionRate: 87,
    weightLoss: 12.5,
    muscleGain: 8.2
  };

  const handleEditPlan = (plan: any) => {
    router.push(`/admin/v2/nutrition-plans/${plan.id}`);
  };

  const handleDeletePlan = async (plan: any) => {
    try {
      if (confirm(`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`)) {
        const response = await fetch(`/api/nutrition-plans?id=${plan.id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Remove plan from local state
          setPlans(prev => prev.filter(p => p.id !== plan.id));
          console.log('Nutrition plan deleted successfully');
        } else {
          console.error('Failed to delete nutrition plan:', response.statusText);
          alert('Failed to delete nutrition plan. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error deleting nutrition plan:', error);
      alert('Error deleting nutrition plan. Please try again.');
    }
  };

  const handleViewPlan = (plan: any) => {
    router.push(`/admin/v2/nutrition-plans/${plan.id}`);
  };

  const handleCopyPlan = async (plan: any) => {
    try {
      // Create a copy of the plan with a new name
      const copyData = {
        name: `${plan.name} (Copy)`,
        description: plan.description,
        goal: plan.goal,
        calories: plan.calories,
        protein: plan.protein,
        carbs: plan.carbs,
        fat: plan.fat,
        meals: plan.meals,
        status: 'active'
      };
      
      const response = await fetch('/api/nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(copyData)
      });
      
      if (response.ok) {
        const newPlan = await response.json();
        // Add the new plan to local state
        setPlans(prev => [newPlan, ...prev]);
        console.log('Nutrition plan copied successfully');
      } else {
        console.error('Failed to copy nutrition plan:', response.statusText);
        alert('Failed to copy nutrition plan. Please try again.');
      }
    } catch (error) {
      console.error('Error copying nutrition plan:', error);
      alert('Error copying nutrition plan. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading nutrition plans...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Nutrition Plans</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadNutritionPlans()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-2xl sm:text-3xl font-bold text-gray-900">Nutrition Plans</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage personalized meal plans for your clients</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => loadNutritionPlans()}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                disabled={loading}
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`}>
                  {loading ? (
                    <div className="w-full h-full border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                  ) : (
                    <ChefHat className="w-full h-full text-gray-600" />
                  )}
                </div>
                <span className="text-gray-700 hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <span className="text-gray-700 hidden sm:inline">Export</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors text-sm">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">New Plan</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats stats={stats} />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search nutrition plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <select
              value={filterGoal}
              onChange={(e) => setFilterGoal(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Goals</option>
              <option value="weight loss">Weight Loss</option>
              <option value="muscle gain">Muscle Gain</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="clients">Most Clients</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPlans.map(plan => (
              <NutritionPlanCard
                key={plan.id}
                plan={plan}
                onEdit={handleEditPlan}
                onDelete={handleDeletePlan}
                onView={handleViewPlan}
                onCopy={handleCopyPlan}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No nutrition plans found</h3>
            <p className="text-gray-500 mb-6">Create your first nutrition plan to get started</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors mx-auto">
              <Plus className="w-5 h-5" />
              <span>Create New Plan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

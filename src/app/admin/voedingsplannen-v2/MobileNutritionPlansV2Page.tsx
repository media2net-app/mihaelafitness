'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Apple, Users, Calendar, Target, UserPlus, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { nutritionService } from '@/lib/database';

export default function MobileNutritionPlansV2Page() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);

  const goals = [
    { id: 'all', name: 'All Goals', count: 1 },
    { id: 'weight-loss', name: 'Weight Loss', count: 1 },
    { id: 'muscle-gain', name: 'Muscle Gain', count: 0 },
    { id: 'maintenance', name: 'Maintenance', count: 0 },
    { id: 'performance', name: 'Performance', count: 0 }
  ];

  const [voedingsplannen, setVoedingsplannen] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // New plan form state
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    goal: 'weight-loss',
    description: '',
    meals: 3,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [creatingPlan, setCreatingPlan] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load nutrition plans without weekMenu for better performance
        const plans = await nutritionService.getAllNutritionPlans(false);
        setVoedingsplannen(plans);
        
        // Load customers
        const customersResponse = await fetch('/api/users');
        const customersData = await customersResponse.json();
        // Handle the new API response structure with users array and pagination
        if (customersData.users && Array.isArray(customersData.users)) {
          setCustomers(customersData.users);
        } else if (Array.isArray(customersData)) {
          // Fallback for old API structure
          setCustomers(customersData);
        } else {
          console.warn('Expected /api/users to return an object with users array. Got:', customersData);
          setCustomers([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setVoedingsplannen([]);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPlans = voedingsplannen.filter(plan => {
    const matchesGoal = selectedGoal === 'all' || plan.goal === selectedGoal;
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by customer name
    const matchesCustomer = selectedCustomer === 'all' || 
      (plan.customerNutritionPlans && plan.customerNutritionPlans.length > 0 && 
       plan.customerNutritionPlans.some(assignment => 
         assignment.customer.name.toLowerCase().includes(selectedCustomer.toLowerCase())
       ));
    
    return matchesGoal && matchesSearch && matchesCustomer;
  }).sort((a, b) => {
    // Sort by week number (Week 1, Week 2, Week 3, Week 4)
    const getWeekNumber = (name) => {
      const match = name.match(/week\s*(\d+)/i);
      return match ? parseInt(match[1]) : 999; // Put non-week plans at the end
    };
    return getWeekNumber(a.name) - getWeekNumber(b.name);
  });

  const handleViewPlan = (plan: any) => {
    router.push(`/admin/voedingsplannen-v2/${plan.id}`);
  };

  const handleDeletePlan = async (plan: any) => {
    if (window.confirm('Are you sure you want to delete this nutrition plan?')) {
      try {
        await nutritionService.deleteNutritionPlan(plan.id);
        setVoedingsplannen(voedingsplannen.filter(p => p.id !== plan.id));
      } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Error deleting plan');
      }
    }
  };

  const handleAssignPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedPlan || !selectedCustomerId) return;

    try {
      const response = await fetch('/api/customer-nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          nutritionPlanId: selectedPlan.id,
        }),
      });

      if (response.ok) {
        alert('Plan assigned successfully!');
        setShowAssignModal(false);
        setSelectedPlan(null);
        setSelectedCustomerId('');
        // Reload data to show updated assignments
        const plans = await nutritionService.getAllNutritionPlans(false);
        setVoedingsplannen(plans);
      } else {
        alert('Error assigning plan');
      }
    } catch (error) {
      console.error('Error assigning plan:', error);
      alert('Error assigning plan');
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlanForm.name.trim()) {
      alert('Please enter a plan name');
      return;
    }

    setCreatingPlan(true);
    try {
      const newPlan = await nutritionService.createNutritionPlan({
        name: newPlanForm.name,
        goal: newPlanForm.goal,
        description: newPlanForm.description,
        meals: newPlanForm.meals,
        calories: newPlanForm.calories,
        protein: newPlanForm.protein,
        carbs: newPlanForm.carbs,
        fat: newPlanForm.fat,
        weekMenu: {
          monday: { breakfast: '', 'morning-snack': '', lunch: '', 'afternoon-snack': '', dinner: '', 'evening-snack': '' },
          tuesday: { breakfast: '', 'morning-snack': '', lunch: '', 'afternoon-snack': '', dinner: '', 'evening-snack': '' },
          wednesday: { breakfast: '', 'morning-snack': '', lunch: '', 'afternoon-snack': '', dinner: '', 'evening-snack': '' },
          thursday: { breakfast: '', 'morning-snack': '', lunch: '', 'afternoon-snack': '', dinner: '', 'evening-snack': '' },
          friday: { breakfast: '', 'morning-snack': '', lunch: '', 'afternoon-snack': '', dinner: '', 'evening-snack': '' },
          saturday: { breakfast: '', 'morning-snack': '', lunch: '', 'afternoon-snack': '', dinner: '', 'evening-snack': '' },
          sunday: { breakfast: '', 'morning-snack': '', lunch: '', 'afternoon-snack': '', dinner: '', 'evening-snack': '' }
        }
      });

      setVoedingsplannen([newPlan, ...voedingsplannen]);
      setShowNewPlanModal(false);
      setNewPlanForm({
        name: '',
        goal: 'weight-loss',
        description: '',
        meals: 3,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
      
      // Navigate to the new plan
      router.push(`/admin/voedingsplannen-v2/${newPlan.id}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Error creating plan');
    } finally {
      setCreatingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading nutrition plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Nutrition Plans V2</h1>
        <p className="text-gray-600">Manage your nutrition programs and meal plans</p>
      </div>

      {/* New Plan Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowNewPlanModal(true)}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-rose-600 hover:to-pink-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Plan
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search nutrition plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <select
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name} ({goal.count})
                </option>
              ))}
            </select>
            
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="all">All Customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-4 sm:gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Apple className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{plan.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plan.goal === 'weight-loss' ? 'bg-red-100 text-red-700' :
                    plan.goal === 'muscle-gain' ? 'bg-blue-100 text-blue-700' :
                    plan.goal === 'maintenance' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {plan.goal.replace('-', ' ').toUpperCase()}
                  </span>
                  
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {plan.meals} meals
                  </span>
                </div>

                {/* Macro Overview */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-orange-600">{plan.calories}</div>
                    <div className="text-xs text-gray-500">kcal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-blue-600">{plan.protein}g</div>
                    <div className="text-xs text-gray-500">protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-green-600">{plan.carbs}g</div>
                    <div className="text-xs text-gray-500">carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-purple-600">{plan.fat}g</div>
                    <div className="text-xs text-gray-500">fat</div>
                  </div>
                </div>

                {/* Customer Assignments */}
                {plan.customerNutritionPlans && plan.customerNutritionPlans.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Assigned to: {plan.customerNutritionPlans.map(assignment => assignment.customer.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleViewPlan(plan)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">View V2</span>
                </button>
                
                <button
                  onClick={() => handleAssignPlan(plan)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Assign</span>
                </button>
                
                <button
                  onClick={() => handleDeletePlan(plan)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No plans found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* New Plan Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Plan</h2>
              <button
                onClick={() => setShowNewPlanModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={newPlanForm.name}
                  onChange={(e) => setNewPlanForm({...newPlanForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter plan name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                <select
                  value={newPlanForm.goal}
                  onChange={(e) => setNewPlanForm({...newPlanForm, goal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="performance">Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newPlanForm.description}
                  onChange={(e) => setNewPlanForm({...newPlanForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter plan description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                  <input
                    type="number"
                    value={newPlanForm.calories}
                    onChange={(e) => setNewPlanForm({...newPlanForm, calories: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meals</label>
                  <input
                    type="number"
                    value={newPlanForm.meals}
                    onChange={(e) => setNewPlanForm({...newPlanForm, meals: parseInt(e.target.value) || 3})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    min="1"
                    max="6"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewPlanModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={creatingPlan}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {creatingPlan ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Plan Modal */}
      {showAssignModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Assign Plan</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">Assigning: <strong>{selectedPlan.name}</strong></p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                disabled={!selectedCustomerId}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                Assign Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

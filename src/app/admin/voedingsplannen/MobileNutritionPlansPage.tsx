'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Apple, Users, Calendar, Target, UserPlus, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { nutritionService } from '@/lib/database';

export default function MobileNutritionPlansPage() {
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load nutrition plans
        const plans = await nutritionService.getAllNutritionPlans();
        setVoedingsplannen(plans);
        
        // Load customers
        const customersResponse = await fetch('/api/users');
        const customersData = await customersResponse.json();
        setCustomers(customersData);
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
    router.push(`/admin/voedingsplannen/${plan.id}`);
  };

  const handleDeletePlan = async (plan: any) => {
    if (window.confirm('Are you sure you want to delete this nutrition plan?')) {
      try {
        await nutritionService.deleteNutritionPlan(plan.id);
        setVoedingsplannen(voedingsplannen.filter(p => p.id !== plan.id));
      } catch (error) {
        console.error('Error deleting nutrition plan:', error);
        alert('Error deleting nutrition plan');
      }
    }
  };

  const handleAssignPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowAssignModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedPlan || !selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    try {
      const response = await fetch('/api/customer-nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          nutritionPlanId: selectedPlan.id,
          status: 'active'
        }),
      });

      if (response.ok) {
        alert('Nutrition plan assigned successfully!');
        setShowAssignModal(false);
        setSelectedPlan(null);
        setSelectedCustomerId('');
        
        // Reload nutrition plans to get updated assignments
        const plans = await nutritionService.getAllNutritionPlans();
        setVoedingsplannen(plans);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign nutrition plan');
      }
    } catch (error) {
      console.error('Error assigning nutrition plan:', error);
      alert('Failed to assign nutrition plan');
    }
  };

  const handleRemoveAssignment = async (plan: any, assignment: any) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        const response = await fetch(`/api/customer-nutrition-plans?id=${assignment.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Assignment removed successfully!');
          // Reload nutrition plans to get updated assignments
          const plans = await nutritionService.getAllNutritionPlans();
          setVoedingsplannen(plans);
        } else {
          alert('Failed to remove assignment');
        }
      } catch (error) {
        console.error('Error removing assignment:', error);
        alert('Failed to remove assignment');
      }
    }
  };

  const getGoalColor = (goal: string) => {
    const colors = {
      'weight-loss': 'bg-red-100 text-red-800',
      'muscle-gain': 'bg-green-100 text-green-800',
      'maintenance': 'bg-blue-100 text-blue-800',
      'performance': 'bg-purple-100 text-purple-800'
    };
    return colors[goal] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'draft': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading nutrition plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Nutrition Plans</h1>
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
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.name} ({goal.count})
                </option>
              ))}
            </select>
            
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="all">All Customers</option>
              {customers.map((customer: any) => (
                <option key={customer.id} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            
            <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nutrition Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No nutrition plans found</h3>
            <p className="text-gray-500">Create your first nutrition plan to get started</p>
          </div>
        ) : (
          filteredPlans.map((plan, index) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200"
            >
              {/* Plan Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{plan.description}</p>
                  
                  {/* Customer Assignments */}
                  {plan.customerNutritionPlans && plan.customerNutritionPlans.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {plan.customerNutritionPlans.map((assignment: any) => (
                          <div key={assignment.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            <Users className="w-3 h-3" />
                            <span>{assignment.customer.name}</span>
                            <button
                              onClick={() => handleRemoveAssignment(plan, assignment)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAssignPlan(plan)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    title="Assign to customer"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewPlan(plan)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Plan Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGoalColor(plan.goal)}`}>
                  {plan.goal}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </span>
              </div>

              {/* Plan Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{plan.calories || 'N/A'}</div>
                  <div className="text-xs text-gray-600">Calories</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{plan.protein || 'N/A'}</div>
                  <div className="text-xs text-gray-600">Protein</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{plan.carbs || 'N/A'}</div>
                  <div className="text-xs text-gray-600">Carbs</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{plan.fat || 'N/A'}</div>
                  <div className="text-xs text-gray-600">Fat</div>
                </div>
              </div>

              {/* Plan Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewPlan(plan)}
                  className="flex-1 bg-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-600 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Plan
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Plan Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Create New Nutrition Plan</h3>
            <p className="text-gray-600 mb-6">This feature is coming soon! For now, nutrition plans are managed through the database.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewPlanModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Plan Modal */}
      {showAssignModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Assign Nutrition Plan</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <p className="text-gray-800 font-medium">{selectedPlan.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Customer *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAssign}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Assign Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Plus, Eye, Edit, Trash2, Download, Phone, Calendar, Star, Dumbbell, X, Save, Calculator, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService, pricingService } from '@/lib/database';

export default function ResponsiveKlantenPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [klanten, setKlanten] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    goal?: string;
    joinDate: string;
    status: string;
    trainingFrequency?: number;
    lastWorkout?: string;
    totalSessions: number;
    scheduledSessions: number;
    completedSessions: number;
    rating?: number;
    subscriptionDuration?: number; // in weeks
    groupSubscriptions?: Array<{
      id: string;
      service: string;
      duration: number;
      frequency: number;
      finalPrice: number; // Price per person
      totalPrice: number; // Total price for group
      customerIds: string[];
      customerNames: string[];
      createdAt: string;
      groupSize: number;
    }>;
    personalSubscriptions?: Array<{
      id: string;
      service: string;
      duration: number;
      frequency: number;
      finalPrice: number;
      discount: number;
      customerId: string;
      customerName: string;
      createdAt: string;
      includeNutritionPlan: boolean;
      nutritionPlanCount: number;
    }>;
  }[]>([]);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [customerPricing, setCustomerPricing] = useState<{
    id: string;
    service: string;
    duration: number;
    frequency: number;
    discount: number;
    finalPrice: number;
    includeNutritionPlan: boolean;
    createdAt: string;
  }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    goal?: string;
    joinDate: string;
    status: string;
    trainingFrequency?: number;
    lastWorkout?: string;
    totalSessions: number;
    scheduledSessions: number;
    completedSessions: number;
    rating?: number;
  } | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    status: 'active',
    trainingFrequency: 3
  });

  // Search is now handled server-side, so we use klanten directly
  const filteredKlanten = klanten;

  useEffect(() => {
    const loadKlanten = async () => {
      try {
        setLoading(true);
        
        // Use optimized API endpoint with pagination
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20',
          ...(searchTerm && { search: searchTerm })
        });
        
        const response = await fetch(`/api/clients/overview?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setKlanten(data.clients);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
        } else {
          console.error('Failed to load clients:', data.error);
        }
      } catch (error) {
        console.error('Error loading klanten:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKlanten();
  }, [currentPage, searchTerm]);

  const handleViewCustomer = (klant: any) => {
    setSelectedCustomer(klant);
    setShowViewModal(true);
  };

  const handleEditCustomer = (klant: any) => {
    router.push(`/admin/klanten/${klant.id}`);
  };

  const handlePricingCustomer = async (klant: any) => {
    try {
      const response = await fetch(`/api/pricing-calculations?customerId=${klant.id}`);
      const pricing = await response.json();
      setCustomerPricing(pricing);
      setSelectedCustomer(klant);
      setShowPricingModal(true);
    } catch (error) {
      console.error('Error loading pricing:', error);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`/api/users/${customerId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setKlanten(klanten.filter(k => k.id !== customerId));
        } else {
          console.error('Error deleting customer');
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert('Please fill in name and email');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        const newCustomerData = await response.json();
        setKlanten([...klanten, {
          id: newCustomerData.id,
          name: newCustomerData.name,
          email: newCustomerData.email,
          phone: newCustomerData.phone,
          joinDate: newCustomerData.createdAt,
          status: newCustomerData.status,
          trainingFrequency: newCustomerData.trainingFrequency,
          totalSessions: 0,
          scheduledSessions: 0,
          rating: 0
        }]);
        setShowNewCustomerModal(false);
        setNewCustomer({
          name: '',
          email: '',
          phone: '',
          goal: '',
          status: 'active',
          trainingFrequency: 3
        });
      } else {
        const error = await response.json();
        const errorMessage = error.error || 'Failed to create customer';
        if (errorMessage.includes('email already exists')) {
          alert('A customer with this email address already exists. Please use a different email.');
        } else {
          alert(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      const errorMessage = error.message || 'Failed to create customer';
      if (errorMessage.includes('email already exists')) {
        alert('A customer with this email address already exists. Please use a different email.');
      } else {
        alert(errorMessage);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">{t.admin.customers.title}</h1>
            <p className="text-gray-600">{t.admin.customers.subtitle}</p>
          </div>
          <button
            onClick={() => setShowNewCustomerModal(true)}
            className="mt-4 md:mt-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            {t.admin.customers.newCustomer}
          </button>
        </div>
        
        {/* Search Bar - Compact under New Customer button */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t.admin.customers.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Admin Account Section */}
        {!loading && (
          <div className="mt-4 mb-6">
            <div 
              onClick={() => router.push('/admin/klanten/mihaela')}
              className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4 mb-4 cursor-pointer hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Mihaela (Admin)</h3>
                  <p className="text-sm text-gray-600">mihaela@mihaelafitness.com</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
                    Admin Account
                  </span>
                </div>
                <div className="text-pink-500">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total Customers Count */}
        {!loading && (
          <div className="mt-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-medium text-gray-700">
                  {searchTerm ? (
                    <>
                      {filteredKlanten.length} van {klanten.length} klanten
                    </>
                  ) : (
                    <>
                      Totaal {klanten.length} klanten
                    </>
                  )}
                </span>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div
        className="hidden lg:block bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Abonnement</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Sessions</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Rating</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredKlanten.map((klant, index) => (
                <tr
                  key={klant.id}
                  className={`transition-colors duration-200 ${
                    klant.name.includes('Own Training') 
                      ? 'bg-pink-50 hover:bg-pink-100' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {klant.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/klanten/${klant.id}`)}
                            className="text-sm font-medium text-gray-900 hover:text-rose-600 transition-colors cursor-pointer text-left"
                          >
                            {klant.name}
                          </button>
                          {klant.name.includes('Own Training') && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">Member since {new Date(klant.joinDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{klant.email}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {klant.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      klant.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : klant.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {klant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      klant.subscriptionDuration 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {klant.subscriptionDuration 
                        ? `${klant.subscriptionDuration} weken` 
                        : 'No abonnement'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div>{klant.scheduledSessions}/{klant.totalSessions} ingepland</div>
                      <div>{klant.completedSessions}/{klant.totalSessions} voltooid</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{klant.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewCustomer(klant)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        title={t.admin.customers.viewCustomer}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCustomer(klant)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                        title={t.admin.customers.editCustomer}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePricingCustomer(klant)}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                        title="Pricing"
                      >
                        <Calculator className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(klant.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        title={t.admin.customers.deleteCustomer}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredKlanten.map((klant, index) => (
          <div
            key={klant.id}
            className={`rounded-2xl shadow-lg border border-white/20 p-4 ${
              klant.name.includes('Own Training') 
                ? 'bg-pink-50' 
                : 'bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {klant.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{klant.name}</h3>
                    {klant.name.includes('Own Training') && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Member since {new Date(klant.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                klant.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : klant.status === 'inactive'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {klant.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-20 text-gray-500">Email:</span>
                <span className="text-gray-800">{klant.email}</span>
              </div>
              {klant.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-gray-800">{klant.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col text-gray-600">
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Sessions:</span>
                    <span className="text-gray-800">{klant.scheduledSessions}/{klant.totalSessions} ingepland</span>
                  </div>
                  <div className="flex items-center ml-20">
                    <span className="text-gray-800">{klant.completedSessions}/{klant.totalSessions} voltooid</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                  <span className="text-gray-800">{klant.rating}</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-20 text-gray-500">Abonnement:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  klant.subscriptionDuration 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {klant.subscriptionDuration 
                    ? `${klant.subscriptionDuration} weken` 
                    : 'No abonnement'
                  }
                </span>
              </div>
              {/* Group Subscriptions */}
              {klant.groupSubscriptions && klant.groupSubscriptions.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-20 text-gray-500">Group:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {klant.groupSubscriptions.length} group(s)
                  </span>
                </div>
              )}
              
              {/* Personal Subscriptions */}
              {klant.personalSubscriptions && klant.personalSubscriptions.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-20 text-gray-500">1:1:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {klant.personalSubscriptions.length} coaching
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push(`/admin/klanten/${klant.id}`)}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
              >
                View Details
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewCustomer(klant)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  title={t.admin.customers.viewCustomer}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditCustomer(klant)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                  title={t.admin.customers.editCustomer}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePricingCustomer(klant)}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                  title="Pricing"
                >
                  <Calculator className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(klant.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  title={t.admin.customers.deleteCustomer}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-800">{klanten.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-800">{klanten.filter(k => k.status === 'active').length}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-800">
                {(klanten.reduce((acc, k) => acc + (k.rating || 0), 0) / klanten.length).toFixed(1)}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-800">{klanten.reduce((acc, k) => acc + k.totalSessions, 0)}</p>
            </div>
            <Dumbbell className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add New Customer</h3>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
                <textarea
                  value={newCustomer.goal}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, goal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                  placeholder="Enter customer goals and notes..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Training Frequency</label>
                  <select
                    value={newCustomer.trainingFrequency}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, trainingFrequency: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value={1}>1x per week</option>
                    <option value={2}>2x per week</option>
                    <option value={3}>3x per week</option>
                    <option value={4}>4x per week</option>
                    <option value={5}>5x per week</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Customer Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-800">{selectedCustomer.name}</h4>
                  <p className="text-sm text-gray-500">Member since {new Date(selectedCustomer.joinDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-800">{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-800">{selectedCustomer.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <span className="w-20 text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedCustomer.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedCustomer.status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedCustomer.status}
                  </span>
                </div>
                <div className="flex flex-col text-sm">
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Sessions:</span>
                    <span className="text-gray-800">{selectedCustomer.scheduledSessions}/{selectedCustomer.totalSessions} ingepland</span>
                  </div>
                  <div className="flex items-center ml-20">
                    <span className="text-gray-800">{selectedCustomer.completedSessions}/{selectedCustomer.totalSessions} voltooid</span>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                  <span className="text-gray-800">{selectedCustomer.rating}</span>
                </div>
                {selectedCustomer.goal && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <Target className="w-4 h-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">Goal</p>
                        <p className="text-sm text-blue-700 whitespace-pre-wrap">{selectedCustomer.goal}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditCustomer(selectedCustomer);
                }}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Pricing History - {selectedCustomer.name}</h3>
              <button
                onClick={() => setShowPricingModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {customerPricing.length > 0 ? (
              <div className="space-y-4">
                {customerPricing.map((pricing, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{pricing.service}</h4>
                      <span className="text-lg font-bold text-rose-600">{pricing.finalPrice} RON</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>Duration: {pricing.duration} weeks</div>
                      <div>Frequency: {pricing.frequency}x per week</div>
                      <div>Discount: {pricing.discount}%</div>
                      <div>Nutrition Plan: {pricing.includeNutritionPlan ? 'Yes' : 'No'}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(pricing.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pricing history found for this customer.</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPricingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} customers
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

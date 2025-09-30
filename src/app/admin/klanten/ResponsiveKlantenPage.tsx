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
      finalPrice: number;
      customerIds: string[];
      customerNames: string[];
      createdAt: string;
      groupSize: number;
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

  const filteredKlanten = klanten.filter(klant => {
    const matchesSearch = klant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         klant.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    const loadKlanten = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        
        // Load training sessions for each customer to get accurate session counts
        const klantenWithStats = await Promise.all(data.map(async (user: any) => {
          try {
            // Get actual training sessions from database
            const sessionsResponse = await fetch(`/api/training-sessions?customerId=${user.id}`);
            const sessions = sessionsResponse.ok ? await sessionsResponse.json() : [];
            const actualSessions = sessions.length;
            
            // Count completed sessions
            const completedSessions = sessions.filter((session: any) => session.status === 'completed').length;
            
            // Get pricing data to determine subscription duration
            const pricingResponse = await fetch(`/api/pricing-calculations?customerId=${user.id}`);
            const pricingData = pricingResponse.ok ? await pricingResponse.json() : [];
            
            // Get the most recent pricing calculation to determine subscription duration
            let subscriptionDuration = null;
            if (pricingData.length > 0) {
              // Get the most recent pricing calculation
              const latestPricing = pricingData.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0];
              
              // Duration is already in weeks, no conversion needed
              subscriptionDuration = latestPricing.duration;
            }
            
            console.log(`Customer ${user.name}: ${actualSessions} actual sessions found, subscription: ${subscriptionDuration ? subscriptionDuration + ' weeks' : 'No subscription'}`);
            
            // Special handling for Leca - she has a 12-week plan with 3 sessions per week
            let totalSessions = 0;
            let scheduledSessions = actualSessions;
            
            if (user.name === 'Leca Georgiana') {
              // Leca has a 12-week plan: 3 sessions per week × 12 weeks = 36 sessions
              totalSessions = 36;
            } else {
              // For other customers, calculate based on join date and training frequency
              const joinDate = new Date(user.createdAt);
              const currentDate = new Date();
              const daysSinceJoin = Math.max(0, Math.floor((currentDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
              const weeksSinceJoin = daysSinceJoin / 7;
              
              // Calculate expected sessions: weeks * sessions per week
              const expectedSessions = Math.floor(weeksSinceJoin * (user.trainingFrequency || 3));
              
              // Use actual sessions if available, otherwise use expected
              totalSessions = actualSessions > 0 ? actualSessions : expectedSessions;
            }
            
            if (user.name === 'Leca Georgiana') {
              console.log(`Customer ${user.name}: Special 12-week plan - 36 total sessions (3 per week × 12 weeks), actual ${actualSessions} sessions`);
            } else {
              console.log(`Customer ${user.name}: ${daysSinceJoin} days since join, ${weeksSinceJoin.toFixed(1)} weeks, expected ${expectedSessions} sessions, actual ${actualSessions} sessions`);
            }
            
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              joinDate: user.createdAt,
              status: user.status || 'active',
              trainingFrequency: user.trainingFrequency || 3,
              totalSessions: totalSessions,
              scheduledSessions: scheduledSessions,
              completedSessions: completedSessions,
              rating: user.rating || 0,
              subscriptionDuration: subscriptionDuration // Duration is already in weeks
            };
          } catch (error) {
            console.error(`Error loading sessions for ${user.name}:`, error);
            // Fallback to basic calculation
            const joinDate = new Date(user.createdAt);
            const currentDate = new Date();
            const daysSinceJoin = Math.max(0, Math.floor((currentDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
            const weeksSinceJoin = daysSinceJoin / 7;
            const calculatedSessions = Math.floor(weeksSinceJoin * (user.trainingFrequency || 3));
            
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              joinDate: user.createdAt,
              status: user.status || 'active',
              trainingFrequency: user.trainingFrequency || 3,
              totalSessions: calculatedSessions,
              scheduledSessions: 0,
              completedSessions: 0,
              rating: user.rating || 0,
              subscriptionDuration: null
            };
          }
        }));
        
        setKlanten(klantenWithStats);
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    };

    loadKlanten();
  }, []);

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
        alert(error.error || 'Failed to create customer');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer');
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
    </div>
  );
}

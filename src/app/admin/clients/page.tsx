'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Plus, Eye, Edit, Trash2, Phone, Calendar, Star, Dumbbell, X, Save, Target, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService, pricingService } from '@/lib/database';

export default function ClientsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<{
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
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedClient, setSelectedClient] = useState<{
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
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    status: 'active',
    trainingFrequency: 3
  });

  const filteredClients = (Array.isArray(clients) ? clients : []).filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        // Use optimized API endpoint that gets all data in one request
        const response = await fetch('/api/clients/overview');
        const data = await response.json();

        if (response.ok) {
          const list = Array.isArray(data)
            ? data
            : (Array.isArray(data?.clients) ? data.clients : []);
          setClients(list);
        } else {
          console.error('Failed to load clients:', data.error);
        }
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  const handleCreateClient = async () => {
    try {
      const client = await userService.createUser(newClient);
      setClients([client, ...clients]);
      setShowNewClientModal(false);
      setNewClient({
        name: '',
        email: '',
        phone: '',
        goal: '',
        status: 'active',
        trainingFrequency: 3
      });
    } catch (error: any) {
      console.error('Error creating client:', error);
      // Show a more user-friendly error message
      const errorMessage = error.message || 'Failed to create client';
      if (errorMessage.includes('email already exists')) {
        alert('A client with this email address already exists. Please use a different email.');
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleDeleteClick = (client: {id: string, name: string}) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    try {
      await userService.deleteUser(clientToDelete.id);
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      setShowDeleteModal(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  const handleAcceptIntake = async (clientId: string) => {
    try {
      // Update the client status from 'Intake' to 'Active'
      const updatedClient = await userService.updateUser(clientId, {
        status: 'Active',
        plan: 'Basic' // Set a default plan
      });
      
      // Update the clients list
      setClients(clients.map(client => 
        client.id === clientId 
          ? { ...client, status: 'Active', plan: 'Basic' }
          : client
      ));
      
      console.log('Client accepted:', updatedClient);
    } catch (error) {
      console.error('Error accepting client:', error);
      alert('Failed to accept client. Please try again.');
    }
  };



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'intake': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Premium': return 'bg-purple-100 text-purple-800';
      case 'Standard': return 'bg-blue-100 text-blue-800';
      case 'Basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Clients</h1>
              <p className="text-gray-600">Manage your clients and their training progress</p>
            </div>
            <button
              onClick={() => setShowNewClientModal(true)}
              className="mt-4 md:mt-0 bg-rose-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              New Client
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Admin Account Section */}
        {!loading && (
          <div className="mb-6">
            <div 
              onClick={() => router.push('/admin/clients/mihaela')}
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

        {/* Total Clients Count */}
        {!loading && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-medium text-gray-700">
                  {searchTerm ? (
                    <>
                      {filteredClients.length} van {clients.length} clients
                    </>
                  ) : (
                    <>
                      Totaal {clients.length} clients
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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading clients...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
            <div
              key={client.id}
              className={`rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 ${
                client.status === 'Intake' 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{client.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{client.email}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Client"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick({id: client.id, name: client.name})}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </span>
                {client.status === 'Intake' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    ⏳ Pending Approval
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(client.plan || 'Basic')}`}>
                  {client.plan || 'Basic'}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {client.trainingFrequency}x/week
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  client.subscriptionDuration 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {client.subscriptionDuration 
                    ? `${client.subscriptionDuration} weken` 
                    : 'No abonnement'
                  }
                </span>
                {/* Group Subscriptions */}
                {client.groupSubscriptions && client.groupSubscriptions.length > 0 && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Group ({client.groupSubscriptions.length})
                  </span>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(client.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    <span>{client.scheduledSessions} / {client.totalSessions} ingepland</span>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <span>{client.completedSessions} / {client.totalSessions} voltooid</span>
                  </div>
                </div>
                {client.rating && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{client.rating}/5</span>
                  </div>
                )}
                {/* Group Subscription Details */}
                {client.groupSubscriptions && client.groupSubscriptions.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Group Training</span>
                    </div>
                    {client.groupSubscriptions.map((group, index) => (
                      <div key={group.id} className="text-xs text-green-700 mb-1">
                        <div className="font-medium">{group.service}</div>
                        <div>Duration: {group.duration} weeks • {group.frequency}x/week</div>
                        <div>Group size: {group.groupSize} people</div>
                        <div>Price: {group.finalPrice} RON per person</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Personal Subscription Details */}
                {client.personalSubscriptions && client.personalSubscriptions.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">1:1 Coaching</span>
                    </div>
                    {client.personalSubscriptions.map((personal, index) => (
                      <div key={personal.id} className="text-xs text-blue-700 mb-1">
                        <div className="font-medium">{personal.service}</div>
                        <div>Duration: {personal.duration} weeks • {personal.frequency}x/week</div>
                        <div>Price: {personal.finalPrice} RON</div>
                        {personal.discount > 0 && (
                          <div className="text-blue-600">Discount: {personal.discount}%</div>
                        )}
                        {personal.includeNutritionPlan && (
                          <div className="text-blue-600">+ Nutrition Plan ({personal.nutritionPlanCount}x)</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {client.status === 'Intake' ? (
                  <>
                    <button
                      onClick={() => handleAcceptIntake(client.id)}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
                    >
                      Accept Client
                    </button>
                    <button
                      onClick={() => router.push(`/admin/clients/${client.id}`)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      View
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                    className="flex-1 bg-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-600 transition-colors text-sm"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Clients Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'No clients match your search criteria' : 'Add your first client to get started'}
                </p>
                <button
                  onClick={() => setShowNewClientModal(true)}
                  className="bg-rose-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors duration-200"
                >
                  Add New Client
                </button>
              </div>
            )}
          </>
        )}

        {/* New Client Modal */}
        {showNewClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Add New Client</h2>
                <button
                  onClick={() => setShowNewClientModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter client name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
                  <textarea
                    value={newClient.goal}
                    onChange={(e) => setNewClient({...newClient, goal: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter client goals"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Training Frequency</label>
                  <select
                    value={newClient.trainingFrequency}
                    onChange={(e) => setNewClient({...newClient, trainingFrequency: parseInt(e.target.value)})}
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
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewClientModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClient}
                  className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Create Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Client Modal */}
        {showViewModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Client Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedClient.name}</h3>
                  <p className="text-gray-600">{selectedClient.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedClient.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                      {selectedClient.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Training Frequency</label>
                    <p className="text-gray-900">{selectedClient.trainingFrequency}x per week</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sessions</label>
                    <p className="text-gray-900">{selectedClient.scheduledSessions} / {selectedClient.totalSessions} ingepland</p>
                    <p className="text-gray-900">{selectedClient.completedSessions} / {selectedClient.totalSessions} voltooid</p>
                  </div>
                </div>
                
                {selectedClient.goal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Goals</label>
                    <p className="text-gray-900">{selectedClient.goal}</p>
                  </div>
                )}
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
                    router.push(`/admin/clients/${selectedClient.id}`);
                  }}
                  className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && clientToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Delete Client</h2>
                <button
                  onClick={handleDeleteCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Are you sure you want to delete this client?
                </h3>
                <p className="text-gray-600 mb-4">
                  You are about to delete <strong>{clientToDelete.name}</strong>. This action cannot be undone.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    <strong>Warning:</strong> This will permanently delete all client data including:
                  </p>
                  <ul className="text-red-700 text-sm mt-2 space-y-1">
                    <li>• Client profile and contact information</li>
                    <li>• Training sessions and workout history</li>
                    <li>• Measurements and progress photos</li>
                    <li>• Nutrition plans and meal tracking</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

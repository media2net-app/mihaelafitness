'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Plus, Eye, Edit, Trash2, Phone, Calendar, Star, Dumbbell, X, Save, Target, Mail } from 'lucide-react';
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

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        
        // Load training sessions and pricing data for each customer
        const clientsWithStats = await Promise.all(data.map(async (user: any) => {
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
            
            console.log(`Client ${user.name}: ${actualSessions} actual sessions found, subscription: ${subscriptionDuration ? subscriptionDuration + ' weeks' : 'No subscription'}`);
            
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
              totalSessions = Math.floor(weeksSinceJoin * (user.trainingFrequency || 3));
            }
            
            return {
              ...user,
              totalSessions,
              scheduledSessions: actualSessions,
              completedSessions,
              lastWorkout: user.lastWorkout || null,
              subscriptionDuration: subscriptionDuration // Duration is already in weeks
            };
          } catch (error) {
            console.error(`Error loading data for ${user.name}:`, error);
            return {
              ...user,
              totalSessions: 0,
              scheduledSessions: 0,
              completedSessions: 0,
              lastWorkout: null,
              subscriptionDuration: null
            };
          }
        }));
        
        setClients(clientsWithStats);
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
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client');
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



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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
              className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
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
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                  className="flex-1 bg-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-600 transition-colors text-sm"
                >
                  View Details
                </button>
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

'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, TrendingUp, Clock, CheckCircle, Dumbbell, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService } from '@/lib/database';
import { ClientCard, AdminBar } from '@/components/admin/clients/ClientComponents';

function StatsCard({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  gradient: string;
  trend?: string;
}) {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-[#F5D2E0] rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm">
      {/* Mobile: Horizontal layout */}
      <div className="flex sm:hidden items-center justify-between gap-3">
        <div className={`p-2 rounded-lg text-white ${gradient} flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-bold text-[#3C1E35]">{value}</div>
          <div className="text-xs text-[#8D5D7A] truncate">{title}</div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 flex-shrink-0">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      
      {/* Desktop: Vertical layout */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl text-white ${gradient}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-[#3C1E35] mb-1">{value}</div>
        <div className="text-sm text-[#8D5D7A]">{title}</div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const clientsText = t.admin.clientsPage;
  
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
    plan?: string;
    trainingFrequency?: number;
    lastWorkout?: string;
    totalSessions: number;
    scheduledSessions: number;
    completedSessions: number;
    missedSessions?: number;
    performanceScore?: number;
    performanceLevel?: 'excellent' | 'good' | 'fair' | 'poor';
    periodStats?: {
      expected: number;
      completed: number;
      scheduled: number;
      missed: number;
    };
    rating?: number;
    subscriptionDuration?: number; // in weeks
    photosCount?: number;
    measurementsCount?: number;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    status: 'active',
    trainingFrequency: 3
  });

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      const startTime = performance.now();
      
      try {
        // Use cached fetch for better performance
        const { cachedFetch } = await import('@/lib/cache');
        const data = await cachedFetch('/api/clients/overview', {}, 30000); // 30 second cache

        const duration = performance.now() - startTime;
        console.log(`📊 Clients loaded in ${Math.round(duration)}ms`);

        if (data) {
          const list = Array.isArray(data)
            ? data
            : (Array.isArray(data?.clients) ? data.clients : []);
          setClients(list);
        } else {
          console.error('Failed to load clients: No data');
        }
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  const handleCreateClient = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Prevent double submission
    if (isCreatingClient) {
      return;
    }
    
    // Validate required fields
    if (!newClient.name || !newClient.name.trim()) {
      alert('Vul alstublieft de naam van de klant in.');
      return;
    }
    
    if (!newClient.email || !newClient.email.trim()) {
      alert('Vul alstublieft het e-mailadres van de klant in.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClient.email.trim())) {
      alert('Vul alstublieft een geldig e-mailadres in.');
      return;
    }

    setIsCreatingClient(true);
    try {
      const client = await userService.createUser({
        name: newClient.name.trim(),
        email: newClient.email.trim(),
        phone: newClient.phone?.trim() || '',
        goal: newClient.goal?.trim() || '',
        status: newClient.status || 'active',
        trainingFrequency: newClient.trainingFrequency || 3
      });
      
      // Reload clients list to get full data (invalidate cache)
      const { cachedFetch, apiCache } = await import('@/lib/cache');
      apiCache.delete('/api/clients/overview'); // Clear cache
      
      const data = await cachedFetch('/api/clients/overview', {}, 30000);
      if (data) {
        const list = Array.isArray(data)
          ? data
          : (Array.isArray(data?.clients) ? data.clients : []);
        setClients(list);
      } else {
        // Fallback: add the new client to the list
        setClients([client, ...clients]);
      }
      
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
      if (errorMessage.includes('email already exists') || errorMessage.includes('already exists')) {
        alert('Een klant met dit e-mailadres bestaat al. Gebruik alstublieft een ander e-mailadres.');
      } else {
        alert(`Fout bij het aanmaken van de klant: ${errorMessage}`);
      }
    } finally {
      setIsCreatingClient(false);
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



  const adminEmailSet = new Set([
    'info@mihaelafitness.com',
    'mihaela@mihaelafitness.com',
    'chiel@media2net.nl'
  ]);

  const allClients = Array.isArray(clients) ? clients : [];
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const adminUsers = allClients.filter((client) =>
    adminEmailSet.has(client.email?.toLowerCase?.() ?? '')
  );

  const sortedAdminUsers = [...adminUsers].sort((a, b) => {
    const aIsMihaela = ['info@mihaelafitness.com', 'mihaela@mihaelafitness.com'].includes(
      a.email?.toLowerCase?.() ?? ''
    );
    const bIsMihaela = ['info@mihaelafitness.com', 'mihaela@mihaelafitness.com'].includes(
      b.email?.toLowerCase?.() ?? ''
    );

    if (aIsMihaela && !bIsMihaela) return -1;
    if (!aIsMihaela && bIsMihaela) return 1;
    return 0;
  });

  const regularClients = allClients.filter((client) =>
    !adminEmailSet.has(client.email?.toLowerCase?.() ?? '')
  );

  const filteredClients = regularClients.filter((client) => {
    if (!normalizedSearch) return true;
    return (
      client.name.toLowerCase().includes(normalizedSearch) ||
      client.email.toLowerCase().includes(normalizedSearch)
    );
  });

  const stats = {
    total: allClients.length,
    active: allClients.filter((c) => c.status?.toLowerCase?.() === 'active').length,
    intake: allClients.filter((c) => c.status?.toLowerCase?.() === 'intake').length,
    totalSessions: allClients.reduce((sum, c) => sum + (c.totalSessions || 0), 0)
  };

  const searchApplied = normalizedSearch.length > 0;
  const summaryText = searchApplied
    ? clientsText.summary.filtered
        .replace('{filtered}', String(filteredClients.length))
        .replace('{total}', String(regularClients.length))
    : clientsText.summary.total.replace('{count}', String(regularClients.length));

  return (
    <div className="min-h-screen bg-[#FDF7FB]">
      <div className="bg-white/70 backdrop-blur border-b border-[#F5D2E0]">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#3C1E35]">{clientsText.heading}</h1>
              <p className="text-sm text-[#8D5D7A] mt-1">
                {clientsText.subheading}
              </p>
            </div>
            <button
              onClick={() => setShowNewClientModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E11C48] to-[#F36B8D] px-4 sm:px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E11C48]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              {clientsText.actions.addClient}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard
              title={clientsText.stats.total}
              value={stats.total}
              icon={Users}
              gradient="bg-gradient-to-r from-[#E11C48] to-[#F36B8D]"
            />
            <StatsCard
              title={clientsText.stats.active}
              value={stats.active}
              icon={CheckCircle}
              gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            />
            <StatsCard
              title={clientsText.stats.intake}
              value={stats.intake}
              icon={Clock}
              gradient="bg-gradient-to-r from-amber-500 to-orange-500"
            />
            <StatsCard
              title={clientsText.stats.sessions}
              value={stats.totalSessions}
              icon={Dumbbell}
              gradient="bg-gradient-to-r from-purple-500 to-fuchsia-500"
            />
        </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C67697] w-5 h-5" />
            <input
              type="text"
                placeholder={clientsText.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[#F5D2E0] bg-white py-3 pl-11 pr-4 text-sm text-[#3C1E35] placeholder-[#C67697] shadow-sm focus:border-[#E11C48] focus:outline-none focus:ring-2 focus:ring-[#E11C48]/30"
            />
          </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#F5D2E0] bg-white px-4 py-2.5 text-sm font-medium text-[#8D5D7A] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Filter className="w-4 h-4 text-[#C67697]" />
              {clientsText.filter}
            </button>
          </div>
            </div>
          </div>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#E11C48]"></div>
              <p className="text-sm font-medium text-[#8D5D7A]">{clientsText.loading}</p>
            </div>
          </div>
        ) : (
          <>
            {sortedAdminUsers.length > 0 && (
              <div className="space-y-3 mb-8">
                {sortedAdminUsers.map((admin) => (
                  <AdminBar
                    key={admin.id}
                    client={admin}
                    onView={(id) => router.push(`/admin/clients/${id}`)}
                  />
                    ))}
                  </div>
                )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[#8D5D7A]">
                <Users className="w-4 h-4 text-[#E11C48]" />
                <span>{summaryText}</span>
              </div>
              {searchApplied && (
                    <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-sm font-medium text-[#E11C48] hover:text-[#B01638]"
                >
                  {clientsText.resetSearch}
                  </button>
                )}
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onView={(id) => router.push(`/admin/clients/${id}`)}
                  onDelete={handleDeleteClick}
                  onAcceptIntake={handleAcceptIntake}
                />
              ))}
            </div>
          </>
        )}

        {!loading && filteredClients.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-[#F5D2E0] bg-white/70 px-6 py-16 text-center shadow-sm">
            <Users className="mx-auto mb-6 h-16 w-16 text-[#EFB6CB]" />
            <h3 className="text-lg font-semibold text-[#3C1E35] mb-2">{clientsText.empty.title}</h3>
            <p className="text-sm text-[#8D5D7A] mb-6">
              {searchApplied ? clientsText.empty.filteredDescription : clientsText.empty.description}
                </p>
                <button
                  onClick={() => setShowNewClientModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E11C48] to-[#F36B8D] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E11C48]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                >
              <Plus className="w-4 h-4" />
              {clientsText.actions.addClient}
                </button>
              </div>
        )}
      </div>

        {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#3C1E35]">{clientsText.addModal.title}</h2>
                <button
                  onClick={() => {
                    if (!isCreatingClient) {
                      setShowNewClientModal(false);
                    }
                  }}
                  disabled={isCreatingClient}
                  className="rounded-full p-2 text-[#C67697] transition-colors hover:bg-[#FDF1F6] hover:text-[#E11C48] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateClient}>
              <div className="space-y-4">
                <div>
                <label className="block text-sm font-semibold text-[#3C1E35] mb-2">{clientsText.addModal.nameLabel}</label>
                  <input
                    type="text"
                    value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full rounded-xl border border-[#F5D2E0] px-3 py-2 text-sm text-[#3C1E35] focus:border-[#E11C48] focus:outline-none focus:ring-2 focus:ring-[#E11C48]/30"
                  placeholder={clientsText.addModal.namePlaceholder}
                  />
                </div>
                
                <div>
                <label className="block text-sm font-semibold text-[#3C1E35] mb-2">{clientsText.addModal.emailLabel}</label>
                  <input
                    type="email"
                    value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full rounded-xl border border-[#F5D2E0] px-3 py-2 text-sm text-[#3C1E35] focus:border-[#E11C48] focus:outline-none focus:ring-2 focus:ring-[#E11C48]/30"
                  placeholder={clientsText.addModal.emailPlaceholder}
                  />
                </div>
                
                <div>
                <label className="block text-sm font-semibold text-[#3C1E35] mb-2">{clientsText.addModal.phoneLabel}</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full rounded-xl border border-[#F5D2E0] px-3 py-2 text-sm text-[#3C1E35] focus:border-[#E11C48] focus:outline-none focus:ring-2 focus:ring-[#E11C48]/30"
                  placeholder={clientsText.addModal.phonePlaceholder}
                  />
                </div>
                
                <div>
                <label className="block text-sm font-semibold text-[#3C1E35] mb-2">{clientsText.addModal.goalLabel}</label>
                  <textarea
                    value={newClient.goal}
                  onChange={(e) => setNewClient({ ...newClient, goal: e.target.value })}
                  className="w-full rounded-xl border border-[#F5D2E0] px-3 py-2 text-sm text-[#3C1E35] focus:border-[#E11C48] focus:outline-none focus:ring-2 focus:ring-[#E11C48]/30"
                  placeholder={clientsText.addModal.goalPlaceholder}
                    rows={3}
                  />
                </div>
                
                <div>
                <label className="block text-sm font-semibold text-[#3C1E35] mb-2">{clientsText.addModal.trainingFrequencyLabel}</label>
                  <select
                    value={newClient.trainingFrequency}
                  onChange={(e) => setNewClient({ ...newClient, trainingFrequency: parseInt(e.target.value, 10) })}
                  className="w-full rounded-xl border border-[#F5D2E0] px-3 py-2 text-sm text-[#3C1E35] focus:border-[#E11C48] focus:outline-none focus:ring-2 focus:ring-[#E11C48]/30"
                >
                  <option value={1}>{clientsText.addModal.frequencyOptions.once}</option>
                  <option value={2}>{clientsText.addModal.frequencyOptions.twice}</option>
                  <option value={3}>{clientsText.addModal.frequencyOptions.three}</option>
                  <option value={4}>{clientsText.addModal.frequencyOptions.four}</option>
                  <option value={5}>{clientsText.addModal.frequencyOptions.five}</option>
                  </select>
                </div>
              </div>
              
            <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isCreatingClient) {
                      setShowNewClientModal(false);
                    }
                  }}
                  disabled={isCreatingClient}
                  className="flex-1 rounded-xl border border-[#F5D2E0] px-4 py-2.5 text-sm font-medium text-[#8D5D7A] transition-all duration-200 hover:bg-[#FDF1F6] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {clientsText.addModal.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClient}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#E11C48] to-[#F36B8D] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E11C48]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingClient ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Aanmaken...</span>
                    </>
                  ) : (
                    clientsText.addModal.create
                  )}
                </button>
              </div>
              </form>
            </div>
          </div>
        )}

      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#3C1E35]">{clientsText.deleteModal.title}</h2>
                <button
                onClick={handleDeleteCancel}
                className="rounded-full p-2 text-[#C67697] transition-colors hover:bg-[#FDF1F6] hover:text-[#E11C48]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
            <div className="mb-6 rounded-2xl border border-[#F5D2E0] bg-[#FFF6FA] p-4 text-left">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FCE1EB]">
                <Trash2 className="h-7 w-7 text-[#E11C48]" />
              </div>
              <h3 className="text-base font-semibold text-[#3C1E35] text-center mb-2">
                {clientsText.deleteModal.subtitle}
                </h3>
              <p className="text-sm text-[#8D5D7A] text-center">
                {clientsText.deleteModal.warningPrefix}
                <strong>{clientToDelete.name}</strong>
                {clientsText.deleteModal.warningSuffix}
              </p>
              <p className="mt-4 text-sm font-medium text-[#3C1E35]">{clientsText.deleteModal.description}</p>
              <ul className="mt-2 space-y-1 text-sm text-[#C67697] pl-5 list-disc">
                {clientsText.deleteModal.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
                  </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                className="flex-1 rounded-xl border border-[#F5D2E0] px-4 py-2.5 text-sm font-medium text-[#8D5D7A] transition-colors hover:bg-[#FDF1F6]"
                >
                {clientsText.deleteModal.cancel}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                className="flex-1 rounded-xl bg-[#E11C48] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E11C48]/30 transition-all hover:-translate-y-0.5 hover:bg-[#B01638]"
                >
                {clientsText.deleteModal.confirm}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

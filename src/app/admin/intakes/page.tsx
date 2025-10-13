'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Calendar, Eye, Edit, Trash2, Search, Filter, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

interface IntakeSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
}

interface IntakeClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: string;
  plan: string;
  totalSessions: number;
  rating: number;
  createdAt: string;
  intakeSession: IntakeSession | null;
  totalIntakeSessions: number;
}

export default function IntakesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [intakes, setIntakes] = useState<IntakeClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchIntakes();
  }, []);

  const fetchIntakes = async () => {
    try {
      const response = await fetch('/api/intakes');
      if (response.ok) {
        const data = await response.json();
        setIntakes(data);
      } else {
        console.error('Failed to fetch intakes');
      }
    } catch (error) {
      console.error('Error fetching intakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIntakes = intakes.filter(intake => {
    const matchesSearch = intake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intake.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intake.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || intake.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'intake': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })} at ${timeString}`;
  };

  const handleViewClient = (clientId: string) => {
    router.push(`/admin/clients/${clientId}`);
  };

  const handleEditClient = (clientId: string) => {
    router.push(`/admin/clients/${clientId}/edit`);
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/users/${clientId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove the client from the local state
          setIntakes(intakes.filter(intake => intake.id !== clientId));
          alert(`${clientName} has been deleted successfully.`);
        } else {
          alert('Failed to delete client. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('An error occurred while deleting the client.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Intakes</h1>
          </div>
          <p className="text-gray-600">Manage and view all intake clients</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Total Intakes</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{intakes.length}</p>
              </div>
              <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
                <UserPlus className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Active Intakes</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {intakes.filter(i => i.status.toLowerCase() === 'active').length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
                <UserPlus className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl lg:text-2xl font-bold text-yellow-600">
                  {intakes.filter(i => i.status.toLowerCase() === 'pending' || i.status.toLowerCase() === 'intake').length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
                <UserPlus className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">This Month</p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">
                  {intakes.filter(i => {
                    const intakeDate = new Date(i.createdAt);
                    const now = new Date();
                    return intakeDate.getMonth() === now.getMonth() && 
                           intakeDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>
            <div className="w-full lg:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="intake">Intake</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intake Session
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIntakes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">No intake clients found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredIntakes.map((intake) => (
                    <tr key={intake.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-yellow-800">
                                {intake.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{intake.name}</div>
                            <div className="text-sm text-gray-500">ID: {intake.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {intake.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {intake.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(intake.status)}`}>
                          {intake.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {intake.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(intake.joinDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {intake.intakeSession ? (
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">
                                {formatDateTime(intake.intakeSession.date, intake.intakeSession.startTime)}
                              </div>
                              <div className="text-xs text-gray-500 mb-1">
                                {intake.intakeSession.status}
                              </div>
                              {intake.intakeSession.notes && (
                                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2 max-w-xs">
                                  <span className="font-semibold">Bericht: </span>
                                  {intake.intakeSession.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No session scheduled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {intake.totalSessions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewClient(intake.id)}
                            className="text-rose-600 hover:text-rose-900 p-1 rounded hover:bg-rose-50 transition-colors"
                            title="View Client"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditClient(intake.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit Client"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClient(intake.id, intake.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredIntakes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
              <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-500">No intake clients found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredIntakes.map((intake) => (
              <div key={intake.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                {/* Client Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-yellow-800">
                        {intake.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{intake.name}</div>
                      <div className="text-xs text-gray-500">ID: {intake.id.slice(-8)}</div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(intake.status)}`}>
                    {intake.status}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{intake.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{intake.phone}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Plan</div>
                    <div className="font-medium text-gray-900">{intake.plan}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Sessions</div>
                    <div className="font-medium text-gray-900">{intake.totalSessions}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Join Date</div>
                    <div className="font-medium text-gray-900">{formatDate(intake.joinDate)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Intake Session</div>
                    <div className="font-medium text-gray-900">
                      {intake.intakeSession ? (
                        <span className="text-xs">
                          {formatDateTime(intake.intakeSession.date, intake.intakeSession.startTime)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">No session</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Intake Session Notes */}
                {intake.intakeSession?.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold">Bericht: </span>
                      {intake.intakeSession.notes}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => handleViewClient(intake.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <button 
                    onClick={() => handleEditClient(intake.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(intake.id, intake.name)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

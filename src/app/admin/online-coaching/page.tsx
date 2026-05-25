'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Eye, Edit, Trash2, Search, Filter, Clock, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import AdminPageContent from '@/components/admin/AdminPageContent';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import {
  adminCardStyle,
  adminInputClassName,
  getAdminStatusClassName,
} from '@/lib/adminStyles';

interface OnlineCoachingRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: string;
  program: string;
  startDate: string | null;
  endDate: string | null;
  notes: string;
  createdAt: string;
}

export default function OnlineCoachingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<OnlineCoachingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      console.log('Fetching registrations from API...');
      const response = await fetch('/api/online-coaching-test');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched registrations:', data);
        console.log('Number of registrations:', data.length);
        setRegistrations(data);
      } else {
        console.error('Failed to fetch online coaching registrations, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching online coaching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || reg.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewRegistration = (regId: string) => {
    // Could create a detail page later
    console.log('View registration:', regId);
  };

  const handleEditRegistration = (regId: string) => {
    // Could create an edit page later
    console.log('Edit registration:', regId);
  };

  const handleDeleteRegistration = async (regId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}'s registration? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/online-coaching/${regId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setRegistrations(registrations.filter(reg => reg.id !== regId));
          alert(`${name}'s registration has been deleted successfully.`);
        } else {
          alert('Failed to delete registration. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting registration:', error);
        alert('An error occurred while deleting the registration.');
      }
    }
  };

  if (loading) {
    return (
      <AdminPageContent>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#F36088]" />
        </div>
      </AdminPageContent>
    );
  }

  const thisMonthCount = registrations.filter((r) => {
    const regDate = new Date(r.createdAt);
    const now = new Date();
    return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <AdminPageContent>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
          <AdminStatsCard title="Total Registrations" value={registrations.length} icon={Users} />
          <AdminStatsCard title="Active Programs" value={registrations.filter((r) => r.status.toLowerCase() === 'active').length} icon={CheckCircle} />
          <AdminStatsCard title="Pending" value={registrations.filter((r) => r.status.toLowerCase() === 'pending').length} icon={Clock} />
          <AdminStatsCard title="This Month" value={thisMonthCount} icon={Calendar} />
        </div>

        <div className="mb-6 rounded-xl p-6" style={adminCardStyle}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${adminInputClassName} pl-10`}
                />
              </div>
            </div>
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`${adminInputClassName} appearance-none pl-10`}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl" style={adminCardStyle}>
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
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">
                        {registrations.length === 0 
                          ? "No online coaching registrations found" 
                          : "No registrations match your search criteria"
                        }
                      </p>
                      <p className="text-sm">
                        {registrations.length === 0 
                          ? "Registrations will appear here when users submit the online coaching form" 
                          : "Try adjusting your search or filter criteria"
                        }
                      </p>
                      {registrations.length === 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            💡 <strong>Tip:</strong> Test the system by filling out the online coaching form on the homepage
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-800">
                                {reg.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reg.name}</div>
                            <div className="text-sm text-gray-500">ID: {reg.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {reg.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {reg.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getAdminStatusClassName(reg.status)}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reg.program}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(reg.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {reg.startDate && reg.endDate ? (
                          <div>
                            <div className="font-medium">{formatDate(reg.startDate)}</div>
                            <div className="text-xs text-gray-500">to {formatDate(reg.endDate)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        {reg.notes ? (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded truncate">
                            {reg.notes}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No notes</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewRegistration(reg.id)}
                            className="text-rose-600 hover:text-rose-900 p-1 rounded hover:bg-rose-50 transition-colors"
                            title="View Registration"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditRegistration(reg.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit Registration"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRegistration(reg.id, reg.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete Registration"
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
    </AdminPageContent>
  );
}


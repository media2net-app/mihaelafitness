'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Filter, 
  Search, 
  User, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Session Card Component
function SessionCard({ session, onEdit, onDelete, onView }: {
  session: any;
  onEdit: (session: any) => void;
  onDelete: (session: any) => void;
  onView: (session: any) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'no-show': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {session.clientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{session.clientName}</h3>
            <p className="text-sm text-gray-500 truncate">{session.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(session.status)}
              <span className="hidden sm:inline">{session.status}</span>
            </div>
          </span>
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onView(session)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button onClick={() => onEdit(session)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => onDelete(session)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600 gap-2 sm:gap-0">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{session.startTime} - {session.endTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(session.date).toLocaleDateString()}</span>
        </div>
      </div>
      
      {session.notes && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{session.notes}</p>
        </div>
      )}
    </div>
  );
}

// Calendar View Component
function CalendarView({ sessions, selectedDate, onDateSelect }: {
  sessions: any[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-3 sm:mb-4">
        {dayNames.map(day => (
          <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-10 sm:h-12"></div>;
          }

          const daySessions = getSessionsForDate(day);
          const isSelected = selectedDate.toDateString() === day.toDateString();
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={`h-10 sm:h-12 p-1 rounded-lg text-xs sm:text-sm transition-colors ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  : isToday
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              <div className="font-medium">{day.getDate()}</div>
              {daySessions.length > 0 && (
                <div className="flex justify-center gap-1 mt-0.5 sm:mt-1">
                  {daySessions.slice(0, 2).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-blue-500'
                      }`}
                    />
                  ))}
                  {daySessions.length > 2 && (
                    <div className={`text-xs ${isSelected ? 'text-white' : 'text-blue-500'}`}>
                      +{daySessions.length - 2}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ScheduleV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real training sessions from API
      const response = await fetch('/api/training-sessions');
      if (response.ok) {
        const data = await response.json();
        
        // Transform API data to match component expectations
        const transformedSessions = data.map((session: any) => ({
          id: session.id,
          clientName: session.customerName || session.customer?.name || 'Unknown Client',
          type: session.type || 'Personal Training',
          status: session.status || 'scheduled',
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          notes: session.notes || '',
          customerId: session.customerId
        }));
        
        setSessions(transformedSessions);
      } else {
        const errorText = await response.text();
        setError(`Failed to load sessions: ${response.statusText}`);
        console.error('Failed to fetch training sessions:', response.statusText, errorText);
        setSessions([]);
      }
    } catch (error) {
      setError('Error loading sessions. Please check your connection and try again.');
      console.error('Error loading sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesSearch = session.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sessionsForSelectedDate = filteredSessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate.toDateString() === selectedDate.toDateString();
  });

  const handleEditSession = async (session: any) => {
    try {
      // Navigate to edit page or open edit modal
      console.log('Edit session:', session);
      // TODO: Implement edit functionality - could navigate to edit page or open modal
      // router.push(`/admin/schedule/edit/${session.id}`);
    } catch (error) {
      console.error('Error editing session:', error);
    }
  };

  const handleDeleteSession = async (session: any) => {
    try {
      if (confirm(`Are you sure you want to delete this session with ${session.clientName}?`)) {
        const response = await fetch(`/api/training-sessions?id=${session.id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Remove session from local state
          setSessions(prev => prev.filter(s => s.id !== session.id));
          console.log('Session deleted successfully');
        } else {
          console.error('Failed to delete session:', response.statusText);
          alert('Failed to delete session. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error deleting session. Please try again.');
    }
  };

  const handleViewSession = (session: any) => {
    // Navigate to session detail page or open view modal
    console.log('View session:', session);
    // TODO: Implement view functionality
    // router.push(`/admin/schedule/view/${session.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Schedule</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadSessions()}
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
              <h1 className="text-2xl sm:text-2xl sm:text-3xl font-bold text-gray-900">Schedule</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your training sessions and appointments</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => loadSessions()}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                disabled={loading}
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`}>
                  {loading ? (
                    <div className="w-full h-full border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                  ) : (
                    <Calendar className="w-full h-full text-gray-600" />
                  )}
                </div>
                <span className="text-gray-700 hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <span className="text-gray-700 hidden sm:inline">{viewMode === 'calendar' ? 'List View' : 'Calendar View'}</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">New Session</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {viewMode === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <CalendarView
                sessions={sessions}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>

            {/* Sessions for Selected Date */}
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sessions for {selectedDate.toLocaleDateString()}
                </h3>
                <div className="space-y-4">
                  {sessionsForSelectedDate.length > 0 ? (
                    sessionsForSelectedDate.map(session => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onEdit={handleEditSession}
                        onDelete={handleDeleteSession}
                        onView={handleViewSession}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No sessions scheduled for this date</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredSessions.length > 0 ? (
              filteredSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onEdit={handleEditSession}
                  onDelete={handleDeleteSession}
                  onView={handleViewSession}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                <p className="text-gray-500 mb-4">
                  {sessions.length === 0 
                    ? "No training sessions have been scheduled yet." 
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
                {sessions.length === 0 && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Schedule First Session
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

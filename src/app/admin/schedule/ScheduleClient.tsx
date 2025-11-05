'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Euro,
  Target,
  X,
  UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { getWeekDates } from '@/lib/utils';

interface TrainingSession {
  id: string;
  customerId: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: '1:1' | 'group' | 'own-training' | 'workout-plan' | 'Intake Consultation';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  trainingType?: string; // Full Body, Upper/Lower Split, Push/Pull/Legs, etc.
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  trainingFrequency: number; // sessions per week
  status: string;
  plan: string;
  discount?: number; // discount percentage from pricing calculation
  customerWorkouts?: Array<{
    id: string;
    assignedAt: string;
    workout: {
      id: string;
      name: string;
      trainingType?: string;
    };
  }>;
  scheduleAssignments?: Array<{
    id: string;
    weekday: number;
    trainingDay: number;
    workout: {
      id: string;
      name: string;
      trainingType?: string;
    };
  }>;
}

interface ScheduleClientProps {
  initialSessions: TrainingSession[];
  initialCustomers: Customer[];
  initialWeekDates: string[];
  initialCurrentWeek: string;
}

export default function ScheduleClient({
  initialSessions,
  initialCustomers,
  initialWeekDates,
  initialCurrentWeek,
}: ScheduleClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentWeek, setCurrentWeek] = useState(new Date(initialCurrentWeek));
  const [sessions, setSessions] = useState<TrainingSession[]>(initialSessions);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<{[customerId: string]: {isPaid: boolean, nextPaymentDate: string, amount: number, customerName: string}}>({});
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSessionDetailsModal, setShowSessionDetailsModal] = useState(false);
  
  // New session form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [scheduleRecurring, setScheduleRecurring] = useState(false);
  
  // Session type selection
  const [sessionType, setSessionType] = useState<'client' | 'intake' | 'own-training'>('client');
  
  // Debug state
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Debug function
  const addDebugLog = (message: string) => {
    // Debug logs disabled for performance - only keep in debug modal
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => {
      // Limit to last 100 logs to prevent memory issues
      const newLogs = [...prev, logMessage];
      return newLogs.slice(-100);
    });
    // Removed console.log for performance
  };
  
  // Intake form state
  const [intakeFormData, setIntakeFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  

  // Generate time slots from 08:30 to 20:30
  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = 8 + Math.floor((i + 1) / 2);
    const minute = (i + 1) % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Helper to convert HH:MM to minutes since midnight
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if time slot is during break time
  const isBreakTime = (timeSlot: string, date: string) => {
    const timeInMinutes = timeToMinutes(timeSlot);
    const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Lunch break: 12:30-13:00 (always applies)
    const lunchBreakStart = 12 * 60 + 30;  // 12:30
    const lunchBreakEnd = 13 * 60 + 0;     // 13:00
    
    // Evening break: 17:00-19:00 (only applies to Friday and Saturday)
    const eveningBreakStart = 17 * 60 + 0;   // 17:00
    const eveningBreakEnd = 19 * 60 + 0;     // 19:00
    
    // Sunday (0): whole day not available
    if (dayOfWeek === 0) {
      return true; // All time slots unavailable on Sunday
    }
    
    // Friday (5) and Saturday (6): lunch break and evening break apply
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      const isLunchBreak = timeInMinutes > lunchBreakStart && timeInMinutes < lunchBreakEnd;
      const isEveningBreak = timeInMinutes >= eveningBreakStart && timeInMinutes < eveningBreakEnd;
      return isLunchBreak || isEveningBreak;
    }
    
    // Monday (1) to Thursday (4): only lunch break applies
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      return timeInMinutes > lunchBreakStart && timeInMinutes < lunchBreakEnd;
    }
    
    return false;
  };

  // Check if time slot is available (not booked and not break time)
  const isTimeSlotAvailable = (date: string, timeSlot: string, duration: number = 1) => {
    // Check if it's break time (includes Friday/Saturday blocking)
    if (isBreakTime(timeSlot, date)) return false;
    
    const [startHours, startMinutes] = timeSlot.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = startTimeInMinutes + (duration * 60);
    
    // Check for conflicts with existing sessions
    return !sessions.some(session => {
      if (session.date !== date) return false;
      
      const [sessionStartHours, sessionStartMinutes] = session.startTime.split(':').map(Number);
      const [sessionEndHours, sessionEndMinutes] = session.endTime.split(':').map(Number);
      const sessionStartTimeInMinutes = sessionStartHours * 60 + sessionStartMinutes;
      const sessionEndTimeInMinutes = sessionEndHours * 60 + sessionEndMinutes;
      
      // Check for overlap: two time ranges overlap if one starts before the other ends
      // and ends after the other starts
      const hasOverlap = startTimeInMinutes < sessionEndTimeInMinutes && 
                        endTimeInMinutes > sessionStartTimeInMinutes;
      
      return hasOverlap;
    });
  };

  // Days of the week (Monday to Saturday)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentWeekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);

  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        // Use optimized API endpoint that gets all data in one request
        const startDate = currentWeekDates[0].toISOString().split('T')[0];
        const endDate = currentWeekDates[5].toISOString().split('T')[0];
        
        const response = await fetch(`/api/schedule/overview?startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        
        if (response.ok) {
          const customersRaw = data?.customers;
          if (!Array.isArray(customersRaw)) {
            console.warn('Expected schedule overview customers to be an array. Got:', customersRaw);
          }
          setCustomers(Array.isArray(customersRaw) ? customersRaw : []);
          
          // Transform sessions to ensure date format is correct and customer name is available
          const transformedSessions = data.sessions.map((session: any) => {
            return {
              ...session,
              customerName: (session.customerName || 'Unknown Customer').replace(/ completed?/gi, '').trim()
            };
          });
          
          setSessions(transformedSessions);
          
          // Set payment status from API response (optimized - no separate API calls needed!)
          if (data.paymentStatus) {
            const apiPaymentStatus = data.paymentStatus;
            const paymentData: {[customerId: string]: {isPaid: boolean, nextPaymentDate: string, amount: number, customerName: string}} = {};
            
            for (const [customerId, status] of Object.entries(apiPaymentStatus)) {
              // Try to get customer name from customers array first (more reliable)
              const customer = customersRaw.find((c: any) => c.id === customerId);
              let customerName = customer?.name;
              
              // Fallback to sessions if not found in customers
              if (!customerName) {
                const customerSession = transformedSessions.find((s: any) => s.customerId === customerId);
                customerName = customerSession?.customerName;
              }
              
              paymentData[customerId] = {
                ...(status as any),
                customerName: (customerName || 'Unknown').replace(/ completed?/gi, '').trim()
              };
            }
            
            setPaymentStatus(paymentData);
          }
        } else {
          console.error('Failed to load schedule data:', data.error);
          setCustomers([]);
          setSessions([]);
        }
      } catch (error) {
        console.error('Error loading schedule data:', error);
        setCustomers([]);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadScheduleData();
  }, [currentWeek, currentWeekDates]);

  // Payment status is now loaded from schedule/overview API (optimized - no separate calls needed)
  // This useEffect is no longer needed as payment status comes with schedule data

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
    router.push(`/admin/schedule?week=${newWeek.toISOString().split('T')[0]}`);
  };

  const getSessionsForDayAndTime = useCallback((date: Date, timeSlot: string) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Debug logs removed for performance
    
    // Get all training sessions (scheduled, completed, cancelled, no-show)
    const actualSessions = sessions.filter(session => {
      if (session.date !== dateStr) {
        return false;
      }
      
      // Convert times to minutes for easier comparison
      const sessionStartMinutes = timeToMinutes(session.startTime);
      const sessionEndMinutes = timeToMinutes(session.endTime);
      const timeSlotMinutes = timeToMinutes(timeSlot);
      
      // Show session if it's active during this time slot (starts before or at timeSlot, ends after timeSlot)
      return sessionStartMinutes <= timeSlotMinutes && sessionEndMinutes > timeSlotMinutes;
    });

    // DEBUG: Log sessions found for specific time slot
    if (dateStr === '2025-10-03' && timeSlot === '14:00') {
      // Debug logs removed for performance
    }

    return actualSessions;
  }, [sessions, timeToMinutes]);

  const getCustomerTrainingType = (customer: Customer) => {
    if (customer.customerWorkouts && customer.customerWorkouts.length > 0) {
      const latestWorkout = customer.customerWorkouts[0];
      const trainingType = latestWorkout.workout.trainingType;
      
      if (trainingType?.toLowerCase().includes('push/pull/legs')) {
        return 'Push/Pull/Legs';
      } else if (trainingType?.toLowerCase().includes('upper/lower')) {
        return 'Upper/Lower Split';
      } else if (trainingType?.toLowerCase().includes('full body')) {
        return 'Full Body';
      }
      return trainingType || 'Workout Plan';
    }
    return 'No Plan';
  };

  const getMuscleGroupForDay = (trainingType: string, trainingDay: number) => {
    switch (trainingType?.toLowerCase()) {
      case 'push/pull/legs':
        switch (trainingDay) {
          case 1: return 'Legs & Glutes';
          case 2: return 'Back + Triceps + Abs';
          case 3: return 'Chest + Shoulders + Biceps + Abs';
          default: return `Day ${trainingDay}`;
        }
      case 'upper/lower split':
        switch (trainingDay) {
          case 1: return 'Upper Body';
          case 2: return 'Lower Body';
          default: return `Day ${trainingDay}`;
        }
      case 'full body':
        return 'Full Body';
      default:
        return trainingType || 'Workout Plan';
    }
  };

  // Function to get specific workout name based on customer and session number in week
  const getWorkoutNameForSession = (session: TrainingSession) => {
    const sessionDate = new Date(session.date);
    
    // Find the customer
    const customer = customers.find(c => c.id === session.customerId);
    
    if (!customer) {
      return session.trainingType || null;
    }
    
    // Calculate which session number this is within the week
    const dayOfWeek = sessionDate.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Get Monday of this week
    const monday = new Date(sessionDate);
    monday.setDate(sessionDate.getDate() + diff);
    const weekStart = monday.toISOString().split('T')[0];
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekEnd = sunday.toISOString().split('T')[0];
    
    // Get customer's sessions for this week, sorted by date
    const weekSessions = sessions
      .filter(s => s.customerId === session.customerId && s.date >= weekStart && s.date <= weekEnd)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
    
    // Find the position of this session in the week
    const sessionDateStr = sessionDate.toISOString().split('T')[0];
    const sessionIndex = weekSessions.findIndex(s => s.date === sessionDateStr && s.startTime === session.startTime);
    const trainingDayNumber = sessionIndex + 1; // 1st session = Day 1, 2nd = Day 2, etc.
    
    if (customer.scheduleAssignments && customer.scheduleAssignments.length > 0) {
      // Find the assignment for this training day number
      const assignment = customer.scheduleAssignments.find(a => a.trainingDay === trainingDayNumber);
      if (assignment && assignment.workout) {
        // Extract just the workout type from the name (e.g., "Day 1 - Legs & Glutes Workout" -> "Legs & Glutes")
        const workoutName = assignment.workout.name;
        if (workoutName.includes(' - ')) {
          const parts = workoutName.split(' - ');
          if (parts.length > 1) {
            // Remove " Workout" suffix if present
            return parts[1].replace(' Workout', '').trim();
          }
        }
        return workoutName;
      }
    }
    
    return session.trainingType || null;
  };

  const getSessionTypeColor = (type: string, status: string) => {
    // Override colors based on status first
    if (status === 'completed') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (status === 'cancelled') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (status === 'no-show') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    
    // Default colors based on type
    switch (type) {
      case '1:1': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'group': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'own-training': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'workout-plan': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Intake Consultation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleCreateSession = async () => {
    if (!selectedDate || !selectedStartTime) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate based on session type
    if (sessionType === 'client' && !selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    if (sessionType === 'intake' && (!intakeFormData.name || !intakeFormData.email || !intakeFormData.phone)) {
      alert('Please fill in all client details');
      return;
    }

    try {
      const endTime = `${(parseInt(selectedStartTime.split(':')[0]) + 1).toString().padStart(2, '0')}:${selectedStartTime.split(':')[1]}`;
      
      let response;
      
      if (sessionType === 'intake') {
        // Create intake session with new client
        response = await fetch('/api/intake', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: intakeFormData.name,
            email: intakeFormData.email,
            phone: intakeFormData.phone,
            preferredDate: selectedDate,
            preferredTime: selectedStartTime,
            message: sessionNotes
          }),
        });
      } else if (sessionType === 'own-training') {
        // Create own training session
        response = await fetch('/api/training-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: 'mihaela-own-training', // Special ID for own training
            date: selectedDate,
            startTime: selectedStartTime,
            endTime: endTime,
            type: 'own-training',
            status: 'scheduled',
            notes: sessionNotes || 'Own training session'
          }),
        });
      } else {
        // Create regular client session
        response = await fetch('/api/training-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: selectedCustomerId,
            date: selectedDate,
            startTime: selectedStartTime,
            endTime: endTime,
            type: '1:1',
            status: 'scheduled',
            notes: sessionNotes
          }),
        });
      }

      if (response.ok) {
        const newSession = await response.json();
        
        if (sessionType === 'intake') {
          // For intake sessions, we need to fetch the updated sessions list
          // since a new client was created
          const sessionsResponse = await fetch('/api/training-sessions');
          if (sessionsResponse.ok) {
            const updatedSessions = await sessionsResponse.json();
            setSessions(updatedSessions);
          }
          
          // Also update customers list
          const customersResponse = await fetch('/api/users');
          if (customersResponse.ok) {
            const data = await customersResponse.json();
            // Handle the new API response structure with users array and pagination
            if (data.users && Array.isArray(data.users)) {
              setCustomers(data.users);
            } else if (Array.isArray(data)) {
              // Fallback for old API structure
              setCustomers(data);
            } else {
              console.warn('Expected /api/users to return an object with users array. Got:', data);
            }
          }
        } else if (sessionType === 'own-training') {
          setSessions(prev => [...prev, {
            ...newSession,
            date: newSession.date.split('T')[0],
            customerName: 'Mihaela (Own Training)'
          }]);
        } else {
          setSessions(prev => [...prev, {
            ...newSession,
            date: newSession.date.split('T')[0],
            customerName: newSession.customer?.name || 'Unknown Customer'
          }]);
        }
        
        setShowNewSessionModal(false);
        setSelectedCustomerId('');
        setSelectedDate('');
        setSelectedStartTime('');
        setSessionNotes('');
        setIntakeFormData({ name: '', email: '', phone: '' });
        setSessionType('client');
        alert(sessionType === 'intake' ? 'Intake session created successfully!' : 
              sessionType === 'own-training' ? 'Own training session created successfully!' : 
              'Session created successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error creating session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error creating session. Please try again.');
    }
  };


  // Auto-complete past sessions
  const handleAutoCompleteSessions = async () => {
    try {
      const response = await fetch('/api/training-sessions/auto-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Auto-complete result:', result);
        
        // Reload sessions to reflect changes
        const sessionsResponse = await fetch('/api/training-sessions');
        if (sessionsResponse.ok) {
          const updatedSessions = await sessionsResponse.json();
          setSessions(updatedSessions);
        }
        
        alert(`Auto-completed ${result.updatedCount} sessions`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to auto-complete sessions');
      }
    } catch (error) {
      console.error('Error auto-completing sessions:', error);
      alert('Failed to auto-complete sessions');
    }
  };

  // Handle updating session status
  const handleUpdateSessionStatus = async (
    sessionId: string,
    newStatus: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  ) => {
    try {
      const response = await fetch(`/api/training-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (response.ok) {
        // Update session in local state
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: newStatus }
            : session
        ));
        
        // Update selected session if it's the same one
        if (selectedSession && selectedSession.id === sessionId) {
          setSelectedSession({ ...selectedSession, status: newStatus });
        }
        
        setShowEditModal(false);
        alert(`Session status updated to ${newStatus}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update session status');
      }
    } catch (error) {
      console.error('Error updating session status:', error);
      alert('Failed to update session status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Calendar className="w-8 h-8 mr-3 text-rose-500" />
                Coaching Schedule
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your training sessions and client schedules
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <button
                onClick={() => setShowDebugModal(true)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors duration-200"
              >
                <Clock className="w-5 h-5 mr-2" />
                Debug Logs
              </button>
              <button
                onClick={handleAutoCompleteSessions}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors duration-200"
              >
                <Clock className="w-5 h-5 mr-2" />
                Auto Complete
              </button>
              <button
                onClick={() => setShowNewSessionModal(true)}
                className="flex items-center px-4 py-2 bg-rose-500 text-white rounded-lg shadow hover:bg-rose-600 transition-colors duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Session
              </button>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateWeek('prev')}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous Week
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentWeekDates[0].toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric' 
                })} - {currentWeekDates[5].toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h2>
            </div>
            
            <button
              onClick={() => navigateWeek('next')}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Next Week
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>

          {/* Schedule Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header Row */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                <div className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded-lg">
                  Time
                </div>
                {days.map((day, index) => (
                  <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded-lg">
                    <div className="text-sm">{dayAbbr[index]}</div>
                    <div className="text-xs text-gray-500">{formatDate(currentWeekDates[index])}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-7 gap-1 mb-1">
                  {/* Time Column */}
                  <div className="p-2 text-sm text-gray-600 bg-gray-50 rounded-lg flex items-center justify-center">
                    {formatTime(timeSlot)}
                  </div>
                  
                  {/* Day Columns */}
                  {days.map((day, dayIndex) => {
                    const date = currentWeekDates[dayIndex];
                    const daySessions = getSessionsForDayAndTime(date, timeSlot);
                    const isAvailable = isTimeSlotAvailable(date.toISOString().split('T')[0], timeSlot);
                    
                    return (
                      <div
                        key={`${day}-${timeSlot}`}
                        className={`min-h-[60px] p-2 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                          isAvailable 
                            ? 'border-gray-200 bg-gray-50 hover:bg-gray-100' 
                            : 'border-gray-300 bg-gray-100'
                        }`}
                      >
                        {/* Payment Reminders at 08:30 */}
                        {timeSlot === '08:30' && (() => {
                          const dayStr = date.toISOString().split('T')[0];
                          const paymentReminders = Object.entries(paymentStatus)
                            .filter(([customerId, status]) => {
                              if (status.isPaid || !status.nextPaymentDate) return false;
                              const nextPaymentDate = new Date(status.nextPaymentDate);
                              const today = new Date(dayStr);
                              // Show reminder only if payment is due today
                              const daysUntil = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              return daysUntil === 0;
                            })
                            .map(([customerId, status]) => {
                              const nextPaymentDate = new Date(status.nextPaymentDate);
                              const today = new Date(dayStr);
                              const daysUntil = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              return { customerId, ...status, daysUntil };
                            });
                          
                          return paymentReminders.map((reminder) => (
                            <div
                              key={`payment-${reminder.customerId}-${dayStr}`}
                              className={`mb-2 p-3 rounded-lg border-2 ${
                                reminder.daysUntil < 0 
                                  ? 'bg-red-50 border-red-300' 
                                  : reminder.daysUntil <= 3 
                                  ? 'bg-orange-50 border-orange-300'
                                  : 'bg-yellow-50 border-yellow-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Clock className={`w-4 h-4 ${
                                    reminder.daysUntil < 0 
                                      ? 'text-red-600' 
                                      : reminder.daysUntil <= 3 
                                      ? 'text-orange-600'
                                      : 'text-yellow-600'
                                  }`} />
                                  <span className={`text-xs font-semibold ${
                                    reminder.daysUntil < 0 
                                      ? 'text-red-800' 
                                      : reminder.daysUntil <= 3 
                                      ? 'text-orange-800'
                                      : 'text-yellow-800'
                                  }`}>
                                    Next Payment
                                  </span>
                                </div>
                                <span className={`text-sm font-bold ${
                                  reminder.daysUntil < 0 
                                    ? 'text-red-700' 
                                    : reminder.daysUntil <= 3 
                                    ? 'text-orange-700'
                                    : 'text-yellow-700'
                                }`}>
                                  {reminder.amount} RON
                                </span>
                              </div>
                              <div className="text-xs text-gray-700">
                                <div>{reminder.customerName}</div>
                                <div className="mt-1">
                                  Date: <span className="font-semibold">{new Date(reminder.nextPaymentDate).toLocaleDateString('ro-RO')}</span>
                                </div>
                                <div className="mt-1">
                                  {reminder.daysUntil < 0 ? (
                                    <span className="text-red-600 font-semibold">Overdue by {Math.abs(reminder.daysUntil)} days</span>
                                  ) : reminder.daysUntil === 0 ? (
                                    <span className="text-red-600 font-semibold">Due today!</span>
                                  ) : (
                                    <span>{reminder.daysUntil} days remaining</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                        
                        {daySessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-2 rounded-lg text-xs font-medium mb-1 cursor-pointer transition-all duration-200 hover:shadow-md ${getSessionTypeColor(session.type, session.status)}`}
                            onClick={() => {
                              setSelectedSession(session);
                              setShowSessionDetailsModal(true);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                <span className="truncate">{session.customerName.replace(/ completed?/gi, '').trim()}</span>
                              </div>
                              <div className={`px-1 py-0.5 rounded text-xs ${getSessionStatusColor(session.status)}`}>
                                {session.status === 'scheduled' ? '' : session.status}
                              </div>
                            </div>
                            {(() => {
                              const workoutName = getWorkoutNameForSession(session);
                              return workoutName ? (
                                <div className="text-xs text-gray-600 mt-1 truncate font-medium">
                                  {workoutName}
                                </div>
                              ) : null;
                            })()}
                            <div className="text-xs text-gray-500 mt-1">
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
              </div>
            </div>
          </div>
        </main>

        {/* New Session Modal */}
        {showNewSessionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {sessionType === 'intake' ? 'Create Intake Session' : 
                   sessionType === 'own-training' ? 'Create Own Training Session' : 
                   'New Training Session'}
                </h3>
                <button
                  onClick={() => {
                    setShowNewSessionModal(false);
                    setSessionType('client');
                    setIntakeFormData({ name: '', email: '', phone: '' });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Session Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSessionType('client')}
                      className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                        sessionType === 'client'
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="font-medium">Client Session</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setSessionType('intake')}
                      className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                        sessionType === 'intake'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        <span className="font-medium">Intake</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setSessionType('own-training')}
                      className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                        sessionType === 'own-training'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Target className="w-4 h-4 mr-2" />
                        <span className="font-medium">Own Training</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Customer Selection - Only show for client sessions */}
                {sessionType === 'client' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer *
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Intake Form - Only show for intake sessions */}
                {sessionType === 'intake' && (
                  <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800">New Client Details</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={intakeFormData.name}
                        onChange={(e) => setIntakeFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Enter client's full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={intakeFormData.email}
                        onChange={(e) => setIntakeFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Enter client's email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={intakeFormData.phone}
                        onChange={(e) => setIntakeFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Enter client's phone number"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <select
                    value={selectedStartTime}
                    onChange={(e) => setSelectedStartTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="">Select start time</option>
                    {timeSlots.map((timeSlot) => (
                      <option key={timeSlot} value={timeSlot}>
                        {formatTime(timeSlot)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                    rows={3}
                    placeholder="Add any notes for this session..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowNewSessionModal(false);
                      setSessionType('client');
                      setIntakeFormData({ name: '', email: '', phone: '' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSession}
                    className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    {sessionType === 'intake' ? 'Create Intake Session' : 
                     sessionType === 'own-training' ? 'Create Own Training Session' : 
                     'Create Session'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Session Details Modal */}
        {showSessionDetailsModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Session Details</h3>
                <button
                  onClick={() => setShowSessionDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <p className="text-gray-800">{selectedSession.customerName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <p className="text-gray-800">
                    {new Date(selectedSession.date).toLocaleDateString()} at {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(selectedSession.type, selectedSession.status)}`}>
                    {selectedSession.type}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(selectedSession.status)}`}>
                    {selectedSession.status}
                  </span>
                </div>

                {selectedSession.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <p className="text-gray-800">{selectedSession.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowSessionDetailsModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedSession) return;
                      setShowSessionDetailsModal(false);
                      router.push(`/admin/workouts/start?sessionId=${selectedSession.id}&customerId=${selectedSession.customerId}&date=${selectedSession.date}`);
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Start workout
                  </button>
                  <button
                    onClick={() => {
                      setShowSessionDetailsModal(false);
                      setShowEditModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Session Modal */}
        {showEditModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Session</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <p className="text-gray-800">{selectedSession.customerName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <p className="text-gray-800">
                    {new Date(selectedSession.date).toLocaleDateString()} at {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateSessionStatus(selectedSession.id, 'completed')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSession.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      ✅ Completed
                    </button>
                    <button
                      onClick={() => handleUpdateSessionStatus(selectedSession.id, 'cancelled')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSession.status === 'cancelled'
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      ❌ Cancelled
                    </button>
                    <button
                      onClick={() => handleUpdateSessionStatus(selectedSession.id, 'scheduled')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSession.status === 'scheduled'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      📅 Scheduled
                    </button>
                    <button
                      onClick={() => handleUpdateSessionStatus(selectedSession.id, 'no-show')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSession.status === 'no-show'
                          ? 'bg-orange-500 text-white'
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                      }`}
                    >
                      🚫 No Show
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Modal */}
        {showDebugModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Debug Logs</h2>
                <button
                  onClick={() => setShowDebugModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <p className="text-gray-500">No debug logs yet. Navigate to the schedule to see logs.</p>
                ) : (
                  <div className="space-y-2">
                    {debugLogs.map((log, index) => (
                      <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setDebugLogs([])}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Clear Logs
                </button>
                <button
                  onClick={() => setShowDebugModal(false)}
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
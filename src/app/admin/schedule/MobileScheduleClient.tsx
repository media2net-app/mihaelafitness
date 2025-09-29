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
  X
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
  type: '1:1' | 'group' | 'own-training' | 'workout-plan';
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

interface MobileScheduleClientProps {
  initialWeekDates: string[];
  initialCurrentWeek: string;
}

export default function MobileScheduleClient({
  initialWeekDates,
  initialCurrentWeek,
}: MobileScheduleClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentWeek, setCurrentWeek] = useState(new Date(initialCurrentWeek));
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSessionDetailsModal, setShowSessionDetailsModal] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // 0 = Monday, 1 = Tuesday, etc.
  const [trainingDays, setTrainingDays] = useState<{[key: string]: string}>({}); // customerId -> training day
  
  // New session form state
  const [newSessionData, setNewSessionData] = useState({
    customerId: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  
  // Session type selection
  const [sessionType, setSessionType] = useState<'client' | 'own-training'>('client');
  
  // Recurring sessions state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(12);
  
  // Session counts state
  const [sessionCounts, setSessionCounts] = useState<{[key: string]: {scheduled: number, total: number, remaining: number}}>({});
  
  // State for clicking on time slots
  const [clickedTimeSlot, setClickedTimeSlot] = useState<{date: Date, time: string} | null>(null);

  // Generate time slots from 08:30 to 20:30 (30-minute blocks)
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

  // Check if time slot is during break time (12:30-14:30 and 17:30-19:30)
  const isBreakTime = (timeSlot: string) => {
    const timeInMinutes = timeToMinutes(timeSlot);
    
    // First break: 12:30-14:30 (include both start and end times)
    const break1Start = 12 * 60 + 30;  // 12:30
    const break1End = 14 * 60 + 30;    // 14:30
    
    // Second break: 17:30-19:00 (include both start and end times)
    const break2Start = 17 * 60 + 30;  // 17:30
    const break2End = 19 * 60 + 0;     // 19:00
    
    // Break times include both start and end times (12:30-14:30 and 17:30-19:00 are unavailable)
    // Note: 19:30-20:30 is available for sessions
    return (timeInMinutes >= break1Start && timeInMinutes <= break1End) ||
           (timeInMinutes >= break2Start && timeInMinutes <= break2End);
  };

  // Check if time slot is available (not booked and not break time)
  const isTimeSlotAvailable = (date: string, timeSlot: string, duration: number = 1) => {
    if (isBreakTime(timeSlot)) return false;
    
    const [startHours, startMinutes] = timeSlot.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = startTimeInMinutes + (duration * 60);
    
    // Use same date normalization as getSessionsForDayAndTime
    const normalizedDate = new Date(date).toLocaleDateString('en-CA');
    
    // Filter sessions for the specific date only - use same logic as getSessionsForDayAndTime
    const sessionsForDate = sessions.filter(session => {
      const sessionDate = new Date(session.date).toLocaleDateString('en-CA');
      return sessionDate === normalizedDate && session.status === 'scheduled';
    });
    
    // Check for conflicts with existing sessions for this specific date
    const hasConflict = sessionsForDate.some(session => {
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
    
    return !hasConflict;
  };

  // Days of the week (Monday to Saturday)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentWeekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);

  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        // Load customers with their workout assignments
        const customersResponse = await fetch('/api/users');
        const customersData = await customersResponse.json();
        
        // Load workout assignments, schedule assignments and discount for each customer
        const customersWithWorkouts = await Promise.all(
          customersData.map(async (customer: any) => {
            let customerWorkouts = [];
            let scheduleAssignments = [];
            let discount = 0;
            
            try {
              // Load customer workouts
              const workoutsResponse = await fetch(`/api/customer-workouts?customerId=${customer.id}`);
              if (workoutsResponse.ok) {
                customerWorkouts = await workoutsResponse.json();
              }
              
              // Load schedule assignments
              const assignmentsResponse = await fetch(`/api/customer-schedule-assignments?customerId=${customer.id}`);
              if (assignmentsResponse.ok) {
                scheduleAssignments = await assignmentsResponse.json();
              }
              
              // Load pricing discount
              const pricingResponse = await fetch(`/api/pricing-calculations?customerId=${customer.id}`);
              if (pricingResponse.ok) {
                const calculations = await pricingResponse.json();
                if (calculations.length > 0) {
                  discount = calculations[0].discount || 0;
                }
              }
            } catch (error) {
              console.error(`Error loading data for customer ${customer.id}:`, error);
            }
            
            return { 
              ...customer, 
              customerWorkouts,
              scheduleAssignments,
              discount 
            };
          })
        );
        
        setCustomers(customersWithWorkouts);
        
        // Load training sessions for current week
        const startDate = currentWeekDates[0].toLocaleDateString('en-CA');
        const endDate = currentWeekDates[5].toLocaleDateString('en-CA');
        
        const sessionsResponse = await fetch(`/api/training-sessions?startDate=${startDate}&endDate=${endDate}`);
        const sessionsData = await sessionsResponse.json();
        
        // Transform sessions to ensure date format is correct and customer name is available
        const transformedSessions = sessionsData.map((session: any) => {
          // Date is already in YYYY-MM-DD format from the API
          const transformedDate = session.date;
          
          return {
            ...session,
            date: transformedDate,
            customerName: session.customer?.name || session.customerName || 'Unknown Customer'
          };
        });
        
        setSessions(transformedSessions);
      } catch (error) {
        console.error('Error loading schedule data:', error);
        setCustomers([]);
        setSessions([]);
      }
    };

    loadScheduleData();
  }, [currentWeek, currentWeekDates]);

  // Auto-refresh sessions when they change
  useEffect(() => {
    const refreshSessions = async () => {
      try {
        const startDate = currentWeekDates[0].toLocaleDateString('en-CA');
        const endDate = currentWeekDates[5].toLocaleDateString('en-CA');
        
        const sessionsResponse = await fetch(`/api/training-sessions?startDate=${startDate}&endDate=${endDate}`);
        const sessionsData = await sessionsResponse.json();
        
        const transformedSessions = sessionsData.map((session: any) => {
          // Ensure consistent date format (YYYY-MM-DD)
          let transformedDate;
          if (typeof session.date === 'string') {
            // If it's already a string, use it directly if it's in YYYY-MM-DD format
            if (session.date.includes('T')) {
              transformedDate = session.date.split('T')[0];
            } else {
              transformedDate = session.date;
            }
          } else if (session.date instanceof Date) {
            transformedDate = session.date.toISOString().split('T')[0];
          } else {
            transformedDate = new Date(session.date).toISOString().split('T')[0];
          }
          
          return {
            ...session,
            date: transformedDate,
            customerName: session.customer?.name || 'Unknown Customer'
          };
        });
        
        setSessions(transformedSessions);
      } catch (error) {
        console.error('Error refreshing sessions:', error);
      }
    };

    // Refresh every 30 seconds to catch any external changes
    const interval = setInterval(refreshSessions, 30000);
    
    return () => clearInterval(interval);
  }, [currentWeekDates]);

  // Load session counts when customers change
  useEffect(() => {
    if (customers.length > 0) {
      loadSessionCounts();
    }
  }, [customers]);

  // Load training days when customers change
  useEffect(() => {
    if (customers.length > 0) {
      loadTrainingDays();
    }
  }, [customers]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
    router.push(`/admin/schedule?week=${newWeek.toISOString().split('T')[0]}`);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    } else if (direction === 'next' && currentDayIndex < 5) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  // Handle creating new training session
  const handleCreateSession = async () => {
    if (sessionType === 'client' && !newSessionData.customerId) {
      alert('Please select a customer for client sessions');
      return;
    }
    if (!newSessionData.startTime || !newSessionData.endTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Check if the selected time slot is available
    const isAvailable = isTimeSlotAvailable(currentDay.toLocaleDateString('en-CA'), newSessionData.startTime);
    if (!isAvailable) {
      alert('The selected time slot is not available. Please choose a different time.');
      return;
    }

    try {
      let customerId = newSessionData.customerId;
      
      // For own training, find Mihaela's customer ID
      if (sessionType === 'own-training') {
        const mihaelaCustomer = customers.find(c => c.name === 'Mihaela (Own Training)');
        if (!mihaelaCustomer) {
          alert('Mihaela customer not found');
          return;
        }
        customerId = mihaelaCustomer.id;
      }

      if (isRecurring && sessionType === 'client') {
        // Create recurring sessions for multiple weeks
        const sessionsToCreate = [];
        const startDate = new Date(currentDay);
        
        for (let week = 0; week < recurringWeeks; week++) {
          const sessionDate = new Date(startDate);
          sessionDate.setDate(startDate.getDate() + (week * 7));
          
          sessionsToCreate.push({
            customerId: customerId,
            date: sessionDate.toLocaleDateString('en-CA'),
            startTime: newSessionData.startTime,
            endTime: newSessionData.endTime,
            type: '1:1',
            status: 'scheduled',
            notes: newSessionData.notes
          });
        }

        // Create all sessions
        const createPromises = sessionsToCreate.map(sessionData => 
          fetch('/api/training-sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
          })
        );

        const responses = await Promise.all(createPromises);
        const successfulSessions: TrainingSession[] = [];
        
        for (let i = 0; i < responses.length; i++) {
          if (responses[i].ok) {
            const newSession = await responses[i].json();
            successfulSessions.push({
              ...newSession,
              status: newSession.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
              customerName: customers.find(c => c.id === newSession.customerId)?.name || 'Unknown Customer'
            });
          }
        }

        if (successfulSessions.length > 0) {
          setSessions(prev => [...prev, ...successfulSessions]);
          alert(`Successfully created ${successfulSessions.length} recurring sessions!`);
          // Force refresh to ensure UI updates
          window.location.reload();
        } else {
          alert('Failed to create any sessions');
        }
      } else {
        // Create single session
        const response = await fetch('/api/training-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: customerId,
            date: currentDay.toLocaleDateString('en-CA'),
            startTime: newSessionData.startTime,
            endTime: newSessionData.endTime,
            type: sessionType === 'own-training' ? 'own-training' : '1:1',
            status: 'scheduled',
            notes: newSessionData.notes
          }),
        });

        if (response.ok) {
          const newSession = await response.json();
          setSessions(prev => [...prev, {
            ...newSession,
            customerName: customers.find(c => c.id === newSession.customerId)?.name || 'Unknown Customer'
          }]);
          // Force refresh to ensure UI updates
          window.location.reload();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to create session');
        }
      }

      // Reset form
      setShowNewSessionModal(false);
      setClickedTimeSlot(null);
      setSessionType('client');
      setIsRecurring(false);
      setRecurringWeeks(12);
      setNewSessionData({
        customerId: '',
        startTime: '',
        endTime: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    }
  };

  // Handle deleting a session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/training-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove session from local state
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        setShowSessionDetailsModal(false);
        setSelectedSession(null);
        // Force refresh to ensure UI updates
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
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
  const handleUpdateSessionStatus = async (sessionId: string, newStatus: string) => {
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
            ? { ...session, status: newStatus as 'scheduled' | 'completed' | 'cancelled' | 'no-show' }
            : session
        ));
        
        // Update selected session if it's the same one
        if (selectedSession && selectedSession.id === sessionId) {
          setSelectedSession({ ...selectedSession, status: newStatus as 'scheduled' | 'completed' | 'cancelled' | 'no-show' });
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

  const getSessionsForDayAndTime = useCallback((date: Date, timeSlot: string) => {
    // Use local date string to avoid timezone issues
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    
    // Get all training sessions (scheduled, completed, cancelled, no-show)
    const actualSessions = sessions.filter(session => {
      // Convert session date to local date string for comparison
      const sessionDate = new Date(session.date).toLocaleDateString('en-CA');
      
      
      if (sessionDate !== dateStr) {
        return false;
      }
      
      // Convert times to minutes for easier comparison
      const sessionStartMinutes = timeToMinutes(session.startTime);
      const sessionEndMinutes = timeToMinutes(session.endTime);
      const timeSlotMinutes = timeToMinutes(timeSlot);
      
      // Show session if it's active during this time slot (starts before or at timeSlot, ends after timeSlot)
      return sessionStartMinutes <= timeSlotMinutes && sessionEndMinutes > timeSlotMinutes;
    });

    return actualSessions;
  }, [sessions, timeToMinutes]);

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
      case 'group': return 'bg-green-100 text-green-800 border-green-200';
      case 'own-training': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'workout-plan': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Check if a session should be visually merged with the next time slot (for 1-hour sessions)
  const shouldMergeWithNextSlot = (session: TrainingSession, timeSlot: string) => {
    const sessionStartMinutes = timeToMinutes(session.startTime);
    const sessionEndMinutes = timeToMinutes(session.endTime);
    const timeSlotMinutes = timeToMinutes(timeSlot);
    
    // If session starts at this time slot and is 1 hour long, merge with next slot
    return sessionStartMinutes === timeSlotMinutes && 
           sessionEndMinutes === timeSlotMinutes + 60;
  };

  // Check if this time slot should be visually merged with the previous slot
  const shouldMergeWithPreviousSlot = (session: TrainingSession, timeSlot: string) => {
    const sessionStartMinutes = timeToMinutes(session.startTime);
    const timeSlotMinutes = timeToMinutes(timeSlot);
    
    // If session started at the previous time slot and this is the second half
    return sessionStartMinutes === timeSlotMinutes - 30 && 
           timeToMinutes(session.endTime) === timeSlotMinutes + 30;
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get active workouts for a customer
  const getActiveWorkoutsForCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customer-workouts?customerId=${customerId}`);
      if (response.ok) {
        const workouts = await response.json();
        return workouts.filter((workout: any) => workout.status === 'active');
      }
      return [];
    } catch (error) {
      console.error('Error fetching customer workouts:', error);
      return [];
    }
  };

  // Function to load training days for all customers
  const loadTrainingDays = async () => {
    const trainingDaysMap: {[key: string]: string} = {};
    
    for (const customer of customers) {
      try {
        const activeWorkouts = await getActiveWorkoutsForCustomer(customer.id);
        
        if (activeWorkouts.length > 0) {
          const workout = activeWorkouts[0]; // Get the first active workout
          trainingDaysMap[customer.id] = workout.workout.name;
        } else if (customer.name.includes('Leca Georgiana')) {
          // Fallback for Leca with hardcoded plan
          trainingDaysMap[customer.id] = 'Push/Pull/Legs Plan';
        } else if (customer.name.includes('Own Training')) {
          trainingDaysMap[customer.id] = 'Admin Training';
        }
      } catch (error) {
        console.error(`Error loading training days for ${customer.name}:`, error);
      }
    }
    
    setTrainingDays(trainingDaysMap);
  };

  // Function to get specific training day based on customer plan and day of week
  const getTrainingDayForCustomer = (customerName: string, customerId: string, dayOfWeek: number) => {
    // Skip the trainingDays state check and go directly to customer data
    
    // Get customer data to check for assigned workouts
    const customer = customers.find(c => c.id === customerId);
    
    // First check schedule assignments
    if (customer && customer.scheduleAssignments && customer.scheduleAssignments.length > 0) {
      // Find the assignment for this day of week
      const assignment = customer.scheduleAssignments.find(a => a.weekday === dayOfWeek);
      if (assignment && assignment.workout) {
        // Get training day from workout name or trainingType
        if (assignment.workout.trainingType) {
          return getTrainingDayFromType(assignment.workout.trainingType, dayOfWeek);
        }
        return assignment.workout.name;
      }
    }
    
    // Check customer workouts for training type
    if (customer && customer.customerWorkouts && customer.customerWorkouts.length > 0) {
      const latestWorkout = customer.customerWorkouts[0]; // Get the most recent workout
      if (latestWorkout.workout.trainingType) {
        return getTrainingDayFromType(latestWorkout.workout.trainingType, dayOfWeek);
      }
    }
    
    // Check if customer has a training plan assigned (from trainingDays state)
    const trainingPlan = trainingDays[customerId];
    if (trainingPlan) {
      // Try to extract training type from plan name
      if (trainingPlan.toLowerCase().includes('complete body') || 
          trainingPlan.toLowerCase().includes('push/pull/legs') ||
          trainingPlan.toLowerCase().includes('3x per week')) {
        return getTrainingDayFromType('Complete Body', dayOfWeek);
      }
      if (trainingPlan.toLowerCase().includes('upper/lower') ||
          trainingPlan.toLowerCase().includes('4x per week')) {
        return getTrainingDayFromType('Upper/Lower Split', dayOfWeek);
      }
      if (trainingPlan.toLowerCase().includes('full body') ||
          trainingPlan.toLowerCase().includes('2x per week')) {
        return getTrainingDayFromType('Full Body', dayOfWeek);
      }
    }
    
    // Fallback to hardcoded plans for known customers with Complete Body plan
    if (customerName.includes('Leca Georgiana') || 
        customerName.includes('Dragomir Ana Maria') ||
        customerName.includes('3x per week') ||
        customerName.includes('Complete Body')) {
      switch (dayOfWeek) {
        case 1: return 'Legs & Glutes'; // Monday
        case 2: return 'Back + Triceps + Abs'; // Tuesday  
        case 4: return 'Chest + Shoulders + Biceps + Abs'; // Thursday
        default: return null; // No training on other days
      }
    }
    
    // Fallback for Own Training (Mihaela)
    if (customerName.includes('Own Training') || customerName.includes('Mihaela')) {
      switch (dayOfWeek) {
        case 1: return 'Legs & Glutes'; // Monday
        case 2: return 'Back + Triceps + Abs'; // Tuesday  
        case 4: return 'Chest + Shoulders + Biceps + Abs'; // Thursday
        default: return null; // No training on other days
      }
    }
    
    return null;
  };

  // Helper function to get training day from training type
  const getTrainingDayFromType = (trainingType: string, dayOfWeek: number) => {
    // For Push/Pull/Legs schema
    if (trainingType.toLowerCase().includes('push/pull/legs') || 
        trainingType.toLowerCase().includes('3-day') ||
        trainingType.toLowerCase().includes('3x per week') ||
        trainingType.toLowerCase().includes('complete body')) {
      switch (dayOfWeek) {
        case 1: return 'Legs & Glutes'; // Monday
        case 2: return 'Back + Triceps + Abs'; // Tuesday  
        case 4: return 'Chest + Shoulders + Biceps + Abs'; // Thursday
        default: return null;
      }
    }
    
    // For Upper/Lower Split
    if (trainingType.toLowerCase().includes('upper/lower') ||
        trainingType.toLowerCase().includes('4-day') ||
        trainingType.toLowerCase().includes('4x per week')) {
      switch (dayOfWeek) {
        case 1: return 'Lower Body'; // Monday
        case 2: return 'Upper Body'; // Tuesday
        case 4: return 'Lower Body'; // Thursday
        case 5: return 'Upper Body'; // Friday
        default: return null;
      }
    }
    
    // For Full Body
    if (trainingType.toLowerCase().includes('full body') ||
        trainingType.toLowerCase().includes('2-day') ||
        trainingType.toLowerCase().includes('2x per week')) {
      switch (dayOfWeek) {
        case 1: return 'Full Body'; // Monday
        case 4: return 'Full Body'; // Thursday
        default: return null;
      }
    }
    
    // For other training types, return the type itself
    return trainingType;
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
    return `${hours}:${minutes}`;
  };

  // Calculate end time automatically (start time + 1 hour)
  const calculateEndTime = (startTime: string) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':');
    const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
    const endMinutes = startMinutes + 60; // Add 1 hour
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Load session counts for all customers
  const loadSessionCounts = async () => {
    const counts: {[key: string]: {scheduled: number, total: number, remaining: number}} = {};
    
    for (const customer of customers) {
      const totalSessions = customer.trainingFrequency * 12; // 3 × 12 = 36
      
      try {
        // Fetch ALL sessions for this customer from the database
        const response = await fetch(`/api/training-sessions?customerId=${customer.id}`);
        if (response.ok) {
          const allSessions = await response.json();
          const scheduledSessions = allSessions.filter((session: any) => 
            session.status === 'scheduled'
          ).length;
          
          counts[customer.id] = {
            scheduled: scheduledSessions,
            total: totalSessions,
            remaining: totalSessions - scheduledSessions
          };
        } else {
          // Fallback to local sessions
          const scheduledSessions = sessions.filter(session => 
            session.customerId === customer.id && 
            session.status === 'scheduled'
          ).length;
          
          counts[customer.id] = {
            scheduled: scheduledSessions,
            total: totalSessions,
            remaining: totalSessions - scheduledSessions
          };
        }
      } catch (error) {
        console.error(`Error fetching sessions for customer ${customer.id}:`, error);
        // Fallback to local sessions
        const scheduledSessions = sessions.filter(session => 
          session.customerId === customer.id && 
          session.status === 'scheduled'
        ).length;
        
        counts[customer.id] = {
          scheduled: scheduledSessions,
          total: totalSessions,
          remaining: totalSessions - scheduledSessions
        };
      }
    }
    
    setSessionCounts(counts);
  };

  // Get session count for a specific customer
  const getRemainingSessions = (customerId: string) => {
    return sessionCounts[customerId] || { scheduled: 0, total: 0, remaining: 0 };
  };

  // Handle clicking on time slots
  const handleTimeSlotClick = (date: Date, time: string) => {
    setClickedTimeSlot({ date, time });
    setNewSessionData(prev => ({
      ...prev,
      startTime: time,
      endTime: calculateEndTime(time)
    }));
    setShowNewSessionModal(true);
  };


  const currentDay = currentWeekDates[currentDayIndex];
  const daySessions = getSessionsForDayAndTime(currentDay, '08:30'); // Get all sessions for the day

  return (
    <div className="container mx-auto px-4 py-8">
        <div
          className="bg-white rounded-2xl shadow-xl p-4 md:p-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 text-rose-500" />
                Coaching Schedule
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Manage your training sessions and client schedules
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <button
                onClick={handleAutoCompleteSessions}
                className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors duration-200"
              >
                <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="text-sm md:text-base">Auto Complete</span>
              </button>
              <button
                onClick={() => setShowNewSessionModal(true)}
                className="flex items-center justify-center px-4 py-2 bg-rose-500 text-white rounded-lg shadow hover:bg-rose-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="text-sm md:text-base">New Session</span>
              </button>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateWeek('prev')}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Previous Week</span>
              <span className="sm:hidden">Prev</span>
            </button>
            
            <div className="text-center">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
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
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
            >
              <span className="hidden sm:inline">Next Week</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Mobile Day Navigation */}
          <div className="mb-6 lg:hidden">
            <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Select Day</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateDay('prev')}
                    disabled={currentDayIndex === 0}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateDay('next')}
                    disabled={currentDayIndex === 5}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Day Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                <select
                  value={currentDayIndex}
                  onChange={(e) => setCurrentDayIndex(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  {currentWeekDates.map((date, index) => {
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                    const dayNumber = date.getDate();
                    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                    const hasSessions = getSessionsForDayAndTime(date, '08:30').length > 0;
                    
                    return (
                      <option key={index} value={index}>
                        {dayName} {dayNumber} {monthName} {hasSessions ? '📅' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="mt-3 text-center">
                <h4 className="text-lg font-semibold text-gray-800">
                  {formatDate(currentDay)}
                </h4>
              </div>
            </div>
          </div>

          {/* Mobile Day Schedule */}
          <div className="lg:hidden">
            <div className="space-y-3">
              {timeSlots.map((timeSlot) => {
                const daySessions = getSessionsForDayAndTime(currentDay, timeSlot);
                const isAvailable = isTimeSlotAvailable(currentDay.toLocaleDateString('en-CA'), timeSlot);
                
                return (
                  <div
                    key={timeSlot}
                    onClick={() => isAvailable && handleTimeSlotClick(currentDay, timeSlot)}
                    className={`p-3 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                      isAvailable 
                        ? 'border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer hover:border-rose-300 hover:bg-rose-50' 
                        : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    }`}
                    title={isAvailable ? `Click to schedule session at ${formatTime(timeSlot)}` : 'Time slot unavailable'}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-800">{formatTime(timeSlot)}</span>
                      </div>
                      {isBreakTime(timeSlot) && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Break</span>
                      )}
                    </div>
                    
                    {daySessions.map((session) => {
                      const isMergedWithNext = shouldMergeWithNextSlot(session, timeSlot);
                      const isMergedWithPrevious = shouldMergeWithPreviousSlot(session, timeSlot);
                      
                      return (
                        <div
                          key={session.id}
                          className={`mt-2 p-3 text-sm font-medium cursor-pointer transition-all duration-200 hover:shadow-md ${getSessionTypeColor(session.type, session.status)} ${
                            isMergedWithNext ? 'rounded-t-lg rounded-b-none' : 
                            isMergedWithPrevious ? 'rounded-b-lg rounded-t-none' : 
                            'rounded-lg'
                          }`}
                          onClick={() => {
                            setSelectedSession(session);
                            setShowSessionDetailsModal(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-2" />
                              <span className="truncate">{session.customerName}</span>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${getSessionStatusColor(session.status)}`}>
                              {session.status === 'scheduled' ? '' : session.status}
                            </div>
                          </div>
                        {(() => {
                          // Convert JavaScript getDay() (0=Sunday) to our system (1=Monday)
                          const jsDayOfWeek = new Date(session.date).getDay();
                          const dayOfWeek = jsDayOfWeek === 0 ? 7 : jsDayOfWeek; // Sunday becomes 7, Monday stays 1, etc.
                          const trainingDay = getTrainingDayForCustomer(session.customerName, session.customerId, dayOfWeek);
                          
                          // Always show specific training day if available, otherwise show generic type
                          const displayText = trainingDay || session.trainingType || 'Training';
                          
                          return (
                            <div className="text-xs text-gray-600 mt-1 truncate font-medium">
                              {displayText}
                            </div>
                          );
                        })()}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Week Grid (hidden on mobile) */}
          <div className="hidden lg:block overflow-x-auto">
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
                    const isAvailable = isTimeSlotAvailable(date.toLocaleDateString('en-CA'), timeSlot);
                    
                    return (
                      <div
                        key={`${day}-${timeSlot}`}
                        onClick={() => isAvailable && handleTimeSlotClick(date, timeSlot)}
                        className={`min-h-[60px] p-2 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                          isAvailable 
                            ? 'border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer hover:border-rose-300 hover:bg-rose-50' 
                            : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        }`}
                        title={isAvailable ? `Click to schedule session at ${formatTime(timeSlot)}` : 'Time slot unavailable'}
                      >
                        {daySessions.map((session) => {
                          const isMergedWithNext = shouldMergeWithNextSlot(session, timeSlot);
                          const isMergedWithPrevious = shouldMergeWithPreviousSlot(session, timeSlot);
                          
                          return (
                            <div
                              key={session.id}
                              className={`p-2 text-xs font-medium mb-1 cursor-pointer transition-all duration-200 hover:shadow-md ${getSessionTypeColor(session.type, session.status)} ${
                                isMergedWithNext ? 'rounded-t-lg rounded-b-none' : 
                                isMergedWithPrevious ? 'rounded-b-lg rounded-t-none' : 
                                'rounded-lg'
                              }`}
                              onClick={() => {
                                setSelectedSession(session);
                                setShowSessionDetailsModal(true);
                              }}
                            >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                <span className="truncate">{session.customerName}</span>
                              </div>
                              <div className={`px-1 py-0.5 rounded text-xs ${getSessionStatusColor(session.status)}`}>
                                {session.status === 'scheduled' ? '' : session.status}
                              </div>
                            </div>
                            {(() => {
                              // Convert JavaScript getDay() (0=Sunday) to our system (1=Monday)
                              const jsDayOfWeek = new Date(session.date).getDay();
                              const dayOfWeek = jsDayOfWeek === 0 ? 7 : jsDayOfWeek; // Sunday becomes 7, Monday stays 1, etc.
                              const trainingDay = getTrainingDayForCustomer(session.customerName, session.customerId, dayOfWeek);
                              
                              // Always show specific training day if available, otherwise show generic type
                              const displayText = trainingDay || session.trainingType || 'Training';
                              
                              return (
                                <div className="text-xs text-gray-600 mt-1 truncate font-medium">
                                  {displayText}
                                </div>
                              );
                            })()}
                            <div className="text-xs text-gray-500 mt-1">
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Customer Summary */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((customer) => (
                <div key={customer.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{customer.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {customer.trainingFrequency}x per week
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      {customer.plan}
                    </div>
                    {customer.discount && customer.discount > 0 && (
                      <div className="flex items-center">
                        <Euro className="w-4 h-4 mr-2" />
                        {customer.discount}% discount
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
                      setShowSessionDetailsModal(false);
                      setShowEditModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSession(selectedSession.id)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Session Modal */}
        {showNewSessionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div
              className="bg-white rounded-2xl p-3 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                {sessionType === 'own-training' ? 'Schedule Own Training' : 'Create New Session'}
              </h3>
            
            {clickedTimeSlot && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Selected:</strong> {clickedTimeSlot.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {formatTime(clickedTimeSlot.time)}
                </p>
              </div>
            )}
              
              <div className="space-y-3 sm:space-y-4">
                {/* Session Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => setSessionType('client')}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-colors duration-200 ${
                        sessionType === 'client'
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Client Session</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setSessionType('own-training')}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-colors duration-200 ${
                        sessionType === 'own-training'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Own Training</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Customer Selection - Only show for client sessions */}
                {sessionType === 'client' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                    <select
                      value={newSessionData.customerId}
                      onChange={(e) => setNewSessionData(prev => ({ ...prev, customerId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="">Select a customer</option>
                      {customers
                        .filter(customer => !customer.name.includes('Own Training'))
                        .map(customer => {
                        const sessionInfo = getRemainingSessions(customer.id);
                        return (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} ({sessionInfo.scheduled}/{sessionInfo.total} sessions)
                          </option>
                        );
                      })}
                    </select>
                    
                    {/* Show session counter for selected customer */}
                    {newSessionData.customerId && (
                      <div className="mt-2 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xs sm:text-sm text-blue-800">
                          <strong>Session Progress:</strong> {getRemainingSessions(newSessionData.customerId).scheduled}/{getRemainingSessions(newSessionData.customerId).total} sessions scheduled
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {getRemainingSessions(newSessionData.customerId).remaining} sessions remaining
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  {/* V2 Time Selection - Simple List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto rose-scrollbar">
                    {timeSlots.map(time => {
                      const isAvailable = isTimeSlotAvailable(currentDay.toLocaleDateString('en-CA'), time);
                      const isBreak = isBreakTime(time);
                      const isSelected = newSessionData.startTime === time;
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            if (isAvailable && !isBreak) {
                              setNewSessionData(prev => ({ 
                                ...prev, 
                                startTime: time,
                                endTime: calculateEndTime(time)
                              }));
                            }
                          }}
                          disabled={!isAvailable || isBreak}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-colors duration-200 ${
                            isSelected 
                              ? 'border-rose-500 bg-rose-50 text-rose-700' 
                              : isAvailable && !isBreak
                                ? 'border-gray-200 bg-white hover:border-rose-300 hover:bg-rose-50 text-gray-700'
                                : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{formatTime(time)}</span>
                            <span className="text-sm">
                              {isBreak ? '(Break)' : !isAvailable ? '(Unavailable)' : isSelected ? '✓ Selected' : ''}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time (Auto-calculated)</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                    {newSessionData.startTime ? formatTime(calculateEndTime(newSessionData.startTime)) : 'Select start time first'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={newSessionData.notes}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add any notes for this session..."
                  />
                </div>

                {/* Recurring Sessions - Only show for client sessions */}
                {sessionType === 'client' && (
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <input
                        type="checkbox"
                        id="recurring"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                      />
                      <label htmlFor="recurring" className="text-xs sm:text-sm font-medium text-gray-700">
                        Schedule for all {recurringWeeks} weeks (recurring sessions)
                      </label>
                    </div>
                    
                    {isRecurring && (
                      <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-xs sm:text-sm text-yellow-800">
                          <strong>⚠️ Recurring Sessions:</strong> This will create {recurringWeeks} sessions 
                          every {newSessionData.startTime} on the same day of the week.
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">
                          Total sessions to be created: {recurringWeeks}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setShowNewSessionModal(false);
                    setClickedTimeSlot(null);
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  className="flex-1 px-3 sm:px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm sm:text-base"
                >
                  {sessionType === 'own-training' 
                    ? 'Schedule Training' 
                    : isRecurring 
                      ? `Create ${recurringWeeks} Sessions` 
                      : 'Create Session'
                  }
                </button>
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

    </div>
  );
}

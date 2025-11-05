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
  UserPlus,
  X,
  DollarSign
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
  type: '1:1' | 'group' | 'own-training' | 'workout-plan' | 'Intake Consultation' | 'block-time';
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
  const [paymentStatus, setPaymentStatus] = useState<{[customerId: string]: {isPaid: boolean, nextPaymentDate: string, amount: number, customerName: string}}>({});
  
  // Group data for group sessions - derived from customers with group plan
  const [groups, setGroups] = useState<Array<{
    id: string;
    name: string;
    members: Array<{ 
      id: string; 
      name: string; 
      completedSessions: number;
      totalSessions: number;
      progress: string;
    }>;
  }>>([]);

  // Function to generate groups from customer data
  const generateGroupsFromCustomers = async (customers: Customer[]) => {
    // Debug log removed for performance
    
    try {
      // Fetch group training pricing calculations
      const response = await fetch('/api/groups');
      if (!response.ok) {
        // Debug log removed for performance
        setGroups([]);
        return;
      }
      
      const groupData = await response.json();
      // Debug log removed for performance
      
      if (groupData.length === 0) {
        // Debug log removed for performance
        setGroups([]);
        return;
      }

      // Fetch session data for all customers to get progress
      const sessionResponse = await fetch('/api/training-sessions');
      const allSessions = sessionResponse.ok ? await sessionResponse.json() : [];
      
      // Fetch subscription data to get correct total sessions
      const subscriptionResponse = await fetch('/api/pricing-calculations');
      const allSubscriptions = subscriptionResponse.ok ? await subscriptionResponse.json() : [];
      
      // Create groups with session progress
      const groupsArray = groupData.map((group: any) => {
        const members = group.customerIds.map((customerId: string, index: number) => {
          const customerName = group.customerNames[index];
          
          // Calculate session progress for this customer
          const customerSessions = allSessions.filter((session: any) => 
            session.customerId === customerId
          );
          const completedSessions = customerSessions.filter((session: any) => 
            session.status === 'completed'
          ).length;
          
          // Get total sessions from subscription data (duration * frequency)
          // First try to find individual subscription, then group subscription
          let customerSubscription = allSubscriptions.find((sub: any) => 
            sub.customerId === customerId && sub.duration > 0
          );
          
          if (!customerSubscription) {
            customerSubscription = allSubscriptions.find((sub: any) => {
              if (sub.customerId && sub.customerId.includes(',')) {
                const customerIds = sub.customerId.split(',').map((id: string) => id.trim());
                return customerIds.includes(customerId) && sub.duration > 0;
              }
              return false;
            });
          }
          
          const totalSessions = customerSubscription 
            ? (customerSubscription.duration || 12) * (customerSubscription.frequency || 3)
            : customerSessions.length; // Fallback to actual sessions if no subscription
          
          // Debug log removed for performance
          
          return {
            id: customerId,
            name: customerName,
            completedSessions,
            totalSessions,
            progress: `${completedSessions}/${totalSessions}`
          };
        });

        return {
          id: group.id,
          name: group.name,
          members
        };
      });

      // Debug log removed for performance
      setGroups(groupsArray);
      
    } catch (error) {
      console.error('🔍 DEBUG: Error fetching groups:', error);
      setGroups([]);
    }
  };
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSessionDetailsModal, setShowSessionDetailsModal] = useState(false);
  // Initialize currentDayIndex to today's day (0 = Monday, 1 = Tuesday, etc.)
  const [currentDayIndex, setCurrentDayIndex] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Convert to our format: 0 = Monday, 1 = Tuesday, etc.
    // We only have 6 days (Mon-Sat -> indices 0..5). Map Sunday to Saturday (5).
    return dayOfWeek === 0 ? 5 : dayOfWeek - 1; // Sunday -> 5, Monday -> 0
  });
  const [trainingDays, setTrainingDays] = useState<{[key: string]: string}>({}); // customerId -> training day
  const [selectedDay, setSelectedDay] = useState<string | null>(() => {
    // Initialize with today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toLocaleDateString('en-CA');
  }); // Selected day for mobile view
  const [isMobile, setIsMobile] = useState(false); // Detect if device is mobile
  
  // New session form state
  const [newSessionData, setNewSessionData] = useState({
    customerId: '',
    startTime: '',
    endTime: '',
    notes: '',
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  });
  
  // Session type selection
  const [sessionType, setSessionType] = useState<'client' | 'own-training' | 'intake' | 'group' | 'block-time'>('client');
  
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
  
  // Recurring sessions state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(12);
  // Extra weekdays for recurring (0..5 -> Mon..Sat aligned with `days`)
  const [additionalRecurringDays, setAdditionalRecurringDays] = useState<number[]>([]);
  
  // Session counts state
  const [sessionCounts, setSessionCounts] = useState<{[key: string]: {scheduled: number, total: number, remaining: number}}>({});
  
  // State for clicking on time slots
  const [clickedTimeSlot, setClickedTimeSlot] = useState<{date: Date, time: string} | null>(null);
  
  // State for the selected date in the modal (when creating new session)
  const [modalSelectedDate, setModalSelectedDate] = useState<Date | null>(null);

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
  const isTimeSlotAvailable = (date: string, timeSlot: string, duration: number = 1, checkSessionType: string = sessionType) => {
    if (isBreakTime(timeSlot, date)) {
      return false;
    }
    
    // Adjust duration for group sessions (1.5 hours)
    const actualDuration = checkSessionType === 'group' ? 1.5 : duration;
    
    const [startHours, startMinutes] = timeSlot.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = startTimeInMinutes + (actualDuration * 60);
    
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

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to handle day selection and refresh data
  const handleDaySelection = (dayIndex: number) => {
    setCurrentDayIndex(dayIndex);
    const dateObj = currentWeekDates[dayIndex] || currentWeekDates[0];
    const selectedDate = dateObj ? dateObj.toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA');
    setSelectedDay(selectedDate);
  };

  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        if (isMobile) {
          // Use mobile-optimized API endpoint that loads only selected day data
          const selectedDate = selectedDay || currentWeekDates[0].toLocaleDateString('en-CA');
          
          const response = await fetch(`/api/schedule/mobile?date=${selectedDate}`);
          const data = await response.json();
          
          if (response.ok) {
            setCustomers(data.customers);
            
            // Generate groups from customer data
            await generateGroupsFromCustomers(data.customers);
            
            // Debug logs removed for performance
            
            // Transform sessions to ensure date format is correct and customer name is available
            const transformedSessions = data.sessions.map((session: any) => {
              return {
                ...session,
                customerName: (session.customerName || 'Unknown Customer').replace(/ completed?/gi, '').trim()
              };
            });
            
            setSessions(transformedSessions);
            addDebugLog(`Transformed ${transformedSessions.length} sessions`);
            
            // Set payment status from API response (optimized - no separate API calls needed!)
            if (data.paymentStatus) {
              const apiPaymentStatus = data.paymentStatus;
              const paymentData: {[customerId: string]: {isPaid: boolean, nextPaymentDate: string, amount: number, customerName: string}} = {};
              
              for (const [customerId, status] of Object.entries(apiPaymentStatus)) {
                // Try to get customer name from customers array first (more reliable)
                const customer = data.customers?.find((c: any) => c.id === customerId);
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
            console.error('Failed to load mobile schedule data:', data.error);
            setCustomers([]);
            setSessions([]);
          }
        } else {
          // Use desktop-optimized API endpoint that loads whole week data
          const startDate = currentWeekDates[0].toISOString().split('T')[0];
          const endDate = currentWeekDates[5].toISOString().split('T')[0];
          
          const response = await fetch(`/api/schedule/desktop?startDate=${startDate}&endDate=${endDate}`);
          const data = await response.json();
          
          if (response.ok) {
            setCustomers(data.customers);
            
            // Generate groups from customer data
            await generateGroupsFromCustomers(data.customers);
            
            // Debug logs removed for performance
            
            // Transform sessions to ensure date format is correct and customer name is available
            const transformedSessions = data.sessions.map((session: any) => {
              return {
                ...session,
                customerName: (session.customerName || 'Unknown Customer').replace(/ completed?/gi, '').trim()
              };
            });
            
            setSessions(transformedSessions);
            addDebugLog(`Transformed ${transformedSessions.length} sessions (desktop)`);
            
            // Set payment status from API response (optimized - no separate API calls needed!)
            if (data.paymentStatus) {
              const apiPaymentStatus = data.paymentStatus;
              const paymentData: {[customerId: string]: {isPaid: boolean, nextPaymentDate: string, amount: number, customerName: string}} = {};
              
              for (const [customerId, status] of Object.entries(apiPaymentStatus)) {
                // Try to get customer name from customers array first (more reliable)
                const customer = data.customers?.find((c: any) => c.id === customerId);
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
            console.error('Failed to load desktop schedule data:', data.error);
            setCustomers([]);
            setSessions([]);
          }
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
  }, [currentWeek, currentWeekDates, selectedDay, isMobile]);

  // Payment status is now loaded from schedule API (optimized - no separate calls needed)
  // This useEffect is no longer needed as payment status comes with schedule data

  // Auto-refresh sessions when they change
  useEffect(() => {
    const refreshSessions = async () => {
      try {
        if (isMobile) {
          const selectedDate = selectedDay || currentWeekDates[0].toLocaleDateString('en-CA');
          
          // Use mobile-optimized endpoint for session refresh
          const response = await fetch(`/api/schedule/mobile?date=${selectedDate}`);
          const data = await response.json();
          
          if (response.ok) {
            const transformedSessions = data.sessions.map((session: any) => {
              return {
                ...session,
                customerName: (session.customerName || 'Unknown Customer').replace(/ completed?/gi, '').trim()
              };
            });
            
            setSessions(transformedSessions);
          }
        } else {
          const startDate = currentWeekDates[0].toISOString().split('T')[0];
          const endDate = currentWeekDates[5].toISOString().split('T')[0];
          
          // Use desktop-optimized endpoint for session refresh
          const response = await fetch(`/api/schedule/desktop?startDate=${startDate}&endDate=${endDate}`);
          const data = await response.json();
          
          if (response.ok) {
            const transformedSessions = data.sessions.map((session: any) => {
              return {
                ...session,
                customerName: (session.customerName || 'Unknown Customer').replace(/ completed?/gi, '').trim()
              };
            });
            
            setSessions(transformedSessions);
          }
        }
      } catch (error) {
        console.error('Error refreshing sessions:', error);
      }
    };

    // Refresh every 30 seconds to catch any external changes
    const interval = setInterval(refreshSessions, 30000);
    
    return () => clearInterval(interval);
  }, [currentWeekDates, selectedDay, isMobile]);

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
      const newDayIndex = currentDayIndex - 1;
      setCurrentDayIndex(newDayIndex);
      const selectedDate = currentWeekDates[newDayIndex].toLocaleDateString('en-CA');
      setSelectedDay(selectedDate);
    } else if (direction === 'next' && currentDayIndex < 5) {
      const newDayIndex = currentDayIndex + 1;
      setCurrentDayIndex(newDayIndex);
      const selectedDate = currentWeekDates[newDayIndex].toLocaleDateString('en-CA');
      setSelectedDay(selectedDate);
    }
  };

  // Handle creating new training session
    const handleCreateSession = async () => {
      if (sessionType === 'client' && !newSessionData.customerId) {
        alert('Please select a customer for client sessions');
        return;
      }
      if (sessionType === 'group' && !newSessionData.customerId) {
        alert('Please select a group for group sessions');
        return;
      }
      if (sessionType === 'block-time' && !newSessionData.notes.trim()) {
        alert('Please enter a reason for blocking this time');
        return;
      }
    if (sessionType === 'intake' && (!newSessionData.clientName || !newSessionData.clientEmail || !newSessionData.clientPhone)) {
      alert('Please fill in all client details for intake sessions');
      return;
    }
    if (!newSessionData.startTime || !newSessionData.endTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Check if the selected time slot is available
    const selectedDate = modalSelectedDate || currentDay;
    const durationHours = sessionType === 'intake' ? 0.5 : 1;
    const isAvailable = isTimeSlotAvailable(selectedDate.toLocaleDateString('en-CA'), newSessionData.startTime, durationHours);
    if (!isAvailable) {
      alert('The selected time slot is not available. Please choose a different time.');
      return;
    }

    try {
      let customerId = newSessionData.customerId;
      
      // For intake sessions, create a new client first
      if (sessionType === 'intake') {
        const intakeResponse = await fetch('/api/intake', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newSessionData.clientName,
            email: newSessionData.clientEmail,
            phone: newSessionData.clientPhone,
            preferredDate: selectedDate.toLocaleDateString('en-CA'),
            preferredTime: newSessionData.startTime
          }),
        });

        if (!intakeResponse.ok) {
          const error = await intakeResponse.json();
          alert(error.error || 'Failed to create intake client');
          return;
        }

        const intakeData = await intakeResponse.json();
        customerId = intakeData.clientId;
      }
      
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
        const sessionsToCreate: any[] = [];
        const startDate = new Date(selectedDate);
        // Determine Monday of the start week
        const jsDay = startDate.getDay(); // 0..6 Sun..Sat
        const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
        const weekMonday = new Date(startDate);
        weekMonday.setDate(startDate.getDate() + diffToMonday);
        
        for (let week = 0; week < recurringWeeks; week++) {
          // Base day (selected date)
          const baseDate = new Date(startDate);
          baseDate.setDate(startDate.getDate() + (week * 7));
          sessionsToCreate.push({
            customerId: customerId,
            date: baseDate.toLocaleDateString('en-CA'),
            startTime: newSessionData.startTime,
            endTime: newSessionData.endTime,
            type: '1:1',
            status: 'scheduled',
            notes: newSessionData.notes
          });

          // Extra selected weekdays (exclude Friday=4 in our Mon..Sat mapping)
          for (const dayIndex of additionalRecurringDays) {
            if (dayIndex === 4) continue; // Friday closed
            const thisWeekMonday = new Date(weekMonday);
            thisWeekMonday.setDate(weekMonday.getDate() + (week * 7));
            const extraDate = new Date(thisWeekMonday);
            extraDate.setDate(thisWeekMonday.getDate() + dayIndex);
            // Skip if equals base date
            if (extraDate.toDateString() === baseDate.toDateString()) continue;
            sessionsToCreate.push({
              customerId: customerId,
              date: extraDate.toLocaleDateString('en-CA'),
              startTime: newSessionData.startTime,
              endTime: newSessionData.endTime,
              type: '1:1',
              status: 'scheduled',
              notes: newSessionData.notes
            });
          }
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
              customerName: (customers.find(c => c.id === newSession.customerId)?.name || 'Unknown Customer').replace(/ completed?/gi, '').trim()
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
      } else if (sessionType === 'group') {
        // Create sessions for group members
        const selectedGroup = groups.find(g => g.id === newSessionData.customerId);
        if (!selectedGroup) {
          alert('Selected group not found');
          return;
        }

        if (isRecurring) {
          // Create recurring sessions for multiple weeks for all group members
          const startDate = new Date(selectedDate);
          const jsDay = startDate.getDay();
          const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
          const weekMonday = new Date(startDate);
          weekMonday.setDate(startDate.getDate() + diffToMonday);
          const sessionsToCreate: any[] = [];
          
          // Track sessions per member to respect their limits
          const memberSessionCounts: Record<string, number> = {};
          selectedGroup.members.forEach(member => {
            memberSessionCounts[member.id] = 0;
          });
          
          for (let week = 0; week < recurringWeeks; week++) {
            // Base day
            const baseDate = new Date(startDate);
            baseDate.setDate(startDate.getDate() + (week * 7));
            const baseStr = baseDate.toLocaleDateString('en-CA');
            selectedGroup.members.forEach(member => {
              // Check if member has remaining sessions
              const remainingSessions = member.totalSessions - member.completedSessions;
              if (memberSessionCounts[member.id] < remainingSessions) {
                sessionsToCreate.push({
                  customerId: member.id,
                  date: baseStr,
                  startTime: newSessionData.startTime,
                  endTime: newSessionData.endTime,
                  type: 'group',
                  status: 'scheduled',
                  notes: newSessionData.notes
                });
                memberSessionCounts[member.id]++;
              }
            });

            // Extra weekdays for each week (skip Friday)
            for (const dayIndex of additionalRecurringDays) {
              if (dayIndex === 4) continue; // Friday closed
              const thisWeekMonday = new Date(weekMonday);
              thisWeekMonday.setDate(weekMonday.getDate() + (week * 7));
              const extraDate = new Date(thisWeekMonday);
              extraDate.setDate(thisWeekMonday.getDate() + dayIndex);
              const dateStr = extraDate.toLocaleDateString('en-CA');
              // Avoid duplicating base day
              if (dateStr === baseStr) continue;
              selectedGroup.members.forEach(member => {
                // Check if member has remaining sessions
                const remainingSessions = member.totalSessions - member.completedSessions;
                if (memberSessionCounts[member.id] < remainingSessions) {
                  sessionsToCreate.push({
                    customerId: member.id,
                    date: dateStr,
                    startTime: newSessionData.startTime,
                    endTime: newSessionData.endTime,
                    type: 'group',
                    status: 'scheduled',
                    notes: newSessionData.notes
                  });
                  memberSessionCounts[member.id]++;
                }
              });
            }
          }
          
          // Log how many sessions were scheduled per member
          // Debug logs removed for performance

          const createPromises = sessionsToCreate.map(sessionData => 
            fetch('/api/training-sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
                customerName: selectedGroup.members.find(m => m.id === newSession.customerId)?.name || 'Unknown Member'
              });
            }
          }

          if (successfulSessions.length > 0) {
            setSessions(prev => [...prev, ...successfulSessions]);
            alert(`Successfully created ${successfulSessions.length} recurring group sessions for ${selectedGroup.name}!`);
            window.location.reload();
          } else {
            alert('Failed to create recurring group sessions');
          }
        } else {
          // Single-week group create (existing behavior)
          const sessionsToCreate = selectedGroup.members.map(member => ({
            customerId: member.id,
            date: selectedDate.toLocaleDateString('en-CA'),
            startTime: newSessionData.startTime,
            endTime: newSessionData.endTime,
            type: 'group',
            status: 'scheduled',
            notes: newSessionData.notes
          }));

          const createPromises = sessionsToCreate.map(sessionData => 
            fetch('/api/training-sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
                customerName: selectedGroup.members.find(m => m.id === newSession.customerId)?.name || 'Unknown Member'
              });
            }
          }

          if (successfulSessions.length > 0) {
            setSessions(prev => [...prev, ...successfulSessions]);
            alert(`Successfully created ${successfulSessions.length} group sessions for ${selectedGroup.name}!`);
            window.location.reload();
          } else {
            alert('Failed to create any group sessions');
          }
        }
      } else if (sessionType === 'block-time') {
        // Create block time session
        const response = await fetch('/api/training-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: 'cmgf1fmsj000m6ofa4y22whbd', // Blocked time system user ID
            date: selectedDate.toLocaleDateString('en-CA'),
            startTime: newSessionData.startTime,
            endTime: newSessionData.endTime,
            type: 'block-time',
            status: 'scheduled',
            notes: newSessionData.notes
          }),
        });

        if (response.ok) {
          const newSession = await response.json();
          setSessions(prev => [...prev, {
            ...newSession,
            customerName: 'Blocked Time'
          }]);
          alert('Time blocked successfully!');
          setShowNewSessionModal(false);
          setNewSessionData({ customerId: '', startTime: '', endTime: '', notes: '', clientName: '', clientEmail: '', clientPhone: '' });
          // Force refresh to ensure UI updates
          window.location.reload();
        } else {
          alert('Failed to block time');
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
            date: selectedDate.toLocaleDateString('en-CA'),
            startTime: newSessionData.startTime,
            endTime: newSessionData.endTime,
            type: sessionType === 'own-training' ? 'own-training' : sessionType === 'intake' ? 'Intake Consultation' : '1:1',
            status: 'scheduled',
            notes: newSessionData.notes
          }),
        });

        if (response.ok) {
          const newSession = await response.json();
          setSessions(prev => [...prev, {
            ...newSession,
            customerName: (customers.find(c => c.id === newSession.customerId)?.name || 'Unknown Customer').replace(/ completed?/gi, '').trim()
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
      setModalSelectedDate(null);
      setSessionType('client');
      setIsRecurring(false);
      setRecurringWeeks(12);
      setNewSessionData({
        customerId: '',
        startTime: '',
        endTime: '',
        notes: '',
        clientName: '',
        clientEmail: '',
        clientPhone: ''
      });
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    }
  };

  // Handle deleting a session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    // Ask if we should delete the full recurring series
    const deleteSeries = confirm('Delete all recurring sessions in this weekly series (e.g., all 12x)?\nOK = delete entire series, Cancel = delete only this one');

    try {
      const url = deleteSeries
        ? `/api/training-sessions/${sessionId}?series=true`
        : `/api/training-sessions/${sessionId}`;

      const response = await fetch(url, { method: 'DELETE' });

      if (response.ok) {
        // Remove session from local state (and refresh to reflect series deletion)
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        setShowSessionDetailsModal(false);
        setSelectedSession(null);
        const result = await response.json().catch(() => null);
        if (deleteSeries && result?.deletedCount) {
          alert(`Deleted ${result.deletedCount} sessions in the series.`);
        }
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
        // Debug log removed for performance
        
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
      case 'group': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'own-training': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'workout-plan': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Intake Consultation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'block-time': return 'bg-red-100 text-red-800 border-red-200';
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
      // Use data already loaded from mobile API instead of making new calls
      const customer = customers.find(c => c.id === customerId);
      if (customer && customer.customerWorkouts) {
        return customer.customerWorkouts.filter((workout: any) => workout.status === 'active');
      }
      return [];
    } catch (error) {
      console.error('Error getting customer workouts:', error);
      return [];
    }
  };

  // Function to load training days for all customers
  const loadTrainingDays = async () => {
    const trainingDaysMap: {[key: string]: string} = {};
    
    for (const customer of customers) {
      try {
        // Use data already loaded from mobile API instead of making new calls
        if (customer.scheduleAssignments && customer.scheduleAssignments.length > 0) {
          const workout = customer.scheduleAssignments[0]; // Get the first active workout
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
  const getTrainingDayForCustomer = (customerName: string, customerId: string, sessionDate: Date) => {
    // Get customer data to check for assigned workouts
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
      return null;
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
      .filter(s => s.customerId === customerId && s.date >= weekStart && s.date <= weekEnd)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
    
    // Find the position of this session date in the week
    const sessionDateStr = sessionDate.toISOString().split('T')[0];
    const sessionIndex = weekSessions.findIndex(s => s.date === sessionDateStr);
    const trainingDayNumber = sessionIndex + 1; // 1st session = Day 1, 2nd = Day 2, etc.
    
    // Check schedule assignments using trainingDay
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

  // Calculate end time automatically (+30 min for intake, +90 min for group, +60 min otherwise)
  const calculateEndTime = (startTime: string) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':');
    const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
    const addMinutes = sessionType === 'intake' ? 30 : sessionType === 'group' ? 90 : 60;
    const endMinutes = startMinutes + addMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Ensure end time reflects current session type duration rules
  useEffect(() => {
    if (newSessionData.startTime) {
      setNewSessionData(prev => ({
        ...prev,
        endTime: calculateEndTime(prev.startTime)
      }));
    }
  }, [sessionType, newSessionData.startTime]);

  // Load session counts for all customers
  const loadSessionCounts = async () => {
    const counts: {[key: string]: {scheduled: number, total: number, remaining: number}} = {};
    
    // Fetch subscription data to get correct total sessions
    const subscriptionResponse = await fetch('/api/pricing-calculations');
    const allSubscriptions = subscriptionResponse.ok ? await subscriptionResponse.json() : [];
    
    for (const customer of customers) {
      // Get total sessions from subscription data (duration * frequency)
      // First try to find individual subscription, then group subscription
      let customerSubscription = allSubscriptions.find((sub: any) => 
        sub.customerId === customer.id && sub.duration > 0
      );
      
      if (!customerSubscription) {
        customerSubscription = allSubscriptions.find((sub: any) => {
          if (sub.customerId && sub.customerId.includes(',')) {
            const customerIds = sub.customerId.split(',').map((id: string) => id.trim());
            return customerIds.includes(customer.id) && sub.duration > 0;
          }
          return false;
        });
      }
      
      const totalSessions = customerSubscription 
        ? (customerSubscription.duration || 12) * (customerSubscription.frequency || 3)
        : customer.trainingFrequency * 12; // Fallback to old logic
      
      try {
        // Use data already loaded from mobile API instead of making new calls
        // Count scheduled sessions from the already loaded sessions data
        const scheduledSessions = sessions.filter(session => 
          session.customerId === customer.id && 
          session.status === 'scheduled'
        ).length;
        
        counts[customer.id] = {
          scheduled: scheduledSessions,
          total: totalSessions,
          remaining: totalSessions - scheduledSessions
        };
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
    setModalSelectedDate(date); // Set the selected date for the modal
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
                onClick={() => setShowDebugModal(true)}
                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors duration-200"
              >
                <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="text-sm md:text-base">Debug Logs</span>
              </button>
              <button
                onClick={handleAutoCompleteSessions}
                className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors duration-200"
              >
                <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="text-sm md:text-base">Auto Complete</span>
              </button>
              <button
                onClick={() => {
                  setModalSelectedDate(currentDay); // Set the selected date to current day
                  setShowNewSessionModal(true);
                }}
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
                  onChange={(e) => {
                    const newDayIndex = parseInt(e.target.value);
                    setCurrentDayIndex(newDayIndex);
                    const selectedDate = currentWeekDates[newDayIndex].toLocaleDateString('en-CA');
                    setSelectedDay(selectedDate);
                  }}
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
                      {isBreakTime(timeSlot, currentDay.toLocaleDateString('en-CA')) && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Break</span>
                      )}
                    </div>
                    
                    {/* Payment Reminders at 08:30 */}
                    {timeSlot === '08:30' && (() => {
                      const dayStr = currentDay.toLocaleDateString('en-CA');
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
                          key={`payment-${reminder.customerId}`}
                          className={`mt-2 p-3 rounded-lg border-2 ${
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
                              {session.type === 'block-time' ? (
                                <Clock className="w-3 h-3 mr-2" />
                              ) : (
                                <User className="w-3 h-3 mr-2" />
                              )}
                              <span className="truncate">
                                {session.type === 'block-time' 
                                  ? `Blocked: ${session.notes || 'No reason provided'}`
                                  : session.customerName.replace(/ completed?/gi, '').trim()
                                }
                              </span>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${getSessionStatusColor(session.status)}`}>
                              {session.status === 'scheduled' ? '' : session.status}
                            </div>
                          </div>
                        {(() => {
                          const trainingDay = getTrainingDayForCustomer(session.customerName, session.customerId, new Date(session.date));
                          
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
                        {/* Payment Reminders at 08:30 */}
                        {timeSlot === '08:30' && (() => {
                          const dayStr = date.toLocaleDateString('en-CA');
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
                              key={`payment-${reminder.customerId}`}
                              className={`mb-1 p-2 rounded-lg border-2 text-xs ${
                                reminder.daysUntil < 0 
                                  ? 'bg-red-50 border-red-300' 
                                  : reminder.daysUntil <= 3 
                                  ? 'bg-orange-50 border-orange-300'
                                  : 'bg-yellow-50 border-yellow-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1">
                                  <Clock className={`w-3 h-3 ${
                                    reminder.daysUntil < 0 
                                      ? 'text-red-600' 
                                      : reminder.daysUntil <= 3 
                                      ? 'text-orange-600'
                                      : 'text-yellow-600'
                                  }`} />
                                  <span className={`font-semibold ${
                                    reminder.daysUntil < 0 
                                      ? 'text-red-800' 
                                      : reminder.daysUntil <= 3 
                                      ? 'text-orange-800'
                                      : 'text-yellow-800'
                                  }`}>
                                    Next Payment
                                  </span>
                                </div>
                                <span className={`font-bold ${
                                  reminder.daysUntil < 0 
                                    ? 'text-red-700' 
                                    : reminder.daysUntil <= 3 
                                    ? 'text-orange-700'
                                    : 'text-yellow-700'
                                }`}>
                                  {reminder.amount} RON
                                </span>
                              </div>
                              <div className="text-gray-700 text-xs">
                                <div className="truncate font-medium">{reminder.customerName}</div>
                                <div className="mt-0.5">
                                  {new Date(reminder.nextPaymentDate).toLocaleDateString('ro-RO')}
                                </div>
                                <div className="mt-0.5">
                                  {reminder.daysUntil < 0 ? (
                                    <span className="text-red-600 font-semibold">Overdue {Math.abs(reminder.daysUntil)}d</span>
                                  ) : reminder.daysUntil === 0 ? (
                                    <span className="text-red-600 font-semibold">Due today</span>
                                  ) : (
                                    <span>{reminder.daysUntil} days</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                        
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
                                {session.type === 'block-time' ? (
                                  <Clock className="w-3 h-3 mr-1" />
                                ) : (
                                  <User className="w-3 h-3 mr-1" />
                                )}
                                <span className="truncate">
                                  {session.type === 'block-time' 
                                    ? `Blocked: ${session.notes || 'No reason provided'}`
                                    : session.customerName.replace(/ completed?/gi, '').trim()
                                  }
                                </span>
                              </div>
                              <div className={`px-1 py-0.5 rounded text-xs ${getSessionStatusColor(session.status)}`}>
                                {session.status === 'scheduled' ? '' : session.status}
                              </div>
                            </div>
                            {(() => {
                              const trainingDay = getTrainingDayForCustomer(session.customerName, session.customerId, new Date(session.date));
                              
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
                    {selectedSession.type === 'block-time' ? 'Block Reason' : 'Customer'}
                  </label>
                  <p className="text-gray-800">
                    {selectedSession.type === 'block-time' 
                      ? selectedSession.notes || 'No reason provided'
                      : selectedSession.customerName
                    }
                  </p>
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
              {sessionType === 'own-training' ? 'Schedule Own Training' : 
               sessionType === 'intake' ? 'Create Intake Session' : 
               sessionType === 'group' ? 'Create Group Session' : 
               sessionType === 'block-time' ? 'Block Time' : 'Create New Session'}
            </h3>
            
            {(clickedTimeSlot || modalSelectedDate) && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Selected:</strong> {(clickedTimeSlot?.date || modalSelectedDate)?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} {clickedTimeSlot ? `at ${formatTime(clickedTimeSlot.time)}` : ''}
                </p>
              </div>
            )}
              
              <div className="space-y-3 sm:space-y-4">
                {/* Session Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
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
                      onClick={() => setSessionType('intake')}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-colors duration-200 ${
                        sessionType === 'intake'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Intake</span>
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
                    <button
                      onClick={() => setSessionType('group')}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-colors duration-200 ${
                        sessionType === 'group'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Group Session</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setSessionType('block-time')}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-colors duration-200 ${
                        sessionType === 'block-time'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Block Time</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Customer Selection - Show for client sessions */}
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

                {/* Group Selection - Show for group sessions */}
                {sessionType === 'group' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Groep</label>
                    <select
                      value={newSessionData.customerId}
                      onChange={(e) => setNewSessionData(prev => ({ ...prev, customerId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Selecteer een groep</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name} ({group.members.length} leden)
                        </option>
                      ))}
                    </select>
                    
                    {/* Show group members for selected group */}
                    {newSessionData.customerId && (
                      <div className="mt-2 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xs sm:text-sm text-green-800 mb-2">
                          <strong>Groepsleden:</strong>
                        </div>
                        <div className="space-y-1">
                          {groups.find(g => g.id === newSessionData.customerId)?.members.map(member => (
                            <div key={member.id} className="text-xs text-green-700 flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                {member.name}
                              </div>
                              <span className="text-xs font-medium bg-green-100 px-2 py-1 rounded">
                                {member.progress}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Intake Client Details - Only show for intake sessions */}
                {sessionType === 'intake' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                      <input
                        type="text"
                        value={newSessionData.clientName || ''}
                        onChange={(e) => setNewSessionData(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Enter client name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={newSessionData.clientEmail || ''}
                        onChange={(e) => setNewSessionData(prev => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="Enter client email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={newSessionData.clientPhone || ''}
                        onChange={(e) => setNewSessionData(prev => ({ ...prev, clientPhone: e.target.value }))}
                        placeholder="Enter client phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Block Time Description - Show for block time sessions */}
                {sessionType === 'block-time' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Block Reason *</label>
                    <textarea
                      value={newSessionData.notes}
                      onChange={(e) => setNewSessionData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter reason for blocking this time (e.g., Doctor appointment, Personal meeting, etc.)"
                      rows={3}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">This description will be visible in the schedule</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  {/* V2 Time Selection - Simple List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto rose-scrollbar">
                    {timeSlots.map(time => {
                      const selectedDate = modalSelectedDate || currentDay;
                      const durationHours = sessionType === 'intake' ? 0.5 : 1;
                      const isAvailable = isTimeSlotAvailable(selectedDate.toLocaleDateString('en-CA'), time, durationHours);
                      const isBreak = isBreakTime(time, selectedDate.toLocaleDateString('en-CA'));
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

                {/* Recurring Sessions - show for client and group sessions */}
                {(sessionType === 'client' || sessionType === 'group') && (
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
                      <>
                        <div className="flex items-center gap-3 mb-2">
          <label className="text-xs sm:text-sm text-gray-700">Duration:</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRecurringWeeks(4)}
              className={`px-2 py-1 text-xs rounded border ${recurringWeeks === 4 ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              4 weeks
            </button>
            <button
              type="button"
              onClick={() => setRecurringWeeks(12)}
              className={`px-2 py-1 text-xs rounded border ${recurringWeeks === 12 ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              12 weeks
            </button>
          </div>
        </div>
                        {/* Extra weekdays (Mon..Sat, skip Friday and base day) */}
                        {(() => {
                          const baseDate = (modalSelectedDate || currentDay);
                          const jsDay = new Date(baseDate).getDay();
                          // Map JS day (Sun=0..Sat=6) to our Mon..Sat index (0..5)
                          const baseIndex = jsDay === 0 ? 5 : jsDay - 1;
                          return (
                            <div className="mb-2">
                              <div className="text-xs sm:text-sm text-gray-700 mb-1">Also repeat on:</div>
                              <div className="flex flex-wrap gap-2">
                                {days.map((d, idx) => {
                                  const disabled = idx === 4 || idx === baseIndex; // Friday or base
                                  const active = additionalRecurringDays.includes(idx);
                                  return (
                                    <button
                                      key={d}
                                      type="button"
                                      disabled={disabled}
                                      onClick={() => {
                                        setAdditionalRecurringDays(prev => {
                                          if (prev.includes(idx)) return prev.filter(x => x !== idx);
                                          return [...prev, idx];
                                        });
                                      }}
                                      className={`px-2 py-1 text-xs rounded border ${disabled ? 'opacity-40 cursor-not-allowed' : active ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-700 border-gray-300'}`}
                                    >
                                      {d.slice(0, 3)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                        <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-xs sm:text-sm text-yellow-800">
                            <strong>⚠️ Recurring Sessions:</strong> This will create {recurringWeeks} sessions 
                            every {newSessionData.startTime} on the same day of the week.
                          </div>
                          <div className="text-xs text-yellow-600 mt-1">
                            Total sessions to be created: {recurringWeeks}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setShowNewSessionModal(false);
                    setClickedTimeSlot(null);
                    setModalSelectedDate(null);
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
                : sessionType === 'intake'
                  ? 'Create Intake Session'
                  : sessionType === 'group'
                    ? (isRecurring ? `Create ${recurringWeeks}x Group Sessions` : 'Create Group Session')
                    : sessionType === 'block-time'
                      ? 'Block Time'
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
                    {selectedSession.type === 'block-time' ? 'Block Reason' : 'Customer'}
                  </label>
                  <p className="text-gray-800">
                    {selectedSession.type === 'block-time' 
                      ? selectedSession.notes || 'No reason provided'
                      : selectedSession.customerName
                    }
                  </p>
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

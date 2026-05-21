'use client';

import { useState, useEffect, useMemo, useCallback, type MouseEvent } from 'react';
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
  DollarSign,
  Search,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { getWeekDates } from '@/lib/utils';
import { onlineTheme } from '@/lib/onlineTheme';
import {
  ADMIN_PRIMARY_GRADIENT,
  adminCardStyle as cardStyle,
  adminInnerCardStyle as innerCardStyle,
  adminInputClassName as inputClassName,
  adminGhostBtnClassName as ghostBtnClassName,
  adminPrimaryBtnClassName as primaryBtnClassName,
} from '@/lib/adminStyles';

const PRIMARY_GRADIENT = ADMIN_PRIMARY_GRADIENT;

const statusButtonClass = (status: string, active: boolean) => {
  const base =
    'rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors border';
  if (!active) {
    return `${base} border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08]`;
  }
  switch (status) {
    case 'completed':
      return `${base} border-emerald-400/40 bg-emerald-500 text-white shadow-md shadow-emerald-500/30`;
    case 'cancelled':
      return `${base} border-red-400/40 bg-red-500 text-white`;
    case 'scheduled':
      return `${base} border-rose-400/40 bg-gradient-to-r ${PRIMARY_GRADIENT} text-white`;
    case 'no-show':
      return `${base} border-orange-400/40 bg-orange-500 text-white`;
    default:
      return `${base} border-white/20 bg-white/10 text-white`;
  }
};

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
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]); // All customers for search
  const [loading, setLoading] = useState(true);
  
  // Customer search state
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
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

  // Groups now provided directly via API response

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
    
    // Lunch break: 12:30-13:00 (always applies except Friday and Saturday)
    const lunchBreakStart = 12 * 60 + 30;  // 12:30
    const lunchBreakEnd = 13 * 60 + 0;     // 13:00
    
    // Evening break: 17:00-19:00 (only applies to Friday and Saturday)
    const eveningBreakStart = 17 * 60 + 0;   // 17:00
    const eveningBreakEnd = 19 * 60 + 0;     // 19:00
    
    // Sunday (0): whole day not available
    if (dayOfWeek === 0) {
      return true; // All time slots unavailable on Sunday
    }
    
    // Friday (5) and Saturday (6): no breaks (removed as requested)
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return false; // No breaks on Friday and Saturday
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
    
    // Use consistent date formatting - get local date parts to avoid timezone issues
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const normalizedDate = `${year}-${month}-${day}`;
    
    // Debug for Saturday Nov 8
    if (normalizedDate === '2025-11-08') {
      console.log(`🔍 isTimeSlotAvailable: Checking ${normalizedDate} at ${timeSlot}`);
      console.log(`📊 Total sessions in state:`, sessions.length);
    }
    
    // Filter sessions for the specific date only - use string comparison directly
    const sessionsForDate = sessions.filter(session => {
      // Compare date strings directly (both should be in YYYY-MM-DD format)
      const sessionDateStr = session.date;
      const matches = sessionDateStr === normalizedDate && session.status === 'scheduled';
      
      if (normalizedDate === '2025-11-08' && matches) {
        console.log(`📋 Found scheduled session for ${normalizedDate}: ${session.startTime}-${session.endTime} ${session.customerName}`);
      }
      
      return matches;
    });
    
    if (normalizedDate === '2025-11-08') {
      console.log(`📊 Scheduled sessions for ${normalizedDate}:`, sessionsForDate.length, sessionsForDate.map(s => `${s.startTime}-${s.endTime}`));
    }
    
    const canAutoGroupFromCreateType = (createType: string) =>
      createType === 'client' || createType === 'group' || createType === 'intake';

    const canAutoGroupExistingSessionType = (existingType: string) =>
      existingType === '1:1' || existingType === 'group' || existingType === 'Intake Consultation';

    // Check for conflicts with existing sessions for this specific date.
    // We allow exact same slot for client/group/intake so bookings can auto-form groups.
    const hasConflict = sessionsForDate.some(session => {
      const [sessionStartHours, sessionStartMinutes] = session.startTime.split(':').map(Number);
      const [sessionEndHours, sessionEndMinutes] = session.endTime.split(':').map(Number);
      const sessionStartTimeInMinutes = sessionStartHours * 60 + sessionStartMinutes;
      const sessionEndTimeInMinutes = sessionEndHours * 60 + sessionEndMinutes;
      
      // Check for overlap: two time ranges overlap if one starts before the other ends
      // and ends after the other starts
      const hasOverlap = startTimeInMinutes < sessionEndTimeInMinutes && 
                        endTimeInMinutes > sessionStartTimeInMinutes;
      
      if (normalizedDate === '2025-11-08' && hasOverlap) {
        console.log(`⚠️ CONFLICT: ${timeSlot} overlaps with ${session.startTime}-${session.endTime}`);
      }

      if (!hasOverlap) return false;

      const isExactSameSlot =
        startTimeInMinutes === sessionStartTimeInMinutes &&
        endTimeInMinutes === sessionEndTimeInMinutes;

      const canShareExactSlot =
        isExactSameSlot &&
        canAutoGroupFromCreateType(checkSessionType) &&
        canAutoGroupExistingSessionType(session.type);

      return !canShareExactSlot;
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

  // Function to load schedule data (extracted to be reusable)
  const loadScheduleData = useCallback(async () => {
    try {
      if (isMobile) {
        // Use mobile-optimized API endpoint that loads only selected day data
        const selectedDate = selectedDay || currentWeekDates[0].toLocaleDateString('en-CA');
        
        const url = `/api/schedule/mobile?date=${selectedDate}`;
        
        // Always fetch fresh data without caching
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data) {
          setCustomers(data.customers);
          if (data.groups) {
            setGroups(data.groups);
          }
          
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
        }
      } else {
          // Use desktop-optimized API endpoint that loads whole week data
          // Include all 6 days: Monday (0) through Saturday (5)
          // Use consistent date formatting to avoid timezone issues
          const mondayDate = currentWeekDates[0];
          const saturdayDate = currentWeekDates[5] || currentWeekDates[currentWeekDates.length - 1];
          
          // Format dates using local date parts to avoid timezone shifts
          const formatDateForAPI = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          
          const startDate = formatDateForAPI(mondayDate);
          const endDate = formatDateForAPI(saturdayDate);
          
          console.log(`🔍 Loading schedule data: startDate=${startDate}, endDate=${endDate}`);
          console.log(`📅 Week dates:`, currentWeekDates.map(d => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }));
          
          const url = `/api/schedule/desktop?startDate=${startDate}&endDate=${endDate}`;
          
          // Always fetch fresh data without caching
          const response = await fetch(url, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          
          if (data) {
            setCustomers(data.customers);
            if (data.groups) {
              setGroups(data.groups);
            }
            
            // Debug logs removed for performance
            
            // Transform sessions to ensure date format is correct and customer name is available
            const transformedSessions = data.sessions.map((session: any) => {
              return {
                ...session,
                customerName: (session.customerName || 'Unknown Customer').replace(/ completed?/gi, '').trim()
              };
            });
            
            // DEBUG: Always log to console for Saturday Nov 8
            console.log(`🔍 MobileScheduleClient (desktop mode): Loading schedule data for ${startDate} to ${endDate}`);
            console.log(`📊 Total sessions received from API: ${data.sessions?.length || 0}`);
            console.log(`📋 ALL sessions from API:`, data.sessions);
            
            const saturdaySessions = transformedSessions.filter((s: any) => s.date === '2025-11-08' || s.date?.includes('2025-11-08'));
            console.log(`🔍 Sessions matching '2025-11-08':`, saturdaySessions);
            
            // Check for sessions with dates close to Nov 8 (maybe timezone issue)
            const nov7Sessions = transformedSessions.filter((s: any) => s.date === '2025-11-07' || s.date?.includes('2025-11-07'));
            const nov8Sessions = transformedSessions.filter((s: any) => s.date === '2025-11-08' || s.date?.includes('2025-11-08'));
            const nov9Sessions = transformedSessions.filter((s: any) => s.date === '2025-11-09' || s.date?.includes('2025-11-09'));
            console.log(`📅 Sessions for Nov 7:`, nov7Sessions.length);
            console.log(`📅 Sessions for Nov 8:`, nov8Sessions.length);
            console.log(`📅 Sessions for Nov 9:`, nov9Sessions.length);
            
            const allDates = transformedSessions.map((s: any) => s.date).filter((d: string, i: number, arr: string[]) => arr.indexOf(d) === i);
            console.log(`📅 All unique dates in response:`, allDates);
            
            // Also check raw session dates before transformation
            if (data.sessions && data.sessions.length > 0) {
              console.log(`📋 Raw session dates (first 5):`, data.sessions.slice(0, 5).map((s: any) => ({ 
                rawDate: s.date, 
                dateType: typeof s.date,
                dateInstance: s.date instanceof Date ? 'Date' : 'not Date',
                isoString: s.date instanceof Date ? s.date.toISOString() : 'N/A'
              })));
            }
            
            if (saturdaySessions.length > 0) {
              console.log(`✅ MobileScheduleClient: Found ${saturdaySessions.length} sessions for Saturday Nov 8:`, saturdaySessions.map((s: any) => `${s.startTime}-${s.endTime} ${s.customerName} (${s.status})`));
            } else {
              console.log(`⚠️ MobileScheduleClient: No sessions found for Saturday Nov 8. Total: ${transformedSessions.length}`);
              console.log(`📋 First 5 sessions:`, transformedSessions.slice(0, 5).map((s: any) => ({ date: s.date, time: s.startTime, customer: s.customerName, status: s.status })));
            }
            
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
          }
        }
      } catch (error) {
        console.error('Error loading schedule data:', error);
        setCustomers([]);
        setSessions([]);
      } finally {
        setLoading(false);
      }
  }, [isMobile, selectedDay, currentWeekDates]);

  useEffect(() => {
    loadScheduleData();
  }, [currentWeek, currentWeekDates, selectedDay, isMobile, loadScheduleData]);

  // Load all customers for search (only once on mount)
  useEffect(() => {
    const loadAllCustomers = async () => {
      try {
        const response = await fetch('/api/users?limit=1000');
        if (response.ok) {
          const data = await response.json();
          const customerList = (data.users || data || []).filter((customer: Customer) => 
            !customer.name?.includes('Own Training') && 
            !customer.email?.includes('mihaela@mihaelafitness.com') &&
            !customer.email?.includes('demo@mihaelafitness.com')
          );
          setAllCustomers(customerList);
        }
      } catch (error) {
        console.error('Error loading all customers:', error);
      }
    };
    loadAllCustomers();
  }, []);

  // Filter customers based on search query
  useEffect(() => {
    if (customerSearchQuery.length >= 3) {
      const query = customerSearchQuery.toLowerCase();
      const filtered = allCustomers.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(true);
    } else if (customerSearchQuery.length === 0) {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
    } else {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
    }
  }, [customerSearchQuery, allCustomers]);

  // Handle customer selection from dropdown
  const handleCustomerSelect = (customerId: string) => {
    setNewSessionData(prev => ({ ...prev, customerId }));
    const selectedCustomer = allCustomers.find(c => c.id === customerId);
    if (selectedCustomer) {
      setCustomerSearchQuery(selectedCustomer.name);
    }
    setShowCustomerDropdown(false);
  };

  // Handle "Show all customers" option
  const handleShowAllCustomers = () => {
    setFilteredCustomers(allCustomers);
    setShowCustomerDropdown(true);
  };

  // Payment status is now loaded from schedule API (optimized - no separate calls needed)
  // This useEffect is no longer needed as payment status comes with schedule data

  // Auto-refresh sessions when they change
  useEffect(() => {
    const refreshSessions = async () => {
      try {
        if (isMobile) {
          const selectedDate = selectedDay || currentWeekDates[0].toLocaleDateString('en-CA');
          
          // Use mobile-optimized endpoint for session refresh (no cache)
          const response = await fetch(`/api/schedule/mobile?date=${selectedDate}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
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
          // Use consistent date formatting to avoid timezone issues (same as loadScheduleData)
          const mondayDate = currentWeekDates[0];
          const saturdayDate = currentWeekDates[5] || currentWeekDates[currentWeekDates.length - 1];
          
          // Format dates using local date parts to avoid timezone shifts
          const formatDateForAPI = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          
          const startDate = formatDateForAPI(mondayDate);
          const endDate = formatDateForAPI(saturdayDate);
          
          console.log(`🔄 Refreshing sessions: startDate=${startDate}, endDate=${endDate}`);
          
          // Use desktop-optimized endpoint for session refresh (no cache)
          const response = await fetch(`/api/schedule/desktop?startDate=${startDate}&endDate=${endDate}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          
          if (data) {
            const transformedSessions = data.sessions.map((session: any) => {
              return {
                ...session,
                customerName: (session.customerName || 'Unknown Customer').replace(/ completed?/gi, '').trim()
              };
            });
            
            console.log(`🔄 Refresh: Loaded ${transformedSessions.length} sessions, dates:`, 
              [...new Set(transformedSessions.map((s: any) => s.date))]);
            
            setSessions(transformedSessions);
          }
        }
      } catch (error) {
        console.error('Error refreshing sessions:', error);
      }
    };

    // Refresh every 60 seconds to catch any external changes (reduced frequency for performance)
    const interval = setInterval(refreshSessions, 60000);
    
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

  // Close customer dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.customer-search-container')) {
        setShowCustomerDropdown(false);
      }
    };
    
    if (showCustomerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCustomerDropdown]);

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
          // Close modal first
          setShowNewSessionModal(false);
          // Reset form
          setNewSessionData({ customerId: '', startTime: '', endTime: '', notes: '', clientName: '', clientEmail: '', clientPhone: '' });
          setSessionType('client');
          setIsRecurring(false);
          setRecurringWeeks(12);
          setClickedTimeSlot(null);
          setModalSelectedDate(null);
          // Refresh schedule data to show new sessions immediately (bypass cache with timestamp)
          await loadScheduleData();
          alert(`Successfully created ${successfulSessions.length} recurring sessions!`);
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
            // Close modal first
            setShowNewSessionModal(false);
            // Reset form
            setNewSessionData({ customerId: '', startTime: '', endTime: '', notes: '', clientName: '', clientEmail: '', clientPhone: '' });
            setSessionType('client');
            setIsRecurring(false);
            setRecurringWeeks(12);
            setClickedTimeSlot(null);
            setModalSelectedDate(null);
            // Refresh schedule data to show new sessions immediately
            await loadScheduleData();
            alert(`Successfully created ${successfulSessions.length} recurring group sessions for ${selectedGroup.name}!`);
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
            // Close modal first
            setShowNewSessionModal(false);
            // Reset form
            setNewSessionData({ customerId: '', startTime: '', endTime: '', notes: '', clientName: '', clientEmail: '', clientPhone: '' });
            setSessionType('client');
            setIsRecurring(false);
            setRecurringWeeks(12);
            setClickedTimeSlot(null);
            setModalSelectedDate(null);
            // Refresh schedule data to show new sessions immediately
            await loadScheduleData();
            alert(`Successfully created ${successfulSessions.length} group sessions for ${selectedGroup.name}!`);
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
          // Close modal first
          setShowNewSessionModal(false);
          // Reset form
          setNewSessionData({ customerId: '', startTime: '', endTime: '', notes: '', clientName: '', clientEmail: '', clientPhone: '' });
          setSessionType('client');
          setIsRecurring(false);
          setRecurringWeeks(12);
          setClickedTimeSlot(null);
          setModalSelectedDate(null);
          // Refresh schedule data to show new session immediately (bypass cache)
          await loadScheduleData();
          alert('Time blocked successfully!');
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
          // Close modal first
          setShowNewSessionModal(false);
          // Reset form
          setNewSessionData({ customerId: '', startTime: '', endTime: '', notes: '', clientName: '', clientEmail: '', clientPhone: '' });
          setSessionType('client');
          setIsRecurring(false);
          setRecurringWeeks(12);
          setClickedTimeSlot(null);
          setModalSelectedDate(null);
          
          // Small delay to ensure database is updated
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Refresh schedule data to show new session immediately (bypass cache)
          await loadScheduleData();
          alert('Session created successfully!');
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to create session');
        }
      }
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
        // Refresh schedule data to show updated sessions immediately (bypass cache)
        await loadScheduleData(true);
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
        const updatedSession = await response.json();
        
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
        
        // Don't close modal when updating from details modal
        // Only close if called from edit modal
        if (showEditModal) {
          setShowEditModal(false);
        }
      } else {
        const error = await response.json();
        console.error('Failed to update session status:', error);
        alert(error.error || 'Failed to update session status');
        // Revert the select value on error
        if (selectedSession && selectedSession.id === sessionId) {
          // Force re-render by updating state
          setSelectedSession({ ...selectedSession });
        }
      }
    } catch (error) {
      console.error('Error updating session status:', error);
      alert('Failed to update session status');
      // Revert the select value on error
      if (selectedSession && selectedSession.id === sessionId) {
        // Force re-render by updating state
        setSelectedSession({ ...selectedSession });
      }
    }
  };

  // Helper function to check if a session is the first session of a new period
  const isFirstSessionOfNewPeriod = useCallback((session: TrainingSession) => {
    // Only check scheduled sessions (not completed ones)
    if (session.status !== 'scheduled' && session.status !== 'confirmed') {
      return false;
    }
    
    // Exclude intake sessions
    if (session.type === 'Intake Consultation') {
      return false;
    }
    
    const customer = customers.find(c => c.id === session.customerId);
    if (!customer || !customer.trainingFrequency) {
      return false;
    }
    
    // Get completed sessions count (excluding intake)
    const completedSessions = (customer as any).completedSessions || 0;
    const sessionsPerPeriod = customer.trainingFrequency * 4;
    
    // A session is the first of a new period if:
    // - The number of completed sessions is a multiple of sessionsPerPeriod
    // - This means the next session will start a new period
    const isFirst = completedSessions > 0 && completedSessions % sessionsPerPeriod === 0;
    
    // Debug logging
    if (isFirst) {
      console.log(`🔍 [Mobile] First session of new period detected for ${customer.name}:`, {
        completedSessions,
        sessionsPerPeriod,
        periodNumber: Math.floor(completedSessions / sessionsPerPeriod) + 1,
        sessionDate: session.date,
        sessionStatus: session.status
      });
    }
    
    return isFirst;
  }, [customers]);

  const getSessionsForDayAndTime = useCallback((date: Date, timeSlot: string) => {
    // Use consistent date formatting - get local date parts to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Debug: Log for Saturday November 8 - ALWAYS log
    if (dateStr === '2025-11-08') {
      console.log(`🔍 getSessionsForDayAndTime: Looking for sessions on ${dateStr} at ${timeSlot || 'all times'}`);
      console.log(`📊 Total sessions in state:`, sessions.length);
      console.log(`📋 All session dates:`, sessions.map(s => s.date).filter((d, i, arr) => arr.indexOf(d) === i));
    }
    
    // Get all training sessions (scheduled, completed, cancelled, no-show)
    const actualSessions = sessions.filter(session => {
      // Compare date strings directly (both should be in YYYY-MM-DD format)
      const sessionDateStr = session.date;
      
      // Debug: Log date comparison for Saturday
      if (dateStr === '2025-11-08') {
        console.log(`🔍 Comparing: sessionDate="${sessionDateStr}" vs lookingFor="${dateStr}" - Match: ${sessionDateStr === dateStr}`);
      }
      
      if (sessionDateStr !== dateStr) {
        return false;
      }
      
      // Convert times to minutes for easier comparison
      const sessionStartMinutes = timeToMinutes(session.startTime);
      const sessionEndMinutes = timeToMinutes(session.endTime);
      const timeSlotMinutes = timeToMinutes(timeSlot);
      
      // Show session if it's active during this time slot (starts before or at timeSlot, ends after timeSlot)
      const isActive = sessionStartMinutes <= timeSlotMinutes && sessionEndMinutes > timeSlotMinutes;
      
      if (dateStr === '2025-11-08' && isActive) {
        console.log(`✅ FOUND SESSION for ${timeSlot}: ${session.startTime}-${session.endTime} ${session.customerName} (${session.status})`);
      }
      
      return isActive;
    });

    if (dateStr === '2025-11-08') {
      console.log(`📊 FINAL RESULT for ${dateStr} at ${timeSlot}:`, actualSessions.length, 'sessions found:', actualSessions.map(s => `${s.startTime}-${s.endTime} ${s.customerName} (${s.status})`));
    }

    return actualSessions;
  }, [sessions, timeToMinutes]);

  const getSessionTypeColor = (type: string, status: string) => {
    if (status === 'completed') {
      return 'border border-emerald-400/30 bg-emerald-500/25 text-emerald-100';
    }
    if (status === 'cancelled') {
      return 'border border-red-400/30 bg-red-500/20 text-red-100';
    }
    if (status === 'no-show') {
      return 'border border-orange-400/30 bg-orange-500/20 text-orange-100';
    }

    switch (type) {
      case '1:1':
      case 'group':
        return 'border border-blue-400/30 bg-blue-500/25 text-blue-100';
      case 'own-training':
        return 'border border-purple-400/30 bg-purple-500/25 text-purple-100';
      case 'workout-plan':
        return 'border border-orange-400/30 bg-orange-500/25 text-orange-100';
      case 'Intake Consultation':
        return 'border border-amber-400/30 bg-amber-500/25 text-amber-100';
      case 'block-time':
        return 'border border-red-400/40 bg-red-500/30 text-red-100';
      default:
        return 'border border-white/15 bg-white/10 text-white/80';
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
      case 'scheduled':
        return 'bg-rose-500/30 text-rose-100';
      case 'completed':
        return 'bg-emerald-500/30 text-emerald-100';
      case 'cancelled':
        return 'bg-red-500/30 text-red-100';
      default:
        return 'bg-white/15 text-white/60';
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

  // Handle clicking on time slots (empty area only — session cards stop propagation)
  const handleTimeSlotClick = (date: Date, time: string) => {
    setClickedTimeSlot({ date, time });
    setModalSelectedDate(date);
    setNewSessionData((prev) => ({
      ...prev,
      startTime: time,
      endTime: calculateEndTime(time),
    }));
    setShowSessionDetailsModal(false);
    setSelectedSession(null);
    setShowNewSessionModal(true);
  };

  const openSessionDetails = (session: TrainingSession, event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setShowNewSessionModal(false);
    setSelectedSession(session);
    setShowSessionDetailsModal(true);
  };

  const closeNewSessionModal = useCallback(() => {
    setShowNewSessionModal(false);
    setClickedTimeSlot(null);
    setModalSelectedDate(null);
  }, []);

  const handleSessionStatusChange = async (newStatus: string) => {
    if (!selectedSession) return;
    await handleUpdateSessionStatus(selectedSession.id, newStatus);
    if (newStatus === 'completed') {
      setShowSessionDetailsModal(false);
      setSelectedSession(null);
    }
  };


  const currentDay = currentWeekDates[currentDayIndex];
  const daySessions = getSessionsForDayAndTime(currentDay, '08:30'); // Get all sessions for the day

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: onlineTheme.bg }}>
      <div className="mx-auto max-w-lg px-3 py-4 sm:max-w-xl sm:px-4 lg:max-w-none lg:px-6 lg:py-6">
        <div className="rounded-3xl p-4 shadow-xl md:p-6 lg:p-8" style={cardStyle}>
          <div className="mb-6 hidden flex-col lg:flex lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1
                className="flex items-center text-2xl font-bold md:text-3xl"
                style={{ color: onlineTheme.accentLight }}
              >
                <Calendar className="mr-2 h-6 w-6 md:mr-3 md:h-8 md:w-8" style={{ color: onlineTheme.accentMid }} />
                {t.admin.dashboard.coachingSchedule}
              </h1>
              <p className="mt-2 text-sm text-white/55 md:text-base">{t.admin.dashboard.coachingScheduleDesc}</p>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row lg:mt-0">
              <button type="button" onClick={() => setShowDebugModal(true)} className={ghostBtnClassName}>
                <Clock className="mr-2 h-4 w-4" />
                <span className="text-sm">Debug</span>
              </button>
              <button type="button" onClick={handleAutoCompleteSessions} className={ghostBtnClassName}>
                <Check className="mr-2 h-4 w-4" />
                <span className="text-sm">Auto Complete</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalSelectedDate(currentDay);
                  setShowNewSessionModal(true);
                }}
                className={primaryBtnClassName}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-sm">New Session</span>
              </button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => {
                setModalSelectedDate(currentDay);
                setShowNewSessionModal(true);
              }}
              className={`${primaryBtnClassName} flex-1`}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </button>
            <button type="button" onClick={handleAutoCompleteSessions} className={ghostBtnClassName}>
              <Check className="h-4 w-4" />
            </button>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateWeek('prev')}
              className={ghostBtnClassName}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Previous Week</span>
              <span className="sm:hidden">Prev</span>
            </button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white md:text-xl">
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
              className={ghostBtnClassName}
            >
              <span className="hidden sm:inline">Next Week</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Mobile Day Navigation */}
          <div className="mb-6 lg:hidden">
            <div className="rounded-2xl border p-4 shadow-lg" style={innerCardStyle}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Select Day</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateDay('prev')}
                    disabled={currentDayIndex === 0}
                    className={`${ghostBtnClassName} p-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateDay('next')}
                    disabled={currentDayIndex === 5}
                    className={`${ghostBtnClassName} p-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Day Dropdown */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">Available Days</label>
                <select
                  value={currentDayIndex}
                  onChange={(e) => {
                    const newDayIndex = parseInt(e.target.value);
                    setCurrentDayIndex(newDayIndex);
                    const selectedDate = currentWeekDates[newDayIndex].toLocaleDateString('en-CA');
                    setSelectedDay(selectedDate);
                  }}
                  className={inputClassName}
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
                <h4 className="text-lg font-semibold text-white">
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
                        ? 'cursor-pointer border-white/15 bg-white/[0.03] hover:border-rose-400/40 hover:bg-white/[0.06]' 
                        : 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-60'
                    }`}
                    title={isAvailable ? `Click to schedule session at ${formatTime(timeSlot)}` : 'Time slot unavailable'}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-white/45" />
                        <span className="font-medium text-white">{formatTime(timeSlot)}</span>
                      </div>
                      {isBreakTime(timeSlot, currentDay.toLocaleDateString('en-CA')) && (
                        <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/45">Break</span>
                      )}
                    </div>
                    
                    {/* Payment reminders removed - now shown with first session of new period */}
                    
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
                          onClick={(event) => openSessionDetails(session, event)}
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
                            <div className="mt-1 truncate text-xs font-medium text-white/55">
                              {displayText}
                            </div>
                          );
                        })()}
                        <div className="mt-1 text-xs text-white/45">
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
                <div className="rounded-lg bg-white/[0.04] p-3 text-center text-sm font-semibold text-white/55">
                  Time
                </div>
                {days.map((day, index) => (
                  <div key={day} className="rounded-lg bg-white/[0.04] p-3 text-center text-sm font-semibold text-white/55">
                    <div className="text-sm">{dayAbbr[index]}</div>
                    <div className="text-xs text-white/45">{formatDate(currentWeekDates[index])}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-7 gap-1 mb-1">
                  {/* Time Column */}
                  <div className="flex items-center justify-center rounded-lg bg-white/[0.04] p-2 text-sm text-white/55">
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
                            ? 'cursor-pointer border-white/15 bg-white/[0.03] hover:border-rose-400/40 hover:bg-white/[0.06]' 
                            : 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-60'
                        }`}
                        title={isAvailable ? `Click to schedule session at ${formatTime(timeSlot)}` : 'Time slot unavailable'}
                      >
                        {/* Payment reminders removed - now shown with first session of new period */}
                        
                        {daySessions.map((session) => {
                          const isMergedWithNext = shouldMergeWithNextSlot(session, timeSlot);
                          const isMergedWithPrevious = shouldMergeWithPreviousSlot(session, timeSlot);
                          const isFirstOfNewPeriod = isFirstSessionOfNewPeriod(session);
                          const paymentInfo = paymentStatus[session.customerId];
                          const customer = customers.find(c => c.id === session.customerId);
                          
                          // Show payment reminder if it's the first session of a new period
                          // Always show it when starting a new period, regardless of payment status
                          // This ensures the reminder appears when a new period begins
                          const showPaymentReminder = isFirstOfNewPeriod && paymentInfo && paymentInfo.amount > 0;
                          
                          // Debug logging for payment reminder
                          if (isFirstOfNewPeriod) {
                            console.log(`💰 [Mobile] Payment reminder check for ${customer?.name || session.customerId}:`, {
                              isFirstOfNewPeriod,
                              hasPaymentInfo: !!paymentInfo,
                              amount: paymentInfo?.amount,
                              nextPaymentDate: paymentInfo?.nextPaymentDate,
                              isPaid: paymentInfo?.isPaid,
                              showPaymentReminder,
                              completedSessions: (customer as any)?.completedSessions,
                              trainingFrequency: customer?.trainingFrequency
                            });
                          }
                          
                          return (
                            <div key={session.id}>
                              {showPaymentReminder && (
                                <div className={`mb-1 p-2 rounded-lg border-2 text-xs ${
                                  'border border-amber-400/30 bg-amber-500/15'
                                }`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-amber-300" />
                                      <span className="font-semibold text-amber-200">Payment Due</span>
                                    </div>
                                    <span className="font-bold text-amber-200">
                                      {paymentInfo.amount} RON
                                    </span>
                                  </div>
                                  <div className="text-white/70">
                                    <div className="truncate font-medium">{paymentInfo.customerName}</div>
                                    {paymentInfo.nextPaymentDate && (
                                      <div className="mt-0.5 text-xs">
                                        Next payment: <span className="font-semibold">{new Date(paymentInfo.nextPaymentDate).toLocaleDateString('ro-RO')}</span>
                                      </div>
                                    )}
                                    {!paymentInfo.nextPaymentDate && customer && (
                                      <div className="mt-0.5 text-xs text-amber-200/80">
                                        New period starting
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div
                                className={`p-2 text-xs font-medium mb-1 cursor-pointer transition-all duration-200 hover:shadow-md ${getSessionTypeColor(session.type, session.status)} ${
                                  isMergedWithNext ? 'rounded-t-lg rounded-b-none' : 
                                  isMergedWithPrevious ? 'rounded-b-lg rounded-t-none' : 
                                  'rounded-lg'
                                }`}
                                onClick={(event) => openSessionDetails(session, event)}
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
                                <div className="mt-1 truncate text-xs font-medium text-white/55">
                                  {displayText}
                                </div>
                              );
                            })()}
                            <div className="mt-1 text-xs text-white/45">
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </div>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              className="w-full max-w-md rounded-2xl p-6" style={cardStyle}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Session Details</h3>
                <button
                  onClick={() => setShowSessionDetailsModal(false)}
                  className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border p-4" style={innerCardStyle}>
                  <p className="text-lg font-semibold leading-tight text-white">
                    {selectedSession.type === 'block-time'
                      ? selectedSession.notes || 'Block time'
                      : selectedSession.customerName.replace(/ completed?/gi, '').trim()}
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    {new Date(selectedSession.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    · {formatTime(selectedSession.startTime)} – {formatTime(selectedSession.endTime)}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getSessionTypeColor(selectedSession.type, selectedSession.status)}`}
                  >
                    {selectedSession.type}
                  </span>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Status</label>
                  {selectedSession.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => handleSessionStatusChange('completed')}
                      className={`mb-3 flex w-full items-center justify-center gap-2 py-3.5 text-base font-semibold ${statusButtonClass('completed', true)}`}
                    >
                      <Check className="h-5 w-5" />
                      {t.admin.dashboard.sessionStatusCompleted}
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSessionStatusChange('scheduled')}
                      className={statusButtonClass('scheduled', selectedSession.status === 'scheduled')}
                    >
                      {t.admin.dashboard.sessionStatusScheduled}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSessionStatusChange('completed')}
                      className={statusButtonClass('completed', selectedSession.status === 'completed')}
                    >
                      {t.admin.dashboard.sessionStatusCompleted}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSessionStatusChange('cancelled')}
                      className={statusButtonClass('cancelled', selectedSession.status === 'cancelled')}
                    >
                      {t.admin.dashboard.sessionStatusCancelled}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSessionStatusChange('no-show')}
                      className={statusButtonClass('no-show', selectedSession.status === 'no-show')}
                    >
                      {t.admin.dashboard.sessionStatusNoShow}
                    </button>
                  </div>
                </div>

                {selectedSession.notes && selectedSession.type !== 'block-time' && (
                  <div className="rounded-2xl border p-3" style={innerCardStyle}>
                    <label className="mb-1 block text-xs font-medium text-white/55">Notes</label>
                    <p className="text-sm text-white/80">{selectedSession.notes}</p>
                  </div>
                )}

                <div
                  className="flex gap-3 border-t pt-4"
                  style={{ borderColor: onlineTheme.cardBorder }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowSessionDetailsModal(false);
                      setShowEditModal(true);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-400/45 bg-transparent py-2.5 text-sm font-medium text-blue-300/90 transition-colors hover:border-blue-400 hover:bg-blue-500/5 hover:text-blue-200"
                  >
                    <Edit className="h-4 w-4" strokeWidth={1.75} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(selectedSession.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/45 bg-transparent py-2.5 text-sm font-medium text-red-300/90 transition-colors hover:border-red-400 hover:bg-red-500/5 hover:text-red-200"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Session Modal */}
        {showNewSessionModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
            onClick={closeNewSessionModal}
          >
            <div
              className="flex max-h-[min(90vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-2xl"
              style={cardStyle}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between gap-2 border-b border-white/10 px-4 py-3">
                <h3 className="pr-2 text-base font-bold leading-tight text-white">
              {sessionType === 'own-training' ? 'Schedule Own Training' : 
               sessionType === 'intake' ? 'Create Intake Session' : 
               sessionType === 'group' ? 'Create Group Session' : 
               sessionType === 'block-time' ? 'Block Time' : 'Create New Session'}
                </h3>
                <button
                  type="button"
                  onClick={closeNewSessionModal}
                  className="shrink-0 rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                {(clickedTimeSlot || modalSelectedDate) && (
                  <div
                    className="mb-3 rounded-lg border px-2.5 py-2 text-xs text-white/80"
                    style={innerCardStyle}
                  >
                    <span className="text-white/50">Selected: </span>
                    {(clickedTimeSlot?.date || modalSelectedDate)?.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {clickedTimeSlot ? ` · ${formatTime(clickedTimeSlot.time)}` : ''}
                  </div>
                )}

                <div className="space-y-3">
                {/* Session Type Selection */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/70">Session Type</label>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    <button
                      onClick={() => setSessionType('client')}
                      className={`rounded-lg border p-2 transition-colors ${
                        sessionType === 'client'
                          ? 'border-rose-500/60 bg-rose-500/20 text-rose-100'
                          : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Client Session</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setSessionType('intake')}
                      className={`rounded-lg border p-2 transition-colors ${
                        sessionType === 'intake'
                          ? 'border-yellow-500/60 bg-yellow-500/20 text-yellow-100'
                          : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Intake</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setSessionType('own-training')}
                      className={`rounded-lg border p-2 transition-colors ${
                        sessionType === 'own-training'
                          ? 'border-purple-500/60 bg-purple-500/20 text-purple-100'
                          : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Own Training</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setSessionType('group')}
                      className={`rounded-lg border p-2 transition-colors ${
                        sessionType === 'group'
                          ? 'border-green-500/60 bg-green-500/20 text-green-100'
                          : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Group Session</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setSessionType('block-time')}
                      className={`rounded-lg border p-2 transition-colors ${
                        sessionType === 'block-time'
                          ? 'border-orange-500/60 bg-orange-500/20 text-orange-100'
                          : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.06]'
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
                  <div className="relative customer-search-container">
                    <label className="mb-2 block text-sm font-medium text-white/70">Customer</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-white/40" />
                      </div>
                      <input
                        type="text"
                        value={customerSearchQuery}
                        onChange={(e) => {
                          setCustomerSearchQuery(e.target.value);
                          if (e.target.value.length === 0) {
                            setNewSessionData(prev => ({ ...prev, customerId: '' }));
                          }
                        }}
                        onFocus={() => {
                          if (customerSearchQuery.length >= 3) {
                            setShowCustomerDropdown(true);
                          }
                        }}
                        placeholder="Type at least 3 characters to search..."
                        className={`${inputClassName} pl-10`}
                      />
                      
                      {/* Dropdown with search results */}
                      {showCustomerDropdown && filteredCustomers.length > 0 && (
                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#2a1220] shadow-lg">
                          {/* Show all customers option */}
                          <button
                            type="button"
                            onClick={handleShowAllCustomers}
                            className="w-full px-4 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 border-b border-gray-200 flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Show all customers ({allCustomers.length})
                          </button>
                          
                          {/* Filtered customer list */}
                          {filteredCustomers.map(customer => {
                            const sessionInfo = getRemainingSessions(customer.id);
                            const isSelected = newSessionData.customerId === customer.id;
                            return (
                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => handleCustomerSelect(customer.id)}
                                className={`w-full px-4 py-2 text-left text-sm border-b border-white/10 hover:bg-white/[0.06] last:border-b-0 flex items-center justify-between ${
                                  isSelected ? 'bg-rose-50' : ''
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {isSelected && <Check className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                                    <span className={`font-medium ${isSelected ? 'text-rose-300' : 'text-white'}`}>
                                      {customer.name}
                                    </span>
                                  </div>
                                  <div className="mt-0.5 text-xs text-white/45">{customer.email}</div>
                                </div>
                                <div className="ml-2 text-xs text-white/45 flex-shrink-0">
                                  {sessionInfo.scheduled}/{sessionInfo.total}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
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
                    <label className="mb-2 block text-sm font-medium text-white/70">Groep</label>
                    <select
                      value={newSessionData.customerId}
                      onChange={(e) => setNewSessionData(prev => ({ ...prev, customerId: e.target.value }))}
                      className={inputClassName}
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
                      <label className="mb-2 block text-sm font-medium text-white/70">Client Name</label>
                      <input
                        type="text"
                        value={newSessionData.clientName || ''}
                        onChange={(e) => setNewSessionData(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Enter client name"
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">Email</label>
                      <input
                        type="email"
                        value={newSessionData.clientEmail || ''}
                        onChange={(e) => setNewSessionData(prev => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="Enter client email"
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">Phone</label>
                      <input
                        type="tel"
                        value={newSessionData.clientPhone || ''}
                        onChange={(e) => setNewSessionData(prev => ({ ...prev, clientPhone: e.target.value }))}
                        placeholder="Enter client phone"
                        className={inputClassName}
                      />
                    </div>
                  </div>
                )}

                {/* Block Time Description - Show for block time sessions */}
                {sessionType === 'block-time' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">Block Reason *</label>
                    <textarea
                      value={newSessionData.notes}
                      onChange={(e) => setNewSessionData(prev => ({ ...prev, notes: e.target.value }))}
                      className={inputClassName}
                      placeholder="Enter reason for blocking this time (e.g., Doctor appointment, Personal meeting, etc.)"
                      rows={3}
                      required
                    />
                    <p className="mt-1 text-xs text-white/45">This description will be visible in the schedule</p>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Start Time</label>
                  {/* V2 Time Selection - Simple List */}
                  <div className="max-h-32 space-y-1.5 overflow-y-auto rose-scrollbar">
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
                          className={`w-full rounded-lg border p-2 text-left text-sm transition-colors ${
                            isSelected 
                              ? 'border-rose-500/60 bg-rose-500/20 text-rose-100' 
                              : isAvailable && !isBreak
                                ? 'border-white/10 bg-white/[0.04] text-white/70 hover:border-rose-400/40 hover:bg-white/[0.06]'
                                : 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/30'
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
                  <label className="mb-2 block text-sm font-medium text-white/70">End Time (Auto-calculated)</label>
                  <div className={inputClassName}>
                    {newSessionData.startTime ? formatTime(calculateEndTime(newSessionData.startTime)) : 'Select start time first'}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Notes (Optional)</label>
                  <textarea
                    value={newSessionData.notes}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, notes: e.target.value }))}
                    className={inputClassName}
                    rows={2}
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
                      <label htmlFor="recurring" className="text-xs font-medium text-white/70 sm:text-sm">
                        Schedule for all {recurringWeeks} weeks (recurring sessions)
                      </label>
                    </div>
                    
                    {isRecurring && (
                      <>
                        <div className="flex items-center gap-3 mb-2">
          <label className="text-xs text-white/70 sm:text-sm">Duration:</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRecurringWeeks(4)}
              className={`px-2 py-1 text-xs rounded border ${recurringWeeks === 4 ? 'border-rose-500 bg-gradient-to-r from-[#E11C48] to-[#F36088] text-white' : 'border-white/10 bg-white/[0.04] text-white/70'}`}
            >
              4 weeks
            </button>
            <button
              type="button"
              onClick={() => setRecurringWeeks(12)}
              className={`px-2 py-1 text-xs rounded border ${recurringWeeks === 12 ? 'border-rose-500 bg-gradient-to-r from-[#E11C48] to-[#F36088] text-white' : 'border-white/10 bg-white/[0.04] text-white/70'}`}
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
                              <div className="mb-1 text-xs text-white/70 sm:text-sm">Also repeat on:</div>
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
                                      className={`px-2 py-1 text-xs rounded border ${disabled ? 'opacity-40 cursor-not-allowed' : active ? 'border-rose-500 bg-gradient-to-r from-[#E11C48] to-[#F36088] text-white' : 'border-white/10 bg-white/[0.04] text-white/70'}`}
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

              </div>

              <div className="flex shrink-0 gap-2 border-t border-white/10 px-4 py-3">
                <button
                  type="button"
                  onClick={closeNewSessionModal}
                  className={`${ghostBtnClassName} flex-1 justify-center text-sm`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateSession}
                  className={`${primaryBtnClassName} flex-1 justify-center text-sm`}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit Session</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">
                    {selectedSession.type === 'block-time' ? 'Block Reason' : 'Customer'}
                  </label>
                  <p className="text-white">
                    {selectedSession.type === 'block-time' 
                      ? selectedSession.notes || 'No reason provided'
                      : selectedSession.customerName
                    }
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">
                    Date & Time
                  </label>
                  <p className="text-white">
                    {new Date(selectedSession.date).toLocaleDateString()} at {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
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
                          : 'bg-orange-500/30 text-orange-100 hover:bg-orange-500/40'
                      }`}
                    >
                      🚫 No Show
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className={`${ghostBtnClassName} flex-1 justify-center`}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="mx-4 max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Debug Logs</h2>
                <button
                  onClick={() => setShowDebugModal(false)}
                  className="text-white/45 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="h-96 overflow-y-auto rounded-lg bg-black/30 p-4">
                {debugLogs.length === 0 ? (
                  <p className="text-white/45">No debug logs yet. Navigate to the schedule to see logs.</p>
                ) : (
                  <div className="space-y-2">
                    {debugLogs.map((log, index) => (
                      <div key={index} className="rounded border border-white/10 bg-white/[0.04] p-2 font-mono text-sm text-white/80">
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
                  className={`${ghostBtnClassName} flex-1 justify-center`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

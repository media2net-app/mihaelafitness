'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Star, Users, Dumbbell, Apple, Calculator, Edit, Trash2, Download, Share2, Eye, X, Ruler, TrendingUp, Plus, Clock, Target, Award, Camera, Upload, Image as ImageIcon, BookOpen, DollarSign, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';


// Period Tracking Component
function PeriodTrackingTab({ 
  customerId,
  joinDate, 
  trainingFrequency, 
  trainingSessions 
}: { 
  customerId: string;
  joinDate: string | Date; 
  trainingFrequency: number;
  trainingSessions: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    status: string;
    notes?: string;
  }>;
}) {
  const [frequencyHistory, setFrequencyHistory] = useState<Array<{frequency: number, effectiveFrom: string}>>([]);
  const [periodAdjustments, setPeriodAdjustments] = useState<Record<number, string>>({});
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load frequency history
        const historyResponse = await fetch(`/api/training-frequency-history?customerId=${customerId}`);
        if (historyResponse.ok) {
          const history = await historyResponse.json();
          setFrequencyHistory(history);
        }

        // Load period adjustments
        const adjustmentsResponse = await fetch(`/api/period-adjustments?customerId=${customerId}`);
        if (adjustmentsResponse.ok) {
          const adjustments = await adjustmentsResponse.json();
          const adjustmentsMap: Record<number, string> = {};
          adjustments.forEach((adj: any) => {
            adjustmentsMap[adj.periodNumber] = adj.customStartDate;
          });
          setPeriodAdjustments(adjustmentsMap);
        }
      } catch (error) {
        console.error('Error loading period data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [customerId]);

  // Get the training frequency that was active at a specific date
  const getFrequencyForDate = (date: Date): number => {
    // Sort history by effectiveFrom date (newest first)
    const sortedHistory = [...frequencyHistory].sort((a, b) => 
      new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
    );

    // Find the most recent frequency change that was effective before or on this date
    for (const entry of sortedHistory) {
      if (new Date(entry.effectiveFrom) <= date) {
        return entry.frequency;
      }
    }

    // If no history entry found, use current frequency (for backwards compatibility)
    return trainingFrequency;
  };

  const handleSavePeriodStartDate = async (periodNumber: number) => {
    if (!editStartDate) {
      alert('Selecteer alstublieft een startdatum');
      return;
    }

    try {
      const response = await fetch('/api/period-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          periodNumber,
          customStartDate: editStartDate
        })
      });

      if (response.ok) {
        const adjustment = await response.json();
        setPeriodAdjustments({
          ...periodAdjustments,
          [periodNumber]: adjustment.customStartDate
        });
        setEditingPeriod(null);
        setEditStartDate('');
        
        // Show success message with calculated end date
        const endDate = adjustment.customEndDate 
          ? new Date(adjustment.customEndDate).toLocaleDateString('nl-NL')
          : 'berekend';
        alert(`Periode ${periodNumber} aangepast!\nStartdatum: ${new Date(editStartDate).toLocaleDateString('nl-NL')}\nEinddatum: ${endDate}\nVerwachte sessies: ${adjustment.expectedSessions || 'berekend'}`);
        
        window.location.reload(); // Reload to recalculate periods
      } else {
        const error = await response.json();
        const errorMessage = error.error || 'Failed to save period adjustment';
        
        // Show helpful error message
        if (error.code === 'SCHEMA_NOT_UPDATED' || error.code === 'SCHEMA_ERROR' || error.code === 'MODEL_NOT_FOUND') {
          alert(`Database schema moet worden bijgewerkt.\n\nVoer uit in de terminal:\nnpx prisma generate && npx prisma db push\n\nDaarna de pagina verversen.`);
        } else {
          alert(`Fout: ${errorMessage}`);
        }
      }
    } catch (error: any) {
      console.error('Error saving period adjustment:', error);
      alert(`Fout: ${error.message || 'Kon periode aanpassing niet opslaan'}`);
    }
  };

  // Calculate periods (each period is 4 weeks)
  const calculatePeriods = () => {
    const startDate = new Date(joinDate);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const periods: Array<{
      periodNumber: number;
      startDate: Date;
      endDate: Date;
      expectedSessions: number;
      sessions: typeof trainingSessions;
      scheduled: number;
      completed: number;
      missed: number;
      frequency: number;
    }> = [];
    
    let currentPeriodStart = new Date(startDate);
    let periodNumber = 1;
    
    // Calculate all periods from start date until today (and one future period)
    while (currentPeriodStart <= today || periods.length === 0 || periodNumber <= Math.ceil((today.getTime() - startDate.getTime()) / (28 * 24 * 60 * 60 * 1000)) + 1) {
      // Check if there's a custom start date for this period
      if (periodAdjustments[periodNumber]) {
        currentPeriodStart = new Date(periodAdjustments[periodNumber]);
        currentPeriodStart.setHours(0, 0, 0, 0);
      }

      const periodEnd = new Date(currentPeriodStart);
      periodEnd.setDate(periodEnd.getDate() + 27); // 28 days - 1 (0-indexed)
      periodEnd.setHours(23, 59, 59, 999);
      
      // Get sessions in this period
      const periodSessions = trainingSessions.filter(session => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= currentPeriodStart && sessionDate <= periodEnd;
      });
      
      // Get the frequency that was active during this period (use start date of period)
      const periodFrequency = getFrequencyForDate(currentPeriodStart);
      
      // Expected sessions per period: trainingFrequency * 4 weeks
      const expectedSessions = periodFrequency * 4;
      
      // Count scheduled, completed, and missed sessions
      const scheduled = periodSessions.filter(s => s.status === 'scheduled').length;
      const completed = periodSessions.filter(s => s.status === 'completed').length;
      // Missed = scheduled sessions that should have been completed but weren't (past date + not completed/cancelled)
      const now = new Date();
      const missed = periodSessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate < now && 
               (s.status === 'scheduled' || s.status === 'no-show' || (s.status === 'cancelled' && new Date(s.date) < now));
      }).length;
      
      periods.push({
        periodNumber,
        startDate: new Date(currentPeriodStart),
        endDate: new Date(periodEnd),
        expectedSessions,
        sessions: periodSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        scheduled,
        completed,
        missed,
        frequency: periodFrequency
      });
      
      // Move to next period
      currentPeriodStart = new Date(periodEnd);
      currentPeriodStart.setDate(currentPeriodStart.getDate() + 1);
      currentPeriodStart.setHours(0, 0, 0, 0);
      periodNumber++;
      
      // Limit to reasonable number of periods (max 20)
      if (periodNumber > 20) break;
    }
    
    return periods;
  };
  
  const periods = calculatePeriods();
  const currentPeriodIndex = periods.findIndex(p => {
    const now = new Date();
    return now >= p.startDate && now <= p.endDate;
  });
  const currentPeriod = currentPeriodIndex >= 0 ? periods[currentPeriodIndex] : null;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-rose-500"></div>
          <p className="text-sm text-gray-600">Loading period data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Period Overview</h3>
        <p className="text-sm text-gray-600">
          Each period lasts 4 weeks. Frequency may vary per period based on training history.
        </p>
      </div>
      
      {/* Current Period Highlight */}
      {currentPeriod && (
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm sm:text-base font-medium mb-1">Current Period</div>
              <div className="text-xl sm:text-2xl font-bold">Period {currentPeriod.periodNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm opacity-90">Missed Sessions</div>
              <div className="text-2xl sm:text-3xl font-bold">{currentPeriod.missed}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs sm:text-sm opacity-90">Expected</div>
              <div className="text-lg sm:text-xl font-bold">{currentPeriod.expectedSessions}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs sm:text-sm opacity-90">Scheduled</div>
              <div className="text-lg sm:text-xl font-bold">{currentPeriod.scheduled}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs sm:text-sm opacity-90">Completed</div>
              <div className="text-lg sm:text-xl font-bold">{currentPeriod.completed}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs sm:text-sm opacity-90">Missed</div>
              <div className="text-lg sm:text-xl font-bold">{currentPeriod.missed}</div>
            </div>
          </div>
          <div className="mt-4 text-xs sm:text-sm opacity-90">
            {currentPeriod.startDate.toLocaleDateString('en-US')} - {currentPeriod.endDate.toLocaleDateString('en-US')}
          </div>
        </div>
      )}
      
      {/* All Periods */}
      <div className="space-y-4">
        <h4 className="text-sm sm:text-base font-semibold text-gray-800">All Periods</h4>
        {periods.map((period) => {
          const isCurrent = period.periodNumber === currentPeriod?.periodNumber;
          const isPast = period.endDate < new Date();
          const isFuture = period.startDate > new Date();
          
          return (
            <div
              key={period.periodNumber}
              className={`border rounded-xl p-4 sm:p-6 ${
                isCurrent
                  ? 'border-rose-500 bg-rose-50'
                  : isPast
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="text-base sm:text-lg font-bold text-gray-800">
                      Period {period.periodNumber}
                    </h5>
                    {isCurrent && (
                      <span className="px-2 py-1 bg-rose-500 text-white text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                    {isFuture && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                        Future
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm text-gray-600">
                      {period.startDate.toLocaleDateString('en-US')} - {period.endDate.toLocaleDateString('en-US')}
                    </p>
                    <button
                      onClick={() => {
                        setEditingPeriod(period.periodNumber);
                        setEditStartDate(period.startDate.toISOString().split('T')[0]);
                      }}
                      className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                      title="Edit period start date"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  {editingPeriod === period.periodNumber && (
                    <div className="mt-2 p-3 bg-white border border-rose-200 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Aangepaste Startdatum (einddatum wordt automatisch berekend: +4 weken)
                      </label>
                      <div className="mb-2 text-xs text-gray-600">
                        Huidige frequentie voor deze periode: {period.frequency}x per week
                        <br />
                        Verwacht aantal sessies: {period.frequency * 4}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                        <button
                          onClick={() => handleSavePeriodStartDate(period.periodNumber)}
                          className="px-3 py-1 bg-rose-500 text-white text-xs rounded hover:bg-rose-600 transition-colors"
                        >
                          Opslaan
                        </button>
                        <button
                          onClick={() => {
                            setEditingPeriod(null);
                            setEditStartDate('');
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                        >
                          Annuleren
                        </button>
                      </div>
                      {editStartDate && (
                        <div className="mt-2 text-xs text-gray-600">
                          Einddatum wordt: {new Date(new Date(editStartDate).getTime() + 27 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">Frequency</div>
                    <div className="text-base sm:text-lg font-bold text-purple-600">{period.frequency}x/week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">Expected</div>
                    <div className="text-base sm:text-lg font-bold text-gray-800">{period.expectedSessions}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">Scheduled</div>
                    <div className="text-base sm:text-lg font-bold text-blue-600">{period.scheduled}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">Completed</div>
                    <div className="text-base sm:text-lg font-bold text-green-600">{period.completed}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">Missed</div>
                    <div className={`text-base sm:text-lg font-bold ${period.missed > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {period.missed}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sessions in this period */}
              {period.sessions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h6 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Sessions in this period:</h6>
                  <div className="space-y-2">
                    {period.sessions.map((session) => {
                      const sessionDate = new Date(session.date);
                      const isPastDate = sessionDate < new Date();
                      const isMissed = isPastDate && (session.status === 'scheduled' || session.status === 'no-show');
                      
                      return (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                            session.status === 'completed'
                              ? 'bg-green-100 border border-green-200'
                              : isMissed
                              ? 'bg-red-100 border border-red-200'
                              : session.status === 'cancelled'
                              ? 'bg-gray-100 border border-gray-200'
                              : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            {session.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                            ) : isMissed ? (
                              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                            )}
                            <div>
                              <div className="font-medium text-gray-800">
                                {sessionDate.toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </div>
                              <div className="text-gray-600">{session.startTime} - {session.endTime}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === 'completed'
                                ? 'bg-green-200 text-green-800'
                                : isMissed
                                ? 'bg-red-200 text-red-800'
                                : session.status === 'scheduled'
                                ? 'bg-blue-200 text-blue-800'
                                : session.status === 'cancelled'
                                ? 'bg-gray-200 text-gray-800'
                                : 'bg-yellow-200 text-yellow-800'
                            }`}>
                              {isMissed ? 'Missed' : session.status}
                            </span>
                            {session.type && (
                              <span className="text-xs text-gray-600 hidden sm:inline">{session.type}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {period.sessions.length === 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-500">
                  No sessions in this period
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Workout Plan Tab Component
function WorkoutPlanTab({ customerId }: { customerId: string }) {
  const [workoutAssignments, setWorkoutAssignments] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  
  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        const response = await fetch(`/api/customer-schedule-assignments?customerId=${customerId}`);
        if (response.ok) {
          const assignments = await response.json();
          setWorkoutAssignments(assignments);
        }
      } catch (error) {
        console.error('Error fetching workout plan:', error);
      } finally {
        setLoadingWorkouts(false);
      }
    };
    
    fetchWorkoutPlan();
  }, [customerId]);
  
  if (loadingWorkouts) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading workout plan...</p>
      </div>
    );
  }
  
  if (workoutAssignments.length === 0) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No workout plan assigned yet</p>
      </div>
    );
  }
  
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Workout Plan</h3>
      
      <div className="space-y-6">
        {workoutAssignments.map((assignment) => (
          <div key={assignment.id} className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  <span className="text-sm font-medium text-rose-600">{weekdayNames[assignment.weekday]}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800">{assignment.workout.name}</h4>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Category</div>
                <div className="text-sm font-medium text-gray-800">{assignment.workout.category}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Difficulty</div>
                <div className="text-sm font-semibold text-gray-800 capitalize">{assignment.workout.difficulty}</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Duration</div>
                <div className="text-sm font-semibold text-gray-800">{assignment.workout.duration} min</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Type</div>
                <div className="text-sm font-semibold text-gray-800">{assignment.workout.trainingType}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Edit Measurement Form Component
function EditMeasurementForm({ measurement, onSave, onCancel }: { measurement: any, onSave: (data: any) => void, onCancel: () => void }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    week: measurement.week || 1,
    date: measurement.date || new Date().toISOString().split('T')[0],
    weight: measurement.weight || '',
    height: measurement.height || '',
    age: measurement.age || '',
    chest: measurement.chest || '',
    waist: measurement.waist || '',
    hips: measurement.hips || '',
    thigh: measurement.thigh || '',
    arm: measurement.arm || '',
    neck: measurement.neck || '',
    bmi: measurement.bmi || '',
    notes: measurement.notes || ''
  });

  const calculateBMI = (weight: string, height: string) => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (weightNum && heightNum && heightNum > 0) {
      const heightInMeters = heightNum / 100;
      const bmi = weightNum / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return '';
  };

  const handleWeightChange = (value: string) => {
    const newFormData = { ...formData, weight: value };
    newFormData.bmi = calculateBMI(value, formData.height);
    setFormData(newFormData);
  };

  const handleHeightChange = (value: string) => {
    const newFormData = { ...formData, height: value };
    newFormData.bmi = calculateBMI(formData.weight, value);
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('EditMeasurementForm submitting:', formData);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
          <input
            type="number"
            value={formData.week}
            onChange={(e) => setFormData({...formData, week: parseInt(e.target.value) || 1})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="kg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.height}
            onChange={(e) => handleHeightChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="years"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BMI (Auto-calculated)
            <span className="text-xs text-gray-500 ml-2">
              Formula: weight(kg) ÷ height(m)²
            </span>
          </label>
          <input
            type="text"
            value={formData.bmi || 'Enter weight & height'}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            placeholder={t.dashboard.autoCalculated}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chest (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.chest}
            onChange={(e) => setFormData({...formData, chest: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Waist (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.waist}
            onChange={(e) => setFormData({...formData, waist: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hips (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.hips}
            onChange={(e) => setFormData({...formData, hips: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thigh (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.thigh}
            onChange={(e) => setFormData({...formData, thigh: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Arm (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.arm}
            onChange={(e) => setFormData({...formData, arm: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Neck (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.neck}
            onChange={(e) => setFormData({...formData, neck: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          rows={3}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm sm:text-base"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Photo Upload Form Component
function PhotoUploadForm({ 
  customerId, 
  onSave, 
  onCancel, 
  existingPhotos,
  editingPhoto 
}: { 
  customerId: string, 
  onSave: (photos: any[]) => void, 
  onCancel: () => void,
  existingPhotos: any[],
  editingPhoto?: {week: number, position: string, existingPhoto: any} | null
}) {
  const { t } = useLanguage();
  
  // Calculate next week based on existing photos
  const getNextWeek = () => {
    if (editingPhoto) return editingPhoto.week;
    if (existingPhotos.length === 0) return 1;
    const maxWeek = Math.max(...existingPhotos.map(p => p.week));
    return maxWeek + 1;
  };

  // Get existing photo notes for the week
  const getExistingNotes = () => {
    if (editingPhoto) {
      const weekPhoto = existingPhotos.find(p => p.week === editingPhoto.week && p.notes);
      return weekPhoto?.notes || '';
    }
    return '';
  };

  const [formData, setFormData] = useState({
    week: getNextWeek(),
    date: editingPhoto?.existingPhoto?.date 
      ? new Date(editingPhoto.existingPhoto.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    frontPhoto: null as File | null,
    sidePhoto: null as File | null,
    backPhoto: null as File | null,
    notes: getExistingNotes()
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (position: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [position + 'Photo']: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.frontPhoto && !formData.sidePhoto && !formData.backPhoto) {
      alert('Selecteer minimaal één foto om te uploaden');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Voorbereiden upload...');

    try {
      const uploadedPhotos: any[] = [];
      const failedUploads: string[] = [];
      // If editing a specific photo, only upload that one
      let photos: Array<{file: File, position: string}> = [];
      
      if (editingPhoto) {
        // Only upload the photo for the position being edited
        const photoFile = editingPhoto.position === 'front' ? formData.frontPhoto :
                         editingPhoto.position === 'side' ? formData.sidePhoto :
                         formData.backPhoto;
        if (photoFile) {
          photos = [{ file: photoFile, position: editingPhoto.position }];
        }
      } else {
        // Normal upload - all selected photos
        photos = [
          { file: formData.frontPhoto, position: 'front' },
          { file: formData.sidePhoto, position: 'side' },
          { file: formData.backPhoto, position: 'back' }
        ].filter(p => p.file) as Array<{file: File, position: string}>;
      }

      if (photos.length === 0) {
        alert('Selecteer minimaal één foto om te uploaden');
        setUploading(false);
        return;
      }

      // Upload photos with better error handling - continue even if one fails
      for (let i = 0; i < photos.length; i++) {
        setUploadStatus(`Uploaden ${photos[i].position} foto... (${i + 1}/${photos.length})`);
        setUploadProgress((i / photos.length) * 100);
        
        try {
          // Compress image if needed
          let fileToUpload = photos[i].file!;
          const sizeMB = fileToUpload.size / (1024 * 1024);
          
          if (sizeMB > 1) {
            try {
              const { compressImage } = await import('@/lib/image-compression');
              fileToUpload = await compressImage(fileToUpload, {
                maxWidth: 1920,
                maxHeight: 1920,
                quality: 0.85,
                maxSizeMB: 2
              });
              console.log(`Compressed ${photos[i].position} photo: ${sizeMB.toFixed(2)}MB -> ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
            } catch (compressionError) {
              console.warn('Compression failed, using original file:', compressionError);
            }
          }
          
          // If replacing existing photo, delete old one first
          if (editingPhoto && editingPhoto.existingPhoto && editingPhoto.position === photos[i].position) {
            try {
              await fetch(`/api/customer-photos?photoId=${editingPhoto.existingPhoto.id}`, {
                method: 'DELETE'
              });
              console.log(`Deleted old ${photos[i].position} photo before upload`);
            } catch (deleteError) {
              console.warn('Could not delete old photo, continuing with upload:', deleteError);
            }
          }

          const uploadFormData = new FormData();
          uploadFormData.append('file', fileToUpload);
          uploadFormData.append('customerId', customerId);
          uploadFormData.append('week', formData.week.toString());
          uploadFormData.append('date', formData.date);
          uploadFormData.append('position', photos[i].position);
          uploadFormData.append('notes', formData.notes);

          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

          const response = await fetch('/api/customer-photos', {
            method: 'POST',
            body: uploadFormData,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Upload mislukt' }));
            console.error(`Upload failed for ${photos[i].position} photo:`, errorData);
            failedUploads.push(photos[i].position);
            continue; // Continue with next photo instead of throwing
          }

          const result = await response.json();
          console.log(`Successfully uploaded ${photos[i].position} photo:`, result);
          uploadedPhotos.push(result);
        } catch (uploadError: any) {
          if (uploadError.name === 'AbortError') {
            console.error(`Upload timeout for ${photos[i].position} photo`);
            failedUploads.push(`${photos[i].position} (timeout)`);
          } else {
            console.error(`Upload error for ${photos[i].position} photo:`, uploadError);
            failedUploads.push(photos[i].position);
          }
          // Continue with next photo
        }
        
        setUploadProgress(((i + 1) / photos.length) * 100);
      }

      if (uploadedPhotos.length > 0) {
        setUploadStatus('Upload voltooid!');
        if (failedUploads.length > 0) {
          alert(`${uploadedPhotos.length} foto(s) geüpload. ${failedUploads.length} foto(s) mislukt: ${failedUploads.join(', ')}`);
        }
        setTimeout(() => {
          setUploading(false);
          onSave(uploadedPhotos);
          onCancel();
          window.location.reload();
        }, 1000);
      } else {
        setUploading(false);
        alert(`Alle uploads zijn mislukt. Probeer het opnieuw.`);
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Upload mislukt. Probeer het opnieuw.');
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Uploading Photos</h3>
            <p className="text-gray-600 mb-4">{uploadStatus}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{Math.round(uploadProgress)}% complete</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
          <input
            type="number"
            value={formData.week}
            onChange={(e) => setFormData({...formData, week: parseInt(e.target.value) || 1})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
            disabled={!!editingPhoto}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {editingPhoto ? (
        // Show only the photo being edited/replaced
        <div>
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {editingPhoto.existingPhoto 
                ? `Replace ${editingPhoto.position} photo for Week ${editingPhoto.week}`
                : `Add ${editingPhoto.position} photo for Week ${editingPhoto.week}`
              }
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {editingPhoto.position} View Photo {editingPhoto.existingPhoto && '(replace)'}
            </label>
            {editingPhoto.existingPhoto && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Current photo:</p>
                <img
                  src={editingPhoto.existingPhoto.imageUrl}
                  alt={`Current ${editingPhoto.position} photo`}
                  className="w-32 h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
                  loading="lazy"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(editingPhoto.position, e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              required
            />
            {formData[`${editingPhoto.position}Photo` as keyof typeof formData] && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">New photo:</p>
                <img
                  src={URL.createObjectURL(formData[`${editingPhoto.position}Photo` as keyof typeof formData] as File)}
                  alt={`New ${editingPhoto.position} preview`}
                  className="w-32 h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        // Show all three photo inputs for new upload
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Front View Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('front', e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            {formData.frontPhoto && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(formData.frontPhoto)}
                  alt={t.dashboard.frontPreview}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Side View Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('side', e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            {formData.sidePhoto && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(formData.sidePhoto)}
                  alt={t.dashboard.sidePreview}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Back View Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('back', e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            {formData.backPhoto && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(formData.backPhoto)}
                  alt={t.dashboard.backPreview}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          rows={3}
          placeholder={t.dashboard.addNotesPhoto}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={
            editingPhoto 
              ? !formData[`${editingPhoto.position}Photo` as keyof typeof formData]
              : !formData.frontPhoto && !formData.sidePhoto && !formData.backPhoto
          }
          className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {editingPhoto ? (editingPhoto.existingPhoto ? 'Replace Photo' : 'Add Photo') : 'Upload Photos'}
        </button>
      </div>
    </form>
  );
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  
  const [client, setClient] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [customerPhotos, setCustomerPhotos] = useState<Array<{
    id: string;
    week: number;
    date: string;
    position: string;
    imageUrl: string;
    notes?: string;
  }>>([]);
  const [customerPricing, setCustomerPricing] = useState<Array<{
    id: string;
    service: string;
    duration: number;
    frequency: number;
    discount: number;
    vat: number;
    finalPrice: number;
    includeNutritionPlan: boolean;
    nutritionPlanCount: number;
    customerId: string;
    customerName: string;
    createdAt: string;
  }>>([]);
  const [trainingSessions, setTrainingSessions] = useState<Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    status: string;
    notes?: string;
    customerName?: string;
  }>>([]);
  const [nutritionPlans, setNutritionPlans] = useState<Array<{
    id: string;
    customerId: string;
    nutritionPlanId: string;
    status: string;
    notes?: string;
    assignedAt: string;
    nutritionPlan: {
      id: string;
      name: string;
      goal: string;
      calories: number;
      protein: number;
    };
  }>>([]);
  const [payments, setPayments] = useState<Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    paymentType: string;
    status: string;
    notes?: string;
    paymentDate: string;
    createdAt: string;
  }>>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddMeasurementModal, setShowAddMeasurementModal] = useState(false);
  const [showEditMeasurementModal, setShowEditMeasurementModal] = useState(false);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<{week: number, position: string, existingPhoto: any} | null>(null);
  const [editingMeasurement, setEditingMeasurement] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'chest' | 'waist' | 'hips' | 'thigh' | 'arm' | 'neck'>('weight');

  const photoWeeks = useMemo(() => {
    if (!customerPhotos.length) {
      return [];
    }

    return Array.from(new Set(customerPhotos.map(photo => photo.week))).sort((a, b) => a - b);
  }, [customerPhotos]);

  const firstPhotoWeek = photoWeeks[0];
  const lastPhotoWeek = photoWeeks[photoWeeks.length - 1];
  const hasPhotoComparison = typeof firstPhotoWeek === 'number';
  const comparisonPhotoWeek = typeof lastPhotoWeek === 'number'
    ? lastPhotoWeek
    : typeof firstPhotoWeek === 'number'
      ? firstPhotoWeek
      : undefined;

  const renderVisualProgress = () => {
    if (!hasPhotoComparison) {
      return null;
    }

    const baseWeek = firstPhotoWeek as number;
    const comparisonWeek = (comparisonPhotoWeek ?? baseWeek) as number;

    return (
      <div className="mt-4 sm:mt-6 border-t border-gray-100 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
          <h5 className="text-sm sm:text-base font-semibold text-gray-800">Visual Progress</h5>
          <p className="text-xs text-gray-500">
            Week {baseWeek}
            {comparisonWeek !== baseWeek ? ` vs Week ${comparisonWeek}` : ''}
          </p>
        </div>
        <div className="space-y-4">
          {['front', 'side', 'back'].map((position) => {
            const firstWeekPhoto = customerPhotos.find(photo => photo.week === baseWeek && photo.position === position);
            const latestWeekPhoto = customerPhotos.find(photo => photo.week === comparisonWeek && photo.position === position);

            return (
              <div key={position} className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 capitalize">{position} view</span>
                  {comparisonWeek !== baseWeek && (
                    <span className="text-xs text-gray-500">Week {baseWeek} → Week {comparisonWeek}</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {[
                    { label: `Week ${baseWeek}`, photo: firstWeekPhoto },
                    { label: `Week ${comparisonWeek}`, photo: latestWeekPhoto }
                  ].map(({ label, photo }, index) => (
                    <div key={`${position}-${label}-${index}`} className="flex flex-col gap-2">
                      <div className="text-sm font-medium text-gray-700">{label}</div>
                      {photo ? (
                        <div
                          className="relative group rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-rose-300"
                          onClick={() => handleOpenPhotoGallery(photo)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleOpenPhotoGallery(photo);
                            }
                          }}
                        >
                          <img
                            src={photo.imageUrl}
                            alt={`${position} view ${label.toLowerCase()}`}
                            className="w-full h-[22rem] sm:h-[26rem] object-cover sm:object-contain bg-white cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none flex items-end justify-end p-3">
                            <Eye className="w-6 h-6 text-white drop-shadow" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-[22rem] sm:h-[26rem] bg-white rounded-2xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                          No photo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render progress chart
  const renderProgressChart = () => {
    if (measurements.length === 0) return null;

    // Sort measurements by date
    const sortedMeasurements = [...measurements].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Metric configuration
    const metricConfig = {
      weight: { label: 'Weight', unit: 'kg', field: 'weight' },
      chest: { label: 'Chest', unit: 'cm', field: 'chest' },
      waist: { label: 'Waist', unit: 'cm', field: 'waist' },
      hips: { label: 'Hips', unit: 'cm', field: 'hips' },
      thigh: { label: 'Thigh', unit: 'cm', field: 'thigh' },
      arm: { label: 'Arm', unit: 'cm', field: 'arm' },
      neck: { label: 'Neck', unit: 'cm', field: 'neck' }
    };

    const config = metricConfig[selectedMetric];
    if (!config) return null;

    // Prepare data for chart
    const chartData = sortedMeasurements.map(m => ({
      date: new Date(m.date),
      value: parseFloat(m[config.field as keyof typeof m] as string) || 0,
      week: m.week || 0
    })).filter(d => d.value > 0);

    if (chartData.length === 0) return null;

    // Chart dimensions - responsive
    const chartWidth = 1000;
    const chartHeight = 300;
    const padding = { top: 25, right: 30, bottom: 60, left: 70 }; // More padding for mobile readability
    const graphWidth = chartWidth - padding.left - padding.right;
    const graphHeight = chartHeight - padding.top - padding.bottom;

    // Calculate min/max for scaling with some padding
    const values = chartData.map(d => d.value).filter(v => v > 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;
    
    // Add 10% padding to range
    const valuePadding = valueRange * 0.1;
    const displayMinValue = minValue - valuePadding;
    const displayMaxValue = maxValue + valuePadding;
    const displayValueRange = displayMaxValue - displayMinValue;

    // Scale functions
    const scaleX = (index: number) => 
      padding.left + (index / (chartData.length - 1 || 1)) * graphWidth;
    const scaleY = (value: number) => 
      padding.top + ((displayMaxValue - value) / displayValueRange) * graphHeight;

    // Generate smooth path for line
    const dataPoints = chartData
      .map((d, i) => ({ x: scaleX(i), y: scaleY(d.value), value: d.value }))
      .filter(p => p.value > 0);
    
    const linePath = dataPoints.length > 0 
      ? dataPoints.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(' ')
      : '';

    // Generate area under line
    const areaPath = linePath 
      ? `${linePath} L ${dataPoints[dataPoints.length - 1].x} ${padding.top + graphHeight} L ${dataPoints[0].x} ${padding.top + graphHeight} Z`
      : '';

    // Y-axis tick values
    const ticks = 5;
    const tickValues = Array.from({ length: ticks }, (_, i) => 
      displayMinValue + (displayValueRange / (ticks - 1)) * i
    );

    return (
      <div className="mt-4 sm:mt-6 border-t border-gray-100 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h5 className="text-sm sm:text-base font-semibold text-gray-800">Progress Chart</h5>
          
          {/* Metric Filters */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(metricConfig).map(([key, metric]) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key as typeof selectedMetric)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  selectedMetric === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-2 sm:p-6 border border-gray-200 shadow-sm">
          <div className="relative w-full" style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <div className="w-full" style={{ height: '250px', maxHeight: '250px' }} className="sm:h-[300px]">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
                style={{ maxWidth: '100%' }}
              >
                {/* Background grid */}
                <defs>
                  <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Grid lines - horizontal */}
                {tickValues.map((value, i) => (
                  <g key={`grid-${i}`}>
                    <line
                      x1={padding.left}
                      y1={scaleY(value)}
                      x2={chartWidth - padding.right}
                      y2={scaleY(value)}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  </g>
                ))}

                {/* Y-axis line */}
                <line
                  x1={padding.left}
                  y1={padding.top}
                  x2={padding.left}
                  y2={chartHeight - padding.bottom}
                  stroke="#d1d5db"
                  strokeWidth="2"
                />

                {/* X-axis line */}
                <line
                  x1={padding.left}
                  y1={chartHeight - padding.bottom}
                  x2={chartWidth - padding.right}
                  y2={chartHeight - padding.bottom}
                  stroke="#d1d5db"
                  strokeWidth="2"
                />

                {/* Area under line */}
                {areaPath && (
                  <path
                    d={areaPath}
                    fill="url(#weightGradient)"
                  />
                )}

                {/* Line - thicker on mobile */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data points with hover effect - larger on mobile */}
                {dataPoints.map((p, i) => (
                  <g key={`point-${i}`}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="6"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="2.5"
                      className="hover:r-7 transition-all"
                    />
                    <text
                      x={p.x}
                      y={p.y - 12}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#3b82f6"
                      fontWeight="600"
                      className="opacity-0 sm:opacity-0 hover:opacity-100 transition-opacity"
                    >
                      {p.value.toFixed(1)}{config.unit}
                    </text>
                  </g>
                ))}

                {/* Y-axis labels (left) - larger on mobile */}
                {tickValues.map((value, i) => (
                  <g key={`label-${i}`}>
                    <text
                      x={padding.left - 12}
                      y={scaleY(value) + 5}
                      textAnchor="end"
                      fontSize="13"
                      fill="#6b7280"
                      fontWeight="600"
                      className="text-sm"
                    >
                      {value.toFixed(1)}
                    </text>
                    <text
                      x={padding.left - 12}
                      y={scaleY(value) + 18}
                      textAnchor="end"
                      fontSize="10"
                      fill="#9ca3af"
                      fontWeight="500"
                    >
                      {config.unit}
                    </text>
                  </g>
                ))}

                {/* X-axis labels with dates - larger on mobile */}
                {chartData.map((d, i) => {
                  // Show more labels on mobile for better readability
                  const maxLabels = chartData.length <= 7 ? chartData.length : 5;
                  const showLabel = i === 0 || i === chartData.length - 1 || i % Math.ceil(chartData.length / maxLabels) === 0;
                  if (!showLabel) return null;
                  return (
                    <g key={`x-label-${i}`}>
                      <line
                        x1={scaleX(i)}
                        y1={chartHeight - padding.bottom}
                        x2={scaleX(i)}
                        y2={chartHeight - padding.bottom + 6}
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                      />
                      <text
                        x={scaleX(i)}
                        y={chartHeight - padding.bottom + 22}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#6b7280"
                        fontWeight="600"
                      >
                        W{d.week}
                      </text>
                      <text
                        x={scaleX(i)}
                        y={chartHeight - padding.bottom + 36}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#9ca3af"
                        fontWeight="500"
                      >
                        {d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          
          {/* Enhanced Legend - larger on mobile */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-6 flex-wrap px-2">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 rounded-lg">
              <div className="w-5 h-1.5 sm:w-4 sm:h-1 bg-blue-500 rounded-full"></div>
              <span className="text-sm sm:text-sm font-semibold text-gray-700">{config.label} ({config.unit})</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delete a single photo
  const [photoToDelete, setPhotoToDelete] = useState<{id: string, week: number, position: string} | null>(null);
  const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);

  const handleDeletePhotoClick = (photo: {id: string, week: number, position: string}) => {
    setPhotoToDelete(photo);
    setShowDeletePhotoModal(true);
  };

  const handleDeletePhotoConfirm = async () => {
    if (!photoToDelete || !clientId) return;

    try {
      const res = await fetch(`/api/customer-photos?photoId=${photoToDelete.id}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Verwijderen mislukt');
        return;
      }

      // Refresh photos after deletion
      const refreshed = await fetch(`/api/customer-photos?customerId=${clientId}`);
      if (refreshed.ok) {
        const refreshedPhotos = await refreshed.json();
        setCustomerPhotos(refreshedPhotos);
        setPhotos(refreshedPhotos);
      }
      
      setShowDeletePhotoModal(false);
      setPhotoToDelete(null);
    } catch (e) {
      console.error('Delete photo error', e);
      alert('Verwijderen mislukt');
    }
  };

  // Delete an entire week of photos and renumber subsequent weeks
  const deleteWeekAndRenumber = async (week: number) => {
    if (!clientId) return;
    
    // Show confirmation modal instead of simple confirm
    if (!window.confirm(`Weet je zeker dat je alle foto's voor Week ${week} wilt verwijderen?\n\nWeek nummers na deze week worden automatisch met 1 verlaagd.\n\nDeze actie kan niet ongedaan worden gemaakt.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/customer-photos?customerId=${clientId}&week=${week}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Verwijderen mislukt');
        return;
      }
      // Refresh photos after deletion/renumbering
      const refreshed = await fetch(`/api/customer-photos?customerId=${clientId}`);
      if (refreshed.ok) {
        const refreshedPhotos = await refreshed.json();
        setCustomerPhotos(refreshedPhotos);
        setPhotos(refreshedPhotos);
      }
      alert(`Week ${week} verwijderd. ${data.shiftedCount || 0} volgende foto's bijgewerkt.`);
    } catch (e) {
      console.error('Delete week error', e);
      alert('Verwijderen mislukt');
    }
  };

  // Keyboard navigation for photo viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      if (event.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (event.key === 'ArrowLeft') {
        const currentIndex = customerPhotos.findIndex(p => p.id === selectedPhoto.id);
        const prevPhoto = customerPhotos[currentIndex - 1];
        if (prevPhoto) setSelectedPhoto(prevPhoto);
      } else if (event.key === 'ArrowRight') {
        const currentIndex = customerPhotos.findIndex(p => p.id === selectedPhoto.id);
        const nextPhoto = customerPhotos[currentIndex + 1];
        if (nextPhoto) setSelectedPhoto(nextPhoto);
      }
    };

    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPhoto, customerPhotos]);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    status: 'active',
    plan: '',
    trainingFrequency: 1
  });

  const clientId = params.id as string;

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setLoading(true);
        const startTime = performance.now();
        console.log('Loading client data for ID:', clientId);
        
        // Try optimized API endpoint first
        try {
          const { cachedFetch } = await import('@/lib/cache');
          const clientData = await cachedFetch(`/api/clients/${clientId}`, {}, 30000); // 30 second cache

          const duration = performance.now() - startTime;
          console.log(`📊 Client data loaded in ${Math.round(duration)}ms`);

          if (clientData && !clientData.error) {
            // Set all data from the combined response
            setClient(clientData);
            setMeasurements(clientData.measurements || []);
            setCustomerPhotos(clientData.customerPhotos || []);
            setPhotos(clientData.customerPhotos || []); // Legacy compatibility
            setCustomerPricing(clientData.pricingCalculations || []);
            setTrainingSessions(clientData.trainingSessions || []);
            setNutritionPlans(clientData.customerNutritionPlans || []);
            setPayments(clientData.payments || []);
            return; // Success, exit early
          }
        } catch (optimizedError) {
          console.warn('Optimized API failed, falling back to individual calls:', optimizedError);
        }

        // Fallback to individual API calls if optimized route fails
        console.log('Using fallback: individual API calls');
        
        // Load client data
        const clientResponse = await fetch(`/api/users/${clientId}`);
        if (!clientResponse.ok) {
          throw new Error(`Failed to load client: ${clientResponse.status}`);
        }
        const clientData = await clientResponse.json();
        setClient(clientData);

        // Load all other data in parallel
        const [measurementsRes, photosRes, pricingRes, sessionsRes, nutritionRes, paymentsRes] = await Promise.all([
          fetch(`/api/customer-measurements?customerId=${clientId}`).catch(() => ({ ok: false })),
          fetch(`/api/customer-photos?customerId=${clientId}`).catch(() => ({ ok: false })),
          fetch(`/api/pricing-calculations?customerId=${clientId}`).catch(() => ({ ok: false })),
          fetch(`/api/training-sessions?customerId=${clientId}`).catch(() => ({ ok: false })),
          fetch(`/api/customer-nutrition-plans?customerId=${clientId}`).catch(() => ({ ok: false })),
          fetch(`/api/payments?customerId=${clientId}`).catch(() => ({ ok: false }))
        ]);

        if (measurementsRes.ok) {
          const data = await measurementsRes.json();
          setMeasurements(data);
        }
        if (photosRes.ok) {
          const data = await photosRes.json();
          setCustomerPhotos(data);
          setPhotos(data);
        }
        if (pricingRes.ok) {
          const data = await pricingRes.json();
          setCustomerPricing(data);
        }
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setTrainingSessions(data);
        }
        if (nutritionRes.ok) {
          const data = await nutritionRes.json();
          setNutritionPlans(data);
        }
        if (paymentsRes.ok) {
          const data = await paymentsRes.json();
          setPayments(data);
        }

        const duration = performance.now() - startTime;
        console.log(`📊 Client data loaded (fallback) in ${Math.round(duration)}ms`);

      } catch (error) {
        console.error('Error loading client data:', error);
        alert('Failed to load client data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  // Keyboard navigation for photo viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      const currentIndex = customerPhotos.findIndex(p => p.id === selectedPhoto.id);
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          const prevPhoto = customerPhotos[currentIndex - 1];
          if (prevPhoto) setSelectedPhoto(prevPhoto);
          break;
        case 'ArrowRight':
          event.preventDefault();
          const nextPhoto = customerPhotos[currentIndex + 1];
          if (nextPhoto) setSelectedPhoto(nextPhoto);
          break;
        case 'Escape':
          event.preventDefault();
          setSelectedPhoto(null);
          break;
      }
    };

    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPhoto, customerPhotos]);

  const handleOpenPhotoGallery = (photo?: any) => {
    if (!customerPhotos.length) {
      return;
    }

    const sortedPhotos = [...customerPhotos].sort((a, b) => {
      if (a.week !== b.week) return b.week - a.week;
      const positions = ['front', 'side', 'back'];
      return positions.indexOf(a.position) - positions.indexOf(b.position);
    });

    if (photo) {
      setSelectedPhoto(photo);
    } else {
      setSelectedPhoto(sortedPhotos[0]);
    }
  };

  const handleAddMeasurement = async (formData: any) => {
    try {
      console.log('[Frontend] Adding measurement with data:', { ...formData, customerId: clientId });
      console.log('[Frontend] Client ID from params:', clientId);
      console.log('[Frontend] Client data:', client);
      
      if (!clientId) {
        alert('Error: No client ID found. Please refresh the page and try again.');
        return;
      }
      
      const response = await fetch('/api/customer-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, customerId: clientId })
      });

      console.log('[Frontend] Response status:', response.status);
      
      if (response.ok) {
        const newMeasurement = await response.json();
        console.log('[Frontend] Measurement created successfully:', newMeasurement);
        setMeasurements([newMeasurement, ...measurements]);
        setShowAddMeasurementModal(false);
        alert('Measurement added successfully!');
      } else {
        const errorData = await response.json();
        console.error('[Frontend] Error adding measurement:', errorData);
        console.error('[Frontend] Response status:', response.status);
        alert(`Error adding measurement: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[Frontend] Error adding measurement:', error);
      alert(`Failed to add measurement: ${error.message || 'Network error'}`);
    }
  };

  const handleUpdateMeasurement = async (data: any) => {
    try {
      console.log('Updating measurement:', { id: editingMeasurement.id, data });
      
      const response = await fetch(`/api/customer-measurements/${editingMeasurement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedMeasurement = await response.json();
        setMeasurements(measurements.map(m => m.id === editingMeasurement.id ? updatedMeasurement : m));
        setShowEditMeasurementModal(false);
        setEditingMeasurement(null);
        alert('Measurement updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error updating measurement:', errorData);
        alert(`Error updating measurement: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating measurement:', error);
      alert('Failed to update measurement');
    }
  };

  const handleDeleteMeasurement = async (id: string) => {
    if (confirm('Are you sure you want to delete this measurement?')) {
      try {
        const response = await fetch(`/api/customer-measurements/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setMeasurements(measurements.filter(m => m.id !== id));
          alert('Measurement deleted successfully!');
        } else {
          throw new Error('Failed to delete measurement');
        }
      } catch (error) {
        console.error('Error deleting measurement:', error);
        alert('Failed to delete measurement');
      }
    }
  };

  const handleDeletePaymentClick = (payment: any) => {
    setPaymentToDelete(payment);
    setShowDeletePaymentModal(true);
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      const response = await fetch(`/api/payments/${paymentToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove payment from local state
        setPayments(prev => prev.filter(p => p.id !== paymentToDelete.id));
        setShowDeletePaymentModal(false);
        setPaymentToDelete(null);
        alert('Payment deleted successfully!');
      } else {
        console.error('Failed to delete payment');
        alert('Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Client Not Found</h1>
          <button
            onClick={() => router.push('/admin/clients')}
            className="bg-rose-500 text-white px-6 py-3 rounded-xl hover:bg-rose-600 transition-colors"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full overflow-hidden">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
            <button
              onClick={() => router.push('/admin/clients')}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">{client.name}</h1>
              <p className="text-sm sm:text-base text-gray-600">Client Details & Progress</p>
            </div>
          </div>
        </div>

        {/* Client Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-2xl font-bold text-rose-600">
                  {client.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{client.name}</h2>
                  {/* Current Period Badge */}
                  {client.joinDate && client.trainingFrequency && (() => {
                    const joinDate = new Date(client.joinDate);
                    joinDate.setHours(0, 0, 0, 0);
                    const now = new Date();
                    now.setHours(23, 59, 59, 999);
                    const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
                    const currentPeriodNumber = Math.floor(daysSinceJoin / 28) + 1;
                    const periodStart = new Date(joinDate);
                    periodStart.setDate(periodStart.getDate() + (currentPeriodNumber - 1) * 28);
                    periodStart.setHours(0, 0, 0, 0);
                    const periodEnd = new Date(periodStart);
                    periodEnd.setDate(periodEnd.getDate() + 27);
                    periodEnd.setHours(23, 59, 59, 999);
                    
                    return (
                      <span 
                        className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full border border-rose-200 flex items-center gap-1"
                        title={`Current Period ${currentPeriodNumber}: ${periodStart.toLocaleDateString('en-US')} - ${periodEnd.toLocaleDateString('en-US')}`}
                      >
                        <Clock className="w-3 h-3" />
                        Period {currentPeriodNumber}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-sm sm:text-base text-gray-600 truncate">{client.email}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{client.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Joined {new Date(client.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                    <span className="truncate">{client.rating || 'No rating'}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setEditFormData({
                  name: client.name || '',
                  email: client.email || '',
                  phone: client.phone || '',
                  goal: client.goal || '',
                  status: client.status || 'active',
                  plan: client.plan || '',
                  trainingFrequency: client.trainingFrequency || 1
                });
                setShowEditClientModal(true);
              }}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-3 bg-rose-500 text-white rounded-lg sm:rounded-xl hover:bg-rose-600 transition-colors flex-shrink-0 text-xs sm:text-base"
            >
              <Edit className="w-3 h-3 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Edit client</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 sm:p-4 mb-4 sm:mb-8">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-9 gap-1 sm:gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: Target, shortLabel: 'Overview' },
              { id: 'measurements', label: 'Measurements', icon: Ruler, shortLabel: 'Measure' },
              { id: 'photos', label: 'Photos', icon: Camera, shortLabel: 'Photos' },
              { id: 'progress', label: 'Progress', icon: TrendingUp, shortLabel: 'Progress' },
              { id: 'workout', label: 'Workout Plan', icon: Dumbbell, shortLabel: 'Workout' },
              { id: 'schedule', label: 'Training Schedule', icon: Calendar, shortLabel: 'Schedule' },
              { id: 'periods', label: 'Periods', icon: Clock, shortLabel: 'Periods' },
              { id: 'nutrition', label: 'Nutrition Calculator', icon: Apple, shortLabel: 'Nutrition' },
              { id: 'pricing', label: 'Pricing', icon: DollarSign, shortLabel: 'Pricing' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-rose-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-center leading-tight">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Overview</h3>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Sessions</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{client.scheduledSessions || 0}</div>
                  <div className="text-xs text-gray-500">Total sessions</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Frequency</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{client.trainingFrequency || 0}x</div>
                  <div className="text-xs text-gray-500">Per week</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Goal</span>
                  </div>
                  <div className="text-sm font-bold text-gray-800 line-clamp-2">{client.goal || 'Not set'}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Status</span>
                  </div>
                  <div className="text-sm font-bold text-gray-800 capitalize">{client.status}</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Sessions */}
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Recent Sessions
                  </h4>
                  {trainingSessions.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {trainingSessions.slice(0, 3).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              session.status === 'completed' ? 'bg-green-500' :
                              session.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-gray-800">
                                {new Date(session.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {session.startTime} - {session.endTime} • {session.type}
                              </p>
            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            session.status === 'completed' ? 'bg-green-100 text-green-800' :
                            session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent sessions</p>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    Financial Summary
                  </h4>
                  {customerPricing.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {customerPricing.slice(0, 2).map((pricing) => (
                        <div key={pricing.id} className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs sm:text-sm font-medium text-gray-800">{pricing.service}</span>
                            <span className="text-xs sm:text-sm font-bold text-green-600">{pricing.finalPrice} RON</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {pricing.duration} weeks • {pricing.frequency}x/week
                          </div>
                        </div>
                      ))}
                      {payments.length > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-gray-600">Total Paid:</span>
                            <span className="font-semibold text-gray-800">
                              {payments.reduce((sum, payment) => sum + payment.amount, 0)} RON
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No pricing information</p>
                  )}
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  Progress Overview
                </h4>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-gray-800">{measurements.length}</div>
                    <div className="text-xs text-gray-500">Measurements</div>
                  </div>
                  <div 
                    className="text-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      console.log('Progress Photos card clicked, customerPhotos:', customerPhotos);
                      handleOpenPhotoGallery();
                    }}
                  >
                    <div className="text-lg sm:text-xl font-bold text-gray-800">{customerPhotos.length}</div>
                    <div className="text-xs text-gray-500">Progress Photos</div>
                    <div className="text-xs text-blue-600 mt-1">Click to view</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-gray-800">{nutritionPlans.length}</div>
                    <div className="text-xs text-gray-500">Nutrition Plans</div>
                  </div>
                </div>
                
                {/* Progress Chart */}
                {measurements.length > 0 && renderProgressChart()}
                
                {renderVisualProgress()}
              </div>
            </div>
          )}

          {activeTab === 'measurements' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Measurements</h3>
                <button
                  onClick={() => setShowAddMeasurementModal(true)}
                  className="bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add Measurement</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>

              {measurements.length > 0 ? (
                <div className="space-y-4">
                  {measurements.map((measurement) => (
                    <div key={measurement.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                          {new Date(measurement.date).toLocaleDateString()}
                        </h4>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setEditingMeasurement(measurement);
                              setShowEditMeasurementModal(true);
                            }}
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMeasurement(measurement.id)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Week:</span>
                          <span className="font-medium">{measurement.week}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Weight:</span>
                          <span className="font-medium">{measurement.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Height:</span>
                          <span className="font-medium">{measurement.height} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Age:</span>
                          <span className="font-medium">{measurement.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">BMI:</span>
                          <span className="font-medium">{measurement.bmi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Chest:</span>
                          <span className="font-medium">{measurement.chest} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Waist:</span>
                          <span className="font-medium">{measurement.waist} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Hips:</span>
                          <span className="font-medium">{measurement.hips} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Thigh:</span>
                          <span className="font-medium">{measurement.thigh} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Arm:</span>
                          <span className="font-medium">{measurement.arm} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Neck:</span>
                          <span className="font-medium">{measurement.neck} cm</span>
                        </div>
                      </div>
                      {measurement.notes && (
                        <div className="mt-3">
                          <span className="text-gray-500 text-sm">Notes:</span>
                          <p className="text-gray-800 text-sm mt-1">{measurement.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No measurements recorded yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Progress Photos</h3>
                <button
                  onClick={() => {
                    setEditingPhoto(null);
                    setShowPhotoUploadModal(true);
                  }}
                  className="bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Upload Photos</span>
                  <span className="sm:hidden">Upload</span>
                </button>
              </div>

              {customerPhotos.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {Array.from(new Set(customerPhotos.map(p => p.week))).sort((a, b) => b - a).map(week => (
                    <div key={week} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800">Week {week}</h4>
                        <button
                          className="text-red-600 text-sm hover:underline"
                          onClick={() => deleteWeekAndRenumber(week)}
                        >
                          Delete Week
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {['front', 'side', 'back'].map(position => {
                          const photo = customerPhotos.find(p => p.week === week && p.position === position);
                          return (
                            <div key={position} className="text-center">
                              <h5 className="text-sm sm:text-base font-medium text-gray-700 mb-3 capitalize">{position} View</h5>
                              {photo ? (
                                <div className="relative group">
                                  <img
                                    src={photo.imageUrl}
                                    alt={`${position} view week ${week}`}
                                    className="w-full h-56 sm:h-64 md:h-48 object-contain bg-gray-50 rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                                    onClick={() => handleOpenPhotoGallery(photo)}
                                    loading="lazy"
                                  />
                                  {/* Action buttons - always visible on mobile, hover on desktop */}
                                  <div className="absolute top-3 right-3 flex flex-col sm:flex-row gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenPhotoGallery(photo);
                                      }}
                                      className="bg-black/70 backdrop-blur-md text-white p-2.5 sm:p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-black/90 active:bg-black shadow-lg"
                                      title="Bekijk foto"
                                    >
                                      <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingPhoto({ week, position, existingPhoto: photo });
                                        setShowPhotoUploadModal(true);
                                      }}
                                      className="bg-blue-500 text-white p-2.5 sm:p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-blue-600 active:bg-blue-700 shadow-lg"
                                      title="Replace Photo"
                                    >
                                      <Upload className="w-5 h-5 sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePhotoClick({ id: photo.id, week, position });
                                      }}
                                      className="bg-red-500 text-white p-2.5 sm:p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-red-600 active:bg-red-700 shadow-lg"
                                      title="Foto verwijderen"
                                    >
                                      <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative">
                                  <div className="w-full h-56 sm:h-64 md:h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                                    <span className="text-gray-400 text-sm sm:text-base mb-3">No {position} photo</span>
                                    <button
                                      onClick={() => {
                                        setEditingPhoto({ week, position, existingPhoto: null });
                                        setShowPhotoUploadModal(true);
                                      }}
                                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700 text-sm sm:text-base font-medium flex items-center gap-2 shadow-md"
                                    >
                                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                      Add Photo
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {customerPhotos.find(p => p.week === week && p.notes) && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {customerPhotos.find(p => p.week === week && p.notes)?.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No progress photos uploaded yet</p>
                  <p className="text-gray-400 text-sm mt-2">Upload front, side, and back view photos to track progress</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Progress Tracking</h3>
              
              {measurements.length > 1 ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Progress Overview Cards */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {(() => {
                      const sortedMeasurements = [...measurements].sort((a, b) => a.week - b.week);
                      const first = sortedMeasurements[0];
                      const last = sortedMeasurements[sortedMeasurements.length - 1];
                      
                      const weightDiff = last.weight && first.weight ? last.weight - first.weight : 0;
                      const bmiDiff = last.bmi && first.bmi ? last.bmi - first.bmi : 0;
                      
                      return (
                        <>
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                              <h4 className="font-semibold text-blue-800 text-sm sm:text-base">Weight Change</h4>
                              <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${weightDiff >= 0 ? 'text-red-500' : 'text-green-500'}`} />
                            </div>
                            <div className="text-lg sm:text-2xl font-bold text-blue-900">
                              {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                            </div>
                            <div className="text-xs sm:text-sm text-blue-600">
                              Week 1 → Week {sortedMeasurements.length}
                            </div>
                            <div className="text-xs text-blue-500 mt-1">
                              {first.weight} kg → {last.weight} kg
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                              <h4 className="font-semibold text-green-800 text-sm sm:text-base">BMI Change</h4>
                              <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${bmiDiff >= 0 ? 'text-red-500' : 'text-green-500'}`} />
                            </div>
                            <div className="text-lg sm:text-2xl font-bold text-green-900">
                              {bmiDiff > 0 ? '+' : ''}{bmiDiff.toFixed(1)}
                            </div>
                            <div className="text-xs sm:text-sm text-green-600">
                              Week 1 → Week {sortedMeasurements.length}
                            </div>
                            <div className="text-xs text-green-500 mt-1">
                              {first.bmi} → {last.bmi}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Weekly Progress Chart */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Weekly Progress Overview</h4>
                    <div className="space-y-4">
                      {[...measurements].sort((a, b) => a.week - b.week).map((measurement, index) => {
                        const prevMeasurement = index > 0 ? measurements.sort((a, b) => a.week - b.week)[index - 1] : null;
                        
                        return (
                          <div key={measurement.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-gray-800">Week {index + 1}</h5>
                              <span className="text-sm text-gray-500">{new Date(measurement.date).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-800">{measurement.weight} kg</div>
                                <div className="text-xs text-gray-500">Weight</div>
                                {prevMeasurement && (
                                  <div className={`text-xs ${measurement.weight - prevMeasurement.weight >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {measurement.weight - prevMeasurement.weight > 0 ? '+' : ''}{(measurement.weight - prevMeasurement.weight).toFixed(1)} kg
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-800">{measurement.bmi}</div>
                                <div className="text-xs text-gray-500">BMI</div>
                                {prevMeasurement && (
                                  <div className={`text-xs ${measurement.bmi - prevMeasurement.bmi >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {measurement.bmi - prevMeasurement.bmi > 0 ? '+' : ''}{(measurement.bmi - prevMeasurement.bmi).toFixed(1)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Body Measurements Progress */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Body Measurements Progress</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['chest', 'waist', 'hips', 'thigh', 'arm', 'neck'].map(measurementType => {
                        const sortedMeasurements = [...measurements].sort((a, b) => a.week - b.week);
                        const first = sortedMeasurements[0];
                        const last = sortedMeasurements[sortedMeasurements.length - 1];
                        const diff = last[measurementType] && first[measurementType] ? last[measurementType] - first[measurementType] : 0;
                        
                        return (
                          <div key={measurementType} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-800 capitalize">{measurementType}</h5>
                              <div className={`text-sm ${diff >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)} cm
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{last[measurementType]} cm</div>
                            <div className="text-xs text-gray-500">
                              Week {first.week}: {first[measurementType]} cm
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Add more measurements to see progress tracking</p>
                  <p className="text-gray-400 text-sm mt-2">Progress charts will appear after multiple measurements are recorded</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Training Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Training Schedule</h3>
              <button
                onClick={() => router.push('/admin/schedule')}
                className="bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add Session</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Training Statistics */}
            {trainingSessions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Training Statistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {trainingSessions.length}
                    </div>
                    <div className="text-sm text-blue-800">Total Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {trainingSessions.filter(session => session.status === 'completed').length}
                    </div>
                    <div className="text-sm text-green-800">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {trainingSessions.filter(session => session.status === 'scheduled').length}
                    </div>
                    <div className="text-sm text-orange-800">Scheduled</div>
                  </div>
            </div>
          </div>
        )}

            {trainingSessions.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-6">
                <div className="space-y-4">
                  {trainingSessions.map((session) => (
                    <div key={session.id} className={`border rounded-lg p-3 sm:p-4 ${
                      session.status === 'completed' 
                        ? 'bg-green-100 border-green-200' 
                        : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            session.status === 'completed' 
                              ? 'bg-green-200' 
                              : 'bg-rose-100'
                          }`}>
                            <Calendar className={`w-5 h-5 ${
                              session.status === 'completed' 
                                ? 'text-green-700' 
                                : 'text-rose-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className={`font-semibold text-sm sm:text-base ${
                              session.status === 'completed' 
                                ? 'text-green-800' 
                                : 'text-gray-800'
                            }`}>
                              {new Date(session.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </h4>
                            <p className={`text-sm ${
                              session.status === 'completed' 
                                ? 'text-green-600' 
                                : 'text-gray-600'
                            }`}>
                              {session.startTime} - {session.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            session.status === 'completed' ? 'bg-green-200 text-green-800' :
                            session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this training session?')) {
                                try {
                                  const response = await fetch(`/api/training-sessions/${session.id}`, {
                                    method: 'DELETE'
                                  });
                                  
                                  if (response.ok) {
                                    setTrainingSessions(trainingSessions.filter(s => s.id !== session.id));
                                    alert('Training session deleted successfully!');
                                  } else {
                                    const errorData = await response.json();
                                    console.error('Error deleting training session:', errorData);
                                    alert(`Error deleting training session: ${errorData.error || 'Unknown error'}`);
                                  }
                                } catch (error) {
                                  console.error('Error deleting training session:', error);
                                  alert('Failed to delete training session. Please try again.');
                                }
                              }
                            }}
                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                            title="Delete session"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className={session.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>Type:</span>
                          <span className={`font-medium ${session.status === 'completed' ? 'text-green-800' : 'text-gray-800'}`}>{session.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={session.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>Duration:</span>
                          <span className={`font-medium ${session.status === 'completed' ? 'text-green-800' : 'text-gray-800'}`}>
                            {(() => {
                              const start = new Date(`2000-01-01T${session.startTime}`);
                              const end = new Date(`2000-01-01T${session.endTime}`);
                              const diff = end.getTime() - start.getTime();
                              const hours = Math.floor(diff / (1000 * 60 * 60));
                              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                              return `${hours}h ${minutes}m`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={session.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>Status:</span>
                          <span className={`font-medium capitalize ${session.status === 'completed' ? 'text-green-800' : 'text-gray-800'}`}>{session.status}</span>
                        </div>
                      </div>
                      
                      {session.notes && (
                        <div className={`mt-3 p-3 rounded-lg ${
                          session.status === 'completed' 
                            ? 'bg-green-50' 
                            : 'bg-gray-50'
                        }`}>
                          <p className={`text-sm ${
                            session.status === 'completed' 
                              ? 'text-green-700' 
                              : 'text-gray-600'
                          }`}>
                            <strong>Notes:</strong> {session.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No training sessions scheduled</p>
                <p className="text-gray-400 text-sm mt-2">Add training sessions to create a schedule for this client</p>
              </div>
            )}
          </div>
        )}

        {/* Nutrition Plans Tab */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Nutrition Plans</h3>
              <button
                onClick={() => router.push('/admin/voedingsplannen')}
                className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Assign Plan
              </button>
            </div>

            {nutritionPlans.length > 0 ? (
              <div className="grid gap-4">
                {nutritionPlans.map((assignment) => (
                  <div key={assignment.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                            <Apple className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">{assignment.nutritionPlan.name}</h4>
                            <p className="text-sm text-gray-600">{assignment.nutritionPlan.goal}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-rose-600">{assignment.nutritionPlan.calories}</div>
                            <div className="text-xs text-gray-600">Calories</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{assignment.nutritionPlan.protein}g</div>
                            <div className="text-xs text-gray-600">Protein</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600 capitalize">{assignment.status}</div>
                            <div className="text-xs text-gray-500">Status</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600">
                              {new Date(assignment.assignedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">Assigned</div>
                          </div>
                        </div>

                        {assignment.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {assignment.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/voedingsplannen/${assignment.nutritionPlan.id}`)}
                          className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Plan
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to remove this nutrition plan assignment?')) {
                              try {
                                const response = await fetch(`/api/customer-nutrition-plans?id=${assignment.id}`, {
                                  method: 'DELETE'
                                });
                                if (response.ok) {
                                  setNutritionPlans(nutritionPlans.filter(p => p.id !== assignment.id));
                                  alert('Nutrition plan assignment removed successfully');
                                } else {
                                  alert('Failed to remove nutrition plan assignment');
                                }
                              } catch (error) {
                                console.error('Error removing nutrition plan assignment:', error);
                                alert('Error removing nutrition plan assignment');
                              }
                            }
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Apple className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Nutrition Plans Assigned</h4>
                <p className="text-gray-500 mb-4">This client doesn't have any nutrition plans assigned yet.</p>
              <button
                  onClick={() => router.push('/admin/voedingsplannen')}
                className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
              >
                  Assign Nutrition Plan
              </button>
            </div>
            )}
          </div>
        )}

        {/* Workout Plan Tab */}
        {activeTab === 'workout' && (
          <WorkoutPlanTab customerId={Array.isArray(params.id) ? params.id[0] : params.id || ''} />
        )}

        {/* Period Tracking Tab */}
        {activeTab === 'periods' && client && (
          <PeriodTrackingTab
            customerId={client.id}
            joinDate={client.joinDate}
            trainingFrequency={client.trainingFrequency || 3}
            trainingSessions={trainingSessions}
          />
        )}

        {/* Pricing & Payments Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Pricing & Payments</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Record Payment</span>
                  <span className="sm:hidden">Payment</span>
                </button>
              <button
                onClick={() => router.push('/admin/tarieven')}
                  className="bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
              >
                  <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">New Calculation</span>
                  <span className="sm:hidden">New</span>
              </button>
            </div>
            </div>

            {/* Pricing Summary Table */}
            {customerPricing.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Pricing Summary</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Service</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Duration</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Frequency</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Discount</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Total Price</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerPricing.map((pricing) => (
                        <tr key={pricing.id} className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-800">{pricing.service}</td>
                          <td className="py-3 px-2 text-gray-600">{pricing.duration} weeks</td>
                          <td className="py-3 px-2 text-gray-600">{pricing.frequency}x per week</td>
                          <td className="py-3 px-2 text-gray-600">{pricing.discount}%</td>
                          <td className="py-3 px-2 font-bold text-rose-600">{pricing.finalPrice} RON</td>
                          <td className="py-3 px-2">
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this pricing record?')) {
                                  try {
                                    const response = await fetch(`/api/pricing-calculations/${pricing.id}`, {
                                      method: 'DELETE'
                                    });
                                    
                                    if (response.ok) {
                                      setCustomerPricing(customerPricing.filter(p => p.id !== pricing.id));
                                      alert('Pricing record deleted successfully!');
                                    } else {
                                      const errorData = await response.json();
                                      console.error('Error deleting pricing record:', errorData);
                                      alert(`Error deleting pricing record: ${errorData.error || 'Unknown error'}`);
                                    }
                                  } catch (error) {
                                    console.error('Error deleting pricing record:', error);
                                    alert('Failed to delete pricing record. Please try again.');
                                  }
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                              title="Delete pricing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            </div>
              </div>
            )}

            {/* Payment History Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h4>
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Method</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Notes</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-800">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 font-bold text-green-600">{payment.amount} RON</td>
                          <td className="py-3 px-2 text-gray-600 capitalize">{payment.paymentMethod}</td>
                          <td className="py-3 px-2 text-gray-600 capitalize">{payment.paymentType}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-600">{payment.notes || '-'}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingPayment(payment);
                                  setShowEditPaymentModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                title="Edit Payment"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePaymentClick(payment)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Delete Payment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Payments Recorded</h3>
                  <p className="text-gray-500 mb-6">Record the first payment for this client</p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
                  >
                    Record Payment
                  </button>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            {customerPricing.length > 0 && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 sm:p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {customerPricing.reduce((sum, pricing) => sum + pricing.finalPrice, 0)} RON
                    </div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {payments.reduce((sum, payment) => sum + payment.amount, 0)} RON
                    </div>
                    <div className="text-sm text-gray-600">Paid</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {customerPricing.reduce((sum, pricing) => sum + pricing.finalPrice, 0) - payments.reduce((sum, payment) => sum + payment.amount, 0)} RON
                    </div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showAddMeasurementModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Add Measurement</h2>
                <button
                  onClick={() => setShowAddMeasurementModal(false)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <EditMeasurementForm
                measurement={{}}
                onSave={handleAddMeasurement}
                onCancel={() => setShowAddMeasurementModal(false)}
              />
            </div>
          </div>
        )}

        {showEditMeasurementModal && editingMeasurement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Measurement</h2>
                <button
                  onClick={() => {
                    setShowEditMeasurementModal(false);
                    setEditingMeasurement(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <EditMeasurementForm
                measurement={editingMeasurement}
                onSave={handleUpdateMeasurement}
                onCancel={() => {
                  setShowEditMeasurementModal(false);
                  setEditingMeasurement(null);
                }}
              />
            </div>
          </div>
        )}

        {showPhotoUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  {editingPhoto 
                    ? (editingPhoto.existingPhoto 
                        ? `Replace Photo - Week ${editingPhoto.week}` 
                        : `Add Photo - Week ${editingPhoto.week}`)
                    : 'Upload Progress Photos'}
                </h2>
                <button
                  onClick={() => {
                    setShowPhotoUploadModal(false);
                    setEditingPhoto(null);
                  }}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <PhotoUploadForm
                customerId={clientId}
                onSave={(photos) => {
                  console.log('Photos saved:', photos);
                  window.location.reload(); // Reload to refresh all photos
                }}
                onCancel={() => {
                  setShowPhotoUploadModal(false);
                  setEditingPhoto(null);
                }}
                existingPhotos={customerPhotos}
                editingPhoto={editingPhoto}
              />
            </div>
          </div>
        )}

        {/* Delete Photo Confirmation Modal */}
        {showDeletePhotoModal && photoToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Foto verwijderen</h2>
                <button
                  onClick={() => {
                    setShowDeletePhotoModal(false);
                    setPhotoToDelete(null);
                  }}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Weet je zeker dat je de <strong>{photoToDelete.position}</strong> foto voor <strong>Week {photoToDelete.week}</strong> wilt verwijderen?
                </p>
                <p className="text-sm text-red-600 font-medium">
                  Deze actie kan niet ongedaan worden gemaakt.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeletePhotoModal(false);
                    setPhotoToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleDeletePhotoConfirm}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Individual Photo Viewer Modal - Full Screen */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="text-xl sm:text-2xl font-bold capitalize flex items-center gap-2 sm:gap-3">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                      selectedPhoto.position === 'front' ? 'bg-green-500' :
                      selectedPhoto.position === 'side' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    {selectedPhoto.position} View
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300">
                    Week {selectedPhoto.week} • {new Date(selectedPhoto.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Main Photo - Full Screen */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20">
              <img
                src={selectedPhoto.imageUrl}
                alt={`${selectedPhoto.position} view week ${selectedPhoto.week}`}
                className="max-w-full max-h-full object-contain"
                style={{
                  maxWidth: '100vw',
                  maxHeight: '100vh',
                  width: 'auto',
                  height: 'auto'
                }}
              />
            </div>

            {/* Navigation */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 sm:p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      const currentIndex = customerPhotos.findIndex(p => p.id === selectedPhoto.id);
                      const prevPhoto = customerPhotos[currentIndex - 1];
                      if (prevPhoto) setSelectedPhoto(prevPhoto);
                    }}
                    className="p-2 sm:p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                    disabled={customerPhotos.findIndex(p => p.id === selectedPhoto.id) === 0}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs sm:text-sm">
                    {customerPhotos.findIndex(p => p.id === selectedPhoto.id) + 1} of {customerPhotos.length}
                  </span>
                  <button
                    onClick={() => {
                      const currentIndex = customerPhotos.findIndex(p => p.id === selectedPhoto.id);
                      const nextPhoto = customerPhotos[currentIndex + 1];
                      if (nextPhoto) setSelectedPhoto(nextPhoto);
                    }}
                    className="p-2 sm:p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                    disabled={customerPhotos.findIndex(p => p.id === selectedPhoto.id) === customerPhotos.length - 1}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-gray-300 max-w-xs">
                  {selectedPhoto.notes && (
                    <p className="truncate" title={selectedPhoto.notes}>
                      {selectedPhoto.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {showEditClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Client</h2>
                <button
                  onClick={() => setShowEditClientModal(false)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  // Ensure trainingFrequency is a number
                  const dataToSend = {
                    ...editFormData,
                    trainingFrequency: typeof editFormData.trainingFrequency === 'string' 
                      ? parseInt(editFormData.trainingFrequency, 10) 
                      : Number(editFormData.trainingFrequency) || 1
                  };
                  
                  console.log('Sending update data:', dataToSend);
                  
                  const response = await fetch(`/api/users/${clientId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSend)
                  });
                  
                  if (response.ok) {
                    const updatedClient = await response.json();
                    setClient(updatedClient);
                    setShowEditClientModal(false);
                    // Reload the page to refresh all data
                    window.location.reload();
                  } else {
                    const errorData = await response.json();
                    console.error('Update error:', errorData);
                    alert(`Error updating client: ${errorData.error || 'Unknown error'}`);
                  }
                } catch (error: any) {
                  console.error('Error updating client:', error);
                  alert(`Error updating client: ${error.message || 'Please try again'}`);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
                    <input
                      type="text"
                      value={editFormData.goal}
                      onChange={(e) => setEditFormData({...editFormData, goal: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Training Frequency</label>
                    <select
                      value={editFormData.trainingFrequency}
                      onChange={(e) => setEditFormData({...editFormData, trainingFrequency: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value={1}>1x per week</option>
                      <option value={2}>2x per week</option>
                      <option value={3}>3x per week</option>
                      <option value={4}>4x per week</option>
                      <option value={5}>5x per week</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                  <input
                    type="text"
                    value={editFormData.plan}
                    onChange={(e) => setEditFormData({...editFormData, plan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditClientModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Record Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const paymentData = {
                  customerId: clientId,
                  amount: parseFloat(formData.get('amount') as string),
                  paymentMethod: formData.get('paymentMethod') as string,
                  paymentType: formData.get('paymentType') as string,
                  notes: formData.get('notes') as string,
                  paymentDate: formData.get('paymentDate') as string
                };

                try {
                  const response = await fetch('/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentData)
                  });

                  if (response.ok) {
                    const newPayment = await response.json();
                    setPayments([newPayment, ...payments]);
                    setShowPaymentModal(false);
                    alert('Payment recorded successfully!');
                  } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.error || 'Failed to record payment'}`);
                  }
                } catch (error) {
                  console.error('Error recording payment:', error);
                  alert('Failed to record payment. Please try again.');
                }
              }} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (RON)</label>
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                    <input
                      type="date"
                      name="paymentDate"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      name="paymentMethod"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">Select method</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                    <select
                      name="paymentType"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">Select type</option>
                      <option value="full">Full Payment (1x)</option>
                      <option value="installment">Installment (2x)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="Additional notes about this payment..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Payment Modal */}
        {showEditPaymentModal && editingPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Payment</h2>
                <button
                  onClick={() => {
                    setShowEditPaymentModal(false);
                    setEditingPayment(null);
                  }}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const paymentData = {
                  amount: parseFloat(formData.get('amount') as string),
                  paymentMethod: formData.get('paymentMethod') as string,
                  paymentType: formData.get('paymentType') as string,
                  status: formData.get('status') as string,
                  notes: formData.get('notes') as string,
                  paymentDate: formData.get('paymentDate') as string
                };

                try {
                  const response = await fetch(`/api/payments/${editingPayment.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentData)
                  });

                  if (response.ok) {
                    const updatedPayment = await response.json();
                    // Update the payment in the list
                    setPayments(payments.map(p => p.id === editingPayment.id ? updatedPayment : p));
                    setShowEditPaymentModal(false);
                    setEditingPayment(null);
                    alert('Payment updated successfully!');
                    // Reload client data to update next payment date
                    window.location.reload();
                  } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.error || 'Failed to update payment'}`);
                  }
                } catch (error) {
                  console.error('Error updating payment:', error);
                  alert('Failed to update payment. Please try again.');
                }
              }} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (RON)</label>
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      required
                      defaultValue={editingPayment.amount}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                    <input
                      type="date"
                      name="paymentDate"
                      required
                      defaultValue={new Date(editingPayment.paymentDate).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      name="paymentMethod"
                      required
                      defaultValue={editingPayment.paymentMethod}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">Select method</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                    <select
                      name="paymentType"
                      required
                      defaultValue={editingPayment.paymentType}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">Select type</option>
                      <option value="full">Full Payment (1x)</option>
                      <option value="installment">Installment (2x)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue={editingPayment.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={editingPayment.notes || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="Additional notes about this payment..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditPaymentModal(false);
                      setEditingPayment(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Update Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Payment Modal */}
        {showDeletePaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Delete Payment</h2>
                <button
                  onClick={() => setShowDeletePaymentModal(false)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this payment?
                </p>
                {paymentToDelete && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">
                      <strong>Amount:</strong> {paymentToDelete.amount} RON<br/>
                      <strong>Date:</strong> {new Date(paymentToDelete.paymentDate).toLocaleDateString()}<br/>
                      <strong>Method:</strong> {paymentToDelete.paymentMethod}<br/>
                      <strong>Type:</strong> {paymentToDelete.paymentType}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeletePaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePayment}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

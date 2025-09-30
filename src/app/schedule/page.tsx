'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit3, Trash2, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

interface Workout {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  endTime: string;
  duration: number;
  description: string;
  completed: boolean;
  status: string;
  customerName?: string;
  workout?: {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    duration: number;
    trainingType: string;
  };
}

export default function SchedulePage() {
  const { t } = useLanguage();
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWorkout, setNewWorkout] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    duration: '',
    description: ''
  });

  // Fetch workouts from API and auto-complete past sessions
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        // For now, we'll use a default customer ID - in a real app this would come from auth context
        const customerId = 'cmg29hgp90004dvgyol5vasje'; // Replace with actual customer ID from auth
        
        // Get current week's date range with proper timezone handling
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate start of week (Monday = 1, so we adjust accordingly)
        const startOfWeek = new Date(today);
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 6 days from Monday
        startOfWeek.setDate(today.getDate() - daysFromMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Calculate end of week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        // Debug logging for mobile calendar
        console.log('Current date info:', {
          today: today.toDateString(),
          currentDay: currentDay,
          dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay],
          startOfWeek: startOfWeek.toDateString(),
          endOfWeek: endOfWeek.toDateString()
        });
        
        const response = await fetch(
          `/api/schedule?customerId=${customerId}&startDate=${startOfWeek.toISOString().split('T')[0]}&endDate=${endOfWeek.toISOString().split('T')[0]}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setWorkouts(data);
          
          // Auto-complete past sessions
          await autoCompletePastSessions(data, customerId);
        } else {
          console.error('Failed to fetch workouts');
        }
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const autoCompletePastSessions = async (workouts: Workout[], customerId: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today at 00:00:00
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    for (const workout of workouts) {
      const workoutDate = new Date(workout.date);
      const workoutTime = workout.time;
      
      // Check if the workout is in the past
      const isPastDate = workoutDate < today;
      const isToday = workoutDate.toDateString() === today.toDateString();
      const isPastTime = isToday && workoutTime < currentTime;
      
      if ((isPastDate || isPastTime) && !workout.completed) {
        try {
          // Auto-complete the session
          const response = await fetch('/api/training-sessions', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: workout.id,
              customerId,
              date: workout.date,
              startTime: workout.time,
              endTime: workout.endTime,
              type: '1:1',
              status: 'completed',
              notes: workout.description
            })
          });

          if (response.ok) {
            // Update local state
            setWorkouts(prevWorkouts => 
              prevWorkouts.map(w => 
                w.id === workout.id 
                  ? { ...w, completed: true, status: 'completed' }
                  : w
              )
            );
          }
        } catch (error) {
          console.error('Error auto-completing session:', error);
        }
      }
    }
  };

  const handleAddWorkout = async () => {
    if (newWorkout.title && newWorkout.type && newWorkout.date && newWorkout.time) {
      try {
        // Create training session via API
        const response = await fetch('/api/training-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: 'cmg29hgp90004dvgyol5vasje', // Replace with actual customer ID
            date: newWorkout.date,
            startTime: newWorkout.time,
            endTime: calculateEndTime(newWorkout.time, parseInt(newWorkout.duration)),
            type: '1:1',
            status: 'scheduled',
            notes: newWorkout.description
          })
        });

        if (response.ok) {
          // Refresh workouts with improved date logic
          const today = new Date();
          const currentDay = today.getDay();
          const startOfWeek = new Date(today);
          const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
          startOfWeek.setDate(today.getDate() - daysFromMonday);
          startOfWeek.setHours(0, 0, 0, 0);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          
          const refreshResponse = await fetch(
            `/api/schedule?customerId=cmg29hgp90004dvgyol5vasje&startDate=${startOfWeek.toISOString().split('T')[0]}&endDate=${endOfWeek.toISOString().split('T')[0]}`
          );
          
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setWorkouts(data);
          }
          
      setNewWorkout({
        title: '',
        type: '',
        date: '',
        time: '',
        duration: '',
        description: ''
      });
      setShowAddWorkout(false);
        }
      } catch (error) {
        console.error('Error adding workout:', error);
      }
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      const response = await fetch(`/api/training-sessions?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
    setWorkouts(workouts.filter(workout => workout.id !== id));
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };


  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return endDate.toTimeString().slice(0, 5);
  };

  const getWorkoutsByDate = () => {
    const grouped = workouts.reduce((acc, workout) => {
      if (!acc[workout.date]) {
        acc[workout.date] = [];
      }
      acc[workout.date].push(workout);
      return acc;
    }, {} as Record<string, typeof workouts>);

    return Object.entries(grouped).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading schedule...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Workout Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowAddWorkout(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            {t.dashboard.addNewWorkout}
          </button>
        </div>

        {/* Schedule by Date */}
        <div className="space-y-6">
          {getWorkoutsByDate().length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No workouts scheduled</h3>
              <p className="text-gray-500">Add your first workout to get started!</p>
            </div>
          ) : (
            getWorkoutsByDate().map(([date, dateWorkouts], dateIndex) => (
            <div
              key={date}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateWorkouts.map((workout, workoutIndex) => (
                  <div
                    key={workout.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      workout.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                          workout.completed 
                            ? 'bg-green-500' 
                            : 'bg-gradient-to-br from-rose-400 to-pink-500'
                        }`}>
                          {workout.completed ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <Calendar className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${workout.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {workout.title}
                          </h4>
                          <p className="text-sm text-gray-600">{workout.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{workout.time} - {workout.duration} min</span>
                      </div>
                      {workout.description && (
                        <p className="text-sm text-gray-600">{workout.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
          )}
        </div>

        {/* Add Workout Modal */}
        {showAddWorkout && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">{t.dashboard.addNewWorkout}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.workoutTitle}</label>
                  <input
                    type="text"
                    value={newWorkout.title}
                    onChange={(e) => setNewWorkout({...newWorkout, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    placeholder={t.dashboard.morningCardio}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.workoutType}</label>
                  <select
                    value={newWorkout.type}
                    onChange={(e) => setNewWorkout({...newWorkout, type: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">{t.dashboard.selectType}</option>
                    <option value="Cardio">{t.dashboard.cardio}</option>
                    <option value="Strength">{t.dashboard.strength}</option>
                    <option value="Yoga">{t.dashboard.yoga}</option>
                    <option value="Running">{t.dashboard.running}</option>
                    <option value="Swimming">{t.dashboard.swimming}</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.date}</label>
                    <input
                      type="date"
                      value={newWorkout.date}
                      onChange={(e) => setNewWorkout({...newWorkout, date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.time}</label>
                    <input
                      type="time"
                      value={newWorkout.time}
                      onChange={(e) => setNewWorkout({...newWorkout, time: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.duration}</label>
                  <input
                    type="number"
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout({...newWorkout, duration: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    placeholder="45"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.description}</label>
                  <textarea
                    value={newWorkout.description}
                    onChange={(e) => setNewWorkout({...newWorkout, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    rows={3}
                    placeholder={t.dashboard.workoutDescription}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowAddWorkout(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  onClick={handleAddWorkout}
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300"
                >
                  {t.dashboard.addWorkout}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

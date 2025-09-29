'use client';

import { useState } from 'react';
import { Calendar, Clock, Plus, Edit3, Trash2, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

export default function SchedulePage() {
  const { t } = useLanguage();
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    duration: '',
    description: ''
  });

  const [workouts, setWorkouts] = useState([
    {
      id: 1,
      title: t.dashboard.morningCardio,
      type: t.dashboard.cardio,
      date: '2024-01-15',
      time: '07:00',
      duration: '45',
      description: t.dashboard.morningRun,
      completed: false
    },
    {
      id: 2,
      title: t.dashboard.strengthTraining,
      type: t.dashboard.strength,
      date: '2024-01-15',
      time: '18:00',
      duration: '60',
      description: t.dashboard.upperBodyWorkout,
      completed: false
    },
    {
      id: 3,
      title: t.dashboard.yogaSession,
      type: t.dashboard.yoga,
      date: '2024-01-16',
      time: '19:00',
      duration: '30',
      description: t.dashboard.eveningYoga,
      completed: true
    }
  ]);

  const handleAddWorkout = () => {
    if (newWorkout.title && newWorkout.type && newWorkout.date && newWorkout.time) {
      const workout = {
        id: Date.now(),
        ...newWorkout,
        completed: false
      };
      setWorkouts([...workouts, workout]);
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
  };

  const handleDeleteWorkout = (id: number) => {
    setWorkouts(workouts.filter(workout => workout.id !== id));
  };

  const handleToggleComplete = (id: number) => {
    setWorkouts(workouts.map(workout => 
      workout.id === id ? { ...workout, completed: !workout.completed } : workout
    ));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Schedule by Date */}
        <div className="space-y-6">
          {getWorkoutsByDate().map(([date, dateWorkouts], dateIndex) => (
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
                          onClick={() => handleToggleComplete(workout.id)}
                          className={`p-1 rounded transition-colors duration-200 ${
                            workout.completed 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </button>
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
          ))}
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

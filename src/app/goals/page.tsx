'use client';

import { useState } from 'react';
import { Target, Plus, Edit3, Trash2, Check, Calendar, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

export default function GoalsPage() {
  const { t } = useLanguage();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', deadline: '', description: '' });
  
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: t.dashboard.loseWeight,
      target: '65kg',
      current: '68.5kg',
      deadline: '2024-03-15',
      description: t.dashboard.reachTargetWeight,
      progress: 68,
      completed: false
    },
    {
      id: 2,
      title: t.dashboard.run5k,
      target: '5km',
      current: '3.2km',
      deadline: '2024-02-28',
      description: t.dashboard.complete5kRun,
      progress: 64,
      completed: false
    },
    {
      id: 3,
      title: t.dashboard.workout4x,
      target: '4 workouts',
      current: '3 workouts',
      deadline: '2024-12-31',
      description: t.dashboard.maintainWorkoutSchedule,
      progress: 75,
      completed: false
    }
  ]);

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.target && newGoal.deadline) {
      const goal = {
        id: Date.now(),
        ...newGoal,
        current: '0',
        progress: 0,
        completed: false
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: '', target: '', deadline: '', description: '' });
      setShowAddGoal(false);
    }
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const handleToggleComplete = (id: number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => (
            <div
              key={goal.id}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 ${
                goal.completed ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                    goal.completed 
                      ? 'bg-gradient-to-br from-green-400 to-green-500' 
                      : 'bg-gradient-to-br from-rose-400 to-pink-500'
                  }`}>
                    {goal.completed ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Target className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleComplete(goal.id)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      goal.completed 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{goal.current} / {goal.target}</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      goal.completed 
                        ? 'bg-gradient-to-r from-green-400 to-green-500' 
                        : 'bg-gradient-to-r from-rose-500 to-pink-500'
                    }`}
                    style={{width: `${goal.progress}%`}}
                  ></div>
                </div>
              </div>

              {/* Goal Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{t.dashboard.deadline}: {new Date(goal.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{t.dashboard.progress}: {goal.progress}% {t.dashboard.progressComplete}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">{t.dashboard.addNewGoal}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.goalTitle}</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    placeholder={t.dashboard.goalPlaceholder}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.target}</label>
                  <input
                    type="text"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    placeholder={t.dashboard.targetPlaceholder}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.deadline}</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.description}</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    rows={3}
                    placeholder={t.dashboard.descriptionPlaceholder}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  onClick={handleAddGoal}
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300"
                >
                  {t.dashboard.addGoal}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

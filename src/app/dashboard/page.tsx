'use client';

import { useState } from 'react';
import { Weight, TrendingUp, Activity, Droplets, Zap, X, Plus, Target, User, Calendar, Trophy, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    water: 1,
    workoutType: '',
    duration: '',
    intensity: 'Medium',
    weight: '',
    calories: ''
  });

  const handleSave = (type: string) => {
    // Here you would typically save to a backend
    console.log(`Saving ${type}:`, formData);
    setActiveModal(null);
    // Reset form data
    setFormData({
      water: 1,
      workoutType: '',
      duration: '',
      intensity: 'Medium',
      weight: '',
      calories: ''
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t.dashboard.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Admin Navigation */}
        <div
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{t.admin.dashboard.title}</h3>
                <p className="text-sm text-gray-600">{t.admin.dashboard.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
{t.admin.dashboard.title}
            </button>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Weight Card */}
          <div
            onClick={() => setActiveModal('weight')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Weight className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">{t.dashboard.currentWeight}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">68.5 {t.dashboard.kg}</div>
            <div className="text-sm text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              -2.3 {t.dashboard.kg} {t.dashboard.thisMonth}
            </div>
          </div>

          {/* Goal Weight Card */}
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">{t.dashboard.goalWeight}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">65.0 {t.dashboard.kg}</div>
            <div className="text-sm text-blue-600">8 {t.dashboard.weeksLeft}</div>
          </div>

          {/* BMI Card */}
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">{t.dashboard.bmi}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">22.4</div>
            <div className="text-sm text-green-600">{t.dashboard.healthyRange}</div>
          </div>

          {/* Progress Card */}
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">{t.dashboard.progress}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">68%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full" style={{width: '68%'}}></div>
            </div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            onClick={() => setActiveModal('workout')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-gray-500">{t.dashboard.workouts}</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">4/5</div>
            <div className="text-sm text-gray-600">{t.dashboard.thisWeek}</div>
          </div>

          <div
            onClick={() => setActiveModal('calories')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-gray-500">{t.dashboard.calories}</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">1,847</div>
            <div className="text-sm text-gray-600">{t.dashboard.today}</div>
          </div>

          <div
            onClick={() => setActiveModal('water')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-gray-500">{t.dashboard.water}</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">6/8</div>
            <div className="text-sm text-gray-600">glasses {t.dashboard.today}</div>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-gray-500">{t.dashboard.steps}</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">8,432</div>
            <div className="text-sm text-gray-600">{t.dashboard.today}</div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: User, title: t.dashboard.profile, description: t.dashboard.profileDesc, path: '/profile' },
            { icon: Calendar, title: t.dashboard.schedule, description: t.dashboard.scheduleDesc, path: '/schedule' },
            { icon: Target, title: t.dashboard.goals, description: t.dashboard.goalsDesc, path: '/goals' },
            { icon: Trophy, title: t.dashboard.achievements, description: t.dashboard.achievementsDesc, path: '/achievements' }
          ].map((item, index) => (
            <div
              key={item.title}
              onClick={() => router.push(item.path)}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      {activeModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {activeModal === 'water' && t.dashboard.addWater}
                {activeModal === 'workout' && t.dashboard.addWorkout}
                {activeModal === 'weight' && t.dashboard.addWeight}
                {activeModal === 'calories' && t.dashboard.addCalories}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {activeModal === 'water' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.dashboard.water} ({t.dashboard.glasses})
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleInputChange('water', Math.max(0, formData.water - 1))}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-gray-800 w-12 text-center">
                        {formData.water}
                      </span>
                      <button
                        onClick={() => handleInputChange('water', formData.water + 1)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'workout' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.dashboard.workoutType}
                    </label>
                    <select
                      value={formData.workoutType}
                      onChange={(e) => handleInputChange('workoutType', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">{t.dashboard.selectWorkoutType}</option>
                      <option value="Cardio">{t.dashboard.cardio}</option>
                      <option value="Strength">{t.dashboard.strengthTraining}</option>
                      <option value="Yoga">{t.dashboard.yoga}</option>
                      <option value="Running">{t.dashboard.running}</option>
                      <option value="Swimming">{t.dashboard.swimming}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.dashboard.duration}
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.dashboard.intensity}
                    </label>
                    <select
                      value={formData.intensity}
                      onChange={(e) => handleInputChange('intensity', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="Low">{t.dashboard.low}</option>
                      <option value="Medium">{t.dashboard.medium}</option>
                      <option value="High">{t.dashboard.high}</option>
                    </select>
                  </div>
                </>
              )}

              {activeModal === 'weight' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.dashboard.weight}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    placeholder="68.5"
                  />
                </div>
              )}

              {activeModal === 'calories' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.dashboard.calories}
                  </label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => handleInputChange('calories', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    placeholder="500"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                {t.dashboard.cancel}
              </button>
              <button
                onClick={() => handleSave(activeModal)}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300"
              >
                {t.dashboard.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
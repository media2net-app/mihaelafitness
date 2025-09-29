'use client';

import { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

export default function ProfilePage() {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Mihaela Popescu',
    email: 'mihaela@example.com',
    phone: '+40 721 234 567',
    birthDate: '1990-05-15',
    location: 'Bucharest, Romania',
    height: '165',
    weight: '68.5',
    goal: 'Weight Loss'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to a backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20"
        >
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center mr-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{formData.name}</h2>
                <p className="text-gray-600">{formData.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isEditing ? t.dashboard.cancel : t.dashboard.editProfile}
              </span>
            </button>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.dashboard.personalInformation}</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.fullName}</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800">{formData.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.login.email}</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800">{formData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.phone}</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800">{formData.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.birthDate}</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800">{formData.birthDate}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.location}</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800">{formData.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fitness Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.dashboard.fitnessInformation}</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.height}</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-800">{formData.height} cm</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.currentWeight}</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-800">{formData.weight} kg</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.fitnessGoal}</label>
                {isEditing ? (
                  <select
                    value={formData.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="Weight Loss">{t.dashboard.weightLoss}</option>
                    <option value="Weight Gain">{t.dashboard.weightGain}</option>
                    <option value="Muscle Building">{t.dashboard.muscleBuilding}</option>
                    <option value="General Fitness">{t.dashboard.generalFitness}</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-800">{formData.goal}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div
              className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200"
            >
              <button
                onClick={handleCancel}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
{t.dashboard.cancel}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                <span className="font-medium">{t.dashboard.saveChanges}</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

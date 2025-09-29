'use client';

import { useState } from 'react';
import { Users, Video, MessageCircle, Calendar, Star, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

export default function CoachingPage() {
  const { t } = useLanguage();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

  const coaches = [
    {
      id: 1,
      name: 'Mihaela Popescu',
      title: t.dashboard.headCoach,
      speciality: t.dashboard.weightLossMindset,
      rating: 4.9,
      sessions: 1247,
      price: 120,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      available: true,
      nextAvailable: `${t.dashboard.tomorrow} 2:00 PM`
    },
    {
      id: 2,
      name: 'Alexandra Ionescu',
      title: t.dashboard.nutritionCoach,
      speciality: t.dashboard.nutritionMealPlanning,
      rating: 4.8,
      sessions: 892,
      price: 100,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      available: true,
      nextAvailable: `${t.dashboard.today} 4:00 PM`
    },
    {
      id: 3,
      name: 'Elena Dumitrescu',
      title: t.dashboard.fitnessSpecialist,
      speciality: t.dashboard.strengthTrainingForm,
      rating: 4.9,
      sessions: 634,
      price: 90,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      available: false,
      nextAvailable: t.dashboard.nextWeek
    }
  ];

  const sessionTypes = [
    {
      type: t.dashboard.videoCall,
      icon: Video,
      description: t.dashboard.videoCallDesc,
      price: '€120',
      duration: '60 min'
    },
    {
      type: t.dashboard.chatSupport,
      icon: MessageCircle,
      description: t.dashboard.chatSupportDesc,
      price: '€50',
      duration: '7 days'
    },
    {
      type: t.dashboard.groupSession,
      icon: Users,
      description: t.dashboard.groupSessionDesc,
      price: '€40',
      duration: '45 min'
    }
  ];

  const upcomingSessions = [
    {
      id: 1,
      coach: 'Mihaela Popescu',
      type: t.dashboard.videoCall,
      date: '2024-01-20',
      time: '14:00',
      status: t.dashboard.confirmed
    },
    {
      id: 2,
      coach: 'Alexandra Ionescu',
      type: t.dashboard.chatSupport,
      date: '2024-01-22',
      time: '10:00',
      status: t.dashboard.pending
    }
  ];

  const handleBookSession = (coachId: string) => {
    setSelectedCoach(coachId);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{t.dashboard.coaching}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.dashboard.coachingDescription}
          </p>
        </div>

        {/* Upcoming Sessions */}
        <div
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.dashboard.yourUpcomingSessions}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingSessions.map((session, index) => (
              <div
                key={session.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{session.coach}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(session.date).toLocaleDateString()} at {session.time}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Video className="w-4 h-4 mr-2" />
                    {session.type}
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300">
                  {t.dashboard.joinSession}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Available Coaches */}
        <div
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.dashboard.availableCoaches}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coaches.map((coach, index) => (
              <div
                key={coach.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-center mb-4">
                  <img
                    src={coach.image}
                    alt={coach.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">{coach.name}</h3>
                  <p className="text-sm text-gray-600">{coach.title}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">{coach.speciality}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {coach.rating}
                    </div>
                    <div className="text-gray-600">{coach.sessions} {t.dashboard.sessions}</div>
                  </div>

                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-800">€{coach.price}</span>
                    <span className="text-sm text-gray-600">/{t.dashboard.session}</span>
                  </div>

                  <div className={`text-center text-sm ${
                    coach.available ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {coach.available ? `${t.dashboard.nextAvailable}: ${coach.nextAvailable}` : t.dashboard.currentlyUnavailable}
                  </div>
                </div>

                <button
                  onClick={() => handleBookSession(coach.id.toString())}
                  disabled={!coach.available}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    coach.available
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {coach.available ? t.dashboard.bookSessionButton : t.dashboard.unavailable}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.dashboard.sessionTypes}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessionTypes.map((session, index) => (
              <div
                key={session.type}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <session.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{session.type}</h3>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-gray-600 text-center">{session.description}</p>
                  
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-800">{session.price}</span>
                    <span className="text-sm text-gray-600 ml-1">({session.duration})</span>
                  </div>
                </div>

                <button className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300">
                  {t.dashboard.chooseThisType}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">{t.dashboard.bookSession}</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.selectDate}</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.selectTime}</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300">
                    <option value="">{t.dashboard.chooseTime}</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dashboard.sessionType}</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300">
                    <option value="">{t.dashboard.chooseSessionType}</option>
                    <option value="video">Video Call (€120)</option>
                    <option value="chat">Chat Support (€50)</option>
                    <option value="group">Group Session (€40)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  {t.dashboard.cancel}
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300">
                  {t.dashboard.bookSessionButton}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

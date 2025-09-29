'use client';

import { BookOpen, Brain, Heart, Apple, Dumbbell, Play, Clock, Star, Users, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function AcademyPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const courses = [
    {
      id: 1,
      title: t.dashboard.mindsetMastery,
      description: t.dashboard.mindsetMasteryDesc,
      icon: Brain,
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      duration: '45 min',
      lessons: 8,
      rating: 4.9,
      students: 1247,
      completed: true
    },
    {
      id: 2,
      title: t.dashboard.disciplineHabits,
      description: t.dashboard.disciplineHabitsDesc,
      icon: Heart,
      color: 'from-rose-400 to-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      duration: '60 min',
      lessons: 12,
      rating: 4.8,
      students: 892,
      completed: false
    },
    {
      id: 3,
      title: t.dashboard.nutritionFundamentals,
      description: t.dashboard.nutritionFundamentalsDesc,
      icon: Apple,
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      duration: '90 min',
      lessons: 15,
      rating: 4.9,
      students: 1563,
      completed: false
    },
    {
      id: 4,
      title: t.dashboard.trainingPrinciples,
      description: t.dashboard.trainingPrinciplesDesc,
      icon: Dumbbell,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      duration: '75 min',
      lessons: 10,
      rating: 4.7,
      students: 743,
      completed: false
    }
  ];

  const featuredContent = [
    {
      title: t.dashboard.weeklyMindsetChallenge,
      description: t.dashboard.weeklyMindsetChallengeDesc,
      type: t.dashboard.challenge,
      participants: '2.3k',
      duration: '7 days'
    },
    {
      title: t.dashboard.nutritionMasterclass,
      description: t.dashboard.nutritionMasterclassDesc,
      type: t.dashboard.liveSession,
      participants: '850',
      duration: '2 hours'
    },
    {
      title: t.dashboard.fitnessFormWorkshop,
      description: t.dashboard.fitnessFormWorkshopDesc,
      type: t.dashboard.workshop,
      participants: '420',
      duration: '3 hours'
    }
  ];

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
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{t.dashboard.academy}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.dashboard.academyDescription}
          </p>
        </div>

        {/* Featured Content */}
        <div
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.dashboard.featuredThisWeek}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredContent.map((item, index) => (
              <div
                key={item.title}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                    {item.type}
                  </span>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {item.participants}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.duration}
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300">
                    <Play className="w-4 h-4" />
                    {t.dashboard.join}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses Section */}
        <div
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.dashboard.coreCourses}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className={`rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  course.completed 
                    ? `${course.bgColor} ${course.borderColor}` 
                    : 'bg-white/90 backdrop-blur-sm border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    course.completed 
                      ? `bg-gradient-to-br ${course.color}` 
                      : 'bg-gray-200'
                  }`}>
                    <course.icon className={`w-6 h-6 ${
                      course.completed ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  {course.completed && (
                    <div className="flex items-center text-green-600 text-sm">
                      <Award className="w-4 h-4 mr-1" />
                      {t.dashboard.completed}
                    </div>
                  )}
                </div>

                <h3 className={`text-xl font-semibold mb-2 ${
                  course.completed ? 'text-gray-800' : 'text-gray-800'
                }`}>
                  {course.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {course.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {course.rating}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{course.lessons} {t.dashboard.lessons}</span>
                    <span>{course.students} {t.dashboard.students}</span>
                  </div>

                  {course.completed ? (
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => router.push(`/academy/${course.id}`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300"
                    >
                      <Play className="w-4 h-4" />
                      {t.dashboard.startCourse}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">{t.dashboard.readyToTransform}</h3>
            <p className="text-lg opacity-90 mb-6">
              {t.dashboard.academyCallToAction}
            </p>
            <button className="px-8 py-3 bg-white text-rose-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300">
              {t.dashboard.getStartedToday}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

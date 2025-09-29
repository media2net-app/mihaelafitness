'use client';

import { Trophy, Star, Target, Calendar, Zap, Award, Medal } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

export default function AchievementsPage() {
  const { t } = useLanguage();

  const achievements = [
    {
      id: 1,
      title: t.dashboard.firstWorkout,
      description: t.dashboard.firstWorkoutDesc,
      icon: Zap,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      completed: true,
      date: '2024-01-01',
      points: 10
    },
    {
      id: 2,
      title: t.dashboard.weekWarrior,
      description: t.dashboard.weekWarriorDesc,
      icon: Calendar,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      completed: true,
      date: '2024-01-08',
      points: 50
    },
    {
      id: 3,
      title: t.dashboard.weightLossGoal,
      description: t.dashboard.weightLossGoalDesc,
      icon: Target,
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      completed: true,
      date: '2024-01-15',
      points: 100
    },
    {
      id: 4,
      title: t.dashboard.consistencyKing,
      description: t.dashboard.consistencyKingDesc,
      icon: Trophy,
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      completed: false,
      progress: 25,
      points: 200
    },
    {
      id: 5,
      title: t.dashboard.marathonRunner,
      description: t.dashboard.marathonRunnerDesc,
      icon: Award,
      color: 'from-red-400 to-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      completed: false,
      progress: 15,
      points: 150
    },
    {
      id: 6,
      title: t.dashboard.strengthMaster,
      description: t.dashboard.strengthMasterDesc,
      icon: Medal,
      color: 'from-indigo-400 to-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      completed: false,
      progress: 60,
      points: 300
    }
  ];

  const completedAchievements = achievements.filter(a => a.completed);
  const totalPoints = completedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{completedAchievements.length}</div>
                <div className="text-sm text-gray-600">{t.dashboard.achievementsUnlocked}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalPoints}</div>
                <div className="text-sm text-gray-600">{t.dashboard.totalPoints}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mr-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {Math.round((completedAchievements.length / achievements.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">{t.dashboard.completionRate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={`rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 ${
                achievement.completed 
                  ? `${achievement.bgColor} ${achievement.borderColor}` 
                  : 'bg-white/90 backdrop-blur-sm border-white/20'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  achievement.completed 
                    ? `bg-gradient-to-br ${achievement.color}` 
                    : 'bg-gray-200'
                }`}>
                  <achievement.icon className={`w-6 h-6 ${
                    achievement.completed ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">{achievement.points} pts</div>
                  {achievement.completed && (
                    <div className="text-xs text-green-600">✓ {t.dashboard.unlocked}</div>
                  )}
                </div>
              </div>

              <h3 className={`text-lg font-semibold mb-2 ${
                achievement.completed ? 'text-gray-800' : 'text-gray-600'
              }`}>
                {achievement.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {achievement.description}
              </p>

              {achievement.completed ? (
                <div className="text-xs text-green-600">
                  {t.dashboard.completedOn} {new Date(achievement.date || '').toLocaleDateString()}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t.dashboard.progress}</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${achievement.color}`}
                      style={{width: `${achievement.progress}%`}}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Motivational Message */}
        <div
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">{t.dashboard.keepGoing}</h3>
            <p className="text-lg opacity-90">
              {t.dashboard.achievementsMessage.replace('{count}', completedAchievements.length.toString()).replace('{points}', totalPoints.toString())}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

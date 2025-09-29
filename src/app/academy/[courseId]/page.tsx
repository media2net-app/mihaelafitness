'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, Star, Users, Award, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'reading' | 'exercise' | 'quiz';
  completed: boolean;
  locked: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  students: number;
  duration: number;
  lessons: Lesson[];
  progress: number;
  completed: boolean;
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [courseId, setCourseId] = useState<string>('');
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.courseId);
      setCourse(prev => ({ ...prev, id: resolvedParams.courseId }));
    };
    resolveParams();
  }, [params]);

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.locked) return;
    router.push(`/academy/${courseId}/lesson/${lesson.id}`);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'reading': return '📖';
      case 'exercise': return '💪';
      case 'quiz': return '📝';
      default: return '📚';
    }
  };

  const getLessonStatus = (lesson: Lesson) => {
    if (lesson.completed) return 'completed';
    if (lesson.locked) return 'locked';
    return 'available';
  };

  const completedLessons = course.lessons.filter(l => l.completed).length;
  const totalLessons = course.lessons.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{t.common.back}</span>
        </button>

        {/* Course Header */}
        <div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20"
        >
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
                  <p className="text-gray-600">by {course.instructor}</p>
                </div>
              </div>

              <p className="text-lg text-gray-700 mb-6">{course.description}</p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{course.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{course.students} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{course.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">{completedLessons}/{totalLessons} lessons</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>{t.dashboard.courseProgress}</span>
                  <span>{Math.round((completedLessons / totalLessons) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Course Actions */}
            <div className="lg:w-80">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span className="font-medium">{completedLessons}/{totalLessons}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining</span>
                    <span className="font-medium">{totalLessons - completedLessons}</span>
                  </div>
                </div>
                
                <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold">
                  {course.completed ? 'Review Course' : 'Continue Learning'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.dashboard.lessons}</h2>
          
          <div className="space-y-4">
            {course.lessons.map((lesson, index) => {
              const status = getLessonStatus(lesson);
              const isClickable = !lesson.locked;
              
              return (
                <div
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isClickable 
                      ? 'cursor-pointer hover:shadow-lg border-gray-200 hover:border-purple-300' 
                      : 'cursor-not-allowed border-gray-100 bg-gray-50'
                  } ${
                    status === 'completed' ? 'bg-green-50 border-green-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        status === 'completed' 
                          ? 'bg-green-500' 
                          : status === 'locked' 
                            ? 'bg-gray-300' 
                            : 'bg-purple-500'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : status === 'locked' ? (
                          <Lock className="w-6 h-6 text-gray-500" />
                        ) : (
                          <Play className="w-6 h-6 text-white" />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
                          <span className="text-2xl">{getLessonIcon(lesson.type)}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{lesson.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{lesson.duration} {t.dashboard.minutes}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : status === 'locked' 
                                ? 'bg-gray-100 text-gray-500' 
                                : 'bg-blue-100 text-blue-700'
                          }`}>
                            {status === 'completed' ? t.dashboard.completed : 
                             status === 'locked' ? t.dashboard.notStarted : 
                             t.dashboard.inProgress}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {isClickable && (
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm font-medium">
                          {status === 'completed' ? 'Review' : t.dashboard.startLesson}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

interface LessonContent {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'reading' | 'exercise' | 'quiz';
  content: string;
  videoUrl?: string;
  readingMaterial?: string;
  exercise?: string;
  quiz?: {
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correct: number;
    }>;
  };
  completed: boolean;
  locked: boolean;
}

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [courseId, setCourseId] = useState<string>('');
  const [lessonId, setLessonId] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  const [lesson, setLesson] = useState<LessonContent>({
    id: '',
    title: 'Introduction to Mindset',
    description: 'Understanding the foundation of a successful fitness mindset',
    duration: 8,
    type: 'video',
    completed: false,
    locked: false,
    content: 'In this lesson, you will learn the fundamental principles of developing a strong fitness mindset. We will explore how your thoughts and beliefs directly impact your fitness journey and how to cultivate a positive, sustainable approach to health and wellness.',
    videoUrl: 'https://example.com/video.mp4',
    readingMaterial: `
# Introduction to Mindset

## What is a Fitness Mindset?

A fitness mindset is the collection of thoughts, beliefs, and attitudes that shape how you approach your health and fitness journey. It's the mental framework that determines whether you'll stick to your goals or give up when challenges arise.

## Key Components of a Strong Fitness Mindset

### 1. Growth Mindset
- Believe that your abilities can be developed through dedication and hard work
- View challenges as opportunities to grow
- Learn from failures and setbacks

### 2. Self-Compassion
- Treat yourself with kindness during difficult times
- Avoid harsh self-criticism
- Celebrate small wins along the way

### 3. Long-term Thinking
- Focus on sustainable changes rather than quick fixes
- Understand that real transformation takes time
- Set realistic expectations

## Practical Exercises

1. **Mindset Journal**: Write down three things you're grateful for each day
2. **Affirmation Practice**: Create positive statements about your fitness journey
3. **Visualization**: Spend 5 minutes each day visualizing your success

## Next Steps

After completing this lesson, you'll be ready to move on to "Overcoming Mental Barriers" where we'll dive deeper into specific challenges and how to overcome them.
    `,
    exercise: `
# Mindset Assessment Exercise

## Instructions
Take a moment to reflect on your current fitness mindset by answering these questions honestly:

### 1. Self-Awareness Questions
- What are your biggest fears about starting or continuing your fitness journey?
- How do you typically respond when you miss a workout or eat something "unhealthy"?
- What limiting beliefs do you have about your ability to achieve your fitness goals?

### 2. Goal Setting Exercise
Write down your fitness goals using the SMART framework:
- **Specific**: What exactly do you want to achieve?
- **Measurable**: How will you track your progress?
- **Achievable**: Is this goal realistic for your current situation?
- **Relevant**: Why is this goal important to you?
- **Time-bound**: When do you want to achieve this goal?

### 3. Action Planning
Based on your goals, create a simple action plan:
- What is one small step you can take today?
- What potential obstacles might you face?
- How will you overcome these obstacles?

## Reflection
After completing this exercise, take a moment to notice how you feel. Are you excited about your goals? Do you feel confident about your ability to achieve them? This awareness is the first step in developing a strong fitness mindset.
    `,
    quiz: {
      questions: [
        {
          id: '1',
          question: 'What is the most important component of a fitness mindset?',
          options: [
            'Having perfect form in all exercises',
            'Believing that abilities can be developed through effort',
            'Following the latest fitness trends',
            'Having a strict diet plan'
          ],
          correct: 1
        },
        {
          id: '2',
          question: 'How should you respond to setbacks in your fitness journey?',
          options: [
            'Give up and try again next year',
            'Criticize yourself harshly to stay motivated',
            'Learn from the experience and adjust your approach',
            'Blame external factors for your failure'
          ],
          correct: 2
        },
        {
          id: '3',
          question: 'What is the benefit of setting long-term fitness goals?',
          options: [
            'They are easier to achieve quickly',
            'They focus on sustainable changes rather than quick fixes',
            'They require less effort',
            'They don\'t need to be specific'
          ],
          correct: 1
        }
      ]
    }
  });

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.courseId);
      setLessonId(resolvedParams.lessonId);
      setLesson(prev => ({ ...prev, id: resolvedParams.lessonId }));
    };
    resolveParams();
  }, [params]);

  const handleMarkComplete = () => {
    setIsCompleted(true);
    // In a real app, you would save this to a backend
    console.log('Lesson marked as complete');
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
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

  const renderContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <p className="text-lg">Video Player</p>
                <p className="text-sm opacity-70">Click to play lesson video</p>
              </div>
            </div>
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Lesson Overview</h3>
              <p className="text-gray-700 leading-relaxed">{lesson.content}</p>
            </div>
          </div>
        );

      case 'reading':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.readingMaterial?.replace(/\n/g, '<br>') || '' }} />
              </div>
            </div>
          </div>
        );

      case 'exercise':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.exercise?.replace(/\n/g, '<br>') || '' }} />
              </div>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Quiz: {lesson.title}</h3>
              {lesson.quiz?.questions.map((question, index) => (
                <div key={question.id} className="mb-8">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">
                    {index + 1}. {question.question}
                  </h4>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          checked={selectedAnswers[index] === optionIndex}
                          onChange={() => handleQuizAnswer(index, optionIndex)}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Content not available</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/academy/${courseId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{t.dashboard.backToCourse}</span>
        </button>

        {/* Lesson Header */}
        <div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20"
        >
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Lesson Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{lesson.title}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-2xl">{getLessonIcon(lesson.type)}</span>
                    <span className="text-gray-600">{lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}</span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration} {t.dashboard.minutes}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-700 mb-6">{lesson.description}</p>

              {/* Lesson Actions */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold">
                  <Play className="w-5 h-5" />
                  {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                </button>
                
                <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                
                <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Progress & Navigation */}
            <div className="lg:w-80">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lesson Progress</h3>
                
                {!isCompleted && (
                  <button
                    onClick={handleMarkComplete}
                    className="w-full mb-4 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 font-semibold"
                  >
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    {t.dashboard.markComplete}
                  </button>
                )}

                {isCompleted && (
                  <div className="mb-4 p-4 bg-green-100 rounded-xl text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-700 font-medium">Lesson Completed!</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                    <span className="text-sm">Previous Lesson</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                    <span className="text-sm font-medium">Next Lesson</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.dashboard.lessonContent}</h2>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

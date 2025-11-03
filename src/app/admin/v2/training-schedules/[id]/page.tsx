'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Dumbbell, 
  Clock, 
  Target, 
  Users, 
  Calendar,
  Edit,
  Trash2,
  Copy,
  Play,
  Activity,
  Heart,
  Zap,
  FileText,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import YouTubeVideoEmbed from '@/components/YouTubeVideoEmbed';

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  day: number;
  order: number;
  sets: number;
  reps: string;
  weight?: string;
  restTime?: string;
  notes?: string;
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    equipment?: string;
    difficulty: string;
    category: string;
  };
}

export default function WorkoutDetailV2Page() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<number>(1);

  useEffect(() => {
    if (workoutId) {
      loadWorkoutData();
    }
  }, [workoutId]);

  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      
      // Fetch workout
      const workoutResponse = await fetch(`/api/workouts/${workoutId}`);
      if (!workoutResponse.ok) {
        throw new Error('Workout not found');
      }
      const workoutData = await workoutResponse.json();
      setWorkout(workoutData);
      
      // Fetch exercises
      const exercisesResponse = await fetch(`/api/workout-exercises?workoutId=${workoutId}`);
      if (exercisesResponse.ok) {
        const exercisesData = await exercisesResponse.json();
        setExercises(exercisesData);
        
        // Set active day to first day with exercises
        if (exercisesData.length > 0) {
          const firstDay = Math.min(...exercisesData.map((ex: WorkoutExercise) => ex.day));
          setActiveDay(firstDay);
        }
      }
    } catch (error) {
      console.error('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExercisesForDay = (day: number) => {
    return exercises
      .filter(ex => ex.day === day)
      .sort((a, b) => a.order - b.order);
  };

  const getDaysWithExercises = () => {
    const days = Array.from(new Set(exercises.map(ex => ex.day)));
    return days.sort((a, b) => a - b);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'cardio': return <Heart className="w-4 h-4" />;
      case 'hiit': return <Zap className="w-4 h-4" />;
      case 'flexibility': return <Activity className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateStats = () => {
    const dayExercises = getExercisesForDay(activeDay);
    const totalExercises = exercises.length;
    const avgSets = exercises.length > 0
      ? exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0) / exercises.length
      : 0;
    
    return {
      totalExercises,
      avgSets,
      dayExercises: dayExercises.length
    };
  };

  const stats = calculateStats();
  const daysWithExercises = getDaysWithExercises();
  const dayExercises = getExercisesForDay(activeDay);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Workout Not Found</h2>
          <p className="text-gray-600 mb-4">The workout you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{workout.name}</h1>
              <p className="text-gray-600 mt-1">{workout.description || 'No description'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(workout.difficulty)}`}>
                {workout.difficulty || 'Beginner'}
              </span>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">
                {typeof workout.duration === 'number' ? workout.duration.toFixed(1) : (workout.duration || '--')}
              </div>
              <div className="text-sm text-purple-600">Duration (min)</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalExercises.toFixed(1)}
              </div>
              <div className="text-sm text-blue-600">Total Exercises</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(stats.avgSets)}
              </div>
              <div className="text-sm text-green-600">Avg Sets</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-600">
                {workout.clients || 0}.0
              </div>
              <div className="text-sm text-orange-600">Clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {daysWithExercises.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Day Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {daysWithExercises.map(day => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeDay === day
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Day {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises List */}
            <div className="p-6">
              {dayExercises.length > 0 ? (
                <div className="space-y-4">
                  {dayExercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {exercise.exercise?.name || 'Unknown Exercise'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                              <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                                {exercise.exercise?.muscleGroup || 'N/A'}
                              </span>
                              {exercise.exercise?.equipment && (
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                  {exercise.exercise.equipment}
                                </span>
                              )}
                              <span className={`flex items-center gap-1 px-2 py-1 rounded ${getDifficultyColor(exercise.exercise?.difficulty || 'beginner')}`}>
                                {exercise.exercise?.difficulty || 'beginner'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-purple-600">
                          {getCategoryIcon(exercise.exercise?.category || 'strength')}
                        </div>
                      </div>

                      {/* Exercise Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Sets</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {typeof exercise.sets === 'number' ? Math.round(exercise.sets) : (exercise.sets || '--')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Reps</div>
                          <div className="text-sm font-semibold text-gray-900">{exercise.reps || '--'}</div>
                        </div>
                        {exercise.weight && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Weight</div>
                            <div className="text-sm font-semibold text-gray-900">{exercise.weight}</div>
                          </div>
                        )}
                        {exercise.restTime && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Rest</div>
                            <div className="text-sm font-semibold text-gray-900">{exercise.restTime}</div>
                          </div>
                        )}
                      </div>

                      {exercise.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Notes</div>
                          <div className="text-sm text-gray-700">{exercise.notes}</div>
                        </div>
                      )}

                      {/* Exercise Video */}
                      {exercise.exercise?.videoUrl && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="text-xs text-gray-500 mb-2">Video Tutorial</div>
                          <YouTubeVideoEmbed
                            videoUrl={exercise.exercise.videoUrl}
                            title={`${exercise.exercise.name} - How to perform`}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises for this day</h3>
                  <p className="text-gray-500">Add exercises to get started</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-500 mb-6">This workout doesn't have any exercises yet.</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="w-5 h-5" />
              Add Exercises
            </button>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workout Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Category</div>
              <div className="text-base font-medium text-gray-900 capitalize">{workout.category || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Training Type</div>
              <div className="text-base font-medium text-gray-900 capitalize">{workout.trainingType || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="text-base font-medium text-gray-900 capitalize">{workout.status || 'active'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Created</div>
              <div className="text-base font-medium text-gray-900">
                {formatDate(workout.createdAt || workout.created || new Date().toISOString())}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Last Used</div>
              <div className="text-base font-medium text-gray-900">
                {workout.lastUsed ? formatDate(workout.lastUsed) : 'Never'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Assigned Clients</div>
              <div className="text-base font-medium text-gray-900">{workout.clients || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


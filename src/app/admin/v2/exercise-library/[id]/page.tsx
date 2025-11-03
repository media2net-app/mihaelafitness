'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Dumbbell, 
  Target, 
  Edit,
  Trash2,
  Copy,
  Play,
  Activity,
  Heart,
  Zap,
  FileText,
  AlertCircle,
  Video,
  Image,
  Plus,
  Clock,
  Users,
  CheckCircle
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import YouTubeVideoEmbed from '@/components/YouTubeVideoEmbed';

export default function ExerciseDetailV2Page() {
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;
  
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (exerciseId) {
      loadExerciseData();
    }
  }, [exerciseId]);

  const loadExerciseData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exercises/${exerciseId}`);
      if (!response.ok) {
        throw new Error('Exercise not found');
      }
      const data = await response.json();
      setExercise(data);
    } catch (error) {
      console.error('Error loading exercise:', error);
    } finally {
      setLoading(false);
    }
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
      case 'strength': return <Dumbbell className="w-5 h-5" />;
      case 'cardio': return <Heart className="w-5 h-5" />;
      case 'hiit': return <Zap className="w-5 h-5" />;
      case 'flexibility': return <Activity className="w-5 h-5" />;
      default: return <Dumbbell className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'strength': return 'bg-red-100 text-red-800 border-red-200';
      case 'cardio': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'flexibility': return 'bg-green-100 text-green-800 border-green-200';
      case 'hiit': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exercise Not Found</h2>
          <p className="text-gray-600 mb-4">The exercise you're looking for doesn't exist.</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{exercise.name}</h1>
              <p className="text-gray-600 mt-1">{exercise.description || 'No description available'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty || 'Beginner'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getCategoryColor(exercise.category)}`}>
                {getCategoryIcon(exercise.category)}
                {exercise.category || 'Strength'}
              </span>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Muscle Group</span>
              </div>
              <div className="text-lg font-bold text-purple-900 capitalize">{exercise.muscleGroup || 'N/A'}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Equipment</span>
              </div>
              <div className="text-lg font-bold text-blue-900">{exercise.equipment || 'Bodyweight'}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Status</span>
              </div>
              <div className="text-lg font-bold text-green-900 capitalize">{exercise.isActive !== false ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Media</span>
              </div>
              <div className="text-lg font-bold text-orange-900">
                {exercise.videoUrl ? 'Video ✓' : 'No Video'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Section */}
            {exercise.videoUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  Video Tutorial
                </h3>
                <YouTubeVideoEmbed
                  videoUrl={exercise.videoUrl}
                  title={`${exercise.name} - How to perform`}
                  className="w-full"
                />
              </div>
            )}

            {/* Instructions */}
            {exercise.instructions && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Instructions
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{exercise.instructions}</p>
                </div>
              </div>
            )}

            {/* Tips */}
            {exercise.tips && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Tips
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{exercise.tips}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exercise Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Category</div>
                  <div className="text-base font-medium text-gray-900 capitalize">{exercise.category || 'Strength'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Difficulty</div>
                  <div className="text-base font-medium text-gray-900 capitalize">{exercise.difficulty || 'Beginner'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Muscle Group</div>
                  <div className="text-base font-medium text-gray-900 capitalize">{exercise.muscleGroup || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Equipment</div>
                  <div className="text-base font-medium text-gray-900">{exercise.equipment || 'Bodyweight'}</div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit Exercise
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            {/* Media Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Video</span>
                  </div>
                  {exercise.videoUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Image</span>
                  </div>
                  {exercise.imageUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Instructions</span>
                  </div>
                  {exercise.instructions ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Tips</span>
                  </div>
                  {exercise.tips ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







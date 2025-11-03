'use client';

import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Play,
  Pause,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Zap,
  Heart,
  Activity,
  Database,
  Star,
  Tag,
  Video,
  Image,
  FileText,
  Users,
  TrendingUp,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Video Search Modal Component
function VideoSearchModal({ exercise, isOpen, onClose, onSelectVideo }: {
  exercise: any;
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (exerciseId: string, videoUrl: string) => void;
}) {
  const [searching, setSearching] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(exercise.name || '');

  const searchVideos = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      } else {
        console.error('Failed to search videos');
      }
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (isOpen && searchQuery) {
      searchVideos();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Search YouTube Video for: {exercise.name}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for exercise video..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            onKeyPress={(e) => e.key === 'Enter' && searchVideos()}
          />
          <button
            onClick={searchVideos}
            disabled={searching}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Searching YouTube...</p>
          </div>
        )}

        {!searching && videos.length > 0 && (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.videoId}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-4">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-32 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{video.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{video.channelTitle}</p>
                    <button
                      onClick={() => {
                        onSelectVideo(exercise.id, video.embedUrl);
                        onClose();
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      Select Video
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searching && videos.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-500">
            No videos found. Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ exercise, onEdit, onDelete, onView, onCopy, onPlay, onSearchVideo }: {
  exercise: any;
  onEdit: (exercise: any) => void;
  onDelete: (exercise: any) => void;
  onView: (exercise: any) => void;
  onCopy: (exercise: any) => void;
  onPlay: (exercise: any) => void;
  onSearchVideo: (exercise: any) => void;
}) {
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'strength': return 'bg-red-100 text-red-800 border-red-200';
      case 'cardio': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'flexibility': return 'bg-green-100 text-green-800 border-green-200';
      case 'hiit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'balance': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sports': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'cardio': return <Heart className="w-4 h-4" />;
      case 'flexibility': return <Activity className="w-4 h-4" />;
      case 'hiit': return <Zap className="w-4 h-4" />;
      case 'balance': return <Target className="w-4 h-4" />;
      case 'sports': return <Users className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Extract video ID from YouTube URL
  const getVideoId = (videoUrl: string | null | undefined) => {
    if (!videoUrl) return null;
    const patterns = [
      /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getVideoId(exercise.videoUrl);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Video Preview */}
      {videoId && (
        <div className="mb-4 rounded-lg overflow-hidden bg-gray-900 aspect-video relative group cursor-pointer" onClick={() => onPlay(exercise)}>
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={`${exercise.name} video preview`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-8 h-8 text-white" fill="currentColor" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">Click to play</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
            <p className="text-sm text-gray-500">{exercise.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(exercise.category)}`}>
            <div className="flex items-center gap-1">
              {getCategoryIcon(exercise.category)}
              {exercise.category}
            </div>
          </span>
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onPlay(exercise)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Play className="w-4 h-4" />
                Preview
              </button>
              <button onClick={() => onView(exercise)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button onClick={() => onSearchVideo(exercise)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Video className="w-4 h-4" />
                {exercise.videoUrl ? 'Change Video' : 'Add Video'}
              </button>
              <button onClick={() => onEdit(exercise)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => onCopy(exercise)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button onClick={() => onDelete(exercise)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{exercise.duration || '--'}</div>
          <div className="text-xs text-gray-500">Duration</div>
          <div className="text-xs text-gray-400">seconds</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{exercise.sets || '--'}</div>
          <div className="text-xs text-gray-500">Sets</div>
          <div className="text-xs text-gray-400">recommended</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{exercise.reps || '--'}</div>
          <div className="text-xs text-gray-500">Reps</div>
          <div className="text-xs text-gray-400">per set</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{exercise.calories || '--'}</div>
          <div className="text-xs text-gray-500">Calories</div>
          <div className="text-xs text-gray-400">per minute</div>
        </div>
      </div>

      {/* Difficulty and Equipment */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
            {exercise.difficulty}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
            {exercise.equipment || 'Bodyweight'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {exercise.hasVideo && <Video className="w-4 h-4 text-blue-500" />}
          {exercise.hasImage && <Image className="w-4 h-4 text-green-500" />}
          {exercise.hasInstructions && <FileText className="w-4 h-4 text-purple-500" />}
        </div>
      </div>

      {/* Muscle Groups */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Target Muscles:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {exercise.muscleGroups?.map((muscle: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
              {muscle}
            </span>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>{exercise.rating || '--'}/5</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{exercise.usageCount || 0} uses</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {exercise.tags?.join(', ') || 'No tags'}
        </div>
      </div>
    </div>
  );
}

// Quick Stats Component
function QuickStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.totalExercises}</div>
            <div className="text-sm text-gray-500">Total Exercises</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">+{stats.newThisMonth} this month</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.categories}</div>
            <div className="text-sm text-gray-500">Categories</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">{stats.mostUsed} most used</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.withVideo}</div>
            <div className="text-sm text-gray-500">With Video</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">% of exercises</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.avgRating}</div>
            <div className="text-sm text-gray-500">Avg Rating</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">out of 5 stars</div>
      </div>
    </div>
  );
}

// Category Filter Component
function CategoryFilter({ categories, selectedCategory, onCategoryChange }: {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'cardio': return <Heart className="w-4 h-4" />;
      case 'flexibility': return <Activity className="w-4 h-4" />;
      case 'hiit': return <Zap className="w-4 h-4" />;
      case 'balance': return <Target className="w-4 h-4" />;
      case 'sports': return <Users className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Categories</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            selectedCategory === 'all'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          All Categories
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 capitalize ${
              selectedCategory === category
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getCategoryIcon(category)}
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ExerciseLibraryV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [videoSearchModal, setVideoSearchModal] = useState<{ isOpen: boolean; exercise: any | null }>({
    isOpen: false,
    exercise: null
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exercises');
      if (response.ok) {
        const exercisesData = await response.json();
        // Transform to match expected format
        const formattedExercises = exercisesData.map((ex: any) => ({
          ...ex,
          muscleGroups: ex.muscleGroup ? [ex.muscleGroup] : [],
          tags: [],
          hasVideo: !!ex.videoUrl,
          hasImage: !!ex.imageUrl,
          hasInstructions: !!ex.instructions,
          usageCount: 0,
          rating: 4.0,
          duration: 0,
          sets: 0,
          reps: '--',
          calories: 0
        }));
        setExercises(formattedExercises);
      } else {
        console.error('Failed to load exercises');
        // Fallback to mock data if API fails
        const mockExercises = [
        {
          id: '1',
          name: 'Push-ups',
          description: 'Classic bodyweight exercise for chest, shoulders, and triceps',
          category: 'Strength',
          difficulty: 'Beginner',
          duration: 30,
          sets: 3,
          reps: '10-15',
          calories: 8,
          equipment: 'Bodyweight',
          muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
          tags: ['bodyweight', 'upper-body'],
          rating: 4.5,
          usageCount: 156,
          hasVideo: true,
          hasImage: true,
          hasInstructions: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Burpees',
          description: 'Full-body high-intensity exercise combining squat, push-up, and jump',
          category: 'HIIT',
          difficulty: 'Advanced',
          duration: 45,
          sets: 4,
          reps: '30 sec',
          calories: 12,
          equipment: 'Bodyweight',
          muscleGroups: ['Full Body', 'Core', 'Legs'],
          tags: ['hiit', 'cardio', 'full-body'],
          rating: 4.8,
          usageCount: 89,
          hasVideo: true,
          hasImage: true,
          hasInstructions: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          name: 'Plank',
          description: 'Isometric core strengthening exercise',
          category: 'Strength',
          difficulty: 'Beginner',
          duration: 60,
          sets: 3,
          reps: '30-60 sec',
          calories: 5,
          equipment: 'Bodyweight',
          muscleGroups: ['Core', 'Shoulders'],
          tags: ['core', 'isometric', 'stability'],
          rating: 4.2,
          usageCount: 203,
          hasVideo: true,
          hasImage: true,
          hasInstructions: true,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: '4',
          name: 'Mountain Climbers',
          description: 'Dynamic cardio exercise targeting core and legs',
          category: 'Cardio',
          difficulty: 'Intermediate',
          duration: 30,
          sets: 4,
          reps: '30 sec',
          calories: 10,
          equipment: 'Bodyweight',
          muscleGroups: ['Core', 'Legs', 'Shoulders'],
          tags: ['cardio', 'core', 'dynamic'],
          rating: 4.3,
          usageCount: 127,
          hasVideo: true,
          hasImage: true,
          hasInstructions: true,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: '5',
          name: 'Squats',
          description: 'Fundamental lower body strength exercise',
          category: 'Strength',
          difficulty: 'Beginner',
          duration: 45,
          sets: 3,
          reps: '12-15',
          calories: 7,
          equipment: 'Bodyweight',
          muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
          tags: ['legs', 'compound', 'functional'],
          rating: 4.6,
          usageCount: 234,
          hasVideo: true,
          hasImage: true,
          hasInstructions: true,
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
        },
        {
          id: '6',
          name: 'Jumping Jacks',
          description: 'Simple cardio exercise for warm-up or conditioning',
          category: 'Cardio',
          difficulty: 'Beginner',
          duration: 30,
          sets: 3,
          reps: '30 sec',
          calories: 6,
          equipment: 'Bodyweight',
          muscleGroups: ['Full Body'],
          tags: ['cardio', 'warm-up', 'simple'],
          rating: 4.0,
          usageCount: 178,
          hasVideo: true,
          hasImage: true,
          hasInstructions: true,
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ];
      setExercises(mockExercises);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(exercises.map(exercise => exercise.category))];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscleGroups.some((muscle: string) => muscle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         exercise.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesDifficulty = filterDifficulty === 'all' || exercise.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    return matchesSearch && matchesCategory && matchesDifficulty;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'rating': return b.rating - a.rating;
      case 'usage': return b.usageCount - a.usageCount;
      case 'difficulty': return a.difficulty.localeCompare(b.difficulty);
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default: return 0;
    }
  });

  const stats = {
    totalExercises: exercises.length,
    newThisMonth: 12,
    categories: categories.length,
    mostUsed: 'Strength',
    withVideo: Math.round((exercises.filter(e => e.hasVideo).length / exercises.length) * 100),
    avgRating: (exercises.reduce((sum, e) => sum + e.rating, 0) / exercises.length).toFixed(1)
  };

  const handleEditExercise = (exercise: any) => {
    console.log('Edit exercise:', exercise);
    // TODO: Implement edit functionality
  };

  const handleDeleteExercise = (exercise: any) => {
    console.log('Delete exercise:', exercise);
    // TODO: Implement delete functionality
  };

  const handleViewExercise = (exercise: any) => {
    router.push(`/admin/v2/exercise-library/${exercise.id}`);
  };

  const handleCopyExercise = (exercise: any) => {
    console.log('Copy exercise:', exercise);
    // TODO: Implement copy functionality
  };

  const handlePlayExercise = (exercise: any) => {
    if (exercise.videoUrl) {
      // Extract video ID and open in YouTube
      const videoUrl = exercise.videoUrl;
      let youtubeUrl = videoUrl;
      
      // If it's an embed URL, convert to watch URL
      if (videoUrl.includes('/embed/')) {
        const videoId = videoUrl.split('/embed/')[1].split('?')[0];
        youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }
      
      window.open(youtubeUrl, '_blank');
    } else {
      setVideoSearchModal({ isOpen: true, exercise });
    }
  };

  const handleSearchVideo = (exercise: any) => {
    setVideoSearchModal({ isOpen: true, exercise });
  };

  const handleSelectVideo = async (exerciseId: string, videoUrl: string) => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}/update-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      });

      if (response.ok) {
        const updatedExercise = await response.json();
        // Update local state
        setExercises(prev => prev.map(ex => 
          ex.id === exerciseId ? { ...ex, videoUrl: updatedExercise.videoUrl } : ex
        ));
        alert('Video added successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        alert(`Failed to add video: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error updating video:', error);
      alert(`Failed to add video: ${error.message || 'Network error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Exercise Library</h1>
              <p className="text-gray-600 mt-1">Comprehensive database of exercises with videos and instructions</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Database className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Import</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                <Plus className="w-5 h-5" />
                <span>Add Exercise</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats stats={stats} />

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="name">Name A-Z</option>
              <option value="rating">Highest Rated</option>
              <option value="usage">Most Used</option>
              <option value="difficulty">Difficulty Level</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onEdit={handleEditExercise}
                onDelete={handleDeleteExercise}
                onView={handleViewExercise}
                onCopy={handleCopyExercise}
                onPlay={handlePlayExercise}
                onSearchVideo={handleSearchVideo}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-500 mb-6">Start building your exercise library</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors mx-auto">
              <Plus className="w-5 h-5" />
              <span>Add First Exercise</span>
            </button>
          </div>
        )}
      </div>

      {/* Video Search Modal */}
      {videoSearchModal.exercise && (
        <VideoSearchModal
          exercise={videoSearchModal.exercise}
          isOpen={videoSearchModal.isOpen}
          onClose={() => setVideoSearchModal({ isOpen: false, exercise: null })}
          onSelectVideo={handleSelectVideo}
        />
      )}
    </div>
  );
}




'use client';

import { useState, useEffect, useRef } from 'react';
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
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Video Search Modal Component
function VideoSearchModal({ exercise, isOpen, onClose, onSelectVideo, onUploadVideo }: {
  exercise: any;
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (exerciseId: string, videoUrl: string) => void;
  onUploadVideo?: (exercise: any) => void;
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
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 safe-area-pb">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto flex flex-col max-w-4xl">
        <div className="flex items-start justify-between gap-3 mb-4 flex-shrink-0">
          <h3 className="text-base sm:text-xl font-semibold text-gray-900 line-clamp-2 pr-8 sm:pr-0">Video zoeken: {exercise.name}</h3>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-gray-400 hover:text-gray-600 rounded-lg touch-manipulation flex-shrink-0 sm:relative sm:top-0 sm:right-0 absolute top-4 right-4"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {onUploadVideo && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-sm text-gray-700">Eigen video vanaf telefoon of computer</span>
            <button
              type="button"
              onClick={() => { onUploadVideo(exercise); onClose(); }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 touch-manipulation w-full sm:w-auto"
            >
              <Upload className="w-4 h-4" />
              Upload eigen video
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek video..."
            className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
            onKeyPress={(e) => e.key === 'Enter' && searchVideos()}
          />
          <button
            onClick={searchVideos}
            disabled={searching}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 touch-manipulation"
          >
            {searching ? 'Zoeken...' : 'Zoeken'}
          </button>
        </div>

        {searching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto" />
            <p className="text-gray-600 mt-2 text-sm">YouTube doorzoeken...</p>
          </div>
        )}

        {!searching && videos.length > 0 && (
          <div className="space-y-3 sm:space-y-4 flex-1 min-h-0 overflow-y-auto">
            {videos.map((video) => (
              <div
                key={video.videoId}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full sm:w-32 h-40 sm:h-24 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base line-clamp-2">{video.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">{video.channelTitle}</p>
                    <button
                      onClick={() => {
                        onSelectVideo(exercise.id, video.embedUrl);
                        onClose();
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm touch-manipulation"
                    >
                      Selecteer video
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searching && videos.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-500 text-sm">
            Geen video's gevonden. Probeer andere zoekwoorden.
          </div>
        )}
      </div>
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ exercise, onEdit, onDelete, onView, onCopy, onPlay, onSearchVideo, onToggleOwnVideo, onUploadVideo, isUploading }: {
  exercise: any;
  onEdit: (exercise: any) => void;
  onDelete: (exercise: any) => void;
  onView: (exercise: any) => void;
  onCopy: (exercise: any) => void;
  onPlay: (exercise: any) => void;
  onSearchVideo: (exercise: any) => void;
  onToggleOwnVideo?: (exercise: any) => void;
  onUploadVideo?: (exercise: any) => void;
  isUploading?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

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
  const isDirectVideo = !!(exercise.videoUrl && !videoId && (exercise.videoUrl.includes('blob.vercel-storage.com') || /\.(mp4|webm|mov)(\?|$)/i.test(exercise.videoUrl)));
  const hasOwnVideo = !!exercise.hasOwnVideo;

  return (
    <div className={`rounded-xl p-4 sm:p-6 shadow-sm border-2 hover:shadow-md transition-all ${hasOwnVideo ? 'border-green-500 bg-green-50 ring-2 ring-green-200/50' : 'border-gray-100 bg-white'}`}>
      {/* Video Preview */}
      {videoId && (
        <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden bg-gray-900 aspect-video relative cursor-pointer touch-manipulation" onClick={() => onPlay(exercise)}>
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={`${exercise.name} video preview`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 sm:bg-black/0 sm:group-hover:bg-black/30 transition-all">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center">
              <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" />
            </div>
          </div>
          <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">Afspelen</span>
        </div>
      )}
      {isDirectVideo && (
        <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden bg-gray-800 aspect-[9/16] relative flex items-center justify-center max-w-[240px] sm:max-w-[280px] mx-auto">
          <video src={exercise.videoUrl} className="w-full h-full object-contain" controls playsInline preload="metadata" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-600/90 text-white text-xs rounded">Eigen video</div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 sm:mb-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{exercise.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-0.5">{exercise.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getCategoryColor(exercise.category)}`}>
            {getCategoryIcon(exercise.category)}
            {exercise.category}
          </span>
          {(exercise.muscleGroup || (exercise.muscleGroups && exercise.muscleGroups[0])) && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 capitalize flex items-center gap-0.5 w-fit">
              <Target className="w-3 h-3" />
              {exercise.muscleGroup || exercise.muscleGroups[0]}
            </span>
          )}
          <div className="relative ml-auto sm:ml-0">
            <button
              type="button"
              aria-expanded={menuOpen}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="p-2 -m-2 text-gray-400 hover:text-gray-600 rounded-lg touch-manipulation"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[200px]">
                  <button onClick={() => { onPlay(exercise); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                    <Play className="w-4 h-4" />
                    Preview
                  </button>
                  <button onClick={() => { onView(exercise); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button onClick={() => { onSearchVideo(exercise); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                    <Video className="w-4 h-4" />
                    {exercise.videoUrl ? 'Change Video' : 'Add Video'}
                  </button>
                  {onUploadVideo && (
                    <button onClick={() => { onUploadVideo(exercise); setMenuOpen(false); }} disabled={isUploading} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left disabled:opacity-50">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload eigen video
                    </button>
                  )}
                  <button onClick={() => { onEdit(exercise); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button onClick={() => { onCopy(exercise); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button onClick={() => { onDelete(exercise); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-gray-900">{exercise.duration || '--'}</div>
          <div className="text-xs text-gray-500">Duration</div>
          <div className="text-xs text-gray-400 hidden sm:block">seconds</div>
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-gray-900">{exercise.sets || '--'}</div>
          <div className="text-xs text-gray-500">Sets</div>
          <div className="text-xs text-gray-400 hidden sm:block">recommended</div>
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-gray-900">{exercise.reps || '--'}</div>
          <div className="text-xs text-gray-500">Reps</div>
          <div className="text-xs text-gray-400 hidden sm:block">per set</div>
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-gray-900">{exercise.calories || '--'}</div>
          <div className="text-xs text-gray-500">Calories</div>
          <div className="text-xs text-gray-400 hidden sm:block">per minute</div>
        </div>
      </div>

      {/* Difficulty and Equipment */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
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

      {/* Eigen video toggle – Ja/Nee */}
      {onToggleOwnVideo && (
        <div className="flex items-center justify-between py-2.5 sm:py-3 px-3 rounded-lg bg-gray-50 border border-gray-100 mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm font-medium text-gray-700">Eigen video</span>
          <button
            type="button"
            role="switch"
            aria-checked={hasOwnVideo}
            onClick={(e) => { e.stopPropagation(); onToggleOwnVideo(exercise); }}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 touch-manipulation ${hasOwnVideo ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-gray-200'}`}
          >
            <span className={`pointer-events-none inline-block h-6 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${hasOwnVideo ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-xs sm:text-sm font-medium min-w-[2rem] ${hasOwnVideo ? 'text-green-600' : 'text-gray-500'}`}>
            {hasOwnVideo ? 'Ja' : 'Nee'}
          </span>
        </div>
      )}

      {/* Muscle Groups */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs sm:text-sm font-medium text-gray-700">Target Muscles:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {exercise.muscleGroups?.map((muscle: string, index: number) => (
            <span key={index} className="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
              {muscle}
            </span>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 flex-shrink-0" />
            <span>{exercise.rating || '--'}/5</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>{exercise.usageCount || 0} uses</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 truncate">
          {exercise.tags?.join(', ') || 'No tags'}
        </div>
      </div>
    </div>
  );
}

// Quick Stats Component
function QuickStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-4 sm:mb-8">
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="p-2 bg-indigo-500 rounded-lg flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div className="text-right min-w-0">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{stats.totalExercises}</div>
            <div className="text-xs sm:text-sm text-gray-500">Total Exercises</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">+{stats.newThisMonth} this month</div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="text-right min-w-0">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{stats.categories}</div>
            <div className="text-xs sm:text-sm text-gray-500">Categories</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">{stats.mostUsed} most used</div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="p-2 bg-green-500 rounded-lg flex-shrink-0">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="text-right min-w-0">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{stats.withVideo}</div>
            <div className="text-xs sm:text-sm text-gray-500">With Video</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">% of exercises</div>
      </div>

      <div className="bg-green-50 rounded-xl p-4 sm:p-6 shadow-sm border-2 border-green-200">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="p-2 bg-green-600 rounded-lg flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-right min-w-0">
            <div className="text-lg sm:text-2xl font-bold text-green-800 truncate">{stats.withOwnVideo ?? 0}</div>
            <div className="text-xs sm:text-sm text-green-700 font-medium">Eigen video klaar</div>
          </div>
        </div>
        <div className="text-xs text-green-600">{stats.ownVideoToGo ?? 0} nog te doen</div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-right min-w-0">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{stats.avgRating}</div>
            <div className="text-xs sm:text-sm text-gray-500">Avg Rating</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">out of 5 stars</div>
      </div>
    </div>
  );
}

// Standard muscle groups (spiergroepen)
const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Borst' },
  { id: 'back', label: 'Rug' },
  { id: 'shoulders', label: 'Schouders' },
  { id: 'arms', label: 'Armen' },
  { id: 'legs', label: 'Benen' },
  { id: 'glutes', label: 'Bilspieren' },
  { id: 'core', label: 'Core' },
  { id: 'cardio', label: 'Cardio' },
] as const;

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
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Type (categorie)</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 touch-manipulation ${
            selectedCategory === 'all'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
          }`}
        >
          <Database className="w-4 h-4" />
          Alles
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 capitalize touch-manipulation ${
              selectedCategory === category
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
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

// Muscle Group Filter Component (Spiergroepen)
function MuscleGroupFilter({ muscleGroups, counts, selectedMuscleGroup, onMuscleGroupChange }: {
  muscleGroups: Array<{ id: string; label: string }>;
  counts: Record<string, number>;
  selectedMuscleGroup: string;
  onMuscleGroupChange: (group: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Spiergroepen</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onMuscleGroupChange('all')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 touch-manipulation ${
            selectedMuscleGroup === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
          }`}
        >
          <Target className="w-4 h-4" />
          Alle spiergroepen
        </button>
        {muscleGroups.map(({ id, label }) => {
          const count = counts[id] ?? 0;
          return (
            <button
              key={id}
              onClick={() => onMuscleGroupChange(id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize touch-manipulation ${
                selectedMuscleGroup === id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {label} {count > 0 && <span className="opacity-80">({count})</span>}
            </button>
          );
        })}
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
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [videoSearchModal, setVideoSearchModal] = useState<{ isOpen: boolean; exercise: any | null }>({
    isOpen: false,
    exercise: null
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingExerciseId, setUploadingExerciseId] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await fetch('/api/exercises');
      const exercisesData = await response.json();
      if (!response.ok) {
        setLoadError(exercisesData?.error || `Laden mislukt (${response.status})`);
        setExercises([]);
        return;
      }
      if (!Array.isArray(exercisesData)) {
        setLoadError('Ongeldige data van de server');
        setExercises([]);
        return;
      }
      const formattedExercises = exercisesData.map((ex: any) => ({
        ...ex,
        muscleGroups: ex.muscleGroup ? [ex.muscleGroup] : [],
        tags: [],
        hasVideo: !!ex.videoUrl,
        hasOwnVideo: !!ex.hasOwnVideo,
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
    } catch (error) {
      console.error('Error loading exercises:', error);
      setLoadError('Kon oefeningen niet laden. Controleer de database-verbinding.');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(exercises.map(exercise => exercise.category).filter(Boolean))];

  // Build muscle group list: standard groups + any extra from data (e.g. warm-up, stretching)
  const muscleGroupsInData = [...new Set(
    exercises.flatMap(e => e.muscleGroup ? [e.muscleGroup] : (e.muscleGroups || []).map((m: string) => m))
  ).values()].filter(Boolean);
  const knownIds = new Set(MUSCLE_GROUPS.map(m => m.id));
  const extraGroups = muscleGroupsInData
    .filter(m => !knownIds.has(m.toLowerCase()))
    .map(m => ({ id: m.toLowerCase(), label: m }));
  const muscleGroupsToShow = [...MUSCLE_GROUPS, ...extraGroups];

  // Count exercises per muscle group
  const muscleGroupCounts: Record<string, number> = {};
  for (const ex of exercises) {
    const groups = ex.muscleGroup ? [ex.muscleGroup.toLowerCase()] : (ex.muscleGroups || []).map((m: string) => m.toLowerCase());
    for (const g of groups) {
      if (g) muscleGroupCounts[g] = (muscleGroupCounts[g] || 0) + 1;
    }
  }

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (exercise.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (exercise.muscleGroups || []).some((muscle: string) => muscle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (exercise.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || (exercise.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const matchesMuscleGroup = selectedMuscleGroup === 'all' ||
      (exercise.muscleGroups || []).some((m: string) => m.toLowerCase() === selectedMuscleGroup.toLowerCase()) ||
      (exercise.muscleGroup && exercise.muscleGroup.toLowerCase() === selectedMuscleGroup.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || (exercise.difficulty || '').toLowerCase() === filterDifficulty.toLowerCase();
    return matchesSearch && matchesCategory && matchesMuscleGroup && matchesDifficulty;
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

  const ownVideoCount = exercises.filter((e: any) => e.hasOwnVideo).length;
  const stats = {
    totalExercises: exercises.length,
    newThisMonth: 12,
    categories: categories.length,
    mostUsed: 'Strength',
    withVideo: exercises.length ? Math.round((exercises.filter((e: any) => e.hasVideo).length / exercises.length) * 100) : 0,
    avgRating: exercises.length ? (exercises.reduce((sum: number, e: any) => sum + e.rating, 0) / exercises.length).toFixed(1) : '0',
    withOwnVideo: ownVideoCount,
    ownVideoToGo: exercises.length - ownVideoCount
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

  const handleToggleOwnVideo = async (exercise: any) => {
    const newValue = !exercise.hasOwnVideo;
    try {
      const res = await fetch(`/api/exercises/${exercise.id}/own-video`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasOwnVideo: newValue })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Update mislukt');
      }
      setExercises(prev => prev.map(ex => ex.id === exercise.id ? { ...ex, hasOwnVideo: data.hasOwnVideo ?? newValue } : ex));
      if (data._warning) {
        console.warn(data._warning);
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Kon eigen-video status niet bijwerken.');
    }
  };

  const handleUploadVideoClick = (exercise: any) => {
    setUploadingExerciseId(exercise.id);
    setTimeout(() => uploadInputRef.current?.click(), 0);
  };

  const handleUploadEigenVideo = async (exerciseId: string, file: File) => {
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/exercises/${exerciseId}/upload-video`, { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.details || 'Upload mislukt');
      setExercises(prev =>
        prev.map(ex =>
          ex.id === exerciseId
            ? { ...ex, videoUrl: data.videoUrl ?? ex.videoUrl, hasOwnVideo: data.hasOwnVideo ?? true }
            : ex
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Video uploaden mislukt.');
    } finally {
      setUploadingExerciseId(null);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
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
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Exercise Library</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">Oefeningen met video's en instructies</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex-1 sm:flex-none touch-manipulation min-w-0">
                <Database className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                <span className="text-gray-700 text-sm sm:text-base truncate">Import</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex-1 sm:flex-none touch-manipulation min-w-0">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Add Exercise</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats stats={stats} />

          {/* Eigen videos stats card */}
          <div className="mb-4 sm:mb-8 p-4 sm:p-6 rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div className="p-2 sm:p-3 bg-green-600 rounded-xl flex-shrink-0">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Eigen videos</h3>
                  <p className="text-xl sm:text-2xl font-bold text-green-700">
                    {stats.withOwnVideo ?? 0} van {stats.totalExercises ?? 0} klaar
                    {stats.totalExercises ? ` (${Math.round(((stats.withOwnVideo ?? 0) / stats.totalExercises) * 100)}%)` : ''}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{stats.ownVideoToGo ?? 0} oefeningen nog te doen</p>
                </div>
              </div>
              <div className="w-full sm:w-48 h-3 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: stats.totalExercises ? `${Math.round(((stats.withOwnVideo ?? 0) / stats.totalExercises) * 100)}%` : '0%' }}
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Muscle Group Filter (Spiergroepen) */}
          <MuscleGroupFilter
            muscleGroups={muscleGroupsToShow}
            counts={muscleGroupCounts}
            selectedMuscleGroup={selectedMuscleGroup}
            onMuscleGroupChange={setSelectedMuscleGroup}
          />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-[200px]">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Zoek oefeningen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              />
            </div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-base"
            >
              <option value="all">Alle niveaus</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-base"
            >
              <option value="name">Naam A-Z</option>
              <option value="rating">Hoogste beoordeling</option>
              <option value="usage">Meest gebruikt</option>
              <option value="difficulty">Niveau</option>
              <option value="newest">Nieuwste eerst</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {loadError && (
          <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
            <p className="text-red-800 font-medium text-sm sm:text-base">{loadError}</p>
            <button
              type="button"
              onClick={() => loadExercises()}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors touch-manipulation"
            >
              Opnieuw proberen
            </button>
          </div>
        )}
        {filteredExercises.length > 0 ? (
          <>
            <input
              ref={uploadInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                const id = uploadingExerciseId;
                if (file && id) handleUploadEigenVideo(id, file);
                e.target.value = '';
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  onToggleOwnVideo={handleToggleOwnVideo}
                  onUploadVideo={handleUploadVideoClick}
                  isUploading={uploadingExerciseId === exercise.id}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Geen oefeningen gevonden</h3>
            <p className="text-sm text-gray-500 mb-4 sm:mb-6">Begin met je oefeningenbibliotheek</p>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors mx-auto touch-manipulation">
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
          onUploadVideo={handleUploadVideoClick}
        />
      )}
    </div>
  );
}




'use client';

import { useState, useEffect, useRef } from 'react';
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
  Flame,
  Zap,
  FileText,
  CheckCircle,
  AlertCircle,
  Plus,
  Upload,
  Loader2,
  X
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import YouTubeVideoEmbed from '@/components/YouTubeVideoEmbed';

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  day: number;
  order: number;
  section?: string | null;
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
    hasOwnVideo?: boolean;
    videoUrl?: string | null;
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
  const [uploadingExerciseId, setUploadingExerciseId] = useState<string | null>(null);
  const fileInputRef = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadModal, setUploadModal] = useState<{
    open: boolean;
    exerciseName: string;
    progress: number;
    log: string[];
    status: 'idle' | 'uploading' | 'success' | 'error';
  }>({ open: false, exerciseName: '', progress: 0, log: [], status: 'idle' });

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setUploadModal((m) => ({ ...m, log: [...m.log, `[${time}] ${message}`] }));
  };

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

  const handleToggleOwnVideo = async (workoutExercise: WorkoutExercise) => {
    const ex = workoutExercise.exercise;
    if (!ex?.id) return;
    const newValue = !ex.hasOwnVideo;
    try {
      const res = await fetch(`/api/exercises/${ex.id}/own-video`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasOwnVideo: newValue }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Update mislukt');
      setExercises((prev) =>
        prev.map((we) =>
          we.exercise?.id === ex.id
            ? { ...we, exercise: { ...we.exercise, hasOwnVideo: data.hasOwnVideo ?? newValue } }
            : we
        )
      );
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Kon eigen-video status niet bijwerken.');
    }
  };

  const handleUploadEigenVideo = (exerciseId: string, file: File, exerciseName?: string) => {
    const name = exerciseName || 'Oefening';
    setUploadingExerciseId(exerciseId);
    setUploadModal({
      open: true,
      exerciseName: name,
      progress: 0,
      log: [],
      status: 'idle',
    });
    addLog(`Bestand geselecteerd: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    const form = new FormData();
    form.append('file', file);

    const xhr = new XMLHttpRequest();
    const url = `/api/exercises/${exerciseId}/upload-video`;

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setUploadModal((m) => ({ ...m, progress: pct }));
        if (pct === 100) addLog('Bestand verzonden, wachten op server...');
      } else {
        setUploadModal((m) => ({ ...m, progress: Math.min(m.progress + 10, 90) }));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          addLog('Upload voltooid.');
          addLog('Video gekoppeld aan oefening.');
          setUploadModal((m) => ({ ...m, progress: 100, status: 'success', log: [...m.log] }));
          setExercises((prev) =>
            prev.map((we) =>
              we.exercise?.id === exerciseId
                ? {
                    ...we,
                    exercise: {
                      ...we.exercise,
                      videoUrl: data.videoUrl ?? we.exercise.videoUrl,
                      hasOwnVideo: data.hasOwnVideo ?? true,
                    },
                  }
                : we
            )
          );
          setTimeout(() => {
            setUploadModal((m) => ({ ...m, open: false }));
            setUploadingExerciseId(null);
          }, 2000);
        } catch {
          addLog('Fout: ongeldige serverresponse.');
          setUploadModal((m) => ({ ...m, status: 'error', log: [...m.log] }));
          setUploadingExerciseId(null);
        }
      } else {
        let msg = `Serverfout (${xhr.status}).`;
        try {
          const d = JSON.parse(xhr.responseText);
          msg = d?.error || d?.details || msg;
        } catch {}
        addLog(msg);
        setUploadModal((m) => ({ ...m, status: 'error', log: [...m.log] }));
        setUploadingExerciseId(null);
      }
    });

    xhr.addEventListener('error', () => {
      addLog('Netwerkfout. Controleer je verbinding.');
      setUploadModal((m) => ({ ...m, status: 'error', log: [...m.log] }));
      setUploadingExerciseId(null);
    });

    xhr.addEventListener('abort', () => {
      addLog('Upload geannuleerd.');
      setUploadModal((m) => ({ ...m, status: 'error', log: [...m.log] }));
      setUploadingExerciseId(null);
    });

    setUploadModal((m) => ({ ...m, status: 'uploading' }));
    addLog('Upload starten...');
    xhr.open('POST', url);
    xhr.send(form);
  };

  const closeUploadModal = () => {
    if (uploadModal.status !== 'uploading') {
      setUploadModal((m) => ({ ...m, open: false }));
      setUploadingExerciseId(null);
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

  const exercisesList = Array.isArray(exercises) ? exercises : [];

  const sortExercisesForDay = (list: WorkoutExercise[]) =>
    [...list].sort((a, b) => {
      const aw = a.section === 'warmup' ? 0 : 1;
      const bw = b.section === 'warmup' ? 0 : 1;
      if (aw !== bw) return aw - bw;
      return a.order - b.order;
    });

  const calculateStats = () => {
    const dayExercises = sortExercisesForDay(exercisesList.filter(ex => ex.day === activeDay));
    const totalExercises = exercisesList.length;
    const avgSets = exercisesList.length > 0
      ? exercisesList.reduce((sum, ex) => sum + (ex.sets ?? 0), 0) / exercisesList.length
      : 0;

    return {
      totalExercises,
      avgSets,
      dayExercises: dayExercises.length
    };
  };

  const stats = calculateStats();
  const daysWithExercises = Array.from(new Set(exercisesList.map(ex => ex.day))).sort((a, b) => a - b);
  const dayExercisesSorted = sortExercisesForDay(
    exercisesList.filter((ex) => ex.day === activeDay)
  );
  const warmupDayExercises = dayExercisesSorted.filter((ex) => ex.section === 'warmup');
  const mainDayExercises = dayExercisesSorted.filter((ex) => ex.section !== 'warmup');
  const dayExercises = dayExercisesSorted;
  const ownVideoCount = exercisesList.filter(ex => ex.exercise?.hasOwnVideo).length;


  const renderExerciseCard = (exercise: WorkoutExercise, displayIndex: number) => {
    const hasOwnVideo = !!exercise.exercise?.hasOwnVideo;
    const isWarmup = exercise.section === 'warmup';

    const shellClass = isWarmup
      ? hasOwnVideo
        ? 'border-amber-400 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 ring-2 ring-green-500/50 shadow-sm'
        : 'border-amber-400 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 ring-2 ring-amber-300/90 shadow-sm'
      : hasOwnVideo
        ? 'border-green-500 bg-green-50 ring-2 ring-green-200/50'
        : 'border-gray-200 bg-white';

    const indexClass = isWarmup
      ? 'bg-gradient-to-br from-orange-500 to-amber-600'
      : 'bg-gradient-to-br from-purple-500 to-blue-600';

    return (
                    <div
                      key={exercise.id}
                      className={`border-2 rounded-lg p-4 sm:p-4 hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-3 md:gap-4 gap-4 ${shellClass}`}
                    >
                      {/* Exercise info – 2/3 of row */}
                      <div className="md:col-span-2 min-w-0 flex flex-col gap-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 ${indexClass} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                              {displayIndex}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                                  {exercise.exercise?.name || 'Unknown Exercise'}
                                </h3>
                                {isWarmup && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wide bg-orange-600 text-white shadow-sm flex-shrink-0 border border-orange-800/15">
                                    <Flame className="w-3.5 h-3.5" aria-hidden />
                                    Warming up
                                  </span>
                                )}
                                {hasOwnVideo && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white flex-shrink-0">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Eigen video
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                <span className="px-2 py-0.5 sm:py-1 bg-gray-100 rounded capitalize">
                                  {exercise.exercise?.muscleGroup || 'N/A'}
                                </span>
                                {exercise.exercise?.equipment && (
                                  <span className="px-2 py-0.5 sm:py-1 bg-gray-100 rounded">
                                    {exercise.exercise.equipment}
                                  </span>
                                )}
                                <span className={`flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded ${getDifficultyColor(exercise.exercise?.difficulty || 'beginner')}`}>
                                  {exercise.exercise?.difficulty || 'beginner'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            {getCategoryIcon(exercise.exercise?.category || 'strength')}
                            {exercise.exercise?.id && (
                              <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-gray-100 border border-gray-200">
                                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Eigen video</span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={hasOwnVideo}
                                  onClick={(e) => { e.stopPropagation(); handleToggleOwnVideo(exercise); }}
                                  className={`relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 touch-manipulation ${hasOwnVideo ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-gray-200'}`}
                                >
                                  <span className={`pointer-events-none inline-block h-5 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${hasOwnVideo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                                <span className={`text-xs font-medium min-w-[2rem] ${hasOwnVideo ? 'text-green-600' : 'text-gray-500'}`}>
                                  {hasOwnVideo ? 'Ja' : 'Nee'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3 pt-3 border-t ${isWarmup ? 'border-amber-200/90' : 'border-gray-100'}`}>
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
                          <div className={`mt-3 pt-3 border-t ${isWarmup ? 'border-amber-200/90' : 'border-gray-100'}`}>
                            <div className="text-xs text-gray-500 mb-1">Notes</div>
                            <div className="text-sm text-gray-700">{exercise.notes}</div>
                          </div>
                        )}
                      </div>

                      {/* Video – 1/3 of row */}
                      <div className={`md:col-span-1 min-w-0 rounded-lg overflow-hidden border order-first md:order-none ${isWarmup ? 'border-amber-200/80 bg-amber-50/70' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-2 pt-2 pb-1">
                          <span className="text-xs text-gray-500">Video Tutorial</span>
                          {exercise.exercise?.id && (
                            <>
                              <input
                                ref={(el) => { fileInputRef.current[exercise.exercise!.id] = el; }}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f && exercise.exercise?.id) {
                                    handleUploadEigenVideo(exercise.exercise.id, f, exercise.exercise.name);
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <button
                                type="button"
                                disabled={uploadingExerciseId === exercise.exercise?.id}
                                onClick={() => fileInputRef.current[exercise.exercise!.id]?.click()}
                                className="text-xs font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50 flex items-center gap-1.5 touch-manipulation py-1"
                              >
                                {uploadingExerciseId === exercise.exercise?.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                                )}
                                <span>{uploadingExerciseId === exercise.exercise?.id ? 'Uploaden...' : 'Upload eigen video'}</span>
                              </button>
                            </>
                          )}
                        </div>
                        {(exercise.exercise?.videoUrl && String(exercise.exercise.videoUrl).trim()) ? (
                          <YouTubeVideoEmbed
                            videoUrl={String(exercise.exercise.videoUrl).trim()}
                            title={`${exercise.exercise.name} - How to perform`}
                            className="w-full min-h-[200px]"
                          />
                        ) : (
                          <div className="aspect-[9/16] flex flex-col items-center justify-center bg-gray-100 text-gray-500 text-sm p-4">
                            <Play className="w-10 h-10 mb-2 opacity-50 flex-shrink-0" />
                            <span>Geen video</span>
                            {exercise.exercise?.id && (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current[exercise.exercise!.id]?.click()}
                                disabled={uploadingExerciseId === exercise.exercise?.id}
                                className="mt-2 text-xs text-purple-600 hover:underline disabled:opacity-50 touch-manipulation py-1"
                              >
                                {uploadingExerciseId === exercise.exercise?.id ? 'Uploaden...' : 'Upload eigen video'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
    );
  };


  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-full flex items-center justify-center">
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
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-manipulation"
                aria-label="Terug"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">{workout.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">{workout.description || 'No description'}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap ${getDifficultyColor(workout.difficulty)}`}>
                  {workout.difficulty || 'Beginner'}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg touch-manipulation" aria-label="Bewerken">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-purple-50 rounded-xl p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 truncate">
                {typeof workout.duration === 'number' ? workout.duration.toFixed(1) : (workout.duration || '--')}
              </div>
              <div className="text-xs sm:text-sm text-purple-600">Duration (min)</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 truncate">
                {(stats.totalExercises ?? 0).toFixed(1)}
              </div>
              <div className="text-xs sm:text-sm text-blue-600">Total Exercises</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                {Math.round(stats.avgSets ?? 0)}
              </div>
              <div className="text-xs sm:text-sm text-green-600">Avg Sets</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-orange-600 truncate">
                {workout.clients || 0}.0
              </div>
              <div className="text-xs sm:text-sm text-orange-600">Clients</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200 col-span-2 sm:col-span-1">
              <div className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                {ownVideoCount}/{exercisesList.length}
              </div>
              <div className="text-xs sm:text-sm text-green-600">Eigen video klaar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {daysWithExercises.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Day Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <div className="flex min-w-0">
                {daysWithExercises.map(day => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 touch-manipulation ${
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
            <div className="p-4 sm:p-6">
              {dayExercises.length > 0 ? (
                <div className="space-y-6">
                  {warmupDayExercises.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-200/90 via-orange-100 to-amber-100 border-2 border-amber-300/80 px-4 py-3 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white shadow-md ring-2 ring-white/40">
                          <Flame className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-orange-950/80">Warming up</p>
                          <p className="text-sm text-orange-950/70">Voorbereiden op je training</p>
                        </div>
                      </div>
                      {warmupDayExercises.map((exercise, index) => renderExerciseCard(exercise, index + 1))}
                    </div>
                  )}
                  {mainDayExercises.length > 0 && (
                    <div className="space-y-4">
                      {warmupDayExercises.length > 0 && (
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                          <Dumbbell className="w-5 h-5 text-purple-600 flex-shrink-0" aria-hidden />
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Workout</h3>
                        </div>
                      )}
                      {mainDayExercises.map((exercise, index) => renderExerciseCard(exercise, index + 1))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No exercises for this day</h3>
                  <p className="text-sm text-gray-500">Add exercises to get started</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
            <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">This workout doesn't have any exercises yet.</p>
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors touch-manipulation">
              <Plus className="w-5 h-5" />
              Add Exercises
            </button>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-4 sm:mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Workout Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

      {/* Upload progress modal */}
      {uploadModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload eigen video {uploadModal.exerciseName && `– ${uploadModal.exerciseName}`}
              </h3>
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={uploadModal.status === 'uploading'}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Sluiten"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 flex-1 min-h-0">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>
                    {uploadModal.status === 'uploading' && 'Bezig met uploaden...'}
                    {uploadModal.status === 'success' && 'Voltooid'}
                    {uploadModal.status === 'error' && 'Fout'}
                    {uploadModal.status === 'idle' && 'Voorbereiden...'}
                  </span>
                  <span className="font-medium text-purple-600">{uploadModal.progress}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadModal.progress}%` }}
                  />
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg bg-gray-50 p-3 overflow-hidden flex flex-col min-h-0">
                <div className="text-xs font-medium text-gray-500 mb-2">Log</div>
                <div className="flex-1 overflow-y-auto text-sm font-mono text-gray-700 space-y-0.5 max-h-48">
                  {uploadModal.log.length === 0 ? (
                    <span className="text-gray-400">Wachten...</span>
                  ) : (
                    uploadModal.log.map((line, i) => (
                      <div key={i} className="break-all">{line}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {uploadModal.status === 'success' && (
              <div className="p-4 border-t border-green-200 bg-green-50 rounded-b-xl flex items-center gap-2 text-green-800 text-sm">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                Video is geüpload en gekoppeld. Deze modal sluit automatisch.
              </div>
            )}
            {uploadModal.status === 'error' && (
              <div className="p-4 border-t border-red-200 bg-red-50 rounded-b-xl flex items-center gap-2 text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                Er ging iets mis. Bekijk de log hierboven. Je kunt de modal sluiten en opnieuw proberen.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


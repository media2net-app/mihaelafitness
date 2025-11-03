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
  Users,
  Calendar,
  Clock,
  Target,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Heart,
  Activity,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Workout Card Component
function WorkoutCard({ workout, onEdit, onDelete, onView, onCopy, onStart }: {
  workout: any;
  onEdit: (workout: any) => void;
  onDelete: (workout: any) => void;
  onView: (workout: any) => void;
  onCopy: (workout: any) => void;
  onStart: (workout: any) => void;
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'cardio': return <Heart className="w-4 h-4" />;
      case 'hiit': return <Zap className="w-4 h-4" />;
      case 'flexibility': return <Activity className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{workout.name}</h3>
            <p className="text-sm text-gray-500">{workout.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(workout.difficulty)}`}>
            {workout.difficulty}
          </span>
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onStart(workout)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Play className="w-4 h-4" />
                Start Workout
              </button>
              <button onClick={() => onView(workout)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button onClick={() => onEdit(workout)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => onCopy(workout)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button onClick={() => onDelete(workout)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {typeof workout.duration === 'number' ? workout.duration.toFixed(1) : (workout.duration || '--')}
          </div>
          <div className="text-xs text-gray-500">Duration</div>
          <div className="text-xs text-gray-400">minutes</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {typeof workout.exercises?.length === 'number' ? workout.exercises.length.toFixed(1) : (workout.exercises?.length || 0)}
          </div>
          <div className="text-xs text-gray-500">Exercises</div>
          <div className="text-xs text-gray-400">total</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {typeof workout.sets === 'number' ? Math.round(workout.sets) : (workout.sets || '--')}
          </div>
          <div className="text-xs text-gray-500">Sets</div>
          <div className="text-xs text-gray-400">average</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {typeof workout.calories === 'number' ? workout.calories.toFixed(1) : (workout.calories || '--')}
          </div>
          <div className="text-xs text-gray-500">Calories</div>
          <div className="text-xs text-gray-400">burned</div>
        </div>
      </div>

      {/* Exercise Types */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Exercise Types:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {workout.exerciseTypes?.map((type: string, index: number) => (
            <span key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
              {getTypeIcon(type)}
              <span className="capitalize">{type}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{workout.clientCount || 0} clients</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{workout.frequency || '--'}x/week</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Created {new Date(workout.createdAt).toLocaleDateString()}
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
          <div className="p-2 bg-purple-500 rounded-lg">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.totalWorkouts}</div>
            <div className="text-sm text-gray-500">Total Workouts</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">+{stats.newThisMonth} this month</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.activeClients}</div>
            <div className="text-sm text-gray-500">Active Clients</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">{stats.avgPerClient} workouts per client</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.avgDuration}</div>
            <div className="text-sm text-gray-500">Avg Duration</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">minutes per workout</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-orange-500 rounded-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.completionRate}</div>
            <div className="text-sm text-gray-500">Completion Rate</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">% workouts completed</div>
      </div>
    </div>
  );
}

// Workout Builder Preview Component
function WorkoutBuilderPreview() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Workout Builder</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create New</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Dumbbell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900 mb-1">Strength Training</h4>
          <p className="text-sm text-gray-500">Build muscle and strength</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900 mb-1">Cardio Workout</h4>
          <p className="text-sm text-gray-500">Improve cardiovascular health</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900 mb-1">HIIT Training</h4>
          <p className="text-sm text-gray-500">High-intensity interval training</p>
        </div>
      </div>
    </div>
  );
}

export default function TrainingSchedulesV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      
      // Fetch workouts from API
      const response = await fetch('/api/workouts');
      if (!response.ok) {
        throw new Error('Failed to load workouts');
      }
      
      const workoutsData = await response.json();
      
      // Fetch exercises for each workout and client counts
      const workoutsWithDetails = await Promise.all(
        workoutsData.map(async (workout: any) => {
          // Fetch exercises for this workout
          const exercisesResponse = await fetch(`/api/workout-exercises?workoutId=${workout.id}`);
          let exercises: any[] = [];
          if (exercisesResponse.ok) {
            exercises = await exercisesResponse.json();
          }
          
          // Determine exercise types from exercises
          const exerciseTypes = Array.from(new Set(
            exercises.map((ex: any) => ex.exercise?.category || workout.trainingType || 'strength')
          ));
          
          // Calculate average sets
          const avgSets = exercises.length > 0 
            ? exercises.reduce((sum: number, ex: any) => sum + (ex.sets || 0), 0) / exercises.length 
            : 0;
          
          return {
            id: workout.id,
            name: workout.name,
            description: workout.description || '',
            difficulty: workout.difficulty || 'Beginner',
            duration: workout.duration || 0,
            exercises: exercises.map((ex: any) => ({
              name: ex.exercise?.name || 'Unknown',
              sets: ex.sets || 0,
              reps: ex.reps || '--'
            })),
            exerciseTypes: exerciseTypes.length > 0 ? exerciseTypes : [workout.trainingType || 'strength'],
            sets: avgSets,
            calories: 0, // Not stored in database
            clientCount: workout.clients || 0,
            frequency: 0, // Not directly stored
            createdAt: workout.createdAt || workout.created || new Date().toISOString()
          };
        })
      );
      
      setWorkouts(workoutsWithDetails);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || workout.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    const matchesType = filterType === 'all' || workout.exerciseTypes.includes(filterType);
    return matchesSearch && matchesDifficulty && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'duration': return b.duration - a.duration;
      case 'difficulty': return a.difficulty.localeCompare(b.difficulty);
      case 'clients': return b.clientCount - a.clientCount;
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default: return 0;
    }
  });

  // Calculate real stats from workouts
  const stats = {
    totalWorkouts: workouts.length,
    newThisMonth: workouts.filter((w: any) => {
      const created = new Date(w.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    activeClients: workouts.reduce((sum: number, w: any) => sum + (w.clientCount || 0), 0),
    avgPerClient: workouts.length > 0 
      ? workouts.reduce((sum: number, w: any) => sum + (w.clientCount || 0), 0) / workouts.length 
      : 0,
    avgDuration: workouts.length > 0
      ? Math.round(workouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0) / workouts.length)
      : 0,
    completionRate: 0 // Would need session completion data to calculate
  };

  const handleEditWorkout = (workout: any) => {
    console.log('Edit workout:', workout);
    // TODO: Implement edit functionality
  };

  const handleDeleteWorkout = (workout: any) => {
    console.log('Delete workout:', workout);
    // TODO: Implement delete functionality
  };

  const handleViewWorkout = (workout: any) => {
    router.push(`/admin/v2/training-schedules/${workout.id}`);
  };

  const handleCopyWorkout = (workout: any) => {
    console.log('Copy workout:', workout);
    // TODO: Implement copy functionality
  };

  const handleStartWorkout = (workout: any) => {
    console.log('Start workout:', workout);
    // TODO: Implement start workout functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workouts...</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Training Schedules</h1>
              <p className="text-gray-600 mt-1">Create and manage workout programs for your clients</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Templates</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                <Plus className="w-5 h-5" />
                <span>New Workout</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats stats={stats} />

          {/* Workout Builder Preview */}
          <WorkoutBuilderPreview />

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="hiit">HIIT</option>
              <option value="flexibility">Flexibility</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="name">Name A-Z</option>
              <option value="duration">Longest Duration</option>
              <option value="difficulty">Difficulty Level</option>
              <option value="clients">Most Clients</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {filteredWorkouts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onEdit={handleEditWorkout}
                onDelete={handleDeleteWorkout}
                onView={handleViewWorkout}
                onCopy={handleCopyWorkout}
                onStart={handleStartWorkout}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts found</h3>
            <p className="text-gray-500 mb-6">Create your first workout program to get started</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors mx-auto">
              <Plus className="w-5 h-5" />
              <span>Create First Workout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}




'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Target, Dumbbell, Calendar, Users, Star, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter, useParams } from 'next/navigation';

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
  };
}

export default function TrainingSchemaDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const schemaId = params.id as string;
  
  const [schema, setSchema] = useState<{
    id: string;
    name: string;
    description: string;
    duration: number;
    difficulty: string;
    category: string;
    trainingType: string;
    exercises: any[];
    createdAt: string;
  } | null>(null);

  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [schemaExercises, setSchemaExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [databaseExercises, setDatabaseExercises] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch workout schema via API
        const response = await fetch(`/api/workouts/${schemaId}`);
        if (!response.ok) {
          throw new Error('Workout not found');
        }
        const data = await response.json();
        setSchema(data);
        
        // Set exercises from schema if they exist
        if (data.exercises && Array.isArray(data.exercises)) {
          setSchemaExercises(data.exercises);
        }

        // Fetch workout exercises (for detailed workout-exercises table)
        try {
          const exercisesResponse = await fetch(`/api/workout-exercises?workoutId=${schemaId}`);
          if (exercisesResponse.ok) {
            const exercisesData = await exercisesResponse.json();
            setWorkoutExercises(exercisesData);
          }
        } catch (error) {
          console.log('No workout-exercises found, using schema exercises');
        }

        // Fetch available exercises for the library
        const availableResponse = await fetch('/api/exercises');
        const availableData = await availableResponse.json();
        setAvailableExercises(availableData);
        setFilteredExercises(availableData);
        setDatabaseExercises(availableData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (schemaId) {
      fetchData();
    }
  }, [schemaId]);

  // Filter exercises based on selected muscle group
  useEffect(() => {
    if (selectedMuscleGroup === '') {
      setFilteredExercises(availableExercises);
    } else {
      const filtered = availableExercises.filter(exercise => 
        exercise.muscleGroup === selectedMuscleGroup
      );
      setFilteredExercises(filtered);
    }
  }, [selectedMuscleGroup, availableExercises]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'bg-blue-100 text-blue-800';
      case 'cardio': return 'bg-red-100 text-red-800';
      case 'flexibility': return 'bg-purple-100 text-purple-800';
      case 'weight-loss': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExercisesForDay = (day: number) => {
    // First try workout-exercises (detailed table)
    if (workoutExercises && Array.isArray(workoutExercises) && workoutExercises.length > 0) {
      return workoutExercises
        .filter(ex => ex.day === day)
        .sort((a, b) => a.order - b.order);
    }
    
    // Fallback to schema exercises if no workout-exercises found
    if (schemaExercises && Array.isArray(schemaExercises) && schemaExercises.length > 0) {
      return schemaExercises
        .filter(ex => ex.day === day)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    // If no exercises found, try to parse from schema description or create default exercises
    if (schema?.description && (
      schema.trainingType?.toLowerCase().includes('push/pull/legs') ||
      schema.name?.toLowerCase().includes('3x per week') ||
      schema.description?.toLowerCase().includes('3-day')
    )) {
      return getDefaultExercisesForDay(day);
    }
    
    return [];
  };

  const getDefaultExercisesForDay = (day: number) => {
    // Get exercises from database instead of hardcoded
    try {
      const allExercises = databaseExercises;
      
      // Define exercise names for each day based on the workout structure
      const exerciseNamesByDay = {
      1: [ // Day 1: Legs & Glutes - 60 min
          // Warm-up
          "Jumping Jacks", "High Knees", "Squats", "Walking Lunges",
          // Glute activation
          "Glute Bridges", "Clam Shells", "Monster Walks",
          // Main workout
          "Hip Thrusts", "Squats", "Romanian Deadlifts", "Bulgarian Split Squats", "Glute Kickbacks", "Abductor Machine",
          // Finisher
          "Squats", "Hip Thrusts", "Plank",
          // Cardio
          "Jump Rope"
        ],
        2: [ // Day 2: Back + Triceps + Abs - 60 min
          // Warm-up
          "Jumping Jacks", "Arm Circles", "Push-ups", "Inchworm Walkouts",
          // Muscle activation
          "Scapula Retractions", "Resistance Band Face Pulls", "Triceps Pushdowns",
          // Main workout
          "Lat Pulldown", "Seated Row", "Single-Arm Row", "Triceps Pushdowns", "Overhead Triceps Extension", "Tricep Dips",
          // Abs
          "Bicycle Crunches", "Leg Raises", "Russian Twists", "Plank"
        ],
        3: [ // Day 3: Chest + Shoulders + Biceps + Abs - 60 min
          // Warm-up
          "Arm Swings", "Shoulder Rolls", "Dynamic Chest Opener", "Light Jogging",
          // Muscle activation
          "Band Pull-aparts", "Front Raises", "Biceps Curls",
          // Main workout
          "Chest Press Machine", "Pec Deck", "Shoulder Press", "Lateral Raises", "Arnold Press", "Biceps Curls", "Hammer Curls",
          // Abs
          "Crunches", "Heel Touches", "Reverse Crunches", "Plank", "Mountain Climbers"
        ]
      };
      
      const dayExerciseNames = exerciseNamesByDay[day as keyof typeof exerciseNamesByDay] || [];
      const exercises = [];
      
      for (let i = 0; i < dayExerciseNames.length; i++) {
        const exerciseName = dayExerciseNames[i];
        const dbExercise = allExercises.find(ex => 
          ex.name.toLowerCase().includes(exerciseName.toLowerCase()) ||
          exerciseName.toLowerCase().includes(ex.name.toLowerCase())
        );
        
        if (dbExercise) {
          // Create exercise object with database data and workout-specific details
          exercises.push({
            id: `db-${dbExercise.id}-${day}-${i}`,
            exercise: dbExercise,
            sets: getSetsForExercise(exerciseName, i),
            reps: getRepsForExercise(exerciseName, i),
            weight: getWeightForExercise(exerciseName, i),
            restTime: getRestTimeForExercise(exerciseName, i),
            order: i + 1
          });
        }
      }
      
      return exercises;
    } catch (error) {
      console.error('Error fetching exercises from database:', error);
      return [];
    }
  };
  
  // Helper functions to get workout-specific details
  const getSetsForExercise = (exerciseName: string, index: number) => {
    if (index < 4) return 2; // Warm-up
    if (index < 7) return 2; // Activation
    if (index < 13) return 4; // Main workout
    if (index < 16) return 3; // Finisher/Abs
    return 2; // Cardio
  };
  
  const getRepsForExercise = (exerciseName: string, index: number) => {
    if (exerciseName.includes('Jumping Jacks') || exerciseName.includes('High Knees')) return '30 sec';
    if (exerciseName.includes('Jump Rope')) return '30 sec on/15 sec rest';
    if (exerciseName.includes('Plank')) return '30 sec';
    if (exerciseName.includes('Side Plank')) return '20 sec/side';
    if (index < 4) return '15'; // Warm-up
    if (index < 7) return '12'; // Activation
    if (index < 13) return '12'; // Main workout
    if (index < 16) return '15'; // Finisher/Abs
    return '15'; // Default
  };
  
  const getWeightForExercise = (exerciseName: string, index: number) => {
    if (exerciseName.includes('Jumping Jacks') || exerciseName.includes('High Knees') || 
        exerciseName.includes('Squats') || exerciseName.includes('Walking Lunges') ||
        exerciseName.includes('Glute Bridges') || exerciseName.includes('Clam Shells') ||
        exerciseName.includes('Push-ups') || exerciseName.includes('Inchworm Walkouts') ||
        exerciseName.includes('Arm Circles') || exerciseName.includes('Arm Swings') ||
        exerciseName.includes('Shoulder Rolls') || exerciseName.includes('Dynamic Chest Opener') ||
        exerciseName.includes('Light Jogging') || exerciseName.includes('Bicycle Crunches') ||
        exerciseName.includes('Leg Raises') || exerciseName.includes('Russian Twists') ||
        exerciseName.includes('Plank') || exerciseName.includes('Crunches') ||
        exerciseName.includes('Heel Touches') || exerciseName.includes('Reverse Crunches') ||
        exerciseName.includes('Mountain Climbers')) return 'bodyweight';
    
    if (exerciseName.includes('Monster Walks') || exerciseName.includes('Band Pull-aparts') ||
        exerciseName.includes('Resistance Band Face Pulls')) return 'band';
    
    if (exerciseName.includes('Jump Rope')) return 'rope';
    
    if (exerciseName.includes('Abductor Machine') || exerciseName.includes('Chest Press Machine') ||
        exerciseName.includes('Pec Deck')) return 'machine';
    
    if (exerciseName.includes('Scapula Retractions') || exerciseName.includes('Lat Pulldown') ||
        exerciseName.includes('Seated Row') || exerciseName.includes('Triceps Pushdowns') ||
        exerciseName.includes('Overhead Triceps Extension')) return 'cable';
    
    if (exerciseName.includes('Single-Arm Row') || exerciseName.includes('Shoulder Press') ||
        exerciseName.includes('Lateral Raises') || exerciseName.includes('Arnold Press') ||
        exerciseName.includes('Biceps Curls') || exerciseName.includes('Hammer Curls') ||
        exerciseName.includes('Front Raises')) return 'dumbbells';
    
    if (exerciseName.includes('Hip Thrusts') || exerciseName.includes('Romanian Deadlifts') ||
        exerciseName.includes('Squats')) return 'barbell';
    
    return 'bodyweight';
  };
  
  const getRestTimeForExercise = (exerciseName: string, index: number) => {
    if (index < 4) return '20-30 sec'; // Warm-up
    if (index < 7) return '20 sec'; // Activation
    if (index < 10) return '60 sec'; // Main workout heavy
    if (index < 13) return '45 sec'; // Main workout medium
    if (index < 16) return '15 sec'; // Finisher/Abs
    if (exerciseName.includes('Jump Rope')) return '15 sec';
    return '60 sec'; // Default
  };

  const getAvailableDays = () => {
    // For Push/Pull/Legs schema or 3x per week schema, always show Day 1, 2, 3
    if (schema?.trainingType?.toLowerCase()?.includes('push/pull/legs') || 
        schema?.name?.toLowerCase()?.includes('push/pull/legs') ||
        schema?.description?.toLowerCase()?.includes('push/pull/legs') ||
        schema?.name?.toLowerCase()?.includes('3x per week') ||
        schema?.description?.toLowerCase()?.includes('3-day')) {
      return [1, 2, 3];
    }
    
    // Try workout-exercises first
    if (workoutExercises && Array.isArray(workoutExercises) && workoutExercises.length > 0) {
      const days = [...new Set(workoutExercises.map(ex => ex.day))];
      return days.sort((a, b) => a - b);
    }
    
    // Fallback to schema exercises
    if (schemaExercises && Array.isArray(schemaExercises) && schemaExercises.length > 0) {
      const days = [...new Set(schemaExercises.map(ex => ex.day))];
      return days.sort((a, b) => a - b);
    }
    
    return [];
  };

  const handleEditExercise = (exercise: WorkoutExercise) => {
    setEditingExercise(exercise);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (loading) return;
    
    if (confirm('Are you sure you want to delete this exercise?')) {
      try {
        await fetch(`/api/workout-exercises/${exerciseId}`, {
          method: 'DELETE',
        });
        
        setWorkoutExercises(prev => {
          if (!Array.isArray(prev)) return [];
          return prev.filter(ex => ex.id !== exerciseId);
        });
      } catch (error) {
        console.error('Error deleting exercise:', error);
        alert('Error deleting exercise');
      }
    }
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    switch (muscleGroup) {
      case 'chest': return 'bg-red-100 text-red-800';
      case 'back': return 'bg-blue-100 text-blue-800';
      case 'shoulders': return 'bg-green-100 text-green-800';
      case 'arms': return 'bg-purple-100 text-purple-800';
      case 'legs': return 'bg-yellow-100 text-yellow-800';
      case 'glutes': return 'bg-pink-100 text-pink-800';
      case 'core': return 'bg-indigo-100 text-indigo-800';
      case 'cardio': return 'bg-orange-100 text-orange-800';
      case 'triceps': return 'bg-purple-100 text-purple-800';
      case 'biceps': return 'bg-purple-100 text-purple-800';
      case 'abs': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddExercise = async (exerciseId: string) => {
    if (loading) return;
    
    try {
      // Get the next order for the current day
      const dayExercises = getExercisesForDay(activeTab);
      const nextOrder = dayExercises.length > 0 ? Math.max(...dayExercises.map(ex => ex.order)) + 1 : 1;

      const response = await fetch('/api/workout-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: schemaId,
          exerciseId: exerciseId,
          day: activeTab,
          order: nextOrder,
          sets: 3,
          reps: '8-10',
          weight: 'bodyweight',
          restTime: '60 seconds',
        }),
      });

      if (response.ok) {
        const newExercise = await response.json();
        
        // Find the exercise details
        const exerciseDetails = availableExercises.find(ex => ex.id === exerciseId);
        if (exerciseDetails) {
          const workoutExerciseWithDetails = {
            ...newExercise,
            exercise: exerciseDetails
          };
          setWorkoutExercises(prev => {
            if (!Array.isArray(prev)) return [workoutExerciseWithDetails];
            return [...prev, workoutExerciseWithDetails];
          });
        }
        
        setShowAddExerciseModal(false);
      } else {
        alert('Error adding exercise');
      }
    } catch (error) {
      console.error('Error adding exercise:', error);
      alert('Error adding exercise');
    }
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise || loading) return;

    try {
      const response = await fetch(`/api/workout-exercises/${editingExercise.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sets: editingExercise.sets,
          reps: editingExercise.reps,
          weight: editingExercise.weight,
          restTime: editingExercise.restTime,
          notes: editingExercise.notes,
        }),
      });

      if (response.ok) {
        setWorkoutExercises(prev => {
          if (!Array.isArray(prev)) return [];
          return prev.map(ex => 
            ex.id === editingExercise.id ? editingExercise : ex
          );
        });
        setEditingExercise(null);
      } else {
        alert('Error updating exercise');
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Error updating exercise');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Training Schedule Not Found</h3>
            <p className="text-gray-500 mb-6">The training schedule you're looking for doesn't exist</p>
            <button
              onClick={() => router.push('/admin/trainingschemas')}
              className="bg-rose-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors duration-200"
            >
              Back to Training Schedules
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">{schema.name}</h1>
          <p className="text-gray-600">{schema.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Schedule Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-800">{schema.duration} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Training Type</p>
                    <p className="font-semibold text-gray-800 capitalize">{schema.trainingType?.replace('-', ' ') || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(schema.difficulty)}`}>
                  {schema.difficulty.charAt(0).toUpperCase() + schema.difficulty.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(schema.category)}`}>
                  {schema.category.charAt(0).toUpperCase() + schema.category.slice(1)}
                </span>
              </div>
            </div>

            {/* Workout Structure Info */}
            {(schema?.trainingType?.toLowerCase()?.includes('push/pull/legs') || 
              schema?.name?.toLowerCase()?.includes('3x per week') ||
              schema?.description?.toLowerCase()?.includes('3-day')) && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-rose-200 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  Workout Structure - 3x per week
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-rose-100">
                    <h4 className="font-semibold text-gray-800 mb-2">Day 1: Legs & Glutes</h4>
                    <p className="text-sm text-gray-600">60 min • Heavy compounds + isolation</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-rose-100">
                    <h4 className="font-semibold text-gray-800 mb-2">Day 2: Back + Triceps</h4>
                    <p className="text-sm text-gray-600">60 min • Pulling movements + core</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-rose-100">
                    <h4 className="font-semibold text-gray-800 mb-2">Day 3: Chest + Shoulders</h4>
                    <p className="text-sm text-gray-600">60 min • Pushing movements + biceps</p>
                  </div>
                </div>
              </div>
            )}

            {/* Workout Exercises with Tabs */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Workout Exercises</h3>
                <button
                  onClick={() => setShowAddExerciseModal(true)}
                  className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Exercise
                </button>
              </div>

              {/* Day Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {getAvailableDays().map((day) => {
                  // Get specific muscle group for Push/Pull/Legs or 3x per week
                  const getDayLabel = (day: number) => {
                    if (schema?.trainingType?.toLowerCase()?.includes('push/pull/legs') || 
                        schema?.name?.toLowerCase()?.includes('push/pull/legs') ||
                        schema?.description?.toLowerCase()?.includes('push/pull/legs') ||
                        schema?.name?.toLowerCase()?.includes('3x per week') ||
                        schema?.description?.toLowerCase()?.includes('3-day')) {
                      switch (day) {
                        case 1: return 'Day 1: Legs & Glutes 🔥';
                        case 2: return 'Day 2: Back + Triceps + Abs 🔥';
                        case 3: return 'Day 3: Chest + Shoulders + Biceps + Abs 🔥';
                        default: return `Day ${day}`;
                      }
                    }
                    return `Day ${day}`;
                  };

                  return (
                    <button
                      key={day}
                      onClick={() => setActiveTab(day)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        activeTab === day
                          ? 'bg-rose-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getDayLabel(day)}
                    </button>
                  );
                })}
              </div>

              {/* Exercises Display for Active Day */}
              {getExercisesForDay(activeTab).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No exercises added for Day {activeTab} yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {getExercisesForDay(activeTab).map((exercise, index) => {
                    // Handle both workout-exercises and schema exercises formats
                    const exerciseData = exercise.exercise || exercise;
                    const exerciseId = exercise.id || `schema-${activeTab}-${index}`;
                    
                    return (
                      <div key={exerciseId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">Oefening {index + 1}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMuscleGroupColor(exerciseData.muscleGroup)}`}>
                                {exerciseData.muscleGroup}
                              </span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-1">{exerciseData.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">
                              {exerciseData.equipment || 'Bodyweight'} • {exerciseData.difficulty || 'Intermediate'}
                            </p>
                          </div>
                          {exercise.id && (
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleEditExercise(exercise)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit exercise"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExercise(exercise.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete exercise"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-gray-500 text-xs mb-1">Sets</div>
                            <div className="font-semibold text-gray-800">{exercise.sets || exercise.setsCount || '-'}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-gray-500 text-xs mb-1">Reps</div>
                            <div className="font-semibold text-gray-800">{exercise.reps || exercise.repsCount || '-'}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-gray-500 text-xs mb-1">Weight</div>
                            <div className="font-semibold text-gray-800">{exercise.weight || exercise.weightAmount || '-'}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-gray-500 text-xs mb-1">Rest</div>
                            <div className="font-semibold text-gray-800">{exercise.restTime || exercise.restDuration || '-'}</div>
                          </div>
                        </div>
                        
                        {!exercise.id && (
                          <div className="mt-3 text-xs text-gray-400 text-center">
                            Schema Exercise
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Schedule Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(schema.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(schema.category)}`}>
                    {schema.category.charAt(0).toUpperCase() + schema.category.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Difficulty</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(schema.difficulty)}`}>
                    {schema.difficulty.charAt(0).toUpperCase() + schema.difficulty.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/admin/trainingschemas')}
                  className="w-full px-4 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors duration-200"
                >
                  Edit Schedule
                </button>
                
                <button
                  onClick={() => router.push('/admin/clients')}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Assign to Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add Exercise to Day {activeTab}</h3>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Muscle Group Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedMuscleGroup('')}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedMuscleGroup === '' 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core', 'cardio'].map((muscleGroup) => (
                  <button
                    key={muscleGroup}
                    onClick={() => setSelectedMuscleGroup(muscleGroup)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                      selectedMuscleGroup === muscleGroup 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {muscleGroup}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-rose-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    // Add exercise to workout
                    handleAddExercise(exercise.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMuscleGroupColor(exercise.muscleGroup)}`}>
                      {exercise.muscleGroup}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{exercise.equipment}</span>
                    <span>•</span>
                    <span className="capitalize">{exercise.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Exercise Modal */}
      {editingExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Exercise</h3>
              <button
                onClick={() => setEditingExercise(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateExercise();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exercise</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-800">{editingExercise.exercise.name}</div>
                  <div className="text-sm text-gray-500 capitalize">
                    {editingExercise.exercise.equipment} • {editingExercise.exercise.difficulty}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sets</label>
                  <input
                    type="number"
                    value={editingExercise.sets}
                    onChange={(e) => setEditingExercise({
                      ...editingExercise,
                      sets: parseInt(e.target.value) || 0
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reps</label>
                  <input
                    type="text"
                    value={editingExercise.reps}
                    onChange={(e) => setEditingExercise({
                      ...editingExercise,
                      reps: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                    placeholder="e.g., 8-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <input
                    type="text"
                    value={editingExercise.weight || ''}
                    onChange={(e) => setEditingExercise({
                      ...editingExercise,
                      weight: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                    placeholder="e.g., bodyweight, 10kg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rest Time</label>
                  <input
                    type="text"
                    value={editingExercise.restTime || ''}
                    onChange={(e) => setEditingExercise({
                      ...editingExercise,
                      restTime: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                    placeholder="e.g., 60 seconds"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editingExercise.notes || ''}
                  onChange={(e) => setEditingExercise({
                    ...editingExercise,
                    notes: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                  rows={3}
                  placeholder="Additional notes for this exercise..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
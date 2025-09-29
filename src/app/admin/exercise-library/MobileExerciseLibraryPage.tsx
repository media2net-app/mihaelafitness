'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Dumbbell, Target, Zap, Users, Play, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroup: string;
  equipment?: string;
  difficulty: string;
  category: string;
  instructions?: string;
  tips?: string;
  videoUrl?: string;
  imageUrl?: string;
  isActive: boolean;
}

export default function MobileExerciseLibraryPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const muscleGroups = ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core', 'cardio'];
  const equipmentTypes = ['barbell', 'dumbbell', 'bodyweight', 'machine', 'cable', 'box', 'kettlebell'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedMuscleGroup, selectedEquipment, selectedDifficulty]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exercises');
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      } else {
        console.error('Failed to fetch exercises');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMuscleGroup) {
      filtered = filtered.filter(exercise => exercise.muscleGroup === selectedMuscleGroup);
    }

    if (selectedEquipment) {
      filtered = filtered.filter(exercise => exercise.equipment === selectedEquipment);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    setFilteredExercises(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors = {
      'chest': 'bg-blue-100 text-blue-800',
      'back': 'bg-green-100 text-green-800',
      'shoulders': 'bg-purple-100 text-purple-800',
      'arms': 'bg-orange-100 text-orange-800',
      'legs': 'bg-red-100 text-red-800',
      'glutes': 'bg-pink-100 text-pink-800',
      'core': 'bg-yellow-100 text-yellow-800',
      'cardio': 'bg-gray-100 text-gray-800'
    };
    return colors[muscleGroup] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exercises...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Exercise Library</h1>
        <p className="text-gray-600">Manage your exercise database and workout routines</p>
      </div>

      {/* Add Exercise Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-rose-600 hover:to-pink-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add New Exercise
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="">All Muscle Groups</option>
            {muscleGroups.map(group => (
              <option key={group} value={group}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="">All Equipment</option>
            {equipmentTypes.map(equipment => (
              <option key={equipment} value={equipment}>
                {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
              </option>
            ))}
          </select>
          
          <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No exercises found</h3>
            <p className="text-gray-500">Add your first exercise to get started</p>
          </div>
        ) : (
          filteredExercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className="bg-white rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all duration-200"
            >
              {/* Exercise Header */}
              <div className="mb-3">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-800 line-clamp-2 flex-1">{exercise.name}</h3>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => setEditingExercise(exercise)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-xs line-clamp-2">{exercise.description}</p>
              </div>

              {/* Exercise Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMuscleGroupColor(exercise.muscleGroup)}`}>
                  {exercise.muscleGroup}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty}
                </span>
                {exercise.equipment && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {exercise.equipment}
                  </span>
                )}
              </div>

              {/* Exercise Stats - Compact */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <Target className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">Muscle</div>
                  <div className="text-xs font-medium text-gray-800 capitalize truncate">{exercise.muscleGroup}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <Zap className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">Level</div>
                  <div className="text-xs font-medium text-gray-800 capitalize truncate">{exercise.difficulty}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <Users className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">Equipment</div>
                  <div className="text-xs font-medium text-gray-800 capitalize truncate">{exercise.equipment || 'None'}</div>
                </div>
              </div>

              {/* Exercise Actions */}
              <div className="flex gap-2">
                <button className="flex-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors duration-200 flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View</span>
                  <span className="sm:hidden">View</span>
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Exercise</h3>
            <p className="text-gray-600 mb-6">This feature is coming soon! For now, exercises are managed through the database.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

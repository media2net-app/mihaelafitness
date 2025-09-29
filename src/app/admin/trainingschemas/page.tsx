'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Eye, Trash2, Dumbbell, Clock, Users, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { workoutService } from '@/lib/database';
import { useRouter } from 'next/navigation';

export default function TrainingschemasPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [schemas, setSchemas] = useState<{
    id: string;
    name: string;
    description: string;
    duration: number;
    difficulty: string;
    category: string;
    trainingType: string;
    exercises: any[];
    createdAt: string;
  }>([]);

  const [showNewSchemaModal, setShowNewSchemaModal] = useState(false);
  const [newSchema, setNewSchema] = useState({
    name: '',
    description: '',
    duration: 60,
    difficulty: 'beginner',
    category: 'strength',
    trainingType: 'full-body',
    exercises: []
  });

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        console.log('Fetching workout schemas...');
        const response = await fetch('/api/workouts');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Workout schemas data:', data);
        console.log('Number of schemas:', data.length);
        
        // Sort by name to ensure 1x -> 2x -> 3x -> 4x -> 5x order
        const sortedData = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setSchemas(sortedData);
      } catch (error) {
        console.error('Error fetching schemas:', error);
        setSchemas([]);
      }
    };

    fetchSchemas();
  }, []);

  const handleCreateSchema = async () => {
    try {
      const schema = await workoutService.createWorkout(newSchema);
      setSchemas([schema, ...schemas]);
      setShowNewSchemaModal(false);
      setNewSchema({
        name: '',
        description: '',
        duration: 60,
        difficulty: 'beginner',
        category: 'strength',
        trainingType: 'full-body',
        exercises: []
      });
    } catch (error) {
      console.error('Error creating schema:', error);
    }
  };

  const handleDeleteSchema = async (id: string) => {
    if (confirm('Are you sure you want to delete this training schedule?')) {
      try {
        await workoutService.deleteWorkout(id);
        setSchemas(schemas.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error deleting schema:', error);
      }
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Training Schedules</h1>
              <p className="text-gray-600">Create and manage training schedules for your customers</p>
            </div>
            <button
              onClick={() => setShowNewSchemaModal(true)}
              className="mt-4 md:mt-0 bg-rose-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              New Training Schedule
            </button>
          </div>
        </div>

        {/* Training Schedules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemas.map((schema, index) => (
            <div
              key={schema.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{schema.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{schema.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/admin/trainingschemas/${schema.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Schedule"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchema(schema.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(schema.difficulty)}`}>
                  {schema.difficulty.charAt(0).toUpperCase() + schema.difficulty.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(schema.category)}`}>
                  {schema.category.charAt(0).toUpperCase() + schema.category.slice(1)}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {schema.trainingType}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{schema.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(schema.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {schemas.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Training Schedules</h3>
            <p className="text-gray-500 mb-6">Create your first training schedule to get started</p>
            <button
              onClick={() => setShowNewSchemaModal(true)}
              className="bg-rose-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors duration-200"
            >
              Create Training Schedule
            </button>
          </div>
        )}

        {/* Stats - Moved after training schedules */}
        {schemas.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Training Schedule Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">+12%</span>
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">{schemas.length}</h3>
                <p className="text-gray-600 text-sm">Total Schedules</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">+5%</span>
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">
                  {schemas.filter(s => s.category === 'strength').length}
                </h3>
                <p className="text-gray-600 text-sm">Strength Training</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">+8%</span>
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">
                  {Math.round(schemas.reduce((acc, s) => acc + s.duration, 0) / schemas.length) || 0}
                </h3>
                <p className="text-gray-600 text-sm">Avg Duration (min)</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">+15%</span>
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">
                  {schemas.filter(s => s.difficulty === 'beginner').length}
                </h3>
                <p className="text-gray-600 text-sm">Beginner Friendly</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Schema Modal */}
      {showNewSchemaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Training Schedule</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Name</label>
                <input
                  type="text"
                  value={newSchema.name}
                  onChange={(e) => setNewSchema({...newSchema, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter schedule name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newSchema.description}
                  onChange={(e) => setNewSchema({...newSchema, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter schedule description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={newSchema.duration}
                  onChange={(e) => setNewSchema({...newSchema, duration: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  min="15"
                  max="180"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={newSchema.difficulty}
                  onChange={(e) => setNewSchema({...newSchema, difficulty: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newSchema.category}
                  onChange={(e) => setNewSchema({...newSchema, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="weight-loss">Weight Loss</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Training Type</label>
                <select
                  value={newSchema.trainingType}
                  onChange={(e) => setNewSchema({...newSchema, trainingType: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="full-body">Full Body</option>
                  <option value="upper-body">Upper Body</option>
                  <option value="lower-body">Lower Body</option>
                  <option value="glutes-focus">Glutes Focus</option>
                  <option value="core">Core</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewSchemaModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSchema}
                disabled={!newSchema.name.trim()}
                className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

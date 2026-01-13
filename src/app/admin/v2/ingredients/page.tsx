'use client';

import { useState, useEffect } from 'react';
import { 
  Apple, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  Database,
  Scale,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  FileText,
  Copy,
  Star,
  Tag
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Ingredient Card Component
function IngredientCard({ ingredient, onEdit, onDelete, onView, onCopy }: {
  ingredient: any;
  onEdit: (ingredient: any) => void;
  onDelete: (ingredient: any) => void;
  onView: (ingredient: any) => void;
  onCopy: (ingredient: any) => void;
}) {
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'protein': return 'bg-red-100 text-red-800 border-red-200';
      case 'carbohydrates': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fats': return 'bg-green-100 text-green-800 border-green-200';
      case 'vegetables': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'fruits': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'dairy': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Apple className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{ingredient.name}</h3>
            <p className="text-sm text-gray-500">{ingredient.brand || 'Generic'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(ingredient.category)}`}>
            {ingredient.category}
          </span>
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onView(ingredient)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button onClick={() => onEdit(ingredient)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => onCopy(ingredient)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button onClick={() => onDelete(ingredient)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{ingredient.calories || '--'}</div>
          <div className="text-xs text-gray-500">Calories</div>
          <div className="text-xs text-gray-400">per 100g</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{ingredient.protein || '--'}g</div>
          <div className="text-xs text-gray-500">Protein</div>
          <div className="text-xs text-gray-400">per 100g</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{ingredient.carbs || '--'}g</div>
          <div className="text-xs text-gray-500">Carbs</div>
          <div className="text-xs text-gray-400">per 100g</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{ingredient.fat || '--'}g</div>
          <div className="text-xs text-gray-500">Fat</div>
          <div className="text-xs text-gray-400">per 100g</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Scale className="w-4 h-4" />
            <span>{ingredient.unit || 'g'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            <span>{ingredient.tags?.join(', ') || 'No tags'}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {ingredient.usageCount || 0} uses
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
          <div className="p-2 bg-green-500 rounded-lg">
            <Apple className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.totalIngredients}</div>
            <div className="text-sm text-gray-500">Total Ingredients</div>
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
          <div className="p-2 bg-purple-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.avgCalories}</div>
            <div className="text-sm text-gray-500">Avg Calories</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">per 100g</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-orange-500 rounded-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.favorites}</div>
            <div className="text-sm text-gray-500">Favorites</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">starred ingredients</div>
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
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Categories
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function IngredientsV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockIngredients = [
        {
          id: '1',
          name: 'Chicken Breast',
          brand: 'Generic',
          category: 'Protein',
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          unit: 'g',
          tags: ['lean', 'high-protein'],
          usageCount: 45,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Brown Rice',
          brand: 'Generic',
          category: 'Carbohydrates',
          calories: 111,
          protein: 2.6,
          carbs: 23,
          fat: 0.9,
          unit: 'g',
          tags: ['whole-grain', 'fiber'],
          usageCount: 32,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          name: 'Avocado',
          brand: 'Generic',
          category: 'Fats',
          calories: 160,
          protein: 2,
          carbs: 9,
          fat: 15,
          unit: 'g',
          tags: ['healthy-fats', 'fiber'],
          usageCount: 28,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: '4',
          name: 'Spinach',
          brand: 'Generic',
          category: 'Vegetables',
          calories: 23,
          protein: 2.9,
          carbs: 3.6,
          fat: 0.4,
          unit: 'g',
          tags: ['leafy-green', 'iron'],
          usageCount: 19,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: '5',
          name: 'Greek Yogurt',
          brand: 'Generic',
          category: 'Dairy',
          calories: 59,
          protein: 10,
          carbs: 3.6,
          fat: 0.4,
          unit: 'g',
          tags: ['probiotics', 'calcium'],
          usageCount: 41,
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
        },
        {
          id: '6',
          name: 'Banana',
          brand: 'Generic',
          category: 'Fruits',
          calories: 89,
          protein: 1.1,
          carbs: 23,
          fat: 0.3,
          unit: 'g',
          tags: ['potassium', 'energy'],
          usageCount: 37,
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ];
      
      setIngredients(mockIngredients);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(ingredients.map(ingredient => ingredient.category))];

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ingredient.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ingredient.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'calories': return b.calories - a.calories;
      case 'protein': return b.protein - a.protein;
      case 'usage': return b.usageCount - a.usageCount;
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default: return 0;
    }
  });

  const stats = {
    totalIngredients: ingredients.length,
    newThisMonth: 8,
    categories: categories.length,
    mostUsed: 'Protein',
    avgCalories: 118,
    favorites: 12
  };

  const handleEditIngredient = (ingredient: any) => {
    console.log('Edit ingredient:', ingredient);
    // TODO: Implement edit functionality
  };

  const handleDeleteIngredient = (ingredient: any) => {
    console.log('Delete ingredient:', ingredient);
    // TODO: Implement delete functionality
  };

  const handleViewIngredient = (ingredient: any) => {
    console.log('View ingredient:', ingredient);
    // TODO: Implement view functionality
  };

  const handleCopyIngredient = (ingredient: any) => {
    console.log('Copy ingredient:', ingredient);
    // TODO: Implement copy functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ingredients...</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ingredients</h1>
              <p className="text-gray-600 mt-1">Manage your ingredient database for nutrition plans</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Import</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Download className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Export</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                <Plus className="w-5 h-5" />
                <span>Add Ingredient</span>
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
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="name">Name A-Z</option>
              <option value="calories">Highest Calories</option>
              <option value="protein">Highest Protein</option>
              <option value="usage">Most Used</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {filteredIngredients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIngredients.map(ingredient => (
              <IngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                onEdit={handleEditIngredient}
                onDelete={handleDeleteIngredient}
                onView={handleViewIngredient}
                onCopy={handleCopyIngredient}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ingredients found</h3>
            <p className="text-gray-500 mb-6">Start building your ingredient database</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors mx-auto">
              <Plus className="w-5 h-5" />
              <span>Add First Ingredient</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}














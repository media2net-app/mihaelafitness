'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Download, Plus, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

export default function IngredientenPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ingredients from database
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('/api/ingredients');
        if (response.ok) {
          const data = await response.json();
          setIngredients(data);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  // Get unique categories from ingredients
  const categories = ['all', ...Array.from(new Set(ingredients.map(ing => ing.category || 'other')))];
  
  // Filter and sort ingredients
  const filteredIngredients = ingredients
    .filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (ingredient.aliases && ingredient.aliases.some(alias => 
                             alias.toLowerCase().includes(searchTerm.toLowerCase())
                           ));
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'calories':
          aValue = a.calories;
          bValue = b.calories;
          break;
        case 'protein':
          aValue = a.protein;
          bValue = b.protein;
          break;
        case 'carbs':
          aValue = a.carbs;
          bValue = b.carbs;
          break;
        case 'fat':
          aValue = a.fat;
          bValue = b.fat;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'proteins': return 'bg-red-100 text-red-800';
      case 'carbohydrates': return 'bg-blue-100 text-blue-800';
      case 'fruits': return 'bg-green-100 text-green-800';
      case 'vegetables': return 'bg-yellow-100 text-yellow-800';
      case 'healthy-fats': return 'bg-purple-100 text-purple-800';
      case 'dairy': return 'bg-pink-100 text-pink-800';
      case 'nuts-seeds': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to extract clean name and per info from ingredient name
  const extractCleanNameAndPer = (name: string) => {
    // Simple patterns for common cases
    const patterns = [
      // Match "Greek yogurt 150g" - product with amount
      /^(.+?)\s+(\d+(?:\.\d+)?)\s*(g|gram|grams|ml|tsp|tbsp|scoop|scoops)$/i,
      // Match "1 banana", "2 eggs" - number + item
      /^(\d+(?:\.\d+)?)\s+(banana|bananas|egg|eggs|apple|apples|orange|oranges|kiwi|kiwis|pear|pears)$/i,
      // Match "1 tbsp peanut butter" - number + unit + item
      /^(\d+(?:\.\d+)?)\s+(tbsp|tsp|ml)\s+(.+)$/i,
      // Match "150g oats" - amount + item
      /^(\d+(?:\.\d+)?)\s*(g|gram|grams|ml)\s+(.+)$/i
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        if (pattern === patterns[0]) {
          // Pattern: "Greek yogurt 150g"
          return {
            cleanName: match[1].trim(),
            per: `${match[2]} ${match[3]}`
          };
        } else if (pattern === patterns[1]) {
          // Pattern: "1 banana", "2 eggs"
          return {
            cleanName: match[2],
            per: `${match[1]} ${match[2]}`
          };
        } else if (pattern === patterns[2]) {
          // Pattern: "1 tbsp peanut butter"
          return {
            cleanName: match[3].trim(),
            per: `${match[1]} ${match[2]}`
          };
        } else {
          // Pattern: "150g oats"
          return {
            cleanName: match[3].trim(),
            per: `${match[1]} ${match[2]}`
          };
        }
      }
    }

    // If no pattern matches, try to remove numbers from the beginning
    const numberPattern = /^(\d+(?:\.\d+)?)\s+(.+)$/;
    const numberMatch = name.match(numberPattern);
    if (numberMatch) {
      return {
        cleanName: numberMatch[2].trim(),
        per: numberMatch[1]
      };
    }

    // If no pattern matches, return as is
    return {
      cleanName: name,
      per: '100g'
    };
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Category', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)', 'Sugar (g)', 'Aliases'],
      ...filteredIngredients.map(ing => [
        ing.name,
        ing.category || 'other',
        ing.calories,
        ing.protein,
        ing.carbs,
        ing.fat,
        ing.fiber || '',
        ing.sugar || '',
        ing.aliases ? ing.aliases.join(', ') : ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ingredients-database.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading ingredients...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header - Mobile Optimized */}
        <div className="mb-6">
          <div className="flex flex-col space-y-4">
            {/* Back Button and Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Ingredienten Database</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Tabel weergave van alle ingrediënten met macro waarden per 100g</p>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>ℹ️ Let op:</strong> Alle voedingswaarden zijn per 100g. 
                Voor andere hoeveelheden worden de waarden automatisch berekend.
                <br />
                <strong>📊 Tabel weergave:</strong> Alle ingrediënten in overzichtelijke tabel met sorteerbare kolommen.
              </p>
            </div>
          </div>
        </div>

        {/* Filters - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 shadow-sm">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Zoek ingrediënten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 sm:px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">Alle Categorieën</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="name">Sorteer op Naam</option>
                <option value="calories">Sorteer op Calorieën</option>
                <option value="protein">Sorteer op Eiwit</option>
                <option value="carbs">Sorteer op Koolhydraten</option>
                <option value="fat">Sorteer op Vet</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 sm:px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm sm:text-base sm:col-span-1 col-span-2"
              >
                <option value="asc">Oplopend</option>
                <option value="desc">Aflopend</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-gray-800">{filteredIngredients.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Totaal Ingrediënten</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-gray-800">{categories.length - 1}</div>
            <div className="text-xs sm:text-sm text-gray-600">Categorieën</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-gray-800">
              {filteredIngredients.length > 0 ? Math.round(filteredIngredients.reduce((sum, ing) => sum + ing.calories, 0) / filteredIngredients.length) : 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Gem. Calorieën</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="text-lg sm:text-2xl font-bold text-gray-800">
              {filteredIngredients.length > 0 ? Math.round(filteredIngredients.reduce((sum, ing) => sum + ing.protein, 0) / filteredIngredients.length * 10) / 10 : 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Gem. Eiwit (g)</div>
          </div>
        </div>

        {/* Ingredients Table - Mobile Optimized */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredIngredients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🥬</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Geen ingrediënten gevonden</h3>
              <p className="text-gray-500">Probeer andere zoektermen of filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Naam
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Per
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categorie
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calorieën
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eiwit (g)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Koolhydraten (g)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vet (g)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vezels (g)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suiker (g)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aliassen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIngredients.map((ingredient, index) => {
                    const { cleanName, per } = extractCleanNameAndPer(ingredient.name);
                    return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cleanName}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">{per}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(ingredient.category || 'other')}`}>
                          {ingredient.category || 'other'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-orange-600">{ingredient.calories}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-blue-600">{ingredient.protein}g</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-green-600">{ingredient.carbs}g</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-purple-600">{ingredient.fat}g</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">{ingredient.fiber || '-'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">{ingredient.sugar || '-'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {ingredient.aliases && ingredient.aliases.length > 0 
                            ? ingredient.aliases.join(', ') 
                            : '-'
                          }
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface ApiIngredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  category: string;
  source: string;
}


export default function VoedingsplannenApiPage() {
  const [ingredients, setIngredients] = useState<ApiIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedApi, setSelectedApi] = useState('openfoodfacts');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');

  // Sample data for demonstration
  const sampleIngredients: ApiIngredient[] = [
    {
      id: '1',
      name: 'Chicken Breast',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      category: 'proteins',
      source: 'OPENFOODFACTS'
    },
    {
      id: '2',
      name: 'Brown Rice',
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3,
      fiber: 0.4,
      sugar: 0.1,
      category: 'carbohydrates',
      source: 'OPENFOODFACTS'
    },
    {
      id: '3',
      name: 'Avocado',
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fiber: 6.7,
      sugar: 0.7,
      category: 'healthy-fats',
      source: 'OPENFOODFACTS'
    }
  ];

  useEffect(() => {
    setIngredients(sampleIngredients);
  }, []);

  const categories = [
    { value: 'all', label: 'Alle Categorieën' },
    { value: 'proteins', label: 'Proteïnen' },
    { value: 'carbohydrates', label: 'Koolhydraten' },
    { value: 'healthy-fats', label: 'Gezonde Vetten' },
    { value: 'fruits', label: 'Fruit' },
    { value: 'vegetables', label: 'Groenten' },
    { value: 'dairy', label: 'Zuivel' },
    { value: 'nuts-seeds', label: 'Noten & Zaden' }
  ];

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const searchApi = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/openfoodfacts-search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.foods && data.foods.length > 0) {
        const newIngredients = data.foods.map((food: any) => ({
          id: food.id || Math.random().toString(),
          name: food.name || food.product_name,
          calories: food.calories || food.energy_kcal_100g || 0,
          protein: food.protein || food.proteins_100g || 0,
          carbs: food.carbs || food.carbohydrates_100g || 0,
          fat: food.fat || food.fat_100g || 0,
          fiber: food.fiber || food.fiber_100g || 0,
          sugar: food.sugar || food.sugars_100g || 0,
          category: categorizeFood(food.name || food.product_name),
          source: 'OPENFOODFACTS'
        }));
        
        setIngredients(prev => [...prev, ...newIngredients]);
      }
    } catch (error) {
      console.error('Error searching Open Food Facts API:', error);
      alert('Fout bij het zoeken in Open Food Facts API');
    } finally {
      setLoading(false);
    }
  };


  const categorizeFood = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('fish') || lowerName.includes('egg')) {
      return 'proteins';
    } else if (lowerName.includes('rice') || lowerName.includes('pasta') || lowerName.includes('bread') || lowerName.includes('oats')) {
      return 'carbohydrates';
    } else if (lowerName.includes('avocado') || lowerName.includes('oil') || lowerName.includes('nuts')) {
      return 'healthy-fats';
    } else if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('berry')) {
      return 'fruits';
    } else if (lowerName.includes('broccoli') || lowerName.includes('spinach') || lowerName.includes('carrot')) {
      return 'vegetables';
    } else if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt')) {
      return 'dairy';
    }
    return 'other';
  };

  const importToDatabase = async () => {
    setImporting(true);
    setImportProgress(0);
    setImportStatus('Bezig met importeren...');

    try {
      const response = await fetch('/api/import-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: filteredIngredients }),
      });

      if (response.ok) {
        setImportStatus('Import voltooid!');
        setImportProgress(100);
      } else {
        throw new Error('Import mislukt');
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('Import mislukt');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">Voedingsplannen API</h1>
          <p className="text-gray-300">Zoek en importeer ingredienten via de Open Food Facts API</p>
        </div>

        {/* API Configuration */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-500">API Configuratie</h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-green-400 font-medium">✓ Open Food Facts (Gratis - Geen limiet)</span>
            </div>
            <div className="text-sm text-gray-400">
              Geen API key nodig - Geen registratie nodig - direct te gebruiken
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-500">Zoek Ingredienten</h2>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Zoek ingredienten..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => searchApi(searchTerm)}
              disabled={loading || !searchTerm}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Zoeken...' : 'Zoek in OPENFOODFACTS'}
            </button>
          </div>
        </div>

        {/* Import Progress */}
        {importing && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-orange-500">Import Status</h3>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-300">{importStatus}</p>
          </div>
        )}

        {/* Ingredients Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-orange-500">
              Gevonden Ingredienten ({filteredIngredients.length})
            </h2>
            <button
              onClick={importToDatabase}
              disabled={importing || filteredIngredients.length === 0}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? 'Importeren...' : 'Importeer naar Database'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2">Naam</th>
                  <th className="text-left py-3 px-2">Calorieën</th>
                  <th className="text-left py-3 px-2">Eiwit</th>
                  <th className="text-left py-3 px-2">Koolhydraten</th>
                  <th className="text-left py-3 px-2">Vet</th>
                  <th className="text-left py-3 px-2">Vezels</th>
                  <th className="text-left py-3 px-2">Suiker</th>
                  <th className="text-left py-3 px-2">Categorie</th>
                  <th className="text-left py-3 px-2">Bron</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((ingredient) => (
                  <tr key={ingredient.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-2 font-medium">{ingredient.name}</td>
                    <td className="py-3 px-2">{ingredient.calories}</td>
                    <td className="py-3 px-2">{ingredient.protein}g</td>
                    <td className="py-3 px-2">{ingredient.carbs}g</td>
                    <td className="py-3 px-2">{ingredient.fat}g</td>
                    <td className="py-3 px-2">{ingredient.fiber || 0}g</td>
                    <td className="py-3 px-2">{ingredient.sugar || 0}g</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 bg-gray-600 rounded text-xs">
                        {categories.find(c => c.value === ingredient.category)?.label || ingredient.category}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 bg-blue-600 rounded text-xs">
                        {ingredient.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredIngredients.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Geen ingredienten gevonden. Probeer een andere zoekterm.
            </div>
          )}
        </div>

        {/* API Information */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-500">API Informatie</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-orange-400">Open Food Facts</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Gratis API met 2.000.000+ producten</li>
                <li>• Open source voedingsdatabase</li>
                <li>• Uitgebreide voedingsinformatie</li>
                <li>• Geen limiet op requests</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-orange-400">Voordelen</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Altijd actuele voedingswaarden</li>
                <li>• Betrouwbare bron</li>
                <li>• Geen handmatige invoer nodig</li>
                <li>• Automatische categorisering</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

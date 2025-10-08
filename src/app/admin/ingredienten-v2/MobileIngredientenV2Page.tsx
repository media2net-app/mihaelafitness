'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calculator, 
  Scale, 
  Apple, 
  Target,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

interface Ingredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  category?: string;
  per?: string;
  aliases?: string;
  isActive?: boolean;
}

interface NormalizedIngredient extends Ingredient {
  originalAmount: number;
  originalUnit: string;
  normalizedPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  conversionFactor: number;
  canNormalize: boolean;
}

export default function MobileIngredientenV2Page() {
  const { t } = useLanguage();
  const router = useRouter();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [normalizedIngredients, setNormalizedIngredients] = useState<NormalizedIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<NormalizedIngredient | null>(null);
  const [calculatorAmount, setCalculatorAmount] = useState(100);
  const [calculatorUnit, setCalculatorUnit] = useState('g');

  // Categories
  const categories = [
    { id: 'all', name: 'Alle Categorieën' },
    { id: 'dairy', name: 'Zuivel' },
    { id: 'meat', name: 'Vlees & Vis' },
    { id: 'grains', name: 'Granen & Brood' },
    { id: 'fruits', name: 'Fruit' },
    { id: 'vegetables', name: 'Groenten' },
    { id: 'nuts', name: 'Noten & Zaden' },
    { id: 'oils', name: 'Oliën & Vetten' },
    { id: 'other', name: 'Overig' }
  ];

  // Parse amount and unit from 'per' field
  const parsePerField = (per: string, ingredientName: string): { amount: number; unit: string } => {
    if (!per) return { amount: 100, unit: 'g' };
    
    // Check if ingredient name suggests it's per piece (starts with number)
    const isPerPiece = /^\d+\s/.test(ingredientName);
    
    // Common patterns: "100g", "1 piece", "1 tsp", "1 tbsp", "1 cup", etc.
    const patterns = [
      { regex: /(\d+(?:\.\d+)?)\s*g(?:ram)?/i, unit: 'g' },
      { regex: /(\d+(?:\.\d+)?)\s*ml/i, unit: 'ml' },
      { regex: /(\d+(?:\.\d+)?)\s*(?:piece|pieces|slice|slices|stuks?)/i, unit: 'piece' },
      { regex: /(\d+(?:\.\d+)?)\s*tsp/i, unit: 'tsp' },
      { regex: /(\d+(?:\.\d+)?)\s*tbsp/i, unit: 'tbsp' },
      { regex: /(\d+(?:\.\d+)?)\s*cup/i, unit: 'cup' },
      { regex: /(\d+(?:\.\d+)?)\s*oz/i, unit: 'oz' },
      { regex: /(\d+(?:\.\d+)?)\s*lb/i, unit: 'lb' },
      { regex: /^(\d+(?:\.\d+)?)\s*$/i, unit: isPerPiece ? 'piece' : 'g' } // Just a number
    ];
    
    for (const pattern of patterns) {
      const match = per.match(pattern.regex);
      if (match) {
        return { amount: parseFloat(match[1]), unit: pattern.unit };
      }
    }
    
    return { amount: 100, unit: 'g' };
  };

  // Normalize ingredients to 100g basis
  const normalizeIngredient = (ingredient: Ingredient): NormalizedIngredient => {
    const { amount, unit } = parsePerField(ingredient.per || '100g', ingredient.name);
    
    let conversionFactor = 1;
    let canNormalize = true;
    
    // Handle different units
    if (unit === 'g') {
      // Already in grams, easy conversion
      conversionFactor = 100 / amount;
    } else if (unit === 'ml') {
      // Assume 1ml ≈ 1g for most liquids
      conversionFactor = 100 / amount;
    } else if (unit === 'tsp') {
      // 1 tsp ≈ 5ml ≈ 5g
      conversionFactor = 100 / (amount * 5);
    } else if (unit === 'tbsp') {
      // 1 tbsp ≈ 15ml ≈ 15g
      conversionFactor = 100 / (amount * 15);
    } else if (unit === 'cup') {
      // 1 cup ≈ 240ml ≈ 240g
      conversionFactor = 100 / (amount * 240);
    } else if (unit === 'oz') {
      // 1 oz ≈ 28.35g
      conversionFactor = 100 / (amount * 28.35);
    } else if (unit === 'lb') {
      // 1 lb ≈ 453.59g
      conversionFactor = 100 / (amount * 453.59);
    } else if (unit === 'piece') {
      // For pieces, we cannot accurately convert to 100g without knowing the weight
      // We'll show the original values and indicate this limitation
      canNormalize = false;
      conversionFactor = 1;
    } else {
      // Unknown unit, keep original values
      canNormalize = false;
      conversionFactor = 1;
    }
    
    return {
      ...ingredient,
      originalAmount: amount,
      originalUnit: unit,
      conversionFactor,
      canNormalize,
      normalizedPer100g: {
        calories: canNormalize 
          ? Math.round(ingredient.calories * conversionFactor * 100) / 100
          : ingredient.calories,
        protein: canNormalize 
          ? Math.round(ingredient.protein * conversionFactor * 100) / 100
          : ingredient.protein,
        carbs: canNormalize 
          ? Math.round(ingredient.carbs * conversionFactor * 100) / 100
          : ingredient.carbs,
        fat: canNormalize 
          ? Math.round(ingredient.fat * conversionFactor * 100) / 100
          : ingredient.fat,
        fiber: canNormalize 
          ? Math.round((ingredient.fiber || 0) * conversionFactor * 100) / 100
          : (ingredient.fiber || 0),
        sugar: canNormalize 
          ? Math.round((ingredient.sugar || 0) * conversionFactor * 100) / 100
          : (ingredient.sugar || 0)
      }
    };
  };

  // Calculate nutrition for specific amount
  const calculateNutrition = (ingredient: NormalizedIngredient, amount: number, unit: string) => {
    let factor = amount / 100; // Default for grams
    
    if (unit === 'ml') {
      factor = amount / 100; // Assume 1ml ≈ 1g
    } else if (unit === 'piece') {
      factor = amount; // Keep original piece-based values
    } else if (unit === 'tsp') {
      factor = (amount * 5) / 100; // 1 tsp ≈ 5g
    } else if (unit === 'tbsp') {
      factor = (amount * 15) / 100; // 1 tbsp ≈ 15g
    } else if (unit === 'cup') {
      factor = (amount * 240) / 100; // 1 cup ≈ 240g
    } else if (unit === 'oz') {
      factor = (amount * 28.35) / 100; // 1 oz ≈ 28.35g
    } else if (unit === 'lb') {
      factor = (amount * 453.59) / 100; // 1 lb ≈ 453.59g
    }
    
    return {
      calories: Math.round(ingredient.normalizedPer100g.calories * factor * 100) / 100,
      protein: Math.round(ingredient.normalizedPer100g.protein * factor * 100) / 100,
      carbs: Math.round(ingredient.normalizedPer100g.carbs * factor * 100) / 100,
      fat: Math.round(ingredient.normalizedPer100g.fat * factor * 100) / 100,
      fiber: Math.round(ingredient.normalizedPer100g.fiber * factor * 100) / 100,
      sugar: Math.round(ingredient.normalizedPer100g.sugar * factor * 100) / 100
    };
  };

  // Fetch ingredients from database
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ingredients');
        if (response.ok) {
          const data = await response.json();
          setIngredients(data);
          
          // Normalize all ingredients
          const normalized = data.map(normalizeIngredient);
          setNormalizedIngredients(normalized);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  // Filter and sort ingredients
  const filteredIngredients = normalizedIngredients
    .filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'calories':
          comparison = a.normalizedPer100g.calories - b.normalizedPer100g.calories;
          break;
        case 'protein':
          comparison = a.normalizedPer100g.protein - b.normalizedPer100g.protein;
          break;
        case 'carbs':
          comparison = a.normalizedPer100g.carbs - b.normalizedPer100g.carbs;
          break;
        case 'fat':
          comparison = a.normalizedPer100g.fat - b.normalizedPer100g.fat;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const openCalculator = (ingredient: NormalizedIngredient) => {
    setSelectedIngredient(ingredient);
    setCalculatorAmount(100);
    setCalculatorUnit('g');
    setShowCalculator(true);
  };

  const getUnitIcon = (unit: string) => {
    switch (unit.toLowerCase()) {
      case 'g': return '⚖️';
      case 'ml': return '🥤';
      case 'piece': return '🔢';
      case 'tsp': return '🥄';
      case 'tbsp': return '🍽️';
      case 'cup': return '☕';
      case 'oz': return '⚖️';
      case 'lb': return '⚖️';
      default: return '📏';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Scale className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl font-bold">Ingredienten V2 - 100g Basis</h1>
          </div>
          <div className="text-sm text-gray-400">
            {filteredIngredients.length} ingredienten
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Zoek ingredienten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          
          <div className="flex space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
            >
              <option value="name-asc">Naam A-Z</option>
              <option value="name-desc">Naam Z-A</option>
              <option value="calories-asc">Calorieën ↑</option>
              <option value="calories-desc">Calorieën ↓</option>
              <option value="protein-desc">Eiwit ↓</option>
              <option value="protein-asc">Eiwit ↑</option>
              <option value="carbs-desc">Koolhydraten ↓</option>
              <option value="carbs-asc">Koolhydraten ↑</option>
              <option value="fat-desc">Vet ↓</option>
              <option value="fat-asc">Vet ↑</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-500/30 p-3 m-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <strong>Ingredienten V2:</strong> Ingrediënten met gewicht/massa eenheden worden genormaliseerd naar 100g basis. 
            Ingrediënten per stuk (zoals "1 Apple") tonen originele waarden omdat conversie naar 100g niet mogelijk is zonder exacte gewichten. 
            Gebruik de calculator voor specifieke hoeveelheden.
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {filteredIngredients.map((ingredient) => (
          <div key={ingredient.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            {/* Ingredient Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{ingredient.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <span>{getUnitIcon(ingredient.originalUnit)}</span>
                      <span>{ingredient.originalAmount} {ingredient.originalUnit}</span>
                    </span>
                    <span>→</span>
                    <span className={`font-medium ${ingredient.canNormalize ? 'text-orange-400' : 'text-red-400'}`}>
                      {ingredient.canNormalize ? '100g basis' : 'Originele waarden'}
                    </span>
                    {!ingredient.canNormalize && (
                      <span className="text-xs text-red-300">(geen conversie mogelijk)</span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => openCalculator(ingredient)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm transition-colors"
              >
                <Calculator className="w-4 h-4" />
                <span>Bereken</span>
              </button>
            </div>

            {/* Nutrition Values */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-500">{ingredient.normalizedPer100g.calories}</div>
                <div className="text-xs text-gray-400">kcal</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-500">{ingredient.normalizedPer100g.protein}g</div>
                <div className="text-xs text-gray-400">Eiwit</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-500">{ingredient.normalizedPer100g.carbs}g</div>
                <div className="text-xs text-gray-400">Koolhydraten</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-500">{ingredient.normalizedPer100g.fat}g</div>
                <div className="text-xs text-gray-400">Vet</div>
              </div>
            </div>

            {/* Additional Info */}
            {(ingredient.normalizedPer100g.fiber > 0 || ingredient.normalizedPer100g.sugar > 0) && (
              <div className="mt-3 flex space-x-4 text-sm text-gray-400">
                {ingredient.normalizedPer100g.fiber > 0 && (
                  <span>Vezels: {ingredient.normalizedPer100g.fiber}g</span>
                )}
                {ingredient.normalizedPer100g.sugar > 0 && (
                  <span>Suiker: {ingredient.normalizedPer100g.sugar}g</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Calculator Modal */}
      {showCalculator && selectedIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Nutrition Calculator</h3>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {selectedIngredient.name}
              </p>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-2">Hoeveelheid</div>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    placeholder="100"
                  />
                  <select
                    value={calculatorUnit}
                    onChange={(e) => setCalculatorUnit(e.target.value)}
                    className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="piece">stuks</option>
                    <option value="tsp">tsp</option>
                    <option value="tbsp">tbsp</option>
                    <option value="cup">cup</option>
                    <option value="oz">oz</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>

              {/* Calculated Results */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-3">Voedingswaarden voor {calculatorAmount} {calculatorUnit}:</div>
                {(() => {
                  const nutrition = calculateNutrition(selectedIngredient, calculatorAmount, calculatorUnit);
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-500">{nutrition.calories}</div>
                        <div className="text-xs text-gray-400">kcal</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-500">{nutrition.protein}g</div>
                        <div className="text-xs text-gray-400">Eiwit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-500">{nutrition.carbs}g</div>
                        <div className="text-xs text-gray-400">Koolhydraten</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-500">{nutrition.fat}g</div>
                        <div className="text-xs text-gray-400">Vet</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Original vs Normalized Comparison */}
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-2">Vergelijking:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Origineel ({selectedIngredient.originalAmount} {selectedIngredient.originalUnit}):</span>
                    <span className="text-orange-400">{selectedIngredient.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>100g basis:</span>
                    <span className="text-orange-400">{selectedIngredient.normalizedPer100g.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversie factor:</span>
                    <span className="text-blue-400">{selectedIngredient.conversionFactor.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => setShowCalculator(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  Calendar,
  Apple,
  Clock,
  Target,
  X,
  Download,
  Eye,
  Search
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ParsedDay {
  dayNumber: number;
  dayName: string;
  isTrainingDay: boolean;
  targetCalories: number;
  meals: ParsedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface ParsedMeal {
  name: string;
  type: string;
  ingredients: ParsedIngredient[];
  instructions: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface ParsedIngredient {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function MobileMealplanMappingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Text input
  const [planText, setPlanText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Step 2: Parsed data
  const [parsedData, setParsedData] = useState<ParsedDay[]>([]);
  const [parsingErrors, setParsingErrors] = useState<string[]>([]);
  
  // Step 3: API ingredient search
  const [isSearchingAPI, setIsSearchingAPI] = useState(false);
  const [apiSearchResults, setApiSearchResults] = useState<Map<string, any>>(new Map());
  const [searchProgress, setSearchProgress] = useState(0);

  // Parse the meal plan text
  const parseMealPlan = (text: string): { days: ParsedDay[], errors: string[] } => {
    const errors: string[] = [];
    const days: ParsedDay[] = [];
    
    try {
      // Split by day markers
      const daySections = text.split(/(?=📅 Day \d+)/);
      
      daySections.forEach((section, index) => {
        if (!section.trim()) return;
        
        try {
          // Extract day info
          const dayMatch = section.match(/📅 Day (\d+) – ([^(]+) \(([^)]+)\)/);
          if (!dayMatch) {
            errors.push(`Day ${index + 1}: Could not parse day header`);
            return;
          }
          
          const dayNumber = parseInt(dayMatch[1]);
          const dayName = dayMatch[2].trim();
          const dayInfo = dayMatch[3];
          const isTrainingDay = dayInfo.toLowerCase().includes('training');
          
          // Extract target calories
          const calorieMatch = section.match(/~([\d,]+) kcal/);
          const targetCalories = calorieMatch ? parseInt(calorieMatch[1].replace(',', '')) : 0;
          
          // Extract meals
          const meals: ParsedMeal[] = [];
          const mealSections = section.split(/(?=Breakfast|Lunch|Dinner|Snack \d+)/);
          
          mealSections.forEach(mealSection => {
            if (!mealSection.trim() || !mealSection.includes('–')) return;
            
            try {
              // Extract meal name and type
              const mealMatch = mealSection.match(/^([^–]+)–\s*([^\n]+)/);
              if (!mealMatch) return;
              
              const mealType = mealMatch[1].trim();
              const mealName = mealMatch[2].trim();
              
              // Extract ingredients
              const ingredients: ParsedIngredient[] = [];
              const ingredientLines = mealSection.match(/•\s*([^→]+)→\s*([^\n]+)/g);
              
              if (ingredientLines) {
                ingredientLines.forEach(line => {
                  const match = line.match(/•\s*([^→]+)→\s*([^\n]+)/);
                  if (match) {
                    const name = match[1].trim();
                    const nutrition = match[2].trim();
                    
                    // Parse nutrition values
                    const calMatch = nutrition.match(/(\d+)\s*kcal/);
                    const proteinMatch = nutrition.match(/P:(\d+)g/);
                    const carbMatch = nutrition.match(/C:(\d+)g/);
                    const fatMatch = nutrition.match(/F:(\d+)g/);
                    
                    ingredients.push({
                      name,
                      amount: '',
                      calories: calMatch ? parseInt(calMatch[1]) : 0,
                      protein: proteinMatch ? parseInt(proteinMatch[1]) : 0,
                      carbs: carbMatch ? parseInt(carbMatch[1]) : 0,
                      fat: fatMatch ? parseInt(fatMatch[1]) : 0
                    });
                  }
                });
              }
              
              // Extract total for meal
              const totalMatch = mealSection.match(/Total:\s*([^\n]+)/);
              let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
              
              if (totalMatch) {
                const totalStr = totalMatch[1];
                const totalCalMatch = totalStr.match(/(\d+)\s*kcal/);
                const totalProteinMatch = totalStr.match(/P:(\d+)g/);
                const totalCarbMatch = totalStr.match(/C:(\d+)g/);
                const totalFatMatch = totalStr.match(/F:(\d+)g/);
                
                totalCalories = totalCalMatch ? parseInt(totalCalMatch[1]) : 0;
                totalProtein = totalProteinMatch ? parseInt(totalProteinMatch[1]) : 0;
                totalCarbs = totalCarbMatch ? parseInt(totalCarbMatch[1]) : 0;
                totalFat = totalFatMatch ? parseInt(totalFatMatch[1]) : 0;
              }
              
              // Extract instructions
              const instructionsMatch = mealSection.match(/Instructions:\s*([^\n]+)/);
              const instructions = instructionsMatch ? instructionsMatch[1].trim() : '';
              
              if (ingredients.length > 0) {
                meals.push({
                  name: mealName,
                  type: mealType,
                  ingredients,
                  instructions,
                  totalCalories,
                  totalProtein,
                  totalCarbs,
                  totalFat
                });
              }
              
            } catch (error) {
              errors.push(`Day ${dayNumber}, Meal parsing error: ${error}`);
            }
          });
          
          // Calculate day totals
          const dayTotalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
          const dayTotalProtein = meals.reduce((sum, meal) => sum + meal.totalProtein, 0);
          const dayTotalCarbs = meals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
          const dayTotalFat = meals.reduce((sum, meal) => sum + meal.totalFat, 0);
          
          days.push({
            dayNumber,
            dayName,
            isTrainingDay,
            targetCalories,
            meals,
            totalCalories: dayTotalCalories,
            totalProtein: dayTotalProtein,
            totalCarbs: dayTotalCarbs,
            totalFat: dayTotalFat
          });
          
        } catch (error) {
          errors.push(`Day ${index + 1}: ${error}`);
        }
      });
      
    } catch (error) {
      errors.push(`General parsing error: ${error}`);
    }
    
    return { days, errors };
  };

  const handleProcessPlan = () => {
    if (!planText.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      const { days, errors } = parseMealPlan(planText);
      setParsedData(days);
      setParsingErrors(errors);
      setCurrentStep(2);
      setIsProcessing(false);
    }, 2000);
  };

  const resetProcess = () => {
    setCurrentStep(1);
    setPlanText('');
    setParsedData([]);
    setParsingErrors([]);
    setApiSearchResults(new Map());
    setSearchProgress(0);
  };

  // Search ingredients via API
  const searchIngredientsInAPI = async () => {
    if (parsedData.length === 0) return;
    
    setIsSearchingAPI(true);
    setSearchProgress(0);
    setApiSearchResults(new Map());
    
    try {
      // Collect all unique ingredient names
      const allIngredients = new Set<string>();
      parsedData.forEach(day => {
        day.meals.forEach(meal => {
          meal.ingredients.forEach(ingredient => {
            // Clean ingredient name (remove quantities, amounts, etc.)
            const cleanName = ingredient.name
              .replace(/\d+\s*(g|ml|tsp|tbsp|cup|oz|lb|piece|pieces|stuks?)\b/g, '')
              .replace(/\([^)]*\)/g, '')
              .trim();
            if (cleanName) {
              allIngredients.add(cleanName);
            }
          });
        });
      });
      
      const ingredientsArray = Array.from(allIngredients);
      const results = new Map();
      
      for (let i = 0; i < ingredientsArray.length; i++) {
        const ingredientName = ingredientsArray[i];
        setSearchProgress((i / ingredientsArray.length) * 100);
        
        try {
          // Search via the voedingsplannen-api endpoint
          const response = await fetch(`/api/openfoodfacts-search?query=${encodeURIComponent(ingredientName)}`);
          const data = await response.json();
          
          if (data.foods && data.foods.length > 0) {
            // Take the first/best match
            const bestMatch = data.foods[0];
            results.set(ingredientName, {
              found: true,
              data: {
                name: bestMatch.name || bestMatch.product_name,
                calories: bestMatch.calories || bestMatch.energy_kcal_100g || 0,
                protein: bestMatch.proteins_100g || 0,
                carbs: bestMatch.carbohydrates_100g || 0,
                fat: bestMatch.fat_100g || 0,
                fiber: bestMatch.fiber_100g || 0,
                sugar: bestMatch.sugars_100g || 0,
                source: 'OpenFoodFacts'
              }
            });
          } else {
            results.set(ingredientName, { found: false });
          }
        } catch (error) {
          console.error(`Error searching for ${ingredientName}:`, error);
          results.set(ingredientName, { found: false, error: error.message });
        }
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setApiSearchResults(results);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error in API search:', error);
    } finally {
      setIsSearchingAPI(false);
      setSearchProgress(100);
    }
  };

  const getDayName = (dayNumber: number) => {
    const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
    return dayNames[dayNumber - 1] || `Dag ${dayNumber}`;
  };

  const getMealTypeIcon = (mealType: string) => {
    if (mealType.toLowerCase().includes('breakfast')) return '🌅';
    if (mealType.toLowerCase().includes('lunch')) return '☀️';
    if (mealType.toLowerCase().includes('dinner')) return '🌙';
    if (mealType.toLowerCase().includes('snack')) return '🍎';
    return '🍽️';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-6 h-6 text-orange-500" />
          <h1 className="text-xl font-bold">Mealplan Parser</h1>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-orange-500' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              1
            </div>
            <span className="text-sm font-medium hidden sm:block">Invoer</span>
          </div>
          
          <ArrowRight className={`w-4 h-4 ${currentStep >= 2 ? 'text-orange-500' : 'text-gray-400'}`} />
          
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              2
            </div>
            <span className="text-sm font-medium hidden sm:block">Parsing</span>
          </div>
          
          <ArrowRight className={`w-4 h-4 ${currentStep >= 3 ? 'text-orange-500' : 'text-gray-400'}`} />
          
          <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-orange-500' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              3
            </div>
            <span className="text-sm font-medium hidden sm:block">API Zoek</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Step 1: Text Input */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="w-6 h-6 text-orange-500" />
                <h2 className="text-lg font-semibold">Stap 1: Plan Invoer</h2>
              </div>
              
              <p className="text-gray-400 mb-4">
                Plak hier je voedingsplan tekst. Het systeem zal automatisch dagen, maaltijden, ingrediënten en voedingswaarden extraheren.
              </p>
              
              <textarea
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                placeholder="Plak hier je volledige voedingsplan tekst..."
                className="w-full h-96 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                  {planText.length} karakters
                </div>
                
                <button
                  onClick={handleProcessPlan}
                  disabled={!planText.trim() || isProcessing}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verwerken...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Plan Verwerken</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Processing Results Header */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h2 className="text-lg font-semibold">Verwerking Voltooid</h2>
                </div>
                <button
                  onClick={resetProcess}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Nieuw Plan</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-500">{parsedData.length}</div>
                  <div className="text-sm text-gray-400">Dagen</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {parsedData.reduce((sum, day) => sum + day.meals.length, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Maaltijden</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {parsedData.reduce((sum, day) => sum + day.meals.reduce((mealSum, meal) => mealSum + meal.ingredients.length, 0), 0)}
                  </div>
                  <div className="text-sm text-gray-400">Ingrediënten</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {parsingErrors.length}
                  </div>
                  <div className="text-sm text-gray-400">Waarschuwingen</div>
                </div>
              </div>
              
              {parsingErrors.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-400 mb-2">Waarschuwingen:</h4>
                  <ul className="text-sm text-yellow-300 space-y-1">
                    {parsingErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Next Step Button */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={searchIngredientsInAPI}
                  disabled={isSearchingAPI}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  {isSearchingAPI ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Zoeken in API...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Zoek Ingrediënten in API</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Zoekt alle ingrediënten op in de OpenFoodFacts database
                </p>
              </div>
            </div>

            {/* Days Overview */}
            {parsedData.map((day) => (
              <div key={day.dayNumber} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {/* Day Header */}
                <div className="bg-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <div>
                        <h3 className="font-semibold">Dag {day.dayNumber} - {getDayName(day.dayNumber)}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>{day.isTrainingDay ? 'Training Dag' : 'Rust Dag'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Apple className="w-4 h-4" />
                            <span>{day.targetCalories.toLocaleString()} kcal doel</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{day.meals.length} maaltijden</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Totaal</div>
                      <div className="text-sm">
                        <span className="text-orange-500">{day.totalCalories} kcal</span> | 
                        <span className="text-blue-400"> P:{day.totalProtein}g</span> | 
                        <span className="text-green-400"> C:{day.totalCarbs}g</span> | 
                        <span className="text-yellow-400"> F:{day.totalFat}g</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meals */}
                <div className="p-4 space-y-4">
                  {day.meals.map((meal, mealIndex) => (
                    <div key={mealIndex} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getMealTypeIcon(meal.type)}</span>
                          <h4 className="font-medium">{meal.name}</h4>
                        </div>
                        <div className="text-sm">
                          <span className="text-orange-500">{meal.totalCalories} kcal</span> | 
                          <span className="text-blue-400"> P:{meal.totalProtein}g</span> | 
                          <span className="text-green-400"> C:{meal.totalCarbs}g</span> | 
                          <span className="text-yellow-400"> F:{meal.totalFat}g</span>
                        </div>
                      </div>
                      
                      {/* Ingredients */}
                      <div className="space-y-2">
                        {meal.ingredients.map((ingredient, ingIndex) => (
                          <div key={ingIndex} className="flex justify-between items-center bg-gray-600 rounded p-2 text-sm">
                            <span className="text-gray-300">{ingredient.name}</span>
                            <div className="flex space-x-3 text-xs">
                              <span className="text-orange-400">{ingredient.calories} kcal</span>
                              <span className="text-blue-400">P:{ingredient.protein}g</span>
                              <span className="text-green-400">C:{ingredient.carbs}g</span>
                              <span className="text-yellow-400">F:{ingredient.fat}g</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {meal.instructions && (
                        <div className="mt-3 p-2 bg-gray-600 rounded text-sm text-gray-300">
                          <strong>Bereiding:</strong> {meal.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            {/* API Search Results Header */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Search className="w-6 h-6 text-green-500" />
                  <h2 className="text-lg font-semibold">API Zoekresultaten</h2>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Terug</span>
                </button>
              </div>
              
              {/* Search Progress */}
              {isSearchingAPI && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Zoeken in OpenFoodFacts...</span>
                    <span>{Math.round(searchProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${searchProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Results Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-500">{Array.from(apiSearchResults.values()).filter(r => r.found).length}</div>
                  <div className="text-sm text-gray-400">Gevonden</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-500">{Array.from(apiSearchResults.values()).filter(r => !r.found).length}</div>
                  <div className="text-sm text-gray-400">Niet Gevonden</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-500">{apiSearchResults.size}</div>
                  <div className="text-sm text-gray-400">Totaal Gezocht</div>
                </div>
              </div>
            </div>

            {/* Ingredient Search Results */}
            <div className="space-y-4">
              {Array.from(apiSearchResults.entries()).map(([ingredientName, result]) => (
                <div key={ingredientName} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        result.found ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {result.found ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <X className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{ingredientName}</h3>
                        <div className="text-sm text-gray-400">
                          {result.found ? 'Gevonden in OpenFoodFacts' : 'Niet gevonden'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {result.found && result.data && (
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{result.data.name}</h4>
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          {result.data.source}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-500">{result.data.calories}</div>
                          <div className="text-xs text-gray-400">kcal</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-500">{result.data.protein}g</div>
                          <div className="text-xs text-gray-400">Eiwit</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-500">{result.data.carbs}g</div>
                          <div className="text-xs text-gray-400">Koolhydraten</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-500">{result.data.fat}g</div>
                          <div className="text-xs text-gray-400">Vet</div>
                        </div>
                      </div>
                      
                      {(result.data.fiber > 0 || result.data.sugar > 0) && (
                        <div className="mt-3 flex space-x-4 text-sm text-gray-400">
                          {result.data.fiber > 0 && (
                            <span>Vezels: {result.data.fiber}g</span>
                          )}
                          {result.data.sugar > 0 && (
                            <span>Suiker: {result.data.sugar}g</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!result.found && (
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-400">
                        Dit ingrediënt kon niet worden gevonden in de OpenFoodFacts database.
                        {result.error && (
                          <div className="text-red-400 mt-1">
                            Fout: {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Final Actions */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Volgende Stappen</h3>
              <div className="space-y-3">
                <button
                  onClick={resetProcess}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Nieuw Plan Verwerken
                </button>
                <p className="text-sm text-gray-400 text-center">
                  De gevonden ingrediënten kunnen nu gebruikt worden voor het maken van voedingsplannen.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

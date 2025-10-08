'use client';

import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { FiX, FiFileText, FiCheck, FiAlertCircle, FiSearch } from 'react-icons/fi';

interface ProductMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (parsedData: any) => void;
  planId: string;
}

interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  matched?: boolean;
  dbIngredient?: any;
  originalText?: string; // Keep original text for display
}

interface ParsedMeal {
  name: string;
  ingredients: ParsedIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface ParsedDay {
  dayNumber: number;
  dayName: string;
  meals: ParsedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// Memoized SearchableSelect component to prevent unnecessary re-renders
const SearchableSelect = memo(({ 
    value, 
    onChange, 
    options, 
    placeholder = "Zoek ingrediënt...",
  className = "",
  isLoading = false,
  onFocus = () => {}
  }: {
    value: string;
    onChange: (value: string) => void;
    options: any[];
    placeholder?: string;
    className?: string;
  isLoading?: boolean;
  onFocus?: () => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const filtered = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }, [searchTerm, options]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(option => option.id === value);

    const handleSelect = (option: any) => {
      onChange(option.id);
      setIsOpen(false);
      setSearchTerm('');
    };

    const handleInputFocus = () => {
      onFocus(); // Trigger lazy loading when focused
      setIsOpen(true);
      setSearchTerm('');
    };

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
          <span className="text-gray-500 text-sm">Laden...</span>
          </div>
        </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
              <input
                ref={inputRef}
                type="text"
          value={selectedOption ? selectedOption.name : searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleSelect(option)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{option.name}</div>
                <div className="text-sm text-gray-500">
                  {option.category && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs mr-2">
                      {option.category}
                    </span>
                  )}
                  {option.per && (
                    <span className="text-xs text-gray-400">
                      per {option.per}
                    </span>
                  )}
                </div>
                  </div>
                ))
              ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
                  Geen ingrediënten gevonden
                </div>
              )}
          </div>
        )}
      </div>
    );
});

SearchableSelect.displayName = 'SearchableSelect';

export default function ProductMappingModal({ isOpen, onClose, onConvert, planId }: ProductMappingModalProps) {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedDay[] | null>(null);
  const [step, setStep] = useState<'input' | 'raw-view' | 'parsing' | 'review' | 'mapping' | 'assigning'>('input');
  const [error, setError] = useState<string | null>(null);
  const [parsingProgress, setParsingProgress] = useState<string>('');
  const [parsingStats, setParsingStats] = useState<{
    daysFound: number;
    mealsFound: number;
    ingredientsFound: number;
    matchedIngredients: number;
    unmatchedIngredients: number;
    currentStep: string;
  } | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [manualMappings, setManualMappings] = useState<{[key: string]: string}>({});
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const ingredientsLoadedRef = useRef(false);

  // Memoize availableIngredients to prevent unnecessary re-renders
  const memoizedAvailableIngredients = useMemo(() => availableIngredients, [availableIngredients]);

  // Debug function
  const addDebugLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    setDebugInfo(prev => [...prev.slice(-49), logEntry]); // Keep last 50 entries
    console.log(`[DEBUG ${timestamp}] ${message}`, data);
  };

  // Auto-match ingredients based on name similarity
  const autoMatchIngredients = useCallback(() => {
    if (!parsedData || !memoizedAvailableIngredients.length) return;

    const updatedParsedData = parsedData.map(day => ({
      ...day,
      meals: day.meals.map(meal => ({
        ...meal,
        ingredients: meal.ingredients.map(ingredient => {
          if (ingredient.matched) return ingredient;

          // Try to find exact match first
          let bestMatch = memoizedAvailableIngredients.find(dbIng => 
            dbIng.name.toLowerCase() === ingredient.name.toLowerCase()
          );

          // If no exact match, try partial match
          if (!bestMatch) {
            bestMatch = memoizedAvailableIngredients.find(dbIng => 
              dbIng.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
              ingredient.name.toLowerCase().includes(dbIng.name.toLowerCase())
            );
          }

          if (bestMatch) {
            return {
              ...ingredient,
              matched: true,
              dbIngredient: bestMatch
            };
          }

          return ingredient;
        })
      }))
    }));

    setParsedData(updatedParsedData);
  }, [parsedData, memoizedAvailableIngredients]);

  // Parse text to simple table structure
  const parseTextToTable = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const result: any[] = [];
    let currentDay = '';
    let currentMeal = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check for day headers
      if (trimmedLine.match(/📅\s*Day\s+\d+/i)) {
        currentDay = trimmedLine;
        return;
      }
      
      // Check for meal headers
      if (trimmedLine.match(/^(Breakfast|Lunch|Dinner|Snack|Morning|Afternoon|Evening)/i)) {
        currentMeal = trimmedLine;
        return;
      }
      
      // Check for ingredient lines (bullet points)
      if (trimmedLine.startsWith('•') && trimmedLine.includes('→')) {
        const ingredientMatch = trimmedLine.match(/•\s*(.+?)\s*→\s*(\d+)\s*kcal\s*\|\s*P:(\d+(?:\.\d+)?)g\s*\|\s*C:(\d+(?:\.\d+)?)g\s*\|\s*F:(\d+(?:\.\d+)?)g/);
        if (ingredientMatch) {
          const [, name, calories, protein, carbs, fat] = ingredientMatch;
          result.push({
            day: currentDay,
            meal: currentMeal,
            name: name.trim(),
            calories: parseInt(calories),
            protein: parseFloat(protein),
            carbs: parseFloat(carbs),
            fat: parseFloat(fat),
            originalText: trimmedLine
          });
        }
      }
    });
    
    return result;
  };

  // Load ingredients when mapping step is reached
  const loadAvailableIngredients = useCallback(async () => {
    if (isLoadingIngredients || availableIngredients.length > 0 || ingredientsLoadedRef.current) return;
    
    try {
      if (showDebug) {
        addDebugLog('loadAvailableIngredients: Starting to load ingredients');
      }
      setIsLoadingIngredients(true);
      setParsingProgress('Database ingrediënten worden geladen...');
      
      const response = await fetch('/api/ingredients');
      if (response.ok) {
        const data = await response.json();
        if (showDebug) {
          addDebugLog('loadAvailableIngredients: Successfully loaded ingredients', {
            count: data.ingredients?.length || 0,
            firstFew: data.ingredients?.slice(0, 3)
          });
        }
        setAvailableIngredients(data.ingredients || []);
        setParsingProgress(`${data.ingredients?.length || 0} ingrediënten geladen uit database`);
        ingredientsLoadedRef.current = true;
      } else {
        if (showDebug) {
          addDebugLog('loadAvailableIngredients: Failed to load ingredients', {
            status: response.status,
            statusText: response.statusText
          });
        }
        console.error('[ProductMapping] Failed to load ingredients:', response.status, response.statusText);
      }
    } catch (error) {
      if (showDebug) {
        addDebugLog('loadAvailableIngredients: Error occurred', error);
      }
      console.error('[ProductMapping] Failed to load ingredients:', error);
    } finally {
      if (showDebug) {
        addDebugLog('loadAvailableIngredients: Finished loading');
      }
      setIsLoadingIngredients(false);
    }
  }, [isLoadingIngredients, availableIngredients.length, showDebug]);

  // Removed global loading - ingredients will be loaded on-demand when SearchableSelect is focused

  // Debug logging useEffect - only runs when debug is enabled
  useEffect(() => {
    if (showDebug) {
      addDebugLog('State changed', {
        step,
        availableIngredientsLength: availableIngredients.length,
        isLoadingIngredients,
        hasParsedData: !!parsedData
      });
    }
  }, [step, availableIngredients.length, isLoadingIngredients, parsedData, showDebug]);


  const handleParseText = async () => {
    if (showDebug) {
      addDebugLog('handleParseText: Starting parse');
    }
    
    if (!text.trim()) {
      if (showDebug) {
        addDebugLog('handleParseText: No text provided');
      }
      setError('Voer een voedingsplan tekst in');
      return;
    }

    if (showDebug) {
      addDebugLog('handleParseText: Text provided', { textLength: text.length });
    }
    setIsParsing(true);
    setError(null);
    setStep('parsing');
    setParsingProgress('Tekst wordt geanalyseerd...');
    setParsingStats({
      daysFound: 0,
      mealsFound: 0,
      ingredientsFound: 0,
      matchedIngredients: 0,
      unmatchedIngredients: 0,
      currentStep: 'Tekst wordt geanalyseerd...'
    });

    try {
      // Real-time progress updates
      const progressUpdates = [
        { delay: 500, step: 'Dagen en maaltijden worden herkend...', stats: { daysFound: 0, mealsFound: 0, ingredientsFound: 0, matchedIngredients: 0, unmatchedIngredients: 0 } },
        { delay: 1000, step: 'Ingrediënten worden geëxtraheerd...', stats: { daysFound: 0, mealsFound: 0, ingredientsFound: 0, matchedIngredients: 0, unmatchedIngredients: 0 } },
        { delay: 1500, step: 'Product mapping wordt voorbereid...', stats: { daysFound: 0, mealsFound: 0, ingredientsFound: 0, matchedIngredients: 0, unmatchedIngredients: 0 } }
      ];

      progressUpdates.forEach(({ delay, step, stats }) => {
        setTimeout(() => {
          setParsingProgress(step);
          setParsingStats(prev => prev ? { ...prev, currentStep: step, ...stats } : null);
        }, delay);
      });

      if (showDebug) {
        addDebugLog('handleParseText: Making API call', { textLength: text.length, planId });
      }
      
      const response = await fetch('/api/nutrition-plans/parse-text-product-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          planId
        }),
      });

      if (showDebug) {
        addDebugLog('handleParseText: API response received', { 
          status: response.status, 
          ok: response.ok 
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (showDebug) {
          addDebugLog('handleParseText: API error', errorData);
        }
        throw new Error(errorData.error || 'Failed to parse text');
      }

      const result = await response.json();
      if (showDebug) {
        addDebugLog('handleParseText: Parse result', {
          success: result.success,
          totalDays: result.parsedData?.length,
          totalIngredients: result.statistics?.totalIngredients
        });
      }
      
      // Update with real statistics
      const stats = result.statistics || {};
      setParsingStats({
        daysFound: result.parsedData?.length || 0,
        mealsFound: result.parsedData?.reduce((total: number, day: any) => total + (day.meals?.length || 0), 0) || 0,
        ingredientsFound: stats.totalIngredients || 0,
        matchedIngredients: stats.matchedIngredients || 0,
        unmatchedIngredients: stats.unmatchedIngredients || 0,
        currentStep: 'Parsing voltooid!'
      });
      
      setParsedData(result.parsedData);
      setParsingProgress('Parsing voltooid!');
      
      // Skip mapping step and go directly to review
        setTimeout(() => setStep('review'), 500);
    } catch (err) {
      setError('Er ging iets mis bij het parsen van de tekst');
      setStep('input');
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportIngredients = async () => {
    if (!parsedData) return;

    setStep('assigning');
    try {
      const response = await fetch(`/api/nutrition-plans/${planId}/assign-parsed-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsedData: parsedData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to import ingredients');
      }

      const result = await response.json();
      console.log('[Frontend] Import Response:', result);
      console.log('[Frontend] Statistics:', result.statistics);
      alert(`✅ Ingrediënten geïmporteerd!\n\n📊 Statistieken:\n- ${result.statistics.addedIngredients} ingrediënten toegevoegd\n- ${result.statistics.skippedIngredients} ingrediënten overgeslagen\n- ${result.statistics.totalDays} dagen verwerkt\n- ${result.statistics.totalMeals} maaltijden verwerkt`);

      onConvert(parsedData);
      handleClose();
    } catch (err) {
      console.error('[Frontend] Error:', err);
      setError('Er ging iets mis bij het importeren van de ingrediënten');
      setStep('review');
    }
  };

  const handleAssignToPlan = async () => {
    if (!parsedData) return;

    setStep('assigning');
    try {
      const response = await fetch(`/api/nutrition-plans/${planId}/assign-parsed-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsedData: parsedData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign parsed data');
      }

      const result = await response.json();
      console.log('[Frontend] API Response:', result);
      console.log('[Frontend] Statistics:', result.statistics);
      alert(`✅ Succesvol toegevoegd!\n\n📊 Statistieken:\n- ${result.statistics.addedIngredients} ingrediënten toegevoegd\n- ${result.statistics.skippedIngredients} ingrediënten overgeslagen\n- ${result.statistics.totalDays} dagen verwerkt\n- ${result.statistics.totalMeals} maaltijden verwerkt`);

      onConvert(parsedData);
      handleClose();
    } catch (err) {
      console.error('[Frontend] Error:', err);
      setError('Er ging iets mis bij het toevoegen van de ingrediënten');
      setStep('review');
    }
  };

  const handleClose = () => {
    setText('');
    setParsedData(null);
    setStep('input');
    setError(null);
    setIsParsing(false);
    setParsingProgress('');
    setAvailableIngredients([]);
    setManualMappings({});
    setIsLoadingIngredients(false);
    setDebugInfo([]);
    setShowDebug(false);
    onClose();
  };

  const renderInputStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Voedingsplan Tekst
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Plak hier je voedingsplan tekst..."
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
        />
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setStep('raw-view')}
          disabled={!text.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📋 Raw Text View
        </button>
        <div className="flex gap-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Annuleren
        </button>
        <button
          onClick={handleParseText}
          disabled={!text.trim()}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Product Mapping Parsen
        </button>
        </div>
      </div>
    </div>
  );

  const renderRawTextView = () => {
    const tableData = parseTextToTable(text);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📋 Raw Text View
          </h3>
          <p className="text-gray-600">
            Hier zie je de geëxtraheerde ingrediënten uit je tekst. Je kunt deze handmatig mappen aan database ingrediënten.
          </p>
          <div className="mt-4 bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-600">
              📊 {tableData.length} ingrediënten gevonden in de tekst
            </p>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Dag</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Maaltijd</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Ingrediënt</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">Calorieën</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">Eiwit</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">Koolhydraten</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">Vet</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">Acties</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                    {item.day || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                    {item.meal || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-600">
                    {item.calories} kcal
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-600">
                    {item.protein}g
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-600">
                    {item.carbs}g
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-600">
                    {item.fat}g
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <button
                      onClick={() => {
                        // Go directly to review
                        setStep('review');
                      }}
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                    >
                      Bekijk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <button
            onClick={() => setStep('input')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Terug naar invoer
          </button>
          <div className="space-x-3">
            <button
              onClick={() => {
                setStep('review');
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Bekijk Overzicht
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderParsingStep = () => (
    <div className="py-8">
      <div className="text-center mb-6">
      <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">{parsingProgress || 'Tekst wordt geanalyseerd...'}</p>
      <p className="text-sm text-gray-500 mt-2">Dit kan even duren afhankelijk van de grootte van je plan</p>
      </div>
      
      {parsingStats && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">📊 Parsing Statistieken</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Dagen gevonden:</span>
              <span className="font-medium text-green-600">{parsingStats.daysFound}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Maaltijden gevonden:</span>
              <span className="font-medium text-green-600">{parsingStats.mealsFound}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ingrediënten gevonden:</span>
              <span className="font-medium text-blue-600">{parsingStats.ingredientsFound}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gekoppelde ingrediënten:</span>
              <span className="font-medium text-green-600">{parsingStats.matchedIngredients}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Niet gekoppelde ingrediënten:</span>
              <span className="font-medium text-orange-600">{parsingStats.unmatchedIngredients}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Match percentage:</span>
              <span className="font-medium text-purple-600">
                {parsingStats.ingredientsFound > 0 
                  ? Math.round((parsingStats.matchedIngredients / parsingStats.ingredientsFound) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      )}
      
      {showDebug && debugInfo.length > 0 && (
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs font-mono max-h-40 overflow-y-auto">
          <h4 className="text-white font-medium mb-2">🐛 Debug Log</h4>
          {debugInfo.slice(-10).map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
              {log.data && (
                <pre className="text-gray-300 mt-1 ml-4">{log.data}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMappingStep = () => {
    if (!parsedData) {
      return null;
    }

    // Get all unmatched ingredients
    const unmatchedIngredients: {[key: string]: ParsedIngredient} = {};
    parsedData.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients.forEach(ingredient => {
          if (!ingredient.matched) {
            unmatchedIngredients[ingredient.name] = ingredient;
          }
        });
      });
    });

    const handleMappingChange = (ingredientName: string, selectedIngredientId: string) => {
      setManualMappings(prev => ({
        ...prev,
        [ingredientName]: selectedIngredientId
      }));
    };

    const proceedToReview = () => {
      // Apply manual mappings to parsed data
      const updatedParsedData = parsedData.map(day => ({
        ...day,
        meals: day.meals.map(meal => ({
          ...meal,
          ingredients: meal.ingredients.map(ingredient => {
            if (!ingredient.matched && manualMappings[ingredient.name]) {
              const selectedIngredient = memoizedAvailableIngredients.find(
                ing => ing.id === manualMappings[ingredient.name]
              );
              if (selectedIngredient) {
                return {
                  ...ingredient,
                  matched: true,
                  dbIngredient: selectedIngredient
                };
              }
            }
            return ingredient;
          })
        }))
      }));
      setParsedData(updatedParsedData);
      setStep('review');
    };

    const totalUnmatched = Object.keys(unmatchedIngredients).length;
    const totalMapped = Object.keys(manualMappings).length;
    const mappingProgress = totalUnmatched > 0 ? Math.round((totalMapped / totalUnmatched) * 100) : 100;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Product Mapping - Handmatige Koppeling
          </h3>
          <p className="text-gray-600">
            Koppel elk product handmatig aan een ingrediënt uit de database. 
            De originele macro waarden blijven behouden.
          </p>
          
          <div className="mt-4 bg-blue-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Mapping Progress</span>
              <span className="text-sm font-medium text-blue-600">{mappingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mappingProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{totalMapped} van {totalUnmatched} ingrediënten gekoppeld</span>
              <span>{totalUnmatched - totalMapped} nog te koppelen</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoadingIngredients ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Ingrediënten worden geladen...</p>
              <p className="text-xs text-gray-400 mt-1">Een moment geduld, dit gebeurt maar één keer</p>
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  📊 Database ingrediënten worden opgehaald voor mapping...
                </p>
              </div>
            </div>
          ) : (
            Object.entries(unmatchedIngredients).map(([ingredientName, ingredient]) => (
              <div key={ingredientName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{ingredientName}</h4>
                    <p className="text-sm text-gray-500">
                      {ingredient.quantity} {ingredient.unit}
                    </p>
                    {ingredient.originalText && (
                      <p className="text-xs text-gray-400 mt-1">
                        Origineel: {ingredient.originalText}
                      </p>
                    )}
                    <div className="flex gap-4 text-xs text-gray-600 mt-1">
                      <span>🔥 {ingredient.calories || 0} kcal</span>
                      <span>🥩 {ingredient.protein || 0}g eiwit</span>
                      <span>🌾 {ingredient.carbs || 0}g koolhydraten</span>
                      <span>🥑 {ingredient.fat || 0}g vet</span>
                    </div>
                  </div>
                  <SearchableSelect
                    value={manualMappings[ingredientName] || ''}
                    onChange={(value) => handleMappingChange(ingredientName, value)}
                    options={memoizedAvailableIngredients}
                    placeholder="Selecteer ingrediënt..."
                    className="w-64"
                  />
                </div>
                
                {manualMappings[ingredientName] && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    ✅ Gekoppeld aan: {memoizedAvailableIngredients.find(ing => ing.id === manualMappings[ingredientName])?.name}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <button
            onClick={() => setStep('input')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Terug naar invoer
          </button>
          <div className="space-x-3">
            <button
              onClick={() => setStep('review')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Overslaan
            </button>
            <button
              onClick={proceedToReview}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Doorgaan naar overzicht
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    if (!parsedData) return null;

    // Show loading state if ingredients are still loading
    if (isLoadingIngredients) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Database ingrediënten worden geladen...</p>
          <p className="text-xs text-gray-400 mt-1">Een moment geduld</p>
        </div>
      );
    }

    // Calculate detailed statistics
    const totalDays = parsedData.length;
    const totalMeals = parsedData.reduce((sum, day) => sum + day.meals.length, 0);
    const totalIngredients = parsedData.reduce((sum, day) =>
      sum + day.meals.reduce((mealSum, meal) => mealSum + meal.ingredients.length, 0), 0
    );
    const matchedIngredients = parsedData.reduce((sum, day) =>
      sum + day.meals.reduce((mealSum, meal) =>
        mealSum + meal.ingredients.filter(ing => ing.matched).length, 0), 0
    );
    const matchRate = totalIngredients > 0 ? Math.round((matchedIngredients / totalIngredients) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Product Mapping Overzicht
          </h3>
          <p className="text-gray-600 mb-4">
            Controleer de geparste gegevens voordat je ze toevoegt aan het plan.
          </p>
          
          {/* Import Button at the top */}
          <div className="mb-6">
            <button
              onClick={handleImportIngredients}
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <span className="mr-2">📥</span>
              Importeer Alle Ingrediënten
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{totalDays}</div>
            <div className="text-sm text-gray-600">Dagen</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{totalMeals}</div>
            <div className="text-sm text-gray-600">Maaltijden</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{totalIngredients}</div>
            <div className="text-sm text-gray-600">Producten</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{matchRate}%</div>
            <div className="text-sm text-gray-600">Gekoppeld</div>
          </div>
        </div>

        {matchedIngredients < totalIngredients && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-yellow-800">⚠️ Niet gekoppelde producten:</h4>
              <button
                onClick={autoMatchIngredients}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
              >
                🔍 Auto-match
              </button>
            </div>
            <div className="text-sm text-yellow-700">
              {(() => {
                const unmatched = parsedData.reduce((acc, day) => {
                  day.meals.forEach(meal => {
                    meal.ingredients.forEach(ing => {
                      if (!ing.matched) {
                        acc.push(ing.name);
                      }
                    });
                  });
                  return acc;
                }, [] as string[]);

                const uniqueUnmatched = [...new Set(unmatched)];
                return uniqueUnmatched.slice(0, 10).join(', ') +
                  (uniqueUnmatched.length > 10 ? ` en ${uniqueUnmatched.length - 10} meer...` : '');
              })()}
            </div>
          </div>
        )}

        {/* Detailed breakdown */}
        <div className="space-y-6">
          {parsedData.map((day, dayIndex) => (
            <div key={dayIndex} className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                {day.dayName} - {day.meals.length} maaltijden
              </h4>
              <div className="text-sm text-gray-600 mb-4">
                Totaal: {day.totalCalories} kcal | {day.totalProtein}g eiwit | {day.totalCarbs}g koolhydraten | {day.totalFat}g vet
              </div>
              
              <div className="space-y-4">
                {day.meals.map((meal, mealIndex) => (
                  <div key={mealIndex} className="border border-gray-100 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-3">
                      {meal.name} - {meal.ingredients.length} producten
                    </h5>
                    <div className="text-sm text-gray-600 mb-3">
                      {meal.totalCalories} kcal | {meal.totalProtein}g eiwit | {meal.totalCarbs}g koolhydraten | {meal.totalFat}g vet
                    </div>
                    
                    {/* Ingredients table */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                            <th className="text-left p-3 font-semibold">Product</th>
                            <th className="text-right p-3 font-semibold">Hoeveelheid</th>
                            <th className="text-right p-3 font-semibold">Kcal</th>
                            <th className="text-right p-3 font-semibold">Eiwit</th>
                            <th className="text-right p-3 font-semibold">Koolhydraten</th>
                            <th className="text-right p-3 font-semibold">Vet</th>
                            <th className="text-center p-3 font-semibold">Database Ingrediënt</th>
                            <th className="text-center p-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {meal.ingredients.map((ingredient, ingIndex) => (
                            <tr key={ingIndex} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="p-3">
                                <div className="font-medium text-gray-800">
                                  {ingredient.name}
                                </div>
                                {ingredient.originalText && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {ingredient.originalText}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-right text-gray-600">
                                {ingredient.quantity} {ingredient.unit}
                              </td>
                              <td className="p-3 text-right font-medium text-green-600">
                                {ingredient.calories || '-'}
                              </td>
                              <td className="p-3 text-right font-medium text-blue-600">
                                {ingredient.protein ? `${ingredient.protein}g` : '-'}
                              </td>
                              <td className="p-3 text-right font-medium text-orange-600">
                                {ingredient.carbs ? `${ingredient.carbs}g` : '-'}
                              </td>
                              <td className="p-3 text-right font-medium text-purple-600">
                                {ingredient.fat ? `${ingredient.fat}g` : '-'}
                              </td>
                              <td className="p-3">
                                <div className="w-48">
                                  <SearchableSelect
                                    value={ingredient.dbIngredient?.id || ''}
                                    onChange={(value) => {
                                      const selectedIngredient = memoizedAvailableIngredients.find(ing => ing.id === value);
                                      if (selectedIngredient) {
                                        // Update the ingredient in the parsed data
                                        const updatedParsedData = parsedData.map(d => ({
                                          ...d,
                                          meals: d.meals.map(m => ({
                                            ...m,
                                            ingredients: m.ingredients.map(ing => 
                                              ing === ingredient 
                                                ? { ...ing, matched: true, dbIngredient: selectedIngredient }
                                                : ing
                                            )
                                          }))
                                        }));
                                        setParsedData(updatedParsedData);
                                      }
                                    }}
                                    options={memoizedAvailableIngredients}
                                    placeholder="Zoek ingrediënt..."
                                    className="text-xs"
                                    isLoading={isLoadingIngredients}
                                    onFocus={loadAvailableIngredients}
                                  />
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                {ingredient.matched ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    <FiCheck className="w-3 h-3 mr-1" />
                                    Gekoppeld
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                    <FiAlertCircle className="w-3 h-3 mr-1" />
                                    Niet gekoppeld
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <button
            onClick={() => setStep('input')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Terug naar invoer
          </button>
          <div className="space-x-3">
            <button
              onClick={handleImportIngredients}
              className="px-4 py-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
            >
              <span className="mr-2">📥</span>
              Importeer Ingrediënten
            </button>
            <button
              onClick={handleAssignToPlan}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Toevoegen aan plan
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAssigningStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600">Producten worden toegevoegd aan het plan...</p>
      <p className="text-sm text-gray-500 mt-2">Dit kan even duren</p>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiFileText className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800">Product Mapping</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {showDebug && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-sm font-bold text-red-800 mb-2">🐛 Debug Info ({debugInfo.length} entries)</h3>
              <div className="max-h-40 overflow-y-auto text-xs font-mono">
                {debugInfo.length === 0 ? (
                  <p className="text-red-600">No debug info yet...</p>
                ) : (
                  debugInfo.map((entry, index) => (
                    <div key={index} className="mb-1 text-red-700">
                      <span className="text-red-500">[{entry.timestamp}]</span> {entry.message}
                      {entry.data && (
                        <pre className="mt-1 text-red-600 whitespace-pre-wrap">{entry.data}</pre>
                      )}
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => setDebugInfo([])}
                className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear Debug
              </button>
            </div>
          )}
          
          {step === 'input' && renderInputStep()}
          {step === 'raw-view' && renderRawTextView()}
          {step === 'parsing' && renderParsingStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'review' && renderReviewStep()}
          {step === 'assigning' && renderAssigningStep()}
        </div>
      </div>
    </div>
  );
}

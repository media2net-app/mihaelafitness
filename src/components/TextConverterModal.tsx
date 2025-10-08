'use client';

import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { FiX, FiFileText, FiCheck, FiAlertCircle, FiSearch } from 'react-icons/fi';

interface TextConverterModalProps {
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

export default function TextConverterModal({ isOpen, onClose, onConvert, planId }: TextConverterModalProps) {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedDay[] | null>(null);
  const [step, setStep] = useState<'input' | 'parsing' | 'review' | 'mapping' | 'assigning'>('input');
  const [error, setError] = useState<string | null>(null);
  const [parsingProgress, setParsingProgress] = useState<string>('');
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [manualMappings, setManualMappings] = useState<{[key: string]: string}>({});
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);

  // Load ingredients when mapping step is reached
  const loadAvailableIngredients = useCallback(async () => {
    if (isLoadingIngredients) return;
    
    try {
      setIsLoadingIngredients(true);
      const response = await fetch('/api/ingredients');
      if (response.ok) {
        const data = await response.json();
        setAvailableIngredients(data.ingredients || []);
      } else {
        console.error('[TextConverter] Failed to load ingredients:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('[TextConverter] Failed to load ingredients:', error);
    } finally {
      setIsLoadingIngredients(false);
    }
  }, [isLoadingIngredients]);

  useEffect(() => {
    if (step === 'mapping' && availableIngredients.length === 0 && !isLoadingIngredients) {
      loadAvailableIngredients();
    }
  }, [step, availableIngredients.length, isLoadingIngredients]);

  // SearchableSelect component
  const SearchableSelect = ({ 
    value, 
    onChange, 
    options, 
    placeholder = "Zoek ingrediënt...",
    className = ""
  }: {
    value: string;
    onChange: (value: string) => void;
    options: any[];
    placeholder?: string;
    className?: string;
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
      setIsOpen(true);
      setSearchTerm('');
    };

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <div
          className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
        >
          <div className="flex items-center flex-1">
            {selectedOption ? (
              <span className="text-gray-900">{selectedOption.name} ({selectedOption.per})</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <FiSearch className="w-4 h-4 text-gray-400" />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                placeholder="Zoek ingrediënt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSelect(option)}
                  >
                    <div className="font-medium text-gray-900">{option.name}</div>
                    <div className="text-sm text-gray-500">{option.per}</div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500">
                  Geen ingrediënten gevonden
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleParseText = async () => {
    if (!text.trim()) {
      setError('Voer een voedingsplan tekst in');
      return;
    }

    setIsParsing(true);
    setError(null);
    setStep('parsing');
    setParsingProgress('Tekst wordt geanalyseerd...');

    try {
      // Simulate progress updates
      setTimeout(() => setParsingProgress('Dagen en maaltijden worden herkend...'), 500);
      setTimeout(() => setParsingProgress('Ingrediënten worden geëxtraheerd...'), 1000);
      setTimeout(() => setParsingProgress('Database matching wordt uitgevoerd...'), 1500);

      const response = await fetch('/api/nutrition-plans/parse-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          planId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse text');
      }

      const result = await response.json();
      setParsedData(result.parsedData);
      setParsingProgress('Parsing voltooid!');
      
      // Check if there are unmatched ingredients
      const hasUnmatchedIngredients = result.parsedData.some((day: ParsedDay) =>
        day.meals.some((meal: ParsedMeal) =>
          meal.ingredients.some((ingredient: ParsedIngredient) => !ingredient.matched)
        )
      );
      
      if (hasUnmatchedIngredients && result.statistics.unmatchedIngredients > 0) {
        // Load available ingredients for mapping
        await loadAvailableIngredients();
        setTimeout(() => setStep('mapping'), 500);
      } else {
        setTimeout(() => setStep('review'), 500);
      }
    } catch (err) {
      setError('Er ging iets mis bij het parsen van de tekst');
      setStep('input');
    } finally {
      setIsParsing(false);
      setParsingProgress('');
    }
  };

  const handleAssignToPlan = async () => {
    if (!parsedData) return;

    setStep('assigning');
    
    try {
      console.log('[Frontend] Sending parsed data to API:', parsedData);
      
      const response = await fetch(`/api/nutrition-plans/${planId}/assign-parsed-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsedData
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Frontend] API Error:', errorText);
        throw new Error('Failed to assign ingredients to plan');
      }

      const result = await response.json();
      console.log('[Frontend] API Response:', result);
      console.log('[Frontend] Statistics:', result.statistics);

      // Show success message
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
    onClose();
  };

  const renderInputStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plak hier je voedingsplan tekst:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Plak hier de volledige tekst van je voedingsplan..."
          className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <FiAlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Annuleren
        </button>
        <button
          onClick={handleParseText}
          disabled={!text.trim()}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Tekst Parsen
        </button>
      </div>
    </div>
  );

  const renderParsingStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600">{parsingProgress || 'Tekst wordt geanalyseerd...'}</p>
      <p className="text-sm text-gray-500 mt-2">Dit kan even duren afhankelijk van de grootte van je plan</p>
    </div>
  );

  const renderMappingStep = () => {
    if (!parsedData) return null;

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
              const selectedIngredient = availableIngredients.find(
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

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Handmatige Ingrediënt Mapping
          </h3>
          <p className="text-gray-600">
            Sommige ingrediënten konden niet automatisch worden gevonden. 
            Selecteer handmatig het juiste ingrediënt uit de database.
          </p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoadingIngredients ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Ingrediënten worden geladen...</p>
              <p className="text-xs text-gray-400 mt-1">Een moment geduld, dit gebeurt maar één keer</p>
            </div>
          ) : (
            Object.entries(unmatchedIngredients).map(([ingredientName, ingredient]) => (
            <div key={ingredientName} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{ingredientName}</h4>
                  <p className="text-sm text-gray-500">
                    {ingredient.quantity} {ingredient.unit}
                  </p>
                </div>
                <SearchableSelect
                  value={manualMappings[ingredientName] || ''}
                  onChange={(value) => handleMappingChange(ingredientName, value)}
                  options={availableIngredients}
                  placeholder="Selecteer ingrediënt..."
                  className="w-64"
                />
              </div>
              
              {manualMappings[ingredientName] && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✅ Gekoppeld aan: {availableIngredients.find(ing => ing.id === manualMappings[ingredientName])?.name}
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
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center gap-2 text-green-600">
          <FiCheck className="w-5 h-5" />
          <span className="font-medium">Tekst succesvol geparst!</span>
        </div>

        {/* Statistics Overview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">📊 Parsing Resultaten</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{totalDays}</div>
              <div className="text-sm text-gray-600">Dagen</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{totalMeals}</div>
              <div className="text-sm text-gray-600">Maaltijden</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{totalIngredients}</div>
              <div className="text-sm text-gray-600">Ingrediënten</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{matchRate}%</div>
              <div className="text-sm text-gray-600">Gematcht</div>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">{matchedIngredients}</span> van de <span className="font-medium">{totalIngredients}</span> ingrediënten zijn gevonden in de database.
          </div>

          {/* Show unmatched ingredients if any */}
          {matchedIngredients < totalIngredients && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Niet gevonden ingrediënten:</h4>
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
        </div>

        <div className="space-y-6">
          {parsedData.map((day, dayIndex) => (
            <div key={dayIndex} className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                {day.dayName} - {day.meals.length} maaltijden
              </h3>
              
              <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-600">Calorieën</div>
                  <div className="text-orange-600 font-semibold">{day.totalCalories}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-600">Eiwit</div>
                  <div className="text-blue-600 font-semibold">{day.totalProtein}g</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-600">Koolhydraten</div>
                  <div className="text-green-600 font-semibold">{day.totalCarbs}g</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-600">Vet</div>
                  <div className="text-purple-600 font-semibold">{day.totalFat}g</div>
                </div>
              </div>

              <div className="space-y-4">
                {day.meals.map((meal, mealIndex) => {
                  const matchedCount = meal.ingredients.filter(ing => ing.matched).length;
                  const totalCount = meal.ingredients.length;
                  
                  return (
                    <div key={mealIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700 capitalize">{meal.name.replace('-', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {totalCount} ingrediënten
                          </span>
                          {matchedCount < totalCount && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {totalCount - matchedCount} niet gevonden
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                        <div className="text-center">
                          <div className="text-orange-600 font-medium">{meal.totalCalories}</div>
                          <div className="text-gray-500">kcal</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-600 font-medium">{meal.totalProtein}g</div>
                          <div className="text-gray-500">eiwit</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-600 font-medium">{meal.totalCarbs}g</div>
                          <div className="text-gray-500">koolhydraten</div>
                        </div>
                        <div className="text-center">
                          <div className="text-purple-600 font-medium">{meal.totalFat}g</div>
                          <div className="text-gray-500">vet</div>
                        </div>
                      </div>

                      {/* Show ingredient matching status */}
                      <div className="text-xs text-gray-600 mb-3">
                        <span className="font-medium">{matchedCount}</span> van <span className="font-medium">{totalCount}</span> ingrediënten gevonden in database
                      </div>

                      {/* Ingredients table */}
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                              <th className="text-left p-3 font-semibold">Ingrediënt</th>
                              <th className="text-right p-3 font-semibold">Hoeveelheid</th>
                              <th className="text-right p-3 font-semibold">Kcal</th>
                              <th className="text-right p-3 font-semibold">Eiwit</th>
                              <th className="text-right p-3 font-semibold">Koolhydraten</th>
                              <th className="text-right p-3 font-semibold">Vet</th>
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
                                </td>
                                <td className="p-3 text-right text-gray-600">
                                  {ingredient.quantity} {ingredient.unit}
                                </td>
                                <td className="p-3 text-right font-medium text-orange-600">
                                  {ingredient.calories || '-'}
                                </td>
                                <td className="p-3 text-right font-medium text-blue-600">
                                  {ingredient.protein ? `${ingredient.protein}g` : '-'}
                                </td>
                                <td className="p-3 text-right font-medium text-green-600">
                                  {ingredient.carbs ? `${ingredient.carbs}g` : '-'}
                                </td>
                                <td className="p-3 text-right font-medium text-purple-600">
                                  {ingredient.fat ? `${ingredient.fat}g` : '-'}
                                </td>
                                <td className="p-3 text-center">
                                  {ingredient.matched ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                      <FiCheck className="w-3 h-3 mr-1" />
                                      Gevonden
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                      <FiAlertCircle className="w-3 h-3 mr-1" />
                                      Niet gevonden
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <FiAlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={() => setStep('input')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Terug
          </button>
          <button
            onClick={handleAssignToPlan}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Toevoegen aan Plan
          </button>
        </div>
      </div>
    );
  };

  const renderAssigningStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600">Ingrediënten worden toegevoegd...</p>
      <p className="text-sm text-gray-500 mt-2">Dit kan even duren</p>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiFileText className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-800">Text Converter</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'input' && renderInputStep()}
          {step === 'parsing' && renderParsingStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'review' && renderReviewStep()}
          {step === 'assigning' && renderAssigningStep()}
        </div>
      </div>
    </div>
  );
}

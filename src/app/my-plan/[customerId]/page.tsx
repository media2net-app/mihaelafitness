'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Apple, TrendingUp, User, Heart, ShoppingCart, Check, ChefHat } from 'lucide-react';
import IngredientBreakdown from '@/components/IngredientBreakdown';

interface NutritionPlan {
  id: string;
  name: string;
  goal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weekMenu: any;
  _ingredientTranslations?: { [key: string]: string };
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export default function MyPlanPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [activeDay, setActiveDay] = useState<string>('monday');
  const [activeView, setActiveView] = useState<'plan' | 'shopping'>('plan');
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, try to fetch as customerId (check for assignments)
        const response = await fetch(`/api/customer-nutrition-plans?customerId=${customerId}`);
        if (!response.ok) throw new Error('Failed to fetch nutrition plan');
        
        const assignments = await response.json();
        
        if (assignments.length > 0) {
          // Found assignment - treat as customerId
          const assignment = assignments[0];
          setCustomer(assignment.customer);

              // Fetch full nutrition plan details (including weekMenu with cookingInstructions)
              const planResponse = await fetch(`/api/nutrition-plans/${assignment.nutritionPlanId}`);
              if (!planResponse.ok) throw new Error('Failed to fetch plan details');
              
              const planData = await planResponse.json();
              console.log('[MyPlan] Fetched plan data:', {
                id: planData.id,
                hasWeekMenu: !!planData.weekMenu,
                mondayBreakfast: typeof planData.weekMenu?.monday?.breakfast,
                hasCookingInstructions: typeof planData.weekMenu?.monday?.breakfast === 'object' && !!planData.weekMenu?.monday?.breakfast?.cookingInstructions
              });
              setNutritionPlan(planData);
        } else {
          // No assignment found - try to fetch as planId directly
          const planResponse = await fetch(`/api/nutrition-plans/${customerId}`);
          if (!planResponse.ok) {
            // Not a valid planId either
            setLoading(false);
            return;
          }
          
          const planData = await planResponse.json();
          setNutritionPlan(planData);
          
          // Optionally try to get customer info if plan is assigned
          const customerResponse = await fetch(`/api/nutrition-plans/${customerId}/customer`);
          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            if (customerData.customer) {
              setCustomer(customerData.customer);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  // Update document title and meta tags when plan is loaded
  useEffect(() => {
    if (nutritionPlan) {
      const title = customer 
        ? `${nutritionPlan.name} - ${customer.name} | Mihaela Fitness`
        : `${nutritionPlan.name} | Mihaela Fitness`;
      document.title = title;

      // Update Open Graph meta tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', title);

      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', 'Planul Tău Nutrițional Personalizat');

      // Update Twitter Card meta tags
      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitle) {
        twitterTitle = document.createElement('meta');
        twitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitle);
      }
      twitterTitle.setAttribute('content', title);

      let twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDescription) {
        twitterDescription = document.createElement('meta');
        twitterDescription.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDescription);
      }
      twitterDescription.setAttribute('content', 'Planul Tău Nutrițional Personalizat');
    }
  }, [nutritionPlan, customer]);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames: { [key: string]: string } = {
    monday: 'Luni',
    tuesday: 'Marți',
    wednesday: 'Miercuri',
    thursday: 'Joi',
    friday: 'Vineri',
    saturday: 'Sâmbătă',
    sunday: 'Duminică'
  };

  const mealNames: { [key: string]: string } = {
    'breakfast': 'Mic Dejun',
    'morning-snack': 'Gustare Dimineață',
    'lunch': 'Prânz',
    'afternoon-snack': 'Gustare După-Amiază',
    'dinner': 'Cină',
    'evening-snack': 'Gustare Seară'
  };

  // Unit translations to Romanian
  const translateUnit = (unit: string): string => {
    const unitTranslations: { [key: string]: string } = {
      'g': 'g',
      'gram': 'g',
      'grams': 'g',
      'kg': 'kg',
      'ml': 'ml',
      'l': 'l',
      'stuks': 'buc', // bucăți (pieces)
      'piece': 'buc',
      'pieces': 'buc',
      'stuk': 'buc',
      'slice': 'felie',
      'slices': 'felii',
      'tbsp': 'lgă', // lingură (tablespoon)
      'tablespoon': 'lingură',
      'tsp': 'lgţ', // linguriță (teaspoon)
      'teaspoon': 'linguriță',
      'cup': 'ceașcă',
      'cups': 'cești'
    };
    return unitTranslations[unit.toLowerCase()] || unit;
  };

  // Generate shopping list from all week's ingredients - with smart grouping
  const shoppingList = useMemo(() => {
    if (!nutritionPlan?.weekMenu) return [];

    const ingredientMap = new Map<string, { 
      quantity: number; 
      unit: string; 
      name: string; 
      ingredientId: string;
      isPiece: boolean;
      gramEquivalent?: number; // For piece-based items, track gram equivalent
    }>();
    const meals = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];

    days.forEach(day => {
      const dayData = nutritionPlan.weekMenu[day];
      if (!dayData) return;

      meals.forEach(meal => {
        const mealData = dayData[meal];
        if (!mealData) return;

        let mealDescription = '';
        if (typeof mealData === 'string') {
          mealDescription = mealData;
        } else if (mealData && typeof mealData === 'object') {
          // Handle JSON array format
          if (Array.isArray(mealData)) {
            // Convert JSON array to ingredient string format
            mealDescription = mealData.map((ing: any) => {
              const qty = ing.quantity || 0;
              const unit = ing.unit || 'g';
              const name = ing.name || '';
              return `${qty}${unit} ${name}`;
            }).join(', ');
          } else {
            mealDescription = mealData.description || mealData.ingredients || '';
          }
        }

        if (!mealDescription || mealDescription.trim() === '') return;

        // Check if this is a recipe format: [RECIPE:Recipe Name] ingredient1, ingredient2, ...
        let ingredientStrs: string[] = [];
        if (mealDescription.includes('[RECIPE:')) {
          // Extract recipe name and ingredients
          const recipeMatch = mealDescription.match(/\[RECIPE:[^\]]+\]\s*(.*)/);
          if (recipeMatch) {
            const recipeIngredients = recipeMatch[1];
            // Split ingredients from recipe
            ingredientStrs = recipeIngredients.split(',').map(s => s.trim()).filter(s => s.length > 0);
          }
        } else {
          // Regular format - parse ingredients from description
          ingredientStrs = mealDescription.split(',').map(s => s.trim());
        }
        
        ingredientStrs.forEach(ingredientStr => {
          // Handle recipe ingredient format: "55g Carne de Vită" or "190g Paste (fiert)" or "61 g Light Cream Sauce"
          // First try recipe format (quantity + optional space + unit + name)
          let match = ingredientStr.match(/^([\d.]+)\s*(g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms|piece|pieces|stuks|stuk|buc|bucăți)\s+(.+)$/i);
          
          if (!match) {
            // Fall back to ID format: "2 cmgbfewgp01b78igv3zsoydrf|1 Egg" or "100 cmgbf5jgf016v8igv5viv7qkz|Chicken Breast"
            match = ingredientStr.match(/^([\d.]+)\s+([a-z0-9]+)\|(.+)$/i);
          }
          
          if (!match) return;
          
          let quantity: number;
          let unit: string;
          let ingredientName: string;
          let ingredientId: string = '';
          
          if (ingredientStr.includes('|')) {
            // ID format: "100 ingredientId|Name"
            const [, quantityStr, id, name] = match;
            quantity = parseFloat(quantityStr);
            ingredientId = id;
            ingredientName = name;
          } else {
            // Recipe format: "55g Carne de Vită"
            const [, quantityStr, unitStr, name] = match;
            quantity = parseFloat(quantityStr);
            unit = unitStr.toLowerCase();
            ingredientName = name;
            
            // Normalize units
            if (unit === 'g' || unit === 'gram' || unit === 'grams') {
              unit = 'g';
            } else if (unit === 'ml' || unit === 'milliliter' || unit === 'milliliters') {
              unit = 'ml';
            } else if (unit === 'piece' || unit === 'pieces' || unit === 'stuks' || unit === 'stuk' || unit === 'buc' || unit === 'bucăți') {
              unit = 'stuks';
            } else if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') {
              unit = 'kg';
              quantity = quantity * 1000; // Convert to grams for consistency
              unit = 'g';
            }
          }

          // Clean the ingredient name - remove leading numbers and quantities
          let cleanName = ingredientName.split('|').pop()?.trim() || ingredientName;
          
          // Remove patterns like "1 ", "2 ", "1.5 " from the start of the name
          const baseCleanName = cleanName.replace(/^\d+(?:\.\d+)?\s+/, '').trim();
          
          // Determine if this is a piece-based ingredient
          const isPiece = unit === 'stuks' || unit === 'piece' || unit === 'pieces' || unit === 'stuk' || unit === 'buc' || unit === 'bucăți';
          
          // If no unit was determined (from ID format), default to 'g'
          if (!unit) {
            unit = 'g';
          }
          
          // Create a smart grouping key based on base name
          const baseKey = baseCleanName.toLowerCase().trim();
          
          // Find if we already have this ingredient (by base name)
          let existingKey: string | null = null;
          for (const [key, value] of ingredientMap.entries()) {
            const existingBaseName = value.name.replace(/^\d+(?:\.\d+)?\s+/, '').toLowerCase().trim();
            if (existingBaseName === baseKey) {
              existingKey = key;
              break;
            }
          }

          if (existingKey) {
            const existing = ingredientMap.get(existingKey)!;
            
            // Smart aggregation: if mixing pieces and grams, convert to grams
            if (isPiece && !existing.isPiece) {
              // Adding pieces to grams - convert pieces to grams (rough estimate: 1 piece ≈ 100g for fruits/veg)
              const gramsPerPiece = 100;
              existing.quantity += quantity * gramsPerPiece;
              existing.unit = 'g';
              existing.isPiece = false;
            } else if (!isPiece && existing.isPiece) {
              // Adding grams to pieces - convert existing pieces to grams first
              const gramsPerPiece = 100;
              existing.quantity = (existing.quantity * gramsPerPiece) + quantity;
              existing.unit = 'g';
              existing.isPiece = false;
            } else {
              // Same unit type, just add (ensure units match)
              if (existing.unit === unit) {
                existing.quantity += quantity;
              } else {
                // Different units but same type - try to convert
                if ((existing.unit === 'g' && unit === 'ml') || (existing.unit === 'ml' && unit === 'g')) {
                  // For most liquids, 1ml ≈ 1g
                  existing.quantity += quantity;
                  existing.unit = 'g';
                } else {
                  // Can't convert, keep as is but aggregate
                  existing.quantity += quantity;
                }
              }
            }
          } else {
            // New ingredient
            const key = ingredientId ? `${ingredientId}-${baseKey}` : `recipe-${baseKey}-${Date.now()}`;
            ingredientMap.set(key, { 
              quantity, 
              unit: isPiece ? 'stuks' : unit, 
              name: baseCleanName, 
              ingredientId: ingredientId || key,
              isPiece
            });
          }
        });
      });
    });

      // Convert map to sorted array
    return Array.from(ingredientMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [nutritionPlan, days]);

  // Common fallback translations for ingredients that might not exist in DB map
  const fallbackIngredientTranslations: Record<string, string> = useMemo(() => ({
    'beef': 'Carne de vită',
    'chicken breast': 'Piept de pui',
    'turkey breast': 'Piept de curcan',
    'pork': 'Carne de porc',
    'salmon': 'Somon',
    'tuna': 'Ton',
    'egg': 'Ou',
    'eggs': 'Ouă',
    'egg whites': 'Albuș de ou',
    'avocado': 'Avocado',
    'banana': 'Banană',
    'blueberries': 'Afine',
    'raspberries': 'Zmeură',
    'strawberries': 'Capsuni',
    'mango': 'Mango',
    'apple': 'Măr',
    'bell pepper': 'Ardei gras',
    'broccoli': 'Broccoli',
    'carrot': 'Morcov',
    'cucumber': 'Castravete',
    'zucchini': 'Dovlecel',
    'tomato': 'Roșie',
    'spinach': 'Spanac',
    'green beans': 'Fasole verde',
    'sweet potato': 'Cartof dulce',
    'brown rice (cooked)': 'Orez brun (gătit)',
    'brown rice': 'Orez brun',
    'rice cake': 'Cracker de orez',
    'greek yogurt': 'Iaurt grecesc',
    'cottage cheese': 'Brânză cottage',
    'cheddar cheese': 'Cașcaval Cheddar',
    'feta cheese': 'Brânză feta',
    'almonds': 'Migdale',
    'walnuts': 'Nuci',
    'peanut butter': 'Unt de arahide',
    'olive oil': 'Ulei de măsline',
    'baking powder': 'Praf de copt',
    'protein powder': 'Pudră proteică',
    'whole wheat bread': 'Pâine integrală',
    'wrap whole wheat (60 grame)': 'Lipit integral (60 g)',
    'couscous': 'Cuscus',
    'bulgur (cooked)': 'Bulgur (gătit)',
    'pasta (cooked)': 'Paste (gătite)',
    'wholemeal pasta': 'Paste integrale',
    'tagliatelle': 'Tagliatelle'
  }), []);

  // Get Romanian translations from the nutrition plan data (already loaded)
  const ingredientTranslationsMap = useMemo(() => {
    if (!nutritionPlan) {
      return {};
    }
    return nutritionPlan._ingredientTranslations || {};
  }, [nutritionPlan]);

  // Helper function to get Romanian ingredient name from translation map
  const getIngredientName = (englishName: string): string => {
    // Try exact match first
    const normalized = (value: string) => value?.toLowerCase().trim();

    let translation = ingredientTranslationsMap[englishName];
    if (translation) {
      return translation;
    }
    
    // Try with "1 " prefix (for items like "Egg" -> try "1 Egg")
    translation = ingredientTranslationsMap[`1 ${englishName}`];
    if (translation) {
      return translation;
    }
    
    // Try without number prefix (for items like "2 Egg" -> try "Egg")
    const withoutNumber = englishName.replace(/^\d+(?:\.\d+)?\s+/, '');
    if (withoutNumber !== englishName) {
      translation = ingredientTranslationsMap[withoutNumber];
      if (translation) {
        return translation;
      }
      // Also try "1 " prefix on the base name
      translation = ingredientTranslationsMap[`1 ${withoutNumber}`];
      if (translation) {
        return translation;
      }
    }

    const normalizedBase = normalized(withoutNumber || englishName);
    if (normalizedBase && fallbackIngredientTranslations[normalizedBase]) {
      return fallbackIngredientTranslations[normalizedBase];
    }

    // If no translation found, return original English name
    return englishName;
  };

  // Helper function to translate cooking instructions from English to Romanian
  const translateInstructions = (instructions: string): string => {
    if (!instructions || instructions.trim() === '') {
      return instructions;
    }

    // Try to detect if instructions are already in Romanian
    // Romanian has specific characters like ă, â, î, ș, ț
    const hasRomanianChars = /[ăâîșțĂÂÎȘȚ]/.test(instructions);
    
    // If already in Romanian, return as-is
    if (hasRomanianChars) {
      return instructions;
    }

    // Split instructions by newlines to handle multi-line instructions
    const normalizedText = instructions
      .replace(/\\n/g, '\n')
      .replace(/\\\\n/g, '\n');
    const instructionLines = normalizedText.split(/\n+/);
    
    // Common cooking instruction translations EN -> RO
    const translations: { [key: string]: string } = {
      'Cook': 'Gătește',
      'cook': 'gătește',
      'Cook until': 'Gătește până',
      'cook until': 'gătește până',
      'Heat': 'Încălzește',
      'heat': 'încălzește',
      'Heat up': 'Încălzește',
      'heat up': 'încălzește',
      'Mix': 'Amestecă',
      'mix': 'amestecă',
      'Mix well': 'Amestecă bine',
      'mix well': 'amestecă bine',
      'Stir': 'Amestecă',
      'stir': 'amestecă',
      'Stir well': 'Amestecă bine',
      'stir well': 'amestecă bine',
      'Add': 'Adaugă',
      'add': 'adaugă',
      'Add to': 'Adaugă la',
      'add to': 'adaugă la',
      'Season': 'Condimentează',
      'season': 'condimentează',
      'Season with': 'Condimentează cu',
      'season with': 'condimentează cu',
      'Serve': 'Serveste',
      'serve': 'serveste',
      'Serve with': 'Serveste cu',
      'serve with': 'serveste cu',
      'Bake': 'Coace',
      'bake': 'coace',
      'Bake for': 'Coace timp de',
      'bake for': 'coace timp de',
      'Fry': 'Prăjește',
      'fry': 'prăjește',
      'Fry until': 'Prăjește până',
      'fry until': 'prăjește până',
      'Boil': 'Fierbe',
      'boil': 'fierbe',
      'Boil for': 'Fierbe timp de',
      'boil for': 'fierbe timp de',
      'Simmer': 'Fierbe la foc mic',
      'simmer': 'fierbe la foc mic',
      'Simmer for': 'Fierbe la foc mic timp de',
      'simmer for': 'fierbe la foc mic timp de',
      'Grill': 'Grătar',
      'grill': 'grătar',
      'Grill for': 'Grătar timp de',
      'grill for': 'grătar timp de',
      'Roast': 'Coace',
      'roast': 'coace',
      'Roast for': 'Coace timp de',
      'roast for': 'coace timp de',
      'Steam': 'Abur',
      'steam': 'abur',
      'Steam for': 'Abur timp de',
      'steam for': 'abur timp de',
      'Chop': 'Taie',
      'chop': 'taie',
      'Chop finely': 'Taie mărunt',
      'chop finely': 'taie mărunt',
      'Dice': 'Taie cuburi',
      'dice': 'taie cuburi',
      'Slice': 'Taie felii',
      'slice': 'taie felii',
      'Cut': 'Taie',
      'cut': 'taie',
      'Cut into': 'Taie în',
      'cut into': 'taie în',
      'Peel': 'Cojește',
      'peel': 'cojește',
      'Grate': 'Raze',
      'grate': 'raze',
      'Mash': 'Pisează',
      'mash': 'pisează',
      'Whisk': 'Bată',
      'whisk': 'bată',
      'Beat': 'Bată',
      'beat': 'bată',
      'Blend': 'Mixează',
      'blend': 'mixează',
      'Blend until': 'Mixează până',
      'blend until': 'mixează până',
      'Marinate': 'Marinează',
      'marinate': 'marinează',
      'Marinate for': 'Marinează timp de',
      'marinate for': 'marinează timp de',
      'Preheat': 'Preîncălzește',
      'preheat': 'preîncălzește',
      'Preheat oven': 'Preîncălzește cuptorul',
      'preheat oven': 'preîncălzește cuptorul',
      'Preheat the oven': 'Preîncălzește cuptorul',
      'preheat the oven': 'preîncălzește cuptorul',
      'Remove': 'Scoate',
      'remove': 'scoate',
      'Remove from': 'Scoate din',
      'remove from': 'scoate din',
      'Place': 'Pune',
      'place': 'pune',
      'Place in': 'Pune în',
      'place in': 'pune în',
      'Cover': 'Acoperă',
      'cover': 'acoperă',
      'Cover with': 'Acoperă cu',
      'cover with': 'acoperă cu',
      'Let rest': 'Lasă să se odihnească',
      'let rest': 'lasă să se odihnească',
      'Let it rest': 'Lasă să se odihnească',
      'let it rest': 'lasă să se odihnească',
      'Rest for': 'Lasă să se odihnească timp de',
      'rest for': 'lasă să se odihnească timp de',
      'Set aside': 'Pune deoparte',
      'set aside': 'pune deoparte',
      'Set aside for': 'Pune deoparte timp de',
      'set aside for': 'pune deoparte timp de',
      'Until golden': 'Până devine auriu',
      'until golden': 'până devine auriu',
      'Until golden brown': 'Până devine auriu',
      'until golden brown': 'până devine auriu',
      'Until tender': 'Până devine moale',
      'until tender': 'până devine moale',
      'Until cooked': 'Până este gata',
      'until cooked': 'până este gata',
      'Until done': 'Până este gata',
      'until done': 'până este gata',
      'For about': 'Timp de aproximativ',
      'for about': 'timp de aproximativ',
      'For': 'Timp de',
      'for': 'timp de',
      'Minutes': 'minute',
      'minutes': 'minute',
      'Minute': 'minut',
      'minute': 'minut',
      'Hour': 'oră',
      'hour': 'oră',
      'Hours': 'ore',
      'hours': 'ore',
      'With': 'Cu',
      'with': 'cu',
      'And': 'Și',
      'and': 'și',
      'Or': 'Sau',
      'or': 'sau',
      'Then': 'Apoi',
      'then': 'apoi',
      'After': 'După',
      'after': 'după',
      'Before': 'Înainte',
      'before': 'înainte',
      'While': 'În timp ce',
      'while': 'în timp ce',
      'During': 'În timpul',
      'during': 'în timpul',
      'Over': 'Peste',
      'over': 'peste',
      'Under': 'Sub',
      'under': 'sub',
      'On': 'Pe',
      'on': 'pe',
      'In': 'În',
      'in': 'în',
      'At': 'La',
      'at': 'la',
      'To': 'La',
      'to': 'la',
      'Of': 'De',
      'of': 'de',
      'The': 'În',
      'the': 'în',
      'A': 'Un',
      'a': 'un',
      'An': 'O',
      'an': 'o',
      'Medium heat': 'Foc mediu',
      'medium heat': 'foc mediu',
      'Low heat': 'Foc mic',
      'low heat': 'foc mic',
      'High heat': 'Foc mare',
      'high heat': 'foc mare',
      'Medium-high heat': 'Foc mediu-mare',
      'medium-high heat': 'foc mediu-mare',
      'Low-medium heat': 'Foc mic-mediu',
      'low-medium heat': 'foc mic-mediu',
      'Oven': 'Cuptor',
      'oven': 'cuptor',
      'The oven': 'Cuptorul',
      'the oven': 'cuptorul',
      'Pan': 'Tigaie',
      'pan': 'tigaie',
      'The pan': 'Tigaia',
      'the pan': 'tigaia',
      'Pot': 'Oală',
      'pot': 'oală',
      'The pot': 'Oala',
      'the pot': 'oala',
      'Skillet': 'Tigaie',
      'skillet': 'tigaie',
      'The skillet': 'Tigaia',
      'the skillet': 'tigaia',
      'Bowl': 'Bol',
      'bowl': 'bol',
      'The bowl': 'Bolul',
      'the bowl': 'bolul',
      'Plate': 'Farfurie',
      'plate': 'farfurie',
      'The plate': 'Farfuria',
      'the plate': 'farfuria',
      'Salt': 'Sare',
      'salt': 'sare',
      'Pepper': 'Piper',
      'pepper': 'piper',
      'Olive oil': 'Ulei de măsline',
      'olive oil': 'ulei de măsline',
      'Vegetable oil': 'Ulei vegetal',
      'vegetable oil': 'ulei vegetal',
      'Butter': 'Unt',
      'butter': 'unt',
      'Garlic': 'Usturoi',
      'garlic': 'usturoi',
      'Onion': 'Ceapă',
      'onion': 'ceapă',
      'Water': 'Apă',
      'water': 'apă',
      'Hot water': 'Apă fierbinte',
      'hot water': 'apă fierbinte',
      'Cold water': 'Apă rece',
      'cold water': 'apă rece',
      'Room temperature': 'Temperatură cameră',
      'room temperature': 'temperatură cameră',
      'At room temperature': 'La temperatură cameră',
      'at room temperature': 'la temperatură cameră',
      'Degrees': 'grade',
      'degrees': 'grade',
      'Degree': 'grad',
      'degree': 'grad',
      'Celsius': 'Celsius',
      'celsius': 'celsius',
      'Fahrenheit': 'Fahrenheit',
      'fahrenheit': 'fahrenheit',
      'C': 'C',
      'F': 'F',
      'Until': 'Până',
      'until': 'până',
      'Sauté': 'Prăjește',
      'sauté': 'prăjește',
      'Sauté until': 'Prăjește până',
      'sauté until': 'prăjește până',
      'Warm': 'Încălzește',
      'warm': 'încălzește',
      'Warm the': 'Încălzește',
      'warm the': 'încălzește',
      'Spread': 'Întinde',
      'spread': 'întinde',
      'Spread on': 'Întinde pe',
      'spread on': 'întinde pe',
      'Roll': 'Rulare',
      'roll': 'rulare',
      'Roll tightly': 'Rulare strâns',
      'roll tightly': 'rulare strâns',
      'Tightly': 'Strâns',
      'tightly': 'strâns',
      'Tender': 'Moale',
      'tender': 'moale',
      'Lean': 'Slab',
      'lean': 'slab',
      'Lean beef': 'Carne de vită slabă',
      'lean beef': 'carne de vită slabă',
      'Bell pepper': 'Ardei gras',
      'bell pepper': 'ardei gras',
      'Bell peppers': 'Ardei grași',
      'bell peppers': 'ardei grași',
      'Mushrooms': 'Ciuperci',
      'mushrooms': 'ciuperci',
      'Mushroom': 'Ciupercă',
      'mushroom': 'ciupercă',
      'Tomatoes': 'Roșii',
      'tomatoes': 'roșii',
      'Tomato': 'Roșie',
      'tomato': 'roșie',
      'Whole wheat wrap': 'Înveliș integral',
      'whole wheat wrap': 'înveliș integral',
      'Whole wheat': 'Integral',
      'whole wheat': 'integral',
      'Wrap': 'Înveliș',
      'wrap': 'înveliș',
      'Mashed avocado': 'Avocado piure',
      'mashed avocado': 'avocado piure',
      'Mashed': 'Piure',
      'mashed': 'piure',
      'Avocado': 'Avocado',
      'avocado': 'avocado',
      'Shredded': 'Ras',
      'shredded': 'ras',
      'Shredded cheddar cheese': 'Brânză cheddar rasă',
      'shredded cheddar cheese': 'brânză cheddar rasă',
      'Cheddar cheese': 'Brânză cheddar',
      'cheddar cheese': 'brânză cheddar',
      'Mixed greens': 'Salată mixtă',
      'mixed greens': 'salată mixtă',
      'Mixed': 'Mixt',
      'mixed': 'mixt',
      'Greens': 'Salată',
      'greens': 'salată',
      'Herbs': 'Ierburi',
      'herbs': 'ierburi',
      'Herb': 'Iarbă',
      'herb': 'iarbă',
      'Seasoned': 'Condimentat',
      'seasoned': 'condimentat',
      'Seasoned with': 'Condimentat cu',
      'seasoned with': 'condimentat cu',
      'Seconds': 'Secunde',
      'seconds': 'secunde',
      'Second': 'Secundă',
      'second': 'secundă',
      '30 seconds': '30 de secunde',
      '30 Seconds': '30 de secunde',
      '30 Second': '30 de secunde',
      '30 second': '30 de secunde',
    };

    // Translate each line
    const translatedLines = instructionLines.map(line => {
      let translated = line;
      
      // Remove quantities first
          translated = translated
            .replace(/\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms|piece|pieces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|scoop|scoops)?\s*/gi, '')
            .trim();

      // Apply translations (longer phrases first to avoid partial matches)
      const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
      sortedKeys.forEach(english => {
        const romanian = translations[english];
        const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        translated = translated.replace(regex, romanian);
      });

      return translated;
    });

    return translatedLines.join('\n').replace(/\n+/g, '\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Se încarcă planul tău nutrițional...</p>
        </div>
      </div>
    );
  }

  if (!nutritionPlan || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <Apple className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Plan Negăsit</h2>
          <p className="text-gray-600">Încă nu ai un plan nutrițional asignat. Te rog contactează antrenorul tău.</p>
        </div>
      </div>
    );
  }

  const weekMenu = nutritionPlan?.weekMenu || {};
  const dayData = weekMenu[activeDay] || {};
  const meals = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Mobile Layout: Logo + Name on top, subtitle below */}
          <div className="sm:hidden">
                  {/* Top row: Logo and Customer name */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <img src="/logo-mihaela.svg" alt="Mihaela Fitness" className="h-12 w-auto" />
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-sm">{customer.name}</span>
                    </div>
                  </div>
            {/* Bottom row: Subtitle */}
            <p className="text-sm text-rose-100">Planul Tău Nutrițional Personalizat</p>
          </div>

          {/* Desktop Layout: Original horizontal layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-mihaela.svg" alt="Mihaela Fitness" className="h-10 w-auto" />
              <div>
                <p className="text-sm text-rose-100">Planul Tău Nutrițional Personalizat</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <User className="w-5 h-5" />
              <span className="font-medium">{customer.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Apple className="w-6 h-6 text-rose-500" />
            {nutritionPlan.name}
          </h2>
          
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            <span className="text-gray-600 font-medium">{nutritionPlan.goal}</span>
          </div>

          {/* Macro Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Calorii</p>
              <p className="text-3xl font-bold">{nutritionPlan.calories}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Proteine</p>
              <p className="text-3xl font-bold">{nutritionPlan.protein}g</p>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Carbohidrați</p>
              <p className="text-3xl font-bold">{nutritionPlan.carbs}g</p>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Grăsimi</p>
              <p className="text-3xl font-bold">{nutritionPlan.fat}g</p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('plan')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeView === 'plan'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Plan Săptămânal</span>
            </button>
            <button
              onClick={() => setActiveView('shopping')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeView === 'shopping'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Lista de Cumpărături</span>
            </button>
          </div>
        </div>

        {/* Day Selector - only show when on plan view */}
        {activeView === 'plan' && (
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 overflow-x-auto scrollbar-mobile">
            <div className="flex gap-2 min-w-max day-scroll-container">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeDay === day
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dayNames[day]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meal Plan View */}
        {activeView === 'plan' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-rose-500" />
              {dayNames[activeDay]} - Plan de Mese
            </h3>

          <div className="space-y-6">
            {meals.map((meal) => {
              const mealData = dayData[meal];
              let mealDescription = '';
              let cookingInstructions = '';

              // Handle both string format and object format with cookingInstructions
              if (typeof mealData === 'string') {
                mealDescription = mealData;
                // Check for instructions in separate instructions structure (old format from add-recipe API)
                const instructionsKey = `${activeDay}_instructions`;
                const dayInstructions = weekMenu?.[instructionsKey];
                if (dayInstructions && typeof dayInstructions === 'object' && dayInstructions[meal]) {
                  const rawInstructions = dayInstructions[meal] || '';
                  // Filter out placeholder values
                  cookingInstructions = rawInstructions && 
                                       rawInstructions.trim() !== '-' && 
                                       rawInstructions.trim().toLowerCase() !== 'n/a' &&
                                       rawInstructions.trim().toLowerCase() !== 'na' &&
                                       rawInstructions.trim() !== ''
                                       ? rawInstructions.trim() : '';
                } else {
                  cookingInstructions = '';
                }
              } else if (mealData && typeof mealData === 'object') {
                // New object format: { ingredients: string, cookingInstructions: string }
                mealDescription = mealData.ingredients || mealData.description || '';
                const rawInstructions = mealData.cookingInstructions || '';
                // Filter out placeholder values like "-", "n/a", empty strings
                cookingInstructions = rawInstructions && 
                                     rawInstructions.trim() !== '-' && 
                                     rawInstructions.trim().toLowerCase() !== 'n/a' &&
                                     rawInstructions.trim().toLowerCase() !== 'na' &&
                                     rawInstructions.trim() !== ''
                                     ? rawInstructions.trim() : '';
                
                // Debug: log if we have cooking instructions
                if (cookingInstructions) {
                  console.log(`[MyPlan] Found cooking instructions for ${meal}:`, cookingInstructions.substring(0, 50) + '...');
                } else if (rawInstructions) {
                  console.log(`[MyPlan] Skipping placeholder cooking instructions for ${meal}: "${rawInstructions}"`);
                }
              } else if (mealData === null || mealData === undefined) {
                // Empty meal
                return null;
              }

              if (!mealDescription || mealDescription.trim() === '') {
                return null;
              }

              const mealTitle = mealNames[meal] || meal;

              return (
                <div key={`${activeDay}-${meal}`} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3">
                    <h4 className="font-bold text-white">{mealTitle}</h4>
                  </div>
                  
                  <div className="p-4">
                    <IngredientBreakdown
                      mealDescription={mealDescription}
                      mealType={mealTitle}
                      planId={nutritionPlan?.id}
                      dayKey={activeDay}
                      mealTypeKey={meal}
                      editable={false}
                      ingredientTranslations={ingredientTranslationsMap}
                    />
                    {cookingInstructions && cookingInstructions.trim() && (
                      <div className="mt-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <ChefHat className="w-5 h-5 text-orange-600" />
                          <div className="text-sm font-bold text-orange-800">Instrucțiuni de gătit - {mealTitle}</div>
                        </div>
                        <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed bg-white rounded p-3 border border-orange-100">
                          {translateInstructions(cookingInstructions)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {Object.keys(dayData).length === 0 && (
            <div className="text-center py-12">
              <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nu există mese planificate pentru această zi încă.</p>
            </div>
          )}
          </div>
        )}

        {/* Shopping List View */}
        {activeView === 'shopping' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-rose-500" />
              Lista de Cumpărături - Săptămână Completă
            </h3>

            {shoppingList.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nu există ingrediente în plan.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {shoppingList.map((item, index) => {
                  const translatedName = getIngredientName(item.name);
                  const translatedUnit = translateUnit(item.unit);
                  const itemKey = `${translatedName}-${translatedUnit}`;
                  const isChecked = checkedItems[itemKey] || false;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <button
                        onClick={() => setCheckedItems(prev => ({ ...prev, [itemKey]: !isChecked }))}
                        className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-rose-500'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1">
                        <span className={`font-medium ${isChecked ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                          {translatedName}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`font-semibold ${isChecked ? 'text-gray-400' : 'text-rose-600'}`}>
                          {Math.round(item.quantity)} {translatedUnit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary - Sticky on mobile */}
            {shoppingList.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border-2 border-rose-200 sticky bottom-0 left-0 right-0 z-10 shadow-lg backdrop-blur-sm bg-opacity-95">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Progres:</span>
                  <span className="text-lg font-bold text-rose-600">
                    {Object.values(checkedItems).filter(Boolean).length} / {shoppingList.length}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(Object.values(checkedItems).filter(Boolean).length / shoppingList.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Message */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl shadow-xl p-6 mt-6 text-white text-center">
          <Heart className="w-12 h-12 mx-auto mb-3 animate-pulse" />
          <p className="text-lg font-medium mb-2">Rămâi dedicată obiectivelor tale!</p>
          <p className="text-rose-100">Urmează planul tău personalizat și privește transformarea.</p>
        </div>
      </div>
    </div>
  );
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { recipeId, dayKey, mealType } = body;

    console.log('[add-recipe] Request received:', {
      planId: id,
      recipeId,
      dayKey,
      mealType,
      bodyKeys: Object.keys(body)
    });

    if (!recipeId || !dayKey || !mealType) {
      console.error('[add-recipe] Missing required fields:', { recipeId: !!recipeId, dayKey: !!dayKey, mealType: !!mealType });
      return NextResponse.json(
        { error: 'Missing required fields: recipeId, dayKey, mealType' },
        { status: 400 }
      );
    }

    // Get the recipe with its ingredients
    // Use select to avoid issues with non-existent columns like mealType
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: {
        id: true,
        name: true,
        description: true,
        prepTime: true,
        servings: true,
        instructions: true,
        totalCalories: true,
        totalProtein: true,
        totalCarbs: true,
        totalFat: true,
        labels: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        ingredients: {
          select: {
            id: true,
            recipeId: true,
            name: true,
            quantity: true,
            unit: true,
            exists: true,
            availableInApi: true,
            apiMatch: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
        // Note: mealType is excluded as it might not exist in the database
      }
    });

    console.log('[add-recipe] Recipe loaded:', {
      recipeId,
      recipeName: recipe?.name,
      ingredientsCount: recipe?.ingredients?.length || 0,
      hasIngredients: !!recipe?.ingredients && recipe.ingredients.length > 0
    });

    if (!recipe) {
      console.error('[add-recipe] Recipe not found:', recipeId);
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      console.warn('[add-recipe] Recipe has no ingredients:', recipeId);
      return NextResponse.json(
        { error: 'Recipe has no ingredients' },
        { status: 400 }
      );
    }

    // Get all ingredients from database for matching
    const dbIngredients = await prisma.ingredient.findMany({
      where: {
        calories: { gt: 0 }
      }
    });

    // Create ingredient map for quick lookup
    const ingredientMap = new Map();
    dbIngredients.forEach(ing => {
      ingredientMap.set(ing.name.toLowerCase(), ing);
    });

    // Get the current nutrition plan
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Nutrition plan not found' },
        { status: 404 }
      );
    }

    // Parse current week menu
    const weekMenu = plan.weekMenu as any || {};
    const dayMenu = weekMenu[dayKey] || {};
    
    // Handle both string and object format for meal data
    const mealData: any = dayMenu[mealType];
    const isObjectMeal = mealData && typeof mealData === 'object' && ('ingredients' in mealData);
    const currentMealString = typeof mealData === 'string' ? mealData : (isObjectMeal ? (mealData.ingredients || '') : '');

    // Create recipe group identifier
    const recipeGroupId = `recipe_${recipeId}_${Date.now()}`;
    
    // Helper function to clean ingredient name for matching
    const cleanIngredientName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/^\d+(\.\d+)?\s*/, '') // Remove leading numbers
        .replace(/\s*(g|gram|grams|ml|milliliter|milliliters|piece|pieces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|scoop|scoops)\s*$/i, '') // Remove trailing units
        .trim();
    };

    // Match recipe ingredients with database ingredients and format properly
    const matchedIngredients: string[] = [];
    recipe.ingredients.forEach(ing => {
      // Clean the recipe ingredient name for matching
      const cleanedName = cleanIngredientName(ing.name);
      
      // Try to find matching ingredient in database
      let matchedIng = ingredientMap.get(cleanedName);
      
      if (!matchedIng) {
        // Try partial match - search through all ingredients
        // But prefer exact matches and avoid partial word matches (e.g., "Egg" should not match "Eggplant")
        const candidates = Array.from(ingredientMap.values()).filter((dbIng: any) => {
          const dbCleaned = cleanIngredientName(dbIng.name);
          return dbCleaned === cleanedName ||
                 dbCleaned.includes(cleanedName) ||
                 cleanedName.includes(dbCleaned) ||
                 // Handle plural/singular
                 (cleanedName + 's') === dbCleaned ||
                 (dbCleaned + 's') === cleanedName;
        });
        
        // Sort candidates to prefer exact matches and avoid partial matches
        if (candidates.length > 0) {
          candidates.sort((a: any, b: any) => {
            const aCleaned = cleanIngredientName(a.name);
            const bCleaned = cleanIngredientName(b.name);
            
            // Exact match first
            if (aCleaned === cleanedName && bCleaned !== cleanedName) return -1;
            if (bCleaned === cleanedName && aCleaned !== cleanedName) return 1;
            
            // Word boundary match (starts with cleanedName + space or exact match)
            const aWordBoundary = aCleaned === cleanedName || aCleaned.startsWith(cleanedName + ' ');
            const bWordBoundary = bCleaned === cleanedName || bCleaned.startsWith(cleanedName + ' ');
            if (aWordBoundary && !bWordBoundary) return -1;
            if (!aWordBoundary && bWordBoundary) return 1;
            
            // Avoid partial matches (e.g., "Egg" should not prefer "Eggplant")
            const aIsPartial = aCleaned.includes(cleanedName) && aCleaned !== cleanedName && !aCleaned.startsWith(cleanedName + ' ');
            const bIsPartial = bCleaned.includes(cleanedName) && bCleaned !== cleanedName && !bCleaned.startsWith(cleanedName + ' ');
            if (!aIsPartial && bIsPartial) return -1;
            if (aIsPartial && !bIsPartial) return 1;
            
            return 0;
          });
          
          matchedIng = candidates[0];
        }
      }

      if (matchedIng) {
        // Use database ingredient with proper format: quantity unit name
        const quantity = ing.quantity || 1;
        // Use recipe unit if specified, otherwise use database 'per' unit, otherwise 'g'
        const unit = ing.unit || matchedIng.per || 'g';
        matchedIngredients.push(`${quantity}${unit} ${matchedIng.name}`);
      } else {
        // Fallback to recipe ingredient format (clean the name first)
        const quantity = ing.quantity || 1;
        const unit = ing.unit || 'g';
        // Remove leading numbers from name if present
        const cleanName = ing.name.replace(/^\d+(\.\d+)?\s*/, '').trim();
        matchedIngredients.push(`${quantity}${unit} ${cleanName}`);
      }
    });

    // Create the recipe group string with special formatting
    const recipeGroupString = `[RECIPE:${recipe.name}] ${matchedIngredients.join(', ')}`;

    // Parse recipe instructions (they are stored as JSON string)
    let recipeInstructions: string[] = [];
    if (recipe.instructions) {
      try {
        recipeInstructions = typeof recipe.instructions === 'string' 
          ? JSON.parse(recipe.instructions) 
          : recipe.instructions;
      } catch (e) {
        console.error('Error parsing recipe instructions:', e);
        recipeInstructions = [];
      }
    }

    // Helper function to translate cooking instructions from English to Romanian
    const translateInstructionsToRomanian = (instructions: string[]): string[] => {
      // Check if instructions are already in Romanian (contain Romanian-specific characters)
      const hasRomanianChars = instructions.some(inst => /[ăâîșțĂÂÎȘȚ]/.test(inst));
      if (hasRomanianChars) {
        return instructions; // Already in Romanian, return as-is
      }

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
        'Until it': 'Până când',
        'until it': 'până când',
        'Until they': 'Până când',
        'until they': 'până când',
        'Until the': 'Până când',
        'until the': 'până când',
        'Until you': 'Până când',
        'until you': 'până când',
        'Until we': 'Până când',
        'until we': 'până când',
        'Until I': 'Până când',
        'until i': 'până când',
        'Until a': 'Până când un',
        'until a': 'până când un',
        'Until an': 'Până când o',
        'until an': 'până când o',
        'Until this': 'Până când acest',
        'until this': 'până când acest',
        'Until that': 'Până când acel',
        'until that': 'până când acel',
        'Until these': 'Până când aceste',
        'until these': 'până când aceste',
        'Until those': 'Până când acele',
        'until those': 'până când acele',
        'Until all': 'Până când toate',
        'until all': 'până când toate',
        'Until both': 'Până când ambele',
        'until both': 'până când ambele',
        'Until each': 'Până când fiecare',
        'until each': 'până când fiecare',
        'Until every': 'Până când fiecare',
        'until every': 'până când fiecare',
        'Until some': 'Până când unele',
        'until some': 'până când unele',
        'Until any': 'Până când orice',
        'until any': 'până când orice',
        'Until no': 'Până când niciun',
        'until no': 'până când niciun',
        'Until none': 'Până când niciunul',
        'until none': 'până când niciunul',
        'Until one': 'Până când unul',
        'until one': 'până când unul',
        'Until two': 'Până când doi',
        'until two': 'până când doi',
        'Until three': 'Până când trei',
        'until three': 'până când trei',
        'Until four': 'Până când patru',
        'until four': 'până când patru',
        'Until five': 'Până când cinci',
        'until five': 'până când cinci',
        'Until six': 'Până când șase',
        'until six': 'până când șase',
        'Until seven': 'Până când șapte',
        'until seven': 'până când șapte',
        'Until eight': 'Până când opt',
        'until eight': 'până când opt',
        'Until nine': 'Până când nouă',
        'until nine': 'până când nouă',
        'Until ten': 'Până când zece',
        'until ten': 'până când zece',
        'Until eleven': 'Până când unsprezece',
        'until eleven': 'până când unsprezece',
        'Until twelve': 'Până când doisprezece',
        'until twelve': 'până când doisprezece',
        'Until thirteen': 'Până când treisprezece',
        'until thirteen': 'până când treisprezece',
        'Until fourteen': 'Până când paisprezece',
        'until fourteen': 'până când paisprezece',
        'Until fifteen': 'Până când cincisprezece',
        'until fifteen': 'până când cincisprezece',
        'Until sixteen': 'Până când șaisprezece',
        'until sixteen': 'până când șaisprezece',
        'Until seventeen': 'Până când șaptesprezece',
        'until seventeen': 'până când șaptesprezece',
        'Until eighteen': 'Până când optsprezece',
        'until eighteen': 'până când optsprezece',
        'Until nineteen': 'Până când nouăsprezece',
        'until nineteen': 'până când nouăsprezece',
        'Until twenty': 'Până când douăzeci',
        'until twenty': 'până când douăzeci',
        'Until thirty': 'Până când treizeci',
        'until thirty': 'până când treizeci',
        'Until forty': 'Până când patruzeci',
        'until forty': 'până când patruzeci',
        'Until fifty': 'Până când cincizeci',
        'until fifty': 'până când cincizeci',
        'Until sixty': 'Până când șaizeci',
        'until sixty': 'până când șaizeci',
        'Until seventy': 'Până când șaptezeci',
        'until seventy': 'până când șaptezeci',
        'Until eighty': 'Până când optzeci',
        'until eighty': 'până când optzeci',
        'Until ninety': 'Până când nouăzeci',
        'until ninety': 'până când nouăzeci',
        'Until one hundred': 'Până când o sută',
        'until one hundred': 'până când o sută',
        'Until a hundred': 'Până când o sută',
        'until a hundred': 'până când o sută',
        'Until two hundred': 'Până când două sute',
        'until two hundred': 'până când două sute',
        'Until three hundred': 'Până când trei sute',
        'until three hundred': 'până când trei sute',
        'Until four hundred': 'Până când patru sute',
        'until four hundred': 'până când patru sute',
        'Until five hundred': 'Până când cinci sute',
        'until five hundred': 'până când cinci sute',
        'Until six hundred': 'Până când șase sute',
        'until six hundred': 'până când șase sute',
        'Until seven hundred': 'Până când șapte sute',
        'until seven hundred': 'până când șapte sute',
        'Until eight hundred': 'Până când opt sute',
        'until eight hundred': 'până când opt sute',
        'Until nine hundred': 'Până când nouă sute',
        'until nine hundred': 'până când nouă sute',
        'Until a thousand': 'Până când o mie',
        'until a thousand': 'până când o mie',
        'Until one thousand': 'Până când o mie',
        'until one thousand': 'până când o mie',
        'Until two thousand': 'Până când două mii',
        'until two thousand': 'până când două mii',
        'Until three thousand': 'Până când trei mii',
        'until three thousand': 'până când trei mii',
        'Until four thousand': 'Până când patru mii',
        'until four thousand': 'până când patru mii',
        'Until five thousand': 'Până când cinci mii',
        'until five thousand': 'până când cinci mii',
        'Until six thousand': 'Până când șase mii',
        'until six thousand': 'până când șase mii',
        'Until seven thousand': 'Până când șapte mii',
        'until seven thousand': 'până când șapte mii',
        'Until eight thousand': 'Până când opt mii',
        'until eight thousand': 'până când opt mii',
        'Until nine thousand': 'Până când nouă mii',
        'until nine thousand': 'până când nouă mii',
        'Until ten thousand': 'Până când zece mii',
        'until ten thousand': 'până când zece mii',
        'Until a million': 'Până când un milion',
        'until a million': 'până când un milion',
        'Until one million': 'Până când un milion',
        'until one million': 'până când un milion',
        'Until two million': 'Până când două milioane',
        'until two million': 'până când două milioane',
        'Until three million': 'Până când trei milioane',
        'until three million': 'până când trei milioane',
        'Until four million': 'Până când patru milioane',
        'until four million': 'până când patru milioane',
        'Until five million': 'Până când cinci milioane',
        'until five million': 'până când cinci milioane',
        'Until six million': 'Până când șase milioane',
        'until six million': 'până când șase milioane',
        'Until seven million': 'Până când șapte milioane',
        'until seven million': 'până când șapte milioane',
        'Until eight million': 'Până când opt milioane',
        'until eight million': 'până când opt milioane',
        'Until nine million': 'Până când nouă milioane',
        'until nine million': 'până când nouă milioane',
        'Until ten million': 'Până când zece milioane',
        'until ten million': 'până când zece milioane',
        'Until a billion': 'Până când un miliard',
        'until a billion': 'până când un miliard',
        'Until one billion': 'Până când un miliard',
        'until one billion': 'până când un miliard',
        'Until two billion': 'Până când două miliarde',
        'until two billion': 'până când două miliarde',
        'Until three billion': 'Până când trei miliarde',
        'until three billion': 'până când trei miliarde',
        'Until four billion': 'Până când patru miliarde',
        'until four billion': 'până când patru miliarde',
        'Until five billion': 'Până când cinci miliarde',
        'until five billion': 'până când cinci miliarde',
        'Until six billion': 'Până când șase miliarde',
        'until six billion': 'până când șase miliarde',
        'Until seven billion': 'Până când șapte miliarde',
        'until seven billion': 'până când șapte miliarde',
        'Until eight billion': 'Până când opt miliarde',
        'until eight billion': 'până când opt miliarde',
        'Until nine billion': 'Până când nouă miliarde',
        'until nine billion': 'până când nouă miliarde',
        'Until ten billion': 'Până când zece miliarde',
        'until ten billion': 'până când zece miliarde',
        'Until a trillion': 'Până când un trilion',
        'until a trillion': 'până când un trilion',
        'Until one trillion': 'Până când un trilion',
        'until one trillion': 'până când un trilion',
        'Until two trillion': 'Până când două trilioane',
        'until two trillion': 'până când două trilioane',
        'Until three trillion': 'Până când trei trilioane',
        'until three trillion': 'până când trei trilioane',
        'Until four trillion': 'Până când patru trilioane',
        'until four trillion': 'până când patru trilioane',
        'Until five trillion': 'Până când cinci trilioane',
        'until five trillion': 'până când cinci trilioane',
        'Until six trillion': 'Până când șase trilioane',
        'until six trillion': 'până când șase trilioane',
        'Until seven trillion': 'Până când șapte trilioane',
        'until seven trillion': 'până când șapte trilioane',
        'Until eight trillion': 'Până când opt trilioane',
        'until eight trillion': 'până când opt trilioane',
        'Until nine trillion': 'Până când nouă trilioane',
        'until nine trillion': 'până când nouă trilioane',
        'Until ten trillion': 'Până când zece trilioane',
        'until ten trillion': 'până când zece trilioane',
        // Common phrases
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

      // Translate each instruction
      return instructions.map(instruction => {
        let translated = instruction;
        
        // Remove quantities first
        translated = translated
          .replace(/\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms)\s+/gi, '')
          .replace(/\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|kg|kilogram|kilograms)$/gi, '')
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
    };

    // Translate instructions to Romanian
    const translatedInstructions = translateInstructionsToRomanian(recipeInstructions);

    // Format instructions as a single string, removing quantities
    const instructionsText = translatedInstructions.length > 0
      ? translatedInstructions
          .filter((instruction: string) => instruction.length > 0) // Remove empty instructions
          .join('\n')
      : '';

    // Add to existing meal or create new meal
    const newMealString = currentMealString 
      ? `${currentMealString}, ${recipeGroupString}`
      : recipeGroupString;

    // Update the day menu - handle both string and object formats
    let updatedDayMenu: any;
    if (isObjectMeal) {
      // If meal is an object, update the ingredients field
      updatedDayMenu = {
        ...dayMenu,
        [mealType]: {
          ...mealData,
          ingredients: newMealString
        }
      };
    } else {
      // If meal is a string, update directly
      updatedDayMenu = {
        ...dayMenu,
        [mealType]: newMealString
      };
    }

    // Store cooking instructions
    // If meal is an object, store instructions in the meal object
    // Otherwise, store in the separate instructions structure
    let finalUpdatedDayMenu: any;
    if (isObjectMeal) {
      // Store instructions in the meal object
      finalUpdatedDayMenu = {
        ...updatedDayMenu,
        [mealType]: {
          ...updatedDayMenu[mealType],
          cookingInstructions: instructionsText
        }
      };
    } else {
      // Store instructions in separate instructions structure
      finalUpdatedDayMenu = updatedDayMenu;
      const instructionsKey = `${dayKey}_instructions`;
      const currentInstructions = weekMenu[instructionsKey] || {};
      const updatedInstructions = {
        ...currentInstructions,
        [mealType]: instructionsText
      };
      weekMenu[instructionsKey] = updatedInstructions;
    }

    // Update the week menu
    const updatedWeekMenu = {
      ...weekMenu,
      [dayKey]: finalUpdatedDayMenu
    };

    console.log('[add-recipe] Updating nutrition plan:', {
      planId: id,
      dayKey,
      mealType,
      recipeName: recipe.name,
      newMealString: newMealString.substring(0, 100),
      isObjectMeal,
      hasInstructions: !!instructionsText
    });

    // Update the nutrition plan
    const updatedPlan = await prisma.nutritionPlan.update({
      where: { id },
      data: {
        weekMenu: updatedWeekMenu
      }
    });

    console.log('[add-recipe] Successfully updated nutrition plan');

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      recipeGroup: {
        id: recipeGroupId,
        name: recipe.name,
        ingredients: recipe.ingredients
      }
    });

  } catch (error) {
    console.error('Error adding recipe to nutrition plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return NextResponse.json(
      { 
        error: 'Failed to add recipe to nutrition plan',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}



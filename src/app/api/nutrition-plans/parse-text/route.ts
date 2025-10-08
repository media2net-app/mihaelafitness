import { NextRequest, NextResponse } from 'next/server';
import { NutritionTextParser } from '@/lib/textParser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to get ingredient synonyms for better matching
function getIngredientSynonyms(ingredientName: string): string[] {
  const synonyms: { [key: string]: string[] } = {
    'eggs': ['egg', 'whole eggs', 'boiled eggs', 'scrambled eggs'],
    'egg': ['eggs', 'whole eggs', 'boiled eggs', 'scrambled eggs'],
    'egg whites': ['whites', 'egg white', 'scrambled egg whites'],
    'whites': ['egg whites', 'egg white', 'scrambled egg whites'],
    'chicken breast': ['chicken', 'grilled chicken', 'chicken breast grilled'],
    'chicken': ['chicken breast', 'grilled chicken'],
    'olive oil': ['oil', 'extra virgin olive oil'],
    'oatmeal': ['oats', 'rolled oats', 'steel cut oats'],
    'oats': ['oatmeal', 'rolled oats', 'steel cut oats'],
    'almond milk': ['almonds milk', 'unsweetened almond milk'],
    'greek yogurt': ['yogurt', 'plain greek yogurt'],
    'peanut butter': ['natural peanut butter', 'peanut butter natural'],
    'banana': ['bananas', 'ripe banana'],
    'apple': ['apples', 'green apple', 'red apple'],
    'rice': ['white rice', 'brown rice', 'cooked rice'],
    'quinoa': ['cooked quinoa', 'quinoa cooked'],
    'sweet potato': ['sweet potatoes', 'baked sweet potato'],
    'broccoli': ['broccoli florets', 'steamed broccoli'],
    'spinach': ['baby spinach', 'fresh spinach'],
    'tomato': ['tomatoes', 'cherry tomatoes'],
    'onion': ['onions', 'red onion', 'yellow onion'],
    'garlic': ['garlic cloves', 'minced garlic'],
    'avocado': ['avocados', 'ripe avocado'],
    'lemon': ['lemon juice', 'fresh lemon'],
    'lime': ['lime juice', 'fresh lime'],
    'ginger': ['fresh ginger', 'ginger root'],
    'zucchini': ['zucchinis', 'courgette'],
    'peppers': ['bell peppers', 'red peppers', 'green peppers'],
    'carrot': ['carrots', 'baby carrots'],
    'cucumber': ['cucumbers', 'english cucumber'],
    'lettuce': ['romaine lettuce', 'iceberg lettuce'],
    'cabbage': ['red cabbage', 'green cabbage'],
    'mushroom': ['mushrooms', 'white mushrooms', 'button mushrooms'],
    'asparagus': ['asparagus spears', 'green asparagus'],
    'cauliflower': ['cauliflower florets', 'cauliflower rice'],
    'eggplant': ['aubergine', 'eggplants'],
    'corn': ['sweet corn', 'corn kernels'],
    'peas': ['green peas', 'frozen peas'],
    'beans': ['black beans', 'kidney beans', 'chickpeas'],
    'lentils': ['red lentils', 'green lentils'],
    'salmon': ['salmon fillet', 'grilled salmon'],
    'tuna': ['tuna steak', 'canned tuna'],
    'turkey': ['turkey breast', 'ground turkey'],
    'beef': ['lean beef', 'ground beef'],
    'pork': ['pork tenderloin', 'pork chops'],
    'cheese': ['cheddar cheese', 'mozzarella cheese'],
    'milk': ['whole milk', 'skim milk', '2% milk'],
    'butter': ['unsalted butter', 'grass fed butter'],
    'honey': ['raw honey', 'organic honey'],
    'maple syrup': ['pure maple syrup', 'maple syrup pure'],
    'coconut oil': ['virgin coconut oil', 'extra virgin coconut oil'],
    'almonds': ['raw almonds', 'blanched almonds'],
    'walnuts': ['raw walnuts', 'walnut halves'],
    'cashews': ['raw cashews', 'roasted cashews'],
    'pistachios': ['shelled pistachios', 'raw pistachios'],
    'pecans': ['raw pecans', 'pecan halves'],
    'chia seeds': ['black chia seeds', 'white chia seeds'],
    'flax seeds': ['ground flax seeds', 'flaxseed'],
    'hemp seeds': ['hemp hearts', 'shelled hemp seeds'],
    'sunflower seeds': ['raw sunflower seeds', 'hulled sunflower seeds'],
    'pumpkin seeds': ['raw pumpkin seeds', 'pepitas'],
    'sesame seeds': ['white sesame seeds', 'black sesame seeds'],
    'bread': ['whole wheat bread', 'sourdough bread'],
    'pasta': ['whole wheat pasta', 'spaghetti'],
    'potato': ['potatoes', 'russet potatoes', 'red potatoes'],
    'basil': ['fresh basil', 'basil leaves'],
    'oregano': ['fresh oregano', 'dried oregano'],
    'thyme': ['fresh thyme', 'dried thyme'],
    'rosemary': ['fresh rosemary', 'dried rosemary'],
    'parsley': ['fresh parsley', 'flat leaf parsley'],
    'cilantro': ['fresh cilantro', 'coriander'],
    'mint': ['fresh mint', 'mint leaves'],
    'dill': ['fresh dill', 'dill weed'],
    'sage': ['fresh sage', 'dried sage'],
    'tarragon': ['fresh tarragon', 'dried tarragon'],
    'cumin': ['ground cumin', 'cumin seeds'],
    'paprika': ['sweet paprika', 'smoked paprika'],
    'cinnamon': ['ground cinnamon', 'cinnamon stick'],
    'nutmeg': ['ground nutmeg', 'whole nutmeg'],
    'cardamom': ['ground cardamom', 'cardamom pods'],
    'cloves': ['ground cloves', 'whole cloves'],
    'allspice': ['ground allspice', 'allspice berries'],
    'bay leaves': ['dried bay leaves', 'fresh bay leaves'],
    'vanilla': ['vanilla extract', 'vanilla bean'],
    'cocoa': ['cocoa powder', 'unsweetened cocoa powder'],
    'chocolate': ['dark chocolate', 'milk chocolate'],
    'coconut': ['shredded coconut', 'coconut flakes'],
    'raisins': ['golden raisins', 'dark raisins'],
    'dates': ['medjool dates', 'deglet noor dates'],
    'cranberries': ['dried cranberries', 'fresh cranberries'],
    'blueberries': ['fresh blueberries', 'frozen blueberries'],
    'strawberries': ['fresh strawberries', 'frozen strawberries'],
    'raspberries': ['fresh raspberries', 'frozen raspberries'],
    'blackberries': ['fresh blackberries', 'frozen blackberries'],
    'cherries': ['sweet cherries', 'tart cherries'],
    'peaches': ['fresh peaches', 'frozen peaches'],
    'pears': ['fresh pears', 'asian pears'],
    'oranges': ['navel oranges', 'blood oranges'],
    'grapefruit': ['pink grapefruit', 'white grapefruit'],
    'grapes': ['red grapes', 'green grapes'],
    'pineapple': ['fresh pineapple', 'pineapple chunks'],
    'mango': ['fresh mango', 'frozen mango'],
    'papaya': ['fresh papaya', 'papaya chunks'],
    'kiwi': ['fresh kiwi', 'kiwi fruit'],
    'pomegranate': ['pomegranate seeds', 'pomegranate arils'],
    'figs': ['fresh figs', 'dried figs'],
    'apricots': ['fresh apricots', 'dried apricots'],
    'plums': ['fresh plums', 'prunes'],
    'nectarines': ['fresh nectarines', 'white nectarines']
  };

  const normalizedName = ingredientName.toLowerCase().trim();
  return synonyms[normalizedName] || [];
}

export async function POST(request: NextRequest) {
  try {
    const { text, planId } = await request.json();

    if (!text || !planId) {
      return NextResponse.json(
        { error: 'Text and planId are required' },
        { status: 400 }
      );
    }

    // Parse the text using our parser
    const parser = new NutritionTextParser();
    const parsedData = parser.parseNutritionPlan(text);

    if (parsedData.length === 0) {
      return NextResponse.json(
        { error: 'No valid nutrition plan data found in the text' },
        { status: 400 }
      );
    }

    // Get all ingredients from the database for matching
    const dbIngredients = await prisma.ingredient.findMany({
      select: {
        id: true,
        name: true,
        per: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
        category: true
      }
    });

    // Match parsed ingredients with database ingredients
    const matchedData = parsedData.map(day => ({
      ...day,
      meals: day.meals.map(meal => ({
        ...meal,
        ingredients: meal.ingredients.map(ingredient => {
          // Enhanced ingredient matching with synonyms and better normalization
          let matchedIngredient = null;

          // 1. Try exact match first
          matchedIngredient = dbIngredients.find(db => 
            parser.normalizeIngredientName(db.name) === parser.normalizeIngredientName(ingredient.name)
          );

          // 2. Try synonym matching for common ingredients
          if (!matchedIngredient) {
            const synonyms = getIngredientSynonyms(ingredient.name);
            for (const synonym of synonyms) {
              matchedIngredient = dbIngredients.find(db => 
                parser.normalizeIngredientName(db.name) === parser.normalizeIngredientName(synonym)
              );
              if (matchedIngredient) break;
            }
          }

          // 3. Try similar ingredients with lower threshold
          if (!matchedIngredient) {
            const similarIngredients = parser.findSimilarIngredients(ingredient.name, dbIngredients, 0.5);
            matchedIngredient = similarIngredients[0] || null;
          }

          return {
            ...ingredient,
            matched: !!matchedIngredient,
            dbIngredient: matchedIngredient,
            matchConfidence: matchedIngredient ? 
              parser.findSimilarIngredients(ingredient.name, [matchedIngredient], 0.6)[0]?.similarity || 0.8 : 0
          };
        })
      }))
    }));

    // Calculate detailed matching statistics
    const totalDays = parsedData.length;
    const totalMeals = parsedData.reduce((sum, day) => sum + day.meals.length, 0);
    const totalIngredients = matchedData.reduce((sum, day) => 
      sum + day.meals.reduce((mealSum, meal) => mealSum + meal.ingredients.length, 0), 0
    );
    const matchedIngredients = matchedData.reduce((sum, day) => 
      sum + day.meals.reduce((mealSum, meal) => 
        mealSum + meal.ingredients.filter(ing => ing.matched).length, 0), 0
    );
    const unmatchedIngredients = totalIngredients - matchedIngredients;
    const matchRate = totalIngredients > 0 ? (matchedIngredients / totalIngredients) * 100 : 0;

    return NextResponse.json({
      success: true,
      parsedData: matchedData,
      statistics: {
        totalDays,
        totalMeals,
        totalIngredients,
        matchedIngredients,
        unmatchedIngredients,
        matchRate: Math.round(matchRate)
      }
    });

  } catch (error) {
    console.error('Error parsing nutrition plan text:', error);
    return NextResponse.json(
      { error: 'Failed to parse nutrition plan text' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

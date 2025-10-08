const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// Populaire zoektermen voor verschillende categorieën
const SEARCH_TERMS = [
  // Proteïnen
  'chicken breast', 'beef', 'salmon', 'tuna', 'turkey', 'pork', 'lamb', 'duck', 'rabbit',
  'eggs', 'egg whites', 'quail eggs', 'fish', 'cod', 'haddock', 'mackerel', 'sardines',
  'shrimp', 'crab', 'lobster', 'mussels', 'oysters', 'scallops',
  
  // Koolhydraten
  'brown rice', 'white rice', 'basmati rice', 'wild rice', 'quinoa', 'bulgur', 'couscous',
  'pasta', 'spaghetti', 'penne', 'macaroni', 'noodles', 'bread', 'whole wheat bread',
  'sourdough bread', 'baguette', 'oats', 'oatmeal', 'barley', 'buckwheat', 'millet',
  'potatoes', 'sweet potatoes', 'yams', 'corn', 'wheat', 'rye',
  
  // Groenten
  'broccoli', 'spinach', 'kale', 'lettuce', 'arugula', 'cabbage', 'cauliflower', 'brussels sprouts',
  'carrots', 'celery', 'cucumber', 'tomatoes', 'bell peppers', 'onions', 'garlic', 'ginger',
  'asparagus', 'green beans', 'peas', 'corn', 'zucchini', 'eggplant', 'mushrooms', 'beets',
  'radishes', 'turnips', 'parsnips', 'leeks', 'fennel', 'artichokes',
  
  // Fruit
  'apples', 'bananas', 'oranges', 'lemons', 'limes', 'grapefruit', 'grapes', 'strawberries',
  'blueberries', 'raspberries', 'blackberries', 'cranberries', 'cherries', 'peaches', 'pears',
  'plums', 'apricots', 'kiwi', 'mango', 'pineapple', 'papaya', 'watermelon', 'cantaloupe',
  'honeydew', 'pomegranate', 'figs', 'dates', 'raisins',
  
  // Noten & Zaden
  'almonds', 'walnuts', 'cashews', 'pistachios', 'pecans', 'hazelnuts', 'macadamia nuts',
  'brazil nuts', 'pine nuts', 'peanuts', 'sunflower seeds', 'pumpkin seeds', 'sesame seeds',
  'chia seeds', 'flax seeds', 'hemp seeds', 'poppy seeds',
  
  // Gezonde Vetten
  'olive oil', 'coconut oil', 'avocado oil', 'walnut oil', 'almond oil', 'sesame oil',
  'avocado', 'olives', 'almond butter', 'peanut butter', 'cashew butter', 'tahini',
  
  // Zuivel
  'milk', 'cow milk', 'goat milk', 'almond milk', 'soy milk', 'oat milk', 'coconut milk',
  'cheese', 'cheddar cheese', 'mozzarella', 'parmesan', 'feta', 'goat cheese', 'ricotta',
  'yogurt', 'greek yogurt', 'cottage cheese', 'cream cheese', 'butter', 'ghee',
  
  // Specerijen & Kruiden
  'salt', 'pepper', 'garlic powder', 'onion powder', 'paprika', 'cumin', 'coriander',
  'oregano', 'basil', 'thyme', 'rosemary', 'sage', 'parsley', 'cilantro', 'dill',
  'cinnamon', 'nutmeg', 'ginger', 'turmeric', 'cardamom', 'cloves', 'bay leaves',
  
  // Overig
  'honey', 'maple syrup', 'agave', 'stevia', 'coconut sugar', 'brown sugar', 'white sugar',
  'cocoa powder', 'dark chocolate', 'milk chocolate', 'vanilla extract', 'almond extract',
  'vinegar', 'balsamic vinegar', 'apple cider vinegar', 'lemon juice', 'lime juice'
];

// Categorie mapping functie
function categorizeFood(name) {
  const lowerName = name.toLowerCase();
  
  // Proteïnen
  if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('fish') || 
      lowerName.includes('salmon') || lowerName.includes('tuna') || lowerName.includes('turkey') ||
      lowerName.includes('pork') || lowerName.includes('lamb') || lowerName.includes('duck') ||
      lowerName.includes('rabbit') || lowerName.includes('egg') || lowerName.includes('shrimp') ||
      lowerName.includes('crab') || lowerName.includes('lobster') || lowerName.includes('mussels') ||
      lowerName.includes('oysters') || lowerName.includes('scallops') || lowerName.includes('cod') ||
      lowerName.includes('haddock') || lowerName.includes('mackerel') || lowerName.includes('sardines')) {
    return 'proteins';
  }
  
  // Koolhydraten
  if (lowerName.includes('rice') || lowerName.includes('pasta') || lowerName.includes('bread') ||
      lowerName.includes('oats') || lowerName.includes('quinoa') || lowerName.includes('bulgur') ||
      lowerName.includes('couscous') || lowerName.includes('noodles') || lowerName.includes('potato') ||
      lowerName.includes('barley') || lowerName.includes('buckwheat') || lowerName.includes('millet') ||
      lowerName.includes('wheat') || lowerName.includes('rye') || lowerName.includes('corn')) {
    return 'carbohydrates';
  }
  
  // Groenten
  if (lowerName.includes('broccoli') || lowerName.includes('spinach') || lowerName.includes('kale') ||
      lowerName.includes('lettuce') || lowerName.includes('arugula') || lowerName.includes('cabbage') ||
      lowerName.includes('cauliflower') || lowerName.includes('brussels') || lowerName.includes('carrot') ||
      lowerName.includes('celery') || lowerName.includes('cucumber') || lowerName.includes('tomato') ||
      lowerName.includes('pepper') || lowerName.includes('onion') || lowerName.includes('garlic') ||
      lowerName.includes('asparagus') || lowerName.includes('green beans') || lowerName.includes('peas') ||
      lowerName.includes('zucchini') || lowerName.includes('eggplant') || lowerName.includes('mushroom') ||
      lowerName.includes('beet') || lowerName.includes('radish') || lowerName.includes('turnip') ||
      lowerName.includes('parsnip') || lowerName.includes('leek') || lowerName.includes('fennel') ||
      lowerName.includes('artichoke') || lowerName.includes('ginger')) {
    return 'vegetables';
  }
  
  // Fruit
  if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('orange') ||
      lowerName.includes('lemon') || lowerName.includes('lime') || lowerName.includes('grapefruit') ||
      lowerName.includes('grape') || lowerName.includes('strawberry') || lowerName.includes('blueberry') ||
      lowerName.includes('raspberry') || lowerName.includes('blackberry') || lowerName.includes('cranberry') ||
      lowerName.includes('cherry') || lowerName.includes('peach') || lowerName.includes('pear') ||
      lowerName.includes('plum') || lowerName.includes('apricot') || lowerName.includes('kiwi') ||
      lowerName.includes('mango') || lowerName.includes('pineapple') || lowerName.includes('papaya') ||
      lowerName.includes('watermelon') || lowerName.includes('cantaloupe') || lowerName.includes('honeydew') ||
      lowerName.includes('pomegranate') || lowerName.includes('fig') || lowerName.includes('date') ||
      lowerName.includes('raisin')) {
    return 'fruits';
  }
  
  // Noten & Zaden
  if (lowerName.includes('almond') || lowerName.includes('walnut') || lowerName.includes('cashew') ||
      lowerName.includes('pistachio') || lowerName.includes('pecan') || lowerName.includes('hazelnut') ||
      lowerName.includes('macadamia') || lowerName.includes('brazil') || lowerName.includes('pine nut') ||
      lowerName.includes('peanut') || lowerName.includes('sunflower seed') || lowerName.includes('pumpkin seed') ||
      lowerName.includes('sesame seed') || lowerName.includes('chia seed') || lowerName.includes('flax seed') ||
      lowerName.includes('hemp seed') || lowerName.includes('poppy seed')) {
    return 'nuts-seeds';
  }
  
  // Gezonde Vetten
  if (lowerName.includes('olive oil') || lowerName.includes('coconut oil') || lowerName.includes('avocado oil') ||
      lowerName.includes('walnut oil') || lowerName.includes('almond oil') || lowerName.includes('sesame oil') ||
      lowerName.includes('avocado') || lowerName.includes('olive') || lowerName.includes('butter') ||
      lowerName.includes('tahini')) {
    return 'healthy-fats';
  }
  
  // Zuivel
  if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt') ||
      lowerName.includes('cottage cheese') || lowerName.includes('cream cheese') || lowerName.includes('ghee')) {
    return 'dairy';
  }
  
  // Overig
  if (lowerName.includes('honey') || lowerName.includes('maple syrup') || lowerName.includes('agave') ||
      lowerName.includes('stevia') || lowerName.includes('coconut sugar') || lowerName.includes('sugar') ||
      lowerName.includes('cocoa') || lowerName.includes('chocolate') || lowerName.includes('vanilla') ||
      lowerName.includes('vinegar') || lowerName.includes('lemon juice') || lowerName.includes('lime juice') ||
      lowerName.includes('salt') || lowerName.includes('pepper') || lowerName.includes('spice') ||
      lowerName.includes('herb') || lowerName.includes('cinnamon') || lowerName.includes('nutmeg') ||
      lowerName.includes('turmeric') || lowerName.includes('cardamom') || lowerName.includes('clove')) {
    return 'other';
  }
  
  return 'other';
}

async function searchOpenFoodFacts(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MihaelaFitness/1.0'
      },
    });
    
    if (!response.ok) {
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.products || data.products.length === 0) {
      return [];
    }
    
    return data.products.map(product => {
      const nutriments = product.nutriments || {};
      
      return {
        id: product.code || product._id,
        name: product.product_name || product.product_name_en || 'Unknown Product',
        calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy_100g'] / 4.184 || 0),
        protein: Math.round((nutriments['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((nutriments['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((nutriments['fat_100g'] || 0) * 10) / 10,
        fiber: Math.round((nutriments['fiber_100g'] || 0) * 10) / 10,
        sugar: Math.round((nutriments['sugars_100g'] || 0) * 10) / 10,
        category: categorizeFood(product.product_name || product.product_name_en || '')
      };
    }).filter(food => food.calories > 0 && food.name !== 'Unknown Product');
    
  } catch (error) {
    console.error(`Error searching for ${query}:`, error.message);
    return [];
  }
}

async function clearAllIngredients() {
  try {
    console.log('🗑️ Clearing all existing ingredients...');
    
    const deleteResult = await prisma.ingredient.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.count} existing ingredients`);
    
  } catch (error) {
    console.error('❌ Error clearing ingredients:', error);
    throw error;
  }
}

async function importAllIngredients() {
  try {
    console.log('🚀 Starting complete ingredient import from Open Food Facts...\n');
    
    // Step 1: Clear all existing ingredients
    await clearAllIngredients();
    
    let totalImported = 0;
    let totalErrors = 0;
    const importedNames = new Set(); // To avoid duplicates
    
    console.log(`📋 Processing ${SEARCH_TERMS.length} search terms...\n`);
    
    for (let i = 0; i < SEARCH_TERMS.length; i++) {
      const searchTerm = SEARCH_TERMS[i];
      console.log(`[${i + 1}/${SEARCH_TERMS.length}] 🔍 Searching: ${searchTerm}`);
      
      const foods = await searchOpenFoodFacts(searchTerm);
      
      if (foods.length === 0) {
        console.log(`   ⚠️  No results found`);
        continue;
      }
      
      console.log(`   📊 Found ${foods.length} products`);
      
      for (const food of foods) {
        try {
          // Skip if we already have this ingredient
          if (importedNames.has(food.name.toLowerCase())) {
            continue;
          }
          
          // Skip if no meaningful nutritional data
          if (food.calories === 0 && food.protein === 0 && food.carbs === 0 && food.fat === 0) {
            continue;
          }
          
          // Create new ingredient
          await prisma.ingredient.create({
            data: {
              name: food.name,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
              fiber: food.fiber,
              sugar: food.sugar,
              category: food.category,
              per: '100g',
              aliases: [`OpenFoodFacts:${food.id}`],
              isActive: true
            }
          });
          
          importedNames.add(food.name.toLowerCase());
          totalImported++;
          
          console.log(`   ✅ Imported: ${food.name} (${food.calories} cal, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fat}g fat)`);
          
        } catch (error) {
          console.error(`   ❌ Error importing ${food.name}:`, error.message);
          totalErrors++;
        }
      }
      
      // Add delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`   📈 Progress: ${totalImported} imported, ${totalErrors} errors\n`);
    }
    
    console.log(`\n🎉 Import Complete!`);
    console.log(`📊 Final Summary:`);
    console.log(`   - Total imported: ${totalImported}`);
    console.log(`   - Total errors: ${totalErrors}`);
    console.log(`   - Search terms processed: ${SEARCH_TERMS.length}`);
    console.log(`   - Unique ingredients: ${importedNames.size}`);
    
    // Show category distribution
    const categoryStats = await prisma.ingredient.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    
    console.log(`\n📋 Category Distribution:`);
    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat._count.category} ingredients`);
    });
    
  } catch (error) {
    console.error('❌ Import process failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importAllIngredients();





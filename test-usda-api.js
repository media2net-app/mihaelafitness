const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// USDA API Key - You need to get this from https://fdc.nal.usda.gov/api-guide.html
const USDA_API_KEY = 'YOUR_USDA_API_KEY_HERE'; // Replace with your actual API key

// Common food searches for testing
const TEST_SEARCHES = [
  'chicken breast',
  'brown rice',
  'avocado',
  'almonds',
  'olive oil',
  'banana',
  'broccoli',
  'salmon',
  'eggs',
  'quinoa'
];

async function searchUsdaApi(query, apiKey) {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=5`;
    
    console.log(`🔍 Searching USDA API for: ${query}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.foods || data.foods.length === 0) {
      console.log(`   ⚠️  No results found for: ${query}`);
      return [];
    }
    
    console.log(`   ✅ Found ${data.foods.length} results`);
    
    return data.foods.map(food => ({
      fdcId: food.fdcId,
      description: food.description,
      foodNutrients: food.foodNutrients || []
    }));
    
  } catch (error) {
    console.error(`   ❌ Error searching for ${query}:`, error.message);
    return [];
  }
}

function getNutrientValue(nutrients, nutrientName) {
  const nutrient = nutrients.find(n => n.nutrient.name === nutrientName);
  return nutrient ? Math.round(nutrient.amount * 10) / 10 : 0;
}

function categorizeFood(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('fish') || lowerName.includes('egg') || lowerName.includes('salmon') || lowerName.includes('turkey')) {
    return 'proteins';
  } else if (lowerName.includes('rice') || lowerName.includes('pasta') || lowerName.includes('bread') || lowerName.includes('oats') || lowerName.includes('quinoa')) {
    return 'carbohydrates';
  } else if (lowerName.includes('avocado') || lowerName.includes('oil') || lowerName.includes('nuts') || lowerName.includes('almond') || lowerName.includes('walnut')) {
    return 'healthy-fats';
  } else if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('berry') || lowerName.includes('orange') || lowerName.includes('grape')) {
    return 'fruits';
  } else if (lowerName.includes('broccoli') || lowerName.includes('spinach') || lowerName.includes('carrot') || lowerName.includes('lettuce') || lowerName.includes('tomato')) {
    return 'vegetables';
  } else if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt') || lowerName.includes('butter')) {
    return 'dairy';
  }
  return 'other';
}

async function importUsdaIngredients() {
  try {
    console.log('🚀 Starting USDA API ingredient import...\n');
    
    if (USDA_API_KEY === 'YOUR_USDA_API_KEY_HERE') {
      console.log('❌ Please set your USDA API key in the script first!');
      console.log('   Get your free API key at: https://fdc.nal.usda.gov/api-guide.html');
      return;
    }
    
    let totalImported = 0;
    let totalErrors = 0;
    
    for (const searchTerm of TEST_SEARCHES) {
      console.log(`\n📋 Processing: ${searchTerm}`);
      
      const foods = await searchUsdaApi(searchTerm, USDA_API_KEY);
      
      for (const food of foods) {
        try {
          const calories = getNutrientValue(food.foodNutrients, 'Energy');
          const protein = getNutrientValue(food.foodNutrients, 'Protein');
          const carbs = getNutrientValue(food.foodNutrients, 'Carbohydrate, by difference');
          const fat = getNutrientValue(food.foodNutrients, 'Total lipid (fat)');
          const fiber = getNutrientValue(food.foodNutrients, 'Fiber, total dietary');
          const sugar = getNutrientValue(food.foodNutrients, 'Sugars, total including NLEA');
          
          // Skip if no meaningful nutritional data
          if (calories === 0 && protein === 0 && carbs === 0 && fat === 0) {
            console.log(`   ⚠️  Skipping ${food.description} - no nutritional data`);
            continue;
          }
          
          const category = categorizeFood(food.description);
          
          // Check if ingredient already exists
          const existingIngredient = await prisma.ingredient.findFirst({
            where: {
              name: {
                equals: food.description,
                mode: 'insensitive'
              }
            }
          });
          
          if (existingIngredient) {
            console.log(`   ⚠️  ${food.description} already exists, skipping`);
            continue;
          }
          
          // Create new ingredient
          const newIngredient = await prisma.ingredient.create({
            data: {
              name: food.description,
              calories: calories,
              protein: protein,
              carbs: carbs,
              fat: fat,
              fiber: fiber,
              sugar: sugar,
              category: category,
              per: '100g',
              aliases: [`USDA:${food.fdcId}`],
              isActive: true
            }
          });
          
          console.log(`   ✅ Imported: ${food.description} (${calories} cal, ${protein}g protein, ${carbs}g carbs, ${fat}g fat)`);
          totalImported++;
          
        } catch (error) {
          console.error(`   ❌ Error importing ${food.description}:`, error.message);
          totalErrors++;
        }
      }
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   - Total imported: ${totalImported}`);
    console.log(`   - Total errors: ${totalErrors}`);
    console.log(`   - Search terms processed: ${TEST_SEARCHES.length}`);
    
    if (totalImported > 0) {
      console.log(`\n🎉 Successfully imported ${totalImported} new ingredients from USDA API!`);
    }
    
  } catch (error) {
    console.error('❌ Import process failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importUsdaIngredients();





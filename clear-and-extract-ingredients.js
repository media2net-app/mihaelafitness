const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to parse meal description and extract ingredients
function parseMealDescription(mealDescription) {
  const ingredients = [];
  
  // Split by common separators
  const parts = mealDescription.split(/[+•]/).map(part => part.trim()).filter(part => part.length > 0);
  
  for (const part of parts) {
    // Extract quantity and ingredient
    const match = part.match(/^(\d+(?:\.\d+)?)\s*(g|ml|tsp|tbsp|scoop|scoops|whole|small|medium|large|½|¼|¾)\s*(.+)$/i);
    
    if (match) {
      const quantity = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      const ingredient = match[3].trim();
      
      ingredients.push({
        name: ingredient,
        quantity: quantity,
        unit: unit
      });
    } else {
      // If no quantity found, try to extract ingredient name
      const cleanIngredient = part.replace(/^\d+\s*(g|ml|tsp|tbsp|scoop|scoops|whole|small|medium|large|½|¼|¾)\s*/i, '').trim();
      if (cleanIngredient) {
        ingredients.push({
          name: cleanIngredient,
          quantity: 1,
          unit: 'piece'
        });
      }
    }
  }
  
  return ingredients;
}

// Function to normalize ingredient names
function normalizeIngredientName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

async function clearAndExtractIngredients() {
  try {
    console.log('🗑️ Clearing existing ingredients database...');
    
    // Clear all existing ingredients
    await prisma.ingredient.deleteMany({});
    console.log('✅ Cleared ingredients database');
    
    console.log('🔍 Fetching all nutrition plans...');
    
    // Get all nutrition plans
    const plans = await prisma.nutritionPlan.findMany({
      select: {
        id: true,
        name: true,
        weekMenu: true
      }
    });
    
    console.log(`📋 Found ${plans.length} nutrition plans`);
    
    const allIngredients = new Set();
    const ingredientMap = new Map();
    
    // Process each nutrition plan
    for (const plan of plans) {
      console.log(`\n📝 Processing plan: ${plan.name}`);
      
      if (plan.weekMenu) {
        const weekMenu = plan.weekMenu;
        
        // Process each day
        for (const [day, meals] of Object.entries(weekMenu)) {
          console.log(`  📅 Processing ${day}...`);
          
          // Process each meal type
          for (const [mealType, mealDescription] of Object.entries(meals)) {
            if (mealDescription && typeof mealDescription === 'string') {
              console.log(`    🍽️ Processing ${mealType}: ${mealDescription.substring(0, 50)}...`);
              
              // Parse ingredients from meal description
              const ingredients = parseMealDescription(mealDescription);
              
              for (const ingredient of ingredients) {
                const normalizedName = normalizeIngredientName(ingredient.name);
                
                if (normalizedName && normalizedName.length > 1) {
                  allIngredients.add(normalizedName);
                  
                  // Store ingredient with metadata
                  if (!ingredientMap.has(normalizedName)) {
                    ingredientMap.set(normalizedName, {
                      name: normalizedName,
                      originalName: ingredient.name,
                      quantity: ingredient.quantity,
                      unit: ingredient.unit,
                      foundIn: []
                    });
                  }
                  
                  ingredientMap.get(normalizedName).foundIn.push({
                    plan: plan.name,
                    day: day,
                    meal: mealType,
                    originalDescription: mealDescription
                  });
                }
              }
            }
          }
        }
      }
    }
    
    console.log(`\n📊 Found ${allIngredients.size} unique ingredients`);
    
    // Add ingredients to database
    console.log('\n💾 Adding ingredients to database...');
    
    let addedCount = 0;
    for (const [normalizedName, data] of ingredientMap) {
      try {
        await prisma.ingredient.create({
          data: {
            name: normalizedName,
            per: "100",
            calories: 0, // Will be filled later
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            category: "mixed",
            aliases: JSON.stringify([data.originalName]),
            isActive: true
          }
        });
        addedCount++;
        console.log(`  ✅ Added: ${normalizedName}`);
      } catch (error) {
        console.log(`  ❌ Error adding ${normalizedName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully added ${addedCount} ingredients to database`);
    console.log('\n📋 Summary:');
    console.log(`  - Total unique ingredients: ${allIngredients.size}`);
    console.log(`  - Successfully added: ${addedCount}`);
    console.log(`  - Failed to add: ${allIngredients.size - addedCount}`);
    
    // Show some examples
    console.log('\n🔍 Sample ingredients:');
    const sampleIngredients = Array.from(allIngredients).slice(0, 10);
    for (const ingredient of sampleIngredients) {
      console.log(`  - ${ingredient}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAndExtractIngredients();


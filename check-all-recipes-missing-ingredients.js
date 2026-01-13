// Script to check all recipes for missing ingredients and add them
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllRecipes() {
  try {
    console.log('Loading all recipes and ingredients...\n');
    
    const recipes = await prisma.recipe.findMany({
      include: { ingredients: true }
    });
    
    const allIngredients = await prisma.ingredient.findMany();
    const ingredientNames = new Map();
    allIngredients.forEach(ing => {
      ingredientNames.set(ing.name.toLowerCase(), ing);
      if (ing.nameRo) {
        ingredientNames.set(ing.nameRo.toLowerCase(), ing);
      }
    });
    
    console.log(`Found ${recipes.length} recipes`);
    console.log(`Found ${allIngredients.length} ingredients in database\n`);
    
    // Find all missing ingredients
    const missingIngredients = new Map();
    
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        if (!ing.exists || !ing.availableInApi) {
          const key = ing.name.toLowerCase().trim();
          if (!missingIngredients.has(key)) {
            missingIngredients.set(key, {
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              recipes: new Set()
            });
          }
          missingIngredients.get(key).recipes.add(recipe.name);
        }
      });
    });
    
    if (missingIngredients.size === 0) {
      console.log('✅ All ingredients are matched! No missing ingredients found.');
      return;
    }
    
    console.log(`\n📋 Found ${missingIngredients.size} missing ingredients:\n`);
    
    const missingList = Array.from(missingIngredients.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    missingList.forEach((ing, index) => {
      console.log(`${index + 1}. ${ing.name} (${ing.unit})`);
      console.log(`   Used in: ${Array.from(ing.recipes).slice(0, 5).join(', ')}${ing.recipes.size > 5 ? '...' : ''}`);
    });
    
    console.log(`\n\n💡 These ingredients need to be added to the database.`);
    console.log(`   Would you like me to create a script to add them with estimated macros?`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAllRecipes();







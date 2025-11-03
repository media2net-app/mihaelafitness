// Script to fix ingredient matches for all recipes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findIngredient(ingredientName, ingredients) {
  const cleanName = ingredientName.toLowerCase().trim();
  
  // Try exact match first
  let ingredient = ingredients.find(ing => 
    ing.name?.toLowerCase() === cleanName ||
    ing.nameRo?.toLowerCase() === cleanName
  );
  
  if (!ingredient) {
    // Try partial match - check if ingredient name contains search term or vice versa
    ingredient = ingredients.find(ing => {
      const name = (ing.name || '').toLowerCase();
      const nameRo = (ing.nameRo || '').toLowerCase();
      const searchClean = cleanName.replace(/\(.*?\)/g, '').trim(); // Remove parentheses
      
      // Exact match without parentheses
      if (name === searchClean || nameRo === searchClean) return true;
      
      // Contains match
      if (name.includes(searchClean) || searchClean.includes(name)) return true;
      if (nameRo && (nameRo.includes(searchClean) || searchClean.includes(nameRo))) return true;
      
      return false;
    });
  }
  
  return ingredient;
}

async function fixAllRecipeMatches() {
  try {
    console.log('Loading all recipes and ingredients...\n');
    
    const recipes = await prisma.recipe.findMany({
      include: { ingredients: true },
      orderBy: { name: 'asc' }
    });
    
    const allIngredients = await prisma.ingredient.findMany();
    
    console.log(`Found ${recipes.length} recipes`);
    console.log(`Found ${allIngredients.length} ingredients\n`);
    
    let totalUpdated = 0;
    let recipesWithUpdates = 0;
    
    for (const recipe of recipes) {
      let recipeUpdated = false;
      const updates = [];
      
      for (const ing of recipe.ingredients) {
        // Skip if already matched
        if (ing.exists && ing.availableInApi && ing.apiMatch) {
          continue;
        }
        
        // Try to find ingredient
        let ingredient = await findIngredient(ing.name, allIngredients);
        
        // Special handling for common patterns
        if (!ingredient) {
          // Try removing "1 " prefix
          if (ing.name.startsWith('1 ')) {
            const nameWithout1 = ing.name.substring(2).trim();
            ingredient = await findIngredient(nameWithout1, allIngredients);
          }
          
          // Try removing " (cooked)" suffix
          if (!ingredient && ing.name.includes('(cooked)')) {
            const nameWithoutCooked = ing.name.replace(/\(cooked\)/gi, '').trim();
            ingredient = await findIngredient(nameWithoutCooked, allIngredients);
          }
          
          // Try removing unit from name
          if (!ingredient) {
            const nameWithoutUnit = ing.name.replace(/\s*\(.*?\)\s*$/g, '').trim();
            ingredient = await findIngredient(nameWithoutUnit, allIngredients);
          }
        }
        
        // If ingredient found but unit mismatch, prefer ingredient with matching unit pattern
        if (ingredient) {
          const per = (ingredient.per || '').toLowerCase();
          const unit = (ing.unit || '').toLowerCase();
          
          // If recipe has grams/ml but ingredient is per piece, try to find grams/ml version
          if ((unit === 'g' || unit === 'ml' || unit === 'gram' || unit === 'grams') && 
              (per === '1' || per.match(/^1\s*(piece|unit|egg)$/))) {
            // Try to find a version with 100g/ml basis
            const baseName = ing.name.replace(/^1\s+/i, '').replace(/\s*\(.*?\)\s*$/g, '').trim();
            const betterMatch = allIngredients.find(i => {
              const iName = (i.name || '').toLowerCase();
              const iNameRo = (i.nameRo || '').toLowerCase();
              const searchName = baseName.toLowerCase();
              const iPer = (i.per || '').toLowerCase();
              
              return (iName === searchName || iNameRo === searchName) && 
                     (iPer.includes('100') || iPer.includes('g') || iPer.includes('ml'));
            });
            
            if (betterMatch) {
              ingredient = betterMatch;
            }
          }
          
          // If recipe has piece but ingredient is per 100g, try to find piece version
          if ((unit === 'piece' || unit === 'pieces') && per.includes('100')) {
            // Try to find a version with "1" or piece basis
            const baseName = ing.name.replace(/\s*\(.*?\)\s*$/g, '').trim();
            const betterMatch = allIngredients.find(i => {
              const iName = (i.name || '').toLowerCase();
              const iNameRo = (i.nameRo || '').toLowerCase();
              const searchName = baseName.toLowerCase();
              const iPer = (i.per || '').toLowerCase();
              
              return (iName === searchName || iNameRo === searchName) && 
                     (iPer === '1' || iPer.match(/^1\s*(piece|unit|egg)$/));
            });
            
            if (betterMatch) {
              ingredient = betterMatch;
            }
          }
        }
        
        if (ingredient) {
          const apiMatch = JSON.stringify({
            id: ingredient.id,
            name: ingredient.name,
            nameRo: ingredient.nameRo
          });
          
          updates.push({
            id: ing.id,
            exists: true,
            availableInApi: true,
            apiMatch: apiMatch
          });
          
          recipeUpdated = true;
        } else {
          console.log(`  ⚠️  Still not found: ${ing.name} in recipe "${recipe.name}"`);
        }
      }
      
      // Update all ingredients for this recipe
      if (updates.length > 0) {
        for (const update of updates) {
          await prisma.recipeIngredient.update({
            where: { id: update.id },
            data: {
              exists: update.exists,
              availableInApi: update.availableInApi,
              apiMatch: update.apiMatch
            }
          });
        }
        
        totalUpdated += updates.length;
        recipesWithUpdates++;
        console.log(`✅ Updated ${updates.length} ingredients in "${recipe.name}"`);
      }
    }
    
    console.log(`\n\n📊 Summary:`);
    console.log(`   Recipes checked: ${recipes.length}`);
    console.log(`   Recipes updated: ${recipesWithUpdates}`);
    console.log(`   Total ingredients updated: ${totalUpdated}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAllRecipeMatches();


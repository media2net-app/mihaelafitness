// Script to fix all unit mismatches (g/ml with per="1" or piece with per="100g")
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUnitMismatches() {
  try {
    console.log('Finding and fixing unit mismatches...\n');
    
    const allIngredients = await prisma.ingredient.findMany();
    const recipeIngredients = await prisma.recipeIngredient.findMany({
      include: {
        recipe: {
          select: { name: true }
        }
      }
    });
    
    console.log(`Checking ${recipeIngredients.length} recipe ingredients\n`);
    
    let fixed = 0;
    const fixes = [];
    
    for (const ing of recipeIngredients) {
      if (!ing.apiMatch) continue;
      
      try {
        const match = JSON.parse(ing.apiMatch);
        const dbIng = allIngredients.find(i => i.id === match.id);
        
        if (!dbIng) continue;
        
        const per = (dbIng.per || '').toLowerCase();
        const unit = (ing.unit || '').toLowerCase();
        
        // Problem: Recipe has grams/ml but ingredient is per piece
        if ((unit === 'g' || unit === 'ml' || unit === 'gram' || unit === 'grams') && 
            (per === '1' || per.match(/^1\s*(piece|unit|egg)$/))) {
          
          // Find better match with 100g/ml basis
          const baseName = ing.name.replace(/^1\s+/i, '').replace(/\s*\(.*?\)\s*$/g, '').trim();
          const betterMatch = allIngredients.find(i => {
            const iName = (i.name || '').toLowerCase();
            const iNameRo = (i.nameRo || '').toLowerCase();
            const searchName = baseName.toLowerCase();
            const iPer = (i.per || '').toLowerCase();
            
            return (iName === searchName || iNameRo === searchName) && 
                   (iPer.includes('100') || (iPer.includes('g') && !iPer.includes('piece')) || iPer.includes('ml'));
          });
          
          if (betterMatch) {
            await prisma.recipeIngredient.update({
              where: { id: ing.id },
              data: {
                exists: true,
                availableInApi: true,
                apiMatch: JSON.stringify({
                  id: betterMatch.id,
                  name: betterMatch.name,
                  nameRo: betterMatch.nameRo
                })
              }
            });
            
            fixes.push({
              recipe: ing.recipe.name,
              ingredient: ing.name,
              old: dbIng.name,
              new: betterMatch.name
            });
            
            fixed++;
          }
        }
        
        // Problem: Recipe has piece but ingredient is per 100g
        if ((unit === 'piece' || unit === 'pieces') && per.includes('100')) {
          // Find better match with "1" or piece basis
          const baseName = ing.name.replace(/\s*\(.*?\)\s*$/g, '').trim();
          const betterMatch = allIngredients.find(i => {
            const iName = (i.name || '').toLowerCase();
            const iNameRo = (i.nameRo || '').toLowerCase();
            const searchName = baseName.toLowerCase();
            const iPer = (i.per || '').toLowerCase();
            
            return (iName === searchName || iNameRo === searchName || iName.includes(searchName) || searchName.includes(iName)) && 
                   (iPer === '1' || iPer.match(/^1\s*(piece|unit|egg)$/));
          });
          
          if (betterMatch) {
            await prisma.recipeIngredient.update({
              where: { id: ing.id },
              data: {
                exists: true,
                availableInApi: true,
                apiMatch: JSON.stringify({
                  id: betterMatch.id,
                  name: betterMatch.name,
                  nameRo: betterMatch.nameRo
                })
              }
            });
            
            fixes.push({
              recipe: ing.recipe.name,
              ingredient: ing.name,
              old: dbIng.name,
              new: betterMatch.name
            });
            
            fixed++;
          }
        }
      } catch (error) {
        // Skip invalid JSON
      }
    }
    
    console.log(`\n✅ Fixed ${fixed} unit mismatches:\n`);
    fixes.slice(0, 20).forEach(fix => {
      console.log(`  ${fix.recipe}: ${fix.ingredient}`);
      console.log(`    ${fix.old} -> ${fix.new}`);
    });
    if (fixes.length > 20) {
      console.log(`  ... and ${fixes.length - 20} more`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixUnitMismatches();


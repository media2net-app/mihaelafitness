// Script to specifically fix Avocado matches
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAvocadoMatches() {
  try {
    console.log('Fixing Avocado ingredient matches...\n');
    
    // Find the correct avocado ingredient (100g basis)
    const avocado100g = await prisma.ingredient.findFirst({
      where: {
        name: 'Avocado',
        per: { contains: '100' }
      }
    });
    
    if (!avocado100g) {
      console.log('❌ Avocado (100g) not found!');
      return;
    }
    
    console.log(`Found correct Avocado: ${avocado100g.name} (per: ${avocado100g.per})\n`);
    
    // Find all recipe ingredients with Avocado in name and unit 'g'
    const recipeIngredients = await prisma.recipeIngredient.findMany({
      where: {
        name: { contains: 'Avocado', mode: 'insensitive' },
        unit: { in: ['g', 'gram', 'grams'] }
      },
      include: {
        recipe: {
          select: { name: true }
        }
      }
    });
    
    console.log(`Found ${recipeIngredients.length} Avocado ingredients to fix\n`);
    
    let updated = 0;
    
    for (const ing of recipeIngredients) {
      // Check if it's matched to wrong ingredient
      if (ing.apiMatch) {
        const match = JSON.parse(ing.apiMatch);
        const currentIng = await prisma.ingredient.findUnique({
          where: { id: match.id }
        });
        
        if (currentIng && currentIng.per === '1') {
          // Wrong match - update to 100g version
          await prisma.recipeIngredient.update({
            where: { id: ing.id },
            data: {
              exists: true,
              availableInApi: true,
              apiMatch: JSON.stringify({
                id: avocado100g.id,
                name: avocado100g.name,
                nameRo: avocado100g.nameRo
              })
            }
          });
          
          console.log(`✅ Fixed: ${ing.recipe.name} - ${ing.name} (${ing.quantity}${ing.unit})`);
          updated++;
        }
      } else {
        // No match - add correct match
        await prisma.recipeIngredient.update({
          where: { id: ing.id },
          data: {
            exists: true,
            availableInApi: true,
            apiMatch: JSON.stringify({
              id: avocado100g.id,
              name: avocado100g.name,
              nameRo: avocado100g.nameRo
            })
          }
        });
        
        console.log(`✅ Added match: ${ing.recipe.name} - ${ing.name} (${ing.quantity}${ing.unit})`);
        updated++;
      }
    }
    
    console.log(`\n📊 Summary: Fixed ${updated} Avocado ingredients`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAvocadoMatches();


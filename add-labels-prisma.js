// Add labels to all recipes using Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addLabelsToAllRecipes() {
  try {
    console.log('🔄 Fetching all recipes...\n');
    
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        name: true,
        labels: true
      }
    });
    
    console.log(`✓ Loaded ${recipes.length} recipes\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const name = recipe.name.toLowerCase();
      
      // Determine labels
      let labels = [];
      
      // Breakfast recipes
      if (name.includes('breakfast egg wrap') || name.includes('breakfast')) {
        labels = ['breakfast'];
      } else {
        // All other recipes are lunch/dinner
        labels = ['lunch', 'dinner'];
      }
      
      // Check if update is needed
      const currentLabels = recipe.labels || [];
      const labelsMatch = JSON.stringify(currentLabels.sort()) === JSON.stringify(labels.sort());
      
      if (!labelsMatch) {
        try {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { labels: labels }
          });
          
          updated++;
          process.stdout.write(`\r[${i + 1}/${recipes.length}] Updated: ${recipe.name.substring(0, 50)}... ✓`);
        } catch (error) {
          console.log(`\n  ✗ Error updating ${recipe.name}: ${error.message}`);
          errors++;
        }
      } else {
        skipped++;
        process.stdout.write(`\r[${i + 1}/${recipes.length}] Skipped: ${recipe.name.substring(0, 50)}...`);
      }
    }
    
    console.log(`\n\n✅ Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped (already correct): ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${recipes.length}`);
    
    // Verify
    console.log(`\n🔍 Verifying labels...`);
    const verifyRecipes = await prisma.recipe.findMany({
      select: {
        name: true,
        labels: true
      }
    });
    
    const recipesWithLabels = verifyRecipes.filter(r => r.labels && r.labels.length > 0);
    const allLabels = Array.from(new Set(verifyRecipes.flatMap(r => r.labels || [])));
    
    console.log(`   Recipes with labels: ${recipesWithLabels.length}/${verifyRecipes.length}`);
    console.log(`   Unique labels: ${allLabels.join(', ')}`);
    
    if (recipesWithLabels.length > 0) {
      console.log(`\n   Sample recipes:`);
      recipesWithLabels.slice(0, 5).forEach(r => {
        console.log(`     - ${r.name}: ${r.labels.join(', ')}`);
      });
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

addLabelsToAllRecipes();


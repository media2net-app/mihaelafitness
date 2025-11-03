// Script to add labels to all recipes via API
// This will update all recipes with appropriate labels

async function addLabelsToRecipes() {
  try {
    console.log('🔄 Fetching all recipes...\n');
    
    const recipesResponse = await fetch('http://localhost:4000/api/recipes');
    if (!recipesResponse.ok) throw new Error('Failed to fetch recipes');
    const recipes = await recipesResponse.json();
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
      if (name.includes('breakfast egg wrap')) {
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
          const updateResponse = await fetch(`http://localhost:4000/api/recipes/${recipe.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              labels: labels
            }),
          });
          
          if (updateResponse.ok) {
            updated++;
            process.stdout.write(`\r[${i + 1}/${recipes.length}] Updated: ${recipe.name.substring(0, 50)}... ✓`);
          } else {
            const errorData = await updateResponse.json();
            console.log(`\n  ✗ Failed to update ${recipe.name}: ${errorData.error || 'Unknown error'}`);
            errors++;
          }
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
    const verifyResponse = await fetch('http://localhost:4000/api/recipes');
    const verifyRecipes = await verifyResponse.json();
    const recipesWithLabels = verifyRecipes.filter(r => r.labels && r.labels.length > 0);
    const allLabels = Array.from(new Set(verifyRecipes.flatMap(r => r.labels || [])));
    
    console.log(`   Recipes with labels: ${recipesWithLabels.length}/${verifyRecipes.length}`);
    console.log(`   Unique labels: ${allLabels.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addLabelsToRecipes();


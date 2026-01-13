// Update all recipes with labels
async function updateRecipes() {
  try {
    const response = await fetch('http://localhost:4000/api/recipes');
    const recipes = await response.json();
    
    let updated = 0;
    
    for (const recipe of recipes) {
      const name = recipe.name;
      let labels = [];
      
      // Breakfast recipes
      if (name.includes('Breakfast Egg Wrap')) {
        labels = ['breakfast'];
      } else {
        // All other recipes are lunch/dinner
        labels = ['lunch', 'dinner'];
      }
      
      // Only update if labels are different
      const currentLabels = recipe.labels || [];
      if (JSON.stringify(currentLabels.sort()) !== JSON.stringify(labels.sort())) {
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
            if (updated <= 5 || updated === recipes.length) {
              console.log(`✓ Updated: ${name} -> ${labels.join(', ')}`);
            }
          } else {
            console.error(`✗ Failed to update: ${name}`);
          }
        } catch (error) {
          console.error(`Error updating ${name}:`, error.message);
        }
      }
    }
    
    console.log(`\n✓ Successfully updated ${updated} out of ${recipes.length} recipes`);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateRecipes();







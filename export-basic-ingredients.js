const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportIngredients() {
  try {
    console.log('📦 Exporting BASIC ingredients (without nameRo/perRo) from local database...\n');
    
    // Fetch all ingredients
    const ingredients = await prisma.ingredient.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`✅ Found ${ingredients.length} ingredients in local database\n`);
    
    // Prepare data for export - ONLY basic required fields
    const exportData = ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      per: ing.per || '100g',
      calories: ing.calories,
      protein: ing.protein,
      carbs: ing.carbs,
      fat: ing.fat,
      fiber: ing.fiber || 0,
      sugar: ing.sugar || 0,
      category: ing.category || 'other',
      aliases: ing.aliases || [`Pure:${ing.name}`],
      isActive: ing.isActive !== undefined ? ing.isActive : true
    }));
    
    // Save to JSON file
    const exportPath = path.join(__dirname, 'ingredients-basic-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`💾 Exported ${ingredients.length} basic ingredients to: ${exportPath}`);
    console.log(`📊 File size: ${(fs.statSync(exportPath).size / 1024).toFixed(2)} KB\n`);
    console.log('✅ Export complete! Ready for production import.\n');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportIngredients();


const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportIngredients() {
  try {
    console.log('📦 Exporting ingredients from local database...\n');
    
    // Fetch all ingredients
    const ingredients = await prisma.ingredient.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`✅ Found ${ingredients.length} ingredients in local database\n`);
    
    // Show sample of ingredients
    if (ingredients.length > 0) {
      console.log('📋 Sample ingredients:');
      ingredients.slice(0, 5).forEach(ing => {
        console.log(`   - ${ing.name} (${ing.nameRo || 'no translation'}) - ${ing.calories} kcal, ${ing.protein}g P, ${ing.carbs}g C, ${ing.fat}g F`);
      });
      console.log(`   ... and ${ingredients.length - 5} more\n`);
    }
    
    // Prepare data for export (remove timestamps for cleaner import)
    const exportData = ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      nameRo: ing.nameRo,
      per: ing.per,
      perRo: ing.perRo,
      calories: ing.calories,
      protein: ing.protein,
      carbs: ing.carbs,
      fat: ing.fat,
      fiber: ing.fiber,
      sugar: ing.sugar,
      category: ing.category,
      aliases: ing.aliases,
      isActive: ing.isActive
    }));
    
    // Save to JSON file
    const exportPath = path.join(__dirname, 'ingredients-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`💾 Exported ${ingredients.length} ingredients to: ${exportPath}`);
    console.log(`📊 File size: ${(fs.statSync(exportPath).size / 1024).toFixed(2)} KB\n`);
    
    // Statistics
    const stats = {
      total: ingredients.length,
      withTranslation: ingredients.filter(i => i.nameRo).length,
      withFiber: ingredients.filter(i => i.fiber && i.fiber > 0).length,
      withCategory: ingredients.filter(i => i.category).length,
      categories: [...new Set(ingredients.map(i => i.category).filter(Boolean))]
    };
    
    console.log('📈 Statistics:');
    console.log(`   Total ingredients: ${stats.total}`);
    console.log(`   With Romanian translation: ${stats.withTranslation} (${((stats.withTranslation / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   With fiber data: ${stats.withFiber} (${((stats.withFiber / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   With category: ${stats.withCategory} (${((stats.withCategory / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   Categories found: ${stats.categories.join(', ')}\n`);
    
    console.log('✅ Export complete! Ready for production import.\n');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportIngredients();


const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

// Uitgebreide voedingswaarden database - gebaseerd op betrouwbare bronnen
const extendedNutritionDatabase = {
  // Bessen en fruit
  'blueberries': { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10.0, category: 'fruits' },
  'strawberries': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0, sugar: 4.9, category: 'fruits' },
  'mixed berries': { calories: 45, protein: 0.7, carbs: 11.1, fat: 0.3, fiber: 2.2, sugar: 7.5, category: 'fruits' },
  'frozen berries': { calories: 45, protein: 0.7, carbs: 11.1, fat: 0.3, fiber: 2.2, sugar: 7.5, category: 'fruits' },
  'berries': { calories: 45, protein: 0.7, carbs: 11.1, fat: 0.3, fiber: 2.2, sugar: 7.5, category: 'fruits' },

  // Granen en koolhydraten
  'bulgur': { calories: 83, protein: 3.1, carbs: 18.6, fat: 0.2, fiber: 4.5, sugar: 0.4, category: 'carbohydrates' },
  'cooked bulgur': { calories: 83, protein: 3.1, carbs: 18.6, fat: 0.2, fiber: 4.5, sugar: 0.4, category: 'carbohydrates' },
  'pancakes': { calories: 227, protein: 6.4, carbs: 28.0, fat: 9.7, fiber: 1.2, sugar: 6.2, category: 'carbohydrates' },

  // Groenten
  'zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1.0, sugar: 2.5, category: 'vegetables' },
  'steamed zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1.0, sugar: 2.5, category: 'vegetables' },
  'roasted zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1.0, sugar: 2.5, category: 'vegetables' },
  'green beans': { calories: 31, protein: 1.8, carbs: 7.0, fat: 0.1, fiber: 2.7, sugar: 3.3, category: 'vegetables' },
  'mushrooms': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0, sugar: 2.0, category: 'vegetables' },
  'asparagus': { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1, sugar: 1.9, category: 'vegetables' },
  'peas': { calories: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.1, sugar: 5.7, category: 'vegetables' },
  'cooked peas': { calories: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.1, sugar: 5.7, category: 'vegetables' },
  'mixed vegetables': { calories: 35, protein: 2.0, carbs: 7.0, fat: 0.2, fiber: 2.5, sugar: 3.5, category: 'vegetables' },
  'vegetables any': { calories: 35, protein: 2.0, carbs: 7.0, fat: 0.2, fiber: 2.5, sugar: 3.5, category: 'vegetables' },
  'vegetables': { calories: 35, protein: 2.0, carbs: 7.0, fat: 0.2, fiber: 2.5, sugar: 3.5, category: 'vegetables' },

  // Eiwitbronnen
  'white fish': { calories: 111, protein: 23.0, carbs: 0, fat: 1.0, fiber: 0, sugar: 0, category: 'proteins' },
  'protein powder': { calories: 370, protein: 80.0, carbs: 5.0, fat: 3.0, fiber: 0, sugar: 2.0, category: 'proteins' },
  'vegan protein': { calories: 370, protein: 80.0, carbs: 5.0, fat: 3.0, fiber: 0, sugar: 2.0, category: 'proteins' },
  'protein bar': { calories: 250, protein: 20.0, carbs: 25.0, fat: 8.0, fiber: 3.0, sugar: 15.0, category: 'proteins' },

  // Noten en zaden
  'sunflower seeds': { calories: 584, protein: 20.8, carbs: 20.0, fat: 51.5, fiber: 8.6, sugar: 2.6, category: 'nuts-seeds' },
  'mixed nuts': { calories: 607, protein: 20.0, carbs: 21.6, fat: 54.1, fiber: 7.0, sugar: 4.2, category: 'nuts-seeds' },
  'pumpkin seeds': { calories: 559, protein: 30.2, carbs: 10.7, fat: 49.1, fiber: 6.0, sugar: 1.4, category: 'nuts-seeds' },
  'flaxseeds': { calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3, sugar: 1.6, category: 'nuts-seeds' },

  // Peulvruchten
  'red beans': { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4, sugar: 0.3, category: 'proteins' },
  'lentil soup': { calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4, fiber: 7.9, sugar: 1.8, category: 'proteins' },
  'salad lentils': { calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4, fiber: 7.9, sugar: 1.8, category: 'proteins' },

  // Dips en sauzen
  'hummus': { calories: 166, protein: 7.9, carbs: 14.3, fat: 9.6, fiber: 6.0, sugar: 0.3, category: 'healthy-fats' },
  'lemon juice': { calories: 22, protein: 0.4, carbs: 6.9, fat: 0.2, fiber: 0.3, sugar: 2.5, category: 'other' },
  'pumpkin soup': { calories: 26, protein: 1.0, carbs: 6.5, fat: 0.1, fiber: 0.5, sugar: 2.8, category: 'vegetables' },

  // Salades
  'green salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, category: 'vegetables' },
  'salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, category: 'vegetables' },

  // Eiwit specifiek
  'whites': { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7, category: 'proteins' },
  'whites scrambled': { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7, category: 'proteins' }
};

// Functie om ingrediënt naam te normaliseren
function normalizeIngredientName(name) {
  let normalized = name.toLowerCase()
    .replace(/^\d+\s*(g|gram|grams|ml|tbsp|tsp|scoop|scoops|piece|pieces|stuk|stuks)\s*/i, '')
    .replace(/^\d+\s*/i, '')
    .trim();
  
  normalized = normalized
    .replace(/\s+(raw|fresh|organic|boiled|scrambled|fried|baked|cooked|dried|frozen|steamed|roasted|grilled|sauted|mixed|any)\s*/gi, ' ')
    .replace(/\s+(medium|large|small|big|extra)\s*/gi, ' ')
    .trim();
  
  return normalized;
}

// Functie om voedingswaarden te vinden
function findNutritionData(ingredientName) {
  const normalized = normalizeIngredientName(ingredientName);
  
  // Directe match
  if (extendedNutritionDatabase[normalized]) {
    return extendedNutritionDatabase[normalized];
  }
  
  // Zoek naar gedeeltelijke matches
  for (const [key, value] of Object.entries(extendedNutritionDatabase)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

// Functie om overige ingrediënten bij te werken
async function updateRemainingIngredients() {
  try {
    console.log('🔄 Bijwerken van overige ingrediënten...');
    
    const ingredients = await prisma.ingredient.findMany({
      where: {
        OR: [
          { calories: 0 },
          { 
            AND: [
              { protein: 0 },
              { carbs: 0 },
              { fat: 0 }
            ]
          }
        ]
      }
    });
    
    console.log(`📊 Gevonden ${ingredients.length} ingrediënten zonder volledige voedingswaarden`);
    
    let updated = 0;
    let notFound = 0;
    const notFoundList = [];
    
    for (const ingredient of ingredients) {
      const nutritionData = findNutritionData(ingredient.name);
      
      if (nutritionData) {
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: {
            calories: nutritionData.calories,
            protein: nutritionData.protein,
            carbs: nutritionData.carbs,
            fat: nutritionData.fat,
            fiber: nutritionData.fiber,
            sugar: nutritionData.sugar,
            category: nutritionData.category,
            per: '100g'
          }
        });
        
        console.log(`✅ Bijgewerkt: ${ingredient.name} -> ${nutritionData.calories} cal, ${nutritionData.protein}g eiwit`);
        updated++;
      } else {
        notFoundList.push(ingredient.name);
        notFound++;
      }
    }
    
    console.log('\n📈 RESULTATEN:');
    console.log(`✅ Bijgewerkt: ${updated} ingrediënten`);
    console.log(`❌ Nog steeds niet gevonden: ${notFound} ingrediënten`);
    
    if (notFoundList.length > 0) {
      console.log('\n❌ Ingrediënten die nog steeds voedingswaarden nodig hebben:');
      notFoundList.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log('\n🎉 Bijwerken voltooid!');
    
  } catch (error) {
    console.error('❌ Fout bij bijwerken van ingrediënten:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Functie om data kwaliteit te controleren
async function checkDataQuality() {
  try {
    console.log('🔍 Controleren van data kwaliteit...');
    
    const ingredients = await prisma.ingredient.findMany();
    
    const qualityStats = {
      total: ingredients.length,
      complete: 0,
      incomplete: 0,
      withCategories: 0,
      withoutCategories: 0,
      withAliases: 0,
      withoutAliases: 0
    };
    
    ingredients.forEach(ing => {
      // Een ingrediënt is compleet als het calorieën heeft EN niet alle macro's 0 zijn
      if (ing.calories > 0 && !(ing.protein === 0 && ing.carbs === 0 && ing.fat === 0)) {
        qualityStats.complete++;
      } else {
        qualityStats.incomplete++;
      }
      
      if (ing.category) {
        qualityStats.withCategories++;
      } else {
        qualityStats.withoutCategories++;
      }
      
      if (ing.aliases && ing.aliases.length > 0) {
        qualityStats.withAliases++;
      } else {
        qualityStats.withoutAliases++;
      }
    });
    
    console.log('\n📊 DATA KWALITEIT RAPPORT:');
    console.log(`📈 Totaal ingrediënten: ${qualityStats.total}`);
    console.log(`✅ Volledige voedingswaarden: ${qualityStats.complete} (${Math.round(qualityStats.complete/qualityStats.total*100)}%)`);
    console.log(`❌ Onvolledige voedingswaarden: ${qualityStats.incomplete} (${Math.round(qualityStats.incomplete/qualityStats.total*100)}%)`);
    console.log(`🏷️ Met categorieën: ${qualityStats.withCategories} (${Math.round(qualityStats.withCategories/qualityStats.total*100)}%)`);
    console.log(`❓ Zonder categorieën: ${qualityStats.withoutCategories} (${Math.round(qualityStats.withoutCategories/qualityStats.total*100)}%)`);
    console.log(`🔗 Met aliassen: ${qualityStats.withAliases} (${Math.round(qualityStats.withAliases/qualityStats.total*100)}%)`);
    console.log(`❓ Zonder aliassen: ${qualityStats.withoutAliases} (${Math.round(qualityStats.withoutAliases/qualityStats.total*100)}%)`);
    
    if (qualityStats.complete / qualityStats.total > 0.8) {
      console.log('\n🎉 Uitstekende data kwaliteit! Meer dan 80% van de ingrediënten heeft volledige voedingswaarden.');
    } else if (qualityStats.complete / qualityStats.total > 0.6) {
      console.log('\n👍 Goede data kwaliteit. Er is nog ruimte voor verbetering.');
    } else {
      console.log('\n⚠️ Data kwaliteit kan verbeterd worden. Veel ingrediënten missen voedingswaarden.');
    }
    
  } catch (error) {
    console.error('❌ Fout bij controleren van data kwaliteit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main functie
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'update':
      await updateRemainingIngredients();
      break;
    case 'quality':
      await checkDataQuality();
      break;
    case 'both':
      await updateRemainingIngredients();
      await checkDataQuality();
      break;
    default:
      console.log('Gebruik: node complete-nutrition-database.js [update|quality|both]');
      console.log('  update: Bijwerken van overige ingrediënten');
      console.log('  quality: Controleren van data kwaliteit');
      console.log('  both: Beide acties uitvoeren');
      break;
  }
}

main();

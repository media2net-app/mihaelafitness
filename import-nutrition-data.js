const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

// Voedingswaarden database - gebaseerd op betrouwbare bronnen
const nutritionDatabase = {
  // Fruit
  'apple': { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4, category: 'fruits' },
  'banana': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2, category: 'fruits' },
  'kiwi': { calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3.0, sugar: 9.0, category: 'fruits' },
  'pear': { calories: 57, protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1, sugar: 9.8, category: 'fruits' },
  'orange': { calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4, category: 'fruits' },
  'strawberry': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0, sugar: 4.9, category: 'fruits' },
  'blueberry': { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10.0, category: 'fruits' },
  'grape': { calories: 67, protein: 0.6, carbs: 17.0, fat: 0.4, fiber: 0.9, sugar: 16.0, category: 'fruits' },
  'pineapple': { calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, sugar: 9.9, category: 'fruits' },
  'mango': { calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6, sugar: 13.7, category: 'fruits' },

  // Groenten
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, category: 'vegetables' },
  'cucumber': { calories: 16, protein: 0.7, carbs: 4.0, fat: 0.1, fiber: 0.5, sugar: 1.7, category: 'vegetables' },
  'carrot': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7, category: 'vegetables' },
  'broccoli': { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6, sugar: 1.5, category: 'vegetables' },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, category: 'vegetables' },
  'arugula': { calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, fiber: 1.6, sugar: 2.1, category: 'vegetables' },
  'bell pepper': { calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.5, sugar: 2.4, category: 'vegetables' },
  'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, category: 'vegetables' },
  'garlic': { calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1, sugar: 1.0, category: 'vegetables' },
  'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, category: 'vegetables' },

  // Eiwitbronnen
  'egg': { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0, sugar: 1.1, category: 'proteins' },
  'chicken breast': { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, category: 'proteins' },
  'salmon': { calories: 208, protein: 25.4, carbs: 0, fat: 12.4, fiber: 0, sugar: 0, category: 'proteins' },
  'tuna': { calories: 132, protein: 28.0, carbs: 0, fat: 1.3, fiber: 0, sugar: 0, category: 'proteins' },
  'beef': { calories: 250, protein: 26.0, carbs: 0, fat: 15.0, fiber: 0, sugar: 0, category: 'proteins' },
  'pork': { calories: 242, protein: 27.3, carbs: 0, fat: 13.9, fiber: 0, sugar: 0, category: 'proteins' },
  'turkey': { calories: 189, protein: 29.0, carbs: 0, fat: 7.0, fiber: 0, sugar: 0, category: 'proteins' },
  'greek yogurt': { calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, category: 'dairy' },
  'cottage cheese': { calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7, category: 'dairy' },
  'quark': { calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, category: 'dairy' },

  // Koolhydraten
  'oats': { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0, category: 'carbohydrates' },
  'rice': { calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, fiber: 0.4, sugar: 0.1, category: 'carbohydrates' },
  'pasta': { calories: 131, protein: 5.0, carbs: 25.0, fat: 1.1, fiber: 1.8, sugar: 0.6, category: 'carbohydrates' },
  'bread': { calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, fiber: 2.7, sugar: 5.7, category: 'carbohydrates' },
  'potato': { calories: 77, protein: 2.0, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8, category: 'carbohydrates' },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0, sugar: 4.2, category: 'carbohydrates' },
  'quinoa': { calories: 120, protein: 4.4, carbs: 22.0, fat: 1.9, fiber: 2.8, sugar: 0.9, category: 'carbohydrates' },

  // Gezonde vetten
  'avocado': { calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7, category: 'healthy-fats' },
  'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, category: 'healthy-fats' },
  'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, category: 'healthy-fats' },
  'almond butter': { calories: 614, protein: 21.2, carbs: 18.8, fat: 55.5, fiber: 10.3, sugar: 4.4, category: 'healthy-fats' },
  'peanut butter': { calories: 588, protein: 25.1, carbs: 20.0, fat: 50.4, fiber: 8.5, sugar: 9.2, category: 'healthy-fats' },

  // Noten en zaden
  'almonds': { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, sugar: 4.4, category: 'nuts-seeds' },
  'walnuts': { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7, sugar: 2.6, category: 'nuts-seeds' },
  'cashews': { calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8, fiber: 3.3, sugar: 5.9, category: 'nuts-seeds' },
  'chia seeds': { calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4, sugar: 0, category: 'nuts-seeds' },
  'flax seeds': { calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3, sugar: 1.6, category: 'nuts-seeds' },

  // Zuivel
  'milk': { calories: 42, protein: 3.4, carbs: 5.0, fat: 1.0, fiber: 0, sugar: 5.0, category: 'dairy' },
  'almond milk': { calories: 15, protein: 0.6, carbs: 0.6, fat: 1.1, fiber: 0.4, sugar: 0.2, category: 'dairy' },
  'coconut milk': { calories: 230, protein: 2.3, carbs: 6.0, fat: 24.0, fiber: 2.2, sugar: 3.3, category: 'dairy' },
  'cheese': { calories: 113, protein: 7.0, carbs: 1.0, fat: 9.0, fiber: 0, sugar: 1.0, category: 'dairy' },

  // Andere
  'honey': { calories: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2, sugar: 82.1, category: 'other' },
  'maple syrup': { calories: 260, protein: 0, carbs: 67.0, fat: 0, fiber: 0, sugar: 67.0, category: 'other' },
  'cocoa powder': { calories: 228, protein: 19.6, carbs: 57.9, fat: 13.7, fiber: 33.2, sugar: 1.8, category: 'other' },
  'cinnamon': { calories: 247, protein: 4.0, carbs: 80.6, fat: 1.2, fiber: 53.1, sugar: 2.2, category: 'other' }
};

// Functie om ingrediënt naam te normaliseren
function normalizeIngredientName(name) {
  // Verwijder nummers en eenheden aan het begin
  let normalized = name.toLowerCase()
    .replace(/^\d+\s*(g|gram|grams|ml|tbsp|tsp|scoop|scoops|piece|pieces|stuk|stuks)\s*/i, '')
    .replace(/^\d+\s*/i, '')
    .trim();
  
  // Verwijder veelvoorkomende woorden
  normalized = normalized
    .replace(/\s+(raw|fresh|organic|boiled|scrambled|fried|baked|cooked|dried|frozen)\s*/gi, ' ')
    .replace(/\s+(medium|large|small|big|extra)\s*/gi, ' ')
    .trim();
  
  return normalized;
}

// Functie om voedingswaarden te vinden
function findNutritionData(ingredientName) {
  const normalized = normalizeIngredientName(ingredientName);
  
  // Directe match
  if (nutritionDatabase[normalized]) {
    return nutritionDatabase[normalized];
  }
  
  // Zoek naar gedeeltelijke matches
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

// Functie om ingrediënten bij te werken
async function updateIngredients() {
  try {
    console.log('🔄 Starten met bijwerken van ingrediënten...');
    
    const ingredients = await prisma.ingredient.findMany();
    console.log(`📊 Gevonden ${ingredients.length} ingrediënten om te verwerken`);
    
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
    console.log(`❌ Niet gevonden: ${notFound} ingrediënten`);
    
    if (notFoundList.length > 0) {
      console.log('\n❌ Ingrediënten zonder voedingswaarden:');
      notFoundList.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log('\n🎉 Bijwerken voltooid!');
    
  } catch (error) {
    console.error('❌ Fout bij bijwerken van ingrediënten:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Functie om nieuwe ingrediënten toe te voegen
async function addMissingIngredients() {
  try {
    console.log('🔄 Controleren op ontbrekende ingrediënten...');
    
    const existingIngredients = await prisma.ingredient.findMany();
    const existingNames = existingIngredients.map(ing => normalizeIngredientName(ing.name));
    
    const missingIngredients = [];
    
    for (const [name, data] of Object.entries(nutritionDatabase)) {
      if (!existingNames.includes(name)) {
        missingIngredients.push({
          name: name,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          fiber: data.fiber,
          sugar: data.sugar,
          category: data.category,
          per: '100g',
          aliases: [],
          isActive: true
        });
      }
    }
    
    if (missingIngredients.length > 0) {
      console.log(`📝 Toevoegen van ${missingIngredients.length} ontbrekende ingrediënten...`);
      
      for (const ingredient of missingIngredients) {
        await prisma.ingredient.create({
          data: ingredient
        });
        console.log(`➕ Toegevoegd: ${ingredient.name}`);
      }
      
      console.log(`✅ ${missingIngredients.length} ingrediënten toegevoegd!`);
    } else {
      console.log('✅ Alle ingrediënten zijn al aanwezig in de database');
    }
    
  } catch (error) {
    console.error('❌ Fout bij toevoegen van ingrediënten:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main functie
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'update':
      await updateIngredients();
      break;
    case 'add':
      await addMissingIngredients();
      break;
    case 'both':
      await updateIngredients();
      await addMissingIngredients();
      break;
    default:
      console.log('Gebruik: node import-nutrition-data.js [update|add|both]');
      console.log('  update: Bijwerken van bestaande ingrediënten');
      console.log('  add: Toevoegen van ontbrekende ingrediënten');
      console.log('  both: Beide acties uitvoeren');
      break;
  }
}

main();

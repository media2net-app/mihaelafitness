// Script to add missing ingredients to the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const missingIngredients = [
  {
    name: "Almond Flour",
    nameRo: "Făină de Migdale",
    calories: 600,
    protein: 21,
    carbs: 10,
    fat: 53,
    fiber: 11,
    per: "100g",
    category: "flour"
  },
  {
    name: "Rye Flour",
    nameRo: "Făină de Secară",
    calories: 325,
    protein: 9,
    carbs: 68,
    fat: 2,
    fiber: 15,
    per: "100g",
    category: "flour"
  },
  {
    name: "Cocoa Powder",
    nameRo: "Praf de Cacao",
    calories: 228,
    protein: 20,
    carbs: 58,
    fat: 14,
    fiber: 33,
    per: "100g",
    category: "spice"
  },
  {
    name: "Semolina",
    nameRo: "Griș",
    calories: 360,
    protein: 12,
    carbs: 73,
    fat: 1,
    fiber: 4,
    per: "100g",
    category: "flour"
  },
  {
    name: "Green Olives",
    nameRo: "Măsline Verzi",
    calories: 116,
    protein: 1,
    carbs: 6,
    fat: 11,
    fiber: 3,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Chili Powder",
    nameRo: "Praf de Chili",
    calories: 282,
    protein: 13,
    carbs: 50,
    fat: 14,
    fiber: 34,
    per: "100g",
    category: "spice"
  },
  {
    name: "Mixed Berries",
    nameRo: "Fructe de Pădure Mixte",
    calories: 57,
    protein: 1,
    carbs: 14,
    fat: 0.3,
    fiber: 2.4,
    per: "100g",
    category: "fruit"
  },
  {
    name: "Rum Extract",
    nameRo: "Extract de Rom",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    per: "1 tsp",
    category: "spice"
  },
  {
    name: "Frozen Mixed Berries",
    nameRo: "Fructe de Pădure Congelate",
    calories: 57,
    protein: 1,
    carbs: 14,
    fat: 0.3,
    fiber: 2.4,
    per: "100g",
    category: "fruit"
  },
  {
    name: "Coffee",
    nameRo: "Cafea",
    calories: 2,
    protein: 0.1,
    carbs: 0,
    fat: 0,
    fiber: 0,
    per: "100g",
    category: "beverage"
  }
];

async function addMissingIngredients() {
  try {
    console.log('Adding missing ingredients...\n');
    
    let added = 0;
    let skipped = 0;
    
    for (const ing of missingIngredients) {
      // Check if already exists
      const existing = await prisma.ingredient.findFirst({
        where: {
          name: {
            equals: ing.name,
            mode: 'insensitive'
          }
        }
      });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${ing.name} (already exists)`);
        skipped++;
        continue;
      }
      
      // Create ingredient
      await prisma.ingredient.create({
        data: {
          name: ing.name,
          nameRo: ing.nameRo || null,
          calories: ing.calories,
          protein: ing.protein,
          carbs: ing.carbs,
          fat: ing.fat,
          fiber: ing.fiber || 0,
          sugar: 0,
          category: ing.category || 'other',
          per: ing.per,
          aliases: [`Pure:${ing.name}`],
          isActive: true
        }
      });
      
      console.log(`✅ Added: ${ing.name} - ${ing.calories} kcal/100g, ${ing.protein}g protein, ${ing.carbs}g carbs, ${ing.fat}g fat`);
      added++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Added: ${added} ingredients`);
    console.log(`   Skipped: ${skipped} ingredients (already exist)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addMissingIngredients();







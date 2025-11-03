// Script to add all missing ingredients from all recipes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Macro data for missing ingredients (per 100g unless specified)
const missingIngredients = [
  {
    name: "1 Cod Fillet",
    nameRo: "1 File de Cod",
    calories: 82,
    protein: 18,
    carbs: 0,
    fat: 0.7,
    fiber: 0,
    per: "1 piece",
    category: "fish"
  },
  {
    name: "Asparagus",
    nameRo: "Sparanghel",
    calories: 20,
    protein: 2.2,
    carbs: 3.9,
    fat: 0.1,
    fiber: 2.1,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Avocado",
    nameRo: "Avocado",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 15,
    fiber: 6.7,
    per: "100g",
    category: "fruit"
  },
  {
    name: "Banana",
    nameRo: "Banane",
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6,
    per: "100g",
    category: "fruit"
  },
  {
    name: "Basmati Rice (cooked)",
    nameRo: "Orez Basmati (fiert)",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    per: "100g",
    category: "grain"
  },
  {
    name: "Beans",
    nameRo: "Fasole",
    calories: 127,
    protein: 8.7,
    carbs: 22.8,
    fat: 0.5,
    fiber: 6.4,
    per: "100g",
    category: "legume"
  },
  {
    name: "Beef",
    nameRo: "Carne de Vită",
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 17,
    fiber: 0,
    per: "100g",
    category: "meat"
  },
  {
    name: "Bell Pepper",
    nameRo: "Ardei Gras",
    calories: 31,
    protein: 1,
    carbs: 7,
    fat: 0.3,
    fiber: 2.5,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Broccoli",
    nameRo: "Broccoli",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Brown Rice (cooked)",
    nameRo: "Orez Brun (fiert)",
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    per: "100g",
    category: "grain"
  },
  {
    name: "Bulgur (cooked)",
    nameRo: "Bulgur (fiert)",
    calories: 83,
    protein: 3.1,
    carbs: 18.6,
    fat: 0.2,
    fiber: 4.5,
    per: "100g",
    category: "grain"
  },
  {
    name: "Butter",
    nameRo: "Unt",
    calories: 717,
    protein: 0.9,
    carbs: 0.1,
    fat: 81,
    fiber: 0,
    per: "100g",
    category: "dairy"
  },
  {
    name: "Cabbage",
    nameRo: "Varză",
    calories: 25,
    protein: 1.3,
    carbs: 6,
    fat: 0.1,
    fiber: 2.5,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Carrot",
    nameRo: "Morcov",
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    fiber: 2.8,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Celery",
    nameRo: "Țelină",
    calories: 16,
    protein: 0.7,
    carbs: 3,
    fat: 0.2,
    fiber: 1.6,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Cheddar Cheese",
    nameRo: "Brânză Cheddar",
    calories: 402,
    protein: 25,
    carbs: 1.3,
    fat: 33,
    fiber: 0,
    per: "100g",
    category: "dairy"
  },
  {
    name: "Cherry Tomatoes",
    nameRo: "Roșii Cherry",
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Chia Seeds",
    nameRo: "Semințe de Chia",
    calories: 486,
    protein: 17,
    carbs: 42,
    fat: 31,
    fiber: 34,
    per: "100g",
    category: "seed"
  },
  {
    name: "Chicken Breast",
    nameRo: "Piept de Pui",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    per: "100g",
    category: "meat"
  },
  {
    name: "Chicken Thigh",
    nameRo: "Coapsă de Pui",
    calories: 209,
    protein: 26,
    carbs: 0,
    fat: 10.9,
    fiber: 0,
    per: "100g",
    category: "meat"
  },
  {
    name: "Cottage Cheese",
    nameRo: "Brânză Cottage",
    calories: 98,
    protein: 11,
    carbs: 3.4,
    fat: 4.3,
    fiber: 0,
    per: "100g",
    category: "dairy"
  },
  {
    name: "Couscous",
    nameRo: "Couscous",
    calories: 112,
    protein: 3.8,
    carbs: 23,
    fat: 0.2,
    fiber: 1.4,
    per: "100g",
    category: "grain"
  },
  {
    name: "Cucumber",
    nameRo: "Castravete",
    calories: 16,
    protein: 0.7,
    carbs: 4,
    fat: 0.1,
    fiber: 0.5,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Greek Yogurt",
    nameRo: "Iaurt Grecesc",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    per: "100g",
    category: "dairy"
  },
  {
    name: "Green Beans",
    nameRo: "Fasole Verde",
    calories: 31,
    protein: 1.8,
    carbs: 7,
    fat: 0.2,
    fiber: 2.7,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Honey",
    nameRo: "Miere",
    calories: 304,
    protein: 0.3,
    carbs: 82,
    fat: 0,
    fiber: 0.2,
    per: "100g",
    category: "sweetener"
  },
  {
    name: "Lentils",
    nameRo: "Lințe",
    calories: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4,
    fiber: 8,
    per: "100g",
    category: "legume"
  },
  {
    name: "Light Cheese Sauce",
    nameRo: "Sos de Brânză Ușoară",
    calories: 120,
    protein: 8,
    carbs: 6,
    fat: 7,
    fiber: 0,
    per: "100g",
    category: "sauce"
  },
  {
    name: "Light Cream Sauce",
    nameRo: "Sos de Smântână Ușoară",
    calories: 150,
    protein: 3,
    carbs: 8,
    fat: 12,
    fiber: 0,
    per: "100g",
    category: "sauce"
  },
  {
    name: "Milk",
    nameRo: "Lapte",
    calories: 42,
    protein: 3.4,
    carbs: 5,
    fat: 1,
    fiber: 0,
    per: "100ml",
    category: "dairy"
  },
  {
    name: "Mushrooms",
    nameRo: "Ciuperci",
    calories: 22,
    protein: 3.1,
    carbs: 3.3,
    fat: 0.3,
    fiber: 1,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Oats",
    nameRo: "Ovăz",
    calories: 389,
    protein: 17,
    carbs: 66,
    fat: 7,
    fiber: 11,
    per: "100g",
    category: "grain"
  },
  {
    name: "Olive Oil",
    nameRo: "Ulei de Măsline",
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    per: "100g",
    category: "oil"
  },
  {
    name: "Onion",
    nameRo: "Ceapă",
    calories: 40,
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1,
    fiber: 1.7,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Pasta (cooked)",
    nameRo: "Paste (fierte)",
    calories: 131,
    protein: 5,
    carbs: 25,
    fat: 1.1,
    fiber: 1.8,
    per: "100g",
    category: "grain"
  },
  {
    name: "Peanut Butter",
    nameRo: "Unt de Arahide",
    calories: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    fiber: 6,
    per: "100g",
    category: "nut"
  },
  {
    name: "Peas",
    nameRo: "Mazăre",
    calories: 81,
    protein: 5.4,
    carbs: 14,
    fat: 0.4,
    fiber: 5.1,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Pesto Sauce",
    nameRo: "Sos Pesto",
    calories: 263,
    protein: 3.2,
    carbs: 5.2,
    fat: 26,
    fiber: 1.2,
    per: "100g",
    category: "sauce"
  },
  {
    name: "Pork",
    nameRo: "Carne de Porc",
    calories: 242,
    protein: 27,
    carbs: 0,
    fat: 14,
    fiber: 0,
    per: "100g",
    category: "meat"
  },
  {
    name: "Potato",
    nameRo: "Cartof",
    calories: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1,
    fiber: 2.2,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Protein Powder",
    nameRo: "Pudră Proteică",
    calories: 400,
    protein: 75,
    carbs: 5,
    fat: 5,
    fiber: 0,
    per: "100g",
    category: "supplement"
  },
  {
    name: "Pumpkin",
    nameRo: "Dovleac",
    calories: 26,
    protein: 1,
    carbs: 7,
    fat: 0.1,
    fiber: 0.5,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Quinoa",
    nameRo: "Quinoa",
    calories: 368,
    protein: 14,
    carbs: 64,
    fat: 6,
    fiber: 7,
    per: "100g",
    category: "grain"
  },
  {
    name: "Salad",
    nameRo: "Salată",
    calories: 15,
    protein: 1.4,
    carbs: 2.9,
    fat: 0.2,
    fiber: 1.3,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Salmon",
    nameRo: "Somon",
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    fiber: 0,
    per: "100g",
    category: "fish"
  },
  {
    name: "Shrimp",
    nameRo: "Creveți",
    calories: 85,
    protein: 18,
    carbs: 0.9,
    fat: 0.5,
    fiber: 0,
    per: "100g",
    category: "fish"
  },
  {
    name: "Smoked Meat",
    nameRo: "Carne Afumată",
    calories: 216,
    protein: 26,
    carbs: 0.5,
    fat: 12,
    fiber: 0,
    per: "100g",
    category: "meat"
  },
  {
    name: "Spinach",
    nameRo: "Spanac",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Sweet Potato",
    nameRo: "Cartof Dulce",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    fiber: 3,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Tomato",
    nameRo: "Roșie",
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    per: "100g",
    category: "vegetable"
  },
  {
    name: "Tuna",
    nameRo: "Ton",
    calories: 144,
    protein: 30,
    carbs: 0,
    fat: 1,
    fiber: 0,
    per: "100g",
    category: "fish"
  },
  {
    name: "Turkey Breast",
    nameRo: "Piept de Curcan",
    calories: 135,
    protein: 30,
    carbs: 0,
    fat: 1,
    fiber: 0,
    per: "100g",
    category: "meat"
  },
  {
    name: "White Bread",
    nameRo: "Pâine Albă",
    calories: 265,
    protein: 9,
    carbs: 49,
    fat: 3.2,
    fiber: 2.7,
    per: "100g",
    category: "grain"
  },
  {
    name: "Wholemeal Pasta",
    nameRo: "Paste Integrale",
    calories: 124,
    protein: 5,
    carbs: 23,
    fat: 1.1,
    fiber: 2.2,
    per: "100g",
    category: "grain"
  },
  {
    name: "Wine",
    nameRo: "Vin",
    calories: 83,
    protein: 0.1,
    carbs: 2.6,
    fat: 0,
    fiber: 0,
    per: "100ml",
    category: "beverage"
  },
  {
    name: "Wrap whole wheat (60 grame)",
    nameRo: "Tortilla Integră (60 grame)",
    calories: 220,
    protein: 7,
    carbs: 40,
    fat: 4,
    fiber: 4,
    per: "1 piece",
    category: "grain"
  },
  {
    name: "Yogurt Cream",
    nameRo: "Cremă de Iaurt",
    calories: 130,
    protein: 5,
    carbs: 10,
    fat: 8,
    fiber: 0,
    per: "100g",
    category: "dairy"
  },
  {
    name: "Zucchini",
    nameRo: "Dovlecei",
    calories: 17,
    protein: 1.2,
    carbs: 3.1,
    fat: 0.3,
    fiber: 1,
    per: "100g",
    category: "vegetable"
  }
];

async function addMissingIngredients() {
  try {
    console.log('Adding missing ingredients...\n');
    
    let added = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const ing of missingIngredients) {
      try {
        // Check if already exists (case insensitive)
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
        
        console.log(`✅ Added: ${ing.name} - ${ing.calories} kcal/${ing.per}, ${ing.protein}g protein, ${ing.carbs}g carbs, ${ing.fat}g fat`);
        added++;
      } catch (error) {
        console.error(`❌ Error adding ${ing.name}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n\n📊 Summary:`);
    console.log(`   Added: ${added} ingredients`);
    console.log(`   Skipped: ${skipped} ingredients (already exist)`);
    console.log(`   Errors: ${errors} ingredients`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addMissingIngredients();


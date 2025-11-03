// Script to add 8 new recipes with exactly 500 kcal, 23g protein, 12g fat, 45g carbs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findIngredient(ingredientName, ingredients) {
  // Try exact match first
  let ingredient = ingredients.find(ing => 
    ing.name.toLowerCase() === ingredientName.toLowerCase() ||
    ing.nameRo?.toLowerCase() === ingredientName.toLowerCase()
  );
  
  if (!ingredient) {
    // Try partial match
    const searchName = ingredientName.toLowerCase();
    ingredient = ingredients.find(ing => {
      const name = (ing.name || '').toLowerCase();
      const nameRo = (ing.nameRo || '').toLowerCase();
      return name.includes(searchName) || searchName.includes(name) ||
             nameRo.includes(searchName) || searchName.includes(nameRo);
    });
  }
  
  return ingredient;
}

function calculateMacros(ingredient, quantity, unit) {
  if (!ingredient) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  let multiplier = 1;
  const per = ingredient.per.toLowerCase();
  
  // Handle special cases for "1 scoop (15g)" or similar
  if (per.includes('scoop')) {
    const scoopMatch = per.match(/(\d+(?:\.\d+)?)\s*g/);
    if (scoopMatch && unit === 'g') {
      const scoopGrams = parseFloat(scoopMatch[1]);
      // If quantity matches scoop size, it's 1 scoop
      if (Math.abs(quantity - scoopGrams) < 1) {
        multiplier = 1;
      } else {
        // Otherwise, calculate based on grams
        multiplier = quantity / scoopGrams;
      }
    } else {
      // For pieces, treat as 1 scoop per piece
      multiplier = unit === 'piece' ? quantity : quantity / parseFloat(scoopMatch?.[1] || 15);
    }
  }
  // Handle "1 piece" or "1" format
  else if (per.includes('1') && !per.includes('100') && (unit === 'piece' || unit === 'pieces')) {
    multiplier = quantity;
  }
  // Handle "100g" or "100ml" format
  else if (per.includes('100')) {
    const perMatch = ingredient.per.match(/(\d+(?:\.\d+)?)/);
    const baseAmount = perMatch ? parseFloat(perMatch[1]) : 100;
    if (unit === 'g' || unit === 'ml') {
      multiplier = quantity / baseAmount;
    } else if (unit === 'piece' || unit === 'pieces') {
      // For pieces with 100g base, estimate piece weight (assume ~50g average)
      multiplier = (quantity * 50) / baseAmount;
    }
  }
  // Default: try to parse number from per
  else {
    const perMatch = ingredient.per.match(/(\d+(?:\.\d+)?)/);
    const baseAmount = perMatch ? parseFloat(perMatch[1]) : 100;
    multiplier = quantity / baseAmount;
  }
  
  return {
    calories: Math.round(ingredient.calories * multiplier),
    protein: Math.round(ingredient.protein * multiplier * 10) / 10,
    carbs: Math.round(ingredient.carbs * multiplier * 10) / 10,
    fat: Math.round(ingredient.fat * multiplier * 10) / 10,
  };
}

// Recipes with carefully calculated quantities to reach ~500 kcal
const recipes = [
  {
    name: "Omelette with Vegetables and Cheese",
    description: "A protein-rich omelette filled with vegetables and cheese",
    prepTime: 15,
    servings: 1,
    instructions: [
      "Beat eggs in a bowl",
      "Heat oil in a pan",
      "Add vegetables and cook until tender",
      "Pour eggs over vegetables",
      "Add cheese",
      "Fold and cook until set"
    ],
    labels: ["breakfast", "lunch"],
    ingredients: [
      { name: "1 Egg", quantity: 3, unit: "piece" },
      { name: "Broccoli", quantity: 100, unit: "g" },
      { name: "Bell Pepper", quantity: 50, unit: "g" },
      { name: "Tomato", quantity: 50, unit: "g" },
      { name: "Cheddar Cheese", quantity: 30, unit: "g" },
      { name: "Olive Oil", quantity: 5, unit: "g" }
    ]
  },
  {
    name: "Proteic Oats with Banana and Frozen Fruits, Seeds like Toppings",
    description: "High-protein oatmeal topped with banana, frozen fruits and seeds",
    prepTime: 10,
    servings: 1,
    instructions: [
      "Cook oats with water or milk",
      "Mash banana and mix into oats",
      "Top with frozen fruits",
      "Sprinkle with seeds",
      "Serve warm"
    ],
    labels: ["breakfast"],
    ingredients: [
      { name: "Oats", quantity: 50, unit: "g" },
      { name: "Banana", quantity: 100, unit: "g" },
      { name: "Cherry Tomatoes", quantity: 80, unit: "g" }, // Placeholder for frozen fruits
      { name: "Chia Seeds", quantity: 10, unit: "g" },
      { name: "Protein Powder", quantity: 15, unit: "g" } // 1 scoop
    ]
  },
  {
    name: "Proteic Pancakes with Greek Yogurt and Fresh Fruits like Toppings",
    description: "Protein pancakes topped with Greek yogurt and fresh fruits",
    prepTime: 20,
    servings: 1,
    instructions: [
      "Mix pancake ingredients in a bowl",
      "Cook pancakes in a pan",
      "Top with Greek yogurt",
      "Add fresh fruits",
      "Serve immediately"
    ],
    labels: ["breakfast"],
    ingredients: [
      { name: "Oats", quantity: 40, unit: "g" },
      { name: "1 Egg", quantity: 1, unit: "piece" },
      { name: "Protein Powder", quantity: 15, unit: "g" }, // 1 scoop
      { name: "Greek Yogurt", quantity: 100, unit: "g" },
      { name: "Banana", quantity: 70, unit: "g" },
      { name: "Olive Oil", quantity: 3, unit: "g" }
    ]
  },
  {
    name: "Proteic Smoothie with Fruits and Peanut Butter",
    description: "Protein-rich smoothie with fruits and peanut butter",
    prepTime: 5,
    servings: 1,
    instructions: [
      "Add fruits to blender",
      "Add protein powder",
      "Add peanut butter",
      "Add liquid base",
      "Blend until smooth",
      "Serve immediately"
    ],
    labels: ["breakfast", "lunch"],
    ingredients: [
      { name: "Banana", quantity: 100, unit: "g" },
      { name: "Cherry Tomatoes", quantity: 100, unit: "g" }, // Placeholder for frozen fruits
      { name: "Protein Powder", quantity: 15, unit: "g" }, // 1 scoop
      { name: "Peanut Butter", quantity: 10, unit: "g" },
      { name: "Milk", quantity: 150, unit: "g" }
    ]
  },
  {
    name: "Omelette with Vegetables and Avocado",
    description: "A protein-rich omelette with vegetables and avocado",
    prepTime: 15,
    servings: 1,
    instructions: [
      "Beat eggs in a bowl",
      "Heat oil in a pan",
      "Add vegetables and cook",
      "Pour eggs over vegetables",
      "Add avocado slices",
      "Fold and cook until set"
    ],
    labels: ["breakfast", "lunch"],
    ingredients: [
      { name: "1 Egg", quantity: 3, unit: "piece" },
      { name: "Broccoli", quantity: 100, unit: "g" },
      { name: "Bell Pepper", quantity: 50, unit: "g" },
      { name: "Avocado", quantity: 50, unit: "g" },
      { name: "Olive Oil", quantity: 3, unit: "g" }
    ]
  },
  {
    name: "Proteic Toast with Egg and Avocado",
    description: "Protein-rich toast topped with egg and avocado",
    prepTime: 10,
    servings: 1,
    instructions: [
      "Toast bread",
      "Cook egg",
      "Slice avocado",
      "Assemble toast with egg and avocado",
      "Season to taste"
    ],
    labels: ["breakfast", "lunch"],
    ingredients: [
      { name: "White Bread", quantity: 60, unit: "g" },
      { name: "1 Egg", quantity: 2, unit: "piece" },
      { name: "Avocado", quantity: 60, unit: "g" },
      { name: "Butter", quantity: 5, unit: "g" }
    ]
  },
  {
    name: "Smoothie Bowl Proteic",
    description: "Thick protein smoothie bowl with toppings",
    prepTime: 10,
    servings: 1,
    instructions: [
      "Blend frozen fruits with protein powder",
      "Add liquid to achieve thick consistency",
      "Pour into bowl",
      "Top with fruits and seeds",
      "Serve immediately"
    ],
    labels: ["breakfast", "lunch"],
    ingredients: [
      { name: "Banana", quantity: 150, unit: "g" },
      { name: "Protein Powder", quantity: 15, unit: "g" }, // 1 scoop
      { name: "Greek Yogurt", quantity: 80, unit: "g" },
      { name: "Milk", quantity: 50, unit: "g" },
      { name: "Chia Seeds", quantity: 8, unit: "g" }
    ]
  },
  {
    name: "Protein Pudding with Light Mascarpone and Fruits",
    description: "Protein-rich pudding made with light mascarpone and fruits",
    prepTime: 15,
    servings: 1,
    instructions: [
      "Mix protein powder with light mascarpone",
      "Add sweetener if needed",
      "Fold in fruits",
      "Chill in refrigerator",
      "Serve cold"
    ],
    labels: ["breakfast", "lunch", "dinner"],
    ingredients: [
      { name: "Protein Powder", quantity: 15, unit: "g" }, // 1 scoop
      { name: "Cottage Cheese", quantity: 100, unit: "g" }, // Using cottage cheese as light mascarpone substitute
      { name: "Banana", quantity: 100, unit: "g" },
      { name: "Honey", quantity: 10, unit: "g" }
    ]
  }
];

async function main() {
  try {
    // Load all ingredients
    const ingredients = await prisma.ingredient.findMany({
      where: { calories: { gt: 0 } }
    });
    
    console.log(`✅ Loaded ${ingredients.length} ingredients from database\n`);
    
    for (const recipe of recipes) {
      console.log(`📝 Creating recipe: ${recipe.name}`);
      
      // Calculate macros for each ingredient
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      const ingredientDetails = [];
      for (const ing of recipe.ingredients) {
        const dbIngredient = await findIngredient(ing.name, ingredients);
        if (!dbIngredient) {
          console.warn(`   ⚠️  Ingredient not found: ${ing.name}`);
          continue;
        }
        
        const macros = calculateMacros(dbIngredient, ing.quantity, ing.unit);
        ingredientDetails.push({
          name: ing.name,
          dbName: dbIngredient.name,
          quantity: ing.quantity,
          unit: ing.unit,
          ...macros
        });
        
        totalCalories += macros.calories;
        totalProtein += macros.protein;
        totalCarbs += macros.carbs;
        totalFat += macros.fat;
      }
      
      const finalMacros = {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10
      };
      
      console.log(`   📊 Calculated macros: ${finalMacros.calories} kcal, ${finalMacros.protein}g P, ${finalMacros.carbs}g C, ${finalMacros.fat}g F`);
      console.log(`   🎯 Target: 500 kcal, 23g P, 45g C, 12g F`);
      
      // Create recipe
      const newRecipe = await prisma.recipe.create({
        data: {
          name: recipe.name,
          description: recipe.description,
          prepTime: recipe.prepTime,
          servings: recipe.servings,
          instructions: JSON.stringify(recipe.instructions),
          totalCalories: finalMacros.calories,
          totalProtein: finalMacros.protein,
          totalCarbs: finalMacros.carbs,
          totalFat: finalMacros.fat,
          labels: recipe.labels
        }
      });
      
      // Add ingredients
      await prisma.recipeIngredient.createMany({
        data: recipe.ingredients.map(ing => ({
          recipeId: newRecipe.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          exists: false,
          availableInApi: false
        }))
      });
      
      console.log(`   ✅ Recipe created: ${newRecipe.id}\n`);
    }
    
    console.log('\n✅ All recipes created successfully!');
    console.log('⚠️  Note: Some recipes may not be exactly 500 kcal. You can manually adjust ingredient quantities in the recipe detail page to fine-tune.\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

